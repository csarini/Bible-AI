import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../../core/constants/bible_books.dart';
import '../../../../core/providers/app_settings_providers.dart';
import '../../../../core/theme/sanctuary_colors.dart';
import '../../shell/presentation/views/sanctuary_main_shell.dart';

class SanctuarySearchLibraryView extends ConsumerStatefulWidget {
  final Function(String bookId, int chapter, int? verse) onSelectPassage;

  const SanctuarySearchLibraryView({
    super.key,
    required this.onSelectPassage,
  });

  @override
  ConsumerState<SanctuarySearchLibraryView> createState() => _SanctuarySearchLibraryViewState();
}

class _SanctuarySearchLibraryViewState extends ConsumerState<SanctuarySearchLibraryView> {
  final TextEditingController _searchController = TextEditingController();
  String _activeTabFilter = 'all'; // 'all', 'OT', 'NT'
  final List<String> _recentSearches = [
    'Juan 3:16',
    'Salmos 23',
    'Romanos 8:28',
    'Filipenses 4:13',
    'Mateo 5',
    'Génesis 1'
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  // Fast direct reference detector (e.g. "Juan 3:16" or "Mateo 4")
  ({BibleBookInfo book, int chapter, int? verse})? _parseDirectReference(String query) {
    final trimmed = query.trim();
    if (trimmed.isEmpty) return null;

    final regex = RegExp(r'^([1-3]?\s?[A-Za-zÁÉÍÓÚáéíóúñ]+)\s+(\d+)(?::(\d+))?$', caseSensitive: false);
    final match = regex.firstMatch(trimmed);

    if (match != null) {
      final bookQuery = match.group(1)!.trim().toLowerCase();
      final chapterNum = int.tryParse(match.group(2)!) ?? 1;
      final verseNum = match.group(3) != null ? int.tryParse(match.group(3)!) : null;

      try {
        final found = kBibleBooks.firstWhere((b) =>
            b.name.toLowerCase() == bookQuery ||
            b.name.toLowerCase().startsWith(bookQuery) ||
            b.abbreviation.toLowerCase() == bookQuery);

        if (chapterNum > 0 && chapterNum <= found.totalChapters) {
          return (book: found, chapter: chapterNum, verse: verseNum);
        }
      } catch (_) {}
    }
    return null;
  }

  void _openChapterVersePicker(BibleBookInfo book) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _BookChapterVersePickerSheet(
        book: book,
        onSelectPassage: (ch, verse) {
          Navigator.pop(ctx);
          widget.onSelectPassage(book.id, ch, verse);
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final query = _searchController.text.trim().toLowerCase();

    final directRef = _parseDirectReference(_searchController.text);

    final filteredBooks = kBibleBooks.where((book) {
      final matchesQuery = query.isEmpty ||
          book.name.toLowerCase().contains(query) ||
          book.abbreviation.toLowerCase().contains(query);

      if (_activeTabFilter == 'OT') {
        return matchesQuery && !book.isNewTestament;
      } else if (_activeTabFilter == 'NT') {
        return matchesQuery && book.isNewTestament;
      }
      return matchesQuery;
    }).toList();

    final oldTestamentCount = kBibleBooks.where((b) => !b.isNewTestament).length;
    final newTestamentCount = kBibleBooks.where((b) => b.isNewTestament).length;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(LucideIcons.menu),
          tooltip: 'Menú Lateral',
          onPressed: openSanctuaryDrawer,
        ),
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(LucideIcons.library, size: 20, color: SanctuaryColors.sunOrange),
            const SizedBox(width: 8),
            Text(
              'Biblioteca Bíblica (66 Libros)',
              style: GoogleFonts.plusJakartaSans(
                fontWeight: FontWeight.w700,
                fontSize: 17,
              ),
            ),
          ],
        ),
      ),
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Search Input
                  TextField(
                    controller: _searchController,
                    onChanged: (_) => setState(() {}),
                    onSubmitted: (val) {
                      if (directRef != null) {
                        widget.onSelectPassage(directRef.book.id, directRef.chapter, directRef.verse);
                      }
                    },
                    decoration: InputDecoration(
                      prefixIcon: const Icon(LucideIcons.search, size: 18),
                      hintText: 'Buscar libro o cita (ej: Juan 3:16, Mateo 4, Salmos)',
                      hintStyle: GoogleFonts.plusJakartaSans(fontSize: 13),
                      filled: true,
                      fillColor: theme.cardTheme.color,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: BorderSide(color: theme.colorScheme.outline.withOpacity(0.3)),
                      ),
                      suffixIcon: _searchController.text.isNotEmpty
                          ? IconButton(
                              icon: const Icon(LucideIcons.x, size: 16),
                              onPressed: () {
                                _searchController.clear();
                                setState(() {});
                              },
                            )
                          : null,
                    ),
                  ),

                  // Direct Reference Jump Card
                  if (directRef != null) ...[
                    const SizedBox(height: 10),
                    InkWell(
                      onTap: () => widget.onSelectPassage(
                        directRef.book.id,
                        directRef.chapter,
                        directRef.verse,
                      ),
                      borderRadius: BorderRadius.circular(14),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        decoration: BoxDecoration(
                          color: SanctuaryColors.sunOrange.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: SanctuaryColors.sunOrange.withOpacity(0.3)),
                        ),
                        child: Row(
                          children: [
                            const Icon(LucideIcons.bookOpen, color: SanctuaryColors.sunOrange, size: 20),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                'Ir directo a ${directRef.book.name} ${directRef.chapter}${directRef.verse != null ? ':${directRef.verse}' : ''}',
                                style: GoogleFonts.plusJakartaSans(
                                  fontWeight: FontWeight.w700,
                                  fontSize: 13,
                                  color: SanctuaryColors.waveNavy,
                                ),
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: SanctuaryColors.waveNavy,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                'Abrir →',
                                style: GoogleFonts.plusJakartaSans(
                                  color: Colors.white,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],

                  const SizedBox(height: 14),

                  // Filter Tabs
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _buildTabChip('all', 'Todos (66)'),
                      const SizedBox(width: 8),
                      _buildTabChip('OT', 'Antiguo ($oldTestamentCount)'),
                      const SizedBox(width: 8),
                      _buildTabChip('NT', 'Nuevo ($newTestamentCount)'),
                    ],
                  ),

                  const SizedBox(height: 14),

                  // Recent searches
                  if (query.isEmpty) ...[
                    Text(
                      'BÚSQUEDAS FRECUENTES',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.8,
                        color: theme.colorScheme.onSurface.withOpacity(0.6),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: _recentSearches.map((term) {
                        return ActionChip(
                          avatar: const Icon(LucideIcons.book, size: 13, color: SanctuaryColors.sunOrange),
                          label: Text(term, style: GoogleFonts.plusJakartaSans(fontSize: 11.5)),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          onPressed: () {
                            _searchController.text = term;
                            setState(() {});
                            final refMatch = _parseDirectReference(term);
                            if (refMatch != null) {
                              widget.onSelectPassage(refMatch.book.id, refMatch.chapter, refMatch.verse);
                            }
                          },
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 10),
                  ],
                ],
              ),
            ),
          ),

          // Books Grid
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 32),
            sliver: SliverGrid(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 1.6,
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
              ),
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final book = filteredBooks[index];
                  return InkWell(
                    onTap: () => _openChapterVersePicker(book),
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: theme.cardTheme.color,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: theme.colorScheme.outline.withOpacity(0.25)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: book.isNewTestament
                                      ? SanctuaryColors.waveNavy.withOpacity(0.12)
                                      : SanctuaryColors.sunOrange.withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  book.abbreviation,
                                  style: GoogleFonts.plusJakartaSans(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w800,
                                    color: book.isNewTestament ? SanctuaryColors.waveNavy : SanctuaryColors.sunOrange,
                                  ),
                                ),
                              ),
                              const Icon(LucideIcons.chevronRight, size: 14, color: Colors.grey),
                            ],
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                book.name,
                                style: GoogleFonts.merriweather(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 2),
                              Text(
                                '${book.totalChapters} Capítulos',
                                style: GoogleFonts.plusJakartaSans(
                                  fontSize: 11,
                                  color: theme.colorScheme.onSurface.withOpacity(0.6),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  );
                },
                childCount: filteredBooks.length,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTabChip(String filterKey, String label) {
    final isSelected = _activeTabFilter == filterKey;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      selectedColor: SanctuaryColors.waveNavy,
      labelStyle: TextStyle(
        color: isSelected ? Colors.white : null,
        fontWeight: FontWeight.w700,
        fontSize: 12,
      ),
      onSelected: (selected) {
        if (selected) setState(() => _activeTabFilter = filterKey);
      },
    );
  }
}

