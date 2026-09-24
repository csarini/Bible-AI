import React from 'react';
import { Globe, Landmark, Building, Home } from 'lucide-react';
import { HierarchyScopeType } from '../types';

interface ScopeBadgeProps {
  scope?: HierarchyScopeType;
  scopeName?: string;
  scopeTargetId?: string;
  size?: 'xs' | 'sm';
  showDetails?: boolean;
}

export const ScopeBadge: React.FC<ScopeBadgeProps> = ({
  scope = 'general',
  scopeName,
  scopeTargetId,
  size = 'xs',
}) => {
  const isXs = size === 'xs';
  const paddingClass = isXs ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  if (!scope || scope === 'general' || scopeTargetId === 'general') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-md font-bold tracking-wide bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/25 ${paddingClass}`}
        title="Evento/Prédica/Aviso general para toda la congregación"
      >
        <Globe className="w-3 h-3 text-blue-500" />
        <span className="truncate">{scopeName || 'Toda la Iglesia (General)'}</span>
      </span>
    );
  }

  if (scope === 'sede') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-md font-bold tracking-wide bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 ${paddingClass}`}
        title="Perteneciente a Sede Específica"
      >
        <Landmark className="w-3 h-3 text-amber-600 dark:text-amber-400" />
        <span className="truncate">{scopeName || 'Sede'}</span>
      </span>
    );
  }

  if (scope === 'anexo') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-md font-bold tracking-wide bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 ${paddingClass}`}
        title="Perteneciente a Anexo Filial"
      >
        <Building className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
        <span className="truncate">{scopeName || 'Anexo'}</span>
      </span>
    );
  }

  if (scope === 'celula') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-md font-bold tracking-wide bg-purple-500/15 text-purple-800 dark:text-purple-300 border border-purple-500/30 ${paddingClass}`}
        title="Perteneciente a Célula / Grupo en Casa"
      >
        <Home className="w-3 h-3 text-purple-600 dark:text-purple-400" />
        <span className="truncate">{scopeName || 'Célula en Casa'}</span>
      </span>
    );
  }

  return null;
};
