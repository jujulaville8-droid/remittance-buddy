interface DoodleProps {
  readonly className?: string;
}

/** Hand-drawn paper airplane being thrown */
export function PaperAirplane({ className = '' }: DoodleProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* airplane body */}
      <path
        d="M8 32L54 10L38 54L30 36L8 32Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.08"
      />
      {/* fold line */}
      <path
        d="M30 36L54 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* motion trail lines */}
      <path d="M4 28C6 27 8 28 6 30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M2 35C4 34 7 35 4 37" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <path d="M6 22C8 21 9 23 7 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

/** Hand-drawn coin/money with a happy face */
export function HappyCoin({ className = '' }: DoodleProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
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
export function GlobeHeart({ className = '' }: DoodleProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
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
export function SparklesBurst({ className = '' }: DoodleProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
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
export function WavyLine({ className = '' }: DoodleProps) {
  return (
    <svg viewBox="0 0 120 12" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
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
