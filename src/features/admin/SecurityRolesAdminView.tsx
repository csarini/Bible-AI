import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserX,
  Users,
  Utensils,
  Home,
  Building,
  KeyRound,
  Search,
  Plus,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  CheckCircle2,
  X,
  Sparkles,
  RefreshCw,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Radio,
  Sliders,
} from 'lucide-react';
import {
  securityRolesService,
  MemberRoleAssignment,
  SecurityPermissions,
  CONGREGATIONAL_CANDIDATES,
} from '../../services/security_roles.service';
import { UserRole, ROLE_METADATA } from '../auth/types';
import { useAuth } from '../auth/context/AuthContext';
import { HierarchyScopeType } from '../../types';
import { ScopeSelector } from '../../components/ScopeSelector';
import { ScopeBadge } from '../../components/ScopeBadge';

interface SecurityRolesAdminViewProps {
  onToast?: (message: string) => void;
  currentTheme?: 'light' | 'sepia' | 'dark';
}

const ROLE_OPTIONS: {
  role: UserRole;
  title: string;
  subtitle: string;
  icon: React.FC<{ className?: string }>;
  colorClass: string;
  defaultScope: HierarchyScopeType;
}[] = [
  {
    role: 'food_court_manager',
    title: 'Encargado de Kiosko / Cafetería',
    subtitle: 'Administra menús, precios, stock y cobro de pedidos durante los cultos.',
    icon: Utensils,
    colorClass: 'text-[#F47B20] bg-[#F47B20]/10 border-[#F47B20]/30',
    defaultScope: 'sede',
  },
  {
    role: 'celula_leader',
    title: 'Encargado / Líder de Célula',
    subtitle: 'Liderazgo pastoral del grupo celular en hogar, asistencia y cuidado de miembros.',
    icon: Home,
    colorClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800',
    defaultScope: 'celula',
  },
  {
    role: 'annex_pastor_leader',
    title: 'Encargado / Pastor de Anexo',
    subtitle: 'Supervisión del anexo filial, cultos locales, kiosko filial y logística eclesial.',
    icon: Building,
    colorClass: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/30 border-sky-300 dark:border-sky-800',
    defaultScope: 'anexo',
  },
  {
    role: 'sede_leader',
    title: 'Pastor / Encargado de Sede',
    subtitle: 'Dirección pastoral de un campus zonal, templos dependientes y eventos distritales.',
    icon: ShieldCheck,
    colorClass: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800',
    defaultScope: 'sede',
  },
  {
    role: 'event_coordinator',
    title: 'Coordinador de Eventos & Cultos',
    subtitle: 'Logística de cultos especiales, conferencias, guardería y puestos de recursos.',
    icon: Calendar,
    colorClass: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 border-purple-300 dark:border-purple-800',
    defaultScope: 'general',
  },
  {
    role: 'membership_manager',
    title: 'Encargado de Membresía & Secretaría',
    subtitle: 'Revisión y aprobación de solicitudes de carnet digital móvil desde Flutter.',
    icon: Users,
    colorClass: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 border-teal-300 dark:border-teal-800',
    defaultScope: 'general',
  },
  {
    role: 'media_announcer',
    title: 'Encargado de Medios & FCM Push',
    subtitle: 'Redacción de boletines y difusión de alertas Push hacia los dispositivos móviles.',
    icon: Radio,
    colorClass: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800',
    defaultScope: 'general',
  },
  {
    role: 'church_pastor_admin',
    title: 'Pastor Principal / Admin General',
    subtitle: 'Acceso irrestricto a seguridad, jerarquía, finanzas, homilética y auditoría.',
    icon: KeyRound,
    colorClass: 'text-[#002147] dark:text-[#FED65B] bg-[#002147]/10 dark:bg-white/10 border-[#002147]/30',
    defaultScope: 'general',
  },
];

