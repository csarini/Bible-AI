import { UserRole } from '../features/auth/types';
import { HierarchyScopeType } from '../types';

export interface SecurityPermissions {
  // Kiosko / Cafetería
  canManageKioskMenu?: boolean;
  canProcessKioskOrders?: boolean;
  // Célula en Hogar
  canManageCellMembers?: boolean;
  canTrackCellAttendance?: boolean;
  canHostCellGatherings?: boolean;
  // Sede / Anexo
  canManageLocalEvents?: boolean;
  canApproveLocalMembers?: boolean;
  // General
  canPublishSermons?: boolean;
  canBroadcastPush?: boolean;
}

export interface MemberRoleAssignment {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  memberPhone?: string;
  avatarUrl?: string;
  role: UserRole;
  scope: HierarchyScopeType;
  scopeTargetId?: string;
  scopeName: string;
  status: 'active' | 'suspended';
  assignedDate: string;
  assignedBy: string;
  notes?: string;
  permissions: SecurityPermissions;
}

const STORAGE_KEY = 'sanctuary_security_role_assignments';

export const INITIAL_ASSIGNMENTS: MemberRoleAssignment[] = [
  {
    id: 'asgn_kiosk_01',
    memberId: 'mem_01',
    memberName: 'Daniel Peña Morales',
    memberEmail: 'daniel.pena@elshaddai.org',
    memberPhone: '+56 9 8234 5678',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'food_court_manager',
    scope: 'sede',
    scopeTargetId: 'sede_central',
    scopeName: 'Templo Central El-Shaddai',
    status: 'active',
    assignedDate: '2026-01-15',
    assignedBy: 'Pastor David Ben-David',
    notes: 'Responsable del kiosko central y servicio de refrigerios de los cultos dominicales.',
    permissions: {
      canManageKioskMenu: true,
      canProcessKioskOrders: true,
    },
  },
  {
    id: 'asgn_kiosk_02',
    memberId: 'mem_02',
    memberName: 'Marta Gómez Fuenzalida',
    memberEmail: 'marta.gomez@elshaddai.org',
    memberPhone: '+56 9 9345 6789',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    role: 'food_court_manager',
    scope: 'anexo',
    scopeTargetId: 'anexo_01',
    scopeName: 'Anexo Sector San Pedro',
    status: 'active',
    assignedDate: '2026-02-01',
    assignedBy: 'Pastor David Ben-David',
    notes: 'Encargada de la cafetería filial en el Anexo San Pedro durante reuniones de jueves y domingo.',
    permissions: {
      canManageKioskMenu: true,
      canProcessKioskOrders: true,
    },
  },
  {
    id: 'asgn_celula_01',
    memberId: 'mem_03',
    memberName: 'Roberto Carrizo Silva',
    memberEmail: 'roberto.carrizo@email.com',
    memberPhone: '+56 9 7890 1234',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'celula_leader',
    scope: 'celula',
    scopeTargetId: 'cel_01',
    scopeName: 'Célula Betel - Familias en Victoria',
    status: 'active',
    assignedDate: '2026-01-20',
    assignedBy: 'Pastor David Ben-David',
    notes: 'Líder titular de la célula de familias en Pasaje Las Araucarias #452.',
    permissions: {
      canManageCellMembers: true,
      canTrackCellAttendance: true,
      canHostCellGatherings: true,
      canBroadcastPush: false,
    },
  },
  {
    id: 'asgn_celula_02',
    memberId: 'mem_04',
    memberName: 'Patricia Morales Vega',
    memberEmail: 'patricia.morales@email.com',
    memberPhone: '+56 9 6789 0123',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'celula_leader',
    scope: 'celula',
    scopeTargetId: 'cel_02',
    scopeName: 'Célula Emanuel - Jóvenes de Conquista',
    status: 'active',
    assignedDate: '2026-02-10',
    assignedBy: 'Pastor Asociado Marcos Silva',
    notes: 'Líder de la célula universitaria los días viernes.',
    permissions: {
      canManageCellMembers: true,
      canTrackCellAttendance: true,
      canHostCellGatherings: true,
    },
  },
  {
    id: 'asgn_anexo_01',
    memberId: 'mem_05',
    memberName: 'Pastor Gabriel Morales',
    memberEmail: 'gabriel.morales@elshaddai.org',
    memberPhone: '+56 9 5678 9012',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    role: 'annex_pastor_leader',
    scope: 'anexo',
    scopeTargetId: 'anexo_01',
    scopeName: 'Anexo Sector San Pedro',
    status: 'active',
    assignedDate: '2025-11-01',
    assignedBy: 'Pastor David Ben-David',
    notes: 'Pastor auxiliar y encargado pastoral en el Anexo San Pedro.',
    permissions: {
      canManageLocalEvents: true,
      canApproveLocalMembers: true,
      canPublishSermons: true,
      canBroadcastPush: true,
      canManageKioskMenu: true,
    },
  },
  {
    id: 'asgn_sede_01',
    memberId: 'mem_06',
    memberName: 'Pastor Asociado Marcos Silva',
    memberEmail: 'marcos.silva@elshaddai.org',
    memberPhone: '+56 9 4567 8901',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    role: 'sede_leader',
    scope: 'sede',
    scopeTargetId: 'sede_norte',
    scopeName: 'Sede Norte - Campus Esperanza',
    status: 'active',
    assignedDate: '2025-08-15',
    assignedBy: 'Pastor David Ben-David',
    notes: 'Encargado principal de Campus Norte, supervisión de anexos y células de la zona.',
    permissions: {
      canManageLocalEvents: true,
      canApproveLocalMembers: true,
      canPublishSermons: true,
      canBroadcastPush: true,
      canManageKioskMenu: true,
    },
  },
  {
    id: 'asgn_mem_01',
    memberId: 'mem_07',
    memberName: 'Hermana Raquel Soto',
    memberEmail: 'raquel.soto@elshaddai.org',
    memberPhone: '+56 9 3456 7890',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    role: 'membership_manager',
    scope: 'general',
    scopeTargetId: 'general',
    scopeName: 'Toda la Iglesia (General)',
    status: 'active',
    assignedDate: '2025-10-01',
    assignedBy: 'Pastor David Ben-David',
    notes: 'Secretaria general de membresía y acreditación digital móvil.',
    permissions: {
      canApproveLocalMembers: true,
    },
  },
  {
    id: 'asgn_events_01',
    memberId: 'mem_08',
    memberName: 'Hna. Sofía Valenzuela',
    memberEmail: 'sofia.valenzuela@elshaddai.org',
    memberPhone: '+56 9 2345 6789',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    role: 'event_coordinator',
    scope: 'general',
    scopeTargetId: 'general',
    scopeName: 'Toda la Iglesia (General)',
    status: 'active',
    assignedDate: '2026-01-10',
    assignedBy: 'Pastor David Ben-David',
    notes: 'Coordinación logística de congresos, conferencias y servicios especiales.',
    permissions: {
      canManageLocalEvents: true,
      canPublishSermons: true,
    },
  },
];

