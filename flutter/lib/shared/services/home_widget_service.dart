import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:home_widget/home_widget.dart';
import '../../core/constants/bible_books.dart';

/// Production-ready Home & Lock Screen Widget Service for Biblia Inteligente (Digital Sanctuary)
///
/// Bridges the Flutter data layer with native Android AppWidget and iOS WidgetKit.
/// Manages writing shared preferences/UserDefaults, generating deep links to the Reader,
/// and requesting native timeline reloads.
class HomeWidgetService {
  HomeWidgetService._();

  /// iOS App Group ID configured in Apple Developer Portal & Runner.entitlements
  static const String appGroupId = 'group.com.tuempresa.bibliainteligente';

  /// Android AppWidgetProvider class name registered in AndroidManifest.xml
  static const String androidWidgetName = 'VerseWidgetProvider';

  /// iOS WidgetKit extension name
  static const String iOSWidgetName = 'VerseWidget';

  /// Primary Shared Data Keys requested by native providers
  static const String keyVerseReference = 'verse_reference';
  static const String keyVerseText = 'verse_text';
  static const String keyVerseBookId = 'verse_book_id';
  static const String keyVerseChapter = 'verse_chapter';
  static const String keyVerseNumber = 'verse_number';

  /// Legacy / Alias Keys for backwards compatibility
  static const String legacyKeyReference = 'votd_reference';
  static const String legacyKeyText = 'votd_text';

  /// Deep link URI scheme for widget tap interactions
  static const String widgetDeepLinkScheme = 'sanctuary://verse_of_the_day';

  static StreamSubscription<Uri?>? _widgetClickSubscription;

  /// Initializes the HomeWidget bridge with the designated iOS App Group.
  /// Should be invoked during app bootstrapping before runApp().
  static Future<void> initialize({
    void Function(Uri? uri)? onWidgetClicked,
  }) async {
    try {
      await HomeWidget.setAppGroupId(appGroupId);

      // Register deep link listener if callback provided
      if (onWidgetClicked != null) {
        _widgetClickSubscription?.cancel();
        _widgetClickSubscription =
            HomeWidget.widgetClicked.listen(onWidgetClicked);
      }
    } catch (e, stackTrace) {
      debugPrint(
          '[HomeWidgetService] Initialization error (safe to ignore in non-mobile): $e\n$stackTrace');
    }
  }

  /// Updates the native widgets on both Android and iOS with the daily bible verse.
  ///
  /// Writes data simultaneously to primary keys (`verse_reference`, `verse_text`,
  /// `verse_book_id`, `verse_chapter`, `verse_number`) and legacy keys for robust
  /// deep linking directly to the Reader with highlighting.
  static Future<bool> updateVerseOfTheDay({
    required String reference,
    required String verseText,
    String? bookId,
    int? chapter,
    int? verse,
  }) async {
    try {
      final sanitizedRef = reference.trim();
      final sanitizedText = verseText.trim();

      // Resolve bookId, chapter, verse if not explicitly provided
      String resolvedBookId = bookId ?? 'PSA';
      int resolvedChapter = chapter ?? 119;
      int resolvedVerse = verse ?? 105;

      if (bookId == null || chapter == null || verse == null) {
        final parsed = parseReference(sanitizedRef);
        if (parsed != null) {
          resolvedBookId = parsed.bookId;
          resolvedChapter = parsed.chapter;
          resolvedVerse = parsed.verse;
        }
      }

      // Write primary keys
      await HomeWidget.saveWidgetData<String>(keyVerseReference, sanitizedRef);
      await HomeWidget.saveWidgetData<String>(keyVerseText, sanitizedText);
      await HomeWidget.saveWidgetData<String>(keyVerseBookId, resolvedBookId);
      await HomeWidget.saveWidgetData<int>(keyVerseChapter, resolvedChapter);
      await HomeWidget.saveWidgetData<int>(keyVerseNumber, resolvedVerse);

      // Write legacy keys for backwards compatibility
      await HomeWidget.saveWidgetData<String>(legacyKeyReference, sanitizedRef);
      await HomeWidget.saveWidgetData<String>(legacyKeyText, sanitizedText);

      // Request native widget reload on both platforms
      await HomeWidget.updateWidget(
        name: androidWidgetName,
        iOSName: iOSWidgetName,
      );

      debugPrint(
          '[HomeWidgetService] Successfully synced daily verse to native widgets: $sanitizedRef ($resolvedBookId $resolvedChapter:$resolvedVerse)');
      return true;
    } catch (e, stackTrace) {
      debugPrint(
          '[HomeWidgetService] Failed to update native widgets: $e\n$stackTrace');
      return false;
    }
  }

  /// Alias for updateVerseOfTheDay to match historical signatures
  static Future<bool> updateVerseOfTheDayWidget({
    required String reference,
    required String text,
    String? bookId,
    int? chapter,
    int? verse,
  }) =>
      updateVerseOfTheDay(
        reference: reference,
        verseText: text,
        bookId: bookId,
        chapter: chapter,
        verse: verse,
      );

