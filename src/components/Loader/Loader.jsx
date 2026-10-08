import styles from './Loader.module.css';

// Esqueleto con la forma de una tarjeta, mientras llegan los datos.
export function Loader({ label = 'Cargando…' }) {
  return (
    <div className={styles.skeleton} role="status">
      <div className={styles.image} />
      <div className={styles.line} />
      <div className={`${styles.line} ${styles.short}`} />
      <span className="visually-hidden">{label}</span>
    </div>
  );
}
