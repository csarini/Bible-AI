import React, { useState, useEffect } from 'react';
import { Search, Book, Sparkles, BookOpen, ChevronRight, X, ArrowLeft, Check, Compass, Layers } from 'lucide-react';
import { BIBLE_BOOKS, fetchBibleChapter } from '../data/bibleData';
import { BibleBook, BibleVerse } from '../types';

interface SearchViewProps {
  onSelectBookAndChapter: (bookId: string, chapter: number, verseNum?: number) => void;
  recentSearches: string[];
  onPerformSearchText: (query: string) => void;
  currentTheme?: 'light' | 'sepia' | 'dark';
}

export const SearchView: React.FC<SearchViewProps> = ({
  onSelectBookAndChapter,
  recentSearches,
  onPerformSearchText,
  currentTheme = 'light'
}) => {
  const isDark = currentTheme === 'dark';
  const isSepia = currentTheme === 'sepia';

  const headerTitleColor = isDark ? 'text-white' : isSepia ? 'text-[#3B2D1F]' : 'text-[#000666]';
  const subtextColor = isDark ? 'text-white/60' : isSepia ? 'text-[#705335]' : 'text-[#767683]';
  const bookCardBg = isDark
    ? 'bg-[#131722] border-white/10 text-white hover:bg-[#1C2337] hover:border-[#FED65B]'
    : isSepia
    ? 'bg-[#FAF6EF] border-[#705335]/20 text-[#3B2D1F] hover:bg-[#FFFFFF] hover:border-[#705335]'
    : 'bg-[#F0EEE9] border-[#C6C5D4]/80 text-[#000666] hover:bg-[#FFFFFF] hover:border-[#FED65B]';
  const bookCardSelected = isDark
    ? 'bg-[#1C2337] border-[#FED65B] ring-2 ring-[#FED65B] text-white'
    : isSepia
    ? 'bg-[#EAE0D0] border-[#705335] ring-2 ring-[#705335] text-[#3B2D1F]'
    : 'bg-[#E4E2DD] border-[#FED65B] ring-2 ring-[#FED65B] text-[#000666]';
  const tabInactiveBg = isDark
    ? 'bg-[#1C2337] text-white/70 hover:bg-[#252E46]'
    : isSepia
    ? 'bg-[#FAF6EF] text-[#705335] hover:bg-[#EAE0D0]'
    : 'bg-[#F0EEE9] text-[#454652] hover:bg-[#EAE8E3]';
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
    : 'bg-[#FFFFFF] border-[#C6C5D4] text-[#000666] hover:bg-[#FED65B]/60';
  const [searchFilter, setSearchFilter] = useState('');
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'OT' | 'NT'>('all');
  
  // Selected book and chapter for the selector modal / inline viewer
  const [selectedBook, setSelectedBook] = useState<BibleBook>(() => {
    return BIBLE_BOOKS.find(b => b.id === 'MAT') || BIBLE_BOOKS[39];
  });
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [selectorStep, setSelectorStep] = useState<'chapters' | 'verses'>('chapters');
  const [isSelectorModalOpen, setIsSelectorModalOpen] = useState<boolean>(false);
  
  // Chapter verses state for the verse picker
  const [chapterVerses, setChapterVerses] = useState<BibleVerse[]>([]);
  const [loadingVerses, setLoadingVerses] = useState<boolean>(false);

  const oldTestament = BIBLE_BOOKS.filter(b => b.testament === 'OT');
  const newTestament = BIBLE_BOOKS.filter(b => b.testament === 'NT');

  const filteredOT = oldTestament.filter(b =>
    b.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    b.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const filteredNT = newTestament.filter(b =>
    b.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    b.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

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
    setIsSelectorModalOpen(false);
    onSelectBookAndChapter(selectedBook.id, targetChapter);
  };

  // When clicking a specific verse number
  const handleVerseSelect = (verseNum: number) => {
    setIsSelectorModalOpen(false);
    onSelectBookAndChapter(selectedBook.id, selectedChapter, verseNum);
  };

  const handleRecentClick = (term: string) => {
    setSearchFilter(term);
    onPerformSearchText(term);

    // If query matches a book name, open its chapter selector
    const matched = BIBLE_BOOKS.find(
      b => b.name.toLowerCase().includes(term.toLowerCase())
    );
    if (matched) {
      handleBookClick(matched);
    }
  };

  // Quick direct jump detector for inputs like "Juan 3:16" or "Mateo 4"
  const parseDirectReference = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return null;
    const match = trimmed.match(/^([1-3]?\s?[A-Za-zÁÉÍÓÚáéíóúñ]+)\s+(\d+)(?::(\d+))?$/i);
    if (match) {
      const bookQuery = match[1].trim().toLowerCase();
      const chapterNum = parseInt(match[2], 10);
      const verseNum = match[3] ? parseInt(match[3], 10) : undefined;
      const foundBook = BIBLE_BOOKS.find(b =>
        b.name.toLowerCase() === bookQuery ||
        b.name.toLowerCase().startsWith(bookQuery) ||
        b.abbreviation.toLowerCase() === bookQuery
      );
      if (foundBook && chapterNum > 0 && chapterNum <= foundBook.chaptersCount) {
        return { book: foundBook, chapter: chapterNum, verse: verseNum };
      }
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
                  onSelectBookAndChapter(directRef.book.id, directRef.chapter, directRef.verse);
                } else if (searchFilter.trim()) {
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
              onClick={() => onSelectBookAndChapter(directRef.book.id, directRef.chapter, directRef.verse)}
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
                    ? 'bg-[#131722] text-white border-white/15 hover:bg-[#1C2337]'
                    : isSepia
                    ? 'bg-[#FAF6EF] text-[#3B2D1F] border-[#705335]/20 hover:bg-white'
                    : 'bg-[#F0EEE9] text-[#0B2B68] border-[#C6C5D4] hover:bg-[#FED65B]/30 hover:border-[#FED65B]'
                }`}
              >
                <Book className="w-3 h-3 text-[#F25C05]" />
                {term}
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
                  key={book.id}
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
                  key={book.id}
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

