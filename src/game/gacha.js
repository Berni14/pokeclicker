import {
  MAX_STARS,
  MAX_STARS_REFUND,
  PULL_BASE_PRICE,
  PULL_DISCOUNT_PER_LEVEL,
  PULL_PRICE_GROWTH,
  RARITY_WEIGHTS,
} from '../config/gacha';
import { TEAM_SIZE } from '../config/economy';
import { pokedexByRarity, pokedexEntry, POKEDEX } from '../config/pokedex';
import { XP_PER_MAX_DUPLICATE, XP_PER_PULL } from '../config/trainer';
import { pickOne, pickWeighted } from '../utils/random';
import { addXp } from './trainer';

export const pullPrice = (state) =>
  Math.round(
    PULL_BASE_PRICE *
      PULL_PRICE_GROWTH ** state.pulls *
      (1 - PULL_DISCOUNT_PER_LEVEL * state.upgrades.pullDiscount),
  );

export const canPull = (state) => state.coins >= pullPrice(state);

// La única función del juego con azar: sortea la rareza y después un Pokémon
// de esa rareza. Devuelve su id.
export function rollPokemon(generation, rng = Math.random) {
  const groups = pokedexByRarity(generation);
  const weights = Object.fromEntries(
    Object.entries(RARITY_WEIGHTS).filter(([rarity]) => groups[rarity]),
  );
  return pickOne(groups[pickWeighted(weights, rng)], rng).id;
}

// Qué pasará al recibir ese Pokémon: 'new', 'star' o 'refund' (ya tenía 5★).
export function pullOutcome(state, id) {
  const stars = state.collection[id] ?? 0;
  if (stars === 0) return 'new';
  if (stars < MAX_STARS) return 'star';
  return 'refund';
}

const inGeneration = (state, id) =>
  POKEDEX[state.generation]?.includes(pokedexEntry(id));

export function applyPull(state, id) {
  if (!canPull(state) || !inGeneration(state, id)) return state;

  const price = pullPrice(state);
  let next = { ...state, coins: state.coins - price, pulls: state.pulls + 1 };

  switch (pullOutcome(state, id)) {
    case 'new':
      next.collection = { ...state.collection, [id]: 1 };
      if (state.team.length < TEAM_SIZE) next.team = [...state.team, id];
      break;
    case 'star':
      next.collection = { ...state.collection, [id]: state.collection[id] + 1 };
      break;
    case 'refund':
      next.coins += MAX_STARS_REFUND * price;
      next = addXp(next, XP_PER_MAX_DUPLICATE);
      break;
  }

  return addXp(next, XP_PER_PULL);
}
