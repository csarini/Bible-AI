import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart' show rootBundle;
import '../../../../core/constants/bible_books.dart';
import '../../../../core/storage/app_database.dart';

// =============================================================================
// DTOs FOR SCRIPTURE READS FROM LOCAL SQLITE DATABASE
// =============================================================================

class LocalBibleVerseDto {
  final int chapter;
  final int verse;
  final String name;
  final String text;

  const LocalBibleVerseDto({
    required this.chapter,
    required this.verse,
    required this.name,
    required this.text,
  });

  factory LocalBibleVerseDto.fromJson(Map<String, dynamic> json) {
    return LocalBibleVerseDto(
      chapter: json['chapter'] as int? ?? 1,
      verse: json['verse'] as int? ?? 1,
      name: json['name'] as String? ?? '',
      text: (json['text'] as String? ?? '').trim(),
    );
  }

  Map<String, dynamic> toJson() => {
        'chapter': chapter,
        'verse': verse,
        'name': name,
        'text': text,
      };
}

class LocalBibleChapterResponse {
  final String translation;
  final String abbreviation;
  final String lang;
  final String language;
  final String direction;
  final String encoding;
  final int bookNr;
  final String bookName;
  final int chapter;
  final String name;
  final List<LocalBibleVerseDto> verses;

  const LocalBibleChapterResponse({
    required this.translation,
    required this.abbreviation,
    this.lang = 'es',
    this.language = 'Spanish',
    this.direction = 'LTR',
    this.encoding = 'UTF-8',
    required this.bookNr,
    required this.bookName,
    required this.chapter,
    required this.name,
    required this.verses,
  });

  factory LocalBibleChapterResponse.fromJson(Map<String, dynamic> json) {
    final rawVerses = json['verses'] as List<dynamic>? ?? [];
    return LocalBibleChapterResponse(
      translation: json['translation'] as String? ?? '',
      abbreviation: json['abbreviation'] as String? ?? 'valera',
      lang: json['lang'] as String? ?? 'es',
      language: json['language'] as String? ?? 'Spanish',
      direction: json['direction'] as String? ?? 'LTR',
      encoding: json['encoding'] as String? ?? 'UTF-8',
      bookNr: json['book_nr'] as int? ?? 1,
      bookName: json['book_name'] as String? ?? '',
      chapter: json['chapter'] as int? ?? 1,
      name: json['name'] as String? ?? '',
      verses: rawVerses
          .map((v) => LocalBibleVerseDto.fromJson(v as Map<String, dynamic>))
          .toList(),
    );
  }
}

// Backward-compatible type aliases
typedef GetBibleVerseDto = LocalBibleVerseDto;
typedef GetBibleResponseDto = LocalBibleChapterResponse;

// =============================================================================
// LOCAL BIBLE SERVICE - 100% OFFLINE SQLITE / LOCAL ASSETS DIRECT ACCESS
// (ELIMINATES ALL CALLS TO API.GETBIBLE.NET)
// =============================================================================

class LocalBibleService {
  final AppDatabase database;

  LocalBibleService({required this.database});

  /// Fetches a complete chapter directly from the local SQLite database.
  /// If not yet indexed in SQLite, loads it from the local JSON asset and caches it into SQLite.
  /// Never makes network calls to external APIs.
  Future<LocalBibleChapterResponse> fetchChapter({
    required String translationKey,
    required int bookNumber,
    required int chapterNumber,
    String? bookCode,
    String? bookName,
  }) async {
    final cleanTranslation = translationKey.toLowerCase().trim();

    // 1. DIRECT QUERY TO LOCAL SQLITE DATABASE
    try {
      final localEntry = await database.getChapter(
        cleanTranslation,
        bookNumber,
        chapterNumber,
      );

      if (localEntry != null && localEntry.versesJson.isNotEmpty) {
        final decodedList = json.decode(localEntry.versesJson) as List<dynamic>;
        final verses = decodedList
            .map((v) => LocalBibleVerseDto.fromJson(v as Map<String, dynamic>))
            .toList();

        if (verses.isNotEmpty) {
          final resolvedBookName = localEntry.bookName.isNotEmpty
              ? localEntry.bookName
              : (bookName ?? 'Libro $bookNumber');

          return LocalBibleChapterResponse(
            translation: localEntry.translationKey,
            abbreviation: localEntry.translationKey,
            bookNr: localEntry.bookNumber,
            bookName: resolvedBookName,
            chapter: localEntry.chapter,
            name: '$resolvedBookName ${localEntry.chapter}',
            verses: verses,
          );
        }
      }
    } catch (e) {
      debugPrint(
          'Local SQLite query error for $cleanTranslation $bookNumber:$chapterNumber: $e');
    }

    // 2. OFFLINE ASSET JSON FALLBACK (If not yet imported in SQLite)
    return await _loadFromLocalAssetAndSave(
      translationKey: cleanTranslation,
      bookNumber: bookNumber,
      chapterNumber: chapterNumber,
      bookCode: bookCode,
      bookName: bookName,
    );
  }

