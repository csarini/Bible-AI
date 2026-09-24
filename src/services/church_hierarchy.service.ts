import {
  ChurchOrganizationConfig,
  ChurchSede,
  ChurchAnexo,
  ChurchCelula,
  HierarchyScopeType,
  HierarchyScopeOption,
} from '../types';

const STORAGE_KEY_ORG = 'sanctuary_church_organization_v1';
const STORAGE_KEY_SEDES = 'sanctuary_church_sedes_v1';
const STORAGE_KEY_ANEXOS = 'sanctuary_church_anexos_v1';
const STORAGE_KEY_CELULAS = 'sanctuary_church_celulas_v1';

export const INITIAL_ORGANIZATION: ChurchOrganizationConfig = {
  id: 'church_elshaddai_central',
  name: 'Iglesia Cristiana El-Shaddai',
  denomination: 'Evangélica Pentecostal / Alianza de Santidad',
  mainPastor: 'Pastor David Ben-David & Pastora Sara Ben-David',
  headquartersAddress: 'Av. La Paz 1420, Templo Central',
  headquartersCity: 'Ciudad Capital',
  headquartersPhone: '+56 9 8765 4321',
  headquartersEmail: 'administracion@elshaddai.org',
  visionStatement:
    'Proclamar a Cristo con excelencia bíblica, pastorear con gracia y amor sacrificial, y multiplicar discípulos maduros a través de células de comunión en cada hogar.',
  logoUrl: 'https://images.unsplash.com/photo-1548625361-16eb792ff459?w=300&auto=format&fit=crop&q=80',
  foundedYear: '1984',
  updatedAt: new Date().toISOString(),
};

export const INITIAL_SEDES: ChurchSede[] = [
  {
    id: 'sede_central',
    name: 'Templo Principal - Sede Central',
    city: 'Santiago Centro',
    address: 'Av. La Paz 1420, Sector Centro',
    pastorInCharge: 'Pastor David Ben-David',
    phone: '+56 9 8765 4321',
    isMainCampus: true,
    activeMembersCount: 650,
    notes: 'Sede matriz, santuario principal con capacidad para 700 personas, cafetería y salones de discipulado.',
  },
  {
    id: 'sede_norte',
    name: 'Sede Norte - Campus Esperanza',
    city: 'Sector Norte',
    address: 'Calle San Pedro 55, Recoleta Norte',
    pastorInCharge: 'Pastor Marcos Morales',
    phone: '+56 9 7654 3210',
    isMainCampus: false,
    activeMembersCount: 280,
    notes: 'Campus dinámico con ministerio juvenil activo y escuela dominical infantil.',
  },
  {
    id: 'sede_sur',
    name: 'Sede Sur - Campus Cordillera',
    city: 'Sector Cordillera',
    address: 'Av. Panamericana Sur 880, La Florida',
    pastorInCharge: 'Pastor Samuel Valenzuela',
    phone: '+56 9 6543 2109',
    isMainCampus: false,
    activeMembersCount: 210,
    notes: 'Campus enfocado en familias, consejería pastoral y misiones comunitarias.',
  },
];

export const INITIAL_ANEXOS: ChurchAnexo[] = [
  {
    id: 'anexo_san_pedro',
    sedeId: 'sede_norte',
    sedeName: 'Sede Norte - Campus Esperanza',
    name: 'Anexo Sector San Pedro',
    address: 'Calle San Pedro 55 - Módulo Anexo B',
    leaderInCharge: 'Líder Gabriel Cruz',
    phone: '+56 9 5432 1098',
    meetingDays: 'Jueves 19:30 & Domingos 09:30',
    activeMembersCount: 95,
  },
  {
    id: 'anexo_los_olivos',
    sedeId: 'sede_central',
    sedeName: 'Templo Principal - Sede Central',
    name: 'Anexo Los Olivos de Paz',
    address: 'Pasaje Los Olivos 320, Sector Matta',
    leaderInCharge: 'Líder Esther Rojas',
    phone: '+56 9 4321 0987',
    meetingDays: 'Martes 19:00 & Sábados 18:00',
    activeMembersCount: 75,
  },
  {
    id: 'anexo_renuevo',
    sedeId: 'sede_sur',
    sedeName: 'Sede Sur - Campus Cordillera',
    name: 'Misión Filial El Renuevo',
    address: 'Av. Las Torres 110, Villa Sur',
    leaderInCharge: 'Líder Carlos Meneses',
    phone: '+56 9 3210 9876',
    meetingDays: 'Miércoles 19:30 & Domingos 11:30',
    activeMembersCount: 60,
  },
];

