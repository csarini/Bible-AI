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
  final bool isOfflineFallback;
  final String? fallbackNotice;

  /// Aliases for convenience
  int get bookNumber => bookNr;
  int get chapterNumber => chapter;

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
    this.isOfflineFallback = false,
    this.fallbackNotice,
  });

  factory LocalBibleChapterResponse.fromJson(Map<String, dynamic> json) {
    final rawVerses = json['verses'] as List<dynamic>? ?? [];
    return LocalBibleChapterResponse(
      translation: json['translation'] as String? ?? '',
      abbreviation: json['abbreviation'] as String? ?? 'rvr1960',
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
// LOCAL BIBLE SERVICE - 100% OFFLINE SQLITE SCRIPTURE PROVIDER
// =============================================================================

class LocalBibleService {
  final AppDatabase database;

  LocalBibleService({
    required this.database,
  });

  /// Reads scripture directly from the local SQLite database.
  /// If the requested translation is not present, falls back cleanly to the
  /// base canonical 'rvr1960' translation stored locally.
  Future<LocalBibleChapterResponse> fetchChapter({
    required String translationKey,
    required int bookNumber,
    required int chapterNumber,
    String? bookCode,
    String? bookName,
    String? apiKey,
    void Function(String notice)? onOfflineFallbackNotice,
  }) async {
    final cleanTranslation = translationKey.toLowerCase().trim();

    // 1. Direct local SQLite query
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
          'Error leyendo capítulo desde SQLite ($cleanTranslation $bookNumber:$chapterNumber): $e');
    }

    // 2. Fallback to base canonical offline version ('rvr1960')
    final notice = 'Mostrando versión canónica local Reina-Valera 1960.';
    onOfflineFallbackNotice?.call(notice);

    return _loadBaseOfflineFallback(
      bookNumber: bookNumber,
      chapterNumber: chapterNumber,
      bookCode: bookCode,
      bookName: bookName,
      fallbackNotice: notice,
    );
  }

  Future<LocalBibleChapterResponse> _loadBaseOfflineFallback({
    required int bookNumber,
    required int chapterNumber,
    String? bookCode,
    String? bookName,
    required String fallbackNotice,
  }) async {
    const baseTranslation = 'rvr1960';
    final baseEntry =
        await database.getChapter(baseTranslation, bookNumber, chapterNumber);
    if (baseEntry != null && baseEntry.versesJson.isNotEmpty) {
      final decodedList = json.decode(baseEntry.versesJson) as List<dynamic>;
      final verses = decodedList
          .map((v) => LocalBibleVerseDto.fromJson(v as Map<String, dynamic>))
          .toList();

      final resolvedBookName = baseEntry.bookName.isNotEmpty
          ? baseEntry.bookName
          : (bookName ?? 'Libro $bookNumber');

      return LocalBibleChapterResponse(
        translation: baseEntry.translationKey,
        abbreviation: baseEntry.translationKey,
        bookNr: baseEntry.bookNumber,
        bookName: resolvedBookName,
        chapter: baseEntry.chapter,
        name: '$resolvedBookName ${baseEntry.chapter}',
        verses: verses,
        isOfflineFallback: true,
        fallbackNotice: fallbackNotice,
      );
    }

    throw StateError(
      'No se encontró la versión base ($baseTranslation) en SQLite para el libro $bookNumber capítulo $chapterNumber.',
    );
  }
}

// Backward compatibility alias for existing code
typedef GetBibleService = LocalBibleService;
