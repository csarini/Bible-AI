import React, { useState } from 'react';
import {
  X,
  Send,
  Bug,
  Lightbulb,
  MessageSquare,
  Copy,
  Check,
  Mail,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { ChurchLogo } from './ChurchLogo';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme?: 'light' | 'sepia' | 'dark';
  onToast?: (message: string) => void;
  currentTranslation?: string;
  activeTabName?: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  currentTheme = 'light',
  onToast,
  currentTranslation = 'RVR1909',
  activeTabName = 'Inicio'
}) => {
  const [feedbackType, setFeedbackType] = useState<'bug' | 'suggestion' | 'general'>('bug');
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const isDark = currentTheme === 'dark';
  const isSepia = currentTheme === 'sepia';

  const recipientEmail = 'soporte@elshaddai.org';

  // System diagnostic info
  const systemInfo = {
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Desconocido',
    platform: typeof navigator !== 'undefined' ? navigator.platform : 'Desconocido',
    screenSize: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'Desconocido',
    theme: currentTheme,
    translation: currentTranslation,
    section: activeTabName,
    date: new Date().toLocaleString('es-ES')
  };

  const getSubject = () => {
    const typeLabel =
      feedbackType === 'bug'
        ? '[Bug / Error]'
        : feedbackType === 'suggestion'
        ? '[Sugerencia]'
        : '[Consulta / Comentario]';
    const cleanTitle = title.trim() || 'Nuevo reporte desde la App';
    return `Bug/Sugerencias: ${typeLabel} ${cleanTitle}`;
  };

  const getBodyText = () => {
    return `--- REPORTE DE USUARIO - SANTUARIO DIGITAL EL-SHADDAI ---
Tipo: ${feedbackType === 'bug' ? 'Reporte de Error / Bug' : feedbackType === 'suggestion' ? 'Sugerencia de Mejora' : 'Consulta General'}
Fecha: ${systemInfo.date}
Remitente: ${senderName.trim() || 'Anónimo'} ${senderEmail.trim() ? `(${senderEmail.trim()})` : ''}

ASUNTO:
${title.trim() || '(Sin asunto especificado)'}

DESCRIPCIÓN / DETALLES:
${description.trim() || '(Sin descripción)'}

--- INFORMACIÓN TÉCNICA DEL DISPOSITIVO ---
Sección actual: ${systemInfo.section}
Versión Bíblica: ${systemInfo.translation}
Tema: ${systemInfo.theme}
Resolución de pantalla: ${systemInfo.screenSize}
Navegador / Dispositivo: ${systemInfo.userAgent}
Plataforma: ${systemInfo.platform}
------------------------------------------------------------`;
  };

  const handleSendViaMailto = () => {
    if (!description.trim()) {
      if (onToast) onToast('Por favor escribe una descripción del error o sugerencia');
      return;
    }

    const subject = encodeURIComponent(getSubject());
    const body = encodeURIComponent(getBodyText());
    const mailtoUrl = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;

    window.location.href = mailtoUrl;

    if (onToast) {
      onToast('Abriendo tu aplicación de correo...');
    }
  };

  const handleOpenGmailWeb = () => {
    if (!description.trim()) {
      if (onToast) onToast('Por favor escribe una descripción del error o sugerencia');
      return;
    }

    const subject = encodeURIComponent(getSubject());
    const body = encodeURIComponent(getBodyText());
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipientEmail}&su=${subject}&body=${body}`;

    window.open(gmailUrl, '_blank');

    if (onToast) {
      onToast('Abriendo Gmail en una nueva pestaña...');
    }
  };

  const handleCopyToClipboard = () => {
    if (!description.trim()) {
      if (onToast) onToast('Escribe una descripción antes de copiar');
      return;
    }

    const textToCopy = `Asunto: ${getSubject()}\n\n${getBodyText()}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      if (onToast) onToast('¡Mensaje copiado! Puedes pegarlo en tu correo o WhatsApp');
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Theme-based tokens
  const containerBg = isDark
    ? 'bg-[#0E131F] text-[#F1F3F9]'
    : isSepia
    ? 'bg-[#F4ECE1] text-[#2D2319]'
    : 'bg-[#FAF8F5] text-[#1B1C19]';

  const cardBg = isDark
    ? 'bg-[#182033] border-[#252D43] text-white'
    : isSepia
    ? 'bg-[#EFE7D8] border-[#DECDB8] text-[#2D2319]'
    : 'bg-white border-[#E5E7EB] text-slate-800';

  const inputBg = isDark
    ? 'bg-[#121826] border-[#252D43] text-white placeholder-slate-500 focus:border-[#38BDF8]'
    : isSepia
    ? 'bg-[#FAF6EF] border-[#DECDB8] text-[#2D2319] placeholder-[#8A7156] focus:border-[#705335]'
    : 'bg-slate-50 border-[#E5E7EB] text-slate-900 placeholder-slate-400 focus:border-[#0B2B68]';

  const subtextColor = isDark
    ? 'text-[#9AA5C2]'
    : isSepia
    ? 'text-[#705335]'
    : 'text-[#64748B]';

  return (
    <div
      id="feedback-fullscreen-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex flex-col animate-in fade-in duration-200"
    >
      <div className={`min-h-screen w-full flex flex-col ${containerBg}`}>
        {/* Sticky Header */}
        <header
          className={`sticky top-0 z-30 px-4 sm:px-8 py-3.5 border-b backdrop-blur-md flex items-center justify-between gap-3 ${
            isDark
              ? 'bg-[#0E131F]/90 border-[#252D43]'
              : isSepia
              ? 'bg-[#F4ECE1]/90 border-[#DECDB8]'
              : 'bg-[#FAF8F5]/90 border-[#EAE8E3]'
          }`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                isDark
                  ? 'bg-[#182033] border-[#252D43] text-white hover:bg-[#252D43]'
                  : isSepia
                  ? 'bg-[#EFE7D8] border-[#DECDB8] text-[#5C452D] hover:bg-[#E2D5C1]'
                  : 'bg-white border-[#E5E7EB] text-[#0B2B68] hover:bg-slate-50'
              }`}
              title="Volver a la aplicación"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar</span>
            </button>

            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center p-0.5 border ${
                isDark ? 'bg-[#1C2337] border-[#3B49A8]/40' : isSepia ? 'bg-[#FAF6EF] border-[#705335]/20' : 'bg-white border-[#0B2B68]/15'
              }`}>
                <ChurchLogo size="xs" variant="symbol" showText={false} showSubtitle={false} theme={isDark ? 'dark' : isSepia ? 'sepia' : 'light'} />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold font-display leading-tight flex items-center gap-2">
                  <span>Errores y Sugerencias</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F47B20] text-white font-bold">
                    Feedback
                  </span>
                </h1>
                <p className={`text-[11px] ${subtextColor}`}>
                  Envío directo al <span className="font-semibold">Equipo de Desarrollo</span>
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleSendViaMailto}
            className="px-3.5 sm:px-5 py-2 rounded-xl bg-[#0B2B68] hover:bg-[#081F4B] text-[#FED65B] text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95 border border-[#FED65B]/30"
          >
            <Send className="w-4 h-4 text-[#FED65B]" />
            <span className="hidden sm:inline">Enviar Mensaje</span>
            <span className="sm:hidden">Enviar</span>
          </button>
        </header>

        {/* Content Container */}
        <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-6">
          {/* Intro Card */}
          <div className={`p-4 sm:p-5 rounded-2xl border shadow-sm ${cardBg} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#00A3E0]/15 text-[#00A3E0] flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5 text-[#F47B20]" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold">Tu opinión edifica la aplicación</h2>
                <p className={`text-xs ${subtextColor} mt-0.5 leading-relaxed`}>
                  Reporta fallos técnicos, solicita nuevas funciones o comparte ideas para mejorar el Santuario Digital de la Iglesia El-Shaddai.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <span className={`text-[11px] px-3 py-1 rounded-full border ${isDark ? 'bg-black/30 border-white/10' : 'bg-slate-100 border-slate-200'} flex items-center gap-1.5 font-medium`}>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Canal de Soporte Directo</span>
              </span>
            </div>
          </div>

          {/* Form */}
          <div className={`p-5 sm:p-7 rounded-3xl border shadow-md space-y-6 ${cardBg}`}>
            {/* Type Segmented Selection */}
            <div>
              <label className="block text-xs font-bold font-sans uppercase tracking-wider mb-2.5 opacity-80">
                1. ¿Qué deseas enviar?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: 'bug' as const,
                    label: 'Reportar un Error (Bug)',
                    desc: 'Problemas visuales, botones o fallos',
                    icon: Bug,
                    color: 'text-rose-500'
                  },
                  {
                    id: 'suggestion' as const,
                    label: 'Sugerencia de Mejora',
                    desc: 'Nuevas funciones o ideas',
                    icon: Lightbulb,
                    color: 'text-amber-500'
                  },
                  {
                    id: 'general' as const,
                    label: 'Comentario / Consulta',
                    desc: 'Dudas o agradecimientos',
                    icon: MessageSquare,
                    color: 'text-[#00A3E0]'
                  }
                ].map((item) => {
                  const IconC = item.icon;
                  const isSelected = feedbackType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFeedbackType(item.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#0B2B68] text-white border-[#0B2B68] shadow-md ring-2 ring-[#0B2B68]/30'
                          : isDark
                          ? 'bg-[#121826] border-[#252D43] text-slate-300 hover:bg-[#1A2234]'
                          : isSepia
                          ? 'bg-[#FAF6EF] border-[#DECDB8] text-[#4A3828] hover:bg-[#E5DAC6]'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <IconC className={`w-4 h-4 ${isSelected ? 'text-[#FED65B]' : item.color}`} />
                        <span className="text-xs sm:text-sm font-bold">{item.label}</span>
                      </div>
                      <span className={`text-[11px] ${isSelected ? 'text-white/80' : subtextColor}`}>
                        {item.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title / Subject */}
            <div>
              <label className="block text-xs font-bold font-sans uppercase tracking-wider mb-1.5 opacity-80">
                2. Título o Asunto del mensaje
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  feedbackType === 'bug'
                    ? 'Ej: El mapa no carga al seleccionar un viaje / Error al descargar afiche'
                    : feedbackType === 'suggestion'
                    ? 'Ej: Agregar opción de notas en audio / Modo lectura bíblica continua'
                    : 'Ej: Consulta sobre versiones bíblicas'
                }
                className={`w-full px-4 py-3 rounded-2xl border text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0B2B68] ${inputBg}`}
              />
              <p className={`text-[11px] ${subtextColor} mt-1`}>
                Asunto en el correo: <span className="font-mono font-semibold">{getSubject()}</span>
              </p>
            </div>

            {/* Description Textarea */}
            <div>
              <label className="block text-xs font-bold font-sans uppercase tracking-wider mb-1.5 opacity-80">
                3. Descripción detallada del mensaje
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  feedbackType === 'bug'
                    ? 'Por favor describe qué estabas haciendo cuando ocurrió el error, qué esperabas que sucediera y qué pasó en su lugar...'
                    : 'Escribe detalladamente tu idea, cómo te gustaría que funcione y cómo bendeciría tu estudio bíblico o a la congregación...'
                }
                required
                className={`w-full px-4 py-3 rounded-2xl border text-xs sm:text-sm font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#0B2B68] ${inputBg}`}
              />
            </div>

            {/* Sender Info (Optional) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div>
                <label className="block text-xs font-bold font-sans uppercase tracking-wider mb-1.5 opacity-80">
                  Tu Nombre (Opcional)
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Ej: Hermano / Usuario de la App"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none ${inputBg}`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold font-sans uppercase tracking-wider mb-1.5 opacity-80">
                  Tu Correo de Contacto (Opcional)
                </label>
                <input
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="Para responderte si es necesario"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none ${inputBg}`}
                />
              </div>
            </div>

            {/* Diagnostic Snapshot Box */}
            <div className={`p-3.5 rounded-2xl border text-xs ${isDark ? 'bg-black/25 border-white/10' : isSepia ? 'bg-[#FAF6EF]/60 border-[#DECDB8]' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-1.5 font-bold mb-1.5 text-[#00A3E0]">
                <Smartphone className="w-3.5 h-3.5 text-[#F47B20]" />
                <span>Datos técnicos adjuntos automáticamente para diagnóstico:</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] opacity-85">
                <div>
                  <span className="text-slate-400 block">Sección:</span>
                  <span className="font-semibold">{systemInfo.section}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Versión Bíblica:</span>
                  <span className="font-semibold">{systemInfo.translation}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Tema actual:</span>
                  <span className="font-semibold capitalize">{systemInfo.theme}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Pantalla:</span>
                  <span className="font-semibold">{systemInfo.screenSize}</span>
                </div>
              </div>
            </div>

            {/* Send & Action Buttons */}
            <div className="pt-3 border-t border-inherit/20 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Primary Button: Send via default mail client */}
                <button
                  type="button"
                  onClick={handleSendViaMailto}
                  className="w-full py-3 px-4 rounded-xl bg-[#0B2B68] hover:bg-[#081F4B] text-[#FED65B] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Mail className="w-4 h-4 text-[#FED65B]" />
                  <span>Enviar por App de Correo</span>
                </button>

                {/* Secondary Button: Open Gmail web */}
                <button
                  type="button"
                  onClick={handleOpenGmailWeb}
                  className={`w-full py-3 px-4 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isDark
                      ? 'bg-[#1C2337] border-[#252D43] text-white hover:bg-[#252D43]'
                      : isSepia
                      ? 'bg-[#FAF6EF] border-[#DECDB8] text-[#5C452D] hover:bg-[#E5DAC6]'
                      : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <ExternalLink className="w-4 h-4 text-[#EA4335]" />
                  <span>Abrir en Gmail Web</span>
                </button>
              </div>

              {/* Copy message button */}
              <button
                type="button"
                onClick={handleCopyToClipboard}
                className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer opacity-80 hover:opacity-100 ${
                  isDark ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-100'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '¡Copiado al portapapeles!' : 'Copiar texto para enviar manualmente'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
