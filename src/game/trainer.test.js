import { describe, it, expect } from 'vitest';
import { addXp, moneyMultiplier } from './trainer';
import { makeState } from '../__mocks__/gameState';

describe('moneyMultiplier', () => {
  it('es 1 en el nivel 1 y suma un 5 % por nivel', () => {
    expect(moneyMultiplier(makeState())).toBe(1);
    expect(moneyMultiplier(makeState({ trainer: { level: 3 } }))).toBeCloseTo(
      1.1,
    );
  });
});

describe('addXp', () => {
  it('suma experiencia sin subir de nivel', () => {
    expect(addXp(makeState(), 50).trainer).toEqual({ level: 1, xp: 50 });
  });

  it('sube de nivel al llegar justo al umbral', () => {
    expect(addXp(makeState(), 100).trainer).toEqual({ level: 2, xp: 0 });
  });

  it('sube varios niveles de golpe y guarda lo que sobra', () => {
    // Nivel 1 → 2 cuesta 100, nivel 2 → 3 cuesta 200: sobran 50.
    expect(addXp(makeState(), 350).trainer).toEqual({ level: 3, xp: 50 });
  });
});
