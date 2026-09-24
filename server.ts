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

  // ----------------------------------------------------
  // Admin Hub & Church API Endpoints (MVP 2 Gateway)
  // ----------------------------------------------------
  let inMemoryMemberships: any[] = [
    {
      id: 'req_flutter_001',
      churchId: 'church_elshaddai_central',
      churchName: 'Iglesia El-Shaddai Central',
      annexId: 'annex_central',
      annexName: 'Templo Principal',
      fullName: 'Carlos Mendoza Ramos',
      email: 'carlos.mendoza@email.com',
      phone: '+56 9 8765 4321',
      requestedRole: 'member',
      status: 'pending',
      notes: 'Miembro recién trasladado desde Valparaíso. Deseo participar en el ministerio de alabanza.',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'req_flutter_002',
      churchId: 'church_elshaddai_central',
      churchName: 'Iglesia El-Shaddai Central',
      annexId: 'annex_norte',
      annexName: 'Anexo Sector Norte',
      fullName: 'Camila Andrea Véliz',
      email: 'camila.veliz@email.com',
      phone: '+56 9 7654 3210',
      requestedRole: 'event_coordinator',
      status: 'pending',
      notes: 'Experiencia en logística de eventos de jóvenes y escuela dominical infantil.',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 'req_flutter_003',
      churchId: 'church_elshaddai_central',
      churchName: 'Iglesia El-Shaddai Central',
      annexId: 'annex_sur',
      annexName: 'Anexo Cordillera',
      fullName: 'Patricio Morales Vega',
      email: 'patricio.m@email.com',
      phone: '+56 9 9123 4567',
      requestedRole: 'food_court_manager',
      status: 'pending',
      notes: 'Certificación de manipulación de alimentos. Apoyo para el comedor comunitario y cafetería.',
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    {
      id: 'req_flutter_004',
      churchId: 'church_elshaddai_central',
      churchName: 'Iglesia El-Shaddai Central',
      annexId: 'annex_central',
      annexName: 'Templo Principal',
      fullName: 'Elena Fuentes Miranda',
      email: 'elena.f@email.com',
      phone: '+56 9 6543 2109',
      requestedRole: 'member',
      assignedRole: 'member',
      status: 'approved',
      notes: 'Bautizada en 2021. Solicitud confirmada presencialmente en el servicio dominical.',
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      reviewedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      reviewedBy: 'Pastor David Ben-David',
    },
  ];

  let inMemoryFoodItems: any[] = [
    {
      id: 'food_001',
      churchId: 'church_elshaddai_central',
      name: 'Almuerzo Familiar: Pastel de Choclo Criollo',
      description: 'Tradicional pastel horneado de choclo con pino de vacuno, huevo duro y aceituna.',
      category: 'meals',
      price: 4500,
      shift: 'day',
      isAvailable: true,
      prepTimeMinutes: 15,
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80',
      tags: ['Especial Domingo', 'Casero'],
    },
    {
      id: 'food_002',
      churchId: 'church_elshaddai_central',
      name: 'Café de Grano & Medialuna Artesanal',
      description: 'Café tostado recién pasado acompañado de medialuna tibia glaseada.',
      category: 'combos',
      price: 2200,
      shift: 'both',
      isAvailable: true,
      prepTimeMinutes: 5,
      imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&auto=format&fit=crop&q=80',
      tags: ['Refrigerio', 'Popular'],
    },
    {
      id: 'food_003',
      churchId: 'church_elshaddai_central',
      name: 'Empanada de Horno Pino Especial',
      description: 'Empanada horneada en masa de mantequilla con abundante carne picada a mano.',
      category: 'snacks',
      price: 2500,
      shift: 'both',
      isAvailable: true,
      prepTimeMinutes: 5,
      imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&auto=format&fit=crop&q=80',
      tags: ['Horneado'],
    },
    {
      id: 'food_004',
      churchId: 'church_elshaddai_central',
      name: 'Sopaipillas Pasadas con Chancaca & Canela',
      description: 'Porción de 3 sopaipillas bañadas en salsa tibia de chancaca, canela y cáscara de naranja.',
      category: 'snacks',
      price: 1800,
      shift: 'night',
      isAvailable: true,
      prepTimeMinutes: 10,
      imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop&q=80',
      tags: ['Turno Noche', 'Reunión Jóvenes'],
    },
  ];

  let inMemoryEvents: any[] = [
    {
      id: 'evt_001',
      churchId: 'church_elshaddai_central',
      annexId: 'annex_central',
      annexName: 'Templo Central',
      title: 'Culto de Adoración & Santa Cena Familiar',
      description: 'Servicio general dominical con ordenanza de la Cena del Señor y predicación expositiva en Romanos 8.',
      speaker: 'Pastor David Ben-David',
      eventDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      startTime: '10:30',
      endTime: '12:45',
      location: 'Santuario Principal, Av. La Paz 1420',
      hasFoodService: true,
      hasChildcare: true,
      hasBookSales: true,
      maxCapacity: 450,
      registeredCount: 312,
      status: 'published',
      linkedPassage: 'Romanos 8:31-39',
    },
  ];

  let inMemoryBroadcasts: any[] = [
    {
      id: 'fcm_001',
      churchId: 'church_elshaddai_central',
      targetTopic: 'church_all',
      topicLabel: 'Toda la Congregación (General)',
      title: '🕊️ Vigilia Unida de Oración: "El Shaddai es Fiel"',
      body: 'Este viernes a las 20:00 hrs nos reunimos en el Templo Central. Habrá cafetería disponible.',
      priority: 'high',
      deepLink: 'biblia://events',
      sentAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      sentBy: 'Pastor David Ben-David',
      deliveredCount: 412,
      status: 'sent',
    },
  ];

  // Mobile join endpoint (Flutter mobile app uses POST /api/v1/churches/join)
  app.post('/api/v1/churches/join', (req, res) => {
    const { churchId, churchName, annexId, annexName, fullName, email, phone, requestedRole, notes } = req.body;
    if (!churchId || !fullName || !email) {
      return res.status(400).json({ error: 'Faltan campos obligatorios para unirse a la iglesia' });
    }
    const newReq = {
      id: `req_${Date.now()}`,
      churchId,
      churchName: churchName || 'Iglesia El-Shaddai Central',
      annexId: annexId || 'annex_central',
      annexName: annexName || 'Templo Principal',
      fullName,
      email,
      phone: phone || '',
      requestedRole: requestedRole || 'member',
      status: 'pending',
      notes: notes || '',
      createdAt: new Date().toISOString(),
    };
    inMemoryMemberships.unshift(newReq);
    res.status(201).json({ success: true, request: newReq });
  });

  // Admin Memberships
  app.get('/api/v1/admin/memberships', (req, res) => {
    const { status, churchId } = req.query;
    let list = [...inMemoryMemberships];
    if (churchId) list = list.filter((r) => r.churchId === churchId);
    if (status && status !== 'all') list = list.filter((r) => r.status === status);
    res.json({ requests: list });
  });

  app.patch('/api/v1/admin/memberships/:id/approve', (req, res) => {
    const { id } = req.params;
    const { assignedRole, reviewerName } = req.body;
    const item = inMemoryMemberships.find((r) => r.id === id);
    if (!item) return res.status(404).json({ error: 'Solicitud no encontrada' });
    item.status = 'approved';
    item.assignedRole = assignedRole || item.requestedRole;
    item.reviewedAt = new Date().toISOString();
    item.reviewedBy = reviewerName || 'Pastor Admin';
    res.json({ success: true, request: item });
  });

  app.patch('/api/v1/admin/memberships/:id/reject', (req, res) => {
    const { id } = req.params;
    const { reason, reviewerName } = req.body;
    const item = inMemoryMemberships.find((r) => r.id === id);
    if (!item) return res.status(404).json({ error: 'Solicitud no encontrada' });
    item.status = 'rejected';
    item.notes = reason ? `${item.notes ? `${item.notes} | ` : ''}Rechazo: ${reason}` : item.notes;
    item.reviewedAt = new Date().toISOString();
    item.reviewedBy = reviewerName || 'Pastor Admin';
    res.json({ success: true, request: item });
  });

  // Food Court
  app.get('/api/v1/admin/food-court', (req, res) => {
    const { shift, category } = req.query;
    let list = [...inMemoryFoodItems];
    if (shift && shift !== 'all') list = list.filter((i) => i.shift === shift || i.shift === 'both');
    if (category && category !== 'all') list = list.filter((i) => i.category === category);
    res.json({ items: list });
  });

  app.post('/api/v1/admin/food-court', (req, res) => {
    const newItem = { ...req.body, id: `food_${Date.now()}` };
    inMemoryFoodItems.unshift(newItem);
    res.status(201).json({ success: true, item: newItem });
  });

  app.put('/api/v1/admin/food-court/:id', (req, res) => {
    const { id } = req.params;
    const idx = inMemoryFoodItems.findIndex((i) => i.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Item no encontrado' });
    inMemoryFoodItems[idx] = { ...inMemoryFoodItems[idx], ...req.body };
    res.json({ success: true, item: inMemoryFoodItems[idx] });
  });

  app.patch('/api/v1/admin/food-court/:id/availability', (req, res) => {
    const { id } = req.params;
    const { isAvailable } = req.body;
    const item = inMemoryFoodItems.find((i) => i.id === id);
    if (!item) return res.status(404).json({ error: 'Item no encontrado' });
    item.isAvailable = !!isAvailable;
    res.json({ success: true, item });
  });

  app.delete('/api/v1/admin/food-court/:id', (req, res) => {
    const { id } = req.params;
    inMemoryFoodItems = inMemoryFoodItems.filter((i) => i.id !== id);
    res.json({ success: true });
  });

  // Events
  app.get('/api/v1/admin/events', (req, res) => {
    res.json({ events: inMemoryEvents });
  });

  app.post('/api/v1/admin/events', (req, res) => {
    const newEvt = { ...req.body, id: `evt_${Date.now()}` };
    inMemoryEvents.unshift(newEvt);
    res.status(201).json({ success: true, event: newEvt });
  });

  app.put('/api/v1/admin/events/:id', (req, res) => {
    const { id } = req.params;
    const idx = inMemoryEvents.findIndex((e) => e.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Evento no encontrado' });
    inMemoryEvents[idx] = { ...inMemoryEvents[idx], ...req.body };
    res.json({ success: true, event: inMemoryEvents[idx] });
  });

  app.delete('/api/v1/admin/events/:id', (req, res) => {
    const { id } = req.params;
    inMemoryEvents = inMemoryEvents.filter((e) => e.id !== id);
    res.json({ success: true });
  });

  // Announcements / FCM Broadcast
  app.get('/api/v1/admin/announcements/broadcast', (req, res) => {
    res.json({ broadcasts: inMemoryBroadcasts });
  });

  app.post('/api/v1/admin/announcements/broadcast', (req, res) => {
    const { targetTopic, topicLabel, title, body, priority, deepLink, sentBy } = req.body;
    const newBroadcast = {
      id: `fcm_${Date.now()}`,
      churchId: 'church_elshaddai_central',
      targetTopic: targetTopic || 'church_all',
      topicLabel: topicLabel || 'General',
      title,
      body,
      priority: priority || 'normal',
      deepLink: deepLink || 'biblia://events',
      sentAt: new Date().toISOString(),
      sentBy: sentBy || 'Pastor David',
      deliveredCount: 380,
      status: 'sent',
    };
    inMemoryBroadcasts.unshift(newBroadcast);
    res.status(201).json({ success: true, broadcast: newBroadcast });
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
