import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Download,
  Calendar,
  Clock,
  MapPin,
  Ticket,
  ExternalLink,
  MessageCircle,
  Facebook,
  Mail,
  Smartphone
} from 'lucide-react';
import { UserEvent, EventCategory } from '../types';
import { ChurchLogo } from './ChurchLogo';
import { getMapsUrlForLocation } from '../services/storageService';

interface EventShareModalProps {
  isOpen: boolean;
  event: UserEvent | null;
  category?: EventCategory;
  onClose: () => void;
  onToast?: (msg: string) => void;
  currentTheme?: 'light' | 'sepia' | 'dark';
}

function formatDateSpanish(dateString: string): string {
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
  } catch (e) {
    // fallback
  }
  return dateString;
}

export const EventShareModal: React.FC<EventShareModalProps> = ({
  isOpen,
  event,
  category,
  onClose,
  onToast,
  currentTheme = 'light'
}) => {
  const [copied, setCopied] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const flyerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCopied(false);
    setIsGeneratingImage(false);
  }, [isOpen, event]);

  if (!isOpen || !event) return null;

  const isDark = currentTheme === 'dark';
  const isSepia = currentTheme === 'sepia';

  const catColor = category?.colorHex || '#0B2B68';
  const catName = category?.name || 'Evento Especial';
  const formattedDate = formatDateSpanish(event.eventDate);
  const hasCustomImage = Boolean(event.imageUrl && event.imageUrl.trim());

  // Concise text containing ONLY key data:
  // Title, Category, Date, Schedule (if present), Location (if present), Price (if present)
  const generateShareText = () => {
    let text = `✨ *${event.title.toUpperCase()}* ✨\n`;
    text += `🏛️ *Categoría:* ${catName}\n`;
    text += `📅 *Fecha:* ${formattedDate}\n`;
    
    if (event.startTime) {
      text += `⏰ *Horario:* ${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}\n`;
    }
    if (event.location) {
      text += `📍 *Lugar:* ${event.location}\n`;
    }
    if (event.price) {
      text += `🎟️ *Inversión / Entrada:* ${event.price}\n`;
    }

    text += `\n🕊️ _Iglesia El-Shaddai • Santuario Digital_`;
    return text;
  };

  const handleCopyText = async () => {
    const text = generateShareText();
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      if (onToast) onToast('¡Invitación copiada al portapapeles!');
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      if (onToast) onToast('No se pudo copiar');
    }
  };

  const handleWhatsAppShare = () => {
    const text = generateShareText();
    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleFacebookShare = () => {
    const text = generateShareText();
    const encodedText = encodeURIComponent(text);
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodedText}`;
    window.open(shareUrl, '_blank', 'width=600,height=500');
  };

  const handleEmailShare = () => {
    const text = generateShareText();
    const subject = encodeURIComponent(`Invitación: ${event.title}`);
    const body = encodeURIComponent(text);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleSmsShare = () => {
    const text = generateShareText();
    const body = encodeURIComponent(text);
    window.open(`sms:?&body=${body}`, '_blank');
  };

  const handleNativeShare = async () => {
    const text = generateShareText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: text
        });
      } catch (err) {
        // User dismissed
      }
    } else {
      handleCopyText();
    }
  };

  // Draw High-Resolution Church Logo Emblem on Canvas
  const drawChurchLogoEmblem = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, scale: number = 1.0) => {
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);

    // Shift coordinate system so 400x280 SVG viewBox is centered at (0,0)
    ctx.translate(-200, -140);

    // 1. Sunburst Rays in Orange Gradient
    const rayGrad = ctx.createLinearGradient(200, 20, 200, 180);
    rayGrad.addColorStop(0, '#F97316');
    rayGrad.addColorStop(0.6, '#EA580C');
    rayGrad.addColorStop(1, '#C2410C');
    ctx.fillStyle = rayGrad;

    // Ray 1 (Left wing)
    ctx.beginPath();
    ctx.moveTo(24, 150);
    ctx.bezierCurveTo(35, 125, 58, 105, 88, 90);
    ctx.lineTo(175, 145);
    ctx.bezierCurveTo(120, 162, 70, 168, 24, 150);
    ctx.closePath();
    ctx.fill();

    // Ray 2 (Mid-left ascending)
    ctx.beginPath();
    ctx.moveTo(68, 84);
    ctx.bezierCurveTo(95, 62, 130, 46, 166, 38);
    ctx.lineTo(186, 138);
    ctx.bezierCurveTo(145, 145, 106, 156, 68, 84);
    ctx.closePath();
    ctx.fill();

    // Ray 3 (Center large ray)
    ctx.beginPath();
    ctx.moveTo(148, 30);
    ctx.bezierCurveTo(182, 20, 218, 20, 252, 30);
    ctx.lineTo(222, 155);
    ctx.bezierCurveTo(208, 156, 192, 156, 178, 155);
    ctx.closePath();
    ctx.fill();

    // Ray 4 (Mid-right ascending)
    ctx.beginPath();
    ctx.moveTo(234, 38);
    ctx.bezierCurveTo(270, 46, 305, 62, 332, 84);
    ctx.lineTo(214, 138);
    ctx.bezierCurveTo(255, 145, 294, 156, 332, 84);
    ctx.closePath();
    ctx.fill();

    // Ray 5 (Right wing)
    ctx.beginPath();
    ctx.moveTo(312, 90);
    ctx.bezierCurveTo(342, 105, 365, 125, 376, 150);
    ctx.bezierCurveTo(330, 168, 280, 162, 225, 145);
    ctx.closePath();
    ctx.fill();

    // 2. Crisp Central White Latin Cross
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(188, 38);
    ctx.lineTo(212, 38);
    ctx.lineTo(212, 58);
    ctx.lineTo(234, 58);
    ctx.lineTo(234, 74);
    ctx.lineTo(212, 74);
    ctx.lineTo(212, 158);
    ctx.lineTo(188, 158);
    ctx.lineTo(188, 74);
    ctx.lineTo(166, 74);
    ctx.lineTo(166, 58);
    ctx.lineTo(188, 58);
    ctx.closePath();
    ctx.fill();

    // 3. Navy Wave Ribbon
    const navyGrad = ctx.createLinearGradient(10, 130, 390, 210);
    navyGrad.addColorStop(0, '#142366');
    navyGrad.addColorStop(0.4, '#1E328A');
    navyGrad.addColorStop(0.8, '#1E293B');
    navyGrad.addColorStop(1, '#0F172A');
    ctx.fillStyle = navyGrad;
    ctx.beginPath();
    ctx.moveTo(6, 135);
    ctx.bezierCurveTo(40, 200, 135, 220, 215, 190);
    ctx.bezierCurveTo(295, 160, 365, 175, 394, 200);
    ctx.bezierCurveTo(360, 215, 285, 192, 215, 198);
    ctx.bezierCurveTo(120, 206, 48, 220, 6, 135);
    ctx.closePath();
    ctx.fill();

    // 4. Vivid Cyan Water Ribbon
    const cyanGrad = ctx.createLinearGradient(80, 180, 380, 230);
    cyanGrad.addColorStop(0, '#00AEEF');
    cyanGrad.addColorStop(0.6, '#38BDF8');
    cyanGrad.addColorStop(1, '#7DD3FC');
    ctx.fillStyle = cyanGrad;
    ctx.beginPath();
    ctx.moveTo(95, 210);
    ctx.bezierCurveTo(165, 218, 250, 202, 320, 196);
    ctx.bezierCurveTo(362, 192, 384, 200, 396, 216);
    ctx.bezierCurveTo(368, 225, 320, 212, 258, 214);
    ctx.bezierCurveTo(185, 218, 135, 216, 95, 210);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  };

  // Generate and Download Canvas Flyer Image with ALL info placed at the BOTTOM and CENTERED
  const handleDownloadFlyerImage = async () => {
    setIsGeneratingImage(true);
    if (onToast) onToast('Generando afiche digital en alta resolución...');

    try {
      const canvas = document.createElement('canvas');
      const width = 1080;
      const height = 1350; // 4:5 Social media poster ratio
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('No canvas context');

      const isCenteredLayout = !hasCustomImage;

      // 1. Draw Background
      if (hasCustomImage && event.imageUrl) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject();
            img.src = event.imageUrl!;
          });

          // Draw Cover Image with Aspect Fill
          const imgAspect = img.width / img.height;
          const canvasAspect = width / height;
          let renderW = width;
          let renderH = height;
          let offsetX = 0;
          let offsetY = 0;

          if (imgAspect > canvasAspect) {
            renderH = height;
            renderW = height * imgAspect;
            offsetX = (width - renderW) / 2;
          } else {
            renderW = width;
            renderH = width / imgAspect;
            offsetY = (height - renderH) / 2;
          }

          ctx.drawImage(img, offsetX, offsetY, renderW, renderH);

          // Rich Bottom Gradient Overlay (Top 35% clean, dark fade rising from bottom)
          const gradient = ctx.createLinearGradient(0, 0, 0, height);
          gradient.addColorStop(0, 'rgba(11, 43, 104, 0.25)');
          gradient.addColorStop(0.35, 'rgba(0, 0, 0, 0.2)');
          gradient.addColorStop(0.52, 'rgba(5, 11, 24, 0.75)');
          gradient.addColorStop(0.7, 'rgba(5, 11, 24, 0.95)');
          gradient.addColorStop(1, 'rgba(3, 7, 16, 0.99)');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, width, height);
        } catch (imgErr) {
          drawDefaultLogoBackground(ctx, width, height);
        }
      } else {
        // DEFAULT INSTITUTIONAL BACKGROUND: Centered Logo + Celestial Waves
        drawDefaultLogoBackground(ctx, width, height);
      }

      // ==========================================================
      // ALL INFORMATION PLACED IN THE BOTTOM PORTION (CENTERED)
      // ==========================================================

      const bottomStartY = isCenteredLayout ? 650 : 660;

      // 1. Category Pill + Church Tag (Centered)
      ctx.textAlign = 'center';
      ctx.font = 'bold 24px sans-serif';
      const catText = catName.toUpperCase();
      const catTextMetrics = ctx.measureText(catText);
      const catPillW = catTextMetrics.width + 48;
      const catPillH = 44;
      const catPillX = (width - catPillW) / 2;
      const catPillY = bottomStartY;

      // Category Pill Background
      ctx.fillStyle = catColor;
      ctx.beginPath();
      ctx.roundRect(catPillX, catPillY, catPillW, catPillH, 22);
      ctx.fill();

      // Category Pill Text
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(catText, width / 2, catPillY + 30);

      // Church Subtitle / Tag
      ctx.fillStyle = '#FED65B';
      ctx.font = 'bold 20px sans-serif';
      ctx.letterSpacing = '2px';
      ctx.fillText('IGLESIA EL-SHADDAI • SANTUARIO DIGITAL', width / 2, catPillY + 75);

      // 2. Main Title (Wrapped and Centered)
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 54px serif';
      const words = event.title.split(' ');
      let line = '';
      let titleY = catPillY + 140;
      const maxTitleWidth = width - 180;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxTitleWidth && n > 0) {
          ctx.fillText(line.trim(), width / 2, titleY);
          line = words[n] + ' ';
          titleY += 64;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line.trim(), width / 2, titleY);

      // 3. Symmetrical Gold Accent Divider (Centered)
      const divY = titleY + 28;
      const divGrad = ctx.createLinearGradient(width / 2 - 300, 0, width / 2 + 300, 0);
      divGrad.addColorStop(0, 'rgba(254, 214, 91, 0)');
      divGrad.addColorStop(0.2, '#FED65B');
      divGrad.addColorStop(0.5, '#F47B20');
      divGrad.addColorStop(0.8, '#FED65B');
      divGrad.addColorStop(1, 'rgba(254, 214, 91, 0)');
      ctx.fillStyle = divGrad;
      ctx.fillRect(width / 2 - 300, divY, 600, 3);

      // 4. Centered Information Items in the Lower Bottom
      let itemY = divY + 60;
      const itemSpacing = 68;

      // Item A: Fecha (Centered)
      drawCenteredInfoRow(ctx, '📅', 'FECHA', formattedDate.toUpperCase(), width / 2, itemY);
      itemY += itemSpacing;

      // Item B: Horario (if present)
      if (event.startTime) {
        const scheduleText = `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}`;
        drawCenteredInfoRow(ctx, '⏰', 'HORARIO', scheduleText, width / 2, itemY);
        itemY += itemSpacing;
      }

      // Item C: Lugar (if present)
      if (event.location) {
        drawCenteredInfoRow(ctx, '📍', 'LUGAR', event.location, width / 2, itemY);
        itemY += itemSpacing;
      }

      // Item D: Inversión / Entrada (if present)
      if (event.price) {
        drawCenteredInfoRow(ctx, '🎟️', 'INVERSIÓN', event.price, width / 2, itemY, '#34D399');
        itemY += itemSpacing;
      }

      // 5. Footer Watermark at Very Bottom (Centered)
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '20px sans-serif';
      ctx.fillText('¡Te esperamos! • Entrada e información sujeta a la congregación', width / 2, height - 35);

      // Download Canvas to Image - Guaranteed trigger for Mobile & Desktop Downloads folder
      canvas.toBlob((blob) => {
        if (!blob) {
          setIsGeneratingImage(false);
          return;
        }
        const fileName = `afiche-${event.title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'evento'}.png`;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.setAttribute('download', fileName);
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 300);

        setIsGeneratingImage(false);
        if (onToast) onToast('¡Afiche guardado en la carpeta de Descargas de tu móvil / dispositivo!');
      }, 'image/png', 1.0);
    } catch (e) {
      console.error(e);
      setIsGeneratingImage(false);
      if (onToast) onToast('No se pudo generar la imagen, pero puedes copiar el texto');
    }
  };

  // Draw Default Institutional Background with Centered Church Logo & Radial Lights
  function drawDefaultLogoBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // 1. Deep Celestial Navy Background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#0B2B68');
    bgGrad.addColorStop(0.4, '#081E48');
    bgGrad.addColorStop(0.75, '#05122E');
    bgGrad.addColorStop(1, '#020611');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Radiant Center Halo behind the Logo
    const radGrad = ctx.createRadialGradient(width / 2, 300, 30, width / 2, 300, 480);
    radGrad.addColorStop(0, 'rgba(0, 163, 224, 0.35)');
    radGrad.addColorStop(0.45, 'rgba(254, 214, 91, 0.12)');
    radGrad.addColorStop(0.8, 'rgba(11, 43, 104, 0.05)');
    radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, width, height);

    // 3. Subtle Concentric Golden Rings
    ctx.strokeStyle = 'rgba(254, 214, 91, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(width / 2, 290, 210, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0, 163, 224, 0.18)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(width / 2, 290, 270, 0, Math.PI * 2);
    ctx.stroke();

    // 4. Prominent Centered Church Logo Emblem
    drawChurchLogoEmblem(ctx, width / 2, 280, 1.25);

    // 5. Elegant Church Brand Typography below Logo (before bottom text)
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'italic bold 44px serif';
    ctx.fillText('El-Shaddai', width / 2, 440);

    ctx.fillStyle = '#FED65B';
    ctx.font = 'bold 18px sans-serif';
    ctx.letterSpacing = '5px';
    ctx.fillText('DIOS TODOPODEROSO', width / 2, 475);

    // 6. Deep bottom shadow gradient to elevate the bottom event text
    const bottomFade = ctx.createLinearGradient(0, 520, 0, height);
    bottomFade.addColorStop(0, 'rgba(5, 18, 46, 0)');
    bottomFade.addColorStop(0.3, 'rgba(4, 12, 30, 0.85)');
    bottomFade.addColorStop(0.7, 'rgba(2, 6, 17, 0.98)');
    bottomFade.addColorStop(1, 'rgba(1, 3, 10, 1)');
    ctx.fillStyle = bottomFade;
    ctx.fillRect(0, 520, width, height - 520);
  }

  // Helper to draw clean centered metadata row
  function drawCenteredInfoRow(
    ctx: CanvasRenderingContext2D,
    emoji: string,
    label: string,
    value: string,
    centerX: number,
    y: number,
    valueColor: string = '#FFFFFF'
  ) {
    ctx.textAlign = 'center';

    // Badge label with emoji
    ctx.fillStyle = '#FED65B';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(`${emoji} ${label}`, centerX, y - 6);

    // Bold Value text centered
    ctx.fillStyle = valueColor;
    ctx.font = 'bold 26px sans-serif';
    let val = value;
    if (ctx.measureText(val).width > 860) {
      while (ctx.measureText(val + '...').width > 860 && val.length > 5) {
        val = val.slice(0, -1);
      }
      val += '...';
    }
    ctx.fillText(val, centerX, y + 26);
  }

  const modalBg = isDark
    ? 'bg-[#141824] text-[#F1F3F9] border-[#252D43]'
    : isSepia
    ? 'bg-[#FAF6EF] text-[#2D2319] border-[#705335]/25'
    : 'bg-[#FFFFFF] text-[#1B1C19] border-[#0B2B68]/15';

  return (
    <div
      id="event-share-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="event-share-modal-container"
        className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden flex flex-col my-auto transition-all ${modalBg}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-inherit/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0B2B68] text-white flex items-center justify-center shadow-xs">
              <Share2 className="w-4 h-4 text-[#FED65B]" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-sm sm:text-base leading-tight">
                Compartir Afiche del Evento
              </h2>
              <p className="text-[11px] opacity-70">
                {hasCustomImage ? 'Imagen personalizada con datos inferiores' : 'Afiche oficial con logo centrado e información'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 opacity-70 hover:opacity-100 transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Visual Card Flyer & Compact Icon Actions */}
        <div className="p-3.5 sm:p-5 space-y-4 overflow-y-auto max-h-[85vh]">
          {/* ======================================================== */}
          {/* VISUAL FLYER PREVIEW (CENTERED LOGO & BOTTOM INFO)       */}
          {/* ======================================================== */}
          <div
            ref={flyerRef}
            className="relative w-full aspect-[4/5] min-h-[390px] sm:min-h-[440px] max-h-[490px] rounded-2xl overflow-hidden border border-white/20 shadow-xl bg-[#030712] text-white select-none flex flex-col justify-between"
          >
            {/* Background Layer */}
            {hasCustomImage && event.imageUrl ? (
              <div className="absolute inset-0 z-0">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
                {/* Bottom-focused Dark Gradient: Clean top, deep fade at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#030710] via-[#050B18]/90 via-50% to-transparent" />
              </div>
            ) : (
              /* DEFAULT BACKGROUND WITH CENTERED LOGO */
              <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0B2B68] via-[#07193C] to-[#02050E] flex flex-col items-center justify-start pt-8">
                {/* Radial Glows */}
                <div className="absolute top-12 w-64 h-64 bg-[#00A3E0]/25 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-20 w-48 h-48 bg-[#FED65B]/15 rounded-full blur-2xl pointer-events-none" />

                {/* Centered Institutional Emblem & Title */}
                <div className="relative z-10 flex flex-col items-center text-center mt-2 group">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-b from-white/10 to-transparent p-2 border border-[#FED65B]/30 shadow-2xl flex items-center justify-center backdrop-blur-xs">
                    <ChurchLogo variant="symbol" size="custom" className="w-full h-full" theme="dark" />
                  </div>
                  <span
                    className="font-serif italic font-bold text-xl sm:text-2xl text-white mt-2 drop-shadow-md"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    El-Shaddai
                  </span>
                  <span className="font-sans font-black tracking-[0.25em] text-[#FED65B] text-[9px] uppercase mt-0.5">
                    DIOS TODOPODEROSO
                  </span>
                </div>

                {/* Dark Gradient rising up to frame the bottom text */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#02050E] via-[#040D24]/90 via-45% to-transparent pointer-events-none" />
              </div>
            )}

            {/* Spacer to push content strictly to bottom */}
            <div className="flex-1" />

            {/* Bottom Content Area (Centered and compact) */}
            <div className="relative z-10 p-4 sm:p-5 space-y-2.5 text-center">
              {/* Category Pill + Church Tag (Centered) */}
              <div className="flex flex-col items-center justify-center gap-1.5 border-b border-white/15 pb-2">
                <span
                  className="px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase shadow-xs tracking-wider"
                  style={{
                    backgroundColor: catColor,
                    color: '#FFFFFF'
                  }}
                >
                  {catName}
                </span>
                <span className="text-[9.5px] font-bold tracking-widest text-[#FED65B] uppercase">
                  Iglesia El-Shaddai • Santuario Digital
                </span>
              </div>

              {/* Title (Centered) */}
              <h3 className="font-serif font-black text-lg sm:text-xl leading-tight text-white drop-shadow-md px-2">
                {event.title}
              </h3>

              {/* Essential Metadata Badges (Centered) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                {/* Date */}
                <div className="flex items-center justify-center gap-2 p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
                  <div className="w-6 h-6 rounded-lg bg-[#F47B20] text-white flex items-center justify-center shrink-0">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 text-left">
                    <span className="block text-[8px] uppercase font-bold text-[#FED65B] tracking-wider">Fecha</span>
                    <span className="block font-semibold capitalize truncate text-xs">{formattedDate}</span>
                  </div>
                </div>

                {/* Schedule (Only if present) */}
                {event.startTime && (
                  <div className="flex items-center justify-center gap-2 p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
                    <div className="w-6 h-6 rounded-lg bg-[#00A3E0] text-white flex items-center justify-center shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 text-left">
                      <span className="block text-[8px] uppercase font-bold text-[#FED65B] tracking-wider">Horario</span>
                      <span className="block font-semibold truncate text-xs">
                        {event.startTime}{event.endTime ? ` - ${event.endTime}` : ''}
                      </span>
                    </div>
                  </div>
                )}

                {/* Location (Only if present) */}
                {event.location && (
                  <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 sm:col-span-2">
                    <div className="flex items-center gap-2 min-w-0 text-left">
                      <div className="w-6 h-6 rounded-lg bg-[#F47B20] text-white flex items-center justify-center shrink-0">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[8px] uppercase font-bold text-[#FED65B] tracking-wider">Lugar</span>
                        <span className="block font-semibold truncate text-xs">{event.location}</span>
                      </div>
                    </div>
                    <a
                      href={getMapsUrlForLocation(event.location)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-[#00A3E0] hover:text-[#FED65B] flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-md bg-black/40 hover:bg-black/60 transition-colors"
                      title="Abrir en Google Maps"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>Maps</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                )}

                {/* Price / Inversión (Only if present) */}
                {event.price && (
                  <div className="flex items-center justify-center gap-2 p-2 rounded-xl bg-emerald-600/30 backdrop-blur-md border border-emerald-500/30 sm:col-span-2 text-left">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <Ticket className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[8px] uppercase font-bold text-emerald-300 tracking-wider">Inversión / Entrada</span>
                      <span className="block font-bold text-white truncate text-xs">{event.price}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* COMPACT ICON SHARE BUTTONS WITH RESPECIVE BRAND COLORS    */}
          {/* ======================================================== */}
          <div className="pt-1">
            <div className="text-[11px] font-bold uppercase tracking-wider opacity-70 mb-2 text-center">
              Compartir o Descargar
            </div>

            {/* Compact Icon Bar */}
            <div className="flex items-center justify-center gap-2.5 sm:gap-3 flex-wrap">
              {/* WhatsApp Button */}
              <button
                onClick={handleWhatsAppShare}
                className="flex flex-col items-center gap-1 group cursor-pointer"
                title="Compartir por WhatsApp"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#25D366] hover:bg-[#1EBE5D] text-white flex items-center justify-center shadow-md group-hover:scale-105 active:scale-95 transition-all">
                  <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                </div>
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 group-hover:text-[#25D366] transition-colors">
                  WhatsApp
                </span>
              </button>

              {/* Facebook Button */}
              <button
                onClick={handleFacebookShare}
                className="flex flex-col items-center gap-1 group cursor-pointer"
                title="Compartir en Facebook"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#1877F2] hover:bg-[#166FE5] text-white flex items-center justify-center shadow-md group-hover:scale-105 active:scale-95 transition-all">
                  <Facebook className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                </div>
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 group-hover:text-[#1877F2] transition-colors">
                  Facebook
                </span>
              </button>

              {/* Email Button */}
              <button
                onClick={handleEmailShare}
                className="flex flex-col items-center gap-1 group cursor-pointer"
                title="Enviar por Correo Electrónico"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#EA4335] hover:bg-[#D93025] text-white flex items-center justify-center shadow-md group-hover:scale-105 active:scale-95 transition-all">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 group-hover:text-[#EA4335] transition-colors">
                  Email
                </span>
              </button>

              {/* SMS / Text Button */}
              <button
                onClick={handleSmsShare}
                className="flex flex-col items-center gap-1 group cursor-pointer"
                title="Enviar por SMS / Mensaje de Texto"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#8E24AA] hover:bg-[#7B1FA2] text-white flex items-center justify-center shadow-md group-hover:scale-105 active:scale-95 transition-all">
                  <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 group-hover:text-[#8E24AA] transition-colors">
                  SMS/Texto
                </span>
              </button>

              {/* Copy Text Button */}
              <button
                onClick={handleCopyText}
                className="flex flex-col items-center gap-1 group cursor-pointer"
                title="Copiar texto de la invitación"
              >
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl ${
                  copied ? 'bg-emerald-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'
                } flex items-center justify-center shadow-md group-hover:scale-105 active:scale-95 transition-all`}>
                  {copied ? <Check className="w-5 h-5 sm:w-6 sm:h-6 text-white" /> : <Copy className="w-5 h-5 sm:w-6 sm:h-6" />}
                </div>
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 group-hover:text-emerald-500 transition-colors">
                  {copied ? '¡Copiado!' : 'Copiar'}
                </span>
              </button>

              {/* Download Flyer Button (Highlighted) */}
              <button
                onClick={handleDownloadFlyerImage}
                disabled={isGeneratingImage}
                className="flex flex-col items-center gap-1 group cursor-pointer disabled:opacity-50"
                title="Descargar imagen afiche en alta resolución"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#0B2B68] hover:bg-[#081E48] text-white flex items-center justify-center shadow-md border-2 border-[#FED65B] group-hover:scale-105 active:scale-95 transition-all">
                  {isGeneratingImage ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Download className="w-5 h-5 sm:w-6 sm:h-6 text-[#FED65B]" />
                  )}
                </div>
                <span className="text-[10px] font-bold text-[#0B2B68] dark:text-[#FED65B] group-hover:underline">
                  Descargar
                </span>
              </button>

              {/* Native / More Options Button */}
              <button
                onClick={handleNativeShare}
                className="flex flex-col items-center gap-1 group cursor-pointer"
                title="Más opciones de compartir del sistema"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shadow-md group-hover:scale-105 active:scale-95 transition-all">
                  <Share2 className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 transition-colors">
                  Más
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
