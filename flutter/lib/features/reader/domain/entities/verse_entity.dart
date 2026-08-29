class VerseEntity {
  final int number;
  final String text;
  final String bookName;
  final String bookId;
  final int chapter;

  const VerseEntity({
    required this.number,
    required this.text,
    required this.bookName,
    required this.bookId,
    required this.chapter,
  });

  String get reference => '$bookName $chapter:$number';

  VerseEntity copyWith({
    int? number,
    String? text,
    String? bookName,
    String? bookId,
    int? chapter,
  }) {
    return VerseEntity(
      number: number ?? this.number,
      text: text ?? this.text,
      bookName: bookName ?? this.bookName,
      bookId: bookId ?? this.bookId,
      chapter: chapter ?? this.chapter,
    );
  }
}
