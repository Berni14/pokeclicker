import { BOOSTS } from '../config/items';
import { productionOf, TRAINING_BONUS } from '../config/economy';
import { pokedexEntry } from '../config/pokedex';
import {
  boostMultiplier,
  boostTimeLeft,
  itemMultiplier,
  tickBoosts,
} from './items';
import { pokemonLevel } from './levels';
import { moneyMultiplier } from './trainer';

// Monedas por segundo de un Pokémon de tu colección, con estrellas y nivel.
export const pokemonProduction = (state, id) =>
  productionOf(pokedexEntry(id), state.collection[id], pokemonLevel(state, id));

// Monedas por segundo de todo el equipo sin contar potenciadores.
export function baseTeamProduction(state) {
  const base = state.team.reduce(
    (sum, id) => sum + pokemonProduction(state, id),
    0,
  );
  return (
    base *
    (1 + TRAINING_BONUS * state.upgrades.training) *
    moneyMultiplier(state) *
    itemMultiplier(state, 'production')
  );
}

// Monedas por segundo de todo el equipo ahora mismo. Es la que ve la interfaz.
export const teamProduction = (state) =>
  baseTeamProduction(state) * boostMultiplier(state, 'production');

// Suma lo producido en `seconds` y gasta ese tiempo de los potenciadores. Si un
// potenciador se acaba a mitad (por ejemplo, al volver tras horas fuera), solo
// multiplica los segundos que le quedaban.
export function tick(state, seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return state;
  const base = baseTeamProduction(state);
  let coins = base * seconds;
  for (const [key, boost] of Object.entries(BOOSTS)) {
    if (boost.target !== 'production') continue;
    const boosted = Math.min(seconds, boostTimeLeft(state, key));
    coins += base * (boost.multiplier - 1) * boosted;
  }
  return tickBoosts({ ...state, coins: state.coins + coins }, seconds);
}
