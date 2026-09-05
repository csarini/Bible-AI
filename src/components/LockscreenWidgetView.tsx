import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Sparkles,
  Copy,
  Share2,
  Check,
  RefreshCw,
  Sun,
  Bookmark,
  ArrowRight,
  ShieldCheck,
  Shuffle,
  LayoutGrid,
  Maximize2,
  Layers,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import { getRandomDailyVerse, getRandomDailyVerseSync } from '../data/bibleData';
import { DailyVerse } from '../types';
import { ShareService, ShareContent } from '../services/shareService';

interface LockscreenWidgetViewProps {
  onNavigateToScripture: (bookId: string, chapter: number, verse: number) => void;
  onOpenSaveModal: (text: string, reference: string) => void;
  onToast: (message: string) => void;
  onShareVerse?: (content: ShareContent) => void;
  currentTheme?: 'light' | 'sepia' | 'dark';
}

export const LockscreenWidgetView: React.FC<LockscreenWidgetViewProps> = ({
  onNavigateToScripture,
  onOpenSaveModal,
  onToast,
  onShareVerse,
  currentTheme = 'light'
}) => {
  const isDark = currentTheme === 'dark';
  const isSepia = currentTheme === 'sepia';

  const headerTitleColor = isDark ? 'text-white' : isSepia ? 'text-[#3B2D1F]' : 'text-[#0B2B68]';
  const subtextColor = isDark ? 'text-white/60' : isSepia ? 'text-[#705335]' : 'text-[#454652]';
  const cardBg = isDark
    ? 'bg-[#131722] border-white/10 text-white'
    : isSepia
    ? 'bg-[#FAF6EF] border-[#705335]/20 text-[#3B2D1F]'
    : 'bg-white border-[#0B2B68]/15 text-[#1B1C19]';
  const innerBoxBg = isDark
    ? 'bg-[#1C2337] border-white/15 text-white/90'
    : isSepia
    ? 'bg-[#FAF0E2] border-[#705335]/20 text-[#3B2D1F]'
    : 'bg-[#FAF8F5] border-[#0B2B68]/15 text-[#454652]';
  const quoteBg = isDark
    ? 'bg-[#1C2337] text-white/90 border-[#FED65B]'
    : isSepia
    ? 'bg-[#FAF0E2] text-[#3B2D1F] border-[#F25C05]'
    : 'bg-[#FAF8F5] text-[#1B1C19] border-[#F25C05]';

  const [currentDailyVerse, setCurrentDailyVerse] = useState<DailyVerse>(() => getRandomDailyVerseSync());
  const [widgetPlatform, setWidgetPlatform] = useState<'ios' | 'android'>('ios');
  const [troubleshootTab, setTroubleshootTab] = useState<'pwa' | 'android' | 'ios'>('pwa');
  const [selectedWidgetSize, setSelectedWidgetSize] = useState<'all' | 'small' | 'medium'>('all');
  const [widgetVisualTheme, setWidgetVisualTheme] = useState<'navy' | 'parchment' | 'glass'>('navy');
  const [copied, setCopied] = useState(false);
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);

  const getWidgetThemeStyles = (themeVariant: 'navy' | 'parchment' | 'glass') => {
    switch (themeVariant) {
      case 'parchment':
        return {
          container: 'bg-gradient-to-br from-[#FAF8F5] via-[#F4F1EA] to-[#EAE6DE] text-[#1B1C19] border-2 border-[#0B2B68]/20 shadow-md',
          titleColor: 'text-[#0B2B68]',
          badgeBg: 'bg-[#0B2B68]/10 text-[#0B2B68] border border-[#0B2B68]/20',
          accentColor: 'text-[#F25C05]',
          buttonBg: 'bg-[#0B2B68] text-white hover:bg-[#F25C05]',
          borderDivider: 'border-[#0B2B68]/15',
          subtext: 'text-[#5C5C66]'
        };
      case 'glass':
        return {
          container: 'bg-black/65 backdrop-blur-xl text-white border-2 border-white/20 shadow-2xl',
          titleColor: 'text-[#FED65B]',
          badgeBg: 'bg-white/15 text-white border border-white/20',
          accentColor: 'text-[#FED65B]',
          buttonBg: 'bg-white/20 hover:bg-[#F25C05] text-white border border-white/30',
          borderDivider: 'border-white/15',
          subtext: 'text-neutral-300'
        };
      case 'navy':
      default:
        return {
          container: 'bg-gradient-to-br from-[#0B2B68] via-[#092252] to-[#04122E] text-white border-2 border-[#FED65B]/30 shadow-xl',
          titleColor: 'text-white',
          badgeBg: 'bg-white/10 text-white border border-white/15',
          accentColor: 'text-[#FED65B]',
          buttonBg: 'bg-[#F25C05] hover:bg-[#ff6f1e] text-white',
          borderDivider: 'border-white/10',
          subtext: 'text-neutral-200/90'
        };
    }
  };

  const handleFetchRandomVerse = async () => {
    setIsLoadingRandom(true);
    try {
      const nextVerse = await getRandomDailyVerse('valera', undefined, currentDailyVerse?.id);
      setCurrentDailyVerse(nextVerse);
      onToast('Nuevo versículo revelado');
    } catch {
      const fallback = getRandomDailyVerseSync(undefined, currentDailyVerse?.id);
      setCurrentDailyVerse(fallback);
      onToast('Nuevo versículo revelado');
    } finally {
      setIsLoadingRandom(false);
    }
  };

  const handleCopy = async () => {
    const text = `"${currentDailyVerse.text}"\n— ${currentDailyVerse.reference} (RVR1909)\n\n🕊️ Versículo del Día • Iglesia El-Shaddai`;
    const success = await ShareService.copyToClipboard(text);
    if (success) {
      setCopied(true);
      onToast('Versículo del día copiado');
      setTimeout(() => setCopied(false), 2000);
    } else {
      onToast('Versículo listo para compartir');
    }
  };

  const handleShare = async () => {
    const shareData: ShareContent = {
      title: `Versículo del Día: ${currentDailyVerse.reference}`,
      text: currentDailyVerse.text,
      reference: currentDailyVerse.reference,
      reflection: currentDailyVerse.reflection
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

  return (
    <div id="lockscreen-widgets-view" className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-8">
      {/* Header */}
      <header className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 ${
        isDark ? 'border-white/10' : isSepia ? 'border-[#705335]/20' : 'border-[#0B2B68]/15'
      }`}>
        <div>
          <h2 className={`font-serif italic font-bold text-2xl sm:text-3xl flex items-center gap-2 ${headerTitleColor}`}>
            <Smartphone className="w-6 h-6 text-[#F25C05]" />
            Icono Móvil & Pantalla de Inicio
          </h2>
          <p className={`font-body-ui text-sm ${subtextColor}`}>
            Visualización del icono de la app en la pantalla del celular y widgets de versículo diario.
          </p>
        </div>

        {/* Platform Selector Tabs */}
        <div className={`flex p-1 rounded-xl w-fit ${
          isDark ? 'bg-[#131722] border border-white/10' : isSepia ? 'bg-[#FAF0E2] border border-[#705335]/20' : 'bg-[#EAE8E3]'
        }`}>
          <button
            onClick={() => setWidgetPlatform('ios')}
            className={`px-4 py-1.5 rounded-lg text-xs font-sans font-bold uppercase transition-all cursor-pointer ${
              widgetPlatform === 'ios'
                ? 'bg-[#0B2B68] text-white shadow-xs'
                : isDark ? 'text-white/60 hover:text-white' : isSepia ? 'text-[#705335] hover:text-[#3B2D1F]' : 'text-[#454652] hover:text-[#0B2B68]'
            }`}
          >
            Pantalla iPhone
          </button>
          <button
            onClick={() => setWidgetPlatform('android')}
            className={`px-4 py-1.5 rounded-lg text-xs font-sans font-bold uppercase transition-all cursor-pointer ${
              widgetPlatform === 'android'
                ? 'bg-[#0B2B68] text-white shadow-xs'
                : isDark ? 'text-white/60 hover:text-white' : isSepia ? 'text-[#705335] hover:text-[#3B2D1F]' : 'text-[#454652] hover:text-[#0B2B68]'
            }`}
          >
            Pantalla Android
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* SECCIÓN: PREVISUALIZACIÓN DE WIDGETS POR TAMAÑO (PEQUEÑO / MEDIANO)      */}
      {/* ========================================================================= */}
      <section
        id="widget-size-preview-section"
        className={`rounded-3xl p-5 sm:p-7 border shadow-xs transition-all flex flex-col gap-6 ${cardBg}`}
      >
        {/* Top Control Bar of the Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5 border-current/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-[#0B2B68] text-white">
                <LayoutGrid className="w-4 h-4 text-[#FED65B]" />
              </span>
              <h3 className={`font-serif italic font-bold text-xl sm:text-2xl ${headerTitleColor}`}>
                Previsualización de Tamaños de Widget
              </h3>
            </div>
            <p className={`font-body-ui text-xs sm:text-sm ${subtextColor} max-w-2xl`}>
              Compara cómo se adaptará el versículo diario antes de colocarlo en tu pantalla de inicio. Toca cualquier widget para probar la interacción y abrirlo directamente en el lector bíblico.
            </p>
          </div>

          {/* Size and Style Selectors */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Size Filter Pills */}
            <div className={`flex p-1 rounded-xl ${
              isDark ? 'bg-[#1C2337] border border-white/10' : isSepia ? 'bg-[#FAF0E2] border border-[#705335]/20' : 'bg-[#FAF8F5] border border-[#0B2B68]/15'
            }`}>
              <button
                type="button"
                onClick={() => setSelectedWidgetSize('all')}
                className={`px-3 py-1 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ${
                  selectedWidgetSize === 'all'
                    ? 'bg-[#0B2B68] text-white shadow-xs'
                    : isDark ? 'text-white/70 hover:text-white' : isSepia ? 'text-[#705335] hover:text-[#3B2D1F]' : 'text-[#454652] hover:text-[#0B2B68]'
                }`}
              >
                Ambos Tamaños
              </button>
              <button
                type="button"
                onClick={() => setSelectedWidgetSize('small')}
                className={`px-3 py-1 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  selectedWidgetSize === 'small'
                    ? 'bg-[#0B2B68] text-white shadow-xs'
                    : isDark ? 'text-white/70 hover:text-white' : isSepia ? 'text-[#705335] hover:text-[#3B2D1F]' : 'text-[#454652] hover:text-[#0B2B68]'
                }`}
              >
                <LayoutGrid className="w-3 h-3 text-[#F25C05]" />
                Pequeño (2×2)
              </button>
              <button
                type="button"
                onClick={() => setSelectedWidgetSize('medium')}
                className={`px-3 py-1 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  selectedWidgetSize === 'medium'
                    ? 'bg-[#0B2B68] text-white shadow-xs'
                    : isDark ? 'text-white/70 hover:text-white' : isSepia ? 'text-[#705335] hover:text-[#3B2D1F]' : 'text-[#454652] hover:text-[#0B2B68]'
                }`}
              >
                <Maximize2 className="w-3 h-3 text-[#00A3E0]" />
                Mediano (4×2)
              </button>
            </div>

            {/* Visual Style Theme Buttons */}
            <div className={`flex items-center gap-1 p-1 rounded-xl ${
              isDark ? 'bg-[#1C2337] border border-white/10' : isSepia ? 'bg-[#FAF0E2] border border-[#705335]/20' : 'bg-[#FAF8F5] border border-[#0B2B68]/15'
            }`}>
              <button
                type="button"
                onClick={() => setWidgetVisualTheme('navy')}
                className={`px-2.5 py-1 rounded-lg text-xs font-sans font-medium transition-all cursor-pointer ${
                  widgetVisualTheme === 'navy'
                    ? 'bg-[#0B2B68] text-[#FED65B] font-bold shadow-xs'
                    : isDark ? 'text-white/70 hover:text-white' : 'text-[#454652] hover:text-[#0B2B68]'
                }`}
                title="Estilo Azul Institucional Santuario"
              >
                Santuario
              </button>
              <button
                type="button"
                onClick={() => setWidgetVisualTheme('parchment')}
                className={`px-2.5 py-1 rounded-lg text-xs font-sans font-medium transition-all cursor-pointer ${
                  widgetVisualTheme === 'parchment'
                    ? 'bg-white text-[#0B2B68] font-bold shadow-xs border border-[#0B2B68]/20'
                    : isDark ? 'text-white/70 hover:text-white' : 'text-[#454652] hover:text-[#0B2B68]'
                }`}
                title="Estilo Pergamino Claro"
              >
                Pergamino
              </button>
              <button
                type="button"
                onClick={() => setWidgetVisualTheme('glass')}
                className={`px-2.5 py-1 rounded-lg text-xs font-sans font-medium transition-all cursor-pointer ${
                  widgetVisualTheme === 'glass'
                    ? 'bg-neutral-800 text-white font-bold shadow-xs'
                    : isDark ? 'text-white/70 hover:text-white' : 'text-[#454652] hover:text-[#0B2B68]'
                }`}
                title="Estilo Vidrio Esmerilado Oscuro"
              >
                Vidrio
              </button>
            </div>

            {/* Randomize Verse Button */}
            <button
              type="button"
              onClick={handleFetchRandomVerse}
              disabled={isLoadingRandom}
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1 text-xs font-sans font-semibold ${
                isDark
                  ? 'border-white/15 hover:bg-white/10 text-white'
                  : isSepia
                  ? 'border-[#705335]/20 hover:bg-[#FAF0E2] text-[#3B2D1F]'
                  : 'border-[#0B2B68]/20 hover:bg-[#FAF8F5] text-[#0B2B68]'
              }`}
              title="Cambiar versículo de muestra"
            >
              <Shuffle className={`w-3.5 h-3.5 text-[#F25C05] ${isLoadingRandom ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Cambiar versículo</span>
            </button>
          </div>
        </div>

        {/* Dynamic Display Area of Widgets */}
        <div className="flex flex-col lg:flex-row items-stretch justify-center gap-6 pt-2">
          {/* ------------------------------------------------------------- */}
          {/* WIDGET PEQUEÑO (2x2)                                         */}
          {/* ------------------------------------------------------------- */}
          {(selectedWidgetSize === 'all' || selectedWidgetSize === 'small') && (
            <div className={`flex flex-col items-center gap-3.5 transition-all ${
              selectedWidgetSize === 'small' ? 'w-full max-w-md mx-auto' : 'w-full lg:w-[320px]'
            }`}>
              <div className="w-full flex items-center justify-between px-1">
                <span className="text-xs font-bold font-sans flex items-center gap-1.5 text-[#F25C05]">
                  <LayoutGrid className="w-4 h-4 text-[#F25C05]" />
                  Tamaño Pequeño (2×2)
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                  isDark ? 'bg-white/5 border-white/10 text-white/60' : 'bg-black/5 border-black/10 text-[#454652]'
                }`}>
                  160 × 160 dp
                </span>
              </div>

              {/* Realistic Widget Render Button */}
              <button
                type="button"
                onClick={() => {
                  onNavigateToScripture(currentDailyVerse.bookId || 'PHP', currentDailyVerse.chapter, currentDailyVerse.verse);
                  onToast(`Abriendo ${currentDailyVerse.reference} en el Lector...`);
                }}
                className={`w-[195px] h-[195px] rounded-[30px] p-4 flex flex-col justify-between text-left transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer relative overflow-hidden group select-none ${getWidgetThemeStyles(widgetVisualTheme).container}`}
                title="Toca para interactuar y abrir en el Lector Bíblico"
              >
                {/* Subtle sheen highlight */}
                <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full blur-xl pointer-events-none -mr-8 -mt-8" />

                {/* Card Top */}
                <div className="flex items-center justify-between relative z-10 w-full">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-white/30 bg-[#0B2B68] flex items-center justify-center shadow-xs">
                      <img
                        src="/icon.svg"
                        alt="Icono"
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-[10px] font-bold tracking-wider uppercase line-clamp-1 opacity-90 font-sans">
                      El-Shaddai
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-md ${getWidgetThemeStyles(widgetVisualTheme).badgeBg}`}>
                    {currentDailyVerse.reference}
                  </span>
                </div>

                {/* Card Center (Scripture Quote) */}
                <div className="my-auto relative z-10 py-1">
                  <p className="font-body-reading text-[12px] leading-snug line-clamp-4 italic">
                    "{currentDailyVerse.text}"
                  </p>
                </div>

                {/* Card Bottom */}
                <div className={`flex items-center justify-between text-[10px] font-bold relative z-10 pt-1.5 border-t ${getWidgetThemeStyles(widgetVisualTheme).borderDivider}`}>
                  <span className={`truncate max-w-[105px] font-sans ${getWidgetThemeStyles(widgetVisualTheme).accentColor}`}>
                    {currentDailyVerse.theme}
                  </span>
                  <span className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-[9.5px] font-sans font-bold">
                    <span>Leer</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </button>

              {/* Explanatory Details */}
              <div className={`w-full p-3.5 rounded-2xl border text-xs space-y-2 ${innerBoxBg}`}>
                <div className="flex items-center gap-1.5 font-bold text-neutral-800 dark:text-neutral-200">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>Formato Cuadrado Compacto</span>
                </div>
                <p className={`text-[11px] leading-relaxed ${subtextColor}`}>
                  Ocupa 1 espacio (1×1 en iOS / 2×2 en Android). Ideal para ubicarse en la esquina de la pantalla junto a tus aplicaciones más usadas o dentro de una <strong>Pila Inteligente (Smart Stack)</strong> de widgets.
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-current/10 text-[10.5px]">
                  <span className="opacity-70">Incluye: Cita clave + Tema</span>
                  <span className="font-bold text-[#F25C05]">Táctil &rarr; Lector</span>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* WIDGET MEDIANO (4x2)                                         */}
          {/* ------------------------------------------------------------- */}
          {(selectedWidgetSize === 'all' || selectedWidgetSize === 'medium') && (
            <div className={`flex flex-col items-center gap-3.5 transition-all ${
              selectedWidgetSize === 'medium' ? 'w-full max-w-xl mx-auto' : 'w-full lg:flex-1'
            }`}>
              <div className="w-full flex items-center justify-between px-1">
                <span className="text-xs font-bold font-sans flex items-center gap-1.5 text-[#00A3E0]">
                  <Maximize2 className="w-4 h-4 text-[#00A3E0]" />
                  Tamaño Mediano (4×2)
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                  isDark ? 'bg-white/5 border-white/10 text-white/60' : 'bg-black/5 border-black/10 text-[#454652]'
                }`}>
                  340 × 160 dp
                </span>
              </div>

              {/* Realistic Widget Render Button */}
              <button
                type="button"
                onClick={() => {
                  onNavigateToScripture(currentDailyVerse.bookId || 'PHP', currentDailyVerse.chapter, currentDailyVerse.verse);
                  onToast(`Abriendo ${currentDailyVerse.reference} en el Lector...`);
                }}
                className={`w-full max-w-[480px] h-[195px] rounded-[30px] p-4 sm:p-5 flex flex-col justify-between text-left transition-all duration-300 transform hover:scale-[1.02] active:scale-98 cursor-pointer relative overflow-hidden group select-none ${getWidgetThemeStyles(widgetVisualTheme).container}`}
                title="Toca para interactuar y abrir en el Lector Bíblico"
              >
                {/* Subtle sheen highlight */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none -mr-12 -mt-12" />

                {/* Card Top */}
                <div className="flex items-center justify-between relative z-10 w-full gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-white/30 bg-[#0B2B68] flex items-center justify-center p-0.5 shadow-xs">
                      <img
                        src="/icon.svg"
                        alt="Icono"
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold block leading-tight font-sans">
                        Biblia El-Shaddai
                      </span>
                      <span className="text-[9px] uppercase font-bold tracking-widest text-[#F25C05] block font-sans">
                        Versículo del Día
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10.5px] font-bold font-mono px-2 py-0.5 rounded-lg ${getWidgetThemeStyles(widgetVisualTheme).badgeBg}`}>
                      {currentDailyVerse.reference}
                    </span>
                    <span className="text-[9.5px] uppercase tracking-wider font-semibold opacity-60 hidden sm:inline font-sans">
                      RVR1909
                    </span>
                  </div>
                </div>

                {/* Card Center (Scripture Quote) */}
                <div className="my-auto relative z-10 py-1">
                  <p className="font-body-reading text-[13px] sm:text-[14px] leading-snug line-clamp-3 italic">
                    "{currentDailyVerse.text}"
                  </p>
                </div>

                {/* Card Bottom */}
                <div className={`flex items-center justify-between text-[11px] font-bold relative z-10 pt-2 border-t ${getWidgetThemeStyles(widgetVisualTheme).borderDivider}`}>
                  <span className={`flex items-center gap-1 text-[11px] font-sans ${getWidgetThemeStyles(widgetVisualTheme).accentColor}`}>
                    <Sparkles className="w-3 h-3" />
                    {currentDailyVerse.theme}
                  </span>

                  <span className={`px-3 py-1 rounded-full text-[10.5px] font-sans font-bold flex items-center gap-1.5 transition-all shadow-xs ${getWidgetThemeStyles(widgetVisualTheme).buttonBg}`}>
                    <span>Continuar leyendo</span>
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </button>

              {/* Explanatory Details */}
              <div className={`w-full max-w-[480px] p-3.5 rounded-2xl border text-xs space-y-2 ${innerBoxBg}`}>
                <div className="flex items-center gap-1.5 font-bold text-neutral-800 dark:text-neutral-200">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>Formato Panorámico Horizontal</span>
                </div>
                <p className={`text-[11px] leading-relaxed ${subtextColor}`}>
                  Ocupa 2 columnas (2×1 en iOS / 4×2 en Android). Perfecto como <strong>banner central en la parte superior</strong> de tu pantalla principal con lectura devocional completa y botón directo para leer todo el capítulo bíblico.
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-current/10 text-[10.5px]">
                  <span className="opacity-70">Incluye: Texto extendido + Traducción + Botón de acción</span>
                  <span className="font-bold text-[#00A3E0]">Lectura Rápida</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main Grid: Widget Preview + Daily Devotional Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Col: Interactive Device Widget Simulation */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <span className="font-sans font-bold text-xs text-[#767683] uppercase tracking-wider mb-3">
            {widgetPlatform === 'ios' ? 'Icono en Pantalla de iPhone' : 'Icono en Pantalla de Android'}
          </span>

          {widgetPlatform === 'ios' ? (
            /* iOS Screen Frame with App Icon */
            <div className="w-full max-w-[320px] h-[540px] bg-gradient-to-b from-[#082255] via-[#0B2B68] to-[#051433] rounded-[42px] p-4 shadow-2xl border-[6px] border-[#1B1C19] relative flex flex-col justify-between overflow-hidden text-white">
              {/* Dynamic Island / Speaker */}
              <div className="w-24 h-5 bg-black rounded-full mx-auto mb-2 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-neutral-800 mr-2" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#0B2B68]/60" />
              </div>

              {/* iOS Top Time */}
              <div className="text-center">
                <span className="text-[12px] font-medium opacity-80 block tracking-wide">
                  Martes, 26 de Agosto
                </span>
                <span className="text-5xl font-light tracking-tight font-sans block mt-0.5">
                  09:41
                </span>
              </div>

              {/* Home Screen Icons Grid */}
              <div className="my-auto py-2">
                <div className="flex items-center justify-center gap-6">
                  {/* El-Shaddai App Icon */}
                  <div className="flex flex-col items-center gap-1.5 animate-in zoom-in-95 duration-200">
                    <div className="w-16 h-16 rounded-[18px] bg-[#0B2B68] p-1.5 shadow-xl border border-white/20 ring-2 ring-[#F25C05]/50 flex items-center justify-center overflow-hidden">
                      <img
                        src="/icon.svg"
                        alt="Icono Biblia El-Shaddai"
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-[11px] font-medium tracking-wide text-white drop-shadow-md">
                      Biblia
                    </span>
                  </div>

                  {/* Sample companion app icon */}
                  <div className="flex flex-col items-center gap-1.5 opacity-60">
                    <div className="w-16 h-16 rounded-[18px] bg-white/10 backdrop-blur-md p-3 shadow-lg border border-white/10 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-[#F25C05]" />
                    </div>
                    <span className="text-[11px] font-medium tracking-wide text-white/80">
                      Mentor IA
                    </span>
                  </div>
                </div>

                {/* iOS Lock Screen Verse Widget */}
                <button
                  type="button"
                  onClick={() => {
                    onNavigateToScripture(currentDailyVerse.bookId, currentDailyVerse.chapter, currentDailyVerse.verse);
                    onToast(`Abriendo ${currentDailyVerse.reference} en el Lector Bíblico...`);
                  }}
                  className="mt-5 mx-1 p-3.5 bg-black/40 hover:bg-black/55 backdrop-blur-md rounded-2xl border border-white/20 hover:border-[#FED65B] text-left shadow-lg cursor-pointer transition-all transform hover:scale-[1.02] active:scale-[0.98] group relative w-full block"
                  title="Toca para continuar leyendo en el Lector Bíblico"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#F25C05] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#F25C05]" />
                      Santuario Digital
                    </span>
                    <span className="text-[10px] opacity-70 font-mono">
                      {currentDailyVerse.reference}
                    </span>
                  </div>
                  <p className="font-body-reading text-[12px] leading-snug line-clamp-2 italic opacity-95 text-neutral-100">
                    "{currentDailyVerse.text}"
                  </p>
                  <div className="mt-2 flex items-center justify-end gap-1 text-[10px] font-sans font-bold text-[#FED65B] opacity-90 group-hover:opacity-100">
                    <span>Continuar leyendo</span>
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </button>
              </div>

              {/* iOS Bottom Dock */}
              <div className="bg-white/15 backdrop-blur-md rounded-3xl p-2.5 mx-1 mb-1 flex justify-around items-center">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xs">💬</div>
                <div className="w-10 h-10 rounded-2xl bg-[#0B2B68] p-1 border border-white/20 flex items-center justify-center">
                  <img src="/icon.svg" alt="App" className="w-full h-full" referrerPolicy="no-referrer" />
                </div>
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xs">🎵</div>
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xs">⚙️</div>
              </div>
            </div>
          ) : (
            /* Android Material You Frame with App Icon */
            <div className="w-full max-w-[320px] h-[540px] bg-gradient-to-br from-[#FAF8F5] via-[#EAE8E3] to-[#DCEEFB] rounded-[36px] p-4 shadow-2xl border-[6px] border-[#1B1C19] relative flex flex-col justify-between overflow-hidden text-[#1B1C19]">
              {/* Android Punch Hole */}
              <div className="w-3 h-3 bg-black rounded-full mx-auto mb-1" />

              {/* Android Header clock */}
              <div className="text-center">
                <span className="text-4xl font-bold font-sans text-[#0B2B68]">09:41</span>
                <span className="block text-xs text-[#454652] mt-0.5">26 de Agosto • 24°C</span>
              </div>

              {/* Android Home Screen Icons */}
              <div className="my-auto py-2">
                <div className="flex items-center justify-center gap-6 mb-4">
                  {/* El-Shaddai Android App Icon */}
                  <div className="flex flex-col items-center gap-1.5 animate-in zoom-in-95 duration-200">
                    <div className="w-16 h-16 rounded-full bg-[#0B2B68] p-2 shadow-xl border-2 border-[#F25C05] flex items-center justify-center overflow-hidden">
                      <img
                        src="/icon.svg"
                        alt="Icono Biblia El-Shaddai"
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-[11px] font-bold text-[#0B2B68]">
                      Biblia
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-1.5 opacity-60">
                    <div className="w-16 h-16 rounded-full bg-white p-3 shadow-md border border-[#0B2B68]/15 flex items-center justify-center">
                      <Sparkles className="w-7 h-7 text-[#F25C05]" />
                    </div>
                    <span className="text-[11px] font-medium text-[#454652]">
                      Mentor IA
                    </span>
                  </div>
                </div>

                {/* Android Material Widget */}
                <button
                  type="button"
                  onClick={() => {
                    onNavigateToScripture(currentDailyVerse.bookId, currentDailyVerse.chapter, currentDailyVerse.verse);
                    onToast(`Abriendo ${currentDailyVerse.reference} en el Lector Bíblico...`);
                  }}
                  className="w-full text-left p-3.5 bg-white border-2 border-[#F25C05]/40 hover:border-[#F25C05] rounded-3xl shadow-md hover:shadow-lg relative cursor-pointer transition-all transform hover:scale-[1.02] active:scale-[0.98] group block"
                  title="Toca para continuar leyendo en el Lector Bíblico"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full overflow-hidden">
                        <img src="/icon.svg" alt="Icono" className="w-full h-full" referrerPolicy="no-referrer" />
                      </div>
                      <span className="text-xs font-bold text-[#0B2B68]">Biblia El-Shaddai</span>
                    </div>
                    <span className="text-[10px] bg-[#00A3E0]/15 text-[#0B2B68] font-bold px-2 py-0.5 rounded-full">
                      {currentDailyVerse.reference}
                    </span>
                  </div>

                  <p className="font-body-reading text-[12px] text-[#1B1C19] leading-snug line-clamp-3 italic mb-1.5">
                    "{currentDailyVerse.text}"
                  </p>

                  <div className="flex justify-between items-center text-[10px] text-[#F25C05] font-bold pt-1 border-t border-[#FAF8F5]">
                    <span>{currentDailyVerse.theme}</span>
                    <span className="flex items-center gap-1 text-[#0B2B68] group-hover:text-[#F25C05] transition-colors">
                      <span>Continuar leyendo</span>
                      <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </button>
              </div>

              {/* Android Navigation bar pill */}
              <div className="w-24 h-1 bg-neutral-400 rounded-full mx-auto mb-1" />
            </div>
          )}

          {/* Random verse button */}
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={handleFetchRandomVerse}
              disabled={isLoadingRandom}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-sans font-bold bg-[#0B2B68] hover:bg-[#0B2B68]/90 text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#FED65B] ${isLoadingRandom ? 'animate-spin' : ''}`} />
              <span>Generar versículo aleatorio</span>
            </button>
          </div>
        </div>

        {/* Right Col: Deep Devotional & Sanctuary Insight */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* How to add icon to mobile screen banner */}
          <div className={`border-2 border-[#F25C05]/30 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3 ${cardBg}`}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0B2B68] p-1.5 shadow-md shrink-0 border border-[#F25C05]/40 flex items-center justify-center">
                <img src="/icon.svg" alt="Icono" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <div>
                <h3 className={`font-serif italic font-bold text-lg sm:text-xl ${headerTitleColor}`}>
                  Cómo agregar el icono a tu celular
                </h3>
                <p className={`text-xs font-sans font-semibold ${subtextColor}`}>
                  Acceso directo rápido sin descargas de tiendas
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className={`p-3.5 rounded-2xl border space-y-1 ${innerBoxBg}`}>
                <strong className={`text-xs font-bold block ${headerTitleColor}`}>📱 En iPhone (Safari):</strong>
                <ol className={`text-xs list-decimal list-inside space-y-1 ${subtextColor}`}>
                  <li>Toca el botón <strong>Compartir</strong> (icono con flecha arriba ⎋).</li>
                  <li>Selecciona <strong>"Agregar a Inicio"</strong> (+).</li>
                  <li>Listo: verás el icono oficial en tu pantalla.</li>
                </ol>
              </div>

              <div className={`p-3.5 rounded-2xl border space-y-1 ${innerBoxBg}`}>
                <strong className={`text-xs font-bold block ${headerTitleColor}`}>🤖 En Android (Chrome):</strong>
                <ol className={`text-xs list-decimal list-inside space-y-1 ${subtextColor}`}>
                  <li>Toca el menú de <strong>tres puntos (⋮)</strong> arriba a la derecha.</li>
                  <li>Elige <strong>"Instalar app"</strong> o <strong>"Agregar a pantalla principal"</strong>.</li>
                  <li>Verás el icono de la Biblia listo para usar offline.</li>
                </ol>
              </div>
            </div>

            {/* Troubleshooting Tabs for Lockscreen Widget Detection */}
            <div className={`mt-3 p-3.5 rounded-2xl border ${innerBoxBg} space-y-2.5`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-[#F25C05] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#F25C05]" />
                  ¿Por qué no aparece en la Pantalla de Bloqueo?
                </span>
                <div className="flex gap-1 p-0.5 bg-black/10 dark:bg-white/10 rounded-lg text-[11px] font-sans">
                  <button
                    type="button"
                    onClick={() => setTroubleshootTab('pwa')}
                    className={`px-2 py-0.5 rounded-md font-semibold cursor-pointer transition-all ${
                      troubleshootTab === 'pwa'
                        ? 'bg-[#0B2B68] text-white shadow-xs'
                        : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
                    }`}
                  >
                    Web / PWA
                  </button>
                  <button
                    type="button"
                    onClick={() => setTroubleshootTab('android')}
                    className={`px-2 py-0.5 rounded-md font-semibold cursor-pointer transition-all ${
                      troubleshootTab === 'android'
                        ? 'bg-[#0B2B68] text-white shadow-xs'
                        : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
                    }`}
                  >
                    Android
                  </button>
                  <button
                    type="button"
                    onClick={() => setTroubleshootTab('ios')}
                    className={`px-2 py-0.5 rounded-md font-semibold cursor-pointer transition-all ${
                      troubleshootTab === 'ios'
                        ? 'bg-[#0B2B68] text-white shadow-xs'
                        : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
                    }`}
                  >
                    iPhone (iOS)
                  </button>
                </div>
              </div>

              {troubleshootTab === 'pwa' && (
                <div className="text-xs space-y-1 text-neutral-600 dark:text-neutral-300">
                  <p className="font-semibold text-neutral-800 dark:text-neutral-100">
                    ⚠️ Restricción de Apple y Google para Aplicaciones Web / PWA:
                  </p>
                  <p>
                    Si estás usando la aplicación desde el navegador móvil o la instalaste con <em>"Agregar a Inicio"</em>, <strong>ningún sistema operativo móvil permite a las páginas web añadir widgets a la pantalla de bloqueo ni al menú del sistema</strong>. Solo se permite el icono en la pantalla de inicio.
                  </p>
                  <p className="opacity-80">
                    💡 Para que el widget se integre en el sistema, se debe compilar e instalar la app nativa en Flutter (APK en Android o Xcode en iOS).
                  </p>
                </div>
              )}

              {troubleshootTab === 'android' && (
                <div className="text-xs space-y-1 text-neutral-600 dark:text-neutral-300">
                  <p className="font-semibold text-neutral-800 dark:text-neutral-100">
                    🤖 En teléfonos Android convencionales (Pixel, Motorola, Xiaomi, etc.):
                  </p>
                  <p>
                    Google <strong>eliminó los widgets de terceros en la pantalla de bloqueo</strong> para teléfonos desde Android 5.0. Solo se pueden agregar en la <strong>Pantalla de Inicio</strong> (mantén presionado un espacio libre de tu pantalla de inicio &rarr; <em>Widgets</em> &rarr; <em>Biblia Inteligente</em>).
                  </p>
                  <p className="opacity-80">
                    💡 <strong>En teléfonos Samsung Galaxy:</strong> Puedes habilitar cualquier widget en la pantalla de bloqueo usando la app oficial <em>Samsung Good Lock &rarr; módulo LockStar</em>.
                  </p>
                </div>
              )}

              {troubleshootTab === 'ios' && (
                <div className="text-xs space-y-1 text-neutral-600 dark:text-neutral-300">
                  <p className="font-semibold text-neutral-800 dark:text-neutral-100">
                    📱 En iPhone con iOS 16+ (Compilación Nativa WidgetKit):
                  </p>
                  <ol className="list-decimal list-inside space-y-0.5">
                    <li>En Xcode debe existir el Target <strong>VerseWidgetExtension</strong> con el archivo <code>VerseWidget.swift</code>.</li>
                    <li>Ambos targets deben tener activado <strong>App Groups</strong> con <code>group.com.tuempresa.bibliainteligente</code>.</li>
                    <li><strong>Abre la app principal al menos una vez</strong> en tu iPhone antes de personalizar la pantalla de bloqueo para que iOS indexe el widget.</li>
                  </ol>
                </div>
              )}
            </div>
          </div>

          <div className={`rounded-3xl p-6 sm:p-7 shadow-xs border ${cardBg}`}>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="font-sans text-xs text-[#F25C05] uppercase font-bold tracking-wider flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-[#F25C05]" />
                Devocional Diario
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                isDark ? 'bg-white/10 text-white border border-white/15' : isSepia ? 'bg-[#EAE0D0] text-[#3B2D1F]' : 'bg-[#00A3E0]/15 text-[#0B2B68]'
              }`}>
                {currentDailyVerse.reference} — RVR1909
              </span>
            </div>

            <h3 className={`font-serif italic font-bold text-xl sm:text-2xl mb-3 ${headerTitleColor}`}>
              {currentDailyVerse.theme}
            </h3>

            {/* Scripture Verse Quote */}
            <blockquote className={`border-l-4 p-4 rounded-r-2xl font-body-reading text-base sm:text-lg leading-relaxed italic mb-5 ${quoteBg}`}>
              "{currentDailyVerse.text}"
            </blockquote>

            {/* Reflection Text */}
            <div className="space-y-3 mb-6">
              <h4 className={`font-sans text-xs uppercase tracking-wider font-bold ${subtextColor}`}>
                Reflexión para tu Jornada:
              </h4>
              <p className={`font-body-ui text-[15px] sm:text-base leading-relaxed ${
                isDark ? 'text-white/90' : isSepia ? 'text-[#3B2D1F]' : 'text-[#1B1C19]'
              }`}>
                {currentDailyVerse.reflection}
              </p>
            </div>

            {/* Prayer Box */}
            <div className={`p-4 rounded-2xl border mb-6 ${innerBoxBg}`}>
              <h4 className={`font-sans text-xs uppercase tracking-wider font-bold mb-1.5 flex items-center gap-1 ${headerTitleColor}`}>
                <Sparkles className="w-3.5 h-3.5 text-[#F25C05]" />
                Plegaria del Día:
              </h4>
              <p className={`font-body-reading text-sm sm:text-[15px] italic leading-relaxed ${subtextColor}`}>
                "{currentDailyVerse.prayer}"
              </p>
            </div>

            {/* Action Bar */}
            <div className={`flex flex-wrap items-center justify-between gap-3 pt-4 border-t ${
              isDark ? 'border-white/10' : isSepia ? 'border-[#705335]/15' : 'border-[#0B2B68]/10'
            }`}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenSaveModal(currentDailyVerse.text, currentDailyVerse.reference)}
                  className="px-4 py-2 bg-[#0B2B68] text-white rounded-xl text-xs sm:text-sm font-sans font-bold hover:bg-[#F25C05] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Bookmark className="w-4 h-4 fill-current text-[#F25C05]" />
                  Guardar en Santuario
                </button>

                <button
                  onClick={() => onNavigateToScripture(currentDailyVerse.book === 'Juan' ? 'JHN' : currentDailyVerse.book === 'Filipenses' ? 'PHP' : 'ISA', currentDailyVerse.chapter, currentDailyVerse.verse)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-sans font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                    isDark ? 'bg-white/10 hover:bg-white/15 text-white' : isSepia ? 'bg-[#EAE0D0] hover:bg-[#DFD3C0] text-[#3B2D1F]' : 'bg-[#EAE8E3] hover:bg-[#DEDCD7] text-[#0B2B68]'
                  }`}
                >
                  Leer en Contexto
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopy}
                  className={`p-2 rounded-xl border transition-colors ${
                    isDark ? 'border-white/15 text-white/70 hover:text-white hover:bg-white/10' : isSepia ? 'border-[#705335]/20 text-[#705335] hover:bg-[#EAE0D0]' : 'border-[#0B2B68]/20 text-[#454652] hover:text-[#0B2B68] hover:bg-[#EAE8E3]'
                  }`}
                  title="Copiar versículo"
                >
                  {copied ? <Check className="w-4 h-4 text-[#107C41]" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleShare}
                  className={`p-2 rounded-xl border transition-colors ${
                    isDark ? 'border-white/15 text-white/70 hover:text-white hover:bg-white/10' : isSepia ? 'border-[#705335]/20 text-[#705335] hover:bg-[#EAE0D0]' : 'border-[#0B2B68]/20 text-[#454652] hover:text-[#0B2B68] hover:bg-[#EAE8E3]'
                  }`}
                  title="Compartir devocional"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Clean Architecture & Technical Distinction Box */}
          <div className={`rounded-3xl p-5 sm:p-6 border space-y-4 ${innerBoxBg}`}>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className={`w-5 h-5 shrink-0 ${isDark ? 'text-[#FED65B]' : isSepia ? 'text-[#705335]' : 'text-[#0B2B68]'}`} />
              <h4 className={`font-serif italic font-bold text-base ${headerTitleColor}`}>
                ¿Por qué los widgets del sistema requieren app nativa?
              </h4>
            </div>

            <div className="text-xs space-y-2.5 leading-relaxed">
              <div className={`p-3 rounded-2xl border space-y-1 ${
                isDark ? 'bg-[#131722] border-white/10 text-white/90' : isSepia ? 'bg-[#FAF6EF] border-[#705335]/15 text-[#3B2D1F]' : 'bg-white border-[#0B2B68]/10 text-[#454652]'
              }`}>
                <span className={`font-bold block ${isDark ? 'text-[#FED65B]' : isSepia ? 'text-[#705335]' : 'text-[#0B2B68]'}`}>
                  1. Icono de Aplicación (PWA Web) — ¡Listo y Activo!
                </span>
                <p>
                  Al tocar <em>"Agregar a Pantalla Principal"</em> o <em>"Instalar app"</em> en tu navegador, obtienes el acceso directo con icono oficial, pantalla completa y funcionamiento 100% offline.
                </p>
              </div>

              <div className={`p-3 rounded-2xl border space-y-1 ${
                isDark ? 'bg-[#131722] border-white/10 text-white/90' : isSepia ? 'bg-[#FAF6EF] border-[#705335]/15 text-[#3B2D1F]' : 'bg-white border-[#F25C05]/20 text-[#454652]'
              }`}>
                <span className="font-bold text-[#F25C05] block">
                  2. Menú de Widgets del Sistema (iOS WidgetKit / Android AppWidgetProvider)
                </span>
                <p>
                  Tanto <strong>Apple (iOS)</strong> como <strong>Google (Android)</strong> bloquean la lista de widgets del sistema para aplicaciones web (PWA). Para que aparezca en el menú de widgets (mantener presionada la pantalla &rarr; +), la app debe estar compilada como binario nativo (APK/IPA con Flutter <code className={`font-mono px-1 rounded ${isDark ? 'bg-white/10' : isSepia ? 'bg-[#EAE0D0]' : 'bg-[#EAE8E3]'}`}>home_widget</code> o Kotlin/Swift).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
