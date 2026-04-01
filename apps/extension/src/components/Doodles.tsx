import type { CSSProperties } from 'react';

interface DoodleProps {
  readonly className?: string;
  readonly style?: CSSProperties;
}

/** Continuous line art — person throwing a paper airplane with flight trail */
export function PaperAirplane({ className = '', style }: DoodleProps) {
  return (
    <svg viewBox="0 0 200 120" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      {/* Person — continuous line from feet up through throwing arm */}
      <path
        d="M32 115 C32 115 30 108 33 100 C36 92 34 85 36 80 C38 75 35 70 37 65 C39 60 36 55 40 50 C42 47 40 44 42 40 C44 36 48 34 46 30 C44 26 46 22 50 20 C54 18 56 20 56 24 C56 26 54 28 52 28 C50 28 49 26 50 24"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Head */}
      <path
        d="M50 24 C50 18 54 14 58 16 C62 18 60 24 56 26 C54 27 52 27 52 28"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Throwing arm extended upward */}
      <path
        d="M46 38 C50 34 54 28 60 24 C64 22 68 18 74 14 C78 12 80 10 84 10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Other arm */}
      <path
        d="M44 42 C42 46 38 50 36 52 C34 54 34 56 36 56"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Flight trail — sweeping curve from hand to airplane */}
      <path
        d="M84 10 C90 8 100 12 110 8 C120 4 130 10 140 6 C148 3 155 8 162 5 C168 3 172 6 176 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Paper airplane at end of trail */}
      <path
        d="M176 4 L188 8 L178 12 L176 4 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.1"
      />
      {/* Airplane fold line */}
      <path
        d="M176 4 L180 9"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
      {/* Ground line */}
      <path
        d="M10 116 C18 115 26 116 40 115 C50 114 55 116 65 115"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.3"
      />
    </svg>
  );
}

/** Small paper airplane only (for headers) */
export function PaperAirplaneSmall({ className = '', style }: DoodleProps) {
  return (
    <svg viewBox="0 0 48 32" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      {/* Trail */}
      <path
        d="M2 20 C8 18 14 22 20 18 C26 14 30 18 36 14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Airplane */}
      <path
        d="M36 14 L46 10 L40 18 L36 14 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <path d="M36 14 L42 13" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

/** Hand-drawn coin/money with a happy face */
export function HappyCoin({ className = '', style }: DoodleProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      {/* coin circle - slightly wobbly */}
      <path
        d="M24 6C13 5.5 5 13 5.5 24C6 35 14 43 24 42.5C34 42 42 34 42.5 24C43 14 35 6.5 24 6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="currentColor"
        fillOpacity="0.06"
      />
      {/* dollar sign */}
      <path
        d="M24 14V16M24 32V34M20 19C20 17 22 16 24 16C26 16 28 17.5 28 19.5C28 22 24 22 24 24C24 26 24 26 24 26M20 29C20 31 22 32 24 32C26 32 28 31 28 29"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* sparkle dots */}
      <circle cx="10" cy="10" r="1" fill="currentColor" opacity="0.3" />
      <circle cx="38" cy="8" r="1.5" fill="currentColor" opacity="0.25" />
      <circle cx="40" cy="38" r="1" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

/** Hand-drawn globe with a heart */
export function GlobeHeart({ className = '', style }: DoodleProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      {/* globe circle */}
      <circle cx="24" cy="24" r="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="currentColor" fillOpacity="0.05" />
      {/* latitude lines */}
      <path d="M7 24C7 24 15 20 24 20C33 20 41 24 41 24" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
      <path d="M9 17C9 17 16 15 24 15C32 15 39 17 39 17" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.2" />
      <path d="M9 31C9 31 16 33 24 33C32 33 39 31 39 31" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.2" />
      {/* meridian */}
      <ellipse cx="24" cy="24" rx="8" ry="17" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.25" />
      {/* small heart */}
      <path
        d="M24 29C24 29 19 25 19 22C19 20 20.5 19 22 19C23 19 24 20 24 20C24 20 25 19 26 19C27.5 19 29 20 29 22C29 25 24 29 24 29Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Hand-drawn sparkle/star burst */
export function SparklesBurst({ className = '', style }: DoodleProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M16 4L18 12L26 10L20 16L26 22L18 20L16 28L14 20L6 22L12 16L6 10L14 12L16 4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.08"
      />
      {/* extra tiny sparkles */}
      <circle cx="28" cy="4" r="1" fill="currentColor" opacity="0.4" />
      <circle cx="4" cy="6" r="0.8" fill="currentColor" opacity="0.3" />
      <circle cx="28" cy="28" r="1.2" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

/** Wavy underline decoration */
export function WavyLine({ className = '', style }: DoodleProps) {
  return (
    <svg viewBox="0 0 120 12" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2 6C12 2 18 10 28 6C38 2 44 10 54 6C64 2 70 10 80 6C90 2 96 10 106 6C110 4.5 114 3 118 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.3"
      />
    </svg>
  );
}
