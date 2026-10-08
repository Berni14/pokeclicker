import { CLICK_BASE } from '../config/economy';
import { moneyMultiplier } from './trainer';

export const clickPower = (state) => CLICK_BASE + state.upgrades.clickPower;

// Monedas que da un click.
export const clickValue = (state) => clickPower(state) * moneyMultiplier(state);

export const click = (state) => ({
  ...state,
  coins: state.coins + clickValue(state),
});