  /// Reads from local asset JSON files and saves to SQLite
  Future<LocalBibleChapterResponse> _loadFromLocalAssetAndSave({
    required String translationKey,
    required int bookNumber,
    required int chapterNumber,
    String? bookCode,
    String? bookName,
  }) async {
    final folder = translationKey == 'sse'
        ? 'sse_json'
        : translationKey == 'rv1858'
            ? 'rv1858_json'
            : 'valera_json';

    final prefix = translationKey == 'sse'
        ? 'sse'
        : translationKey == 'rv1858'
            ? 'rv1858'
            : 'valera';

    final assetPath = 'assets/data/$folder/${prefix}_$bookNumber.json';

    try {
      final jsonString = await rootBundle.loadString(assetPath);
      final bookMap = json.decode(jsonString) as Map<String, dynamic>;

      final loadedBookName =
          bookMap['name'] as String? ?? bookName ?? 'Libro $bookNumber';
      final chapters = bookMap['chapters'] as List<dynamic>? ?? [];

      // Find the requested chapter
      Map<String, dynamic>? targetChapter;
      for (final ch in chapters) {
        if (ch is Map<String, dynamic> && ch['chapter'] == chapterNumber) {
          targetChapter = ch;
          break;
        }
      }

      if (targetChapter != null) {
        final rawVerses = targetChapter['verses'] as List<dynamic>? ?? [];
        final verses = rawVerses.map((v) {
          return LocalBibleVerseDto(
            chapter: chapterNumber,
            verse: v['verse'] as int? ?? 1,
            name: v['name'] as String? ??
                '$loadedBookName $chapterNumber:${v['verse']}',
            text: (v['text'] as String? ?? '').trim(),
          );
        }).toList();

        final code = bookCode ??
            kCanonicalBookMetadata[bookNumber]?.code ??
            'BK$bookNumber';

        // Save into local SQLite for fast subsequent access
        try {
          final versesMapList = verses.map((v) => v.toJson()).toList();
          await database.saveChapter(
            translationKey: translationKey,
            bookNumber: bookNumber,
            bookCode: code,
            bookName: loadedBookName,
            chapter: chapterNumber,
            versesJson: json.encode(versesMapList),
            verseCount: verses.length,
          );
        } catch (saveErr) {
          debugPrint('Error saving fallback chapter to DB: $saveErr');
        }

        return LocalBibleChapterResponse(
          translation: translationKey,
          abbreviation: translationKey,
          bookNr: bookNumber,
          bookName: loadedBookName,
          chapter: chapterNumber,
          name: '$loadedBookName $chapterNumber',
          verses: verses,
        );
      }
    } catch (e) {
      debugPrint('Error loading chapter from local asset $assetPath: $e');
    }

    // Default empty fallback if not found
    return LocalBibleChapterResponse(
      translation: translationKey,
      abbreviation: translationKey,
      bookNr: bookNumber,
      bookName: bookName ?? 'Libro $bookNumber',
      chapter: chapterNumber,
      name: '${bookName ?? "Libro $bookNumber"} $chapterNumber',
      verses: [
        LocalBibleVerseDto(
          chapter: chapterNumber,
          verse: 1,
          name: '${bookName ?? "Libro"} $chapterNumber:1',
          text: 'Texto no disponible en la base de datos local.',
        ),
      ],
    );
  }
}

// Backward compatibility alias for any existing code
typedef GetBibleService = LocalBibleService;
