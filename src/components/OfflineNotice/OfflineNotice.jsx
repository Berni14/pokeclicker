import { useGame } from '../../store/GameContext';
import { formatDuration, formatNumber } from '../../utils/format';
import styles from './OfflineNotice.module.css';

// «Mientras no estabas…»: lo que produjo el equipo desde el último guardado.
export function OfflineNotice() {
  const { state, dispatch } = useGame();
  const earnings = state.offlineEarnings;
  if (!earnings) return null;

  return (
    <div className={styles.notice} role="status">
      <p>
        Mientras no estabas ({formatDuration(earnings.seconds)}), tu equipo ganó{' '}
        <strong>{formatNumber(Math.floor(earnings.coins))} monedas</strong>.
      </p>
      <button
        type="button"
        className="button button-secondary"
        onClick={() => dispatch({ type: 'DISMISS_OFFLINE' })}
      >
        ¡Genial!
      </button>
    </div>
  );
}
