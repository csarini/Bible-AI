// IndexedDB storage service for complete offline Bible caching
import { BibleVerse, BibleBook } from '../types';
import { BIBLE_BOOKS, fetchBibleChapter } from '../data/bibleData';

const DB_NAME = 'biblia_inteligente_offline_db';
const DB_VERSION = 1;
const STORE_CHAPTERS = 'bible_chapters';
const STORE_META = 'offline_metadata';

export interface OfflineStatus {
  isDownloading: boolean;
  totalChapters: number;
  downloadedChapters: number;
  progressPercent: number;
  isComplete: boolean;
  lastSyncDate?: string;
  isOnline: boolean;
  isWifi: boolean;
  activeBookName?: string;
  activeChapterNum?: number;
}

let dbInstance: IDBDatabase | null = null;

// Initialize IndexedDB
export async function getOfflineDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_CHAPTERS)) {
        // key is `${bookId}_${chapter}` (e.g. "MAT_4")
        db.createObjectStore(STORE_CHAPTERS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// Store a chapter's verses in IndexedDB separated by translation
export async function saveChapterOffline(
  bookId: string,
  chapter: number,
  verses: BibleVerse[],
  translation: string = 'rvr1960'
): Promise<void> {
  const trCode = (translation || 'rvr1960').toLowerCase().replace(/[^a-z0-9]/g, '');
  const db = await getOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CHAPTERS, 'readwrite');
    const store = tx.objectStore(STORE_CHAPTERS);
    const item = {
      id: `${trCode}_${bookId}_${chapter}`,
      translation: trCode,
      bookId,
      chapter,
      verses,
      updatedAt: Date.now()
    };
    const req = store.put(item);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Retrieve a chapter's verses from IndexedDB separated by translation
export async function getChapterOffline(
  bookId: string,
  chapter: number,
  translation: string = 'rvr1960'
): Promise<BibleVerse[] | null> {
  try {
    const trCode = (translation || 'rvr1960').toLowerCase().replace(/[^a-z0-9]/g, '');
    const db = await getOfflineDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_CHAPTERS, 'readonly');
      const store = tx.objectStore(STORE_CHAPTERS);
      const req = store.get(`${trCode}_${bookId}_${chapter}`);
      req.onsuccess = () => {
        if (req.result && req.result.verses && req.result.verses.length > 0) {
          resolve(req.result.verses);
        } else {
          // Check backwards-compatible legacy key
          const legacyReq = store.get(`${bookId}_${chapter}`);
          legacyReq.onsuccess = () => {
            if (legacyReq.result && legacyReq.result.verses && legacyReq.result.verses.length > 0) {
              resolve(legacyReq.result.verses);
            } else {
              resolve(null);
            }
          };
          legacyReq.onerror = () => resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

// Count how many chapters have been stored (optionally for a specific translation)
export async function countStoredChapters(translation?: string): Promise<number> {
  try {
    const db = await getOfflineDB();
    if (!translation) {
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_CHAPTERS, 'readonly');
        const store = tx.objectStore(STORE_CHAPTERS);
        const countReq = store.count();
        countReq.onsuccess = () => resolve(countReq.result);
        countReq.onerror = () => resolve(0);
      });
    }

    const trCode = translation.toLowerCase().replace(/[^a-z0-9]/g, '');
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_CHAPTERS, 'readonly');
      const store = tx.objectStore(STORE_CHAPTERS);
      const req = store.openCursor();
      let count = 0;
      req.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          if (cursor.value && (cursor.value.translation === trCode || (cursor.key as string).startsWith(`${trCode}_`))) {
            count++;
          }
          cursor.continue();
        } else {
          resolve(count);
        }
      };
      req.onerror = () => resolve(0);
    });
  } catch {
    return 0;
  }
}

// Clear all offline stored Bible data if needed
export async function clearOfflineBible(): Promise<void> {
  const db = await getOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_CHAPTERS, STORE_META], 'readwrite');
    tx.objectStore(STORE_CHAPTERS).clear();
    tx.objectStore(STORE_META).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Check network type (Wi-Fi vs Cellular vs Offline)
