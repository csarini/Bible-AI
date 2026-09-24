import { apiClient } from './apiClient';
import { ChurchAdminEvent } from '../types';

const STORAGE_KEY = 'sanctuary_admin_events';

const INITIAL_EVENTS: ChurchAdminEvent[] = [
  {
    id: 'evt_001',
    churchId: 'church_elshaddai_central',
    scope: 'general',
    scopeTargetId: 'general',
    scopeName: 'Toda la Iglesia (General)',
    annexId: 'annex_central',
    annexName: 'Templo Central',
    title: 'Culto de Adoración & Santa Cena Familiar',
    description: 'Servicio general dominical con ordenanza de la Cena del Señor y predicación expositiva en Romanos 8.',
    speaker: 'Pastor David Ben-David',
    eventDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    startTime: '10:30',
    endTime: '12:45',
    location: 'Santuario Principal, Av. La Paz 1420',
    hasFoodService: true,  // 🍔 Comida
    hasChildcare: true,    // 👶 Cuidado infantil
    hasBookSales: true,    // 📚 Venta de libros
    maxCapacity: 450,
    registeredCount: 312,
    status: 'published',
    linkedPassage: 'Romanos 8:31-39',
  },
  {
    id: 'evt_002',
    churchId: 'church_elshaddai_central',
    scope: 'sede',
    scopeTargetId: 'sede_norte',
    scopeName: 'Sede Norte - Campus Esperanza',
    annexId: 'annex_norte',
    annexName: 'Sede Norte',
    title: 'Conferencia de Matrimonios: "Edificando sobre la Roca"',
    description: 'Taller práctico para parejas, resolución de conflictos y comunión cristiana.',
    speaker: 'Pastores Marcos & Elizabeth Morales',
    eventDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    startTime: '18:00',
    endTime: '21:00',
    location: 'Auditorio Sede Norte, Calle San Pedro 55',
    hasFoodService: true,  // 🍔 Banquete/Cena
    hasChildcare: true,    // 👶 Guardería especial para niños
    hasBookSales: false,
    maxCapacity: 120,
    registeredCount: 88,
    status: 'published',
    linkedPassage: 'Efesios 5:21-33',
  },
  {
    id: 'evt_003',
    churchId: 'church_elshaddai_central',
    scope: 'anexo',
    scopeTargetId: 'anexo_san_pedro',
    scopeName: 'Anexo Sector San Pedro',
    annexId: 'anexo_san_pedro',
    annexName: 'Anexo Sector San Pedro',
    title: 'Seminario de Teología Bíblica: Los Pactos de Dios',
    description: 'Estudio intensivo sobre los pactos bíblicos desde Adán hasta el Nuevo Pacto en Cristo Jesús.',
    speaker: 'Dr. Samuel Valenzuela',
    eventDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '14:00',
    location: 'Sala de Estudio Anexo San Pedro',
    hasFoodService: false,
    hasChildcare: false,
    hasBookSales: true,    // 📚 Venta de libros y comentarios bíblicos
    maxCapacity: 60,
    registeredCount: 45,
    status: 'published',
    linkedPassage: 'Hebreos 8:6-13',
  },
  {
    id: 'evt_004',
    churchId: 'church_elshaddai_central',
    scope: 'celula',
    scopeTargetId: 'cel_c01',
    scopeName: 'Célula [CEL-C01] Betel',
    title: 'Cena de Compañerismo & Discipulado Celular',
    description: 'Reunión de hogar, alabanza acústica y estudio de la serie "Vida en el Reino".',
    speaker: 'Líder Roberto Quispe',
    eventDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    startTime: '19:30',
    endTime: '21:30',
    location: 'Calle Los Sauces 240, Dpto 301 (Casa Familia Flores)',
    hasFoodService: true,
    hasChildcare: false,
    hasBookSales: false,
    maxCapacity: 18,
    registeredCount: 14,
    status: 'published',
    linkedPassage: 'Hechos 2:42-47',
  },
];

function getStoredEvents(): ChurchAdminEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse admin events storage', e);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_EVENTS));
  return INITIAL_EVENTS;
}

function saveStoredEvents(events: ChurchAdminEvent[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (e) {
    console.warn('Failed to save admin events storage', e);
  }
}

export const eventsAdminService = {
  async getEvents(): Promise<ChurchAdminEvent[]> {
    try {
      const res = await apiClient.get<{ events: ChurchAdminEvent[] }>('/admin/events');
      if (res?.events) {
        saveStoredEvents(res.events);
        return res.events;
      }
    } catch {
      console.log('[eventsAdminService] Using local events cache');
    }
    return getStoredEvents();
  },

  async createEvent(data: Omit<ChurchAdminEvent, 'id'>): Promise<ChurchAdminEvent> {
    const newEvent: ChurchAdminEvent = {
      ...data,
      id: `evt_${Date.now()}`,
    };

    try {
      const res = await apiClient.post<{ event: ChurchAdminEvent }>('/admin/events', data);
      if (res?.event) {
        const stored = getStoredEvents();
        saveStoredEvents([res.event, ...stored]);
        return res.event;
      }
    } catch {
      console.log('[eventsAdminService] Created event locally');
    }

    const stored = getStoredEvents();
    saveStoredEvents([newEvent, ...stored]);
    return newEvent;
  },

  async updateEvent(id: string, updates: Partial<ChurchAdminEvent>): Promise<ChurchAdminEvent> {
    try {
      const res = await apiClient.put<{ event: ChurchAdminEvent }>(`/admin/events/${id}`, updates);
      if (res?.event) {
        const stored = getStoredEvents();
        saveStoredEvents(stored.map((e) => (e.id === id ? res.event : e)));
        return res.event;
      }
    } catch {
      console.log('[eventsAdminService] Updated event locally');
    }

    const stored = getStoredEvents();
    const target = stored.find((e) => e.id === id);
    if (!target) throw new Error(`Evento ${id} no encontrado`);

    const updated = { ...target, ...updates };
    saveStoredEvents(stored.map((e) => (e.id === id ? updated : e)));
    return updated;
  },

  async deleteEvent(id: string): Promise<void> {
    try {
      await apiClient.delete(`/admin/events/${id}`);
    } catch {
      console.log('[eventsAdminService] Deleted event locally');
    }

    const stored = getStoredEvents();
    saveStoredEvents(stored.filter((e) => e.id !== id));
  },
};
