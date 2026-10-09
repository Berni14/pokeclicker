import { BERRIES } from '../../config/berries';

// Dibujo de una baya con el color de su tipo. Es decorativo: quien la usa pone
// el texto accesible.
export function Berry({ type, size = 24, className }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 7c1-3 3-4 6-4-1 3-3 4-6 4z" fill="#3d7a28" />
      <path d="M12 8V5" stroke="#5c4a2a" strokeWidth="1.5" />
      <circle cx="12" cy="14.5" r="7.5" fill={BERRIES[type].color} />
      <circle cx="9.5" cy="12" r="2" fill="#fff" opacity="0.45" />
    </svg>
  );
}
