import { useEffect } from 'react';
import { BATTLE_TICK_MS } from '../config/gyms';

// Mientras `running` sea true, llama a onTick(segundos) cada BATTLE_TICK_MS con
// el tiempo real pasado. Se para y se limpia al terminar el combate o al salir
// de la pantalla. `onTick` tiene que ser estable (useCallback).
export function useBattleTimer(running, onTick) {
  useEffect(() => {
    if (!running) return;
    let last = Date.now();
    const id = setInterval(() => {
      const now = Date.now();
      onTick((now - last) / 1000);
      last = now;
    }, BATTLE_TICK_MS);
    return () => clearInterval(id);
  }, [running, onTick]);
}
