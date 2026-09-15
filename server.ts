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

  // Catalog of Available Bible Translations (Modo Offline)
  const BIBLE_CATALOG = [
    {
      id: 'valera',
      abbreviation: 'valera',
      name: 'Reina Valera (1909)',
      subtitle: 'Reina Valera 1909 (Edición Canónica / Valera)',
      source: 'offline',
      badge: 'Modo Offline',
      isOffline: true,
    },
    {
      id: 'sse',
      abbreviation: 'sse',
      name: 'Sagradas Escrituras (1569)',
      subtitle: 'Biblia del Oso 1569 (Casiodoro de Reina)',
      source: 'offline',
      badge: 'Histórica Offline',
      isOffline: true,
    },
    {
      id: 'rv1858',
      abbreviation: 'rv1858',
      name: 'Reina Valera NT (1858)',
      subtitle: 'Nuevo Testamento Revisión 1858',
      source: 'offline',
      badge: 'NT Offline',
      isOffline: true,
    },
  ];

  app.get('/api/bible/translations', (req, res) => {
    res.json({ translations: BIBLE_CATALOG });
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
Tu propósito fundamental es guiar y edificar al usuario en el estudio riguroso, devocional, exegético y pastoral de las Sagradas Escrituras.

DIRECTIVAS CRÍTICAS DE RESPUESTA:
1. COMPLETITUD ABSOLUTA Y ACABADO PERFECTO (OBLIGATORIO):
   - Cada respuesta DEBE ser COMPLETA, coherente y concluir de manera íntegra y natural.
   - NUNCA cortes una oración, párrafo o idea a la mitad. NUNCA termines con puntos suspensivos que indiquen un pensamiento inacabado.
   - Si inicias una lista, explicación o análisis exegético, desarróllalo y conclúyelo satisfactoriamente.

2. ESTRUCTURA OPTIMIZADA DE RESPUESTA (Utiliza formato Markdown claro y legible con encabezados o viñetas):
   - 📖 **Fundamento Bíblico**: Cita y contextualiza con exactitud los pasajes centrales (Libro Capítulo:Versículo) que responden directamente a la pregunta.
   - 🔍 **Análisis Exegético y Teológico**: Explica el significado bíblico con profundidad y claridad. Cuando aporte valor al texto, incluye el trasfondo etimológico en hebreo, arameo o griego bíblico y el contexto histórico.
   - 🕊️ **Aplicación Pastoral y Vida Práctica**: Traduce la verdad bíblica a la vida diaria del creyente (cómo orar, actuar, perdonar, perseverar y crecer en la fe).
   - 💡 **Reflexión de Cierre / Conclusión**: Una conclusión inspiradora, redonda y edificante que sintetice la enseñanza esencial.

3. CONSULTAS TEMÁTICAS (ej: "¿Qué dice la Biblia sobre la amistad?", "el perdón", "la ansiedad", etc.):
   - Aborda el tema de manera integral según el consejo de toda la Escritura (Antiguo y Nuevo Testamento).
   - Proporciona pasajes clave contextualizados y su aplicación espiritual sin omitir explicaciones necesarias.

4. ANÁLISIS DE VERSÍCULOS ESPECÍFICOS:
   - Analiza el contexto literario e histórico inmediato del capítulo y libro.
   - Profundiza en el significado doctrinal del texto y su relevancia para la vida cristiana contemporánea.

5. ALCANCE BÍBLICO Y ÉTICO:
   - El enfoque exclusivo es el estudio bíblico, la teología, la historia de la salvación y la vida espiritual.
   - Si la consulta es completamente ajena a la fe (ej. recetas de cocina, deportes o finanzas especulativas), declina amablemente diciendo: "Solo puedo responder preguntas relacionadas con el estudio bíblico, teológico y la vida espiritual."`;

      if (!prompt && !selectedVerse) {
        return res.status(400).json({ error: 'Por favor ingresa una pregunta o selecciona un versículo para consultar al Mentor IA.' });
      }

      // Enforce Clause III.B (Bíblica, Inc. License Agreement): AI Sanitization
      // Strictly prohibit sending copyrighted text into Generative AI payloads.
      const translationKey = String(req.body?.translation || selectedVerse?.translation || '').toLowerCase().trim();
      const isCopyrightedTranslation =
        translationKey === 'nvi' ||
        translationKey === 'nbla' ||
        translationKey === 'bes' ||
        translationKey.includes('ce11b813f9a27e20') ||
        translationKey.includes('b32b9d1b64b4ef29') ||
        translationKey === 'rvr1960' ||
        translationKey === 'lbla' ||
        translationKey === 'dhh';

      // Build optimized theological prompt
      let fullQuery = '';
      if (selectedVerse && selectedVerse.reference) {
        // Strip copyrighted verse text from LLM prompt
        const safeVerseText = isCopyrightedTranslation ? '' : (selectedVerse.text || '');
        const copyrightNote = isCopyrightedTranslation
          ? `\n*(Aviso de Copyright: Texto protegido de ${translationKey.toUpperCase()} omitido de la carga de IA según Cláusula III.B - Bíblica, Inc. El análisis teológico se fundamenta en la referencia canónica y manuscritos de dominio público).*`
          : '';

        fullQuery = `### PASAJE BÍBLICO DE REFERENCIA:\n` +
          `**Referencia:** ${selectedVerse.reference}\n` +
          (safeVerseText ? `**Texto Bíblico:** "${safeVerseText}"\n` : '') +
          copyrightNote +
          `\n### SOLICITUD DEL USUARIO:\n` +
          (prompt || 'Realiza un análisis teológico, exegético y pastoral completo de este versículo, explicando su contexto histórico, significado original y aplicación práctica para la vida cristiana de hoy.') +
          `\n\n### INSTRUCCIÓN DE OPTIMIZACIÓN Y COMPLETITUD:\n` +
          `Por favor proporciona una respuesta completa, fluida y con conclusión final. Desarrolla el Fundamento Bíblico, Análisis Exegético, Aplicación Práctica y Reflexión de cierre sin dejar oraciones truncadas.`;
      } else if (context) {
        fullQuery = `### CONTEXTO PREVIO DEL ESTUDIO:\n${context}\n\n` +
          `### PREGUNTA DEL USUARIO:\n${prompt}\n\n` +
          `### INSTRUCCIÓN DE OPTIMIZACIÓN Y COMPLETITUD:\n` +
          `Por favor proporciona una respuesta completa, fluida y con conclusión final. Desarrolla el Fundamento Bíblico, Análisis Exegético, Aplicación Práctica y Reflexión de cierre sin dejar oraciones truncadas.`;
      } else {
        fullQuery = `### CONSULTA TEOLÓGICA Y BÍBLICA:\n${prompt}\n\n` +
          `### INSTRUCCIÓN DE OPTIMIZACIÓN Y COMPLETITUD:\n` +
          `Por favor proporciona una respuesta completa, fluida y con conclusión final. Desarrolla el Fundamento Bíblico, Análisis Exegético, Aplicación Práctica y Reflexión de cierre sin dejar oraciones truncadas.`;
      }

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
            max_tokens: 2048,
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
            max_tokens: 2048,
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
      const geminiKey = userApiKey || process.env.GEMINI_API_KEY || DEFAULT_GEMINI_KEY;
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
        ? [customModel, 'gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest']
        : ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

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
              maxOutputTokens: 2048,
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
