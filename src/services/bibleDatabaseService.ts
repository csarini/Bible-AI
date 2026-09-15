// Bible Database Service (IndexedDB + Background Verses Downloader)
// Reads the 3 official translation book files at app startup, stores in local DB,
// and queries books and genuine verses from the GetBible API and local DB.

import booksValeraRaw from '../data/raw/books_valera.json';
import translationsCatalogRaw from '../data/raw/translations_catalog.json';
import { BibleVerse, BibleBook } from '../types';

export const DB_NAME = 'biblia_inteligente_offline_db';
export const DB_VERSION = 3;

export const STORE_BOOKS = 'bible_books';
export const STORE_TRANSLATIONS = 'bible_translations';
export const STORE_CHAPTERS = 'bible_chapters';
export const STORE_META = 'offline_metadata';

// Raw Book Entry interface matching schema in /src/data/raw/*.json
export interface RawBookData {
  translation: string;
  abbreviation: string;
  lang: string;
  language: string;
  direction: string;
  encoding: string;
  nr: number;
  name: string;
  url: string;
  sha: string;
}

// Canonical chapter counts and IDs for standard 66 Biblical books
const BOOK_CHAPTERS_COUNT: number[] = [
  50, 40, 27, 36, 34, 24, 21, 4, 31, 24,
  22, 25, 29, 36, 10, 13, 10, 42, 150, 31,
  12, 8, 66, 52, 5, 48, 12, 14, 3, 9,
  1, 4, 7, 3, 3, 3, 2, 14, 4, 28,
  16, 24, 21, 28, 16, 16, 13, 6, 6, 4,
  4, 5, 3, 6, 4, 3, 1, 13, 5, 5,
  3, 5, 1, 1, 1, 22
];

const BOOK_USFM_CODES: string[] = [
  'GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA',
  '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO',
  'ECC', 'SNG', 'ISA', 'JER', 'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO',
  'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL', 'MAT',
  'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHP',
  'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS', '1PE',
  '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV'
];

function getCategoryByBookNumber(nr: number): BibleBook['category'] {
  if (nr <= 5) return 'Pentateuco';
  if (nr <= 17) return 'Históricos';
  if (nr <= 22) return 'Poéticos';
  if (nr <= 27) return 'Profetas Mayores';
  if (nr <= 39) return 'Profetas Menores';
  if (nr <= 43) return 'Evangelios';
  if (nr === 44) return 'Historia';
  if (nr <= 57) return 'Epístolas Paulinas';
  if (nr <= 65) return 'Epístolas Generales';
  return 'Profecía';
}

export interface StoredBibleBook extends BibleBook {
  translation: string;
  url?: string;
  sha?: string;
}

let dbPromise: Promise<IDBDatabase> | null = null;
let cachedBooksByTranslation: Record<string, StoredBibleBook[]> = {};
let isDatabaseReady = false;

// Check if translation is one of the built-in offline ones
export function isBuiltInOfflineTranslation(tr?: string): boolean {
  if (!tr) return true;
  const clean = tr.toLowerCase().replace(/[^a-z0-9]/g, '');
  return clean === 'valera' || clean.includes('1909');
}

// Normalize translation code (valera, nvi, nbla, bes, vbl, pddpt, bsb)
export function normalizeTranslationKey(tr?: string): string {
  if (!tr) return 'valera';
  const clean = tr.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (clean.includes('1960') || clean === 'rvr1960') return 'nvi';
  if (clean === 'nvi') return 'nvi';
  if (clean === 'nbla') return 'nbla';
  if (clean === 'bes') return 'bes';
  if (clean === 'vbl') return 'vbl';
  if (clean === 'pddpt') return 'pddpt';
  if (clean === 'bsb') return 'bsb';
  if (clean.includes('valera') || clean.includes('1909')) return 'valera';
  return clean || 'valera';
}

// Convert raw JSON entry from data/raw/ to full StoredBibleBook
function transformRawBook(raw: RawBookData | any, defaultAbbr: string): StoredBibleBook {
  const nr = Number(raw.nr);
  const idx = nr - 1;
  const bookId = BOOK_USFM_CODES[idx] || `BK${nr}`;
  const chaptersCount = BOOK_CHAPTERS_COUNT[idx] || 1;
  const abbreviation = raw.name ? raw.name.slice(0, 3) : bookId;
  const category = getCategoryByBookNumber(nr);

  return {
    id: bookId,
    number: nr,
    name: raw.name,
    englishName: raw.name,
    testament: nr <= 39 ? 'OT' : 'NT',
    chaptersCount,
    abbreviation,
    category,
    translation: raw.abbreviation || defaultAbbr,
    url: raw.url,
    sha: raw.sha
  };
}

