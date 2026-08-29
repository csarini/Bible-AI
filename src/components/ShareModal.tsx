import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Download,
  Mail,
  Send,
  MessageCircle,
  MessageSquare,
  Sparkles,
  Smartphone,
  Image as ImageIcon,
  Facebook,
  Twitter,
  ChevronDown,
  ChevronUp,
  ArrowLeft
} from 'lucide-react';
import { ShareContent, ShareService } from '../services/shareService';

interface ShareModalProps {
  isOpen: boolean;
  content: ShareContent | null;
  onClose: () => void;
  onToast: (msg: string) => void;
  currentTheme?: 'light' | 'sepia' | 'dark';
}

// Universal cross-browser rounded rectangle helper for HTML5 Canvas
function drawSafeRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  content,
  onClose,
  onToast,
  currentTheme = 'light'
}) => {
  const [copied, setCopied] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null);

  const isDark = currentTheme === 'dark';
  const isSepia = currentTheme === 'sepia';

  const modalBg = isDark
    ? 'bg-[#141824] text-[#F1F3F9] border-[#252D43]'
    : isSepia
    ? 'bg-[#FAF6EF] text-[#2D2319] border-[#705335]/25'
    : 'bg-[#FFFFFF] text-[#1B1C19] border-[#0B2B68]/15';

  const cardBg = isDark
    ? 'bg-[#1C2337] border-[#2B3964]'
    : isSepia
    ? 'bg-[#EFE7D8] border-[#705335]/20'
    : 'bg-[#FAF8F5] border-[#0B2B68]/15';

  const subText = isDark
    ? 'text-[#9AA5C2]'
    : isSepia
    ? 'text-[#705335]'
    : 'text-[#767683]';

  const headerTitle = isDark
    ? 'text-white'
    : isSepia
    ? 'text-[#3B2D1F]'
    : 'text-[#0B2B68]';

  const actionBtnHover = isDark
    ? 'bg-[#1C2337] hover:bg-[#252D43] border-[#2B3964] text-white'
    : isSepia
    ? 'bg-[#FAF6EF] hover:bg-[#EAE0D0] border-[#705335]/25 text-[#2D2319]'
    : 'bg-white hover:bg-[#EAE8E3] border-[#0B2B68]/15 text-[#0B2B68]';

  // Reset internal states when modal closes or opens with new content
  useEffect(() => {
    if (isOpen) {
      setCopied(false);
      setShowMoreOptions(false);
      setGeneratedImageUrl(null);
      setGeneratedBlob(null);
    }
  }, [isOpen, content?.reference]);

  if (!isOpen || !content) return null;

  const handleCopyText = async () => {
    const formatted = ShareService.formatVerseText(content);
    const success = await ShareService.copyToClipboard(formatted);
    if (success) {
      setCopied(true);
      onToast('¡Versículo copiado al portapapeles!');
      setTimeout(() => setCopied(false), 2200);
    } else {
      onToast('No se pudo copiar automáticamente.');
    }
  };

  const handleNativeShare = async () => {
    const status = await ShareService.nativeShare(content);
    if (status === 'shared') {
      onToast('Compartido exitosamente');
      onClose();
    } else if (status === 'copied') {
      setCopied(true);
      onToast('Copiado al portapapeles');
      setTimeout(() => setCopied(false), 2200);
    } else {
      setShowMoreOptions(true);
    }
  };

  const handleWhatsApp = () => {
    ShareService.shareToWhatsApp(content);
    onToast('Abriendo WhatsApp...');
  };

  const handleTelegram = () => {
    ShareService.shareToTelegram(content);
    onToast('Abriendo Telegram...');
  };

  const handleSMS = () => {
    ShareService.shareToSMS(content);
    onToast('Abriendo Mensajes...');
  };

  const handleFacebook = () => {
    ShareService.shareToFacebook(content);
  };

  const handleTwitter = () => {
    ShareService.shareToTwitter(content);
  };

  const handleEmail = () => {
    ShareService.shareToEmail(content);
  };

  /**
   * Generates a high-resolution 1080x1080 image card for social media and downloads/shares it
   */
  const handleGenerateAndShowImage = async () => {
    try {
      setIsGeneratingImage(true);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Canvas no disponible');
      }

      // High-resolution square format (1080 x 1080)
      canvas.width = 1080;
      canvas.height = 1080;

      // 1. Background Gradient (Deep Navy El-Shaddai palette)
      const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1080);
      bgGrad.addColorStop(0, '#082255');
      bgGrad.addColorStop(0.5, '#0B2B68');
      bgGrad.addColorStop(1, '#051433');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1080);

      // 2. Warm Radial Sunburst glow
      const glowGrad = ctx.createRadialGradient(540, 240, 40, 540, 240, 500);
      glowGrad.addColorStop(0, 'rgba(242, 92, 5, 0.32)');
      glowGrad.addColorStop(0.5, 'rgba(0, 163, 224, 0.15)');
      glowGrad.addColorStop(1, 'rgba(11, 43, 104, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, 1080, 1080);

      // 3. Double Border Framing
      ctx.strokeStyle = 'rgba(242, 92, 5, 0.45)';
      ctx.lineWidth = 4;
      ctx.strokeRect(40, 40, 1000, 1000);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      ctx.strokeRect(54, 54, 972, 972);

      // 4. Church Title & Header
      ctx.textAlign = 'center';
      ctx.fillStyle = '#F25C05';
      ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
      ctx.fillText('IGLESIA EL-SHADDAI', 540, 130);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'italic bold 36px Georgia, serif';
      ctx.fillText('Santuario de la Palabra', 540, 180);

      // Divider line
      ctx.strokeStyle = 'rgba(242, 92, 5, 0.6)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(430, 212);
      ctx.lineTo(650, 212);
      ctx.stroke();

      // Quotation Mark Symbol
      ctx.fillStyle = 'rgba(242, 92, 5, 0.3)';
      ctx.font = 'bold 100px Georgia, serif';
      ctx.fillText('“', 540, 315);

      // 5. Verse Text Word Wrapping
      const maxTextWidth = 840;
      const words = content.text.split(' ');
      const lines: string[] = [];
      let currentLine = '';

      ctx.font = 'italic 36px Georgia, serif';
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxTextWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);

      // Calculate vertical centering
      const lineHeight = 56;
      const startY = 530 - ((lines.length - 1) * lineHeight) / 2;
      ctx.fillStyle = '#FAF8F5';
      lines.forEach((line, idx) => {
        ctx.fillText(line, 540, startY + idx * lineHeight);
      });

      // 6. Reference Badge Box (Safe Rounded Rectangle)
      const refText = `${content.reference} (${content.translation || 'RVR1909'})`;
      ctx.font = 'bold 30px system-ui, -apple-system, sans-serif';
      const refMetrics = ctx.measureText(refText);
      const boxWidth = refMetrics.width + 64;
      const boxHeight = 58;
      const boxX = 540 - boxWidth / 2;
      const boxY = 820;

      ctx.fillStyle = 'rgba(242, 92, 5, 0.22)';
      ctx.strokeStyle = '#F25C05';
      ctx.lineWidth = 2.5;
      drawSafeRoundedRect(ctx, boxX, boxY, boxWidth, boxHeight, 28);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(refText, 540, boxY + 40);

      // 7. Footer
      ctx.font = '22px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.fillText('🕊️ Reina-Valera 1909 • Santuario Digital', 540, 960);

      // Convert Canvas to Blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          onToast('Error al crear la imagen.');
          setIsGeneratingImage(false);
          return;
        }

        const dataUrl = canvas.toDataURL('image/png');
        const filename = `Versiculo_${content.reference.replace(/[^a-zA-Z0-9]/g, '_')}_ElShaddai.png`;

        setGeneratedImageUrl(dataUrl);
        setGeneratedBlob(blob);
        setIsGeneratingImage(false);

        // Try direct mobile native file sharing first (iPhone/Android Share Sheet)
        const shared = await ShareService.nativeShareImageFile(
          blob,
          filename,
          `${content.reference} — Biblia El-Shaddai`,
          ShareService.formatVerseText(content)
        );

        if (!shared) {
          // If native share sheet wasn't triggered, attempt automatic download trigger
          try {
            const link = document.createElement('a');
            link.download = filename;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } catch (e) {
            // Ignore download trigger errors; visual preview is displayed
          }
        }
        onToast('Tarjeta generada con éxito.');
      }, 'image/png');
    } catch (err) {
      setIsGeneratingImage(false);
      onToast('No se pudo generar la tarjeta.');
    }
  };

  /**
   * Action when viewing the generated image
   */
  const handleDownloadDirect = () => {
    if (!generatedImageUrl || !content) return;
    const filename = `Versiculo_${content.reference.replace(/[^a-zA-Z0-9]/g, '_')}_ElShaddai.png`;
    const link = document.createElement('a');
    link.download = filename;
    link.href = generatedImageUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onToast('Descarga iniciada.');
  };

  const handleShareImageFileAgain = async () => {
    if (!generatedBlob || !content) return;
    const filename = `Versiculo_${content.reference.replace(/[^a-zA-Z0-9]/g, '_')}_ElShaddai.png`;
    const shared = await ShareService.nativeShareImageFile(
      generatedBlob,
      filename,
      `${content.reference} — Biblia El-Shaddai`,
      ShareService.formatVerseText(content)
    );
    if (!shared) {
      handleDownloadDirect();
    }
  };

  return (
    <div
      id="share-verse-modal-backdrop"
      className="fixed inset-0 z-60 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="share-verse-modal-card"
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-lg ${modalBg} rounded-3xl border shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 max-h-[94vh]`}
      >
        {/* Header Accent Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-[#F25C05] via-[#00A3E0] to-[#0B2B68]" />

        {/* Modal Top Bar */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
          isDark ? 'border-[#252D43]' : isSepia ? 'border-[#705335]/20' : 'border-[#0B2B68]/10'
        }`}>
          <div className="flex items-center gap-3">
            {generatedImageUrl ? (
              <button
                onClick={() => setGeneratedImageUrl(null)}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  isDark ? 'text-white hover:bg-white/10' : isSepia ? 'text-[#3B2D1F] hover:bg-[#EFE7D8]' : 'text-[#0B2B68] hover:bg-[#EAE8E3]'
                }`}
                title="Volver a opciones de texto"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-[#0B2B68] text-[#F25C05] p-2 flex items-center justify-center shadow-xs">
                <Share2 className="w-5 h-5" />
              </div>
            )}

            <div>
              <h3 className={`font-serif italic font-bold text-lg sm:text-xl ${headerTitle}`}>
                {generatedImageUrl ? 'Tarjeta Devocional Lista' : 'Compartir Versículo'}
              </h3>
              <p className={`text-xs font-sans font-semibold ${subText}`}>
                {content.reference} • Reina-Valera 1909
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              isDark ? 'text-[#9AA5C2] hover:text-white hover:bg-white/10' : isSepia ? 'text-[#705335] hover:text-[#3B2D1F] hover:bg-[#EFE7D8]' : 'text-[#767683] hover:text-[#0B2B68] hover:bg-[#EAE8E3]'
            }`}
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5">
          {generatedImageUrl ? (
            /* VIEW: Generated Image Card Preview & Mobile Save Instructions */
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border-2 border-[#F25C05]/40 bg-[#082255]">
                <img
                  src={generatedImageUrl}
                  alt={`Tarjeta ${content.reference}`}
                  className="w-full h-auto object-contain max-h-[380px] mx-auto block"
                />
              </div>

              <div className={`p-3 rounded-2xl border text-center space-y-1 ${cardBg}`}>
                <span className={`text-xs font-bold block ${headerTitle}`}>
                  💡 Tip para celular (iPhone o Android):
                </span>
                <p className={`text-xs ${isDark ? 'text-[#CBD5E1]' : isSepia ? 'text-[#5C4A3A]' : 'text-[#454652]'}`}>
                  Mantén presionada la imagen arriba y selecciona <strong>"Guardar en Fotos"</strong> o <strong>"Descargar imagen"</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleShareImageFileAgain}
                  className="w-full py-3 px-4 bg-[#0B2B68] text-white rounded-2xl font-sans font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-[#F25C05] transition-all shadow-xs cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-[#F25C05]" />
                  Enviar a WhatsApp / Redes
                </button>

                <button
                  type="button"
                  onClick={handleDownloadDirect}
                  className={`w-full py-3 px-4 rounded-2xl font-sans font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isDark
                      ? 'bg-[#1C2337] hover:bg-[#252D43] text-white border border-[#2B3964]'
                      : isSepia
                      ? 'bg-[#EFE7D8] hover:bg-[#E8DEC9] text-[#2D2319] border border-[#705335]/25'
                      : 'bg-[#EAE8E3] hover:bg-[#DEDCD7] text-[#0B2B68]'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  Descargar Archivo PNG
                </button>
              </div>
            </div>
          ) : (
            /* VIEW: Standard Text Share & Options Grid */
            <>
              {/* Visual Preview Card */}
              <div className="p-4 sm:p-5 bg-gradient-to-br from-[#082255] via-[#0B2B68] to-[#051433] rounded-2xl text-white shadow-md border border-[#F25C05]/30 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2.5 border-b border-white/10 pb-2">
                  <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#F25C05] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#F25C05]" />
                    Iglesia El-Shaddai
                  </span>
                  <span className="text-[11px] font-mono text-white/70">
                    {content.translation || 'RVR1909'}
                  </span>
                </div>

                <p className="font-serif italic text-sm sm:text-base leading-relaxed text-white/95 my-2">
                  «{content.text}»
                </p>

                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/10">
                  <span className="text-xs font-sans font-bold text-[#F25C05] bg-white/10 px-2.5 py-0.5 rounded-full border border-[#F25C05]/30">
                    {content.reference}
                  </span>
                  <span className="text-[11px] text-white/60">
                    Santuario Digital
                  </span>
                </div>
              </div>

              {/* Main Quick Action Grid */}
              <div>
                <span className={`text-xs font-sans font-bold uppercase tracking-wider block mb-2.5 ${subText}`}>
                  Compartir de inmediato:
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {/* WhatsApp Button */}
                  <button
                    type="button"
                    onClick={handleWhatsApp}
                    className={`p-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/40 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all hover:scale-[1.02] cursor-pointer shadow-2xs ${
                      isDark ? 'text-white' : isSepia ? 'text-[#2D2319]' : 'text-[#1B1C19]'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xs">
                      <MessageCircle className="w-5 h-5 fill-current" />
                    </div>
                    <span className="text-xs font-bold font-sans">WhatsApp</span>
                  </button>

                  {/* Telegram Button */}
                  <button
                    type="button"
                    onClick={handleTelegram}
                    className={`p-3 bg-[#0088CC]/10 hover:bg-[#0088CC]/20 border border-[#0088CC]/40 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all hover:scale-[1.02] cursor-pointer shadow-2xs ${
                      isDark ? 'text-white' : isSepia ? 'text-[#2D2319]' : 'text-[#1B1C19]'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-[#0088CC] text-white flex items-center justify-center shadow-xs">
                      <Send className="w-4 h-4 ml-0.5" />
                    </div>
                    <span className="text-xs font-bold font-sans">Telegram</span>
                  </button>

                  {/* Download / Create Image Card Button */}
                  <button
                    type="button"
                    onClick={handleGenerateAndShowImage}
                    disabled={isGeneratingImage}
                    className={`p-3 bg-[#F25C05]/10 hover:bg-[#F25C05]/20 border border-[#F25C05]/40 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all hover:scale-[1.02] cursor-pointer shadow-2xs disabled:opacity-50 ${
                      isDark ? 'text-white' : isSepia ? 'text-[#2D2319]' : 'text-[#1B1C19]'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-[#F25C05] text-white flex items-center justify-center shadow-xs">
                      {isGeneratingImage ? <Sparkles className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                    </div>
                    <span className="text-xs font-bold font-sans">
                      {isGeneratingImage ? 'Creando...' : 'Crear Tarjeta'}
                    </span>
                  </button>

                  {/* Copy Text Button */}
                  <button
                    type="button"
                    onClick={handleCopyText}
                    className={`p-3 border rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all hover:scale-[1.02] cursor-pointer shadow-2xs ${
                      copied
                        ? 'bg-[#107C41]/10 border-[#107C41] text-[#107C41]'
                        : isDark
                        ? 'bg-[#1C2337] hover:bg-[#252D43] border-[#2B3964] text-white'
                        : isSepia
                        ? 'bg-[#EFE7D8] hover:bg-[#E8DEC9] border-[#705335]/25 text-[#2D2319]'
                        : 'bg-[#0B2B68]/5 hover:bg-[#0B2B68]/10 border-[#0B2B68]/20 text-[#0B2B68]'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shadow-xs ${
                        copied ? 'bg-[#107C41] text-white' : 'bg-[#0B2B68] text-white'
                      }`}
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-4 h-4" />}
                    </div>
                    <span className="text-xs font-bold font-sans">
                      {copied ? '¡Copiado!' : 'Copiar Texto'}
                    </span>
                  </button>

                  {/* SMS / Messages */}
                  <button
                    type="button"
                    onClick={handleSMS}
                    className={`p-3 border rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all hover:scale-[1.02] cursor-pointer shadow-2xs ${
                      isDark
                        ? 'bg-[#1C2337] hover:bg-[#252D43] border-[#2B3964] text-white'
                        : isSepia
                        ? 'bg-[#EFE7D8] hover:bg-[#E8DEC9] border-[#705335]/25 text-[#2D2319]'
                        : 'bg-[#0B2B68]/5 hover:bg-[#0B2B68]/10 border-[#0B2B68]/20 text-[#1B1C19]'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-[#0B2B68] text-white flex items-center justify-center shadow-xs">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold font-sans">SMS / Mensaje</span>
                  </button>

                  {/* Native System Share / Expand Options */}
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
                        handleNativeShare();
                      } else {
                        setShowMoreOptions(!showMoreOptions);
                      }
                    }}
                    className={`p-3 bg-[#00A3E0]/10 hover:bg-[#00A3E0]/20 border border-[#00A3E0]/30 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all hover:scale-[1.02] cursor-pointer shadow-2xs ${
                      isDark ? 'text-white' : isSepia ? 'text-[#2D2319]' : 'text-[#1B1C19]'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-[#00A3E0] text-white flex items-center justify-center shadow-xs">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold font-sans">Más Opciones</span>
                  </button>
                </div>
              </div>

              {/* Collapsible Secondary Channels (Email, Facebook, Twitter, Direct Share) */}
              <div className={`border-t pt-3 ${
                isDark ? 'border-[#252D43]' : isSepia ? 'border-[#705335]/20' : 'border-[#0B2B68]/10'
              }`}>
                <button
                  type="button"
                  onClick={() => setShowMoreOptions(!showMoreOptions)}
                  className={`w-full flex items-center justify-between text-xs font-bold font-sans py-1 cursor-pointer transition-colors ${
                    isDark ? 'text-[#9AA5C2] hover:text-white' : isSepia ? 'text-[#705335] hover:text-[#3B2D1F]' : 'text-[#767683] hover:text-[#0B2B68]'
                  }`}
                >
                  <span>{showMoreOptions ? 'Ocultar otros canales' : 'Ver todos los canales de difusión'}</span>
                  {showMoreOptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showMoreOptions && (
                  <div className="grid grid-cols-3 gap-2 pt-3 animate-in fade-in slide-in-from-top-2 duration-150">
                    <button
                      type="button"
                      onClick={handleEmail}
                      className={`p-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer border transition-colors ${actionBtnHover}`}
                    >
                      <Mail className="w-4 h-4 text-[#F25C05]" />
                      <span>Correo</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleFacebook}
                      className={`p-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold text-[#1877F2] cursor-pointer border transition-colors ${actionBtnHover}`}
                    >
                      <Facebook className="w-4 h-4 fill-current" />
                      <span>Facebook</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleTwitter}
                      className={`p-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold text-[#1DA1F2] cursor-pointer border transition-colors ${actionBtnHover}`}
                    >
                      <Twitter className="w-4 h-4 fill-current" />
                      <span>Twitter / X</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className={`p-3 border-t text-center ${
          isDark
            ? 'bg-[#101420] border-[#252D43] text-[#7885A6]'
            : isSepia
            ? 'bg-[#EFE7D8]/80 border-[#705335]/20 text-[#705335]'
            : 'bg-[#EAE8E3]/60 border-[#0B2B68]/10 text-[#767683]'
        }`}>
          <p className="text-[11px] font-sans">
            Difundiendo la Palabra • Iglesia El-Shaddai
          </p>
        </div>
      </div>
    </div>
  );
};
