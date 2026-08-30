import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../../core/constants/bible_books.dart';
import '../../../../core/storage/app_database.dart';
import '../../../../core/theme/sanctuary_colors.dart';
import '../../../../shared/services/share_service.dart';
import '../../../../shared/widgets/sanctuary_church_logo.dart';
import '../../../saved_verses/presentation/views/sanctuary_saved_verses_view.dart';
import '../../data/services/getbible_service.dart';
import '../../domain/entities/verse_entity.dart';

class SanctuaryReaderView extends StatefulWidget {
  final AppDatabase database;

  const SanctuaryReaderView({super.key, required this.database});

  @override
  State<SanctuaryReaderView> createState() => _SanctuaryReaderViewState();
}

class _SanctuaryReaderViewState extends State<SanctuaryReaderView> {
  final GetBibleService _bibleService = GetBibleService();
  final ScrollController _scrollController = ScrollController();

  BibleBookInfo _currentBook = kBibleBooks.firstWhere((b) => b.id == 'MAT');
  int _currentChapter = 1;

  bool _isLoading = true;
  String? _errorMessage;
  List<VerseEntity> _verses = [];

  VerseEntity? _selectedVerse;
  LocalBookmarkEntry? _selectedBookmark;

  @override
  void initState() {
    super.initState();
    _loadChapter();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _loadChapter() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _selectedVerse = null;
      _selectedBookmark = null;
    });

    try {
      final response = await _bibleService.fetchChapter(
        translationKey: 'valera',
        bookNumber: _currentBook.number,
        chapterNumber: _currentChapter,
      );

      final verses = response.verses.map((v) {
        return VerseEntity(
          number: v.verse,
          text: v.text,
          bookName: response.bookName.isNotEmpty ? response.bookName : _currentBook.name,
          bookId: _currentBook.id,
          chapter: v.chapter,
        );
      }).toList();

      if (mounted) {
        setState(() {
          _verses = verses;
          _isLoading = false;
        });
        if (_scrollController.hasClients) {
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
      }
    });
  }

  void _openBookChapterPicker() {
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
                borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
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
                      itemCount: kBibleBooks.length,
                      itemBuilder: (context, index) {
                        final book = kBibleBooks[index];
                        final isSelected = book.id == _currentBook.id;

                        return ExpansionTile(
                          initiallyExpanded: isSelected,
                          leading: CircleAvatar(
                            radius: 14,
                            backgroundColor: book.isNewTestament
                                ? SanctuaryColors.waveNavy.withOpacity(0.12)
                                : SanctuaryColors.sunOrange.withOpacity(0.15),
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
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                              color: isSelected ? SanctuaryColors.waveNavy : null,
                            ),
                          ),
                          subtitle: Text('${book.totalChapters} capítulos', style: const TextStyle(fontSize: 12)),
                          children: [
                            Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: Wrap(
                                spacing: 8,
                                runSpacing: 8,
                                children: List.generate(book.totalChapters, (cIdx) {
                                  final chNum = cIdx + 1;
                                  final isCurrentCh = isSelected && chNum == _currentChapter;

                                  return InkWell(
                                    onTap: () {
                                      Navigator.pop(context);
                                      setState(() {
                                        _currentBook = book;
                                        _currentChapter = chNum;
                                      });
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
                                            : SanctuaryColors.waveNavy.withOpacity(0.06),
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      child: Text(
                                        '$chNum',
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          color: isCurrentCh ? Colors.white : SanctuaryColors.waveNavy,
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
    final titleController = TextEditingController(text: existing?.customTitle ?? '');
    final noteController = TextEditingController(text: existing?.personalNote ?? '');
    String selectedHex = existing?.colorHex ?? SanctuaryColors.colorToHex(SanctuaryColors.highlightYellow);

    showDialog(
      context: context,
      builder: (dialogCtx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Text(
            'Reflexión Personal (${verse.reference})',
            style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Color de resaltado:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                const SizedBox(height: 6),
                Row(
                  children: SanctuaryColors.pastelPalette.map((col) {
                    final hex = SanctuaryColors.colorToHex(col);
                    final isChosen = selectedHex == hex;
                    return GestureDetector(
                      onTap: () => setDialogState(() => selectedHex = hex),
                      child: Container(
                        margin: const EdgeInsets.only(right: 8),
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          color: col,
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: isChosen ? SanctuaryColors.waveNavy : Colors.black26,
                            width: isChosen ? 2.5 : 1,
                          ),
                        ),
                        child: isChosen
                            ? const Icon(Icons.check, size: 16, color: SanctuaryColors.waveNavy)
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
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: noteController,
                  maxLines: 3,
                  decoration: InputDecoration(
                    labelText: 'Nota de reflexión',
                    hintText: 'Escribe lo que Dios habló a tu corazón hoy...',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
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
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
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
                    customTitle: titleController.text.trim().isEmpty ? null : titleController.text.trim(),
                    personalNote: noteController.text.trim().isEmpty ? null : noteController.text.trim(),
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
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        leading: Padding(
          padding: const EdgeInsets.only(left: 12.0),
          child: SanctuaryChurchLogo(
            size: 28,
            variant: LogoVariant.symbol,
            showText: false,
            showSubtitle: false,
            isDark: isDark,
          ),
        ),
        title: InkWell(
          onTap: _openBookChapterPicker,
          borderRadius: BorderRadius.circular(8),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('${_currentBook.name} $_currentChapter'),
                const SizedBox(width: 4),
                const Icon(LucideIcons.chevronDown, size: 16),
              ],
            ),
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.bookmark),
            tooltip: 'Santuario de Guardados',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => SanctuarySavedVersesView(database: widget.database),
                ),
              );
            },
          ),
        ],
      ),
      body: Stack(
        children: [
          Column(
            children: [
              _buildVerseOfTheDayCard(),
              Expanded(
                child: _isLoading
                    ? const Center(child: CircularProgressIndicator(color: SanctuaryColors.waveNavy))
                    : _errorMessage != null
                        ? _buildErrorWidget()
                        : _buildVersesList(),
              ),
              _buildChapterNavigationControls(),
            ],
          ),
          if (_selectedVerse != null) _buildHighlightToolbar(isDark),
        ],
      ),
    );
  }

  Widget _buildVerseOfTheDayCard() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: SanctuaryColors.waveNavy.withOpacity(0.07),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: SanctuaryColors.waveNavy.withOpacity(0.15)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: SanctuaryColors.sunOrange,
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(LucideIcons.sparkles, color: Colors.white, size: 16),
          ),
          const SizedBox(width: 10),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'VERSÍCULO DEL DÍA (RVR1909)',
                  style: TextStyle(
                    fontSize: 9.5,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 1.0,
                    color: SanctuaryColors.waveNavy,
                  ),
                ),
                SizedBox(height: 2),
                Text(
                  '"Lámpara es a mis pies tu palabra, y lumbrera a mi camino."',
                  style: TextStyle(
                    fontSize: 12.5,
                    fontStyle: FontStyle.italic,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVersesList() {
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

            return GestureDetector(
              onTap: () => _onVerseTapped(verse),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: bookmark != null
                      ? SanctuaryColors.getHighlightColor(bookmark.colorHex)
                      : isSelected
                          ? SanctuaryColors.waveNavy.withOpacity(0.09)
                          : Colors.transparent,
                  borderRadius: BorderRadius.circular(12),
                  border: isSelected
                      ? Border.all(color: SanctuaryColors.waveNavy, width: 1.5)
                      : null,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (bookmark?.customTitle != null && bookmark!.customTitle!.isNotEmpty) ...[
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
                          TextSpan(
                            text: '${verse.number}  ',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w800,
                              color: SanctuaryColors.waveNavy.withOpacity(0.75),
                            ),
                          ),
                          TextSpan(
                            text: verse.text,
                            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                  color: bookmark != null
                                      ? Colors.black87
                                      : Theme.of(context).colorScheme.onSurface,
                                ),
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
    return Positioned(
      bottom: 24,
      left: 16,
      right: 16,
      child: Material(
        elevation: 8,
        borderRadius: BorderRadius.circular(20),
        color: isDark ? SanctuaryColors.darkSurfaceElevated : Colors.white,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Pastel colors selector
              Row(
                children: SanctuaryColors.pastelPalette.map((color) {
                  final hex = SanctuaryColors.colorToHex(color);
                  return GestureDetector(
                    onTap: () async {
                      final id = '${_selectedVerse!.bookId}_${_selectedVerse!.chapter}_${_selectedVerse!.number}';
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
                  );
                }).toList(),
              ),
              const SizedBox(width: 6),
              // Note & Share & Trash Actions
              Row(
                children: [
                  IconButton(
                    icon: const Icon(LucideIcons.fileText, size: 20),
                    tooltip: 'Añadir Nota / Título',
                    onPressed: () => _showAddNoteDialog(_selectedVerse!, _selectedBookmark),
                  ),
                  IconButton(
                    icon: const Icon(LucideIcons.share2, size: 20),
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
                      icon: const Icon(LucideIcons.trash2, size: 20, color: Colors.redAccent),
                      tooltip: 'Eliminar Resaltado',
                      onPressed: () async {
                        await widget.database.deleteBookmark(_selectedBookmark!.id);
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

  Widget _buildChapterNavigationControls() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        border: Border(top: BorderSide(color: Theme.of(context).colorScheme.outline)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          TextButton.icon(
            onPressed: _currentChapter > 1
                ? () {
                    setState(() => _currentChapter--);
                    _loadChapter();
                  }
                : null,
            icon: const Icon(LucideIcons.chevronLeft, size: 18),
            label: const Text('Anterior'),
          ),
          Text(
            'Capítulo $_currentChapter de ${_currentBook.totalChapters}',
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
          ),
          TextButton.icon(
            onPressed: _currentChapter < _currentBook.totalChapters
                ? () {
                    setState(() => _currentChapter++);
                    _loadChapter();
                  }
                : null,
            icon: const Icon(LucideIcons.chevronRight, size: 18),
            label: const Text('Siguiente'),
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
