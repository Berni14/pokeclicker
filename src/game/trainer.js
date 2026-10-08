import { MONEY_BONUS_PER_LEVEL, xpToNextLevel } from '../config/trainer';

// Multiplica todo el dinero que se gana (clicks y producción).
export const moneyMultiplier = (state) =>
  1 + MONEY_BONUS_PER_LEVEL * (state.trainer.level - 1);

// Suma experiencia y sube de nivel las veces que haga falta.
export function addXp(state, amount) {
  let { level, xp } = state.trainer;
  xp += amount;
  while (xp >= xpToNextLevel(level)) {
    xp -= xpToNextLevel(level);
    level += 1;
  }
  return { ...state, trainer: { level, xp } };
}
