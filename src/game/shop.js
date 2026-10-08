import { UPGRADES } from '../config/upgrades';

export const upgradeCost = (key, level) =>
  Math.round(UPGRADES[key].baseCost * UPGRADES[key].growth ** level);

export const nextUpgradeCost = (state, key) =>
  upgradeCost(key, state.upgrades[key]);

// 'locked' (falta nivel de entrenador), 'max' o 'available'.
export function upgradeStatus(state, key) {
  const upgrade = UPGRADES[key];
  if (state.trainer.level < upgrade.minTrainerLevel) return 'locked';
  if (state.upgrades[key] >= upgrade.maxLevel) return 'max';
  return 'available';
}

export const canBuyUpgrade = (state, key) =>
  upgradeStatus(state, key) === 'available' &&
  state.coins >= nextUpgradeCost(state, key);

export function buyUpgrade(state, key) {
  if (!(key in UPGRADES) || !canBuyUpgrade(state, key)) return state;
  return {
    ...state,
    coins: state.coins - nextUpgradeCost(state, key),
    upgrades: { ...state.upgrades, [key]: state.upgrades[key] + 1 },
  };
}
