import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../storage/app_database.dart';

enum AppVisualTheme {
  light,
  sepia,
  dark,
}

final appVisualThemeModeProvider =
    StateProvider<AppVisualTheme>((ref) => AppVisualTheme.light);
final appTranslationProvider =
    StateProvider<String>((ref) => 'valera'); // 'valera', 'sse', 'rv1858'
final appFontSizeProvider = StateProvider<String>(
    (ref) => 'medium'); // 'small', 'medium', 'large', 'xlarge'
final appFontFamilyProvider = StateProvider<String>(
    (ref) => 'literata'); // 'literata' (Serifa Bíblica), 'playfair' (Editorial), 'inter' (Sans Moderna)
final appLineSpacingProvider =
    StateProvider<String>((ref) => 'normal'); // 'compact', 'normal', 'relaxed', 'spacious'
final appShowVerseNumbersProvider = StateProvider<bool>((ref) => true);

// Active navigation and bible coordinates
final appSelectedBookProvider = StateProvider<String>((ref) => 'MAT');
final appSelectedChapterProvider = StateProvider<int>((ref) => 1);
final appSelectedVerseProvider = StateProvider<int?>((ref) => null);

// Database Stream Provider for dynamic bookmark badge counter
final bookmarksCountStreamProvider =
    StreamProvider.family<int, AppDatabase>((ref, database) {
  return database.watchAllBookmarks().map((list) => list.length);
});

// Database Stream Provider for dynamic Bible Books list loaded from DB
final bibleBooksStreamProvider =
    StreamProvider.family<List<BibleBookInfo>, AppDatabase>((ref, database) {
  final translation = ref.watch(appTranslationProvider);
  return database.watchBooksByTranslation(translation).map((entries) {
    if (entries.isEmpty) {
      return kBibleBooks;
    }
    return entries.map((e) => BibleBookInfo.fromEntry(e)).toList();
  });
});

// Offline Bible Chapters Sync Status Stream Provider
final offlineSyncStatusStreamProvider =
    StreamProvider.family<OfflineSyncStatus, OfflineBibleSyncService>((ref, service) {
  return service.statusStream;
});

