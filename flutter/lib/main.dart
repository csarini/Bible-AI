import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/storage/app_database.dart';
import 'core/theme/sanctuary_theme.dart';
import 'features/settings/presentation/views/sanctuary_settings_view.dart';
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
    final themeMode = ref.watch(appThemeModeProvider);

    return MaterialApp(
      title: 'Biblia Inteligente (Digital Sanctuary)',
      debugShowCheckedModeBanner: false,
      theme: SanctuaryTheme.light(),
      darkTheme: SanctuaryTheme.dark(),
      themeMode: themeMode,
      home: SanctuaryMainShell(database: database),
    );
  }
}

