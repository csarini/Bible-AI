import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'package:drift/drift.dart';
import '../constants/bible_books.dart';
import '../storage/app_database.dart';

class BibleDataImportService {
  final AppDatabase database;

  BibleDataImportService({required this.database});

  /// Check if the local database already has the required Bible data for all translations
  /// defined in translations_catalog.json.
  Future<bool> isImportNeeded() async {
    try {
      final catalogString =
          await rootBundle.loadString('assets/data/translations_catalog.json');
      final catalogJson = json.decode(catalogString) as Map<String, dynamic>;
      if (catalogJson.isEmpty) return true;

      final expectedChaptersPerTranslation = kCanonicalBookMetadata.values
          .fold<int>(0, (total, book) => total + book.chapters);

      final translations = await database.getAllTranslations();
      if (translations.isEmpty) return true;

      for (final entry in catalogJson.entries) {
        final val = entry.value;
        if (val is! Map<String, dynamic>) continue;
        final abbr =
            (val['abbreviation'] as String? ?? entry.key).toLowerCase().trim();

        // Check books count (should have at least 66 books)
        final books = await database.getBooksByTranslation(abbr);
        if (books.length < 66) return true;

        // Check chapters count (should have all canonical chapters)
        final count = await database.countStoredChapters(abbr);
        if (count < expectedChaptersPerTranslation) return true;
      }

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
    final cleanKey = translationKey.toLowerCase().trim();
    final possiblePaths = [
      'assets/data/${cleanKey}_json/book_$bookNumber.json',
      'assets/data/${cleanKey}_json/${cleanKey}_$bookNumber.json',
    ];

    String? jsonContent;
    for (final path in possiblePaths) {
      try {
        jsonContent = await rootBundle.loadString(path);
        break;
      } catch (_) {}
    }

    if (jsonContent == null) return false;

    try {
      final bookData = json.decode(jsonContent) as Map<String, dynamic>;
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
        translationKey: cleanKey,
        bookNumber: bookNumber,
        bookCode: meta.code,
        bookName: bookData['name']?.toString() ?? 'Libro $bookNumber',
        chapter: chapterNumber,
        versesJson: json.encode(verses),
        verseCount: verses.length,
      );
      return true;
    } catch (error) {
      debugPrint('Error reparando $cleanKey libro $bookNumber capítulo $chapterNumber: $error');
      return false;
    }
  }

  static int _readInt(Object? value, {int fallback = -1}) {
    if (value is int) return value;
    return int.tryParse(value?.toString() ?? '') ?? fallback;
  }

