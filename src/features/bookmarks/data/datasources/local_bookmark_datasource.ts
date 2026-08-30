import { LocalBookmark } from '../../../../types';

const STORAGE_KEY = 'biblia_inteligente_bookmarks';

/**
 * LocalBookmarkDataSource
 * Handles all direct interaction with the browser's localStorage for bookmarks.
 * Decouples the storage mechanism from the rest of the application.
 */
export class LocalBookmarkDataSource {
  
  /**
   * Retrieves all bookmarks saved in local storage.
   */
  async getBookmarks(): Promise<LocalBookmark[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      
      const parsed = JSON.parse(data) as LocalBookmark[];
      // Ensure we return sorted by date descending (newest first)
      return parsed.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } catch (error) {
      console.error('[LocalBookmarkDataSource] Error parsing bookmarks:', error);
      return [];
    }
  }

  /**
   * Saves a single bookmark to local storage.
   */
  async saveBookmark(bookmark: LocalBookmark): Promise<void> {
    try {
      const existing = await this.getBookmarks();
      
      // Check if updating or creating new
      const index = existing.findIndex(b => b.id === bookmark.id);
      if (index >= 0) {
        existing[index] = bookmark;
      } else {
        existing.push(bookmark);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    } catch (error) {
      console.error('[LocalBookmarkDataSource] Error saving bookmark:', error);
      throw new Error('No se pudo guardar el apunte/versículo.');
    }
  }

  /**
   * Deletes a bookmark by its ID.
   */
  async deleteBookmark(id: string): Promise<void> {
    try {
      const existing = await this.getBookmarks();
      const filtered = existing.filter(b => b.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('[LocalBookmarkDataSource] Error deleting bookmark:', error);
      throw new Error('No se pudo eliminar el apunte.');
    }
  }

  /**
   * Clears all bookmarks (mostly for testing or hard resets).
   */
  async clearAll(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
  }
}

// Singleton for easy DI
export const localBookmarkDataSource = new LocalBookmarkDataSource();
