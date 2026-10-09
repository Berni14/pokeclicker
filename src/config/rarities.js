export const RARITIES = {
  common: { label: 'Común', multiplier: 1, ball: 'poke' },
  rare: { label: 'Rara', multiplier: 1.2, ball: 'super' },
  epic: { label: 'Épica', multiplier: 1.5, ball: 'ultra' },
  legendary: { label: 'Legendaria', multiplier: 3, ball: 'master' },
  mythical: { label: 'Singular', multiplier: 3, ball: 'premier' },
};

// Suma de stats a partir de la cual un Pokémon normal sube de rareza.
const RARE_MIN_STATS = 400;
const EPIC_MIN_STATS = 500;

export function getRarity({ statTotal, isLegendary, isMythical }) {
  if (isMythical) return 'mythical';
  if (isLegendary) return 'legendary';
  if (statTotal >= EPIC_MIN_STATS) return 'epic';
  if (statTotal >= RARE_MIN_STATS) return 'rare';
  return 'common';
}
