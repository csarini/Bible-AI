import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'package:drift/drift.dart';
import '../constants/bible_books.dart';
import '../storage/app_database.dart';

class BibleDataImportService {
  final AppDatabase database;

  BibleDataImportService({required this.database});

  /// Check if the local database already has the required Bible data.
  Future<bool> isImportNeeded() async {
    try {
      final isChaptersImported = await database.isBibleDataImported();
      if (!isChaptersImported) return true;

      final books = await database.getAllBibleBooks();
      if (books.length < 66) return true;

      final translations = await database.getAllTranslations();
      if (translations.isEmpty) return true;

      return false;
    } catch (e) {
      debugPrint('Error checking import status: $e');
      return true;
    }
  }

  /// Repairs one missing chapter without repeating the complete first-run import.
  Future<bool> importChapterIfMissing({
    required String translationKey,
    required int bookNumber,
    required int chapterNumber,
  }) async {
    final config = (folder: 'valera_json', prefix: 'valera');
    final assetPath =
        'assets/data/${config.folder}/${config.prefix}_$bookNumber.json';

    try {
      final bookData = json.decode(await rootBundle.loadString(assetPath))
          as Map<String, dynamic>;
      final rawChapters = bookData['chapters'] as List<dynamic>? ?? const [];
      final chapter = rawChapters.whereType<Map<String, dynamic>>().firstWhere(
            (item) => _readInt(item['chapter']) == chapterNumber,
            orElse: () => <String, dynamic>{},
          );
      if (chapter.isEmpty) return false;

      final meta = kCanonicalBookMetadata[bookNumber];
      final verses = (chapter['verses'] as List<dynamic>? ?? const [])
          .whereType<Map<String, dynamic>>()
          .map((verse) => {
                'chapter': chapterNumber,
                'verse': _readInt(verse['verse'], fallback: 1),
                'name': verse['name']?.toString() ?? '',
                'text': verse['text']?.toString().trim() ?? '',
              })
          .where((verse) => (verse['text'] as String).isNotEmpty)
          .toList(growable: false);
      if (verses.isEmpty || meta == null) return false;

      await database.saveChapter(
        translationKey: translationKey.toLowerCase().trim(),
        bookNumber: bookNumber,
        bookCode: meta.code,
        bookName: bookData['name']?.toString() ?? 'Libro $bookNumber',
        chapter: chapterNumber,
        versesJson: json.encode(verses),
        verseCount: verses.length,
      );
      return true;
    } catch (error) {
      debugPrint('Error reparando $assetPath capítulo $chapterNumber: $error');
      return false;
    }
  }

  static int _readInt(Object? value, {int fallback = -1}) {
    if (value is int) return value;
    return int.tryParse(value?.toString() ?? '') ?? fallback;
  }

