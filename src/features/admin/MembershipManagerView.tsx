import React, { useState, useEffect, useTransition } from 'react';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Smartphone,
  Shield,
  Send,
  UserCheck,
  ChevronDown,
  RefreshCw,
  Info,
  Calendar,
  Phone,
  Mail,
  Building,
} from 'lucide-react';
import { membershipService } from '../../services/membership.service';
import { ChurchJoinRequest } from '../../types';
import { UserRole, ROLE_METADATA } from '../auth/types';
import { useAuth } from '../auth/context/AuthContext';

interface MembershipManagerViewProps {
  onToast?: (message: string) => void;
  currentTheme?: 'light' | 'sepia' | 'dark';
}

export const MembershipManagerView: React.FC<MembershipManagerViewProps> = ({
  onToast,
  currentTheme = 'light',
}) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ChurchJoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<ChurchJoinRequest | null>(null);

  // Approval modal state
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [targetRoleToAssign, setTargetRoleToAssign] = useState<UserRole>('member');

  // Reject modal state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Mobile simulation state
  const [isSimulatingMobile, startSimulationTransition] = useTransition();

  const isDark = currentTheme === 'dark';
  const isSepia = currentTheme === 'sepia';

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await membershipService.getRequests({
        status: statusFilter,
        search: searchQuery,
      });
      setRequests(data);
    } catch (err: any) {
      onToast?.('Error al cargar solicitudes de membresía');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [statusFilter, searchQuery]);

  const handleApprove = async () => {
    if (!selectedRequest) return;
    try {
      await membershipService.approveRequest(
        selectedRequest.id,
        targetRoleToAssign,
        user?.fullName || 'Pastor David'
      );
      onToast?.(`Solicitud de ${selectedRequest.fullName} aprobada como "${ROLE_METADATA[targetRoleToAssign]?.shortLabel || targetRoleToAssign}"`);
      setIsApproveModalOpen(false);
      setSelectedRequest(null);
      loadRequests();
    } catch (err: any) {
      onToast?.(`Error al aprobar solicitud: ${err.message}`);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    try {
      await membershipService.rejectRequest(
        selectedRequest.id,
        rejectReason || 'No cumple los requisitos de la sede.',
        user?.fullName || 'Pastor David'
      );
      onToast?.(`Solicitud de ${selectedRequest.fullName} rechazada`);
      setIsRejectModalOpen(false);
      setSelectedRequest(null);
      loadRequests();
    } catch (err: any) {
      onToast?.(`Error al rechazar solicitud: ${err.message}`);
    }
  };

  // Simulates a new member submitting a join request from the Flutter mobile app
  const handleSimulateMobileJoin = () => {
    startSimulationTransition(async () => {
      const sampleNames = ['Matías Silva', 'Francisca Araya', 'Esteban Osorio', 'Constanza Morales'];
      const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
      const randomNum = Math.floor(100 + Math.random() * 900);

      try {
        await membershipService.submitJoinRequest({
          churchId: user?.churchId || 'church_elshaddai_central',
          churchName: user?.churchName || 'Iglesia El-Shaddai Central',
          annexId: 'annex_norte',
          annexName: 'Anexo Sector Norte',
          fullName: `${randomName} (${randomNum})`,
          email: `${randomName.toLowerCase().replace(' ', '.')}${randomNum}@correo.com`,
          phone: `+56 9 ${Math.floor(60000000 + Math.random() * 39999999)}`,
          requestedRole: 'member',
          notes: 'Enviado desde Flutter Mobile App (Android/iOS) tras escanear el código QR del templo.',
        });
        onToast?.(`Nueva solicitud de ${randomName} recibida desde la app móvil`);
        setStatusFilter('pending');
        loadRequests();
      } catch (err: any) {
        onToast?.('Error al simular solicitud móvil');
      }
    });
  };

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const approvedCount = requests.filter((r) => r.status === 'approved').length;
  const rejectedCount = requests.filter((r) => r.status === 'rejected').length;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#121318] p-6 rounded-3xl border border-[#002147]/10 dark:border-white/10 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#059669]/10 text-[#059669] dark:text-[#34D399] border border-[#059669]/20 mb-2">
            <Smartphone className="w-3.5 h-3.5" />
            Integración Sincronizada Flutter &bull; POST /api/v1/churches/join
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold font-serif text-[#002147] dark:text-white flex items-center gap-3">
            <Users className="w-7 h-7 text-[#059669]" />
            Gestor de Membresías & Admisión
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Procesa, aprueba y asigna roles eclesiásticos a las solicitudes enviadas por usuarios de la aplicación móvil.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={loadRequests}
            className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            title="Recargar solicitudes"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleSimulateMobileJoin}
            disabled={isSimulatingMobile}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#002147] hover:bg-[#0B2B68] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer border border-[#D4AF37]/40"
          >
            <Smartphone className="w-4 h-4 text-[#FED65B]" />
            <span>{isSimulatingMobile ? 'Simulando...' : '+ Simular Solicitud Flutter'}</span>
          </button>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setStatusFilter('pending')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
            statusFilter === 'pending'
              ? 'bg-[#F47B20]/10 border-[#F47B20] text-[#F47B20] shadow-sm'
              : 'bg-white dark:bg-[#121318] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <div>
            <span className="text-xs uppercase font-bold tracking-wider opacity-75">Pendientes de Revisión</span>
            <div className="text-2xl font-bold mt-1">{pendingCount}</div>
          </div>
          <Clock className="w-6 h-6 opacity-70" />
        </button>

        <button
          onClick={() => setStatusFilter('approved')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
            statusFilter === 'approved'
              ? 'bg-[#059669]/10 border-[#059669] text-[#059669] shadow-sm'
              : 'bg-white dark:bg-[#121318] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <div>
            <span className="text-xs uppercase font-bold tracking-wider opacity-75">Aprobados & Activos</span>
            <div className="text-2xl font-bold mt-1">{approvedCount}</div>
          </div>
          <CheckCircle2 className="w-6 h-6 opacity-70" />
        </button>

        <button
          onClick={() => setStatusFilter('rejected')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
            statusFilter === 'rejected'
              ? 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400 shadow-sm'
              : 'bg-white dark:bg-[#121318] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <div>
            <span className="text-xs uppercase font-bold tracking-wider opacity-75">Rechazados / Archivados</span>
            <div className="text-2xl font-bold mt-1">{rejectedCount}</div>
          </div>
          <XCircle className="w-6 h-6 opacity-70" />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-[#121318] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o anexo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-[#1A1C24] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-[#002147] dark:focus:border-[#FED65B] text-slate-800 dark:text-slate-200"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 font-semibold">Filtrar:</span>
          {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#002147] text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? 'Todos' : st === 'pending' ? 'Pendientes' : st === 'approved' ? 'Aprobados' : 'Rechazados'}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#059669]" />
          <p className="text-sm">Cargando solicitudes de membresía...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white dark:bg-[#121318] p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-[#002147] dark:text-white">Sin solicitudes en esta vista</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No hay solicitudes que coincidan con los filtros actuales. Puedes simular el ingreso de un nuevo miembro con el botón superior.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.map((req) => {
            const isPending = req.status === 'pending';
            const isApproved = req.status === 'approved';

            return (
              <div
                key={req.id}
                className="bg-white dark:bg-[#121318] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Status & Date */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        isPending
                          ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-300'
                          : isApproved
                          ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-400 border border-rose-300'
                      }`}
                    >
                      {isPending && <Clock className="w-3 h-3" />}
                      {isApproved && <CheckCircle2 className="w-3 h-3" />}
                      {!isPending && !isApproved && <XCircle className="w-3 h-3" />}
                      {req.status}
                    </span>

                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(req.createdAt).toLocaleDateString('es-CL')}
                    </span>
                  </div>

                  {/* Name and Church/Annex */}
                  <div>
                    <h3 className="text-base font-bold text-[#002147] dark:text-white">
                      {req.fullName}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <Building className="w-3.5 h-3.5 text-[#F47B20]" />
                      <span>{req.annexName || req.churchName}</span>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-[#181A22] p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{req.email}</span>
                    </div>
                    {req.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{req.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Notes / Comments */}
                  {req.notes && (
                    <p className="text-xs text-slate-500 italic bg-amber-50/50 dark:bg-amber-950/20 p-2.5 rounded-lg border border-amber-200/50 line-clamp-2">
                      "{req.notes}"
                    </p>
                  )}

                  {/* Requested vs Assigned Role */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-400">Rol Solicitado:</span>
                    <span className="font-semibold text-[#002147] dark:text-[#FED65B]">
                      {ROLE_METADATA[req.requestedRole]?.shortLabel || req.requestedRole}
                    </span>
                  </div>

                  {req.assignedRole && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Rol Asignado:</span>
                      <span className="px-2 py-0.5 rounded-md font-bold text-[11px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {ROLE_METADATA[req.assignedRole]?.shortLabel || req.assignedRole}
                      </span>
                    </div>
                  )}

                  {req.reviewedBy && (
                    <p className="text-[11px] text-slate-400">
                      Revisado por: <strong className="text-slate-600 dark:text-slate-300">{req.reviewedBy}</strong>
                    </p>
                  )}
                </div>

                {/* Card Action Buttons */}
                {isPending ? (
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setSelectedRequest(req);
                        setTargetRoleToAssign(req.requestedRole || 'member');
                        setIsApproveModalOpen(true);
                      }}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Aprobar</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedRequest(req);
                        setIsRejectModalOpen(true);
                      }}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-xs font-bold transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Rechazar</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-right">
                    <span className="text-[11px] text-slate-400">Procesado</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Approve Request and Assign Role */}
      {isApproveModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1C24] max-w-md w-full rounded-3xl p-6 shadow-2xl border border-[#002147]/20 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-[#059669]">
              <UserCheck className="w-6 h-6" />
              <h3 className="text-lg font-bold font-serif text-[#002147] dark:text-white">
                Aprobar Admisión de Miembro
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Estás a punto de confirmar a{' '}
              <strong className="text-[#002147] dark:text-white">{selectedRequest.fullName}</strong> en{' '}
              <strong>{selectedRequest.annexName || selectedRequest.churchName}</strong>.
            </p>

            <div className="space-y-2 text-left">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Asignar Rol Eclesiástico Oficial:
              </label>
              <select
                value={targetRoleToAssign}
                onChange={(e) => setTargetRoleToAssign(e.target.value as UserRole)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#059669]"
              >
                {(Object.keys(ROLE_METADATA) as UserRole[]).map((r) => (
                  <option key={r} value={r}>
                    {ROLE_METADATA[r]?.label} ({ROLE_METADATA[r]?.shortLabel})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 italic">
                {ROLE_METADATA[targetRoleToAssign]?.description}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsApproveModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleApprove}
                className="px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Confirmar Aprobación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Reject Request */}
      {isRejectModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1C24] max-w-md w-full rounded-3xl p-6 shadow-2xl border border-rose-500/20 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <XCircle className="w-6 h-6" />
              <h3 className="text-lg font-bold font-serif text-[#002147] dark:text-white">
                Rechazar Solicitud de Membresía
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Indica el motivo de rechazo o nota interna para la solicitud de{' '}
              <strong>{selectedRequest.fullName}</strong>.
            </p>

            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Motivo / Justificación:
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ej. Datos de contacto no corresponden, pertenece a otra jurisdicción, etc."
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
              >
                Volver
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
