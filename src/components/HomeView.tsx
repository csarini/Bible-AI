import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  Compass,
  Bookmark,
  Search,
  Volume2,
  VolumeX,
  Share2,
  RefreshCw,
  ArrowRight,
  Sun,
  Flame,
  Shield,
  Heart,
  Anchor,
  Feather,
  Lightbulb,
  Cross,
  Calendar
} from 'lucide-react';
import { getRandomDailyVerse, getRandomDailyVerseSync } from '../data/bibleData';
import { getBookByIdOrNumber } from '../services/bibleDatabaseService';
import { DailyVerse, ActiveTab, LocalBookmark, ReadingSettings } from '../types';
import { ShareContent } from '../services/shareService';

interface HomeViewProps {
  onNavigateTab: (tab: ActiveTab) => void;
  onNavigateScripture: (bookId: string, chapter: number, verseNum?: number) => void;
  onOpenSaveModal: (text: string, reference: string, bookId?: string, chapter?: number, verse?: number) => void;
  onShareVerse: (content: ShareContent) => void;
  onAskAIMentor: (verse: { bookId: string; bookName: string; chapter: number; verse: number; text: string }) => void;
  onToast: (msg: string) => void;
  bookmarksCount: number;
  lastReadBookId?: string;
  lastReadChapter?: number;
  currentTheme?: 'light' | 'sepia' | 'dark';
}

