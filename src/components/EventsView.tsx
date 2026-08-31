import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Plus,
  Search,
  BookOpen,
  Mic,
  HeartHandshake,
  Users,
  Flame,
  Sparkles,
  Share2,
  Trash2,
  Edit3,
  ExternalLink,
  FolderPlus,
  CheckCircle2,
  FileText,
  X,
  ArrowLeft,
  Save,
  ChevronDown,
  ChevronUp,
  Play,
  Tag as TagIcon,
  MapPin,
  Clock,
  Ticket,
  Image as ImageIcon,
  Upload,
  AlertTriangle,
  Navigation,
  Globe
} from 'lucide-react';
import { EventCategory, UserEvent, ReadingSettings } from '../types';
import { StorageService, DEFAULT_CHURCH_LOCATION, DEFAULT_CHURCH_COORDINATES, getMapsUrlForLocation } from '../services/storageService';
import { EventPresentationView } from './EventPresentationView';
import { EventShareModal } from './EventShareModal';

interface EventsViewProps {
  settings: ReadingSettings;
  onNavigateToScripture?: (bookId: string, chapter: number, verse?: number) => void;
  onShareContent?: (title: string, text: string, reference?: string) => void;
  onToast?: (msg: string) => void;
}

const AVAILABLE_ICONS: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Mic: Mic,
  HeartHandshake: HeartHandshake,
  BookOpen: BookOpen,
  Users: Users,
  Flame: Flame,
  Sparkles: Sparkles,
  Calendar: Calendar,
  FileText: FileText
};

const PALETTE_COLORS = [
  '#0B2B68', // Deep Navy
  '#F47B20', // Warm Amber
  '#00A3E0', // Cyan Blue
  '#059669', // Emerald
  '#7C3AED', // Purple
  '#DC2626', // Crimson
  '#D97706', // Gold
  '#DB2777'  // Rose
];

export const EVENT_IMAGE_PRESETS = [
  {
    label: 'Culto Dominical',
    url: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&auto=format&fit=crop&q=80'
  },
  {
    label: 'Conferencia & Prédica',
    url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80'
  },
  {
    label: 'Matrimonios & Familia',
    url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80'
  },
  {
    label: 'Alabanza & Adoración',
    url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80'
  },
  {
    label: 'Jóvenes & Campamento',
    url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&auto=format&fit=crop&q=80'
  },
  {
    label: 'Vigilia & Oración',
    url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&auto=format&fit=crop&q=80'
  }
];

