import {
  BERRIES,
  BERRY_GROW_SECONDS,
  BERRY_SECONDS,
  BERRY_STORAGE,
} from '../config/berries';
import { pickWeighted, unitHash } from '../utils/random';

const weights = Object.fromEntries(
  Object.entries(BERRIES).map(([key, { weight }]) => [key, weight]),
);

// Qué baya da la granja en su cosecha número `n`. Parece al azar, pero sale
// siempre la misma para el mismo `n`: así el reducer sigue siendo puro.
export const berryForHarvest = (n) => pickWeighted(weights, () => unitHash(n));

export const isFarmFull = (state) => state.farm.stock.length >= BERRY_STORAGE;

// Segundos que faltan para la próxima baya (null con la granja llena).
export const secondsToNextBerry = (state) =>
  isFarmFull(state) ? null : BERRY_GROW_SECONDS - state.farm.growth;

// Baya que lleva un Pokémon ahora mismo: { key, seconds } o null.
export const heldBerry = (state, id) => state.heldBerries[id] ?? null;

// Multiplicador de la baya de un Pokémon sobre 'production' o 'damage'.
export function berryMultiplier(state, id, target) {
  const held = heldBerry(state, id);
  return held ? BERRIES[held.key][target] : 1;
}

// Solo a un Pokémon del equipo, que no lleve ya una, y con esa baya guardada.
export const canGiveBerry = (state, key, id) =>
  state.farm.stock.includes(key) &&
  state.team.includes(Number(id)) &&
  !heldBerry(state, id);

export function giveBerry(state, key, id) {
  if (!canGiveBerry(state, key, id)) return state;
  const stock = [...state.farm.stock];
  stock.splice(stock.indexOf(key), 1);
  return {
    ...state,
    farm: { ...state.farm, stock },
    heldBerries: {
      ...state.heldBerries,
      [id]: { key, seconds: BERRY_SECONDS },
    },
  };
}

// Pasa el tiempo: la granja crece (si no está llena) y las bayas equipadas se
// gastan. Las que se acaban desaparecen.
export function tickBerries(state, seconds) {
  let { growth, stock, harvested } = state.farm;
  if (stock.length < BERRY_STORAGE) {
    growth += seconds;
    stock = [...stock];
    while (growth >= BERRY_GROW_SECONDS && stock.length < BERRY_STORAGE) {
      growth -= BERRY_GROW_SECONDS;
      stock.push(berryForHarvest(harvested));
      harvested += 1;
    }
    // Llena, se para: la siguiente empieza de cero cuando gastes una.
    if (stock.length >= BERRY_STORAGE) growth = 0;
  }

  const heldBerries = {};
  for (const [id, held] of Object.entries(state.heldBerries)) {
    const left = held.seconds - seconds;
    if (left > 0) heldBerries[id] = { ...held, seconds: left };
  }

  return { ...state, farm: { growth, stock, harvested }, heldBerries };
}
