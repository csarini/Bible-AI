import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Share2,
  Copy,
  Sparkles,
  BookOpen,
  Sliders,
  Volume2,
  VolumeX,
  Check,
  Edit2,
  ArrowRight,
  Type,
  Maximize2,
  Compass,
  Navigation,
  MapPin,
  Columns,
  X,
  Layers,
  ExternalLink,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { BibleVerse, BibleBook, LocalBookmark, ReadingSettings, HighlightColor, MapWaypoint, OFFICIAL_TRANSLATIONS } from '../types';
import { fetchBibleChapter, fetchBibleChapterWithFallback } from '../data/bibleData';
import { getLocalBooksSync, getBookByIdOrNumber } from '../services/bibleDatabaseService';
import { ShareService, ShareContent } from '../services/shareService';
import { findItineraryForScripture, detectPlacesInChapter, DetectedBiblicalPlace } from '../data/biblicalMapsData';
import { BiblicalMapsView } from './BiblicalMapsView';
import { ScriptureCopyrightFooter } from './ScriptureCopyrightFooter';
import { CopyrightGuardService } from '../services/copyrightGuardService';

interface ReaderViewProps {
  currentBookId: string;
  currentChapter: number;
  onNavigateChapter: (bookId: string, chapter: number, verseNum?: number) => void;
  bookmarks: LocalBookmark[];
  onOpenSaveModal: (verse: BibleVerse, existingBookmark?: LocalBookmark) => void;
  onAskAIMentor: (verse: BibleVerse) => void;
  onToast: (message: string) => void;
  settings: ReadingSettings;
  onUpdateSettings: (newSettings: Partial<ReadingSettings>) => void;
  highlightedVerseNumber?: number | null;
  onShareVerse?: (content: ShareContent) => void;
  onOpenMap?: (itineraryId?: string, waypointId?: string) => void;
}

