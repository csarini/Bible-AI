export type UserRole =
  | 'church_pastor_admin'
  | 'sede_leader'
  | 'annex_pastor_leader'
  | 'celula_leader'
  | 'membership_manager'
  | 'food_court_manager'
  | 'event_coordinator'
  | 'media_announcer'
  | 'member';

export type AdminModule =
  | 'security'
  | 'memberships'
  | 'food_court'
  | 'events'
  | 'sermons'
  | 'announcements'
  | 'pulpit_mode'
  | 'church_hierarchy';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  churchId: string;
  churchName: string;
  annexId?: string;
  annexName?: string;
  avatarUrl?: string;
  phone?: string;
}

export interface RoleMetadata {
  id: UserRole;
  label: string;
  shortLabel: string;
  description: string;
  badgeColor: string;
  allowedModules: AdminModule[];
}

export const ROLE_METADATA: Record<UserRole, RoleMetadata> = {
  church_pastor_admin: {
    id: 'church_pastor_admin',
    label: 'Pastor Principal (Admin General)',
    shortLabel: 'Pastor Admin',
    description: 'Acceso total a seguridad, roles, jerarquía eclesiástica, púlpito, sermones, membresías, eventos, kiosko y avisos.',
    badgeColor: 'bg-[#002147] text-white border-[#D4AF37]/50',
    allowedModules: ['security', 'church_hierarchy', 'pulpit_mode', 'sermons', 'events', 'announcements', 'memberships', 'food_court'],
  },
  sede_leader: {
    id: 'sede_leader',
    label: 'Pastor / Encargado de Sede',
    shortLabel: 'Encargado Sede',
    description: 'Liderazgo sobre la sede o templo local: eventos, cultos, anexos dependientes, kiosko y membresías locales.',
    badgeColor: 'bg-[#1E293B] text-white border-[#94A3B8]/40',
    allowedModules: ['church_hierarchy', 'pulpit_mode', 'sermons', 'events', 'announcements', 'memberships', 'food_court'],
  },
  annex_pastor_leader: {
    id: 'annex_pastor_leader',
    label: 'Encargado / Pastor de Anexo',
    shortLabel: 'Encargado Anexo',
    description: 'Liderazgo eclesiástico sobre el anexo asignado, cultos locales, eventos, kiosko y atención pastoral.',
    badgeColor: 'bg-[#0B2B68] text-white border-[#38BDF8]/40',
    allowedModules: ['church_hierarchy', 'pulpit_mode', 'sermons', 'events', 'announcements', 'memberships', 'food_court'],
  },
  celula_leader: {
    id: 'celula_leader',
    label: 'Encargado / Líder de Célula',
    shortLabel: 'Líder Célula',
    description: 'Liderazgo pastoral del grupo celular en hogar: asistencia, reuniones de célula, sermones y avisos.',
    badgeColor: 'bg-[#047857] text-white border-[#34D399]/40',
    allowedModules: ['church_hierarchy', 'events', 'sermons', 'announcements'],
  },
  membership_manager: {
    id: 'membership_manager',
    label: 'Encargado de Membresía & Secretaría',
    shortLabel: 'Membresías',
    description: 'Gestión y aprobación de solicitudes de ingreso desde la app móvil Flutter.',
    badgeColor: 'bg-[#059669] text-white border-[#34D399]/40',
    allowedModules: ['memberships'],
  },
  food_court_manager: {
    id: 'food_court_manager',
    label: 'Encargado de Kiosko / Cafetería',
    shortLabel: 'Encargado Kiosko',
    description: 'Configuración del kiosko/cafetería: menús Día/Noche, precios, disponibilidad en vivo y atención de pedidos.',
    badgeColor: 'bg-[#F47B20] text-white border-[#FED65B]/50',
    allowedModules: ['food_court'],
  },
  event_coordinator: {
    id: 'event_coordinator',
    label: 'Coordinador de Eventos & Logística',
    shortLabel: 'Coordinador Eventos',
    description: 'Creación de eventos eclesiásticos y control de servicios (Comida, Cuidado Infantil, Libros).',
    badgeColor: 'bg-[#7C3AED] text-white border-[#A78BFA]/40',
    allowedModules: ['events', 'sermons'],
  },
  media_announcer: {
    id: 'media_announcer',
    label: 'Locutor / Medios & Notificaciones',
    shortLabel: 'Medios & FCM',
    description: 'Redacción de boletines y envío de notificaciones push FCM por iglesia o anexo.',
    badgeColor: 'bg-[#0284C7] text-white border-[#38BDF8]/40',
    allowedModules: ['announcements'],
  },
  member: {
    id: 'member',
    label: 'Miembro de Iglesia',
    shortLabel: 'Miembro',
    description: 'Acceso devocional de usuario regular.',
    badgeColor: 'bg-slate-700 text-slate-100 border-slate-600',
    allowedModules: [],
  },
};
