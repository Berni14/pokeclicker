import { useEffect, useRef } from 'react';
import { AUTOSAVE_MS } from '../config/economy';
import { saveGame } from '../store/persistence';
import { useGame } from '../store/GameContext';

// Guarda la partida cada AUTOSAVE_MS, al ocultar la pestaña (cambiar de
// pestaña, minimizar, bloquear el móvil) y al cerrar o recargar la página.
export function useAutosave() {
  const { state } = useGame();

  // El intervalo se crea una sola vez y lee siempre el estado más reciente.
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });

  useEffect(() => {
    const save = () => saveGame(stateRef.current);
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') save();
    };

    const id = setInterval(save, AUTOSAVE_MS);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', save);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pagehide', save);
      save();
    };
  }, []);
}
