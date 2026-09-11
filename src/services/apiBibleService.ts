import { BibleVerse } from '../types';

export interface ApiBibleChapterData {
  id: string;
  bibleId: string;
  number: string;
  bookId: string;
  reference: string;
  content?: any;
  verseCount?: number;
  copyright?: string;
}

// Canonical 66 Books USFM Codes
export const USFM_BOOK_CODES: string[] = [
  'GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA',
  '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO',
  'ECC', 'SNG', 'ISA', 'JER', 'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO',
  'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL', 'MAT',
  'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHP',
  'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS', '1PE',
  '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV'
];

export const KNOWN_API_BIBLE_VERSIONS: Record<string, { id: string; name: string; abbreviation: string }> = {
  nbla: {
    id: 'ce11b813f9a27e20-01',
    name: 'Nueva Biblia de las Américas',
    abbreviation: 'NBLA'
  },
  bes: {
    id: 'b32b9d1b64b4ef29-01',
    name: 'La Biblia en Español Sencillo',
    abbreviation: 'BES'
  },
  vbl: {
    id: '482ddd53705278cc-02',
    name: 'Versión Biblia Libre',
    abbreviation: 'VBL'
  },
  pddpt: {
    id: '48acedcf8595c754-01',
    name: 'Palabra de Dios para ti',
    abbreviation: 'PdDpt'
  },
  rvr09: {
    id: '592420522e16049f-01',
    name: 'Reina Valera 1909 (API.Bible)',
    abbreviation: 'RVR09'
  },
  rvr09_api: {
    id: '592420522e16049f-01',
    name: 'Reina Valera 1909 (API.Bible)',
    abbreviation: 'RVR09'
  },
  kjv: {
    id: 'de4e12af7f28f599-01',
    name: 'King James Version',
    abbreviation: 'KJV'
  },
  bsb: {
    id: 'bba9f40183526463-01',
    name: 'Berean Standard Bible',
    abbreviation: 'BSB'
  },
  // Legacy aliases mapped to the best equivalents
  rvr1960: {
    id: '592420522e16049f-01',
    name: 'Reina Valera 1909 (API.Bible)',
    abbreviation: 'RVR09'
  },
  nvi: {
    id: 'nvi',
    name: 'Nueva Versión Internacional (NVI)',
    abbreviation: 'NVI'
  },
};

/**
 * Fetches all bibles associated with the user's API.Bible account from the backend
 */
