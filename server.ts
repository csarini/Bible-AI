import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Biblia Inteligente' });
  });

  // AI Mentor endpoint with Multi-Provider Support (Gemini, ChatGPT, Qwen, Custom)
  const handleAiMentor = async (req: express.Request, res: express.Response) => {
    try {
      const prompt = (req.body.prompt || req.body.message || '').trim();
      const selectedVerse = req.body.selectedVerse;
      const context = req.body.context;
      const provider = (req.body.provider || 'gemini').toLowerCase();
      const userApiKey = (req.body.apiKey || '').trim();
      const customModel = (req.body.model || '').trim();
      const customEndpoint = (req.body.endpoint || '').trim();

      const THEOLOGICAL_SYSTEM_PROMPT = `Eres el "Mentor Teológico IA" de "Biblia Inteligente (Digital Sanctuary)".
Tu propósito fundamental es guiar y ayudar al usuario en el estudio riguroso, devocional, exegético y pastoral de las Sagradas Escrituras.

DIRECTIVAS CRÍTICAS DE RESPUESTA:
1. OPTIMIZACIÓN DE COSTOS Y RESPUESTAS RESUMIDAS (OBLIGATORIO):
   - Genera respuestas resumidas, sustanciales y de alta precisión para minimizar el consumo de tokens y optimizar los costos de computación.
   - Longitud objetivo: máximo 2 o 3 párrafos breves o viñetas compactas.
   - Ve directo al grano: sin preámbulos floridos, sin introducciones vacías y sin despedidas largas.
   - Estructura condensada:
     * Respuesta bíblica central citando 1 o 2 pasajes clave (Libro Capítulo:Versículo).
     * Raíz etimológica clave en hebreo o griego solo si aporta luz directa al significado.
     * Aplicación espiritual o práctica en 1 o 2 oraciones breves.

2. CONSULTAS TEMÁTICAS (ej: "¿Qué dice la Biblia sobre la amistad?", "el perdón", "la paciencia", etc.):
   - Responde de forma sintética y fundamentada sólidamente en las Sagradas Escrituras.
   - Cita 1 a 2 pasajes bíblicos clave del Antiguo o Nuevo Testamento con libro, capítulo y versículo.
   - Brinda la aplicación espiritual esencial en pocas líneas.

3. ANÁLISIS DE VERSÍCULOS ESPECÍFICOS (cuando el usuario proporciona o pregunta por un versículo puntual):
   - Realiza un análisis exegético conciso:
     * Contexto inmediato del pasaje en 1 o 2 frases.
     * Término clave en hebreo/griego original y su significado teológico.
     * Aplicación pastoral directa para el creyente.

4. ALCANCE BÍBLICO Y ÉTICO:
   - El enfoque exclusivo es el estudio bíblico, la teología, la historia de la salvación y la vida espiritual.
   - Si la consulta es ajena a la fe o ética (ej. recetas de cocina, resultados deportivos o especulación financiera), declina amablemente diciendo: "Solo puedo responder preguntas relacionadas con el estudio bíblico, teológico y la vida espiritual."`;

      if (!prompt && !selectedVerse) {
        return res.status(400).json({ error: 'Por favor ingresa una pregunta o selecciona un versículo para consultar al Mentor IA.' });
      }

      // Format query with full biblical context
      const fullQuery = selectedVerse
        ? `Versículo de referencia: ${selectedVerse.reference} ("${selectedVerse.text}")\nPregunta / Petición del usuario: ${prompt || 'Analiza este versículo detalladamente, su contexto, trasfondo teológico y aplicación práctica.'}`
        : context
          ? `Contexto bíblico previo: ${context}\nPregunta del usuario: ${prompt}`
          : prompt;

      // 1. PROVIDER: OpenAI / ChatGPT
      if (provider === 'openai' || provider === 'chatgpt') {
        const apiKey = userApiKey || process.env.OPENAI_API_KEY;
        if (!apiKey) {
          return res.status(400).json({
            error: 'No se encontró la clave API de OpenAI. Por favor configúrala en Ajustes del Mentor IA.',
            reply: '⚠️ No se ha configurado la clave API de OpenAI (ChatGPT). Ingresa tu API Key en los Ajustes para activar las respuestas en vivo.',
          });
        }

        const model = customModel || 'gpt-4o-mini';
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            temperature: 0.3,
            max_tokens: 500,
            messages: [
              { role: 'system', content: THEOLOGICAL_SYSTEM_PROMPT },
              { role: 'user', content: fullQuery },
            ],
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `Error OpenAI HTTP ${response.status}`);
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content?.trim() || '';
        return res.json({
          text: reply,
          reply,
          provider: 'openai',
          model,
        });
      }

      // 2. PROVIDER: Qwen / OpenRouter / Custom OpenAI-compatible
      if (provider === 'qwen' || provider === 'openrouter' || provider === 'custom') {
        const apiKey = userApiKey || process.env.OPENROUTER_API_KEY || process.env.QWEN_API_KEY;
        if (!apiKey && provider !== 'custom') {
          return res.status(400).json({
            error: 'No se encontró la clave API para Qwen / OpenRouter. Por favor configúrala en Ajustes del Mentor IA.',
            reply: '⚠️ No se ha configurado la clave API de Qwen / OpenRouter. Ingresa tu API Key en los Ajustes para activar las respuestas en vivo.',
          });
        }

        const endpoint = customEndpoint || 'https://openrouter.ai/api/v1/chat/completions';
        const model = customModel || (provider === 'qwen' ? 'qwen/qwen-2.5-72b-instruct' : 'gpt-4o-mini');

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (apiKey) {
          headers['Authorization'] = `Bearer ${apiKey}`;
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model,
            temperature: 0.3,
            max_tokens: 500,
            messages: [
              { role: 'system', content: THEOLOGICAL_SYSTEM_PROMPT },
              { role: 'user', content: fullQuery },
            ],
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `Error HTTP ${response.status} en ${endpoint}`);
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content?.trim() || '';
        return res.json({
          text: reply,
          reply,
          provider,
          model,
        });
      }

      // 3. PROVIDER: Google Gemini (Default)
      const DEFAULT_GEMINI_KEY = 'AQ.Ab8RN6I_vopKgtr88G9_2H0StDa0yjJIJNP6I9YRUl43AelVfQ';
      const geminiKey = userApiKey || DEFAULT_GEMINI_KEY || process.env.GEMINI_API_KEY;
      if (!geminiKey) {
        return res.status(400).json({
          error: 'No se encontró una clave API de Gemini configurada.',
          reply: '⚠️ No se ha configurado la clave API de Google Gemini. Por favor proporciona tu clave API en los Ajustes del Mentor IA para recibir respuestas en vivo.',
        });
      }

      const ai = new GoogleGenAI({
        apiKey: geminiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      // Try preferred flash models with graceful cascade
      const candidateModels = customModel
        ? [customModel, 'gemini-3.6-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest']
        : ['gemini-3.6-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

      let reply = '';
      let usedModel = candidateModels[0];
      let lastError: any = null;

      for (const m of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: m,
            contents: fullQuery,
            config: {
              systemInstruction: THEOLOGICAL_SYSTEM_PROMPT,
              temperature: 0.3,
              maxOutputTokens: 500,
            },
          });

          const resText = response.text?.trim();
          if (resText && resText.length > 0) {
            reply = resText;
            usedModel = m;
            break;
          }
        } catch (mErr: any) {
          if (!lastError || mErr?.message?.includes('credits are depleted') || mErr?.message?.includes('RESOURCE_EXHAUSTED')) {
            lastError = mErr;
          }
          console.warn(`[handleAiMentor] Model ${m} failed, trying next candidate:`, mErr?.message || mErr);
        }
      }

      if (!reply) {
        throw new Error(lastError?.message || 'Los modelos de Gemini no pudieron procesar la consulta en este momento.');
      }

      return res.json({
        text: reply,
        reply,
        provider: 'gemini',
        model: usedModel,
      });
    } catch (error: any) {
      console.error('[handleAiMentor] Error:', error?.message || error);
      const errMsg = error?.message || '';
      let userFriendlyReply = `⚠️ Error al consultar el modelo de IA: ${errMsg || 'Por favor verifica tu conexión y credenciales de API.'}`;
      if (errMsg.includes('credits are depleted') || errMsg.includes('RESOURCE_EXHAUSTED')) {
        userFriendlyReply = `⚠️ **Créditos de API agotados (Google AI Studio)**:\n\nTu clave está configurada, pero Google informa que los créditos prepagos del proyecto están agotados o alcanzaron el límite diario de la cuota gratuita.\n\nPuedes:\n1. Revisar tu proyecto o recargar créditos en [ai.studio/projects](https://ai.studio/projects).\n2. O cambiar de proveedor en **Ajustes de IA** (ej. ingresar tu clave de OpenAI / ChatGPT o Qwen).`;
      }
      return res.status(500).json({
        error: errMsg || 'Error al procesar la consulta con el Mentor IA.',
        reply: userFriendlyReply,
      });
    }
  };

  app.post('/api/ai-mentor', handleAiMentor);
  app.post('/api/mentor/chat', handleAiMentor);

  // Vite middleware in dev or static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Biblia Inteligente running on http://localhost:${PORT}`);
  });
}

startServer();
