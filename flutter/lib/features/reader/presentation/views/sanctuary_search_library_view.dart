import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../../core/constants/bible_books.dart';
import '../../../../core/providers/app_settings_providers.dart';
import '../../../../core/storage/app_database.dart';
import '../../../../core/theme/sanctuary_colors.dart';
import '../../../shell/presentation/views/sanctuary_main_shell.dart';

class SanctuarySearchLibraryView extends ConsumerStatefulWidget {
  final Function(String bookId, int chapter, int? verse) onSelectPassage;
  final AppDatabase? database;

  const SanctuarySearchLibraryView({
    super.key,
    required this.onSelectPassage,
    this.database,
  });

  @override
  ConsumerState<SanctuarySearchLibraryView> createState() =>
      _SanctuarySearchLibraryViewState();
}

class _SanctuarySearchLibraryViewState
    extends ConsumerState<SanctuarySearchLibraryView> {
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

  String _normalize(String input) {
    return input
        .toLowerCase()
        .replaceAll('á', 'a')
        .replaceAll('é', 'e')
        .replaceAll('í', 'i')
        .replaceAll('ó', 'o')
        .replaceAll('ú', 'u')
        .replaceAll('ü', 'u')
        .replaceAll('ñ', 'n')
        .replaceAll(RegExp(r'\s+'), ' ')
        .trim();
  }

  BibleBookInfo? _findMatchingBook(
      String bookQuery, List<BibleBookInfo> allBooks) {
    final query = _normalize(bookQuery);
    if (query.isEmpty) return null;

    const Map<String, String> aliases = {
      'mateo': 'MAT',
      'san mateo': 'MAT',
      's. mateo': 'MAT',
      's mateo': 'MAT',
      'mat': 'MAT',
      'mt': 'MAT',
      'marcos': 'MRK',
      'san marcos': 'MRK',
      's. marcos': 'MRK',
      's marcos': 'MRK',
      'mrk': 'MRK',
      'mc': 'MRK',
      'lucas': 'LUK',
      'san lucas': 'LUK',
      's. lucas': 'LUK',
      's lucas': 'LUK',
      'luk': 'LUK',
      'lc': 'LUK',
      'juan': 'JHN',
      'san juan': 'JHN',
      's. juan': 'JHN',
      's juan': 'JHN',
      'jhn': 'JHN',
      'jn': 'JHN',
      'hechos': 'ACT',
      'hechos de los apostoles': 'ACT',
      'hch': 'ACT',
      'act': 'ACT',
      'romanos': 'ROM',
      'rom': 'ROM',
      'ro': 'ROM',
      '1 corintios': '1CO',
      '1corintios': '1CO',
      '1 cor': '1CO',
      '1cor': '1CO',
      '1co': '1CO',
      '1 co': '1CO',
      '2 corintios': '2CO',
      '2corintios': '2CO',
      '2 cor': '2CO',
      '2cor': '2CO',
      '2co': '2CO',
      '2 co': '2CO',
      'galatas': 'GAL',
      'gal': 'GAL',
      'efesios': 'EPH',
      'efe': 'EPH',
      'eph': 'EPH',
      'filipenses': 'PHP',
      'fil': 'PHP',
      'php': 'PHP',
      'colosenses': 'COL',
      'col': 'COL',
      '1 tesalonicenses': '1TH',
      '1tesalonicenses': '1TH',
      '1 tes': '1TH',
      '1tes': '1TH',
      '1th': '1TH',
      '1 th': '1TH',
      '2 tesalonicenses': '2TH',
      '2tesalonicenses': '2TH',
      '2 tes': '2TH',
      '2tes': '2TH',
      '2th': '2TH',
      '2 th': '2TH',
      '1 timoteo': '1TI',
      '1timoteo': '1TI',
      '1 tim': '1TI',
      '1tim': '1TI',
      '1ti': '1TI',
      '1 ti': '1TI',
      '2 timoteo': '2TI',
      '2timoteo': '2TI',
      '2 tim': '2TI',
      '2tim': '2TI',
      '2ti': '2TI',
      '2 ti': '2TI',
      'tito': 'TIT',
      'tit': 'TIT',
      'filemon': 'PHM',
      'phm': 'PHM',
      'flm': 'PHM',
      'hebreos': 'HEB',
      'heb': 'HEB',
      'santiago': 'JAS',
      'stg': 'JAS',
      'jas': 'JAS',
      '1 pedro': '1PE',
      '1pedro': '1PE',
      '1 ped': '1PE',
      '1ped': '1PE',
      '1pe': '1PE',
      '1 pe': '1PE',
      '2 pedro': '2PE',
      '2pedro': '2PE',
      '2 ped': '2PE',
      '2ped': '2PE',
      '2pe': '2PE',
      '2 pe': '2PE',
      '1 juan': '1JN',
      '1juan': '1JN',
      '1 jn': '1JN',
      '1jn': '1JN',
      '1 j': '1JN',
      '1j': '1JN',
      '2 juan': '2JN',
      '2juan': '2JN',
      '2 jn': '2JN',
      '2jn': '2JN',
      '2 j': '2JN',
      '2j': '2JN',
      '3 juan': '3JN',
      '3juan': '3JN',
      '3 jn': '3JN',
      '3jn': '3JN',
      '3 j': '3JN',
      '3j': '3JN',
      'judas': 'JUD',
      'jud': 'JUD',
      'jds': 'JUD',
      'apocalipsis': 'REV',
      'apoc': 'REV',
      'apo': 'REV',
      'rev': 'REV',
      'revelacion': 'REV',
      'genesis': 'GEN',
      'gen': 'GEN',
      'gn': 'GEN',
      'exodo': 'EXO',
      'exo': 'EXO',
      'ex': 'EXO',
      'levitico': 'LEV',
      'lev': 'LEV',
      'lv': 'LEV',
      'numeros': 'NUM',
      'num': 'NUM',
      'nm': 'NUM',
      'deuteronomio': 'DEU',
      'deu': 'DEU',
      'dt': 'DEU',
      'josue': 'JOS',
      'jos': 'JOS',
      'jueces': 'JDG',
      'jue': 'JDG',
      'jdc': 'JDG',
      'rut': 'RUT',
      'rt': 'RUT',
      '1 samuel': '1SA',
      '1samuel': '1SA',
      '1 sam': '1SA',
      '1sam': '1SA',
      '1sa': '1SA',
      '1 sa': '1SA',
      '2 samuel': '2SA',
      '2samuel': '2SA',
      '2 sam': '2SA',
      '2sam': '2SA',
      '2sa': '2SA',
      '2 sa': '2SA',
      '1 reyes': '1KI',
      '1reyes': '1KI',
      '1 rey': '1KI',
      '1rey': '1KI',
      '1ki': '1KI',
      '1 ki': '1KI',
      '2 reyes': '2KI',
      '2reyes': '2KI',
      '2 rey': '2KI',
      '2rey': '2KI',
      '2ki': '2KI',
      '2 ki': '2KI',
      '1 cronicas': '1CH',
      '1cronicas': '1CH',
      '1 cro': '1CH',
      '1cro': '1CH',
      '1ch': '1CH',
      '1 ch': '1CH',
      '2 cronicas': '2CH',
      '2cronicas': '2CH',
      '2 cro': '2CH',
      '2cro': '2CH',
      '2ch': '2CH',
      '2 ch': '2CH',
      'esdras': 'EZR',
      'ezr': 'EZR',
      'nehemias': 'NEH',
      'neh': 'NEH',
      'ester': 'EST',
      'est': 'EST',
      'job': 'JOB',
      'jb': 'JOB',
      'salmos': 'PSA',
      'salmo': 'PSA',
      'sal': 'PSA',
      'psa': 'PSA',
      'ps': 'PSA',
      'proverbios': 'PRO',
      'proverbio': 'PRO',
      'prov': 'PRO',
      'pro': 'PRO',
      'prv': 'PRO',
      'eclesiastes': 'ECC',
      'ecl': 'ECC',
      'ec': 'ECC',
      'cantares': 'SNG',
      'cantar': 'SNG',
      'cantar de los cantares': 'SNG',
      'cant': 'SNG',
      'sng': 'SNG',
      'isaias': 'ISA',
      'isa': 'ISA',
      'is': 'ISA',
      'jeremias': 'JER',
      'jer': 'JER',
      'jr': 'JER',
      'lamentaciones': 'LAM',
      'lam': 'LAM',
      'ezequiel': 'EZK',
      'ezk': 'EZK',
      'eze': 'EZK',
      'daniel': 'DAN',
      'dan': 'DAN',
      'dn': 'DAN',
      'oseas': 'HOS',
      'hos': 'HOS',
      'os': 'HOS',
      'joel': 'JOL',
      'jol': 'JOL',
      'jl': 'JOL',
      'amos': 'AMO',
      'amo': 'AMO',
      'am': 'AMO',
      'abdias': 'OBA',
      'oba': 'OBA',
      'ob': 'OBA',
      'jonas': 'JON',
      'jon': 'JON',
      'miqueas': 'MIC',
      'mic': 'MIC',
      'miq': 'MIC',
      'nahum': 'NAM',
      'nam': 'NAM',
      'nah': 'NAM',
      'habacuc': 'HAB',
      'hab': 'HAB',
      'sofonias': 'ZEP',
      'zep': 'ZEP',
      'sof': 'ZEP',
      'hageo': 'HAG',
      'hag': 'HAG',
      'hg': 'HAG',
      'zacarias': 'ZEC',
      'zec': 'ZEC',
      'zac': 'ZEC',
      'malaquias': 'MAL',
      'mal': 'MAL',
    };

    if (aliases.containsKey(query)) {
      final bookId = aliases[query]!;
      try {
        return allBooks.firstWhere((b) => b.id.toUpperCase() == bookId);
      } catch (_) {}
    }

    try {
      return allBooks.firstWhere((b) {
        final normName = _normalize(b.name);
        final normNameWithoutSan = normName.replaceFirst('san ', '');
        final normAbbr = _normalize(b.abbreviation);
        final normId = _normalize(b.id);
        return normName == query ||
            normNameWithoutSan == query ||
            normAbbr == query ||
            normId == query ||
            normName.startsWith(query) ||
            normNameWithoutSan.startsWith(query);
      });
    } catch (_) {
      return null;
    }
  }

  // Fast direct reference detector (e.g. "Juan 3:16", "Mateo 5", "Salmos 23")
  ({BibleBookInfo book, int chapter, int? verse})? _parseDirectReference(
      String query, List<BibleBookInfo> allBooks) {
    final trimmed = query.trim();
    if (trimmed.isEmpty) return null;

    final regex = RegExp(
        r'^([1-3]?\s?[A-Za-zÁÉÍÓÚáéíóúñÜü\.]+)\s*(\d+)?(?:\s*[:,\.]\s*(\d+))?$',
        caseSensitive: false);
    final match = regex.firstMatch(trimmed);

    if (match != null) {
      final bookPart = match.group(1)?.trim() ?? '';
      final chapterPart = match.group(2);
      final versePart = match.group(3);

      final matchedBook = _findMatchingBook(bookPart, allBooks);
      if (matchedBook != null) {
        final chapterNum =
            chapterPart != null ? (int.tryParse(chapterPart) ?? 1) : 1;
        final verseNum = versePart != null ? int.tryParse(versePart) : null;

        final safeChapter = chapterNum.clamp(1, matchedBook.totalChapters);
        return (book: matchedBook, chapter: safeChapter, verse: verseNum);
      }
    }

    final singleBook = _findMatchingBook(trimmed, allBooks);
    if (singleBook != null) {
      return (book: singleBook, chapter: 1, verse: null);
    }

    return null;
  }

  Widget _buildTabChip(String filterKey, String label) {
    final isSelected = _activeTabFilter == filterKey;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => setState(() => _activeTabFilter = filterKey),
        borderRadius: BorderRadius.circular(20),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            color: isSelected
                ? SanctuaryColors.amberGold
                : SanctuaryColors.waveNavy,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: isSelected
                  ? SanctuaryColors.amberGold
                  : SanctuaryColors.amberGold.withValues(alpha: 0.35),
              width: 1.2,
            ),
            boxShadow: [
              BoxShadow(
                color: isSelected
                    ? SanctuaryColors.amberGold.withValues(alpha: 0.35)
                    : SanctuaryColors.waveNavy.withValues(alpha: 0.15),
                blurRadius: 5,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Text(
            label,
            style: GoogleFonts.inter(
              color: isSelected ? SanctuaryColors.waveNavy : Colors.white,
              fontWeight: FontWeight.w700,
              fontSize: 12,
            ),
          ),
        ),
      ),
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
  State<_BookChapterVersePickerSheet> createState() =>
      _BookChapterVersePickerSheetState();
}

