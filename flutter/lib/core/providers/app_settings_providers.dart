import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../storage/app_database.dart';

enum AppVisualTheme {
  light,
  sepia,
  dark,
}

final appVisualThemeModeProvider = StateProvider<AppVisualTheme>((ref) => AppVisualTheme.light);
final appTranslationProvider = StateProvider<String>((ref) => 'valera'); // 'valera', 'sse', 'rv1858'
final appFontSizeProvider = StateProvider<String>((ref) => 'medium'); // 'small', 'medium', 'large', 'xlarge'
final appFontFamilyProvider = StateProvider<String>((ref) => 'merriweather'); // 'merriweather', 'playfair', 'jakarta'
final appLineSpacingProvider = StateProvider<String>((ref) => 'normal'); // 'compact', 'normal', 'relaxed'
final appShowVerseNumbersProvider = StateProvider<bool>((ref) => true);

// Active navigation and bible coordinates
final appSelectedBookProvider = StateProvider<String>((ref) => 'MAT');
final appSelectedChapterProvider = StateProvider<int>((ref) => 1);
final appSelectedVerseProvider = StateProvider<int?>((ref) => null);

// Database Stream Provider for dynamic bookmark badge counter
final bookmarksCountStreamProvider = StreamProvider.family<int, AppDatabase>((ref, database) {
  return database.watchAllBookmarks().map((list) => list.length);
});
