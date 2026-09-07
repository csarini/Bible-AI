/**
 * AIMentorService
 * Handles communication with the local Express proxy (`server.ts`) which securely forwards
 * requests to Google Gemini, OpenAI (ChatGPT), Qwen (OpenRouter), or custom OpenAI-compatible models.
 */

export interface AskMentorOptions {
  context?: string;
  selectedVerse?: { reference: string; text: string };
  provider?: 'gemini' | 'openai' | 'qwen' | 'custom';
  apiKey?: string;
  model?: string;
  endpoint?: string;
}

export class AIMentorService {
  private readonly baseUrl = '/api/mentor';

  /**
   * Sends a message to the Theological AI Mentor.
   * @param message The user's query or prompt
   * @param options (Optional) Biblical context string or full options object.
   * @returns A promise resolving to the AI's markdown response.
   */
  async askMentor(message: string, options?: string | AskMentorOptions): Promise<string> {
    const opts: AskMentorOptions = typeof options === 'string' ? { context: options } : (options || {});

    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          prompt: message,
          context: opts.context,
          selectedVerse: opts.selectedVerse,
          provider: opts.provider,
          apiKey: opts.apiKey,
          model: opts.model,
          endpoint: opts.endpoint
        })
      });

      if (!response.ok) {
        let errorMsg = 'Error en el servidor de IA.';
        try {
          const errData = await response.json();
          errorMsg = errData.error || errData.reply || errorMsg;
        } catch {
          errorMsg = response.statusText;
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      return data.reply || data.text || '';
      
    } catch (error: any) {
      console.error('[AIMentorService] Failed to contact AI Mentor:', error);
      throw new Error(error.message || 'No se pudo conectar con el mentor IA.');
    }
  }
}

// Singleton for easy DI
export const aiMentorService = new AIMentorService();