  /// Imports all canonical translations, book indexes, and full chapter/verse text
  /// from local JSON assets directly into SQLite.
  Future<void> importAllBibleData({
    required void Function(double progress, String statusMessage) onProgress,
  }) async {
    onProgress(0.01, 'Iniciando Santuario Digital...');

    // -------------------------------------------------------------------------
    // 1. IMPORT TRANSLATIONS CATALOG
    // -------------------------------------------------------------------------
    onProgress(0.03, 'Cargando traducciones canónicas...');
    try {
      final catalogString =
          await rootBundle.loadString('assets/data/translations_catalog.json');
      final catalogJson = json.decode(catalogString) as Map<String, dynamic>;

      final translationsList = <LocalBibleTranslationsCompanion>[];
      catalogJson.forEach((key, val) {
        if (val is Map<String, dynamic>) {
          translationsList.add(LocalBibleTranslationsCompanion.insert(
            id: key,
            name: val['translation'] as String? ?? key,
            abbreviation: val['abbreviation'] as String? ?? key,
            description: Value(val['description'] as String?),
            language: Value(val['language'] as String? ?? 'Spanish'),
            direction: Value(val['direction'] as String? ?? 'LTR'),
            distributionAbbreviation:
                Value(val['distribution_abbreviation'] as String?),
            url: Value(val['url'] as String?),
          ));
        }
      });

      if (translationsList.isNotEmpty) {
        await database.batch((b) {
          b.insertAllOnConflictUpdate(
              database.localBibleTranslations, translationsList);
        });
      }
    } catch (e) {
      debugPrint('Warning: translations catalog import error: $e');
    }

    // -------------------------------------------------------------------------
    // 2. IMPORT BIBLE BOOKS METADATA FOR EACH TRANSLATION
    // -------------------------------------------------------------------------
    onProgress(0.06, 'Indexando libros canónicos...');
    final translationFiles = {
      'valera': 'assets/data/books_valera.json',
    };

    final allBooksToInsert = <LocalBibleBooksCompanion>[];
    for (final entry in translationFiles.entries) {
      final transKey = entry.key;
      final assetPath = entry.value;

      try {
        final booksString = await rootBundle.loadString(assetPath);
        final booksJson = json.decode(booksString) as Map<String, dynamic>;

        booksJson.forEach((key, val) {
          if (val is Map<String, dynamic>) {
            final nr = val['nr'] as int? ?? int.tryParse(key) ?? 1;
            final name = val['name'] as String? ?? '';
            final meta = kCanonicalBookMetadata[nr] ??
                (code: 'BK$nr', chapters: 1, isNT: nr >= 40);

            allBooksToInsert.add(LocalBibleBooksCompanion.insert(
              id: '${transKey}_$nr',
              translationKey: transKey,
              bookNumber: nr,
              bookCode: meta.code,
              name: name,
              totalChapters: meta.chapters,
              isNewTestament: Value(meta.isNT),
              url: Value(val['url'] as String?),
              sha: Value(val['sha'] as String?),
            ));
          }
        });
      } catch (e) {
        debugPrint('Warning: book metadata import error for $transKey: $e');
      }
    }

    if (allBooksToInsert.isNotEmpty) {
      await database.batch((b) {
        b.insertAllOnConflictUpdate(database.localBibleBooks, allBooksToInsert);
      });
    }

    // -------------------------------------------------------------------------
    // 3. IMPORT CHAPTERS & VERSES FROM JSON ASSETS FOR ALL TRANSLATIONS
    // -------------------------------------------------------------------------
    final translationConfigs = [
      (
        key: 'valera',
        name: 'Reina Valera (1909)',
        folder: 'valera_json',
        prefix: 'valera'
      ),
    ];

    const int totalBooksPerTranslation = 66;
    final int totalFiles = translationConfigs.length * totalBooksPerTranslation;
    int processedFiles = 0;

    for (final config in translationConfigs) {
      for (int bookNr = 1; bookNr <= totalBooksPerTranslation; bookNr++) {
        final filePath =
            'assets/data/${config.folder}/${config.prefix}_$bookNr.json';

        try {
          final jsonString = await rootBundle.loadString(filePath);
          final bookData = json.decode(jsonString) as Map<String, dynamic>;

          final bookName = bookData['name'] as String? ?? 'Libro $bookNr';
          final meta = kCanonicalBookMetadata[bookNr] ??
              (code: 'BK$bookNr', chapters: 1, isNT: bookNr >= 40);

          final chaptersList = bookData['chapters'] as List<dynamic>? ?? [];
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
          debugPrint('Error importing $filePath: $e');
        }

        processedFiles++;
        final progress = 0.08 + ((processedFiles / totalFiles) * 0.90);
        final bookMeta = kCanonicalBookMetadata[bookNr];
        final bookLabel = bookMeta != null ? bookMeta.code : '$bookNr';

        onProgress(
          progress.clamp(0.0, 0.98),
          'Guardando ${config.name}: $bookLabel (${(progress * 100).toInt()}%)',
        );

        // Micro-yield every 2 books to keep UI responsive and rendering animations
        if (processedFiles % 2 == 0) {
          await Future.delayed(const Duration(milliseconds: 1));
        }
      }
    }

    onProgress(1.0, 'Abriendo Santuario de las Escrituras...');
    await Future.delayed(const Duration(milliseconds: 300));
  }
}
