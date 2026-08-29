import '../entities/verse_entity.dart';
import '../../data/services/getbible_service.dart';

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
  final GetBibleService _service;

  ScriptureRepositoryImpl({GetBibleService? service})
      : _service = service ?? GetBibleService();

  @override
  Future<List<VerseEntity>> getChapter({
    required String translation,
    required int bookNumber,
    required int chapter,
    required String bookName,
    required String bookId,
  }) {
    return _service.fetchChapter(
      translation: translation,
      bookNumber: bookNumber,
      chapter: chapter,
      bookName: bookName,
      bookId: bookId,
    );
  }
}
