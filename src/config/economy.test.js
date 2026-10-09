import { describe, it, expect } from 'vitest';
import {
  baseProduction,
  levelMultiplier,
  levelUpCostOf,
  productionOf,
  starMultiplier,
} from './economy';
import { POKEDEX, pokedexEntry } from './pokedex';
import { RARITIES } from './rarities';

describe('producción', () => {
  it('valores de referencia', () => {
    expect(baseProduction(pokedexEntry(129))).toBe(0.4); // Magikarp
    expect(baseProduction(pokedexEntry(25))).toBe(1); // Pikachu
    expect(baseProduction(pokedexEntry(6))).toBe(4.3); // Charizard
    expect(baseProduction(pokedexEntry(150))).toBe(13.9); // Mewtwo
  });

  it('cada estrella extra suma un 50 %', () => {
    expect(starMultiplier(1)).toBe(1);
    expect(starMultiplier(5)).toBe(3);
    expect(productionOf(pokedexEntry(150), 5)).toBe(41.7);
  });

  it('cada nivel por encima de 1 suma un 10 %', () => {
    expect(levelMultiplier(1)).toBe(1);
    expect(levelMultiplier(11)).toBe(2);
    expect(productionOf(pokedexEntry(150), 5, 11)).toBe(83.4);
  });

  it('subir de nivel a un legendario cuesta más que a un común', () => {
    const mewtwo = levelUpCostOf(pokedexEntry(150), 1);
    const pidgey = levelUpCostOf(pokedexEntry(16), 1);
    expect(mewtwo).toBe(834); // 13,9/s × 60 s
    expect(mewtwo).toBeGreaterThan(pidgey);
    expect(levelUpCostOf(pokedexEntry(150), 2)).toBe(959); // × 1,15
  });

  it('con más stats y más rareza nunca se produce menos', () => {
    const entries = POKEDEX[1];
    for (const a of entries) {
      for (const b of entries) {
        const moreStats = a.statTotal >= b.statTotal;
        const moreRare =
          RARITIES[a.rarity].multiplier >= RARITIES[b.rarity].multiplier;
        if (moreStats && moreRare) {
          expect(baseProduction(a)).toBeGreaterThanOrEqual(baseProduction(b));
        }
      }
    }
  });

  it('no da decimales raros', () => {
    for (const entry of POKEDEX[1]) {
      for (let stars = 1; stars <= 5; stars++) {
        const value = productionOf(entry, stars);
        expect(Math.round(value * 100) / 100).toBe(value);
      }
    }
  });
});
