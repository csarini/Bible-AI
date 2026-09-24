import React, { useState, useEffect } from 'react';
import {
  Users,
  Utensils,
  Calendar,
  Bell,
  BookOpen,
  Shield,
  Building,
  Sparkles,
  Tv,
} from 'lucide-react';
import { RoleGuard } from '../auth/guards/RoleGuard';
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
  const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>(initialSubTab);
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
                  {churchOrg.name} &bull; {subNavItems.find((i) => i.id === activeSubTab)?.label || 'Panel de Gestión'}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-[#F47B20]/10 text-[#F47B20] border border-[#F47B20]/30">
                  {subNavItems.find((i) => i.id === activeSubTab)?.badge || 'Módulo'}
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
