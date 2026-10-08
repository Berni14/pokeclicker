import { useEffect } from 'react';
import { TICK_MS } from '../config/economy';
import { useGame } from '../store/GameContext';

// Un único intervalo para toda la app. Mide el tiempo real pasado: si el
// navegador ralentiza la pestaña en segundo plano, no se pierde producción.
export function useGameLoop() {
  const { dispatch } = useGame();

  useEffect(() => {
    let last = Date.now();
    const id = setInterval(() => {
      const now = Date.now();
      dispatch({ type: 'TICK', seconds: (now - last) / 1000 });
      last = now;
    }, TICK_MS);
    return () => clearInterval(id);
  }, [dispatch]);
}
