import React, { useState, useRef, useEffect } from 'react';
import {
  Home,
  Calendar,
  BookOpen,
  Library,
  Bookmark,
  Sparkles,
  X,
  Compass,
  Sun,
  Moon,
  SunMedium,
  HelpCircle,
  MessageSquarePlus,
  Shield,
  Tv,
  Users,
  Utensils,
  Bell,
  Building,
  Radio,
  Flame,
  KeyRound,
  CheckCircle,
  ChevronDown,
} from 'lucide-react';
import { ActiveTab } from '../types';
import { AdminSubTab } from '../features/admin/AdminHubLayout';
import { ChurchLogo } from './ChurchLogo';
import { useAuth } from '../features/auth/context/AuthContext';
import { UserRole, ROLE_METADATA } from '../features/auth/types';

interface NavigationDrawerProps {
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  activeTab: ActiveTab;
  adminSubTab?: AdminSubTab;
  onSelectTab: (tab: ActiveTab, subTab?: AdminSubTab) => void;
  savedCount: number;
  onOpenCoachMark?: () => void;
  onOpenFeedback?: () => void;
  onOpenSettings?: () => void;
  currentTheme?: 'light' | 'sepia' | 'dark';
  onThemeChange?: (theme: 'light' | 'sepia' | 'dark') => void;
  onToast?: (message: string) => void;
}

interface NavItem {
  id: ActiveTab;
  subTab?: AdminSubTab;
  label: string;
  icon: React.FC<{ className?: string }>;
  badge?: string | number | null;
  badgeClass?: string;
}

