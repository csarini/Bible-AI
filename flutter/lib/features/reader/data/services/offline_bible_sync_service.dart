import 'dart:async';
import 'dart:convert';
import 'package:drift/drift.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart' show rootBundle;
import '../../../../core/constants/bible_books.dart';
import '../../../../core/storage/app_database.dart';

// =============================================================================
// OFFLINE SYNC / LOCAL IMPORT STATUS MODEL
// =============================================================================

class OfflineSyncStatus {
  final bool isDownloading;
  final bool isPaused;
  final int totalChapters;
  final int downloadedChapters;
  final double progressPercent;
  final bool isComplete;
  final String activeTranslation;
  final String activeBookName;
  final int activeChapter;
  final String? lastError;

  const OfflineSyncStatus({
    this.isDownloading = false,
    this.isPaused = false,
    this.totalChapters = 3567,
    this.downloadedChapters = 0,
    this.progressPercent = 0.0,
    this.isComplete = false,
    this.activeTranslation = 'rvr1960',
    this.activeBookName = '',
    this.activeChapter = 0,
    this.lastError,
  });

  OfflineSyncStatus copyWith({
    bool? isDownloading,
    bool? isPaused,
    int? totalChapters,
    int? downloadedChapters,
    double? progressPercent,
    bool? isComplete,
    String? activeTranslation,
    String? activeBookName,
    int? activeChapter,
    String? lastError,
  }) {
    return OfflineSyncStatus(
      isDownloading: isDownloading ?? this.isDownloading,
      isPaused: isPaused ?? this.isPaused,
      totalChapters: totalChapters ?? this.totalChapters,
      downloadedChapters: downloadedChapters ?? this.downloadedChapters,
      progressPercent: progressPercent ?? this.progressPercent,
      isComplete: isComplete ?? this.isComplete,
      activeTranslation: activeTranslation ?? this.activeTranslation,
      activeBookName: activeBookName ?? this.activeBookName,
      activeChapter: activeChapter ?? this.activeChapter,
      lastError: lastError,
    );
  }
}

// =============================================================================
// LOCAL BIBLE SYNC & PERSISTENCE VERIFIER SERVICE
// (Imports directly from local JSON assets into SQLite - No external API calls)
// =============================================================================

class OfflineBibleSyncService {
  final AppDatabase database;
  static const int totalBibleChaptersAllTranslations = 1189;

  bool _isCancelled = false;
  bool _isPaused = false;
  bool _isRunning = false;

  final StreamController<OfflineSyncStatus> _statusController =
      StreamController<OfflineSyncStatus>.broadcast();

  OfflineSyncStatus _currentStatus = const OfflineSyncStatus();

  OfflineBibleSyncService({
    required this.database,
  }) {
    _initInitialStatus();
  }

  Stream<OfflineSyncStatus> get statusStream => _statusController.stream;
  OfflineSyncStatus get currentStatus => _currentStatus;

  Future<void> _initInitialStatus() async {
    final count = await database.countStoredChapters();
    final isComplete = count >= 1189;
    final pct =
        (count / totalBibleChaptersAllTranslations * 100.0).clamp(0.0, 100.0);

    _updateStatus(_currentStatus.copyWith(
      downloadedChapters: count,
      progressPercent: pct,
      isComplete: isComplete,
    ));
  }

  void _updateStatus(OfflineSyncStatus newStatus) {
    _currentStatus = newStatus;
    if (!_statusController.isClosed) {
      _statusController.add(newStatus);
    }
  }

