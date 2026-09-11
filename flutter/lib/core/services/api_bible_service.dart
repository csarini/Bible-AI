import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../constants/bible_translations.dart';
import '../../features/reader/data/services/local_bible_service.dart';

class ApiBibleService {
  static const String defaultBaseUrl = 'https://rest.api.bible/v1';

  // Configurable API key (can be passed via environment or settings)
  final String? apiKey;
  final String baseUrl;

  ApiBibleService({
    this.apiKey,
    this.baseUrl = defaultBaseUrl,
  });

  // Standard 66 Canonical Books USFM Codes
  static const List<String> usfmCodes = [
    'GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA',
    '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO',
    'ECC', 'SNG', 'ISA', 'JER', 'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO',
    'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL', 'MAT',
    'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHP',
    'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS', '1PE',
    '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV'
  ];

  static String resolveBookCode(int bookNumber, [String? fallbackCode]) {
    if (bookNumber >= 1 && bookNumber <= usfmCodes.length) {
      return usfmCodes[bookNumber - 1];
    }
    if (fallbackCode != null && fallbackCode.isNotEmpty) {
      final clean = fallbackCode.toUpperCase().trim();
      if (usfmCodes.contains(clean)) return clean;
    }
    return 'GEN';
  }

  /// Checks if there is active internet connectivity
  Future<bool> checkInternetConnection() async {
    try {
      if (kIsWeb) {
        // On web, attempt a quick HEAD request or assume online
        return true;
      }
      final result = await InternetAddress.lookup('api.bible')
          .timeout(const Duration(seconds: 4));
      return result.isNotEmpty && result[0].rawAddress.isNotEmpty;
    } catch (_) {
      try {
        final result = await InternetAddress.lookup('google.com')
            .timeout(const Duration(seconds: 4));
        return result.isNotEmpty && result[0].rawAddress.isNotEmpty;
      } catch (_) {
        return false;
      }
    }
  }

  /// Fetches a chapter from API.Bible HTTP service
  Future<LocalBibleChapterResponse> fetchChapter({
    required String translationKey,
    required int bookNumber,
    required int chapterNumber,
    String? bookCode,
    String? bookName,
    String? activeApiKey,
  }) async {
    final config = BibleTranslationsCatalog.findById(translationKey);
    final bibleId = config.bibleId;

    if (bibleId == null || bibleId.isEmpty) {
      throw ArgumentError(
        'La versión "$translationKey" no tiene configurado un Bible ID para API.Bible.',
      );
    }

    final resolvedCode = resolveBookCode(bookNumber, bookCode);
    final chapterId = '$resolvedCode.$chapterNumber';

    final effectiveKey = activeApiKey ?? apiKey ?? '';
    final url = Uri.parse(
      '$baseUrl/bibles/$bibleId/chapters/$chapterId?content-type=json&include-verse-numbers=true&include-verse-spans=true',
    );

    final response = await http.get(
      url,
      headers: {
        'Accept': 'application/json',
        if (effectiveKey.isNotEmpty) 'api-key': effectiveKey,
      },
    ).timeout(const Duration(seconds: 12));

    if (response.statusCode != 200) {
      // If NVI returns 403 (unlicensed on standard API.Bible plan), fallback cleanly to NBLA
      if (response.statusCode == 403 && (translationKey == 'nvi' || bibleId == 'nvi')) {
        const nblaId = 'ce11b813f9a27e20-01';
        final fbUrl = Uri.parse(
          '$baseUrl/bibles/$nblaId/chapters/$chapterId?content-type=json&include-verse-numbers=true&include-verse-spans=true',
        );
        final fbResponse = await http.get(
          fbUrl,
          headers: {
            'Accept': 'application/json',
            if (effectiveKey.isNotEmpty) 'api-key': effectiveKey,
          },
        ).timeout(const Duration(seconds: 12));

        if (fbResponse.statusCode == 200) {
          final fbJsonMap = json.decode(utf8.decode(fbResponse.bodyBytes)) as Map<String, dynamic>;
          final fbData = fbJsonMap['data'] as Map<String, dynamic>?;
          if (fbData != null) {
            final rawContent = fbData['content'];
            final resolvedBookName = (fbData['reference'] as String?)?.split(' ')[0] ??
                bookName ??
                resolvedCode;
            final verses = _parseContent(
              rawContent,
              bookNumber,
              resolvedBookName,
              chapterNumber,
            );
            return LocalBibleChapterResponse(
              translation: 'Nueva Versión Internacional (NVI) [Equivalente NBLA]',
              abbreviation: 'NVI',
              bookNr: bookNumber,
              bookName: resolvedBookName,
              chapter: chapterNumber,
              name: '$resolvedBookName $chapterNumber',
              verses: verses,
            );
          }
        }
      }

      if (response.statusCode == 401) {
        throw StateError(
          'API.Bible requiere una clave válida (401 Unauthorized). '
          'Verifica la clave API o conéctate para descargar la versión.',
        );
      }
      throw StateError(
        'Error ${response.statusCode} al consultar API.Bible: ${response.body}',
      );
    }

    final jsonMap = json.decode(utf8.decode(response.bodyBytes)) as Map<String, dynamic>;
    final data = jsonMap['data'] as Map<String, dynamic>?;
    if (data == null) {
      throw StateError('Respuesta inesperada de API.Bible: formato inválido');
    }

    final rawContent = data['content'];
    final resolvedBookName = (data['reference'] as String?)?.split(' ')[0] ??
        bookName ??
        resolvedCode;

    final verses = _parseContent(
      rawContent,
      bookNumber,
      resolvedBookName,
      chapterNumber,
    );

    return LocalBibleChapterResponse(
      translation: config.name,
      abbreviation: config.abbreviation,
      bookNr: bookNumber,
      bookName: resolvedBookName,
      chapter: chapterNumber,
      name: '$resolvedBookName $chapterNumber',
      verses: verses,
    );
  }

