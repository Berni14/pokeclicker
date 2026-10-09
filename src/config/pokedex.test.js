import { describe, it, expect } from 'vitest';
import { POKEDEX, pokedexByRarity, pokedexEntry } from './pokedex';
import { GENERATIONS } from './generations';
import { RARITIES, RARITY_OVERRIDES, getRarity } from './rarities';
import { TYPE_COLORS } from './types';

describe('tabla de la Pokédex (generada con npm run pokedex)', () => {
  const all = Object.values(POKEDEX).flat();

  it('cada generación de generations.js tiene su tabla', () => {
    expect(Object.keys(POKEDEX)).toEqual(Object.keys(GENERATIONS));
  });

  it.each(Object.keys(GENERATIONS))(
    'la generación %s tiene todos sus Pokémon, en orden y sin huecos',
    (generation) => {
      const { from, to } = GENERATIONS[generation];
      expect(POKEDEX[generation].map((e) => e.id)).toEqual(
        Array.from({ length: to - from + 1 }, (_, i) => from + i),
      );
    },
  );

  it('cada entrada tiene datos válidos', () => {
    for (const entry of all) {
      expect(RARITIES).toHaveProperty(entry.rarity);
      expect(entry.statTotal).toBeGreaterThan(0);
      expect(entry.attack).toBeGreaterThan(0);
      expect(entry.types.length).toBeGreaterThanOrEqual(1);
      for (const type of entry.types) expect(TYPE_COLORS).toHaveProperty(type);
    }
  });

  it('está generada con los umbrales de rareza actuales', () => {
    // Si cambian los umbrales de rarities.js, hay que regenerar la tabla.
    for (const entry of all) {
      if (entry.rarity === 'legendary' || entry.rarity === 'mythical') continue;
      expect(getRarity({ statTotal: entry.statTotal })).toBe(entry.rarity);
    }
  });

  it('respeta las rarezas elegidas a mano', () => {
    expect(pokedexEntry(448).rarity).toBe('legendary'); // Lucario
    for (const [id, rarity] of Object.entries(RARITY_OVERRIDES)) {
      expect(pokedexEntry(id).rarity).toBe(rarity);
      expect(getRarity({ id: Number(id), statTotal: 300 })).toBe(rarity);
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

  it('reparto de rarezas de la segunda generación', () => {
    const groups = pokedexByRarity(2);
    expect(groups.common).toHaveLength(39);
    expect(groups.rare).toHaveLength(36);
    expect(groups.epic).toHaveLength(19);
    expect(groups.legendary.map((e) => e.id)).toEqual([
      243, 244, 245, 249, 250,
    ]);
    expect(groups.mythical.map((e) => e.id)).toEqual([251]);
  });

  it('reparto de rarezas de la tercera y la cuarta generación', () => {
    const count = (generation) =>
      Object.fromEntries(
        Object.entries(pokedexByRarity(generation)).map(([rarity, list]) => [
          rarity,
          list.length,
        ]),
      );
    expect(count(3)).toEqual({
      common: 58,
      rare: 54,
      epic: 13,
      legendary: 8,
      mythical: 2,
    });
    expect(count(4)).toEqual({
      common: 36,
      rare: 29,
      epic: 27,
      legendary: 10, // con Lucario
      mythical: 5,
    });
  });

  it('pokedexEntry acepta el id como número o como texto', () => {
    expect(pokedexEntry(25)).toBe(pokedexEntry('25'));
    expect(pokedexEntry(494)).toBeUndefined();
  });
});