export const SecurityRolesAdminView: React.FC<SecurityRolesAdminViewProps> = ({
  onToast,
  currentTheme = 'light',
}) => {
  const { switchRole } = useAuth();
  const [assignments, setAssignments] = useState<MemberRoleAssignment[]>(() =>
    securityRolesService.getAssignments()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [scopeFilter, setScopeFilter] = useState<'all' | HierarchyScopeType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  // Modal State for Assigning / Editing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAvatar, setFormAvatar] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('food_court_manager');
  const [formScope, setFormScope] = useState<HierarchyScopeType>('sede');
  const [formScopeTargetId, setFormScopeTargetId] = useState('sede_central');
  const [formScopeName, setFormScopeName] = useState('Templo Central El-Shaddai');
  const [formNotes, setFormNotes] = useState('');
  const [formPermissions, setFormPermissions] = useState<SecurityPermissions>({
    canManageKioskMenu: true,
    canProcessKioskOrders: true,
  });

  const loadData = () => {
    setAssignments(securityRolesService.getAssignments());
  };

  useEffect(() => {
    return securityRolesService.subscribe(() => {
      loadData();
    });
  }, []);

  // Update default permissions whenever the selected role in modal changes
  const handleRoleSelection = (role: UserRole) => {
    setFormRole(role);
    const meta = ROLE_OPTIONS.find((r) => r.role === role);
    if (meta && !editingId) {
      setFormScope(meta.defaultScope);
    }

    // Set smart sensible default permissions
    switch (role) {
      case 'food_court_manager':
        setFormPermissions({
          canManageKioskMenu: true,
          canProcessKioskOrders: true,
        });
        break;
      case 'celula_leader':
        setFormPermissions({
          canManageCellMembers: true,
          canTrackCellAttendance: true,
          canHostCellGatherings: true,
        });
        break;
      case 'annex_pastor_leader':
      case 'sede_leader':
        setFormPermissions({
          canManageLocalEvents: true,
          canApproveLocalMembers: true,
          canPublishSermons: true,
          canBroadcastPush: true,
          canManageKioskMenu: true,
        });
        break;
      case 'event_coordinator':
        setFormPermissions({
          canManageLocalEvents: true,
          canPublishSermons: true,
        });
        break;
      case 'membership_manager':
        setFormPermissions({
          canApproveLocalMembers: true,
        });
        break;
      case 'media_announcer':
        setFormPermissions({
          canBroadcastPush: true,
        });
        break;
      default:
        setFormPermissions({
          canManageKioskMenu: true,
          canProcessKioskOrders: true,
          canManageCellMembers: true,
          canTrackCellAttendance: true,
          canHostCellGatherings: true,
          canManageLocalEvents: true,
          canApproveLocalMembers: true,
          canPublishSermons: true,
          canBroadcastPush: true,
        });
    }
  };

  const handleSelectCandidate = (candId: string) => {
    setSelectedCandidateId(candId);
    if (candId === 'custom') {
      setFormName('');
      setFormEmail('');
      setFormPhone('');
      setFormAvatar('');
      return;
    }
    const cand = CONGREGATIONAL_CANDIDATES.find((c) => c.id === candId);
    if (cand) {
      setFormName(cand.name);
      setFormEmail(cand.email);
      setFormPhone(cand.phone);
      setFormAvatar(cand.avatarUrl);
    }
  };

  const handleOpenCreateModal = (presetRole?: UserRole) => {
    setEditingId(null);
    setSelectedCandidateId('cand_01');
    const firstCand = CONGREGATIONAL_CANDIDATES[0];
    setFormName(firstCand.name);
    setFormEmail(firstCand.email);
    setFormPhone(firstCand.phone);
    setFormAvatar(firstCand.avatarUrl);

    const targetRole = presetRole || 'food_court_manager';
    handleRoleSelection(targetRole);

    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (assignment: MemberRoleAssignment) => {
    setEditingId(assignment.id);
    setSelectedCandidateId('custom');
    setFormName(assignment.memberName);
    setFormEmail(assignment.memberEmail);
    setFormPhone(assignment.memberPhone || '');
    setFormAvatar(assignment.avatarUrl || '');
    setFormRole(assignment.role);
    setFormScope(assignment.scope);
    setFormScopeTargetId(assignment.scopeTargetId || 'general');
    setFormScopeName(assignment.scopeName || 'Toda la Iglesia');
    setFormPermissions({ ...assignment.permissions });
    setFormNotes(assignment.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      onToast?.('Por favor ingresa el nombre y correo del miembro.');
      return;
    }

    securityRolesService.assignRole({
      id: editingId || undefined,
      memberId: editingId ? `mem_${editingId}` : `mem_${Date.now()}`,
      memberName: formName.trim(),
      memberEmail: formEmail.trim(),
      memberPhone: formPhone.trim() || undefined,
      avatarUrl:
        formAvatar.trim() ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      role: formRole,
      scope: formScope,
      scopeTargetId: formScopeTargetId,
      scopeName: formScopeName,
      status: 'active',
      assignedBy: 'Pastor David Ben-David',
      notes: formNotes.trim() || undefined,
      permissions: formPermissions,
    });

    setIsModalOpen(false);
    onToast?.(
      editingId
        ? `Rol y permisos de ${formName} actualizados exitosamente.`
        : `¡Nombramiento asignado a ${formName} con éxito!`
    );
  };

  const handleToggleStatus = (assignment: MemberRoleAssignment) => {
    const updated = securityRolesService.toggleStatus(assignment.id);
    if (updated) {
      onToast?.(
        updated.status === 'active'
          ? `Privilegios reactivados para ${updated.memberName}.`
          : `Acceso suspendido temporalmente para ${updated.memberName}.`
      );
    }
  };

  const handleDeleteAssignment = (id: string, name: string) => {
    if (confirm(`¿Revocar y retirar las credenciales de oficial para ${name}?`)) {
      securityRolesService.deleteAssignment(id);
      onToast?.(`Nombramiento revocado para ${name}.`);
    }
  };

  const handleSimulateRole = (role: UserRole, memberName: string) => {
    switchRole(role);
    onToast?.(`🔑 Sesión simulada activada como: ${memberName} (${ROLE_METADATA[role]?.label})`);
  };

  // Filtered List
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        a.memberName.toLowerCase().includes(q) ||
        a.memberEmail.toLowerCase().includes(q) ||
        a.scopeName.toLowerCase().includes(q) ||
        (a.notes && a.notes.toLowerCase().includes(q));

      const matchesRole = roleFilter === 'all' || a.role === roleFilter;
      const matchesScope = scopeFilter === 'all' || a.scope === scopeFilter;
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;

      return matchesSearch && matchesRole && matchesScope && matchesStatus;
    });
  }, [assignments, searchQuery, roleFilter, scopeFilter, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: assignments.length,
      kiosk: assignments.filter((a) => a.role === 'food_court_manager').length,
      celulas: assignments.filter((a) => a.role === 'celula_leader').length,
      anexos: assignments.filter((a) => a.role === 'annex_pastor_leader' || a.role === 'sede_leader').length,
      active: assignments.filter((a) => a.status === 'active').length,
    };
  }, [assignments]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#121318] p-6 rounded-3xl border border-[#002147]/10 dark:border-white/10 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#002147]/10 text-[#002147] dark:bg-white/10 dark:text-[#FED65B] border border-[#002147]/20 mb-2">
            <Shield className="w-3.5 h-3.5 text-[#FED65B]" />
            Control de Seguridad &bull; Matriz RBAC Eclesiástica
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold font-serif text-[#002147] dark:text-white flex items-center gap-3">
            <KeyRound className="w-7 h-7 text-[#F47B20]" />
            Seguridad & Asignación de Roles
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Otorga permisos a hermanos de la congregación para ser <strong>encargados de kiosko / cafetería</strong>,{' '}
            <strong>líderes de célula en hogares</strong>, <strong>encargados de anexos</strong>, secretaría y eventos, limitando su radio de acción según la sede o filial correspondiente.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleOpenCreateModal()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#002147] hover:bg-[#0B2B68] text-white text-xs font-bold shadow-md transition-all cursor-pointer border border-[#FED65B]/30"
          >
            <Plus className="w-4 h-4 stroke-[3] text-[#FED65B]" />
            <span>Asignar Nuevo Rol</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1A1C24] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Encargados</span>
            <Users className="w-4 h-4 text-[#002147] dark:text-[#FED65B]" />
          </div>
          <p className="text-2xl font-bold font-serif text-slate-900 dark:text-white">
            {stats.total}
          </p>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            {stats.active} activos actualmente
          </div>
        </div>

        <div
          onClick={() => setRoleFilter(roleFilter === 'food_court_manager' ? 'all' : 'food_court_manager')}
          className={`p-4 rounded-2xl border shadow-xs space-y-1 cursor-pointer transition-all ${
            roleFilter === 'food_court_manager'
              ? 'bg-[#F47B20]/10 border-[#F47B20]'
              : 'bg-white dark:bg-[#1A1C24] border-slate-200 dark:border-slate-800 hover:border-[#F47B20]/50'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Encargados Kiosko</span>
            <Utensils className="w-4 h-4 text-[#F47B20]" />
          </div>
          <p className="text-2xl font-bold font-serif text-[#F47B20]">{stats.kiosk}</p>
          <div className="text-[11px] text-slate-500">Cafeterías & Ventas</div>
        </div>

        <div
          onClick={() => setRoleFilter(roleFilter === 'celula_leader' ? 'all' : 'celula_leader')}
          className={`p-4 rounded-2xl border shadow-xs space-y-1 cursor-pointer transition-all ${
            roleFilter === 'celula_leader'
              ? 'bg-emerald-500/10 border-emerald-500'
              : 'bg-white dark:bg-[#1A1C24] border-slate-200 dark:border-slate-800 hover:border-emerald-500/50'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Líderes de Célula</span>
            <Home className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold font-serif text-emerald-600 dark:text-emerald-400">
            {stats.celulas}
          </p>
          <div className="text-[11px] text-slate-500">Grupos en Hogares</div>
        </div>

        <div
          onClick={() => setRoleFilter(roleFilter === 'annex_pastor_leader' ? 'all' : 'annex_pastor_leader')}
          className={`p-4 rounded-2xl border shadow-xs space-y-1 cursor-pointer transition-all ${
            roleFilter === 'annex_pastor_leader'
              ? 'bg-sky-500/10 border-sky-500'
              : 'bg-white dark:bg-[#1A1C24] border-slate-200 dark:border-slate-800 hover:border-sky-500/50'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Pastores & Anexos</span>
            <Building className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-bold font-serif text-sky-600 dark:text-sky-400">
            {stats.anexos}
          </p>
          <div className="text-[11px] text-slate-500">Sedes y Filiales</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#1A1C24] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, email o ámbito asignado..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#002147] text-slate-800 dark:text-slate-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#002147] cursor-pointer"
          >
            <option value="all">👑 Todos los Roles ({assignments.length})</option>
            <option value="food_court_manager">🍔 Encargados de Kiosko</option>
            <option value="celula_leader">🏠 Líderes de Célula</option>
            <option value="annex_pastor_leader">⛪ Encargados de Anexo</option>
            <option value="sede_leader">🏛️ Encargados de Sede</option>
            <option value="event_coordinator">📅 Coordinadores de Eventos</option>
            <option value="membership_manager">👥 Encargados de Membresía</option>
            <option value="media_announcer">📢 Encargados de Medios</option>
            <option value="church_pastor_admin">👑 Pastores Principales</option>
          </select>

          {/* Scope Filter */}
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

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#002147] cursor-pointer"
          >
            <option value="all">Estado: Todos</option>
            <option value="active">Activos</option>
            <option value="suspended">Suspendidos</option>
          </select>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-3">
        {filteredAssignments.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#1A1C24] rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8">
            <ShieldAlert className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
              No se encontraron encargados con los filtros actuales
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Comienza asignando a un hermano como encargado de kiosko o líder celular para delegar responsabilidades en el ministerio.
            </p>
            <button
              onClick={() => handleOpenCreateModal()}
              className="px-4 py-2 rounded-xl bg-[#002147] text-white text-xs font-bold hover:bg-[#0B2B68] transition-all cursor-pointer"
            >
              + Asignar Primer Rol
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAssignments.map((assignment) => {
              const roleMeta = ROLE_METADATA[assignment.role] || {
                label: assignment.role,
                badgeColor: 'bg-slate-700 text-white',
              };
              const roleOption = ROLE_OPTIONS.find((r) => r.role === assignment.role);
              const RoleIcon = roleOption?.icon || Shield;
              const isSuspended = assignment.status === 'suspended';

              return (
                <div
                  key={assignment.id}
                  className={`bg-white dark:bg-[#1A1C24] rounded-2xl border p-5 transition-all shadow-xs hover:shadow-md flex flex-col justify-between ${
                    isSuspended
                      ? 'border-rose-200 dark:border-rose-900/40 opacity-75'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="space-y-3.5">
                    {/* Top Row: Role Badge + Scope Badge + Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${roleMeta.badgeColor}`}
                        >
                          <RoleIcon className="w-3.5 h-3.5" />
                          {roleMeta.label}
                        </span>
                        <ScopeBadge
                          scope={assignment.scope}
                          scopeName={assignment.scopeName}
                          size="xs"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        {isSuspended ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200">
                            <Lock className="w-3 h-3" /> Suspendido
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Activo
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Member Info */}
                    <div className="flex items-start gap-3">
                      <img
                        src={assignment.avatarUrl}
                        alt={assignment.memberName}
                        className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="space-y-1 flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {assignment.memberName}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1 truncate">
                            <Mail className="w-3 h-3" />
                            {assignment.memberEmail}
                          </span>
                          {assignment.memberPhone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {assignment.memberPhone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Notes if any */}
                    {assignment.notes && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        "{assignment.notes}"
                      </p>
                    )}

                    {/* Permissions Granted Pills */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Privilegios de Nombramiento:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {assignment.permissions.canManageKioskMenu && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-[#F47B20] border border-amber-200 dark:border-amber-800">
                            🍔 Menú Kiosko
                          </span>
                        )}
                        {assignment.permissions.canProcessKioskOrders && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-[#F47B20] border border-amber-200 dark:border-amber-800">
                            💳 Cobro & Despacho
                          </span>
                        )}
                        {assignment.permissions.canManageCellMembers && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            🏠 Miembros Célula
                          </span>
                        )}
                        {assignment.permissions.canTrackCellAttendance && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            📋 Asistencia Hogar
                          </span>
                        )}
                        {assignment.permissions.canHostCellGatherings && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            📅 Reunión Celular
                          </span>
                        )}
                        {assignment.permissions.canManageLocalEvents && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                            ⛪ Eventos Locales
                          </span>
                        )}
                        {assignment.permissions.canApproveLocalMembers && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                            👥 Aprobación Fichas
                          </span>
                        )}
                        {assignment.permissions.canPublishSermons && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            📖 Prédicas & Púlpito
                          </span>
                        )}
                        {assignment.permissions.canBroadcastPush && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            📢 Difusión Push
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => handleSimulateRole(assignment.role, assignment.memberName)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#002147] hover:text-white dark:hover:bg-[#FED65B] dark:hover:text-[#002147] text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
                      title="Probar app con la vista y permisos de este encargado"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Simular Rol</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleStatus(assignment)}
                        className={`p-2 rounded-xl transition-all cursor-pointer ${
                          isSuspended
                            ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                            : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                        }`}
                        title={isSuspended ? 'Reactivar credencial' : 'Suspender credencial temporalmente'}
                      >
                        {isSuspended ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(assignment)}
                        className="p-2 rounded-xl text-slate-500 hover:text-[#002147] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                        title="Editar rol o permisos"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() =>
                          handleDeleteAssignment(assignment.id, assignment.memberName)
                        }
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                        title="Revocar nombramiento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal for Assigning / Editing Role */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#1A1C24] w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#002147] text-white flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#FED65B]" />
                <h3 className="font-serif font-bold text-base sm:text-lg">
                  {editingId ? 'Editar Nombramiento Eclesiástico' : 'Asignar Nuevo Rol / Encargado'}
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
            <form onSubmit={handleSaveAssignment} className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
              {/* Candidate Picker */}
              {!editingId && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>1. Seleccionar Hermano(a) de la Congregación:</span>
                    <span className="text-[11px] font-normal text-slate-400">Padrón de Membresía</span>
                  </label>
                  <select
                    value={selectedCandidateId}
                    onChange={(e) => handleSelectCandidate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#181A22] text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#002147]"
                  >
                    {CONGREGATIONAL_CANDIDATES.map((cand) => (
                      <option key={cand.id} value={cand.id}>
                        {cand.name} &bull; {cand.currentRoleLabel} ({cand.sedeOrAnexo})
                      </option>
                    ))}
                    <option value="custom">✏️ Ingresar datos de otro hermano manualmente...</option>
                  </select>
                </div>
              )}

              {/* Member Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    Nombre Completo del Hermano *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ej. Daniel Peña Morales"
                    className="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1A1C24] text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="daniel.pena@elshaddai.org"
                    className="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1A1C24] text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    Teléfono Móvil
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+56 9 8234 5678"
                    className="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1A1C24] text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                  2. Cargo / Rol a Otorgar:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {ROLE_OPTIONS.map((opt) => {
                    const isSelected = formRole === opt.role;
                    const Icon = opt.icon;
                    return (
                      <div
                        key={opt.role}
                        onClick={() => handleRoleSelection(opt.role)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#002147]/5 border-[#002147] dark:bg-white/10 dark:border-[#FED65B] shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-[#1A1C24]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg border ${opt.colorClass}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                              {opt.title}
                            </div>
                            <div className="text-[10px] text-slate-400 line-clamp-1">
                              {opt.subtitle}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Hierarchy Scope Assignment (ScopeSelector) */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                  3. Ámbito de Jurisdicción (Sede, Anexo o Célula Específica):
                </label>
                <p className="text-[11px] text-slate-500 italic">
                  Especifica a qué campus o grupo celular reporta este encargado. Por ejemplo, un <strong>Encargado de Kiosko</strong> puede asignarse al "Templo Central" o al "Anexo San Pedro", y un <strong>Líder de Célula</strong> a su célula correspondiente.
                </p>
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

              {/* Granular Permission Toggles */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>4. Privilegios Operativos Granulares:</span>
                  <span className="text-[11px] font-normal text-slate-400">Ajuste fino</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                  {/* Kiosk Menu */}
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={!!formPermissions.canManageKioskMenu}
                      onChange={(e) =>
                        setFormPermissions((prev) => ({
                          ...prev,
                          canManageKioskMenu: e.target.checked,
                        }))
                      }
                      className="rounded border-slate-300 text-[#002147] focus:ring-[#002147]"
                    />
                    <span>🍔 Modificar Menú & Precios de Kiosko</span>
                  </label>

                  {/* Kiosk Orders */}
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={!!formPermissions.canProcessKioskOrders}
                      onChange={(e) =>
                        setFormPermissions((prev) => ({
                          ...prev,
                          canProcessKioskOrders: e.target.checked,
                        }))
                      }
                      className="rounded border-slate-300 text-[#002147] focus:ring-[#002147]"
                    />
                    <span>💳 Cobrar & Entregar Pedidos de Cafetería</span>
                  </label>

                  {/* Cell Attendance */}
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={!!formPermissions.canTrackCellAttendance}
                      onChange={(e) =>
                        setFormPermissions((prev) => ({
                          ...prev,
                          canTrackCellAttendance: e.target.checked,
                        }))
                      }
                      className="rounded border-slate-300 text-[#002147] focus:ring-[#002147]"
                    />
                    <span>📋 Tomar Asistencia en Grupo Celular</span>
                  </label>

                  {/* Cell Members */}
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={!!formPermissions.canManageCellMembers}
                      onChange={(e) =>
                        setFormPermissions((prev) => ({
                          ...prev,
                          canManageCellMembers: e.target.checked,
                        }))
                      }
                      className="rounded border-slate-300 text-[#002147] focus:ring-[#002147]"
                    />
                    <span>🏠 Inscribir Nuevos Integrantes a la Célula</span>
                  </label>

                  {/* Local Events */}
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={!!formPermissions.canManageLocalEvents}
                      onChange={(e) =>
                        setFormPermissions((prev) => ({
                          ...prev,
                          canManageLocalEvents: e.target.checked,
                        }))
                      }
                      className="rounded border-slate-300 text-[#002147] focus:ring-[#002147]"
                    />
                    <span>⛪ Publicar Cultos & Eventos Locales</span>
                  </label>

                  {/* Push Broadcast */}
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={!!formPermissions.canBroadcastPush}
                      onChange={(e) =>
                        setFormPermissions((prev) => ({
                          ...prev,
                          canBroadcastPush: e.target.checked,
                        }))
                      }
                      className="rounded border-slate-300 text-[#002147] focus:ring-[#002147]"
                    />
                    <span>📢 Enviar Notificaciones Push FCM</span>
                  </label>
                </div>
              </div>

              {/* Pastoral Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                  5. Notas Pastorales de Ordenación / Designación:
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Ej. Nombramiento ratificado por el presbiterio ministerial para el periodo actual..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#181A22] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#002147]"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#002147] text-white text-xs font-bold hover:bg-[#0B2B68] transition-all cursor-pointer shadow-md"
                >
                  {editingId ? 'Guardar Cambios' : 'Confirmar Nombramiento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
