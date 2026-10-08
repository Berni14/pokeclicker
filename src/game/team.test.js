import { describe, it, expect } from 'vitest';
import { equip, isTeamFull, unequip } from './team';
import { makeState } from '../__mocks__/gameState';

const FULL = {
  collection: { 1: 1, 4: 1, 6: 1, 7: 1, 54: 1, 95: 1, 25: 1 },
  team: [1, 4, 6, 7, 54, 95],
};

describe('equip', () => {
  it('equipa un Pokémon de la colección', () => {
    const state = makeState({ collection: { 25: 1 } });
    expect(equip(state, 25).team).toEqual([25]);
  });

  it('no equipa un Pokémon que no tienes', () => {
    const state = makeState();
    expect(equip(state, 25)).toBe(state);
  });

  it('no equipa dos veces el mismo', () => {
    const state = makeState({ collection: { 25: 1 }, team: [25] });
    expect(equip(state, 25)).toBe(state);
  });

  it('con el equipo lleno necesita a quién sustituir', () => {
    const state = makeState(FULL);
    expect(isTeamFull(state)).toBe(true);
    expect(equip(state, 25)).toBe(state);
    expect(equip(state, 25, 150)).toBe(state); // 150 no está en el equipo
  });

  it('sustituye en el mismo hueco', () => {
    const next = equip(makeState(FULL), 25, 6);
    expect(next.team).toEqual([1, 4, 25, 7, 54, 95]);
  });
});

describe('unequip', () => {
  it('quita un Pokémon del equipo', () => {
    const state = makeState({ collection: { 25: 1, 1: 1 }, team: [1, 25] });
    expect(unequip(state, 1).team).toEqual([25]);
  });

  it('si no estaba equipado no cambia nada', () => {
    const state = makeState({ collection: { 25: 1 } });
    expect(unequip(state, 25)).toBe(state);
  });
});
