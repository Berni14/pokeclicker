import { describe, it, expect } from 'vitest';
import {
  canLevelUp,
  isMaxLevel,
  levelUp,
  levelUpCost,
  pokemonLevel,
} from './levels';
import { pokemonProduction } from './production';
import { MAX_POKEMON_LEVEL } from '../config/economy';
import { makeState } from '../__mocks__/gameState';

describe('niveles de los Pokémon', () => {
  it('un Pokémon que nunca has subido está al nivel 1', () => {
    expect(pokemonLevel(makeState({ collection: { 25: 1 } }), 25)).toBe(1);
  });

  it('el precio sale de lo que produce y sube un 15 % por nivel', () => {
    // Pikachu produce 1/s: 60 s de producción.
    expect(levelUpCost(makeState({ collection: { 25: 1 } }), 25)).toBe(60);
    const level3 = makeState({ collection: { 25: 1 }, levels: { 25: 3 } });
    expect(levelUpCost(level3, 25)).toBe(79); // 60 × 1,15²
    // Magikarp produce tan poco que se queda en el mínimo.
    expect(levelUpCost(makeState({ collection: { 129: 1 } }), 129)).toBe(25);
  });

  it('subir de nivel cobra y suma uno', () => {
    const state = makeState({ coins: 100, collection: { 25: 1 } });
    const next = levelUp(state, 25);
    expect(next.coins).toBe(40);
    expect(pokemonLevel(next, 25)).toBe(2);
  });

  it('el nivel sube la producción un 10 % por nivel', () => {
    const state = makeState({ collection: { 25: 1 }, levels: { 25: 11 } });
    expect(pokemonProduction(state, 25)).toBe(2);
  });

  it('sin dinero, sin tener el Pokémon o al máximo no hace nada', () => {
    const poor = makeState({ coins: 59, collection: { 25: 1 } });
    expect(canLevelUp(poor, 25)).toBe(false);
    expect(levelUp(poor, 25)).toBe(poor);

    const notOwned = makeState({ coins: 1000 });
    expect(levelUp(notOwned, 25)).toBe(notOwned);

    const max = makeState({
      coins: Infinity,
      collection: { 25: 1 },
      levels: { 25: MAX_POKEMON_LEVEL },
    });
    expect(isMaxLevel(max, 25)).toBe(true);
    expect(levelUp(max, 25)).toBe(max);
  });

  it('se puede subir a un Pokémon de la caja, no solo del equipo', () => {
    const state = makeState({ coins: 100, collection: { 25: 1 }, team: [] });
    expect(pokemonLevel(levelUp(state, 25), 25)).toBe(2);
  });
});
