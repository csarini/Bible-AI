import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:package_info_plus/package_info_plus.dart';
import '../constants/bible_books.dart';
import '../network/api_client.dart';
import '../services/secure_storage_service.dart';
import '../storage/app_database.dart';
import '../../features/auth/data/auth_repository.dart';
import '../../features/reader/data/services/offline_bible_sync_service.dart';

enum AppVisualTheme {
  light,
  sepia,
  dark,
}

final appVisualThemeModeProvider =
    StateProvider<AppVisualTheme>((ref) => AppVisualTheme.light);
final appTranslationProvider =
    StateProvider<String>((ref) => 'valera'); // 'valera', 'sse', 'rv1858'
/// Global provider alias for active Bible translation strictly enforcing single-translation context
final activeTranslationProvider = appTranslationProvider;
final appFontSizeProvider = StateProvider<String>(
    (ref) => 'medium'); // 'small', 'medium', 'large', 'xlarge'
final appFontFamilyProvider = StateProvider<String>((ref) =>
    'literata'); // 'literata' (Serifa Bíblica), 'playfair' (Editorial), 'inter' (Sans Moderna)
final appLineSpacingProvider = StateProvider<String>(
    (ref) => 'normal'); // 'compact', 'normal', 'relaxed', 'spacious'
final appShowVerseNumbersProvider = StateProvider<bool>((ref) => true);

const appSettingThemeKey = 'theme';
const appSettingTranslationKey = 'translation';
const appSettingFontSizeKey = 'fontSize';
const appSettingFontFamilyKey = 'fontFamily';
const appSettingLineSpacingKey = 'lineSpacing';
const appSettingShowVerseNumbersKey = 'showVerseNumbers';

class AppSettingsController {
  final AppDatabase database;
  final String userId;

  const AppSettingsController({required this.database, required this.userId});

  Future<void> setTheme(WidgetRef ref, AppVisualTheme value) async {
    ref.read(appVisualThemeModeProvider.notifier).state = value;
    await _save(appSettingThemeKey, value.name);
  }

  Future<void> setTranslation(WidgetRef ref, String value) async {
    ref.read(appTranslationProvider.notifier).state = value;
    await _save(appSettingTranslationKey, value);
  }

  Future<void> setFontSize(WidgetRef ref, String value) async {
    ref.read(appFontSizeProvider.notifier).state = value;
    await _save(appSettingFontSizeKey, value);
  }

  Future<void> setFontFamily(WidgetRef ref, String value) async {
    ref.read(appFontFamilyProvider.notifier).state = value;
    await _save(appSettingFontFamilyKey, value);
  }

  Future<void> setLineSpacing(WidgetRef ref, String value) async {
    ref.read(appLineSpacingProvider.notifier).state = value;
    await _save(appSettingLineSpacingKey, value);
  }

  Future<void> setShowVerseNumbers(WidgetRef ref, bool value) async {
    ref.read(appShowVerseNumbersProvider.notifier).state = value;
    await _save(appSettingShowVerseNumbersKey, value.toString());
  }

  Future<void> _save(String key, String value) {
    return database.saveUserPreference(userId: userId, key: key, value: value);
  }
}

final appSettingsControllerProvider = Provider<AppSettingsController>(
  (ref) => throw StateError('AppSettingsController no ha sido inicializado'),
);

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
    StreamProvider.family<OfflineSyncStatus, OfflineBibleSyncService>(
        (ref, service) {
  return service.statusStream;
});

final appVersionProvider = FutureProvider<String>((ref) async {
  final packageInfo = await PackageInfo.fromPlatform();
  return 'v${packageInfo.version} (+${packageInfo.buildNumber})';
});

// Secure Storage & Authentication Providers
final secureStorageServiceProvider = Provider<SecureStorageService>((ref) {
  return SecureStorageService();
});

final apiClientProvider = Provider<ApiClient>((ref) {
  final secureStorage = ref.watch(secureStorageServiceProvider);
  return ApiClient(secureStorage: secureStorage);
});

final authRepositoryProvider = Provider.family<AuthRepository, AppDatabase>((ref, database) {
  final secureStorage = ref.watch(secureStorageServiceProvider);
  final apiClient = ref.watch(apiClientProvider);
  return AuthRepository(
    secureStorage: secureStorage,
    database: database,
    apiClient: apiClient,
  );
});

