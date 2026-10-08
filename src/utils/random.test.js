import { describe, it, expect } from 'vitest';
import { pickOne, pickWeighted } from './random';

describe('pickWeighted', () => {
  const weights = { a: 50, b: 30, c: 20 };

  it('reparte según los pesos', () => {
    expect(pickWeighted(weights, () => 0)).toBe('a');
    expect(pickWeighted(weights, () => 0.49)).toBe('a');
    expect(pickWeighted(weights, () => 0.5)).toBe('b');
    expect(pickWeighted(weights, () => 0.8)).toBe('c');
    expect(pickWeighted(weights, () => 0.9999)).toBe('c');
  });

  it('nunca elige una clave con peso 0', () => {
    expect(pickWeighted({ a: 0, b: 10 }, () => 0)).toBe('b');
  });
});

describe('pickOne', () => {
  it('elige por posición y nunca se sale de la lista', () => {
    const list = ['x', 'y', 'z'];
    expect(pickOne(list, () => 0)).toBe('x');
    expect(pickOne(list, () => 0.5)).toBe('y');
    expect(pickOne(list, () => 0.9999999)).toBe('z');
  });
});
