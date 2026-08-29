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
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { ChurchLogo } from './ChurchLogo';

interface CoachMarkOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: 'scripture' | 'library' | 'ai-mentor' | 'saved') => void;
}

export const COACHMARK_STORAGE_KEY = 'el_shaddai_coachmark_seen_v1';

export const CoachMarkOverlay: React.FC<CoachMarkOverlayProps> = ({
  isOpen,
  onClose,
  onNavigateTab
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: '¡Bienvenido al Santuario Digital!',
      subtitle: 'Iglesia El-Shaddai • Dios Todopoderoso',
      icon: null, // Will use ChurchLogo
      badge: 'Inicio',
      description:
        'Tu espacio sagrado para leer las Escrituras (RVR1909) con devoción, claridad tipográfica y funcionamiento 100% sin conexión a internet.',
      tip: 'Los 1.189 capítulos bíblicos se guardan en tu dispositivo para que leas en cualquier lugar sin gastar datos.',
      targetTab: 'scripture' as const
    },
    {
      title: 'Biblioteca y Búsqueda Ágil',
      subtitle: '66 Libros del Antiguo y Nuevo Testamento',
      icon: Library,
      badge: 'Biblioteca',
      description:
        'Navega organizadamente por divisiones canónicas (Pentateuco, Históricos, Evangelios, Epístolas) o busca pasajes, personajes y palabras clave en segundos.',
      tip: 'Puedes pulsar el icono de lupa en la barra superior o en el menú para cambiar de libro al instante.',
      targetTab: 'library' as const
    },
    {
      title: 'Mentor Teológico e Histórico IA',
      subtitle: 'Exégesis profunda & Raíces Bíblicas',
      icon: Sparkles,
      badge: 'Mentor IA',
      description:
        'Pregunta tus dudas sobre pasajes bíblicos, raíces originales en griego y hebreo bíblico (Shalom, Ágape, Qavah, El-Shaddai) y recibe explicaciones edificantes.',
      tip: 'Disponible desde la pestaña "Mentor IA" o directamente al tocar cualquier versículo en tu lectura.',
      targetTab: 'ai-mentor' as const
    },
    {
      title: 'Subraya y Guarda en tu Santuario',
      subtitle: 'Notas Personales y Colores Sagrados',
      icon: Bookmark,
      badge: 'Devocional',
      description:
        'Al tocar cualquier versículo durante tu lectura, podrás resaltarlo con colores temáticos, añadir reflexiones personales y escucharlo en voz alta.',
      tip: 'Todos tus versículos guardados quedan organizados en la sección "Versículos Guardados".',
      targetTab: 'saved' as const
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
    } catch {}
    if (onNavigateTab) {
      onNavigateTab('scripture');
    }
    onClose();
  };

  return (
    <div
      id="coachmark-overlay-backdrop"
      className="fixed inset-0 z-60 bg-[#0B2B68]/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={handleComplete}
    >
      <div
        id="coachmark-card"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#FAF8F5] rounded-3xl border border-[#0B2B68]/20 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
      >
        {/* Top Decorative Header Accent */}
        <div className="h-2 w-full bg-gradient-to-r from-[#F25C05] via-[#00A3E0] to-[#0B2B68]" />

        <div className="p-6 sm:p-7 flex flex-col gap-5">
          {/* Header row with step badge and close button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#0B2B68] text-[#F25C05] text-xs font-bold font-sans uppercase tracking-wider">
                Guía de Inicio • {currentStep + 1} de {steps.length}
              </span>
              <span className="text-xs font-bold text-[#0B2B68] bg-[#00A3E0]/15 px-2.5 py-1 rounded-full">
                {activeStep.badge}
              </span>
            </div>

            <button
              onClick={handleComplete}
              className="p-1.5 rounded-full text-[#767683] hover:text-[#0B2B68] hover:bg-[#EAE8E3] transition-colors cursor-pointer"
              title="Saltar guía"
              aria-label="Cerrar guía"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Visual Showcase Box */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-[#0B2B68]/15 shadow-xs">
            <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#0B2B68]/10 text-[#0B2B68] shadow-2xs shrink-0">
              {Icon ? (
                <Icon className="w-8 h-8 text-[#F25C05]" />
              ) : (
                <div className="w-8 h-8 flex items-center justify-center">
                  <ChurchLogo size="sm" variant="symbol" showText={false} showSubtitle={false} />
                </div>
              )}
            </div>

            <div>
              <h3 className="font-serif italic font-bold text-xl sm:text-2xl text-[#0B2B68] leading-snug">
                {activeStep.title}
              </h3>
              <p className="text-xs font-sans font-bold text-[#F25C05] tracking-wide">
                {activeStep.subtitle}
              </p>
            </div>
          </div>

          {/* Body Description */}
          <div className="space-y-3">
            <p className="font-body-ui text-sm sm:text-[15px] text-[#1B1C19] leading-relaxed">
              {activeStep.description}
            </p>

            {/* Practical Tip Box */}
            <div className="p-3.5 bg-[#00A3E0]/10 rounded-2xl border border-[#00A3E0]/25 flex items-start gap-2.5 text-xs text-[#0B2B68]">
              <Compass className="w-4 h-4 text-[#F25C05] shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">
                <strong>Consejo útil:</strong> {activeStep.tip}
              </span>
            </div>
          </div>

          {/* Stepper Dots Indicator */}
          <div className="flex items-center justify-center gap-2 py-1">
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
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentStep
                    ? 'w-7 bg-[#F25C05]'
                    : 'w-2 bg-[#0B2B68]/20 hover:bg-[#0B2B68]/40'
                }`}
              />
            ))}
          </div>

          {/* Action Footer Buttons */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#0B2B68]/10">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2.5 rounded-xl font-body-ui text-xs sm:text-sm font-semibold text-[#0B2B68] hover:bg-[#EAE8E3] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleComplete}
                className="px-4 py-2.5 rounded-xl font-body-ui text-xs sm:text-sm font-semibold text-[#767683] hover:text-[#0B2B68] hover:bg-[#EAE8E3] transition-colors cursor-pointer"
              >
                Saltar guía
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl font-body-ui text-xs sm:text-sm font-bold bg-[#0B2B68] text-white hover:bg-[#F25C05] transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#F25C05]" />
                  <span>¡Comenzar Lectura!</span>
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