class _BookChapterVersePickerSheetState
    extends State<_BookChapterVersePickerSheet> {
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
                    style: GoogleFonts.playfairDisplay(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    widget.book.isNewTestament
                        ? 'Nuevo Testamento'
                        : 'Antiguo Testamento',
                    style: GoogleFonts.inter(
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
                        color: isSelected
                            ? SanctuaryColors.waveNavy
                            : theme.cardTheme.color,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: isSelected
                              ? SanctuaryColors.waveNavy
                              : Colors.grey.withOpacity(0.25),
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
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
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
                  style: GoogleFonts.inter(
                    fontWeight: FontWeight.w700,
                    fontSize: 12.5,
                  ),
                ),
                TextButton.icon(
                  onPressed: () =>
                      widget.onSelectPassage(_selectedChapter, null),
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
                        border:
                            Border.all(color: Colors.grey.withOpacity(0.25)),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text('V.',
                              style: TextStyle(
                                  fontSize: 8, color: Colors.grey.shade600)),
                          Text('$vNum',
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold, fontSize: 13)),
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
          style: GoogleFonts.inter(
            fontSize: 11,
            fontWeight: FontWeight.w700,
            color: isCurrent ? Colors.white : Colors.grey,
          ),
        ),
      ),
    );
  }
}
