// Copyright & Scripture Compliance Service
// Strictly enforces Biblica, Inc. License Agreement, API.Bible Terms of Use,
// and General Copyright Restrictions for biblical translations.

export interface ScriptureCopyrightInfo {
  translationId: string;
  abbreviation: string;
  fullName: string;
  year: string;
  organization: string;
  isCopyrightProtected: boolean;
  standardCitation: string;
  directLinkUrl?: string;
  directLinkAnchorText?: string;
  apiPlatformAttribution?: {
    name: string;
    url: string;
  };
  licenseSummary: string;
}

// 30 Days in Milliseconds: 30 * 24 * 60 * 60 * 1000 = 2,592,000,000 ms
export const CACHE_TTL_DAYS = 30;
export const CACHE_TTL_MS = CACHE_TTL_DAYS * 24 * 60 * 60 * 1000;

// Clause V.F (Bíblica, Inc.): Max 2 chapters or 25 verses (whichever is greater)
export const MAX_READING_VOLUME_CHAPTERS = 2;
export const MAX_READING_VOLUME_VERSES = 25;

const COPYRIGHT_CATALOG: Record<string, ScriptureCopyrightInfo> = {
  nvi: {
    translationId: 'nvi',
    abbreviation: 'NVI',
    fullName: 'Nueva Versión Internacional',
    year: '1999, 2015, 2022',
    organization: 'Bíblica, Inc.®',
    isCopyrightProtected: true,
    standardCitation:
      'NVI © está tomada de la Santa Biblia, Nueva Versión Internacional® NVI® © 1999, 2015, 2022 por Bíblica, Inc.® Usado con permiso. Todos los derechos reservados mundialmente.',
    directLinkUrl: 'https://www.Biblica.com',
    directLinkAnchorText: 'Visitar sitio oficial de Biblica',
    apiPlatformAttribution: {
      name: 'API.Bible',
      url: 'https://api.bible',
    },
    licenseSummary:
      'Uso estrictamente no comercial. Prohibida la conversión de texto a audio y el entrenamiento o procesamiento con modelos de IA generativa (Cláusula III.B).',
  },
  nbla: {
    translationId: 'nbla',
    abbreviation: 'NBLA',
    fullName: 'Nueva Biblia de las Américas',
    year: '2005',
    organization: 'The Lockman Foundation',
    isCopyrightProtected: true,
    standardCitation:
      'NBLA © están tomados de Nueva Biblia de las Américas™ ©, Copyright 2005 por The Lockman Foundation. Usado con permiso. Todos los derechos reservados.',
    directLinkUrl: 'https://www.lockman.org',
    directLinkAnchorText: 'The Lockman Foundation',
    apiPlatformAttribution: {
      name: 'API.Bible',
      url: 'https://api.bible',
    },
    licenseSummary:
      'Traducción protegida por derechos de autor. Cita permitida para fines educativos y devocionales no comerciales.',
  },
  bes: {
    translationId: 'bes',
    abbreviation: 'BES',
    fullName: 'La Biblia en Español Sencillo',
    year: '2019',
    organization: 'Wycliffe Associates',
    isCopyrightProtected: true,
    standardCitation:
      'BES © está tomada de La Biblia en Español Sencillo ©, Wycliffe Associates. Usado con permiso bajo términos de distribución.',
    directLinkUrl: 'https://api.bible',
    directLinkAnchorText: 'API.Bible',
    apiPlatformAttribution: {
      name: 'API.Bible',
      url: 'https://api.bible',
    },
    licenseSummary: 'Traducción de lenguaje sencillo accesible vía API.Bible.',
  },
  vbl: {
    translationId: 'vbl',
    abbreviation: 'VBL',
    fullName: 'Versión Biblia Libre',
    year: '2020',
    organization: 'Dr. Jonathan Gallagher / Free Bible Version',
    isCopyrightProtected: false,
    standardCitation:
      'VBL: Versión Biblia Libre © 2020 por Dr. Jonathan Gallagher. Licencia abierta Creative Commons (CC BY-SA 4.0).',
    directLinkUrl: 'https://freebibleversion.org',
    directLinkAnchorText: 'Free Bible Version',
    apiPlatformAttribution: {
      name: 'API.Bible',
      url: 'https://api.bible',
    },
    licenseSummary: 'Licencia Creative Commons abierta.',
  },
  pddpt: {
    translationId: 'pddpt',
    abbreviation: 'PdDpt',
    fullName: 'Palabra de Dios para ti',
    year: '2017',
    organization: 'Palabra de Dios para ti',
    isCopyrightProtected: true,
    standardCitation:
      'PdDpt © está tomada de Palabra de Dios para ti © Copyright 2017. Usado con permiso.',
    directLinkUrl: 'https://api.bible',
    directLinkAnchorText: 'API.Bible',
    apiPlatformAttribution: {
      name: 'API.Bible',
      url: 'https://api.bible',
    },
    licenseSummary: 'Citas bíblicas bajo términos de servicio de API.Bible.',
  },
  valera: {
    translationId: 'valera',
    abbreviation: 'RVR1909',
    fullName: 'Reina-Valera 1909',
    year: '1909',
    organization: 'Sociedad Bíblica Británica y Extranjera',
    isCopyrightProtected: false,
    standardCitation:
      'Reina-Valera 1909 (RVR1909): Texto canónico clásico en español, Dominio Público.',
    licenseSummary: 'Texto histórico de dominio público.',
  },
  sse: {
    translationId: 'sse',
    abbreviation: 'SSE',
    fullName: 'Biblia del Oso (1569)',
    year: '1569',
    organization: 'Casiodoro de Reina',
    isCopyrightProtected: false,
    standardCitation:
      'Sagradas Escrituras 1569 (Biblia del Oso), traducción histórica por Casiodoro de Reina. Dominio Público.',
    licenseSummary: 'Patrimonio histórico universal de dominio público.',
  },
  rv1858: {
    translationId: 'rv1858',
    abbreviation: 'RV1858',
    fullName: 'Reina-Valera Nuevo Testamento (1858)',
    year: '1858',
    organization: 'Revisión histórica de 1858',
    isCopyrightProtected: false,
    standardCitation:
      'Reina-Valera Nuevo Testamento 1858: Revisión histórica protestante, Dominio Público.',
    licenseSummary: 'Texto histórico de dominio público.',
  },
  rvr09: {
    translationId: 'rvr09',
    abbreviation: 'RVR09',
    fullName: 'Reina Valera 1909 (API.Bible)',
    year: '1909',
    organization: 'Sociedades Bíblicas Unidas',
    isCopyrightProtected: false,
    standardCitation: 'Reina Valera 1909: Dominio Público, servido vía API.Bible.',
    apiPlatformAttribution: {
      name: 'API.Bible',
      url: 'https://api.bible',
    },
    licenseSummary: 'Texto de dominio público servido mediante API.Bible.',
  },
  kjv: {
    translationId: 'kjv',
    abbreviation: 'KJV',
    fullName: 'King James Version',
    year: '1611',
    organization: 'Crown / Public Domain',
    isCopyrightProtected: false,
    standardCitation: 'King James Version (1611): Public Domain worldwide.',
    apiPlatformAttribution: {
      name: 'API.Bible',
      url: 'https://api.bible',
    },
    licenseSummary: 'Public Domain text.',
  },
  bsb: {
    translationId: 'bsb',
    abbreviation: 'BSB',
    fullName: 'Berean Standard Bible',
    year: '2023',
    organization: 'Berean Bible',
    isCopyrightProtected: false,
    standardCitation: 'Berean Standard Bible (BSB) © 2023. Dedicated to the Public Domain.',
    licenseSummary: 'Public domain translation.',
  },
};