  /// Starts or resumes the background synchronization from local JSON assets to SQLite
  Future<void> startBackgroundSync({String? specificTranslation}) async {
    if (_isRunning && !_isPaused) return;

    _isCancelled = false;
    _isPaused = false;
    _isRunning = true;

    final translationConfigs = specificTranslation != null
        ? [
            (
              key: specificTranslation,
              folder: '${specificTranslation}_json',
              prefix: 'book'
            )
          ]
        : [
            (key: 'rvr1960', folder: 'rvr1960_json', prefix: 'book'),
            (key: 'rva2015', folder: 'rva2015_json', prefix: 'book'),
          ];

    try {
      for (final config in translationConfigs) {
        if (_isCancelled) break;

        _updateStatus(_currentStatus.copyWith(
          isDownloading: true,
          isPaused: false,
          activeTranslation: config.key,
        ));

        for (int bookNr = 1; bookNr <= 66; bookNr++) {
          if (_isCancelled) break;
          while (_isPaused) {
            await Future.delayed(const Duration(milliseconds: 300));
            if (_isCancelled) break;
          }

          final possiblePaths = [
            'assets/data/${config.folder}/book_$bookNr.json',
            'assets/data/${config.folder}/${config.key}_$bookNr.json',
          ];

          String? jsonString;
          String? loadedPath;
          for (final p in possiblePaths) {
            try {
              jsonString = await rootBundle.loadString(p);
              loadedPath = p;
              break;
            } catch (_) {}
          }

          if (jsonString == null) continue;

          try {
            final bookMap = json.decode(jsonString) as Map<String, dynamic>;
            final bookName = bookMap['name'] as String? ?? 'Libro $bookNr';
            final meta = kCanonicalBookMetadata[bookNr] ??
                (code: 'BK$bookNr', chapters: 1, isNT: bookNr >= 40);

            _updateStatus(_currentStatus.copyWith(
              activeBookName: bookName,
              activeChapter: 1,
            ));

            final chaptersList = bookMap['chapters'] as List<dynamic>? ?? [];
            final chaptersToInsert = <LocalBibleChaptersCompanion>[];

            for (final chItem in chaptersList) {
              if (chItem is Map<String, dynamic>) {
                final chNum = chItem['chapter'] as int? ?? 1;
                final rawVerses = chItem['verses'] as List<dynamic>? ?? [];

                final versesData = rawVerses.map((v) {
                  return {
                    'chapter': chNum,
                    'verse': v['verse'] ?? 1,
                    'name': v['name'] ?? '',
                    'text': (v['text'] as String? ?? '').trim(),
                  };
                }).toList();

                if (versesData.isNotEmpty) {
                  chaptersToInsert.add(LocalBibleChaptersCompanion.insert(
                    id: '${config.key}_${bookNr}_$chNum',
                    translationKey: config.key,
                    bookNumber: bookNr,
                    bookCode: meta.code,
                    bookName: bookName,
                    chapter: chNum,
                    versesJson: json.encode(versesData),
                    verseCount: Value(versesData.length),
                  ));
                }
              }
            }

            if (chaptersToInsert.isNotEmpty) {
              await database.saveChaptersBatch(chaptersToInsert);
            }
          } catch (e) {
            debugPrint('Local sync error for ${loadedPath ?? config.key}: $e');
          }

          final count = await database.countStoredChapters();
          final pct = (count / totalBibleChaptersAllTranslations * 100.0)
              .clamp(0.0, 100.0);

          _updateStatus(_currentStatus.copyWith(
            downloadedChapters: count,
            progressPercent: pct,
            isComplete: count >= 1189,
          ));

          await Future.delayed(const Duration(milliseconds: 10));
        }
      }

      final finalCount = await database.countStoredChapters();
      _updateStatus(_currentStatus.copyWith(
        isDownloading: false,
        isPaused: false,
        activeBookName: '',
        activeChapter: 0,
        downloadedChapters: finalCount,
        progressPercent: 100.0,
        isComplete: true,
      ));
    } catch (e) {
      debugPrint('Background local sync error: $e');
      _updateStatus(_currentStatus.copyWith(
        isDownloading: false,
        lastError: e.toString(),
      ));
    } finally {
      _isRunning = false;
    }
  }

  void pause() {
    _isPaused = true;
    _updateStatus(
        _currentStatus.copyWith(isPaused: true, isDownloading: false));
  }

  void resume() {
    if (_isPaused) {
      _isPaused = false;
      _updateStatus(
          _currentStatus.copyWith(isPaused: false, isDownloading: true));
    } else if (!_isRunning) {
      startBackgroundSync();
    }
  }

  void dispose() {
    _isCancelled = true;
    _statusController.close();
  }
}
