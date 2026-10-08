import { describe, it, expect } from 'vitest';
import { pokemonProduction, teamProduction, tick } from './production';
import { makeState } from '../__mocks__/gameState';

// Pikachu (#25): común, 320 de stats → 1 moneda/s con 1★.
// Mewtwo (#150): legendario, 680 de stats → 13,9 monedas/s con 1★.

describe('teamProduction', () => {
  it('es 0 con el equipo vacío', () => {
    expect(teamProduction(makeState())).toBe(0);
  });

  it('suma lo que produce cada equipado', () => {
    const state = makeState({ collection: { 25: 1, 150: 1 }, team: [25, 150] });
    expect(teamProduction(state)).toBeCloseTo(14.9);
  });

  it('los Pokémon de la caja no producen', () => {
    const state = makeState({ collection: { 25: 1, 150: 1 }, team: [25] });
    expect(teamProduction(state)).toBe(1);
  });

  it('las estrellas multiplican la producción', () => {
    const state = makeState({ collection: { 25: 3 }, team: [25] });
    expect(pokemonProduction(state, 25)).toBe(2);
  });

  it('aplica Entrenamiento y el bonus del entrenador', () => {
    const state = makeState({
      collection: { 25: 1 },
      team: [25],
      upgrades: { training: 2 },
      trainer: { level: 2 },
    });
    expect(teamProduction(state)).toBeCloseTo(1 * 1.3 * 1.05);
  });
});

describe('tick', () => {
  it('suma la producción de los segundos pasados', () => {
    const state = makeState({ collection: { 25: 1 }, team: [25], coins: 5 });
    expect(tick(state, 10).coins).toBe(15);
  });

  it('ignora segundos inválidos', () => {
    const state = makeState({ collection: { 25: 1 }, team: [25] });
    expect(tick(state, -3)).toBe(state);
    expect(tick(state, NaN)).toBe(state);
    expect(tick(state, Infinity)).toBe(state);
  });
});
