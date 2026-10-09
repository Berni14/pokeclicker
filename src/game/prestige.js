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

// Pasa a la siguiente región llevándote solo `keepId`, que vuelve a 1★ y Nv 1
// como si fuera nuevo. Se mantienen el nivel de entrenador y las medallas; el
// resto vuelve a empezar (ver el apartado 9 de FUNCIONAMIENTO_DEL_JUEGO.md).
// La granja se queda con sus bayas; las que llevaban los Pokémon se pierden.
export function changeGeneration(state, keepId) {
  if (!canChangeGeneration(state) || !state.collection[keepId]) return state;
  const id = Number(keepId);
  return {
    ...state,
    generation: nextGeneration(state),
    coins: 0,
    upgrades: zeroFor(UPGRADES),
    items: [],
    boosts: {},
    pulls: zeroFor(BANNERS),
    collection: { [id]: 1 },
    levels: {},
    team: [id],
    heldBerries: {},
  };
}
