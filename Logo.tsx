import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', showText = true, size = 'md' }) => {
  const iconDimensions = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  }[size];

  const textSizes = {
    sm: 'text-sm tracking-widest',
    md: 'text-base tracking-[0.2em]',
    lg: 'text-xl tracking-[0.25em]',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* 
        Custom T-S Interlocking Monogram:
        Letter 'T' forms the structural architectural crossbar & central stem.
        Letter 'S' wraps dynamically over the top bar and entwines across the stem.
      */}
      <div className={`relative ${iconDimensions} shrink-0 flex items-center justify-center`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-xs"
        >
          {/* Subtle background container plate for luxury presence */}
          <rect width="100" height="100" rx="20" fill="#18181B" />

          {/* Letter 'T': Architectural horizontal bar & vertical stem */}
          <path
            d="M 22 26 H 78 V 35 H 55 V 82 H 45 V 35 H 22 Z"
            fill="#F4F4F5"
          />

          {/* 
            Letter 'S' layered on the 'T':
            Flowing continuous ribbon that wraps smoothly across the T-bar and stem
          */}
          <path
            d="M 66 38 C 66 30 58 24 49 24 C 38 24 33 30 33 38 C 33 46 40 50 50 53 C 62 56 68 61 68 70 C 68 80 58 86 48 86 C 36 86 31 79 30 71 L 39 69 C 40 75 43 78 48 78 C 53 78 58 75 58 69 C 58 64 54 60 44 57 C 34 54 24 49 24 38 C 24 27 34 16 50 16 C 65 16 75 25 75 38 Z"
            fill="#FFFFFF"
            fillOpacity="0.95"
            stroke="#18181B"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Subtle stitch dash accent along S contour for "Stich" motif */}
          <path
            d="M 64 36 C 64 28 56 22 49 22 C 37 22 34 28 34 36 C 34 43 40 48 50 51 C 60 54 66 59 66 68 C 66 77 56 83 48 83 C 38 83 33 77 32 70"
            stroke="#71717A"
            strokeWidth="1.5"
            strokeDasharray="2 3"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {showText && (
        <span className={`font-bold font-display uppercase text-neutral-900 ${textSizes}`}>
          TICHSTICH
        </span>
      )}
    </div>
  );
};