export const INITIAL_CELULAS: ChurchCelula[] = [
  {
    id: 'cel_c01',
    sedeId: 'sede_central',
    sedeName: 'Templo Principal - Sede Central',
    code: 'CEL-C01',
    name: 'Célula Betel - Familias en Victoria',
    leaderName: 'Hno. Roberto Quispe',
    hostName: 'Familia Flores',
    address: 'Calle Los Sauces 240, Dpto 301',
    neighborhood: 'Santa Rosa Centro',
    dayOfWeek: 'Miércoles',
    meetingTime: '19:30',
    membersCount: 14,
    targetAudience: 'Familias',
    status: 'active',
  },
  {
    id: 'cel_c02',
    sedeId: 'sede_central',
    anexoId: 'anexo_los_olivos',
    sedeName: 'Templo Principal - Sede Central',
    anexoName: 'Anexo Los Olivos de Paz',
    code: 'CEL-C02',
    name: 'Célula Emanuel - Jóvenes de Impacto',
    leaderName: 'Hna. Karen Mendoza',
    hostName: 'Familia Mendoza',
    address: 'Av. Los Olivos 810',
    neighborhood: 'Barrio Universitario',
    dayOfWeek: 'Sábado',
    meetingTime: '18:00',
    membersCount: 19,
    targetAudience: 'Jóvenes',
    status: 'active',
  },
  {
    id: 'cel_n01',
    sedeId: 'sede_norte',
    anexoId: 'anexo_san_pedro',
    sedeName: 'Sede Norte - Campus Esperanza',
    anexoName: 'Anexo Sector San Pedro',
    code: 'CEL-N01',
    name: 'Célula Maranatha - Hogar de Paz',
    leaderName: 'Hno. Andrés Silva',
    hostName: 'Familia Silva',
    address: 'Pasaje Los Pinos 112',
    neighborhood: 'Recoleta Norte',
    dayOfWeek: 'Jueves',
    meetingTime: '20:00',
    membersCount: 12,
    targetAudience: 'Mixto',
    status: 'active',
  },
  {
    id: 'cel_s01',
    sedeId: 'sede_sur',
    sedeName: 'Sede Sur - Campus Cordillera',
    code: 'CEL-S01',
    name: 'Célula Monte de Sión - Matrimonios',
    leaderName: 'Hno. Hugo Paredes',
    hostName: 'Familia Paredes',
    address: 'Calle Central 890, Casa 4',
    neighborhood: 'La Florida Cordillera',
    dayOfWeek: 'Viernes',
    meetingTime: '20:00',
    membersCount: 11,
    targetAudience: 'Familias',
    status: 'active',
  },
  {
    id: 'cel_s02',
    sedeId: 'sede_sur',
    anexoId: 'anexo_renuevo',
    sedeName: 'Sede Sur - Campus Cordillera',
    anexoName: 'Misión Filial El Renuevo',
    code: 'CEL-S02',
    name: 'Célula Débora & Ester - Mujeres de Fe',
    leaderName: 'Pastora Elizabeth Morales',
    hostName: 'Hna. Gloria Gómez',
    address: 'Pasaje El Roble 45',
    neighborhood: 'Villa Esperanza',
    dayOfWeek: 'Martes',
    meetingTime: '16:00',
    membersCount: 16,
    targetAudience: 'Mujeres',
    status: 'active',
  },
];

class ChurchHierarchyService {
  private listeners: (() => void)[] = [];