// Build in-memory books list from the valera file for instant sync rendering
function buildMemoryBookLists(): Record<string, StoredBibleBook[]> {
  const valeraList: StoredBibleBook[] = Object.values(booksValeraRaw).map(b => transformRawBook(b, 'valera'));

  return {
    valera: valeraList.sort((a, b) => a.number - b.number)
  };
}

cachedBooksByTranslation = buildMemoryBookLists();

// Open or create the IndexedDB database
export function getBibleDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Store 1: bible_books
      if (!db.objectStoreNames.contains(STORE_BOOKS)) {
        const booksStore = db.createObjectStore(STORE_BOOKS, { keyPath: 'storeId' });
        booksStore.createIndex('translation', 'translation', { unique: false });
        booksStore.createIndex('number', 'number', { unique: false });
        booksStore.createIndex('bookId', 'id', { unique: false });
      }

      // Store 2: bible_translations
      if (!db.objectStoreNames.contains(STORE_TRANSLATIONS)) {
        db.createObjectStore(STORE_TRANSLATIONS, { keyPath: 'abbreviation' });
      }

      // Store 3: bible_chapters (verses storage)
      if (!db.objectStoreNames.contains(STORE_CHAPTERS)) {
        const chaptersStore = db.createObjectStore(STORE_CHAPTERS, { keyPath: 'id' });
        chaptersStore.createIndex('translation', 'translation', { unique: false });
        chaptersStore.createIndex('bookId', 'bookId', { unique: false });
      }

      // Store 4: offline_metadata
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });

  return dbPromise;
}

// Verify that stored verses are genuine and not dummy placeholder text
export function isGenuineVerses(verses: BibleVerse[] | null | undefined): boolean {
  if (!verses || !Array.isArray(verses) || verses.length === 0) return false;
  const first = verses[0]?.text || '';
  if (first.includes('«La palabra del Señor permanece para siempre') || first.includes('capítulo 1, versículo 1.')) {
    return false;
  }
  return true;
}

// Purge any legacy dummy verses from IndexedDB
async function purgeDummyVersesFromDB(): Promise<void> {
  try {
    const db = await getBibleDB();
    const tx = db.transaction(STORE_CHAPTERS, 'readwrite');
    const store = tx.objectStore(STORE_CHAPTERS);
    const req = store.openCursor();

    req.onsuccess = (e) => {
      const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        const item = cursor.value;
        if (!isGenuineVerses(item?.verses)) {
          cursor.delete();
        }
        cursor.continue();
      }
    };
  } catch (err) {
    console.warn('Error purgando versículos dummy:', err);
  }
}

// Initialize and seed the 3 Bible book files into local IndexedDB
export async function initBibleDatabase(): Promise<void> {
  try {
    const db = await getBibleDB();

    // Clean any old dummy verses
    await purgeDummyVersesFromDB();

    // Check if books are already seeded
    const isSeeded = await new Promise<boolean>((resolve) => {
      const tx = db.transaction([STORE_META, STORE_BOOKS], 'readonly');
      const metaStore = tx.objectStore(STORE_META);
      const req = metaStore.get('books_seeded_v3');
      req.onsuccess = () => {
        if (req.result && req.result.value === true) {
          resolve(true);
        } else {
          resolve(false);
        }
      };
      req.onerror = () => resolve(false);
    });

    if (!isSeeded) {
      console.log('📖 Inicializando libros y metadatos de las 3 versiones en IndexedDB local...');
      const tx = db.transaction([STORE_BOOKS, STORE_TRANSLATIONS, STORE_META], 'readwrite');
      const booksStore = tx.objectStore(STORE_BOOKS);
      const transStore = tx.objectStore(STORE_TRANSLATIONS);
      const metaStore = tx.objectStore(STORE_META);

      // 1. Insert translations catalog
      for (const [abbr, trans] of Object.entries(translationsCatalogRaw)) {
        transStore.put({ ...trans, abbreviation: abbr });
      }

      // 2. Insert books from the built-in Valera file
      const allBooks = [
        ...cachedBooksByTranslation.valera
      ];

      for (const book of allBooks) {
        booksStore.put({
          ...book,
          storeId: `${book.translation}_${book.id}`
        });
      }

      // 3. Mark seeded
      metaStore.put({
        key: 'books_seeded_v3',
        value: true,
        seededAt: new Date().toISOString(),
        totalBooks: allBooks.length
      });

      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      console.log('✅ Base de datos de libros inicializada correctamente.');
    }

    // Refresh memory cache from DB to ensure synchronization
    await refreshBooksCacheFromDB();
    isDatabaseReady = true;
  } catch (err) {
    console.error('Error inicializando base de datos local de la Biblia:', err);
    isDatabaseReady = true;
  }
}

