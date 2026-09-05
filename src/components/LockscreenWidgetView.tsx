import React, { useState, useEffect } from 'react';
import { Smartphone, Sparkles, Copy, Share2, Check, RefreshCw, Sun, Bookmark, ArrowRight, ShieldCheck, Shuffle } from 'lucide-react';
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
  const [copied, setCopied] = useState(false);
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);

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
