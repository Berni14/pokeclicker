import { clickValue } from '../../game/clicker';
import { useGame } from '../../store/GameContext';
import { formatNumber } from '../../utils/format';
import styles from './ClickButton.module.css';

export function ClickButton() {
  const { state, dispatch } = useGame();

  return (
    <button
      type="button"
      className={styles.button}
      onClick={() => dispatch({ type: 'CLICK' })}
    >
      <span className={styles.ball} aria-hidden="true" />
      <span className={styles.label}>
        Click: +{formatNumber(clickValue(state))}
      </span>
    </button>
  );
}