  /// Robust parser supporting JSON AST, HTML spans, or formatted plain text from API.Bible
  List<LocalBibleVerseDto> _parseContent(
    dynamic content,
    int bookNr,
    String bookName,
    int chapter,
  ) {
    final List<LocalBibleVerseDto> verses = [];
    if (content == null) return verses;

    // 1. AST JSON list
    if (content is List) {
      int currentVerseNum = 0;
      final StringBuffer textBuf = StringBuffer();

      void traverse(List<dynamic> items) {
        for (final item in items) {
          if (item is! Map<String, dynamic>) continue;
          final name = item['name'];
          final attrs = item['attrs'];

          if (name == 'verse' && attrs is Map<String, dynamic>) {
            if (currentVerseNum > 0 && textBuf.isNotEmpty) {
              verses.add(LocalBibleVerseDto(
                chapter: chapter,
                verse: currentVerseNum,
                name: '$bookName $chapter:$currentVerseNum',
                text: textBuf.toString().replaceAll(RegExp(r'\s+'), ' ').trim(),
              ));
              textBuf.clear();
            }
            final rawNum = attrs['number'] ?? attrs['sid']?.toString().split(':').last;
            currentVerseNum = int.tryParse(rawNum?.toString() ?? '') ?? 0;
          } else if (item['type'] == 'text' && item['text'] is String) {
            textBuf.write(item['text']);
          } else if (item['items'] is List) {
            traverse(item['items'] as List<dynamic>);
          }
        }
      }

      traverse(content);
      if (currentVerseNum > 0 && textBuf.isNotEmpty) {
        verses.add(LocalBibleVerseDto(
          chapter: chapter,
          verse: currentVerseNum,
          name: '$bookName $chapter:$currentVerseNum',
          text: textBuf.toString().replaceAll(RegExp(r'\s+'), ' ').trim(),
        ));
      }

      if (verses.isNotEmpty) return verses;
    }

    // 2. String content (HTML or plain text)
    if (content is String) {
      // HTML format
      if (content.contains('<span') || content.contains('<p')) {
        final cleanHtml = content.replaceAll(RegExp(r'<span class="note"[^>]*>.*?</span>', dotAll: true), '');
        final regex = RegExp(r'<span[^>]*?(?:data-number="(\d+)"|class="v"[^>]*>(\d+))[^>]*>(?:(?:\d+)</span>)?([^<]+)');
        for (final match in regex.allMatches(cleanHtml)) {
          final numStr = match.group(1) ?? match.group(2) ?? '0';
          final text = match.group(3) ?? '';
          final vNum = int.tryParse(numStr) ?? 0;
          if (vNum > 0 && text.trim().isNotEmpty) {
            verses.add(LocalBibleVerseDto(
              chapter: chapter,
              verse: vNum,
              name: '$bookName $chapter:$vNum',
              text: text.replaceAll(RegExp(r'\s+'), ' ').trim(),
            ));
          }
        }
      }

      // Plain text fallback
      if (verses.isEmpty) {
        final textRegex = RegExp(r'(?:\[(\d+)\]|(?:\b|^)(\d+)\s+)([\s\S]*?)(?=(?:\[\d+\]|(?:\b\d+\s+)|$))');
        for (final match in textRegex.allMatches(content)) {
          final numStr = match.group(1) ?? match.group(2) ?? '0';
          final rawText = (match.group(3) ?? '')
              .replaceAll(RegExp(r'<[^>]*>'), '')
              .replaceAll(RegExp(r'\s+'), ' ')
              .trim();
          final vNum = int.tryParse(numStr) ?? 0;
          if (vNum > 0 && rawText.isNotEmpty) {
            verses.add(LocalBibleVerseDto(
              chapter: chapter,
              verse: vNum,
              name: '$bookName $chapter:$vNum',
              text: rawText,
            ));
          }
        }
      }
    }

    return verses;
  }
}
