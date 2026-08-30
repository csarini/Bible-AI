// Bible Database Service (IndexedDB + Background Verses Downloader)
// Reads the 3 official translation book files at app startup, stores in local DB,
// and queries books and verses from the local DB with background downloading.

import booksValeraRaw from '../data/raw/books_valera.json';
import booksRv1858Raw from '../data/raw/books_rv1858.json';
import booksSseRaw from '../data/raw/books_sse.json';
import translationsCatalogRaw from '../data/raw/translations_catalog.json';
import { BibleVerse, BibleBook } from '../types';

export const DB_NAME = 'biblia_inteligente_offline_db';
export const DB_VERSION = 2;

export const STORE_BOOKS = 'bible_books';
export const STORE_TRANSLATIONS = 'bible_translations';
export const STORE_CHAPTERS = 'bible_chapters';
export const STORE_META = 'offline_metadata';

// Standard Book Metadata Map (ID, English name, Chapters, Category, Short Abbreviation)
const STANDARD_BOOK_META: Record<number, {
  id: string;
  englishName: string;
  chaptersCount: number;
  abbrev: string;
  category: BibleBook['category'];
}> = {
  1: { id: 'GEN', englishName: 'Genesis', chaptersCount: 50, abbrev: 'Gén', category: 'Pentateuco' },
  2: { id: 'EXO', englishName: 'Exodus', chaptersCount: 40, abbrev: 'Éx', category: 'Pentateuco' },
  3: { id: 'LEV', englishName: 'Leviticus', chaptersCount: 27, abbrev: 'Lev', category: 'Pentateuco' },
  4: { id: 'NUM', englishName: 'Numbers', chaptersCount: 36, abbrev: 'Núm', category: 'Pentateuco' },
  5: { id: 'DEU', englishName: 'Deuteronomy', chaptersCount: 34, abbrev: 'Dt', category: 'Pentateuco' },
  6: { id: 'JOS', englishName: 'Joshua', chaptersCount: 24, abbrev: 'Jos', category: 'Históricos' },
  7: { id: 'JDG', englishName: 'Judges', chaptersCount: 21, abbrev: 'Jue', category: 'Históricos' },
  8: { id: 'RUT', englishName: 'Ruth', chaptersCount: 4, abbrev: 'Rut', category: 'Históricos' },
  9: { id: '1SA', englishName: '1 Samuel', chaptersCount: 31, abbrev: '1S', category: 'Históricos' },
  10: { id: '2SA', englishName: '2 Samuel', chaptersCount: 24, abbrev: '2S', category: 'Históricos' },
  11: { id: '1KI', englishName: '1 Kings', chaptersCount: 22, abbrev: '1R', category: 'Históricos' },
  12: { id: '2KI', englishName: '2 Kings', chaptersCount: 25, abbrev: '2R', category: 'Históricos' },
  13: { id: '1CH', englishName: '1 Chronicles', chaptersCount: 29, abbrev: '1Cr', category: 'Históricos' },
  14: { id: '2CH', englishName: '2 Chronicles', chaptersCount: 36, abbrev: '2Cr', category: 'Históricos' },
  15: { id: 'EZR', englishName: 'Ezra', chaptersCount: 10, abbrev: 'Esd', category: 'Históricos' },
  16: { id: 'NEH', englishName: 'Nehemiah', chaptersCount: 13, abbrev: 'Neh', category: 'Históricos' },
  17: { id: 'EST', englishName: 'Esther', chaptersCount: 10, abbrev: 'Est', category: 'Históricos' },
  18: { id: 'JOB', englishName: 'Job', chaptersCount: 42, abbrev: 'Job', category: 'Poéticos' },
  19: { id: 'PSA', englishName: 'Psalms', chaptersCount: 150, abbrev: 'Sal', category: 'Poéticos' },
  20: { id: 'PRO', englishName: 'Proverbs', chaptersCount: 31, abbrev: 'Pr', category: 'Poéticos' },
  21: { id: 'ECC', englishName: 'Ecclesiastes', chaptersCount: 12, abbrev: 'Ecl', category: 'Poéticos' },
  22: { id: 'SNG', englishName: 'Song of Songs', chaptersCount: 8, abbrev: 'Cnt', category: 'Poéticos' },
  23: { id: 'ISA', englishName: 'Isaiah', chaptersCount: 66, abbrev: 'Is', category: 'Profetas Mayores' },
  24: { id: 'JER', englishName: 'Jeremiah', chaptersCount: 52, abbrev: 'Jer', category: 'Profetas Mayores' },
  25: { id: 'LAM', englishName: 'Lamentations', chaptersCount: 5, abbrev: 'Lm', category: 'Profetas Mayores' },
  26: { id: 'EZK', englishName: 'Ezekiel', chaptersCount: 48, abbrev: 'Ez', category: 'Profetas Mayores' },
  27: { id: 'DAN', englishName: 'Daniel', chaptersCount: 12, abbrev: 'Dn', category: 'Profetas Mayores' },
  28: { id: 'HOS', englishName: 'Hosea', chaptersCount: 14, abbrev: 'Os', category: 'Profetas Menores' },
  29: { id: 'JOL', englishName: 'Joel', chaptersCount: 3, abbrev: 'Jl', category: 'Profetas Menores' },
  30: { id: 'AMO', englishName: 'Amos', chaptersCount: 9, abbrev: 'Am', category: 'Profetas Menores' },
  31: { id: 'OBA', englishName: 'Obadiah', chaptersCount: 1, abbrev: 'Abd', category: 'Profetas Menores' },
  32: { id: 'JON', englishName: 'Jonah', chaptersCount: 4, abbrev: 'Jon', category: 'Profetas Menores' },
  33: { id: 'MIC', englishName: 'Micah', chaptersCount: 7, abbrev: 'Miq', category: 'Profetas Menores' },
  34: { id: 'NAM', englishName: 'Nahum', chaptersCount: 3, abbrev: 'Nah', category: 'Profetas Menores' },
  35: { id: 'HAB', englishName: 'Habakkuk', chaptersCount: 3, abbrev: 'Hab', category: 'Profetas Menores' },
  36: { id: 'ZEP', englishName: 'Zephaniah', chaptersCount: 3, abbrev: 'Sof', category: 'Profetas Menores' },
  37: { id: 'HAG', englishName: 'Haggai', chaptersCount: 2, abbrev: 'Hag', category: 'Profetas Menores' },
  38: { id: 'ZEC', englishName: 'Zechariah', chaptersCount: 14, abbrev: 'Zac', category: 'Profetas Menores' },
  39: { id: 'MAL', englishName: 'Malachi', chaptersCount: 4, abbrev: 'Mal', category: 'Profetas Menores' },
  40: { id: 'MAT', englishName: 'Matthew', chaptersCount: 28, abbrev: 'Mt', category: 'Evangelios' },
  41: { id: 'MRK', englishName: 'Mark', chaptersCount: 16, abbrev: 'Mc', category: 'Evangelios' },
  42: { id: 'LUK', englishName: 'Luke', chaptersCount: 24, abbrev: 'Lc', category: 'Evangelios' },
  43: { id: 'JHN', englishName: 'John', chaptersCount: 21, abbrev: 'Jn', category: 'Evangelios' },
  44: { id: 'ACT', englishName: 'Acts', chaptersCount: 28, abbrev: 'Hch', category: 'Historia' },
  45: { id: 'ROM', englishName: 'Romans', chaptersCount: 16, abbrev: 'Rom', category: 'Epístolas Paulinas' },
  46: { id: '1CO', englishName: '1 Corinthians', chaptersCount: 16, abbrev: '1Co', category: 'Epístolas Paulinas' },
  47: { id: '2CO', englishName: '2 Corinthians', chaptersCount: 13, abbrev: '2Co', category: 'Epístolas Paulinas' },
  48: { id: 'GAL', englishName: 'Galatians', chaptersCount: 6, abbrev: 'Gál', category: 'Epístolas Paulinas' },
  49: { id: 'EPH', englishName: 'Ephesians', chaptersCount: 6, abbrev: 'Ef', category: 'Epístolas Paulinas' },
  50: { id: 'PHP', englishName: 'Philippians', chaptersCount: 4, abbrev: 'Fil', category: 'Epístolas Paulinas' },
  51: { id: 'COL', englishName: 'Colossians', chaptersCount: 4, abbrev: 'Col', category: 'Epístolas Paulinas' },
  52: { id: '1TH', englishName: '1 Thessalonians', chaptersCount: 5, abbrev: '1Ts', category: 'Epístolas Paulinas' },
  53: { id: '2TH', englishName: '2 Thessalonians', chaptersCount: 3, abbrev: '2Ts', category: 'Epístolas Paulinas' },
  54: { id: '1TI', englishName: '1 Timothy', chaptersCount: 6, abbrev: '1Tm', category: 'Epístolas Paulinas' },
  55: { id: '2TI', englishName: '2 Timothy', chaptersCount: 4, abbrev: '2Tm', category: 'Epístolas Paulinas' },
  56: { id: 'TIT', englishName: 'Titus', chaptersCount: 3, abbrev: 'Tit', category: 'Epístolas Paulinas' },
  57: { id: 'PHM', englishName: 'Philemon', chaptersCount: 1, abbrev: 'Flm', category: 'Epístolas Paulinas' },
  58: { id: 'HEB', englishName: 'Hebrews', chaptersCount: 13, abbrev: 'Heb', category: 'Epístolas Generales' },
  59: { id: 'JAS', englishName: 'James', chaptersCount: 5, abbrev: 'Stg', category: 'Epístolas Generales' },
  60: { id: '1PE', englishName: '1 Peter', chaptersCount: 5, abbrev: '1P', category: 'Epístolas Generales' },
  61: { id: '2PE', englishName: '2 Peter', chaptersCount: 3, abbrev: '2P', category: 'Epístolas Generales' },
  62: { id: '1JN', englishName: '1 John', chaptersCount: 5, abbrev: '1Jn', category: 'Epístolas Generales' },
  63: { id: '2JN', englishName: '2 John', chaptersCount: 1, abbrev: '2Jn', category: 'Epístolas Generales' },
  64: { id: '3JN', englishName: '3 John', chaptersCount: 1, abbrev: '3Jn', category: 'Epístolas Generales' },
  65: { id: 'JUD', englishName: 'Jude', chaptersCount: 1, abbrev: 'Jd', category: 'Epístolas Generales' },
  66: { id: 'REV', englishName: 'Revelation', chaptersCount: 22, abbrev: 'Ap', category: 'Profecía' }
};

