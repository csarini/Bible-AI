import 'dart:convert';
import 'dart:io';
import 'package:flutter/services.dart' show rootBundle;
import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import '../constants/bible_books.dart';

part 'app_database.g.dart';

// =============================================================================
// TABLE DEFINITIONS
// =============================================================================

@DataClassName('BibleBookEntry')
class LocalBibleBooks extends Table {
  TextColumn get id => text()(); // e.g. 'valera_1', 'sse_40'
  TextColumn get translationKey =>
      text().named('translation_key')(); // 'valera', 'sse', 'rv1858'
  IntColumn get bookNumber => integer().named('book_number')(); // 1..66
  TextColumn get bookCode => text().named('book_code')(); // 'GEN', 'MAT', etc.
  TextColumn get name => text()(); // 'Génesis', 'San Mateo'
  IntColumn get totalChapters => integer().named('total_chapters')();
  BoolColumn get isNewTestament =>
      boolean().withDefault(const Constant(false)).named('is_new_testament')();
  TextColumn get url => text().nullable()();
  TextColumn get sha => text().nullable()();
  DateTimeColumn get createdAt =>
      dateTime().withDefault(currentDateAndTime).named('created_at')();

  @override
  Set<Column> get primaryKey => {id};
}

@DataClassName('BibleTranslationEntry')
class LocalBibleTranslations extends Table {
  TextColumn get id => text()(); // 'valera', 'sse', 'rv1858'
  TextColumn get name => text()(); // 'Reina Valera (1909)'
  TextColumn get abbreviation => text()(); // 'valera'
  TextColumn get description => text().nullable()();
  TextColumn get language => text().withDefault(const Constant('Spanish'))();
  TextColumn get direction => text().withDefault(const Constant('LTR'))();
  TextColumn get distributionAbbreviation =>
      text().nullable().named('distribution_abbreviation')();
  TextColumn get url => text().nullable()();
  DateTimeColumn get createdAt =>
      dateTime().withDefault(currentDateAndTime).named('created_at')();

  @override
  Set<Column> get primaryKey => {id};
}

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
  BoolColumn get isSynced =>
      boolean().withDefault(const Constant(false)).named('is_synced')();
  DateTimeColumn get createdAt =>
      dateTime().withDefault(currentDateAndTime).named('created_at')();

  @override
  Set<Column> get primaryKey => {id};
}

@DataClassName('EventCategoryEntry')
class EventCategories extends Table {
  TextColumn get id => text()();
  TextColumn get name => text()();
  TextColumn get colorHex => text().named('color_hex')();
  TextColumn get iconName => text().named('icon_name')();
  DateTimeColumn get createdAt =>
      dateTime().withDefault(currentDateAndTime).named('created_at')();

  @override
  Set<Column> get primaryKey => {id};
}

@DataClassName('UserEventEntry')
class UserEvents extends Table {
  TextColumn get id => text()();
  TextColumn get categoryId =>
      text().named('category_id').references(EventCategories, #id)();
  TextColumn get title => text()();
  TextColumn get description => text()();
  TextColumn get linkedVersesJson =>
      text().withDefault(const Constant('[]')).named('linked_verses_json')();
  DateTimeColumn get eventDate => dateTime().named('event_date')();
  BoolColumn get hasFoodService =>
      boolean().withDefault(const Constant(false)).named('has_food_service')();
  TextColumn get foodServiceDetails =>
      text().nullable().named('food_service_details')();
  BoolColumn get hasChildCare =>
      boolean().withDefault(const Constant(false)).named('has_child_care')();
  BoolColumn get hasBookSales =>
      boolean().withDefault(const Constant(false)).named('has_book_sales')();
  DateTimeColumn get createdAt =>
      dateTime().withDefault(currentDateAndTime).named('created_at')();

  @override
  Set<Column> get primaryKey => {id};
}

@DataClassName('FoodCourtMenuEntry')
class FoodCourtMenus extends Table {
  TextColumn get id => text()();
  TextColumn get churchId =>
      text().withDefault(const Constant('default_church')).named('church_id')();
  TextColumn get title => text()();
  TextColumn get description => text()();
  RealColumn get price => real()();
  TextColumn get shift => text()(); // 'day', 'night', 'both'
  BoolColumn get isAvailable =>
      boolean().withDefault(const Constant(true)).named('is_available')();
  DateTimeColumn get createdAt =>
      dateTime().withDefault(currentDateAndTime).named('created_at')();

