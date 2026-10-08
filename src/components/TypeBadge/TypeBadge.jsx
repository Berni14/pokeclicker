import { TYPE_COLORS, TYPE_NAMES } from '../../config/types';
import styles from './TypeBadge.module.css';

export function TypeBadge({ type }) {
  return (
    <span
      className={styles.badge}
      style={{ '--type-color': TYPE_COLORS[type] }}
    >
      {TYPE_NAMES[type] ?? type}
    </span>
  );
}
