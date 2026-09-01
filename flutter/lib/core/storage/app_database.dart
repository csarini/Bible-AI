import 'dart:io';
import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;

part 'app_database.g.dart';

// =============================================================================
// TABLE DEFINITIONS
// =============================================================================

@DataClassName('LocalBookmarkEntry')
class LocalBookmarks extends Table {
  TextColumn get id => text()();
  TextColumn get bookId => text().named('book_id')();
  TextColumn get bookName => text().named('book_name')();
  IntColumn get chapter => integer()();
  IntColumn get verse => integer()();
  TextColumn get verseText => text().named('verse_text')();
  TextColumn get colorHex => text().named('color_hex')();
  TextColumn get customTitle => text().nullable().named('custom_title')();
  TextColumn get personalNote => text().nullable().named('personal_note')();
  BoolColumn get isSynced => boolean().withDefault(const Constant(false)).named('is_synced')();
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime).named('created_at')();

  @override
  Set<Column> get primaryKey => {id};
}

@DataClassName('EventCategoryEntry')
class EventCategories extends Table {
  TextColumn get id => text()();
  TextColumn get name => text()();
  TextColumn get colorHex => text().named('color_hex')();
  TextColumn get iconName => text().named('icon_name')();
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime).named('created_at')();

  @override
  Set<Column> get primaryKey => {id};
}

@DataClassName('UserEventEntry')
class UserEvents extends Table {
  TextColumn get id => text()();
  TextColumn get categoryId => text().named('category_id').references(EventCategories, #id)();
  TextColumn get title => text()();
  TextColumn get description => text()();
  TextColumn get linkedVersesJson => text().withDefault(const Constant('[]')).named('linked_verses_json')();
  DateTimeColumn get eventDate => dateTime().named('event_date')();
  BoolColumn get hasFoodService => boolean().withDefault(const Constant(false)).named('has_food_service')();
  TextColumn get foodServiceDetails => text().nullable().named('food_service_details')();
  BoolColumn get hasChildCare => boolean().withDefault(const Constant(false)).named('has_child_care')();
  BoolColumn get hasBookSales => boolean().withDefault(const Constant(false)).named('has_book_sales')();
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime).named('created_at')();

  @override
  Set<Column> get primaryKey => {id};
}

@DataClassName('FoodCourtMenuEntry')
class FoodCourtMenus extends Table {
  TextColumn get id => text()();
  TextColumn get churchId => text().withDefault(const Constant('default_church')).named('church_id')();
  TextColumn get title => text()();
  TextColumn get description => text()();
  RealColumn get price => real()();
  TextColumn get shift => text()(); // 'day', 'night', 'both'
  BoolColumn get isAvailable => boolean().withDefault(const Constant(true)).named('is_available')();
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime).named('created_at')();

  @override
  Set<Column> get primaryKey => {id};
}

// =============================================================================
// DRIFT DATABASE & CRUD OPERATIONS
// =============================================================================

@DriftDatabase(tables: [LocalBookmarks, EventCategories, UserEvents, FoodCourtMenus])
class AppDatabase extends _$AppDatabase {
  AppDatabase([QueryExecutor? e]) : super(e ?? _openConnection());

  @override
  int get schemaVersion => 1;

  @override
  MigrationStrategy get migration => MigrationStrategy(
    onCreate: (Migrator m) async {
      await m.createAll();
      // Baseline Church Categories
      await batch((b) {
        b.insertAll(eventCategories, [
          EventCategoriesCompanion.insert(
            id: 'cat_predica',
            name: 'Prédicas Dominicales',
            colorHex: '#002147',
            iconName: 'book-open',
          ),
          EventCategoriesCompanion.insert(
            id: 'cat_devocional',
            name: 'Devocionales & Oración',
            colorHex: '#00A3E0',
            iconName: 'sun',
          ),
          EventCategoriesCompanion.insert(
            id: 'cat_matrimonios',
            name: 'Reunión de Matrimonios',
            colorHex: '#F47B20',
            iconName: 'heart',
          ),
          EventCategoriesCompanion.insert(
            id: 'cat_jovenes',
            name: 'Reunión de Jóvenes',
            colorHex: '#10B981',
            iconName: 'users',
          ),
        ]);
      });
    },
  );

  // ---------------------------------------------------------------------------
  // BOOKMARKS & NOTES CRUD
  // ---------------------------------------------------------------------------
  Future<List<LocalBookmarkEntry>> getAllBookmarks() {
    return (select(localBookmarks)
          ..orderBy([(t) => OrderingTerm(expression: t.createdAt, mode: OrderingMode.desc)]))
        .get();
  }

