import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:path_provider/path_provider.dart';
import '../../../../core/constants/bible_books.dart';
import '../../../../core/providers/app_settings_providers.dart';
import '../../../../core/storage/app_database.dart';
import '../../../../core/theme/sanctuary_colors.dart';
import '../../../../core/theme/sanctuary_theme.dart';
import '../../../../core/utils/string_utils.dart';
import '../../../reader/domain/services/sanctuary_search_service.dart';
import '../../../../shared/widgets/quick_settings_sheet.dart';
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
  final SanctuarySearchService _searchService = SanctuarySearchService();
  Timer? _searchDebounce;
  List<BibleVerseSearchResult> _keywordResults = const [];
  bool _isSearchingVerses = false;
  int _searchGeneration = 0;
  String _activeTabFilter = 'all'; // 'all', 'OT', 'NT'
  final List<String> _recentSearches = [
    'Juan 3:16',
    'Salmos 23:1',
    'Romanos 8:28',
    'Filipenses 4:13',
    'Mateo 5:1',
    'Génesis 1:1'
  ];

  @override
  void initState() {
    super.initState();
    _loadRecentSearches();
  }

  Future<void> _loadRecentSearches() async {
    try {
      final dir = await getApplicationDocumentsDirectory();
      final file = File('${dir.path}/sanctuary_recent_searches.json');
      if (await file.exists()) {
        final content = await file.readAsString();
        final List<dynamic> jsonList = jsonDecode(content);
        if (jsonList.isNotEmpty) {
          setState(() {
            _recentSearches.clear();
            _recentSearches.addAll(jsonList.map((e) => e.toString()));
          });
        }
      }
    } catch (_) {}
  }

  Future<void> _saveRecentSearch(String term) async {
    final clean = term.trim();
    if (clean.isEmpty) return;
    setState(() {
      _recentSearches
          .removeWhere((item) => item.toLowerCase() == clean.toLowerCase());
      _recentSearches.insert(0, clean);
      if (_recentSearches.length > 8) {
        _recentSearches.removeLast();
      }
    });
    try {
      final dir = await getApplicationDocumentsDirectory();
      final file = File('${dir.path}/sanctuary_recent_searches.json');
      await file.writeAsString(jsonEncode(_recentSearches));
    } catch (_) {}
  }

  @override
  void dispose() {
    _searchDebounce?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  String _normalize(String input) {
    return normalizeSearchText(input);
  }

  String _getTranslationLabel(String translationKey) {
    switch (translationKey) {
      case 'sse':
        return 'Biblia del Oso 1569';
      case 'rv1858':
        return 'Reina Valera NT 1858';
      case 'valera':
      default:
        return 'Reina Valera 1909';
    }
  }

  void _handleSearchChanged(String value) {
    _searchDebounce?.cancel();
    final generation = ++_searchGeneration;
    final normalized = normalizeSearchText(value);
    if (normalized.length < 2) {
      setState(() {
        _keywordResults = const [];
        _isSearchingVerses = false;
      });
      return;
    }

    setState(() => _isSearchingVerses = true);
    _searchDebounce = Timer(const Duration(milliseconds: 280), () async {
      final database = widget.database;
      if (database == null) {
        if (mounted && generation == _searchGeneration) {
          setState(() {
            _keywordResults = const [];
            _isSearchingVerses = false;
          });
        }
        return;
      }
      final parsed = _searchService.parse(value);
      if (parsed.type == SearchType.directReference) {
        if (mounted && generation == _searchGeneration) {
          setState(() {
            _keywordResults = const [];
            _isSearchingVerses = false;
          });
        }
        return;
      }
      final activeTranslation = ref.read(appTranslationProvider);
      final results = await database.searchVersesByKeywordAndTranslation(
        keyword: normalized,
        activeTranslation: activeTranslation,
      );
      if (!mounted || generation != _searchGeneration) return;
      setState(() {
        _keywordResults = results;
        _isSearchingVerses = false;
      });
    });
  }

  void _selectPassage(String bookId, int chapter, int? verse) {
    _searchDebounce?.cancel();
    _searchGeneration++;
    _searchController.clear();
    setState(() {
      _keywordResults = const [];
      _isSearchingVerses = false;
    });
    widget.onSelectPassage(bookId, chapter, verse);
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

  void _openChapterVersePicker(BibleBookInfo book) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _BookChapterVersePickerSheet(
        book: book,
        onSelectPassage: (ch, verse) {
          Navigator.pop(ctx);
          _selectPassage(book.id, ch, verse);
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final tokens = context.sanctuaryTokens;
    final activeTranslation = ref.watch(appTranslationProvider);
    ref.listen<String>(appTranslationProvider, (previous, next) {
      if (previous != next && _searchController.text.trim().length >= 2) {
        _handleSearchChanged(_searchController.text);
      }
    });

    final rawQuery = _searchController.text.trim();
    final normQuery = _normalize(rawQuery);

    final allBooks = widget.database != null
        ? (ref.watch(bibleBooksStreamProvider(widget.database!)).valueOrNull ??
            kBibleBooks)
        : kBibleBooks;

    final directRef = _parseDirectReference(rawQuery, allBooks);

    final filteredBooks = allBooks.where((book) {
      final normName = _normalize(book.name);
      final normNameWithoutSan = normName.replaceFirst('san ', '');
      final normAbbr = _normalize(book.abbreviation);
      final normId = _normalize(book.id);

      final matchesQuery = normQuery.isEmpty ||
          normName.contains(normQuery) ||
          normNameWithoutSan.contains(normQuery) ||
          normAbbr.contains(normQuery) ||
          normId == normQuery;

      if (_activeTabFilter == 'OT') {
        return matchesQuery && !book.isNewTestament;
      } else if (_activeTabFilter == 'NT') {
        return matchesQuery && book.isNewTestament;
      }
      return matchesQuery;
    }).toList();

    final oldTestamentCount = allBooks.where((b) => !b.isNewTestament).length;
    final newTestamentCount = allBooks.where((b) => b.isNewTestament).length;

    return Scaffold(
      appBar: AppBar(
        leading: const IconButton(
          icon: Icon(LucideIcons.menu),
          tooltip: 'Menú Lateral',
          onPressed: openSanctuaryDrawer,
        ),
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              LucideIcons.library, // O LucideIcons.bookOpen
              size: 20,
              color: SanctuaryColors.sunOrange,
            ),
            const SizedBox(width: 8),
            Text(
              'Biblioteca Bíblica',
              style: GoogleFonts.inter(
                fontWeight: FontWeight.w700,
                fontSize: 17,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.settings2),
            tooltip: 'Ajustes Rápidos',
            onPressed: () => QuickSettingsSheet.show(context),
          ),
        ],
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
                    onChanged: (value) {
                      setState(() {});
                      _handleSearchChanged(value);
                    },
                    onSubmitted: (val) {
                      final clean = val.trim();
                      if (clean.isEmpty) return;
                      _saveRecentSearch(clean);
                      if (directRef != null) {
                        _selectPassage(directRef.book.id, directRef.chapter,
                            directRef.verse);
                      } else {
                        final bookMatch = _findMatchingBook(clean, allBooks);
                        if (bookMatch != null) {
                          _openChapterVersePicker(bookMatch);
                        }
                      }
                    },
                    decoration: InputDecoration(
                      prefixIcon: const Icon(LucideIcons.search, size: 18),
                      hintText:
                          'Buscar libro o cita (ej: Juan 3:16, Mateo 4, Salmos)',
                      hintStyle: GoogleFonts.inter(fontSize: 13),
                      filled: true,
                      fillColor: theme.cardTheme.color,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: BorderSide(
                            color: theme.colorScheme.outline
                                .withValues(alpha: 0.3)),
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
                      onTap: () {
                        final term =
                            '${directRef.book.name} ${directRef.chapter}${directRef.verse != null ? ':${directRef.verse}' : ''}';
                        _saveRecentSearch(term);
                        _selectPassage(
                          directRef.book.id,
                          directRef.chapter,
                          directRef.verse,
                        );
                      },
                      borderRadius: BorderRadius.circular(14),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 10),
                        decoration: BoxDecoration(
                          color: tokens.activeState,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                              color: SanctuaryColors.amberGold
                                  .withValues(alpha: 0.6)),
                          boxShadow: [
                            BoxShadow(
                              color: tokens.activeState.withValues(alpha: 0.25),
                              blurRadius: 8,
                              offset: const Offset(0, 3),
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            const Icon(LucideIcons.bookOpen,
                                color: SanctuaryColors.amberGold, size: 20),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                'Ir directo a ${directRef.book.name} ${directRef.chapter}${directRef.verse != null ? ':${directRef.verse}' : ''}',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: GoogleFonts.inter(
                                  fontWeight: FontWeight.w700,
                                  fontSize: 13.5,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: SanctuaryColors.sunOrange,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                'Abrir →',
                                style: GoogleFonts.inter(
                                  color: Colors.white,
                                  fontSize: 11.5,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],

                  const SizedBox(height: 14),

                  // Filter Tabs in Institutional Navy Palette
                  Wrap(
                    alignment: WrapAlignment.center,
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _buildTabChip('all', 'Todos (66)', tokens),
                      _buildTabChip(
                          'OT', 'Antiguo ($oldTestamentCount)', tokens),
                      _buildTabChip('NT', 'Nuevo ($newTestamentCount)', tokens),
                    ],
                  ),

                  const SizedBox(height: 14),

                  // Recent searches in Institutional Palette
                  if (rawQuery.isEmpty) ...[
                    Text(
                      'BÚSQUEDAS FRECUENTES',
                      style: GoogleFonts.inter(
                        fontSize: 10.5,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.8,
                        color:
                            theme.colorScheme.onSurface.withValues(alpha: 0.65),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: _recentSearches.map((term) {
                        return Material(
                          color: Colors.transparent,
                          child: InkWell(
                            onTap: () {
                              _searchController.text = term;
                              _saveRecentSearch(term);
                              setState(() {});
                              final refMatch =
                                  _parseDirectReference(term, allBooks);
                              if (refMatch != null) {
                                _selectPassage(refMatch.book.id,
                                    refMatch.chapter, refMatch.verse);
                              } else {
                                final bMatch =
                                    _findMatchingBook(term, allBooks);
                                if (bMatch != null) {
                                  _openChapterVersePicker(bMatch);
                                } else {
                                  _handleSearchChanged(term);
                                }
                              }
                            },
                            borderRadius: BorderRadius.circular(12),
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 12, vertical: 7.5),
                              decoration: BoxDecoration(
                                color: tokens.surfaceElevated,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: theme.colorScheme.outline
                                      .withValues(alpha: 0.25),
                                  width: 1.1,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.04),
                                    blurRadius: 3,
                                    offset: const Offset(0, 1),
                                  ),
                                ],
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(
                                    LucideIcons.book,
                                    size: 13,
                                    color: SanctuaryColors.sunOrange,
                                  ),
                                  const SizedBox(width: 6),
                                  Flexible(
                                    child: Text(
                                      term,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: GoogleFonts.inter(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w700,
                                        color: theme.colorScheme.onSurface,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 10),
                  ],
                ],
              ),
            ),
          ),

          if (rawQuery.length >= 2 &&
              (_keywordResults.isNotEmpty || _isSearchingVerses))
            _buildKeywordResultsSliver(theme, activeTranslation),

          if (rawQuery.isNotEmpty && filteredBooks.isNotEmpty)
            _buildBookChipsSliver(filteredBooks, theme),

          // Books Grid
          if (rawQuery.isEmpty)
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
                          border: Border.all(
                              color: theme.colorScheme.outline
                                  .withValues(alpha: 0.25)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: book.isNewTestament
                                        ? SanctuaryColors.waveNavy
                                            .withValues(alpha: 0.12)
                                        : SanctuaryColors.sunOrange
                                            .withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    book.abbreviation,
                                    style: GoogleFonts.inter(
                                      fontSize: 10,
                                      fontWeight: FontWeight.w800,
                                      color: book.isNewTestament
                                          ? (tokens.activeState ==
                                                  SanctuaryColors.darkActive
                                              ? SanctuaryColors.cyanAccent
                                              : SanctuaryColors.waveNavy)
                                          : SanctuaryColors.sunOrange,
                                    ),
                                  ),
                                ),
                                const Icon(LucideIcons.chevronRight,
                                    size: 14, color: Colors.grey),
                              ],
                            ),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  book.name,
                                  style: GoogleFonts.playfairDisplay(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w700,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  '${book.totalChapters} Capítulos',
                                  style: GoogleFonts.inter(
                                    fontSize: 11,
                                    color: theme.colorScheme.onSurface
                                        .withValues(alpha: 0.6),
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

  Widget _buildBookChipsSliver(
    List<BibleBookInfo> books,
    ThemeData theme,
  ) {
    final uniqueBooks = <String, BibleBookInfo>{};
    for (final book in books) {
      uniqueBooks.putIfAbsent(book.id, () => book);
    }

    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'LIBROS COINCIDENTES',
              style: GoogleFonts.inter(
                fontSize: 10.5,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.8,
                color: theme.colorScheme.onSurface.withValues(alpha: 0.65),
              ),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: uniqueBooks.values.map((book) {
                return ActionChip(
                  avatar: Icon(
                    LucideIcons.bookOpen,
                    size: 15,
                    color: book.isNewTestament
                        ? SanctuaryColors.waveNavy
                        : SanctuaryColors.sunOrange,
                  ),
                  label: Text(
                    book.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  onPressed: () => _openChapterVersePicker(book),
                );
              }).toList(growable: false),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildKeywordResultsSliver(ThemeData theme, String activeTranslation) {
    final translationLabel = _getTranslationLabel(activeTranslation);
    final headerTitle =
        'RESULTADOS EN ${translationLabel.toUpperCase()} (${activeTranslation.toUpperCase()})';

    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    headerTitle,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.inter(
                      fontSize: 10.5,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.8,
                      color: theme.brightness == Brightness.dark
                          ? SanctuaryColors.darkOnSurface
                              .withValues(alpha: 0.75)
                          : SanctuaryColors.waveNavy,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                if (_isSearchingVerses)
                  const SizedBox(
                    width: 14,
                    height: 14,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: SanctuaryColors.sunOrange,
                    ),
                  )
                else if (_keywordResults.isNotEmpty)
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                    decoration: BoxDecoration(
                      color: theme.brightness == Brightness.dark
                          ? SanctuaryColors.darkSurfaceElevated
                          : SanctuaryColors.amberGold.withValues(alpha: 0.18),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: SanctuaryColors.amberGold.withValues(alpha: 0.5),
                        width: 0.8,
                      ),
                    ),
                    child: Text(
                      '${_keywordResults.length}',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.inter(
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        color: theme.brightness == Brightness.dark
                            ? SanctuaryColors.amberGold
                            : SanctuaryColors.waveNavy,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 8),
            if (_isSearchingVerses && _keywordResults.isEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 12),
                child: Row(
                  children: [
                    const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: SanctuaryColors.sunOrange,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Buscando pasajes en $translationLabel...',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontStyle: FontStyle.italic,
                          color: theme.colorScheme.onSurface
                              .withValues(alpha: 0.65),
                        ),
                      ),
                    ),
                  ],
                ),
              )
            else if (_keywordResults.isEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: Text(
                  'No se encontraron versículos en $translationLabel.',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
                  ),
                ),
              )
            else
              ..._keywordResults.map(
                (result) => Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  decoration: BoxDecoration(
                    color: theme.brightness == Brightness.dark
                        ? SanctuaryColors.darkSurfaceElevated
                        : SanctuaryColors.lightSurface,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: theme.brightness == Brightness.dark
                          ? SanctuaryColors.darkBorder
                          : SanctuaryColors.lightBorder,
                      width: 1,
                    ),
                  ),
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: () => _selectPassage(
                        result.bookId,
                        result.chapter,
                        result.verse,
                      ),
                      borderRadius: BorderRadius.circular(12),
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(6),
                              decoration: BoxDecoration(
                                color: SanctuaryColors.amberGold
                                    .withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Icon(
                                LucideIcons.bookOpen,
                                size: 16,
                                color: SanctuaryColors.waveNavy,
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Text(
                                          '${result.bookName} ${result.chapter}:${result.verse}',
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: GoogleFonts.inter(
                                            fontSize: 12.5,
                                            fontWeight: FontWeight.w800,
                                            color: theme.brightness ==
                                                    Brightness.dark
                                                ? SanctuaryColors.amberGold
                                                : SanctuaryColors.waveNavy,
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 6),
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: theme.brightness ==
                                                  Brightness.dark
                                              ? SanctuaryColors.darkSurface
                                              : SanctuaryColors.parchmentPaper,
                                          borderRadius:
                                              BorderRadius.circular(4),
                                          border: Border.all(
                                            color: SanctuaryColors.amberGold
                                                .withValues(alpha: 0.5),
                                            width: 0.8,
                                          ),
                                        ),
                                        child: Text(
                                          activeTranslation.toUpperCase(),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: GoogleFonts.inter(
                                            fontSize: 9.5,
                                            fontWeight: FontWeight.w700,
                                            color: theme.brightness ==
                                                    Brightness.dark
                                                ? SanctuaryColors.darkOnSurface
                                                : SanctuaryColors.waveNavy,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Text.rich(
                                    _highlightVerseText(
                                      result.text,
                                      _searchController.text,
                                      theme,
                                    ),
                                    maxLines: 3,
                                    overflow: TextOverflow.ellipsis,
                                    style: GoogleFonts.lora(
                                      fontSize: 13,
                                      height: 1.4,
                                      color: theme.colorScheme.onSurface,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 6),
                            Icon(
                              LucideIcons.chevronRight,
                              size: 16,
                              color: theme.colorScheme.onSurface
                                  .withValues(alpha: 0.4),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  TextSpan _highlightVerseText(
    String text,
    String query,
    ThemeData theme,
  ) {
    final normalizedText = normalizeSearchText(text);
    final normalizedQuery = normalizeSearchText(query);
    final matchIndex = normalizedText.indexOf(normalizedQuery);
    if (normalizedQuery.isEmpty || matchIndex < 0) {
      return TextSpan(text: text);
    }

    final sourceCharacters = text.characters.toList();
    final startSource = matchIndex.clamp(0, sourceCharacters.length - 1);
    final endNormalized = matchIndex + normalizedQuery.length;
    final endSource =
        endNormalized.clamp(startSource + 1, sourceCharacters.length);

    return TextSpan(
      children: [
        TextSpan(text: sourceCharacters.sublist(0, startSource).join()),
        TextSpan(
          text: sourceCharacters.sublist(startSource, endSource).join(),
          style: TextStyle(
            color: SanctuaryColors.sunOrange,
            backgroundColor: SanctuaryColors.amberGold.withValues(alpha: 0.22),
            fontWeight: FontWeight.w800,
          ),
        ),
        TextSpan(text: sourceCharacters.sublist(endSource).join()),
      ],
      style: TextStyle(color: theme.colorScheme.onSurface),
    );
  }

  Widget _buildTabChip(
      String filterKey, String label, SanctuaryThemeExtension tokens) {
    final isSelected = _activeTabFilter == filterKey;
    final theme = Theme.of(context);
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => setState(() => _activeTabFilter = filterKey),
        borderRadius: BorderRadius.circular(20),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? tokens.activeState : tokens.surfaceElevated,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: isSelected
                  ? SanctuaryColors.amberGold
                  : theme.colorScheme.outline.withValues(alpha: 0.25),
              width: 1.2,
            ),
            boxShadow: [
              BoxShadow(
                color: isSelected
                    ? tokens.activeState.withValues(alpha: 0.3)
                    : Colors.black.withValues(alpha: 0.04),
                blurRadius: 5,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Text(
            label,
            style: GoogleFonts.inter(
              color: isSelected ? Colors.white : theme.colorScheme.onSurface,
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
    final tokens = context.sanctuaryTokens;

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
              color: theme.colorScheme.onSurface.withValues(alpha: 0.3),
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.book.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.playfairDisplay(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      widget.book.isNewTestament
                          ? 'Nuevo Testamento'
                          : 'Antiguo Testamento',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        color:
                            theme.colorScheme.onSurface.withValues(alpha: 0.6),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              // Step Switcher
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: tokens.surfaceElevated,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                      color: theme.colorScheme.outline.withValues(alpha: 0.2)),
                ),
                child: Row(
                  children: [
                    _buildStepButton(1, 'Capítulos', tokens),
                    _buildStepButton(2, 'Versículos', tokens),
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
                            ? tokens.activeState
                            : theme.cardTheme.color,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: isSelected
                              ? tokens.activeState
                              : theme.colorScheme.outline
                                  .withValues(alpha: 0.25),
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
                backgroundColor: tokens.activeState,
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
                Expanded(
                  child: Text(
                    'Capítulo $_selectedChapter: Selecciona un versículo',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.inter(
                      fontWeight: FontWeight.w700,
                      fontSize: 12.5,
                    ),
                  ),
                ),
                const SizedBox(width: 6),
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
                        border: Border.all(
                            color: theme.colorScheme.outline
                                .withValues(alpha: 0.25)),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text('V.',
                              style: TextStyle(
                                  fontSize: 8,
                                  color: theme.colorScheme.onSurface
                                      .withValues(alpha: 0.6))),
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

  Widget _buildStepButton(
      int stepNumber, String label, SanctuaryThemeExtension tokens) {
    final isCurrent = _step == stepNumber;
    return GestureDetector(
      onTap: () => setState(() => _step = stepNumber),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: isCurrent ? tokens.activeState : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 11,
            fontWeight: FontWeight.w700,
            color: isCurrent
                ? Colors.white
                : Theme.of(context)
                    .colorScheme
                    .onSurface
                    .withValues(alpha: 0.6),
          ),
        ),
      ),
    );
  }
}
