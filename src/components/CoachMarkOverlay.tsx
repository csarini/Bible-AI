import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Library,
  Bookmark,
  ChevronRight,
  ChevronLeft,
  X,
  Compass,
  Calendar,
  Image as ImageIcon,
  MessageSquarePlus,
  CheckCircle2,
  Volume2,
  MapPin
} from 'lucide-react';
import { ChurchLogo } from './ChurchLogo';
import { ActiveTab } from '../types';

interface CoachMarkOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: ActiveTab) => void;
  currentTheme?: 'light' | 'sepia' | 'dark';
  onOpenFeedback?: () => void;
}

export const COACHMARK_STORAGE_KEY = 'el_shaddai_coachmark_seen_v2';

export const CoachMarkOverlay: React.FC<CoachMarkOverlayProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  currentTheme = 'light',
  onOpenFeedback
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const isDark = currentTheme === 'dark';
  const isSepia = currentTheme === 'sepia';

  const steps = [
    {
      title: '¡Bienvenido al Santuario Digital!',
      subtitle: 'Iglesia El-Shaddai • Dios Todopoderoso',
      icon: null, // Will use ChurchLogo
      badge: 'Inicio',
      description:
        'Tu espacio sagrado para el estudio bíblico devocional. Incluye las versiones RVR1909, NVI y DHH con almacenamiento local para funcionar 100% sin conexión a internet.',
      tip: 'Los 1.189 capítulos bíblicos se guardan en tu dispositivo para que leas en cualquier lugar sin gastar datos móviles.',
      targetTab: 'home' as ActiveTab,
      highlightColor: '#F47B20'
    },
    {
      title: 'Mapas Bíblicos e Itinerarios',
      subtitle: 'Geografía Sagrada & Rutas Interactivas',
      icon: Compass,
      badge: 'Mapas',
      description:
        'Explora los viajes misioneros del Apóstol Pablo, la ruta del Éxodo por el desierto y el ministerio de Jesús en Galilea y Judea con coordenadas reales y pasajes bíblicos vinculados.',
      tip: 'Toca cualquier hito o ciudad en el mapa para leer el pasaje bíblico exacto donde ocurrieron los hechos.',
      targetTab: 'maps' as ActiveTab,
      highlightColor: '#00A3E0'
    },
    {
      title: 'Prédicas & Cuaderno de Eventos',
      subtitle: 'Apuntes de Sermones & Horarios',
      icon: Calendar,
      badge: 'Eventos',
      description:
        'Registra apuntes completos de las predicaciones semanales, conferencias y cultos, enlazando versículos clave y definiendo horarios de inicio y fin.',
      tip: 'Cuenta con geolocalización GPS satelital y ubicación predeterminada en el Salón Principal (Brown 1285, San Juan).',
      targetTab: 'events' as ActiveTab,
      highlightColor: '#10B981'
    },
    {
      title: 'Generador y Descarga de Afiches',
      subtitle: 'Diseño Gráfico Publicitario HD',
      icon: ImageIcon,
      badge: 'Afiches',
      description:
        'Crea automáticamente hermosos afiches con el emblema oficial de la iglesia, versículos y detalles del evento para descargar directo a tu móvil en formato PNG o compartir por WhatsApp.',
      tip: 'En la sección de Prédicas, presiona "Presentar / Afiche" para personalizar fondos temáticos y guardarlo en tu galería.',
      targetTab: 'events' as ActiveTab,
      highlightColor: '#8B5CF6'
    },
    {
      title: 'Mentor Teológico e Histórico IA (Modo Prueba)',
      subtitle: 'Exégesis profunda & Raíces Bíblicas (2 consultas/día)',
      icon: Sparkles,
      badge: 'Modo Prueba (2/día)',
      description:
        'Resuelve dudas teológicas, explora el contexto histórico del siglo I y descubre el significado en hebreo y griego de palabras como Shalom, Ágape, Qavah y El-Shaddai.',
      tip: 'Disponible en Modo Prueba con un límite de 2 consultas diarias que se reinicia automáticamente cada medianoche.',
      targetTab: 'ai-mentor' as ActiveTab,
      highlightColor: '#F59E0B'
    },
    {
      title: 'Subraya, Guarda y Escucha en Audio',
      subtitle: 'Colores Sagrados & Voz Natural',
      icon: Bookmark,
      badge: 'Guardados',
      description:
        'Resalta versículos con categorías de fe, añade reflexiones espirituales, compártelos en hermosas tarjetas y escúchalos en voz alta con el reproductor de audio integrado.',
      tip: 'Organiza tus versículos favoritos con etiquetas y accede a ellos rápidamente desde la pestaña "Guardados".',
      targetTab: 'saved' as ActiveTab,
      highlightColor: '#EC4899'
    },
    {
      title: 'Buzón de Errores y Sugerencias',
      subtitle: 'Mejora Continua y Acompañamiento',
      icon: MessageSquarePlus,
      badge: 'Feedback',
      description:
        'Desde el menú lateral puedes enviar reportes de errores técnicos o sugerencias de nuevas funciones directamente a la casilla de correo de desarrollo.',
      tip: 'El formulario adjunta automáticamente datos de diagnóstico para solucionar cualquier inconveniente de manera inmediata.',
      targetTab: 'home' as ActiveTab,
      highlightColor: '#00A3E0'
    }
  ];

  const activeStep = steps[currentStep];
  const Icon = activeStep.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      if (onNavigateTab && steps[next].targetTab) {
        onNavigateTab(steps[next].targetTab);
      }
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      if (onNavigateTab && steps[prev].targetTab) {
        onNavigateTab(steps[prev].targetTab);
      }
    }
  };

  const handleComplete = () => {
    try {
      localStorage.setItem(COACHMARK_STORAGE_KEY, 'true');
    } catch { }
    if (onNavigateTab) {
      onNavigateTab('home');
    }
    onClose();
  };

  // Dynamic Theme Token Classes
  const cardBgClass = isDark
    ? 'bg-[#182033] border-[#252D43] text-[#F1F3F9]'
    : isSepia
      ? 'bg-[#F4ECE1] border-[#DECDB8] text-[#2D2319]'
      : 'bg-[#FAF8F5] border-[#0B2B68]/20 text-[#1B1C19]';

  const showcaseBgClass = isDark
    ? 'bg-[#101524] border-[#252D43]'
    : isSepia
      ? 'bg-[#EAE0D0] border-[#DECDB8]'
      : 'bg-white border-[#0B2B68]/15';

  const titleColor = isDark
    ? 'text-white'
    : isSepia
      ? 'text-[#2D2319]'
      : 'text-[#0B2B68]';

  const bodyTextColor = isDark
    ? 'text-[#CBD5E1]'
    : isSepia
      ? 'text-[#4A3828]'
      : 'text-[#334155]';

  const tipBoxClass = isDark
    ? 'bg-[#00A3E0]/10 border-[#00A3E0]/25 text-[#93C5FD]'
    : isSepia
      ? 'bg-[#705335]/10 border-[#705335]/25 text-[#5C4228]'
      : 'bg-[#00A3E0]/10 border-[#00A3E0]/25 text-[#0B2B68]';

  return (
    <div
      id="coachmark-overlay-backdrop"
      className="fixed inset-0 z-60 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-6 animate-in fade-in duration-200"
      onClick={handleComplete}
    >
      <div
        id="coachmark-card"
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 ${cardBgClass}`}
      >
        {/* Top Decorative Header Accent */}
        <div className="h-2 w-full bg-gradient-to-r from-[#F47B20] via-[#00A3E0] to-[#2B3990]" />

        <div className="p-5 sm:p-7 flex flex-col gap-4 sm:gap-5">
          {/* Header row with step badge and close button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#0B2B68] text-[#FED65B] text-xs font-bold font-sans uppercase tracking-wider">
                Guía • {currentStep + 1} de {steps.length}
              </span>
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{
                  backgroundColor: `${activeStep.highlightColor}20`,
                  color: isDark ? '#FED65B' : activeStep.highlightColor
                }}
              >
                {activeStep.badge}
              </span>
            </div>

            <button
              onClick={handleComplete}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${isDark
                  ? 'text-slate-400 hover:text-white hover:bg-white/10'
                  : isSepia
                    ? 'text-[#705335] hover:text-[#2D2319] hover:bg-[#EAE0D0]'
                    : 'text-slate-500 hover:text-[#0B2B68] hover:bg-slate-200'
                }`}
              title="Saltar guía"
              aria-label="Cerrar guía"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Visual Showcase Box */}
          <div className={`flex items-center gap-3.5 sm:gap-4 p-3.5 sm:p-4 rounded-2xl border shadow-xs ${showcaseBgClass}`}>
            <div
              className={`p-3 rounded-2xl border shadow-2xs shrink-0 flex items-center justify-center ${isDark ? 'bg-[#182033] border-[#252D43]' : isSepia ? 'bg-[#FAF6EF] border-[#DECDB8]' : 'bg-[#FAF8F5] border-[#0B2B68]/10'
                }`}
            >
              {Icon ? (
                <Icon
                  className="w-7 h-7 sm:w-8 sm:h-8 transition-transform duration-200 scale-105"
                  style={{ color: activeStep.highlightColor }}
                />
              ) : (
                <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center">
                  <ChurchLogo size="sm" variant="symbol" showText={false} showSubtitle={false} theme={currentTheme} />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className={`font-serif italic font-bold text-lg sm:text-xl leading-snug ${titleColor}`}>
                {activeStep.title}
              </h3>
              <p
                className="text-xs font-sans font-bold tracking-wide mt-0.5"
                style={{ color: isDark ? '#FED65B' : activeStep.highlightColor }}
              >
                {activeStep.subtitle}
              </p>
            </div>
          </div>

          {/* Body Description */}
          <div className="space-y-3">
            <p className={`font-body-ui text-xs sm:text-sm leading-relaxed ${bodyTextColor}`}>
              {activeStep.description}
            </p>

            {/* Practical Tip Box */}
            <div className={`p-3 sm:p-3.5 rounded-2xl border flex items-start gap-2.5 text-xs ${tipBoxClass}`}>
              <Compass className="w-4 h-4 text-[#F47B20] shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">
                <strong>Consejo útil:</strong> {activeStep.tip}
              </span>
            </div>
          </div>

          {/* Stepper Dots Indicator */}
          <div className="flex items-center justify-center gap-1.5 py-1">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentStep(idx);
                  if (onNavigateTab && steps[idx].targetTab) {
                    onNavigateTab(steps[idx].targetTab);
                  }
                }}
                aria-label={`Ir al paso ${idx + 1}`}
                className={`h-2 rounded-full transition-all cursor-pointer ${idx === currentStep
                    ? 'w-6 sm:w-7 bg-[#F47B20]'
                    : isDark
                      ? 'w-2 bg-white/20 hover:bg-white/40'
                      : isSepia
                        ? 'w-2 bg-[#705335]/30 hover:bg-[#705335]/50'
                        : 'w-2 bg-[#0B2B68]/20 hover:bg-[#0B2B68]/40'
                  }`}
              />
            ))}
          </div>

          {/* Action Footer Buttons */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-inherit/20">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={handlePrev}
                className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-body-ui text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${isDark
                    ? 'text-slate-300 hover:bg-white/10'
                    : isSepia
                      ? 'text-[#5C452D] hover:bg-[#EAE0D0]'
                      : 'text-[#0B2B68] hover:bg-slate-100'
                  }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleComplete}
                className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-body-ui text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${isDark
                    ? 'text-slate-400 hover:text-white hover:bg-white/10'
                    : isSepia
                      ? 'text-[#705335] hover:text-[#2D2319] hover:bg-[#EAE0D0]'
                      : 'text-slate-500 hover:text-[#0B2B68] hover:bg-slate-100'
                  }`}
              >
                Saltar guía
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-body-ui text-xs sm:text-sm font-bold bg-[#0B2B68] hover:bg-[#081F4B] text-[#FED65B] transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#FED65B]" />
                  <span>¡Comenzar Experiencia!</span>
                </>
              ) : (
                <>
                  <span>Siguiente</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
