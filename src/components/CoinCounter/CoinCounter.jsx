import { BOOSTS } from '../../config/items';
import { xpToNextLevel } from '../../config/trainer';
import { boostTimeLeft } from '../../game/items';
import { teamProduction } from '../../game/production';
import { useGame } from '../../store/GameContext';
import { formatClock, formatNumber } from '../../utils/format';
import styles from './CoinCounter.module.css';

// Sin aria-live a propósito: si no, el lector de pantalla leería las monedas
// en cada tick.
export function CoinCounter() {
  const { state } = useGame();
  const { level, xp } = state.trainer;
  const nextLevelXp = xpToNextLevel(level);
  const activeBoosts = Object.entries(BOOSTS).filter(
    ([key]) => boostTimeLeft(state, key) > 0,
  );

  return (
    <div className={styles.counter}>
      <p className={styles.coins}>
        <span className={styles.coin} aria-hidden="true" />
        <span className="visually-hidden">Monedas:</span>
        {formatNumber(Math.floor(state.coins))}
      </p>
      <p className={styles.production}>
        {formatNumber(teamProduction(state))}{' '}
        <abbr title="monedas por segundo">/s</abbr>
      </p>
      {activeBoosts.length > 0 && (
        <ul className={styles.boosts} aria-label="Potenciadores activos">
          {activeBoosts.map(([key, boost]) => (
            <li key={key}>
              {boost.label} {formatClock(boostTimeLeft(state, key))}
            </li>
          ))}
        </ul>
      )}
      <div className={styles.trainer}>
        <span>Entrenador nv. {level}</span>
        <progress
          className={styles.xp}
          value={xp}
          max={nextLevelXp}
          aria-label={`Experiencia: ${xp} de ${nextLevelXp}`}
        />
      </div>
    </div>
  );
}