// Candidates pool from congregational membership that can be assigned roles
export interface CongregationalCandidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  currentRoleLabel: string;
  sedeOrAnexo: string;
}

export const CONGREGATIONAL_CANDIDATES: CongregationalCandidate[] = [
  {
    id: 'cand_01',
    name: 'Carlos Mendoza Ramos',
    email: 'carlos.mendoza@email.com',
    phone: '+56 9 8765 4321',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    currentRoleLabel: 'Miembro Activo',
    sedeOrAnexo: 'Templo Central',
  },
  {
    id: 'cand_02',
    name: 'Camila Andrea Véliz',
    email: 'camila.veliz@email.com',
    phone: '+56 9 7654 3210',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    currentRoleLabel: 'Líder Juvenil',
    sedeOrAnexo: 'Sede Norte',
  },
  {
    id: 'cand_03',
    name: 'Esteban Paredes Alarcón',
    email: 'esteban.p@email.com',
    phone: '+56 9 9988 7766',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    currentRoleLabel: 'Diácono de Mayordomía',
    sedeOrAnexo: 'Anexo San Pedro',
  },
  {
    id: 'cand_04',
    name: 'Verónica Castro Ortiz',
    email: 'veronica.castro@email.com',
    phone: '+56 9 6655 4433',
    avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    currentRoleLabel: 'Maestra Escuela Bíblica',
    sedeOrAnexo: 'Anexo Cordillera',
  },
  {
    id: 'cand_05',
    name: 'Andrés Baeza Silva',
    email: 'andres.baeza@email.com',
    phone: '+56 9 3322 1100',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    currentRoleLabel: 'Servidor Voluntario',
    sedeOrAnexo: 'Templo Central',
  },
];

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

export const securityRolesService = {
  getAssignments(): MemberRoleAssignment[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('[securityRolesService] Error loading stored assignments:', e);
    }
    return INITIAL_ASSIGNMENTS;
  },

  saveAssignments(assignments: MemberRoleAssignment[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
      notify();
    } catch (e) {
      console.error('[securityRolesService] Error saving assignments:', e);
    }
  },

  assignRole(
    input: Omit<MemberRoleAssignment, 'id' | 'assignedDate'> & { id?: string }
  ): MemberRoleAssignment {
    const assignments = this.getAssignments();
    const newAssignment: MemberRoleAssignment = {
      ...input,
      id: input.id || `asgn_${Date.now()}`,
      assignedDate: new Date().toISOString().split('T')[0],
    };

    const existingIndex = assignments.findIndex((a) => a.id === newAssignment.id);
    if (existingIndex >= 0) {
      assignments[existingIndex] = newAssignment;
    } else {
      assignments.unshift(newAssignment);
    }

    this.saveAssignments(assignments);
    return newAssignment;
  },

  updateAssignment(id: string, updates: Partial<MemberRoleAssignment>): MemberRoleAssignment | null {
    const assignments = this.getAssignments();
    const index = assignments.findIndex((a) => a.id === id);
    if (index === -1) return null;

    assignments[index] = {
      ...assignments[index],
      ...updates,
    };

    this.saveAssignments(assignments);
    return assignments[index];
  },

  toggleStatus(id: string): MemberRoleAssignment | null {
    const assignments = this.getAssignments();
    const index = assignments.findIndex((a) => a.id === id);
    if (index === -1) return null;

    const currentStatus = assignments[index].status;
    assignments[index].status = currentStatus === 'active' ? 'suspended' : 'active';

    this.saveAssignments(assignments);
    return assignments[index];
  },

  deleteAssignment(id: string): boolean {
    const assignments = this.getAssignments();
    const filtered = assignments.filter((a) => a.id !== id);
    if (filtered.length === assignments.length) return false;

    this.saveAssignments(filtered);
    return true;
  },

  getCandidates(): CongregationalCandidate[] {
    return CONGREGATIONAL_CANDIDATES;
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
