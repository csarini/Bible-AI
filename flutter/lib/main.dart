import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/storage/app_database.dart';
import 'core/theme/sanctuary_theme.dart';
import 'features/reader/presentation/views/sanctuary_reader_view.dart';
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

class DigitalSanctuaryApp extends StatelessWidget {
  final AppDatabase database;

  const DigitalSanctuaryApp({super.key, required this.database});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Biblia Inteligente (Digital Sanctuary)',
      debugShowCheckedModeBanner: false,
      theme: SanctuaryTheme.light(),
      darkTheme: SanctuaryTheme.dark(),
      themeMode: ThemeMode.system,
      home: SanctuaryReaderView(database: database),
    );
  }
}
