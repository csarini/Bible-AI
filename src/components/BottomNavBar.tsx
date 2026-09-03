import React from 'react';
import { Home, BookOpen, Library, Sparkles, Bookmark, Compass } from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  savedCount: number;
  currentTheme?: 'light' | 'sepia' | 'dark';
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
  savedCount,
  currentTheme = 'light'
}) => {
  const isDark = currentTheme === 'dark';
  const isSepia = currentTheme === 'sepia';

  const tabs = [
    {
      id: 'home' as ActiveTab,
      label: 'Inicio',
      icon: Home
    },
    {
      id: 'library' as ActiveTab,
      label: 'Libros',
      icon: Library
    },
    {
      id: 'scripture' as ActiveTab,
      label: 'Lectura',
      icon: BookOpen
    },
    {
      id: 'saved' as ActiveTab,
      label: 'Guardados',
      icon: Bookmark,
      badge: savedCount > 0 ? savedCount : null
    },
    {
      id: 'ai-mentor' as ActiveTab,
      label: 'Mentor IA',
      icon: Sparkles
    }
  ];

  const barBgClass = isDark
    ? 'bg-[#131722]/98 border-[#252D43] text-[#F1F3F9]'
    : isSepia
    ? 'bg-[#F4EFE6]/98 border-[#705335]/20 text-[#2D2319]'
    : 'bg-[#FAF8F5]/98 border-[#0B2B68]/15 text-[#1B1C19]';

  const inactiveBtnClass = isDark
    ? 'text-[#9AA5C2] hover:bg-[#1C2337]'
    : isSepia
    ? 'text-[#5C4A3A] hover:bg-[#EAE0D0]'
    : 'text-[#454652] hover:bg-[#EAE8E3]';

  const activeBtnClass = isDark
    ? 'bg-[#2B3990] text-white font-bold shadow-xs'
    : isSepia
    ? 'bg-[#5C4228] text-white font-bold shadow-xs'
    : 'bg-[#0B2B68] text-white font-bold shadow-xs';

  return (
    <nav
      id="bottomNavBar"
      className={`md:hidden fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-2 py-1.5 pb-safe ${barBgClass} backdrop-blur-md border-t shadow-lg transition-colors duration-200`}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            id={`bottom-nav-tab-${tab.id}`}
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1.5 px-3 transition-all cursor-pointer rounded-2xl relative tap-highlight-transparent ${
              isActive ? activeBtnClass : inactiveBtnClass
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-[#F47B20] stroke-[2.4]' : 'opacity-80'}`} />
            <span className="font-body-ui text-[11px] leading-tight tracking-wide">
              {tab.label}
            </span>

            {tab.badge && !isActive && (
              <span className="absolute top-0.5 right-1.5 w-4 h-4 bg-[#F47B20] text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
