import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:drift/drift.dart' as drift;
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../../core/constants/bible_books.dart';
import '../../../../core/providers/app_settings_providers.dart';
import '../../../../core/storage/app_database.dart';
import '../../../../core/theme/sanctuary_colors.dart';
import '../../../../shared/services/share_service.dart';
import '../../../../shared/widgets/quick_settings_sheet.dart';
import '../../../saved_verses/presentation/views/sanctuary_saved_verses_view.dart';
import '../../../shell/presentation/views/sanctuary_main_shell.dart';
import '../../data/services/getbible_service.dart';
import '../../domain/entities/verse_entity.dart';

class SanctuaryReaderView extends ConsumerStatefulWidget {
  final AppDatabase database;

  const SanctuaryReaderView({super.key, required this.database});

  @override
  ConsumerState<SanctuaryReaderView> createState() =>
      _SanctuaryReaderViewState();
}

class _SanctuaryReaderViewState extends ConsumerState<SanctuaryReaderView> {
  late final GetBibleService _bibleService;
  final ScrollController _scrollController = ScrollController();

  BibleBookInfo _currentBook = kBibleBooks.firstWhere((b) => b.id == 'MAT');
  int _currentChapter = 1;

  bool _isLoading = true;
  String? _errorMessage;
  List<VerseEntity> _verses = [];
  final Map<int, GlobalKey> _verseKeys = {};

  int? _targetHighlightedVerse;
  VerseEntity? _selectedVerse;
  LocalBookmarkEntry? _selectedBookmark;

  @override
  void initState() {
    super.initState();
    _bibleService = GetBibleService(database: widget.database);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final initialBookId = ref.read(appSelectedBookProvider);
      final initialChapter = ref.read(appSelectedChapterProvider);
      final initialVerse = ref.read(appSelectedVerseProvider);
      try {
        _currentBook = kBibleBooks.firstWhere((b) => b.id == initialBookId);
        _currentChapter = initialChapter;
      } catch (_) {}
      _loadChapter(initialVerse);
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToAndHighlightVerse(int verseNumber, {int retryCount = 0}) {
    if (_verses.isEmpty) return;
    final index = _verses.indexWhere((v) => v.number == verseNumber);
    if (index == -1) return;

    setState(() {
      _targetHighlightedVerse = verseNumber;
      _selectedVerse = null;
      _selectedBookmark = null;
    });

    void performScroll() {
      if (!mounted) return;
      final key = _verseKeys[verseNumber];
      final targetContext = key?.currentContext;

      if (targetContext != null) {
        Scrollable.ensureVisible(
          targetContext,
          duration: const Duration(milliseconds: 380),
          curve: Curves.easeInOutCubic,
          alignment: 0.22,
        );
      } else if (_scrollController.hasClients) {
        final maxScroll = _scrollController.position.maxScrollExtent;
        if (maxScroll > 0) {
          final estOffset = (_verses.length > 1)
              ? (index / _verses.length) * maxScroll
              : 0.0;
          _scrollController.jumpTo(estOffset.clamp(0.0, maxScroll));
        }
        if (retryCount < 4) {
          Future.delayed(const Duration(milliseconds: 90), () {
            if (mounted) {
              _scrollToAndHighlightVerse(verseNumber,
                  retryCount: retryCount + 1);
            }
          });
        }
      }
    }

    if (retryCount == 0) {
      Future.delayed(const Duration(milliseconds: 100), performScroll);
    } else {
      performScroll();
    }
  }

  Future<void> _loadChapter([int? targetVerseNumber]) async {
    final targetVerse = targetVerseNumber ?? ref.read(appSelectedVerseProvider);
    _verseKeys.clear();
    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _selectedVerse = null;
      _selectedBookmark = null;
      _targetHighlightedVerse = targetVerse;
    });

    final translation = ref.read(appTranslationProvider);

