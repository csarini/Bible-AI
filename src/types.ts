export type HighlightColor = '#FFF2B2' | '#D2F5D7' | '#D3E7FF';

export interface BibleBook {
  id: string; // e.g. "GEN", "MAT", "JHN"
  number: number; // 1 to 66
  name: string; // "Génesis", "Mateo"
  englishName: string;
  testament: 'OT' | 'NT'; // Antiguo o Nuevo Testamento
  chaptersCount: number;
  abbreviation: string;
  category: 'Pentateuco' | 'Históricos' | 'Poéticos' | 'Profetas Mayores' | 'Profetas Menores' | 'Evangelios' | 'Historia' | 'Epístolas Paulinas' | 'Epístolas Generales' | 'Profecía';
}

export interface BibleVerse {
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface BibleChapterData {
  bookId: string;
  bookName: string;
  chapter: number;
  verses: BibleVerse[];
  translation: string;
}

export interface LocalBookmark {
  id: string;
  book_name: string;
  book_id: string;
  chapter: number;
  verse: number;
  verse_end?: number;
  text: string;
  color_hex: HighlightColor;
  custom_title: string;
  personal_note?: string | null;
  created_at: string; // ISO date string
  tags?: string[];
  translation?: string;
}

export interface DailyVerse {
  id: string;
  reference: string;
  book: string;
  bookId: string;
  chapter: number;
  verse: number;
  verseEnd?: number;
  text: string;
  theme: string;
  reflection: string;
  prayer: string;
  date?: string;
  tags?: string[];
}

export interface EventCategory {
  id: string;
  name: string;
  iconName: string;
  colorHex: string;
  isDefault?: boolean;
  createdAt: string;
}

export interface UserEvent {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  linkedVerses: string[];
  eventDate: string; // ISO date or YYYY-MM-DD
  createdAt: string;
  tags?: string[];
  location?: string;
  startTime?: string;
  endTime?: string;
  imageUrl?: string;
  price?: string;
}

export type ActiveTab = 'home' | 'scripture' | 'library' | 'maps' | 'ai-mentor' | 'saved' | 'widgets' | 'devotional' | 'events';

export interface MapWaypoint {
  id: string;
  order: number;
  name: string;
  ancientName?: string;
  modernName: string;
  region: string;
  coordinates: [number, number]; // [lat, lng]
  scriptureReference: string;
  scriptureExcerpt: string;
  bookId: string;
  chapter: number;
  verse: number;
  historicalContext: string;
  archaeologicalEvidence: string;
  spiritualLesson: string;
  category: 'city' | 'mountain' | 'sea_crossing' | 'desert_oasis' | 'altar' | 'island' | 'sanctuary';
  estimatedDaysStay?: string;
  elevationMeters?: number;
}

export interface BiblicalItinerary {
  id: string;
  title: string;
  subtitle: string;
  period: 'Antiguo Testamento' | 'Evangelios' | 'Hechos y Epístolas' | 'Profecía';
  approxDate: string;
  totalDistanceKm: number;
  description: string;
  historicalOverview: string;
  themeColor: string;
  badge: string;
  keyScriptures: { bookId: string; chapter: number; label: string }[];
  waypoints: MapWaypoint[];
}


export type BibleTranslationAbbr = 'valera' | 'nvi' | 'nbla' | 'bes' | 'vbl' | 'pddpt' | 'bsb' | string;

export interface BibleTranslationOption {
  translation: string;
  abbreviation: BibleTranslationAbbr;
  name: string;
  subtitle: string;
  badge?: string;
  source?: 'offline' | 'api_bible';
  bibleId?: string;
  isOffline?: boolean;
}

export const OFFICIAL_TRANSLATIONS: BibleTranslationOption[] = [
  {
    translation: 'Reina Valera (1909)',
    abbreviation: 'valera',
    name: 'Reina Valera (1909)',
    subtitle: 'Reina Valera 1909 (Edición Clásica / Valera)',
    badge: 'Base Offline',
    source: 'offline',
    isOffline: true,
  },
  {
    translation: 'Nueva Versión Internacional (NVI)',
    abbreviation: 'nvi',
    name: 'Nueva Versión Internacional (NVI)',
    subtitle: 'Traducción contemporánea de gran difusión — Biblica',
    badge: 'API.Bible / NVI',
    source: 'api_bible',
    bibleId: 'nvi',
    isOffline: false,
  },
  {
    translation: 'Nueva Biblia de las Américas (NBLA)',
    abbreviation: 'nbla',
    name: 'Nueva Biblia de las Américas (NBLA)',
    subtitle: 'Traducción fiel y contemporánea en español latinoamericano',
    badge: 'API.Bible / NBLA',
    source: 'api_bible',
    bibleId: 'ce11b813f9a27e20-01',
    isOffline: false,
  },
  {
    translation: 'La Biblia en Español Sencillo (BES)',
    abbreviation: 'bes',
    name: 'La Biblia en Español Sencillo (BES)',
    subtitle: 'Lenguaje claro, directo y accesible para todos',
    badge: 'API.Bible / BES',
    source: 'api_bible',
    bibleId: 'b32b9d1b64b4ef29-01',
    isOffline: false,
  },
  {
    translation: 'Versión Biblia Libre (VBL)',
    abbreviation: 'vbl',
    name: 'Versión Biblia Libre (VBL)',
    subtitle: 'Traducción contemporánea protestante abierta (AT y NT)',
    badge: 'API.Bible / VBL',
    source: 'api_bible',
    bibleId: '482ddd53705278cc-02',
    isOffline: false,
  },
  {
    translation: 'Palabra de Dios para ti (PdDpt)',
    abbreviation: 'pddpt',
    name: 'Palabra de Dios para ti (PdDpt)',
    subtitle: 'Traducción hispana contemporánea completa',
    badge: 'API.Bible / PdDpt',
    source: 'api_bible',
    bibleId: '48acedcf8595c754-01',
    isOffline: false,
  },
  {
    translation: 'Berean Standard Bible (BSB)',
    abbreviation: 'bsb',
    name: 'Berean Standard Bible (BSB)',
    subtitle: 'Traducción de estudio moderno en inglés — API.Bible',
    badge: 'API.Bible / BSB',
    source: 'api_bible',
    bibleId: 'bba9f40183526463-01',
    isOffline: false,
  },
];

export type ThemeMode = 'light' | 'sepia' | 'dark';

export interface ReadingSettings {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  fontFamily: 'Literata' | 'Playfair' | 'Inter';
  lineHeight: 'normal' | 'relaxed' | 'spacious';
  translation: 'valera' | string;
  themeMode: ThemeMode;
  showVerseNumbers: boolean;
}

