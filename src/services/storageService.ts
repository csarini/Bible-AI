import { LocalBookmark, HighlightColor, ReadingSettings, EventCategory, UserEvent } from '../types';

const BOOKMARKS_STORAGE_KEY = 'biblia_inteligente_bookmarks_v1';
const SETTINGS_STORAGE_KEY = 'biblia_inteligente_settings_v1';
const RECENT_SEARCHES_KEY = 'biblia_inteligente_recent_searches_v1';
const EVENT_CATEGORIES_KEY = 'biblia_inteligente_categories_v1';
const USER_EVENTS_KEY = 'biblia_inteligente_events_v1';

export const INITIAL_EVENT_CATEGORIES: EventCategory[] = [
  {
    id: 'cat_predica',
    name: 'Prédica Dominical',
    iconName: 'Mic',
    colorHex: '#0B2B68',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'cat_matrimonios',
    name: 'Reunión de Matrimonios',
    iconName: 'HeartHandshake',
    colorHex: '#F47B20',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'cat_devocional',
    name: 'Devocional Personal',
    iconName: 'BookOpen',
    colorHex: '#00A3E0',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'cat_estudio',
    name: 'Estudio Bíblico & Grupo Pequeño',
    iconName: 'Users',
    colorHex: '#059669',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'cat_oracion',
    name: 'Vigilia & Oración',
    iconName: 'Flame',
    colorHex: '#7C3AED',
    isDefault: true,
    createdAt: new Date().toISOString()
  }
];

export const DEFAULT_CHURCH_LOCATION = 'Almte. Guillermo Brown 1285, J5400 Rivadavia, San Juan';
export const DEFAULT_CHURCH_COORDINATES = {
  lat: -31.514918685940362,
  lng: -68.57393324759724
};

export function getMapsUrlForLocation(location?: string): string {
  if (!location) {
    return `https://www.google.com/maps/search/?api=1&query=${DEFAULT_CHURCH_COORDINATES.lat},${DEFAULT_CHURCH_COORDINATES.lng}`;
  }
  const clean = location.trim();
  if (
    clean.includes('Almte. Guillermo Brown') ||
    clean.includes('Brown 1285') ||
    clean.includes('Santuario Principal') ||
    clean.includes('Salón Principal') ||
    clean.includes('Rivadavia, San Juan') ||
    clean.includes('Salon Principal')
  ) {
    return `https://www.google.com/maps/search/?api=1&query=${DEFAULT_CHURCH_COORDINATES.lat},${DEFAULT_CHURCH_COORDINATES.lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clean)}`;
}

export const INITIAL_USER_EVENTS: UserEvent[] = [
  {
    id: 'evt_1',
    categoryId: 'cat_predica',
    title: 'Caminando sobre las Aguas: La Fe frente a la Tormenta',
    description: 'Puntos clave del sermón:\n1. Mirar a Cristo y no al oleaje.\n2. La duda surge cuando nos enfocamos en el viento.\n3. Su mano siempre está extendida para levantarnos cuando clamamos.',
    linkedVerses: ['Mateo 14:28-31', 'Pedro 1:7'],
    eventDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    tags: ['Fe', 'Confianza', 'Sermón'],
    location: DEFAULT_CHURCH_LOCATION,
    startTime: '10:00',
    endTime: '12:30',
    imageUrl: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&auto=format&fit=crop&q=80',
    price: 'Entrada Libre'
  },
  {
    id: 'evt_2',
    categoryId: 'cat_matrimonios',
    title: 'El Cordón de Tres Dobleces en el Hogar',
    description: 'Reflexión para parejas sobre la paciencia, la comunicación sabia y poner a Cristo en el centro de las decisiones familiares cotidianas.',
    linkedVerses: ['Eclesiastés 4:12', '1 Corintios 13:4-7', 'Efesios 5:21'],
    eventDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    tags: ['Matrimonio', 'Familia', 'Pacto'],
    location: DEFAULT_CHURCH_LOCATION,
    startTime: '18:30',
    endTime: '20:30',
    imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80',
    price: 'Gratuito'
  },
  {
    id: 'evt_3',
    categoryId: 'cat_devocional',
    title: 'Renovando las Fuerzas en el Secreto',
    description: 'Tiempo a solas meditando en la fidelidad del Señor en tiempos de transición y cansancio físico.',
    linkedVerses: ['Isaías 40:29-31', 'Salmos 23:1-3'],
    eventDate: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    tags: ['Devocional', 'Renovación', 'Paz'],
    location: 'Aposento Personal / Online',
    startTime: '06:00',
    endTime: '07:00'
  }
];

export const INITIAL_BOOKMARKS: LocalBookmark[] = [
  {
    id: 'bm-juan-3-16',
    book_name: 'Juan',
    book_id: 'JHN',
    chapter: 3,
    verse: 16,
    text: 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.',
    color_hex: '#FFF2B2',
    custom_title: 'Promesa de Amor Eterno',
    personal_note: 'Recordatorio personal sobre la incondicionalidad en tiempos de duda.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    tags: ['Amor', 'Salvación', 'Promesa']
  },
  {
    id: 'bm-juan-14-27',
    book_name: 'Juan',
    book_id: 'JHN',
    chapter: 14,
    verse: 27,
    text: 'La paz os dejo, mi paz os doy; yo no os la doy como el mundo la da. No se turbe vuestro corazón, ni tenga miedo.',
    color_hex: '#D3E7FF',
    custom_title: 'Paz en la Tormenta',
    personal_note: 'Leer esto antes de las reuniones importantes o momentos de ansiedad.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    tags: ['Paz', 'Tranquilidad', 'Confianza']
  },
  {
    id: 'bm-isaias-40-31',
    book_name: 'Isaías',
    book_id: 'ISA',
    chapter: 40,
    verse: 31,
    text: 'Pero los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas; correrán, y no se cansarán; caminarán, y no se fatigarán.',
    color_hex: '#D2F5D7',
    custom_title: 'Renovación de Fuerzas',
    personal_note: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),
    tags: ['Fortaleza', 'Esperanza']
  }
];

