import React, { useState, useEffect } from 'react';
import { Bot, Key, Server, Eye, EyeOff, Save, CheckCircle, X, Sparkles, HelpCircle } from 'lucide-react';

interface AIMentorSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
  theme?: 'light' | 'sepia' | 'dark';
}

export const AIMentorSettingsModal: React.FC<AIMentorSettingsModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  theme = 'light'
}) => {
  const [provider, setProvider] = useState<'gemini' | 'openai' | 'qwen' | 'custom'>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const savedProvider = (localStorage.getItem('el_shaddai_ai_provider') as any) || 'gemini';
      const savedKey = localStorage.getItem('el_shaddai_ai_api_key') || localStorage.getItem('el_shaddai_gemini_api_key') || 'AQ.Ab8RN6I_vopKgtr88G9_2H0StDa0yjJIJNP6I9YRUl43AelVfQ';
      const savedModel = localStorage.getItem('el_shaddai_ai_model') || '';
      const savedEndpoint = localStorage.getItem('el_shaddai_ai_endpoint') || '';

      setProvider(savedProvider);
      setApiKey(savedKey);
      setModel(savedModel);
      setEndpoint(savedEndpoint);
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProviderChange = (newProvider: 'gemini' | 'openai' | 'qwen' | 'custom') => {
    setProvider(newProvider);
    if (newProvider === 'gemini') {
      setModel('gemini-3.6-flash');
    } else if (newProvider === 'openai') {
      setModel('gpt-4o-mini');
    } else if (newProvider === 'qwen') {
      setModel('qwen/qwen-2.5-72b-instruct');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('el_shaddai_ai_provider', provider);
    localStorage.setItem('el_shaddai_ai_api_key', apiKey.trim());
    localStorage.setItem('el_shaddai_gemini_api_key', apiKey.trim()); // backwards compat
    localStorage.setItem('el_shaddai_ai_model', model.trim());
    localStorage.setItem('el_shaddai_ai_endpoint', endpoint.trim());

    setSavedSuccess(true);
    if (onSaved) onSaved();
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const isDark = theme === 'dark';
  const isSepia = theme === 'sepia';

  const modalBg = isDark
    ? 'bg-[#131722] text-white border-white/15'
    : isSepia
      ? 'bg-[#FBF8F2] text-[#3B2D1F] border-[#705335]/30'
      : 'bg-white text-[#0B2B68] border-[#0B2B68]/15';

  const inputBg = isDark
    ? 'bg-[#1C2337] border-white/20 text-white placeholder-white/40'
    : isSepia
      ? 'bg-[#FAF0E2] border-[#705335]/30 text-[#3B2D1F] placeholder-[#705335]/50'
      : 'bg-[#F8F9FC] border-[#0B2B68]/20 text-[#0B2B68] placeholder-[#767683]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className={`relative w-full max-w-lg rounded-2xl border p-6 shadow-2xl ${modalBg} space-y-5 max-h-[90vh] overflow-y-auto`}>
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b pb-4 border-inherit">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#0B2B68] text-[#FED65B] shadow-xs">
              <Bot className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-serif font-bold text-lg leading-tight">
                Credenciales del Mentor IA
              </h3>
              <p className="text-xs opacity-75 mt-0.5">
                Configura tu proveedor preferido (Gemini, ChatGPT, Qwen)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
          {/* Provider Selection */}
          <div className="space-y-1.5">
            <label className="block font-bold uppercase tracking-wider text-[11px] opacity-80">
              Proveedor de Inteligencia Artificial:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'gemini', label: 'Google Gemini', badge: 'Gratis' },
                { id: 'openai', label: 'ChatGPT', badge: 'OpenAI' },
                { id: 'qwen', label: 'Qwen', badge: 'OpenRouter' },
                { id: 'custom', label: 'Personalizado', badge: 'Proxy' }
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => handleProviderChange(item.id as any)}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    provider === item.id
                      ? 'border-[#F25C05] bg-[#F25C05]/10 font-bold shadow-xs'
                      : 'border-inherit opacity-75 hover:opacity-100'
                  }`}
                >
                  <span className="text-[10px] uppercase font-mono text-[#F25C05]">{item.badge}</span>
                  <span className="text-xs mt-1 leading-tight">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* API Key Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] opacity-80">
                <Key className="w-3.5 h-3.5 text-[#F25C05]" />
                Clave API ({provider.toUpperCase()}):
              </label>
              {provider === 'gemini' && (
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-[#00A3E0] hover:underline flex items-center gap-0.5"
                >
                  Obtener gratis en Google AI Studio
                </a>
              )}
            </div>
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
                      : 'sk-or-v1-...'
                }
                className={`w-full rounded-xl py-2.5 pl-3 pr-10 font-mono text-xs border focus:outline-none focus:ring-1 focus:ring-[#F25C05] ${inputBg}`}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 opacity-60 hover:opacity-100 cursor-pointer"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] opacity-70 leading-relaxed">
              Tus credenciales se almacenan únicamente en tu navegador o dispositivo. Al usar tu propia clave, el límite de 2 consultas diarias queda desbloqueado para uso ilimitado.
            </p>
          </div>

          {/* Model Name */}
          <div className="space-y-1.5">
            <label className="block font-bold uppercase tracking-wider text-[11px] opacity-80">
              Modelo a utilizar (opcional):
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder={
                provider === 'gemini'
                  ? 'gemini-3.6-flash'
                  : provider === 'openai'
                    ? 'gpt-4o-mini'
                    : 'qwen/qwen-2.5-72b-instruct'
              }
              className={`w-full rounded-xl py-2 px-3 font-mono text-xs border focus:outline-none focus:ring-1 focus:ring-[#F25C05] ${inputBg}`}
            />
          </div>

          {/* Endpoint (for Qwen or Custom) */}
          {(provider === 'qwen' || provider === 'custom') && (
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] opacity-80">
                <Server className="w-3.5 h-3.5 text-[#00A3E0]" />
                Endpoint URL compatible con OpenAI (opcional):
              </label>
              <input
                type="url"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="https://openrouter.ai/api/v1/chat/completions"
                className={`w-full rounded-xl py-2 px-3 font-mono text-xs border focus:outline-none focus:ring-1 focus:ring-[#F25C05] ${inputBg}`}
              />
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-2 flex items-center justify-between border-t border-inherit">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl opacity-75 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer text-xs"
            >
              Cancelar
            </button>

            <div className="flex items-center gap-3">
              {savedSuccess && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold animate-in fade-in">
                  <CheckCircle className="w-4 h-4" />
                  ¡Guardado!
                </span>
              )}
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#0B2B68] text-[#FED65B] hover:bg-[#0B2B68]/90 transition-all font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Save className="w-4 h-4" />
                Guardar Credenciales
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
