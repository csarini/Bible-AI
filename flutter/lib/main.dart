import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/providers/app_settings_providers.dart';
import 'core/storage/app_database.dart';
import 'core/theme/sanctuary_theme.dart';
import 'features/reader/data/services/offline_bible_sync_service.dart';
import 'features/shell/presentation/views/sanctuary_main_shell.dart';
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
  try {
    await database.ensureBibleDataSeeded();
  } catch (e) {
    debugPrint('Bible books seeding error: $e');
  }

  // Start background downloader for all Bible verses in non-blocking fashion
  final syncService = OfflineBibleSyncService(database: database);
  syncService.startBackgroundSync();

  runApp(
    ProviderScope(
      child: DigitalSanctuaryApp(database: database),
    ),
  );
}

class DigitalSanctuaryApp extends ConsumerWidget {
  final AppDatabase database;

  const DigitalSanctuaryApp({super.key, required this.database});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final visualTheme = ref.watch(appVisualThemeModeProvider);

    ThemeData activeTheme;
    ThemeMode themeMode;

    switch (visualTheme) {
      case AppVisualTheme.sepia:
        activeTheme = SanctuaryTheme.sepia();
        themeMode = ThemeMode.light;
        break;
      case AppVisualTheme.dark:
        activeTheme = SanctuaryTheme.dark();
        themeMode = ThemeMode.dark;
        break;
      case AppVisualTheme.light:
        activeTheme = SanctuaryTheme.light();
        themeMode = ThemeMode.light;
        break;
    }

    return MaterialApp(
      title: 'Biblia Inteligente (Digital Sanctuary)',
      debugShowCheckedModeBanner: false,
      theme: activeTheme,
      darkTheme: SanctuaryTheme.dark(),
      themeMode: themeMode,
      home: SanctuaryMainShell(database: database),
    );
  }
}
