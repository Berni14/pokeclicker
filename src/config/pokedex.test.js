import { describe, it, expect } from 'vitest';
import { POKEDEX, pokedexByRarity, pokedexEntry } from './pokedex';
import { GENERATIONS } from './generations';
import { RARITIES, getRarity } from './rarities';
import { TYPE_COLORS } from './types';

describe('tabla de la Pokédex (generada con npm run pokedex)', () => {
  const gen1 = POKEDEX[1];

  it('tiene los 151 de la primera generación, en orden y sin huecos', () => {
    const { from, to } = GENERATIONS[1];
    expect(gen1.map((e) => e.id)).toEqual(
      Array.from({ length: to - from + 1 }, (_, i) => from + i),
    );
  });

  it('cada entrada tiene datos válidos', () => {
    for (const entry of gen1) {
      expect(RARITIES).toHaveProperty(entry.rarity);
      expect(entry.statTotal).toBeGreaterThan(0);
      expect(entry.attack).toBeGreaterThan(0);
      expect(entry.types.length).toBeGreaterThanOrEqual(1);
      for (const type of entry.types) expect(TYPE_COLORS).toHaveProperty(type);
    }
  });

  it('está generada con los umbrales de rareza actuales', () => {
    // Si cambian los umbrales de rarities.js, hay que regenerar la tabla.
    for (const entry of gen1) {
      if (entry.rarity === 'legendary' || entry.rarity === 'mythical') continue;
      expect(getRarity({ statTotal: entry.statTotal })).toBe(entry.rarity);
    }
  });

  it('reparto de rarezas de la primera generación', () => {
    const groups = pokedexByRarity(1);
    expect(groups.common).toHaveLength(69);
    expect(groups.rare).toHaveLength(49);
    expect(groups.epic).toHaveLength(28);
    expect(groups.legendary.map((e) => e.id)).toEqual([144, 145, 146, 150]);
    expect(groups.mythical.map((e) => e.id)).toEqual([151]);
  });

  it('pokedexEntry acepta el id como número o como texto', () => {
    expect(pokedexEntry(25)).toBe(pokedexEntry('25'));
    expect(pokedexEntry(999)).toBeUndefined();
  });
});
