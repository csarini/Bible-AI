import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Server,
  Key,
  Eye,
  EyeOff,
  Save,
  CheckCircle,
  Info,
  Download,
  Upload,
  HardDrive,
  FileJson,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { StorageService } from '../services/storageService';
import { ReadingSettings, OFFICIAL_TRANSLATIONS } from '../types';

interface SettingsViewProps {
  settings: ReadingSettings;
  onUpdateSettings: (newSettings: Partial<ReadingSettings>) => void;
  onToast: (message: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onToast
}) => {
  const [provider, setProvider] = useState<'gemini' | 'openai' | 'qwen' | 'custom'>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const savedProvider = (localStorage.getItem('el_shaddai_ai_provider') as any) || 'gemini';
    const savedKey = localStorage.getItem('el_shaddai_ai_api_key') || localStorage.getItem('el_shaddai_gemini_api_key') || StorageService.getGeminiApiKey();
    const savedModel = localStorage.getItem('el_shaddai_ai_model') || '';
    const savedEndpoint = localStorage.getItem('el_shaddai_ai_endpoint') || '';

    setProvider(savedProvider);
    setApiKey(savedKey);
    setModel(savedModel);
    setEndpoint(savedEndpoint);
    setApiUrl(StorageService.getApiUrl());
  }, []);

  const handleSaveConnection = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('el_shaddai_ai_provider', provider);
    localStorage.setItem('el_shaddai_ai_api_key', apiKey.trim());
    localStorage.setItem('el_shaddai_gemini_api_key', apiKey.trim());
    localStorage.setItem('el_shaddai_ai_model', model.trim());
    localStorage.setItem('el_shaddai_ai_endpoint', endpoint.trim());

    StorageService.saveApiUrl(apiUrl);
    StorageService.saveGeminiApiKey(apiKey.trim());

    setSaveSuccess(true);
    onToast('Configuración del Mentor IA guardada');
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExportBackup = () => {
    try {
      const dataStr = StorageService.exportBackupData();
      const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `santuario-digital-backup-${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      onToast('Copia de seguridad descargada exitosamente (.json)');
    } catch (err: any) {
      console.error('Error exporting backup:', err);
      onToast('Error al descargar copia de seguridad');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const result = StorageService.importBackupData(text);
        if (result.success) {
          setImportStatus({ success: true, message: result.message });
          onToast('Copia de seguridad restaurada correctamente');
          setTimeout(() => {
            window.location.reload();
          }, 1200);
        } else {
          setImportStatus({ success: false, message: result.message });
          onToast(result.message);
        }
      } catch (err: any) {
        setImportStatus({ success: false, message: 'Error al leer el archivo JSON.' });
        onToast('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
    // Reset file input so user can re-upload same file if needed
    e.target.value = '';
  };

  return (
    <div id="sanctuary-settings-view" className="w-full flex-1 max-w-[760px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* View Title */}
      <div className="border-b border-[#C6C5D4]/70 pb-4">
        <h2 className="font-display-scripture text-2xl sm:text-3xl text-[#000666] tracking-tight">
          Configuración
        </h2>
        <p className="text-[12px] font-label-caps text-[#767683] uppercase tracking-wider">
          Personalización del Santuario y Conexión de IA
        </p>
      </div>

      {/* AI Connection Settings Card */}
      <div className="bg-[#FBF9F4] border border-[#C6C5D4] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 text-[#000666] border-b border-[#C6C5D4]/50 pb-3">
          <Shield className="w-5 h-5 text-[#735C00]" />
          <h3 className="font-display-scripture text-lg font-bold">
            Conexión con el Mentor de IA
          </h3>
        </div>

        <p className="text-xs sm:text-[13px] text-[#454652] leading-relaxed">
          Configura tu propio proveedor y modelo de IA (Google Gemini, OpenAI / ChatGPT, Alibaba Qwen o Servidor Propio) para obtener respuestas teológicas ilimitadas sin respuestas pregrabadas ni límites diarios:
        </p>

        <form onSubmit={handleSaveConnection} className="space-y-4">
          {/* Provider Selection */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-label-caps text-[#454652] uppercase font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#767683]" />
              Proveedor de IA
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'gemini', label: 'Gemini', note: 'Google (Gratis)' },
                { id: 'openai', label: 'ChatGPT', note: 'OpenAI (GPT-4o)' },
                { id: 'qwen', label: 'Qwen', note: 'Alibaba Cloud' },
                { id: 'custom', label: 'OpenAI Comp.', note: 'Local / Ollama' }
              ].map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setProvider(p.id as any)}
                  className={`p-2.5 rounded-xl border text-left flex flex-col gap-0.5 cursor-pointer transition-all ${
                    provider === p.id
                      ? 'bg-[#000666]/10 border-[#000666] text-[#000666] font-bold shadow-xs'
                      : 'bg-white border-[#C6C5D4]/60 text-[#454652] hover:border-[#000666]/40'
                  }`}
                >
                  <span className="text-xs">{p.label}</span>
                  <span className="text-[10px] opacity-70">{p.note}</span>
                </button>
              ))}
            </div>
          </div>

          {/* API Key */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-label-caps text-[#454652] uppercase font-semibold">
              <Key className="w-3.5 h-3.5 text-[#767683]" />
              Clave API ({provider.toUpperCase()})
            </label>
            <div className="relative flex items-center">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={
                  provider === 'gemini'
                    ? 'AIzaSy...'
                    : provider === 'openai'
                      ? 'sk-proj-...'
                      : 'Clave API del proveedor...'
                }
                className="w-full bg-[#FFFFFF] border border-[#C6C5D4] rounded-xl py-2.5 pl-3 pr-10 text-xs sm:text-sm font-mono text-[#000666] focus:outline-none focus:ring-1 focus:ring-[#000666] placeholder-[#C6C5D4]"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 text-[#767683] hover:text-[#000666] cursor-pointer"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-[#767683] leading-normal flex items-start gap-1">
              <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-[#735C00]" />
              <span>
                {provider === 'gemini'
                  ? 'Obtén tu clave de Google Gemini 100% gratis en aistudio.google.com.'
                  : provider === 'openai'
                    ? 'Obtén tu clave en platform.openai.com/api-keys.'
                    : 'Las credenciales se almacenan de forma local en tu navegador / dispositivo.'}
              </span>
            </p>
          </div>

          {/* Model Name (Optional) */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-label-caps text-[#454652] uppercase font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#767683]" />
              Modelo Específico (Opcional)
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder={
                provider === 'gemini'
                  ? 'gemini-2.5-flash (por defecto)'
                  : provider === 'openai'
                    ? 'gpt-4o-mini (por defecto)'
                    : provider === 'qwen'
                      ? 'qwen-plus / qwen-max (por defecto)'
                      : 'nombre-del-modelo'
              }
              className="w-full bg-[#FFFFFF] border border-[#C6C5D4] rounded-xl py-2 px-3 text-xs sm:text-sm text-[#000666] focus:outline-none focus:ring-1 focus:ring-[#000666] placeholder-[#C6C5D4]"
            />
          </div>

          {/* Custom Endpoint (for Qwen or Custom) */}
          {(provider === 'qwen' || provider === 'custom') && (
            <div className="space-y-1.5 animate-in fade-in duration-150">
              <label className="flex items-center gap-1.5 text-xs font-label-caps text-[#454652] uppercase font-semibold">
                <Server className="w-3.5 h-3.5 text-[#767683]" />
                Endpoint URL compatible con OpenAI
              </label>
              <input
                type="url"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder={
                  provider === 'qwen'
                    ? 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions'
                    : 'http://localhost:11434/v1/chat/completions'
                }
                className="w-full bg-[#FFFFFF] border border-[#C6C5D4] rounded-xl py-2 px-3 text-xs sm:text-sm text-[#000666] focus:outline-none focus:ring-1 focus:ring-[#000666] placeholder-[#C6C5D4]"
              />
            </div>
          )}

          {/* Divider */}
          <div className="relative py-1 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#C6C5D4]/40"></div>
            </div>
            <span className="relative bg-[#FBF9F4] px-3 text-[10px] font-label-caps text-[#767683] uppercase tracking-widest">
              ó Servidor Proxy Remoto
            </span>
          </div>

          {/* Custom Backend Server URL */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-label-caps text-[#454652] uppercase font-semibold">
              <Server className="w-3.5 h-3.5 text-[#767683]" />
              URL del Servidor Backend (Remoto / APK)
            </label>
            <input
              type="url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://su-servidor-backend.com"
              className="w-full bg-[#FFFFFF] border border-[#C6C5D4] rounded-xl py-2.5 px-3 text-xs sm:text-sm text-[#000666] focus:outline-none focus:ring-1 focus:ring-[#000666] placeholder-[#C6C5D4]"
            />
            <p className="text-[11px] text-[#767683] leading-normal flex items-start gap-1">
              <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-[#735C00]" />
              <span>
                Opcional para compilaciones APK nativas si no deseas colocar la clave en el teléfono y cuentas con un backend Express desplegado en la nube.
              </span>
            </p>
          </div>

          {/* Action Button */}
          <div className="pt-2 flex items-center justify-between gap-4">
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-[#000666] text-white hover:bg-[#1A237E] transition-all font-body-ui text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              Guardar Credenciales de IA
            </button>

            {saveSuccess && (
              <span className="text-xs text-[#2E7D32] flex items-center gap-1 font-medium animate-in fade-in slide-in-from-left-2">
                <CheckCircle className="w-4 h-4" />
                ¡Configuración aplicada!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* General Reading Preferences Card */}
      <div className="bg-[#FBF9F4] border border-[#C6C5D4] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 text-[#000666] border-b border-[#C6C5D4]/50 pb-3">
          <Info className="w-5 h-5 text-[#735C00]" />
          <h3 className="font-display-scripture text-lg font-bold">
            Preferencias de Lectura
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* FontSize Preference */}
          <div className="space-y-1.5">
            <span className="block text-xs font-label-caps text-[#454652] uppercase font-semibold">
              Tamaño de la Fuente
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {(['small', 'medium', 'large', 'extra-large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => onUpdateSettings({ fontSize: size })}
                  className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${settings.fontSize === size
                      ? 'bg-[#FED65B] text-[#745C00] shadow-xs'
                      : 'bg-[#F0EEE9] text-[#454652] hover:bg-[#EAE8E3]'
                    }`}
                >
                  {size === 'small' ? 'A-' : size === 'medium' ? 'A' : size === 'large' ? 'A+' : 'A++'}
                </button>
              ))}
            </div>
          </div>

          {/* Translation Preference */}
          <div className="space-y-1.5 sm:col-span-2">
            <div className="flex items-center justify-between">
              <span className="block text-xs font-label-caps text-[#454652] uppercase font-semibold">
                Versión / Traducción Bíblica (Offline & API.Bible)
              </span>
              <span className="text-[11px] font-sans font-bold text-[#F47B20] bg-[#F47B20]/10 px-2 py-0.5 rounded-full">
                {OFFICIAL_TRANSLATIONS.length} Versiones Disponibles
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {OFFICIAL_TRANSLATIONS.map((tr) => {
                const isSelected = settings.translation === tr.abbreviation ||
                  settings.translation === tr.translation ||
                  (tr.abbreviation === 'valera' && (settings.translation === 'RVR1909' || settings.translation === 'RVR1960')) ||
                  (tr.abbreviation === 'sse' && settings.translation === 'SSE');
                return (
                  <button
                    key={tr.abbreviation}
                    id={`settings-trans-${tr.abbreviation}`}
                    onClick={() => {
                      onUpdateSettings({ translation: tr.abbreviation });
                      onToast(`Traducción actualizada a ${tr.name}`);
                    }}
                    className={`p-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-left flex flex-col justify-between border ${isSelected
                        ? 'bg-[#0B2B68] text-[#FED65B] border-[#0B2B68] shadow-xs ring-2 ring-[#F47B20]/50 font-black'
                        : 'bg-[#F0EEE9] text-[#454652] border-transparent hover:bg-[#EAE8E3]'
                      }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-bold leading-tight">{tr.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${isSelected
                          ? 'bg-[#FED65B]/20 text-[#FED65B]'
                          : tr.isOffline
                            ? 'bg-emerald-500/20 text-emerald-700'
                            : 'bg-amber-500/20 text-amber-700'
                        }`}>
                        {tr.badge || (tr.isOffline ? 'Offline' : 'API.Bible')}
                      </span>
                    </div>
                    <span className="block text-[11px] font-normal opacity-80 mt-1">
                      {tr.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Verses Option */}
          <div className="space-y-1.5 sm:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#C6C5D4]/30">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.showVerseNumbers}
                onChange={(e) => onUpdateSettings({ showVerseNumbers: e.target.checked })}
                className="w-4 h-4 accent-[#000666] border-[#C6C5D4] rounded cursor-pointer"
              />
              <span className="text-xs sm:text-sm font-body-ui text-[#454652] font-medium">
                Mostrar números de versículo
              </span>
            </label>

            <button
              type="button"
              id="settings-done-preferences-btn"
              onClick={() => onToast(`Preferencias aplicadas (Versión: ${settings.translation})`)}
              className="self-end px-4 py-2 rounded-xl bg-[#0B2B68] hover:bg-[#082255] text-[#FED65B] text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5 active:scale-95"
            >
              <span>Listo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Official El-Shaddai Church Branding Card */}
      <div className="bg-[#FFFFFF] border border-[#C6C5D4]/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#C6C5D4]/40 pb-3">
          <h3 className="font-display-scripture text-lg font-bold text-[#1C276E]">
            Identidad Oficial de la Iglesia
          </h3>
          <span className="text-[10px] font-sans font-black tracking-widest text-[#F47B20] bg-[#F47B20]/10 px-2 py-0.5 rounded-full uppercase">
            Logo Oficial
          </span>
        </div>

        <p className="text-xs text-[#454652] leading-relaxed">
          Logotipo e identidad gráfica oficial de la <strong>Iglesia El-Shaddai — Dios Todopoderoso</strong> integrada en la aplicación en sus dos versiones:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Light Theme Logo Card */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#1C276E]/15 flex flex-col items-center justify-center text-center shadow-2xs">
            <span className="text-[10px] font-bold text-[#1C276E] uppercase tracking-wider mb-2">Versión Tema Claro</span>
            <img src="/logo-light.svg" alt="Logo El-Shaddai Tema Claro" className="w-40 h-auto max-h-36 object-contain" />
          </div>

          {/* Dark Theme Logo Card */}
          <div className="p-4 rounded-xl bg-[#141824] border border-[#3B49A8]/40 flex flex-col items-center justify-center text-center shadow-2xs">
            <span className="text-[10px] font-bold text-[#F47B20] uppercase tracking-wider mb-2">Versión Tema Oscuro</span>
            <img src="/logo-dark.svg" alt="Logo El-Shaddai Tema Oscuro" className="w-40 h-auto max-h-36 object-contain" />
          </div>
        </div>
      </div>

      {/* Mandatory Legal, Copyright & Non-Commercial Declaration Card */}
      <div className="bg-[#FAF8F5] border border-[#C6C5D4]/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#C6C5D4]/40 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#0B2B68]" />
            <h3 className="font-display-scripture text-lg font-bold text-[#0B2B68]">
              Avisos Legales, Derechos de Autor y Licencia
            </h3>
          </div>
          <span className="text-[10px] font-sans font-bold tracking-widest text-[#059669] bg-[#059669]/10 px-2.5 py-1 rounded-full uppercase">
            100% Sin Fines de Lucro
          </span>
        </div>

        <div className="text-xs text-[#454652] space-y-3 leading-relaxed">
          <p>
            <strong>Declaración de Aplicación Gratuita y No Comercial:</strong> Biblia Inteligente (<code>com.elshaddai.biblia_inteligente</code>) es un ministerio de edificación espiritual y discipulado cristiano desarrollado exclusivamente sin fines comerciales. Esta aplicación no contiene compras integradas (in-app purchases), muros de pago, suscripciones comerciales ni publicidad intrusiva.
          </p>

          <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#0B2B68]/15 space-y-2">
            <p className="font-semibold text-[#0B2B68]">
              Cita y Reconocimiento de Bíblica, Inc.:
            </p>
            <p className="italic text-[11px] text-[#454652]">
              «Las citas bíblicas marcadas con NVI © están tomadas de la Santa Biblia, NUEVA VERSIÓN INTERNACIONAL® NVI® © 1999, 2015, 2022 por Bíblica, Inc.® Usado con permiso. Todos los derechos reservados en todo el mundo.»
            </p>
            <p className="text-[11px]">
              Para mayor información sobre la labor de traducción y distribución de las Sagradas Escrituras, visite el{' '}
              <a
                href="https://www.Biblica.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0B2B68] font-bold underline hover:text-[#00A3E0]"
              >
                sitio oficial de Biblica (www.Biblica.com)
              </a>.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#0B2B68]/15 space-y-2">
            <p className="font-semibold text-[#0B2B68]">
              Plataforma Tecnológica y Distribución de API:
            </p>
            <p className="text-[11px] text-[#454652]">
              El acceso digital a los textos bíblicos y sus divisiones canónicas se provee a través de la infraestructura autorizada de{' '}
              <a
                href="https://api.bible"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0B2B68] font-bold underline hover:text-[#00A3E0]"
              >
                API.Bible
              </a>
              , un servicio de American Bible Society (ABS).
            </p>
          </div>

          <p className="text-[11px] text-[#71717A]">
            <strong>Protección de Integridad y Privacidad de IA (Cláusula III.B):</strong> Ningún texto con derechos de autor se altera, mutila ni se utiliza para el entrenamiento o procesamiento con modelos de Inteligencia Artificial Generativa. Toda la memoria caché local expira y se revalida automáticamente cada 30 días conforme a los términos de uso.
          </p>
        </div>
      </div>
    </div>
  );
};
