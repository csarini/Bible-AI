import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Plus,
  Clock,
  MapPin,
  User,
  BookOpen,
  Utensils,
  Baby,
  Library,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Users,
  Play,
  Share2,
  Compass,
  Navigation,
  ExternalLink,
  Tag as TagIcon,
  X,
  Save,
  Check,
} from 'lucide-react';
import { eventsAdminService } from '../../services/events_admin.service';
import { ChurchAdminEvent, UserEvent, HierarchyScopeType } from '../../types';
import { useAuth } from '../auth/context/AuthContext';
import { EventPresentationView } from '../../components/EventPresentationView';
import { EventShareModal } from '../../components/EventShareModal';
import { DEFAULT_CHURCH_LOCATION, getMapsUrlForLocation } from '../../services/storageService';
import { ScopeSelector } from '../../components/ScopeSelector';
import { ScopeBadge } from '../../components/ScopeBadge';

interface EventsAdminViewProps {
  onNavigateToScripture?: (bookId: string, chapter: number, verse?: number) => void;
  onToast?: (message: string) => void;
  currentTheme?: 'light' | 'sepia' | 'dark';
}

export const EVENT_IMAGE_PRESETS = [
  {
    label: 'Culto Dominical',
    url: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Conferencia & Prédica',
    url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Matrimonios & Familia',
    url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Alabanza & Adoración',
    url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Jóvenes & Campamento',
    url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Vigilia & Oración',
    url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&auto=format&fit=crop&q=80',
  },
];

