import { getRarity } from '../config/rarities';

// BASE_URL respeta el `base` de Vite (en GitHub Pages es /pokeclicker/).
export const FALLBACK_SPRITE = `${import.meta.env.BASE_URL}pokeball.svg`;

// Los sprites pequeños tienen una URL fija: sirven para la Pokédex sin pedir
// nada a la API (también para los que aún no tienes, en silueta).
export const pixelSpriteUrl = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

export function toPokemon(raw, species) {
  const stats = Object.fromEntries(
    raw.stats.map((s) => [s.stat.name, s.base_stat]),
  );
  const statTotal = Object.values(stats).reduce((a, b) => a + b, 0);
  return {
    id: raw.id,
    name: raw.name,
    sprite:
      raw.sprites.other?.['official-artwork']?.front_default ??
      raw.sprites.front_default ??
      FALLBACK_SPRITE,
    types: [...raw.types]
      .sort((a, b) => a.slot - b.slot)
      .map((t) => t.type.name),
    stats,
    statTotal,
    rarity: getRarity({
      statTotal,
      isLegendary: species.is_legendary,
      isMythical: species.is_mythical,
    }),
  };
}
