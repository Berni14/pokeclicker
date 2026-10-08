import { useCallback, useEffect, useState } from 'react';
import { getPokemonByIds } from '../services/pokemonService';
import { useGame } from '../store/GameContext';

// Pide a la API los datos para pintar (nombre, imagen…) de los Pokémon de tu
// colección que aún no están en el store. Se usa una sola vez, en App.
export function useOwnedPokemon() {
  const { state, dispatch } = useGame();
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  // Texto con los ids que faltan: el efecto solo se repite si cambia.
  const missing = Object.keys(state.collection)
    .filter((id) => !state.pokemonById[id])
    .join(',');

  useEffect(() => {
    if (!missing) return;
    const controller = new AbortController();
    getPokemonByIds(missing.split(',').map(Number))
      .then((pokemon) => {
        if (controller.signal.aborted) return;
        setError(null);
        dispatch({ type: 'POKEMON_LOADED', pokemon });
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err.message);
      });
    return () => controller.abort();
  }, [missing, attempt, dispatch]);

  const retry = useCallback(() => {
    setError(null);
    setAttempt((n) => n + 1);
  }, []);

  return { loading: missing !== '' && !error, error, retry };
}
