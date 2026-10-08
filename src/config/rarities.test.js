import { describe, it, expect } from 'vitest';
import { getRarity, RARITIES } from './rarities';

describe('getRarity', () => {
  it('da prioridad a singular y legendario sobre las stats', () => {
    expect(getRarity({ statTotal: 100, isMythical: true })).toBe('mythical');
    expect(getRarity({ statTotal: 100, isLegendary: true })).toBe('legendary');
  });

  it('clasifica al resto por la suma de stats', () => {
    expect(getRarity({ statTotal: 399 })).toBe('common');
    expect(getRarity({ statTotal: 400 })).toBe('rare');
    expect(getRarity({ statTotal: 499 })).toBe('rare');
    expect(getRarity({ statTotal: 500 })).toBe('epic');
  });

  it('todas las rarezas devueltas existen en RARITIES', () => {
    const results = [
      getRarity({ statTotal: 0 }),
      getRarity({ statTotal: 350 }),
      getRarity({ statTotal: 600 }),
      getRarity({ statTotal: 0, isLegendary: true }),
      getRarity({ statTotal: 0, isMythical: true }),
    ];
    for (const rarity of results) expect(RARITIES).toHaveProperty(rarity);
  });
});
