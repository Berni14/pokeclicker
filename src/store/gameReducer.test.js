import { describe, it, expect } from 'vitest';
import { gameReducer } from './gameReducer';
import { initialState } from './initialState';
import { makeState } from '../__mocks__/gameState';

// Los estados de makeState están congelados: si el reducer los modificara,
// estos tests fallarían.

describe('gameReducer', () => {
  it('CLICK suma monedas', () => {
    expect(gameReducer(makeState(), { type: 'CLICK' }).coins).toBe(1);
  });

  it('TICK suma la producción del equipo', () => {
    const state = makeState({ collection: { 25: 1 }, team: [25] });
    expect(gameReducer(state, { type: 'TICK', seconds: 5 }).coins).toBe(5);
  });

  it('PULL aplica la tirada que llega en la acción', () => {
    const next = gameReducer(makeState({ coins: 25 }), {
      type: 'PULL',
      id: 150,
    });
    expect(next.collection).toEqual({ 150: 1 });
    expect(next.team).toEqual([150]);
    expect(next.coins).toBe(0);
  });

  it('BUY_UPGRADE compra una mejora', () => {
    const next = gameReducer(makeState({ coins: 160 }), {
      type: 'BUY_UPGRADE',
      key: 'clickPower',
    });
    expect(next.upgrades.clickPower).toBe(1);
  });

  it('EQUIP y UNEQUIP cambian el equipo', () => {
    const state = makeState({ collection: { 25: 1 } });
    const equipped = gameReducer(state, { type: 'EQUIP', id: 25 });
    expect(equipped.team).toEqual([25]);
    expect(gameReducer(equipped, { type: 'UNEQUIP', id: 25 }).team).toEqual([]);
  });

  it('GYM_WON da la medalla del gimnasio actual', () => {
    const next = gameReducer(makeState(), { type: 'GYM_WON', number: 1 });
    expect(next.medals).toEqual({ 1: [1] });
  });

  it('POKEMON_LOADED añade datos sin perder los que había', () => {
    const state = makeState({
      pokemonById: { 1: { id: 1, name: 'bulbasaur' } },
    });
    const next = gameReducer(state, {
      type: 'POKEMON_LOADED',
      pokemon: [{ id: 25, name: 'pikachu' }],
    });
    expect(Object.keys(next.pokemonById)).toEqual(['1', '25']);
  });

  it('RESET vuelve al estado inicial pero conserva los datos de la API', () => {
    const state = makeState({
      coins: 999,
      collection: { 25: 3 },
      pokemonById: { 25: { id: 25 } },
    });
    expect(gameReducer(state, { type: 'RESET' })).toEqual({
      ...initialState,
      pokemonById: { 25: { id: 25 } },
    });
  });

  it('una acción desconocida devuelve el mismo estado', () => {
    const state = makeState();
    expect(gameReducer(state, { type: 'NO_EXISTE' })).toBe(state);
  });
});
