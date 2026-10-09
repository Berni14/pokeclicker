import { levelUpCostOf, MAX_POKEMON_LEVEL } from '../config/economy';
import { pokedexEntry } from '../config/pokedex';

// Nivel de un Pokémon de tu colección. Los que nunca has subido están al 1.
export const pokemonLevel = (state, id) => state.levels[id] ?? 1;

export const isMaxLevel = (state, id) =>
  pokemonLevel(state, id) >= MAX_POKEMON_LEVEL;

export const levelUpCost = (state, id) =>
  levelUpCostOf(pokedexEntry(id), pokemonLevel(state, id));

export const canLevelUp = (state, id) =>
  Boolean(state.collection[id]) &&
  !isMaxLevel(state, id) &&
  state.coins >= levelUpCost(state, id);

// Sube un nivel a un Pokémon de la colección (equipado o en la caja).
export function levelUp(state, id) {
  if (!canLevelUp(state, id)) return state;
  return {
    ...state,
    coins: state.coins - levelUpCost(state, id),
    levels: { ...state.levels, [id]: pokemonLevel(state, id) + 1 },
  };
}
