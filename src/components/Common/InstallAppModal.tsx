import React from 'react';
import { 
  Download, Monitor, Smartphone, CheckCircle2, 
  X, Sparkles
} from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => void;
  canPrompt: boolean;
  isInstalled: boolean;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  onInstall,
  canPrompt,
  isInstalled,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header with background accent */}
        <div className="relative p-6 bg-gradient-to-br from-emerald-600 to-teal-800 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white p-2 shadow-lg flex items-center justify-center shrink-0 border border-emerald-100">
              <img 
                src="/pwa-192x192.png" 
                alt="AgroPerú Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-100 text-[11px] font-semibold tracking-wide uppercase">
                <Sparkles className="w-3 h-3" /> Aplicación Oficial
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                Descargar AgroPerú ERP
              </h2>
              <p className="text-xs text-emerald-100 mt-0.5">
                Instálala directamente en tu escritorio o celular
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Status banner if already installed */}
          {isInstalled ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-sm">¡AgroPerú ya está instalado!</p>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                  Ya puedes abrirla directamente desde el acceso directo con el logo en tu Escritorio o Inicio.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Direct Action Button */}
              <button
                onClick={onInstall}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <Download className="w-5 h-5" />
                <span>{canPrompt ? 'Instalar ahora en tu equipo' : 'Ver cómo instalar en tu equipo'}</span>
              </button>

              {/* Instructions per platform */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Instrucciones según tu navegador
                </h3>

                {/* Desktop Instructions */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-xs text-slate-800 dark:text-slate-200">
                    <Monitor className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>En Computadora (Chrome / Edge / Brave):</span>
                  </div>
                  <ol className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-decimal list-inside pl-1 leading-relaxed">
                    <li>
                      Presiona el botón verde de arriba o busca el icono <strong className="text-slate-900 dark:text-white">💻 / ⤓ (Instalar)</strong> en la barra de direcciones de tu navegador.
                    </li>
                    <li>
                      Haz clic en <strong className="text-emerald-600 dark:text-emerald-400">"Instalar"</strong>.
                    </li>
                    <li>
                      ¡Listo! Se creará el acceso directo con el logo de AgroPerú en tu <strong className="text-slate-900 dark:text-white">Escritorio</strong> y menú de inicio.
                    </li>
                  </ol>
                </div>

                {/* Mobile Instructions */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-xs text-slate-800 dark:text-slate-200">
                    <Smartphone className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>En Celular (Android / iOS):</span>
                  </div>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside pl-1 leading-relaxed">
                    <li>
                      <strong>Android:</strong> Toca el menú de tres puntos (⋮) en Chrome y pulsa <strong className="text-slate-900 dark:text-white">"Instalar aplicación"</strong> o "Agregar a la pantalla principal".
                    </li>
                    <li>
                      <strong>iPhone (Safari):</strong> Toca el botón Compartir (⎋) y selecciona <strong className="text-slate-900 dark:text-white">"Agregar al inicio"</strong>.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Benefits list */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="p-2.5 rounded-lg bg-emerald-50/50 dark:bg-slate-800/60 border border-emerald-100 dark:border-slate-800">
                  <div className="text-emerald-600 font-bold text-xs">🚀 Escritorio</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Logo y acceso 1 clic</div>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-50/50 dark:bg-slate-800/60 border border-emerald-100 dark:border-slate-800">
                  <div className="text-emerald-600 font-bold text-xs">⚡ Rápida</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Carga sin demoras</div>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-50/50 dark:bg-slate-800/60 border border-emerald-100 dark:border-slate-800">
                  <div className="text-emerald-600 font-bold text-xs">🖥️ Pantalla libre</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Sin barras web</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
