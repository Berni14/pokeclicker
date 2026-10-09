import { CLICK_BASE } from '../config/economy';
import { boostMultiplier, itemMultiplier } from './items';
import { moneyMultiplier } from './trainer';

// Poder de click: es también el daño en combate. Los objetos no lo cambian.
export const clickPower = (state) => CLICK_BASE + state.upgrades.clickPower;

// Monedas de un click sin contar potenciadores.
export const baseClickValue = (state) =>
  clickPower(state) * moneyMultiplier(state) * itemMultiplier(state, 'click');

// Monedas que da un click.
export const clickValue = (state) =>
  baseClickValue(state) * boostMultiplier(state, 'click');

export const click = (state) => ({
  ...state,
  coins: state.coins + clickValue(state),
});