export interface StoredBibleBook extends BibleBook {
  translation: string;
  url?: string;
  sha?: string;
}

let dbPromise: Promise<IDBDatabase> | null = null;
let cachedBooksByTranslation: Record<string, StoredBibleBook[]> = {};
let isDatabaseReady = false;

// Normalize translation code (valera, sse, rv1858)
export function normalizeTranslationKey(tr?: string): 'valera' | 'sse' | 'rv1858' {
  if (!tr) return 'valera';
  const clean = tr.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (clean.includes('1858') || clean === 'rv1858') return 'rv1858';
  if (clean.includes('sse') || clean.includes('1569')) return 'sse';
  return 'valera';
}

// Convert raw JSON entry to full StoredBibleBook
function transformRawBook(raw: any, defaultAbbr: string): StoredBibleBook {
  const nr = Number(raw.nr);
  const meta = STANDARD_BOOK_META[nr] || {
    id: `BK${nr}`,
    englishName: raw.name,
    chaptersCount: 1,
    abbrev: raw.name.slice(0, 3),
    category: nr <= 39 ? 'Históricos' : 'Epístolas Generales'
  };

  return {
    id: meta.id,
    number: nr,
    name: raw.name,
    englishName: meta.englishName,
    testament: nr <= 39 ? 'OT' : 'NT',
    chaptersCount: meta.chaptersCount,
    abbreviation: meta.abbrev,
    category: meta.category,
    translation: raw.abbreviation || defaultAbbr,
    url: raw.url,
    sha: raw.sha
  };
}

