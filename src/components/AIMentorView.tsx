import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, BookOpen, Bookmark, Copy, Check, RefreshCw, Church } from 'lucide-react';
import { BibleVerse } from '../types';
import { ShareService } from '../services/shareService';

interface AIMentorViewProps {
  initialVerse?: BibleVerse | null;
  onNavigateToVerse?: (bookId: string, chapter: number, verse: number) => void;
  onOpenSaveModal?: (text: string, reference: string) => void;
  currentTheme?: 'light' | 'sepia' | 'dark';
}

interface Message {
  id: string;
  role: 'user' | 'mentor';
  text: string;
  reference?: string;
  insights?: string[];
  greekHebrewRoot?: string;
}

export const AIMentorView: React.FC<AIMentorViewProps> = ({
  initialVerse,
  onNavigateToVerse,
  onOpenSaveModal,
  currentTheme = 'light'
}) => {
  const isDark = currentTheme === 'dark';
  const isSepia = currentTheme === 'sepia';
  const [inputQuery, setInputQuery] = useState(
    initialVerse ? `Explícame el contexto histórico y teológico de ${initialVerse.bookName} ${initialVerse.chapter}:${initialVerse.verse}` : ''
  );
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      role: 'mentor',
      text: '¡La paz de Cristo sea contigo! Soy tu Mentor Bíblico e Histórico de la Iglesia El-Shaddai. Puedes preguntarme sobre el contexto de cualquier pasaje bíblico, palabras clave en griego o hebreo original, o aplicaciones espirituales para tu vida.',
      insights: [
        'Exégesis y trasfondo histórico del antiguo Israel y la Iglesia Primitiva',
        'Estudio etimológico de términos originales (Shālôm, Agapē, Hésed, Metanoia)',
        'Armonía bíblica y aplicaciones devocionales prácticas'
      ]
    }
  ]);

  const presetTopics = [
    { title: 'Juan 3:16 y el amor Ágape', query: '¿Cuál es la profundidad teológica del término ágape y el contexto de Nicodemo en Juan 3:16?' },
    { title: 'Paz en Juan 14:27 (Eirēnē vs Pax Romana)', query: 'Explica la diferencia entre la paz que da Cristo (Eirēnē) y la Pax Romana según Juan 14:27.' },
    { title: 'Isaías 40:31 y las alas de águila (Qavah)', query: '¿Qué significa "esperar en Jehová" (Qavah) y la metáfora de las águilas en Isaías 40:31?' },
    { title: 'El significado de El-Shaddai (Génesis 17:1)', query: '¿Qué significa el nombre Dios Todopoderoso (El-Shaddai) en Génesis 17:1 y su relevancia hoy?' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleCopy = async (id: string, text: string) => {
    await ShareService.copyToClipboard(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || loading) return;

    const userMsgId = 'user-' + Date.now();
    const userMsg: Message = { id: userMsgId, role: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      // Call backend API /api/ai-mentor
      const response = await fetch('/api/ai-mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          selectedVerse: initialVerse
            ? {
                reference: `${initialVerse.bookName} ${initialVerse.chapter}:${initialVerse.verse}`,
                text: initialVerse.text
              }
            : undefined
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.text) {
          setMessages((prev) => [
            ...prev,
            {
              id: 'mentor-' + Date.now(),
              role: 'mentor',
              text: data.text,
              greekHebrewRoot: data.greekHebrewRoot,
              insights: data.insights
            }
          ]);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('API fetch encountered error, using local fallback:', err);
    }

    // Direct local scholarly response as guaranteed backup
    setTimeout(() => {
      let mentorResponse = '';
      let greekHebrewRoot = '';
      let insights: string[] = [];

      const q = textToSend.toLowerCase();
      if (q.includes('juan 3:16') || q.includes('ágape') || q.includes('agape') || q.includes('amor')) {
        mentorResponse = `En Juan 3:16, Jesús dialoga con Nicodemo, maestro de la ley. El vocablo griego utilizado es "Agapē" (ἀγάπη), que representa el amor incondicional, sublime y sacrificial que se entrega sin exigir mérito a cambio. La entrega del Hijo unigénito (*Monogenēs*) sella el pacto de redención eterna para todo aquel que cree.`;
        greekHebrewRoot = `Griego: ἀγάπη (Agapē) - Amor sacrificial / μονογενής (Monogenēs) - Único en su clase y majestad.`;
        insights = [
          'El amor de Dios no depende de nuestras obras, sino de su gracia infinita.',
          'La vida eterna (*zoē aiōnios*) es la comunión viva con Dios que experimentamos desde el presente.'
        ];
      } else if (q.includes('juan 14') || q.includes('paz') || q.includes('eirene')) {
        mentorResponse = `En Juan 14:27, la paz (*Eirēnē*) que Jesús promete no es un armisticio terrenal o la ausencia transitoria de dificultades. Es la reconciliación total y el reposo del alma en la soberanía de Dios, capaz de sostener al creyente en cualquier tormenta.`;
        greekHebrewRoot = `Hebreo: שָׁלוֹם (Shālôm) - Plenitud integral / Griego: εἰρήνη (Eirēnē) - Paz profunda y sosiego espiritual.`;
        insights = [
          'La paz del mundo es frágil; la paz de Cristo permanece inalterable ante las pruebas.',
          'Descansa en la promesa: "No se turbe vuestro corazón, ni tenga miedo".'
        ];
      } else if (q.includes('isaias 40') || q.includes('fuerzas') || q.includes('águila') || q.includes('qavah')) {
        mentorResponse = `En Isaías 40:31, el profeta proclama fortaleza a los cansados. El verbo hebreo "Qavah" (קָוָה) describe entrelazar fuertemente los hilos de nuestra debilidad humana con el poder ilimitado del Creador. Al esperar en Jehová, remontamos vuelo con la serenidad del águila sobre las corrientes adversas.`;
        greekHebrewRoot = `Hebreo: קָוָה (Qāvāh) - Esperar activamente con confianza y entrelazamiento de fe.`;
        insights = [
          'Esperar en Dios renueva tus fuerzas físicas, emocionales y espirituales.',
          'Aprovecha las pruebas para elevarte más alto en oración y comunión.'
        ];
      } else if (q.includes('el-shaddai') || q.includes('shaddai') || q.includes('todopoderoso')) {
        mentorResponse = `En Génesis 17:1, Dios se revela a Abram diciendo: "Yo soy el Dios Todopoderoso (El-Shaddai); anda delante de mí y sé perfecto". "El" denota soberanía y fuerza absoluta, mientras que "Shaddai" alude al Sustentador que nutre, provee y cuida con fidelidad inquebrantable a sus hijos.`;
        greekHebrewRoot = `Hebreo: אֵל שַׁדַּי (El-Shaddai) - El Dios Todopoderoso y Todo-Suficiente.`;
        insights = [
          'Para Dios no hay nada imposible; su poder sostiene cada aspecto de tu caminar.',
          'Caminar en integridad delante de Él es responder a su gracia y fidelidad.'
        ];
      } else {
        mentorResponse = `Al meditar en tu consulta sobre las Escrituras, la Palabra viva nos enseña a fundamentar nuestra vida en la verdad eterna de Cristo. Todo pasaje bíblico tiene el propósito de alumbrar nuestro entendimiento, renovar nuestra esperanza y guiarnos en justicia.`;
        greekHebrewRoot = `Hebreo: דָּבָר (Dabar) - La Palabra viva y creadora de Dios.`;
        insights = [
          'Guarda esta reflexión en tu devocional diario para meditar en ella.',
          'Pide al Espíritu Santo revelación continua mientras escudriñas las Escrituras.'
        ];
      }

      setMessages((prev) => [
        ...prev,
        {
          id: 'mentor-' + Date.now(),
          role: 'mentor',
          text: mentorResponse,
          greekHebrewRoot,
          insights
        }
      ]);
      setLoading(false);
    }, 400);
  };

  const headerTitleColor = isDark ? 'text-white' : isSepia ? 'text-[#3B2D1F]' : 'text-[#0B2B68]';
  const subtextColor = isDark ? 'text-white/60' : isSepia ? 'text-[#705335]' : 'text-[#454652]';
  const badgeBg = isDark
    ? 'bg-[#131722] text-white border-white/15'
    : isSepia
    ? 'bg-[#FAF6EF] text-[#3B2D1F] border-[#705335]/30'
    : 'bg-white text-[#0B2B68] border-[#0B2B68]/15';
  const chipBg = isDark
    ? 'bg-[#131722] text-white/90 border-white/15 hover:bg-[#F25C05] hover:text-white'
    : isSepia
    ? 'bg-[#FAF6EF] text-[#3B2D1F] border-[#705335]/30 hover:bg-[#F25C05] hover:text-white'
    : 'bg-white text-[#0B2B68] border-[#0B2B68]/20 hover:bg-[#F25C05] hover:text-white';
  const mentorCardBg = isDark
    ? 'bg-[#131722] border-white/10 text-white'
    : isSepia
    ? 'bg-[#FAF6EF] border-[#705335]/20 text-[#3B2D1F]'
    : 'bg-white border-[#0B2B68]/15 text-[#1B1C19]';
  const rootBoxBg = isDark
    ? 'bg-[#1C2337] border-white/15 text-white/90'
    : isSepia
    ? 'bg-[#FAF0E2] border-[#705335]/20 text-[#3B2D1F]'
    : 'bg-[#FAF8F5] border-[#0B2B68]/15 text-[#0B2B68]';
  const saveBtnBg = isDark
    ? 'bg-white/10 hover:bg-white/15 text-white border-white/15'
    : isSepia
    ? 'bg-[#EAE0D0] hover:bg-[#DFD3C0] text-[#3B2D1F] border-[#705335]/20'
    : 'bg-[#0B2B68]/5 hover:bg-[#0B2B68]/10 text-[#0B2B68] border-[#0B2B68]/10';

  return (
    <div id="ai-mentor-view" className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
      {/* Header with El-Shaddai Identity */}
      <header className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 ${isDark ? 'border-white/10' : isSepia ? 'border-[#705335]/20' : 'border-[#0B2B68]/15'}`}>
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-[#0B2B68] text-[#FED65B] shadow-xs">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className={`font-serif italic font-bold text-2xl sm:text-3xl ${headerTitleColor}`}>
              Mentor Teológico IA
            </h2>
          </div>
          <p className={`font-body-ui text-xs sm:text-sm mt-1 ${subtextColor}`}>
            Exégesis profunda, raíces en hebreo y griego bíblico, y aplicaciones prácticas para la vida cristiana.
          </p>
        </div>

        <div className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border shadow-2xs self-start sm:self-auto ${badgeBg}`}>
          <Church className="w-3.5 h-3.5 text-[#F25C05]" />
          <span>Iglesia El-Shaddai</span>
        </div>
      </header>

      {/* Preset Topics Chips */}
      <div className="space-y-2">
        <span className={`font-sans font-bold text-[11px] uppercase tracking-wider block ${subtextColor}`}>
          Temas y pasajes recomendados
        </span>
        <div className="flex flex-wrap gap-2">
          {presetTopics.map((topic, i) => (
            <button
              key={i}
              onClick={() => handleSend(topic.query)}
              className={`text-xs px-3.5 py-1.5 rounded-2xl border transition-all cursor-pointer shadow-2xs text-left font-medium ${chipBg}`}
            >
              {topic.title}
            </button>
          ))}
        </div>
      </div>

      {/* Chat / Insights Feed */}
      <div className="flex-1 space-y-4 min-h-[360px] max-h-[550px] overflow-y-auto pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in duration-200`}
          >
            <div
              className={`max-w-2xl rounded-3xl p-4 sm:p-5 shadow-xs border ${
                msg.role === 'user'
                  ? 'bg-[#0B2B68] text-white border-transparent rounded-br-xs'
                  : `${mentorCardBg} rounded-bl-xs`
              }`}
            >
              {msg.role === 'mentor' && (
                <div className={`flex items-center justify-between gap-2 mb-2.5 pb-2 border-b ${
                  isDark ? 'border-white/10' : isSepia ? 'border-[#705335]/15' : 'border-[#0B2B68]/10'
                }`}>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#F25C05]" />
                    <span className={`font-sans text-xs font-bold uppercase tracking-wide ${isDark ? 'text-[#FED65B]' : isSepia ? 'text-[#705335]' : 'text-[#0B2B68]'}`}>
                      Perspectiva Teológica
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(msg.id, msg.text)}
                    className={`p-1 rounded-lg transition-colors cursor-pointer ${
                      isDark ? 'hover:bg-white/10 text-white/60 hover:text-white' : isSepia ? 'hover:bg-[#EAE0D0] text-[#705335]' : 'hover:bg-[#FAF8F5] text-[#767683] hover:text-[#0B2B68]'
                    }`}
                    title="Copiar respuesta"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3.5 h-3.5 text-[#107C41]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}

              <p className={`font-body-reading text-[15px] sm:text-[16px] leading-relaxed whitespace-pre-line ${
                msg.role === 'user' ? 'text-white' : isDark ? 'text-white/90' : isSepia ? 'text-[#3B2D1F]' : 'text-[#1B1C19]'
              }`}>
                {msg.text}
              </p>

              {/* Greek / Hebrew Root Box */}
              {msg.greekHebrewRoot && (
                <div className={`mt-3.5 p-3 rounded-2xl border text-xs font-body-ui ${rootBoxBg}`}>
                  <strong className="font-bold block mb-1 text-[#F25C05] uppercase tracking-wide text-[10px]">
                    Raíz Bíblica Original & Etimología:
                  </strong>
                  <span className="leading-relaxed">{msg.greekHebrewRoot}</span>
                </div>
              )}

              {/* Key Insights List */}
              {msg.insights && msg.insights.length > 0 && (
                <div className={`mt-3.5 space-y-1.5 pt-2.5 border-t ${
                  isDark ? 'border-white/10' : isSepia ? 'border-[#705335]/15' : 'border-[#0B2B68]/10'
                }`}>
                  <strong className="text-[11px] font-sans font-bold text-[#F25C05] uppercase tracking-wide block">
                    Puntos Clave para Edificar la Fe:
                  </strong>
                  <ul className={`list-disc list-inside space-y-1 text-xs sm:text-[13px] font-body-ui ${
                    isDark ? 'text-white/70' : isSepia ? 'text-[#5C452D]' : 'text-[#454652]'
                  }`}>
                    {msg.insights.map((ins, iIndex) => (
                      <li key={iIndex}>{ins}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons for Mentor Messages */}
              {msg.role === 'mentor' && onOpenSaveModal && (
                <div className="mt-3.5 pt-2 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => onOpenSaveModal(msg.text, 'Reflexión Mentor IA')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${saveBtnBg}`}
                    title="Guardar reflexión en mis versículos"
                    aria-label="Guardar en Santuario"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-[#F47B20]" />
                    <span className="hidden sm:inline">Guardar en Santuario</span>
                    <span className="sm:hidden">Guardar</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className={`flex items-center gap-2.5 text-xs font-semibold p-3.5 rounded-2xl border w-fit shadow-xs animate-pulse ${
            isDark ? 'bg-[#131722] text-white border-white/15' : isSepia ? 'bg-[#FAF6EF] text-[#3B2D1F] border-[#705335]/20' : 'bg-white text-[#0B2B68] border-[#0B2B68]/15'
          }`}>
            <RefreshCw className="w-4 h-4 animate-spin text-[#F25C05]" />
            <span>Consultando exégesis, raíces bíblicas y registros históricos...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="relative flex items-center"
      >
        <input
          type="text"
          id="ai-mentor-input"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Pregunta sobre un pasaje bíblico, palabras en griego/hebreo, o teología..."
          className={`w-full border rounded-2xl pl-5 pr-14 py-3.5 text-sm sm:text-base font-body-ui shadow-sm transition-all outline-none ${
            isDark
              ? 'bg-[#131722] border-white/20 text-white placeholder:text-white/40 focus:border-[#FED65B] focus:ring-2 focus:ring-[#FED65B]/20'
              : isSepia
              ? 'bg-[#FAF6EF] border-[#705335]/30 text-[#3B2D1F] placeholder:text-[#705335]/60 focus:border-[#705335] focus:ring-2 focus:ring-[#705335]/20'
              : 'bg-white border-[#0B2B68]/20 text-[#1B1C19] placeholder:text-[#9E9EA7] focus:border-[#F25C05] focus:ring-2 focus:ring-[#F25C05]/30'
          }`}
        />
        <button
          type="submit"
          id="ai-mentor-send-btn"
          disabled={!inputQuery.trim() || loading}
          className="absolute right-2 p-2.5 rounded-xl bg-[#0B2B68] text-[#FED65B] disabled:opacity-40 hover:bg-[#F25C05] hover:text-white transition-all cursor-pointer shadow-xs"
          title="Enviar consulta"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
