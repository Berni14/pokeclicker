import { memo } from 'react';
import { formatClock, formatNumber } from '../../utils/format';
import styles from './ItemCard.module.css';

const NOTES = {
  owned: 'Comprado',
  full: 'Tiempo al máximo',
};

// Objeto permanente o potenciador de la tienda.
// status: 'locked' | 'available' | 'owned' (objeto) | 'full' (potenciador).
// `timeLeft` solo en potenciadores: segundos que le quedan (0 si no está activo).
export const ItemCard = memo(function ItemCard({
  itemKey,
  item,
  status,
  cost,
  canAfford,
  timeLeft = 0,
  onBuy,
}) {
  return (
    <article className={styles.card} data-state={status}>
      <h4 className={styles.title}>{item.label}</h4>
      <p className={styles.effect}>{item.effect}</p>

      {timeLeft > 0 && (
        <p className={styles.active}>
          Activo: <span className={styles.clock}>{formatClock(timeLeft)}</span>
        </p>
      )}

      {status === 'locked' && (
        <p className={styles.note}>
          Se desbloquea en el nivel {item.minTrainerLevel} de entrenador
        </p>
      )}
      {NOTES[status] && <p className={styles.note}>{NOTES[status]}</p>}
      {status === 'available' && (
        <button
          type="button"
          className="button"
          disabled={!canAfford}
          onClick={() => onBuy(itemKey)}
        >
          {timeLeft > 0 ? 'Alargar' : 'Comprar'} · {formatNumber(cost)}
        </button>
      )}
    </article>
  );
});
