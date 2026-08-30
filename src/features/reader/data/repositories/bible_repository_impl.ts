import { BibleRepository } from '../../domain/repositories/bible_repository';
import { BibleChapterData, BibleVerse, BibleBook } from '../../../../types';
import { fetchBibleChapter, BIBLE_BOOKS } from '../../../../data/bibleData';

/**
 * BibleRepositoryImpl
 * Concrete implementation of the BibleRepository interface.
 * Connects the domain layer to the actual data sources (e.g., GetBible.net proxy or static data).
 */
export class BibleRepositoryImpl implements BibleRepository {
  
  async getChapter(bookId: string, chapter: number, translation: string): Promise<BibleChapterData> {
    try {
      // Delegating to the existing robust data fetching logic (which hits GetBible.net or fallback)
      const verses = await fetchBibleChapter(bookId, chapter, translation);
      
      const book = BIBLE_BOOKS.find(b => b.id === bookId);
      if (!book) {
        throw new Error(`Book ${bookId} not found`);
      }

      return {
        bookId,
        bookName: book.name,
        chapter,
        verses,
        translation
      };
    } catch (error) {
      console.error(`[BibleRepository] Error fetching chapter ${bookId} ${chapter}:`, error);
      throw error;
    }
  }

  async search(query: string, translation: string): Promise<BibleVerse[]> {
    try {
      const q = query.trim().toLowerCase();
      if (!q) return [];
      
      // Basic chapter search across sample books
      const sampleBook = BIBLE_BOOKS[0];
      const verses = await this.getChapter(sampleBook.id, 1, translation);
      return verses.verses.filter(v => v.text.toLowerCase().includes(q));
    } catch (error) {
      console.error(`[BibleRepository] Error searching for "${query}":`, error);
      throw error;
    }
  }

  async getBooks(): Promise<BibleBook[]> {
    // Return statically available books
    return Promise.resolve(BIBLE_BOOKS);
  }
}

// Singleton instance for dependency injection across the app
export const bibleRepository = new BibleRepositoryImpl();
