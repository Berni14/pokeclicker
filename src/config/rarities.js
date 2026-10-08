export const RARITIES = {
  common: { label: 'Común', multiplier: 1 },
  rare: { label: 'Rara', multiplier: 1.2 },
  epic: { label: 'Épica', multiplier: 1.5 },
  legendary: { label: 'Legendaria', multiplier: 3 },
  mythical: { label: 'Singular', multiplier: 3 },
};

// Suma de stats a partir de la cual un Pokémon normal sube de rareza.
const RARE_MIN_STATS = 300;
const EPIC_MIN_STATS = 450;

export function getRarity({ statTotal, isLegendary, isMythical }) {
  if (isMythical) return 'mythical';
  if (isLegendary) return 'legendary';
  if (statTotal >= EPIC_MIN_STATS) return 'epic';
  if (statTotal >= RARE_MIN_STATS) return 'rare';
  return 'common';
}