  /// Imports all translations defined in translations_catalog.json, their book indexes,
  /// and full chapter/verse text from local JSON assets directly into SQLite.
  /// Also eliminates any legacy 'valera' data from the database.
  Future<void> importAllBibleData({
    required void Function(double progress, String statusMessage) onProgress,
  }) async {
    onProgress(0.01, 'Iniciando Santuario Digital...');

    // -------------------------------------------------------------------------
    // 0. CLEANUP PREVIOUS 'valera' MIGRATION DATA FROM LOCAL DB
    // -------------------------------------------------------------------------
    try {
      await (database.delete(database.localBibleTranslations)
            ..where((t) => t.id.equals('valera') | t.abbreviation.equals('valera')))
          .go();
      await (database.delete(database.localBibleBooks)
            ..where((b) => b.translationKey.equals('valera')))
          .go();
      await (database.delete(database.localBibleChapters)
            ..where((c) => c.translationKey.equals('valera')))
          .go();
      await (database.delete(database.localVerses)
            ..where((v) => v.translationId.equals('valera')))
          .go();
    } catch (e) {
      debugPrint('Notice cleaning legacy valera data: $e');
    }

    // -------------------------------------------------------------------------
    // 1. IMPORT TRANSLATIONS CATALOG DYNAMICALLY FROM translations_catalog.json
    // -------------------------------------------------------------------------
    onProgress(0.03, 'Cargando traducciones canónicas...');
    Map<String, dynamic> catalogJson = {};
    try {
      final catalogString =
          await rootBundle.loadString('assets/data/translations_catalog.json');
      catalogJson = json.decode(catalogString) as Map<String, dynamic>;

      final translationsList = <LocalBibleTranslationsCompanion>[];
      catalogJson.forEach((key, val) {
        if (val is Map<String, dynamic>) {
          final abbr =
              (val['abbreviation'] as String? ?? key).toLowerCase().trim();
          final transName = val['translation'] as String? ?? key;

          translationsList.add(LocalBibleTranslationsCompanion.insert(
            id: abbr,
            name: transName,
            abbreviation: abbr,
            description: Value(val['description'] as String?),
            language: Value(val['language'] as String? ?? 'Spanish'),
            direction: Value(val['direction'] as String? ?? 'LTR'),
            distributionAbbreviation:
                Value(val['distribution_abbreviation'] as String? ?? abbr),
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
    // 2. IMPORT BIBLE BOOKS METADATA FOR EACH TRANSLATION IN CATALOG
    // -------------------------------------------------------------------------
    onProgress(0.06, 'Indexando libros canónicos...');
    final allBooksToInsert = <LocalBibleBooksCompanion>[];

    for (final entry in catalogJson.entries) {
      final catalogKey = entry.key;
      final val = entry.value;
      if (val is! Map<String, dynamic>) continue;

      final abbr =
          (val['abbreviation'] as String? ?? catalogKey).toLowerCase().trim();

      final possibleBookPaths = [
        'assets/data/books_$abbr.json',
        'assets/data/books_${catalogKey.toLowerCase()}.json',
      ];

      String? booksString;
      for (final p in possibleBookPaths) {
        try {
          booksString = await rootBundle.loadString(p);
          break;
        } catch (_) {}
      }

      if (booksString != null) {
        try {
          final booksJson = json.decode(booksString) as Map<String, dynamic>;
          booksJson.forEach((key, bVal) {
            if (bVal is Map<String, dynamic>) {
              final nr = _readInt(bVal['nr'], fallback: int.tryParse(key) ?? 1);
              final name = bVal['name'] as String? ?? '';
              final meta = kCanonicalBookMetadata[nr] ??
                  (code: 'BK$nr', chapters: 1, isNT: nr >= 40);
              final chapters = _readInt(bVal['totalChapters'], fallback: meta.chapters);

              allBooksToInsert.add(LocalBibleBooksCompanion.insert(
                id: '${abbr}_$nr',
                translationKey: abbr,
                bookNumber: nr,
                bookCode: meta.code,
                name: name.isNotEmpty ? name : meta.code,
                totalChapters: chapters,
                isNewTestament: Value(meta.isNT),
                url: Value(bVal['url'] as String?),
                sha: Value(bVal['sha'] as String?),
              ));
            }
          });
        } catch (e) {
          debugPrint('Warning: book metadata parse error for $abbr: $e');
        }
      } else {
        // Fallback: populate standard 66 canonical books if books_*.json is missing
        for (int nr = 1; nr <= 66; nr++) {
          final meta = kCanonicalBookMetadata[nr];
          if (meta == null) continue;
          allBooksToInsert.add(LocalBibleBooksCompanion.insert(
            id: '${abbr}_$nr',
            translationKey: abbr,
            bookNumber: nr,
            bookCode: meta.code,
            name: meta.code,
            totalChapters: meta.chapters,
            isNewTestament: Value(meta.isNT),
          ));
        }
      }
    }

    if (allBooksToInsert.isNotEmpty) {
      await database.batch((b) {
        b.insertAllOnConflictUpdate(database.localBibleBooks, allBooksToInsert);
      });
    }

    // -------------------------------------------------------------------------
    // 3. IMPORT CHAPTERS & VERSES FROM JSON ASSETS FOR ALL CATALOG TRANSLATIONS
    // -------------------------------------------------------------------------
    final translationConfigs = <({String key, String name, String folder})>[];
    for (final entry in catalogJson.entries) {
      final key = entry.key;
      final val = entry.value;
      if (val is! Map<String, dynamic>) continue;
      final abbr =
          (val['abbreviation'] as String? ?? key).toLowerCase().trim();
      final transName = val['translation'] as String? ?? key;

      translationConfigs.add((
        key: abbr,
        name: transName,
        folder: '${abbr}_json',
      ));
    }

    const int totalBooksPerTranslation = 66;
    final int totalFiles = translationConfigs.length * totalBooksPerTranslation;
    int processedFiles = 0;

    for (final config in translationConfigs) {
      for (int bookNr = 1; bookNr <= totalBooksPerTranslation; bookNr++) {
        final possiblePaths = [
          'assets/data/${config.folder}/book_$bookNr.json',
          'assets/data/${config.folder}/${config.key}_$bookNr.json',
        ];

        String? jsonString;
        for (final fp in possiblePaths) {
          try {
            jsonString = await rootBundle.loadString(fp);
            break;
          } catch (_) {}
        }

        if (jsonString != null) {
          try {
            final bookData = json.decode(jsonString) as Map<String, dynamic>;
            final bookName = bookData['name'] as String? ?? 'Libro $bookNr';
            final meta = kCanonicalBookMetadata[bookNr] ??
                (code: 'BK$bookNr', chapters: 1, isNT: bookNr >= 40);

            final chaptersList = bookData['chapters'] as List<dynamic>? ?? [];
            final chaptersToInsert = <LocalBibleChaptersCompanion>[];

            for (final chItem in chaptersList) {
              if (chItem is Map<String, dynamic>) {
                final chNum = _readInt(chItem['chapter'], fallback: 1);
                final rawVerses = chItem['verses'] as List<dynamic>? ?? [];
                final totalVersesFromJson = _readInt(chItem['totalVerses'], fallback: rawVerses.length);

                final versesData = rawVerses.map((v) {
                  return {
                    'chapter': chNum,
                    'verse': _readInt(v['verse'], fallback: 1),
                    'name': v['name'] ?? '',
                    'text': (v['text'] as String? ?? '').trim(),
                  };
                }).toList();

                final count = versesData.isNotEmpty ? versesData.length : totalVersesFromJson;

                if (count > 0 || versesData.isNotEmpty) {
                  chaptersToInsert.add(LocalBibleChaptersCompanion.insert(
                    id: '${config.key}_${bookNr}_$chNum',
                    translationKey: config.key,
                    bookNumber: bookNr,
                    bookCode: meta.code,
                    bookName: bookName,
                    chapter: chNum,
                    versesJson: json.encode(versesData),
                    verseCount: Value(count),
                  ));
                }
              }
            }

            if (chaptersToInsert.isNotEmpty) {
              await database.saveChaptersBatch(chaptersToInsert);
            }
          } catch (e) {
            debugPrint('Error importing $bookNr in ${config.key}: $e');
          }
        }

        processedFiles++;
        final progress = 0.08 +
            ((processedFiles / (totalFiles > 0 ? totalFiles : 1)) * 0.90);
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

    // -------------------------------------------------------------------------
    // 4. ENSURE DAILY VERSES SEEDED FOR ALL TRANSLATIONS
    // -------------------------------------------------------------------------
    try {
      await database.ensureDailyVersesSeeded();
    } catch (e) {
      debugPrint('Notice seeding daily verses: $e');
    }

    onProgress(1.0, 'Abriendo Santuario de las Escrituras...');
    await Future.delayed(const Duration(milliseconds: 300));
  }
}
