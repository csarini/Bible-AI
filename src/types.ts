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


export interface ReadingSettings {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  fontFamily: 'Literata' | 'Playfair' | 'Inter';
  lineHeight: 'normal' | 'relaxed' | 'spacious';
  translation: 'RVR1909' | 'RVR1960' | 'NVI' | 'NTV' | 'LBLA';
  themeMode: 'light' | 'sepia' | 'dark';
  showVerseNumbers: boolean;
}
