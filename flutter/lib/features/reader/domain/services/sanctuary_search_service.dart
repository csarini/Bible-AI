import '../../../../core/constants/bible_books.dart';
import '../../../../core/utils/string_utils.dart';

enum SearchType { directReference, bookName, keyword }

class SearchResultParsed {
  const SearchResultParsed({
    required this.type,
    required this.bookName,
    this.chapter,
    this.verse,
  });

  final SearchType type;
  final String bookName;
  final int? chapter;
  final int? verse;
}

/// Classifies one search-bar value without touching the UI or database.
class SanctuarySearchService {
  static final RegExp _directReference = RegExp(
    r'^((?:\d\s+)?[a-zA-ZáéíóúÁÉÍÓÚñÑ]+(?:\s+[a-zA-ZáéíóúÁÉÍÓÚñÑ]+)?)\s+(\d+)(?::(\d+))?$',
  );

  SearchResultParsed parse(String input,
      {List<BibleBookInfo> books = const []}) {
    final query = input.trim();
    if (query.isEmpty) {
      return const SearchResultParsed(type: SearchType.keyword, bookName: '');
    }

    final match = _directReference.firstMatch(query);
    if (match != null) {
      return SearchResultParsed(
        type: SearchType.directReference,
        bookName: match.group(1)!.trim(),
        chapter: int.parse(match.group(2)!),
        verse: match.group(3) == null ? null : int.parse(match.group(3)!),
      );
    }

    final normalizedQuery = normalizeSearchText(query);
    final isBookName = books.any((book) {
      final name = normalizeSearchText(book.name);
      final abbreviation = normalizeSearchText(book.abbreviation);
      return name.startsWith(normalizedQuery) ||
          abbreviation.startsWith(normalizedQuery);
    });

    return SearchResultParsed(
      type: isBookName ? SearchType.bookName : SearchType.keyword,
      bookName: query,
    );
  }
}