const THEME_TOPICS = [
  { id: 'all', label: 'Todos', icon: Sparkles },
  { id: 'Paz', label: 'Paz', icon: Anchor },
  { id: 'Fortaleza', label: 'Fortaleza', icon: Shield },
  { id: 'Esperanza', label: 'Esperanza', icon: Feather },
  { id: 'Amor', label: 'Amor', icon: Heart },
  { id: 'Sabiduría', label: 'Sabiduría', icon: Lightbulb },
  { id: 'Protección', label: 'Protección', icon: Flame }
];

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigateTab,
  onNavigateScripture,
  onOpenSaveModal,
  onShareVerse,
  onAskAIMentor,
  onToast,
  bookmarksCount,
  lastReadBookId = 'MAT',
  lastReadChapter = 4,
  currentTheme = 'light'
}) => {
  const isDark = currentTheme === 'dark';
  const isSepia = currentTheme === 'sepia';

  // Dynamic random verse state
  const [currentDailyVerse, setCurrentDailyVerse] = useState<DailyVerse>(() => getRandomDailyVerseSync());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [activeSubTab, setActiveSubTab] = useState<'verse' | 'reflection' | 'prayer'>('verse');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Initialize with a fresh random verse on entrance
  useEffect(() => {
    getRandomDailyVerse('valera', undefined, currentDailyVerse?.id)
      .then((verse) => {
        if (verse) {
          setCurrentDailyVerse(verse);
        }
      })
      .catch(() => {
        // Fallback already set synchronously
      });
  }, []);

  // Manual refresh / change verse handler
  const handleRandomizeVerse = (topic?: string) => {
    setIsRefreshing(true);
    // Stop audio if playing
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }

    const topicToUse = topic !== undefined ? topic : selectedTopic;
    getRandomDailyVerse('valera', topicToUse, currentDailyVerse?.id)
      .then((newVerse) => {
        setCurrentDailyVerse(newVerse);
        setIsRefreshing(false);
        onToast('Nuevo versículo revelado');
      })
      .catch(() => {
        const fallback = getRandomDailyVerseSync(topicToUse, currentDailyVerse?.id);
        setCurrentDailyVerse(fallback);
        setIsRefreshing(false);
        onToast('Nuevo versículo revelado');
      });
  };

  // Audio Speech Synthesis for verse
  const handleToggleAudio = () => {
    if (!('speechSynthesis' in window)) {
      onToast('Tu navegador no soporta síntesis de voz');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const speechText = `${currentDailyVerse.reference}. ${currentDailyVerse.text}. Reflexión: ${currentDailyVerse.reflection}.`;
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = 'es-ES';
    utterance.rate = 0.92;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
    onToast('Reproduciendo versículo del día');
  };

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const lastReadBook = getBookByIdOrNumber(lastReadBookId || 'MAT');

  // Theme token classes
  const cardBgClass = isDark
    ? 'bg-[#1C2337] border-[#2E3B5B] text-[#F1F3F9]'
    : isSepia
      ? 'bg-[#F4EFE6] border-[#705335]/20 text-[#2D2319]'
      : 'bg-white border-[#0B2B68]/15 text-[#1B1C19]';

  const subCardBgClass = isDark
    ? 'bg-[#131722] border-[#252D43]'
    : isSepia
      ? 'bg-[#EAE0D0] border-[#705335]/15'
      : 'bg-[#FAF8F5] border-[#0B2B68]/10';

  return (
    <div
      id="home-view"
      className="w-full max-w-full overflow-x-hidden max-w-5xl mx-auto px-3 sm:px-6 py-3 sm:py-6 flex flex-col gap-4 sm:gap-7 animate-in fade-in duration-300"
    >
      {/* Explore by Theme / Biblical Topics */}
      <section className="flex flex-col gap-2 w-full max-w-full">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-bold text-xs sm:text-base text-inherit flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F47B20]" />
            Promesas por Tema Bíblico
          </h2>
          <span className="text-[11px] opacity-70 hidden sm:inline">
            Toca un tema para cambiar de versículo
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none w-full max-w-full touch-pan-x">
          {THEME_TOPICS.map((topic) => {
            const Icon = topic.icon;
            const isSelected = selectedTopic === topic.id;
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => {
                  setSelectedTopic(topic.id);
                  handleRandomizeVerse(topic.id);
                }}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-sans font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${isSelected
                    ? 'bg-[#0B2B68] text-white shadow-2xs'
                    : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-inherit border border-inherit/20'
                  }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#FED65B]' : 'text-[#F47B20]'}`} />
                <span>{topic.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Featured Verse of the Day Hero Card */}
      <section
        id="verse-of-the-day-hero"
        className={`relative overflow-hidden rounded-3xl p-5 sm:p-7 border shadow-md transition-all ${cardBgClass}`}
      >
        {/* Subtle background glow accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#F47B20]/15 via-transparent to-transparent pointer-events-none rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#0B2B68]/10 via-transparent to-transparent pointer-events-none rounded-full blur-xl" />

        {/* Hero Top Bar */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2.5 mb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#0B2B68] text-[#FED65B] text-xs font-sans font-bold flex items-center gap-1.5 shadow-2xs">
              <Sun className="w-3.5 h-3.5 text-[#FED65B]" />
              <span>Versículo del Día</span>
            </span>
            <span className="text-xs font-sans font-semibold px-2.5 py-0.5 rounded-full bg-[#F47B20]/15 text-[#F47B20] border border-[#F47B20]/30">
              {currentDailyVerse.theme}
            </span>
          </div>

          {/* Sub-tabs: Versículo, Reflexión, Oración + Randomize button */}
          <div className="flex items-center gap-2">
            <div className={`flex items-center p-1 rounded-xl border ${subCardBgClass}`}>
              <button
                onClick={() => setActiveSubTab('verse')}
                className={`px-3 py-1 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ${activeSubTab === 'verse'
                    ? 'bg-[#0B2B68] text-white shadow-2xs'
                    : 'opacity-70 hover:opacity-100'
                  }`}
              >
                Versículo
              </button>
              <button
                onClick={() => setActiveSubTab('reflection')}
                className={`px-3 py-1 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ${activeSubTab === 'reflection'
                    ? 'bg-[#0B2B68] text-white shadow-2xs'
                    : 'opacity-70 hover:opacity-100'
                  }`}
              >
                Reflexión
              </button>
              <button
                onClick={() => setActiveSubTab('prayer')}
                className={`px-3 py-1 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ${activeSubTab === 'prayer'
                    ? 'bg-[#0B2B68] text-white shadow-2xs'
                    : 'opacity-70 hover:opacity-100'
                  }`}
              >
                Oración
              </button>
            </div>

            {/* Quick change verse action button */}
            <button
              type="button"
              onClick={() => handleRandomizeVerse()}
              disabled={isRefreshing}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#0B2B68] hover:bg-[#082255] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
              title="Revelar otro versículo"
              aria-label="Cambiar versículo"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#FED65B] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Nuevo</span>
            </button>
          </div>
        </div>

        {/* Main Content Body */}
        <div className="relative z-10 my-3 sm:my-5">
          {activeSubTab === 'verse' && (
            <div className="space-y-4">
              <blockquote className="font-serif italic text-lg sm:text-2xl sm:leading-relaxed text-inherit">
                "{currentDailyVerse.text}"
              </blockquote>
              <div className="flex items-center gap-2">
                <span className="font-sans font-bold text-sm sm:text-base text-[#F47B20]">
                  — {currentDailyVerse.reference}
                </span>
                <span className="text-xs opacity-60 font-sans">(Reina-Valera 1909)</span>
              </div>
            </div>
          )}

          {activeSubTab === 'reflection' && (
            <div className="space-y-3">
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#F47B20] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Reflexión Pastoral
              </h3>
              <p className="font-serif text-sm sm:text-base leading-relaxed opacity-90">
                {currentDailyVerse.reflection}
              </p>
              <div className="pt-2 text-xs font-sans font-bold text-[#0B2B68] dark:text-[#FED65B]">
                Medita en esta palabra durante tu jornada de hoy.
              </div>
            </div>
          )}

          {activeSubTab === 'prayer' && (
            <div className="space-y-3">
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#F47B20] flex items-center gap-1.5">
                <Heart className="w-4 h-4" />
                Oración del Día
              </h3>
              <p className="font-serif italic text-sm sm:text-base leading-relaxed opacity-90 bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-inherit/20">
                "{currentDailyVerse.prayer}"
              </p>
            </div>
          )}
        </div>

        {/* Hero Actions Toolbar */}
        <div className="relative z-10 pt-4 mt-4 border-t border-inherit/20 flex flex-wrap items-center justify-between gap-2.5">
          {/* Primary Action: Continuar leyendo */}
          <button
            type="button"
            onClick={() =>
              onNavigateScripture(
                currentDailyVerse.bookId || 'JHN',
                currentDailyVerse.chapter,
                currentDailyVerse.verse
              )
            }
            className="p-2 sm:px-4 sm:py-2.5 rounded-2xl bg-[#F47B20] hover:bg-[#EA580C] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-95"
            title="Continuar leyendo este versículo en su contexto bíblico completo"
            aria-label="Continuar leyendo"
          >
            <BookOpen className="w-4 h-4" />
            <span>Continuar leyendo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Secondary Quick Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Audio Speech */}
            <button
              type="button"
              onClick={handleToggleAudio}
              className={`p-2 sm:px-3 sm:py-2 rounded-2xl border transition-all flex items-center gap-1.5 cursor-pointer text-xs font-bold ${isPlayingAudio
                  ? 'bg-[#0B2B68] text-[#F47B20] border-[#F47B20] animate-pulse'
                  : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border-inherit/30 text-inherit'
                }`}
              title={isPlayingAudio ? 'Detener lectura de voz' : 'Escuchar versículo en voz alta'}
              aria-label="Audio del versículo"
            >
              {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span className="hidden md:inline">{isPlayingAudio ? 'Pausar' : 'Audio'}</span>
            </button>

            {/* Save Bookmark - Institutional Colors */}
            <button
              type="button"
              onClick={() =>
                onOpenSaveModal(
                  currentDailyVerse.text,
                  currentDailyVerse.reference,
                  currentDailyVerse.bookId,
                  currentDailyVerse.chapter,
                  currentDailyVerse.verse
                )
              }
              className="p-2 sm:p-2.5 rounded-2xl bg-[#0B2B68] hover:bg-[#071F4D] text-[#FED65B] border border-[#FED65B]/30 text-xs font-bold transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
              title="Guardar versículo en tus notas"
              aria-label="Guardar versículo"
            >
              <Bookmark className="w-4 h-4 text-[#FED65B]" />
            </button>

            {/* AI Mentor */}
            <button
              type="button"
              onClick={() =>
                onAskAIMentor({
                  bookId: currentDailyVerse.bookId || 'JHN',
                  bookName: currentDailyVerse.book,
                  chapter: currentDailyVerse.chapter,
                  verse: currentDailyVerse.verse,
                  text: currentDailyVerse.text
                })
              }
              className="p-2 sm:p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-inherit/30 text-inherit text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
              title="Consultar análisis teológico con Mentor IA"
              aria-label="Mentor IA"
            >
              <Sparkles className="w-4 h-4 text-[#F47B20]" />
            </button>

            {/* Share - Icon Only */}
            <button
              type="button"
              onClick={() =>
                onShareVerse({
                  title: `Versículo del Día: ${currentDailyVerse.reference}`,
                  text: currentDailyVerse.text,
                  reference: currentDailyVerse.reference,
                  reflection: currentDailyVerse.reflection
                })
              }
              className="p-2 sm:p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-inherit/30 text-inherit text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
              title="Compartir versículo"
              aria-label="Compartir versículo"
            >
              <Share2 className="w-4 h-4 text-[#F47B20]" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
