import { UserRole } from './features/auth/types';

export type HighlightColor = '#FFF2B2' | '#D2F5D7' | '#D3E7FF';

export interface BibleBook {
  id: string; // e.g. "GEN", "MAT", "JHN"
  number: number; // 1 to 66
  name: string; // "Génesis", "Mateo"
  englishName: string;
  testament: 'OT' | 'NT'; // Antiguo o Nuevo Testamento
  chaptersCount: number;
  totalChapters?: number;
  totalVerses?: number;
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
  totalVerses?: number;
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

export type ActiveTab =
  | 'home'
  | 'scripture'
  | 'library'
  | 'maps'
  | 'ai-mentor'
  | 'saved'
  | 'widgets'
  | 'devotional'
  | 'events'
  | 'admin-hub'
  | 'admin-sermons'
  | 'admin-memberships'
  | 'admin-food-court'
  | 'admin-events'
  | 'admin-announcements'
  | 'admin-hierarchy'
  | 'admin-security'
  | 'pulpit-mode';

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

export type BibleTranslationAbbr = 'rvr1960' | 'rva2015' | string;

export interface BibleTranslationOption {
  translation: string;
  abbreviation: BibleTranslationAbbr;
  name: string;
  subtitle: string;
  badge?: string;
  source?: 'offline';
  isOffline?: boolean;
}

export const OFFICIAL_TRANSLATIONS: BibleTranslationOption[] = [
  {
    translation: 'Biblia Reina Valera 1960',
    abbreviation: 'rvr1960',
    name: 'Reina-Valera 1960',
    subtitle: 'Edición Canónica RVR1960 (Texto Tradicional)',
    badge: 'Offline Canónico',
    source: 'offline',
    isOffline: true,
  },
  {
    translation: 'Reina Valera Actualizada (2015)',
    abbreviation: 'rva2015',
    name: 'Reina Valera 2015',
    subtitle: 'Edición Canónica RVA-2015 (Claridad Contemporánea)',
    badge: 'Offline Canónico',
    source: 'offline',
    isOffline: true,
  },
  {
    translation: 'Reina Valera 1909',
    abbreviation: 'valera',
    name: 'Reina-Valera 1909',
    subtitle: 'Edición Histórica Valera 1909 (Texto Clásico)',
    badge: 'Offline Canónico',
    source: 'offline',
    isOffline: true,
  },
];

export type ThemeMode = 'light' | 'sepia' | 'dark';

export interface ReadingSettings {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  fontFamily: 'Literata' | 'Playfair' | 'Inter';
  lineHeight: 'normal' | 'relaxed' | 'spacious';
  translation: 'rvr1960' | 'rva2015' | 'valera' | string;
  themeMode: ThemeMode;
  showVerseNumbers: boolean;
}

// ----------------------------------------------------
// Admin Hub & Church Hierarchy Models (MVP 2)
// ----------------------------------------------------

export interface ChurchJoinRequest {
  id: string;
  churchId: string;
  churchName: string;
  annexId?: string;
  annexName?: string;
  fullName: string;
  email: string;
  phone?: string;
  requestedRole: UserRole;
  assignedRole?: UserRole;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface FoodCourtItem {
  id: string;
  churchId: string;
  name: string;
  description: string;
  category: 'meals' | 'beverages' | 'snacks' | 'combos';
  price: number;
  shift: 'day' | 'night' | 'both';
  isAvailable: boolean;
  imageUrl?: string;
  prepTimeMinutes?: number;
  tags?: string[];
}

// ----------------------------------------------------
// Church Hierarchy & Organization Models (Templo Principal, Sedes, Anexos, Células)
// ----------------------------------------------------

export type HierarchyScopeType = 'general' | 'sede' | 'anexo' | 'celula';

export interface ChurchOrganizationConfig {
  id: string;
  name: string; // Templo Principal / Iglesia Central (ej. "Iglesia Cristiana El-Shaddai")
  denomination?: string; // ej. "Evangélica Pentecostal / Alianza Misionera"
  mainPastor: string; // ej. "Pastor David Ben-David & Pastora Sara Ben-David"
  headquartersAddress: string; // ej. "Av. La Paz 1420, Sede Central"
  headquartersCity?: string;
  headquartersPhone?: string; // ej. "+51 987 654 321"
  headquartersEmail?: string; // ej. "contacto@elshaddai.org"
  visionStatement?: string;
  logoUrl?: string;
  foundedYear?: string;
  updatedAt: string;
}

export interface ChurchSede {
  id: string;
  name: string; // ej. "Templo Principal - Sede Central", "Sede Norte - Campus Esperanza"
  city: string;
  address: string;
  pastorInCharge: string;
  phone?: string;
  isMainCampus: boolean; // true si es la Sede / Templo Principal
  activeMembersCount?: number;
  notes?: string;
}

export interface ChurchAnexo {
  id: string;
  sedeId: string; // Sede a la que pertenece
  sedeName?: string;
  name: string; // ej. "Anexo Sector San Pedro", "Anexo Los Olivos de Paz"
  address: string;
  leaderInCharge: string;
  phone?: string;
  meetingDays?: string; // ej. "Jueves 19:30 & Domingos 09:30"
  activeMembersCount?: number;
}

export interface ChurchCelula {
  id: string;
  sedeId: string;
  anexoId?: string; // Opcional, si pertenece a un anexo
  sedeName?: string;
  anexoName?: string;
  code: string; // ej. "CEL-C01", "CEL-N02"
  name: string; // ej. "Célula Betel - Familias en Victoria"
  leaderName: string; // Líder celular
  hostName: string; // Anfitrión del hogar
  address: string; // Dirección del hogar donde se reúnen
  neighborhood?: string; // Barrio o sector
  dayOfWeek: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';
  meetingTime: string; // ej. "19:30"
  membersCount: number;
  targetAudience: 'Familias' | 'Jóvenes' | 'Mujeres' | 'Varones' | 'Mixto';
  status: 'active' | 'in_formation' | 'paused';
}

export interface HierarchyScopeOption {
  id: string; // ej. "general", "sede:sede_norte", "anexo:anexo_01", "celula:cel_01"
  scope: HierarchyScopeType;
  targetId?: string;
  label: string;
  badge: string;
  badgeColor: string;
  details?: string;
}

export interface ChurchAdminEvent {
  id: string;
  churchId: string;
  scope?: HierarchyScopeType; // 'general' | 'sede' | 'anexo' | 'celula'
  scopeTargetId?: string;     // ID de la sede, anexo o célula asignada
  scopeName?: string;         // Nombre legible: "Toda la Iglesia", "Sede Norte", "Célula Betel"
  annexId?: string;
  annexName?: string;
  title: string;
  description: string;
  speaker: string;
  eventDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;
  location: string;
  hasFoodService: boolean; // 🍔 Servicio de Comida
  hasChildcare: boolean;   // 👶 Cuidado Infantil
  hasBookSales: boolean;   // 📚 Venta de Libros & Recursos
  maxCapacity?: number;
  registeredCount?: number;
  status: 'draft' | 'published' | 'completed' | 'cancelled';
  bannerUrl?: string;
  linkedPassage?: string;
}

export interface AnnouncementBroadcast {
  id: string;
  churchId: string;
  scope?: HierarchyScopeType;
  scopeTargetId?: string;
  scopeName?: string;
  annexId?: string;
  targetTopic: 'church_all' | string;
  topicLabel: string;
  title: string;
  body: string;
  priority: 'normal' | 'high';
  deepLink?: string;
  sentAt: string;
  sentBy: string;
  deliveredCount: number;
  status: 'sent' | 'scheduled' | 'failed';
}

export interface SermonPoint {
  id: string;
  title: string;
  notes: string;
  scriptureRef?: string;
  passageText?: string;
}

export interface SermonNote {
  id: string;
  churchId?: string;
  scope?: HierarchyScopeType; // 'general' | 'sede' | 'anexo' | 'celula'
  scopeTargetId?: string;
  scopeName?: string;
  title: string;
  speaker: string;
  mainScripture: string;
  theme: string;
  date: string;
  targetDurationMinutes: number;
  points: SermonPoint[];
  conclusion: string;
}
