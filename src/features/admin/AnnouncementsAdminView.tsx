import React, { useState, useEffect, useTransition } from 'react';
import {
  Bell,
  Send,
  Radio,
  Clock,
  CheckCircle2,
  Smartphone,
  ExternalLink,
  ShieldAlert,
  Users,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { announcementsService, NOTIFICATION_TOPICS } from '../../services/announcements.service';
import { AnnouncementBroadcast, HierarchyScopeType } from '../../types';
import { useAuth } from '../auth/context/AuthContext';
import { ScopeSelector } from '../../components/ScopeSelector';
import { ScopeBadge } from '../../components/ScopeBadge';

interface AnnouncementsAdminViewProps {
  onToast?: (message: string) => void;
  currentTheme?: 'light' | 'sepia' | 'dark';
}

export const AnnouncementsAdminView: React.FC<AnnouncementsAdminViewProps> = ({
  onToast,
  currentTheme = 'light',
}) => {
  const { user } = useAuth();
  const [broadcasts, setBroadcasts] = useState<AnnouncementBroadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSending, startSendTransition] = useTransition();

  // Form composer state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [scope, setScope] = useState<HierarchyScopeType>('general');
  const [scopeTargetId, setScopeTargetId] = useState('general');
  const [scopeName, setScopeName] = useState('Toda la Iglesia (General)');
  const [targetTopic, setTargetTopic] = useState('church_all');
  const [priority, setPriority] = useState<'normal' | 'high'>('normal');
  const [deepLink, setDeepLink] = useState('biblia://events');

  const loadBroadcasts = async () => {
    setLoading(true);
    try {
      const list = await announcementsService.getBroadcasts();
      setBroadcasts(list);
    } catch {
      onToast?.('Error al cargar historial de avisos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBroadcasts();
  }, []);

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      onToast?.('Por favor completa el título y el mensaje de la notificación');
      return;
    }

    startSendTransition(async () => {
      try {
        const topic = NOTIFICATION_TOPICS.find((t) => t.id === targetTopic);
        await announcementsService.sendBroadcast(
          {
            churchId: user?.churchId || 'church_elshaddai_central',
            scope,
            scopeTargetId,
            scopeName,
            annexId: scope === 'anexo' ? scopeTargetId : undefined,
            targetTopic,
            topicLabel: scope === 'general' ? (topic?.name || targetTopic) : `${scopeName} (${topic?.name || 'General'})`,
            title,
            body,
            priority,
            deepLink: deepLink || undefined,
          },
          user?.fullName || 'Hermano de Medios'
        );

        onToast?.(`🚀 Notificación Push enviada para "${scopeName}"`);
        setTitle('');
        setBody('');
        loadBroadcasts();
      } catch {
        onToast?.('Error al enviar la notificación Push');
      }
    });
  };

  const selectedTopic = NOTIFICATION_TOPICS.find((t) => t.id === targetTopic);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#121318] p-6 rounded-3xl border border-[#002147]/10 dark:border-white/10 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#0284C7]/10 text-[#0284C7] dark:text-[#38BDF8] border border-[#0284C7]/20 mb-2">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#0284C7]" />
            FCM Cloud Messaging Hub &bull; Difusión por Canales
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold font-serif text-[#002147] dark:text-white flex items-center gap-3">
            <Bell className="w-7 h-7 text-[#0284C7]" />
            Avisos & Notificaciones Push
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Redacta boletines eclesiásticos y dispara transmisiones push en tiempo real hacia los dispositivos móviles suscritos.
          </p>
        </div>

        <button
          onClick={loadBroadcasts}
          className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer self-start md:self-auto"
          title="Recargar historial"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Notification Composer (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#121318] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-base font-bold font-serif text-[#002147] dark:text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-[#0284C7]" />
              Redactar Notificación Push (FCM Broadcast)
            </h2>
            <span className="text-xs text-slate-400 font-semibold">
              Destinatarios estimados: ~{selectedTopic?.estimatedSubscribers || 0}
            </span>
          </div>

          <form onSubmit={handleSendBroadcast} className="space-y-4">
            {/* Hierarchy Scope Selector */}
            <ScopeSelector
              scope={scope}
              targetId={scopeTargetId}
              onChange={(s, targetId, sName) => {
                setScope(s);
                setScopeTargetId(targetId);
                setScopeName(sName);
              }}
            />

            {/* Target Topic Selector */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Canal / Tópico de Difusión:</span>
                <span className="text-[11px] font-normal text-slate-400">FCM Topic</span>
              </label>
              <select
                value={targetTopic}
                onChange={(e) => setTargetTopic(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#181A22] text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#0284C7]"
              >
                {NOTIFICATION_TOPICS.map((top) => (
                  <option key={top.id} value={top.id}>
                    {top.name} (~{top.estimatedSubscribers} miembros)
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 italic">
                {selectedTopic?.description}
              </p>
            </div>

            {/* Notification Title */}
            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Título del Aviso:
              </label>
              <input
                type="text"
                required
                maxLength={90}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. 🕊️ Vigilia Especial este Viernes a las 20:00 hrs"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#181A22] text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#0284C7]"
              />
              <div className="text-right text-[10px] text-slate-400">
                {title.length}/90 caracteres
              </div>
            </div>

            {/* Notification Body */}
            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Cuerpo del Mensaje:
              </label>
              <textarea
                rows={3}
                required
                maxLength={240}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Escribe el mensaje devocional, aviso de servicio o instrucción para la congregación..."
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#181A22] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#0284C7]"
              />
              <div className="text-right text-[10px] text-slate-400">
                {body.length}/240 caracteres
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Priority */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Prioridad de Notificación:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPriority('normal')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      priority === 'normal'
                        ? 'bg-[#002147] text-white border-[#002147]'
                        : 'bg-slate-50 dark:bg-[#181A22] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Normal (Silenciosa)
                  </button>

                  <button
                    type="button"
                    onClick={() => setPriority('high')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      priority === 'high'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-[#181A22] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Alta / Urgente</span>
                  </button>
                </div>
              </div>

              {/* Deep link target */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Deep Link (Ruta en App Móvil):
                </label>
                <select
                  value={deepLink}
                  onChange={(e) => setDeepLink(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#181A22] text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#0284C7]"
                >
                  <option value="biblia://events">Pantalla de Eventos (biblia://events)</option>
                  <option value="biblia://food-court">Cafetería & Kiosko (biblia://food-court)</option>
                  <option value="biblia://reader/MAT/1">Lectura Bíblica (biblia://reader)</option>
                  <option value="biblia://saved">Versículos Guardados (biblia://saved)</option>
                </select>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Users className="w-4 h-4 text-[#0284C7]" />
                <span>Difundir a <strong>~{selectedTopic?.estimatedSubscribers}</strong> miembros</span>
              </div>

              <button
                type="submit"
                disabled={isSending || !title.trim()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className={`w-4 h-4 ${isSending ? 'animate-bounce' : ''}`} />
                <span>{isSending ? 'Transmitiendo FCM...' : 'Disparar Push Broadcast'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Mobile Push Preview (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-[#121318] rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#F47B20]" />
              Vista Previa en Dispositivo Móvil
            </h3>

            {/* Realistic Mobile Push Banner */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-xl border border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-[#0B2B68] flex items-center justify-center text-[9px] font-bold text-[#FED65B]">
                    ✝
                  </div>
                  <span className="font-semibold text-slate-300">Biblia Inteligente &bull; El-Shaddai</span>
                </div>
                <span>ahora</span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white">
                  {title || 'Título de ejemplo de la notificación push'}
                </h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  {body || 'El mensaje aparecerá aquí tal como lo verán los miembros en la barra superior de Android y en la pantalla de bloqueo de iOS.'}
                </p>
              </div>

              <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <ScopeBadge scope={scope} scopeName={scopeName} size="xs" />
                  <span>Canal: {selectedTopic?.name}</span>
                </div>
                {priority === 'high' && (
                  <span className="text-rose-400 font-bold flex items-center gap-1">
                    <Flame className="w-3 h-3" /> Urgente
                  </span>
                )}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic text-center">
              Renderizado nativo FCM para Firebase Messaging en Android e iOS.
            </p>
          </div>

          {/* Broadcasts History */}
          <div className="bg-white dark:bg-[#121318] rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#0284C7]" />
              Historial de Transmisiones Recientes
            </h3>

            {broadcasts.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No hay envíos registrados.</p>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {broadcasts.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-[#181A22] border border-slate-100 dark:border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px] gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <ScopeBadge scope={b.scope} scopeName={b.scopeName} size="xs" />
                        <span className="font-bold text-[#002147] dark:text-[#FED65B] truncate max-w-[160px]">
                          {b.topicLabel || b.targetTopic}
                        </span>
                      </div>
                      <span className="text-slate-400">
                        {new Date(b.sentAt).toLocaleDateString('es-CL', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <h5 className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                      {b.title}
                    </h5>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {b.body}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>Por: {b.sentBy}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {b.deliveredCount} entregados
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
