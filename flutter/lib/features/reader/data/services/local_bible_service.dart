import 'dart:convert';
import 'package:flutter/foundation.dart';
import '../../../../core/storage/app_database.dart';
import '../../../../core/services/api_bible_service.dart';
import '../../../../core/services/copyright_guard_service.dart';

// =============================================================================
// DTOs FOR SCRIPTURE READS FROM LOCAL SQLITE DATABASE & API.BIBLE
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
// LOCAL BIBLE SERVICE - OFFLINE-FIRST ORCHESTRATOR WITH API.BIBLE ON-DEMAND CACHE
// =============================================================================

class LocalBibleService {
  final AppDatabase database;
  final ApiBibleService apiBibleService;

  LocalBibleService({
    required this.database,
    ApiBibleService? apiBibleService,
  }) : apiBibleService = apiBibleService ?? ApiBibleService();

  /// Orchestrates scripture access according to the user-defined flowchart:
  /// 1. ¿Versión instalada/offline en SQLite? (ej: 'rv1858', 'sse', 'valera' o datos en caché)
  ///    - SÍ: [ Lectura Directa desde SQLite ]
  ///    - NO: ¿Hay conexión a Internet?
  ///          - SÍ: [ Fetch HTTP API.Bible (Header: api-key) ] -> [ Guardar en SQLite (Caché por Demanda) ]
  ///          - NO: [ Notificar Offline ] -> [ Usar Versión Base ] ('valera')
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

    // 1. ¿Versión instalada / offline en SQLite? (ej: 'valera', 'sse', 'rv1858' o datos en caché)
    try {
      final localEntry = await database.getChapter(
        cleanTranslation,
        bookNumber,
        chapterNumber,
      );

      if (localEntry != null && localEntry.versesJson.isNotEmpty) {
        final isProtected = CopyrightGuardService.isCopyrightProtected(cleanTranslation);
        final isExpired = isProtected && CopyrightGuardService.isCacheExpired(localEntry.createdAt);

        if (isExpired) {
          debugPrint(
            'Caché de "$cleanTranslation" ($bookNumber:$chapterNumber) expirada (>30 días). Revalidando contra API.Bible según términos de licencia.',
          );
        } else {
          final decodedList = json.decode(localEntry.versesJson) as List<dynamic>;
          final verses = decodedList
              .map((v) => LocalBibleVerseDto.fromJson(v as Map<String, dynamic>))
              .toList();

          if (verses.isNotEmpty) {
            final resolvedBookName = localEntry.bookName.isNotEmpty
                ? localEntry.bookName
                : (bookName ?? 'Libro $bookNumber');

            // [ Lectura Directa desde SQLite ]
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
      }
    } catch (e) {
      debugPrint('Error leyendo capítulo desde SQLite ($cleanTranslation $bookNumber:$chapterNumber): $e');
    }

    // 2. NO ESTÁ EN SQLITE (ej: 'NVI', 'RVR1960', 'KJV' sin cachear aún)
    // -> ¿Hay conexión a Internet?
    final hasInternet = await apiBibleService.checkInternetConnection();

    if (!hasInternet) {
      // [ Notificar Offline ] -> [ Usar Versión Base ]
      final notice = 'Sin conexión a Internet para descargar "${translationKey.toUpperCase()}". Mostrando versión base disponible.';
      onOfflineFallbackNotice?.call(notice);

      return _loadBaseOfflineFallback(
        bookNumber: bookNumber,
        chapterNumber: chapterNumber,
        bookCode: bookCode,
        bookName: bookName,
        fallbackNotice: notice,
      );
    }

    // 3. CON CONEXIÓN A INTERNET:
    // -> [ Fetch HTTP API.Bible (Header: api-key) ]
    try {
      final remoteChapter = await apiBibleService.fetchChapter(
        translationKey: cleanTranslation,
        bookNumber: bookNumber,
        chapterNumber: chapterNumber,
        bookCode: bookCode,
        bookName: bookName,
        activeApiKey: apiKey,
      );

      if (remoteChapter.verses.isNotEmpty) {
        // -> [ Guardar en SQLite (Caché por Demanda) ]
        final versesJson = json.encode(remoteChapter.verses.map((v) => v.toJson()).toList());
        await database.saveChapter(
          translationKey: cleanTranslation,
          bookNumber: bookNumber,
          bookCode: bookCode ?? ApiBibleService.resolveBookCode(bookNumber),
          bookName: remoteChapter.bookName,
          chapter: chapterNumber,
          versesJson: versesJson,
          verseCount: remoteChapter.verses.length,
        );

        return remoteChapter;
      }
    } catch (e) {
      debugPrint('Error descargando desde API.Bible ($cleanTranslation $bookNumber:$chapterNumber): $e');
      final notice = 'No se pudo descargar "$translationKey" ($e). Mostrando versión base disponible.';
      onOfflineFallbackNotice?.call(notice);

      return _loadBaseOfflineFallback(
        bookNumber: bookNumber,
        chapterNumber: chapterNumber,
        bookCode: bookCode,
        bookName: bookName,
        fallbackNotice: notice,
      );
    }

    // Fallback de seguridad final a versión base
    return _loadBaseOfflineFallback(
      bookNumber: bookNumber,
      chapterNumber: chapterNumber,
      bookCode: bookCode,
      bookName: bookName,
      fallbackNotice: 'Mostrando versión base disponible.',
    );
  }

  Future<LocalBibleChapterResponse> _loadBaseOfflineFallback({
    required int bookNumber,
    required int chapterNumber,
    String? bookCode,
    String? bookName,
    required String fallbackNotice,
  }) async {
    const baseTranslation = 'valera';
    final baseEntry = await database.getChapter(baseTranslation, bookNumber, chapterNumber);
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

// Backward compatibility alias for any existing code
typedef GetBibleService = LocalBibleService;
