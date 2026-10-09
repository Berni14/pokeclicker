import { describe, it, expect } from 'vitest';
import { buyItem, canBuyItem, itemMultiplier, itemStatus } from './items';
import { boostCost, boostStatus, buyBoost } from './boosts';
import { clickPower, clickValue } from './clicker';
import { teamProduction, tick } from './production';
import { clickDamage } from './battle';
import { makeState } from '../__mocks__/gameState';

describe('objetos permanentes', () => {
  it('bloqueado sin nivel de entrenador; comprado ya no se vende', () => {
    expect(itemStatus(makeState(), 'quickClaw')).toBe('locked');
    const level2 = makeState({ trainer: { level: 2 }, coins: 3000 });
    expect(itemStatus(level2, 'quickClaw')).toBe('available');
    const bought = buyItem(level2, 'quickClaw');
    expect(bought.coins).toBe(0);
    expect(bought.items).toEqual(['quickClaw']);
    expect(itemStatus(bought, 'quickClaw')).toBe('owned');
    expect(buyItem({ ...bought, coins: 9999 }, 'quickClaw').items).toEqual([
      'quickClaw',
    ]);
  });

  it('sin dinero o con una clave que no existe no hace nada', () => {
    const poor = makeState({ trainer: { level: 2 }, coins: 2999 });
    expect(canBuyItem(poor, 'quickClaw')).toBe(false);
    expect(buyItem(poor, 'quickClaw')).toBe(poor);
    const rich = makeState({ trainer: { level: 9 }, coins: 1e9 });
    expect(buyItem(rich, 'toString')).toBe(rich);
  });

  it('los objetos se multiplican entre sí', () => {
    const state = makeState({ items: ['quickClaw', 'choiceBand'] });
    expect(itemMultiplier(state, 'click')).toBe(6);
    expect(clickValue(state)).toBe(6);
  });

  it('multiplican la producción del equipo', () => {
    const state = makeState({
      collection: { 25: 1 },
      team: [25],
      items: ['amuletCoin', 'leftovers'],
    });
    expect(teamProduction(state)).toBe(6);
  });

  it('no cambian el daño en combate', () => {
    const state = makeState({ items: ['quickClaw', 'choiceBand'] });
    expect(clickPower(state)).toBe(1);
    expect(clickDamage(state)).toBe(1);
  });
});

describe('potenciadores', () => {
  it('el precio son segundos de lo que ganas, con un mínimo', () => {
    // Click de 1 × 5 clicks/s × 60 s.
    expect(boostCost(makeState(), 'xAttack')).toBe(300);
    // Sin equipo no produces: precio mínimo.
    expect(boostCost(makeState(), 'luckIncense')).toBe(100);
    const team = makeState({ collection: { 25: 1 }, team: [25] });
    expect(boostCost(team, 'luckIncense')).toBe(240);
  });

  it('un potenciador activo no encarece el siguiente', () => {
    const state = makeState({ boosts: { xAttack: 30 } });
    expect(boostCost(state, 'xAttack')).toBe(300);
  });

  it('comprar activa el efecto y comprar otro suma el tiempo', () => {
    let state = makeState({ coins: 1000 });
    state = buyBoost(state, 'xAttack');
    expect(state.coins).toBe(700);
    expect(state.boosts).toEqual({ xAttack: 60 });
    expect(clickValue(state)).toBe(5);
    state = buyBoost(state, 'xAttack');
    expect(state.boosts).toEqual({ xAttack: 120 });
  });

  it('no se puede acumular más de una hora', () => {
    const state = makeState({
      coins: 1e9,
      trainer: { level: 2 },
      boosts: { luckIncense: 3001 },
    });
    expect(boostStatus(state, 'luckIncense')).toBe('full');
    expect(buyBoost(state, 'luckIncense')).toBe(state);
  });

  it('el tiempo pasa con el tick y al acabarse desaparece', () => {
    const state = makeState({ boosts: { xAttack: 60 } });
    expect(tick(state, 20).boosts).toEqual({ xAttack: 40 });
    expect(tick(state, 60).boosts).toEqual({});
  });

  it('el incienso solo multiplica los segundos que le quedan', () => {
    const state = makeState({
      collection: { 25: 1 },
      team: [25],
      boosts: { luckIncense: 5 },
    });
    expect(teamProduction(state)).toBe(2);
    // 10 s a 1/s, más 5 s extra con el ×2.
    expect(tick(state, 10).coins).toBe(15);
  });
});
