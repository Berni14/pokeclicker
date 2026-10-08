import { describe, it, expect } from 'vitest';
import {
  applyPull,
  canPull,
  pullOutcome,
  pullPrice,
  rollPokemon,
} from './gacha';
import { RARITY_WEIGHTS } from '../config/gacha';
import { pokedexEntry } from '../config/pokedex';
import { makeState, seededRng } from '../__mocks__/gameState';

describe('pullPrice', () => {
  it('empieza en 25 y sube un 7 % por tirada', () => {
    expect(pullPrice(makeState())).toBe(25);
    expect(pullPrice(makeState({ pulls: 10 }))).toBe(49);
  });

  it('el descuento lo baja', () => {
    expect(pullPrice(makeState({ upgrades: { pullDiscount: 2 } }))).toBe(23);
  });

  it('canPull depende de las monedas', () => {
    expect(canPull(makeState({ coins: 24 }))).toBe(false);
    expect(canPull(makeState({ coins: 25 }))).toBe(true);
  });
});

describe('applyPull', () => {
  it('sin monedas suficientes no pasa nada', () => {
    const state = makeState({ coins: 10 });
    expect(applyPull(state, 25)).toBe(state);
  });

  it('un id que no es de la generación actual no hace nada', () => {
    const state = makeState({ coins: 100 });
    expect(applyPull(state, 152)).toBe(state);
    expect(applyPull(state, 0)).toBe(state);
  });

  it('un Pokémon nuevo entra con 1★ y se equipa si hay hueco', () => {
    const next = applyPull(makeState({ coins: 100 }), 25);
    expect(next.coins).toBe(75);
    expect(next.pulls).toBe(1);
    expect(next.collection).toEqual({ 25: 1 });
    expect(next.team).toEqual([25]);
    expect(next.trainer.xp).toBe(5);
  });

  it('con el equipo lleno, el nuevo va a la caja', () => {
    const state = makeState({
      coins: 100,
      collection: { 1: 1, 4: 1, 6: 1, 7: 1, 54: 1, 95: 1 },
      team: [1, 4, 6, 7, 54, 95],
    });
    const next = applyPull(state, 25);
    expect(next.collection[25]).toBe(1);
    expect(next.team).toEqual(state.team);
  });

  it('un repetido sube una estrella', () => {
    const next = applyPull(
      makeState({ coins: 100, collection: { 25: 2 } }),
      25,
    );
    expect(next.collection[25]).toBe(3);
  });

  it('un repetido con 5★ se convierte en monedas y experiencia', () => {
    const next = applyPull(
      makeState({ coins: 100, collection: { 25: 5 } }),
      25,
    );
    expect(next.collection[25]).toBe(5);
    expect(next.coins).toBe(100 - 25 + 2 * 25);
    expect(next.trainer.xp).toBe(5 + 20);
  });
});

describe('pullOutcome', () => {
  it('distingue nuevo, estrella y devolución', () => {
    const state = makeState({ collection: { 25: 2, 150: 5 } });
    expect(pullOutcome(state, 1)).toBe('new');
    expect(pullOutcome(state, 25)).toBe('star');
    expect(pullOutcome(state, 150)).toBe('refund');
  });
});

describe('rollPokemon', () => {
  it('con un rng fijo sale siempre el mismo Pokémon', () => {
    expect(rollPokemon(1, () => 0)).toBe(1); // común, el primero de la lista
    expect(rollPokemon(1, () => 0.999)).toBe(151); // singular: Mew
  });

  it('solo da Pokémon de la generación', () => {
    const rng = seededRng(7);
    for (let i = 0; i < 1000; i++) {
      const id = rollPokemon(1, rng);
      expect(id).toBeGreaterThanOrEqual(1);
      expect(id).toBeLessThanOrEqual(151);
    }
  });

  it('las rarezas salen en proporciones cercanas a RARITY_WEIGHTS', () => {
    const rng = seededRng(42);
    const rolls = 20_000;
    const count = {};
    for (let i = 0; i < rolls; i++) {
      const { rarity } = pokedexEntry(rollPokemon(1, rng));
      count[rarity] = (count[rarity] ?? 0) + 1;
    }
    for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
      const percent = (100 * (count[rarity] ?? 0)) / rolls;
      expect(percent).toBeCloseTo(weight, 0); // ±0,5 puntos
    }
  });
});
