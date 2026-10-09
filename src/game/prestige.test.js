import { describe, it, expect } from 'vitest';
import {
  canChangeGeneration,
  changeGeneration,
  nextGeneration,
  regionOf,
} from './prestige';
import { currentGym, gymsOf } from './battle';
import { makeState } from '../__mocks__/gameState';

const ALL_MEDALS = { 1: [1, 2, 3, 4, 5, 6, 7, 8] };

// Final de Kanto: todo comprado, varios Pokémon y las 8 medallas.
const endOfKanto = (overrides = {}) =>
  makeState({
    coins: 5000,
    trainer: { level: 7, xp: 120 },
    upgrades: { clickPower: 5, training: 3, pullDiscount: 2 },
    items: ['quickClaw'],
    boosts: { xAttack: 30 },
    pulls: { basic: 90, epic: 2, legendary: 0 },
    collection: { 6: 3, 25: 5, 150: 1 },
    levels: { 6: 30, 25: 12 },
    team: [6, 25, 150],
    medals: ALL_MEDALS,
    ...overrides,
  });

describe('canChangeGeneration', () => {
  it('solo con los 8 gimnasios de la región ganados', () => {
    expect(canChangeGeneration(makeState())).toBe(false);
    expect(
      canChangeGeneration(makeState({ medals: { 1: [1, 2, 3, 4, 5, 6, 7] } })),
    ).toBe(false);
    expect(canChangeGeneration(endOfKanto())).toBe(true);
  });

  it('no si no hay una región siguiente', () => {
    const state = makeState({
      generation: 2,
      medals: { 2: [1, 2, 3, 4, 5, 6, 7, 8] },
    });
    expect(nextGeneration(state)).toBeNull();
    expect(canChangeGeneration(state)).toBe(false);
  });

  it('cada generación tiene su región', () => {
    expect(regionOf(1)).toBe('Kanto');
    expect(regionOf(2)).toBe('Johto');
  });
});

describe('changeGeneration', () => {
  it('se lleva solo al Pokémon elegido, con sus estrellas y su nivel', () => {
    const next = changeGeneration(endOfKanto(), 6);
    expect(next.generation).toBe(2);
    expect(next.collection).toEqual({ 6: 3 });
    expect(next.levels).toEqual({ 6: 30 });
    expect(next.team).toEqual([6]);
  });

  it('un Pokémon a nivel 1 no deja niveles guardados', () => {
    expect(changeGeneration(endOfKanto(), 150).levels).toEqual({});
  });

  it('reinicia dinero, mejoras, objetos, potenciadores y tiradas', () => {
    const next = changeGeneration(endOfKanto(), 6);
    expect(next.coins).toBe(0);
    expect(Object.values(next.upgrades).every((level) => level === 0)).toBe(
      true,
    );
    expect(next.upgrades).toHaveProperty('clickPower', 0);
    expect(next.items).toEqual([]);
    expect(next.boosts).toEqual({});
    expect(next.pulls).toEqual({ basic: 0, epic: 0, legendary: 0 });
  });

  it('mantiene el nivel de entrenador y las medallas', () => {
    const next = changeGeneration(endOfKanto(), 6);
    expect(next.trainer).toEqual({ level: 7, xp: 120 });
    expect(next.medals).toEqual(ALL_MEDALS);
  });

  it('los gimnasios de la nueva región empiezan de cero', () => {
    const next = changeGeneration(endOfKanto(), 6);
    expect(gymsOf(next)[0].leader).toBe('Pegaso');
    expect(currentGym(next).leader).toBe('Pegaso');
  });

  it('no hace nada sin terminar la región o con un Pokémon que no tienes', () => {
    const unfinished = endOfKanto({ medals: { 1: [1, 2] } });
    expect(changeGeneration(unfinished, 6)).toBe(unfinished);
    const done = endOfKanto();
    expect(changeGeneration(done, 1)).toBe(done);
  });
});
