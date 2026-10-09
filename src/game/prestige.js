import { GENERATIONS } from '../config/generations';
import { GYMS } from '../config/gyms';
import { BANNERS } from '../config/gacha';
import { POKEDEX } from '../config/pokedex';
import { UPGRADES } from '../config/upgrades';
import { currentGym } from './battle';

const zeroFor = (config) =>
  Object.fromEntries(Object.keys(config).map((key) => [key, 0]));

// La generación siguiente, o null si no hay más.
export function nextGeneration(state) {
  const next = state.generation + 1;
  return POKEDEX[next] && GYMS[next] && GENERATIONS[next] ? next : null;
}

export const regionOf = (generation) => GENERATIONS[generation]?.region ?? '';

// Se puede viajar con los 8 gimnasios de la región ganados y otra región por
// delante.
export const canChangeGeneration = (state) =>
  currentGym(state) === null && nextGeneration(state) !== null;

// Pasa a la siguiente región llevándote solo `keepId`, con sus estrellas y su
// nivel. Se mantienen el nivel de entrenador y las medallas; el resto vuelve a
// empezar (ver el apartado 9 de FUNCIONAMIENTO_DEL_JUEGO.md).
export function changeGeneration(state, keepId) {
  if (!canChangeGeneration(state) || !state.collection[keepId]) return state;
  const id = Number(keepId);
  const level = state.levels[id];
  return {
    ...state,
    generation: nextGeneration(state),
    coins: 0,
    upgrades: zeroFor(UPGRADES),
    items: [],
    boosts: {},
    pulls: zeroFor(BANNERS),
    collection: { [id]: state.collection[id] },
    levels: level ? { [id]: level } : {},
    team: [id],
  };
}