export async function fetchAccountBibles(): Promise<any> {
  try {
    const res = await fetch('/api/bible/account-bibles');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Resolves USFM Book Code from book ID or 1-based book number
 */
export function resolveBookCode(bookIdOrNumber: string | number): string {
  if (typeof bookIdOrNumber === 'number') {
    return USFM_BOOK_CODES[bookIdOrNumber - 1] || 'GEN';
  }
  const clean = bookIdOrNumber.toUpperCase().trim();
  if (USFM_BOOK_CODES.includes(clean)) return clean;
  const num = parseInt(clean, 10);
  if (!isNaN(num) && num >= 1 && num <= 66) {
    return USFM_BOOK_CODES[num - 1] || 'GEN';
  }
  return clean.slice(0, 3) || 'GEN';
}

/**
 * Parses API.Bible response content (supports JSON AST, HTML strings, or plain text)
 * into a typed array of BibleVerse.
 */
export function parseApiBibleContent(
  content: any,
  bookId: string,
  bookName: string,
  chapter: number
): BibleVerse[] {
  const verses: BibleVerse[] = [];
  if (!content) return verses;

  // 1. AST JSON Array Structure (API.Bible JSON content-type)
  if (Array.isArray(content)) {
    let currentVerseNum = 0;
    let currentVerseText = '';

    const processItems = (items: any[]) => {
      for (const item of items) {
        if (!item) continue;
        if (item.name === 'verse' && item.attrs) {
          if (currentVerseNum > 0 && currentVerseText.trim()) {
            verses.push({
              bookId,
              bookName,
              chapter,
              verse: currentVerseNum,
              text: currentVerseText.replace(/\s+/g, ' ').trim()
            });
          }
          currentVerseNum = parseInt(item.attrs.number || item.attrs.sid?.split(':')[1] || '0', 10);
          currentVerseText = '';
        } else if (item.type === 'text' && typeof item.text === 'string') {
          currentVerseText += item.text;
        } else if (item.items && Array.isArray(item.items)) {
          processItems(item.items);
        }
      }
    };

    processItems(content);
    if (currentVerseNum > 0 && currentVerseText.trim()) {
      verses.push({
        bookId,
        bookName,
        chapter,
        verse: currentVerseNum,
        text: currentVerseText.replace(/\s+/g, ' ').trim()
      });
    }

    if (verses.length > 0) return verses;
  }

  // 2. String Content (HTML or Text)
  if (typeof content === 'string') {
    // Check if HTML with spans
    if (content.includes('<span') || content.includes('<p')) {
      try {
        // Strip out footnotes or extra titles
        const cleanHtml = content.replace(/<span class="note"[^>]*>.*?<\/span>/gi, '');
        // Regex to match verse spans like <span data-number="1" class="v">1</span> or <span class="v">1</span>
        const verseRegex = /<span[^>]*?(?:data-number="(\d+)"|class="v"[^>]*>(\d+))[^>]*>(?:(?:\d+)<\/span>)?([^<]+)/gi;
        let match;
        while ((match = verseRegex.exec(cleanHtml)) !== null) {
          const vNum = parseInt(match[1] || match[2], 10);
          const rawText = match[3] || '';
          if (vNum > 0 && rawText.trim()) {
            verses.push({
              bookId,
              bookName,
              chapter,
              verse: vNum,
              text: rawText.replace(/\s+/g, ' ').trim()
            });
          }
        }
      } catch (err) {
        console.warn('HTML regex parse fallback:', err);
      }
    }

    // If regex on HTML failed or plain text, parse bracketed verse numbers: [1] Texto... [2] Texto...
    if (verses.length === 0) {
      const textVerseRegex = /(?:\[(\d+)\]|(?:\b|^)(\d+)\s+)([\s\S]*?)(?=(?:\[\d+\]|(?:\b\d+\s+)|$))/g;
      let match;
      while ((match = textVerseRegex.exec(content)) !== null) {
        const vNum = parseInt(match[1] || match[2], 10);
        const text = (match[3] || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        if (vNum > 0 && text) {
          verses.push({
            bookId,
            bookName,
            chapter,
            verse: vNum,
            text
          });
        }
      }
    }
  }

  return verses;
}

/**
 * Checks whether client has active internet connectivity
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'
    ? navigator.onLine
    : true;
}

/**
 * Fetches a chapter from API.Bible using the secure backend proxy (/api/bible/chapter)
 */
export async function fetchChapterFromApiBible(
  translationKey: string,
  bookIdOrNumber: string | number,
  chapter: number,
  bookName: string = '',
  customApiKey?: string
): Promise<{ verses: BibleVerse[]; isOfflineFallback?: boolean; fallbackMessage?: string }> {
  const cleanTr = translationKey.toLowerCase().trim();
  const bookCode = resolveBookCode(bookIdOrNumber);
  const chapterId = `${bookCode}.${chapter}`;
  const resolvedBibleId = KNOWN_API_BIBLE_VERSIONS[cleanTr]?.id || cleanTr;

  // Verify connectivity first
  if (!isOnline()) {
    throw new Error('OFFLINE_NO_INTERNET');
  }

  const url = `/api/bible/chapter?bibleId=${encodeURIComponent(resolvedBibleId)}&chapterId=${encodeURIComponent(chapterId)}&translation=${encodeURIComponent(cleanTr)}`;

  const headers: Record<string, string> = {
    Accept: 'application/json'
  };
  if (customApiKey) {
    headers['api-key'] = customApiKey;
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    if (response.status === 401) {
      throw new Error(`API_BIBLE_UNAUTHORIZED: ${errorBody.message || 'Se requiere clave API.Bible válida.'}`);
    }
    throw new Error(errorBody.error || `Error ${response.status} al consultar API.Bible`);
  }

  const json = await response.json();
  const chapterData: ApiBibleChapterData = json.data;
  if (!chapterData) {
    throw new Error('Respuesta inválida de API.Bible');
  }

  const parsedVerses = parseApiBibleContent(
    chapterData.content,
    bookCode,
    bookName || chapterData.reference || bookCode,
    chapter
  );

  return { verses: parsedVerses };
}
