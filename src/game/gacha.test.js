import { describe, it, expect } from 'vitest';
import {
  applyPull,
  bannerPokemon,
  canPull,
  pullOutcome,
  pullPrice,
  rollPokemon,
  totalPulls,
} from './gacha';
import { BANNERS } from '../config/gacha';
import { pokedexEntry } from '../config/pokedex';
import { makeState, seededRng } from '../__mocks__/gameState';

const pulls = (basic = 0, epic = 0, legendary = 0) => ({
  basic,
  epic,
  legendary,
});

describe('pullPrice', () => {
  it('el básico empieza en 25 y sube un 7 % por tirada', () => {
    expect(pullPrice(makeState(), 'basic')).toBe(25);
    expect(pullPrice(makeState({ pulls: pulls(10) }), 'basic')).toBe(49);
  });

  it('cada gacha tiene su precio y solo lo suben sus tiradas', () => {
    const state = makeState({ pulls: pulls(50) });
    expect(pullPrice(state, 'epic')).toBe(BANNERS.epic.basePrice);
    expect(pullPrice(state, 'legendary')).toBe(BANNERS.legendary.basePrice);
    expect(pullPrice(makeState({ pulls: pulls(0, 1) }), 'epic')).toBe(
      Math.round(BANNERS.epic.basePrice * BANNERS.epic.priceGrowth),
    );
  });

  it('el descuento baja los tres', () => {
    const state = makeState({ upgrades: { pullDiscount: 2 } });
    expect(pullPrice(state, 'basic')).toBe(23);
    expect(pullPrice(state, 'legendary')).toBe(
      Math.round(BANNERS.legendary.basePrice * 0.9),
    );
  });

  it('canPull depende de las monedas y del gacha', () => {
    expect(canPull(makeState({ coins: 24 }), 'basic')).toBe(false);
    expect(canPull(makeState({ coins: 25 }), 'basic')).toBe(true);
    expect(canPull(makeState({ coins: 25 }), 'epic')).toBe(false);
    expect(canPull(makeState({ coins: 1e9 }), 'nope')).toBe(false);
  });

  it('totalPulls suma los tres gachas', () => {
    expect(totalPulls(makeState({ pulls: pulls(3, 2, 1) }))).toBe(6);
  });
});

describe('bannerPokemon', () => {
  it('cada gacha tiene solo sus dos rarezas', () => {
    const rarities = (banner) =>
      new Set(bannerPokemon(1, banner).map((e) => e.rarity));
    expect(rarities('basic')).toEqual(new Set(['common', 'rare']));
    expect(rarities('epic')).toEqual(new Set(['epic', 'legendary']));
    expect(rarities('legendary')).toEqual(new Set(['legendary', 'mythical']));
  });
});

describe('applyPull', () => {
  it('sin monedas suficientes no pasa nada', () => {
    const state = makeState({ coins: 10 });
    expect(applyPull(state, 25, 'basic')).toBe(state);
  });

  it('un id que no es de la generación actual no hace nada', () => {
    const state = makeState({ coins: 100 });
    expect(applyPull(state, 152, 'basic')).toBe(state);
    expect(applyPull(state, 0, 'basic')).toBe(state);
  });

  it('un Pokémon que no sale en ese gacha no hace nada', () => {
    const state = makeState({ coins: 1e9 });
    expect(applyPull(state, 150, 'basic')).toBe(state); // Mewtwo, legendario
    expect(applyPull(state, 25, 'legendary')).toBe(state); // Pikachu, común
    expect(applyPull(state, 25, 'nope')).toBe(state);
  });

  it('un Pokémon nuevo entra con 1★ y se equipa si hay hueco', () => {
    const next = applyPull(makeState({ coins: 100 }), 25, 'basic');
    expect(next.coins).toBe(75);
    expect(next.pulls).toEqual(pulls(1));
    expect(next.collection).toEqual({ 25: 1 });
    expect(next.team).toEqual([25]);
    expect(next.trainer.xp).toBe(5);
  });

  it('cobra el precio del gacha y suma su tirada', () => {
    const price = BANNERS.legendary.basePrice;
    const next = applyPull(makeState({ coins: price }), 151, 'legendary');
    expect(next.coins).toBe(0);
    expect(next.pulls).toEqual(pulls(0, 0, 1));
    expect(next.collection).toEqual({ 151: 1 });
  });

  it('con el equipo lleno, el nuevo va a la caja', () => {
    const state = makeState({
      coins: 100,
      collection: { 1: 1, 4: 1, 6: 1, 7: 1, 54: 1, 95: 1 },
      team: [1, 4, 6, 7, 54, 95],
    });
    const next = applyPull(state, 25, 'basic');
    expect(next.collection[25]).toBe(1);
    expect(next.team).toEqual(state.team);
  });

  it('un repetido sube una estrella', () => {
    const next = applyPull(
      makeState({ coins: 100, collection: { 25: 2 } }),
      25,
      'basic',
    );
    expect(next.collection[25]).toBe(3);
  });

  it('un repetido con 5★ se convierte en monedas y experiencia', () => {
    const next = applyPull(
      makeState({ coins: 100, collection: { 25: 5 } }),
      25,
      'basic',
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
    expect(rollPokemon(1, 'basic', () => 0)).toBe(1); // común, el primero
    expect(rollPokemon(1, 'epic', () => 0)).toBe(3); // épico, el primero
    expect(rollPokemon(1, 'legendary', () => 0.999)).toBe(151); // Mew
  });

  it('solo da Pokémon de la generación y del gacha', () => {
    const rng = seededRng(7);
    for (const banner of Object.keys(BANNERS)) {
      const allowed = bannerPokemon(1, banner).map((e) => e.id);
      for (let i = 0; i < 500; i++) {
        expect(allowed).toContain(rollPokemon(1, banner, rng));
      }
    }
  });

  it('las rarezas salen en proporciones cercanas a las del gacha', () => {
    const rng = seededRng(42);
    const rolls = 20_000;
    for (const [banner, { weights }] of Object.entries(BANNERS)) {
      const count = {};
      for (let i = 0; i < rolls; i++) {
        const { rarity } = pokedexEntry(rollPokemon(1, banner, rng));
        count[rarity] = (count[rarity] ?? 0) + 1;
      }
      for (const [rarity, weight] of Object.entries(weights)) {
        const percent = (100 * (count[rarity] ?? 0)) / rolls;
        expect(Math.abs(percent - weight)).toBeLessThan(1); // ±1 punto
      }
    }
  });
});
