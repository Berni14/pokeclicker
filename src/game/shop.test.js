import { describe, it, expect } from 'vitest';
import { buyUpgrade, canBuyUpgrade, upgradeCost, upgradeStatus } from './shop';
import { makeState } from '../__mocks__/gameState';

describe('upgradeCost', () => {
  it('sube con cada nivel', () => {
    expect(upgradeCost('clickPower', 0)).toBe(160);
    expect(upgradeCost('clickPower', 1)).toBe(240);
    expect(upgradeCost('clickPower', 2)).toBe(360);
  });
});

describe('upgradeStatus', () => {
  it('bloqueada si falta nivel de entrenador', () => {
    expect(upgradeStatus(makeState(), 'training')).toBe('locked');
    expect(
      upgradeStatus(makeState({ trainer: { level: 2 } }), 'training'),
    ).toBe('available');
  });

  it('al máximo no se puede subir más', () => {
    const state = makeState({ upgrades: { clickPower: 15 } });
    expect(upgradeStatus(state, 'clickPower')).toBe('max');
  });
});

describe('buyUpgrade', () => {
  it('cobra y sube un nivel', () => {
    const next = buyUpgrade(makeState({ coins: 200 }), 'clickPower');
    expect(next.coins).toBe(40);
    expect(next.upgrades.clickPower).toBe(1);
  });

  it('sin monedas suficientes no pasa nada', () => {
    const state = makeState({ coins: 159 });
    expect(canBuyUpgrade(state, 'clickPower')).toBe(false);
    expect(buyUpgrade(state, 'clickPower')).toBe(state);
  });

  it('bloqueada o al máximo no se compra aunque haya monedas', () => {
    const rich = makeState({ coins: 1e9, upgrades: { clickPower: 15 } });
    expect(buyUpgrade(rich, 'training')).toBe(rich);
    expect(buyUpgrade(rich, 'clickPower')).toBe(rich);
  });

  it('una mejora que no existe no hace nada', () => {
    const state = makeState({ coins: 1e9 });
    expect(buyUpgrade(state, 'noExiste')).toBe(state);
  });
});
