import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/sanctuary_colors.dart';

/// In-memory diagnostic log intended for development and physical-device QA.
///
/// The service intentionally keeps a bounded buffer so an exception storm cannot
/// grow the process indefinitely. Production crash reporting should be wired at
/// the application boundary separately.
class DebugLogService extends ChangeNotifier {
  DebugLogService._();

  static final DebugLogService instance = DebugLogService._();
  static const int _maxEntries = 250;

  final List<DebugLogEntry> _entries = <DebugLogEntry>[];

  List<DebugLogEntry> get entries => List.unmodifiable(_entries);

  void info(String message, {Object? error, StackTrace? stackTrace}) {
    _add(DebugLogLevel.info, message, error, stackTrace);
  }

  void warning(String message, {Object? error, StackTrace? stackTrace}) {
    _add(DebugLogLevel.warning, message, error, stackTrace);
  }

  void error(String message, {Object? error, StackTrace? stackTrace}) {
    _add(DebugLogLevel.error, message, error, stackTrace);
  }

  void record(Object error, StackTrace stackTrace,
      {String context = 'Unhandled error'}) {
    _add(DebugLogLevel.error, context, error, stackTrace);
  }

  void clear() {
    _entries.clear();
    notifyListeners();
  }

  void _add(
    DebugLogLevel level,
    String message,
    Object? error,
    StackTrace? stackTrace,
  ) {
    _entries.add(
      DebugLogEntry(
        timestamp: DateTime.now(),
        level: level,
        message: message,
        error: error,
        stackTrace: stackTrace,
      ),
    );
    if (_entries.length > _maxEntries) {
      _entries.removeRange(0, _entries.length - _maxEntries);
    }
    notifyListeners();
    if (kDebugMode) {
      debugPrint(_entries.last.format());
    }
  }

  static void installFlutterErrorHandler() {
    FlutterError.onError = (details) {
      instance.record(
        details.exception,
        details.stack ?? StackTrace.current,
        context: details.library ?? 'Flutter framework error',
      );
      FlutterError.presentError(details);
    };
  }

  static void runGuarded(Future<void> Function() body) {
    runZonedGuarded<void>(body, (error, stackTrace) {
      instance.record(error, stackTrace);
    });
  }

  static Future<void> showConsole(BuildContext context) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (_) => const DebugConsoleSheet(),
    );
  }
}

enum DebugLogLevel { info, warning, error }

class DebugLogEntry {
  const DebugLogEntry({
    required this.timestamp,
    required this.level,
    required this.message,
    this.error,
    this.stackTrace,
  });

  final DateTime timestamp;
  final DebugLogLevel level;
  final String message;
  final Object? error;
  final StackTrace? stackTrace;

  String format() {
    final details = error == null ? '' : '\n$error';
    return '[${timestamp.toIso8601String()}] ${level.name.toUpperCase()}: $message$details';
  }
}

class DebugConsoleSheet extends StatelessWidget {
  const DebugConsoleSheet({super.key});

  @override
  Widget build(BuildContext context) {
    final service = DebugLogService.instance;
    return AnimatedBuilder(
      animation: service,
      builder: (context, _) {
        final entries = service.entries.reversed.toList(growable: false);
        return SafeArea(
          child: SizedBox(
            height: MediaQuery.sizeOf(context).height * 0.72,
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 4, 12, 12),
                  child: Row(
                    children: [
                      const Icon(Icons.bug_report,
                          color: SanctuaryColors.sunOrange),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          'Consola de diagnóstico',
                          style: GoogleFonts.inter(fontWeight: FontWeight.w800),
                        ),
                      ),
                      IconButton(
                        tooltip: 'Limpiar registros',
                        onPressed: service.clear,
                        icon: const Icon(Icons.delete_outline),
                      ),
                    ],
                  ),
                ),
                const Divider(height: 1),
                Expanded(
                  child: entries.isEmpty
                      ? const Center(child: Text('No hay registros'))
                      : ListView.builder(
                          padding: const EdgeInsets.all(12),
                          itemCount: entries.length,
                          itemBuilder: (_, index) {
                            final entry = entries[index];
                            final color = switch (entry.level) {
                              DebugLogLevel.info => Colors.blueGrey,
                              DebugLogLevel.warning =>
                                SanctuaryColors.sunOrange,
                              DebugLogLevel.error => Colors.redAccent,
                            };
                            return Padding(
                              padding: const EdgeInsets.only(bottom: 10),
                              child: SelectableText.rich(
                                TextSpan(
                                  children: [
                                    TextSpan(
                                      text:
                                          '${entry.level.name.toUpperCase()}  ',
                                      style: TextStyle(
                                        color: color,
                                        fontWeight: FontWeight.w800,
                                      ),
                                    ),
                                    TextSpan(text: entry.format()),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
