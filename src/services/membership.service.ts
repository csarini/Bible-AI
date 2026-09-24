import { apiClient } from './apiClient';
import { ChurchJoinRequest } from '../types';
import { UserRole } from '../features/auth/types';

export interface JoinRequestInput {
  churchId: string;
  churchName: string;
  annexId?: string;
  annexName?: string;
  fullName: string;
  email: string;
  phone?: string;
  requestedRole?: UserRole;
  notes?: string;
}

const STORAGE_KEY = 'sanctuary_membership_requests';

// Initial seed data representing mobile join requests sent from the Flutter app
const INITIAL_REQUESTS: ChurchJoinRequest[] = [
  {
    id: 'req_flutter_001',
    churchId: 'church_elshaddai_central',
    churchName: 'Iglesia El-Shaddai Central',
    annexId: 'annex_central',
    annexName: 'Templo Principal',
    fullName: 'Carlos Mendoza Ramos',
    email: 'carlos.mendoza@email.com',
    phone: '+56 9 8765 4321',
    requestedRole: 'member',
    status: 'pending',
    notes: 'Miembro recién trasladado desde Valparaíso. Deseo participar en el ministerio de alabanza.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'req_flutter_002',
    churchId: 'church_elshaddai_central',
    churchName: 'Iglesia El-Shaddai Central',
    annexId: 'annex_norte',
    annexName: 'Anexo Sector Norte',
    fullName: 'Camila Andrea Véliz',
    email: 'camila.veliz@email.com',
    phone: '+56 9 7654 3210',
    requestedRole: 'event_coordinator',
    status: 'pending',
    notes: 'Experiencia en logística de eventos de jóvenes y escuela dominical infantil.',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'req_flutter_003',
    churchId: 'church_elshaddai_central',
    churchName: 'Iglesia El-Shaddai Central',
    annexId: 'annex_sur',
    annexName: 'Anexo Cordillera',
    fullName: 'Patricio Morales Vega',
    email: 'patricio.m@email.com',
    phone: '+56 9 9123 4567',
    requestedRole: 'food_court_manager',
    status: 'pending',
    notes: 'Certificación de manipulación de alimentos. Apoyo para el comedor comunitario y cafetería.',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'req_flutter_004',
    churchId: 'church_elshaddai_central',
    churchName: 'Iglesia El-Shaddai Central',
    annexId: 'annex_central',
    annexName: 'Templo Principal',
    fullName: 'Elena Fuentes Miranda',
    email: 'elena.f@email.com',
    phone: '+56 9 6543 2109',
    requestedRole: 'member',
    assignedRole: 'member',
    status: 'approved',
    notes: 'Bautizada en 2021. Solicitud confirmada presencialmente en el servicio dominical.',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    reviewedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    reviewedBy: 'Pastor David Ben-David',
  },
];

function getStoredRequests(): ChurchJoinRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to parse membership requests storage', e);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REQUESTS));
  return INITIAL_REQUESTS;
}

function saveStoredRequests(list: ChurchJoinRequest[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('Failed to save membership requests storage', e);
  }
}

