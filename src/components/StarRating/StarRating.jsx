import { MAX_STARS } from '../../config/gacha';
import styles from './StarRating.module.css';

export function StarRating({ stars }) {
  return (
    <span className={styles.stars}>
      <span aria-hidden="true">
        {'★'.repeat(stars)}
        <span className={styles.empty}>{'★'.repeat(MAX_STARS - stars)}</span>
      </span>
      <span className="visually-hidden">
        {stars} de {MAX_STARS} estrellas
      </span>
    </span>
  );
}
