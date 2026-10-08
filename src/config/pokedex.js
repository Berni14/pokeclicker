import gen1 from './pokedex-gen1.json';

// Datos de juego de cada generación, generados con `npm run pokedex -- N`.
export const POKEDEX = {
  1: gen1,
};

const byId = new Map(
  Object.values(POKEDEX)
    .flat()
    .map((entry) => [entry.id, entry]),
);

export const pokedexEntry = (id) => byId.get(Number(id));

const byRarity = {};

// { common: [...], rare: [...], … } de una generación, calculado una sola vez.
export function pokedexByRarity(generation) {
  if (!byRarity[generation]) {
    const groups = {};
    for (const entry of POKEDEX[generation] ?? []) {
      (groups[entry.rarity] ??= []).push(entry);
    }
    byRarity[generation] = groups;
  }
  return byRarity[generation];
}
