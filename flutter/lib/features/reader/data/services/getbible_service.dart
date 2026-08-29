import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../domain/entities/verse_entity.dart';

/// Service responsible for fetching canonical scriptures from GetBible.net v2 API
class GetBibleService {
  final http.Client _client;
  static const String _baseUrl = 'https://api.getbible.net/v2';

  GetBibleService({http.Client? client}) : _client = client ?? http.Client();

  /// Fetches a full chapter from GetBible.net (Reina-Valera 1909 translation: 'rv1909')
  Future<List<VerseEntity>> fetchChapter({
    required String translation,
    required int bookNumber,
    required int chapter,
    required String bookName,
    required String bookId,
  }) async {
    final uri = Uri.parse('$_baseUrl/$translation/$bookNumber/$chapter.json');

    try {
      final response = await _client.get(
        uri,
        headers: {'Accept': 'application/json'},
      ).timeout(const Duration(seconds: 12));

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(utf8.decode(response.bodyBytes));
        final List<dynamic> versesJson = data['verses'] ?? [];

        return versesJson.map<VerseEntity>((v) {
          return VerseEntity(
            number: v['verse'] as int,
            text: (v['text'] as String).trim(),
            bookName: bookName,
            bookId: bookId,
            chapter: chapter,
          );
        }).toList();
      } else {
        throw Exception('GetBible error ${response.statusCode}: No se pudo cargar el capítulo.');
      }
    } catch (e) {
      throw Exception('Fallo de conexión al cargar las Sagradas Escrituras: $e');
    }
  }
}
