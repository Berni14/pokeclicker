import { useId } from 'react';

// Colores de cada bola (premier = Honor Ball). `band` es la franja del centro y el borde del botón.
const BALLS = {
  poke: { top: '#e3350d', band: '#222' },
  super: { top: '#2f6fd6', band: '#222' },
  ultra: { top: '#222', band: '#222' },
  master: { top: '#7a3db8', band: '#222' },
  premier: { top: '#f4f5f7', band: '#e3350d' },
};

// Dibujo de la bola. Es decorativo: quien la usa pone el texto accesible.
export function PokeBall({ type = 'poke', className }) {
  const clipId = useId();
  const { top, band } = BALLS[type];

  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id={clipId}>
          <path d="M4 50a46 46 0 0 1 92 0z" />
        </clipPath>
      </defs>
      <circle cx="50" cy="50" r="46" fill="#f4f5f7" />
      <path d="M4 50a46 46 0 0 1 92 0z" fill={top} />

      <g clipPath={`url(#${clipId})`}>
        {type === 'super' && (
          <>
            <ellipse
              cx="24"
              cy="24"
              rx="9"
              ry="17"
              fill="#e3350d"
              transform="rotate(-40 24 24)"
            />
            <ellipse
              cx="76"
              cy="24"
              rx="9"
              ry="17"
              fill="#e3350d"
              transform="rotate(40 76 24)"
            />
          </>
        )}
        {type === 'ultra' && (
          <>
            <rect x="10" y="0" width="18" height="50" fill="#f6c700" />
            <rect x="72" y="0" width="18" height="50" fill="#f6c700" />
          </>
        )}
        {type === 'master' && (
          <>
            <circle cx="26" cy="30" r="8" fill="#e85fa6" />
            <circle cx="74" cy="30" r="8" fill="#e85fa6" />
            <path
              d="M38 34V16l12 11 12-11v18"
              fill="none"
              stroke="#f4f5f7"
              strokeWidth="4"
              strokeLinejoin="round"
            />
          </>
        )}
      </g>

      <rect x="4" y="46" width="92" height="8" fill={band} />
      <circle
        cx="50"
        cy="50"
        r="46"
        fill="none"
        stroke="#222"
        strokeWidth="4"
      />
      <circle
        cx="50"
        cy="50"
        r="13"
        fill="#f4f5f7"
        stroke={band}
        strokeWidth="5"
      />
    </svg>
  );
}
