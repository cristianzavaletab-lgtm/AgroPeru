import React from 'react';

interface LogoProps {
  className?: string;
  compact?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', compact = false }) => (
  <div className={`select-none ${className}`} aria-label="Agroimportadora Perú E.I.R.L.">
    <img
      src="/logo-agroimportadora.png"
      alt="Agroimportadora Perú E.I.R.L. - Fertilizantes y Agroquímicos"
      className={`${compact ? 'h-10 w-auto max-w-[230px]' : 'h-auto w-[260px] max-w-full'} object-contain dark:hidden`}
    />
    <img
      src="/logo-agroimportadora-dark.png"
      alt="Agroimportadora Perú E.I.R.L. - Fertilizantes y Agroquímicos"
      className={`${compact ? 'h-10 w-auto max-w-[230px]' : 'h-auto w-[260px] max-w-full'} hidden object-contain dark:block`}
    />
  </div>
);
