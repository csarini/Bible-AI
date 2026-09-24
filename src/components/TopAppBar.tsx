import React from 'react';
import { Menu, BookOpen, SlidersHorizontal, Shield } from 'lucide-react';
import { ActiveTab } from '../types';
import { ChurchLogo } from './ChurchLogo';

interface TopAppBarProps {
  onToggleDrawer: () => void;
  activeTab: ActiveTab;
  onNavigateTab: (tab: ActiveTab) => void;
  savedCount?: number;
  currentBookName?: string;
  currentChapter?: number;
  currentTheme?: 'light' | 'sepia' | 'dark';
  onOpenSettings?: () => void;
  isSettingsOpen?: boolean;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  onToggleDrawer,
  activeTab,
  onNavigateTab,
  savedCount = 0,
  currentBookName = 'Mateo',
  currentChapter = 4,
  currentTheme = 'light',
  onOpenSettings,
  isSettingsOpen = false
}) => {
  const isDark = currentTheme === 'dark';
  const isSepia = currentTheme === 'sepia';

  const headerBgClass = isDark
    ? 'bg-[#131722]/95 border-[#252D43] text-[#F1F3F9]'
    : isSepia
    ? 'bg-[#F4EFE6]/95 border-[#705335]/20 text-[#2D2319]'
    : 'bg-[#FAF8F5]/95 border-[#0B2B68]/15 text-[#1B1C19]';

  const iconBtnHover = isDark
    ? 'text-[#F1F3F9] hover:bg-[#1C2337]'
    : isSepia
    ? 'text-[#2D2319] hover:bg-[#EAE0D0]'
    : 'text-[#0B2B68] hover:bg-[#EAE8E3]';

  return (
    <header
      id="topAppBar"
      className={`${headerBgClass} backdrop-blur-md w-full top-0 sticky border-b flex items-center justify-between px-3 sm:px-6 md:px-8 h-16 z-40 transition-colors duration-200 shadow-[0_1px_4px_rgba(0,0,0,0.05)]`}
    >
      {/* Left Menu & Clean Church Emblem (without text) */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          id="toggle-drawer-btn"
          onClick={onToggleDrawer}
          aria-label="Abrir menú de navegación"
          className={`${iconBtnHover} transition-all duration-150 p-2 sm:p-2.5 rounded-full cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#F25C05]/60`}
          title="Menú principal"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Clean Logo Mark (No text, takes to Home) */}
        <button
          id="toolbar-logo-btn"
          type="button"
          onClick={() => onNavigateTab('home')}
          className="flex items-center cursor-pointer select-none transition-transform hover:scale-105 focus:outline-hidden"
          title="Ir al Inicio - El-Shaddai"
          aria-label="Ir a la pantalla de Inicio"
        >
          <div className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center p-1 rounded-xl shadow-xs border transition-colors ${
            isDark
              ? 'bg-[#1C2337] border-[#3B49A8]/40 hover:border-[#F47B20]'
              : isSepia
              ? 'bg-[#FAF6EF] border-[#705335]/20 hover:border-[#F47B20]'
              : 'bg-white border-[#0B2B68]/15 hover:border-[#F47B20]'
          }`}>
            <ChurchLogo
              size="sm"
              variant="symbol"
              showText={false}
              showSubtitle={false}
              theme={isDark ? 'dark' : isSepia ? 'sepia' : 'light'}
            />
          </div>
        </button>

        {/* Quick Context Scripture Pill (when reading) */}
        {activeTab === 'scripture' && (
          <button
            onClick={() => {
              if (onOpenSettings) {
                onOpenSettings();
              } else {
                onNavigateTab('library');
              }
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
              isDark
                ? 'bg-[#1C2337] hover:bg-[#252D43] border-[#252D43] text-white'
                : isSepia
                ? 'bg-[#EAE0D0] hover:bg-[#DFCDB9] border-[#705335]/25 text-[#3E2C1A]'
                : 'bg-[#EAE8E3] hover:bg-[#F25C05]/15 border-[#0B2B68]/20 text-[#0B2B68]'
            }`}
            title="Cambiar libro, capítulo o ajustes"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#F25C05]" />
            <span>{currentBookName} {currentChapter}</span>
          </button>
        )}
      </div>

      {/* Right Action Icons: Settings/Preferences */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Quick Admin Hub shortcut */}
        <button
          onClick={() => onNavigateTab('admin-hub')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
            activeTab === 'admin-hub' || activeTab.startsWith('admin-')
              ? 'bg-[#002147] text-white shadow-xs border-[#D4AF37]'
              : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Panel de Administración Eclesiástica & Membresías (MVP 2)"
        >
          <Shield className="w-3.5 h-3.5 text-[#F47B20]" />
          <span className="hidden sm:inline">Admin Hub</span>
        </button>

        {/* Configuration / Reading Settings Icon Button */}
        {onOpenSettings && (
          <button
            id="top-settings-btn"
            onClick={onOpenSettings}
            aria-label="Ajustes de lectura y tipografía"
            className={`p-2 sm:px-3 sm:py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
              isSettingsOpen
                ? 'bg-[#F47B20] text-white shadow-xs'
                : iconBtnHover
            }`}
            title="Ajustes de texto, tipografía, libro y tema"
          >
            <SlidersHorizontal className="w-5 h-5 sm:w-4 sm:h-4 text-[#F47B20]" />
            <span className="hidden sm:inline text-xs font-semibold">Ajustes</span>
          </button>
        )}
      </div>

      {/* Decorative Church Color Accent Line: Orange -> Cyan -> Navy */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#F25C05] via-[#00A3E0] to-[#0B2B68] pointer-events-none" />
    </header>
  );
};


