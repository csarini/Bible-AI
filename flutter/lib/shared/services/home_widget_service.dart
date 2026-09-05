import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:home_widget/home_widget.dart';

/// Production-ready Home & Lock Screen Widget Service for Biblia Inteligente (Digital Sanctuary)
///
/// Bridges the Flutter data layer with native Android AppWidget and iOS WidgetKit.
/// Manages writing shared preferences/UserDefaults and requesting native timeline reloads.
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
        _widgetClickSubscription = HomeWidget.widgetClicked.listen(onWidgetClicked);
      }
    } catch (e, stackTrace) {
      debugPrint('[HomeWidgetService] Initialization error (safe to ignore in non-mobile): $e\n$stackTrace');
    }
  }

  /// Updates the native widgets on both Android and iOS with the daily bible verse.
  ///
  /// Writes data simultaneously to both primary keys (`verse_reference`, `verse_text`)
  /// and legacy keys for robust fallback across all native versions.
  static Future<bool> updateVerseOfTheDay({
    required String reference,
    required String verseText,
  }) async {
    try {
      final sanitizedRef = reference.trim();
      final sanitizedText = verseText.trim();

      // Write primary keys
      await HomeWidget.saveWidgetData<String>(keyVerseReference, sanitizedRef);
      await HomeWidget.saveWidgetData<String>(keyVerseText, sanitizedText);

      // Write legacy keys for backwards compatibility
      await HomeWidget.saveWidgetData<String>(legacyKeyReference, sanitizedRef);
      await HomeWidget.saveWidgetData<String>(legacyKeyText, sanitizedText);

      // Request native widget reload on both platforms
      await HomeWidget.updateWidget(
        name: androidWidgetName,
        iOSName: iOSWidgetName,
      );

      debugPrint('[HomeWidgetService] Successfully synced daily verse to native widgets: $sanitizedRef');
      return true;
    } catch (e, stackTrace) {
      debugPrint('[HomeWidgetService] Failed to update native widgets: $e\n$stackTrace');
      return false;
    }
  }

  /// Alias for updateVerseOfTheDay to match historical signatures
  static Future<bool> updateVerseOfTheDayWidget({
    required String reference,
    required String text,
  }) => updateVerseOfTheDay(reference: reference, verseText: text);

  /// Retrieves the currently persisted verse from native shared storage.
  /// Useful for debugging and offline consistency checks.
  static Future<Map<String, String?>> getPersistedWidgetData() async {
    try {
      final ref = await HomeWidget.getWidgetData<String>(keyVerseReference) ??
          await HomeWidget.getWidgetData<String>(legacyKeyReference);
      final text = await HomeWidget.getWidgetData<String>(keyVerseText) ??
          await HomeWidget.getWidgetData<String>(legacyKeyText);
      return {
        'reference': ref,
        'text': text,
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

