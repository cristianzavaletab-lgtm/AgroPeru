import React from 'react';
import { Handshake } from 'lucide-react';

interface LogoProps {
  className?: string;
  compact?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', compact = false }) => {
  return (
    <div className={`flex flex-col select-none ${className}`}>
      {/* Top Main Logo */}
      <div className="flex items-center justify-center tracking-tighter">
        <span className="text-[#1A5C3D] dark:text-[#388E3C] font-black italic text-3xl sm:text-4xl leading-none" style={{ fontFamily: 'Impact, sans-serif' }}>
          AGR
        </span>
        
        {/* Custom SVG for the 'O' Drop/Sprout */}
        <div className="relative mx-0.5 flex items-center justify-center w-8 h-10 sm:w-10 sm:h-12">
          <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-sm">
            {/* Drop background - left side dark green, right side light green */}
            <path d="M50 0 C50 0 10 50 10 80 C10 102.09 27.91 120 50 120 C72.09 120 90 102.09 90 80 C90 50 50 0 50 0 Z" fill="#2E7D32" />
            <path d="M50 0 C50 0 90 50 90 80 C90 102.09 72.09 120 50 120 V0 Z" fill="#66BB6A" />
            {/* Sprout inside */}
            <path d="M50 105 C50 85 40 70 30 60" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
            <path d="M50 95 C50 75 60 65 75 55" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
            <path d="M50 115 V60" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
            <circle cx="30" cy="60" r="4" fill="#FFFFFF" />
            <circle cx="75" cy="55" r="4" fill="#FFFFFF" />
            <circle cx="50" cy="58" r="4" fill="#FFFFFF" />
          </svg>
        </div>

        <span className="text-[#C84B31] dark:text-[#E64A19] font-black italic text-3xl sm:text-4xl leading-none" style={{ fontFamily: 'Impact, sans-serif' }}>
          PERÚ
        </span>
      </div>

      {!compact && (
        <div className="flex flex-col items-center mt-1">
          {/* Subtitle */}
          <div className="text-[9px] sm:text-[11px] font-bold tracking-[0.2em] text-slate-500 dark:text-slate-300 uppercase leading-none">
            Fertilizantes & Agroquímicos
          </div>
          
          {/* Divider line */}
          <div className="w-full h-px bg-slate-300 dark:bg-slate-600 my-1.5" />
          
          {/* Bottom Slogan */}
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-200">
            <Handshake className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1A5C3D] dark:text-[#388E3C] shrink-0" strokeWidth={2.5} />
            <span className="text-[10px] sm:text-xs font-semibold italic tracking-tight">
              ...de la mano con la Agricultura
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
