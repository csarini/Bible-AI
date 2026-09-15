import React from 'react';
import { ShieldCheck, ExternalLink, Info, AlertTriangle } from 'lucide-react';
import { CopyrightGuardService } from '../services/copyrightGuardService';

interface ScriptureCopyrightFooterProps {
  translation?: string;
  className?: string;
  isCompact?: boolean;
}

/**
 * ScriptureCopyrightFooter
 * Enforces legal notices and attribution for biblical scripture translations.
 * Styled in the "Digital Sanctuary" design system (Parchment #F9F6F0, Deep Navy #002147).
 */
export const ScriptureCopyrightFooter: React.FC<ScriptureCopyrightFooterProps> = ({
  translation,
  className = '',
  isCompact = false,
}) => {
  // Only show footer if required by translation
  if (!CopyrightGuardService.isApiBibleTranslation(translation)) {
    return null;
  }

  const info = CopyrightGuardService.getCopyrightInfo(translation);
  const isProtected = info.isCopyrightProtected;

  return (
    <aside
      id="scripture-copyright-legal-footer"
      aria-label="Aviso legal y derechos de autor del texto bíblico"
      className={`w-full my-6 p-4 sm:p-5 rounded-2xl border transition-colors ${
        isProtected
          ? 'bg-[#F9F6F0] text-[#002147] border-[#002147]/15 shadow-2xs'
          : 'bg-[#F9F6F0]/80 text-[#002147]/90 border-[#002147]/10'
      } ${className}`}
    >
      <div className="flex flex-col gap-3 text-xs leading-relaxed">
        {/* Header indicator */}
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-[#002147]/10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#F25C05] shrink-0" />
            <span className="font-sans font-bold tracking-wide uppercase text-[11px] text-[#002147]">
              {info.abbreviation} • Aviso Legal y Derechos de Autor
            </span>
          </div>

          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              isProtected
                ? 'bg-[#F25C05]/10 text-[#F25C05] border border-[#F25C05]/20'
                : 'bg-[#002147]/10 text-[#002147]'
            }`}
          >
            {isProtected ? 'Texto con Derechos de Autor' : 'Dominio Público'}
          </span>
        </div>

        {/* Standard Citation Text */}
        <p className="font-serif text-[13px] text-[#002147]/95 italic">
          "{info.standardCitation}"
        </p>

        {/* Mandatory Direct Link for Publishers */}
        {info.directLinkUrl && (
          <div className="flex items-center flex-wrap gap-x-4 gap-y-1.5 pt-1 text-[11px]">
            <a
              href={info.directLinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold text-[#002147] hover:text-[#F25C05] underline decoration-[#F25C05]/50 underline-offset-2 transition-colors cursor-pointer"
            >
              <span>{info.directLinkAnchorText || 'Visitar sitio oficial'}</span>
              <ExternalLink className="w-3 h-3 text-[#F25C05]" />
            </a>
          </div>
        )}

        {/* Legal & Non-Commercial Terms Summary */}
        {!isCompact && (
          <div className="pt-2 border-t border-[#002147]/10 flex flex-col gap-1.5 text-[11px] text-[#002147]/80">
            <div className="flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#002147]/60 shrink-0 mt-0.5" />
              <span>
                <strong>Acuerdo Estrictamente No Comercial:</strong> Biblia Inteligente es una aplicación de acceso libre y gratuito para fines devocionales y educativos. No contiene compras integradas, suscripciones de pago ni publicidad.
              </span>
            </div>

            {isProtected && (
              <div className="flex items-start gap-1.5 text-[#002147]/75">
                <AlertTriangle className="w-3.5 h-3.5 text-[#F25C05] shrink-0 mt-0.5" />
                <span>
                  <strong>Restricciones de Uso (Bíblica, Inc. / Licencias):</strong> Prohibida la extracción masiva de texto, reproducción comercial, conversión a audio o procesamiento directo del texto bíblico mediante modelos de Inteligencia Artificial Generativa.
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
