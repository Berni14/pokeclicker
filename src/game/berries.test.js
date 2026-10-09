import { describe, it, expect } from 'vitest';
import {
  berryForHarvest,
  berryMultiplier,
  canGiveBerry,
  giveBerry,
  secondsToNextBerry,
  tickBerries,
} from './berries';
import { pokemonDps } from './battle';
import { pokemonProduction, tick } from './production';
import {
  BERRIES,
  BERRY_GROW_SECONDS,
  BERRY_SECONDS,
  BERRY_STORAGE,
} from '../config/berries';
import { makeState } from '../__mocks__/gameState';

const farm = (stock = [], growth = 0, harvested = 0) => ({
  growth,
  stock,
  harvested,
});

describe('la granja', () => {
  it('da una baya cada 5 minutos', () => {
    const state = makeState();
    expect(secondsToNextBerry(state)).toBe(BERRY_GROW_SECONDS);
    const next = tickBerries(state, BERRY_GROW_SECONDS - 1);
    expect(next.farm.stock).toEqual([]);
    expect(tickBerries(next, 1).farm.stock).toHaveLength(1);
  });

  it('mientras no juegas crece hasta llenarse y se para', () => {
    const next = tickBerries(makeState(), 8 * 3600);
    expect(next.farm.stock).toHaveLength(BERRY_STORAGE);
    expect(next.farm.harvested).toBe(BERRY_STORAGE);
    expect(secondsToNextBerry(next)).toBeNull();
  });

  it('el tiempo que sobra cuenta para la siguiente', () => {
    const next = tickBerries(makeState(), BERRY_GROW_SECONDS * 2.5);
    expect(next.farm.stock).toHaveLength(2);
    expect(next.farm.growth).toBe(BERRY_GROW_SECONDS / 2);
  });

  it('la baya de cada cosecha sale siempre igual y en proporciones parecidas', () => {
    expect(berryForHarvest(7)).toBe(berryForHarvest(7));
    const count = {};
    for (let n = 0; n < 10_000; n++) {
      const key = berryForHarvest(n);
      count[key] = (count[key] ?? 0) + 1;
    }
    for (const [key, { weight }] of Object.entries(BERRIES)) {
      expect(Math.abs(count[key] / 100 - weight)).toBeLessThan(2);
    }
  });
});

describe('dar bayas', () => {
  const base = {
    collection: { 25: 1, 6: 1, 1: 1 },
    team: [25, 6],
    farm: farm(['oran', 'liechi']),
  };

  it('a un Pokémon del equipo, gastando la baya de la granja', () => {
    const next = giveBerry(makeState(base), 'oran', 25);
    expect(next.farm.stock).toEqual(['liechi']);
    expect(next.heldBerries).toEqual({
      25: { key: 'oran', seconds: BERRY_SECONDS },
    });
  });

  it('no a uno de la caja, ni sin esa baya, ni si ya lleva una', () => {
    const state = makeState(base);
    expect(canGiveBerry(state, 'oran', 1)).toBe(false); // en la caja
    expect(canGiveBerry(state, 'sitrus', 25)).toBe(false); // no la tienes
    const held = giveBerry(state, 'oran', 25);
    expect(giveBerry(held, 'liechi', 25)).toBe(held); // ya lleva una
  });

  it('la baya se gasta con el tiempo y desaparece', () => {
    const held = giveBerry(makeState(base), 'oran', 25);
    expect(tickBerries(held, 60).heldBerries[25].seconds).toBe(
      BERRY_SECONDS - 60,
    );
    expect(tickBerries(held, BERRY_SECONDS).heldBerries).toEqual({});
  });
});

describe('efecto de las bayas', () => {
  const state = makeState({
    collection: { 25: 1, 6: 1, 9: 1 },
    team: [25, 6, 9],
    heldBerries: {
      25: { key: 'oran', seconds: 100 },
      6: { key: 'liechi', seconds: 100 },
      9: { key: 'sitrus', seconds: 100 },
    },
  });
  const plain = makeState({ collection: state.collection, team: state.team });

  it('Aranja dobla la producción, Lichi el daño y Zidra las dos', () => {
    expect(berryMultiplier(state, 25, 'production')).toBe(2);
    expect(berryMultiplier(state, 25, 'damage')).toBe(1);
    expect(berryMultiplier(state, 6, 'damage')).toBe(2);
    expect(berryMultiplier(state, 9, 'production')).toBe(2);
    expect(berryMultiplier(state, 9, 'damage')).toBe(2);
    expect(berryMultiplier(plain, 25, 'production')).toBe(1);
  });

  it('se nota en la producción y en el daño del Pokémon', () => {
    expect(pokemonProduction(state, 25)).toBe(2 * pokemonProduction(plain, 25));
    expect(pokemonDps(state, 6, null)).toBe(2 * pokemonDps(plain, 6, null));
  });

  it('si se acaba a mitad, solo dobla los segundos que le quedaban', () => {
    const onlyPikachu = makeState({
      collection: { 25: 1 },
      team: [25],
      heldBerries: { 25: { key: 'oran', seconds: 100 } },
    });
    const rate = pokemonProduction(makeState({ collection: { 25: 1 } }), 25);
    const next = tick(onlyPikachu, 300);
    expect(next.coins).toBeCloseTo(rate * (300 + 100));
    expect(next.heldBerries).toEqual({});
  });
});