export function checkNetworkState(): { isOnline: boolean; isWifi: boolean } {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  let isWifi = true; // Default assume fast connection if Network Information API is not supported

  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const conn = (navigator as unknown as { connection?: { type?: string; effectiveType?: string } }).connection;
    if (conn) {
      if (conn.type === 'cellular' || conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g') {
        isWifi = false;
      } else {
        isWifi = true;
      }
    }
  }

  return { isOnline, isWifi };
}

// Total chapters across the 66 books of the Bible
export const TOTAL_BIBLE_CHAPTERS = BIBLE_BOOKS.reduce((acc, b) => acc + b.chaptersCount, 0); // 1,189 chapters

// Background Downloader Class with queue, rate-limiting, pausing, and persistence
class BackgroundBibleDownloader {
  private isRunning = false;
  private isPaused = false;
  private listeners: ((status: OfflineStatus) => void)[] = [];
  private downloadedCount = 0;
  private activeBookName = '';
  private activeChapterNum = 0;

  constructor() {
    this.init();
  }

  private async init() {
    this.downloadedCount = await countStoredChapters();
    this.notify();

    // Listen to online / offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.notify();
        this.autoStartIfWifi();
      });
      window.addEventListener('offline', () => {
        this.notify();
      });

      // Auto start if online and on WiFi after 2 seconds idle
      setTimeout(() => {
        this.autoStartIfWifi();
      }, 2500);
    }
  }

  public subscribe(cb: (status: OfflineStatus) => void): () => void {
    this.listeners.push(cb);
    cb(this.getStatus());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  public getStatus(): OfflineStatus {
    const { isOnline, isWifi } = checkNetworkState();
    const progressPercent = Math.min(
      100,
      Math.round((this.downloadedCount / TOTAL_BIBLE_CHAPTERS) * 100)
    );
    const isComplete = this.downloadedCount >= TOTAL_BIBLE_CHAPTERS;

    return {
      isDownloading: this.isRunning && !this.isPaused,
      totalChapters: TOTAL_BIBLE_CHAPTERS,
      downloadedChapters: this.downloadedCount,
      progressPercent,
      isComplete,
      isOnline,
      isWifi,
      activeBookName: this.activeBookName,
      activeChapterNum: this.activeChapterNum
    };
  }

  private notify() {
    const status = this.getStatus();
    this.listeners.forEach((l) => l(status));
  }

  public autoStartIfWifi() {
    const { isOnline, isWifi } = checkNetworkState();
    if (isOnline && isWifi && !this.isRunning && this.downloadedCount < TOTAL_BIBLE_CHAPTERS) {
      this.startDownload();
    }
  }

  public async startDownload(translation: string = 'rvr1960') {
    if (this.isRunning) {
      this.isPaused = false;
      this.notify();
      return;
    }

    const { isOnline } = checkNetworkState();
    if (!isOnline) {
      this.notify();
      return;
    }

    this.isRunning = true;
    this.isPaused = false;
    this.notify();

    try {
      // Loop through all 66 books and each chapter
      for (const book of BIBLE_BOOKS) {
        for (let ch = 1; ch <= book.chaptersCount; ch++) {
          if (this.isPaused) {
            this.isRunning = false;
            this.notify();
            return;
          }

          // Check if already in IndexedDB for this translation
          const existing = await getChapterOffline(book.id, ch, translation);
          if (!existing) {
            this.activeBookName = book.name;
            this.activeChapterNum = ch;
            this.notify();

            try {
              // Fetch and cache with retry
              const verses = await fetchBibleChapter(book.id, ch, translation);
              await saveChapterOffline(book.id, ch, verses, translation);
              this.downloadedCount++;
              this.notify();
            } catch (err) {
              console.warn(`Error downloading ${book.id} ${ch} (${translation}) for offline cache:`, err);
            }

            // Yield control slightly so UI and other tasks remain super responsive (30ms rate-limiting)
            await new Promise((r) => setTimeout(r, 30));
          } else {
            // Already cached, ensure count matches
          }
        }
      }

      this.downloadedCount = await countStoredChapters();
      this.activeBookName = '';
      this.activeChapterNum = 0;
      this.isRunning = false;
      this.notify();
    } catch (e) {
      console.error('Offline download failed:', e);
      this.isRunning = false;
      this.notify();
    }
  }

  public pauseDownload() {
    this.isPaused = true;
    this.isRunning = false;
    this.notify();
  }
}

export const offlineDownloader = new BackgroundBibleDownloader();