export const EventsView: React.FC<EventsViewProps> = ({
  settings,
  onNavigateToScripture,
  onShareContent,
  onToast
}) => {
  const [categories, setCategories] = useState<EventCategory[]>(() => StorageService.getCategories());
  const [events, setEvents] = useState<UserEvent[]>(() => StorageService.getEvents());
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedCardIds, setExpandedCardIds] = useState<Set<string>>(new Set());

  // Modal States
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<UserEvent | null>(null);
  const [presentingEvent, setPresentingEvent] = useState<UserEvent | null>(null);
  const [sharingEvent, setSharingEvent] = useState<UserEvent | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isGpsPromptOpen, setIsGpsPromptOpen] = useState(false);

  // Event Form State
  const [formCategoryId, setFormCategoryId] = useState<string>(categories[0]?.id || 'cat_predica');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formVerseInput, setFormVerseInput] = useState<string>('');
  const [formLinkedVerses, setFormLinkedVerses] = useState<string[]>([]);
  const [formTagInput, setFormTagInput] = useState<string>('');
  const [formTags, setFormTags] = useState<string[]>([]);
  
  // Optional Event Details State
  const [formLocation, setFormLocation] = useState<string>(DEFAULT_CHURCH_LOCATION);
  const [formStartTime, setFormStartTime] = useState<string>('');
  const [formEndTime, setFormEndTime] = useState<string>('');
  const [formImageUrl, setFormImageUrl] = useState<string>('');
  const [formPrice, setFormPrice] = useState<string>('');

  // Category Form State
  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('BookOpen');
  const [catColor, setCatColor] = useState('#0B2B68');

  // Time Validation: End Time must be greater than Start Time
  const timeValidationError = useMemo(() => {
    if (formStartTime && formEndTime) {
      if (formEndTime <= formStartTime) {
        return `La hora de fin (${formEndTime}) debe ser posterior a la hora de inicio (${formStartTime}).`;
      }
    }
    return null;
  }, [formStartTime, formEndTime]);

  // Helper to calculate end time given a duration in hours
  const handleAutoSetEndTime = (durationHours: number) => {
    if (!formStartTime) {
      if (onToast) onToast('Primero define la hora de inicio');
      return;
    }
    const [hStr, mStr] = formStartTime.split(':');
    let totalMinutes = parseInt(hStr, 10) * 60 + parseInt(mStr, 10) + Math.round(durationHours * 60);
    // Wrap around 24 hours
    totalMinutes = totalMinutes % (24 * 60);
    const newH = Math.floor(totalMinutes / 60);
    const newM = totalMinutes % 60;
    const formatted = `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
    setFormEndTime(formatted);
  };

  // Trigger GPS permission dialog
  const handleGetGpsLocation = () => {
    setIsGpsPromptOpen(true);
  };

  // Execute GPS Geolocation once permission is confirmed by user
  const handleConfirmGpsAccess = () => {
    if (!navigator.geolocation) {
      setIsGpsPromptOpen(false);
      if (onToast) onToast('Tu navegador no soporta geolocalización GPS');
      return;
    }

    setIsLocating(true);
    if (onToast) onToast('Solicitando señal de satélite GPS del móvil...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        setIsGpsPromptOpen(false);
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        setFormLocation(`GPS: ${lat}, ${lng} (Ubicación Móvil)`);
        if (onToast) onToast(`¡Coordenadas GPS obtenidas: ${lat}, ${lng}!`);
      },
      (err) => {
        setIsLocating(false);
        setIsGpsPromptOpen(false);
        let msg = 'No se pudo acceder al GPS del dispositivo.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Permiso de GPS no concedido en tu móvil o navegador. Puedes usar la dirección predeterminada del Salón Principal.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Señal GPS no disponible actualmente en el móvil.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'El tiempo de espera del GPS expiró.';
        }
        if (onToast) onToast(msg);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const handleSetDefaultLocation = () => {
    setFormLocation(DEFAULT_CHURCH_LOCATION);
    setIsGpsPromptOpen(false);
    if (onToast) onToast('Ubicación fijada: Salón Principal (Brown 1285, San Juan)');
  };

  const handleOpenMapsSearch = () => {
    window.open(getMapsUrlForLocation(formLocation), '_blank');
  };

  const isDark = settings.themeMode === 'dark';
  const isSepia = settings.themeMode === 'sepia';

  const containerBg = isDark ? 'bg-[#0E131F] text-[#F1F3F9]' : isSepia ? 'bg-[#F4ECE1] text-[#2D2319]' : 'bg-[#FAF8F5] text-[#1E293B]';
  const cardBg = isDark ? 'bg-[#182033] border-[#252D43]' : isSepia ? 'bg-[#EFE7D8] border-[#DECDB8]' : 'bg-white border-[#E5E7EB]';
  const subtextColor = isDark ? 'text-[#9AA5C2]' : isSepia ? 'text-[#705335]' : 'text-[#64748B]';

  const filteredEvents = useMemo(() => {
    return events.filter(evt => {
      const matchesCategory = selectedCategoryFilter === 'ALL' || evt.categoryId === selectedCategoryFilter;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesSearch =
        evt.title.toLowerCase().includes(q) ||
        evt.description.toLowerCase().includes(q) ||
        evt.linkedVerses.some(v => v.toLowerCase().includes(q)) ||
        (evt.tags && evt.tags.some(t => t.toLowerCase().includes(q))) ||
        (evt.location && evt.location.toLowerCase().includes(q)) ||
        (evt.price && evt.price.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [events, selectedCategoryFilter, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedCardIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const openCreateEventModal = (prefillCategoryId?: string) => {
    setEditingEvent(null);
    setFormCategoryId(prefillCategoryId || (selectedCategoryFilter !== 'ALL' ? selectedCategoryFilter : categories[0]?.id || ''));
    setFormTitle('');
    setFormDescription('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormLinkedVerses([]);
    setFormTags([]);
    setFormVerseInput('');
    setFormTagInput('');
    setFormLocation(DEFAULT_CHURCH_LOCATION);
    setFormStartTime('');
    setFormEndTime('');
    setFormImageUrl('');
    setFormPrice('');
    setIsEventModalOpen(true);
  };

  const openEditEventModal = (evt: UserEvent) => {
    setEditingEvent(evt);
    setFormCategoryId(evt.categoryId);
    setFormTitle(evt.title);
    setFormDescription(evt.description);
    setFormDate(evt.eventDate || new Date().toISOString().split('T')[0]);
    setFormLinkedVerses(evt.linkedVerses || []);
    setFormTags(evt.tags || []);
    setFormVerseInput('');
    setFormTagInput('');
    setFormLocation(evt.location || '');
    setFormStartTime(evt.startTime || '');
    setFormEndTime(evt.endTime || '');
    setFormImageUrl(evt.imageUrl || '');
    setFormPrice(evt.price || '');
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      if (onToast) onToast('Por favor escribe un título para el registro');
      return;
    }

    if (formStartTime && formEndTime && formEndTime <= formStartTime) {
      if (onToast) onToast(`⚠️ La hora de fin (${formEndTime}) debe ser posterior a la hora de inicio (${formStartTime})`);
      return;
    }

    StorageService.saveEvent({
      id: editingEvent?.id,
      categoryId: formCategoryId,
      title: formTitle.trim(),
      description: formDescription.trim(),
      linkedVerses: formLinkedVerses,
      eventDate: formDate,
      tags: formTags,
      location: formLocation.trim() || undefined,
      startTime: formStartTime.trim() || undefined,
      endTime: formEndTime.trim() || undefined,
      imageUrl: formImageUrl.trim() || undefined,
      price: formPrice.trim() || undefined
    });

    setEvents(StorageService.getEvents());
    setIsEventModalOpen(false);
    if (onToast) onToast(editingEvent ? 'Registro actualizado correctamente' : '¡Registro guardado en tu bitácora!');
  };

  const handleDeleteEvent = (id: string, title: string) => {
    if (window.confirm(`¿Deseas eliminar "${title}" de tu bitácora?`)) {
      StorageService.deleteEvent(id);
      setEvents(StorageService.getEvents());
      if (onToast) onToast('Registro eliminado');
    }
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    const newCat = StorageService.saveCategory({
      name: catName.trim(),
      iconName: catIcon,
      colorHex: catColor
    });

    setCategories(StorageService.getCategories());
    setCatName('');
    setIsCategoryModalOpen(false);
    setSelectedCategoryFilter(newCat.id);
    if (onToast) onToast(`Categoría "${newCat.name}" creada con éxito`);
  };

  const handleAddLinkedVerse = () => {
    if (!formVerseInput.trim()) return;
    const v = formVerseInput.trim();
    if (!formLinkedVerses.includes(v)) {
      setFormLinkedVerses([...formLinkedVerses, v]);
    }
    setFormVerseInput('');
  };

  const handleRemoveLinkedVerse = (index: number) => {
    setFormLinkedVerses(formLinkedVerses.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    if (!formTagInput.trim()) return;
    const t = formTagInput.trim().replace(/^#/, '');
    if (!formTags.includes(t)) {
      setFormTags([...formTags, t]);
    }
    setFormTagInput('');
  };

  const handleRemoveTag = (index: number) => {
    setFormTags(formTags.filter((_, i) => i !== index));
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      if (onToast) onToast('La imagen es mayor a 2MB. Te sugerimos usar una imagen más liviana.');
    }

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const result = loadEvt.target?.result as string;
      if (result) {
        setFormImageUrl(result);
        if (onToast) onToast('Imagen cargada correctamente');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleShareEvent = (evt: UserEvent) => {
    setSharingEvent(evt);
  };

  const handleParseVerseAndNavigate = (verseStr: string) => {
    if (!onNavigateToScripture) return;
    const parts = verseStr.match(/^([1-3]?\s?[A-Za-zÁÉÍÓÚáéíóúñÑ]+)\s+(\d+)(?::(\d+))?/);
    if (parts) {
      const bookName = parts[1].trim();
      const chapter = parseInt(parts[2], 10);
      const verse = parts[3] ? parseInt(parts[3], 10) : 1;
      onNavigateToScripture(bookName, chapter, verse);
    }
  };

  const totalVersesLinked = useMemo(() => {
    return events.reduce((acc, curr) => acc + (curr.linkedVerses?.length || 0), 0);
  }, [events]);

  // ==========================================
  // FULL SCREEN PRESENTATION MODE (READ-ONLY)
  // ==========================================
  if (presentingEvent) {
    const activeCat = categories.find(c => c.id === presentingEvent.categoryId);
    return (
      <EventPresentationView
        event={presentingEvent}
        category={activeCat}
        settings={settings}
        onExit={() => setPresentingEvent(null)}
        onNavigateToScripture={onNavigateToScripture}
        onShareContent={onShareContent}
        onToast={onToast}
      />
    );
  }

  // ==========================================
  // FULL SCREEN VIEW: CREATE / EDIT EVENT
  // ==========================================
  if (isEventModalOpen) {
    const activeCat = categories.find(c => c.id === formCategoryId);

    return (
      <div className={`min-h-screen ${containerBg} w-full max-w-full pb-28 md:pb-24 animate-in fade-in duration-200`}>
        {/* Full Screen Top Sticky Header */}
        <div
          className={`sticky top-0 z-30 px-3.5 sm:px-6 py-3 border-b backdrop-blur-md flex items-center justify-between gap-2.5 ${
            isDark
              ? 'bg-[#0E131F]/90 border-[#252D43]'
              : isSepia
              ? 'bg-[#F4ECE1]/90 border-[#DECDB8]'
              : 'bg-[#FAF8F5]/90 border-[#EAE8E3]'
          }`}
        >
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsEventModalOpen(false)}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl border flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0 ${
                isDark
                  ? 'bg-[#182033] border-[#252D43] text-[#E2E8F0] hover:bg-[#252D43]'
                  : isSepia
                  ? 'bg-[#EFE7D8] border-[#DECDB8] text-[#5C452D] hover:bg-[#E2D5C1]'
                  : 'bg-white border-[#E5E7EB] text-[#0B2B68] hover:bg-slate-50'
              }`}
              title="Volver a la lista de apuntes"
              aria-label="Volver"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Volver</span>
            </button>

            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg font-bold font-display truncate">
                {editingEvent ? 'Editar Apunte / Prédica' : 'Nueva Prédica o Devocional'}
              </h1>
              <p className={`text-[10px] sm:text-xs truncate ${subtextColor}`}>
                {activeCat?.name || 'Bitácora'} • {formDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsEventModalOpen(false)}
              className="hidden sm:inline-flex px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveEvent}
              className="px-3.5 sm:px-5 py-2 min-h-[38px] sm:min-h-[42px] rounded-xl bg-[#0B2B68] text-[#FED65B] text-xs sm:text-sm font-bold hover:bg-[#081F4B] shadow-sm flex items-center gap-1.5 cursor-pointer transition-all hover:shadow-md"
            >
              <Save className="w-4 h-4 shrink-0" />
              <span>Guardar</span>
            </button>
          </div>
        </div>

        {/* Full Screen Form Body */}
        <div className="max-w-3xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6">
          <form onSubmit={handleSaveEvent} className="space-y-4 sm:space-y-6">
            {/* Category Selector Chips */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs sm:text-sm font-bold uppercase tracking-wider opacity-80 flex items-center gap-1.5">
                  <FolderPlus className="w-3.5 h-3.5 text-[#F47B20]" />
                  Categoría
                </label>
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="text-xs text-[#00A3E0] font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  + Nueva categoría
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {categories.map(c => {
                  const IconComp = AVAILABLE_ICONS[c.iconName] || BookOpen;
                  const isSelected = formCategoryId === c.id;
                  return (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => setFormCategoryId(c.id)}
                      className={`p-2.5 sm:p-3 rounded-xl border flex items-center gap-2 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#0B2B68] text-[#FED65B] border-[#0B2B68] shadow-2xs ring-2 ring-[#0B2B68]/30'
                          : isDark
                          ? 'bg-[#182033] border-[#252D43] text-slate-300 hover:bg-[#20293F]'
                          : isSepia
                          ? 'bg-[#EFE7D8] border-[#DECDB8] text-[#5C452D] hover:bg-[#E5DAC6]'
                          : 'bg-white border-[#E5E7EB] text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: c.colorHex }}
                      />
                      <IconComp className="w-4 h-4 shrink-0" />
                      <span className="text-xs font-semibold truncate flex-1">{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date & Sermon Title */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider mb-1.5 opacity-80 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#0B2B68]" />
                  Fecha
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={e => setFormDate(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2B68] font-medium ${
                    isDark ? 'bg-[#182033] border-[#252D43] text-white' : 'bg-white border-[#E5E7EB] text-slate-800'
                  }`}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider mb-1.5 opacity-80 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#0B2B68]" />
                  Título del Tema o Sermón *
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="Ej: La Gracia Redentora / Caminando en Fe"
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0B2B68] ${
                    isDark ? 'bg-[#182033] border-[#252D43] text-white' : 'bg-white border-[#E5E7EB] text-slate-800'
                  }`}
                />
              </div>
            </div>

            {/* Optional Details: Schedule & Location */}
            <div className={`p-4 rounded-2xl border ${cardBg} space-y-3.5`}>
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold uppercase tracking-wider opacity-80 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#F47B20]" />
                  Horario & Ubicación <span className="text-[11px] font-normal lowercase opacity-70">(opcionales)</span>
                </label>
              </div>

              {/* Start & End Time with Validation */}
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${subtextColor} flex items-center gap-1`}>
                      <Clock className="w-3 h-3 text-[#00A3E0]" />
                      Hora de Inicio
                    </label>
                    <input
                      type="time"
                      value={formStartTime}
                      onChange={e => setFormStartTime(e.target.value)}
                      className={`w-full px-3.5 py-2 rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2B68] font-medium ${
                        isDark ? 'bg-[#121826] border-[#252D43] text-white' : 'bg-white border-[#E5E7EB] text-slate-800'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${subtextColor} flex items-center gap-1`}>
                      <Clock className="w-3 h-3 text-[#00A3E0]" />
                      Hora de Fin
                    </label>
                    <input
                      type="time"
                      value={formEndTime}
                      onChange={e => setFormEndTime(e.target.value)}
                      className={`w-full px-3.5 py-2 rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2 ${
                        timeValidationError ? 'ring-2 ring-amber-500 border-amber-500' : 'focus:ring-[#0B2B68]'
                      } font-medium ${
                        isDark ? 'bg-[#121826] border-[#252D43] text-white' : 'bg-white border-[#E5E7EB] text-slate-800'
                      }`}
                    />
                  </div>
                </div>

                {/* Inline Time Validation Warning */}
                {timeValidationError && (
                  <div className="mt-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in duration-200">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                    <span>{timeValidationError}</span>
                  </div>
                )}

                {/* Quick Duration Suggestions */}
                {formStartTime && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className={`text-[10px] font-semibold ${subtextColor}`}>Duración sugerida:</span>
                    {[
                      { label: '+1 hora', hours: 1 },
                      { label: '+1h 30m', hours: 1.5 },
                      { label: '+2 horas', hours: 2 },
                      { label: '+3 horas', hours: 3 }
                    ].map(dur => (
                      <button
                        key={dur.label}
                        type="button"
                        onClick={() => handleAutoSetEndTime(dur.hours)}
                        className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                          isDark ? 'bg-white/5 border-white/10 hover:bg-white/15 text-slate-300' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {dur.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Location Input with Google Maps & GPS Integrations */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={`text-[11px] font-bold uppercase tracking-wider ${subtextColor} flex items-center gap-1`}>
                    <MapPin className="w-3 h-3 text-[#F47B20]" />
                    Lugar o Ubicación <span className="lowercase font-normal opacity-70">(opcional)</span>
                  </label>

                  {/* Google Maps Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleGetGpsLocation}
                      disabled={isLocating}
                      className="text-[10px] font-bold text-[#00A3E0] hover:text-[#0B2B68] dark:hover:text-white flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      title="Obtener coordenadas GPS actuales"
                    >
                      <Navigation className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                      <span>{isLocating ? 'Localizando...' : 'GPS Actual'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenMapsSearch}
                      className="text-[10px] font-bold text-[#F47B20] hover:text-[#F25C05] flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      title="Buscar o ver en Google Maps"
                    >
                      <Globe className="w-3 h-3" />
                      <span>Google Maps</span>
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={formLocation}
                    onChange={e => setFormLocation(e.target.value)}
                    placeholder="Ej: Santuario Principal El-Shaddai, Carrera 15 # 45-20, Zoom..."
                    className={`w-full pl-3.5 pr-9 py-2 rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2B68] ${
                      isDark ? 'bg-[#121826] border-[#252D43] text-white' : 'bg-white border-[#E5E7EB] text-slate-800'
                    }`}
                  />
                  {formLocation && (
                    <button
                      type="button"
                      onClick={handleOpenMapsSearch}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#00A3E0] transition-colors p-1"
                      title="Abrir este lugar en Google Maps"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className={`text-[10px] font-semibold ${subtextColor}`}>Sugerencias:</span>
                  {[
                    { label: 'Salón Principal (Brown 1285, San Juan)', value: DEFAULT_CHURCH_LOCATION },
                    { label: 'Auditorio Central', value: 'Auditorio Central' },
                    { label: 'Online / Transmisión', value: 'Online / Transmisión' },
                    { label: 'Salón de Jóvenes', value: 'Salón de Jóvenes' },
                    { label: 'Salón de Matrimonios', value: 'Salón de Matrimonios' }
                  ].map(sug => (
                    <button
                      key={sug.label}
                      type="button"
                      onClick={() => setFormLocation(sug.value)}
                      className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                        formLocation === sug.value
                          ? 'bg-[#0B2B68] text-white border-[#0B2B68]'
                          : isDark
                          ? 'bg-white/5 border-white/10 hover:bg-white/10'
                          : 'bg-slate-100 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {sug.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Optional Details: Inversión / Precio de Inscripción */}
            <div className={`p-4 rounded-2xl border ${cardBg} space-y-2.5`}>
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider opacity-80 flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5 text-emerald-500" />
                Precio de Inscripción / Inversión <span className="text-[11px] font-normal lowercase opacity-70">(opcional)</span>
              </label>
              <input
                type="text"
                value={formPrice}
                onChange={e => setFormPrice(e.target.value)}
                placeholder="Ej: Entrada Libre, Gratuito, Donación Voluntaria, $15 USD, $50.000 COP..."
                className={`w-full px-3.5 py-2 rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2B68] ${
                  isDark ? 'bg-[#121826] border-[#252D43] text-white' : 'bg-white border-[#E5E7EB] text-slate-800'
                }`}
              />
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={`text-[10px] font-semibold ${subtextColor}`}>Opciones rápidas:</span>
                {['Entrada Libre', 'Gratuito', 'Donación Voluntaria', '$10 USD', '$25 USD'].map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormPrice(p)}
                    className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                      formPrice === p
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : isDark
                        ? 'bg-white/5 border-white/10 hover:bg-white/10'
                        : 'bg-slate-100 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Event Image (URL, File Upload, or Preset Gallery) */}
            <div className={`p-4 rounded-2xl border ${cardBg} space-y-3`}>
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold uppercase tracking-wider opacity-80 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#00A3E0]" />
                  Imagen / Afiche del Evento <span className="text-[11px] font-normal lowercase opacity-70">(opcional)</span>
                </label>
                {formImageUrl && (
                  <button
                    type="button"
                    onClick={() => setFormImageUrl('')}
                    className="text-xs text-red-500 hover:underline font-bold cursor-pointer"
                  >
                    Remover imagen
                  </button>
                )}
              </div>

              {/* Image Input & Upload Row with Institutional Branding */}
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  value={formImageUrl}
                  onChange={e => setFormImageUrl(e.target.value)}
                  placeholder="Pega un enlace de imagen (https://...)"
                  className={`flex-1 px-3.5 py-2 rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2B68] ${
                    isDark ? 'bg-[#121826] border-[#252D43] text-white' : 'bg-white border-[#E5E7EB] text-slate-800'
                  }`}
                />
                <label className="px-4 py-2.5 rounded-xl bg-[#0B2B68] hover:bg-[#081E48] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shrink-0 transition-all shadow-xs active:scale-95 border border-[#00A3E0]/30 hover:border-[#00A3E0] group">
                  <Upload className="w-4 h-4 text-[#FED65B] group-hover:scale-110 transition-transform" />
                  <span>Subir Foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Preset Gallery */}
              <div>
                <span className={`block text-[11px] font-bold uppercase tracking-wider mb-2 ${subtextColor}`}>
                  O elige una plantilla ilustrativa:
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {EVENT_IMAGE_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormImageUrl(preset.url)}
                      className={`relative rounded-xl overflow-hidden aspect-video border transition-all cursor-pointer group ${
                        formImageUrl === preset.url
                          ? 'ring-2 ring-[#00A3E0] border-[#00A3E0] scale-95 shadow-md'
                          : 'border-transparent hover:opacity-90'
                      }`}
                      title={preset.label}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-end p-1 transition-all">
                        <span className="text-[9px] font-bold text-white leading-tight line-clamp-1">
                          {preset.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview If Image Selected */}
              {formImageUrl && (
                <div className="relative rounded-xl overflow-hidden h-36 sm:h-44 border border-slate-300 dark:border-slate-700 bg-slate-900">
                  <img
                    src={formImageUrl}
                    alt="Vista previa del afiche"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                    Vista previa de portada
                  </div>
                </div>
              )}
            </div>

            {/* Notes / Sermonic Outline Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs sm:text-sm font-bold uppercase tracking-wider opacity-80 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-[#00A3E0]" />
                  Apuntes, Bosquejo & Reflexión
                </label>
                <span className={`text-[11px] ${subtextColor}`}>Espacio completo de escritura</span>
              </div>
              <textarea
                rows={10}
                value={formDescription}
                onChange={e => setFormDescription(e.target.value)}
                placeholder="Escribe aquí los puntos principales del sermón, versículos de apoyo, aplicaciones prácticas para la semana o notas del predicador..."
                className={`w-full px-4 py-3.5 rounded-2xl border text-xs sm:text-sm font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#0B2B68] ${
                  isDark ? 'bg-[#182033] border-[#252D43] text-[#E2E8F0]' : 'bg-white border-[#E5E7EB] text-slate-800'
                }`}
              />
            </div>

            {/* Linked Bible Verses */}
            <div className={`p-4 rounded-2xl border ${cardBg}`}>
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider mb-1.5 opacity-80 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#00A3E0]" />
                Pasajes Bíblicos Clave
              </label>
              <p className={`text-xs mb-3 ${subtextColor}`}>
                Agrega citas bíblicas asociadas a esta prédica para abrirlas directamente desde tus notas.
              </p>

              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={formVerseInput}
                  onChange={e => setFormVerseInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddLinkedVerse();
                    }
                  }}
                  placeholder="Ej: Juan 3:16, Salmos 23:1 o Mateo 14:22-33"
                  className={`flex-1 px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2B68] ${
                    isDark ? 'bg-[#121826] border-[#252D43] text-white' : 'bg-slate-50 border-[#E5E7EB] text-slate-800'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleAddLinkedVerse}
                  className="px-4 py-2.5 rounded-xl bg-[#00A3E0] text-white text-xs sm:text-sm font-bold hover:bg-[#0089bd] cursor-pointer shrink-0 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Vincular</span>
                </button>
              </div>

              {/* Quick suggestions */}
              <div className="flex items-center gap-1.5 flex-wrap mb-3">
                <span className={`text-[11px] font-semibold ${subtextColor}`}>Sugeridos:</span>
                {['Juan 3:16', 'Salmos 23:1', 'Romanos 8:28', 'Filipenses 4:13', 'Isaías 40:31', 'Mateo 28:19'].map(sug => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => {
                      if (!formLinkedVerses.includes(sug)) {
                        setFormLinkedVerses([...formLinkedVerses, sug]);
                      }
                    }}
                    className={`text-[11px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                      isDark ? 'bg-white/5 border-white/10 hover:bg-white/15' : 'bg-slate-100 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    + {sug}
                  </button>
                ))}
              </div>

              {formLinkedVerses.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-inherit">
                  {formLinkedVerses.map((v, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-xl bg-[#0B2B68]/15 text-[#0B2B68] dark:bg-white/10 dark:text-[#93C5FD] text-xs font-bold flex items-center gap-1.5"
                    >
                      <BookOpen className="w-3.5 h-3.5 shrink-0" />
                      <span>{v}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveLinkedVerse(i)}
                        className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/20 text-red-500 font-bold ml-1 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Tags Input */}
            <div className={`p-4 rounded-2xl border ${cardBg}`}>
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider mb-1.5 opacity-80 flex items-center gap-1.5">
                <TagIcon className="w-3.5 h-3.5 text-[#F47B20]" />
                Etiquetas Temáticas
              </label>

              <div className="flex gap-2 mb-2.5">
                <input
                  type="text"
                  value={formTagInput}
                  onChange={e => setFormTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Ej: Fe, Familia, Santidad, Oración..."
                  className={`flex-1 px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2B68] ${
                    isDark ? 'bg-[#121826] border-[#252D43] text-white' : 'bg-slate-50 border-[#E5E7EB] text-slate-800'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-300 cursor-pointer shrink-0"
                >
                  + Tag
                </button>
              </div>

              {formTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {formTags.map((t, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium flex items-center gap-1.5"
                    >
                      <span>#{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(i)}
                        className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/20 text-red-500 font-bold cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-inherit">
              <button
                type="button"
                onClick={() => setIsEventModalOpen(false)}
                className="px-4 sm:px-6 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 sm:px-8 py-2.5 min-h-[44px] rounded-xl bg-[#0B2B68] text-[#FED65B] text-xs sm:text-sm font-bold hover:bg-[#081F4B] shadow-md flex items-center gap-2 cursor-pointer transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{editingEvent ? 'Guardar Cambios' : 'Guardar en Bitácora'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Modal for Creating Category from Full Screen */}
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
            <div className={`w-full max-w-md rounded-2xl sm:rounded-3xl border shadow-2xl flex flex-col max-h-[90vh] ${cardBg}`}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-inherit shrink-0">
                <h2 className="text-base sm:text-lg font-bold font-display">Nueva Categoría</h2>
                <button
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCategory} className="flex flex-col flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-80">
                    Nombre de la Categoría *
                  </label>
                  <input
                    type="text"
                    value={catName}
                    onChange={e => setCatName(e.target.value)}
                    placeholder="Ej: Confraternidad Juvenil, Campamento..."
                    required
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2B68] ${
                      isDark ? 'bg-[#121826] border-[#252D43]' : 'bg-white border-[#E5E7EB]'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-80">
                    Ícono
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.keys(AVAILABLE_ICONS).map(iconKey => {
                      const IconC = AVAILABLE_ICONS[iconKey];
                      const isSelected = catIcon === iconKey;
                      return (
                        <button
                          type="button"
                          key={iconKey}
                          onClick={() => setCatIcon(iconKey)}
                          className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#0B2B68] text-[#FED65B] border-[#0B2B68] ring-2 ring-[#0B2B68]/40'
                              : isDark
                              ? 'bg-[#121826] border-[#252D43] text-slate-300 hover:bg-[#1A2234]'
                              : 'bg-white border-[#E5E7EB] text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <IconC className="w-5 h-5" />
                          <span className="text-[10px] truncate max-w-full">{iconKey}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-80">
                    Color Distintivo
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {PALETTE_COLORS.map(color => (
                      <button
                        type="button"
                        key={color}
                        onClick={() => setCatColor(color)}
                        className={`w-9 h-9 sm:w-8 sm:h-8 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                          catColor === color ? 'scale-110 ring-2 ring-offset-2 ring-[#0B2B68]' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      >
                        {catColor === color && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-inherit mt-4">
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="px-4 py-2.5 min-h-[42px] rounded-xl text-xs sm:text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 min-h-[42px] rounded-xl bg-[#0B2B68] text-[#FED65B] text-xs sm:text-sm font-bold hover:bg-[#081F4B] shadow-sm cursor-pointer"
                  >
                    Crear Categoría
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Permiso de Ubicación GPS */}
        {isGpsPromptOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs">
            <div className={`w-full max-w-md rounded-2xl sm:rounded-3xl border shadow-2xl p-5 sm:p-6 relative ${cardBg}`}>
              <div className="flex items-start gap-3.5 mb-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#00A3E0]/15 text-[#00A3E0] flex items-center justify-center shrink-0">
                  <Navigation className={`w-6 h-6 ${isLocating ? 'animate-spin' : ''}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-bold font-display leading-tight">
                    Permiso de Ubicación GPS
                  </h3>
                  <p className={`text-xs ${subtextColor} mt-0.5`}>
                    Acceso satelital para registrar el lugar del evento
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGpsPromptOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mb-3.5 p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/25 text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-1.5">
                <p>
                  <strong>Santuario Digital</strong> solicita permiso para acceder al sensor GPS de tu móvil o navegador y capturar las coordenadas exactas de la prédica o actividad.
                </p>
                <p className="text-[11px] opacity-80">
                  Al pulsar &quot;Permitir y Obtener GPS&quot;, tu teléfono mostrará la solicitud oficial del sistema para autorizar el acceso.
                </p>
              </div>

              <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-[#F47B20]" />
                  <span>Ubicación Predeterminada (Salón Principal):</span>
                </div>
                <p className="font-medium text-slate-800 dark:text-slate-200">{DEFAULT_CHURCH_LOCATION}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Coordenadas: {DEFAULT_CHURCH_COORDINATES.lat}, {DEFAULT_CHURCH_COORDINATES.lng}
                </p>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleConfirmGpsAccess}
                  disabled={isLocating}
                  className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-[#0B2B68] hover:bg-[#081F4B] text-[#FED65B] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                  <span>{isLocating ? 'Obteniendo GPS...' : 'Permitir y Obtener GPS Actual'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSetDefaultLocation}
                  className="w-full py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-white/5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#F47B20]" />
                  <span>Usar Salón Principal (Brown 1285)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsGpsPromptOpen(false)}
                  className="w-full py-1 text-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`w-full max-w-full overflow-x-hidden min-h-screen ${containerBg} pb-28 md:pb-24 transition-colors duration-200`}>
      {/* Header Banner - Compact & Responsive */}
      <div
        className={`pt-3 sm:pt-6 pb-3 sm:pb-6 px-3 sm:px-6 border-b ${
          isDark
            ? 'border-[#252D43] bg-[#121826]'
            : isSepia
            ? 'border-[#DECDB8] bg-[#EBE1D0]'
            : 'border-[#EAE8E3] bg-[#F7F5F0]'
        }`}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
              <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[11px] font-bold uppercase tracking-wider bg-[#0B2B68] text-white">
                Bitácora
              </span>
              <span className={`text-[10px] sm:text-xs font-semibold ${subtextColor}`}>
                {events.length} {events.length === 1 ? 'registro' : 'registros'}
              </span>
            </div>

            <h1 className="text-base sm:text-2xl md:text-3xl font-display font-bold leading-tight truncate">
              Prédicas & Eventos
            </h1>

            <p className={`hidden sm:block text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed ${subtextColor}`}>
              Registra apuntes de prédicas dominicales, estudios bíblicos y devocionales vinculados a las Escrituras.
            </p>
          </div>

          {/* Action Buttons: Compact Icon on Mobile, Full Text on Tablet/Desktop */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {events.length > 0 && (
              <button
                id="start-latest-event-btn"
                onClick={() => setPresentingEvent(events[0])}
                className="min-h-[38px] sm:min-h-[42px] px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md transition-all cursor-pointer"
                title="Iniciar la prédica o evento más reciente en pantalla completa"
                aria-label="Iniciar Prédica"
              >
                <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                <span className="font-extrabold">Iniciar</span>
              </button>
            )}

            <button
              id="new-category-btn"
              onClick={() => setIsCategoryModalOpen(true)}
              className={`min-h-[38px] sm:min-h-[42px] px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isDark
                  ? 'border-[#252D43] bg-[#1A2234] text-[#E2E8F0] hover:bg-[#252D43]'
                  : isSepia
                  ? 'border-[#DECDB8] bg-[#EFE7D8] text-[#2D2319] hover:bg-[#E2D4BF]'
                  : 'border-[#E5E7EB] bg-white text-[#0B2B68] hover:bg-[#F3F4F6] shadow-2xs'
              }`}
              title="Crear nueva categoría"
              aria-label="Nueva Categoría"
            >
              <FolderPlus className="w-4 h-4 text-[#F47B20] shrink-0" />
              <span className="hidden md:inline">Nueva Categoría</span>
            </button>

            <button
              id="new-event-btn"
              onClick={() => openCreateEventModal()}
              className="min-h-[38px] sm:min-h-[42px] px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#0B2B68] text-[#FED65B] hover:bg-[#081F4B] flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer hover:shadow-md"
              title="Crear nuevo apunte"
              aria-label="Nuevo Apunte"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Nuevo Apunte</span>
            </button>
          </div>
        </div>

        {/* Quick Micro-Stats: Compact Inline Bar on Mobile, Grid on Tablet/Desktop */}
        <div className="max-w-5xl mx-auto mt-2.5 sm:mt-5">
          {/* Mobile Micro-bar */}
          <div className={`sm:hidden flex items-center justify-around py-1.5 px-3 rounded-xl border ${cardBg} text-xs font-semibold shadow-2xs`}>
            <div className="flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-[#0B2B68]" />
              <span>{events.length} notas</span>
            </div>
            <span className="opacity-30">•</span>
            <div className="flex items-center gap-1.5">
              <FolderPlus className="w-3.5 h-3.5 text-[#F47B20]" />
              <span>{categories.length} categorías</span>
            </div>
            <span className="opacity-30">•</span>
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#00A3E0]" />
              <span>{totalVersesLinked} citas</span>
            </div>
          </div>

          {/* Tablet/Desktop Grid */}
          <div className="hidden sm:grid sm:grid-cols-3 gap-3.5">
            <div className={`p-3.5 rounded-2xl border ${cardBg} flex items-center gap-3 shadow-2xs`}>
              <div className="w-9 h-9 rounded-lg bg-[#0B2B68]/10 text-[#0B2B68] flex items-center justify-center shrink-0">
                <Mic className="w-4 h-4 text-[#0B2B68]" />
              </div>
              <div className="min-w-0">
                <div className="text-lg md:text-xl font-bold leading-none">{events.length}</div>
                <div className={`text-xs truncate ${subtextColor} mt-0.5`}>Notas registradas</div>
              </div>
            </div>

            <div className={`p-3.5 rounded-2xl border ${cardBg} flex items-center gap-3 shadow-2xs`}>
              <div className="w-9 h-9 rounded-lg bg-[#F47B20]/10 text-[#F47B20] flex items-center justify-center shrink-0">
                <FolderPlus className="w-4 h-4 text-[#F47B20]" />
              </div>
              <div className="min-w-0">
                <div className="text-lg md:text-xl font-bold leading-none">{categories.length}</div>
                <div className={`text-xs truncate ${subtextColor} mt-0.5`}>Categorías activas</div>
              </div>
            </div>

            <div className={`p-3.5 rounded-2xl border ${cardBg} flex items-center gap-3 shadow-2xs`}>
              <div className="w-9 h-9 rounded-lg bg-[#00A3E0]/10 text-[#00A3E0] flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4 text-[#00A3E0]" />
              </div>
              <div className="min-w-0">
                <div className="text-lg md:text-xl font-bold leading-none">{totalVersesLinked}</div>
                <div className={`text-xs truncate ${subtextColor} mt-0.5`}>Citas bíblicas vinculadas</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-3 sm:px-6 pt-3 sm:pt-5 w-full max-w-full">
        {/* Search & Category Filter Bar */}
        <div className="flex flex-col gap-2 sm:gap-3 mb-3.5 sm:mb-5">
          {/* Search Input */}
          <div className="relative w-full">
            <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${subtextColor}`} />
            <input
              id="search-events-input"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar prédicas, temas o pasajes bíblicos..."
              className={`w-full pl-9 pr-16 sm:pr-20 py-2 sm:py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2B68] ${
                isDark
                  ? 'bg-[#182033] border-[#252D43] text-white placeholder-slate-500'
                  : isSepia
                  ? 'bg-[#EFE7D8] border-[#DECDB8] text-[#2D2319] placeholder-[#8A7156]'
                  : 'bg-white border-[#E5E7EB] text-slate-900 placeholder-slate-400'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute right-2 top-1/2 -translate-y-1/2 text-[11px] px-2 py-0.5 rounded-md cursor-pointer ${
                  isDark ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Categories Horizontal Scrolling Filter */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 text-xs no-scrollbar touch-pan-x w-full max-w-full">
            <button
              onClick={() => setSelectedCategoryFilter('ALL')}
              className={`px-2.5 sm:px-3 py-1.5 min-h-[34px] sm:min-h-[38px] rounded-xl font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                selectedCategoryFilter === 'ALL'
                  ? 'bg-[#0B2B68] text-[#FED65B] shadow-2xs'
                  : isDark
                  ? 'bg-[#182033] text-white/70 hover:bg-[#252D43]'
                  : isSepia
                  ? 'bg-[#EBE1D0] text-[#5C452D] hover:bg-[#DFCDB8]'
                  : 'bg-white text-[#454652] hover:bg-[#F3F4F6] border border-[#E5E7EB]'
              }`}
              title="Mostrar todos los apuntes"
              aria-label="Todos los apuntes"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="text-xs">Todos</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                selectedCategoryFilter === 'ALL' ? 'bg-white/20 text-[#FED65B]' : 'bg-black/5 dark:bg-white/10'
              }`}>
                {events.length}
              </span>
            </button>

            {categories.map(cat => {
              const IconComp = AVAILABLE_ICONS[cat.iconName] || BookOpen;
              const isSelected = selectedCategoryFilter === cat.id;
              const count = events.filter(e => e.categoryId === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryFilter(cat.id)}
                  title={cat.name}
                  aria-label={cat.name}
                  className={`px-2.5 sm:px-3.5 py-1.5 min-h-[34px] sm:min-h-[38px] rounded-xl font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-[#0B2B68] border-[#0B2B68] text-white shadow-2xs'
                      : isDark
                      ? 'bg-[#182033] border-[#252D43] text-white/80 hover:bg-[#252D43]'
                      : isSepia
                      ? 'bg-[#EFE7D8] border-[#DECDB8] text-[#4A3828] hover:bg-[#E5D9C7]'
                      : 'bg-white border-[#E5E7EB] text-[#334155] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <span
                    className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.colorHex }}
                  />
                  <IconComp className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  {/* Category name: on mobile, show truncated or hidden if preferred */}
                  <span className="text-xs sm:text-sm whitespace-nowrap">{cat.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-black/5 dark:bg-white/10'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Events Feed */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 w-full">
            {filteredEvents.map(evt => {
              const cat = categories.find(c => c.id === evt.categoryId);
              const IconComp = AVAILABLE_ICONS[cat?.iconName || 'BookOpen'] || BookOpen;
              const catColor = cat?.colorHex || '#0B2B68';
              const isExpanded = expandedCardIds.has(evt.id);
              const isLongText = evt.description && evt.description.length > 200;

              return (
                <div
                  key={evt.id}
                  className={`w-full max-w-full rounded-2xl sm:rounded-3xl border ${cardBg} flex flex-col justify-between transition-all duration-200 hover:shadow-md relative overflow-hidden`}
                >
                  {/* Top Accent Strip */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1 sm:h-1.5 z-10"
                    style={{ backgroundColor: catColor }}
                  />

                  {/* Optional Event Banner Image */}
                  {evt.imageUrl && (
                    <div className="w-full h-32 sm:h-40 relative bg-slate-900 overflow-hidden shrink-0">
                      <img
                        src={evt.imageUrl}
                        alt={evt.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      {evt.price && (
                        <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-emerald-600/90 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold flex items-center gap-1 shadow-xs">
                          <Ticket className="w-3 h-3" />
                          <span>{evt.price}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="w-full min-w-0 p-3.5 sm:p-5 pb-0 flex-1">
                    {/* Header: Category Badge & Date */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-bold text-white flex items-center gap-1.5 shadow-2xs shrink-0 max-w-[160px] truncate"
                        style={{ backgroundColor: catColor }}
                      >
                        <IconComp className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                        <span className="truncate">{cat?.name || 'Evento'}</span>
                      </span>

                      <div className={`text-[10px] sm:text-xs flex items-center gap-1 font-medium ${subtextColor} shrink-0`}>
                        <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                        <span>{evt.eventDate}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm sm:text-lg font-bold font-display leading-snug mb-1.5 break-words">
                      {evt.title}
                    </h3>

                    {/* Optional Location, Schedule & Price Info Bar */}
                    {(evt.location || evt.startTime || (evt.price && !evt.imageUrl)) && (
                      <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs font-medium mb-2.5 opacity-90">
                        {evt.startTime && (
                          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md ${isDark ? 'bg-white/5' : 'bg-slate-100'} ${subtextColor}`}>
                            <Clock className="w-3 h-3 text-[#00A3E0] shrink-0" />
                            <span>{evt.startTime}{evt.endTime ? ` - ${evt.endTime}` : ''}</span>
                          </div>
                        )}
                        {evt.location && (
                          <a
                            href={getMapsUrlForLocation(evt.location)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md max-w-full truncate hover:text-[#00A3E0] transition-colors ${
                              isDark ? 'bg-white/5' : 'bg-slate-100'
                            } ${subtextColor}`}
                            title="Abrir ubicación en Google Maps"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MapPin className="w-3 h-3 text-[#F47B20] shrink-0" />
                            <span className="truncate">{evt.location}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60 shrink-0 ml-0.5" />
                          </a>
                        )}
                        {evt.price && !evt.imageUrl && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                            <Ticket className="w-3 h-3 shrink-0" />
                            <span>{evt.price}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Description / Sermon Notes with Read More Toggle */}
                    {evt.description && (
                      <div className="mb-2.5 sm:mb-3">
                        <p
                          className={`text-xs sm:text-sm whitespace-pre-line leading-relaxed break-words ${
                            !isExpanded && isLongText ? 'line-clamp-3 sm:line-clamp-4' : ''
                          } ${
                            isDark ? 'text-[#D1D5DB]' : isSepia ? 'text-[#4A3B2C]' : 'text-[#475569]'
                          }`}
                        >
                          {evt.description}
                        </p>
                        {isLongText && (
                          <button
                            type="button"
                            onClick={() => toggleExpand(evt.id)}
                            className="mt-1 text-xs font-bold text-[#00A3E0] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            {isExpanded ? (
                              <>
                                <span>Mostrar menos</span>
                                <ChevronUp className="w-3.5 h-3.5" />
                              </>
                            ) : (
                              <>
                                <span>Leer notas completas</span>
                                <ChevronDown className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Linked Bible Verses */}
                    {evt.linkedVerses && evt.linkedVerses.length > 0 && (
                      <div className="mb-2.5 sm:mb-3">
                        <div className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1 ${subtextColor}`}>
                          <BookOpen className="w-3 h-3 text-[#00A3E0]" />
                          Pasajes Clave:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {evt.linkedVerses.map((v, i) => (
                            <button
                              key={i}
                              onClick={() => handleParseVerseAndNavigate(v)}
                              className={`px-2 py-1 min-h-[28px] sm:min-h-[32px] rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                                isDark
                                  ? 'bg-[#252D43] text-[#93C5FD] hover:bg-[#323D5B]'
                                  : isSepia
                                  ? 'bg-[#E5D7C3] text-[#633F1E] hover:bg-[#DBCDB8]'
                                  : 'bg-[#EFF6FF] text-[#1D4ED8] hover:bg-[#DBEAFE]'
                              }`}
                              title="Toca para abrir este pasaje en la Biblia"
                            >
                              <BookOpen className="w-2.5 h-2.5 sm:w-3 sm:h-3 opacity-70 shrink-0" />
                              <span className="truncate max-w-[160px] sm:max-w-none">{v}</span>
                              <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3 opacity-70 shrink-0 ml-0.5" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {evt.tags && evt.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {evt.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md font-medium flex items-center gap-0.5 ${
                              isDark ? 'bg-white/5 text-slate-300' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <TagIcon className="w-2.5 h-2.5 opacity-60" />
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions Footer - Responsive Icons on Mobile, Labels on Tablet/Desktop */}
                  <div
                    className={`p-3.5 sm:p-5 pt-2.5 sm:pt-3 border-t flex items-center justify-between ${
                      isDark ? 'border-white/10' : 'border-slate-100'
                    }`}
                  >
                    <button
                      onClick={() => handleShareEvent(evt)}
                      className={`p-1.5 sm:px-3 sm:py-1.5 min-h-[34px] sm:min-h-[38px] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isDark ? 'hover:bg-white/10 text-white/80' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                      title="Compartir notas de este evento"
                      aria-label="Compartir"
                    >
                      <Share2 className="w-4 h-4 shrink-0 text-[#F47B20]" />
                      <span className="hidden sm:inline text-xs">Compartir</span>
                    </button>

                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <button
                        onClick={() => setPresentingEvent(evt)}
                        className="px-3 py-1.5 min-h-[34px] sm:min-h-[38px] rounded-xl text-xs font-bold bg-[#0B2B68] text-[#FED65B] dark:bg-[#FED65B] dark:text-[#0B2B68] hover:opacity-90 flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                        title="Iniciar y ver este evento en pantalla completa"
                        aria-label="Iniciar Evento"
                      >
                        <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                        <span className="font-extrabold">Iniciar</span>
                      </button>

                      <button
                        onClick={() => openEditEventModal(evt)}
                        className={`p-1.5 sm:px-3 sm:py-1.5 min-h-[34px] sm:min-h-[38px] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isDark ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
                        }`}
                        title="Editar apunte"
                        aria-label="Editar"
                      >
                        <Edit3 className="w-4 h-4 text-[#00A3E0]" />
                        <span className="hidden sm:inline text-xs">Editar</span>
                      </button>

                      <button
                        onClick={() => handleDeleteEvent(evt.id, evt.title)}
                        className="p-1.5 sm:px-3 sm:py-1.5 min-h-[34px] sm:min-h-[38px] rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Eliminar apunte"
                        aria-label="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline text-xs">Eliminar</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className={`p-6 sm:p-12 text-center rounded-2xl sm:rounded-3xl border ${cardBg} mt-3`}>
            <div className="w-10 h-10 sm:w-14 sm:h-14 mx-auto rounded-2xl bg-[#0B2B68]/10 text-[#0B2B68] flex items-center justify-center mb-2 sm:mb-3">
              <Calendar className="w-5 h-5 sm:w-7 sm:h-7 text-[#0B2B68]" />
            </div>
            <h3 className="text-sm sm:text-lg font-bold mb-1">No hay apuntes en esta categoría</h3>
            <p className={`text-xs sm:text-sm max-w-md mx-auto mb-4 leading-relaxed ${subtextColor}`}>
              Comienza a registrar tus apuntes de prédicas y estudios bíblicos vinculándolos con pasajes de las Escrituras.
            </p>
            <button
              onClick={() => openCreateEventModal(selectedCategoryFilter !== 'ALL' ? selectedCategoryFilter : undefined)}
              className="px-4 py-2 min-h-[40px] rounded-xl text-xs sm:text-sm font-bold bg-[#0B2B68] text-[#FED65B] hover:bg-[#081F4B] inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Nuevo Apunte</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* MODAL: CREATE CATEGORY */}
      {/* ========================================== */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-md rounded-2xl sm:rounded-3xl border shadow-2xl flex flex-col max-h-[90vh] ${cardBg}`}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-inherit shrink-0">
              <h2 className="text-base sm:text-lg font-bold font-display">Nueva Categoría de Eventos</h2>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="flex flex-col flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-80">
                  Nombre de la Categoría *
                </label>
                <input
                  type="text"
                  value={catName}
                  onChange={e => setCatName(e.target.value)}
                  placeholder="Ej: Confraternidad Juvenil, Campamento..."
                  required
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2B68] ${
                    isDark ? 'bg-[#121826] border-[#252D43]' : 'bg-white border-[#E5E7EB]'
                  }`}
                />
              </div>

              {/* Icon Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-80">
                  Ícono
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.keys(AVAILABLE_ICONS).map(iconKey => {
                    const IconC = AVAILABLE_ICONS[iconKey];
                    const isSelected = catIcon === iconKey;
                    return (
                      <button
                        type="button"
                        key={iconKey}
                        onClick={() => setCatIcon(iconKey)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#0B2B68] text-[#FED65B] border-[#0B2B68] ring-2 ring-[#0B2B68]/40'
                            : isDark
                            ? 'bg-[#121826] border-[#252D43] text-slate-300 hover:bg-[#1A2234]'
                            : 'bg-white border-[#E5E7EB] text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <IconC className="w-5 h-5" />
                        <span className="text-[10px] truncate max-w-full">{iconKey}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-80">
                  Color Distintivo
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {PALETTE_COLORS.map(color => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => setCatColor(color)}
                      className={`w-9 h-9 sm:w-8 sm:h-8 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                        catColor === color ? 'scale-110 ring-2 ring-offset-2 ring-[#0B2B68]' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {catColor === color && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-inherit mt-4">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2.5 min-h-[42px] rounded-xl text-xs sm:text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 min-h-[42px] rounded-xl bg-[#0B2B68] text-[#FED65B] text-xs sm:text-sm font-bold hover:bg-[#081F4B] shadow-sm cursor-pointer"
                >
                  Crear Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: EVENT FLYER SHARE (IMAGE AS BACKGROUND & ESSENTIAL DATA) */}
      {/* ========================================== */}
      <EventShareModal
        isOpen={!!sharingEvent}
        event={sharingEvent}
        category={categories.find(c => c.id === sharingEvent?.categoryId)}
        onClose={() => setSharingEvent(null)}
        onToast={onToast}
        currentTheme={settings.themeMode}
      />

      {/* ========================================== */}
      {/* MODAL: GPS PERMISSION & LOCATION PROMPT */}
      {/* ========================================== */}
      {isGpsPromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs">
          <div className={`w-full max-w-md rounded-2xl sm:rounded-3xl border shadow-2xl p-5 sm:p-6 relative ${cardBg}`}>
            <div className="flex items-start gap-3.5 mb-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#00A3E0]/15 text-[#00A3E0] flex items-center justify-center shrink-0">
                <Navigation className={`w-6 h-6 ${isLocating ? 'animate-spin' : ''}`} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-bold font-display leading-tight">
                  Permiso de Ubicación GPS
                </h3>
                <p className={`text-xs ${subtextColor} mt-0.5`}>
                  Acceso satelital para registrar el lugar del evento
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsGpsPromptOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-3.5 p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/25 text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-1.5">
              <p>
                <strong>Santuario Digital</strong> solicita permiso para acceder al sensor GPS de tu móvil o navegador y capturar las coordenadas exactas de la prédica o actividad.
              </p>
              <p className="text-[11px] opacity-80">
                Al pulsar &quot;Permitir y Obtener GPS&quot;, tu teléfono mostrará la solicitud oficial del sistema para autorizar el acceso.
              </p>
            </div>

            <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400 mb-1">
                <MapPin className="w-3.5 h-3.5 text-[#F47B20]" />
                <span>Ubicación Predeterminada (Salón Principal):</span>
              </div>
              <p className="font-medium text-slate-800 dark:text-slate-200">{DEFAULT_CHURCH_LOCATION}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Coordenadas: {DEFAULT_CHURCH_COORDINATES.lat}, {DEFAULT_CHURCH_COORDINATES.lng}
              </p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleConfirmGpsAccess}
                disabled={isLocating}
                className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-[#0B2B68] hover:bg-[#081F4B] text-[#FED65B] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Obteniendo GPS...' : 'Permitir y Obtener GPS Actual'}</span>
              </button>

              <button
                type="button"
                onClick={handleSetDefaultLocation}
                className="w-full py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-white/5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5 text-[#F47B20]" />
                <span>Usar Salón Principal (Brown 1285)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsGpsPromptOpen(false)}
                className="w-full py-1 text-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
