import React, { useState } from 'react';
import { Lightbulb, ChevronUp, ChevronDown } from 'lucide-react';

interface GuidedBannerProps {
  title: string;
  description: string;
  steps?: string[];
  moduleName: string;
}

export const GuidedBanner: React.FC<GuidedBannerProps> = ({ title, description, steps, moduleName }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-900/90 border border-brand-green/40 p-4 sm:p-5 shadow-lg relative overflow-hidden transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-green to-emerald-600 flex items-center justify-center shrink-0 shadow-md shadow-brand-green/30">
            <Lightbulb className="w-5 h-5 text-amber-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-green/20 text-emerald-400 border border-brand-green/30">
                Guía de Uso: {moduleName}
              </span>
              <span className="text-[10px] font-medium text-slate-400 hidden sm:inline">Explicación en lenguaje sencillo</span>
            </div>
            <h3 className="text-sm font-bold text-white mt-1">{title}</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{description}</p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          title={isOpen ? 'Ocultar pasos' : 'Ver pasos'}
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && steps && steps.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-2">
          {steps.map((step, idx) => (
            <div key={idx} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-brand-red text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                {idx + 1}
              </span>
              <span className="text-[11px] text-slate-300 font-medium leading-tight">{step}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