export class CopyrightGuardService {
  /**
   * Normalizes translation identifier
   */
  static normalizeKey(translationId?: string): string {
    if (!translationId) return 'valera';
    const clean = translationId.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    if (clean.includes('nvi')) return 'nvi';
    if (clean.includes('nbla')) return 'nbla';
    if (clean.includes('bes')) return 'bes';
    if (clean.includes('vbl')) return 'vbl';
    if (clean.includes('pddpt')) return 'pddpt';
    if (clean.includes('1858') || clean === 'rv1858') return 'rv1858';
    if (clean.includes('1569') || clean.includes('sse')) return 'sse';
    if (clean.includes('1909') || clean.includes('valera')) return 'valera';
    if (clean === 'rvr09') return 'rvr09';
    if (clean === 'kjv') return 'kjv';
    if (clean === 'bsb') return 'bsb';
    return clean || 'valera';
  }

  /**
   * Returns whether a given translation is consumed from API.Bible
   * (Offline base translations are 'valera', 'sse', 'rv1858').
   */
  static isApiBibleTranslation(translationId?: string): boolean {
    if (!translationId) return false;
    const key = this.normalizeKey(translationId);
    // Explicit offline bundled translations
    if (key === 'valera' || key === 'sse' || key === 'rv1858') {
      return false;
    }
    // Catalog entries with API.Bible attribution
    const info = COPYRIGHT_CATALOG[key];
    if (info?.apiPlatformAttribution?.name === 'API.Bible') {
      return true;
    }
    // Known API.Bible versions
    const apiBibleKeys = ['nvi', 'nbla', 'bes', 'vbl', 'pddpt', 'rvr09', 'kjv', 'bsb'];
    if (apiBibleKeys.includes(key)) {
      return true;
    }
    // API.Bible hash IDs (e.g. ce11b813f9a27e20-01)
    const raw = translationId.toLowerCase().trim();
    if (raw.includes('-01') || raw.includes('-02') || raw.length > 10) {
      return true;
    }
    return false;
  }