  @override
  Set<Column> get primaryKey => {id};
}

@DataClassName('BibleChapterEntry')
class LocalBibleChapters extends Table {
  TextColumn get id => text()(); // e.g. 'valera_40_1' or 'rv1858_1_1'
  TextColumn get translationKey => text().named('translation_key')();
  IntColumn get bookNumber => integer().named('book_number')();
  TextColumn get bookCode => text().named('book_code')();
  TextColumn get bookName => text().named('book_name')();
  IntColumn get chapter => integer()();
  TextColumn get versesJson => text().named('verses_json')();
  IntColumn get verseCount =>
      integer().withDefault(const Constant(0)).named('verse_count')();
  DateTimeColumn get createdAt =>
      dateTime().withDefault(currentDateAndTime).named('created_at')();

  @override
  Set<Column> get primaryKey => {id};
}

@DataClassName('LocalUserEntry')
class LocalUsers extends Table {
  TextColumn get id => text()();
  TextColumn get authType => text().named('auth_type')();
  TextColumn get email => text().nullable()();
  TextColumn get remoteUserId => text().nullable().named('remote_user_id')();
  TextColumn get displayName => text().nullable().named('display_name')();
  DateTimeColumn get createdAt =>
      dateTime().withDefault(currentDateAndTime).named('created_at')();
  DateTimeColumn get lastSeenAt =>
      dateTime().withDefault(currentDateAndTime).named('last_seen_at')();

  @override
  Set<Column> get primaryKey => {id};
}

@DataClassName('UserPreferenceEntry')
class UserPreferences extends Table {
  TextColumn get userId => text().named('user_id')();
  TextColumn get key => text()();
  TextColumn get value => text()();

  @override
  Set<Column> get primaryKey => {userId, key};
}

// =============================================================================
// DRIFT DATABASE & CRUD OPERATIONS
// =============================================================================

@DriftDatabase(tables: [
  LocalBookmarks,
  EventCategories,
  UserEvents,
  FoodCourtMenus,
  LocalBibleBooks,
  LocalBibleTranslations,
  LocalBibleChapters,
  LocalUsers,
  UserPreferences,
])
class AppDatabase extends _$AppDatabase {
  AppDatabase([QueryExecutor? e]) : super(e ?? _openConnection());

  @override
  int get schemaVersion => 2;

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
        onUpgrade: (Migrator m, int from, int to) async {
          if (from < 2) {
            await m.createTable(localUsers);
            await m.createTable(userPreferences);
          }
        },
        beforeOpen: (details) async {
          await customStatement('PRAGMA foreign_keys = ON');
        },
      );

  Future<LocalUserEntry?> getUser(String id) {
    return (select(localUsers)..where((t) => t.id.equals(id)))
        .getSingleOrNull();
  }

  Future<LocalUserEntry?> getGuestUser() {
    return (select(localUsers)..where((t) => t.authType.equals('guest')))
        .getSingleOrNull();
  }

  Future<void> saveUser(LocalUsersCompanion user) async {
    await into(localUsers).insertOnConflictUpdate(user);
  }

  Future<void> touchUser(String id) async {
    await (update(localUsers)..where((t) => t.id.equals(id))).write(
      LocalUsersCompanion(lastSeenAt: Value(DateTime.now())),
    );
  }

  Future<Map<String, String>> getUserPreferences(String userId) async {
    final entries = await (select(userPreferences)
          ..where((t) => t.userId.equals(userId)))
        .get();
    return {for (final entry in entries) entry.key: entry.value};
  }

