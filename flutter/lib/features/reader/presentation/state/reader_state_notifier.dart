import 'dart:async';
import 'package:drift/drift.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/storage/app_database.dart';
import '../../../../shared/services/home_widget_service.dart';
import '../../data/services/getbible_service.dart';

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
  final GetBibleService _getBibleService;
  final AppDatabase _database;
  StreamSubscription? _bookmarksSubscription;

  ReaderNotifier({
    required GetBibleService getBibleService,
    required AppDatabase database,
  })  : _getBibleService = getBibleService,
        _database = database,
        super(const ReaderState()) {
    loadChapter(bookNumber: 1, bookName: 'Génesis', bookId: 'GEN', chapterNumber: 1);
  }

  /// Loads a chapter from GetBible.net v2 and dynamically attaches local highlights & notes.
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
      // 1. Fetch remote chapter text
      final remoteData = await _getBibleService.fetchChapter(
        translationKey: translation,
        bookNumber: bookNumber,
        chapterNumber: chapterNumber,
      );

      // 2. Fetch local bookmarks for this chapter
      final localBookmarks = await _database.getBookmarksForChapter(bookId, chapterNumber);
      final bookmarkMap = {for (var b in localBookmarks) b.verse: b};

      // 3. Map to UI Model
      final uiVerses = remoteData.verses.map((dto) {
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
        currentBookName: remoteData.bookName.isNotEmpty ? remoteData.bookName : bookName,
        verses: uiVerses,
      );

      // 4. Update the Lock Screen Widget with the first verse of the loaded chapter
      if (uiVerses.isNotEmpty) {
        await HomeWidgetService.updateVerseOfTheDay(
          reference: '${state.currentBookName} $chapterNumber:1',
          verseText: uiVerses.first.text,
        );
      }

      // 5. Watch for real-time local bookmark changes
      _observeLocalBookmarks(bookId, chapterNumber);
    } catch (e) {
      state = state.copyWith(
        status: ReaderStatus.error,
        errorMessage: e.toString(),
      );
    }
  }

  void _observeLocalBookmarks(String bookId, int chapterNumber) {
    _bookmarksSubscription?.cancel();
    _bookmarksSubscription = _database
        .watchBookmarksForChapter(bookId, chapterNumber)
        .listen((bookmarks) {
      final bookmarkMap = {for (var b in bookmarks) b.verse: b};
      final updated = state.verses.map((v) {
        return v.copyWith(
          bookmark: bookmarkMap[v.verse],
          clearBookmark: !bookmarkMap.containsKey(v.verse),
        );
      }).toList();

      state = state.copyWith(verses: updated);
    });
  }

  /// Saves or updates a highlight, title, and personal note for a specific verse.
  Future<void> saveHighlightAndReflection({
    required int verseNumber,
    required String verseText,
    required String colorHex,
    String? customTitle,
    String? personalNote,
  }) async {
    final id = '${state.currentBookId}_${state.currentChapter}_$verseNumber';

    await _database.insertOrUpdateBookmark(
      LocalBookmarksCompanion(
        id: Value(id),
        bookId: Value(state.currentBookId),
        bookName: Value(state.currentBookName),
        chapter: Value(state.currentChapter),
        verse: Value(verseNumber),
        verseText: Value(verseText),
        colorHex: Value(colorHex),
        customTitle: Value(customTitle),
        personalNote: Value(personalNote),
        isSynced: const Value(false),
      ),
    );
  }

  /// Removes a highlight and personal note from a verse.
  Future<void> removeHighlight(int verseNumber) async {
    await _database.deleteBookmarkByVerse(
      state.currentBookId,
      state.currentChapter,
      verseNumber,
    );
  }

  @override
  void dispose() {
    _bookmarksSubscription?.cancel();
    super.dispose();
  }
}