export const StorageService = {
  getBookmarks(): LocalBookmark[] {
    try {
      const data = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
      if (!data) {
        // Initialize with default bookmarks
        localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(INITIAL_BOOKMARKS));
        return INITIAL_BOOKMARKS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Error loading bookmarks from storage:', e);
      return INITIAL_BOOKMARKS;
    }
  },

  saveBookmark(bookmark: Omit<LocalBookmark, 'id' | 'created_at'> & { id?: string }): LocalBookmark {
    const current = this.getBookmarks();
    const newBookmark: LocalBookmark = {
      id: bookmark.id || `bm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      book_name: bookmark.book_name,
      book_id: bookmark.book_id,
      chapter: bookmark.chapter,
      verse: bookmark.verse,
      verse_end: bookmark.verse_end,
      text: bookmark.text,
      color_hex: bookmark.color_hex,
      custom_title: bookmark.custom_title,
      personal_note: bookmark.personal_note || null,
      created_at: new Date().toISOString(),
      tags: bookmark.tags || [],
      translation: bookmark.translation || 'RVR1960'
    };

    // Replace if exists, or append to top
    const existingIndex = current.findIndex(b => b.id === newBookmark.id);
    let updated: LocalBookmark[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = newBookmark;
    } else {
      updated = [newBookmark, ...current];
    }

    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(updated));
    return newBookmark;
  },

  deleteBookmark(id: string): boolean {
    const current = this.getBookmarks();
    const filtered = current.filter(b => b.id !== id);
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },

  updateBookmark(id: string, updates: Partial<LocalBookmark>): LocalBookmark | null {
    const current = this.getBookmarks();
    const index = current.findIndex(b => b.id === id);
    if (index === -1) return null;

    current[index] = { ...current[index], ...updates };
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(current));
    return current[index];
  },

  getBookmarkForVerse(bookName: string, chapter: number, verse: number): LocalBookmark | undefined {
    const current = this.getBookmarks();
    return current.find(b => b.book_name.toLowerCase() === bookName.toLowerCase() && b.chapter === chapter && b.verse === verse);
  },

  getSettings(): ReadingSettings {
    const defaultSettings: ReadingSettings = {
      fontSize: 'medium',
      fontFamily: 'Literata',
      lineHeight: 'relaxed',
      translation: 'rvr1960',
      themeMode: 'light',
      showVerseNumbers: true
    };
    try {
      const data = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!data) return defaultSettings;
      const parsed = JSON.parse(data);
      // Migrate legacy translation identifiers if needed
      let trans = parsed.translation;
      if (
        !trans ||
        trans === 'valera' ||
        trans === 'RVR1909' ||
        trans === 'SSE' ||
        trans === 'sse' ||
        trans === 'rv1858' ||
        trans === 'rvr09' ||
        trans === 'kjv'
      ) {
        trans = 'rvr1960';
      } else if (trans === 'RVR1960') {
        trans = 'rvr1960';
      } else if (trans === 'RVA2015') {
        trans = 'rva2015';
      }
      return { ...defaultSettings, ...parsed, translation: trans || 'rvr1960' };
    } catch {
      return defaultSettings;
    }
  },

  saveSettings(settings: ReadingSettings): void {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings:', e);
    }
  },

  getRecentSearches(): string[] {
    const defaults = ['Juan 3:16', 'Salmos 23:1', 'Romanos 8:28', 'Filipenses 4:13', 'Mateo 5:1', 'Génesis 1:1'];
    try {
      const data = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (!data) return defaults;
      return JSON.parse(data);
    } catch {
      return defaults;
    }
  },

  addRecentSearch(term: string): string[] {
    if (!term || !term.trim()) return this.getRecentSearches();
    const current = this.getRecentSearches().filter(s => s.toLowerCase() !== term.toLowerCase());
    const updated = [term.trim(), ...current].slice(0, 8);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {}
    return updated;
  },

  getApiUrl(): string {
    return localStorage.getItem('santuario_api_url') || '';
  },

  saveApiUrl(url: string): void {
    localStorage.setItem('santuario_api_url', url.trim());
  },

  getGeminiApiKey(): string {
    return localStorage.getItem('santuario_gemini_key') || 'AQ.Ab8RN6I_vopKgtr88G9_2H0StDa0yjJIJNP6I9YRUl43AelVfQ';
  },

  saveGeminiApiKey(key: string): void {
    localStorage.setItem('santuario_gemini_key', key.trim());
  },

  // ==========================================
  // EVENT CATEGORIES CRUD
  // ==========================================
  getCategories(): EventCategory[] {
    try {
      const data = localStorage.getItem(EVENT_CATEGORIES_KEY);
      if (!data) {
        localStorage.setItem(EVENT_CATEGORIES_KEY, JSON.stringify(INITIAL_EVENT_CATEGORIES));
        return INITIAL_EVENT_CATEGORIES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_EVENT_CATEGORIES;
    }
  },

  saveCategory(cat: Omit<EventCategory, 'id' | 'createdAt'> & { id?: string }): EventCategory {
    const current = this.getCategories();
    const newCat: EventCategory = {
      id: cat.id || `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: cat.name,
      iconName: cat.iconName || 'BookOpen',
      colorHex: cat.colorHex || '#0B2B68',
      isDefault: cat.isDefault ?? false,
      createdAt: new Date().toISOString()
    };

    const existingIndex = current.findIndex(c => c.id === newCat.id);
    let updated: EventCategory[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = newCat;
    } else {
      updated = [...current, newCat];
    }

    localStorage.setItem(EVENT_CATEGORIES_KEY, JSON.stringify(updated));
    return newCat;
  },

  deleteCategory(id: string): boolean {
    const current = this.getCategories();
    const filtered = current.filter(c => c.id !== id);
    localStorage.setItem(EVENT_CATEGORIES_KEY, JSON.stringify(filtered));
    return true;
  },

  // ==========================================
  // USER EVENTS / DEVOCIONALES CRUD
  // ==========================================
  getEvents(): UserEvent[] {
    try {
      const data = localStorage.getItem(USER_EVENTS_KEY);
      if (!data) {
        localStorage.setItem(USER_EVENTS_KEY, JSON.stringify(INITIAL_USER_EVENTS));
        return INITIAL_USER_EVENTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_USER_EVENTS;
    }
  },

  getEventsByCategory(categoryId: string): UserEvent[] {
    const all = this.getEvents();
    if (!categoryId || categoryId === 'ALL') return all;
    return all.filter(e => e.categoryId === categoryId);
  },

  saveEvent(event: Omit<UserEvent, 'id' | 'createdAt'> & { id?: string }): UserEvent {
    const current = this.getEvents();
    const newEvent: UserEvent = {
      id: event.id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      categoryId: event.categoryId,
      title: event.title,
      description: event.description,
      linkedVerses: event.linkedVerses || [],
      eventDate: event.eventDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      tags: event.tags || [],
      location: event.location?.trim() || undefined,
      startTime: event.startTime?.trim() || undefined,
      endTime: event.endTime?.trim() || undefined,
      imageUrl: event.imageUrl?.trim() || undefined,
      price: event.price?.trim() || undefined
    };

    const existingIndex = current.findIndex(e => e.id === newEvent.id);
    let updated: UserEvent[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = newEvent;
    } else {
      updated = [newEvent, ...current];
    }

    localStorage.setItem(USER_EVENTS_KEY, JSON.stringify(updated));
    return newEvent;
  },

  deleteEvent(id: string): boolean {
    const current = this.getEvents();
    const filtered = current.filter(e => e.id !== id);
    localStorage.setItem(USER_EVENTS_KEY, JSON.stringify(filtered));
    return true;
  },

  // ==========================================
  // BACKUP & DATA MIGRATION (EXPORT / IMPORT)
  // ==========================================
  exportBackupData(): string {
    const backup = {
      app: 'Biblia Inteligente (Digital Sanctuary)',
      version: '1.2.0',
      exportedAt: new Date().toISOString(),
      bookmarks: this.getBookmarks(),
      categories: this.getCategories(),
      events: this.getEvents(),
      settings: this.getSettings(),
      recentSearches: this.getRecentSearches()
    };
    return JSON.stringify(backup, null, 2);
  },

  importBackupData(jsonString: string): { success: boolean; message: string; count?: { bookmarks: number; events: number; categories: number } } {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') {
        return { success: false, message: 'El archivo no contiene un formato JSON válido.' };
      }

      let bookmarksImported = 0;
      let eventsImported = 0;
      let categoriesImported = 0;

      if (Array.isArray(data.bookmarks)) {
        localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(data.bookmarks));
        bookmarksImported = data.bookmarks.length;
      }

      if (Array.isArray(data.categories)) {
        localStorage.setItem(EVENT_CATEGORIES_KEY, JSON.stringify(data.categories));
        categoriesImported = data.categories.length;
      }

      if (Array.isArray(data.events)) {
        localStorage.setItem(USER_EVENTS_KEY, JSON.stringify(data.events));
        eventsImported = data.events.length;
      }

      if (data.settings && typeof data.settings === 'object') {
        this.saveSettings(data.settings);
      }

      if (Array.isArray(data.recentSearches)) {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(data.recentSearches));
      }

      return {
        success: true,
        message: 'Copia de seguridad restaurada correctamente.',
        count: {
          bookmarks: bookmarksImported,
          events: eventsImported,
          categories: categoriesImported
        }
      };
    } catch (err: any) {
      console.error('Error importing backup:', err);
      return { success: false, message: err?.message || 'Error al procesar el archivo de respaldo.' };
    }
  }
};