  Future<void> saveUserPreference({
    required String userId,
    required String key,
    required String value,
  }) async {
    await into(userPreferences).insertOnConflictUpdate(
      UserPreferencesCompanion.insert(
        userId: userId,
        key: key,
        value: value,
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // BIBLE BOOKS & TRANSLATIONS CRUD & SEEDING
  // ---------------------------------------------------------------------------
  Stream<List<BibleBookEntry>> watchBooksByTranslation(String translationKey) {
    return (select(localBibleBooks)
          ..where((t) => t.translationKey.equals(translationKey))
          ..orderBy([(t) => OrderingTerm(expression: t.bookNumber)]))
        .watch();
  }

  Future<List<BibleBookEntry>> getBooksByTranslation(String translationKey) {
    return (select(localBibleBooks)
          ..where((t) => t.translationKey.equals(translationKey))
          ..orderBy([(t) => OrderingTerm(expression: t.bookNumber)]))
        .get();
  }

  Future<List<BibleBookEntry>> getAllBibleBooks() {
    return (select(localBibleBooks)
          ..orderBy([(t) => OrderingTerm(expression: t.bookNumber)]))
        .get();
  }

  Future<BibleBookEntry?> getBookByCode(
      String translationKey, String bookCode) {
    return (select(localBibleBooks)
          ..where((t) =>
              t.translationKey.equals(translationKey) &
              t.bookCode.equals(bookCode)))
        .getSingleOrNull();
  }

  Future<BibleBookEntry?> getBookByNumber(
      String translationKey, int bookNumber) {
    return (select(localBibleBooks)
          ..where((t) =>
              t.translationKey.equals(translationKey) &
              t.bookNumber.equals(bookNumber)))
        .getSingleOrNull();
  }

  Stream<List<BibleTranslationEntry>> watchAllTranslations() {
    return (select(localBibleTranslations)
          ..orderBy([(t) => OrderingTerm(expression: t.name)]))
        .watch();
  }

  Future<List<BibleTranslationEntry>> getAllTranslations() {
    return (select(localBibleTranslations)
          ..orderBy([(t) => OrderingTerm(expression: t.name)]))
        .get();
  }

  Future<void> ensureBibleDataSeeded() async {
    try {
      final existingBooks = await (select(localBibleBooks)..limit(1)).get();
      if (existingBooks.isNotEmpty) {
        return; // Already populated
      }

      // 1. Seed Translations Catalog from assets/data/translations_catalog.json
      try {
        final catalogString = await rootBundle
            .loadString('assets/data/translations_catalog.json');
        final catalogJson = json.decode(catalogString) as Map<String, dynamic>;

        final translationsList = <LocalBibleTranslationsCompanion>[];
        catalogJson.forEach((key, val) {
          if (val is Map<String, dynamic>) {
            translationsList.add(LocalBibleTranslationsCompanion.insert(
              id: key,
              name: val['translation'] as String? ?? key,
              abbreviation: val['abbreviation'] as String? ?? key,
              description: Value(val['description'] as String?),
              language: Value(val['language'] as String? ?? 'Spanish'),
              direction: Value(val['direction'] as String? ?? 'LTR'),
              distributionAbbreviation:
                  Value(val['distribution_abbreviation'] as String?),
              url: Value(val['url'] as String?),
            ));
          }
        });

        if (translationsList.isNotEmpty) {
          await batch((b) {
            b.insertAllOnConflictUpdate(
                localBibleTranslations, translationsList);
          });
        }
      } catch (e) {
        // Log error silently and continue with books
      }

      // 2. Seed Books for each available translation from assets/data/books_*.json
      final translationFiles = {
        'valera': 'assets/data/books_valera.json',
        'sse': 'assets/data/books_sse.json',
        'rv1858': 'assets/data/books_rv1858.json',
      };

      final allBooksToInsert = <LocalBibleBooksCompanion>[];

      for (final entry in translationFiles.entries) {
        final transKey = entry.key;
        final assetPath = entry.value;

        try {
          final booksString = await rootBundle.loadString(assetPath);
          final booksJson = json.decode(booksString) as Map<String, dynamic>;

          booksJson.forEach((key, val) {
            if (val is Map<String, dynamic>) {
              final nr = val['nr'] as int? ?? int.tryParse(key) ?? 1;
              final name = val['name'] as String? ?? '';
              final meta = kCanonicalBookMetadata[nr] ??
                  (code: 'BK$nr', chapters: 1, isNT: nr >= 40);

              allBooksToInsert.add(LocalBibleBooksCompanion.insert(
                id: '${transKey}_$nr',
                translationKey: transKey,
                bookNumber: nr,
                bookCode: meta.code,
                name: name,
                totalChapters: meta.chapters,
                isNewTestament: Value(meta.isNT),
                url: Value(val['url'] as String?),
                sha: Value(val['sha'] as String?),
              ));
            }
          });
        } catch (e) {
          // Continue to next translation file if any issue
        }
      }

      if (allBooksToInsert.isNotEmpty) {
        await batch((b) {
          b.insertAllOnConflictUpdate(localBibleBooks, allBooksToInsert);
        });
      }
    } catch (e) {
      // General safety catch
    }
  }

  // ---------------------------------------------------------------------------
  // BIBLE CHAPTERS & VERSES LOCAL STORAGE (OFFLINE CACHE)
  // ---------------------------------------------------------------------------
  Future<BibleChapterEntry?> getChapter(
    String translationKey,
    int bookNumber,
    int chapter,
  ) {
    return (select(localBibleChapters)
          ..where((t) =>
              t.translationKey.equals(translationKey) &
              t.bookNumber.equals(bookNumber) &
              t.chapter.equals(chapter)))
        .getSingleOrNull();
  }

  Stream<BibleChapterEntry?> watchChapter(
    String translationKey,
    int bookNumber,
    int chapter,
  ) {
    return (select(localBibleChapters)
          ..where((t) =>
              t.translationKey.equals(translationKey) &
              t.bookNumber.equals(bookNumber) &
              t.chapter.equals(chapter)))
        .watchSingleOrNull();
  }

  Future<bool> hasChapter(
    String translationKey,
    int bookNumber,
    int chapter,
  ) async {
    final entry = await getChapter(translationKey, bookNumber, chapter);
    return entry != null && entry.versesJson.isNotEmpty;
  }

  Future<int> saveChapter({
    required String translationKey,
    required int bookNumber,
    required String bookCode,
    required String bookName,
    required int chapter,
    required String versesJson,
    required int verseCount,
  }) {
    final id = '${translationKey}_${bookNumber}_$chapter';
    return into(localBibleChapters).insertOnConflictUpdate(
      LocalBibleChaptersCompanion.insert(
        id: id,
        translationKey: translationKey,
        bookNumber: bookNumber,
        bookCode: bookCode,
        bookName: bookName,
        chapter: chapter,
        versesJson: versesJson,
        verseCount: Value(verseCount),
      ),
    );
  }

  Future<void> saveChaptersBatch(
      List<LocalBibleChaptersCompanion> chaptersList) async {
    if (chaptersList.isEmpty) return;
    await batch((b) {
      b.insertAllOnConflictUpdate(localBibleChapters, chaptersList);
    });
  }

  Future<int> countStoredChapters([String? translationKey]) async {
    final countExp = localBibleChapters.id.count();
    final query = selectOnly(localBibleChapters)..addColumns([countExp]);
    if (translationKey != null && translationKey.isNotEmpty) {
      query.where(localBibleChapters.translationKey.equals(translationKey));
    }
    final result = await query.getSingle();
    return result.read(countExp) ?? 0;
  }

  Future<bool> isBibleDataImported() async {
    final count = await countStoredChapters();
    // 66 books * chapters (1189) across 3 translations is ~3567 chapters
    // If we have at least 1189 chapters stored, Bible is imported.
    return count >= 1189;
  }

  Stream<int> watchStoredChaptersCount([String? translationKey]) {
    final countExp = localBibleChapters.id.count();
    final query = selectOnly(localBibleChapters)..addColumns([countExp]);
    if (translationKey != null && translationKey.isNotEmpty) {
      query.where(localBibleChapters.translationKey.equals(translationKey));
    }
    return query.watchSingle().map((row) => row.read(countExp) ?? 0);
  }

  // ---------------------------------------------------------------------------
  // BOOKMARKS & NOTES CRUD
  // ---------------------------------------------------------------------------
  Future<List<LocalBookmarkEntry>> getAllBookmarks() {
    return (select(localBookmarks)
          ..orderBy([
            (t) =>
                OrderingTerm(expression: t.createdAt, mode: OrderingMode.desc)
          ]))
        .get();
  }

  Stream<List<LocalBookmarkEntry>> watchAllBookmarks() {
    return (select(localBookmarks)
          ..orderBy([
            (t) =>
                OrderingTerm(expression: t.createdAt, mode: OrderingMode.desc)
          ]))
        .watch();
  }

  Stream<List<LocalBookmarkEntry>> watchBookmarksForChapter(
      String bookId, int chapter) {
    return (select(localBookmarks)
          ..where((t) => t.bookId.equals(bookId) & t.chapter.equals(chapter)))
        .watch();
  }

  Future<List<LocalBookmarkEntry>> getBookmarksForChapter(
      String bookId, int chapter) {
    return (select(localBookmarks)
          ..where((t) => t.bookId.equals(bookId) & t.chapter.equals(chapter)))
        .get();
  }

  Future<LocalBookmarkEntry?> getBookmark(
      String bookId, int chapter, int verse) {
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

  Future<int> saveBookmark({
    required String bookId,
    String? bookName,
    required int chapter,
    required int verse,
    required String verseText,
    String colorHex = '#FED65B',
    String? customTitle,
    String? personalNote,
  }) {
    final id = '${bookId}_${chapter}_$verse';
    final resolvedBookName = bookName ?? bookId;
    return into(localBookmarks).insertOnConflictUpdate(
      LocalBookmarksCompanion(
        id: Value(id),
        bookId: Value(bookId),
        bookName: Value(resolvedBookName),
        chapter: Value(chapter),
        verse: Value(verse),
        verseText: Value(verseText),
        colorHex: Value(colorHex),
        customTitle: Value<String?>(customTitle),
        personalNote: Value<String?>(personalNote),
        createdAt: Value(DateTime.now()),
      ),
    );
  }

  Future<int> deleteBookmark(String id) {
    return (delete(localBookmarks)..where((t) => t.id.equals(id))).go();
  }

  Future<int> deleteBookmarkByVerse(String bookId, int chapter, int verse) {
    return (delete(localBookmarks)
          ..where((t) =>
              t.bookId.equals(bookId) &
              t.chapter.equals(chapter) &
              t.verse.equals(verse)))
        .go();
  }

  // ---------------------------------------------------------------------------
  // EVENT CATEGORIES CRUD
  // ---------------------------------------------------------------------------
  Stream<List<EventCategoryEntry>> watchAllCategories() {
    return (select(eventCategories)
          ..orderBy([(t) => OrderingTerm(expression: t.name)]))
        .watch();
  }

  Future<List<EventCategoryEntry>> getAllCategories() {
    return (select(eventCategories)
          ..orderBy([(t) => OrderingTerm(expression: t.name)]))
        .get();
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
          ..orderBy([
            (t) =>
                OrderingTerm(expression: t.eventDate, mode: OrderingMode.desc)
          ]))
        .watch();
  }

  Stream<List<UserEventEntry>> watchEventsByCategory(String categoryId) {
    return (select(userEvents)
          ..where((t) => t.categoryId.equals(categoryId))
          ..orderBy([
            (t) =>
                OrderingTerm(expression: t.eventDate, mode: OrderingMode.desc)
          ]))
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
          ..orderBy([
            (t) =>
                OrderingTerm(expression: t.createdAt, mode: OrderingMode.desc)
          ]))
        .watch();
  }

  Future<int> insertOrUpdateMenu(FoodCourtMenusCompanion entry) {
    return into(foodCourtMenus).insertOnConflictUpdate(entry);
  }

  Future<int> deleteMenu(String id) {
    return (delete(foodCourtMenus)..where((t) => t.id.equals(id))).go();
  }

  // ---------------------------------------------------------------------------
  // APP SETTINGS & USER PREFERENCES (PERSISTED IN SQLITE)
  // ---------------------------------------------------------------------------
  Future<void> initSettingsTable() async {
    await customStatement('''
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    ''');
  }

  Future<void> saveSetting(String key, String value) async {
    try {
      await initSettingsTable();
      await customStatement('''
        INSERT INTO app_settings (key, value) VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value;
      ''', [key, value]);
    } catch (e) {
      // Fallback in case table or migration needs creation
      await customStatement('CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);');
      await customStatement('REPLACE INTO app_settings (key, value) VALUES (?, ?);', [key, value]);
    }
  }

  Future<String?> getSetting(String key) async {
    try {
      await initSettingsTable();
      final result = await customSelect(
        'SELECT value FROM app_settings WHERE key = ? LIMIT 1;',
        variables: [Variable.withString(key)],
      ).getSingleOrNull();
      return result?.data['value'] as String?;
    } catch (e) {
      return null;
    }
  }

  Future<Map<String, String>> getAllSettings() async {
    try {
      await initSettingsTable();
      final results = await customSelect('SELECT key, value FROM app_settings;').get();
      final map = <String, String>{};
      for (final row in results) {
        final k = row.data['key'] as String?;
        final v = row.data['value'] as String?;
        if (k != null && v != null) {
          map[k] = v;
        }
      }
      return map;
    } catch (e) {
      return {};
    }
  }
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dbFolder = await getApplicationDocumentsDirectory();
    final file = File(p.join(dbFolder.path, 'digital_sanctuary.sqlite'));
    return NativeDatabase.createInBackground(file);
  });
}
