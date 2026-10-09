import {
  BANNERS,
  MAX_STARS,
  MAX_STARS_REFUND,
  PULL_DISCOUNT_PER_LEVEL,
} from '../config/gacha';
import { TEAM_SIZE } from '../config/economy';
import { pokedexByRarity, pokedexEntry, POKEDEX } from '../config/pokedex';
import { XP_PER_MAX_DUPLICATE, XP_PER_PULL } from '../config/trainer';
import { pickOne, pickWeighted } from '../utils/random';
import { addXp } from './trainer';

// Tiradas hechas en un gacha.
export const pullsOf = (state, banner) => state.pulls[banner] ?? 0;

export const totalPulls = (state) =>
  Object.keys(BANNERS).reduce((sum, key) => sum + pullsOf(state, key), 0);

export const pullPrice = (state, banner) =>
  Math.round(
    BANNERS[banner].basePrice *
      BANNERS[banner].priceGrowth ** pullsOf(state, banner) *
      (1 - PULL_DISCOUNT_PER_LEVEL * state.upgrades.pullDiscount),
  );

// Probabilidad de cada rareza del gacha, sin las que no tienen ningún Pokémon
// en la generación.
export function bannerWeights(generation, banner) {
  const groups = pokedexByRarity(generation);
  return Object.fromEntries(
    Object.entries(BANNERS[banner]?.weights ?? {}).filter(
      ([rarity]) => groups[rarity],
    ),
  );
}

// Pokémon de la generación que pueden salir en un gacha.
export const bannerPokemon = (generation, banner) =>
  Object.keys(bannerWeights(generation, banner)).flatMap(
    (rarity) => pokedexByRarity(generation)[rarity],
  );

export const canPull = (state, banner) =>
  bannerPokemon(state.generation, banner).length > 0 &&
  state.coins >= pullPrice(state, banner);

// La única función del juego con azar: sortea la rareza del gacha y después un
// Pokémon de esa rareza. Devuelve su id.
export function rollPokemon(generation, banner, rng = Math.random) {
  const groups = pokedexByRarity(generation);
  const rarity = pickWeighted(bannerWeights(generation, banner), rng);
  return pickOne(groups[rarity], rng).id;
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

// Solo vale un Pokémon que pueda salir en ese gacha.
const inBanner = (state, id, banner) =>
  inGeneration(state, id) &&
  Object.hasOwn(
    bannerWeights(state.generation, banner),
    pokedexEntry(id).rarity,
  );

export function applyPull(state, id, banner) {
  if (!canPull(state, banner) || !inBanner(state, id, banner)) return state;

  const price = pullPrice(state, banner);
  let next = {
    ...state,
    coins: state.coins - price,
    pulls: { ...state.pulls, [banner]: pullsOf(state, banner) + 1 },
  };

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
