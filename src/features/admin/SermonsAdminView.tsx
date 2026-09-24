import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Tv,
  Clock,
  User,
  Calendar,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  Share2,
  Play,
  FileText,
  Sparkles,
  Flame,
  CheckCircle2,
  ExternalLink,
  Layers,
  X,
  Save,
  Copy,
} from 'lucide-react';
import { SermonNote, SermonPoint, HierarchyScopeType } from '../../types';
import { sermonsService } from '../../services/sermons.service';
import { EventPresentationView } from '../../components/EventPresentationView';
import { ScopeSelector } from '../../components/ScopeSelector';
import { ScopeBadge } from '../../components/ScopeBadge';

interface SermonsAdminViewProps {
  onOpenLivePulpit?: (sermonId: string) => void;
  onNavigateToScripture?: (bookId: string, chapter: number, verse?: number) => void;
  onToast?: (message: string) => void;
  currentTheme?: 'light' | 'sepia' | 'dark';
}

export const SermonsAdminView: React.FC<SermonsAdminViewProps> = ({
  onOpenLivePulpit,
  onNavigateToScripture,
  onToast,
  currentTheme = 'light',
}) => {
  const [sermons, setSermons] = useState<SermonNote[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [speakerFilter, setSpeakerFilter] = useState('all');
  const [scopeFilter, setScopeFilter] = useState<'all' | HierarchyScopeType>('all');
  const [expandedSermonIds, setExpandedSermonIds] = useState<Record<string, boolean>>({
    sermon_001: true,
  });

  // Presentation modal state
  const [presentingSermon, setPresentingSermon] = useState<SermonNote | null>(null);

  // Edit / Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSermon, setEditingSermon] = useState<SermonNote | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formSpeaker, setFormSpeaker] = useState('');
  const [formMainScripture, setFormMainScripture] = useState('');
  const [formTheme, setFormTheme] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTargetDuration, setFormTargetDuration] = useState(40);
  const [formPoints, setFormPoints] = useState<SermonPoint[]>([]);
  const [formConclusion, setFormConclusion] = useState('');
  const [formScope, setFormScope] = useState<HierarchyScopeType>('general');
  const [formScopeTargetId, setFormScopeTargetId] = useState('general');
  const [formScopeName, setFormScopeName] = useState('Toda la Iglesia (General)');

  const loadSermons = () => {
    const list = sermonsService.getSermons();
    setSermons(list);
  };

  useEffect(() => {
    loadSermons();
  }, []);

  const speakersList = useMemo(() => {
    const set = new Set<string>();
    sermons.forEach((s) => set.add(s.speaker));
    return Array.from(set);
  }, [sermons]);

  const filteredSermons = useMemo(() => {
    return sermons.filter((s) => {
      const q = searchQuery.toLowerCase();
      const matchesQuery =
        !searchQuery ||
        s.title.toLowerCase().includes(q) ||
        s.speaker.toLowerCase().includes(q) ||
        s.mainScripture.toLowerCase().includes(q) ||
        s.theme.toLowerCase().includes(q) ||
        (s.scopeName && s.scopeName.toLowerCase().includes(q)) ||
        s.points.some((p) => p.title.toLowerCase().includes(q) || p.notes.toLowerCase().includes(q));

      const matchesSpeaker = speakerFilter === 'all' || s.speaker === speakerFilter;
      const matchesScope =
        scopeFilter === 'all' ||
        s.scope === scopeFilter ||
        (!s.scope && scopeFilter === 'general');

      return matchesQuery && matchesSpeaker && matchesScope;
    });
  }, [sermons, searchQuery, speakerFilter, scopeFilter]);

  const toggleExpand = (id: string) => {
    setExpandedSermonIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleOpenCreateModal = () => {
    setEditingSermon(null);
    setFormTitle('');
    setFormSpeaker('Pastor David Ben-David');
    setFormMainScripture('Juan 14:1-6');
    setFormTheme('Serie Paz en Cristo');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormTargetDuration(40);
    setFormScope('general');
    setFormScopeTargetId('general');
    setFormScopeName('Toda la Iglesia (General)');
    setFormPoints([
      {
        id: `p_${Date.now()}_1`,
        title: 'I. No se Turbe Vuestro Corazón: El Mandato de la Confianza (v. 1)',
        notes: 'La paz de Dios no es ausencia de problemas, sino la presencia soberana de Cristo.',
        scriptureRef: 'Juan 14:1',
        passageText: 'No se turbe vuestro corazón; creéis en Dios, creed también en mí.',
      },
      {
        id: `p_${Date.now()}_2`,
        title: 'II. En la Casa de mi Padre: La Certeza Eterna (v. 2-3)',
        notes: 'Nuestra morada definitiva está garantizada por la obra redentora del Señor.',
        scriptureRef: 'Juan 14:2-3',
        passageText: 'En la casa de mi Padre muchas moradas hay; si así no fuera, yo os lo hubiera dicho...',
      },
    ]);
    setFormConclusion('Llamado al altar: Entregar toda ansiedad e incertidumbre al Señor en oración.');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sermon: SermonNote) => {
    setEditingSermon(sermon);
    setFormTitle(sermon.title);
    setFormSpeaker(sermon.speaker);
    setFormMainScripture(sermon.mainScripture);
    setFormTheme(sermon.theme);
    setFormDate(sermon.date);
    setFormTargetDuration(sermon.targetDurationMinutes || 40);
    setFormScope(sermon.scope || 'general');
    setFormScopeTargetId(sermon.scopeTargetId || 'general');
    setFormScopeName(sermon.scopeName || 'Toda la Iglesia (General)');
    setFormPoints(
      sermon.points.map((p) => ({
        ...p,
      }))
    );
    setFormConclusion(sermon.conclusion);
    setIsModalOpen(true);
  };

  const handleAddPoint = () => {
    const nextNum = formPoints.length + 1;
    const roman = ['I', 'II', 'III', 'IV', 'V', 'VI'][nextNum - 1] || `${nextNum}`;
    setFormPoints((prev) => [
      ...prev,
      {
        id: `pt_${Date.now()}`,
        title: `${roman}. Punto Homilético ${nextNum}`,
        notes: '',
        scriptureRef: '',
        passageText: '',
      },
    ]);
  };

  const handleUpdatePoint = (index: number, field: keyof SermonPoint, val: string) => {
    setFormPoints((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleRemovePoint = (index: number) => {
    setFormPoints((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveSermon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      onToast?.('Por favor ingresa el título de la prédica');
      return;
    }

    const payload: SermonNote = {
      id: editingSermon ? editingSermon.id : `sermon_${Date.now()}`,
      scope: formScope,
      scopeTargetId: formScopeTargetId,
      scopeName: formScopeName,
      title: formTitle.trim(),
      speaker: formSpeaker.trim() || 'Pastor David Ben-David',
      mainScripture: formMainScripture.trim() || 'Romanos 8:28',
      theme: formTheme.trim() || 'Doctrina & Vida Cristiana',
      date: formDate || new Date().toISOString().split('T')[0],
      targetDurationMinutes: Number(formTargetDuration) || 40,
      points: formPoints.length > 0 ? formPoints : [
        {
          id: `p_default_${Date.now()}`,
          title: 'I. Principio Bíblico Principal',
          notes: 'Exposición bíblica general.',
        },
      ],
      conclusion: formConclusion.trim(),
    };

    sermonsService.saveSermon(payload);
    loadSermons();
    setIsModalOpen(false);
    onToast?.(editingSermon ? '¡Prédica actualizada con éxito!' : '¡Nueva prédica guardada en el Admin Hub!');
  };

  const handleDeleteSermon = (id: string, title: string) => {
    if (confirm(`¿Deseas eliminar el bosquejo de "${title}"?`)) {
      sermonsService.deleteSermon(id);
      loadSermons();
      onToast?.('Bosquejo eliminado.');
    }
  };

  const handleLaunchLivePulpit = (sermon: SermonNote) => {
    sermonsService.setActivePulpitSermonId(sermon.id);
    onToast?.(`Cargando "${sermon.title}" en el atril en vivo...`);
    if (onOpenLivePulpit) {
      onOpenLivePulpit(sermon.id);
    } else {
      window.location.hash = 'admin/pulpit';
    }
  };

  const handleCopySermonText = (sermon: SermonNote) => {
    const text = `📖 *${sermon.title}*\n👤 Predicador: ${sermon.speaker}\n📅 Fecha: ${sermon.date}\n📜 Pasaje Central: ${sermon.mainScripture}\n🎯 Tema: ${sermon.theme}\n⏱️ Duración: ${sermon.targetDurationMinutes} min\n\n` +
      sermon.points
        .map(
          (p, i) =>
            `🔹 *${p.title}*\n${p.scriptureRef ? `📖 ${p.scriptureRef}\n` : ''}${p.passageText ? `"${p.passageText}"\n` : ''}${p.notes}`
        )
        .join('\n\n') +
      `\n\n📌 *Llamado al Altar:*\n${sermon.conclusion}`;

    navigator.clipboard?.writeText(text);
    onToast?.('¡Bosquejo copiado al portapapeles!');
  };

  const isDark = currentTheme === 'dark';
  const isSepia = currentTheme === 'sepia';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#002147] via-[#0B2B68] to-[#1E3A8A] text-white p-6 rounded-3xl shadow-md border border-[#D4AF37]/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#FED65B] text-[#002147]">
              Submenú Eclesiástico
            </span>
            <span className="text-xs text-white/70 font-mono">Púlpito & Homilética</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#FED65B]" />
            Prédicas & Bosquejos Homiléticos
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed">
            Gestión pastoral unificada de sermones, bosquejos de predicación, puntos expositivos y sincronización instantánea con el atril en vivo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleLaunchLivePulpit(sermons[0] || sermonsService.getActivePulpitSermon())}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#F47B20] hover:bg-[#E06710] text-white text-xs font-bold shadow-md transition-all cursor-pointer border border-[#FED65B]/40"
            title="Lanzar atril en vivo con pantalla activa y cronómetro homilético"
          >
            <Tv className="w-4 h-4" />
            <span>Modo Púlpito en Vivo</span>
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FED65B] hover:bg-[#E6BE45] text-[#002147] text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nueva Prédica</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#1A1C24] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título, pasaje bíblico o puntos..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#002147] text-slate-800 dark:text-slate-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">Ámbito:</span>
            <select
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value as any)}
              className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#002147] cursor-pointer"
            >
              <option value="all">🌐 Todos los Ámbitos</option>
              <option value="general">Toda la Iglesia (General)</option>
              <option value="sede">🏛️ Sedes / Templos</option>
              <option value="anexo">⛪ Anexos Filiales</option>
              <option value="celula">🏠 Células en Hogares</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">Predicador:</span>
            <select
              value={speakerFilter}
              onChange={(e) => setSpeakerFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#002147] cursor-pointer"
            >
              <option value="all">Todos ({sermons.length})</option>
              {speakersList.map((sp) => (
                <option key={sp} value={sp}>
                  {sp}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Sermons List */}
      <div className="space-y-4">
        {filteredSermons.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#1A1C24] rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8">
            <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
              No se encontraron prédicas
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Crea tu primer bosquejo homilético para alimentar a la congregación con la sana doctrina.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-xl bg-[#002147] text-white text-xs font-bold hover:bg-[#0B2B68] transition-all cursor-pointer"
            >
              + Crear Primera Prédica
            </button>
          </div>
        ) : (
          filteredSermons.map((sermon) => {
            const isExpanded = !!expandedSermonIds[sermon.id];
            return (
              <div
                key={sermon.id}
                className="bg-white dark:bg-[#1A1C24] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all overflow-hidden"
              >
                {/* Sermon Card Header */}
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <ScopeBadge scope={sermon.scope} scopeName={sermon.scopeName} size="xs" />
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#002147]/10 dark:bg-[#002147]/40 text-[#002147] dark:text-[#FED65B] border border-[#002147]/20">
                          {sermon.theme}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          {sermon.date}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          {sermon.targetDurationMinutes} min
                        </span>
                      </div>

                      <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-900 dark:text-slate-100 hover:text-[#002147] dark:hover:text-[#FED65B] transition-colors">
                        {sermon.title}
                      </h2>

                      <div className="flex flex-wrap items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
                          <User className="w-3.5 h-3.5 text-[#F47B20]" />
                          <span>{sermon.speaker}</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[#002147] dark:text-[#FED65B] font-bold bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800/40">
                          <BookOpen className="w-3.5 h-3.5 text-[#F47B20]" />
                          <span>Pasaje: {sermon.mainScripture}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions on Card */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleLaunchLivePulpit(sermon)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#002147] hover:bg-[#0B2B68] text-white text-xs font-bold shadow-xs transition-all cursor-pointer border border-[#D4AF37]/30"
                        title="Abrir en Modo Púlpito en Vivo"
                      >
                        <Tv className="w-3.5 h-3.5 text-[#FED65B]" />
                        <span>Atril en Vivo</span>
                      </button>

                      <button
                        onClick={() => {
                          // Project sermon presentation view
                          setPresentingSermon(sermon);
                        }}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                        title="Proyectar en Pantalla Gigante"
                      >
                        <Play className="w-4 h-4 text-[#F47B20]" />
                      </button>

                      <button
                        onClick={() => handleCopySermonText(sermon)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                        title="Copiar bosquejo homilético completo"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(sermon)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                        title="Editar bosquejo"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteSermon(sermon.id, sermon.title)}
                        className="p-2 rounded-xl bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 transition-all cursor-pointer"
                        title="Eliminar bosquejo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => toggleExpand(sermon.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all cursor-pointer ml-1"
                      >
                        <span>{isExpanded ? 'Ocultar' : 'Ver Bosquejo'}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Points Content */}
                  {isExpanded && (
                    <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-[#002147] dark:text-[#FED65B] uppercase tracking-wider flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5" />
                          <span>Puntos Homiléticos ({sermon.points.length})</span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          Estructura pastoral del sermón
                        </span>
                      </div>

                      <div className="space-y-3">
                        {sermon.points.map((pt, idx) => (
                          <div
                            key={pt.id || idx}
                            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                {pt.title}
                              </h3>
                              {pt.scriptureRef && (
                                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#F47B20]/10 text-[#F47B20] border border-[#F47B20]/20 shrink-0">
                                  {pt.scriptureRef}
                                </span>
                              )}
                            </div>

                            {pt.passageText && (
                              <blockquote className="p-2.5 rounded-xl bg-amber-500/10 border-l-2 border-[#D4AF37] text-xs italic text-slate-700 dark:text-slate-300 leading-relaxed font-serif">
                                "{pt.passageText}"
                              </blockquote>
                            )}

                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                              {pt.notes}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Altar Call / Conclusion */}
                      {sermon.conclusion && (
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-[#F47B20]/30 space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#F47B20] uppercase tracking-wider">
                            <Flame className="w-3.5 h-3.5 text-[#F47B20]" />
                            <span>Llamado al Altar & Ministración:</span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                            {sermon.conclusion}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Projection Modal if Presenting */}
      {presentingSermon && (
        <EventPresentationView
          event={{
            id: presentingSermon.id,
            categoryId: 'cat_predica',
            title: presentingSermon.title,
            description: presentingSermon.points
              .map((p) => `${p.title}\n${p.scriptureRef ? `[${p.scriptureRef}] ` : ''}${p.notes}`)
              .join('\n\n') + `\n\nLlamado al Altar:\n${presentingSermon.conclusion}`,
            eventDate: presentingSermon.date,
            createdAt: presentingSermon.date,
            linkedVerses: [presentingSermon.mainScripture],
            tags: [presentingSermon.theme, presentingSermon.speaker],
            location: 'Templo Principal El-Shaddai',
            startTime: '10:30',
            endTime: '12:30',
          }}
          settings={{
            fontSize: 'medium',
            fontFamily: 'Inter',
            lineHeight: 'normal',
            translation: 'rvr1960',
            themeMode: currentTheme,
            showVerseNumbers: true,
          }}
          onExit={() => setPresentingSermon(null)}
          onNavigateToScripture={onNavigateToScripture}
          onToast={onToast}
        />
      )}

      {/* Create / Edit Sermon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#1A1C24] w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#002147] text-white flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#FED65B]" />
                <h3 className="font-serif font-bold text-base sm:text-lg">
                  {editingSermon ? 'Editar Prédica & Bosquejo' : 'Nueva Prédica & Bosquejo Homilético'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveSermon} className="p-6 overflow-y-auto space-y-5 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Título de la Prédica *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Ej. La Fidelidad Inmutable de El-Shaddai"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#002147] text-slate-800 dark:text-slate-100"
                  />
                </div>

                {/* Scope Hierarchy Selector */}
                <div className="sm:col-span-2">
                  <ScopeSelector
                    scope={formScope}
                    targetId={formScopeTargetId}
                    onChange={(scope, targetId, scopeName) => {
                      setFormScope(scope);
                      setFormScopeTargetId(targetId);
                      setFormScopeName(scopeName);
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Predicador / Orador
                  </label>
                  <input
                    type="text"
                    value={formSpeaker}
                    onChange={(e) => setFormSpeaker(e.target.value)}
                    placeholder="Ej. Pastor David Ben-David"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#002147] text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Pasaje Central de las Escrituras
                  </label>
                  <input
                    type="text"
                    value={formMainScripture}
                    onChange={(e) => setFormMainScripture(e.target.value)}
                    placeholder="Ej. Romanos 12:1-2 o Génesis 17:1-7"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#002147] text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Tema o Serie
                  </label>
                  <input
                    type="text"
                    value={formTheme}
                    onChange={(e) => setFormTheme(e.target.value)}
                    placeholder="Ej. Serie Pactos Eternos, Fe Inquebrantable"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#002147] text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Fecha
                    </label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#002147] text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Duración (min)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={120}
                      value={formTargetDuration}
                      onChange={(e) => setFormTargetDuration(Number(e.target.value))}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#002147] text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Homiletic Points */}
              <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#002147] dark:text-[#FED65B] uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4" />
                    Puntos Homiléticos del Bosquejo ({formPoints.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddPoint}
                    className="flex items-center gap-1 px-3 py-1 rounded-xl bg-[#002147] text-white text-xs font-bold hover:bg-[#0B2B68] transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Punto</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {formPoints.map((pt, idx) => (
                    <div
                      key={pt.id || idx}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-[#F47B20]">
                          Punto #{idx + 1}
                        </span>
                        {formPoints.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePoint(idx)}
                            className="text-red-500 hover:text-red-700 p-1 text-xs font-bold transition-colors cursor-pointer"
                            title="Quitar este punto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                            Encabezado / Título del Punto
                          </label>
                          <input
                            type="text"
                            value={pt.title}
                            onChange={(e) => handleUpdatePoint(idx, 'title', e.target.value)}
                            placeholder="Ej. I. La Manifestación de la Gloria Divina"
                            className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                            Cita Bíblica
                          </label>
                          <input
                            type="text"
                            value={pt.scriptureRef || ''}
                            onChange={(e) => handleUpdatePoint(idx, 'scriptureRef', e.target.value)}
                            placeholder="Ej. Génesis 17:1"
                            className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                          Texto del Versículo (Opcional, para proyección o lectura directa)
                        </label>
                        <input
                          type="text"
                          value={pt.passageText || ''}
                          onChange={(e) => handleUpdatePoint(idx, 'passageText', e.target.value)}
                          placeholder="Texto bíblico que se proyectará o leerá..."
                          className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 italic font-serif"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                          Notas Homiléticas / Exposición Pastoral
                        </label>
                        <textarea
                          rows={2}
                          value={pt.notes}
                          onChange={(e) => handleUpdatePoint(idx, 'notes', e.target.value)}
                          placeholder="Comentarios, ilustraciones, aplicaciones prácticas..."
                          className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Altar Call */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                <label className="block text-xs font-bold text-[#F47B20] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-[#F47B20]" />
                  Conclusión & Llamado al Altar
                </label>
                <textarea
                  rows={3}
                  value={formConclusion}
                  onChange={(e) => setFormConclusion(e.target.value)}
                  placeholder="Instrucciones para la ministración, oración de fe, bendición pastoral..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#002147] text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#002147] hover:bg-[#0B2B68] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4 text-[#FED65B]" />
                  <span>Guardar Prédica</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
