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
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-sans font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isSelected
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
                className={`px-3 py-1 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ${
                  activeSubTab === 'verse'
                    ? 'bg-[#0B2B68] text-white shadow-2xs'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                Versículo
              </button>
              <button
                onClick={() => setActiveSubTab('reflection')}
                className={`px-3 py-1 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ${
                  activeSubTab === 'reflection'
                    ? 'bg-[#0B2B68] text-white shadow-2xs'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                Reflexión
              </button>
              <button
                onClick={() => setActiveSubTab('prayer')}
                className={`px-3 py-1 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ${
                  activeSubTab === 'prayer'
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
          {/* Primary Action: Read in Context */}
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
            title="Leer este versículo en su contexto bíblico completo"
            aria-label="Leer en contexto"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Leer en Contexto</span>
            <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
          </button>

          {/* Secondary Quick Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Audio Speech */}
            <button
              type="button"
              onClick={handleToggleAudio}
              className={`p-2 sm:px-3 sm:py-2 rounded-2xl border transition-all flex items-center gap-1.5 cursor-pointer text-xs font-bold ${
                isPlayingAudio
                  ? 'bg-[#0B2B68] text-[#F47B20] border-[#F47B20] animate-pulse'
                  : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border-inherit/30 text-inherit'
              }`}
              title={isPlayingAudio ? 'Detener lectura de voz' : 'Escuchar versículo en voz alta'}
              aria-label="Audio del versículo"
            >
              {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span className="hidden md:inline">{isPlayingAudio ? 'Pausar' : 'Audio'}</span>
            </button>

            {/* Save Bookmark */}
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
              className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-inherit/30 text-inherit text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Guardar versículo en tu santuario"
              aria-label="Guardar versículo"
            >
              <Bookmark className="w-4 h-4 text-[#F47B20]" />
              <span className="hidden md:inline">Guardar</span>
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
              className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-inherit/30 text-inherit text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Consultar análisis teológico con Mentor IA"
              aria-label="Mentor IA"
            >
              <Sparkles className="w-4 h-4 text-[#F47B20]" />
              <span className="hidden md:inline">Mentor IA</span>
            </button>

            {/* Share */}
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
              className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-inherit/30 text-inherit text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Compartir versículo e imagen"
              aria-label="Compartir versículo"
            >
              <Share2 className="w-4 h-4 text-[#F47B20]" />
              <span className="hidden md:inline">Compartir</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Feature Cards Grid (Bento Style) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {/* Card 1: Continue Reading */}
        <div
          onClick={() => onNavigateScripture(lastReadBookId, lastReadChapter)}
          className={`p-4 sm:p-5 rounded-3xl border shadow-xs transition-all hover:shadow-md cursor-pointer group flex flex-col justify-between ${cardBgClass}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#F47B20] block mb-1">
                Continuar Lectura
              </span>
              <h3 className="font-serif font-bold text-lg text-inherit group-hover:text-[#F47B20] transition-colors">
                {lastReadBook.name} {lastReadChapter}
              </h3>
              <p className="text-xs opacity-75 font-sans mt-1">
                {lastReadBook.testament === 'OT' ? 'Antiguo Testamento' : 'Nuevo Testamento'} • {lastReadBook.category}
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-[#0B2B68] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
              <BookOpen className="w-5 h-5 text-[#FED65B]" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-inherit/20 flex items-center justify-between text-xs font-bold text-[#F47B20]">
            <span>Reanudar ahora</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Interactive Biblical Maps */}
        <div
          onClick={() => onNavigateTab('maps')}
          className={`p-4 sm:p-5 rounded-3xl border shadow-xs transition-all hover:shadow-md cursor-pointer group flex flex-col justify-between ${cardBgClass}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#00A3E0] block mb-1">
                Geografía Sagrada
              </span>
              <h3 className="font-serif font-bold text-lg text-inherit group-hover:text-[#00A3E0] transition-colors">
                Mapas Bíblicos
              </h3>
              <p className="text-xs opacity-75 font-sans mt-1">
                Rutas de Jesús, Éxodo y viajes de Pablo con arqueología y sincronización.
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-[#00A3E0]/20 text-[#00A3E0] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-[#00A3E0]/40">
              <Compass className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-inherit/20 flex items-center justify-between text-xs font-bold text-[#00A3E0]">
            <span>Explorar itinerarios</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: AI Theological Mentor */}
        <div
          onClick={() => onNavigateTab('ai-mentor')}
          className={`p-4 sm:p-5 rounded-3xl border shadow-xs transition-all hover:shadow-md cursor-pointer group flex flex-col justify-between ${cardBgClass}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#F47B20]">
                  Exégesis & Contexto
                </span>
                <span className="text-[9px] font-sans font-bold uppercase tracking-wider bg-[#F47B20]/15 text-[#F47B20] px-2 py-0.5 rounded-full">
                  Modo Prueba (2/día)
                </span>
              </div>
              <h3 className="font-serif font-bold text-lg text-inherit group-hover:text-[#F47B20] transition-colors">
                Mentor Teológico IA
              </h3>
              <p className="text-xs opacity-75 font-sans mt-1">
                Respuestas bíblicas, contexto histórico, griego y hebreo bíblico.
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-[#0B2B68] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
              <Sparkles className="w-5 h-5 text-[#F47B20]" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-inherit/20 flex items-center justify-between text-xs font-bold text-[#F47B20]">
            <span>Consultar al mentor (2/día)</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 4: Search & 66 Books Library */}
        <div
          onClick={() => onNavigateTab('library')}
          className={`p-4 sm:p-5 rounded-3xl border shadow-xs transition-all hover:shadow-md cursor-pointer group flex flex-col justify-between ${cardBgClass}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#F47B20] block mb-1">
                Biblioteca Canónica
              </span>
              <h3 className="font-serif font-bold text-lg text-inherit group-hover:text-[#F47B20] transition-colors">
                Buscar en la Biblia
              </h3>
              <p className="text-xs opacity-75 font-sans mt-1">
                66 libros del Antiguo y Nuevo Testamento con búsqueda instantánea.
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-black/5 dark:bg-white/5 text-inherit flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-inherit/30">
              <Search className="w-5 h-5 text-[#F47B20]" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-inherit/20 flex items-center justify-between text-xs font-bold text-[#F47B20]">
            <span>Abrir biblioteca</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 5: Saved Verses Sanctuary */}
        <div
          onClick={() => onNavigateTab('saved')}
          className={`p-4 sm:p-5 rounded-3xl border shadow-xs transition-all hover:shadow-md cursor-pointer group flex flex-col justify-between ${cardBgClass}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#FED65B] block mb-1">
                Mis Favoritos
              </span>
              <h3 className="font-serif font-bold text-lg text-inherit group-hover:text-[#F47B20] transition-colors">
                Versículos Guardados
              </h3>
              <p className="text-xs opacity-75 font-sans mt-1">
                {bookmarksCount} {bookmarksCount === 1 ? 'versículo destacado' : 'versículos destacados'} con tus notas personales.
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-[#0B2B68] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
              <Bookmark className="w-5 h-5 text-[#FED65B]" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-inherit/20 flex items-center justify-between text-xs font-bold text-[#F47B20]">
            <span>Ver santuario</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 6: Prédicas, Devocionales y Eventos */}
        <div
          onClick={() => onNavigateTab('events')}
          className={`p-4 sm:p-5 rounded-3xl border shadow-xs transition-all hover:shadow-md cursor-pointer group flex flex-col justify-between ${cardBgClass}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#0B2B68] dark:text-[#FED65B] block mb-1">
                Bitácora Espiritual
              </span>
              <h3 className="font-serif font-bold text-lg text-inherit group-hover:text-[#0B2B68] dark:group-hover:text-[#FED65B] transition-colors">
                Prédicas & Eventos
              </h3>
              <p className="text-xs opacity-75 font-sans mt-1">
                Apuntes de sermones dominicales, reuniones de matrimonios y estudios con citas bíblicas.
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-[#0B2B68] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
              <Calendar className="w-5 h-5 text-[#FED65B]" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-inherit/20 flex items-center justify-between text-xs font-bold text-[#0B2B68] dark:text-[#FED65B]">
            <span>Abrir bitácora</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 7: Devotional & Mobile Widgets */}
        <div
          onClick={() => onNavigateTab('widgets')}
          className={`p-4 sm:p-5 rounded-3xl border shadow-xs transition-all hover:shadow-md cursor-pointer group flex flex-col justify-between ${cardBgClass}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#F47B20] block mb-1">
                Devocional Diario
              </span>
              <h3 className="font-serif font-bold text-lg text-inherit group-hover:text-[#F47B20] transition-colors">
                Widgets Móviles
              </h3>
              <p className="text-xs opacity-75 font-sans mt-1">
                Instala y visualiza el widget con versículo diario en tu pantalla bloqueada.
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-black/5 dark:bg-white/5 text-inherit flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-inherit/30">
              <Sun className="w-5 h-5 text-[#F47B20]" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-inherit/20 flex items-center justify-between text-xs font-bold text-[#F47B20]">
            <span>Ver widgets</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </section>
    </div>
  );
};
