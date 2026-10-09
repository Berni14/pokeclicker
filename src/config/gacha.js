export const PULL_DISCOUNT_PER_LEVEL = 0.05;
export const MAX_STARS = 5;
export const MAX_STARS_REFUND = 2; // repetido con 5★: 2 × precio de la tirada

// Los tres gachas. Cada uno sortea solo entre dos rarezas: primero la rareza
// (con `weights`, en %) y luego un Pokémon de esa rareza. Cada gacha tiene su
// propio precio, que sube con sus propias tiradas.
export const BANNERS = {
  basic: {
    label: 'Básico',
    ball: 'poke',
    basePrice: 25,
    priceGrowth: 1.07, // cada tirada cuesta un 7 % más
    weights: { common: 70, rare: 30 },
  },
  epic: {
    label: 'Épico',
    ball: 'ultra',
    basePrice: 100_000,
    priceGrowth: 1.1,
    weights: { epic: 85, legendary: 15 },
  },
  legendary: {
    label: 'Legendario',
    ball: 'master',
    basePrice: 1_000_000,
    priceGrowth: 1.15,
    weights: { legendary: 80, mythical: 20 },
  },
};
