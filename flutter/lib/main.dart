import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/providers/app_settings_providers.dart';
import 'core/services/bible_data_import_service.dart';
import 'core/services/local_user_service.dart';
import 'core/storage/app_database.dart';
import 'core/theme/sanctuary_theme.dart';
import 'features/shell/presentation/views/sanctuary_main_shell.dart';
import 'features/splash/presentation/views/sanctuary_splash_screen.dart';
import 'shared/services/home_widget_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Home/Lock Screen Widget Support
  try {
    await HomeWidgetService.initialize();
  } catch (e) {
    debugPrint('HomeWidget initialization skipped on unsupported platform: $e');
  }

  // Initialize Drift Local SQLite Database
  final database = AppDatabase();
  final user = await LocalUserService(database).getOrCreateGuest();
  final savedSettings = await database.getUserPreferences(user.id);
  final importService = BibleDataImportService(database: database);
  final needsImport = await importService.isImportNeeded();

  runApp(
    ProviderScope(
      overrides: [
        appVisualThemeModeProvider.overrideWith(
          (ref) => _parseVisualTheme(savedSettings[appSettingThemeKey]),
        ),
        appTranslationProvider.overrideWith(
          (ref) => savedSettings[appSettingTranslationKey] ?? 'valera',
        ),
        appFontSizeProvider.overrideWith(
          (ref) => savedSettings[appSettingFontSizeKey] ?? 'medium',
        ),
        appFontFamilyProvider.overrideWith(
          (ref) => savedSettings[appSettingFontFamilyKey] ?? 'literata',
        ),
        appLineSpacingProvider.overrideWith(
          (ref) => savedSettings[appSettingLineSpacingKey] ?? 'normal',
        ),
        appShowVerseNumbersProvider.overrideWith(
          (ref) => savedSettings[appSettingShowVerseNumbersKey] != 'false',
        ),
        appSettingsControllerProvider.overrideWithValue(
          AppSettingsController(database: database, userId: user.id),
        ),
      ],
      child: DigitalSanctuaryApp(
        database: database,
        initialNeedsImport: needsImport,
      ),
    ),
  );
}

AppVisualTheme _parseVisualTheme(String? value) {
  return AppVisualTheme.values.firstWhere(
    (theme) => theme.name == value,
    orElse: () => AppVisualTheme.light,
  );
}

class DigitalSanctuaryApp extends ConsumerStatefulWidget {
  final AppDatabase database;
  final bool initialNeedsImport;

  const DigitalSanctuaryApp({
    super.key,
    required this.database,
    this.initialNeedsImport = false,
  });

  @override
  ConsumerState<DigitalSanctuaryApp> createState() =>
      _DigitalSanctuaryAppState();
}

class _DigitalSanctuaryAppState extends ConsumerState<DigitalSanctuaryApp> {
  late bool _isInitialized;

  @override
  void initState() {
    super.initState();
    // Si ya se importó toda la información a la BD local, no mostrar el splash screen
    _isInitialized = !widget.initialNeedsImport;
  }

  @override
  Widget build(BuildContext context) {
    final visualTheme = ref.watch(appVisualThemeModeProvider);

    ThemeData activeTheme;
    switch (visualTheme) {
      case AppVisualTheme.sepia:
        activeTheme = SanctuaryTheme.sepia();
        break;
      case AppVisualTheme.dark:
        activeTheme = SanctuaryTheme.dark();
        break;
      case AppVisualTheme.light:
        activeTheme = SanctuaryTheme.light();
        break;
    }

    return MaterialApp(
      title: 'Biblia Inteligente (Digital Sanctuary)',
      debugShowCheckedModeBanner: false,
      theme: activeTheme,
      darkTheme: activeTheme,
      themeMode:
          visualTheme == AppVisualTheme.dark ? ThemeMode.dark : ThemeMode.light,
      home: AnimatedSwitcher(
        duration: const Duration(milliseconds: 500),
        switchInCurve: Curves.easeIn,
        switchOutCurve: Curves.easeOut,
        child: _isInitialized
            ? SanctuaryMainShell(
                key: const ValueKey('sanctuary_main_shell'),
                database: widget.database,
              )
            : SanctuarySplashScreen(
                key: const ValueKey('sanctuary_splash_screen'),
                database: widget.database,
                onComplete: () {
                  setState(() {
                    _isInitialized = true;
                  });
                },
              ),
      ),
    );
  }
}