export const EventsAdminView: React.FC<EventsAdminViewProps> = ({
  onNavigateToScripture,
  onToast,
  currentTheme = 'light',
}) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<ChurchAdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'completed'>('all');
  const [scopeFilter, setScopeFilter] = useState<'all' | HierarchyScopeType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ChurchAdminEvent | null>(null);
  const [presentingEvent, setPresentingEvent] = useState<ChurchAdminEvent | null>(null);
  const [sharingEvent, setSharingEvent] = useState<UserEvent | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    speaker: '',
    scope: 'general' as HierarchyScopeType,
    scopeTargetId: 'general',
    scopeName: 'Toda la Iglesia (General)',
    eventDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    startTime: '10:30',
    endTime: '12:30',
    location: DEFAULT_CHURCH_LOCATION,
    annexName: 'Templo Principal El-Shaddai',
    hasFoodService: true, // 🍔 Comida
    hasChildcare: true, // 👶 Cuidado Infantil
    hasBookSales: false, // 📚 Venta de Libros
    maxCapacity: 250,
    linkedPassage: 'Romanos 12:1-2',
    bannerUrl: EVENT_IMAGE_PRESETS[0].url,
    status: 'published' as 'published' | 'draft' | 'completed',
  });

  const loadEvents = async () => {
    setLoading(true);
    try {
      const list = await eventsAdminService.getEvents();
      setEvents(list);
    } catch {
      onToast?.('Error al cargar eventos eclesiásticos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      speaker: user?.fullName || 'Pastor David Ben-David',
      scope: 'general',
      scopeTargetId: 'general',
      scopeName: 'Toda la Iglesia (General)',
      eventDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      startTime: '10:30',
      endTime: '12:30',
      location: DEFAULT_CHURCH_LOCATION,
      annexName: 'Templo Principal El-Shaddai',
      hasFoodService: true,
      hasChildcare: true,
      hasBookSales: false,
      maxCapacity: 250,
      linkedPassage: 'Romanos 12:1-2',
      bannerUrl: EVENT_IMAGE_PRESETS[0].url,
      status: 'published',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (evt: ChurchAdminEvent) => {
    setEditingEvent(evt);
    setFormData({
      title: evt.title,
      description: evt.description,
      speaker: evt.speaker,
      scope: evt.scope || 'general',
      scopeTargetId: evt.scopeTargetId || 'general',
      scopeName: evt.scopeName || 'Toda la Iglesia (General)',
      eventDate: evt.eventDate,
      startTime: evt.startTime,
      endTime: evt.endTime,
      location: evt.location,
      annexName: evt.annexName || 'Templo Principal El-Shaddai',
      hasFoodService: evt.hasFoodService,
      hasChildcare: evt.hasChildcare,
      hasBookSales: evt.hasBookSales,
      maxCapacity: evt.maxCapacity || 200,
      linkedPassage: evt.linkedPassage || '',
      bannerUrl: evt.bannerUrl || EVENT_IMAGE_PRESETS[0].url,
      status: evt.status as any,
    });
    setIsModalOpen(true);
  };

  // Quick End Time Helper (+1h, +1.5h, +2h)
  const handleAutoSetEndTime = (hours: number) => {
    if (!formData.startTime) {
      onToast?.('Primero define la hora de inicio');
      return;
    }
    const [h, m] = formData.startTime.split(':').map(Number);
    let totalMinutes = h * 60 + m + Math.round(hours * 60);
    totalMinutes = totalMinutes % (24 * 60);
    const newH = Math.floor(totalMinutes / 60);
    const newM = totalMinutes % 60;
    const formatted = `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
    setFormData((prev) => ({ ...prev, endTime: formatted }));
    onToast?.(`Hora de fin ajustada a ${formatted} (+${hours}h)`);
  };

  // GPS Location detection
  const handleGetGpsLocation = () => {
    if (!navigator.geolocation) {
      onToast?.('Tu navegador no soporta geolocalización GPS');
      return;
    }
    setIsLocating(true);
    onToast?.('Solicitando señal GPS del dispositivo...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        setFormData((prev) => ({
          ...prev,
          location: `GPS: ${lat}, ${lng} (Ubicación Detectada)`,
        }));
        onToast?.(`¡Coordenadas GPS obtenidas: ${lat}, ${lng}!`);
      },
      (err) => {
        setIsLocating(false);
        onToast?.('No se pudo obtener señal GPS. Usando ubicación del Templo Principal.');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      onToast?.('Ingresa el título del evento');
      return;
    }

    try {
      if (editingEvent) {
        await eventsAdminService.updateEvent(editingEvent.id, {
          title: formData.title,
          description: formData.description,
          speaker: formData.speaker,
          scope: formData.scope,
          scopeTargetId: formData.scopeTargetId,
          scopeName: formData.scopeName,
          eventDate: formData.eventDate,
          startTime: formData.startTime,
          endTime: formData.endTime,
          location: formData.location,
          annexName: formData.annexName,
          hasFoodService: formData.hasFoodService,
          hasChildcare: formData.hasChildcare,
          hasBookSales: formData.hasBookSales,
          maxCapacity: Number(formData.maxCapacity),
          linkedPassage: formData.linkedPassage || undefined,
          bannerUrl: formData.bannerUrl,
          status: formData.status,
        });
        onToast?.(`Evento "${formData.title}" actualizado`);
      } else {
        await eventsAdminService.createEvent({
          churchId: user?.churchId || 'church_elshaddai_central',
          scope: formData.scope,
          scopeTargetId: formData.scopeTargetId,
          scopeName: formData.scopeName,
          annexId: 'annex_central',
          annexName: formData.annexName,
          title: formData.title,
          description: formData.description,
          speaker: formData.speaker,
          eventDate: formData.eventDate,
          startTime: formData.startTime,
          endTime: formData.endTime,
          location: formData.location,
          hasFoodService: formData.hasFoodService,
          hasChildcare: formData.hasChildcare,
          hasBookSales: formData.hasBookSales,
          maxCapacity: Number(formData.maxCapacity),
          registeredCount: 0,
          status: formData.status,
          bannerUrl: formData.bannerUrl,
          linkedPassage: formData.linkedPassage || undefined,
        });
        onToast?.(`Nuevo evento "${formData.title}" publicado con servicios`);
      }
      setIsModalOpen(false);
      loadEvents();
    } catch {
      onToast?.('Error al guardar evento');
    }
  };

  const handleDeleteEvent = async (evt: ChurchAdminEvent) => {
    if (!confirm(`¿Deseas eliminar el evento "${evt.title}"?`)) return;
    try {
      await eventsAdminService.deleteEvent(evt.id);
      setEvents((prev) => prev.filter((e) => e.id !== evt.id));
      onToast?.(`Evento "${evt.title}" eliminado`);
    } catch {
      onToast?.('Error al eliminar evento');
    }
  };

  // Convert ChurchAdminEvent to UserEvent for projection & share
  const toUserEvent = (evt: ChurchAdminEvent): UserEvent => ({
    id: evt.id,
    categoryId: 'cat_culto',
    title: evt.title,
    description: `${evt.description}\n\nPredicador: ${evt.speaker}\nServicios: ${evt.hasFoodService ? '🍔 Comida ' : ''}${evt.hasChildcare ? '👶 Guardería ' : ''}${evt.hasBookSales ? '📚 Libros' : ''}`,
    linkedVerses: evt.linkedPassage ? [evt.linkedPassage] : [],
    eventDate: evt.eventDate,
    createdAt: evt.eventDate,
    location: evt.location,
    startTime: evt.startTime,
    endTime: evt.endTime,
    imageUrl: evt.bannerUrl,
    tags: [evt.speaker, evt.hasFoodService ? 'Comida' : '', evt.hasChildcare ? 'Guardería' : ''].filter(Boolean),
  });

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const q = searchQuery.toLowerCase();
      const matchesQuery =
        !searchQuery ||
        e.title.toLowerCase().includes(q) ||
        e.speaker.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        (e.scopeName && e.scopeName.toLowerCase().includes(q)) ||
        (e.linkedPassage && e.linkedPassage.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
      const matchesScope =
        scopeFilter === 'all' ||
        e.scope === scopeFilter ||
        (!e.scope && scopeFilter === 'general');

      return matchesQuery && matchesStatus && matchesScope;
    });
  }, [events, searchQuery, statusFilter, scopeFilter]);

  // Quick statistics
  const stats = useMemo(() => {
    const total = events.length;
    const withFood = events.filter((e) => e.hasFoodService).length;
    const withChildcare = events.filter((e) => e.hasChildcare).length;
    const withBooks = events.filter((e) => e.hasBookSales).length;
    const totalCapacity = events.reduce((acc, e) => acc + (e.maxCapacity || 0), 0);
    return { total, withFood, withChildcare, withBooks, totalCapacity };
  }, [events]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#002147] via-[#0B2B68] to-[#1E3A8A] text-white p-6 rounded-3xl shadow-md border border-[#D4AF37]/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#FED65B] text-[#002147]">
              Submenú Eclesiástico
            </span>
            <span className="text-xs text-white/70 font-mono">Logística & Cultos Unificados</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#FED65B]" />
            Eventos, Cultos & Logística Eclesiástica
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed">
            Planificación de servicios con conmutadores logísticos: Cafetería 🍔, Guardería 👶, Librería 📚, proyección en pantalla gigante y difusión congregacional.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={loadEvents}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/20"
            title="Recargar eventos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FED65B] hover:bg-[#E6BE45] text-[#002147] text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Crear Evento</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        <div className="bg-white dark:bg-[#1A1C24] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Cultos</div>
          <div className="text-lg font-bold text-[#002147] dark:text-[#FED65B]">{stats.total}</div>
        </div>
        <div className="bg-white dark:bg-[#1A1C24] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-xs">
          <div className="text-[10px] uppercase font-bold text-amber-500">Con Comida 🍔</div>
          <div className="text-lg font-bold text-amber-600">{stats.withFood}</div>
        </div>
        <div className="bg-white dark:bg-[#1A1C24] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-xs">
          <div className="text-[10px] uppercase font-bold text-sky-500">Guardería 👶</div>
          <div className="text-lg font-bold text-sky-600">{stats.withChildcare}</div>
        </div>
        <div className="bg-white dark:bg-[#1A1C24] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-xs">
          <div className="text-[10px] uppercase font-bold text-emerald-500">Librería 📚</div>
          <div className="text-lg font-bold text-emerald-600">{stats.withBooks}</div>
        </div>
        <div className="bg-white dark:bg-[#1A1C24] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-xs col-span-2 sm:col-span-1">
          <div className="text-[10px] uppercase font-bold text-purple-500">Aforo Total</div>
          <div className="text-lg font-bold text-purple-600">{stats.totalCapacity} personas</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#1A1C24] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {(['all', 'published', 'draft', 'completed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-[#002147] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {st === 'all'
                ? 'Todos los Estados'
                : st === 'published'
                ? 'Publicados'
                : st === 'draft'
                ? 'Borradores'
                : 'Concluidos'}
            </button>
          ))}

          {/* Scope Hierarchy Filter */}
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />
          <select
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all">🌐 Todos los Ámbitos</option>
            <option value="general">Toda la Iglesia (General)</option>
            <option value="sede">🏛️ Sedes / Templos</option>
            <option value="anexo">⛪ Anexos Filiales</option>
            <option value="celula">🏠 Células en Hogares</option>
          </select>
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por título, orador, ámbito..."
          className="w-full sm:w-64 px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#002147]"
        />
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#002147] dark:text-[#FED65B]" />
          <p className="text-xs">Sincronizando eventos con el servidor eclesiástico...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-[#1A1C24] rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8 space-y-3">
          <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
            No se encontraron eventos
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Crea cultos y reuniones especiales configurando los servicios de guardería, cafetería y literatura.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 rounded-xl bg-[#002147] text-white text-xs font-bold hover:bg-[#0B2B68] cursor-pointer"
          >
            + Crear Primer Evento
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="bg-white dark:bg-[#1A1C24] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              {/* Event Image Banner */}
              {evt.bannerUrl && (
                <div className="relative h-36 w-full overflow-hidden bg-slate-900">
                  <img
                    src={evt.bannerUrl}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-xs ${
                        evt.status === 'published'
                          ? 'bg-emerald-500/90 text-white'
                          : evt.status === 'draft'
                          ? 'bg-amber-500/90 text-white'
                          : 'bg-slate-700/90 text-slate-200'
                      }`}
                    >
                      {evt.status === 'published' ? 'Publicado' : evt.status === 'draft' ? 'Borrador' : 'Concluido'}
                    </span>
                    <ScopeBadge scope={evt.scope} scopeName={evt.scopeName} size="xs" />
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-bold">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#FED65B]" />
                      <span>
                        {new Date(evt.eventDate).toLocaleDateString('es-CL', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-xs">
                      <Clock className="w-3.5 h-3.5 text-[#FED65B]" />
                      <span>
                        {evt.startTime} - {evt.endTime}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Card Body */}
              <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                <div>
                  {!evt.bannerUrl && (
                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            evt.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : evt.status === 'draft'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {evt.status === 'published' ? 'Publicado' : evt.status === 'draft' ? 'Borrador' : 'Concluido'}
                        </span>
                        <ScopeBadge scope={evt.scope} scopeName={evt.scopeName} size="xs" />
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-[#F47B20]">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{evt.eventDate}</span>
                      </div>
                    </div>
                  )}

                  <h2 className="text-base sm:text-lg font-bold font-serif text-[#002147] dark:text-white leading-snug">
                    {evt.title}
                  </h2>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <User className="w-3.5 h-3.5 text-[#F47B20]" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{evt.speaker}</span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                    {evt.description}
                  </p>
                </div>

                {/* Location & Scripture */}
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-[#121318] p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#002147] dark:text-[#FED65B] shrink-0" />
                      <span className="truncate">{evt.location}</span>
                    </div>
                    <a
                      href={getMapsUrlForLocation(evt.location)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-[#002147] dark:text-[#FED65B] font-bold hover:underline shrink-0 flex items-center gap-0.5"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Mapa</span>
                    </a>
                  </div>

                  {evt.linkedPassage && (
                    <div className="flex items-center gap-1.5 text-[#002147] dark:text-[#FED65B] font-bold pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                      <BookOpen className="w-3.5 h-3.5 text-[#F47B20] shrink-0" />
                      <span>Pasaje: {evt.linkedPassage}</span>
                    </div>
                  )}
                </div>

                {/* Mandatory Feature Toggles: Food, Childcare, Books */}
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">
                    Servicios Disponibles:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <div
                      className={`p-1.5 rounded-xl text-center border text-[10px] font-bold flex flex-col items-center transition-all ${
                        evt.hasFoodService
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-800 dark:text-amber-300'
                          : 'bg-slate-50 dark:bg-[#121318] border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-600 opacity-60'
                      }`}
                    >
                      <span className="text-sm">🍔</span>
                      <span>Comida</span>
                    </div>

                    <div
                      className={`p-1.5 rounded-xl text-center border text-[10px] font-bold flex flex-col items-center transition-all ${
                        evt.hasChildcare
                          ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 text-sky-800 dark:text-sky-300'
                          : 'bg-slate-50 dark:bg-[#121318] border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-600 opacity-60'
                      }`}
                    >
                      <span className="text-sm">👶</span>
                      <span>Guardería</span>
                    </div>

                    <div
                      className={`p-1.5 rounded-xl text-center border text-[10px] font-bold flex flex-col items-center transition-all ${
                        evt.hasBookSales
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300'
                          : 'bg-slate-50 dark:bg-[#121318] border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-600 opacity-60'
                      }`}
                    >
                      <span className="text-sm">📚</span>
                      <span>Librería</span>
                    </div>
                  </div>
                </div>

                {/* Actions: Proyectar, Compartir, Editar, Eliminar */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      <strong>{evt.registeredCount || 0}</strong> / {evt.maxCapacity || '∞'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPresentingEvent(evt)}
                      className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                      title="Proyectar en pantalla gigante (Modo Presentación)"
                    >
                      <Play className="w-3.5 h-3.5 text-[#F47B20]" />
                    </button>

                    <button
                      onClick={() => setSharingEvent(toUserEvent(evt))}
                      className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                      title="Compartir afiche y detalles del evento"
                    >
                      <Share2 className="w-3.5 h-3.5 text-[#002147] dark:text-[#FED65B]" />
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(evt)}
                      className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                      title="Editar evento"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteEvent(evt)}
                      className="p-1.5 rounded-xl bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 transition-all cursor-pointer"
                      title="Eliminar evento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Projection Modal */}
      {presentingEvent && (
        <EventPresentationView
          event={toUserEvent(presentingEvent)}
          settings={{
            fontSize: 'medium',
            fontFamily: 'Inter',
            lineHeight: 'normal',
            translation: 'rvr1960',
            themeMode: currentTheme,
            showVerseNumbers: true,
          }}
          onExit={() => setPresentingEvent(null)}
          onNavigateToScripture={onNavigateToScripture}
          onToast={onToast}
        />
      )}

      {/* Share Modal */}
      {sharingEvent && (
        <EventShareModal
          event={sharingEvent}
          isOpen={true}
          onClose={() => setSharingEvent(null)}
        />
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#1A1C24] w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-[#002147] text-white flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#FED65B]" />
                <h3 className="font-serif font-bold text-base sm:text-lg">
                  {editingEvent ? 'Editar Evento Eclesiástico' : 'Nuevo Evento & Planificación de Servicio'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="space-y-1 text-left">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Título del Evento o Servicio *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej. Culto Dominical de Adoración & Santa Cena"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147]"
                />
              </div>

              {/* Hierarchy Scope Selector */}
              <ScopeSelector
                scope={formData.scope}
                targetId={formData.scopeTargetId}
                onChange={(scope, targetId, scopeName) =>
                  setFormData((prev) => ({
                    ...prev,
                    scope,
                    scopeTargetId: targetId,
                    scopeName,
                  }))
                }
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 text-left">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Predicador / Orador Invitado:
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.speaker}
                    onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
                    placeholder="Pastor David Ben-David"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147]"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Pasaje Bíblico Central:
                  </label>
                  <input
                    type="text"
                    value={formData.linkedPassage}
                    onChange={(e) => setFormData({ ...formData, linkedPassage: e.target.value })}
                    placeholder="Ej. Romanos 12:1-2"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147]"
                  />
                </div>
              </div>

              {/* Date & Hours with quick duration helper */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1 text-left">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Fecha del Evento:
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147]"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Hora de Inicio:
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147]"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Hora de Término:
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleAutoSetEndTime(1)}
                        className="text-[10px] font-bold text-[#F47B20] hover:underline"
                      >
                        +1h
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAutoSetEndTime(1.5)}
                        className="text-[10px] font-bold text-[#F47B20] hover:underline"
                      >
                        +1.5h
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAutoSetEndTime(2)}
                        className="text-[10px] font-bold text-[#F47B20] hover:underline"
                      >
                        +2h
                      </button>
                    </div>
                  </div>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147]"
                  />
                </div>
              </div>

              {/* Location with GPS button */}
              <div className="space-y-1 text-left">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Ubicación / Templo o Sala:
                  </label>
                  <button
                    type="button"
                    onClick={handleGetGpsLocation}
                    disabled={isLocating}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#002147] dark:text-[#FED65B] hover:underline cursor-pointer"
                  >
                    <Navigation className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                    <span>{isLocating ? 'Buscando GPS...' : 'Usar GPS Móvil'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder={DEFAULT_CHURCH_LOCATION}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147]"
                />
              </div>

              {/* Poster Preset Selector */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Afiche / Imagen del Evento:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {EVENT_IMAGE_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setFormData({ ...formData, bannerUrl: preset.url })}
                      className={`relative rounded-xl overflow-hidden h-16 border-2 transition-all cursor-pointer ${
                        formData.bannerUrl === preset.url
                          ? 'border-[#FED65B] ring-2 ring-[#002147]'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-end p-1 text-[9px] font-bold text-white leading-tight">
                        {preset.label}
                      </div>
                      {formData.bannerUrl === preset.url && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#FED65B] text-[#002147] flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 text-left">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Capacidad / Aforo Máximo:
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="5000"
                    value={formData.maxCapacity}
                    onChange={(e) => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147]"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Estado de Publicación:
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147]"
                  >
                    <option value="published">Publicado en la Congregación</option>
                    <option value="draft">Borrador (Solo Pastores/Líderes)</option>
                    <option value="completed">Concluido</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Descripción del Culto o Conferencia:
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalles sobre el orden del culto, ministración especial o actividades..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147]"
                />
              </div>

              {/* Service Toggles Box */}
              <div className="p-4 bg-slate-50 dark:bg-[#121318] rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-xs font-bold text-[#002147] dark:text-[#FED65B] uppercase tracking-wider block">
                  Conmutadores de Servicios Eclesiásticos:
                </span>

                <div className="space-y-2">
                  <label className="flex items-center justify-between cursor-pointer p-2.5 rounded-xl bg-white dark:bg-[#1A1C24] border border-slate-200 dark:border-slate-700 hover:border-amber-400 transition-colors">
                    <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      <span className="text-lg">🍔</span>
                      <div>
                        <div>Servicio de Cafetería / Kiosko habilitado</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          Permite ordenar alimentos en el intermedio y post-culto
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.hasFoodService}
                      onChange={(e) => setFormData({ ...formData, hasFoodService: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer p-2.5 rounded-xl bg-white dark:bg-[#1A1C24] border border-slate-200 dark:border-slate-700 hover:border-sky-400 transition-colors">
                    <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      <span className="text-lg">👶</span>
                      <div>
                        <div>Cuidado Infantil / Sala Cuna Activo</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          Maestros y monitoras capacitadas para niños de 0 a 6 años
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.hasChildcare}
                      onChange={(e) => setFormData({ ...formData, hasChildcare: e.target.checked })}
                      className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer p-2.5 rounded-xl bg-white dark:bg-[#1A1C24] border border-slate-200 dark:border-slate-700 hover:border-emerald-400 transition-colors">
                    <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      <span className="text-lg">📚</span>
                      <div>
                        <div>Venta de Libros Bíblicos & Literatura</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          Stands con biblias de estudio, comentarios y material devocional
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.hasBookSales}
                      onChange={(e) => setFormData({ ...formData, hasBookSales: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500"
                    />
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#002147] hover:bg-[#0B2B68] text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  <Save className="w-4 h-4 text-[#FED65B]" />
                  <span>{editingEvent ? 'Actualizar Evento' : 'Publicar Evento'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
