import React, { useState, useEffect, useRef } from 'react';
import { Wifi, WifiOff, Download, CheckCircle2, AlertCircle, HardDrive, Pause, Play, RefreshCw, Zap } from 'lucide-react';
import { offlineDownloader, OfflineStatus, countStoredChapters, clearOfflineBible } from '../services/offlineBibleService';
import { BIBLE_BOOKS } from '../data/bibleData';

interface OfflineDownloadManagerProps {
  onToast: (msg: string, durationMs?: number) => void;
  onCloseToast?: () => void;
  currentTranslation?: string;
}

export const OfflineDownloadManager: React.FC<OfflineDownloadManagerProps> = ({
  onToast,
  onCloseToast,
  currentTranslation = 'RVR1960'
}) => {
  const [status, setStatus] = useState<OfflineStatus>(() => offlineDownloader.getStatus());
  const [showDetailModal, setShowDetailModal] = useState(false);
  const wasDownloadingRef = useRef(false);

  useEffect(() => {
    const unsub = offlineDownloader.subscribe((newStatus) => {
      // If was previously downloading and now finished 100% (complete)
      if (wasDownloadingRef.current && !newStatus.isDownloading && newStatus.isComplete) {
        if (onCloseToast) onCloseToast();
        onToast(`¡Descarga finalizada! Todos los libros (${currentTranslation}) listos sin conexión.`, 3000);
      }
      wasDownloadingRef.current = newStatus.isDownloading;
      setStatus(newStatus);
    });
    return () => unsub();
  }, [onToast, onCloseToast, currentTranslation]);

  const handleStartDownload = () => {
    offlineDownloader.startDownload(currentTranslation);
    onToast(`Descarga en segundo plano iniciada (${currentTranslation})`, 3000);
  };

  const handlePauseDownload = () => {
    offlineDownloader.pauseDownload();
    if (onCloseToast) onCloseToast();
    onToast('Descarga pausada', 2500);
  };

  const handleClearCache = async () => {
    if (window.confirm('¿Deseas vaciar la base de datos sin conexión de la Biblia? Tendrás que volver a sincronizarla.')) {
      await clearOfflineBible();
      const newCount = await countStoredChapters();
      setStatus((prev) => ({ ...prev, downloadedChapters: newCount, isComplete: false, progressPercent: 0 }));
      if (onCloseToast) onCloseToast();
      onToast('Caché sin conexión limpiado', 2500);
    }
  };

  return (
    <>
      {/* Floating Offline & WiFi Status Chip (hides automatically when 100% complete) */}
      {!status.isComplete && (
        <div
          id="offline-sync-floating-chip"
          className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-30 flex items-center gap-2 bg-[#FAF8F5]/95 backdrop-blur-md border border-[#0B2B68]/15 shadow-lg rounded-full p-1.5 pl-3 pr-2 transition-all hover:scale-102 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <button
            onClick={() => setShowDetailModal(true)}
            className="flex items-center gap-2 text-xs font-semibold text-[#0B2B68] cursor-pointer"
          >
            {status.isOnline ? (
              <span className="flex items-center gap-1 text-[#107C41]">
                <Wifi className="w-3.5 h-3.5" />
                <span className="text-[11px] font-label-caps">{status.isWifi ? 'WiFi' : 'Datos'}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[#BA1A1A]">
                <WifiOff className="w-3.5 h-3.5" />
                <span className="text-[11px] font-label-caps">Modo Offline</span>
              </span>
            )}

            <div className="h-3 w-[1px] bg-[#0B2B68]/15" />

            {status.isDownloading ? (
              <span className="flex items-center gap-1.5 text-[#F25C05] text-[11px] font-bold animate-pulse">
                <Download className="w-3.5 h-3.5 animate-bounce" />
                <span>Descargando ({status.progressPercent}%)</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[#454652] text-[11px]">
                <HardDrive className="w-3.5 h-3.5 text-[#F25C05]" />
                <span>{status.downloadedChapters}/{status.totalChapters}</span>
              </span>
            )}
          </button>

          {status.isDownloading ? (
            <button
              onClick={handlePauseDownload}
              className="p-1 rounded-full bg-[#EAE8E3] hover:bg-[#DEDCD7] text-[#0B2B68] transition-colors"
              title="Pausar descarga"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleStartDownload}
              className="p-1 rounded-full bg-[#F25C05] hover:bg-[#EA580C] text-white transition-colors"
              title="Iniciar descarga completa en segundo plano"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          )}
        </div>
      )}

      {/* Detail Manager Modal */}
      {showDetailModal && (
        <div
          id="offline-manager-modal-backdrop"
          className="fixed inset-0 z-50 bg-[#000666]/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            id="offline-manager-modal-content"
            className="w-full max-w-md bg-[#FBF9F4] rounded-2xl shadow-2xl border border-[#C6C5D4] p-5 sm:p-6 space-y-4 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#C6C5D4]/70 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FED65B]/40 flex items-center justify-center text-[#735C00]">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display-scripture text-xl text-[#000666] font-bold">
                    Biblia Completa Offline
                  </h3>
                  <p className="text-xs font-label-caps text-[#767683]">
                    Almacenamiento Local en IndexedDB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-xs font-semibold text-[#767683] hover:text-[#000666] p-1.5 rounded-lg"
              >
                Cerrar
              </button>
            </div>

            {/* WiFi & Network Info Card */}
            <div className="bg-[#FFFFFF] p-3.5 rounded-xl border border-[#C6C5D4] space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-[#454652] flex items-center gap-1.5">
                  <Wifi className="w-4 h-4 text-[#735C00]" />
                  Estado de Red:
                </span>
                <span className={`font-bold ${status.isOnline ? 'text-[#107C41]' : 'text-[#BA1A1A]'}`}>
                  {status.isOnline ? (status.isWifi ? 'Conectado a WiFi' : 'Datos Móviles') : 'Sin Conexión'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-[#454652] flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-[#735C00]" />
                  Descarga automática:
                </span>
                <span className="text-[#000666] font-bold">
                  Activa en WiFi
                </span>
              </div>
            </div>

            {/* Progress Display */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[#000666]">Progreso de sincronización:</span>
                <span className="text-[#735C00]">{status.downloadedChapters} de {status.totalChapters} capítulos ({status.progressPercent}%)</span>
              </div>

              <div className="w-full h-3 bg-[#EAE8E3] rounded-full overflow-hidden border border-[#C6C5D4]">
                <div
                  className="h-full bg-gradient-to-r from-[#735C00] to-[#FED65B] transition-all duration-300 rounded-full"
                  style={{ width: `${status.progressPercent}%` }}
                />
              </div>

              {status.isDownloading && status.activeBookName && (
                <p className="text-[11px] text-[#767683] italic flex items-center gap-1 animate-pulse">
                  <Download className="w-3 h-3 text-[#735C00]" />
                  Descargando en segundo plano: {status.activeBookName} {status.activeChapterNum}...
                </p>
              )}
            </div>

            {/* Explanation & Benefits */}
            <div className="bg-[#FED65B]/15 border border-[#FED65B] p-3 rounded-xl text-xs text-[#454652] leading-relaxed">
              <p className="font-semibold text-[#000666] mb-1">💡 ¿Cómo funciona?</p>
              La app descarga todos los 66 libros bíblicos (1,189 capítulos) en segundo plano para que puedas leer las Escrituras en el avión, en retiros espirituales o lugares sin señal ni WiFi.
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                onClick={handleClearCache}
                className="text-xs text-[#BA1A1A] hover:underline font-semibold p-2"
              >
                Limpiar base local
              </button>

              {status.isDownloading ? (
                <button
                  onClick={handlePauseDownload}
                  className="px-4 py-2 rounded-xl bg-[#EAE8E3] text-[#000666] text-xs font-bold hover:bg-[#DEDCD7] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Pause className="w-3.5 h-3.5" />
                  Pausar Descarga
                </button>
              ) : !status.isComplete ? (
                <button
                  onClick={handleStartDownload}
                  className="px-4 py-2 rounded-xl bg-[#000666] text-[#FED65B] text-xs font-bold hover:bg-[#000666]/90 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar Ahora
                </button>
              ) : (
                <span className="text-xs text-[#107C41] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Todos los libros listos
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
