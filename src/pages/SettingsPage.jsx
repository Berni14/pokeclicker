import { useState } from 'react';
import { Modal } from '../components/Modal/Modal';
import { useGame } from '../store/GameContext';
import styles from './SettingsPage.module.css';

export function SettingsPage() {
  const { dispatch } = useGame();
  const [confirming, setConfirming] = useState(false);

  function handleReset() {
    dispatch({ type: 'RESET' });
    setConfirming(false);
  }

  return (
    <div>
      <h2 tabIndex={-1}>Ajustes</h2>
      <button
        type="button"
        className="button"
        onClick={() => setConfirming(true)}
      >
        Reiniciar partida
      </button>

      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="¿Reiniciar la partida?"
      >
        <p>
          Perderás tus monedas, Pokémon, mejoras, nivel y medallas. No se puede
          deshacer.
        </p>
        <div className={styles.actions}>
          <button
            type="button"
            className="button button-secondary"
            onClick={() => setConfirming(false)}
          >
            Cancelar
          </button>
          <button type="button" className="button" onClick={handleReset}>
            Sí, reiniciar
          </button>
        </div>
      </Modal>
    </div>
  );
}