// Refresh in-memory cache from IndexedDB
async function refreshBooksCacheFromDB(): Promise<void> {
  try {
    const db = await getBibleDB();
    const tx = db.transaction(STORE_BOOKS, 'readonly');
    const store = tx.objectStore(STORE_BOOKS);
    const req = store.getAll();

    return new Promise((resolve) => {
      req.onsuccess = () => {
        const rows: (StoredBibleBook & { storeId: string })[] = req.result || [];
        if (rows.length > 0) {
          const valera: StoredBibleBook[] = [];

          for (const row of rows) {
            valera.push(row);
          }

          cachedBooksByTranslation = {
            valera: valera.sort((a, b) => a.number - b.number)
          };
        }
        resolve();
      };
      req.onerror = () => resolve();
    });
  } catch {
    // Keep fallback
  }
}

// Query books from local DB for the active translation
export async function getBooksFromDB(translation: string = 'valera'): Promise<StoredBibleBook[]> {
  const tr = normalizeTranslationKey(translation);
  try {
    const db = await getBibleDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_BOOKS, 'readonly');
      const store = tx.objectStore(STORE_BOOKS);
      const index = store.index('translation');
      const req = index.getAll(tr);

      req.onsuccess = () => {
        if (req.result && req.result.length > 0) {
          const list = req.result as StoredBibleBook[];
          resolve(list.sort((a, b) => a.number - b.number));
        } else {
          resolve(cachedBooksByTranslation[tr] || cachedBooksByTranslation.valera);
        }
      };
      req.onerror = () => resolve(cachedBooksByTranslation[tr] || cachedBooksByTranslation.valera);
    });
  } catch {
    return cachedBooksByTranslation[tr] || cachedBooksByTranslation.valera;
  }
}

// Synchronous helper to get books list (guarantees no UI flash)
export function getLocalBooksSync(translation: string = 'valera'): StoredBibleBook[] {
  const tr = normalizeTranslationKey(translation);
  return cachedBooksByTranslation[tr] || cachedBooksByTranslation.valera;
}

// Find a single book by ID ("MAT") or number (40)
export function getBookByIdOrNumber(bookIdOrNr: string | number, translation: string = 'valera'): StoredBibleBook {
  const books = getLocalBooksSync(translation);
  if (typeof bookIdOrNr === 'number') {
    return books.find(b => b.number === bookIdOrNr) || books[0];
  }
  const str = String(bookIdOrNr).toUpperCase();
  const num = Number(bookIdOrNr);
  if (!isNaN(num) && num > 0) {
    return books.find(b => b.number === num) || books[0];
  }
  return books.find(b => b.id === str) || books.find(b => b.name.toLowerCase() === str.toLowerCase()) || books[0];
}

// Retrieve chapter verses from local DB
export async function getChapterFromDB(
  bookId: string,
  chapter: number,
  translation: string = 'valera'
): Promise<BibleVerse[] | null> {
  try {
    const tr = normalizeTranslationKey(translation);
    const db = await getBibleDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_CHAPTERS, 'readonly');
      const store = tx.objectStore(STORE_CHAPTERS);
      const req = store.get(`${tr}_${bookId}_${chapter}`);
      req.onsuccess = () => {
        if (req.result && isGenuineVerses(req.result.verses)) {
          resolve(req.result.verses);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

// Save chapter verses into local DB
export async function saveChapterToDB(
  bookId: string,
  chapter: number,
  verses: BibleVerse[],
  translation: string = 'valera'
): Promise<void> {
  if (!isGenuineVerses(verses)) return;

  try {
    const tr = normalizeTranslationKey(translation);
    const db = await getBibleDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CHAPTERS, 'readwrite');
      const store = tx.objectStore(STORE_CHAPTERS);
      const now = Date.now();
      const item = {
        id: `${tr}_${bookId}_${chapter}`,
        translation: tr,
        bookId,
        chapter,
        verses,
        updatedAt: now,
        cachedAt: now
      };
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Error guardando capítulo en DB local:', err);
  }
}

// Direct fetch from GetBible API (using book URL and chapter URL)
async function fetchFromGetBibleAPI(
  bookMeta: StoredBibleBook,
  chapter: number,
  tr: string
): Promise<BibleVerse[]> {
  const apiSlug = 'valera';

  // Strategy 1: Fetch direct chapter JSON endpoint (e.g. https://api.getbible.net/v2/valera/40/1.json)
  const chapterUrl = `https://api.getbible.net/v2/${apiSlug}/${bookMeta.number}/${chapter}.json`;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(chapterUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.verses && Array.isArray(data.verses)) {
        const parsedVerses: BibleVerse[] = data.verses.map((v: any) => ({
          bookId: bookMeta.id,
          bookName: data.book_name || bookMeta.name,
          chapter: Number(data.chapter || chapter),
          verse: Number(v.verse),
          text: (v.text || '').replace(/[\r\n]+/g, ' ').trim()
        }));

        if (isGenuineVerses(parsedVerses)) {
          await saveChapterToDB(bookMeta.id, chapter, parsedVerses, tr);
          return parsedVerses;
        }
      }
    }
  } catch (err) {
    console.warn(`Intento directo a ${chapterUrl} falló, probando endpoint del libro completo:`, err);
  }

  // Strategy 2: Fetch entire book JSON via URL in book definition (e.g. https://api.getbible.net/v2/valera/40.json)
  const bookUrl = bookMeta.url || `https://api.getbible.net/v2/${apiSlug}/${bookMeta.number}.json`;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(bookUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.chapters && Array.isArray(data.chapters)) {
        let requestedChapterVerses: BibleVerse[] = [];

        // Save all chapters of this book into IndexedDB for instant offline reading
        for (const chObj of data.chapters) {
          const chNum = Number(chObj.chapter);
          if (chObj.verses && Array.isArray(chObj.verses)) {
            const chVerses: BibleVerse[] = chObj.verses.map((v: any) => ({
              bookId: bookMeta.id,
              bookName: data.name || bookMeta.name,
              chapter: chNum,
              verse: Number(v.verse),
              text: (v.text || '').replace(/[\r\n]+/g, ' ').trim()
            }));

            if (isGenuineVerses(chVerses)) {
              await saveChapterToDB(bookMeta.id, chNum, chVerses, tr);
              if (chNum === chapter) {
                requestedChapterVerses = chVerses;
              }
            }
          }
        }

        if (requestedChapterVerses.length > 0) {
          return requestedChapterVerses;
        }
      }
    }
  } catch (err) {
    console.error(`Error consultando API GetBible para ${bookMeta.name} (${bookUrl}):`, err);
  }

  return [];
}

