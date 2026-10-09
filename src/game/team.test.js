import { describe, it, expect } from 'vitest';
import { autoEquip, bestTeam, equip, isTeamFull, unequip } from './team';
import { currentGym, pokemonDps } from './battle';
import { pokemonProduction } from './production';
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

describe('bestTeam y autoEquip', () => {
  const SEVEN = { 1: 1, 4: 1, 6: 1, 7: 1, 54: 1, 95: 1, 150: 1 };

  it('elige los 6 que más producen', () => {
    const state = makeState({ collection: SEVEN, team: [] });
    const expected = Object.keys(SEVEN)
      .map(Number)
      .sort((a, b) => pokemonProduction(state, b) - pokemonProduction(state, a))
      .slice(0, 6);
    expect(bestTeam(state, 'production')).toEqual(expected);
  });

  it('las estrellas y el nivel cuentan', () => {
    const state = makeState({ collection: { 1: 1, 7: 1 }, team: [] });
    const [first, second] = bestTeam(state, 'production');
    const trained = makeState({
      collection: { 1: 1, 7: 1 },
      levels: { [second]: 30 },
      team: [],
    });
    expect(bestTeam(trained, 'production')).toEqual([second, first]);
    const starred = makeState({ collection: { [first]: 1, [second]: 5 } });
    expect(bestTeam(starred, 'production')).toEqual([second, first]);
  });

  it('para combatir cuenta la ventaja de tipo contra el gimnasio actual', () => {
    // Contra Brock (roca), Squirtle (agua) tiene ventaja y Charmander no.
    const state = makeState({ collection: { 4: 1, 7: 1 }, team: [] });
    expect(pokemonDps(state, 7, currentGym(state))).toBeGreaterThan(
      pokemonDps(state, 7, null),
    );
    expect(bestTeam(state, 'damage')).toEqual([7, 4]);
  });

  it('con menos de 6 Pokémon los equipa a todos', () => {
    const state = makeState({ collection: { 25: 1, 1: 1 }, team: [] });
    expect(autoEquip(state, 'production').team).toHaveLength(2);
  });

  it('si ya es el mejor equipo no cambia nada', () => {
    const state = makeState({ collection: SEVEN, team: [] });
    const best = autoEquip(state, 'production');
    const shuffled = { ...best, team: [...best.team].reverse() };
    expect(autoEquip(shuffled, 'production')).toBe(shuffled);
  });

  it('con todos los gimnasios ganados también funciona', () => {
    const state = makeState({
      collection: SEVEN,
      team: [],
      medals: { 1: [1, 2, 3, 4, 5, 6, 7, 8] },
    });
    expect(currentGym(state)).toBeNull();
    expect(bestTeam(state, 'damage')).toHaveLength(6);
  });

  it('un criterio desconocido deja el equipo como está', () => {
    const state = makeState({ collection: SEVEN, team: [1] });
    expect(autoEquip(state, 'nope')).toBe(state);
  });
});
