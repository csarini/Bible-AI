import React from 'react';
import {
  Home,
  Calendar,
  BookOpen,
  Library,
  Bookmark,
  Smartphone,
  Sparkles,
  X,
  Compass,
  Sun,
  Moon,
  SunMedium,
  HelpCircle,
  Settings
} from 'lucide-react';
import { ActiveTab } from '../types';
import { ChurchLogo } from './ChurchLogo';

interface NavigationDrawerProps {
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  savedCount: number;
  onOpenCoachMark?: () => void;
  onOpenSettings?: () => void;
  currentTheme?: 'light' | 'sepia' | 'dark';
  onThemeChange?: (theme: 'light' | 'sepia' | 'dark') => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpenMobile,
  onCloseMobile,
  activeTab,
  onSelectTab,
  savedCount,
  onOpenCoachMark,
  onOpenSettings,
  currentTheme = 'light',
  onThemeChange
}) => {
  const isDark = currentTheme === 'dark';
  const isSepia = currentTheme === 'sepia';

  const menuItems = [
    {
      id: 'home' as ActiveTab,
      label: 'Inicio',
      icon: Home,
      badge: 'Hoy'
    },
    {
      id: 'scripture' as ActiveTab,
      label: 'Lectura',
      icon: BookOpen,
      badge: null
    },
    {
      id: 'library' as ActiveTab,
      label: 'Buscar',
      icon: Library,
      badge: null
    },
    {
      id: 'maps' as ActiveTab,
      label: 'Mapas',
      icon: Compass,
      badge: null
    },
    {
      id: 'saved' as ActiveTab,
      label: 'Guardados',
      icon: Bookmark,
      badge: savedCount > 0 ? savedCount : null
    },
    {
      id: 'events' as ActiveTab,
      label: 'Prédicas & Eventos',
      icon: Calendar,
      badge: null
    },
    {
      id: 'ai-mentor' as ActiveTab,
      label: 'Mentor IA',
      icon: Sparkles,
      badge: 'IA'
    }
  ];

  const themeOptions: { id: 'light' | 'sepia' | 'dark'; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'light', label: 'Claro', icon: Sun },
    { id: 'sepia', label: 'Sepia', icon: SunMedium },
    { id: 'dark', label: 'Oscuro', icon: Moon }
  ];

  const handleItemClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  // Color tokens based on current active theme
  const drawerBgClass = isDark
    ? 'bg-[#131722] text-[#F1F3F9] border-[#252D43]'
    : isSepia
      ? 'bg-[#F4EFE6] text-[#2D2319] border-[#705335]/20'
      : 'bg-[#FAF8F5] text-[#1B1C19] border-[#0B2B68]/15';

  const itemHoverClass = isDark
    ? 'hover:bg-[#1C2337] hover:text-[#FFFFFF] text-[#9AA5C2]'
    : isSepia
      ? 'hover:bg-[#EAE0D0] hover:text-[#2D2319] text-[#5C4A3A]'
      : 'hover:bg-[#EAE8E3] hover:text-[#0B2B68] text-[#454652]';

  const itemActiveClass = isDark
    ? 'bg-[#2B3990] text-white font-bold shadow-xs'
    : isSepia
      ? 'bg-[#5C4228] text-[#FDF9F3] font-bold shadow-xs'
      : 'bg-[#0B2B68] text-white font-bold shadow-xs';

  const navContent = (
    <div className={`flex flex-col h-full py-4 px-3 ${drawerBgClass} transition-colors duration-200`}>
      {/* Drawer Header with Church Logo & Minimalist Title */}
      <div className="px-2 mb-4 pb-3 border-b border-inherit/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`p-1 rounded-xl shadow-2xs border ${isDark ? 'bg-[#1C2337] border-[#3B49A8]/40' : isSepia ? 'bg-[#FAF6EF] border-[#705335]/20' : 'bg-white border-[#0B2B68]/10'}`}>
            <ChurchLogo size="sm" variant="symbol" showText={false} showSubtitle={false} theme={isDark ? 'dark' : isSepia ? 'sepia' : 'light'} />
          </div>
          <div>
            <span className={`font-serif italic font-bold text-lg leading-none block ${isDark ? 'text-white' : isSepia ? 'text-[#3B2D1F]' : 'text-[#243372]'}`}>
              El-Shaddai
            </span>
            <span className={`text-[8px] font-sans font-black tracking-widest uppercase block mt-0.5 ${isDark ? 'text-[#FED65B]' : isSepia ? 'text-[#705335]' : 'text-[#1E2A66]'}`}>
              DIOS TODOPODEROSO
            </span>
          </div>
        </div>

        {/* Mobile Close button */}
        <button
          onClick={onCloseMobile}
          className={`md:hidden p-1.5 rounded-full transition-colors ${itemHoverClass}`}
          aria-label="Cerrar menú"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Theme Switcher Segmented Control (Icon-centric) */}
      <div className="px-2 mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-sans font-black uppercase tracking-wider opacity-70">
            Tema
          </span>
          <span className="text-[10px] font-semibold opacity-60">
            {themeOptions.find((t) => t.id === currentTheme)?.label}
          </span>
        </div>

        <div className={`grid grid-cols-3 gap-1 p-1 rounded-2xl border ${isDark ? 'bg-[#0B0F19] border-[#252D43]' : isSepia ? 'bg-[#E8DFC8] border-[#705335]/25' : 'bg-[#EAE8E3] border-[#0B2B68]/15'}`}>
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = currentTheme === opt.id;
            return (
              <button
                key={opt.id}
                id={`theme-btn-${opt.id}`}
                onClick={() => onThemeChange && onThemeChange(opt.id)}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${isSelected
                  ? isDark
                    ? 'bg-[#2B3990] text-white shadow-xs'
                    : isSepia
                      ? 'bg-[#5C4228] text-white shadow-xs'
                      : 'bg-white text-[#0B2B68] shadow-xs'
                  : isDark
                    ? 'text-[#9AA5C2] hover:text-white'
                    : 'text-[#5A5C66] hover:text-[#0B2B68]'
                  }`}
                title={`Cambiar a tema ${opt.label}`}
                aria-label={`Tema ${opt.label}`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? (opt.id === 'light' ? 'text-[#F47B20]' : opt.id === 'sepia' ? 'text-[#FED65B]' : 'text-[#38BDF8]') : ''}`} />
                <span className="text-[11px]">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Nav List - Icon-Centric & Compact */}
      <nav className="flex-1 overflow-y-auto px-1 space-y-1">
        <div className="text-[10px] font-sans font-black uppercase tracking-wider opacity-70 px-2 mb-1">
          Navegación
        </div>
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  id={`drawer-item-${item.id}`}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${isActive ? itemActiveClass : itemHoverClass
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#F47B20]' : 'opacity-80'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${isActive
                        ? 'bg-[#F47B20] text-white'
                        : isDark
                          ? 'bg-[#252D43] text-[#38BDF8]'
                          : 'bg-[#00A3E0]/15 text-[#0B2B68]'
                        }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Minimalist Quick Actions */}
      <div className="mt-3 pt-3 border-t border-inherit/30 px-1 flex items-center justify-between gap-2">
        {onOpenCoachMark && (
          <button
            type="button"
            id="drawer-open-guide-btn"
            onClick={() => {
              onCloseMobile();
              onOpenCoachMark();
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs ${isDark
              ? 'bg-[#1C2337] border-[#252D43] text-[#F1F3F9] hover:bg-[#252D43]'
              : isSepia
                ? 'bg-[#EFE7D8] border-[#705335]/25 text-[#2D2319] hover:bg-[#E8DEC9]'
                : 'bg-white border-[#0B2B68]/15 text-[#0B2B68] hover:bg-[#EAE8E3]'
              }`}
            title="Guía rápida y ayuda"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#F47B20]" />
            <span>Guía</span>
          </button>
        )}

        {onOpenSettings && (
          <button
            type="button"
            id="drawer-open-settings-btn"
            onClick={() => {
              onCloseMobile();
              onOpenSettings();
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs ${isDark
              ? 'bg-[#1C2337] border-[#252D43] text-[#F1F3F9] hover:bg-[#252D43]'
              : isSepia
                ? 'bg-[#EFE7D8] border-[#705335]/25 text-[#2D2319] hover:bg-[#E8DEC9]'
                : 'bg-white border-[#0B2B68]/15 text-[#0B2B68] hover:bg-[#EAE8E3]'
              }`}
            title="Ajustes de texto, tipografía y tema"
          >
            <Settings className="w-3.5 h-3.5 text-[#00A3E0]" />
            <span>Ajustes</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside
        id="desktop-navigation-drawer"
        className={`hidden md:flex flex-col h-[calc(100vh-64px)] w-60 lg:w-64 border-r sticky top-16 z-30 flex-shrink-0 overflow-hidden ${drawerBgClass} shadow-xs`}
      >
        {navContent}
      </aside>

      {/* Mobile Drawer (Overlay Modal) */}
      {isOpenMobile && (
        <div
          id="mobile-drawer-backdrop"
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex animate-in fade-in duration-150"
          onClick={onCloseMobile}
        >
          <div
            className={`w-72 max-w-[85vw] h-full shadow-2xl rounded-r-3xl border-r animate-in slide-in-from-left duration-200 overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};

