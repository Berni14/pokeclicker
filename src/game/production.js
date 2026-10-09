import { BERRIES } from '../config/berries';
import { BOOSTS } from '../config/items';
import { productionOf, TRAINING_BONUS } from '../config/economy';
import { pokedexEntry } from '../config/pokedex';
import { berryMultiplier, heldBerry, tickBerries } from './berries';
import {
  boostMultiplier,
  boostTimeLeft,
  itemMultiplier,
  tickBoosts,
} from './items';
import { pokemonLevel } from './levels';
import { moneyMultiplier } from './trainer';

// Monedas por segundo de un Pokémon con sus estrellas y su nivel, sin baya.
const rawProduction = (state, id) =>
  productionOf(pokedexEntry(id), state.collection[id], pokemonLevel(state, id));

// Monedas por segundo de un Pokémon de tu colección, con estrellas, nivel y
// la baya que lleve.
export const pokemonProduction = (state, id) =>
  rawProduction(state, id) * berryMultiplier(state, id, 'production');

// Lo que multiplica a todo el equipo: Entrenamiento, nivel de entrenador y
// objetos.
const teamMultiplier = (state) =>
  (1 + TRAINING_BONUS * state.upgrades.training) *
  moneyMultiplier(state) *
  itemMultiplier(state, 'production');

// Monedas por segundo de todo el equipo sin contar potenciadores.
export const baseTeamProduction = (state) =>
  state.team.reduce((sum, id) => sum + pokemonProduction(state, id), 0) *
  teamMultiplier(state);

// Monedas por segundo de todo el equipo ahora mismo. Es la que ve la interfaz.
export const teamProduction = (state) =>
  baseTeamProduction(state) * boostMultiplier(state, 'production');

// Monedas del equipo en `seconds` sin potenciadores. Una baya que se acaba a
// mitad solo multiplica los segundos que le quedaban.
function teamCoins(state, seconds) {
  const coins = state.team.reduce((sum, id) => {
    const held = heldBerry(state, id);
    const extra = held
      ? (BERRIES[held.key].production - 1) * Math.min(seconds, held.seconds)
      : 0;
    return sum + rawProduction(state, id) * (seconds + extra);
  }, 0);
  return coins * teamMultiplier(state);
}

// Suma lo producido en `seconds` y gasta ese tiempo de los potenciadores y las
// bayas; la granja también crece. Si un potenciador se acaba a mitad (por
// ejemplo, al volver tras horas fuera), solo multiplica los segundos que le
// quedaban.
export function tick(state, seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return state;
  const base = teamCoins(state, seconds);
  let coins = base;
  for (const [key, boost] of Object.entries(BOOSTS)) {
    if (boost.target !== 'production') continue;
    const boosted = Math.min(seconds, boostTimeLeft(state, key));
    coins += (base / seconds) * (boost.multiplier - 1) * boosted;
  }
  const next = tickBoosts({ ...state, coins: state.coins + coins }, seconds);
  return tickBerries(next, seconds);
}