  /**
   * Returns whether a given translation is copyrighted
   */
  static isCopyrightProtected(translationId?: string): boolean {
    const key = this.normalizeKey(translationId);
    return COPYRIGHT_CATALOG[key]?.isCopyrightProtected ?? false;
  }

  /**
   * Retrieves the full copyright metadata for a translation
   */
  static getCopyrightInfo(translationId?: string): ScriptureCopyrightInfo {
    const key = this.normalizeKey(translationId);
    return (
      COPYRIGHT_CATALOG[key] || {
        translationId: key,
        abbreviation: key.toUpperCase(),
        fullName: key.toUpperCase(),
        year: '',
        organization: 'Titular de Derechos',
        isCopyrightProtected: true,
        standardCitation: `Texto provisto conforme a los términos de API.Bible. Usado con permiso.`,
        apiPlatformAttribution: {
          name: 'API.Bible',
          url: 'https://api.bible',
        },
        licenseSummary: 'Traducción provista bajo licencia de distribución no comercial.',
      }
    );
  }

  /**
   * Validates reading volume according to Clause V.F (Bíblica, Inc.)
   * Limit strictly to NO MORE THAN TWO (2) CHAPTERS OR TWENTY-FIVE (25) VERSES, whichever is greater.
   */
  static validateReadingVolume(
    requestedChapters: number,
    requestedVerses: number,
    translationId?: string
  ): { allowed: boolean; reason?: string } {
    if (!this.isCopyrightProtected(translationId)) {
      return { allowed: true };
    }

    // Allow single or two chapter reads
    if (requestedChapters <= MAX_READING_VOLUME_CHAPTERS) {
      return { allowed: true };
    }

    // If spanning more than 2 chapters, check verse ceiling (25 verses)
    if (requestedVerses <= MAX_READING_VOLUME_VERSES) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason:
        `Límite de lectura de Bíblica, Inc. (Cláusula V.F): La consulta excede el máximo permitido ` +
        `de ${MAX_READING_VOLUME_CHAPTERS} capítulos o ${MAX_READING_VOLUME_VERSES} versículos en una sola sesión. ` +
        `La extracción masiva o renderizado continuo del libro completo no está permitido.`,
    };
  }

  /**
   * Format conversion rule:
   * Prohibits text-to-speech (audio synthesis) of protected biblical scripture.
   */
  static canConvertToAudio(translationId?: string): boolean {
    // If copyrighted (e.g. NVI, NBLA), audio conversion is strictly forbidden by license terms
    return !this.isCopyrightProtected(translationId);
  }

  /**
   * Evaluates if a cached chapter in local storage is expired (TTL: 30 days)
   */
  static isCacheExpired(cachedTimestamp?: number | Date): boolean {
    if (!cachedTimestamp) return true;
    const timeMs = typeof cachedTimestamp === 'number' ? cachedTimestamp : cachedTimestamp.getTime();
    const ageMs = Date.now() - timeMs;
    return ageMs > CACHE_TTL_MS;
  }

  /**
   * Sanitizes AI Mentor inputs (Clause III.B):
   * Strictly blocks copyrighted scripture strings from being sent to Generative AI / LLMs.
   * If protected, passes ONLY the canonical reference string (e.g. "Juan 3:16").
   */
  static sanitizeAiMentorPayload(
    verseRef?: string,
    verseText?: string,
    translationId?: string
  ): { reference: string; text?: string; wasSanitized: boolean; notice?: string } {
    const isProtected = this.isCopyrightProtected(translationId);

    if (isProtected && verseText && verseText.trim().length > 0) {
      // Omit protected text string completely to comply with Clause III.B
      return {
        reference: verseRef || '',
        text: undefined,
        wasSanitized: true,
        notice:
          'Para proteger los derechos de autor (Cláusula III.B - Bíblica, Inc. / Licencias), el texto protegido no se transmite a modelos de IA. El Mentor IA analizará el pasaje utilizando la referencia bíblica y el texto de dominio público.',
      };
    }

    return {
      reference: verseRef || '',
      text: verseText,
      wasSanitized: false,
    };
  }
}
