import React, { useState, useEffect, useRef } from 'react';
import {
  Maximize2,
  Minimize2,
  Play,
  Pause,
  RotateCcw,
  Sun,
  Moon,
  Type,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Check,
  AlertCircle,
  Clock,
  Eye,
  Settings2,
  ArrowLeft,
  Flame,
} from 'lucide-react';
import { SermonNote, SermonPoint } from '../../types';
import { sermonsService } from '../../services/sermons.service';

interface PulpitModeViewProps {
  initialSermonId?: string;
  onExitPulpit?: () => void;
  onToast?: (message: string) => void;
}

const SAMPLE_SERMON: SermonNote = {
  id: 'sermon_001',
  title: 'La Fidelidad Inmutable de El-Shaddai en Tiempos de Incertidumbre',
  speaker: 'Pastor David Ben-David',
  mainScripture: 'Génesis 17:1-7 & Hebreos 6:13-20',
  theme: 'Pactos Eternos, Soberanía Divina y Fe Inconmovible',
  date: new Date().toLocaleDateString('es-CL'),
  targetDurationMinutes: 40,
  points: [
    {
      id: 'p1',
      title: 'I. La Revelación de El-Shaddai: El Dios Suficiente (Gn 17:1-2)',
      notes:
        'A Abram a los noventa y nueve años, cuando todas las fuerzas naturales se habían agotado, Dios se revela como "El-Shaddai" (Dios Todopoderoso y Omnisuficiente). La orden es clara: "Anda delante de mí y sé perfecto". Nuestra suficiencia nunca descansa en recursos humanos, sino en el carácter inquebrantable de Dios.',
      scriptureRef: 'Génesis 17:1-2',
      passageText:
        'Era Abram de edad de noventa y nueve años, cuando le apareció Jehová y le dijo: Yo soy el Dios Todopoderoso; anda delante de mí y sé perfecto. Y pondré mi pacto entre mí y ti, y te multiplicaré en gran manera.',
    },
    {
      id: 'p2',
      title: 'II. El Cambio de Nombre y la Identidad del Reino (Gn 17:5)',
      notes:
        'De Abram (padre enaltecido) a Abraham (padre de multitudes). Dios redefine nuestra identidad a la luz de Su promesa y propósito eterno, no de nuestra limitación presente. Los pactos divinos transforman no solo nuestro destino, sino nuestra naturaleza diaria.',
      scriptureRef: 'Génesis 17:5',
      passageText:
        'Y no se llamará más tu nombre Abram, sino que será tu nombre Abraham, porque te he puesto por padre de muchedumbre de gentes.',
    },
    {
      id: 'p3',
      title: 'III. El Ancla Firme y Segura del Alma (Hebreos 6:17-19)',
      notes:
        'Por cuanto Dios no podía jurar por otro mayor, juró por Sí mismo. Tenemos dos cosas inmutables: la promesa y el juramento divino en el cual es imposible que Dios mienta. La esperanza cristiana no es un deseo vago; es un ancla echada en el Lugar Santísimo.',
      scriptureRef: 'Hebreos 6:18-19',
      passageText:
        'Para que por dos cosas inmutables, en las cuales es imposible que Dios mienta, tengamos un fortísimo consuelo los que hemos acudido para asirnos de la esperanza puesta delante de nosotros. La cual tenemos como segura y firme ancla del alma...',
    },
  ],
  conclusion:
    'Llamado al altar: Aquellos que hoy atraviesan valles de imposibilidad recuerden que el Dios de Abram sigue siendo El-Shaddai hoy. Entreguemos nuestras cargas y descansemos en Su fidelidad.',
};