export const membershipService = {
  /**
   * Fetch all join requests, querying Express proxy / .NET API with local fallback
   */
  async getRequests(params?: {
    churchId?: string;
    status?: 'all' | 'pending' | 'approved' | 'rejected';
    search?: string;
  }): Promise<ChurchJoinRequest[]> {
    try {
      const query = new URLSearchParams();
      if (params?.churchId) query.set('churchId', params.churchId);
      if (params?.status && params.status !== 'all') query.set('status', params.status);

      const endpoint = `/admin/memberships${query.toString() ? `?${query.toString()}` : ''}`;
      const res = await apiClient.get<{ requests: ChurchJoinRequest[] }>(endpoint);
      if (res?.requests) {
        saveStoredRequests(res.requests);
        return res.requests;
      }
    } catch (e) {
      // Fallback to local storage
      console.log('[membershipService] Using resilient local store for requests');
    }

    let items = getStoredRequests();
    if (params?.churchId) {
      items = items.filter((i) => i.churchId === params.churchId);
    }
    if (params?.status && params.status !== 'all') {
      items = items.filter((i) => i.status === params.status);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (i) =>
          i.fullName.toLowerCase().includes(q) ||
          i.email.toLowerCase().includes(q) ||
          (i.annexName && i.annexName.toLowerCase().includes(q))
      );
    }
    return items;
  },

  /**
   * POST /api/v1/churches/join
   * Simulates/Sends a mobile join request as created by Flutter app users
   */
  async submitJoinRequest(input: JoinRequestInput): Promise<ChurchJoinRequest> {
    const newRequest: ChurchJoinRequest = {
      id: `req_${Date.now()}`,
      churchId: input.churchId,
      churchName: input.churchName,
      annexId: input.annexId,
      annexName: input.annexName,
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      requestedRole: input.requestedRole || 'member',
      status: 'pending',
      notes: input.notes,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await apiClient.post<{ request: ChurchJoinRequest }>(
        '/churches/join',
        input
      );
      if (res?.request) {
        const stored = getStoredRequests();
        saveStoredRequests([res.request, ...stored.filter((r) => r.id !== res.request.id)]);
        return res.request;
      }
    } catch (e) {
      console.log('[membershipService] Saved join request to local cache');
    }

    const stored = getStoredRequests();
    const updated = [newRequest, ...stored];
    saveStoredRequests(updated);
    return newRequest;
  },

  /**
   * Approve a pending member join request
   */
  async approveRequest(
    requestId: string,
    assignedRole: UserRole,
    reviewerName: string = 'Pastor Admin'
  ): Promise<ChurchJoinRequest> {
    try {
      const res = await apiClient.patch<{ request: ChurchJoinRequest }>(
        `/admin/memberships/${requestId}/approve`,
        { assignedRole, reviewerName }
      );
      if (res?.request) {
        const stored = getStoredRequests();
        const next = stored.map((r) => (r.id === requestId ? res.request : r));
        saveStoredRequests(next);
        return res.request;
      }
    } catch (e) {
      console.log('[membershipService] Updated request locally');
    }

    const stored = getStoredRequests();
    const item = stored.find((r) => r.id === requestId);
    if (!item) throw new Error(`Solicitud ${requestId} no encontrada`);

    const updated: ChurchJoinRequest = {
      ...item,
      status: 'approved',
      assignedRole,
      reviewedAt: new Date().toISOString(),
      reviewedBy: reviewerName,
    };

    saveStoredRequests(stored.map((r) => (r.id === requestId ? updated : r)));
    return updated;
  },

  /**
   * Reject a pending member join request
   */
  async rejectRequest(
    requestId: string,
    reason: string,
    reviewerName: string = 'Pastor Admin'
  ): Promise<ChurchJoinRequest> {
    try {
      const res = await apiClient.patch<{ request: ChurchJoinRequest }>(
        `/admin/memberships/${requestId}/reject`,
        { reason, reviewerName }
      );
      if (res?.request) {
        const stored = getStoredRequests();
        const next = stored.map((r) => (r.id === requestId ? res.request : r));
        saveStoredRequests(next);
        return res.request;
      }
    } catch (e) {
      console.log('[membershipService] Rejected locally');
    }

    const stored = getStoredRequests();
    const item = stored.find((r) => r.id === requestId);
    if (!item) throw new Error(`Solicitud ${requestId} no encontrada`);

    const updated: ChurchJoinRequest = {
      ...item,
      status: 'rejected',
      notes: reason ? `${item.notes ? `${item.notes} | ` : ''}Motivo de rechazo: ${reason}` : item.notes,
      reviewedAt: new Date().toISOString(),
      reviewedBy: reviewerName,
    };

    saveStoredRequests(stored.map((r) => (r.id === requestId ? updated : r)));
    return updated;
  },
};