  /// Updates native Lockscreen & Home widgets with formatted verse data.
  static Future<bool> updateVerseWidget({
    required String reference,
    required String verseText,
    String? bookId,
    int? chapter,
    int? verse,
  }) =>
      updateVerseOfTheDay(
        reference: reference,
        verseText: verseText,
        bookId: bookId,
        chapter: chapter,
        verse: verse,
      );

  /// Resolves the Scripture coordinates (bookId, chapter, verse) from a widget click URI
  /// or from stored widget preferences to navigate to Reader and highlight the verse.
  static Future<({String bookId, int chapter, int verse})?>
      resolveWidgetVerseCoordinates([Uri? uri]) async {
    try {
      if (uri != null) {
        final qBook = uri.queryParameters['book'];
        final qChapter = int.tryParse(uri.queryParameters['chapter'] ?? '');
        final qVerse = int.tryParse(uri.queryParameters['verse'] ?? '');
        if (qBook != null &&
            qBook.isNotEmpty &&
            qChapter != null &&
            qVerse != null) {
          return (bookId: qBook, chapter: qChapter, verse: qVerse);
        }
      }

      // Fallback: Retrieve directly from native shared preferences
      final storedBook =
          await HomeWidget.getWidgetData<String>(keyVerseBookId);
      final storedChapter =
          await HomeWidget.getWidgetData<int>(keyVerseChapter);
      final storedVerse = await HomeWidget.getWidgetData<int>(keyVerseNumber);

      if (storedBook != null &&
          storedBook.isNotEmpty &&
          storedChapter != null &&
          storedVerse != null) {
        return (
          bookId: storedBook,
          chapter: storedChapter,
          verse: storedVerse,
        );
      }

      // Fallback from reference text string
      final ref = await HomeWidget.getWidgetData<String>(keyVerseReference) ??
          await HomeWidget.getWidgetData<String>(legacyKeyReference);
      if (ref != null && ref.isNotEmpty) {
        final parsed = parseReference(ref);
        if (parsed != null) return parsed;
      }
    } catch (e) {
      debugPrint('[HomeWidgetService] Error resolving coordinates: $e');
    }
    return null;
  }

  /// Parses human-readable Bible citations into structural coordinates
  /// Examples: "Salmos 119:105", "Juan 3:16", "1 Corintios 13:4", "Filipenses 4:6"
  static ({String bookId, int chapter, int verse})? parseReference(
      String reference) {
    try {
      final match =
          RegExp(r'^(.+?)\s+(\d+)[:\.](\d+)').firstMatch(reference.trim());
      if (match == null) return null;
      final rawBookName = match.group(1)?.trim() ?? '';
      final chapter = int.tryParse(match.group(2) ?? '');
      final verse = int.tryParse(match.group(3) ?? '');
      if (chapter == null || verse == null) return null;

      final normalized = rawBookName
          .toLowerCase()
          .replaceAll('á', 'a')
          .replaceAll('é', 'e')
          .replaceAll('í', 'i')
          .replaceAll('ó', 'o')
          .replaceAll('ú', 'u');

      for (final book in kBibleBooks) {
        final bNorm = book.name
            .toLowerCase()
            .replaceAll('á', 'a')
            .replaceAll('é', 'e')
            .replaceAll('í', 'i')
            .replaceAll('ó', 'o')
            .replaceAll('ú', 'u');
        if (bNorm == normalized || book.id.toLowerCase() == normalized) {
          return (bookId: book.id, chapter: chapter, verse: verse);
        }
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  /// Retrieves the currently persisted verse from native shared storage.
  /// Useful for debugging and offline consistency checks.
  static Future<Map<String, String?>> getPersistedWidgetData() async {
    try {
      final ref = await HomeWidget.getWidgetData<String>(keyVerseReference) ??
          await HomeWidget.getWidgetData<String>(legacyKeyReference);
      final text = await HomeWidget.getWidgetData<String>(keyVerseText) ??
          await HomeWidget.getWidgetData<String>(legacyKeyText);
      final bookId =
          await HomeWidget.getWidgetData<String>(keyVerseBookId);
      final chapter =
          (await HomeWidget.getWidgetData<int>(keyVerseChapter))?.toString();
      final verse =
          (await HomeWidget.getWidgetData<int>(keyVerseNumber))?.toString();
      return {
        'reference': ref,
        'text': text,
        'bookId': bookId,
        'chapter': chapter,
        'verse': verse,
      };
    } catch (e) {
      debugPrint('[HomeWidgetService] Failed to retrieve widget data: $e');
      return {'reference': null, 'text': null};
    }
  }

  /// Checks if the app was launched by tapping a Home/Lock Screen widget.
  static Future<Uri?> getInitialWidgetLaunchUri() async {
    try {
      return await HomeWidget.initiallyLaunchedFromHomeWidget();
    } catch (e) {
      debugPrint('[HomeWidgetService] Error checking initial launch URI: $e');
      return null;
    }
  }

  /// Disposes active listeners
  static void dispose() {
    _widgetClickSubscription?.cancel();
    _widgetClickSubscription = null;
  }
}
