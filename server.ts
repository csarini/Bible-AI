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

  // AI Mentor endpoint with Gemini & strict theological system prompt
  const handleAiMentor = async (req: express.Request, res: express.Response) => {
    try {
      const prompt = req.body.prompt || req.body.message || '';
      const selectedVerse = req.body.selectedVerse;
      const context = req.body.context;
      const apiKey = process.env.GEMINI_API_KEY;

      const REFUSAL_TEXT = 'Solo puedo responder preguntas relacionadas con el estudio bíblico y teológico.';

      // Check for clearly secular/non-biblical queries
      const queryLower = (prompt || '').toLowerCase();
      const secularPatterns = [
        'receta de cocina', 'quien gano el partido', 'futbol', 'fútbol',
        'criptomoneda', 'bitcoin', 'comprar acciones', 'pronostico del clima',
        'pronóstico del clima', 'horoscopo', 'horóscopo', 'signo zodiacal',
        'reparar motor', 'programar en python', 'codigo javascript',
        'restaurante de sushi', 'precio del dolar', 'precio del dólar',
        'ganar la loteria', 'pelicula de accion'
      ];
      if (secularPatterns.some(p => queryLower.includes(p))) {
        return res.json({
          text: REFUSAL_TEXT,
          reply: REFUSAL_TEXT,
          greekHebrewRoot: 'Filtro de alineación teológica activo.',
          insights: ['El Mentor IA está dedicado exclusivamente al estudio de las Sagradas Escrituras.']
        });
      }

      const baseContext = selectedVerse
        ? `Versículo seleccionado: ${selectedVerse.reference} ("${selectedVerse.text}")\nConsulta del usuario: ${prompt || 'Explica el trasfondo y significado de este versículo'}`
        : context
          ? `Contexto bíblico: ${context}\nConsulta del usuario: ${prompt}`
          : `Consulta bíblica / teológica: ${prompt || '¿Cuál es el mensaje central de la Biblia?'}`;

      if (apiKey) {
        try {
          const ai = new GoogleGenAI({
            apiKey,
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build'
              }
            }
          });

          const systemInstruction = `Eres el "Mentor IA" de "Biblia Inteligente (Digital Sanctuary)".
Tu única función y propósito es guiar al usuario en el estudio riguroso, devocional y teológico de las Sagradas Escrituras.

REGLAS ESTRICTAS DE ALINEACIÓN TEOLÓGICA:
1. ALCANCE TEMÁTICO: Responde EXCLUSIVAMENTE sobre:
   - Teología bíblica, patrística, sistemática y devocional.
   - Contexto histórico, cultural, arqueológico y geográfico de los pasajes de la Biblia.
   - Análisis lingüístico y etimológico de las lenguas bíblicas originales (hebreo, arameo y griego koiné: p. ej. Hesed, Shalom, Agape, Logos).
   - Hermenéutica, exégesis bíblica y aplicación espiritual o ética en la vida diaria del creyente.
2. REGLA DE RECHAZO ESTRICTA (REFUSAL RULE): Si la pregunta del usuario es de carácter secular, no-bíblica, tecnológica mundana, deportiva, política no relacionada con el texto sagrado, entretenimiento general, o ajena a las Sagradas Escrituras y el estudio espiritual, debes negarte categórica y cortésmente respondiendo ÚNICA Y EXACTAMENTE:
"Solo puedo responder preguntas relacionadas con el estudio bíblico y teológico."
3. TONO Y ESTILO: Reverente, pastoral, erudito, claro, cristocéntrico y esperanzador.`;

          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: baseContext,
            config: {
              systemInstruction,
              temperature: 0.3
            }
          });

          const responseText = response.text;
          if (responseText && responseText.trim().length > 0) {
            const cleanText = responseText.trim();
            return res.json({
              text: cleanText,
              reply: cleanText,
              greekHebrewRoot: 'Exégesis bíblica verificada con Gemini AI (Digital Sanctuary).',
              insights: [
                'Medita en este principio en tu tiempo devocional de hoy.',
                'Aplica la verdad bíblica en tus decisiones cotidianas.'
              ]
            });
          }
        } catch (apiError: any) {
          console.error('Gemini API call error in /api/ai-mentor:', apiError?.message || apiError);
        }
      }

      // Intelligent scholarly fallback when API key is unset or network issue occurs
      let fallbackText = '';
      let greekHebrewRoot = 'Exégesis contextual y cristocéntrica.';
      let insights = [
        'Medita en la implicación de este pasaje en tu oración diaria.',
        'La Palabra de Dios es viva, eficaz y fuente inagotable de sabiduría.'
      ];

      if (queryLower.includes('juan 3:16') || queryLower.includes('ágape') || queryLower.includes('amor')) {
        fallbackText = `En Juan 3:16, el amor divino se revela en su máxima expresión sacrificial. Jesús dialoga con Nicodemo, maestro de la ley, revelándole que la salvación universal está fundada en el amor incondicional del Padre al entregar a su Hijo unigénito (*Monogenēs*).`;
        greekHebrewRoot = `Griego: ἀγάπη (Agapē) - Amor sacrificial y desinteresado / μονογενής (Monogenēs) - Hijo único y soberano.`;
        insights = [
          'El amor de Dios no es una emoción pasajera, sino un pacto eterno demostrado en la cruz.',
          'La vida eterna (*zoē aiōnios*) comienza en el momento en que depositamos nuestra confianza en Cristo.'
        ];
      } else if (queryLower.includes('paz') || queryLower.includes('juan 14') || queryLower.includes('shalom')) {
        fallbackText = `La paz que Cristo ofrece a sus discípulos en Juan 14:27 trasciende el entendimiento humano. No depende de la ausencia de aflicciones externas, sino de la presencia constante del Espíritu Santo y la reconciliación total con Dios.`;
        greekHebrewRoot = `Hebreo: שָׁלוֹם (Shālôm) - Plenitud y bienestar integral / Griego: εἰρήνη (Eirēnē) - Reconciliación espiritual con Dios.`;
        insights = [
          'La paz del mundo es temporal; la paz de Cristo permanece en medio de las pruebas.',
          'Entrega tus cargas en oración para experimentar la serenidad de Dios.'
        ];
      } else if (queryLower.includes('fuerza') || queryLower.includes('isaias 40') || queryLower.includes('águila') || queryLower.includes('qavah')) {
        fallbackText = `En Isaías 40:31, el profeta consuela al pueblo recordando que el Dios eterno no se cansa ni se fatiga. El vocablo hebreo "Qāvāh" alude a entrelazar firmemente nuestra fe humana con la fuerza omnipotente del Creador.`;
        greekHebrewRoot = `Hebreo: קָוָה (Qāvāh) - Esperar activamente entrelazando nuestra fe con la fuerza divina.`;
        insights = [
          'Esperar en Dios no es inactividad, sino dependencia confiada en su poder.',
          'Las águilas usan las corrientes de la tormenta para elevarse más alto.'
        ];
      } else if (selectedVerse) {
        fallbackText = `Al examinar ${selectedVerse.reference}: "${selectedVerse.text}", observamos la fidelidad inmutable de Dios. Este pasaje nos invita a profundizar en el pacto divino, reconociendo que cada palabra de la Escritura está inspirada para enseñar, redargüir y perfeccionar al creyente en Cristo.`;
        greekHebrewRoot = `Hermenéutica teológica: Principio de revelación progresiva y gracia transformadora.`;
        insights = [
          'Reflexiona en la verdad de este versículo y cómo guía tus pasos hoy.',
          'Puedes guardar este pasaje con tus notas personales en tu Santuario.'
        ];
      } else {
        fallbackText = `En las Sagradas Escrituras encontramos dirección divina para cada área de nuestra vida. Al meditar en tu consulta ("${prompt}"), la teología bíblica nos enseña a buscar primeramente el Reino de Dios y su justicia, anclando nuestras convicciones en las promesas del Todopoderoso (El-Shaddai).`;
        greekHebrewRoot = `Hebreo: אֵל שַׁדַּי (El-Shaddai) - Dios Todopoderoso y autosuficiente.`;
        insights = [
          'Permite que la Palabra more en abundancia en tu corazón.',
          'Ora pidiendo discernimiento para aplicar los principios bíblicos en tu día a día.'
        ];
      }

      res.json({
        text: fallbackText,
        reply: fallbackText,
        greekHebrewRoot,
        insights
      });
    } catch (error: any) {
      console.error('Unhandled error in /api/ai-mentor:', error);
      res.json({
        text: 'Las Escrituras son lámpara a nuestros pies y lumbrera a nuestro camino (Salmo 119:105). Reflexiona en las promesas divinas y la gracia de Cristo para tu vida.',
        reply: 'Las Escrituras son lámpara a nuestros pies y lumbrera a nuestro camino (Salmo 119:105). Reflexiona en las promesas divinas y la gracia de Cristo para tu vida.',
        greekHebrewRoot: 'Hebreo: דָּבָר (Dabar) - La Palabra viva de Dios.',
        insights: [
          'Confía en la dirección del Espíritu Santo en tu lectura bíblica.',
          'Guarda tus pasajes favoritos para repasarlos durante el día.'
        ]
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
