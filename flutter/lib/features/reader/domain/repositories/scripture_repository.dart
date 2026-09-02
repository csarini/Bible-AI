import '../entities/verse_entity.dart';
import '../../data/services/local_bible_service.dart';

abstract class ScriptureRepository {
  Future<List<VerseEntity>> getChapter({
    required String translation,
    required int bookNumber,
    required int chapter,
    required String bookName,
    required String bookId,
  });
}

class ScriptureRepositoryImpl implements ScriptureRepository {
  final LocalBibleService _service;

  ScriptureRepositoryImpl({required LocalBibleService service})
      : _service = service;

  @override
  Future<List<VerseEntity>> getChapter({
    required String translation,
    required int bookNumber,
    required int chapter,
    required String bookName,
    required String bookId,
  }) async {
    final response = await _service.fetchChapter(
      translationKey: translation,
      chapterNumber: chapter,
      bookNumber: bookNumber,
      bookName: bookName,
      bookCode: bookId,
    );
    return response.verses
        .map((verse) => VerseEntity(
              text: verse.text,
              number: verse.verse,
              chapter: chapter,
              bookName: bookName,
              bookId: bookId,
            ))
        .toList();
  }
}
