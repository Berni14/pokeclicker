import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getPokemonBatch, getPokemonByIds } from './pokemonService';
import { clearCache } from './cache';
import { mockPokeApi } from '../__mocks__/fetchPokeApi';

beforeEach(() => {
  clearCache();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('getPokemonBatch', () => {
  it('devuelve el lote transformado y ordenado por id', async () => {
    mockPokeApi();
    const batch = await getPokemonBatch(1, 20);

    expect(batch.map((p) => p.id)).toEqual(
      Array.from({ length: 20 }, (_, i) => i + 1),
    );
    expect(batch[0]).toMatchObject({
      id: 1,
      name: 'pokemon-1',
      rarity: 'common',
    });
  });

  it('hace dos peticiones por Pokémon (pokemon y especie)', async () => {
    const fetchMock = mockPokeApi();
    await getPokemonBatch(1, 20);
    expect(fetchMock).toHaveBeenCalledTimes(40);
  });

  it('no repite peticiones de Pokémon que ya están en caché', async () => {
    const fetchMock = mockPokeApi();
    await getPokemonBatch(1, 20);
    await getPokemonBatch(1, 20);
    expect(fetchMock).toHaveBeenCalledTimes(40);
  });

  it('comparte las peticiones en curso (StrictMode pide dos veces)', async () => {
    const fetchMock = mockPokeApi();
    const [a, b] = await Promise.all([
      getPokemonBatch(1, 20),
      getPokemonBatch(1, 20),
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(40);
    expect(a).toEqual(b);
  });

  it('propaga un error entendible si falla la API', async () => {
    mockPokeApi({ failIds: [3] });
    await expect(getPokemonBatch(1, 5)).rejects.toThrow(
      'La PokeAPI respondió 500 en /pokemon/3',
    );
  });

  it('tras un fallo, el reintento vuelve a pedir solo lo que falta', async () => {
    mockPokeApi({ failIds: [3] });
    await expect(getPokemonBatch(1, 5)).rejects.toThrow();

    const fetchMock = mockPokeApi();
    const batch = await getPokemonBatch(1, 5);
    expect(batch).toHaveLength(5);
    // 1, 2, 4 y 5 ya están en caché: solo se pide el 3.
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe('getPokemonByIds', () => {
  it('acepta ids sueltos y en texto (como las claves de la partida)', async () => {
    mockPokeApi();
    const result = await getPokemonByIds(['140', '7', '25']);
    expect(result.map((p) => p.id)).toEqual([7, 25, 140]);
  });

  it('nunca lanza más de BATCH_SIZE Pokémon a la vez', async () => {
    let active = 0;
    let maxActive = 0;
    const fetchMock = mockPokeApi();
    const original = fetchMock.getMockImplementation();
    fetchMock.mockImplementation(async (url) => {
      active++;
      maxActive = Math.max(maxActive, active);
      await new Promise((resolve) => setTimeout(resolve, 1));
      active--;
      return original(url);
    });

    const ids = Array.from({ length: 45 }, (_, i) => i + 1);
    const result = await getPokemonByIds(ids);

    expect(result).toHaveLength(45);
    // 20 Pokémon × 2 peticiones (pokemon + especie).
    expect(maxActive).toBe(40);
  });
});
