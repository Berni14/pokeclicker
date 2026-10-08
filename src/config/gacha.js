export const PULL_BASE_PRICE = 25;
export const PULL_PRICE_GROWTH = 1.07; // cada tirada cuesta un 7 % más
export const PULL_DISCOUNT_PER_LEVEL = 0.05;
export const MAX_STARS = 5;
export const MAX_STARS_REFUND = 2; // repetido con 5★: 2 × precio de la tirada

// Probabilidad de cada rareza (en %). Primero se sortea la rareza y luego un
// Pokémon de esa rareza.
export const RARITY_WEIGHTS = {
  common: 55,
  rare: 30,
  epic: 12,
  legendary: 2.5,
  mythical: 0.5,
};
