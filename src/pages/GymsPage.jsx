import { gymsOf, gymStatus } from '../game/battle';
import { useGame } from '../store/GameContext';
import { TYPE_NAMES } from '../config/types';
import { formatNumber } from '../utils/format';
import styles from './GymsPage.module.css';

const STATUS_TEXT = {
  won: 'Vencido',
  current: 'Siguiente',
  locked: 'Bloqueado',
};

// Lista de líderes. El combate llega en la fase 5.
export function GymsPage() {
  const { state } = useGame();

  return (
    <div>
      <h2 tabIndex={-1}>Gimnasios</h2>
      <ol className={styles.list}>
        {gymsOf(state).map((gym) => {
          const status = gymStatus(state, gym.number);
          return (
            <li key={gym.number} className={styles.gym} data-state={status}>
              <span className={styles.number}>{gym.number}</span>
              <span className={styles.leader}>
                <strong>{gym.leader}</strong>
                <span>
                  {TYPE_NAMES[gym.type]} · {formatNumber(gym.hp)} de vida
                </span>
              </span>
              <span className={styles.status}>{STATUS_TEXT[status]}</span>
            </li>
          );
        })}
      </ol>
      <p className={styles.soon}>Los combates llegan pronto.</p>
    </div>
  );
}
