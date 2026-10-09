import { memo } from 'react';
import { formatNumber } from '../../utils/format';
import styles from './UpgradeCard.module.css';

// status: 'locked' | 'available' | 'max'. El estado se dice con texto, no solo
// con color.
export const UpgradeCard = memo(function UpgradeCard({
  upgradeKey,
  upgrade,
  level,
  cost,
  status,
  canAfford,
  onBuy,
}) {
  return (
    <article className={styles.card} data-state={status}>
      <h4 className={styles.title}>{upgrade.label}</h4>
      <p className={styles.effect}>{upgrade.effect}</p>
      <p className={styles.level}>
        Nv {level}/{upgrade.maxLevel}
      </p>

      {status === 'locked' && (
        <p className={styles.note}>
          Se desbloquea en el nivel {upgrade.minTrainerLevel} de entrenador
        </p>
      )}
      {status === 'max' && <p className={styles.note}>Máximo</p>}
      {status === 'available' && (
        <button
          type="button"
          className="button"
          disabled={!canAfford}
          onClick={() => onBuy(upgradeKey)}
        >
          Mejorar · {formatNumber(cost)}
        </button>
      )}
    </article>
  );
});
