import styles from './CardGrid.module.css';

// Rejilla de tarjetas. Cada hijo tiene que ser un <li> con su `key`.
export function CardGrid({ children, label }) {
  return (
    <ul className={styles.grid} aria-label={label}>
      {children}
    </ul>
  );
}