export const ReaderView: React.FC<ReaderViewProps> = ({
  currentBookId,
  currentChapter,
  onNavigateChapter,
  bookmarks,
  onOpenSaveModal,
  onAskAIMentor,
  onToast,
  settings,
  onUpdateSettings,
  highlightedVerseNumber,
  onShareVerse,
  onOpenMap
}) => {
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerse, setSelectedVerse] = useState<BibleVerse | null>(null);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentReadingVerse, setCurrentReadingVerse] = useState<number | null>(null);

  // Real-time Map Synchronization & Split Screen State
  const [isSplitScreen, setIsSplitScreen] = useState(false);
  const [showPlacesDrawer, setShowPlacesDrawer] = useState(false);
  const [activeMapWaypointId, setActiveMapWaypointId] = useState<string | undefined>(undefined);
  const [activeMapItineraryId, setActiveMapItineraryId] = useState<string | undefined>(undefined);

  const currentBooks = useMemo(() => getLocalBooksSync(settings.translation), [settings.translation]);
  const bookMeta = useMemo(() => getBookByIdOrNumber(currentBookId, settings.translation), [currentBookId, settings.translation]);
  const matchingItinerary = findItineraryForScripture(currentBookId, currentChapter);

  // Detect places in the current chapter
  const detectedPlaces: DetectedBiblicalPlace[] = useMemo(() => {
    return detectPlacesInChapter(currentBookId, currentChapter, verses);
  }, [currentBookId, currentChapter, verses]);

  // Map of verse number -> detected places for quick inline badge lookup
  const versePlacesMap = useMemo(() => {
    const map = new Map<number, DetectedBiblicalPlace[]>();
    detectedPlaces.forEach((place) => {
      place.matchedVerses.forEach((vNum) => {
        const list = map.get(vNum) || [];
        if (!list.some((p) => p.id === place.id)) {
          list.push(place);
        }
        map.set(vNum, list);
      });
    });
    return map;
  }, [detectedPlaces]);

  // Stop any active speech synthesis when changing chapter or unmounting
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      setCurrentReadingVerse(null);
    }
  }, [currentBookId, currentChapter]);

  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadChapter = useCallback(() => {
    setLoading(true);
    setFetchError(null);

    fetchBibleChapterWithFallback(
      currentBookId,
      currentChapter,
      settings.translation.toLowerCase(),
      (msg) => onToast(msg)
    )
      .then((res) => {
        setVerses(res.verses);
        setLoading(false);
        if (res.isOfflineFallback && res.notice) {
          onToast(res.notice);
        }
        if (!res.verses || res.verses.length === 0) {
          setFetchError(`No se pudieron obtener los versículos de ${bookMeta.name} ${currentChapter}`);
        }

        // Scroll to specific verse if requested
        if (highlightedVerseNumber) {
          setTimeout(() => {
            const el = document.getElementById(`verse-row-${highlightedVerseNumber}`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 300);
        }
      })
      .catch((err) => {
        setLoading(false);
        setFetchError(err?.message || 'Error al conectar con la API');
      });
  }, [currentBookId, currentChapter, settings.translation, highlightedVerseNumber, bookMeta.name, onToast]);

  useEffect(() => {
    loadChapter();
  }, [loadChapter]);

  // Ensure scroll and highlight trigger when target verse is provided
  useEffect(() => {
    if (highlightedVerseNumber && verses.length > 0 && !loading) {
      setSelectedVerse(null);
      const scrollTimer = setTimeout(() => {
        const el = document.getElementById(`verse-row-${highlightedVerseNumber}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 180);
      return () => clearTimeout(scrollTimer);
    }
  }, [highlightedVerseNumber, verses, loading]);

  // Audio Speech Reader function
  const toggleAudioReading = () => {
    // Format conversion check (Bíblica, Inc. / Licensing restrictions)
    if (!CopyrightGuardService.canConvertToAudio(settings.translation)) {
      onToast(
        'La conversión de texto a audio no está permitida para versiones bajo derechos de autor conforme a los términos de licencia de Bíblica, Inc. Disponible para traducciones de dominio público.'
      );
      return;
    }

    if (!('speechSynthesis' in window)) {
      onToast('Lectura de voz no disponible en este navegador');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      setCurrentReadingVerse(null);
      onToast('Lectura de voz pausada');
    } else {
      if (verses.length === 0) return;

      const fullText = verses.map((v) => `Versículo ${v.verse}. ${v.text}`).join(' ');
      const utterance = new SpeechSynthesisUtterance(fullText);
      utterance.lang = 'es-ES';
      utterance.rate = 0.92;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setIsPlayingAudio(true);
        onToast(`Escuchando ${bookMeta.name} ${currentChapter}`);
      };

      utterance.onend = () => {
        setIsPlayingAudio(false);
        setCurrentReadingVerse(null);
      };

      utterance.onerror = () => {
        setIsPlayingAudio(false);
        setCurrentReadingVerse(null);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  // Navigate to previous or next chapter
  const handlePrevChapter = () => {
    if (currentChapter > 1) {
      onNavigateChapter(currentBookId, currentChapter - 1);
    } else {
      const currentIndex = currentBooks.findIndex((b) => b.id === currentBookId);
      if (currentIndex > 0) {
        const prevBook = currentBooks[currentIndex - 1];
        onNavigateChapter(prevBook.id, prevBook.chaptersCount);
      }
    }
  };

  const handleNextChapter = () => {
    if (currentChapter < bookMeta.chaptersCount) {
      onNavigateChapter(currentBookId, currentChapter + 1);
    } else {
      const currentIndex = currentBooks.findIndex((b) => b.id === currentBookId);
      if (currentIndex < currentBooks.length - 1) {
        const nextBook = currentBooks[currentIndex + 1];
        onNavigateChapter(nextBook.id, 1);
      }
    }
  };

  const handleCopyVerse = async (verse: BibleVerse) => {
    const isProtected = CopyrightGuardService.isCopyrightProtected(settings.translation);
    const copyrightNotice = isProtected
      ? `\n\n${CopyrightGuardService.getCopyrightInfo(settings.translation).standardCitation}`
      : '';
    const text = `"${verse.text}"\n— ${verse.bookName} ${verse.chapter}:${verse.verse} (${settings.translation})${copyrightNotice}`;
    const success = await ShareService.copyToClipboard(text);
    if (success) {
      onToast('Versículo copiado al portapapeles');
    }
  };

  const handleShareVerse = async (verse: BibleVerse) => {
    const isProtected = CopyrightGuardService.isCopyrightProtected(settings.translation);
    const copyrightNotice = isProtected
      ? `\n\n${CopyrightGuardService.getCopyrightInfo(settings.translation).standardCitation}`
      : '';
    const shareData: ShareContent = {
      text: `${verse.text}${copyrightNotice}`,
      reference: `${verse.bookName} ${verse.chapter}:${verse.verse}`,
      translation: settings.translation
    };

    if (onShareVerse) {
      onShareVerse(shareData);
      return;
    }

    const res = await ShareService.nativeShare(shareData);
    if (res) {
      onToast('Compartido exitosamente');
    } else {
      const copied = await ShareService.copyToClipboard(ShareService.formatVerseText(shareData));
      if (copied) {
        onToast('Versículo copiado al portapapeles');
      } else {
        onToast('Listo para compartir');
      }
    }
  };

  // Focus and sync waypoint in split view or full map
  const handleSelectPlace = (place: DetectedBiblicalPlace, openSplit = true) => {
    setActiveMapItineraryId(place.itineraryId);
    setActiveMapWaypointId(place.id);

    if (openSplit) {
      setIsSplitScreen(true);
      setShowPlacesDrawer(false);
      onToast(`📍 Centrando ${place.name} en el mapa sincronizado`);
    } else if (onOpenMap) {
      onOpenMap(place.itineraryId, place.id);
    }

    // Scroll to the first matched verse in reader
    if (place.matchedVerses.length > 0) {
      const firstVerseNum = place.matchedVerses[0];
      setTimeout(() => {
        const el = document.getElementById(`verse-row-${firstVerseNum}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 200);
    }
  };

  // Waypoint selected inside the map -> scroll to corresponding verse in reader
  const handleWaypointSelectedInMap = (waypoint: MapWaypoint) => {
    setActiveMapWaypointId(waypoint.id);
    // Find verse if present in current chapter
    if (waypoint.bookId === currentBookId && waypoint.chapter === currentChapter && waypoint.verse) {
      const el = document.getElementById(`verse-row-${waypoint.verse}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Find bookmark for verse if exists
  const getBookmarkForVerse = (verseNum: number): LocalBookmark | undefined => {
    return bookmarks.find(
      (b) =>
        b.book_name.toLowerCase() === bookMeta.name.toLowerCase() &&
        b.chapter === currentChapter &&
        b.verse === verseNum
    );
  };

  // Font size multiplier
  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case 'small':
        return 'text-[16px] sm:text-[17px]';
      case 'large':
        return 'text-[21px] sm:text-[23px]';
      case 'extra-large':
        return 'text-[24px] sm:text-[27px]';
      case 'medium':
      default:
        return 'text-[18px] sm:text-[20px]';
    }
  };

  const getFontFamilyClass = () => {
    switch (settings.fontFamily) {
      case 'Playfair':
        return 'font-serif';
      case 'Inter':
        return 'font-sans';
      case 'Literata':
      default:
        return 'font-body-reading';
    }
  };

  const getLineHeightClass = () => {
    switch (settings.lineHeight) {
      case 'normal':
        return 'leading-[28px] sm:leading-[32px]';
      case 'spacious':
        return 'leading-[40px] sm:leading-[46px]';
      case 'relaxed':
      default:
        return 'leading-[32px] sm:leading-[38px]';
    }
  };

  const progressPercent = Math.round((currentChapter / bookMeta.chaptersCount) * 100);

  const isDark = settings.themeMode === 'dark';
  const isSepia = settings.themeMode === 'sepia';

  const headingTextClass = isDark
    ? 'text-white'
    : isSepia
    ? 'text-[#422C16]'
    : 'text-[#0B2B68]';

  const bodyTextClass = isDark
    ? 'text-[#E2E8F0]'
    : isSepia
    ? 'text-[#2D2319]'
    : 'text-[#1B1C19]';

  const rowHoverClass = isDark
    ? 'hover:bg-[#182133]'
    : isSepia
    ? 'hover:bg-[#EAE0D0]'
    : 'hover:bg-[#F0EEE9]/70';

  const readerBorderClass = isDark
    ? 'border-[#252D43]'
    : isSepia
    ? 'border-[#705335]/20'
    : 'border-[#0B2B68]/15';

  const iconBtnClass = isDark
    ? 'text-[#9AA5C2] hover:text-white hover:bg-[#1C2337] border-[#252D43]'
    : isSepia
    ? 'text-[#5C4A3A] hover:text-[#2D2319] hover:bg-[#EAE0D0] border-[#705335]/25'
    : 'text-[#454652] hover:text-[#0B2B68] hover:bg-[#EAE8E3] border-[#0B2B68]/20';

  // Render main reader content pane
  const renderReaderPane = () => (
    <div className="w-full flex-1 flex flex-col justify-between">
      {/* Chapter Sacred Header & Interactive Controls */}
      <div className={`border-b ${readerBorderClass} pb-4 mb-5`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handlePrevChapter}
              id="prev-chapter-btn"
              aria-label="Capítulo anterior"
              className={`p-2 sm:p-2.5 rounded-full transition-colors cursor-pointer border shadow-2xs ${iconBtnClass}`}
              title="Capítulo anterior"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#F47B20] bg-[#F47B20]/15 px-2.5 py-0.5 rounded-full">
                  {bookMeta.testament === 'OT' ? 'Antiguo Testamento' : 'Nuevo Testamento'}
                </span>
                <span className="text-[11px] font-semibold opacity-75">
                  {OFFICIAL_TRANSLATIONS.find(t => t.abbreviation === settings.translation || t.translation === settings.translation)?.name || (settings.translation === 'rvr1960' || settings.translation === 'valera' ? 'Reina-Valera 1960' : settings.translation)}
                </span>
              </div>
              <h2 className={`font-serif italic font-bold text-2xl sm:text-3xl md:text-4xl tracking-tight mt-0.5 ${headingTextClass}`}>
                {bookMeta.name} {currentChapter}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleNextChapter}
              id="next-chapter-btn"
              aria-label="Capítulo siguiente"
              className={`p-2 sm:p-2.5 rounded-full transition-colors cursor-pointer border shadow-2xs ${iconBtnClass}`}
              title="Capítulo siguiente"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Chapter Progress Micro-Bar */}
        <div className="mt-3 flex items-center justify-between text-[11px] font-label-caps opacity-75">
          <span>Capítulo {currentChapter} de {bookMeta.chaptersCount}</span>
          <div className={`w-36 sm:w-48 h-1.5 rounded-full overflow-hidden ml-3 border ${isDark ? 'bg-[#1C2337] border-[#252D43]' : 'bg-[#EAE8E3] border-[#0B2B68]/10'}`}>
            <div
              className="h-full bg-gradient-to-r from-[#F47B20] via-[#00A3E0] to-[#0B2B68] transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className={`ml-2 font-bold ${isDark ? 'text-[#F47B20]' : 'text-[#0B2B68]'}`}>{progressPercent}%</span>
        </div>

        {/* Detected Places Fast Bar (if places are found in this chapter) */}
        {detectedPlaces.length > 0 && !isSplitScreen && (
          <div className="mt-3.5 p-2 sm:p-2.5 bg-gradient-to-r from-[#0B2B68] via-[#0D3680] to-[#082255] rounded-2xl text-white flex items-center justify-between gap-2 shadow-xs border border-[#F47B20]/30">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-xl bg-[#F47B20] text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Compass className="w-4 h-4 animate-spin-slow" />
              </div>
              <div className="truncate">
                <span className="text-[10px] font-sans font-bold text-[#FED65B] uppercase tracking-wider hidden sm:block">
                  Geografía Bíblica Sincronizada
                </span>
                <p className="text-xs font-bold text-white leading-tight truncate">
                  {detectedPlaces.length} {detectedPlaces.length === 1 ? 'lugar' : 'lugares'} <span className="hidden sm:inline">en este capítulo</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleSelectPlace(detectedPlaces[0], true)}
                className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-[#F47B20] hover:bg-[#EA580C] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                title="Dividir pantalla con mapa"
                aria-label="Pantalla Dividida"
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pantalla Dividida</span>
              </button>
              <button
                type="button"
                onClick={() => setShowPlacesDrawer(true)}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap"
                title="Ver lista de lugares"
                aria-label="Ver lugares"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lugares ({detectedPlaces.length})</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Settings Drawer (Collapsible) */}
      {showSettingsDrawer && (
        <div
          id="reader-settings-drawer"
          className={`border rounded-2xl p-4 sm:p-5 mb-6 shadow-md animate-in fade-in slide-in-from-top-2 duration-150 ${
            isDark
              ? 'bg-[#131722] border-[#252D43] text-white'
              : isSepia
              ? 'bg-[#FAF6EE] border-[#705335]/25 text-[#2D2319]'
              : 'bg-[#FFFFFF] border-[#0B2B68]/15 text-[#1B1C19]'
          }`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Font Size Selection */}
            <div>
              <label className="block text-xs font-label-caps uppercase mb-2 flex items-center gap-1.5 font-bold opacity-80">
                <Type className="w-3.5 h-3.5 text-[#F47B20]" />
                Tamaño de Letra
              </label>
              <div className={`flex gap-1.5 p-1 rounded-xl ${isDark ? 'bg-[#0B0F19]' : isSepia ? 'bg-[#EAE0D0]' : 'bg-[#F0EEE9]'}`}>
                {(['small', 'medium', 'large', 'extra-large'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => onUpdateSettings({ fontSize: size })}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      settings.fontSize === size
                        ? 'bg-[#0B2B68] text-[#F47B20] shadow-xs'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {size === 'small' ? 'A-' : size === 'medium' ? 'A' : size === 'large' ? 'A+' : 'A++'}
                  </button>
                ))}
              </div>
            </div>

            {/* Translation Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-label-caps uppercase flex items-center gap-1.5 font-bold opacity-80">
                  <BookOpen className="w-3.5 h-3.5 text-[#F47B20]" />
                  Versión Bíblica (Modo Offline)
                </label>
                <span className="text-[10px] opacity-60 font-medium">Modo 100% Local</span>
              </div>
              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-1.5 rounded-xl ${isDark ? 'bg-[#0B0F19]' : isSepia ? 'bg-[#EAE0D0]' : 'bg-[#F0EEE9]'}`}>
                {OFFICIAL_TRANSLATIONS.map((tr) => (
                  <button
                    key={tr.abbreviation}
                    id={`reader-trans-${tr.abbreviation}`}
                    onClick={() => {
                      onUpdateSettings({ translation: tr.abbreviation });
                      onToast(`Versión seleccionada: ${tr.name}`);
                    }}
                    className={`p-2 rounded-lg text-xs transition-all cursor-pointer text-left border ${
                      settings.translation === tr.abbreviation || settings.translation === tr.translation
                        ? 'bg-[#0B2B68] text-white border-[#0B2B68] shadow-xs'
                        : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-bold text-xs">{tr.abbreviation.toUpperCase()}</span>
                      <span className="text-[9px] px-1 py-0.2 rounded font-semibold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                        {tr.badge || 'Offline'}
                      </span>
                    </div>
                    <span className="block text-[11px] leading-tight truncate font-medium opacity-90">{tr.name.split('(')[0].trim()}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Scripture Text Container */}
      <main className="flex-1 min-h-[380px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-75">
            <BookOpen className="w-9 h-9 animate-pulse text-[#F47B20]" />
            <p className="font-body-ui text-sm font-medium">Cargando {bookMeta.name} {currentChapter} desde la API oficial...</p>
          </div>
        ) : verses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#F47B20]/15 flex items-center justify-center text-[#F47B20]">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-heading-display text-lg font-bold">No se pudieron cargar los versículos</h3>
              <p className="font-body-ui text-sm opacity-70 max-w-md mt-1">
                {fetchError || `Ocurrió una dificultad al consultar la API de GetBible para ${bookMeta.name} ${currentChapter}.`}
              </p>
            </div>
            <button
              onClick={loadChapter}
              className="px-5 py-2.5 bg-[#0B2B68] text-white font-bold text-sm rounded-xl hover:bg-[#081F4D] transition-all cursor-pointer shadow-md flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reintentar consulta API
            </button>
          </div>
        ) : (
          <article className="space-y-3.5 sm:space-y-4">
            {verses.map((verse) => {
              const bookmark = getBookmarkForVerse(verse.verse);
              const isSelected = selectedVerse?.verse === verse.verse;
              const isTargetHighlighted = highlightedVerseNumber === verse.verse;
              const isFirstVerse = verse.verse === 1;
              const inlinePlaces = versePlacesMap.get(verse.verse) || [];

              // Compute background color style if highlighted
              let highlightBg = '';
              let borderStyle = '';

              if (bookmark) {
                if (bookmark.color_hex === '#FFF2B2') highlightBg = isDark ? 'bg-[#FFF2B2]/20' : 'bg-[#FFF2B2]/40';
                else if (bookmark.color_hex === '#D2F5D7') highlightBg = isDark ? 'bg-[#D2F5D7]/20' : 'bg-[#D2F5D7]/40';
                else if (bookmark.color_hex === '#D3E7FF') highlightBg = isDark ? 'bg-[#D3E7FF]/20' : 'bg-[#D3E7FF]/40';
                borderStyle = 'border-l-4 border-l-[#F47B20] pl-3.5';
              } else if (isTargetHighlighted) {
                highlightBg = 'bg-[#F47B20]/15';
                borderStyle = 'border-l-4 border-l-[#0B2B68] pl-3.5';
              }

              return (
                <div
                  key={verse.verse}
                  id={`verse-row-${verse.verse}`}
                  onClick={() => setSelectedVerse(isSelected ? null : verse)}
                  className={`group relative rounded-xl p-2.5 sm:p-3 transition-all duration-150 cursor-pointer ${highlightBg} ${borderStyle} ${
                    isSelected
                      ? 'ring-2 ring-[#0B2B68]/60 bg-[#00A3E0]/15 shadow-xs'
                      : rowHoverClass
                  }`}
                >
                  <p className={`${getFontFamilyClass()} ${bodyTextClass} ${getFontSizeClass()} ${getLineHeightClass()} ${isFirstVerse && !highlightBg ? 'drop-cap' : ''}`}>
                    {/* Verse Number Indicator with sacred orange accent */}
                    {settings.showVerseNumbers !== false && (
                      <span className="select-none inline-block font-sans text-xs font-bold text-[#F47B20] mr-2.5 opacity-85 group-hover:opacity-100 transition-opacity">
                        {verse.verse}
                      </span>
                    )}
                    {verse.text}
                  </p>

                  {/* Inline Detected Places Chips */}
                  {inlinePlaces.length > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {inlinePlaces.map((pl) => (
                        <button
                          key={pl.id}
                          type="button"
                          onClick={() => handleSelectPlace(pl, true)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#0B2B68]/10 hover:bg-[#0B2B68] text-[#0B2B68] hover:text-white border border-[#0B2B68]/20 transition-all cursor-pointer shadow-2xs"
                          title={`Ver ${pl.name} en el mapa interactivo`}
                        >
                          <MapPin className="w-3 h-3 text-[#F25C05]" />
                          <span>{pl.cleanName || pl.name.split(' (')[0]}</span>
                          <span className="text-[9px] opacity-70">📍 Mapa</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Bookmark Annotation Indicator */}
                  {bookmark && (
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-body-ui">
                      <span className="font-semibold flex items-center gap-1.5 bg-[#FFFFFF] px-2.5 py-1 rounded-md border border-[#0B2B68]/20 text-[#0B2B68] shadow-2xs">
                        <Bookmark className="w-3 h-3 fill-current text-[#F25C05]" />
                        {bookmark.custom_title}
                      </span>
                      {bookmark.personal_note && (
                        <span className="text-[#454652] italic bg-[#FFFFFF]/60 px-2 py-0.5 rounded truncate max-w-xs sm:max-w-md">
                          "{bookmark.personal_note}"
                        </span>
                      )}
                    </div>
                  )}

                  {/* Contextual Action Bar when Verse is clicked */}
                  {isSelected && (
                    <div
                      id="contextual-verse-action-bar"
                      onClick={(e) => e.stopPropagation()}
                      className={`mt-3 p-2 sm:p-2.5 rounded-2xl shadow-xl flex items-center justify-between gap-1.5 sm:gap-2 animate-in fade-in zoom-in-95 duration-150 z-20 border border-[#F47B20]/40 ${
                        isDark
                          ? 'bg-[#141824] text-white shadow-2xl'
                          : isSepia
                          ? 'bg-[#3B2D1F] text-[#FAF6EF]'
                          : 'bg-[#0B2B68] text-white'
                      }`}
                    >
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenSaveModal(verse, bookmark)}
                          className="p-2 sm:px-3.5 sm:py-1.5 rounded-xl bg-[#F47B20] text-white font-body-ui text-xs font-bold hover:bg-[#EA580C] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                          title={bookmark ? 'Editar Guardado' : 'Guardar'}
                          aria-label={bookmark ? 'Editar Guardado' : 'Guardar'}
                        >
                          <Bookmark className="w-3.5 h-3.5 fill-current text-white" />
                          <span className="hidden sm:inline">{bookmark ? 'Editar' : 'Guardar'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onAskAIMentor(verse)}
                          className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer border border-[#F47B20]/30"
                          title="Exégesis y análisis histórico con IA"
                          aria-label="Mentor IA"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#F47B20]" />
                          <span className="hidden sm:inline">Mentor IA</span>
                        </button>

                        {/* Direct Map Action */}
                        {detectedPlaces.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              const match = inlinePlaces[0] || detectedPlaces[0];
                              handleSelectPlace(match, true);
                            }}
                            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-[#00A3E0]/20 hover:bg-[#00A3E0]/30 text-white text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer border border-[#00A3E0]/40"
                            title="Ver en Mapa Sincronizado"
                            aria-label="Ver en Mapa"
                          >
                            <Compass className="w-3.5 h-3.5 text-[#00A3E0]" />
                            <span className="hidden sm:inline">Mapa</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-0.5 sm:gap-1">
                        <button
                          type="button"
                          onClick={() => handleCopyVerse(verse)}
                          className="p-1.5 sm:p-2 hover:bg-white/15 text-white rounded-lg transition-colors cursor-pointer"
                          title="Copiar versículo"
                          aria-label="Copiar versículo"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleShareVerse(verse)}
                          className="p-1.5 sm:p-2 hover:bg-white/15 text-white rounded-lg transition-colors cursor-pointer"
                          title="Compartir versículo"
                          aria-label="Compartir versículo"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </article>
        )}
      </main>

      {/* Scripture Legal & Copyright Footer */}
      <ScriptureCopyrightFooter translation={settings.translation} />

      {/* Bottom Chapter Navigation Bar */}
      <footer className="mt-10 pt-5 border-t border-[#0B2B68]/15 flex justify-between items-center text-sm font-label-caps">
        <button
          onClick={handlePrevChapter}
          className="flex items-center gap-1 sm:gap-1.5 text-[#0B2B68] hover:text-[#F47B20] p-2 sm:px-3.5 sm:py-2 rounded-xl hover:bg-[#EAE8E3] transition-colors cursor-pointer font-semibold"
          aria-label="Capítulo anterior"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Capítulo anterior</span>
          <span className="sm:hidden text-xs">Anterior</span>
        </button>

        <span className="text-xs opacity-75 font-bold">
          {bookMeta.name} {currentChapter} / {bookMeta.chaptersCount}
        </span>

        <button
          onClick={handleNextChapter}
          className="flex items-center gap-1 sm:gap-1.5 text-[#0B2B68] hover:text-[#F47B20] p-2 sm:px-3.5 sm:py-2 rounded-xl hover:bg-[#EAE8E3] transition-colors cursor-pointer font-semibold"
          aria-label="Capítulo siguiente"
        >
          <span className="hidden sm:inline">Capítulo siguiente</span>
          <span className="sm:hidden text-xs">Siguiente</span>
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </footer>
    </div>
  );

  return (
    <div id="sanctuary-reader-view" className="w-full flex-1 flex flex-col justify-between py-2 sm:py-4 animate-in fade-in duration-200">
      {/* If Split Screen is Active: Render 2-Column Responsive Layout */}
      {isSplitScreen ? (
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4">
          {/* Split Mode Top Navigation Bar */}
          <div className="flex items-center justify-between p-2.5 sm:p-3 mb-4 bg-gradient-to-r from-[#0B2B68] to-[#082255] text-white rounded-2xl shadow-md border border-[#F25C05]/30">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#F25C05] text-white flex items-center justify-center shadow-xs">
                <Columns className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-sans font-bold text-[#FED65B] uppercase tracking-wider block">
                  Modo Sincronizado en Tiempo Real
                </span>
                <span className="text-xs sm:text-sm font-bold text-white">
                  {bookMeta.name} {currentChapter} ⇄ Mapas Bíblicos
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onOpenMap && (
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenMap) {
                      onOpenMap(activeMapItineraryId || matchingItinerary?.id, activeMapWaypointId);
                    }
                  }}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all cursor-pointer"
                  title="Abrir mapa en pantalla completa"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Mapa Completo</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsSplitScreen(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F25C05] hover:bg-[#EA580C] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cerrar Dividida</span>
              </button>
            </div>
          </div>

          {/* Grid with Left Reader + Right Map */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column: Reader Pane */}
            <div className={`lg:col-span-6 xl:col-span-6 rounded-3xl p-4 sm:p-6 border shadow-sm max-h-[85vh] overflow-y-auto ${
              isDark
                ? 'bg-[#141824] border-[#252D43] text-[#F1F3F9]'
                : isSepia
                ? 'bg-[#FAF6EF] border-[#705335]/20 text-[#2D2319]'
                : 'bg-white border-[#0B2B68]/15 text-[#1B1C19]'
            }`}>
              {renderReaderPane()}
            </div>

            {/* Right Column: Interactive Map */}
            <div className={`lg:col-span-6 xl:col-span-6 rounded-3xl border shadow-md overflow-hidden min-h-[560px] lg:h-[85vh] sticky top-4 ${
              isDark
                ? 'bg-[#0B0F19] border-[#252D43]'
                : isSepia
                ? 'bg-[#F5EFE6] border-[#705335]/20'
                : 'bg-[#FAF8F5] border-[#0B2B68]/20'
            }`}>
              <BiblicalMapsView
                initialItineraryId={activeMapItineraryId || matchingItinerary?.id}
                initialWaypointId={activeMapWaypointId}
                activeWaypointId={activeMapWaypointId}
                isSplitView={true}
                onCloseSplit={() => setIsSplitScreen(false)}
                onWaypointSelected={handleWaypointSelectedInMap}
                onSelectScripture={(bookId, chapter, verse) => {
                  onNavigateChapter(bookId, chapter, verse);
                }}
                onToast={onToast}
                currentTheme={settings.themeMode}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Normal Single-Column Reader Layout */
        <div className="w-full max-w-[780px] mx-auto px-4 sm:px-6">
          {renderReaderPane()}
        </div>
      )}

      {/* Floating Places Indicator Button (Bottom Right) */}
      {!isSplitScreen && detectedPlaces.length > 0 && (
        <div className="fixed bottom-20 md:bottom-8 right-4 sm:right-8 z-30 flex flex-col items-end gap-2 animate-in slide-in-from-bottom-3 duration-300">
          <button
            type="button"
            onClick={() => setShowPlacesDrawer(true)}
            aria-label="Lugares geográficos en este capítulo"
            className="flex items-center gap-2.5 px-4 py-3 bg-[#0B2B68] text-white rounded-full shadow-2xl hover:bg-[#082255] border-2 border-[#FED65B] hover:scale-105 transition-all duration-200 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center">
              <div className="w-7 h-7 rounded-full bg-[#F25C05] text-white flex items-center justify-center shadow-xs">
                <Compass className="w-4 h-4 group-hover:rotate-45 transition-transform" />
              </div>
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#FED65B] text-[#0B2B68] text-[10px] font-black flex items-center justify-center">
                {detectedPlaces.length}
              </span>
            </div>

            <div className="text-left">
              <span className="text-[10px] font-sans font-bold text-[#FED65B] uppercase tracking-wider block leading-none">
                Lugares en el Texto
              </span>
              <span className="text-xs font-bold text-white">
                {detectedPlaces.length} {detectedPlaces.length === 1 ? 'lugar en el mapa' : 'lugares en el mapa'}
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Detected Places Bottom Sheet / Drawer Modal */}
      {showPlacesDrawer && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
          onClick={() => setShowPlacesDrawer(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-4 duration-200 ${
              isDark
                ? 'bg-[#141824] border-[#252D43] text-[#F1F3F9]'
                : isSepia
                ? 'bg-[#FAF6EF] border-[#705335]/25 text-[#2D2319]'
                : 'bg-[#FAF8F5] border-[#0B2B68]/20 text-[#1B1C19]'
            }`}
          >
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-br from-[#082255] via-[#0B2B68] to-[#051433] text-white">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-[#F25C05] text-white flex items-center justify-center shadow-xs">
                    <Compass className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-sans font-bold text-[#FED65B] uppercase tracking-wider">
                    Sincronización Geográfica
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPlacesDrawer(false)}
                  className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h3 className="font-serif italic font-bold text-xl text-white">
                Lugares Bíblicos en {bookMeta.name} {currentChapter}
              </h3>
              <p className="text-xs text-white/80 mt-0.5">
                Se detectaron {detectedPlaces.length} hitos geográficos mapeados con evidencia arqueológica e histórica.
              </p>
            </div>

            {/* Quick Actions Bar */}
            <div className={`p-3 border-b flex gap-2 ${
              isDark
                ? 'bg-[#1A2033] border-[#252D43]'
                : isSepia
                ? 'bg-[#EFE7D8] border-[#705335]/20'
                : 'bg-white border-[#0B2B68]/10'
            }`}>
              <button
                type="button"
                onClick={() => {
                  if (detectedPlaces[0]) {
                    handleSelectPlace(detectedPlaces[0], true);
                  }
                }}
                className="flex-1 py-2 px-3 bg-[#0B2B68] hover:bg-[#082255] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Columns className="w-3.5 h-3.5 text-[#FED65B]" />
                <span>Pantalla Dividida</span>
              </button>

              {onOpenMap && (
                <button
                  type="button"
                  onClick={() => {
                    setShowPlacesDrawer(false);
                    onOpenMap(matchingItinerary?.id, detectedPlaces[0]?.id);
                  }}
                  className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    isDark
                      ? 'bg-[#1C2337] hover:bg-[#252D43] text-white border-[#252D43]'
                      : isSepia
                      ? 'bg-[#FAF6EF] hover:bg-[#EAE0D0] text-[#3B2D1F] border-[#705335]/20'
                      : 'bg-[#FAF8F5] hover:bg-[#EAE8E3] text-[#0B2B68] border-[#0B2B68]/20'
                  }`}
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#F25C05]" />
                  <span>Mapa Completo</span>
                </button>
              )}
            </div>

            {/* Places List */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {detectedPlaces.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border shadow-2xs hover:border-[#F25C05]/50 transition-all space-y-2 ${
                    isDark
                      ? 'bg-[#1C2337] border-[#252D43]'
                      : isSepia
                      ? 'bg-[#FAF6EF] border-[#705335]/20'
                      : 'bg-white border-[#0B2B68]/15'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#F25C05] text-white text-[10px] font-bold flex items-center justify-center">
                          {item.order}
                        </span>
                        <h4 className={`font-serif italic font-bold text-sm sm:text-base ${
                          isDark ? 'text-white' : isSepia ? 'text-[#3B2D1F]' : 'text-[#0B2B68]'
                        }`}>
                          {item.name}
                        </h4>
                      </div>
                      <p className={`text-[11px] mt-0.5 ${
                        isDark ? 'text-[#9AA5C2]' : isSepia ? 'text-[#705335]' : 'text-[#767683]'
                      }`}>
                        📍 {item.modernName} • {item.itineraryTitle}
                      </p>
                    </div>

                    <span className="text-[10px] font-mono font-bold text-[#F25C05] bg-[#F25C05]/10 px-2 py-0.5 rounded-md shrink-0">
                      v. {item.matchedVerses.join(', ')}
                    </span>
                  </div>

                  {item.ancientName && (
                    <p className={`text-[11px] italic ${
                      isDark ? 'text-[#CBD5E1]' : isSepia ? 'text-[#5C4A3A]' : 'text-[#454652]'
                    }`}>
                      Nombre bíblico/antiguo: <span className="font-semibold">{item.ancientName}</span>
                    </p>
                  )}

                  <p className={`text-xs line-clamp-2 leading-relaxed ${
                    isDark ? 'text-[#E2E8F0]' : isSepia ? 'text-[#423326]' : 'text-[#454652]'
                  }`}>
                    {item.historicalContext}
                  </p>

                  <div className={`pt-2 border-t flex items-center justify-between gap-2 ${
                    isDark ? 'border-[#252D43]' : isSepia ? 'border-[#705335]/15' : 'border-[#0B2B68]/10'
                  }`}>
                    <button
                      type="button"
                      onClick={() => handleSelectPlace(item, true)}
                      className="px-3 py-1.5 bg-[#0B2B68] hover:bg-[#F25C05] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Ver en Mapa</span>
                    </button>

                    {item.matchedVerses[0] && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowPlacesDrawer(false);
                          const el = document.getElementById(`verse-row-${item.matchedVerses[0]}`);
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                        }}
                        className={`text-xs font-semibold hover:text-[#F25C05] transition-colors ${
                          isDark ? 'text-[#93C5FD]' : isSepia ? 'text-[#8C5E32]' : 'text-[#0B2B68]'
                        }`}
                      >
                        Ir al versículo {item.matchedVerses[0]} →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


