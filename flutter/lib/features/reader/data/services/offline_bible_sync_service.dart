import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../../../../core/storage/app_database.dart';

// =============================================================================
// OFFLINE SYNC STATUS MODEL
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
    this.totalChapters = 1189,
    this.downloadedChapters = 0,
    this.progressPercent = 0.0,
    this.isComplete = false,
    this.activeTranslation = 'valera',
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
// BACKGROUND BIBLE SYNC & DOWNLOADER SERVICE
// =============================================================================

class OfflineBibleSyncService {
  final AppDatabase database;
  final http.Client _client;
  static const int totalBibleChaptersPerTranslation = 1189;

  bool _isCancelled = false;
  bool _isPaused = false;
  bool _isRunning = false;

  final StreamController<OfflineSyncStatus> _statusController =
      StreamController<OfflineSyncStatus>.broadcast();

  OfflineSyncStatus _currentStatus = const OfflineSyncStatus();

  OfflineBibleSyncService({
    required this.database,
    http.Client? client,
  }) : _client = client ?? http.Client() {
    _initInitialStatus();
  }

  Stream<OfflineSyncStatus> get statusStream => _statusController.stream;
  OfflineSyncStatus get currentStatus => _currentStatus;

  Future<void> _initInitialStatus() async {
    final count = await database.countStoredChapters();
    final isComplete = count >= totalBibleChaptersPerTranslation;
    final pct = (count / totalBibleChaptersPerTranslation * 100.0).clamp(0.0, 100.0);

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

  /// Starts or resumes the background download of all versions
  Future<void> startBackgroundSync({String? specificTranslation}) async {
    if (_isRunning && !_isPaused) return;

    _isCancelled = false;
    _isPaused = false;
    _isRunning = true;

    final targetTranslations = specificTranslation != null
        ? [specificTranslation]
        : ['valera', 'rv1858', 'sse'];

    try {
      for (final transKey in targetTranslations) {
        if (_isCancelled) break;

        final books = await database.getBooksByTranslation(transKey);
        if (books.isEmpty) continue;

        _updateStatus(_currentStatus.copyWith(
          isDownloading: true,
          isPaused: false,
          activeTranslation: transKey,
        ));

        for (final book in books) {
          if (_isCancelled) break;
          while (_isPaused) {
            await Future.delayed(const Duration(milliseconds: 300));
            if (_isCancelled) break;
          }

          _updateStatus(_currentStatus.copyWith(
            activeBookName: book.name,
            activeChapter: 1,
          ));

          await _downloadAndSaveBook(book, transKey);

          final count = await database.countStoredChapters(transKey);
          final pct = (count / totalBibleChaptersPerTranslation * 100.0).clamp(0.0, 100.0);

          _updateStatus(_currentStatus.copyWith(
            downloadedChapters: count,
            progressPercent: pct,
            isComplete: count >= totalBibleChaptersPerTranslation,
          ));

          // Small delay to prevent network congestion
          await Future.delayed(const Duration(milliseconds: 40));
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
      debugPrint('Background sync error: $e');
      _updateStatus(_currentStatus.copyWith(
        isDownloading: false,
        lastError: e.toString(),
      ));
    } finally {
      _isRunning = false;
    }
  }

  /// Downloads an entire book using its URL or chapter by chapter
  Future<void> _downloadAndSaveBook(BibleBookEntry book, String translationKey) async {
    final bookUrl = book.url ?? 'https://api.getbible.net/v2/$translationKey/${book.bookNumber}.json';

    try {
      final response = await _client.get(
        Uri.parse(bookUrl),
        headers: {'Accept': 'application/json'},
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final decoded = json.decode(utf8.decode(response.bodyBytes)) as Map<String, dynamic>;
        final chaptersList = decoded['chapters'] as List<dynamic>?;

        if (chaptersList != null && chaptersList.isNotEmpty) {
          for (final chItem in chaptersList) {
            if (_isCancelled) break;
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
                await database.saveChapter(
                  translationKey: translationKey,
                  bookNumber: book.bookNumber,
                  bookCode: book.bookCode,
                  bookName: decoded['name'] as String? ?? book.name,
                  chapter: chNum,
                  versesJson: json.encode(versesData),
                  verseCount: versesData.length,
                );
              }
            }
          }
          return; // Successfully saved full book!
        }
      }
    } catch (e) {
      debugPrint('Full book download fallback for ${book.name} ($translationKey): $e');
    }

    // Fallback: download chapter by chapter if full book endpoint wasn't available
    for (int ch = 1; ch <= book.totalChapters; ch++) {
      if (_isCancelled) break;
      while (_isPaused) {
        await Future.delayed(const Duration(milliseconds: 300));
        if (_isCancelled) break;
      }

      final alreadyExists = await database.hasChapter(translationKey, book.bookNumber, ch);
      if (alreadyExists) continue;

      try {
        final chUri = Uri.parse('https://api.getbible.net/v2/$translationKey/${book.bookNumber}/$ch.json');
        final chRes = await _client.get(chUri, headers: {'Accept': 'application/json'}).timeout(const Duration(seconds: 8));

        if (chRes.statusCode == 200) {
          final decoded = json.decode(utf8.decode(chRes.bodyBytes)) as Map<String, dynamic>;
          final rawVerses = decoded['verses'] as List<dynamic>? ?? [];

          final versesData = rawVerses.map((v) {
            return {
              'chapter': ch,
              'verse': v['verse'] ?? 1,
              'name': v['name'] ?? '',
              'text': (v['text'] as String? ?? '').trim(),
            };
          }).toList();

          if (versesData.isNotEmpty) {
            await database.saveChapter(
              translationKey: translationKey,
              bookNumber: book.bookNumber,
              bookCode: book.bookCode,
              bookName: decoded['book_name'] as String? ?? book.name,
              chapter: ch,
              versesJson: json.encode(versesData),
              verseCount: versesData.length,
            );
          }
        }
      } catch (_) {
        // Continue to next chapter
      }

      await Future.delayed(const Duration(milliseconds: 20));
    }
  }

  void pause() {
    _isPaused = true;
    _updateStatus(_currentStatus.copyWith(isPaused: true, isDownloading: false));
  }

  void resume() {
    if (_isPaused) {
      _isPaused = false;
      _updateStatus(_currentStatus.copyWith(isPaused: false, isDownloading: true));
    } else if (!_isRunning) {
      startBackgroundSync();
    }
  }

  void dispose() {
    _isCancelled = true;
    _statusController.close();
  }
}