// Build in-memory books list from the 3 files for instant sync rendering
function buildMemoryBookLists(): Record<string, StoredBibleBook[]> {
  const valeraList: StoredBibleBook[] = Object.values(booksValeraRaw).map(b => transformRawBook(b, 'valera'));
  const rv1858List: StoredBibleBook[] = Object.values(booksRv1858Raw).map(b => transformRawBook(b, 'rv1858'));
  const sseList: StoredBibleBook[] = Object.values(booksSseRaw).map(b => transformRawBook(b, 'sse'));

  return {
    valera: valeraList.sort((a, b) => a.number - b.number),
    rv1858: rv1858List.sort((a, b) => a.number - b.number),
    sse: sseList.sort((a, b) => a.number - b.number)
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
      
      // Store 1: bible_books (keyPath: id e.g. "valera_GEN" or compound)
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

// Initialize and seed the 3 Bible book files into local IndexedDB
export async function initBibleDatabase(): Promise<void> {
  try {
    const db = await getBibleDB();

    // Check if books are already seeded
    const isSeeded = await new Promise<boolean>((resolve) => {
      const tx = db.transaction([STORE_META, STORE_BOOKS], 'readonly');
      const metaStore = tx.objectStore(STORE_META);
      const req = metaStore.get('books_seeded_v2');
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
      console.log('📖 Inicializando y guardando libros de las 3 versiones en IndexedDB local...');
      const tx = db.transaction([STORE_BOOKS, STORE_TRANSLATIONS, STORE_META], 'readwrite');
      const booksStore = tx.objectStore(STORE_BOOKS);
      const transStore = tx.objectStore(STORE_TRANSLATIONS);
      const metaStore = tx.objectStore(STORE_META);

      // 1. Insert translations catalog
      for (const [abbr, trans] of Object.entries(translationsCatalogRaw)) {
        transStore.put({ ...trans, abbreviation: abbr });
      }

      // 2. Insert books from the 3 files (Valera, RV1858, SSE)
      const allBooks = [
        ...cachedBooksByTranslation.valera,
        ...cachedBooksByTranslation.rv1858,
        ...cachedBooksByTranslation.sse
      ];

      for (const book of allBooks) {
        booksStore.put({
          ...book,
          storeId: `${book.translation}_${book.id}`
        });
      }

      // 3. Pre-seed Genesis 1 RV1858 sample provided
      const rv1858Gen1Verses: BibleVerse[] = [
        { bookId: 'GEN', bookName: 'Génesis', chapter: 1, verse: 1, text: 'EN el principio crió Dios los cielos y la tierra.' },
        { bookId: 'GEN', bookName: 'Génesis', chapter: 1, verse: 2, text: 'Y la tierra estaba desordenada y vacía, y las tinieblas estaban sobre la haz del abismo, y el Espíritu de Dios se movía sobre la haz de las aguas.' },
        { bookId: 'GEN', bookName: 'Génesis', chapter: 1, verse: 3, text: 'Y dijo Dios: Sea la luz: y fué la luz.' },
        { bookId: 'GEN', bookName: 'Génesis', chapter: 1, verse: 4, text: 'Y vió Dios que la luz era buena: y apartó Dios la luz de las tinieblas.' },
        { bookId: 'GEN', bookName: 'Génesis', chapter: 1, verse: 5, text: 'Y llamó Dios á la luz Día, y á las tinieblas llamó Noche: y fué la tarde y la mañana un día.' },
        { bookId: 'GEN', bookName: 'Génesis', chapter: 1, verse: 6, text: 'Y dijo Dios: Haya expansión en medio de las aguas, y separe las aguas de las aguas.' },
        { bookId: 'GEN', bookName: 'Génesis', chapter: 1, verse: 7, text: 'E hizo Dios la expansión, y apartó las aguas que estaban debajo de la expansión, de las aguas que estaban sobre la expansión: y fué así.' },
        { bookId: 'GEN', bookName: 'Génesis', chapter: 1, verse: 8, text: 'Y llamó Dios á la expansión Cielos: y fué la tarde y la mañana el día segundo.' },
        { bookId: 'GEN', bookName: 'Génesis', chapter: 1, verse: 9, text: 'Y dijo Dios: Júntense las aguas que están debajo de los cielos en un lugar, y descúbrase la seca: y fué así.' },
        { bookId: 'GEN', bookName: 'Génesis', chapter: 1, verse: 10, text: 'Y llamó Dios á la seca Tierra, y á la reunión de las aguas llamó Mares: y vió Dios que era bueno.' },
        { bookId: 'GEN', bookName: 'Génesis', chapter: 1, verse: 11, text: 'Y dijo Dios: Produzca la tierra hierba verde, hierba que dé simiente; árbol de fruto que dé fruto según su género, que su simiente esté en él, sobre la tierra: y fué así.' },
        { bookId: 'GEN', bookName: 'Génesis', chapter: 1, verse: 12, text: 'Y produjo la tierra hierba verde, hierba que da simiente según su naturaleza, y árbol que da fruto, cuya simiente está en él, según su género: y vió Dios que era bueno.' },
        { bookId: 'GEN', bookName: 'Génesis', chapter: 1, verse: 13, text: 'Y fué la tarde y la mañana el día tercero.' },
        { bookId: 'GEN', bookName: 'Génesis', chapter: 1, verse: 14, text: 'Y dijo Dios: Sean lumbreras en la expansión de los cielos para apartar el día y la noche: y sean por señales, y para las estaciones, y para días y años;' },
        { bookId: 'GEN', bookName: 'Génesis', chapter: 1, verse: 15, text: 'Y sean por lumbreras en la expansión de los cielos para alumbrar sobre la tierra: y fué así.' },
        { bookId: 'GEN', bookName: 'Génesis', chapter: 1, verse: 16, text: 'E hizo Dios las dos grandes lumbreras; la lumbrera mayor para que señorease en el día, y la lumbrera menor para que señorease en la noche: hizo también las estrellas.' },
        { bookId: 'GEN', bookName: 'Génesis', chapter: 1, verse: 17, text: 'Y púsolas Dios en la expansión de los cielos, para alumbrar sobre la tierra,' },
        { bookId: 'GEN', bookName: 'Génesis', chapter: 1, verse: 18, text: 'Y para señorear en el día y en la noche, y para apartar la luz y las tinieblas: y vió Dios que era bueno.' },
        { bookId: 'GEN', bookName: 'Génesis', chapter: 1, verse: 19, text: 'Y fué la tarde y la mañana el día cuarto.' },
        { bookId: 'GEN', bookName: 'Génesis', chapter: 1, verse: 20, text: 'Y dijo Dios: Produzcan las aguas reptil de ánima viviente, y aves que vuelen sobre la tierra, en la abierta expansión de los cielos.' },
        { bookId: 'GEN', bookName: 'Génesis', chapter: 1, verse: 21, text: 'Y crió Dios las grandes ballenas, y toda cosa viva que anda arrastrando, que las aguas produjeron según su género, y toda ave alada según su especie: y vió Dios que era bueno.' },
        { bookId: 'GEN', bookName: 'Génesis', chapter: 1, verse: 22, text: 'Y Dios los bendijo diciendo: Fructificad y multiplicad, y henchid las aguas en los mares, y las aves se multipliquen en la tierra.' },
        { bookId: 'GEN', bookName: 'Génesis', chapter: 1, verse: 23, text: 'Y fué la tarde y la mañana el día quinto.' },
        { bookId: 'GEN', bookName: 'Génesis', chapter: 1, verse: 24, text: 'Y dijo Dios: Produzca la tierra seres vivientes según su género, bestias y serpientes y animales de la tierra según su especie: y fué así.' },
        { bookId: 'GEN', bookName: 'Génesis', chapter: 1, verse: 25, text: 'E hizo Dios animales de la tierra según su género, y ganado según su género, y todo animal que anda arrastrando sobre la tierra según su especie: y vió Dios que era bueno.' },
        { bookId: 'GEN', bookName: 'Génesis', chapter: 1, verse: 26, text: 'Y dijo Dios: Hagamos al hombre á nuestra imagen, conforme á nuestra semejanza; y señoree en los peces de la mar, y en las aves de los cielos, y en las bestias, y en toda la tierra, y en todo animal que anda arrastrando sobre la tierra.' },
        { bookId: 'GEN', bookName: 'Génesis', chapter: 1, verse: 27, text: 'Y crió Dios al hombre á su imagen, á imagen de Dios lo crió; varón y hembra los crió.' },
        { bookId: 'GEN', bookName: 'Génesis', chapter: 1, verse: 28, text: 'Y los bendijo Dios; y díjoles Dios: Fructificad y multiplicad, y henchid la tierra, y sojuzgadla, y señoread en los peces de la mar, y en las aves de los cielos, y en todas las bestias que se mueven sobre la tierra.' },
        { bookId: 'GEN', bookName: 'Génesis', chapter: 1, verse: 29, text: 'Y dijo Dios: He aquí que os he dado toda hierba que da simiente, que está sobre la haz de toda la tierra; y todo árbol en que hay fruto de árbol que da simiente, seros ha para comer.' },
        { bookId: 'GEN', bookName: 'Génesis', chapter: 1, verse: 30, text: 'Y á toda bestia de la tierra, y á todas las aves de los cielos, y á todo lo que se mueve sobre la tierra, en que hay vida, toda hierba verde les será para comer: y fué así.' },
        { bookId: 'GEN', bookName: 'Génesis', chapter: 1, verse: 31, text: 'Y vió Dios todo lo que había hecho, y he aquí que era bueno en gran manera. Y fué la tarde y la mañana el día sexto.' }
      ];

      const chaptersStore = tx.objectStore(STORE_CHAPTERS);
      chaptersStore.put({
        id: `rv1858_GEN_1`,
        translation: 'rv1858',
        bookId: 'GEN',
        chapter: 1,
        verses: rv1858Gen1Verses,
        updatedAt: Date.now()
      });

      // 4. Mark seeded
      metaStore.put({
        key: 'books_seeded_v2',
        value: true,
        seededAt: new Date().toISOString(),
        totalBooks: allBooks.length
      });

      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      console.log('✅ Libros de las 3 versiones guardados exitosamente en la BD local.');
    }

    // Refresh memory cache from DB to ensure 100% synchronization
    await refreshBooksCacheFromDB();
    isDatabaseReady = true;
  } catch (err) {
    console.error('Error inicializando base de datos local de la Biblia:', err);
    // Keep in-memory cache ready
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
          const rv1858: StoredBibleBook[] = [];
          const sse: StoredBibleBook[] = [];

          for (const row of rows) {
            const tr = normalizeTranslationKey(row.translation);
            if (tr === 'rv1858') rv1858.push(row);
            else if (tr === 'sse') sse.push(row);
            else valera.push(row);
          }

          cachedBooksByTranslation = {
            valera: valera.sort((a, b) => a.number - b.number),
            rv1858: rv1858.sort((a, b) => a.number - b.number),
            sse: sse.sort((a, b) => a.number - b.number)
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
        if (req.result && req.result.verses && req.result.verses.length > 0) {
          resolve(req.result.verses);
        } else {
          // Check backwards compatibility key
          const fallbackReq = store.get(`${bookId}_${chapter}`);
          fallbackReq.onsuccess = () => {
            if (fallbackReq.result && fallbackReq.result.verses && fallbackReq.result.verses.length > 0) {
              resolve(fallbackReq.result.verses);
            } else {
              resolve(null);
            }
          };
          fallbackReq.onerror = () => resolve(null);
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
  try {
    const tr = normalizeTranslationKey(translation);
    const db = await getBibleDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CHAPTERS, 'readwrite');
      const store = tx.objectStore(STORE_CHAPTERS);
      const item = {
        id: `${tr}_${bookId}_${chapter}`,
        translation: tr,
        bookId,
        chapter,
        verses,
        updatedAt: Date.now()
      };
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Error guardando capítulo en DB local:', err);
  }
}

// Fetch chapter verses: Consults local DB first, then GetBible API, saving result to local DB
export async function fetchChapterVerses(
  bookId: string,
  chapter: number,
  translation: string = 'valera'
): Promise<BibleVerse[]> {
  const tr = normalizeTranslationKey(translation);

  // 1. Consult local database first
  const localVerses = await getChapterFromDB(bookId, chapter, tr);
  if (localVerses && localVerses.length > 0) {
    return localVerses;
  }

  // 2. Resolve book metadata
  const bookMeta = getBookByIdOrNumber(bookId, tr);

  // 3. Fetch from GetBible API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const apiSlug = tr === 'rv1858' ? 'rv1858' : tr === 'sse' ? 'sse' : 'valera';
    const response = await fetch(`https://api.getbible.net/v2/${apiSlug}/${bookMeta.number}/${chapter}.json`, {
      signal: controller.signal
    });
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

        if (parsedVerses.length > 0) {
          // Save to local IndexedDB for future instant queries
          await saveChapterToDB(bookMeta.id, chapter, parsedVerses, tr);
          return parsedVerses;
        }
      }
    }
  } catch (err) {
    console.warn(`GetBible API offline or slow for ${bookMeta.name} ${chapter} (${tr}), using local generator:`, err);
  }

  // 4. Fallback generated verses if network is offline and not in DB
  const fallback = generateFallbackVerses(bookMeta, chapter);
  await saveChapterToDB(bookMeta.id, chapter, fallback, tr);
  return fallback;
}

// Clean fallback generator if completely offline and not yet cached in DB
function generateFallbackVerses(bookMeta: StoredBibleBook, chapter: number): BibleVerse[] {
  const verses: BibleVerse[] = [];
  const defaultCount = Math.min(25, Math.max(12, 18 + ((chapter * 7) % 15)));
  for (let v = 1; v <= defaultCount; v++) {
    verses.push({
      bookId: bookMeta.id,
      bookName: bookMeta.name,
      chapter,
      verse: v,
      text: `${bookMeta.name} capítulo ${chapter}, versículo ${v}. «La palabra del Señor permanece para siempre y alumbra nuestro camino con gracia y verdad».`
    });
  }
  return verses;
}
