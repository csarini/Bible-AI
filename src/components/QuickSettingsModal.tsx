import React from 'react';
import {
  X,
  Type,
  BookOpen,
  Sun,
  Moon,
  Coffee,
  Sliders,
  AlignLeft,
  Check,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { ReadingSettings, BibleBook, OFFICIAL_TRANSLATIONS } from '../types';
import { getLocalBooksSync, getBookByIdOrNumber } from '../services/bibleDatabaseService';

interface QuickSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReadingSettings;
  onUpdateSettings: (newSettings: Partial<ReadingSettings>) => void;
  currentBookId?: string;
  currentChapter?: number;
  onSelectBookAndChapter?: (bookId: string, chapter: number) => void;
  onToast?: (message: string) => void;
}

export const QuickSettingsModal: React.FC<QuickSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  currentBookId = 'MAT',
  currentChapter = 1,
  onSelectBookAndChapter,
  onToast
}) => {
  if (!isOpen) return null;

  const currentBooks = getLocalBooksSync(settings.translation);
  const currentBook = getBookByIdOrNumber(currentBookId, settings.translation);
  const isDark = settings.themeMode === 'dark';
  const isSepia = settings.themeMode === 'sepia';

  const modalBg = isDark
    ? 'bg-[#141824] text-[#F1F3F9] border-[#252D43]'
    : isSepia
    ? 'bg-[#FAF6EF] text-[#2D2319] border-[#705335]/25'
    : 'bg-[#FFFFFF] text-[#1B1C19] border-[#0B2B68]/15';

  const cardBg = isDark
    ? 'bg-[#1C2337] border-[#2B3964]'
    : isSepia
    ? 'bg-[#EFE7D8] border-[#705335]/20'
    : 'bg-[#F8F6F2] border-[#0B2B68]/10';

  const previewFontFamily =
    settings.fontFamily === 'Playfair'
      ? 'font-serif'
      : settings.fontFamily === 'Inter'
      ? 'font-sans'
      : 'font-body-reading';

  const previewFontSize =
    settings.fontSize === 'small'
      ? 'text-[15px] leading-[26px]'
      : settings.fontSize === 'large'
      ? 'text-[20px] leading-[34px]'
      : settings.fontSize === 'extra-large'
      ? 'text-[23px] leading-[38px]'
      : 'text-[17px] leading-[30px]';

  const handleResetDefaults = () => {
    onUpdateSettings({
      fontSize: 'medium',
      fontFamily: 'Literata',
      lineHeight: 'relaxed',
      translation: 'rvr1960',
      themeMode: 'light',
      showVerseNumbers: true
    });
    if (onToast) {
      onToast('Ajustes restablecidos a valores iniciales');
    }
  };

  return (
    <div
      id="quick-settings-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="quick-settings-modal-card"
        onClick={(e) => e.stopPropagation()}
        className={`${modalBg} w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150`}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0B2B68] via-[#103E8A] to-[#082255] text-white flex items-center justify-between border-b border-[#F47B20]/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F47B20] text-white flex items-center justify-center shadow-xs">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif italic font-bold text-lg text-white leading-tight">
                Ajustes de Lectura y Apariencia
              </h3>
              <p className="text-[11px] text-white/80 font-sans">
                Personaliza texto, libro, versión bíblica y modo visual
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ajustes"
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body with Scrollable Settings */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* Quick Book & Chapter Selector (Cambio de Libro / Tipo de Libro) */}
          {onSelectBookAndChapter && (
            <div className={`${cardBg} p-3.5 sm:p-4 rounded-2xl border space-y-2.5`}>
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-sans font-bold uppercase tracking-wider flex items-center gap-1.5 opacity-80">
                  <BookOpen className="w-3.5 h-3.5 text-[#F47B20]" />
                  Seleccionar Libro y Capítulo
                </label>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F47B20]/15 text-[#F47B20]">
                  {currentBook.testament === 'OT' ? 'Antiguo Testamento' : 'Nuevo Testamento'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Book Selector Dropdown */}
                <div>
                  <label className="block text-[10px] opacity-70 mb-1 font-semibold">Libro de la Biblia</label>
                  <select
                    value={currentBookId}
                    onChange={(e) => onSelectBookAndChapter(e.target.value, 1)}
                    className={`w-full py-2 px-2.5 rounded-xl border text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#F47B20] ${
                      isDark
                        ? 'bg-[#131722] border-[#2B3964] text-white'
                        : isSepia
                        ? 'bg-[#FAF6EF] border-[#705335]/30 text-[#2D2319]'
                        : 'bg-white border-[#0B2B68]/20 text-[#0B2B68]'
                    }`}
                  >
                    <optgroup label="Nuevo Testamento">
                      {currentBooks
                        .filter((b) => b.testament === 'NT')
                        .filter((b, idx, arr) => arr.findIndex((x) => x.id === b.id) === idx)
                        .map((b) => (
                          <option key={`modal-nt-${b.id}`} value={b.id}>
                            {b.name} ({b.chaptersCount} caps)
                          </option>
                        ))}
                    </optgroup>
                    <optgroup label="Antiguo Testamento">
                      {currentBooks
                        .filter((b) => b.testament === 'OT')
                        .filter((b, idx, arr) => arr.findIndex((x) => x.id === b.id) === idx)
                        .map((b) => (
                          <option key={`modal-ot-${b.id}`} value={b.id}>
                            {b.name} ({b.chaptersCount} caps)
                          </option>
                        ))}
                    </optgroup>
                  </select>
                </div>

                {/* Chapter Selector Dropdown */}
                <div>
                  <label className="block text-[10px] opacity-70 mb-1 font-semibold">Capítulo</label>
                  <select
                    value={currentChapter}
                    onChange={(e) => onSelectBookAndChapter(currentBookId, parseInt(e.target.value, 10))}
                    className={`w-full py-2 px-2.5 rounded-xl border text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#F47B20] ${
                      isDark
                        ? 'bg-[#131722] border-[#2B3964] text-white'
                        : isSepia
                        ? 'bg-[#FAF6EF] border-[#705335]/30 text-[#2D2319]'
                        : 'bg-white border-[#0B2B68]/20 text-[#0B2B68]'
                    }`}
                  >
                    {Array.from({ length: currentBook.chaptersCount }, (_, i) => i + 1).map((ch) => (
                      <option key={ch} value={ch}>
                        Capítulo {ch}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Translation / Versión Bíblica */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-sans font-bold uppercase tracking-wider flex items-center gap-1.5 opacity-80">
                <Sparkles className="w-3.5 h-3.5 text-[#F47B20]" />
                Versión / Traducción Bíblica (Modo Offline)
              </label>
              <span className="text-[10px] font-semibold text-[#F47B20] bg-[#F47B20]/10 px-2 py-0.5 rounded-full">
                {OFFICIAL_TRANSLATIONS.length} Versión Canónica
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
              {OFFICIAL_TRANSLATIONS.map((tr) => {
                const isSelected = settings.translation === tr.abbreviation ||
                  settings.translation === tr.translation ||
                  (tr.abbreviation === 'valera' && (settings.translation === 'RVR1909' || settings.translation === 'RVR1960')) ||
                  (tr.abbreviation === 'sse' && settings.translation === 'SSE');
                return (
                  <button
                    key={tr.abbreviation}
                    id={`quick-trans-${tr.abbreviation}`}
                    type="button"
                    onClick={() => {
                      onUpdateSettings({ translation: tr.abbreviation });
                      if (onToast) onToast(`Versión: ${tr.name}`);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0B2B68] text-[#FED65B] border-[#F47B20] shadow-sm ring-2 ring-[#F47B20]/40 font-bold'
                        : `${cardBg} hover:border-[#F47B20]/50`
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-bold text-xs">{tr.abbreviation.toUpperCase()}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                        {tr.badge || 'Modo Offline'}
                      </span>
                    </div>
                    <span className="block text-[11px] leading-tight truncate opacity-85">{tr.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Font Size Selector (Tamaño de Texto) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-sans font-bold uppercase tracking-wider flex items-center gap-1.5 opacity-80">
                <Type className="w-3.5 h-3.5 text-[#F47B20]" />
                Tamaño del Texto
              </label>
              <span className="text-[11px] font-mono font-bold text-[#F47B20]">
                {settings.fontSize === 'small'
                  ? 'Pequeño (16px)'
                  : settings.fontSize === 'medium'
                  ? 'Normal (18px)'
                  : settings.fontSize === 'large'
                  ? 'Grande (21px)'
                  : 'Extra Grande (24px)'}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'small', label: 'A-', title: 'Pequeño' },
                { id: 'medium', label: 'A', title: 'Normal' },
                { id: 'large', label: 'A+', title: 'Grande' },
                { id: 'extra-large', label: 'A++', title: 'Muy Grande' }
              ].map((sz) => (
                <button
                  key={sz.id}
                  type="button"
                  onClick={() => onUpdateSettings({ fontSize: sz.id as any })}
                  className={`py-2 px-1 rounded-2xl border text-center font-bold transition-all cursor-pointer ${
                    settings.fontSize === sz.id
                      ? 'bg-[#F47B20] text-white border-[#F47B20] shadow-sm'
                      : `${cardBg} hover:border-[#F47B20]/50`
                  }`}
                >
                  <span className="text-base leading-none block">{sz.label}</span>
                  <span className="text-[9px] block opacity-80 font-normal mt-0.5">{sz.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Typography / Tipo de Letra */}
          <div className="space-y-2">
            <label className="text-[11px] font-sans font-bold uppercase tracking-wider flex items-center gap-1.5 opacity-80">
              <AlignLeft className="w-3.5 h-3.5 text-[#F47B20]" />
              Tipo de Letra (Tipografía)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Literata', name: 'Literata', desc: 'Serifa Bíblica', fontClass: 'font-body-reading' },
                { id: 'Playfair', name: 'Playfair', desc: 'Editorial', fontClass: 'font-serif' },
                { id: 'Inter', name: 'Inter', desc: 'Sans Moderna', fontClass: 'font-sans' }
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onUpdateSettings({ fontFamily: f.id as any })}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    settings.fontFamily === f.id
                      ? 'bg-[#0B2B68] text-white border-[#00A3E0] shadow-sm ring-2 ring-[#00A3E0]/40'
                      : `${cardBg} hover:border-[#00A3E0]/50`
                  }`}
                >
                  <span className={`block text-base font-bold leading-tight ${f.fontClass}`}>Aa</span>
                  <span className="block font-semibold text-xs mt-0.5">{f.name}</span>
                  <span className="block text-[9px] opacity-75">{f.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Visual Theme (Modo Claro / Sepia / Oscuro) */}
          <div className="space-y-2">
            <label className="text-[11px] font-sans font-bold uppercase tracking-wider flex items-center gap-1.5 opacity-80">
              <Sun className="w-3.5 h-3.5 text-[#F47B20]" />
              Tema de Color
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'light', name: 'Claro', icon: Sun, bg: 'bg-[#FAF8F5]', text: 'text-[#1B1C19]' },
                { id: 'sepia', name: 'Sepia', icon: Coffee, bg: 'bg-[#F4EFE6]', text: 'text-[#3E2C1A]' },
                { id: 'dark', name: 'Oscuro', icon: Moon, bg: 'bg-[#131722]', text: 'text-white' }
              ].map((th) => {
                const IconComponent = th.icon;
                const isCurrent = settings.themeMode === th.id;
                return (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => onUpdateSettings({ themeMode: th.id as any })}
                    className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      isCurrent
                        ? 'border-[#F47B20] ring-2 ring-[#F47B20]/40 shadow-sm'
                        : 'border-inherit/20 hover:border-[#F47B20]/40'
                    } ${th.bg} ${th.text}`}
                  >
                    <IconComponent className="w-4 h-4 text-[#F47B20]" />
                    <span className="text-xs font-bold">{th.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Line Spacing / Espaciado */}
          <div className="space-y-2">
            <label className="text-[11px] font-sans font-bold uppercase tracking-wider flex items-center gap-1.5 opacity-80">
              <AlignLeft className="w-3.5 h-3.5 text-[#F47B20]" />
              Espaciado de Línea
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'normal', name: 'Compacto' },
                { id: 'relaxed', name: 'Relajado' },
                { id: 'spacious', name: 'Espacioso' }
              ].map((sp) => (
                <button
                  key={sp.id}
                  type="button"
                  onClick={() => onUpdateSettings({ lineHeight: sp.id as any })}
                  className={`py-2 px-2 rounded-2xl border text-center text-xs font-semibold transition-all cursor-pointer ${
                    settings.lineHeight === sp.id
                      ? 'bg-[#0B2B68] text-white border-[#0B2B68] shadow-xs'
                      : `${cardBg} hover:border-[#0B2B68]/30`
                  }`}
                >
                  {sp.name}
                </button>
              ))}
            </div>
          </div>

          {/* Verse Numbers Toggle */}
          <div className={`${cardBg} p-3 rounded-2xl border flex items-center justify-between`}>
            <div>
              <span className="font-bold text-xs block">Mostrar números de versículo</span>
              <span className="text-[11px] opacity-75 block">Facilita la referencia rápida y el estudio</span>
            </div>
            <input
              type="checkbox"
              checked={settings.showVerseNumbers}
              onChange={(e) => onUpdateSettings({ showVerseNumbers: e.target.checked })}
              className="w-4 h-4 accent-[#F47B20] rounded cursor-pointer"
            />
          </div>

          {/* Live Preview Box */}
          <div className="p-3.5 rounded-2xl border border-[#F47B20]/30 bg-gradient-to-br from-[#F47B20]/5 to-transparent space-y-1">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#F47B20] block">
              Vista previa en tiempo real
            </span>
            <p className={`${previewFontFamily} ${previewFontSize} italic`}>
              {settings.showVerseNumbers && <span className="font-sans font-bold text-xs text-[#F47B20] mr-1.5 not-italic">1</span>}
              {settings.translation === 'NTV'
                ? '"En el principio la Palabra ya existía. La Palabra estaba con Dios, y la Palabra era Dios."'
                : settings.translation === 'NVI'
                ? '"En el principio ya existía el Verbo, y el Verbo estaba con Dios, y el Verbo era Dios."'
                : settings.translation === 'LBLA'
                ? '"En el principio existía el Verbo, y el Verbo estaba con Dios, y el Verbo era Dios."'
                : '"En el principio era el Verbo, y el Verbo era con Dios, y el Verbo era Dios."'}
            </p>
            <span className="text-[10px] opacity-70 block text-right font-sans">
              Juan 1:1 ({settings.translation})
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-inherit/20 flex items-center justify-between gap-3 bg-inherit">
          <button
            type="button"
            id="quick-settings-reset-btn"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 text-xs font-semibold opacity-75 hover:opacity-100 hover:text-[#F47B20] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer</span>
          </button>

          <button
            type="button"
            id="quick-settings-done-btn"
            onClick={onClose}
            className="px-5 py-2 rounded-2xl bg-[#0B2B68] hover:bg-[#082255] text-[#FED65B] text-xs font-bold transition-all cursor-pointer shadow-md flex items-center gap-1.5 active:scale-95"
          >
            <Check className="w-4 h-4 text-[#F47B20]" />
            <span>Listo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