  private notify() {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (e) {
        console.error('Hierarchy listener error', e);
      }
    });
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  // --- Organization Config ---
  public getOrganization(): ChurchOrganizationConfig {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ORG);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to parse church org config', e);
    }
    localStorage.setItem(STORAGE_KEY_ORG, JSON.stringify(INITIAL_ORGANIZATION));
    return INITIAL_ORGANIZATION;
  }

  public updateOrganization(config: Partial<ChurchOrganizationConfig>): ChurchOrganizationConfig {
    const current = this.getOrganization();
    const updated: ChurchOrganizationConfig = {
      ...current,
      ...config,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY_ORG, JSON.stringify(updated));
    this.notify();
    return updated;
  }

  // --- Sedes ---
  public getSedes(): ChurchSede[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SEDES);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to parse sedes storage', e);
    }
    localStorage.setItem(STORAGE_KEY_SEDES, JSON.stringify(INITIAL_SEDES));
    return INITIAL_SEDES;
  }

  public saveSedes(list: ChurchSede[]) {
    localStorage.setItem(STORAGE_KEY_SEDES, JSON.stringify(list));
    this.notify();
  }

  public addSede(sede: Omit<ChurchSede, 'id'>): ChurchSede {
    const list = this.getSedes();
    const newSede: ChurchSede = {
      ...sede,
      id: `sede_${Date.now()}`,
    };
    this.saveSedes([...list, newSede]);
    return newSede;
  }

  public updateSede(sede: ChurchSede): ChurchSede {
    const list = this.getSedes();
    const updated = list.map((s) => (s.id === sede.id ? sede : s));
    this.saveSedes(updated);

    // Sync sedeName in Anexos & Células
    const anexos = this.getAnexos().map((a) =>
      a.sedeId === sede.id ? { ...a, sedeName: sede.name } : a
    );
    this.saveAnexos(anexos);

    const celulas = this.getCelulas().map((c) =>
      c.sedeId === sede.id ? { ...c, sedeName: sede.name } : c
    );
    this.saveCelulas(celulas);

    return sede;
  }

  public deleteSede(id: string): boolean {
    const list = this.getSedes();
    const filtered = list.filter((s) => s.id !== id);
    if (filtered.length === list.length) return false;
    this.saveSedes(filtered);
    return true;
  }

  // --- Anexos ---
  public getAnexos(): ChurchAnexo[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ANEXOS);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to parse anexos storage', e);
    }
    localStorage.setItem(STORAGE_KEY_ANEXOS, JSON.stringify(INITIAL_ANEXOS));
    return INITIAL_ANEXOS;
  }

  public saveAnexos(list: ChurchAnexo[]) {
    localStorage.setItem(STORAGE_KEY_ANEXOS, JSON.stringify(list));
    this.notify();
  }

  public addAnexo(anexo: Omit<ChurchAnexo, 'id'>): ChurchAnexo {
    const list = this.getAnexos();
    const sedes = this.getSedes();
    const parentSede = sedes.find((s) => s.id === anexo.sedeId);

    const newAnexo: ChurchAnexo = {
      ...anexo,
      id: `anexo_${Date.now()}`,
      sedeName: parentSede ? parentSede.name : anexo.sedeName,
    };
    this.saveAnexos([...list, newAnexo]);
    return newAnexo;
  }

  public updateAnexo(anexo: ChurchAnexo): ChurchAnexo {
    const list = this.getAnexos();
    const sedes = this.getSedes();
    const parentSede = sedes.find((s) => s.id === anexo.sedeId);

    const fullAnexo: ChurchAnexo = {
      ...anexo,
      sedeName: parentSede ? parentSede.name : anexo.sedeName,
    };
    const updated = list.map((a) => (a.id === anexo.id ? fullAnexo : a));
    this.saveAnexos(updated);

    // Sync anexoName in Células
    const celulas = this.getCelulas().map((c) =>
      c.anexoId === anexo.id ? { ...c, anexoName: anexo.name } : c
    );
    this.saveCelulas(celulas);

    return fullAnexo;
  }

  public deleteAnexo(id: string): boolean {
    const list = this.getAnexos();
    const filtered = list.filter((a) => a.id !== id);
    if (filtered.length === list.length) return false;
    this.saveAnexos(filtered);
    return true;
  }

  // --- Células ---
  public getCelulas(): ChurchCelula[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CELULAS);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to parse celulas storage', e);
    }
    localStorage.setItem(STORAGE_KEY_CELULAS, JSON.stringify(INITIAL_CELULAS));
    return INITIAL_CELULAS;
  }

  public saveCelulas(list: ChurchCelula[]) {
    localStorage.setItem(STORAGE_KEY_CELULAS, JSON.stringify(list));
    this.notify();
  }

  public addCelula(celula: Omit<ChurchCelula, 'id'>): ChurchCelula {
    const list = this.getCelulas();
    const sedes = this.getSedes();
    const anexos = this.getAnexos();

    const parentSede = sedes.find((s) => s.id === celula.sedeId);
    const parentAnexo = celula.anexoId ? anexos.find((a) => a.id === celula.anexoId) : undefined;

    const newCelula: ChurchCelula = {
      ...celula,
      id: `cel_${Date.now()}`,
      sedeName: parentSede?.name || celula.sedeName || 'Sede Principal',
      anexoName: parentAnexo?.name || celula.anexoName,
    };
    this.saveCelulas([...list, newCelula]);
    return newCelula;
  }

  public updateCelula(celula: ChurchCelula): ChurchCelula {
    const list = this.getCelulas();
    const sedes = this.getSedes();
    const anexos = this.getAnexos();

    const parentSede = sedes.find((s) => s.id === celula.sedeId);
    const parentAnexo = celula.anexoId ? anexos.find((a) => a.id === celula.anexoId) : undefined;

    const fullCelula: ChurchCelula = {
      ...celula,
      sedeName: parentSede?.name || celula.sedeName,
      anexoName: parentAnexo?.name || celula.anexoName,
    };

    const updated = list.map((c) => (c.id === celula.id ? fullCelula : c));
    this.saveCelulas(updated);
    return fullCelula;
  }

  public deleteCelula(id: string): boolean {
    const list = this.getCelulas();
    const filtered = list.filter((c) => c.id !== id);
    if (filtered.length === list.length) return false;
    this.saveCelulas(filtered);
    return true;
  }

  // --- Dynamic Scope Options for Selectors (General, Sedes, Anexos, Células) ---
  public getAllScopeOptions(): HierarchyScopeOption[] {
    const org = this.getOrganization();
    const sedes = this.getSedes();
    const anexos = this.getAnexos();
    const celulas = this.getCelulas();

    const options: HierarchyScopeOption[] = [];

    // 1. General (Toda la Iglesia)
    options.push({
      id: 'general',
      scope: 'general',
      targetId: 'general',
      label: `🌐 Toda la Iglesia (General - ${org.name})`,
      badge: 'General',
      badgeColor: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
      details: 'Aplica a toda la congregación, todas las sedes, anexos y células.',
    });

    // 2. Sedes
    sedes.forEach((sede) => {
      options.push({
        id: `sede:${sede.id}`,
        scope: 'sede',
        targetId: sede.id,
        label: `🏛️ Sede: ${sede.name}`,
        badge: sede.isMainCampus ? 'Templo Principal' : 'Sede',
        badgeColor: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30',
        details: `${sede.address} &bull; Pastor: ${sede.pastorInCharge}`,
      });
    });

    // 3. Anexos
    anexos.forEach((anexo) => {
      options.push({
        id: `anexo:${anexo.id}`,
        scope: 'anexo',
        targetId: anexo.id,
        label: `⛪ Anexo: ${anexo.name}`,
        badge: 'Anexo',
        badgeColor: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
        details: `${anexo.address} &bull; Sede: ${anexo.sedeName || 'Sede'} &bull; Líder: ${anexo.leaderInCharge}`,
      });
    });

    // 4. Células
    celulas.forEach((cel) => {
      options.push({
        id: `celula:${cel.id}`,
        scope: 'celula',
        targetId: cel.id,
        label: `🏠 Célula [${cel.code}]: ${cel.name}`,
        badge: `Célula ${cel.code}`,
        badgeColor: 'bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30',
        details: `Líder: ${cel.leaderName} &bull; Casa: ${cel.hostName} (${cel.address}) &bull; ${cel.dayOfWeek} ${cel.meetingTime}`,
      });
    });

    return options;
  }

  /**
   * Helper to resolve a display badge for any given scope & targetId
   */
  public resolveScopeDetails(
    scope?: HierarchyScopeType,
    targetId?: string,
    fallbackScopeName?: string
  ): {
    scope: HierarchyScopeType;
    label: string;
    iconText: string;
    badgeColor: string;
  } {
    if (!scope || scope === 'general' || !targetId || targetId === 'general') {
      return {
        scope: 'general',
        label: fallbackScopeName || 'Toda la Iglesia (General)',
        iconText: '🌐',
        badgeColor: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
      };
    }

    if (scope === 'sede') {
      const sede = this.getSedes().find((s) => s.id === targetId);
      return {
        scope: 'sede',
        label: sede ? sede.name : fallbackScopeName || 'Sede Local',
        iconText: '🏛️',
        badgeColor: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30',
      };
    }

    if (scope === 'anexo') {
      const anexo = this.getAnexos().find((a) => a.id === targetId);
      return {
        scope: 'anexo',
        label: anexo ? anexo.name : fallbackScopeName || 'Anexo Local',
        iconText: '⛪',
        badgeColor: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
      };
    }

    if (scope === 'celula') {
      const cel = this.getCelulas().find((c) => c.id === targetId);
      return {
        scope: 'celula',
        label: cel ? `[${cel.code}] ${cel.name}` : fallbackScopeName || 'Célula Hogar',
        iconText: '🏠',
        badgeColor: 'bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30',
      };
    }

    return {
      scope: 'general',
      label: fallbackScopeName || 'General',
      iconText: '🌐',
      badgeColor: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
    };
  }

  // Restore defaults
  public resetToDefaults() {
    localStorage.setItem(STORAGE_KEY_ORG, JSON.stringify(INITIAL_ORGANIZATION));
    localStorage.setItem(STORAGE_KEY_SEDES, JSON.stringify(INITIAL_SEDES));
    localStorage.setItem(STORAGE_KEY_ANEXOS, JSON.stringify(INITIAL_ANEXOS));
    localStorage.setItem(STORAGE_KEY_CELULAS, JSON.stringify(INITIAL_CELULAS));
    this.notify();
  }
}

export const churchHierarchyService = new ChurchHierarchyService();
