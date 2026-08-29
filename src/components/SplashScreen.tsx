import React, { useEffect, useState } from 'react';
import { ChurchLogo } from './ChurchLogo';
import { Sparkles, BookOpen } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
  churchName?: string;
  currentTheme?: 'light' | 'sepia' | 'dark';
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  churchName = 'El-Shaddai Dios Todopoderoso',
  currentTheme = 'light'
}) => {
  const [fadeState, setFadeState] = useState<'entering' | 'visible' | 'exiting'>('entering');

  const isDark = currentTheme === 'dark';
  const isSepia = currentTheme === 'sepia';

  useEffect(() => {
    // Stage 1: Reveal logo
    const t1 = setTimeout(() => {
      setFadeState('visible');
    }, 100);

    // Stage 2: Begin exit transition
    const t2 = setTimeout(() => {
      setFadeState('exiting');
    }, 2200);

    // Stage 3: Finish and unmount
    const t3 = setTimeout(() => {
      onComplete();
    }, 2700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  // Theme-specific styles
  const bgGradient = isDark
    ? 'linear-gradient(180deg, #0B0F19 0%, #131722 50%, #1C2337 100%)'
    : isSepia
    ? 'linear-gradient(180deg, #F5EFE6 0%, #EAE0D0 50%, #DFD3BF 100%)'
    : 'linear-gradient(180deg, #FFFFFF 0%, #FAF8F5 50%, #F5EFEB 100%)';

  const logoCardBg = isDark
    ? 'bg-[#131722]/90 border-[#3B49A8]/40 shadow-2xl text-white'
    : isSepia
    ? 'bg-[#FAF6EF]/90 border-[#705335]/20 shadow-xl text-[#3B2D1F]'
    : 'bg-white/85 border-[#0B2B68]/10 shadow-xl text-[#0B2B68]';

  const topLabelColor = isDark
    ? 'text-[#FED65B]/85'
    : isSepia
    ? 'text-[#705335]/80'
    : 'text-[#0B2B68]/70';

  const quoteTextColor = isDark
    ? 'text-[#F1F3F9]'
    : isSepia
    ? 'text-[#3B2D1F]'
    : 'text-[#0B2B68]';

  const citationColor = isDark
    ? 'text-[#F47B20]'
    : isSepia
    ? 'text-[#C25400]'
    : 'text-[#F47B20]';

  const progressBarTrack = isDark
    ? 'bg-white/10'
    : isSepia
    ? 'bg-[#705335]/20'
    : 'bg-[#0B2B68]/10';

  const progressBarGradient = isDark
    ? 'bg-gradient-to-r from-[#F47B20] via-[#FED65B] to-[#00A3E0]'
    : isSepia
    ? 'bg-gradient-to-r from-[#F47B20] via-[#0080C8] to-[#2B3990]'
    : 'bg-gradient-to-r from-[#F47B20] via-[#00A3E0] to-[#0B2B68]';

  const progressLabelColor = isDark
    ? 'text-white/60'
    : isSepia
    ? 'text-[#705335]/75'
    : 'text-[#0B2B68]/60';

  return (
    <div
      id="app-splash-screen"
      className={`fixed inset-0 z-100 flex flex-col items-center justify-between p-6 sm:p-10 transition-all duration-500 select-none ${
        fadeState === 'exiting' ? 'opacity-0 scale-102 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        background: bgGradient
      }}
    >
      {/* Top Subtle Label */}
      <div className={`pt-4 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase ${topLabelColor}`}>
        <Sparkles className="w-3.5 h-3.5 text-[#F47B20]" />
        <span>Biblia Inteligente</span>
      </div>

      {/* Center Sacred Emblem & Church Branding */}
      <div className="flex flex-col items-center max-w-sm text-center transform transition-transform duration-700">
        <div className={`relative p-6 rounded-3xl backdrop-blur-md border ${logoCardBg}`}>
          <ChurchLogo
            size="xl"
            showText={true}
            showSubtitle={true}
            theme={isDark ? 'dark' : isSepia ? 'sepia' : 'light'}
          />
        </div>

        {/* Biblical Motto / Foundation Quote */}
        <div className="mt-8 space-y-2">
          <p className={`font-serif italic text-base sm:text-lg leading-relaxed ${quoteTextColor}`}>
            "Yo soy el Dios Todopoderoso; anda delante de mí y sé perfecto."
          </p>
          <span className={`inline-block text-xs font-bold tracking-wider uppercase ${citationColor}`}>
            Génesis 17:1 • El-Shaddai
          </span>
        </div>
      </div>

      {/* Bottom Loading Progress Bar */}
      <div className="w-full max-w-xs flex flex-col items-center gap-2 pb-6">
        <div className={`w-full h-1.5 rounded-full overflow-hidden ${progressBarTrack}`}>
          <div
            className={`h-full rounded-full transition-all duration-2000 ease-out ${progressBarGradient}`}
            style={{ width: fadeState === 'entering' ? '15%' : '100%' }}
          />
        </div>
        <span className={`text-[11px] font-medium tracking-wider ${progressLabelColor}`}>
          Abriendo Santuario de las Escrituras...
        </span>
      </div>
    </div>
  );
};
