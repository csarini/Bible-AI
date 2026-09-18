import React, { useState, useEffect, useMemo } from 'react';
import { Search, Book, Sparkles, BookOpen, ChevronRight, X, ArrowLeft, Check, Compass, Layers } from 'lucide-react';
import { fetchBibleChapter } from '../data/bibleData';
import { getLocalBooksSync } from '../services/bibleDatabaseService';
import { StorageService } from '../services/storageService';
import { BibleBook, BibleVerse } from '../types';

interface SearchViewProps {
  onSelectBookAndChapter: (bookId: string, chapter: number, verseNum?: number) => void;
  recentSearches: string[];
  onPerformSearchText: (query: string) => void;
  currentTheme?: 'light' | 'sepia' | 'dark';
  currentTranslation?: string;
}

export const SearchView: React.FC<SearchViewProps> = ({
  onSelectBookAndChapter,
  recentSearches: propRecentSearches,
  onPerformSearchText,
  currentTheme = 'light',
  currentTranslation = 'valera'
}) => {
  const isDark = currentTheme === 'dark';
  const isSepia = currentTheme === 'sepia';

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    return propRecentSearches && propRecentSearches.length > 0
      ? propRecentSearches
      : StorageService.getRecentSearches();
  });

  const saveRecentSearch = (term: string) => {
    if (!term || !term.trim()) return;
    const updated = StorageService.addRecentSearch(term.trim());
    setRecentSearches(updated);
  };

  const headerTitleColor = isDark ? 'text-white' : isSepia ? 'text-[#3B2D1F]' : 'text-[#000666]';
  const subtextColor = isDark ? 'text-white/60' : isSepia ? 'text-[#705335]' : 'text-[#767683]';
  const bookCardBg = isDark
    ? 'bg-[#131722] border-white/10 text-white hover:bg-[#1C2337] hover:border-[#FED65B]'
    : isSepia
    ? 'bg-[#FAF6EF] border-[#705335]/20 text-[#3B2D1F] hover:bg-[#FFFFFF] hover:border-[#705335]'
    : 'bg-white border-[#0B2B68]/15 text-[#000666] hover:bg-[#F0F4FA] hover:border-[#FED65B] shadow-2xs';
  const bookCardSelected = isDark
    ? 'bg-[#1C2337] border-[#FED65B] ring-2 ring-[#FED65B] text-white'
    : isSepia
    ? 'bg-[#EAE0D0] border-[#705335] ring-2 ring-[#705335] text-[#3B2D1F]'
    : 'bg-[#0B2B68] text-[#FED65B] border-[#FED65B] ring-2 ring-[#FED65B]';
  const tabInactiveBg = isDark
    ? 'bg-[#1C2337] text-white/80 border border-white/20 hover:bg-[#252E46]'
    : isSepia
    ? 'bg-[#FAF6EF] text-[#705335] border border-[#705335]/25 hover:bg-white'
    : 'bg-white text-[#0B2B68] border border-[#0B2B68]/20 hover:bg-[#F0F4FA] font-medium shadow-2xs';
  const sectionBg = isDark
    ? 'bg-[#131722] border-white/10'
    : isSepia
    ? 'bg-[#FAF6EF] border-[#705335]/20'
    : 'bg-[#F5F3EE] border-[#C6C5D4]';
  const modalBg = isDark
    ? 'bg-[#131722] border-white/15 text-white'
    : isSepia
    ? 'bg-[#FAF6EF] border-[#705335]/20 text-[#3B2D1F]'
    : 'bg-[#FBF9F4] border-[#C6C5D4] text-[#1B1C19]';
  const gridItemBg = isDark
    ? 'bg-[#1C2337] border-white/15 text-white hover:bg-[#252E46]'
    : isSepia
    ? 'bg-[#FFFFFF] border-[#705335]/20 text-[#3B2D1F] hover:bg-[#FAF6EF]'
    : 'bg-white border-[#0B2B68]/15 text-[#0B2B68] hover:bg-[#FED65B]/40 font-medium shadow-2xs';
  const [searchFilter, setSearchFilter] = useState('');
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'OT' | 'NT'>('all');
  
  const allBooks = getLocalBooksSync(currentTranslation);

  // Selected book and chapter for the selector modal / inline viewer
  const [selectedBook, setSelectedBook] = useState<BibleBook>(() => {
    return allBooks.find(b => b.id === 'MAT') || allBooks[0];
  });
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [selectorStep, setSelectorStep] = useState<'chapters' | 'verses'>('chapters');
  const [isSelectorModalOpen, setIsSelectorModalOpen] = useState<boolean>(false);
  
  // Chapter verses state for the verse picker
  const [chapterVerses, setChapterVerses] = useState<BibleVerse[]>([]);
  const [loadingVerses, setLoadingVerses] = useState<boolean>(false);

  const oldTestament = useMemo(() => {
    const seen = new Set<string>();
    return allBooks.filter(b => {
      if (b.testament !== 'OT') return false;
      if (seen.has(b.id)) return false;
      seen.add(b.id);
      return true;
    });
  }, [allBooks]);

  const newTestament = useMemo(() => {
    const seen = new Set<string>();
    return allBooks.filter(b => {
      if (b.testament !== 'NT') return false;
      if (seen.has(b.id)) return false;
      seen.add(b.id);
      return true;
    });
  }, [allBooks]);

  const normalize = (input: string) => {
    return input
      .toLowerCase()
      .replaceAll('á', 'a')
      .replaceAll('é', 'e')
      .replaceAll('í', 'i')
      .replaceAll('ó', 'o')
      .replaceAll('ú', 'u')
      .replaceAll('ü', 'u')
      .replaceAll('ñ', 'n')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const aliases: Record<string, string> = {
    'mateo': 'MAT', 'san mateo': 'MAT', 's. mateo': 'MAT', 's mateo': 'MAT', 'mat': 'MAT', 'mt': 'MAT',
    'marcos': 'MRK', 'san marcos': 'MRK', 's. marcos': 'MRK', 's marcos': 'MRK', 'mrk': 'MRK', 'mc': 'MRK',
    'lucas': 'LUK', 'san lucas': 'LUK', 's. lucas': 'LUK', 's lucas': 'LUK', 'luk': 'LUK', 'lc': 'LUK',
    'juan': 'JHN', 'san juan': 'JHN', 's. juan': 'JHN', 's juan': 'JHN', 'jhn': 'JHN', 'jn': 'JHN',
    'hechos': 'ACT', 'hechos de los apostoles': 'ACT', 'hch': 'ACT', 'act': 'ACT',
    'romanos': 'ROM', 'rom': 'ROM', 'ro': 'ROM',
    '1 corintios': '1CO', '1corintios': '1CO', '1 cor': '1CO', '1cor': '1CO', '1co': '1CO', '1 co': '1CO',
    '2 corintios': '2CO', '2corintios': '2CO', '2 cor': '2CO', '2cor': '2CO', '2co': '2CO', '2 co': '2CO',
    'galatas': 'GAL', 'gal': 'GAL', 'efesios': 'EPH', 'efe': 'EPH', 'eph': 'EPH',
    'filipenses': 'PHP', 'fil': 'PHP', 'php': 'PHP', 'colosenses': 'COL', 'col': 'COL',
    '1 tesalonicenses': '1TH', '1tesalonicenses': '1TH', '1 tes': '1TH', '1tes': '1TH', '1th': '1TH', '1 th': '1TH',
    '2 tesalonicenses': '2TH', '2tesalonicenses': '2TH', '2 tes': '2TH', '2tes': '2TH', '2th': '2TH', '2 th': '2TH',
    '1 timoteo': '1TI', '1timoteo': '1TI', '1 tim': '1TI', '1tim': '1TI', '1ti': '1TI', '1 ti': '1TI',
    '2 timoteo': '2TI', '2timoteo': '2TI', '2 tim': '2TI', '2tim': '2TI', '2ti': '2TI', '2 ti': '2TI',
    'tito': 'TIT', 'tit': 'TIT', 'filemon': 'PHM', 'phm': 'PHM', 'flm': 'PHM',
    'hebreos': 'HEB', 'heb': 'HEB', 'santiago': 'JAS', 'stg': 'JAS', 'jas': 'JAS',
    '1 pedro': '1PE', '1pedro': '1PE', '1 ped': '1PE', '1ped': '1PE', '1pe': '1PE', '1 pe': '1PE',
    '2 pedro': '2PE', '2pedro': '2PE', '2 ped': '2PE', '2ped': '2PE', '2pe': '2PE', '2 pe': '2PE',
    '1 juan': '1JN', '1juan': '1JN', '1 jn': '1JN', '1jn': '1JN', '1 j': '1JN', '1j': '1JN',
    '2 juan': '2JN', '2juan': '2JN', '2 jn': '2JN', '2jn': '2JN', '2 j': '2JN', '2j': '2JN',
    '3 juan': '3JN', '3juan': '3JN', '3 jn': '3JN', '3jn': '3JN', '3 j': '3JN', '3j': '3JN',
    'judas': 'JUD', 'jud': 'JUD', 'jds': 'JUD', 'apocalipsis': 'REV', 'apoc': 'REV', 'apo': 'REV', 'rev': 'REV', 'revelacion': 'REV',
    'genesis': 'GEN', 'gen': 'GEN', 'gn': 'GEN', 'exodo': 'EXO', 'exo': 'EXO', 'ex': 'EXO',
    'levitico': 'LEV', 'lev': 'LEV', 'lv': 'LEV', 'numeros': 'NUM', 'num': 'NUM', 'nm': 'NUM',
    'deuteronomio': 'DEU', 'deu': 'DEU', 'dt': 'DEU', 'josue': 'JOS', 'jos': 'JOS',
    'jueces': 'JDG', 'jue': 'JDG', 'jdc': 'JDG', 'rut': 'RUT', 'rt': 'RUT',
    '1 samuel': '1SA', '1samuel': '1SA', '1 sam': '1SA', '1sam': '1SA', '1sa': '1SA', '1 sa': '1SA',
    '2 samuel': '2SA', '2samuel': '2SA', '2 sam': '2SA', '2sam': '2SA', '2sa': '2SA', '2 sa': '2SA',
    '1 reyes': '1KI', '1reyes': '1KI', '1 rey': '1KI', '1rey': '1KI', '1ki': '1KI', '1 ki': '1KI',
    '2 reyes': '2KI', '2reyes': '2KI', '2 rey': '2KI', '2rey': '2KI', '2ki': '2KI', '2 ki': '2KI',
    '1 cronicas': '1CH', '1cronicas': '1CH', '1 cro': '1CH', '1cro': '1CH', '1ch': '1CH', '1 ch': '1CH',
    '2 cronicas': '2CH', '2cronicas': '2CH', '2 cro': '2CH', '2cro': '2CH', '2ch': '2CH', '2 ch': '2CH',
    'esdras': 'EZR', 'ezr': 'EZR', 'nehemias': 'NEH', 'neh': 'NEH', 'ester': 'EST', 'est': 'EST',
    'job': 'JOB', 'jb': 'JOB', 'salmos': 'PSA', 'salmo': 'PSA', 'sal': 'PSA', 'psa': 'PSA', 'ps': 'PSA',
    'proverbios': 'PRO', 'proverbio': 'PRO', 'prov': 'PRO', 'pro': 'PRO', 'prv': 'PRO',
    'eclesiastes': 'ECC', 'ecl': 'ECC', 'ec': 'ECC', 'cantares': 'SNG', 'cantar': 'SNG', 'cantar de los cantares': 'SNG', 'cant': 'SNG', 'sng': 'SNG',
    'isaias': 'ISA', 'isa': 'ISA', 'is': 'ISA', 'jeremias': 'JER', 'jer': 'JER', 'jr': 'JER',
    'lamentaciones': 'LAM', 'lam': 'LAM', 'ezequiel': 'EZK', 'ezk': 'EZK', 'eze': 'EZK',
    'daniel': 'DAN', 'dan': 'DAN', 'dn': 'DAN', 'oseas': 'HOS', 'hos': 'HOS', 'os': 'HOS',
    'joel': 'JOL', 'jol': 'JOL', 'jl': 'JOL', 'amos': 'AMO', 'amo': 'AMO', 'am': 'AMO',
    'abdias': 'OBA', 'oba': 'OBA', 'ob': 'OBA', 'jonas': 'JON', 'jon': 'JON',
    'miqueas': 'MIC', 'mic': 'MIC', 'miq': 'MIC', 'nahum': 'NAM', 'nam': 'NAM', 'nah': 'NAM',
    'habacuc': 'HAB', 'hab': 'HAB', 'sofonias': 'ZEP', 'zep': 'ZEP', 'sof': 'ZEP',
    'hageo': 'HAG', 'hag': 'HAG', 'hg': 'HAG', 'zacarias': 'ZEC', 'zec': 'ZEC', 'zac': 'ZEC',
    'malaquias': 'MAL', 'mal': 'MAL'
  };

  const findMatchingBook = (bookQuery: string) => {
    const q = normalize(bookQuery);
    if (!q) return null;

    if (aliases[q]) {
      const aliasId = aliases[q];
      const match = allBooks.find(b => b.id.toUpperCase() === aliasId);
      if (match) return match;
    }

    return allBooks.find(b => {
      const normName = normalize(b.name);
      const normNameWithoutSan = normName.replace(/^san\s+/, '');
      const normAbbr = normalize(b.abbreviation);
      const normId = normalize(b.id);
      return (
        normName === q ||
        normNameWithoutSan === q ||
        normAbbr === q ||
        normId === q ||
        normName.startsWith(q) ||
        normNameWithoutSan.startsWith(q)
      );
    });
  };

  const normFilter = normalize(searchFilter);

  const filteredOT = oldTestament.filter(b => {
    if (!normFilter) return true;
    const normName = normalize(b.name);
    const normNameWithoutSan = normName.replace(/^san\s+/, '');
    const normAbbr = normalize(b.abbreviation);
    const normCat = normalize(b.category);
    return (
      normName.includes(normFilter) ||
      normNameWithoutSan.includes(normFilter) ||
      normAbbr.includes(normFilter) ||
      normCat.includes(normFilter)
    );
  });

  const filteredNT = newTestament.filter(b => {
    if (!normFilter) return true;
    const normName = normalize(b.name);
    const normNameWithoutSan = normName.replace(/^san\s+/, '');
    const normAbbr = normalize(b.abbreviation);
    const normCat = normalize(b.category);
    return (
      normName.includes(normFilter) ||
      normNameWithoutSan.includes(normFilter) ||
      normAbbr.includes(normFilter) ||
      normCat.includes(normFilter)
    );
  });

  // Load verses when selected book or chapter changes
  useEffect(() => {
    let isCurrent = true;
    setLoadingVerses(true);

    fetchBibleChapter(selectedBook.id, selectedChapter)
      .then((verses) => {
        if (isCurrent) {
          setChapterVerses(verses);
          setLoadingVerses(false);
        }
      })
      .catch(() => {
        if (isCurrent) {
          // Fallback estimated verses if offline
          const fallbackCount = 25;
          const dummyVerses: BibleVerse[] = Array.from({ length: fallbackCount }, (_, i) => ({
            bookId: selectedBook.id,
            bookName: selectedBook.name,
            chapter: selectedChapter,
            verse: i + 1,
            text: `Versículo ${i + 1}`
          }));
          setChapterVerses(dummyVerses);
          setLoadingVerses(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [selectedBook.id, selectedChapter]);

  // When clicking on a book card
  const handleBookClick = (book: BibleBook) => {
    saveRecentSearch(book.name);
    setSelectedBook(book);
    setSelectedChapter(1);
    setSelectorStep('chapters');
    setIsSelectorModalOpen(true);
  };

  // When clicking on a chapter number
  const handleChapterSelect = (chNum: number) => {
    setSelectedChapter(chNum);
    setSelectorStep('verses');
  };

  // When clicking to read the whole chapter
  const handleReadFullChapter = (chNum?: number) => {
    const targetChapter = chNum || selectedChapter;
    saveRecentSearch(`${selectedBook.name} ${targetChapter}`);
    setIsSelectorModalOpen(false);
    onSelectBookAndChapter(selectedBook.id, targetChapter);
  };

  // When clicking a specific verse number
  const handleVerseSelect = (verseNum: number) => {
    saveRecentSearch(`${selectedBook.name} ${selectedChapter}:${verseNum}`);
    setIsSelectorModalOpen(false);
    onSelectBookAndChapter(selectedBook.id, selectedChapter, verseNum);
  };

  const handleRecentClick = (term: string) => {
    setSearchFilter(term);
    saveRecentSearch(term);
    const directMatch = parseDirectReference(term);
    if (directMatch) {
      onSelectBookAndChapter(directMatch.book.id, directMatch.chapter, directMatch.verse);
      return;
    }

    const matched = findMatchingBook(term);
    if (matched) {
      handleBookClick(matched);
    } else {
      onPerformSearchText(term);
    }
  };

  // Quick direct jump detector for inputs like "Juan 3:16", "Mateo 5", "Salmos 23"
  const parseDirectReference = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return null;
    const match = trimmed.match(/^([1-3]?\s?[A-Za-zÁÉÍÓÚáéíóúñÜü\.]+)\s*(\d+)?(?:\s*[:,\.]\s*(\d+))?$/i);
    if (match) {
      const bookPart = match[1]?.trim() || '';
      const chapterNum = match[2] ? parseInt(match[2], 10) : 1;
      const verseNum = match[3] ? parseInt(match[3], 10) : undefined;
      const foundBook = findMatchingBook(bookPart);
      if (foundBook) {
        const safeChapter = Math.min(Math.max(1, chapterNum), foundBook.chaptersCount);
        return { book: foundBook, chapter: safeChapter, verse: verseNum };
      }
    }
    const single = findMatchingBook(trimmed);
    if (single) {
      return { book: single, chapter: 1, verse: undefined };
    }
    return null;
  };

  const directRef = parseDirectReference(searchFilter);

  return (
    <div id="search-navigation-view" className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6 sm:gap-8">
      {/* Search Input Section */}
      <section className="w-full">
        <div className="relative w-full max-w-2xl mx-auto group">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#767683] group-focus-within:text-[#F25C05] transition-colors" />
          <input
            id="search-bible-keyword-input"
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (directRef) {
                  saveRecentSearch(searchFilter.trim());
                  onSelectBookAndChapter(directRef.book.id, directRef.chapter, directRef.verse);
                } else if (searchFilter.trim()) {
                  saveRecentSearch(searchFilter.trim());
                  onPerformSearchText(searchFilter.trim());
                }
              }
            }}
            placeholder="Buscar libro, capítulo o versículo (ej: Juan 3:16, Mateo 4, Salmos)"
            className={`w-full border-0 border-b-2 rounded-t-xl px-12 py-3.5 sm:py-4 font-body-ui text-[15px] sm:text-base transition-all shadow-xs outline-none ${
              isDark
                ? 'bg-[#131722] text-white border-white/20 focus:border-[#FED65B] focus:bg-[#1C2337] placeholder:text-white/40'
                : isSepia
                ? 'bg-[#FAF6EF] text-[#3B2D1F] border-[#705335]/30 focus:border-[#705335] focus:bg-white placeholder:text-[#705335]/60'
                : 'bg-[#E4E2DD]/70 text-[#1B1C19] border-[#C6C5D4] focus:border-[#FED65B] focus:bg-[#FFFFFF] placeholder:text-[#767683]'
            }`}
          />
          {searchFilter && (
            <button
              onClick={() => setSearchFilter('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-label-caps bg-[#C6C5D4] hover:bg-[#767683] text-white px-2.5 py-1 rounded-full transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Direct Reference Fast-Jump Card if detected */}
        {directRef && (
          <div className={`max-w-2xl mx-auto mt-2 p-3 rounded-xl flex items-center justify-between animate-in fade-in border ${
            isDark
              ? 'bg-[#1C2337] border-[#FED65B] text-white'
              : isSepia
              ? 'bg-[#FAF6EF] border-[#705335] text-[#3B2D1F]'
              : 'bg-[#FED65B]/20 border-[#FED65B] text-[#1B1C19]'
          }`}>
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-5 h-5 text-[#F25C05]" />
              <span className={`font-body-ui text-sm font-semibold ${headerTitleColor}`}>
                Ir directo a {directRef.book.name} {directRef.chapter}{directRef.verse ? `:${directRef.verse}` : ''}
              </span>
            </div>
            <button
              onClick={() => {
                saveRecentSearch(`${directRef.book.name} ${directRef.chapter}${directRef.verse ? `:${directRef.verse}` : ''}`);
                onSelectBookAndChapter(directRef.book.id, directRef.chapter, directRef.verse);
              }}
              className="bg-[#0B2B68] text-[#FED65B] text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-[#0B2B68]/90 transition-all cursor-pointer"
            >
              Abrir Pasaje →
            </button>
          </div>
        )}
      </section>

      {/* Filter Tabs: Todos / Antiguo Testamento / Nuevo Testamento */}
      <section className="w-full max-w-2xl mx-auto flex items-center justify-center gap-1.5 sm:gap-2">
        <button
          onClick={() => setActiveTabFilter('all')}
          className={`px-3 sm:px-4 py-1.5 rounded-full font-label-caps text-xs tracking-wider transition-all cursor-pointer ${
            activeTabFilter === 'all'
              ? 'bg-[#0B2B68] text-[#FED65B] font-bold shadow-xs ring-1 ring-[#FED65B]'
              : tabInactiveBg
          }`}
        >
          <span className="hidden sm:inline">Todos (66)</span>
          <span className="sm:hidden">Todos (66)</span>
        </button>
        <button
          onClick={() => setActiveTabFilter('OT')}
          className={`px-3 sm:px-4 py-1.5 rounded-full font-label-caps text-xs tracking-wider transition-all cursor-pointer ${
            activeTabFilter === 'OT'
              ? 'bg-[#0B2B68] text-[#FED65B] font-bold shadow-xs ring-1 ring-[#FED65B]'
              : tabInactiveBg
          }`}
        >
          <span className="hidden sm:inline">Antiguo Testamento (39)</span>
          <span className="sm:hidden">Antiguo (39)</span>
        </button>
        <button
          onClick={() => setActiveTabFilter('NT')}
          className={`px-3 sm:px-4 py-1.5 rounded-full font-label-caps text-xs tracking-wider transition-all cursor-pointer ${
            activeTabFilter === 'NT'
              ? 'bg-[#0B2B68] text-[#FED65B] font-bold shadow-xs ring-1 ring-[#FED65B]'
              : tabInactiveBg
          }`}
        >
          <span className="hidden sm:inline">Nuevo Testamento (27)</span>
          <span className="sm:hidden">Nuevo (27)</span>
        </button>
      </section>

      {/* Recent Searches Section */}
      {recentSearches.length > 0 && (
        <section className="w-full max-w-2xl mx-auto">
          <h3 className={`font-label-caps text-xs mb-2.5 uppercase tracking-wider ${subtextColor}`}>
            Búsquedas y Libros Frecuentes
          </h3>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((term, index) => (
              <button
                key={`${term}-${index}`}
                onClick={() => handleRecentClick(term)}
                className={`font-body-ui text-xs px-3.5 py-1.5 rounded-full border transition-all cursor-pointer shadow-2xs flex items-center gap-1.5 ${
                  isDark
                    ? 'bg-[#131722] text-white border-white/15 hover:bg-[#0B2B68] hover:text-[#FED65B] hover:border-[#FED65B]'
                    : isSepia
                    ? 'bg-[#FAF6EF] text-[#3B2D1F] border-[#705335]/20 hover:bg-[#0B2B68] hover:text-[#FED65B]'
                    : 'bg-white text-[#0B2B68] border-[#0B2B68]/20 hover:bg-[#0B2B68] hover:text-[#FED65B] hover:border-[#FED65B]'
                }`}
              >
                <Book className="w-3.5 h-3.5 text-[#F25C05]" />
                <span className="font-semibold">{term}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Antiguo Testamento Grid */}
      {(activeTabFilter === 'all' || activeTabFilter === 'OT') && filteredOT.length > 0 && (
        <section className="w-full">
          <div className="flex items-center justify-between mb-3.5">
            <h2 className={`font-display-scripture text-xl sm:text-2xl flex items-center gap-2 ${headerTitleColor}`}>
              <span className="w-2.5 h-2.5 rounded-full bg-[#F25C05]" />
              Antiguo Testamento
            </h2>
            <span className={`text-xs font-label-caps ${subtextColor}`}>
              {filteredOT.length} libros
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
            {filteredOT.map((book) => {
              const isSelected = selectedBook.id === book.id;
              return (
                <button
                  key={`ot-${book.id}`}
                  id={`book-card-${book.id}`}
                  onClick={() => handleBookClick(book)}
                  className={`border rounded-xl p-3.5 sm:p-4 text-left transition-all relative overflow-hidden group cursor-pointer shadow-xs ${
                    isSelected ? bookCardSelected : bookCardBg
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-display-scripture text-lg sm:text-xl font-semibold leading-tight ${headerTitleColor}`}>
                      {book.name}
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#767683] group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className={`font-body-ui text-xs ${subtextColor}`}>
                      {book.chaptersCount} Capítulos
                    </span>
                    <span className="text-[10px] font-label-caps text-[#F25C05] bg-[#F25C05]/15 px-1.5 py-0.5 rounded">
                      {book.abbreviation}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-[#FED65B]/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Nuevo Testamento Grid */}
      {(activeTabFilter === 'all' || activeTabFilter === 'NT') && filteredNT.length > 0 && (
        <section className="w-full">
          <div className="flex items-center justify-between mb-3.5">
            <h2 className={`font-display-scripture text-xl sm:text-2xl flex items-center gap-2 ${headerTitleColor}`}>
              <span className="w-2.5 h-2.5 rounded-full bg-[#0B2B68]" />
              Nuevo Testamento
            </h2>
            <span className={`text-xs font-label-caps ${subtextColor}`}>
              {filteredNT.length} libros
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
            {filteredNT.map((book) => {
              const isSelected = selectedBook.id === book.id;
              return (
                <button
                  key={`nt-${book.id}`}
                  id={`book-card-${book.id}`}
                  onClick={() => handleBookClick(book)}
                  className={`border rounded-xl p-3.5 sm:p-4 text-left transition-all relative overflow-hidden group cursor-pointer shadow-xs ${
                    isSelected ? bookCardSelected : bookCardBg
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-display-scripture text-lg sm:text-xl font-semibold leading-tight ${headerTitleColor}`}>
                      {book.name}
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#767683] group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className={`font-body-ui text-xs ${subtextColor}`}>
                      {book.chaptersCount} Capítulos
                    </span>
                    <span className="text-[10px] font-label-caps text-[#0B2B68] bg-[#0B2B68]/15 px-1.5 py-0.5 rounded">
                      {book.abbreviation}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-[#FED65B]/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Chapter & Verse Selector Section (In-page anchor) */}
      <section
        id="chapter-selector-container"
        className={`w-full rounded-2xl p-5 sm:p-6 relative shadow-sm animate-in fade-in duration-200 border ${sectionBg}`}
      >
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b pb-4 ${isDark ? 'border-white/10' : 'border-[#C6C5D4]/70'}`}>
          <div>
            <span className="text-xs font-label-caps text-[#F25C05] uppercase tracking-wider block mb-1">
              Libro Seleccionado • {selectedBook.testament === 'OT' ? 'Antiguo Testamento' : 'Nuevo Testamento'}
            </span>
            <h3 className={`font-display-scripture text-2xl sm:text-3xl font-semibold flex items-center gap-2.5 ${headerTitleColor}`}>
              <BookOpen className="w-6 h-6 text-[#F25C05]" />
              {selectedBook.name}
            </h3>
          </div>

          {/* Steps Switcher: Capítulos / Versículos */}
          <div className={`flex items-center gap-2 p-1 rounded-full self-start sm:self-auto ${isDark ? 'bg-[#1C2337]' : isSepia ? 'bg-[#EAE0D0]' : 'bg-[#E4E2DD]'}`}>
            <button
              onClick={() => setSelectorStep('chapters')}
              className={`px-4 py-1.5 rounded-full font-label-caps text-xs tracking-wider transition-all cursor-pointer ${
                selectorStep === 'chapters'
                  ? 'bg-[#0B2B68] text-[#FED65B] font-bold shadow-xs'
                  : `${subtextColor} hover:${headerTitleColor}`
              }`}
            >
              1. Capítulos ({selectedBook.chaptersCount})
            </button>
            <button
              onClick={() => setSelectorStep('verses')}
              className={`px-4 py-1.5 rounded-full font-label-caps text-xs tracking-wider transition-all cursor-pointer ${
                selectorStep === 'verses'
                  ? 'bg-[#0B2B68] text-[#FED65B] font-bold shadow-xs'
                  : `${subtextColor} hover:${headerTitleColor}`
              }`}
            >
              2. Versículos (Cap. {selectedChapter})
            </button>
          </div>
        </div>

        {/* Step 1: Chapters Grid */}
        {selectorStep === 'chapters' && (
          <div>
            <p className={`text-xs font-body-ui mb-3 ${subtextColor}`}>
              Selecciona un capítulo de {selectedBook.name}:
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-2.5 max-h-80 overflow-y-auto pr-1">
              {Array.from({ length: selectedBook.chaptersCount }, (_, i) => i + 1).map((chNum) => {
                const isChSelected = selectedChapter === chNum;
                return (
                  <button
                    key={chNum}
                    id={`chapter-btn-${selectedBook.id}-${chNum}`}
                    onClick={() => handleChapterSelect(chNum)}
                    className={`py-3 sm:py-3.5 flex flex-col items-center justify-center rounded-xl font-body-ui text-sm sm:text-base font-semibold transition-all cursor-pointer shadow-xs border ${
                      isChSelected
                        ? 'bg-[#FED65B] border-[#735C00] text-[#1B1C19] scale-105 shadow-md font-bold'
                        : gridItemBg
                    }`}
                    title={`Capítulo ${chNum} de ${selectedBook.name}`}
                  >
                    <span className="text-xs font-label-caps opacity-70 mb-0.5">Cap.</span>
                    <span className="text-base sm:text-lg">{chNum}</span>
                  </button>
                );
              })}
            </div>

            <div className={`mt-5 pt-3 border-t flex flex-col sm:flex-row justify-between items-center gap-3 ${isDark ? 'border-white/10' : 'border-[#C6C5D4]/60'}`}>
              <span className={`text-xs ${subtextColor}`}>
                💡 Al hacer clic en un capítulo podrás elegir un versículo o leerlo completo.
              </span>
              <button
                onClick={() => handleReadFullChapter(1)}
                className="bg-[#0B2B68] text-[#FED65B] px-5 py-2 rounded-full font-body-ui text-xs sm:text-sm font-semibold hover:bg-[#0B2B68]/90 transition-all cursor-pointer"
              >
                Leer desde el Inicio ({selectedBook.name} 1) →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Verses Grid */}
        {selectorStep === 'verses' && (
          <div className="animate-in fade-in duration-200">
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 p-3.5 rounded-xl border ${
              isDark ? 'bg-[#1C2337] border-white/10' : isSepia ? 'bg-[#FAF6EF] border-[#705335]/20' : 'bg-[#FFFFFF] border-[#C6C5D4]'
            }`}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectorStep('chapters')}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 cursor-pointer border ${
                    isDark
                      ? 'text-white border-white/20 hover:bg-white/10'
                      : isSepia
                      ? 'text-[#3B2D1F] border-[#705335]/30 hover:bg-[#EAE0D0]'
                      : 'text-[#0B2B68] border-[#C6C5D4] hover:bg-[#EAE8E3]'
                  }`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Cambiar Capítulo ({selectedChapter})
                </button>
                <span className={`text-sm font-display-scripture font-bold ${headerTitleColor}`}>
                  {selectedBook.name} {selectedChapter}
                </span>
              </div>

              <button
                onClick={() => handleReadFullChapter(selectedChapter)}
                className="bg-[#FED65B] text-[#745C00] px-4 py-1.5 rounded-full font-body-ui text-xs sm:text-sm font-bold hover:bg-[#FED65B]/90 transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
              >
                <BookOpen className="w-4 h-4" />
                📖 Leer Capítulo {selectedChapter} Completo
              </button>
            </div>

            <p className={`text-xs font-body-ui mb-3 ${subtextColor}`}>
              Toca un versículo para ir directamente a él en la lectura:
            </p>

            {loadingVerses ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2">
                <div className="w-6 h-6 border-2 border-[#0B2B68] border-t-transparent rounded-full animate-spin" />
                <span className={`text-xs ${subtextColor}`}>Cargando versículos de {selectedBook.name} {selectedChapter}...</span>
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-2.5 max-h-80 overflow-y-auto pr-1">
                {chapterVerses.map((verse) => (
                  <button
                    key={verse.verse}
                    id={`verse-btn-${selectedBook.id}-${selectedChapter}-${verse.verse}`}
                    onClick={() => handleVerseSelect(verse.verse)}
                    className={`py-3 flex flex-col items-center justify-center rounded-xl font-body-ui transition-all cursor-pointer shadow-2xs border group ${gridItemBg}`}
                    title={`Ir a ${selectedBook.name} ${selectedChapter}:${verse.verse}`}
                  >
                    <span className={`text-[10px] font-label-caps ${subtextColor}`}>Vers.</span>
                    <span className={`text-base font-bold ${headerTitleColor}`}>{verse.verse}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Interactive Modal Sheet for Instant Book/Chapter/Verse Picking */}
      {isSelectorModalOpen && (
        <div
          id="book-selector-modal-backdrop"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
          onClick={() => setIsSelectorModalOpen(false)}
        >
          <div
            id="book-selector-modal-content"
            className={`w-full max-w-2xl rounded-2xl shadow-2xl border flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200 ${modalBg}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
              isDark ? 'bg-[#1C2337] border-white/10' : isSepia ? 'bg-[#EAE0D0] border-[#705335]/20' : 'bg-[#F5F3EE] border-[#C6C5D4]'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FED65B]/40 flex items-center justify-center text-[#735C00]">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-display-scripture text-2xl font-bold ${headerTitleColor}`}>
                    {selectedBook.name}
                  </h3>
                  <p className={`text-xs font-label-caps ${subtextColor}`}>
                    {selectedBook.testament === 'OT' ? 'Antiguo Testamento' : 'Nuevo Testamento'} • {selectedBook.chaptersCount} Capítulos
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsSelectorModalOpen(false)}
                className={`p-2 rounded-full transition-colors ${
                  isDark ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-[#767683] hover:text-[#0B2B68] hover:bg-[#EAE8E3]'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Step Navigation Bar */}
            <div className={`px-5 py-2.5 border-b flex items-center justify-between ${
              isDark ? 'bg-[#131722] border-white/10' : isSepia ? 'bg-[#FAF6EF] border-[#705335]/20' : 'bg-[#EAE8E3] border-[#C6C5D4]'
            }`}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectorStep('chapters')}
                  className={`px-3.5 py-1 rounded-full font-label-caps text-xs font-bold transition-all cursor-pointer ${
                    selectorStep === 'chapters'
                      ? 'bg-[#0B2B68] text-[#FED65B] shadow-xs'
                      : `${subtextColor} hover:opacity-80`
                  }`}
                >
                  1. Capítulos
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-[#767683]" />
                <button
                  onClick={() => setSelectorStep('verses')}
                  className={`px-3.5 py-1 rounded-full font-label-caps text-xs font-bold transition-all cursor-pointer ${
                    selectorStep === 'verses'
                      ? 'bg-[#0B2B68] text-[#FED65B] shadow-xs'
                      : `${subtextColor} hover:opacity-80`
                  }`}
                >
                  2. Versículos ({selectedBook.name} {selectedChapter})
                </button>
              </div>

              {selectorStep === 'verses' && (
                <button
                  onClick={() => handleReadFullChapter(selectedChapter)}
                  className="bg-[#FED65B] text-[#745C00] text-xs font-bold px-3 py-1 rounded-full hover:bg-[#FED65B]/90 transition-all cursor-pointer"
                >
                  Leer Cap. {selectedChapter} →
                </button>
              )}
            </div>

            {/* Modal Body Content */}
            <div className={`p-4 sm:p-6 overflow-y-auto flex-1 ${modalBg}`}>
              {selectorStep === 'chapters' ? (
                <div>
                  <h4 className={`font-label-caps text-xs uppercase tracking-wider mb-3 ${subtextColor}`}>
                    Selecciona el capítulo:
                  </h4>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-2.5">
                    {Array.from({ length: selectedBook.chaptersCount }, (_, i) => i + 1).map((chNum) => {
                      const isChSelected = selectedChapter === chNum;
                      return (
                        <button
                          key={chNum}
                          onClick={() => handleChapterSelect(chNum)}
                          className={`py-3.5 rounded-xl font-body-ui text-base font-bold transition-all cursor-pointer border flex flex-col items-center justify-center ${
                            isChSelected
                              ? 'bg-[#FED65B] border-[#735C00] text-[#1B1C19] shadow-md scale-105'
                              : gridItemBg
                          }`}
                        >
                          <span className={`text-[10px] font-normal ${subtextColor}`}>Cap.</span>
                          {chNum}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <h4 className={`font-label-caps text-xs uppercase tracking-wider ${subtextColor}`}>
                      Versículos de {selectedBook.name} {selectedChapter}:
                    </h4>
                    <button
                      onClick={() => setSelectorStep('chapters')}
                      className="text-xs text-[#F25C05] font-semibold hover:underline flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      Elegir otro capítulo
                    </button>
                  </div>

                  {loadingVerses ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-[#0B2B68] border-t-transparent rounded-full animate-spin" />
                      <span className={`text-xs ${subtextColor}`}>Cargando versículos...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5">
                      {chapterVerses.map((verse) => (
                        <button
                          key={verse.verse}
                          onClick={() => handleVerseSelect(verse.verse)}
                          className={`py-3 rounded-xl font-body-ui transition-all cursor-pointer shadow-2xs flex flex-col items-center justify-center group border ${gridItemBg}`}
                        >
                          <span className={`text-[10px] ${subtextColor}`}>V.</span>
                          <span className={`text-base font-bold ${headerTitleColor}`}>{verse.verse}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className={`p-3.5 sm:p-4 border-t flex items-center justify-between ${
              isDark ? 'bg-[#1C2337] border-white/10' : isSepia ? 'bg-[#EAE0D0] border-[#705335]/20' : 'bg-[#F5F3EE] border-[#C6C5D4]'
            }`}>
              <button
                onClick={() => setIsSelectorModalOpen(false)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${
                  isDark ? 'text-white/70 hover:text-white' : 'text-[#767683] hover:text-[#0B2B68]'
                }`}
              >
                Cancelar
              </button>

              <button
                onClick={() => handleReadFullChapter(selectedChapter)}
                className="bg-[#0B2B68] text-[#FED65B] px-5 py-2 rounded-full font-body-ui text-xs sm:text-sm font-semibold hover:bg-[#0B2B68]/90 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <BookOpen className="w-4 h-4" />
                Leer {selectedBook.name} {selectedChapter} Completo →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

