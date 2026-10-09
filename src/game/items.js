import { BOOSTS, ITEMS } from '../config/items';

// --- Multiplicadores ---------------------------------------------------------
// `target` es 'click' o 'production'.

// Lo que multiplican los objetos permanentes que tienes.
export const itemMultiplier = (state, target) =>
  state.items
    .filter((key) => ITEMS[key].target === target)
    .reduce((total, key) => total * ITEMS[key].multiplier, 1);

export const boostTimeLeft = (state, key) => state.boosts[key] ?? 0;

export const isBoostActive = (state, key) => boostTimeLeft(state, key) > 0;

// Lo que multiplican los potenciadores activos ahora mismo.
export const boostMultiplier = (state, target) =>
  Object.entries(BOOSTS)
    .filter(
      ([key, boost]) => boost.target === target && isBoostActive(state, key),
    )
    .reduce((total, [, boost]) => total * boost.multiplier, 1);

// Pasa el tiempo de los potenciadores. Los que se acaban desaparecen.
export function tickBoosts(state, seconds) {
  const keys = Object.keys(state.boosts);
  if (keys.length === 0) return state;
  const boosts = {};
  for (const key of keys) {
    const left = state.boosts[key] - seconds;
    if (left > 0) boosts[key] = left;
  }
  return { ...state, boosts };
}

// --- Objetos permanentes -----------------------------------------------------

export const hasItem = (state, key) => state.items.includes(key);

// 'locked' (falta nivel de entrenador), 'owned' o 'available'.
export function itemStatus(state, key) {
  if (hasItem(state, key)) return 'owned';
  if (state.trainer.level < ITEMS[key].minTrainerLevel) return 'locked';
  return 'available';
}

export const canBuyItem = (state, key) =>
  itemStatus(state, key) === 'available' && state.coins >= ITEMS[key].cost;

export function buyItem(state, key) {
  if (!Object.hasOwn(ITEMS, key) || !canBuyItem(state, key)) return state;
  return {
    ...state,
    coins: state.coins - ITEMS[key].cost,
    items: [...state.items, key],
  };
}
