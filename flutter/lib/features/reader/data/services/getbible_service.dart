import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../../../../core/storage/app_database.dart';

// =============================================================================
// DTOs MATCHING GETBIBLE.NET v2 JSON SCHEMA
// =============================================================================

class GetBibleVerseDto {
  final int chapter;
  final int verse;
  final String name;
  final String text;

  const GetBibleVerseDto({
    required this.chapter,
    required this.verse,
    required this.name,
    required this.text,
  });

  factory GetBibleVerseDto.fromJson(Map<String, dynamic> json) {
    return GetBibleVerseDto(
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

class GetBibleResponseDto {
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
  final List<GetBibleVerseDto> verses;

  const GetBibleResponseDto({
    required this.translation,
    required this.abbreviation,
    required this.lang,
    required this.language,
    required this.direction,
    required this.encoding,
    required this.bookNr,
    required this.bookName,
    required this.chapter,
    required this.name,
    required this.verses,
  });

  factory GetBibleResponseDto.fromJson(Map<String, dynamic> json) {
    final rawVerses = json['verses'] as List<dynamic>? ?? [];
    return GetBibleResponseDto(
      translation: json['translation'] as String? ?? '',
      abbreviation: json['abbreviation'] as String? ?? 'rv1858',
      lang: json['lang'] as String? ?? 'es',
      language: json['language'] as String? ?? 'Spanish',
      direction: json['direction'] as String? ?? 'LTR',
      encoding: json['encoding'] as String? ?? 'UTF-8',
      bookNr: json['book_nr'] as int? ?? 1,
      bookName: json['book_name'] as String? ?? '',
      chapter: json['chapter'] as int? ?? 1,
      name: json['name'] as String? ?? '',
      verses: rawVerses
          .map((v) => GetBibleVerseDto.fromJson(v as Map<String, dynamic>))
          .toList(),
    );
  }
}

// =============================================================================
// GETBIBLE SERVICE CLIENT (WITH LOCAL DB FIRST STRATEGY)
// =============================================================================

class GetBibleService {
  final http.Client _client;
  final AppDatabase? database;
  static const String _baseUrl = 'https://api.getbible.net/v2';

  GetBibleService({
    this.database,
    http.Client? client,
  }) : _client = client ?? http.Client();

  /// Fetches a complete chapter: checks the local database first.
  /// If found in SQLite, returns instantly.
  /// If not found in SQLite, fetches from GetBible.net API and caches locally.
  Future<GetBibleResponseDto> fetchChapter({
    required String translationKey,
    required int bookNumber,
    required int chapterNumber,
    String? bookCode,
    String? bookName,
    String? bookUrl,
  }) async {
    // 1. FIRST: Check local SQLite database
    if (database != null) {
      try {
        final localChapter = await database!.getChapter(
          translationKey,
          bookNumber,
          chapterNumber,
        );

        if (localChapter != null && localChapter.versesJson.isNotEmpty) {
          final decodedList = json.decode(localChapter.versesJson) as List<dynamic>;
          final verses = decodedList
              .map((v) => GetBibleVerseDto.fromJson(v as Map<String, dynamic>))
              .toList();

          if (verses.isNotEmpty) {
            return GetBibleResponseDto(
              translation: localChapter.translationKey,
              abbreviation: localChapter.translationKey,
              lang: 'es',
              language: 'Spanish',
              direction: 'LTR',
              encoding: 'UTF-8',
              bookNr: localChapter.bookNumber,
              bookName: localChapter.name,
              chapter: localChapter.chapter,
              name: '${localChapter.name} ${localChapter.chapter}',
              verses: verses,
            );
          }
        }
      } catch (e) {
        debugPrint('Local DB read fallback for $translationKey $bookNumber:$chapterNumber: $e');
      }
    }

    // 2. SECOND: Fetch from GetBible API if not found locally
    final uri = Uri.parse('$_baseUrl/$translationKey/$bookNumber/$chapterNumber.json');

    try {
      final response = await _client.get(
        uri,
        headers: {'Accept': 'application/json'},
      ).timeout(const Duration(seconds: 12));

      if (response.statusCode == 200) {
        final decoded = json.decode(utf8.decode(response.bodyBytes)) as Map<String, dynamic>;
        final dto = GetBibleResponseDto.fromJson(decoded);

        // 3. Save into local SQLite database for future offline access
        if (database != null && dto.verses.isNotEmpty) {
          try {
            final versesMapList = dto.verses.map((v) => v.toJson()).toList();
            await database!.saveChapter(
              translationKey: translationKey,
              bookNumber: bookNumber,
              bookCode: bookCode ?? '',
              bookName: dto.bookName.isNotEmpty ? dto.bookName : (bookName ?? 'Libro $bookNumber'),
              chapter: chapterNumber,
              versesJson: json.encode(versesMapList),
              verseCount: dto.verses.length,
            );
          } catch (e) {
            debugPrint('Failed to cache fetched chapter into DB: $e');
          }
        }

        return dto;
      } else if (response.statusCode == 404) {
        throw Exception('Pasaje no encontrado en GetBible: Libro $bookNumber, Capítulo $chapterNumber.');
      } else {
        throw Exception('Error del servidor GetBible (${response.statusCode}): ${response.reasonPhrase}');
      }
    } catch (e) {
      throw Exception('Fallo al conectar con GetBible.net: $e');
    }
  }
}

