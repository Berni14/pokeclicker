import styles from './CardGrid.module.css';

// Rejilla de tarjetas. Cada hijo tiene que ser un <li> con su `key`.
// `minWidth` es el ancho mínimo de cada tarjeta (por defecto, 150px).
export function CardGrid({ children, label, minWidth }) {
  return (
    <ul
      className={styles.grid}
      aria-label={label}
      style={minWidth ? { '--card-min-width': minWidth } : undefined}
    >
      {children}
    </ul>
  );
}
