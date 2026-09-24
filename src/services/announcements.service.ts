import { apiClient } from './apiClient';
import { AnnouncementBroadcast, HierarchyScopeType } from '../types';

export interface BroadcastPayload {
  churchId: string;
  scope?: HierarchyScopeType;
  scopeTargetId?: string;
  scopeName?: string;
  annexId?: string;
  targetTopic: string;
  topicLabel: string;
  title: string;
  body: string;
  priority: 'normal' | 'high';
  deepLink?: string;
}

const STORAGE_KEY = 'sanctuary_announcements_history';

const INITIAL_BROADCASTS: AnnouncementBroadcast[] = [
  {
    id: 'fcm_001',
    churchId: 'church_elshaddai_central',
    scope: 'general',
    scopeTargetId: 'general',
    scopeName: 'Toda la Iglesia (General)',
    targetTopic: 'church_all',
    topicLabel: 'Toda la Congregación (General)',
    title: '🕊️ Vigilia Unida de Oración: "El Shaddai es Fiel"',
    body: 'Este viernes a las 20:00 hrs nos reunimos en el Templo Central. Habrá cafetería disponible.',
    priority: 'high',
    deepLink: 'biblia://events/vigilia-2026',
    sentAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    sentBy: 'Pastor David Ben-David',
    deliveredCount: 412,
    status: 'sent',
  },
  {
    id: 'fcm_002',
    churchId: 'church_elshaddai_central',
    scope: 'sede',
    scopeTargetId: 'sede_norte',
    scopeName: 'Sede Norte - Campus Esperanza',
    annexId: 'annex_norte',
    targetTopic: 'annex_norte',
    topicLabel: 'Sede Norte',
    title: '📖 Escuela Bíblica de Liderazgo este Sábado',
    body: 'Módulo II de Exégesis y Hermenéutica. Traer Biblia y cuaderno de notas.',
    priority: 'normal',
    deepLink: 'biblia://reader/MAT/5',
    sentAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    sentBy: 'Hno. Gabriel Cruz',
    deliveredCount: 98,
    status: 'sent',
  },
  {
    id: 'fcm_003',
    churchId: 'church_elshaddai_central',
    scope: 'general',
    scopeTargetId: 'general',
    scopeName: 'Toda la Iglesia (General)',
    targetTopic: 'youth_ministry',
    topicLabel: 'Ministerio de Jóvenes (JAD)',
    title: '🔥 Campamento Juvenil: Inscripciones Abiertas',
    body: 'Cupos limitados con alimentación y alojamiento incluido. ¡Asegura tu lugar!',
    priority: 'high',
    deepLink: 'biblia://events/camp-2026',
    sentAt: new Date(Date.now() - 3600000 * 120).toISOString(),
    sentBy: 'Pastor Marcos Morales',
    deliveredCount: 154,
    status: 'sent',
  },
];

export interface NotificationTopic {
  id: string;
  name: string;
  description: string;
  estimatedSubscribers: number;
}

export const NOTIFICATION_TOPICS: NotificationTopic[] = [
  {
    id: 'church_all',
    name: 'Toda la Iglesia (FCM Topic: church_all)',
    description: 'Notificaciones masivas urgentes, servicios dominicales y anuncios institucionales.',
    estimatedSubscribers: 560,
  },
  {
    id: 'annex_central',
    name: 'Templo Central (FCM: annex_central)',
    description: 'Miembros asignados a la sede principal.',
    estimatedSubscribers: 310,
  },
  {
    id: 'annex_norte',
    name: 'Anexo Sector Norte (FCM: annex_norte)',
    description: 'Miembros y líderes del campus norte.',
    estimatedSubscribers: 140,
  },
  {
    id: 'annex_sur',
    name: 'Anexo Cordillera (FCM: annex_sur)',
    description: 'Miembros del campus cordillera.',
    estimatedSubscribers: 110,
  },
  {
    id: 'youth_ministry',
    name: 'Jóvenes & Universitarios (FCM: youth_ministry)',
    description: 'Reuniones de jóvenes de los sábados, música y campamentos.',
    estimatedSubscribers: 165,
  },
  {
    id: 'pastoral_leaders',
    name: 'Líderes de Ministerios (FCM: pastoral_leaders)',
    description: 'Pastores, coordinadores, diáconos y encargados de servicio.',
    estimatedSubscribers: 42,
  },
];

function getStoredBroadcasts(): AnnouncementBroadcast[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse announcements history storage', e);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BROADCASTS));
  return INITIAL_BROADCASTS;
}

function saveStoredBroadcasts(list: AnnouncementBroadcast[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('Failed to save announcements history storage', e);
  }
}

export const announcementsService = {
  /**
   * Get history of push notification broadcasts
   */
  async getBroadcasts(): Promise<AnnouncementBroadcast[]> {
    try {
      const res = await apiClient.get<{ broadcasts: AnnouncementBroadcast[] }>(
        '/admin/announcements/broadcast'
      );
      if (res?.broadcasts) {
        saveStoredBroadcasts(res.broadcasts);
        return res.broadcasts;
      }
    } catch {
      console.log('[announcementsService] Using local broadcasts store');
    }

    return getStoredBroadcasts();
  },

  /**
   * Trigger live FCM Push broadcast
   */
  async sendBroadcast(payload: BroadcastPayload, sentBy: string = 'Admin'): Promise<AnnouncementBroadcast> {
    const topic = NOTIFICATION_TOPICS.find((t) => t.id === payload.targetTopic);
    const estimatedRecipients = topic?.estimatedSubscribers || 120;

    const newBroadcast: AnnouncementBroadcast = {
      id: `fcm_${Date.now()}`,
      churchId: payload.churchId,
      scope: payload.scope || 'general',
      scopeTargetId: payload.scopeTargetId || 'general',
      scopeName: payload.scopeName || 'Toda la Iglesia (General)',
      annexId: payload.annexId,
      targetTopic: payload.targetTopic,
      topicLabel: payload.topicLabel || topic?.name || payload.targetTopic,
      title: payload.title,
      body: payload.body,
      priority: payload.priority,
      deepLink: payload.deepLink,
      sentAt: new Date().toISOString(),
      sentBy,
      deliveredCount: estimatedRecipients,
      status: 'sent',
    };

    try {
      const res = await apiClient.post<{ broadcast: AnnouncementBroadcast }>(
        '/admin/announcements/broadcast',
        { ...payload, sentBy }
      );
      if (res?.broadcast) {
        const stored = getStoredBroadcasts();
        saveStoredBroadcasts([res.broadcast, ...stored]);
        return res.broadcast;
      }
    } catch {
      console.log('[announcementsService] Stored simulated broadcast locally');
    }

    const stored = getStoredBroadcasts();
    saveStoredBroadcasts([newBroadcast, ...stored]);
    return newBroadcast;
  },

  getTopics(): NotificationTopic[] {
    return NOTIFICATION_TOPICS;
  },
};
