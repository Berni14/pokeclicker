import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useOwnedPokemon } from './usePokemon';
import { GameProvider, useGame } from '../store/GameContext';
import { clearCache } from '../services/cache';
import { mockPokeApi } from '../__mocks__/fetchPokeApi';
import { makeState } from '../__mocks__/gameState';

beforeEach(() => {
  clearCache();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// Devuelve lo del hook y el estado del juego, para ver qué llega al store.
function renderOwned(state) {
  const wrapper = ({ children }) => (
    <GameProvider initial={makeState(state)}>{children}</GameProvider>
  );
  return renderHook(
    () => ({ owned: useOwnedPokemon(), game: useGame().state }),
    { wrapper },
  );
}

describe('useOwnedPokemon', () => {
  it('carga los Pokémon de la colección que faltan', async () => {
    const fetchMock = mockPokeApi();
    const { result } = renderOwned({
      collection: { 1: 1, 25: 1 },
      pokemonById: { 1: { id: 1, name: 'bulbasaur' } },
    });

    expect(result.current.owned.loading).toBe(true);
    await waitFor(() => expect(result.current.owned.loading).toBe(false));

    expect(result.current.game.pokemonById[25].name).toBe('pokemon-25');
    expect(result.current.owned.error).toBeNull();
    // El #1 ya estaba: no se pide.
    expect(fetchMock.mock.calls.some(([url]) => url.endsWith('/1'))).toBe(
      false,
    );
  });

  it('si no falta ninguno, no pide nada', () => {
    const fetchMock = mockPokeApi();
    const { result } = renderOwned({
      collection: { 25: 1 },
      pokemonById: { 25: { id: 25, name: 'pikachu' } },
    });
    expect(result.current.owned.loading).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('si fetch falla da un error, y al reintentar vuelve a pedirlo', async () => {
    mockPokeApi({ failIds: [25] });
    const { result } = renderOwned({ collection: { 25: 1 } });

    await waitFor(() => expect(result.current.owned.error).not.toBeNull());
    expect(result.current.owned.loading).toBe(false);

    mockPokeApi(); // la API vuelve a funcionar
    act(() => result.current.owned.retry());
    expect(result.current.owned.loading).toBe(true);

    await waitFor(() => expect(result.current.owned.loading).toBe(false));
    expect(result.current.owned.error).toBeNull();
    expect(result.current.game.pokemonById[25].name).toBe('pokemon-25');
  });
});
