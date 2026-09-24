import React, { useState, useEffect, useMemo } from 'react';
import {
  Building,
  Landmark,
  Home,
  Users,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  Globe,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  Download,
  RotateCcw,
  Sparkles,
  X,
  Save,
  Check,
  Shield,
  Layers,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import {
  ChurchOrganizationConfig,
  ChurchSede,
  ChurchAnexo,
  ChurchCelula,
} from '../../types';
import { churchHierarchyService } from '../../services/church_hierarchy.service';

interface ChurchHierarchyAdminViewProps {
  onToast?: (message: string) => void;
  currentTheme?: 'light' | 'sepia' | 'dark';
}

type HierarchyTab = 'organization' | 'sedes' | 'anexos' | 'celulas';

export const ChurchHierarchyAdminView: React.FC<ChurchHierarchyAdminViewProps> = ({
  onToast,
  currentTheme = 'light',
}) => {
  const [activeTab, setActiveTab] = useState<HierarchyTab>('organization');
  const [organization, setOrganization] = useState<ChurchOrganizationConfig>(() =>
    churchHierarchyService.getOrganization()
  );
  const [sedes, setSedes] = useState<ChurchSede[]>(() => churchHierarchyService.getSedes());
  const [anexos, setAnexos] = useState<ChurchAnexo[]>(() => churchHierarchyService.getAnexos());
  const [celulas, setCelulas] = useState<ChurchCelula[]>(() => churchHierarchyService.getCelulas());

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSedeFilter, setSelectedSedeFilter] = useState('all');
  const [selectedAudienceFilter, setSelectedAudienceFilter] = useState('all');

  // Modals state
  const [sedeModalOpen, setSedeModalOpen] = useState(false);
  const [editingSede, setEditingSede] = useState<ChurchSede | null>(null);
  const [sedeForm, setSedeForm] = useState<Omit<ChurchSede, 'id'>>({
    name: '',
    city: '',
    address: '',
    pastorInCharge: '',
    phone: '',
    isMainCampus: false,
    activeMembersCount: 150,
    notes: '',
  });

  const [anexoModalOpen, setAnexoModalOpen] = useState(false);
  const [editingAnexo, setEditingAnexo] = useState<ChurchAnexo | null>(null);
  const [anexoForm, setAnexoForm] = useState<Omit<ChurchAnexo, 'id'>>({
    sedeId: '',
    name: '',
    address: '',
    leaderInCharge: '',
    phone: '',
    meetingDays: 'Jueves 19:30 & Domingos 10:00',
    activeMembersCount: 60,
  });

  const [celulaModalOpen, setCelulaModalOpen] = useState(false);
  const [editingCelula, setEditingCelula] = useState<ChurchCelula | null>(null);
  const [celulaForm, setCelulaForm] = useState<Omit<ChurchCelula, 'id'>>({
    sedeId: '',
    anexoId: '',
    code: '',
    name: '',
    leaderName: '',
    hostName: '',
    address: '',
    neighborhood: '',
    dayOfWeek: 'Miércoles',
    meetingTime: '19:30',
    membersCount: 12,
    targetAudience: 'Familias',
    status: 'active',
  });

  // Org form state
  const [orgForm, setOrgForm] = useState<ChurchOrganizationConfig>(organization);
  const [isOrgSaved, setIsOrgSaved] = useState(false);

  // Sync when data updates
  const refreshData = () => {
    setOrganization(churchHierarchyService.getOrganization());
    setSedes(churchHierarchyService.getSedes());
    setAnexos(churchHierarchyService.getAnexos());
    setCelulas(churchHierarchyService.getCelulas());
  };

  useEffect(() => {
    return churchHierarchyService.subscribe(refreshData);
  }, []);

  // Stats calculation
  const totalEstimatedMembers = useMemo(() => {
    const sedeTotal = sedes.reduce((acc, s) => acc + (s.activeMembersCount || 0), 0);
    return sedeTotal;
  }, [sedes]);

  const totalCelulaMembers = useMemo(() => {
    return celulas.reduce((acc, c) => acc + (c.membersCount || 0), 0);
  }, [celulas]);

  // --- Handlers for Organization ---
  const handleSaveOrganization = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = churchHierarchyService.updateOrganization(orgForm);
    setOrganization(updated);
    setIsOrgSaved(true);
    setTimeout(() => setIsOrgSaved(false), 2500);
    onToast?.('⛪ Datos de la Iglesia Principal actualizados exitosamente');
  };

  // --- Handlers for Sedes ---
  const handleOpenSedeModal = (sede?: ChurchSede) => {
    if (sede) {
      setEditingSede(sede);
      setSedeForm({
        name: sede.name,
        city: sede.city,
        address: sede.address,
        pastorInCharge: sede.pastorInCharge,
        phone: sede.phone || '',
        isMainCampus: sede.isMainCampus,
        activeMembersCount: sede.activeMembersCount || 100,
        notes: sede.notes || '',
      });
    } else {
      setEditingSede(null);
      setSedeForm({
        name: '',
        city: '',
        address: '',
        pastorInCharge: '',
        phone: '',
        isMainCampus: false,
        activeMembersCount: 120,
        notes: '',
      });
    }
    setSedeModalOpen(true);
  };

  const handleSaveSede = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sedeForm.name.trim() || !sedeForm.address.trim()) {
      onToast?.('Por favor ingresa nombre y dirección de la sede');
      return;
    }

    if (editingSede) {
      churchHierarchyService.updateSede({ ...sedeForm, id: editingSede.id });
      onToast?.(`🏛️ Sede "${sedeForm.name}" actualizada con éxito`);
    } else {
      churchHierarchyService.addSede(sedeForm);
      onToast?.(`🏛️ Nueva sede "${sedeForm.name}" creada con éxito`);
    }
    setSedeModalOpen(false);
  };

  const handleDeleteSede = (sede: ChurchSede) => {
    if (sede.isMainCampus) {
      onToast?.('No puedes eliminar el Templo Principal matriz.');
      return;
    }
    if (confirm(`¿Eliminar la sede "${sede.name}"? Los anexos y células asociadas deberán reasignarse.`)) {
      churchHierarchyService.deleteSede(sede.id);
      onToast?.(`Sede "${sede.name}" eliminada.`);
    }
  };

  // --- Handlers for Anexos ---
  const handleOpenAnexoModal = (anexo?: ChurchAnexo) => {
    if (anexo) {
      setEditingAnexo(anexo);
      setAnexoForm({
        sedeId: anexo.sedeId,
        name: anexo.name,
        address: anexo.address,
        leaderInCharge: anexo.leaderInCharge,
        phone: anexo.phone || '',
        meetingDays: anexo.meetingDays || 'Jueves 19:30 & Domingos 10:00',
        activeMembersCount: anexo.activeMembersCount || 50,
      });
    } else {
      setEditingAnexo(null);
      setAnexoForm({
        sedeId: sedes[0]?.id || 'sede_central',
        name: '',
        address: '',
        leaderInCharge: '',
        phone: '',
        meetingDays: 'Jueves 19:30 & Domingos 10:00',
        activeMembersCount: 50,
      });
    }
    setAnexoModalOpen(true);
  };

  const handleSaveAnexo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!anexoForm.name.trim() || !anexoForm.address.trim()) {
      onToast?.('Por favor completa el nombre y dirección del anexo');
      return;
    }

    const selectedSede = sedes.find((s) => s.id === anexoForm.sedeId) || sedes[0];

    if (editingAnexo) {
      churchHierarchyService.updateAnexo({
        ...anexoForm,
        id: editingAnexo.id,
        sedeName: selectedSede?.name,
      });
      onToast?.(`⛪ Anexo "${anexoForm.name}" actualizado.`);
    } else {
      churchHierarchyService.addAnexo({
        ...anexoForm,
        sedeName: selectedSede?.name,
      });
      onToast?.(`⛪ Anexo "${anexoForm.name}" agregado con éxito.`);
    }
    setAnexoModalOpen(false);
  };

  const handleDeleteAnexo = (anexo: ChurchAnexo) => {
    if (confirm(`¿Eliminar el anexo filial "${anexo.name}"?`)) {
      churchHierarchyService.deleteAnexo(anexo.id);
      onToast?.(`Anexo "${anexo.name}" eliminado.`);
    }
  };

  // --- Handlers for Células ---
  const handleOpenCelulaModal = (celula?: ChurchCelula) => {
    if (celula) {
      setEditingCelula(celula);
      setCelulaForm({
        sedeId: celula.sedeId,
        anexoId: celula.anexoId || '',
        code: celula.code,
        name: celula.name,
        leaderName: celula.leaderName,
        hostName: celula.hostName,
        address: celula.address,
        neighborhood: celula.neighborhood || '',
        dayOfWeek: celula.dayOfWeek,
        meetingTime: celula.meetingTime,
        membersCount: celula.membersCount,
        targetAudience: celula.targetAudience,
        status: celula.status,
      });
    } else {
      setEditingCelula(null);
      const nextNum = celulas.length + 1;
      const codePrefix = sedes[0]?.id === 'sede_central' ? 'CEL-C' : 'CEL-N';
      setCelulaForm({
        sedeId: sedes[0]?.id || 'sede_central',
        anexoId: '',
        code: `${codePrefix}0${nextNum}`,
        name: '',
        leaderName: '',
        hostName: '',
        address: '',
        neighborhood: '',
        dayOfWeek: 'Miércoles',
        meetingTime: '19:30',
        membersCount: 10,
        targetAudience: 'Familias',
        status: 'active',
      });
    }
    setCelulaModalOpen(true);
  };

  const handleSaveCelula = (e: React.FormEvent) => {
    e.preventDefault();
    if (!celulaForm.name.trim() || !celulaForm.leaderName.trim() || !celulaForm.address.trim()) {
      onToast?.('Por favor completa nombre, líder y dirección de la célula');
      return;
    }

    const selectedSede = sedes.find((s) => s.id === celulaForm.sedeId) || sedes[0];
    const selectedAnexo = celulaForm.anexoId ? anexos.find((a) => a.id === celulaForm.anexoId) : undefined;

    if (editingCelula) {
      churchHierarchyService.updateCelula({
        ...celulaForm,
        id: editingCelula.id,
        sedeName: selectedSede?.name,
        anexoName: selectedAnexo?.name,
      });
      onToast?.(`🏠 Célula [${celulaForm.code}] actualizada.`);
    } else {
      churchHierarchyService.addCelula({
        ...celulaForm,
        sedeName: selectedSede?.name,
        anexoName: selectedAnexo?.name,
      });
      onToast?.(`🏠 Célula [${celulaForm.code}] creada exitosamente.`);
    }
    setCelulaModalOpen(false);
  };

  const handleDeleteCelula = (celula: ChurchCelula) => {
    if (confirm(`¿Eliminar la célula "[${celula.code}] ${celula.name}"?`)) {
      churchHierarchyService.deleteCelula(celula.id);
      onToast?.(`Célula eliminada.`);
    }
  };

  // Export & Restore
  const handleExportJson = () => {
    const data = {
      organization,
      sedes,
      anexos,
      celulas,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jerarquia_eclesiastica_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onToast?.('📥 Estructura eclesiástica exportada en JSON');
  };

  const handleResetDefaults = () => {
    if (confirm('¿Restaurar la estructura inicial predeterminada de Templo Principal, Sedes, Anexos y Células?')) {
      churchHierarchyService.resetToDefaults();
      refreshData();
      setOrgForm(churchHierarchyService.getOrganization());
      onToast?.('🔄 Configuración restaurada a los valores predeterminados.');
    }
  };

  // Filtered Celulas
  const filteredCelulas = useMemo(() => {
    return celulas.filter((c) => {
      const matchesSede = selectedSedeFilter === 'all' || c.sedeId === selectedSedeFilter;
      const matchesAudience = selectedAudienceFilter === 'all' || c.targetAudience === selectedAudienceFilter;
      const q = searchQuery.toLowerCase();
      const matchesQuery =
        !searchQuery ||
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.leaderName.toLowerCase().includes(q) ||
        c.hostName.toLowerCase().includes(q) ||
        (c.neighborhood && c.neighborhood.toLowerCase().includes(q)) ||
        c.address.toLowerCase().includes(q);

      return matchesSede && matchesAudience && matchesQuery;
    });
  }, [celulas, selectedSedeFilter, selectedAudienceFilter, searchQuery]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Institutional Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#121318] p-6 rounded-3xl border border-[#002147]/10 dark:border-white/10 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#002147]/10 text-[#002147] dark:bg-[#FED65B]/10 dark:text-[#FED65B] border border-[#002147]/20 dark:border-[#FED65B]/20 mb-2">
            <Shield className="w-3.5 h-3.5 text-[#F47B20]" />
            <span>Gobierno & Estructura Eclesiástica</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#002147] dark:text-white flex items-center gap-2">
            <span>Configuración de Sedes, Anexos & Células</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Gestiona la iglesia principal, sedes distritales, anexos filiales y células en los hogares.
            Al crear un evento, prédica o aviso push podrás asignarlo a un ámbito específico o a toda la iglesia.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
            title="Exportar respaldo de la estructura en archivo JSON"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Exportar JSON</span>
          </button>
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
            title="Restaurar datos predeterminados"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Predeterminados</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#151720] border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-[#002147] text-[#FED65B] flex items-center justify-center font-bold">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Sedes & Campus
            </div>
            <div className="text-xl font-bold text-slate-800 dark:text-white">
              {sedes.length}
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              1 Templo Principal + {sedes.length - 1} Sedes
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#151720] border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Anexos & Misiones
            </div>
            <div className="text-xl font-bold text-slate-800 dark:text-white">
              {anexos.length}
            </div>
            <div className="text-[10px] text-slate-500 font-semibold">
              Templos filiales
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#151720] border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-purple-500/15 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Células en Hogares
            </div>
            <div className="text-xl font-bold text-slate-800 dark:text-white">
              {celulas.length}
            </div>
            <div className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
              {totalCelulaMembers} miembros en casas
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#151720] border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-[#F47B20]/15 text-[#F47B20] flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Membresía Estimada
            </div>
            <div className="text-xl font-bold text-slate-800 dark:text-white">
              {totalEstimatedMembers.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 font-semibold">
              Congregación total
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('organization')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'organization'
              ? 'bg-[#002147] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Globe className="w-4 h-4 text-[#FED65B]" />
          <span>Templo Principal & Organización General</span>
        </button>

        <button
          onClick={() => setActiveTab('sedes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'sedes'
              ? 'bg-[#002147] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Landmark className="w-4 h-4 text-[#FED65B]" />
          <span>Sedes & Campus ({sedes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('anexos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'anexos'
              ? 'bg-[#002147] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building className="w-4 h-4 text-[#FED65B]" />
          <span>Anexos Filiales ({anexos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('celulas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'celulas'
              ? 'bg-[#002147] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Home className="w-4 h-4 text-[#FED65B]" />
          <span>Células en Casa ({celulas.length})</span>
        </button>
      </div>

      {/* TAB 1: Templo Principal & Organización General */}
      {activeTab === 'organization' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-[#151720] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
              <div>
                <h3 className="font-serif font-bold text-base text-slate-800 dark:text-white">
                  Identidad del Templo Principal & Misión
                </h3>
                <p className="text-xs text-slate-500">
                  Configura los datos del templo principal matriz y la visión eclesiástica.
                </p>
              </div>
              {isOrgSaved && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-bold animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>¡Cambios Guardados!</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSaveOrganization} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Nombre Oficial de la Iglesia / Templo Principal *
                  </label>
                  <input
                    type="text"
                    required
                    value={orgForm.name}
                    onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                    placeholder="Ej. Iglesia Cristiana El-Shaddai"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147]"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Denominación / Concilio
                  </label>
                  <input
                    type="text"
                    value={orgForm.denomination || ''}
                    onChange={(e) => setOrgForm({ ...orgForm, denomination: e.target.value })}
                    placeholder="Ej. Evangélica Pentecostal / Alianza Cristiana"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147]"
                  />
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Pastores Principales (Líderes de la Obra) *
                </label>
                <input
                  type="text"
                  required
                  value={orgForm.mainPastor}
                  onChange={(e) => setOrgForm({ ...orgForm, mainPastor: e.target.value })}
                  placeholder="Pastor David Ben-David & Pastora Sara Ben-David"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Dirección del Templo Principal (Sede Matriz) *
                  </label>
                  <input
                    type="text"
                    required
                    value={orgForm.headquartersAddress}
                    onChange={(e) => setOrgForm({ ...orgForm, headquartersAddress: e.target.value })}
                    placeholder="Av. La Paz 1420, Sede Central"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147]"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Ciudad / Región
                  </label>
                  <input
                    type="text"
                    value={orgForm.headquartersCity || ''}
                    onChange={(e) => setOrgForm({ ...orgForm, headquartersCity: e.target.value })}
                    placeholder="Ciudad Capital"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Teléfono Institucional
                  </label>
                  <input
                    type="tel"
                    value={orgForm.headquartersPhone || ''}
                    onChange={(e) => setOrgForm({ ...orgForm, headquartersPhone: e.target.value })}
                    placeholder="+56 9 8765 4321"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147]"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Correo Electrónico de Contacto
                  </label>
                  <input
                    type="email"
                    value={orgForm.headquartersEmail || ''}
                    onChange={(e) => setOrgForm({ ...orgForm, headquartersEmail: e.target.value })}
                    placeholder="contacto@elshaddai.org"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147]"
                  />
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Declaración de Visión & Propósito Ministerial
                </label>
                <textarea
                  rows={3}
                  value={orgForm.visionStatement || ''}
                  onChange={(e) => setOrgForm({ ...orgForm, visionStatement: e.target.value })}
                  placeholder="Escribe la visión pastoral de la iglesia..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147]"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#002147] hover:bg-[#0B2B68] text-[#FED65B] font-bold text-xs shadow-md transition-all cursor-pointer border border-[#D4AF37]/40"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Configuración General</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Card: Institutional Preview & Coverage */}
          <div className="space-y-4">
            <div className="bg-[#002147] text-white rounded-3xl p-6 border border-[#FED65B]/30 shadow-lg relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-[#FED65B]/10 blur-2xl pointer-events-none" />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-[#FED65B]/40 flex items-center justify-center text-[#FED65B] text-xl font-bold font-serif shadow-xs">
                  ✝
                </div>
                <div>
                  <div className="text-[10px] uppercase font-extrabold tracking-widest text-[#FED65B]">
                    Templo Principal
                  </div>
                  <h4 className="font-serif font-bold text-base leading-tight">
                    {orgForm.name}
                  </h4>
                  <div className="text-[11px] text-white/70">
                    {orgForm.denomination || 'Iglesia Evangélica'}
                  </div>
                </div>
              </div>

              <p className="text-xs text-white/85 italic border-l-2 border-[#FED65B] pl-3 my-4">
                "{orgForm.visionStatement}"
              </p>

              <div className="space-y-2 pt-2 border-t border-white/10 text-xs text-white/80">
                <div className="flex items-start gap-2">
                  <UserCheck className="w-3.5 h-3.5 text-[#FED65B] mt-0.5 shrink-0" />
                  <span>{orgForm.mainPastor}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#FED65B] mt-0.5 shrink-0" />
                  <span>{orgForm.headquartersAddress} ({orgForm.headquartersCity})</span>
                </div>
                {orgForm.headquartersPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#FED65B] shrink-0" />
                    <span>{orgForm.headquartersPhone}</span>
                  </div>
                )}
                {orgForm.headquartersEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#FED65B] shrink-0" />
                    <span>{orgForm.headquartersEmail}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Summary of Hierarchy Coverage */}
            <div className="bg-white dark:bg-[#151720] rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#F47B20]" />
                <span>Estructura de Red Eclesiástica</span>
              </h4>
              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-[#121318]">
                  <span className="font-semibold">🏛️ Sedes Establecidas</span>
                  <span className="font-bold text-[#002147] dark:text-[#FED65B]">{sedes.length} sedes</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-[#121318]">
                  <span className="font-semibold">⛪ Anexos Filiales</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{anexos.length} anexos</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-[#121318]">
                  <span className="font-semibold">🏠 Células en Hogares</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">{celulas.length} células</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Sedes & Campus */}
      {activeTab === 'sedes' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif font-bold text-lg text-slate-800 dark:text-white">
                Sedes Distritales & Campus
              </h3>
              <p className="text-xs text-slate-500">
                Cada sede cuenta con su propio templo, pastor a cargo y cobertura de anexos y células.
              </p>
            </div>
            <button
              onClick={() => handleOpenSedeModal()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#002147] hover:bg-[#0B2B68] text-[#FED65B] text-xs font-bold shadow-md transition-all cursor-pointer border border-[#D4AF37]/40"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Sede o Campus</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sedes.map((sede) => {
              const anexosInSede = anexos.filter((a) => a.sedeId === sede.id);
              const celulasInSede = celulas.filter((c) => c.sedeId === sede.id);

              return (
                <div
                  key={sede.id}
                  className={`p-5 rounded-3xl bg-white dark:bg-[#151720] border transition-all shadow-xs flex flex-col justify-between ${
                    sede.isMainCampus
                      ? 'border-[#002147] dark:border-[#FED65B]/60 ring-2 ring-[#002147]/10'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#002147]/10 dark:bg-[#FED65B]/10 text-[#002147] dark:text-[#FED65B] flex items-center justify-center font-bold">
                          <Landmark className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-800 dark:text-white leading-tight">
                            {sede.name}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {sede.city}
                          </span>
                        </div>
                      </div>

                      {sede.isMainCampus ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-[#002147] text-[#FED65B] border border-[#FED65B]/40">
                          Templo Matriz
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          Sede Filial
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#F47B20] shrink-0 mt-0.5" />
                        <span>{sede.address}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>Pastor a cargo: <strong className="text-slate-700 dark:text-slate-300">{sede.pastorInCharge}</strong></span>
                      </div>
                      {sede.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{sede.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Associated Counts */}
                    <div className="flex items-center gap-3 my-3 p-2 rounded-xl bg-slate-50 dark:bg-[#121318] text-[11px]">
                      <div className="flex-1 text-center">
                        <div className="font-bold text-[#002147] dark:text-[#FED65B]">
                          {anexosInSede.length}
                        </div>
                        <div className="text-[9px] text-slate-400 uppercase font-semibold">Anexos</div>
                      </div>
                      <div className="w-px h-6 bg-slate-200 dark:bg-slate-800" />
                      <div className="flex-1 text-center">
                        <div className="font-bold text-purple-600 dark:text-purple-400">
                          {celulasInSede.length}
                        </div>
                        <div className="text-[9px] text-slate-400 uppercase font-semibold">Células</div>
                      </div>
                      <div className="w-px h-6 bg-slate-200 dark:bg-slate-800" />
                      <div className="flex-1 text-center">
                        <div className="font-bold text-slate-700 dark:text-slate-300">
                          {sede.activeMembersCount || 0}
                        </div>
                        <div className="text-[9px] text-slate-400 uppercase font-semibold">Miembros</div>
                      </div>
                    </div>

                    {sede.notes && (
                      <p className="text-[11px] text-slate-500 italic mt-1 line-clamp-2">
                        {sede.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
                    <button
                      onClick={() => handleOpenSedeModal(sede)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Editar</span>
                    </button>
                    {!sede.isMainCampus && (
                      <button
                        onClick={() => handleDeleteSede(sede)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Eliminar Sede"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Anexos & Misiones */}
      {activeTab === 'anexos' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif font-bold text-lg text-slate-800 dark:text-white">
                Anexos Filiales & Puntos de Predicación
              </h3>
              <p className="text-xs text-slate-500">
                Puntos de predicación y misiones que dependen de una Sede matriz.
              </p>
            </div>
            <button
              onClick={() => handleOpenAnexoModal()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#002147] hover:bg-[#0B2B68] text-[#FED65B] text-xs font-bold shadow-md transition-all cursor-pointer border border-[#D4AF37]/40"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Anexo Filial</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {anexos.map((anexo) => {
              const celulasInAnexo = celulas.filter((c) => c.anexoId === anexo.id);

              return (
                <div
                  key={anexo.id}
                  className="p-5 rounded-3xl bg-white dark:bg-[#151720] border border-slate-200 dark:border-slate-800 hover:border-slate-300 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                          <Building className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-800 dark:text-white leading-tight">
                            {anexo.name}
                          </h4>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                            {anexo.sedeName || 'Sede'}
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                        {anexo.activeMembersCount || 0} miembros
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{anexo.address}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>Líder a cargo: <strong className="text-slate-700 dark:text-slate-300">{anexo.leaderInCharge}</strong></span>
                      </div>
                      {anexo.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{anexo.phone}</span>
                        </div>
                      )}
                      {anexo.meetingDays && (
                        <div className="flex items-start gap-2 text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span>Horarios: {anexo.meetingDays}</span>
                        </div>
                      )}
                    </div>

                    {celulasInAnexo.length > 0 && (
                      <div className="mt-3 p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-[11px] font-medium flex items-center justify-between">
                        <span>Células filiales asignadas:</span>
                        <span className="font-bold">{celulasInAnexo.length} células</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 mt-3">
                    <button
                      onClick={() => handleOpenAnexoModal(anexo)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => handleDeleteAnexo(anexo)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Eliminar Anexo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: Células / Grupos en Casa */}
      {activeTab === 'celulas' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif font-bold text-lg text-slate-800 dark:text-white">
                Células de Crecimiento & Grupos en Casa
              </h3>
              <p className="text-xs text-slate-500">
                Unidades fundamentales de discipulado, pastoreo y comunión en los hogares familiares.
              </p>
            </div>
            <button
              onClick={() => handleOpenCelulaModal()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#002147] hover:bg-[#0B2B68] text-[#FED65B] text-xs font-bold shadow-md transition-all cursor-pointer border border-[#D4AF37]/40"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Célula Familiar</span>
            </button>
          </div>

          {/* Filters Bar for Células */}
          <div className="flex flex-wrap items-center gap-2 p-3 bg-white dark:bg-[#151720] rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por código, nombre, líder, anfitrión o barrio..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147]"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedSedeFilter}
                onChange={(e) => setSelectedSedeFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-700 dark:text-slate-300 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all">Todas las Sedes</option>
                {sedes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedAudienceFilter}
                onChange={(e) => setSelectedAudienceFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-700 dark:text-slate-300 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all">Todo Público</option>
                <option value="Familias">Familias</option>
                <option value="Jóvenes">Jóvenes</option>
                <option value="Mujeres">Mujeres</option>
                <option value="Varones">Varones</option>
                <option value="Mixto">Mixto</option>
              </select>
            </div>
          </div>

          {/* Celulas List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCelulas.map((celula) => {
              const audienceBadgeColors: Record<string, string> = {
                Familias: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/25',
                Jóvenes: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25',
                Mujeres: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25',
                Varones: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25',
                Mixto: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/25',
              };

              return (
                <div
                  key={celula.id}
                  className="p-5 rounded-3xl bg-white dark:bg-[#151720] border border-slate-200 dark:border-slate-800 hover:border-slate-300 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-purple-500 text-white shadow-xs">
                            {celula.code}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                              audienceBadgeColors[celula.targetAudience] || 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {celula.targetAudience}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-white leading-snug">
                          {celula.name}
                        </h4>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          {celula.membersCount}
                        </span>
                        <div className="text-[9px] text-slate-400 font-semibold uppercase">Miembros</div>
                      </div>
                    </div>

                    <div className="text-[11px] font-semibold text-slate-500 mb-2">
                      🏛️ {celula.sedeName || 'Sede'}
                      {celula.anexoName && ` &bull; ⛪ ${celula.anexoName}`}
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-start gap-2">
                        <UserCheck className="w-3.5 h-3.5 text-[#F47B20] shrink-0 mt-0.5" />
                        <span>Líder: <strong className="text-slate-800 dark:text-slate-200">{celula.leaderName}</strong></span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Home className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>Hogar / Anfitrión: <strong className="text-slate-800 dark:text-slate-200">{celula.hostName}</strong></span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>
                          {celula.address} {celula.neighborhood && `(${celula.neighborhood})`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 font-medium">
                        <Clock className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        <span>{celula.dayOfWeek} a las {celula.meetingTime} hrs</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 mt-3">
                    <button
                      onClick={() => handleOpenCelulaModal(celula)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => handleDeleteCelula(celula)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Eliminar Célula"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCelulas.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-[#151720] rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
              <Home className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No se encontraron células con los filtros aplicados.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Prueba cambiando los términos de búsqueda o agrega una nueva célula familiar.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Sede / Campus */}
      {/* ========================================================================= */}
      {sedeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1A1C24] w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 bg-[#002147] text-white flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-[#FED65B]" />
                <h3 className="font-serif font-bold text-base">
                  {editingSede ? 'Editar Sede o Campus' : 'Registrar Nueva Sede / Campus'}
                </h3>
              </div>
              <button
                onClick={() => setSedeModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSede} className="p-6 space-y-3.5 text-left">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Nombre de la Sede *
                </label>
                <input
                  type="text"
                  required
                  value={sedeForm.name}
                  onChange={(e) => setSedeForm({ ...sedeForm, name: e.target.value })}
                  placeholder="Ej. Sede Norte - Campus Esperanza"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Distrito / Ciudad *
                  </label>
                  <input
                    type="text"
                    required
                    value={sedeForm.city}
                    onChange={(e) => setSedeForm({ ...sedeForm, city: e.target.value })}
                    placeholder="Distrito Norte"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Miembros Estimados
                  </label>
                  <input
                    type="number"
                    value={sedeForm.activeMembersCount || 100}
                    onChange={(e) =>
                      setSedeForm({ ...sedeForm, activeMembersCount: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Dirección del Templo *
                </label>
                <input
                  type="text"
                  required
                  value={sedeForm.address}
                  onChange={(e) => setSedeForm({ ...sedeForm, address: e.target.value })}
                  placeholder="Calle San Pedro 55"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Pastor a Cargo *
                  </label>
                  <input
                    type="text"
                    required
                    value={sedeForm.pastorInCharge}
                    onChange={(e) => setSedeForm({ ...sedeForm, pastorInCharge: e.target.value })}
                    placeholder="Pastor Marcos Morales"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={sedeForm.phone || ''}
                    onChange={(e) => setSedeForm({ ...sedeForm, phone: e.target.value })}
                    placeholder="+56 9 1234 5678"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Notas / Observaciones
                </label>
                <textarea
                  rows={2}
                  value={sedeForm.notes || ''}
                  onChange={(e) => setSedeForm({ ...sedeForm, notes: e.target.value })}
                  placeholder="Detalles sobre instalaciones, auditorio o ministerios..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSedeModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#002147] hover:bg-[#0B2B68] text-[#FED65B] font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Sede</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Anexo Filial */}
      {/* ========================================================================= */}
      {anexoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1A1C24] w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 bg-[#002147] text-white flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-[#FED65B]" />
                <h3 className="font-serif font-bold text-base">
                  {editingAnexo ? 'Editar Anexo Filial' : 'Registrar Nuevo Anexo'}
                </h3>
              </div>
              <button
                onClick={() => setAnexoModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAnexo} className="p-6 space-y-3.5 text-left">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Sede Matriz a la que pertenece *
                </label>
                <select
                  required
                  value={anexoForm.sedeId}
                  onChange={(e) => setAnexoForm({ ...anexoForm, sedeId: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147] cursor-pointer"
                >
                  {sedes.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Nombre del Anexo / Misión Filial *
                </label>
                <input
                  type="text"
                  required
                  value={anexoForm.name}
                  onChange={(e) => setAnexoForm({ ...anexoForm, name: e.target.value })}
                  placeholder="Ej. Anexo Sector San Pedro"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Dirección del Anexo *
                </label>
                <input
                  type="text"
                  required
                  value={anexoForm.address}
                  onChange={(e) => setAnexoForm({ ...anexoForm, address: e.target.value })}
                  placeholder="Calle San Pedro 55 - Módulo B"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Líder o Encargado *
                  </label>
                  <input
                    type="text"
                    required
                    value={anexoForm.leaderInCharge}
                    onChange={(e) => setAnexoForm({ ...anexoForm, leaderInCharge: e.target.value })}
                    placeholder="Líder Gabriel Cruz"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Miembros Activos
                  </label>
                  <input
                    type="number"
                    value={anexoForm.activeMembersCount || 50}
                    onChange={(e) =>
                      setAnexoForm({ ...anexoForm, activeMembersCount: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Días y Horarios de Reunión
                </label>
                <input
                  type="text"
                  value={anexoForm.meetingDays || ''}
                  onChange={(e) => setAnexoForm({ ...anexoForm, meetingDays: e.target.value })}
                  placeholder="Jueves 19:30 & Domingos 09:30"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAnexoModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#002147] hover:bg-[#0B2B68] text-[#FED65B] font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Anexo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Célula en Casa */}
      {/* ========================================================================= */}
      {celulaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1A1C24] w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-[#002147] text-white flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5 text-[#FED65B]" />
                <h3 className="font-serif font-bold text-base">
                  {editingCelula ? 'Editar Célula en Hogar' : 'Registrar Nueva Célula'}
                </h3>
              </div>
              <button
                onClick={() => setCelulaModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCelula} className="p-6 space-y-3.5 text-left overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Sede de Cobertura *
                  </label>
                  <select
                    required
                    value={celulaForm.sedeId}
                    onChange={(e) => setCelulaForm({ ...celulaForm, sedeId: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147] cursor-pointer"
                  >
                    {sedes.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Anexo (Opcional)
                  </label>
                  <select
                    value={celulaForm.anexoId || ''}
                    onChange={(e) => setCelulaForm({ ...celulaForm, anexoId: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147] cursor-pointer"
                  >
                    <option value="">Sin Anexo Directo (Directa de Sede)</option>
                    {anexos.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Código *
                  </label>
                  <input
                    type="text"
                    required
                    value={celulaForm.code}
                    onChange={(e) => setCelulaForm({ ...celulaForm, code: e.target.value })}
                    placeholder="CEL-C01"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147]"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Nombre de la Célula *
                  </label>
                  <input
                    type="text"
                    required
                    value={celulaForm.name}
                    onChange={(e) => setCelulaForm({ ...celulaForm, name: e.target.value })}
                    placeholder="Ej. Célula Betel - Familias en Victoria"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Líder de Célula *
                  </label>
                  <input
                    type="text"
                    required
                    value={celulaForm.leaderName}
                    onChange={(e) => setCelulaForm({ ...celulaForm, leaderName: e.target.value })}
                    placeholder="Hno. Roberto Quispe"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Anfitrión / Familia del Hogar *
                  </label>
                  <input
                    type="text"
                    required
                    value={celulaForm.hostName}
                    onChange={(e) => setCelulaForm({ ...celulaForm, hostName: e.target.value })}
                    placeholder="Familia Flores"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Dirección del Hogar *
                </label>
                <input
                  type="text"
                  required
                  value={celulaForm.address}
                  onChange={(e) => setCelulaForm({ ...celulaForm, address: e.target.value })}
                  placeholder="Calle Los Sauces 240, Dpto 301"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Barrio / Sector
                  </label>
                  <input
                    type="text"
                    value={celulaForm.neighborhood || ''}
                    onChange={(e) => setCelulaForm({ ...celulaForm, neighborhood: e.target.value })}
                    placeholder="Barrio Santa Rosa"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Público Objetivo
                  </label>
                  <select
                    value={celulaForm.targetAudience}
                    onChange={(e) =>
                      setCelulaForm({
                        ...celulaForm,
                        targetAudience: e.target.value as any,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147]"
                  >
                    <option value="Familias">Familias</option>
                    <option value="Jóvenes">Jóvenes</option>
                    <option value="Mujeres">Mujeres</option>
                    <option value="Varones">Varones</option>
                    <option value="Mixto">Mixto</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Día
                  </label>
                  <select
                    value={celulaForm.dayOfWeek}
                    onChange={(e) =>
                      setCelulaForm({
                        ...celulaForm,
                        dayOfWeek: e.target.value as any,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147]"
                  >
                    <option value="Lunes">Lunes</option>
                    <option value="Martes">Martes</option>
                    <option value="Miércoles">Miércoles</option>
                    <option value="Jueves">Jueves</option>
                    <option value="Viernes">Viernes</option>
                    <option value="Sábado">Sábado</option>
                    <option value="Domingo">Domingo</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Hora
                  </label>
                  <input
                    type="time"
                    value={celulaForm.meetingTime}
                    onChange={(e) => setCelulaForm({ ...celulaForm, meetingTime: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Miembros
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={celulaForm.membersCount}
                    onChange={(e) =>
                      setCelulaForm({ ...celulaForm, membersCount: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002147]"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCelulaModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#002147] hover:bg-[#0B2B68] text-[#FED65B] font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Célula</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