  Stream<List<LocalBookmarkEntry>> watchAllBookmarks() {
    return (select(localBookmarks)
          ..orderBy([(t) => OrderingTerm(expression: t.createdAt, mode: OrderingMode.desc)]))
        .watch();
  }

  Stream<List<LocalBookmarkEntry>> watchBookmarksForChapter(String bookId, int chapter) {
    return (select(localBookmarks)
          ..where((t) => t.bookId.equals(bookId) & t.chapter.equals(chapter)))
        .watch();
  }

  Future<List<LocalBookmarkEntry>> getBookmarksForChapter(String bookId, int chapter) {
    return (select(localBookmarks)
          ..where((t) => t.bookId.equals(bookId) & t.chapter.equals(chapter)))
        .get();
  }

  Future<LocalBookmarkEntry?> getBookmark(String bookId, int chapter, int verse) {
    return (select(localBookmarks)
          ..where((t) =>
              t.bookId.equals(bookId) &
              t.chapter.equals(chapter) &
              t.verse.equals(verse)))
        .getSingleOrNull();
  }

  Future<int> insertOrUpdateBookmark(LocalBookmarksCompanion entry) {
    return into(localBookmarks).insertOnConflictUpdate(entry);
  }

  Future<int> deleteBookmark(String id) {
    return (delete(localBookmarks)..where((t) => t.id.equals(id))).go();
  }

  Future<int> deleteBookmarkByVerse(String bookId, int chapter, int verse) {
    return (delete(localBookmarks)
          ..where((t) => t.bookId.equals(bookId) & t.chapter.equals(chapter) & t.verse.equals(verse)))
        .go();
  }

  // ---------------------------------------------------------------------------
  // EVENT CATEGORIES CRUD
  // ---------------------------------------------------------------------------
  Stream<List<EventCategoryEntry>> watchAllCategories() {
    return (select(eventCategories)..orderBy([(t) => OrderingTerm(expression: t.name)])).watch();
  }

  Future<List<EventCategoryEntry>> getAllCategories() {
    return (select(eventCategories)..orderBy([(t) => OrderingTerm(expression: t.name)])).get();
  }

  Future<int> insertCategory(EventCategoriesCompanion entry) {
    return into(eventCategories).insertOnConflictUpdate(entry);
  }

  Future<int> deleteCategory(String id) {
    return (delete(eventCategories)..where((t) => t.id.equals(id))).go();
  }

  // ---------------------------------------------------------------------------
  // USER EVENTS CRUD
  // ---------------------------------------------------------------------------
  Stream<List<UserEventEntry>> watchAllEvents() {
    return (select(userEvents)
          ..orderBy([(t) => OrderingTerm(expression: t.eventDate, mode: OrderingMode.desc)]))
        .watch();
  }

  Stream<List<UserEventEntry>> watchEventsByCategory(String categoryId) {
    return (select(userEvents)
          ..where((t) => t.categoryId.equals(categoryId))
          ..orderBy([(t) => OrderingTerm(expression: t.eventDate, mode: OrderingMode.desc)]))
        .watch();
  }

  Future<int> insertOrUpdateEvent(UserEventsCompanion entry) {
    return into(userEvents).insertOnConflictUpdate(entry);
  }

  Future<int> deleteEvent(String id) {
    return (delete(userEvents)..where((t) => t.id.equals(id))).go();
  }

  // ---------------------------------------------------------------------------
  // FOOD COURT MENUS CRUD
  // ---------------------------------------------------------------------------
  Stream<List<FoodCourtMenuEntry>> watchAvailableMenus() {
    return (select(foodCourtMenus)
          ..where((t) => t.isAvailable.equals(true))
          ..orderBy([(t) => OrderingTerm(expression: t.createdAt, mode: OrderingMode.desc)]))
        .watch();
  }

  Future<int> insertOrUpdateMenu(FoodCourtMenusCompanion entry) {
    return into(foodCourtMenus).insertOnConflictUpdate(entry);
  }

  Future<int> deleteMenu(String id) {
    return (delete(foodCourtMenus)..where((t) => t.id.equals(id))).go();
  }
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dbFolder = await getApplicationDocumentsDirectory();
    final file = File(p.join(dbFolder.path, 'digital_sanctuary.sqlite'));
    return NativeDatabase.createInBackground(file);
  });
}
