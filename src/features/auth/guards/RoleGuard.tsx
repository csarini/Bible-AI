import React from 'react';
import { ShieldAlert, KeyRound, ChevronRight, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole, AdminModule, ROLE_METADATA } from '../types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  module?: AdminModule;
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  module,
  fallback,
}) => {
  const { user, currentRole, canAccess, switchRole } = useAuth();

  let isAuthorized = false;

  if (allowedRoles && allowedRoles.length > 0) {
    // Pastors have global access across all admin modules
    const effectiveRoles = [
      ...allowedRoles,
      'church_pastor_admin' as UserRole,
      'annex_pastor_leader' as UserRole,
    ];
    isAuthorized = effectiveRoles.includes(currentRole);
  } else if (module) {
    // Module-based check
    isAuthorized = canAccess(module);
  } else {
    isAuthorized = true;
  }

  if (isAuthorized) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const currentRoleMeta = ROLE_METADATA[currentRole];
  const requiredRoles = allowedRoles || (module ? getRolesForModule(module) : []);

  return (
    <div className="w-full min-h-[500px] flex items-center justify-center p-6 bg-[#F9F6F0]/60 dark:bg-[#121318]/60 rounded-3xl border border-[#002147]/10 dark:border-white/10 my-4">
      <div className="max-w-md w-full text-center space-y-5 bg-white dark:bg-[#1A1C24] p-8 rounded-2xl shadow-xl border border-[#002147]/10 dark:border-white/10">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#F47B20]/10 flex items-center justify-center text-[#F47B20] border border-[#F47B20]/30 shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
            <Lock className="w-3.5 h-3.5" />
            Acceso Restringido (RBAC)
          </div>
          <h2 className="text-xl font-bold font-serif text-[#002147] dark:text-white">
            Permisos Insuficientes
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Tu rol actual{' '}
            <strong className="text-[#002147] dark:text-[#FED65B]">
              ({currentRoleMeta?.label || currentRole})
            </strong>{' '}
            no tiene privilegios de acceso para gestionar este módulo del Admin Hub.
          </p>
        </div>

        {/* Required Roles Box */}
        <div className="p-3.5 bg-slate-50 dark:bg-[#13141B] rounded-xl text-left border border-slate-200 dark:border-slate-800 text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            Roles autorizados para este módulo:
          </span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {requiredRoles.map((r) => (
              <span
                key={r}
                className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#002147]/10 dark:bg-white/10 text-[#002147] dark:text-[#FED65B]"
              >
                {ROLE_METADATA[r]?.shortLabel || r}
              </span>
            ))}
          </div>
        </div>

        {/* Quick Role Switcher for Test / Demo Convenience */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-2.5 flex items-center justify-center gap-1">
            <KeyRound className="w-3 h-3" />
            Modo Desarrollador / Demo: Conmutar rol activo
          </p>
          <div className="grid grid-cols-2 gap-2">
            {requiredRoles.slice(0, 4).map((role) => (
              <button
                key={role}
                onClick={() => switchRole(role)}
                className="flex items-center justify-between p-2 rounded-xl text-left text-xs font-semibold bg-[#002147]/5 hover:bg-[#002147] hover:text-white dark:bg-white/5 dark:hover:bg-[#F47B20] text-[#002147] dark:text-slate-200 transition-all cursor-pointer border border-[#002147]/10 dark:border-white/10"
              >
                <span className="truncate">{ROLE_METADATA[role]?.shortLabel || role}</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60 flex-shrink-0 ml-1" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

function getRolesForModule(mod: AdminModule): UserRole[] {
  switch (mod) {
    case 'security':
      return ['church_pastor_admin'];
    case 'memberships':
      return ['membership_manager', 'church_pastor_admin', 'sede_leader', 'annex_pastor_leader'];
    case 'food_court':
      return ['food_court_manager', 'church_pastor_admin', 'sede_leader', 'annex_pastor_leader'];
    case 'events':
      return ['event_coordinator', 'church_pastor_admin', 'sede_leader', 'annex_pastor_leader', 'celula_leader'];
    case 'announcements':
      return ['media_announcer', 'church_pastor_admin', 'sede_leader', 'annex_pastor_leader', 'celula_leader'];
    case 'pulpit_mode':
      return ['church_pastor_admin', 'sede_leader', 'annex_pastor_leader'];
    case 'church_hierarchy':
      return ['church_pastor_admin', 'sede_leader', 'annex_pastor_leader', 'celula_leader'];
    default:
      return ['church_pastor_admin'];
  }
}