export const PulpitModeView: React.FC<PulpitModeViewProps> = ({
  initialSermonId,
  onExitPulpit,
  onToast,
}) => {
  // Sermon State
  const [allSermons, setAllSermons] = useState<SermonNote[]>(() => sermonsService.getSermons());
  const [sermon, setSermon] = useState<SermonNote>(() => {
    if (initialSermonId) {
      const found = sermonsService.getSermonById(initialSermonId);
      if (found) return found;
    }
    return sermonsService.getActivePulpitSermon();
  });

  const [expandedPoints, setExpandedPoints] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    sermon.points.forEach((p) => {
      map[p.id] = true;
    });
    return map;
  });

  // Presentation & Typography Settings
  const [fontSizeLevel, setFontSizeLevel] = useState<'normal' | 'large' | 'xlarge'>('large');
  const [highContrastPulpit, setHighContrastPulpit] = useState(true); // Pure black #090A0F for stage podium
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleSelectSermon = (id: string) => {
    const found = allSermons.find((s) => s.id === id);
    if (found) {
      setSermon(found);
      sermonsService.setActivePulpitSermonId(id);
      const map: Record<string, boolean> = {};
      found.points.forEach((p) => {
        map[p.id] = true;
      });
      setExpandedPoints(map);
      onToast?.(`Prédica cambiada: ${found.title}`);
    }
  };

  // Live Timer State
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Wake Lock API state
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const wakeLockRef = useRef<any>(null);

  // Request Wake Lock on mount to keep podium screen awake
  useEffect(() => {
    let isMounted = true;

    async function requestWakeLock() {
      try {
        if ('wakeLock' in navigator) {
          const lock = await (navigator as any).wakeLock.request('screen');
          wakeLockRef.current = lock;
          if (isMounted) setWakeLockActive(true);

          lock.addEventListener('release', () => {
            if (isMounted) setWakeLockActive(false);
          });
        }
      } catch (err) {
        console.warn('Wake Lock request error or not supported:', err);
      }
    }

    requestWakeLock();

    return () => {
      isMounted = false;
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
      }
    };
  }, []);

  // Timer interval handling
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning]);

  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);
  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      setIsFullscreen(!isFullscreen);
    }
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const targetSecs = (sermon.targetDurationMinutes || 40) * 60;
  const progressPercent = Math.min(100, Math.round((timerSeconds / targetSecs) * 100));
  const isOvertime = timerSeconds > targetSecs;

  const togglePoint = (id: string) => {
    setExpandedPoints((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Font size classes
  const titleSizeClass =
    fontSizeLevel === 'normal' ? 'text-2xl' : fontSizeLevel === 'large' ? 'text-3xl lg:text-4xl' : 'text-4xl lg:text-5xl';
  const scriptureSizeClass =
    fontSizeLevel === 'normal' ? 'text-lg' : fontSizeLevel === 'large' ? 'text-xl lg:text-2xl' : 'text-2xl lg:text-3xl';
  const notesSizeClass =
    fontSizeLevel === 'normal' ? 'text-base' : fontSizeLevel === 'large' ? 'text-lg lg:text-xl' : 'text-xl lg:text-2xl';

  const pulpitBgClass = highContrastPulpit
    ? 'bg-[#08090D] text-[#E8ECF5]'
    : 'bg-[#121318] text-[#E5E7EB]';

  return (
    <div className={`w-full min-h-screen ${pulpitBgClass} flex flex-col antialiased select-text transition-colors duration-200`}>
      {/* Top Fixed Pulpit Control Bar */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/10 px-4 lg:px-8 py-3 flex items-center justify-between shadow-2xl">
        {/* Left: Exit & Title */}
        <div className="flex items-center gap-3">
          {onExitPulpit && (
            <button
              onClick={onExitPulpit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Salir del Púlpito</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs uppercase font-bold tracking-wider text-[#FED65B]">
              Modo Púlpito en Vivo
            </span>
          </div>

          {/* Wake Lock indicator */}
          <div
            className={`hidden md:flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full border ${
              wakeLockActive
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Previene que la pantalla se apague mientras predicas"
          >
            <Eye className="w-3 h-3" />
            <span>{wakeLockActive ? 'Pantalla Activa' : 'WakeLock Normal'}</span>
          </div>

          {/* Quick Sermon Switcher */}
          {allSermons.length > 1 && (
            <div className="hidden lg:flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Prédica:</span>
              <select
                value={sermon.id}
                onChange={(e) => handleSelectSermon(e.target.value)}
                className="bg-transparent text-xs text-[#FED65B] font-bold focus:outline-none cursor-pointer max-w-[200px] truncate"
              >
                {allSermons.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#090A0F] text-white">
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Center: Live Timer Control */}
        <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 px-4 py-1.5 rounded-2xl">
          <div
            className={`font-mono font-bold text-lg lg:text-xl tracking-wider ${
              isOvertime ? 'text-rose-400 animate-pulse' : 'text-white'
            }`}
          >
            {formatTimer(timerSeconds)}
          </div>

          <span className="text-xs text-slate-400">
            / {sermon.targetDurationMinutes}:00 min
          </span>

          <button
            onClick={toggleTimer}
            className={`p-1.5 rounded-xl transition-all cursor-pointer ${
              isTimerRunning
                ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
            }`}
            title={isTimerRunning ? 'Pausar cronómetro' : 'Iniciar cronómetro'}
          >
            {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            onClick={resetTimer}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title="Reiniciar cronómetro"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Typography & Display Controls */}
        <div className="flex items-center gap-2">
          {/* Font Size Selector */}
          <div className="flex items-center bg-white/5 rounded-xl p-0.5 border border-white/10">
            {(['normal', 'large', 'xlarge'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFontSizeLevel(lvl)}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  fontSizeLevel === lvl
                    ? 'bg-[#F47B20] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lvl === 'normal' ? 'A' : lvl === 'large' ? 'A+' : 'A++'}
              </button>
            ))}
          </div>

          {/* High contrast black toggle */}
          <button
            onClick={() => setHighContrastPulpit(!highContrastPulpit)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              highContrastPulpit
                ? 'bg-white/10 text-[#FED65B] border-white/20'
                : 'text-slate-400 border-white/10 hover:text-white'
            }`}
            title="Alternar Contraste Oscuro Puro / Púlpito"
          >
            <Moon className="w-4 h-4" />
          </button>

          {/* Fullscreen button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title="Pantalla Completa"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Timer Progress Bar */}
      <div className="w-full h-1 bg-white/5 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            isOvertime
              ? 'bg-rose-500'
              : progressPercent > 80
              ? 'bg-amber-400'
              : 'bg-[#FED65B]'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Sermon Presentation Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 lg:px-12 py-8 lg:py-12 space-y-8">
        {/* Sermon Title & Context Card */}
        <div className="space-y-3 pb-6 border-b border-white/10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#FED65B] uppercase tracking-widest">
            <BookOpen className="w-4 h-4" />
            <span>Bosquejo Homilético & Pasaje Principal</span>
          </div>

          <h1 className={`font-serif font-bold text-white leading-tight ${titleSizeClass}`}>
            {sermon.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs lg:text-sm text-slate-300 pt-1">
            <span>
              Expositor: <strong className="text-white">{sermon.speaker}</strong>
            </span>
            <span className="opacity-40">&bull;</span>
            <span className="text-[#FED65B] font-semibold">
              📖 {sermon.mainScripture}
            </span>
            <span className="opacity-40">&bull;</span>
            <span className="text-slate-400">{sermon.date}</span>
          </div>
        </div>

        {/* Sermon Points (Interactive Expandable Cards) */}
        <div className="space-y-6">
          {sermon.points.map((pt, idx) => {
            const isExpanded = !!expandedPoints[pt.id];

            return (
              <div
                key={pt.id}
                className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-md overflow-hidden transition-all shadow-xl"
              >
                {/* Point Header Bar */}
                <button
                  onClick={() => togglePoint(pt.id)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 pr-2">
                    <span className="w-8 h-8 rounded-xl bg-[#F47B20]/20 text-[#FED65B] flex items-center justify-center font-bold text-sm border border-[#F47B20]/30 flex-shrink-0">
                      {idx + 1}
                    </span>
                    <h2 className="text-lg lg:text-xl font-bold font-serif text-white leading-snug">
                      {pt.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 text-slate-400">
                    <span className="text-xs hidden sm:inline text-slate-500">
                      {isExpanded ? 'Contraer' : 'Expandir'}
                    </span>
                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </div>
                </button>

                {/* Point Body (Scripture Quote + Homiletical Notes) */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 space-y-5 border-t border-white/5 animate-in fade-in duration-200">
                    {/* Scripture Quote Box with High-Contrast Serif */}
                    {pt.passageText && (
                      <div className="p-5 rounded-2xl bg-[#002147]/40 border-l-4 border-[#FED65B] space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-[#FED65B] uppercase tracking-wider">
                          <span className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5" />
                            {pt.scriptureRef || 'Texto Canónico'}
                          </span>
                          <span className="text-[10px] text-slate-400">RVR1960 / Canónica</span>
                        </div>
                        <blockquote className={`font-serif italic text-[#F9F6F0] leading-relaxed ${scriptureSizeClass}`}>
                          "{pt.passageText}"
                        </blockquote>
                      </div>
                    )}

                    {/* Preaching Notes */}
                    <div className={`text-slate-200 leading-relaxed font-sans ${notesSizeClass}`}>
                      <p>{pt.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Conclusion / Altar Call */}
        <div className="p-6 rounded-3xl border border-[#FED65B]/30 bg-[#FED65B]/5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#FED65B] uppercase tracking-wider">
            <Flame className="w-4 h-4 text-[#F47B20]" />
            <span>Conclusión Pastoral & Llamado al Altar</span>
          </div>
          <p className={`font-serif italic text-white leading-relaxed ${notesSizeClass}`}>
            "{sermon.conclusion}"
          </p>
        </div>

        {/* Distraction-Free Bottom Space */}
        <div className="py-16 text-center text-xs text-slate-600">
          Santuario Digital &bull; Plataforma Eclesiástica El-Shaddai
        </div>
      </main>
    </div>
  );
};
