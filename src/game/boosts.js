import {
  BOOST_CLICKS_PER_SECOND,
  BOOST_MAX_SECONDS,
  BOOST_MIN_COST,
  BOOSTS,
} from '../config/items';
import { baseClickValue } from './clicker';
import { boostTimeLeft } from './items';
import { baseTeamProduction } from './production';

// Monedas por segundo que mejora el potenciador, sin contar potenciadores
// activos: comprar un Ataque X con otro activo no lo encarece.
function incomeFor(state, target) {
  if (target === 'click')
    return baseClickValue(state) * BOOST_CLICKS_PER_SECOND;
  return baseTeamProduction(state);
}

export const boostCost = (state, key) =>
  Math.round(
    Math.max(
      BOOST_MIN_COST,
      incomeFor(state, BOOSTS[key].target) * BOOSTS[key].costSeconds,
    ),
  );

// 'locked' (falta nivel de entrenador), 'full' (ya lleva el tiempo máximo
// acumulado) o 'available'.
export function boostStatus(state, key) {
  const boost = BOOSTS[key];
  if (state.trainer.level < boost.minTrainerLevel) return 'locked';
  if (boostTimeLeft(state, key) + boost.seconds > BOOST_MAX_SECONDS)
    return 'full';
  return 'available';
}

export const canBuyBoost = (state, key) =>
  boostStatus(state, key) === 'available' &&
  state.coins >= boostCost(state, key);

// Activa el potenciador o, si ya estaba activo, le suma su duración.
export function buyBoost(state, key) {
  if (!Object.hasOwn(BOOSTS, key) || !canBuyBoost(state, key)) return state;
  return {
    ...state,
    coins: state.coins - boostCost(state, key),
    boosts: {
      ...state.boosts,
      [key]: boostTimeLeft(state, key) + BOOSTS[key].seconds,
    },
  };
}
