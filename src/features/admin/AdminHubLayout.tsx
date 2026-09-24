import React, { useState, useEffect } from 'react';
import {
  Users,
  Utensils,
  Calendar,
  Bell,
  BookOpen,
  Shield,
  Building,
  KeyRound,
  CheckCircle,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Tv,
  Layers,
  Flame,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../auth/context/AuthContext';
import { RoleGuard } from '../auth/guards/RoleGuard';
import { UserRole, ROLE_METADATA } from '../auth/types';
import { MembershipManagerView } from './MembershipManagerView';
import { FoodCourtAdminView } from './FoodCourtAdminView';
import { EventsAdminView } from './EventsAdminView';
import { AnnouncementsAdminView } from './AnnouncementsAdminView';
import { SermonsAdminView } from './SermonsAdminView';
import { PulpitModeView } from './PulpitModeView';
import { ChurchHierarchyAdminView } from './ChurchHierarchyAdminView';
import { SecurityRolesAdminView } from './SecurityRolesAdminView';
import { churchHierarchyService } from '../../services/church_hierarchy.service';

export type AdminSubTab =
  | 'sermons'
  | 'events'
  | 'pulpit'
  | 'hierarchy'
  | 'security'
  | 'memberships'
  | 'food-court'
  | 'announcements';

interface AdminHubLayoutProps {
  initialSubTab?: AdminSubTab;
  onNavigateSubTab?: (tab: AdminSubTab) => void;
  onNavigateToScripture?: (bookId: string, chapter: number, verse?: number) => void;
  onToast?: (message: string) => void;
  currentTheme?: 'light' | 'sepia' | 'dark';
  onNavigateHome?: () => void;
}

export const AdminHubLayout: React.FC<AdminHubLayoutProps> = ({
  initialSubTab = 'sermons',
  onNavigateSubTab,
  onNavigateToScripture,
  onToast,
  currentTheme = 'light',
  onNavigateHome,
}) => {
  const { user, currentRole, switchRole } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>(initialSubTab);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [churchOrg, setChurchOrg] = useState(() => churchHierarchyService.getOrganization());

  useEffect(() => {
    return churchHierarchyService.subscribe(() => {
      setChurchOrg(churchHierarchyService.getOrganization());
    });
  }, []);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const handleSelectTab = (tab: AdminSubTab) => {
    setActiveSubTab(tab);
    onNavigateSubTab?.(tab);
  };

  const isDark = currentTheme === 'dark';
  const isSepia = currentTheme === 'sepia';

  const roleMeta = ROLE_METADATA[currentRole];

  // If in pulpit presentation mode, render fullscreen distraction-free view
  if (activeSubTab === 'pulpit') {
    return (
      <RoleGuard module="pulpit_mode">
        <PulpitModeView
          onExitPulpit={() => handleSelectTab('sermons')}
          onToast={onToast}
        />
      </RoleGuard>
    );
  }

  // Organized and Unified Sub-Navigation Tabs
  const subNavItems: {
    id: AdminSubTab;
    label: string;
    icon: React.FC<{ className?: string }>;
    module: any;
    badge?: string;
    group: 'liturgy' | 'operations';
  }[] = [
    {
      id: 'sermons',
      label: 'Prédicas & Bosquejos',
      icon: BookOpen,
      module: 'sermons',
      badge: 'Homilética',
      group: 'liturgy',
    },
    {
      id: 'events',
      label: 'Eventos & Logística',
      icon: Calendar,
      module: 'events',
      badge: '🍔👶📚',
      group: 'liturgy',
    },
    {
      id: 'pulpit',
      label: 'Modo Púlpito',
      icon: Tv,
      module: 'pulpit_mode',
      badge: 'En Vivo',
      group: 'liturgy',
    },
    {
      id: 'hierarchy',
      label: 'Sedes & Células',
      icon: Building,
      module: 'church_hierarchy',
      badge: 'Estructura',
      group: 'operations',
    },
    {
      id: 'security',
      label: 'Seguridad & Roles',
      icon: Shield,
      module: 'security',
      badge: 'RBAC',
      group: 'operations',
    },
    {
      id: 'memberships',
      label: 'Membresías Móvil',
      icon: Users,
      module: 'memberships',
      badge: 'Flutter',
      group: 'operations',
    },
    {
      id: 'food-court',
      label: 'Cafetería & Kiosko',
      icon: Utensils,
      module: 'food_court',
      badge: 'Turnos',
      group: 'operations',
    },
    {
      id: 'announcements',
      label: 'Avisos Push (FCM)',
      icon: Bell,
      module: 'announcements',
      badge: 'Difusión',
      group: 'operations',
    },
  ];

  return (
    <div className="w-full flex flex-col flex-1 pb-16">
      {/* Admin Hub Top Bar */}
      <div className="w-full bg-white dark:bg-[#121318] border-b border-slate-200 dark:border-slate-800 shadow-xs sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Left: Organization Title & Current Church */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#002147] flex items-center justify-center text-[#FED65B] font-serif font-bold text-base shadow-sm border border-[#D4AF37]/40">
              ✝
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#002147] dark:text-white">
                  Admin Hub &bull; {churchOrg.name}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-[#F47B20]/10 text-[#F47B20] border border-[#F47B20]/30">
                  Pastoral & Gestión
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Building className="w-3 h-3 text-[#002147] dark:text-[#FED65B]" />
                <span className="font-medium">{churchOrg.name}</span>
                <span className="opacity-40">&bull;</span>
                <span>{churchOrg.headquartersAddress}</span>
              </div>
            </div>
          </div>

          {/* Right: Active Role & Interactive Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-100 dark:bg-[#1A1C24] border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer text-xs"
              title="Cambiar rol activo para auditar permisos RBAC"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <div className="text-left">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider leading-none">
                  Rol Eclesiástico Activo
                </div>
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  {roleMeta?.shortLabel || currentRole}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Role Switcher Dropdown */}
            {isRoleDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#1A1C24] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-2 z-50 animate-in fade-in duration-100"
                onClick={() => setIsRoleDropdownOpen(false)}
              >
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#F47B20]" />
                  <span>Simular Rol para Probar RBAC:</span>
                </div>
                <div className="space-y-1 mt-1">
                  {(Object.keys(ROLE_METADATA) as UserRole[]).map((r) => {
                    const isSelected = currentRole === r;
                    return (
                      <button
                        key={r}
                        onClick={() => {
                          switchRole(r);
                          onToast?.(`Rol cambiado a: ${ROLE_METADATA[r].label}`);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#002147] text-white'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="font-bold">{ROLE_METADATA[r].shortLabel}</div>
                          <div className="text-[10px] opacity-75 truncate max-w-[200px]">
                            {ROLE_METADATA[r].label}
                          </div>
                        </div>
                        {isSelected && <CheckCircle className="w-4 h-4 text-[#FED65B]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sub-Navigation Tabs: Reorganized and Unified */}
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1.5 overflow-x-auto border-t border-slate-100 dark:border-slate-800/60 py-1.5">
          {subNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSubTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#002147] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-[#002147] hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#FED65B]' : 'opacity-70'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                      isActive
                        ? 'bg-[#F47B20] text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Module Content View Protected with RoleGuard */}
      <div className="flex-1 w-full">
        {activeSubTab === 'sermons' && (
          <RoleGuard module="sermons">
            <SermonsAdminView
              onOpenLivePulpit={(sermonId) => {
                handleSelectTab('pulpit');
              }}
              onNavigateToScripture={onNavigateToScripture}
              onToast={onToast}
              currentTheme={currentTheme}
            />
          </RoleGuard>
        )}

        {activeSubTab === 'events' && (
          <RoleGuard module="events">
            <EventsAdminView
              onNavigateToScripture={onNavigateToScripture}
              onToast={onToast}
              currentTheme={currentTheme}
            />
          </RoleGuard>
        )}

        {activeSubTab === 'hierarchy' && (
          <RoleGuard module="church_hierarchy">
            <ChurchHierarchyAdminView onToast={onToast} currentTheme={currentTheme} />
          </RoleGuard>
        )}

        {activeSubTab === 'security' && (
          <RoleGuard module="security">
            <SecurityRolesAdminView onToast={onToast} currentTheme={currentTheme} />
          </RoleGuard>
        )}

        {activeSubTab === 'memberships' && (
          <RoleGuard module="memberships">
            <MembershipManagerView onToast={onToast} currentTheme={currentTheme} />
          </RoleGuard>
        )}

        {activeSubTab === 'food-court' && (
          <RoleGuard module="food_court">
            <FoodCourtAdminView onToast={onToast} currentTheme={currentTheme} />
          </RoleGuard>
        )}

        {activeSubTab === 'announcements' && (
          <RoleGuard module="announcements">
            <AnnouncementsAdminView onToast={onToast} currentTheme={currentTheme} />
          </RoleGuard>
        )}
      </div>
    </div>
  );
};
