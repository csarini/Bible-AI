import 'dart:convert';

import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:biblia_inteligente/core/storage/app_database.dart';
import 'package:biblia_inteligente/core/utils/string_utils.dart';
import 'package:biblia_inteligente/features/reader/domain/services/sanctuary_search_service.dart';

void main() {
  test('normaliza mayúsculas, acentos y espacios', () {
    expect(normalizeSearchText('  ÉXODO  '), 'exodo');
    expect(normalizeSearchText('  Espíritu   Santo '), 'espiritu santo');
  });

  test('clasifica referencias directas con capítulo y versículo', () {
    final result = SanctuarySearchService().parse('Juan 3:16');

    expect(result.type, SearchType.directReference);
    expect(result.bookName, 'Juan');
    expect(result.chapter, 3);
    expect(result.verse, 16);
  });

  test('encuentra versículos localmente sin sensibilidad a acentos', () async {
    final database = AppDatabase(NativeDatabase.memory());
    addTearDown(database.close);

    await database.saveChapter(
      translationKey: 'valera',
      bookNumber: 43,
      bookCode: 'JHN',
      bookName: 'Juan',
      chapter: 3,
      versesJson: jsonEncode([
        {'verse': 16, 'text': 'Porque de tal manera amó Dios al mundo.'},
      ]),
      verseCount: 1,
    );

    final results = await database.searchVersesByKeyword('AMO');

    expect(results, hasLength(1));
    expect(results.single.chapter, 3);
    expect(results.single.verse, 16);
  });
}
