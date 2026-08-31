import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Share2,
  Copy,
  Maximize2,
  Minimize2,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Tag as TagIcon,
  Calendar,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  MapPin,
  Ticket,
  Image as ImageIcon,
  Globe
} from 'lucide-react';
import { UserEvent, EventCategory, ReadingSettings, BibleVerse } from '../types';
import { fetchBibleChapter } from '../data/bibleData';
import { getLocalBooksSync } from '../services/bibleDatabaseService';
import { getMapsUrlForLocation } from '../services/storageService';
import { EventShareModal } from './EventShareModal';

interface EventPresentationViewProps {
  event: UserEvent;
  category?: EventCategory;
  settings: ReadingSettings;
  onExit: () => void;
  onNavigateToScripture?: (bookId: string, chapter: number, verse?: number) => void;
  onShareContent?: (title: string, text: string, reference?: string) => void;
  onToast?: (msg: string) => void;
}

interface LoadedVerseItem {
  reference: string;
  bookId: string;
  bookName: string;
  chapter: number;
  verse?: number;
  text?: string;
  isLoading: boolean;
}

export const EventPresentationView: React.FC<EventPresentationViewProps> = ({
  event,
  category,
  settings,
  onExit,
  onNavigateToScripture,
  onShareContent,
  onToast
}) => {
  // Font scale for easy reading at the pulpit (1 = 100%, 1.25 = 125%, 1.5 = 150%, 1.75 = 175%)
  const [fontScale, setFontScale] = useState<number>(1.2);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Flyer share modal state
  const [isShareFlyerOpen, setIsShareFlyerOpen] = useState<boolean>(false);

  // Preaching timer (simple and unobtrusive)
  const [showTimer, setShowTimer] = useState<boolean>(true);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Loaded Scripture passages
  const [loadedVerses, setLoadedVerses] = useState<LoadedVerseItem[]>([]);

  // Screen Wake Lock (keep phone screen on during sermon)
  const wakeLockSentinelRef = useRef<any>(null);

  const isDark = settings.themeMode === 'dark';
  const isSepia = settings.themeMode === 'sepia';

  const containerBg = isDark
    ? 'bg-[#0A0E17] text-[#F3F4F6]'
    : isSepia
    ? 'bg-[#F6EFE6] text-[#2C2216]'
    : 'bg-[#FAF9F6] text-[#1E293B]';

  const cardBg = isDark
    ? 'bg-[#131B2E] border-[#252E48]'
    : isSepia
    ? 'bg-[#EFE5D5] border-[#D8C6AF]'
    : 'bg-white border-[#E2E8F0]';

  const subtextColor = isDark ? 'text-slate-400' : isSepia ? 'text-[#7D6448]' : 'text-slate-500';

  // Request WakeLock so screen never sleeps during the presentation
  useEffect(() => {
    let released = false;
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator) {
        try {
          const sentinel = await (navigator as any).wakeLock.request('screen');
          if (!released) {
            wakeLockSentinelRef.current = sentinel;
          }
        } catch {}
      }
    };
    requestWakeLock();

    return () => {
      released = true;
      if (wakeLockSentinelRef.current) {
        wakeLockSentinelRef.current.release().catch(() => {});
      }
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  const formatTimer = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Load Scripture texts for linkedVerses
  useEffect(() => {
    if (!event.linkedVerses || event.linkedVerses.length === 0) {
      setLoadedVerses([]);
      return;
    }

    const currentBooks = getLocalBooksSync(settings.translation);
    const items: LoadedVerseItem[] = event.linkedVerses.map((refStr) => {
      const match = refStr.trim().match(/^((?:\d\s+)?[a-záéíóúñA-ZÁÉÍÓÚÑ]+)\s*(\d+)(?:[:\.](\d+))?/i);
      if (match) {
        const namePart = match[1].toLowerCase().trim();
        const chNum = parseInt(match[2], 10);
        const vNum = match[3] ? parseInt(match[3], 10) : undefined;

        const foundBook = currentBooks.find(
          (b) =>
            b.name.toLowerCase() === namePart ||
            b.englishName.toLowerCase() === namePart ||
            b.abbreviation.toLowerCase() === namePart ||
            b.name.toLowerCase().startsWith(namePart)
        );

        if (foundBook) {
          return {
            reference: refStr,
            bookId: foundBook.id,
            bookName: foundBook.name,
            chapter: chNum,
            verse: vNum,
            isLoading: true
          };
        }
      }

      return {
        reference: refStr,
        bookId: 'JHN',
        bookName: refStr,
        chapter: 1,
        isLoading: false
      };
    });

    setLoadedVerses(items);

    // Fetch texts asynchronously
    items.forEach((item, index) => {
      if (item.bookId) {
        fetchBibleChapter(item.bookId, item.chapter, settings.translation || 'RVR1960')
          .then((chapterVerses: BibleVerse[]) => {
            let textToDisplay = '';
            if (item.verse) {
              const exactVerse = chapterVerses.find((v) => v.verse === item.verse);
              textToDisplay = exactVerse ? exactVerse.text : `"${chapterVerses[0]?.text || ''}..."`;
            } else {
              textToDisplay = chapterVerses.slice(0, 3).map((v) => `${v.verse}. ${v.text}`).join(' ');
            }

            setLoadedVerses((prev) => {
              const updated = [...prev];
              if (updated[index]) {
                updated[index] = {
                  ...updated[index],
                  text: textToDisplay,
                  isLoading: false
                };
              }
              return updated;
            });
          })
          .catch(() => {
            setLoadedVerses((prev) => {
              const updated = [...prev];
              if (updated[index]) {
                updated[index] = {
                  ...updated[index],
                  isLoading: false
                };
              }
              return updated;
            });
          });
      }
    });
  }, [event.linkedVerses, settings.translation]);

  // Copy or Share notes
  const handleCopy = () => {
    let shareText = `📖 ${event.title}\n📅 ${event.eventDate}\n`;
    if (event.startTime) {
      shareText += `⏰ Horario: ${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}\n`;
    }
    if (event.location) {
      shareText += `📍 Ubicación: ${event.location}\n`;
    }
    if (event.price) {
      shareText += `🎟️ Inversión / Entrada: ${event.price}\n`;
    }
    shareText += `\n📝 APUNTES:\n${event.description}\n\n📜 Pasajes Bíblicos: ${event.linkedVerses?.join(', ') || 'N/A'}`;

    navigator.clipboard.writeText(shareText).then(() => {
      if (onToast) onToast('¡Información del evento copiada!');
    });
  };

  const handleShare = () => {
    setIsShareFlyerOpen(true);
  };

  // Format date nicely: "Domingo, 29 de Agosto de 2026"
  const formattedDate = (() => {
    try {
      const parts = event.eventDate.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      return event.eventDate;
    } catch {
      return event.eventDate;
    }
  })();

  const catColor = category?.colorHex || '#0B2B68';

  return (
    <div
      id="event-presentation-fullscreen"
      className={`fixed inset-0 z-50 flex flex-col ${containerBg} overflow-hidden select-text`}
    >
      {/* ======================================================== */}
      {/* 1. TOP PRESENTATION BAR (Read-Only, Clean Controls)     */}
      {/* ======================================================== */}
      <header
        className={`px-3 sm:px-6 py-2.5 sm:py-3.5 border-b flex items-center justify-between gap-2 shrink-0 z-20 backdrop-blur-md shadow-xs ${
          isDark
            ? 'bg-[#0E1422]/95 border-[#252E48]'
            : isSepia
            ? 'bg-[#F2E8DA]/95 border-[#D8C6AF]'
            : 'bg-[#FAF9F6]/95 border-[#E2E8F0]'
        }`}
      >
        {/* Left: Back / Exit Button */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={onExit}
            className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border flex items-center gap-2 text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 shadow-2xs ${
              isDark
                ? 'bg-[#182236] border-[#252E48] text-[#E2E8F0] hover:bg-[#252E48]'
                : isSepia
                ? 'bg-[#EFE5D5] border-[#D8C6AF] text-[#4A3B2C] hover:bg-[#E4D7C3]'
                : 'bg-white border-[#E2E8F0] text-[#0B2B68] hover:bg-slate-50'
            }`}
            title="Cerrar y volver a la lista de eventos"
            aria-label="Volver"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>Volver</span>
          </button>

          {/* Category Pill */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shrink-0"
            style={{
              backgroundColor: `${catColor}15`,
              color: catColor,
              border: `1px solid ${catColor}30`
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: catColor }} />
            <span>{category?.name || 'Evento'}</span>
          </div>

          <span className="hidden md:inline text-xs truncate max-w-[200px] lg:max-w-[320px] font-semibold opacity-70">
            {event.title}
          </span>
        </div>

        {/* Center / Right: Unobtrusive Preaching Timer */}
        {showTimer && (
          <div
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 rounded-xl border shrink-0 ${
              isDark
                ? 'bg-[#182236] border-[#252E48]'
                : isSepia
                ? 'bg-[#EAE0D0] border-[#D8C6AF]'
                : 'bg-white border-[#E2E8F0] shadow-2xs'
            }`}
          >
            <Clock
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${
                isTimerRunning ? 'text-red-500 animate-pulse' : 'text-[#00A3E0]'
              }`}
            />
            <span className="font-mono text-xs sm:text-sm font-black tracking-wider text-inherit">
              {formatTimer(timerSeconds)}
            </span>

            <button
              type="button"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                isTimerRunning
                  ? 'bg-amber-500 text-white hover:bg-amber-600'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
              title={isTimerRunning ? 'Pausar cronómetro' : 'Iniciar cronómetro de prédica'}
            >
              {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsTimerRunning(false);
                setTimerSeconds(0);
              }}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              title="Reiniciar cronómetro"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Right: Font Size Controls & Fullscreen */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Font Size A- / A+ */}
          <div
            className={`flex items-center rounded-xl border overflow-hidden ${
              isDark ? 'bg-[#182236] border-[#252E48]' : isSepia ? 'bg-[#EFE5D5] border-[#D8C6AF]' : 'bg-white border-[#E2E8F0]'
            }`}
          >
            <button
              type="button"
              onClick={() => setFontScale((prev) => Math.max(0.9, prev - 0.15))}
              className="px-2 py-1 text-xs font-bold hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
              title="Reducir tamaño de letra"
            >
              A-
            </button>
            <span className="px-1 text-[10px] font-mono opacity-60">
              {Math.round(fontScale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setFontScale((prev) => Math.min(2.0, prev + 0.15))}
              className="px-2 py-1 text-xs font-bold hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
              title="Aumentar tamaño de letra"
            >
              A+
            </button>
          </div>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className={`p-2 rounded-xl border cursor-pointer transition-all ${
              isDark
                ? 'bg-[#182236] border-[#252E48] text-white hover:bg-[#252E48]'
                : isSepia
                ? 'bg-[#EFE5D5] border-[#D8C6AF] text-[#4A3B2C] hover:bg-[#E4D7C3]'
                : 'bg-white border-[#E2E8F0] text-slate-800 hover:bg-slate-50'
            }`}
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Share / Copy */}
          <button
            type="button"
            onClick={handleShare}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-[#0B2B68] text-[#FED65B] text-xs font-bold hover:bg-[#081F4B] flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
            title="Compartir o copiar apunte"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Compartir</span>
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. MAIN PRESENTATION CONTENT (Organized & Readable)      */}
      {/* ======================================================== */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-16">
          {/* ==================================================== */}
          {/* A. TITLE & METADATA CARD                             */}
          {/* ==================================================== */}
          <section
            className={`rounded-2xl sm:rounded-3xl border shadow-sm transition-all overflow-hidden ${cardBg}`}
          >
            {/* Optional Event Image Banner */}
            {event.imageUrl && (
              <div className="relative w-full h-48 sm:h-64 lg:h-72 bg-slate-900 overflow-hidden">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Hide if broken
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs font-semibold">
                  {event.location && (
                    <a
                      href={getMapsUrlForLocation(event.location)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md hover:bg-black/80 transition-colors"
                      title="Ver en Google Maps"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#F47B20]" />
                      <span>{event.location}</span>
                      <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />
                    </a>
                  )}
                  {event.price && (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700/80 backdrop-blur-md">
                      <Ticket className="w-3.5 h-3.5 text-[#FED65B]" />
                      <span>{event.price}</span>
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="p-5 sm:p-8">
              {/* Category & Date & Schedule badges */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold"
                  style={{
                    backgroundColor: `${catColor}15`,
                    color: catColor,
                    border: `1px solid ${catColor}30`
                  }}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: catColor }} />
                  <span>{category?.name || 'Evento / Prédica'}</span>
                </div>

                <div className={`flex flex-wrap items-center gap-3 text-xs sm:text-sm font-medium ${subtextColor}`}>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#F47B20]" />
                    <span className="capitalize">{formattedDate}</span>
                  </div>

                  {event.startTime && (
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#00A3E0]/10 text-[#00A3E0] font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{event.startTime}{event.endTime ? ` - ${event.endTime}` : ''}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Main Sermon Title */}
              <h1
                className="font-serif font-black tracking-tight text-inherit leading-tight"
                style={{ fontSize: `${2.0 * fontScale}rem` }}
              >
                {event.title}
              </h1>

              {/* Extra Metadata (Location & Price if without image) */}
              {(event.location || event.price) && !event.imageUrl && (
                <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-inherit/15 text-xs sm:text-sm">
                  {event.location && (
                    <a
                      href={getMapsUrlForLocation(event.location)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-inherit/80 hover:text-[#00A3E0] font-medium transition-colors"
                      title="Ver en Google Maps"
                    >
                      <MapPin className="w-4 h-4 text-[#F47B20] shrink-0" />
                      <span>{event.location}</span>
                      <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />
                    </a>
                  )}
                  {event.price && (
                    <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                      <Ticket className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Inversión: {event.price}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Tags list */}
              {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-inherit/20">
                  {event.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        isDark
                          ? 'bg-[#1E293B] text-slate-300 border border-slate-700'
                          : isSepia
                          ? 'bg-[#E5D7C3] text-[#4A3B2C] border border-[#DECDB8]'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <TagIcon className="w-3 h-3 text-[#F47B20]" />
                      <span>#{tag}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ==================================================== */}
          {/* B. LINKED SCRIPTURES SECTION                         */}
          {/* ==================================================== */}
          {loadedVerses.length > 0 && (
            <section className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#0B2B68] text-[#FED65B] flex items-center justify-center shadow-xs">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold font-serif tracking-tight">
                    Pasajes Bíblicos Clave
                  </h2>
                </div>
                <span className={`text-xs font-semibold ${subtextColor}`}>
                  {settings.translation || 'RVR1960'}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {loadedVerses.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${cardBg} hover:shadow-md`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#0B2B68]/15 text-[#0B2B68] dark:text-[#93C5FD] font-mono text-xs font-black flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h3 className="text-sm sm:text-base font-black font-serif text-[#0B2B68] dark:text-[#93C5FD]">
                          {item.reference}
                        </h3>
                      </div>

                      {onNavigateToScripture && item.bookId && (
                        <button
                          type="button"
                          onClick={() => {
                            onExit();
                            onNavigateToScripture(item.bookId, item.chapter, item.verse);
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#00A3E0]/15 text-[#00A3E0] hover:bg-[#00A3E0]/25 flex items-center gap-1 cursor-pointer transition-all"
                          title="Abrir capítulo completo en el lector bíblico"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span className="hidden xs:inline">Ver Capítulo</span>
                        </button>
                      )}
                    </div>

                    {item.isLoading ? (
                      <div className="flex items-center gap-2 py-2 text-xs opacity-60">
                        <div className="w-3.5 h-3.5 border-2 border-inherit border-t-transparent rounded-full animate-spin" />
                        <span>Cargando texto sagrado...</span>
                      </div>
                    ) : item.text ? (
                      <p
                        className="font-serif italic text-inherit opacity-95 leading-relaxed pl-3 border-l-2 border-[#FED65B]"
                        style={{ fontSize: `${1.05 * fontScale}rem` }}
                      >
                        "{item.text}"
                      </p>
                    ) : (
                      <p className="text-xs opacity-60">Pasaje bíblico listo para lectura.</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ==================================================== */}
          {/* C. SERMON OUTLINE & NOTES CONTENT                    */}
          {/* ==================================================== */}
          <section className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#F47B20] text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h2 className="text-base sm:text-lg font-bold font-serif tracking-tight">
                  Bosquejo & Apuntes de la Prédica
                </h2>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="text-xs font-bold text-[#00A3E0] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar texto</span>
              </button>
            </div>

            <div
              className={`p-6 sm:p-8 rounded-2xl sm:rounded-3xl border shadow-sm ${cardBg}`}
            >
              {event.description && event.description.trim() ? (
                <div
                  className="font-serif leading-relaxed text-inherit space-y-4 whitespace-pre-wrap select-text"
                  style={{ fontSize: `${1.1 * fontScale}rem`, lineHeight: 1.7 }}
                >
                  {event.description}
                </div>
              ) : (
                <div className="py-8 text-center text-sm opacity-60">
                  No hay apuntes o bosquejo escrito para este evento.
                </div>
              )}
            </div>
          </section>

          {/* ==================================================== */}
          {/* D. FOOTER ACTIONS                                    */}
          {/* ==================================================== */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-inherit/20">
            <button
              type="button"
              onClick={onExit}
              className={`w-full sm:w-auto px-6 py-3 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                isDark
                  ? 'bg-[#182236] border-[#252E48] text-white hover:bg-[#252E48]'
                  : isSepia
                  ? 'bg-[#EFE5D5] border-[#D8C6AF] text-[#4A3B2C] hover:bg-[#E4D7C3]'
                  : 'bg-white border-[#E2E8F0] text-[#0B2B68] hover:bg-slate-50'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Finalizar Lectura y Volver</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#0B2B68] text-[#FED65B] hover:bg-[#081F4B] text-sm font-black flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>Compartir Afiche / Evento</span>
            </button>
          </div>
        </div>
      </main>

      {/* Event Flyer Share Modal */}
      <EventShareModal
        isOpen={isShareFlyerOpen}
        event={event}
        category={category}
        onClose={() => setIsShareFlyerOpen(false)}
        onToast={onToast}
        currentTheme={settings.themeMode}
      />
    </div>
  );
};
