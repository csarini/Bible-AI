import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/providers/app_settings_providers.dart';
import 'core/services/bible_data_import_service.dart';
import 'core/services/debug_log_service.dart';
import 'core/services/local_user_service.dart';
import 'core/storage/app_database.dart';
import 'core/theme/sanctuary_theme.dart';
import 'features/reader/presentation/state/reader_state_notifier.dart';
import 'features/shell/presentation/views/sanctuary_main_shell.dart';
import 'features/splash/presentation/views/sanctuary_splash_screen.dart';
import 'shared/services/home_widget_service.dart';

void main() {
  DebugLogService.installFlutterErrorHandler();
  DebugLogService.runGuarded(() async {
    WidgetsFlutterBinding.ensureInitialized();
    ErrorWidget.builder = (details) => SanctuaryErrorWidget(details: details);

    try {
      await HomeWidgetService.initialize();
    } catch (error, stackTrace) {
      DebugLogService.instance.warning(
        'Home widget initialization skipped',
        error: error,
        stackTrace: stackTrace,
      );
    }

    final database = AppDatabase();
    final user = await LocalUserService(database).getOrCreateGuest();
    final savedSettings = await database.getUserPreferences(user.id);
    final importService = BibleDataImportService(database: database);
    final needsImport = await importService.isImportNeeded();

    runApp(
      ProviderScope(
        overrides: [
          appDatabaseProvider.overrideWithValue(database),
          appVisualThemeModeProvider.overrideWith(
            (ref) => _parseVisualTheme(savedSettings[appSettingThemeKey]),
          ),
          appTranslationProvider.overrideWith(
            (ref) {
              final saved = savedSettings[appSettingTranslationKey];
              if (saved == null || saved == 'valera') return 'rvr1960';
              return saved;
            },
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
  });
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
      title: 'Biblia Inteligente',
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

class SanctuaryErrorWidget extends StatelessWidget {
  const SanctuaryErrorWidget({super.key, required this.details});

  final FlutterErrorDetails details;

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
      color: const Color(0xFFF9F6F0),
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: DecoratedBox(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFD4AF37)),
            ),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.error_outline,
                      color: Color(0xFFF47B20), size: 40),
                  const SizedBox(height: 12),
                  const Text(
                    'El Santuario necesita atención',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Color(0xFF002147),
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  if (kDebugMode) ...[
                    const SizedBox(height: 8),
                    const Text(
                      'El error fue registrado en la consola de diagnóstico.',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Color(0xFF002147)),
                    ),
                    const SizedBox(height: 12),
                    OutlinedButton.icon(
                      onPressed: () => DebugLogService.showConsole(context),
                      icon: const Icon(Icons.bug_report_outlined),
                      label: const Text('Ver diagnóstico'),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
