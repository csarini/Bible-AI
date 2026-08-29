/**
 * AIMentorService
 * Handles communication with the local Express proxy (`server.ts`) which securely forwards
 * requests to the Google Gemini API.
 */
export class AIMentorService {
  private readonly baseUrl = '/api/mentor';

  /**
   * Sends a message to the Theological AI Mentor.
   * @param message The user's query or prompt
   * @param context (Optional) The biblical context, translation, or selected text.
   * @returns A promise resolving to the AI's markdown response.
   */
  async askMentor(message: string, context?: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message, context })
      });

      if (!response.ok) {
        let errorMsg = 'Error en el servidor.';
        try {
          const errData = await response.json();
          errorMsg = errData.error || errorMsg;
        } catch (e) {
          errorMsg = response.statusText;
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      return data.reply;
      
    } catch (error: any) {
      console.error('[AIMentorService] Failed to contact AI Mentor:', error);
      throw new Error(error.message || 'No se pudo conectar con el mentor IA.');
    }
  }
}

// Singleton for easy DI
export const aiMentorService = new AIMentorService();
