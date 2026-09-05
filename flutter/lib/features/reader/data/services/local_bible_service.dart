import 'dart:convert';
import 'package:flutter/foundation.dart';
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
      chapter: _readInt(json['chapter'], fallback: 1),
      verse: _readInt(json['verse'], fallback: 1),
      name: json['name'] as String? ?? '',
      text: (json['text'] as String? ?? '').trim(),
    );
  }

  static int _readInt(Object? value, {required int fallback}) {
    if (value is int) return value;
    return int.tryParse(value?.toString() ?? '') ?? fallback;
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

  /// Fetches a complete chapter exclusively from the local SQLite database.
  /// JSON assets are used only by the first-run import coordinator.
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

    throw StateError(
      'El capítulo $cleanTranslation $bookNumber:$chapterNumber no está '
      'importado en la base de datos local.',
    );
  }
}

// Backward compatibility alias for any existing code
typedef GetBibleService = LocalBibleService;
