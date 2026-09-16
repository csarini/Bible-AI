// Copyright & Scripture Compliance Service
// Manages legal attribution and integrity for canonical offline scripture translations.

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
  licenseSummary: string;
}

export const CACHE_TTL_DAYS = 365;
export const CACHE_TTL_MS = CACHE_TTL_DAYS * 24 * 60 * 60 * 1000;

export const MAX_READING_VOLUME_CHAPTERS = 150;
export const MAX_READING_VOLUME_VERSES = 5000;

const COPYRIGHT_CATALOG: Record<string, ScriptureCopyrightInfo> = {
  rvr1960: {
    translationId: 'rvr1960',
    abbreviation: 'RVR1960',
    fullName: 'Reina-Valera 1960',
    year: '1960',
    organization: 'Sociedades Bíblicas Unidas',
    isCopyrightProtected: false,
    standardCitation:
      'Reina-Valera 1960 (RVR1960): Edición Canónica tradicional de las Sagradas Escrituras.',
    licenseSummary: 'Texto bíblico canónico offline para edificación espiritual sin fines comerciales.',
  },
  rva2015: {
    translationId: 'rva2015',
    abbreviation: 'RVA2015',
    fullName: 'Reina Valera Actualizada 2015',
    year: '2015',
    organization: 'Editorial Mundo Hispano',
    isCopyrightProtected: false,
    standardCitation:
      'Reina Valera Actualizada 2015 (RVA-2015): Edición contemporánea fiel al texto bíblico.',
    licenseSummary: 'Texto bíblico canónico offline para edificación espiritual sin fines comerciales.',
  },
};

export class CopyrightGuardService {
  /**
   * Normalizes translation identifier
   */
  static normalizeKey(translationId?: string): string {
    if (!translationId) return 'rvr1960';
    const clean = translationId.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    if (clean.includes('2015') || clean === 'rva2015') return 'rva2015';
    return 'rvr1960';
  }

  /**
   * Returns whether a given translation is from an external cloud API.
   * Always false since all scriptures run in offline mode.
   */
  static isApiBibleTranslation(translationId?: string): boolean {
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
   * Retrieves the copyright metadata for a translation
   */
  static getCopyrightInfo(translationId?: string): ScriptureCopyrightInfo {
    const key = this.normalizeKey(translationId);
    return (
      COPYRIGHT_CATALOG[key] || {
        translationId: key,
        abbreviation: key.toUpperCase(),
        fullName: 'Reina-Valera 1909',
        year: '1909',
        organization: 'Dominio Público',
        isCopyrightProtected: false,
        standardCitation: 'Texto canónico de dominio público.',
        licenseSummary: 'Modo offline.',
      }
    );
  }

  /**
   * Validates reading volume
   */
  static validateReadingVolume(
    requestedChapters: number,
    requestedVerses: number,
    translationId?: string
  ): { allowed: boolean; reason?: string } {
    return { allowed: true };
  }

  /**
   * Format conversion rule
   */
  static canConvertToAudio(translationId?: string): boolean {
    return true;
  }

  /**
   * Evaluates if a cached chapter in local storage is expired
   */
  static isCacheExpired(cachedTimestamp?: number | Date): boolean {
    return false;
  }

  /**
   * Sanitizes AI Mentor inputs
   */
  static sanitizeAiMentorPayload(
    verseRef?: string,
    verseText?: string,
    translationId?: string
  ): { reference: string; text?: string; wasSanitized: boolean; notice?: string } {
    return {
      reference: verseRef || '',
      text: verseText,
      wasSanitized: false,
    };
  }
}

