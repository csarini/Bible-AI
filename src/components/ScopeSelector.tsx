import React, { useMemo } from 'react';
import { Building, Home, Globe, Landmark, ChevronDown } from 'lucide-react';
import { HierarchyScopeType } from '../types';
import { churchHierarchyService } from '../services/church_hierarchy.service';

interface ScopeSelectorProps {
  scope: HierarchyScopeType;
  targetId?: string;
  onChange: (scope: HierarchyScopeType, targetId: string, scopeName: string) => void;
  label?: string;
  helperText?: string;
  compact?: boolean;
}

export const ScopeSelector: React.FC<ScopeSelectorProps> = ({
  scope = 'general',
  targetId = 'general',
  onChange,
  label = 'Asignar Ámbito / Pertenencia Eclesiástica:',
  helperText = 'Define si este registro es general para toda la congregación o exclusivo de una sede, anexo o célula.',
  compact = false,
}) => {
  const sedes = useMemo(() => churchHierarchyService.getSedes(), []);
  const anexos = useMemo(() => churchHierarchyService.getAnexos(), []);
  const celulas = useMemo(() => churchHierarchyService.getCelulas(), []);
  const org = useMemo(() => churchHierarchyService.getOrganization(), []);

  const scopeTabs: { id: HierarchyScopeType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'general', label: 'Toda la Iglesia', icon: Globe },
    { id: 'sede', label: 'Sede / Templo', icon: Landmark },
    { id: 'anexo', label: 'Anexo Filial', icon: Building },
    { id: 'celula', label: 'Célula en Casa', icon: Home },
  ];

  const handleScopeChange = (newScope: HierarchyScopeType) => {
    if (newScope === 'general') {
      onChange('general', 'general', `Toda la Iglesia (${org.name})`);
      return;
    }

    if (newScope === 'sede') {
      const defaultSede = sedes[0];
      onChange('sede', defaultSede?.id || 'sede_central', defaultSede?.name || 'Sede Central');
      return;
    }

    if (newScope === 'anexo') {
      const defaultAnexo = anexos[0];
      onChange('anexo', defaultAnexo?.id || 'anexo_01', defaultAnexo?.name || 'Anexo Local');
      return;
    }

    if (newScope === 'celula') {
      const defaultCel = celulas[0];
      onChange(
        'celula',
        defaultCel?.id || 'cel_01',
        defaultCel ? `[${defaultCel.code}] ${defaultCel.name}` : 'Célula Local'
      );
      return;
    }
  };

  const handleTargetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (scope === 'sede') {
      const found = sedes.find((s) => s.id === val);
      onChange('sede', val, found?.name || 'Sede');
    } else if (scope === 'anexo') {
      const found = anexos.find((a) => a.id === val);
      onChange('anexo', val, found?.name || 'Anexo');
    } else if (scope === 'celula') {
      const found = celulas.find((c) => c.id === val);
      onChange('celula', val, found ? `[${found.code}] ${found.name}` : 'Célula');
    }
  };

  return (
    <div className={`w-full ${compact ? 'space-y-1.5' : 'space-y-2.5'} p-3 rounded-2xl bg-slate-50 dark:bg-[#151720] border border-slate-200 dark:border-slate-800 text-left`}>
      <div className="flex flex-wrap items-center justify-between gap-1">
        <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <Landmark className="w-3.5 h-3.5 text-[#F47B20]" />
          <span>{label}</span>
        </label>
        {helperText && (
          <span className="text-[10px] text-slate-400 dark:text-slate-500 hidden sm:inline">
            {helperText}
          </span>
        )}
      </div>

      {/* Scope Segmented Control */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-xl bg-slate-200/70 dark:bg-[#1A1C24] border border-slate-300/50 dark:border-slate-700/50">
        {scopeTabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = scope === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleScopeChange(tab.id)}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white dark:bg-[#002147] text-[#002147] dark:text-[#FED65B] shadow-xs ring-1 ring-black/5 dark:ring-[#FED65B]/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#F47B20]' : 'opacity-70'}`} />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Target Dropdown based on chosen scope */}
      {scope === 'general' && (
        <div className="flex items-center gap-2 p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-800 dark:text-blue-300 text-xs">
          <Globe className="w-4 h-4 text-blue-500 shrink-0" />
          <div className="truncate">
            <span className="font-bold">Alcance Institucional General: </span>
            <span>Visible y aplicado a toda la iglesia ({org.name}), todas las sedes, anexos y células.</span>
          </div>
        </div>
      )}

      {scope === 'sede' && (
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
            Selecciona la Sede o Campus Destino:
          </label>
          <div className="relative">
            <select
              value={targetId}
              onChange={handleTargetChange}
              className="w-full p-2.5 pr-8 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121318] text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147] cursor-pointer"
            >
              {sedes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.isMainCampus ? '⭐ [Templo Principal] ' : '🏛️ [Sede] '}
                  {s.name} &bull; {s.city} (Pastor: {s.pastorInCharge})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>
        </div>
      )}

      {scope === 'anexo' && (
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
            Selecciona el Anexo / Misión Filial:
          </label>
          <div className="relative">
            <select
              value={targetId}
              onChange={handleTargetChange}
              className="w-full p-2.5 pr-8 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121318] text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147] cursor-pointer"
            >
              {anexos.map((a) => (
                <option key={a.id} value={a.id}>
                  ⛪ {a.name} (Sede: {a.sedeName || 'Sede'} &bull; Líder: {a.leaderInCharge})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>
        </div>
      )}

      {scope === 'celula' && (
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
            Selecciona la Célula o Grupo de Hogar:
          </label>
          <div className="relative">
            <select
              value={targetId}
              onChange={handleTargetChange}
              className="w-full p-2.5 pr-8 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121318] text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147] cursor-pointer"
            >
              {celulas.map((c) => (
                <option key={c.id} value={c.id}>
                  🏠 [{c.code}] {c.name} &bull; {c.dayOfWeek} {c.meetingTime} (Líder: {c.leaderName} &bull; Casa: {c.hostName})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>
        </div>
      )}
    </div>
  );
};
