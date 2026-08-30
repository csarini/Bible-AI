// IndexedDB storage service for complete offline Bible caching & Background Downloader
import { BibleVerse, BibleBook } from '../types';
import {
  getBibleDB,
  STORE_CHAPTERS,
  STORE_META,
  getLocalBooksSync,
  getBooksFromDB,
  getBookByIdOrNumber,
  getChapterFromDB,
  saveChapterToDB,
  fetchChapterVerses,
  normalizeTranslationKey
} from './bibleDatabaseService';

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

// Store a chapter's verses in IndexedDB separated by translation
export async function saveChapterOffline(
  bookId: string,
  chapter: number,
  verses: BibleVerse[],
  translation: string = 'valera'
): Promise<void> {
  await saveChapterToDB(bookId, chapter, verses, translation);
}

// Retrieve a chapter's verses from IndexedDB separated by translation
export async function getChapterOffline(
  bookId: string,
  chapter: number,
  translation: string = 'valera'
): Promise<BibleVerse[] | null> {
  return await getChapterFromDB(bookId, chapter, translation);
}

// Count how many chapters have been stored in the local DB
export async function countStoredChapters(translation?: string): Promise<number> {
  try {
    const db = await getBibleDB();
    if (!translation) {
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_CHAPTERS, 'readonly');
        const store = tx.objectStore(STORE_CHAPTERS);
        const countReq = store.count();
        countReq.onsuccess = () => resolve(countReq.result);
        countReq.onerror = () => resolve(0);
      });
    }

    const trCode = normalizeTranslationKey(translation);
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
  const db = await getBibleDB();
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

// Total chapters across 66 books of the Bible
export const TOTAL_BIBLE_CHAPTERS = 1189;

// Background Downloader Class with queue, non-blocking rate-limiting, pausing, and local DB persistence
class BackgroundBibleDownloader {
  private isRunning = false;
  private isPaused = false;
  private listeners: ((status: OfflineStatus) => void)[] = [];
  private downloadedCount = 0;
  private activeBookName = '';
  private activeChapterNum = 0;
  private activeTranslation = 'valera';

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

      // Auto start if online and on WiFi after short delay
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
      this.startDownload(this.activeTranslation);
    }
  }

  public async startDownload(translation: string = 'valera') {
    this.activeTranslation = normalizeTranslationKey(translation);

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
      // Query books directly from local DB
      const books = await getBooksFromDB(this.activeTranslation);

      for (const book of books) {
        for (let ch = 1; ch <= book.chaptersCount; ch++) {
          if (this.isPaused) {
            this.isRunning = false;
            this.notify();
            return;
          }

          // Check if already stored in local DB
          const existing = await getChapterFromDB(book.id, ch, this.activeTranslation);
          if (!existing || existing.length === 0) {
            this.activeBookName = book.name;
            this.activeChapterNum = ch;
            this.notify();

            try {
              // Fetch and store in local DB
              const verses = await fetchChapterVerses(book.id, ch, this.activeTranslation);
              if (verses && verses.length > 0) {
                this.downloadedCount++;
                this.notify();
              }
            } catch (err) {
              console.warn(`Descarga en segundo plano para ${book.name} ${ch} (${this.activeTranslation}):`, err);
            }

            // Yield control non-blockingly (25ms rate-limiting)
            await new Promise((r) => setTimeout(r, 25));
          }
        }
      }

      this.downloadedCount = await countStoredChapters(this.activeTranslation);
      this.activeBookName = '';
      this.activeChapterNum = 0;
      this.isRunning = false;
      this.notify();
    } catch (e) {
      console.error('Error en descarga en segundo plano:', e);
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
