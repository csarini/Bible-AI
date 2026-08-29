import { BibleChapterData, BibleVerse, BibleBook } from '../../../../types';

/**
 * BibleRepository Contract
 * Defines the domain-level operations for retrieving biblical data.
 * The presentation layer relies on this interface rather than the concrete implementation.
 */
export interface BibleRepository {
  /**
   * Fetch a specific chapter of a book in a given translation.
   * @param bookId The abbreviation or ID of the book (e.g., 'GEN', 'JHN')
   * @param chapter The chapter number
   * @param translation The translation abbreviation (e.g., 'RVR1960')
   * @returns A promise resolving to the chapter data including its verses.
   */
  getChapter(bookId: string, chapter: number, translation: string): Promise<BibleChapterData>;

  /**
   * Search across the entire Bible for a specific query.
   * @param query The search term
   * @param translation The translation abbreviation
   * @returns A promise resolving to a list of matching verses.
   */
  search(query: string, translation: string): Promise<BibleVerse[]>;

  /**
   * Retrieve the list of all books in the Bible.
   * @returns A promise resolving to the list of Bible books.
   */
  getBooks(): Promise<BibleBook[]>;
}
