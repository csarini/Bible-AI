import React, { useState, useEffect } from 'react';
import { Shield, Server, Key, Eye, EyeOff, Save, CheckCircle, Info } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { ReadingSettings } from '../types';

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
  const [apiUrl, setApiUrl] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setApiUrl(StorageService.getApiUrl());
    setGeminiKey(StorageService.getGeminiApiKey());
  }, []);

  const handleSaveConnection = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveApiUrl(apiUrl);
    StorageService.saveGeminiApiKey(geminiKey);
    setSaveSuccess(true);
    onToast('Configuración de conexión guardada');
    setTimeout(() => setSaveSuccess(false), 3000);
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
          En el dispositivo móvil (APK), la llamada local de red no está disponible de forma predeterminada. Puedes configurar cómo se comunica tu aplicación con el Mentor Teológico de dos maneras:
        </p>

        <form onSubmit={handleSaveConnection} className="space-y-4">
          {/* Option 1: Direct Gemini API key (Client-side) */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-label-caps text-[#454652] uppercase font-semibold">
              <Key className="w-3.5 h-3.5 text-[#767683]" />
              Clave API de Gemini (Uso Directo Local)
            </label>
            <div className="relative flex items-center">
              <input
                type={showKey ? 'text' : 'password'}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="Introduzca su clave API de Gemini (ej. AIzaSy...)"
                className="w-full bg-[#FFFFFF] border border-[#C6C5D4] rounded-xl py-2.5 pl-3 pr-10 text-xs sm:text-sm font-mono text-[#000666] focus:outline-none focus:ring-1 focus:ring-[#000666] placeholder-[#C6C5D4]"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 text-[#767683] hover:text-[#000666]"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-[#767683] leading-normal flex items-start gap-1">
              <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-[#735C00]" />
              <span>
                <strong>Recomendado para APK:</strong> Tu dispositivo se comunicará directamente con los servidores de Google usando tu clave. Obtén una clave gratis en Google AI Studio. Se guarda de forma segura y local en tu teléfono.
              </span>
            </p>
          </div>

          {/* Divider */}
          <div className="relative py-2 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#C6C5D4]/40"></div>
            </div>
            <span className="relative bg-[#FBF9F4] px-3 text-[10px] font-label-caps text-[#767683] uppercase tracking-widest">
              ó
            </span>
          </div>

          {/* Option 2: Custom Server URL */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-label-caps text-[#454652] uppercase font-semibold">
              <Server className="w-3.5 h-3.5 text-[#767683]" />
              URL del Servidor Backend (Remoto)
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
                Utiliza esto si has desplegado el backend de Node (`server.ts`) en un hosting en la nube (Render, Fly.io, etc.). Si configuras un API Key local arriba, este campo será ignorado.
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
              Guardar Conexión
            </button>

            {saveSuccess && (
              <span className="text-xs text-[#2E7D32] flex items-center gap-1 font-medium animate-in fade-in slide-in-from-left-2">
                <CheckCircle className="w-4 h-4" />
                ¡Cambios aplicados!
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
                  className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    settings.fontSize === size
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
                Versión / Traducción Bíblica
              </span>
              <span className="text-[11px] font-sans font-bold text-[#F47B20] bg-[#F47B20]/10 px-2 py-0.5 rounded-full">
                Versiones Oficiales por Defecto
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { id: 'RVR1960', title: 'RVR 1960', subtitle: 'Reina-Valera 1960 (Versión Principal por Defecto)', badge: 'Predeterminada' },
                { id: 'RVR1909', title: 'RVR 1909', subtitle: 'Reina-Valera 1909 (Edición Clásica / GetBible)', badge: 'Por Defecto' }
              ].map((tr) => (
                <button
                  key={tr.id}
                  id={`settings-trans-${tr.id}`}
                  onClick={() => {
                    onUpdateSettings({ translation: tr.id as any });
                    onToast(`Traducción actualizada a ${tr.title}`);
                  }}
                  className={`p-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-left flex flex-col justify-between ${
                    settings.translation === tr.id
                      ? 'bg-[#0B2B68] text-[#FED65B] shadow-xs ring-2 ring-[#F47B20]/50 font-black'
                      : 'bg-[#F0EEE9] text-[#454652] hover:bg-[#EAE8E3]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-bold">{tr.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      settings.translation === tr.id
                        ? 'bg-[#FED65B]/20 text-[#FED65B]'
                        : 'bg-[#C6C5D4]/40 text-[#454652]'
                    }`}>
                      {tr.badge}
                    </span>
                  </div>
                  <span className="block text-[11px] font-normal opacity-80 mt-1">
                    {tr.subtitle}
                  </span>
                </button>
              ))}
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
    </div>
  );
};