interface NavGroup {
  id: string;
  title: string;
  badge?: string;
  items: NavItem[];
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpenMobile,
  onCloseMobile,
  activeTab,
  adminSubTab = 'sermons',
  onSelectTab,
  savedCount,
  onOpenCoachMark,
  onOpenFeedback,
  onOpenSettings,
  currentTheme = 'light',
  onThemeChange,
  onToast,
}) => {
  const isDark = currentTheme === 'dark';
  const isSepia = currentTheme === 'sepia';

  const { currentRole, switchRole } = useAuth();
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const roleMeta = ROLE_METADATA[currentRole];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        roleDropdownRef.current &&
        !roleDropdownRef.current.contains(event.target as Node)
      ) {
        setIsRoleDropdownOpen(false);
      }
    };
    if (isRoleDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isRoleDropdownOpen]);

  // Grouped Navigation Structure - Nombres claros y concisos que caben completos
  const navGroups: NavGroup[] = [
    {
      id: 'devotional',
      title: 'Palabra & Devocional',
      items: [
        {
          id: 'home',
          label: 'Inicio',
          icon: Home,
        },
        {
          id: 'scripture',
          label: 'Biblia',
          icon: BookOpen,
        },
        {
          id: 'library',
          label: 'Buscar',
          icon: Library,
        },
        {
          id: 'maps',
          label: 'Mapas',
          icon: Compass,
        },
        {
          id: 'saved',
          label: 'Guardados',
          icon: Bookmark,
          badge: savedCount > 0 ? savedCount : null,
          badgeClass: 'bg-[#002147] text-white dark:bg-[#FED65B] dark:text-[#002147]',
        },
        {
          id: 'ai-mentor',
          label: 'Mentor IA',
          icon: Sparkles,
          badge: 'IA',
          badgeClass: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300',
        },
      ],
    },
    {
      id: 'ministry',
      title: 'Cultos & Púlpito',
      items: [
        {
          id: 'admin-sermons',
          subTab: 'sermons',
          label: 'Prédicas',
          icon: BookOpen,
        },
        {
          id: 'admin-events',
          subTab: 'events',
          label: 'Eventos',
          icon: Calendar,
        },
        {
          id: 'pulpit-mode',
          subTab: 'pulpit',
          label: 'Púlpito en Vivo',
          icon: Tv,
          badge: 'En Vivo',
          badgeClass: 'bg-emerald-500 text-white font-black animate-pulse',
        },
      ],
    },
    {
      id: 'governance',
      title: 'Red & Seguridad',
      items: [
        {
          id: 'admin-hierarchy',
          subTab: 'hierarchy',
          label: 'Sedes & Células',
          icon: Building,
        },
        {
          id: 'admin-security',
          subTab: 'security',
          label: 'Seguridad & Roles',
          icon: Shield,
        },
      ],
    },
    {
      id: 'operations',
      title: 'Gestión & Servicios',
      items: [
        {
          id: 'admin-memberships',
          subTab: 'memberships',
          label: 'Membresías',
          icon: Users,
        },
        {
          id: 'admin-food-court',
          subTab: 'food-court',
          label: 'Cafetería & Kiosko',
          icon: Utensils,
        },
        {
          id: 'admin-announcements',
          subTab: 'announcements',
          label: 'Avisos Push',
          icon: Bell,
        },
      ],
    },
  ];

  const themeOptions: {
    id: 'light' | 'sepia' | 'dark';
    label: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    { id: 'light', label: 'Claro', icon: Sun },
    { id: 'sepia', label: 'Sepia', icon: SunMedium },
    { id: 'dark', label: 'Oscuro', icon: Moon },
  ];

  const handleItemClick = (item: NavItem) => {
    onSelectTab(item.id, item.subTab);
    onCloseMobile();
  };

  const isItemActive = (item: NavItem) => {
    if (item.subTab) {
      return (
        (activeTab === 'admin-hub' && adminSubTab === item.subTab) ||
        activeTab === item.id ||
        (item.subTab === 'pulpit' && (activeTab === 'pulpit-mode' || (activeTab === 'admin-hub' && adminSubTab === 'pulpit'))) ||
        (item.subTab === 'events' && (activeTab === 'events' || activeTab === 'admin-events' || (activeTab === 'admin-hub' && adminSubTab === 'events'))) ||
        (item.subTab === 'sermons' && (activeTab === 'admin-sermons' || (activeTab === 'admin-hub' && adminSubTab === 'sermons'))) ||
        (item.subTab === 'hierarchy' && (activeTab === 'admin-hierarchy' || (activeTab === 'admin-hub' && adminSubTab === 'hierarchy'))) ||
        (item.subTab === 'security' && (activeTab === 'admin-security' || (activeTab === 'admin-hub' && adminSubTab === 'security'))) ||
        (item.subTab === 'memberships' && (activeTab === 'admin-memberships' || (activeTab === 'admin-hub' && adminSubTab === 'memberships'))) ||
        (item.subTab === 'food-court' && (activeTab === 'admin-food-court' || (activeTab === 'admin-hub' && adminSubTab === 'food-court'))) ||
        (item.subTab === 'announcements' && (activeTab === 'admin-announcements' || (activeTab === 'admin-hub' && adminSubTab === 'announcements')))
      );
    }
    return activeTab === item.id;
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
    : 'bg-[#002147] text-white font-bold shadow-xs';

  const groupHeaderClass = isDark
    ? 'text-[#8895B3] border-[#252D43]/60'
    : isSepia
    ? 'text-[#705335] border-[#705335]/20'
    : 'text-[#002147]/70 border-slate-200';

  const navContent = (
    <div className={`flex flex-col h-full py-4 px-3 ${drawerBgClass} transition-colors duration-200`}>
      {/* Drawer Header with Church Logo & Title */}
      <div className="px-2 mb-3 pb-3 border-b border-inherit/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-1 rounded-xl shadow-2xs border ${
              isDark
                ? 'bg-[#1C2337] border-[#3B49A8]/40'
                : isSepia
                ? 'bg-[#FAF6EF] border-[#705335]/20'
                : 'bg-white border-[#0B2B68]/10'
            }`}
          >
            <ChurchLogo
              size="sm"
              variant="symbol"
              showText={false}
              showSubtitle={false}
              theme={isDark ? 'dark' : isSepia ? 'sepia' : 'light'}
            />
          </div>
          <div>
            <span
              className={`font-serif italic font-bold text-lg leading-none block ${
                isDark ? 'text-white' : isSepia ? 'text-[#3B2D1F]' : 'text-[#243372]'
              }`}
            >
              El-Shaddai
            </span>
            <span
              className={`text-[8px] font-sans font-black tracking-widest uppercase block mt-0.5 ${
                isDark ? 'text-[#FED65B]' : isSepia ? 'text-[#705335]' : 'text-[#1E2A66]'
              }`}
            >
              DIOS TODOPODEROSO
            </span>
          </div>
        </div>

        {/* Mobile Close button */}
        <button
          onClick={onCloseMobile}
          className={`md:hidden p-1.5 rounded-full transition-colors cursor-pointer ${itemHoverClass}`}
          aria-label="Cerrar menú"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Theme Switcher Segmented Control */}
      <div className="px-2 mb-3">
        <div
          className={`grid grid-cols-3 gap-1 p-1 rounded-2xl border ${
            isDark
              ? 'bg-[#0B0F19] border-[#252D43]'
              : isSepia
              ? 'bg-[#E8DFC8] border-[#705335]/25'
              : 'bg-[#EAE8E3] border-[#0B2B68]/15'
          }`}
        >
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = currentTheme === opt.id;
            return (
              <button
                key={opt.id}
                id={`theme-btn-${opt.id}`}
                onClick={() => onThemeChange && onThemeChange(opt.id)}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
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
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isSelected
                      ? opt.id === 'light'
                        ? 'text-[#F47B20]'
                        : opt.id === 'sepia'
                        ? 'text-[#FED65B]'
                        : 'text-[#38BDF8]'
                      : ''
                  }`}
                />
                <span className="text-[11px]">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Role Switcher Dropdown (Desplegable de Roles Eclesiásticos) */}
      <div className="px-2 mb-3 relative" ref={roleDropdownRef}>
        <button
          type="button"
          id="drawer-role-switcher-btn"
          onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
          className={`w-full flex items-center justify-between p-2 rounded-2xl border text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
            isDark
              ? 'bg-[#181F30] border-[#252D43] hover:border-[#38BDF8] text-white'
              : isSepia
              ? 'bg-[#EAE0D0] border-[#705335]/30 hover:border-[#F47B20] text-[#2D2319]'
              : 'bg-white border-[#0B2B68]/15 hover:border-[#002147] text-[#002147]'
          }`}
          title="Cambiar rol activo para auditar permisos y accesos RBAC"
          aria-expanded={isRoleDropdownOpen}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-[#002147] dark:bg-[#FED65B] flex items-center justify-center text-[#FED65B] dark:text-[#002147] flex-shrink-0 shadow-2xs">
              <KeyRound className="w-3.5 h-3.5" />
            </div>
            <div className="text-left min-w-0 flex-1">
              <div className="text-[9px] uppercase font-black tracking-wider opacity-60 leading-none flex items-center gap-1">
                <span>Rol Activo</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
              </div>
              <div className="text-xs font-bold truncate mt-0.5">
                {roleMeta?.shortLabel || currentRole}
              </div>
            </div>
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 flex-shrink-0 opacity-70 transition-transform duration-200 ${
              isRoleDropdownOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Interactive Roles Dropdown Menu */}
        {isRoleDropdownOpen && (
          <div
            id="drawer-role-dropdown-menu"
            className={`absolute left-2 right-2 top-full mt-1 p-1.5 rounded-2xl shadow-2xl border z-50 animate-in fade-in duration-150 max-h-72 overflow-y-auto scrollbar-thin ${
              isDark
                ? 'bg-[#131722] border-[#252D43] text-[#F1F3F9]'
                : isSepia
                ? 'bg-[#F4EFE6] border-[#705335]/30 text-[#2D2319]'
                : 'bg-white border-[#0B2B68]/20 text-[#1B1C19]'
            }`}
          >
            <div className="px-2 py-1.5 border-b border-inherit/20 text-[10px] font-black uppercase tracking-wider opacity-60 flex items-center gap-1">
              <KeyRound className="w-3 h-3 text-[#F47B20]" />
              <span>Simular Rol / Encargo:</span>
            </div>
            <div className="space-y-0.5 mt-1">
              {(Object.keys(ROLE_METADATA) as UserRole[]).map((r) => {
                const isSelected = currentRole === r;
                const meta = ROLE_METADATA[r];
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      switchRole(r);
                      setIsRoleDropdownOpen(false);
                      onToast?.(`Rol cambiado a: ${meta.label}`);
                    }}
                    className={`w-full flex items-start justify-between p-2 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? isDark
                          ? 'bg-[#2B3990] text-white shadow-2xs'
                          : isSepia
                          ? 'bg-[#5C4228] text-white shadow-2xs'
                          : 'bg-[#002147] text-white shadow-2xs'
                        : isDark
                        ? 'hover:bg-[#1C2337] text-slate-300'
                        : isSepia
                        ? 'hover:bg-[#EAE0D0] text-[#2D2319]'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="min-w-0 pr-1">
                      <div className="font-bold truncate">{meta.shortLabel}</div>
                      <div className="text-[10px] opacity-75 line-clamp-1 mt-0.5">
                        {meta.label}
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle className="w-4 h-4 text-[#FED65B] flex-shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Nav List - Reorganized in Clear Distinct Groups */}
      <nav className="flex-1 overflow-y-auto px-1 space-y-4 scrollbar-thin">
        {navGroups.map((group, idx) => (
          <div key={group.id} className="space-y-1">
            {/* Group Header */}
            <div
              className={`text-[10px] font-sans font-black uppercase tracking-wider px-2 pt-1 pb-1 flex items-center justify-between border-t ${
                idx === 0 ? 'border-transparent' : groupHeaderClass
              }`}
            >
              <span>{group.title}</span>
              {group.badge && (
                <span className="text-[8px] px-1.5 py-0.2 rounded font-extrabold bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {group.badge}
                </span>
              )}
            </div>

            {/* Group Items */}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = isItemActive(item);

                return (
                  <li key={item.id}>
                    <button
                      id={`drawer-item-${item.id}`}
                      onClick={() => handleItemClick(item)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                        isActive ? itemActiveClass : itemHoverClass
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 flex-shrink-0 ${
                            isActive
                              ? 'text-[#FED65B]'
                              : isDark
                              ? 'text-slate-400'
                              : 'text-slate-500'
                          }`}
                        />
                        <span className="whitespace-nowrap">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold ml-1.5 flex-shrink-0 ${
                            isActive
                              ? 'bg-[#F47B20] text-white'
                              : item.badgeClass
                              ? item.badgeClass
                              : isDark
                              ? 'bg-[#252D43] text-slate-300'
                              : 'bg-slate-200/80 text-slate-700'
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
          </div>
        ))}
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
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs ${
              isDark
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

        {onOpenFeedback && (
          <button
            type="button"
            id="drawer-open-feedback-btn"
            onClick={() => {
              onCloseMobile();
              onOpenFeedback();
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs ${
              isDark
                ? 'bg-[#1C2337] border-[#252D43] text-[#F1F3F9] hover:bg-[#252D43]'
                : isSepia
                ? 'bg-[#EFE7D8] border-[#705335]/25 text-[#2D2319] hover:bg-[#E8DEC9]'
                : 'bg-white border-[#0B2B68]/15 text-[#0B2B68] hover:bg-[#EAE8E3]'
            }`}
            title="Enviar reporte de errores o sugerencias"
            aria-label="Errores y Sugerencias"
          >
            <MessageSquarePlus className="w-3.5 h-3.5 text-[#00A3E0]" />
            <span className="truncate">Sugerencias</span>
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
        className={`hidden md:flex flex-col h-[calc(100vh-64px)] w-64 lg:w-72 border-r sticky top-16 z-30 flex-shrink-0 overflow-hidden ${drawerBgClass} shadow-xs`}
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
