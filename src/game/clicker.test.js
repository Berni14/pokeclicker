import { describe, it, expect } from 'vitest';
import { click, clickPower, clickValue } from './clicker';
import { makeState } from '../__mocks__/gameState';

describe('click', () => {
  it('da 1 moneda sin mejoras', () => {
    expect(click(makeState()).coins).toBe(1);
  });

  it('suma la mejora Poder de click', () => {
    const state = makeState({ upgrades: { clickPower: 2 } });
    expect(clickPower(state)).toBe(3);
    expect(click(state).coins).toBe(3);
  });

  it('aplica el bonus del nivel de entrenador', () => {
    const state = makeState({
      upgrades: { clickPower: 2 },
      trainer: { level: 3 },
    });
    expect(clickValue(state)).toBeCloseTo(3.3);
  });
});
