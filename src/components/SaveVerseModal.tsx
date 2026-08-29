import React, { useState, useEffect } from 'react';
import { Bookmark, X, Sparkles, Check } from 'lucide-react';
import { HighlightColor, LocalBookmark } from '../types';

interface SaveVerseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookmarkData: {
    customTitle: string;
    personalNote: string;
    colorHex: HighlightColor;
    translation?: string;
  }) => void;
  verseText: string;
  verseReference: string;
  initialBookmark?: LocalBookmark | null;
  currentTheme?: 'light' | 'sepia' | 'dark';
  translation?: string;
}

export const SaveVerseModal: React.FC<SaveVerseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  verseText,
  verseReference,
  initialBookmark,
  currentTheme = 'light',
  translation = 'RVR1960'
}) => {
  const [customTitle, setCustomTitle] = useState('');
  const [personalNote, setPersonalNote] = useState('');
  const [selectedColor, setSelectedColor] = useState<HighlightColor>('#FFF2B2');
  const [titleError, setTitleError] = useState(false);

  const isDark = currentTheme === 'dark';
  const isSepia = currentTheme === 'sepia';

  const modalBg = isDark
    ? 'bg-[#141824] text-[#F1F3F9] border-[#252D43]'
    : isSepia
    ? 'bg-[#FAF6EF] text-[#2D2319] border-[#705335]/25'
    : 'bg-[#FBF9F4] text-[#1B1C19] border-[#C6C5D4]';

  const headerBg = isDark
    ? 'bg-[#1A2033] border-[#252D43]'
    : isSepia
    ? 'bg-[#EFE7D8] border-[#705335]/20'
    : 'bg-[#F5F3EE] border-[#E4E2DD]';

  const previewCardBg = isDark
    ? 'bg-[#1C2337] border-[#2B3964] text-[#F1F3F9]'
    : isSepia
    ? 'bg-[#FAF6EF] border-[#705335]/20 text-[#2D2319]'
    : 'bg-[#FFFFFF] border-[#C6C5D4] text-[#1B1C19]';

  const inputBg = isDark
    ? 'bg-[#1A2033] border-[#2B3964] text-[#F1F3F9] placeholder:text-[#64748B] focus:border-[#F25C05]'
    : isSepia
    ? 'bg-[#FAF6EF] border-[#705335]/30 text-[#2D2319] placeholder:text-[#8C7A6B] focus:border-[#F25C05]'
    : 'bg-[#FFFFFF] border-[#C6C5D4] text-[#1B1C19] placeholder:text-[#9E9EA7] focus:border-[#FED65B]';

  const chipBg = isDark
    ? 'bg-[#1C2337] hover:bg-[#252D43] text-white border-[#2B3964]'
    : isSepia
    ? 'bg-[#EFE7D8] hover:bg-[#EAE0D0] text-[#3B2D1F] border-[#705335]/20'
    : 'bg-[#FFFFFF] hover:bg-[#FED65B]/40 text-[#000666] border-[#C6C5D4]';

  const labelColor = isDark
    ? 'text-[#9AA5C2]'
    : isSepia
    ? 'text-[#705335]'
    : 'text-[#454652]';

  const suggestedTitles = [
    'Promesa de Dios',
    'Palabra de Aliento',
    'Oración y Fe',
    'Sabiduría Eterna',
    'Paz y Esperanza'
  ];

  useEffect(() => {
    if (isOpen) {
      if (initialBookmark) {
        setCustomTitle(initialBookmark.custom_title || '');
        setPersonalNote(initialBookmark.personal_note || '');
        setSelectedColor(initialBookmark.color_hex || '#FFF2B2');
      } else {
        setCustomTitle('');
        setPersonalNote('');
        setSelectedColor('#FFF2B2');
      }
      setTitleError(false);
    }
  }, [isOpen, initialBookmark]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) {
      setTitleError(true);
      return;
    }

    onSave({
      customTitle: customTitle.trim(),
      personalNote: personalNote.trim(),
      colorHex: selectedColor
    });
    onClose();
  };

  const getBorderColorStyle = (color: HighlightColor) => {
    return { backgroundColor: color };
  };

  return (
    <div
      id="save-verse-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal Container */}
      <div
        id="save-verse-modal-container"
        className={`relative w-full max-w-[500px] ${modalBg} rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-in zoom-in-95 duration-200`}
      >
        {/* Modal Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${headerBg}`}>
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-[#F25C05] fill-current" />
            <h2 className={`font-serif italic font-bold text-xl sm:text-2xl tracking-tight ${
              isDark ? 'text-white' : isSepia ? 'text-[#3B2D1F]' : 'text-[#000666]'
            }`}>
              Guardar en tu Santuario
            </h2>
          </div>
          <button
            id="close-save-verse-modal-btn"
            onClick={onClose}
            aria-label="Cerrar"
            className={`transition-colors p-2 rounded-full cursor-pointer ${
              isDark
                ? 'text-[#9AA5C2] hover:text-white hover:bg-white/10'
                : isSepia
                ? 'text-[#705335] hover:text-[#3B2D1F] hover:bg-[#EFE7D8]'
                : 'text-[#767683] hover:text-[#000666] hover:bg-[#EAE8E3]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit}>
          <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Verse Preview Card */}
            <div className={`p-4 rounded-xl border relative shadow-2xs ${previewCardBg}`}>
              {/* Dynamic Left Highlight Bar */}
              <div
                className="absolute top-0 left-0 w-2 h-full rounded-l-xl transition-colors duration-200"
                style={getBorderColorStyle(selectedColor)}
              />
              <p className="font-serif italic text-[15px] sm:text-[16px] leading-relaxed pl-2.5">
                "{verseText}"
              </p>
              <p className={`text-right mt-2 text-xs font-bold tracking-wide ${
                isDark ? 'text-[#93C5FD]' : isSepia ? 'text-[#8C5E32]' : 'text-[#000666]'
              }`}>
                {verseReference} — {translation}
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 pt-1">
              {/* Suggested Titles Chips */}
              <div>
                <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wider ${labelColor}`}>
                  Sugerencias de Título:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedTitles.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        setCustomTitle(st);
                        setTitleError(false);
                      }}
                      className={`text-xs px-2.5 py-1 rounded-full transition-all cursor-pointer font-medium border ${chipBg}`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label
                  htmlFor="reflection-title"
                  className={`block text-xs font-bold mb-1 uppercase tracking-wider ${labelColor}`}
                >
                  Título de tu reflexión <span className="text-[#BA1A1A] font-bold">*</span>
                </label>
                <input
                  id="reflection-title"
                  type="text"
                  value={customTitle}
                  onChange={(e) => {
                    setCustomTitle(e.target.value);
                    if (e.target.value.trim()) setTitleError(false);
                  }}
                  placeholder="Ej. Promesa para mi familia"
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 transition-all ${inputBg} ${
                    titleError ? 'border-[#BA1A1A] ring-2 ring-[#BA1A1A]/30' : ''
                  }`}
                  autoFocus
                />
                {titleError && (
                  <p className="text-[#BA1A1A] text-xs mt-1 font-semibold">Por favor añade un título a tu reflexión.</p>
                )}
              </div>

              {/* Note Input */}
              <div>
                <label
                  htmlFor="personal-note"
                  className={`block text-xs font-bold mb-1 uppercase tracking-wider ${labelColor}`}
                >
                  Reflexión o Nota Personal (opcional)
                </label>
                <textarea
                  id="personal-note"
                  rows={3}
                  value={personalNote}
                  onChange={(e) => setPersonalNote(e.target.value)}
                  placeholder="¿Qué te enseñó Dios a través de este pasaje hoy?..."
                  className={`w-full border rounded-xl p-3.5 text-sm leading-relaxed focus:outline-none focus:ring-2 transition-all resize-none ${inputBg}`}
                />
              </div>

              {/* Color Picker */}
              <div>
                <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${labelColor}`}>
                  Color de Resaltado en Santuario
                </label>
                <div className="flex gap-4 items-center">
                  <button
                    type="button"
                    id="color-btn-yellow"
                    aria-label="Amarillo"
                    onClick={() => setSelectedColor('#FFF2B2')}
                    className={`w-9 h-9 rounded-full bg-[#FFF2B2] border border-[#E9C349] transition-all cursor-pointer flex items-center justify-center ${
                      selectedColor === '#FFF2B2'
                        ? 'ring-3 ring-[#F25C05] ring-offset-2 scale-110 shadow-sm'
                        : 'opacity-80 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    {selectedColor === '#FFF2B2' && <Check className="w-4 h-4 text-[#735C00]" />}
                  </button>

                  <button
                    type="button"
                    id="color-btn-green"
                    aria-label="Verde"
                    onClick={() => setSelectedColor('#D2F5D7')}
                    className={`w-9 h-9 rounded-full bg-[#D2F5D7] border border-[#82D98D] transition-all cursor-pointer flex items-center justify-center ${
                      selectedColor === '#D2F5D7'
                        ? 'ring-3 ring-[#F25C05] ring-offset-2 scale-110 shadow-sm'
                        : 'opacity-80 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    {selectedColor === '#D2F5D7' && <Check className="w-4 h-4 text-[#107C41]" />}
                  </button>

                  <button
                    type="button"
                    id="color-btn-blue"
                    aria-label="Azul"
                    onClick={() => setSelectedColor('#D3E7FF')}
                    className={`w-9 h-9 rounded-full bg-[#D3E7FF] border border-[#8690EE] transition-all cursor-pointer flex items-center justify-center ${
                      selectedColor === '#D3E7FF'
                        ? 'ring-3 ring-[#F25C05] ring-offset-2 scale-110 shadow-sm'
                        : 'opacity-80 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    {selectedColor === '#D3E7FF' && <Check className="w-4 h-4 text-[#000666]" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className={`px-6 py-4 border-t flex justify-end items-center gap-3 ${headerBg}`}>
            <button
              type="button"
              id="cancel-save-modal-btn"
              onClick={onClose}
              className={`px-4 py-2.5 rounded-xl border text-sm font-semibold cursor-pointer transition-colors ${
                isDark
                  ? 'border-[#2B3964] text-[#CBD5E1] hover:bg-white/10 hover:text-white'
                  : isSepia
                  ? 'border-[#705335]/30 text-[#423326] hover:bg-[#EAE0D0] hover:text-[#2D2319]'
                  : 'border-[#C6C5D4] text-[#454652] hover:bg-[#EAE8E3] hover:text-[#000666]'
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="confirm-save-modal-btn"
              className="px-5 py-2.5 rounded-xl bg-[#0B2B68] text-white hover:bg-[#F25C05] transition-all text-sm font-bold flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Bookmark className="w-4 h-4 fill-current text-[#F25C05]" />
              Guardar en Santuario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