// 2-Step Chapter and Verse Selection Bottom Sheet
class _BookChapterVersePickerSheet extends StatefulWidget {
  final BibleBookInfo book;
  final Function(int chapter, int? verse) onSelectPassage;

  const _BookChapterVersePickerSheet({
    required this.book,
    required this.onSelectPassage,
  });

  @override
  State<_BookChapterVersePickerSheet> createState() => _BookChapterVersePickerSheetState();
}

class _BookChapterVersePickerSheetState extends State<_BookChapterVersePickerSheet> {
  int _selectedChapter = 1;
  int _step = 1; // 1: Chapters, 2: Verses

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      height: MediaQuery.of(context).size.height * 0.75,
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 20),
      child: Column(
        children: [
          // Handle
          Container(
            width: 40,
            height: 4,
            margin: const EdgeInsets.only(bottom: 12),
            decoration: BoxDecoration(
              color: Colors.grey.shade400,
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.book.name,
                    style: GoogleFonts.merriweather(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    widget.book.isNewTestament ? 'Nuevo Testamento' : 'Antiguo Testamento',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 11,
                      color: Colors.grey,
                    ),
                  ),
                ],
              ),
              // Step Switcher
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: theme.cardTheme.color,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey.withOpacity(0.2)),
                ),
                child: Row(
                  children: [
                    _buildStepButton(1, 'Capítulos'),
                    _buildStepButton(2, 'Versículos'),
                  ],
                ),
              ),
            ],
          ),

          const Divider(height: 20),

          // Step 1: Chapters Grid
          if (_step == 1) ...[
            Expanded(
              child: GridView.builder(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 6,
                  crossAxisSpacing: 8,
                  mainAxisSpacing: 8,
                ),
                itemCount: widget.book.totalChapters,
                itemBuilder: (context, index) {
                  final chNum = index + 1;
                  final isSelected = chNum == _selectedChapter;
                  return InkWell(
                    onTap: () {
                      setState(() {
                        _selectedChapter = chNum;
                        _step = 2;
                      });
                    },
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: isSelected ? SanctuaryColors.waveNavy : theme.cardTheme.color,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: isSelected ? SanctuaryColors.waveNavy : Colors.grey.withOpacity(0.25),
                        ),
                      ),
                      child: Text(
                        '$chNum',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: isSelected ? Colors.white : null,
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 10),
            FilledButton.icon(
              onPressed: () => widget.onSelectPassage(1, null),
              style: FilledButton.styleFrom(
                backgroundColor: SanctuaryColors.waveNavy,
                minimumSize: const Size.fromHeight(44),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              icon: const Icon(LucideIcons.bookOpen, size: 16),
              label: Text('Leer ${widget.book.name} desde el Inicio →'),
            ),
          ] else ...[
            // Step 2: Verses Grid
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Capítulo $_selectedChapter: Selecciona un versículo',
                  style: GoogleFonts.plusJakartaSans(
                    fontWeight: FontWeight.w700,
                    fontSize: 12.5,
                  ),
                ),
                TextButton.icon(
                  onPressed: () => widget.onSelectPassage(_selectedChapter, null),
                  icon: const Icon(LucideIcons.bookOpen, size: 14),
                  label: const Text('Leer Cap. Completo'),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Expanded(
              child: GridView.builder(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 6,
                  crossAxisSpacing: 8,
                  mainAxisSpacing: 8,
                ),
                itemCount: 35, // standard estimated chapter verses
                itemBuilder: (context, index) {
                  final vNum = index + 1;
                  return InkWell(
                    onTap: () => widget.onSelectPassage(_selectedChapter, vNum),
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: theme.cardTheme.color,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: Colors.grey.withOpacity(0.25)),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text('V.', style: TextStyle(fontSize: 8, color: Colors.grey.shade600)),
                          Text('$vNum', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildStepButton(int stepNumber, String label) {
    final isCurrent = _step == stepNumber;
    return GestureDetector(
      onTap: () => setState(() => _step = stepNumber),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: isCurrent ? SanctuaryColors.waveNavy : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          label,
          style: GoogleFonts.plusJakartaSans(
            fontSize: 11,
            fontWeight: FontWeight.w700,
            color: isCurrent ? Colors.white : Colors.grey,
          ),
        ),
      ),
    );
  }
}