    try {
      final response = await _bibleService.fetchChapter(
        translationKey: translation,
        bookNumber: _currentBook.number,
        chapterNumber: _currentChapter,
        bookCode: _currentBook.id,
        bookName: _currentBook.name,
      );

      final verses = response.verses.map((v) {
        return VerseEntity(
          number: v.verse,
          text: v.text,
          bookName: response.bookName.isNotEmpty
              ? response.bookName
              : _currentBook.name,
          bookId: _currentBook.id,
          chapter: v.chapter,
        );
      }).toList();

      if (mounted) {
        final verseToScroll = _targetHighlightedVerse ??
            targetVerse ??
            ref.read(appSelectedVerseProvider);
        setState(() {
          _verses = verses;
          _isLoading = false;
          _targetHighlightedVerse = verseToScroll;
        });

        if (verseToScroll != null) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            Future.delayed(const Duration(milliseconds: 150), () {
              if (mounted) {
                _scrollToAndHighlightVerse(verseToScroll);
              }
            });
          });
        } else if (_scrollController.hasClients) {
          _scrollController.animateTo(
            0,
            duration: const Duration(milliseconds: 250),
            curve: Curves.easeOut,
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  void _onVerseTapped(VerseEntity verse) async {
    final existing = await widget.database.getBookmark(
      verse.bookId,
      verse.chapter,
      verse.number,
    );

    setState(() {
      if (_selectedVerse?.number == verse.number) {
        _selectedVerse = null;
        _selectedBookmark = null;
      } else {
        _selectedVerse = verse;
        _selectedBookmark = existing;
        _targetHighlightedVerse = null;
      }
    });
  }

  void _openBookChapterPicker(List<BibleBookInfo> allBooks) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return DraggableScrollableSheet(
          initialChildSize: 0.85,
          maxChildSize: 0.95,
          minChildSize: 0.5,
          builder: (_, scrollController) {
            return Container(
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.surface,
                borderRadius:
                    const BorderRadius.vertical(top: Radius.circular(24)),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Column(
                children: [
                  Container(
                    width: 40,
                    height: 4,
                    margin: const EdgeInsets.only(bottom: 16),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade400,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  Text(
                    'Seleccionar Libro y Capítulo',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 12),
                  Expanded(
                    child: ListView.builder(
                      controller: scrollController,
                      itemCount: allBooks.length,
                      itemBuilder: (context, index) {
                        final book = allBooks[index];
                        final isSelected = book.id == _currentBook.id;

                        return ExpansionTile(
                          initiallyExpanded: isSelected,
                          leading: CircleAvatar(
                            radius: 14,
                            backgroundColor: book.isNewTestament
                                ? SanctuaryColors.waveNavy
                                    .withValues(alpha: 0.12)
                                : SanctuaryColors.sunOrange
                                    .withValues(alpha: 0.15),
                            child: Text(
                              book.isNewTestament ? 'NT' : 'AT',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: book.isNewTestament
                                    ? SanctuaryColors.waveNavy
                                    : SanctuaryColors.sunOrange,
                              ),
                            ),
                          ),
                          title: Text(
                            book.name,
                            style: TextStyle(
                              fontWeight: isSelected
                                  ? FontWeight.bold
                                  : FontWeight.w500,
                              color:
                                  isSelected ? SanctuaryColors.waveNavy : null,
                            ),
                          ),
                          subtitle: Text('${book.totalChapters} capítulos',
                              style: const TextStyle(fontSize: 12)),
                          children: [
                            Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: Wrap(
                                spacing: 8,
                                runSpacing: 8,
                                children:
                                    List.generate(book.totalChapters, (cIdx) {
                                  final chNum = cIdx + 1;
                                  final isCurrentCh =
                                      isSelected && chNum == _currentChapter;

                                  return InkWell(
                                    onTap: () {
                                      Navigator.pop(context);
                                      setState(() {
                                        _currentBook = book;
                                        _currentChapter = chNum;
                                      });
                                      ref
                                          .read(
                                              appSelectedBookProvider.notifier)
                                          .state = book.id;
                                      ref
                                          .read(appSelectedChapterProvider
                                              .notifier)
                                          .state = chNum;
                                      _loadChapter();
                                    },
                                    borderRadius: BorderRadius.circular(10),
                                    child: Container(
                                      width: 44,
                                      height: 44,
                                      alignment: Alignment.center,
                                      decoration: BoxDecoration(
                                        color: isCurrentCh
                                            ? SanctuaryColors.waveNavy
                                            : SanctuaryColors.waveNavy
                                                .withValues(alpha: 0.06),
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      child: Text(
                                        '$chNum',
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          color: isCurrentCh
                                              ? Colors.white
                                              : SanctuaryColors.waveNavy,
                                        ),
                                      ),
                                    ),
                                  );
                                }),
                              ),
                            ),
                          ],
                        );
                      },
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _showAddNoteDialog(VerseEntity verse, LocalBookmarkEntry? existing) {
    final titleController =
        TextEditingController(text: existing?.customTitle ?? '');
    final noteController =
        TextEditingController(text: existing?.personalNote ?? '');
    String selectedHex = existing?.colorHex ??
        SanctuaryColors.colorToHex(SanctuaryColors.highlightYellow);

    showDialog(
      context: context,
      builder: (dialogCtx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Text(
            'Reflexión Personal (${verse.reference})',
            style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Color de resaltado:',
                    style:
                        TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                const SizedBox(height: 6),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: SanctuaryColors.pastelPalette.map((col) {
                    final hex = SanctuaryColors.colorToHex(col);
                    final isChosen = selectedHex == hex;
                    return GestureDetector(
                      onTap: () => setDialogState(() => selectedHex = hex),
                      child: Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          color: col,
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: isChosen
                                ? SanctuaryColors.waveNavy
                                : Colors.black26,
                            width: isChosen ? 2.5 : 1,
                          ),
                        ),
                        child: isChosen
                            ? const Icon(Icons.check,
                                size: 16, color: SanctuaryColors.waveNavy)
                            : null,
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: titleController,
                  decoration: InputDecoration(
                    labelText: 'Título Personal (Opcional)',
                    hintText: 'Ej. Promesa de paz en la tormenta',
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: noteController,
                  maxLines: 3,
                  decoration: InputDecoration(
                    labelText: 'Nota de reflexión',
                    hintText: 'Escribe lo que Dios habló a tu corazón hoy...',
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogCtx),
              child: const Text('Cancelar'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: SanctuaryColors.waveNavy,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: () async {
                final id = '${verse.bookId}_${verse.chapter}_${verse.number}';
                await widget.database.insertOrUpdateBookmark(
                  LocalBookmarksCompanion.insert(
                    id: id,
                    bookId: verse.bookId,
                    bookName: verse.bookName,
                    chapter: verse.chapter,
                    verse: verse.number,
                    verseText: verse.text,
                    colorHex: selectedHex,
                    customTitle: drift.Value(titleController.text.trim().isEmpty
                        ? null
                        : titleController.text.trim()),
                    personalNote: drift.Value(noteController.text.trim().isEmpty
                        ? null
                        : noteController.text.trim()),
                  ),
                );
                Navigator.pop(dialogCtx);
                setState(() {
                  _selectedVerse = null;
                  _selectedBookmark = null;
                });
              },
              child: const Text('Guardar'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final allBooks =
        ref.watch(bibleBooksStreamProvider(widget.database)).valueOrNull ??
            kBibleBooks;

    // Listen to external book/chapter/verse navigation requests (e.g. from Home, Search, Saved Verses)
    ref.listen<String>(appSelectedBookProvider, (previous, next) {
      if (next != _currentBook.id) {
        try {
          final nextChapter = ref.read(appSelectedChapterProvider);
          final nextVerse = ref.read(appSelectedVerseProvider);
          setState(() {
            _currentBook = allBooks.firstWhere((b) => b.id == next,
                orElse: () => kBibleBooks.firstWhere((b) => b.id == next));
            _currentChapter = nextChapter;
          });
          _loadChapter(nextVerse);
        } catch (_) {}
      }
    });

    ref.listen<int>(appSelectedChapterProvider, (previous, next) {
      if (next != _currentChapter) {
        final nextVerse = ref.read(appSelectedVerseProvider);
        setState(() {
          _currentChapter = next;
        });
        _loadChapter(nextVerse);
      }
    });

    ref.listen<int?>(appSelectedVerseProvider, (previous, next) {
      if (next != null) {
        if (_isLoading) {
          _targetHighlightedVerse = next;
        } else if (_verses.isNotEmpty) {
          _scrollToAndHighlightVerse(next);
        }
      }
    });

    ref.listen<String>(appTranslationProvider, (previous, next) {
      if (previous != next) {
        _loadChapter();
      }
    });

    ref.listen<int>(selectedTabProvider, (previous, next) {
      if (next == 1) {
        final targetBook = ref.read(appSelectedBookProvider);
        final targetChapter = ref.read(appSelectedChapterProvider);
        final targetVerse = ref.read(appSelectedVerseProvider);

        if (targetBook != _currentBook.id || targetChapter != _currentChapter) {
          setState(() {
            _currentBook = allBooks.firstWhere((b) => b.id == targetBook,
                orElse: () =>
                    kBibleBooks.firstWhere((b) => b.id == targetBook));
            _currentChapter = targetChapter;
          });
          _loadChapter(targetVerse);
        } else if (targetVerse != null) {
          if (_isLoading) {
            _targetHighlightedVerse = targetVerse;
          } else if (_verses.isNotEmpty) {
            _scrollToAndHighlightVerse(targetVerse);
          }
        }
      }
    });

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(LucideIcons.menu),
          tooltip: 'Menú Lateral',
          onPressed: openSanctuaryDrawer,
        ),
        title: InkWell(
          onTap: () => _openBookChapterPicker(allBooks),
          borderRadius: BorderRadius.circular(8),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Flexible(
                  child: Text(
                    '${_currentBook.name} $_currentChapter',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.inter(
                      fontWeight: FontWeight.w800,
                      fontSize: 16.5,
                    ),
                  ),
                ),
                const SizedBox(width: 4),
                const Icon(LucideIcons.chevronDown, size: 16),
              ],
            ),
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.settings2),
            tooltip: 'Ajustes Rápidos de Lectura',
            onPressed: () => QuickSettingsSheet.show(context),
          ),
        ],
      ),
      body: Stack(
        children: [
          Column(
            children: [
              Expanded(
                child: _isLoading
                    ? const Center(
                        child: CircularProgressIndicator(
                            color: SanctuaryColors.waveNavy))
                    : _errorMessage != null
                        ? _buildErrorWidget()
                        : _buildVersesList(),
              ),
              _buildChapterNavigationControls(allBooks),
            ],
          ),
          if (_selectedVerse != null) _buildHighlightToolbar(isDark),
        ],
      ),
    );
  }

  Widget _buildVersesList() {
    final fontSize = ref.watch(appFontSizeProvider);
    final fontFamily = ref.watch(appFontFamilyProvider);
    final lineSpacing = ref.watch(appLineSpacingProvider);
    final showVerseNumbers = ref.watch(appShowVerseNumbersProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    double bodyFontSize = 17.0;
    if (fontSize == 'small') bodyFontSize = 15.0;
    if (fontSize == 'large') bodyFontSize = 20.0;
    if (fontSize == 'xlarge') bodyFontSize = 23.0;

    double bodyHeight = 1.68;
    if (lineSpacing == 'compact') bodyHeight = 1.45;
    if (lineSpacing == 'relaxed') bodyHeight = 1.95;

    return StreamBuilder<List<LocalBookmarkEntry>>(
      stream: widget.database.watchAllBookmarks(),
      builder: (context, snapshot) {
        final bookmarks = snapshot.data ?? [];
        final bookmarkMap = {
          for (var b in bookmarks)
            if (b.bookId == _currentBook.id && b.chapter == _currentChapter)
              b.verse: b
        };

        return ListView.builder(
          controller: _scrollController,
          padding: const EdgeInsets.fromLTRB(18, 10, 18, 90),
          itemCount: _verses.length,
          itemBuilder: (context, index) {
            final verse = _verses[index];
            final bookmark = bookmarkMap[verse.number];
            final isSelected = _selectedVerse?.number == verse.number;
            final isTargetHighlighted = _targetHighlightedVerse == verse.number;

            TextStyle verseStyle;
            if (fontFamily == 'playfair') {
              verseStyle = GoogleFonts.playfairDisplay(
                fontSize: bodyFontSize,
                height: bodyHeight,
                color: bookmark != null
                    ? Colors.black87
                    : Theme.of(context).colorScheme.onSurface,
              );
            } else if (fontFamily == 'inter' || fontFamily == 'jakarta') {
              verseStyle = GoogleFonts.inter(
                fontSize: bodyFontSize,
                height: bodyHeight,
                color: bookmark != null
                    ? Colors.black87
                    : Theme.of(context).colorScheme.onSurface,
              );
            } else {
              verseStyle = GoogleFonts.literata(
                fontSize: bodyFontSize,
                height: bodyHeight,
                color: bookmark != null
                    ? Colors.black87
                    : Theme.of(context).colorScheme.onSurface,
              );
            }

            // Determine background & border
            Color? bgColor;
            Border? border;

            if (bookmark != null) {
              bgColor = SanctuaryColors.getHighlightColor(bookmark.colorHex);
              if (isSelected) {
                border = Border.all(color: SanctuaryColors.waveNavy, width: 2.0);
              } else if (isTargetHighlighted) {
                border = Border.all(color: SanctuaryColors.sunOrange, width: 2.0);
              }
            } else if (isSelected) {
              bgColor = SanctuaryColors.waveNavy.withValues(alpha: 0.09);
              border = Border.all(color: SanctuaryColors.waveNavy, width: 1.5);
            } else if (isTargetHighlighted) {
              bgColor = isDark
                  ? SanctuaryColors.sunOrange.withValues(alpha: 0.16)
                  : SanctuaryColors.amberGold.withValues(alpha: 0.22);
              border = Border.all(
                  color: SanctuaryColors.sunOrange.withValues(alpha: 0.8),
                  width: 1.5);
            }

            final verseKey =
                _verseKeys.putIfAbsent(verse.number, () => GlobalKey());

            return GestureDetector(
              key: verseKey,
              onTap: () => _onVerseTapped(verse),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                margin: const EdgeInsets.only(bottom: 12),
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: bgColor ?? Colors.transparent,
                  borderRadius: BorderRadius.circular(12),
                  border: border,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (bookmark?.customTitle != null &&
                        bookmark!.customTitle!.isNotEmpty) ...[
                      Padding(
                        padding: const EdgeInsets.only(bottom: 4),
                        child: Text(
                          '📌 ${bookmark.customTitle!}',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: SanctuaryColors.waveNavy,
                          ),
                        ),
                      ),
                    ],
                    RichText(
                      text: TextSpan(
                        children: [
                          if (showVerseNumbers)
                            TextSpan(
                              text: '${verse.number}  ',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w800,
                                color: (isTargetHighlighted && !isSelected)
                                    ? SanctuaryColors.sunOrange
                                    : SanctuaryColors.waveNavy
                                        .withValues(alpha: 0.75),
                              ),
                            ),
                          TextSpan(
                            text: verse.text,
                            style: verseStyle,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildHighlightToolbar(bool isDark) {
    final surfaceColor = Theme.of(context).cardTheme.color ??
        Theme.of(context).colorScheme.surface;
    return Positioned(
      bottom: 24,
      left: 16,
      right: 16,
      child: Material(
        elevation: 8,
        borderRadius: BorderRadius.circular(20),
        color: surfaceColor,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Pastel colors selector
              Expanded(
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: SanctuaryColors.pastelPalette.map((color) {
                      final hex = SanctuaryColors.colorToHex(color);
                      final label = SanctuaryColors.getHighlightLabel(hex);
                      return Tooltip(
                        message: label,
                        child: GestureDetector(
                          onTap: () async {
                            final id =
                                '${_selectedVerse!.bookId}_${_selectedVerse!.chapter}_${_selectedVerse!.number}';
                            await widget.database.insertOrUpdateBookmark(
                              LocalBookmarksCompanion.insert(
                                id: id,
                                bookId: _selectedVerse!.bookId,
                                bookName: _selectedVerse!.bookName,
                                chapter: _selectedVerse!.chapter,
                                verse: _selectedVerse!.number,
                                verseText: _selectedVerse!.text,
                                colorHex: hex,
                              ),
                            );
                            setState(() {
                              _selectedVerse = null;
                              _selectedBookmark = null;
                            });
                          },
                          child: Container(
                            margin: const EdgeInsets.symmetric(horizontal: 3),
                            width: 28,
                            height: 28,
                            decoration: BoxDecoration(
                              color: color,
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.black26),
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ),
              const SizedBox(width: 6),
              // Note & Share & Trash Actions
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IconButton(
                    visualDensity: VisualDensity.compact,
                    padding: EdgeInsets.zero,
                    constraints:
                        const BoxConstraints(minWidth: 36, minHeight: 36),
                    icon: Icon(
                      _selectedBookmark != null
                          ? LucideIcons.bookmarkCheck
                          : LucideIcons.bookmark,
                      size: 19,
                      color: _selectedBookmark != null
                          ? SanctuaryColors.sunOrange
                          : null,
                    ),
                    tooltip: _selectedBookmark != null
                        ? 'Editar Guardado'
                        : 'Guardar Versículo',
                    onPressed: () =>
                        _showAddNoteDialog(_selectedVerse!, _selectedBookmark),
                  ),
                  IconButton(
                    visualDensity: VisualDensity.compact,
                    padding: EdgeInsets.zero,
                    constraints:
                        const BoxConstraints(minWidth: 36, minHeight: 36),
                    icon: const Icon(LucideIcons.share2, size: 19),
                    tooltip: 'Compartir Versículo',
                    onPressed: () {
                      ShareService.shareScripture(
                        context: context,
                        reference: _selectedVerse!.reference,
                        text: _selectedVerse!.text,
                        customTitle: _selectedBookmark?.customTitle,
                        personalReflection: _selectedBookmark?.personalNote,
                      );
                    },
                  ),
                  if (_selectedBookmark != null)
                    IconButton(
                      visualDensity: VisualDensity.compact,
                      padding: EdgeInsets.zero,
                      constraints:
                          const BoxConstraints(minWidth: 36, minHeight: 36),
                      icon: const Icon(LucideIcons.trash2,
                          size: 19, color: Colors.redAccent),
                      tooltip: 'Eliminar Resaltado',
                      onPressed: () async {
                        await widget.database
                            .deleteBookmark(_selectedBookmark!.id);
                        setState(() {
                          _selectedVerse = null;
                          _selectedBookmark = null;
                        });
                      },
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildChapterNavigationControls(List<BibleBookInfo> allBooks) {
    final theme = Theme.of(context);
    final hasPrev = _currentChapter > 1;
    final hasNext = _currentChapter < _currentBook.totalChapters;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        border: Border(
          top: BorderSide(
              color: theme.colorScheme.outline.withValues(alpha: 0.2)),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Previous Chapter Icon Button
          IconButton.filledTonal(
            onPressed: hasPrev
                ? () {
                    setState(() => _currentChapter--);
                    ref.read(appSelectedChapterProvider.notifier).state =
                        _currentChapter;
                    _loadChapter();
                  }
                : null,
            icon: const Icon(LucideIcons.chevronLeft, size: 18),
            tooltip: 'Capítulo anterior (${_currentChapter - 1})',
            style: IconButton.styleFrom(
              padding: const EdgeInsets.all(8),
              minimumSize: const Size(36, 36),
            ),
          ),

          // Central Quick Book & Chapter Selector
          Flexible(
            child: InkWell(
              onTap: () {
                _openBookChapterPicker(allBooks);
              },
              borderRadius: BorderRadius.circular(20),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                decoration: BoxDecoration(
                  color: theme.colorScheme.surfaceContainerHighest,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                      color: theme.colorScheme.outline.withValues(alpha: 0.2)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Flexible(
                      child: Text(
                        '${_currentBook.name} $_currentChapter/${_currentBook.totalChapters}',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.inter(
                          fontWeight: FontWeight.w700,
                          fontSize: 13,
                          color: theme.colorScheme.onSurface,
                        ),
                      ),
                    ),
                    const SizedBox(width: 4),
                    Icon(
                      LucideIcons.chevronDown,
                      size: 14,
                      color: theme.colorScheme.primary,
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Next Chapter Icon Button
          IconButton.filledTonal(
            onPressed: hasNext
                ? () {
                    setState(() => _currentChapter++);
                    ref.read(appSelectedChapterProvider.notifier).state =
                        _currentChapter;
                    _loadChapter();
                  }
                : null,
            icon: const Icon(LucideIcons.chevronRight, size: 18),
            tooltip: 'Capítulo siguiente (${_currentChapter + 1})',
            style: IconButton.styleFrom(
              padding: const EdgeInsets.all(8),
              minimumSize: const Size(36, 36),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorWidget() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(LucideIcons.alertCircle, color: Colors.amber, size: 40),
            const SizedBox(height: 12),
            Text(
              _errorMessage ?? 'Error al cargar las Sagradas Escrituras',
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loadChapter,
              child: const Text('Reintentar'),
            ),
          ],
        ),
      ),
    );
  }
}
