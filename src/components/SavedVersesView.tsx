import React, { useState } from 'react';
import { Search, Edit3, Trash2, Share2, BookOpen, Filter, Bookmark, Plus } from 'lucide-react';
import { LocalBookmark, HighlightColor } from '../types';
import { ShareService, ShareContent } from '../services/shareService';

interface SavedVersesViewProps {
  bookmarks: LocalBookmark[];
  onSelectVerse: (bookId: string, chapter: number, verse: number) => void;
  onEditBookmark: (bookmark: LocalBookmark) => void;
  onDeleteBookmark: (id: string) => void;
  onNavigateToScripture: () => void;
  onToast: (msg: string) => void;
  onShareVerse?: (content: ShareContent) => void;
  currentTheme?: 'light' | 'sepia' | 'dark';
}

export const SavedVersesView: React.FC<SavedVersesViewProps> = ({
  bookmarks,
  onSelectVerse,
  onEditBookmark,
  onDeleteBookmark,
  onNavigateToScripture,
  onToast,
  onShareVerse,
  currentTheme = 'light'
}) => {
  const isDark = currentTheme === 'dark';
  const isSepia = currentTheme === 'sepia';

  const headerTitleColor = isDark ? 'text-white' : isSepia ? 'text-[#3B2D1F]' : 'text-[#0B2B68]';
  const subtextColor = isDark ? 'text-white/60' : isSepia ? 'text-[#705335]' : 'text-[#454652]';
  const cardBg = isDark
    ? 'bg-[#131722] border-white/10 text-white hover:border-[#FED65B] hover:bg-[#181E2E]'
    : isSepia
    ? 'bg-[#FAF6EF] border-[#705335]/20 text-[#3B2D1F] hover:border-[#705335] hover:bg-[#FFFFFF]'
    : 'bg-[#FFFFFF] border-[#C6C5D4]/70 text-[#1B1C19] hover:border-[#FED65B]';
  const inputBg = isDark
    ? 'bg-[#131722] border-white/20 text-white placeholder:text-white/40 focus:border-[#FED65B] focus:ring-1 focus:ring-[#FED65B]'
    : isSepia
    ? 'bg-[#FAF6EF] border-[#705335]/30 text-[#3B2D1F] placeholder:text-[#705335]/60 focus:border-[#705335] focus:ring-1 focus:ring-[#705335]'
    : 'bg-[#FFFFFF] border-[#C6C5D4] text-[#1B1C19] placeholder:text-[#9E9EA7] focus:border-[#FED65B] focus:ring-1 focus:ring-[#FED65B]';
  const filterBtnInactive = isDark
    ? 'border border-white/20 text-white/70 hover:bg-[#1C2337]'
    : isSepia
    ? 'border border-[#705335]/30 text-[#3B2D1F] hover:bg-[#EAE0D0]'
    : 'border border-[#C6C5D4] text-[#454652] hover:bg-[#EAE8E3]';
  const actionBtnHover = isDark
    ? 'text-white/60 hover:text-white hover:bg-white/10'
    : isSepia
    ? 'text-[#705335] hover:text-[#3B2D1F] hover:bg-[#EAE0D0]'
    : 'text-[#767683] hover:text-[#0B2B68] hover:bg-[#F0EEE9]';
  const badgeRefBg = isDark
    ? 'bg-white/10 text-white border border-white/15'
    : isSepia
    ? 'bg-[#EAE0D0] text-[#3B2D1F] border border-[#705335]/20'
    : 'bg-[#E0E0FF] text-[#0B2B68]';
  const badgeTagBg = isDark
    ? 'bg-white/5 text-white/70'
    : isSepia
    ? 'bg-[#EAE0D0]/60 text-[#5C452D]'
    : 'bg-[#F0EEE9] text-[#454652]';
  const emptyStateBg = isDark
    ? 'bg-[#131722]/60 border-white/10'
    : isSepia
    ? 'bg-[#FAF6EF]/70 border-[#705335]/20'
    : 'bg-[#FFFFFF]/60 border-[#E4E2DD]';
  const emptyIconCircle = isDark
    ? 'bg-[#1C2337] text-[#FED65B]'
    : isSepia
    ? 'bg-[#EAE0D0] text-[#705335]'
    : 'bg-[#F0EEE9] text-[#0B2B68]';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColorFilter, setSelectedColorFilter] = useState<string>('ALL');
  const [selectedTranslationFilter, setSelectedTranslationFilter] = useState<string>('ALL');

  const filteredBookmarks = bookmarks.filter((bm) => {
    const matchesSearch =
      searchQuery === '' ||
      bm.custom_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bm.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bm.book_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bm.personal_note && bm.personal_note.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (bm.tags && bm.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      (bm.translation && bm.translation.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesColor =
      selectedColorFilter === 'ALL' || bm.color_hex === selectedColorFilter;

    const matchesTranslation =
      selectedTranslationFilter === 'ALL' ||
      (bm.translation || 'RVR1960').toUpperCase() === selectedTranslationFilter.toUpperCase();

    return matchesSearch && matchesColor && matchesTranslation;
  });

  const handleShare = async (bm: LocalBookmark, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData: ShareContent = {
      title: bm.custom_title,
      text: bm.text,
      reference: `${bm.book_name} ${bm.chapter}:${bm.verse}`,
      reflection: bm.personal_note
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

  const getColorClass = (hex: HighlightColor) => {
    switch (hex) {
      case '#FFF2B2':
        return 'bg-[#FFF2B2]';
      case '#D2F5D7':
        return 'bg-[#D2F5D7]';
      case '#D3E7FF':
        return 'bg-[#D3E7FF]';
      default:
        return 'bg-[#FFF2B2]';
    }
  };

  return (
    <div id="saved-verses-view" className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
      {/* View Header */}
      <header className="text-center md:text-left">
        <h2 className={`font-display-scripture text-2xl sm:text-3xl md:text-4xl mb-1 ${headerTitleColor}`}>
          Mis Versículos Guardados
        </h2>
        <p className={`font-body-ui text-sm sm:text-base ${subtextColor}`}>
          Tu colección personal de sabiduría y reflexión.
        </p>
      </header>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#767683]" />
          <input
            id="search-saved-verses-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar versículos, notas o temas..."
            className={`w-full pl-10 pr-4 py-2.5 rounded-full text-[14px] sm:text-[15px] font-body-ui shadow-xs transition-all outline-none border ${inputBg}`}
          />
        </div>

        {/* Color / Filter Badges */}
        <div className="flex flex-wrap items-center gap-1.5 pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedColorFilter('ALL')}
            className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-label-caps uppercase transition-all cursor-pointer ${
              selectedColorFilter === 'ALL'
                ? isDark
                  ? 'bg-[#1C2337] text-white ring-1 ring-[#FED65B] font-bold shadow-xs'
                  : isSepia
                  ? 'bg-[#705335] text-white font-bold shadow-xs'
                  : 'bg-[#0B2B68] text-white font-bold shadow-xs'
                : filterBtnInactive
            }`}
          >
            Todos ({bookmarks.length})
          </button>
          <button
            onClick={() => setSelectedColorFilter('#FFF2B2')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-label-caps transition-all cursor-pointer ${
              selectedColorFilter === '#FFF2B2'
                ? 'ring-2 ring-[#FED65B] bg-[#FFF2B2] font-bold text-[#1B1C19]'
                : 'bg-[#FFF2B2]/60 hover:bg-[#FFF2B2] text-[#574500]'
            }`}
            title="Filtrar por Amarillo"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#E9C349]" />
            <span className="hidden sm:inline">Amarillo</span>
          </button>
          <button
            onClick={() => setSelectedColorFilter('#D2F5D7')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-label-caps transition-all cursor-pointer ${
              selectedColorFilter === '#D2F5D7'
                ? 'ring-2 ring-[#82D98D] bg-[#D2F5D7] font-bold text-[#1B1C19]'
                : 'bg-[#D2F5D7]/60 hover:bg-[#D2F5D7] text-[#1B1C19]'
            }`}
            title="Filtrar por Verde"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#82D98D]" />
            <span className="hidden sm:inline">Verde</span>
          </button>
          <button
            onClick={() => setSelectedColorFilter('#D3E7FF')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-label-caps transition-all cursor-pointer ${
              selectedColorFilter === '#D3E7FF'
                ? 'ring-2 ring-[#8690EE] bg-[#D3E7FF] font-bold text-[#1B1C19]'
                : 'bg-[#D3E7FF]/60 hover:bg-[#D3E7FF] text-[#080F5A]'
            }`}
            title="Filtrar por Azul"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#8690EE]" />
            <span className="hidden sm:inline">Azul</span>
          </button>
        </div>
      </div>

      {/* Translation Quick Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className={`text-[11px] font-semibold uppercase tracking-wider mr-1 ${subtextColor}`}>
          Versión:
        </span>
        {['ALL', 'RVR1960', 'RVR1909', 'NVI', 'NTV', 'LBLA'].map((tr) => (
          <button
            key={tr}
            onClick={() => setSelectedTranslationFilter(tr)}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              selectedTranslationFilter === tr
                ? 'bg-[#0B2B68] text-[#FED65B] shadow-2xs ring-1 ring-[#F47B20]/60'
                : isDark
                ? 'bg-white/10 text-white/70 hover:bg-white/15'
                : isSepia
                ? 'bg-[#EAE0D0] text-[#5C452D] hover:bg-[#DFCDB8]'
                : 'bg-[#F0EEE9] text-[#454652] hover:bg-[#EAE8E3]'
            }`}
          >
            {tr === 'ALL' ? 'Todas' : tr}
          </button>
        ))}
      </div>

      {/* Verses List */}
      {filteredBookmarks.length > 0 ? (
        <div className="flex flex-col gap-4 sm:gap-5">
          {filteredBookmarks.map((bm) => (
            <article
              key={bm.id}
              id={`saved-verse-card-${bm.id}`}
              onClick={() => onSelectVerse(bm.book_id, bm.chapter, bm.verse)}
              className={`border rounded-xl overflow-hidden relative group hover:shadow-md transition-all duration-200 cursor-pointer ${cardBg}`}
            >
              {/* Highlight Strip on Left */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-1.5 sm:w-2 ${getColorClass(bm.color_hex)}`}
              />

              <div className="p-4 sm:p-6 pl-6 sm:pl-8 flex flex-col gap-3">
                {/* Header with Custom Title & Actions */}
                <div className="flex justify-between items-start gap-4">
                  <h3 className={`font-bold text-base sm:text-lg font-body-ui tracking-tight ${headerTitleColor}`}>
                    {bm.custom_title}
                  </h3>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      aria-label="Compartir"
                      onClick={(e) => handleShare(bm, e)}
                      className={`p-1.5 rounded-md transition-colors ${actionBtnHover}`}
                      title="Compartir versículo"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Editar"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditBookmark(bm);
                      }}
                      className={`p-1.5 rounded-md transition-colors ${actionBtnHover}`}
                      title="Editar reflexión"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Eliminar"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`¿Deseas eliminar "${bm.custom_title}" de tus versículos guardados?`)) {
                          onDeleteBookmark(bm.id);
                          onToast('Versículo eliminado');
                        }
                      }}
                      className="text-[#767683] hover:text-[#BA1A1A] hover:bg-[#FFDAD6]/50 p-1.5 rounded-md transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Verse Scripture Text */}
                <blockquote className={`font-body-reading text-[15px] sm:text-[17px] leading-relaxed italic pr-2 ${
                  isDark ? 'text-white/90' : isSepia ? 'text-[#3B2D1F]' : 'text-[#1B1C19]'
                }`}>
                  "{bm.text}"
                </blockquote>

                {/* Reference tag & Personal Note */}
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-1 pt-2 border-t ${
                  isDark ? 'border-white/10' : isSepia ? 'border-[#705335]/15' : 'border-[#F0EEE9]'
                }`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`font-label-caps text-[11px] px-2.5 py-1 rounded font-semibold tracking-wide flex items-center gap-1 ${badgeRefBg}`}>
                      <BookOpen className="w-3 h-3 inline" />
                      {bm.book_name} {bm.chapter}:{bm.verse} — {bm.translation || 'RVR1960'}
                    </span>
                    {bm.tags && bm.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`text-[11px] font-label-caps px-2 py-0.5 rounded ${badgeTagBg}`}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {bm.personal_note && (
                    <p className={`font-body-ui text-[13px] italic flex items-center gap-1.5 ${subtextColor}`}>
                      <span className={`material-symbols-outlined text-[16px] not-italic ${isDark ? 'text-[#FED65B]' : isSepia ? 'text-[#705335]' : 'text-[#0B2B68]'}`}>edit_note</span>
                      <span className="line-clamp-2">{bm.personal_note}</span>
                    </p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div id="saved-verses-empty-state" className={`flex flex-col items-center justify-center py-16 text-center gap-5 rounded-2xl p-8 border ${emptyStateBg}`}>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-inner ${emptyIconCircle}`}>
            <Bookmark className="w-10 h-10" />
          </div>
          <div className="max-w-md">
            <h3 className={`font-display-scripture text-2xl mb-2 ${headerTitleColor}`}>
              {searchQuery ? 'No se encontraron resultados' : 'Tu Santuario está vacío'}
            </h3>
            <p className={`font-body-ui text-sm leading-relaxed mb-6 ${subtextColor}`}>
              {searchQuery
                ? 'Prueba con otros términos de búsqueda o cambia los filtros de color.'
                : 'Guarda los versículos que resuenen contigo durante tu estudio para construir una colección personal de sabiduría y reflexión.'}
            </p>
            <button
              onClick={onNavigateToScripture}
              className="bg-[#0B2B68] text-[#FED65B] font-label-caps text-xs sm:text-sm px-7 py-3 rounded-full hover:bg-[#0B2B68]/90 transition-colors shadow-md flex items-center gap-2 mx-auto cursor-pointer font-bold"
            >
              <BookOpen className="w-4 h-4" />
              Explorar la Palabra
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
