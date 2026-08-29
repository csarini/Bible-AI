import 'dart:io';
import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;

part 'app_database.g.dart';

@DataClassName('LocalBookmarkData')
class LocalBookmarks extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get bookId => text().withLength(min: 1, max: 10)();
  TextColumn get bookName => text().withLength(min: 1, max: 80)();
  IntColumn get chapter => integer()();
  IntColumn get verse => integer()();
  TextColumn get verseText => text()();
  TextColumn get colorHex => text().withDefault(const Constant('#FFF2B2'))();
  TextColumn get customTitle => text().nullable()();
  TextColumn get personalNote => text().nullable()();
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
  DateTimeColumn get updatedAt => dateTime().withDefault(currentDateAndTime)();
}

@DriftDatabase(tables: [LocalBookmarks])
class AppDatabase extends _$AppDatabase {
  AppDatabase([QueryExecutor? e]) : super(e ?? _openConnection());

  @override
  int get schemaVersion => 1;

  // --- Reactive & Stream Queries ---

  Stream<List<LocalBookmarkData>> watchAllBookmarks() {
    return (select(localBookmarks)
          ..orderBy([(t) => OrderingTerm(expression: t.createdAt, mode: OrderingMode.desc)]))
        .watch();
  }

  Future<LocalBookmarkData?> getBookmark(String bookId, int chapter, int verse) {
    return (select(localBookmarks)
          ..where((t) =>
              t.bookId.equals(bookId) &
              t.chapter.equals(chapter) &
              t.verse.equals(verse)))
        .getSingleOrNull();
  }

  Future<int> insertOrUpdateBookmark({
    required String bookId,
    required String bookName,
    required int chapter,
    required int verse,
    required String verseText,
    required String colorHex,
    String? customTitle,
    String? personalNote,
  }) async {
    final existing = await getBookmark(bookId, chapter, verse);
    if (existing != null) {
      return (update(localBookmarks)..where((t) => t.id.equals(existing.id))).write(
        LocalBookmarksCompanion(
          colorHex: Value(colorHex),
          customTitle: Value(customTitle),
          personalNote: Value(personalNote),
          updatedAt: Value(DateTime.now()),
        ),
      );
    } else {
      return into(localBookmarks).insert(
        LocalBookmarksCompanion.insert(
          bookId: bookId,
          bookName: bookName,
          chapter: chapter,
          verse: verse,
          verseText: verseText,
          colorHex: Value(colorHex),
          customTitle: Value(customTitle),
          personalNote: Value(personalNote),
        ),
      );
    }
  }

  Future<int> deleteBookmark(int id) {
    return (delete(localBookmarks)..where((t) => t.id.equals(id))).go();
  }
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dbFolder = await getApplicationDocumentsDirectory();
    final file = File(p.join(dbFolder.path, 'digital_sanctuary.sqlite'));
    return NativeDatabase.createInBackground(file);
  });
}
