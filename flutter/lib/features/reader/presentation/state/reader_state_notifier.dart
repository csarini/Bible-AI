import 'dart:async';
import 'package:drift/drift.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/storage/app_database.dart';
import '../../../../shared/services/home_widget_service.dart';
import '../../data/services/local_bible_service.dart';

enum ReaderStatus { initial, loading, loaded, error }

class ScriptureVerseUiModel {
  final int chapter;
  final int verse;
  final String verseName;
  final String text;
  final LocalBookmarkEntry? bookmark;

  bool get isHighlighted => bookmark != null;
  String? get highlightColor => bookmark?.colorHex;
  String? get customTitle => bookmark?.customTitle;
  String? get personalNote => bookmark?.personalNote;

  const ScriptureVerseUiModel({
    required this.chapter,
    required this.verse,
    required this.verseName,
    required this.text,
    this.bookmark,
  });

  ScriptureVerseUiModel copyWith({LocalBookmarkEntry? bookmark, bool clearBookmark = false}) {
    return ScriptureVerseUiModel(
      chapter: chapter,
      verse: verse,
      verseName: verseName,
      text: text,
      bookmark: clearBookmark ? null : (bookmark ?? this.bookmark),
    );
  }
}

class ReaderState {
  final ReaderStatus status;
  final String translationKey;
  final int currentBookNumber;
  final String currentBookName;
  final String currentBookId;
  final int currentChapter;
  final List<ScriptureVerseUiModel> verses;
  final String? errorMessage;

  const ReaderState({
    this.status = ReaderStatus.initial,
    this.translationKey = 'valera',
    this.currentBookNumber = 1,
    this.currentBookName = 'Génesis',
    this.currentBookId = 'GEN',
    this.currentChapter = 1,
    this.verses = const [],
    this.errorMessage,
  });

  ReaderState copyWith({
    ReaderStatus? status,
    String? translationKey,
    int? currentBookNumber,
    String? currentBookName,
    String? currentBookId,
    int? currentChapter,
    List<ScriptureVerseUiModel>? verses,
    String? errorMessage,
  }) {
    return ReaderState(
      status: status ?? this.status,
      translationKey: translationKey ?? this.translationKey,
      currentBookNumber: currentBookNumber ?? this.currentBookNumber,
      currentBookName: currentBookName ?? this.currentBookName,
      currentBookId: currentBookId ?? this.currentBookId,
      currentChapter: currentChapter ?? this.currentChapter,
      verses: verses ?? this.verses,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}

class ReaderNotifier extends StateNotifier<ReaderState> {
  final LocalBibleService _localBibleService;
  final AppDatabase _database;
  StreamSubscription? _bookmarksSubscription;

  ReaderNotifier({
    required LocalBibleService bibleService,
    required AppDatabase database,
  })  : _localBibleService = bibleService,
        _database = database,
        super(const ReaderState()) {
    loadChapter(bookNumber: 1, bookName: 'Génesis', bookId: 'GEN', chapterNumber: 1);
  }

  /// Loads a chapter directly from local SQLite database and dynamically attaches local highlights & notes.
  Future<void> loadChapter({
    required int bookNumber,
    required String bookName,
    required String bookId,
    required int chapterNumber,
    String? translationKey,
  }) async {
    final translation = translationKey ?? state.translationKey;
    state = state.copyWith(
      status: ReaderStatus.loading,
      currentBookNumber: bookNumber,
      currentBookName: bookName,
      currentBookId: bookId,
      currentChapter: chapterNumber,
      translationKey: translation,
    );

    try {
      // 1. Fetch chapter text directly from local SQLite
      final localData = await _localBibleService.fetchChapter(
        translationKey: translation,
        bookNumber: bookNumber,
        chapterNumber: chapterNumber,
        bookCode: bookId,
        bookName: bookName,
      );

      // 2. Fetch local bookmarks for this chapter
      final localBookmarks = await _database.getBookmarksForChapter(bookId, chapterNumber);
      final bookmarkMap = {for (var b in localBookmarks) b.verse: b};

      // 3. Map to UI Model
      final uiVerses = localData.verses.map((dto) {
        return ScriptureVerseUiModel(
          chapter: dto.chapter,
          verse: dto.verse,
          verseName: dto.name,
          text: dto.text,
          bookmark: bookmarkMap[dto.verse],
        );
      }).toList();

      state = state.copyWith(
        status: ReaderStatus.loaded,
        verses: uiVerses,
        errorMessage: null,
      );

      // Listen for bookmark changes on this chapter
      _listenToBookmarks(bookId, chapterNumber);
    } catch (e) {
      state = state.copyWith(
        status: ReaderStatus.error,
        errorMessage: 'Error al consultar las Escrituras en la base de datos local: $e',
      );
    }
  }

  void _listenToBookmarks(String bookId, int chapter) {
    _bookmarksSubscription?.cancel();
    _bookmarksSubscription = _database.watchBookmarksForChapter(bookId, chapter).listen((bookmarks) {
      final bookmarkMap = {for (var b in bookmarks) b.verse: b};
      final updatedVerses = state.verses.map((verse) {
        return verse.copyWith(
          bookmark: bookmarkMap[verse.verse],
          clearBookmark: !bookmarkMap.containsKey(verse.verse),
        );
      }).toList();
      state = state.copyWith(verses: updatedVerses);
    });
  }

  /// Toggles a highlight color or adds a new bookmark in local SQLite
  Future<void> toggleHighlight({
    required ScriptureVerseUiModel verse,
    required String colorHex,
  }) async {
    final existing = verse.bookmark;
    if (existing != null && existing.colorHex == colorHex) {
      // Remove highlight if same color tapped again
      await _database.deleteBookmark(existing.id);
    } else {
      // Save or update highlight
      await _database.saveBookmark(
        bookId: state.currentBookId,
        chapter: verse.chapter,
        verse: verse.verse,
        verseText: verse.text,
        colorHex: colorHex,
        customTitle: existing?.customTitle,
        personalNote: existing?.personalNote,
      );
    }
  }

  /// Saves a personal study note onto the selected verse in local SQLite
  Future<void> saveNote({
    required ScriptureVerseUiModel verse,
    required String noteText,
    String? customTitle,
  }) async {
    await _database.saveBookmark(
      bookId: state.currentBookId,
      chapter: verse.chapter,
      verse: verse.verse,
      verseText: verse.text,
      colorHex: verse.highlightColor ?? '#FED65B',
      customTitle: customTitle,
      personalNote: noteText.trim().isEmpty ? null : noteText.trim(),
    );
  }

  /// Pins this verse as the Daily Sanctuary Widget & Quick Card
  Future<void> pinAsWidgetVerse(ScriptureVerseUiModel verse) async {
    final ref = '${state.currentBookName} ${verse.chapter}:${verse.verse}';
    await HomeWidgetService.updateDailyVerse(
      verseText: verse.text,
      verseReference: ref,
      category: 'Santuario',
    );
  }

  @override
  void dispose() {
    _bookmarksSubscription?.cancel();
    super.dispose();
  }
}

final readerNotifierProvider =
    StateNotifierProvider<ReaderNotifier, ReaderState>((ref) {
  final db = ref.watch(appDatabaseProvider);
  return ReaderNotifier(
    bibleService: LocalBibleService(database: db),
    database: db,
  );
});

// Provider for app database
final appDatabaseProvider = Provider<AppDatabase>((ref) {
  throw UnimplementedError('appDatabaseProvider must be overridden in ProviderScope');
});
