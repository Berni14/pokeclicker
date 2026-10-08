import { productionOf, TRAINING_BONUS } from '../config/economy';
import { pokedexEntry } from '../config/pokedex';
import { moneyMultiplier } from './trainer';

// Monedas por segundo de un Pokémon de tu colección, con sus estrellas.
export const pokemonProduction = (state, id) =>
  productionOf(pokedexEntry(id), state.collection[id]);

// Monedas por segundo de todo el equipo. Es la que usan el tick y la interfaz.
export function teamProduction(state) {
  const base = state.team.reduce(
    (sum, id) => sum + pokemonProduction(state, id),
    0,
  );
  return (
    base *
    (1 + TRAINING_BONUS * state.upgrades.training) *
    moneyMultiplier(state)
  );
}

export function tick(state, seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return state;
  return { ...state, coins: state.coins + teamProduction(state) * seconds };
}