export interface FetchChapterResult {
  verses: BibleVerse[];
  isOfflineFallback?: boolean;
  notice?: string;
  loadedTranslation: string;
}

// Flowchart Implementation (Modo 100% Offline):
// [ SELECCIÓN DE VERSIÓN Y CAPÍTULO ]
//                  │
//                  ▼
//  [ Lectura Directa desde IndexedDB / SQLite ]
//                  │
//       ¿Encontrado en DB local?
//         /                \
//       SÍ                  NO
//       /                    \
//      ▼                      ▼
// [ Retornar Versículos ]  [ Sincronizar Versión Base / Fallback 'valera' ]
export async function fetchChapterVersesWithFallback(
  bookId: string,
  chapter: number,
  translation: string = 'valera',
  onNotification?: (msg: string) => void
): Promise<FetchChapterResult> {
  const tr = normalizeTranslationKey(translation);

  // 1. Lectura directa desde base de datos local (IndexedDB)
  const localVerses = await getChapterFromDB(bookId, chapter, tr);
  if (localVerses && isGenuineVerses(localVerses)) {
    return {
      verses: localVerses,
      loadedTranslation: tr,
    };
  }

  // 2. Si no está en IndexedDB para la versión histórica solicitada, intentar cargar del endpoint público GetBible
  const bookMeta = getBookByIdOrNumber(bookId, tr);
  const apiVerses = await fetchFromGetBibleAPI(bookMeta, chapter, tr);
  if (apiVerses && isGenuineVerses(apiVerses)) {
    return {
      verses: apiVerses,
      loadedTranslation: tr,
    };
  }

  // 3. Fallback seguro a la versión canónica base 'valera'
  const fallbackVerses = await getChapterFromDB(bookId, chapter, 'valera');
  if (fallbackVerses && isGenuineVerses(fallbackVerses)) {
    return {
      verses: fallbackVerses,
      isOfflineFallback: true,
      notice: 'Mostrando versión canónica offline disponible.',
      loadedTranslation: 'valera',
    };
  }

  return {
    verses: [],
    loadedTranslation: 'valera',
  };
}

// Fetch chapter verses: Consults local DB first, falling back to base offline translation
export async function fetchChapterVerses(
  bookId: string,
  chapter: number,
  translation: string = 'valera',
  onNotification?: (msg: string) => void
): Promise<BibleVerse[]> {
  const res = await fetchChapterVersesWithFallback(bookId, chapter, translation, onNotification);
  return res.verses;
}

/**
 * Offline-first Random Daily Verse selection strictly scoped to the active translation.
 * Mirrors Flutter's Drift getRandomDailyVerseFromDb implementation.
 */
export async function getRandomDailyVerseFromDB(
  activeTranslation: string = 'valera',
  themeFilter?: string,
  excludeId?: string
) {
  const tr = normalizeTranslationKey(activeTranslation);
  const { getRandomDailyVerse } = await import('../data/bibleData');
  return getRandomDailyVerse(themeFilter, excludeId, tr);
}

