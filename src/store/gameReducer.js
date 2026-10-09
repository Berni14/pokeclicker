import { click } from '../game/clicker';
import { tick } from '../game/production';
import { applyPull } from '../game/gacha';
import { levelUp } from '../game/levels';
import { buyBoost } from '../game/boosts';
import { buyItem } from '../game/items';
import { buyUpgrade } from '../game/shop';
import { equip, unequip } from '../game/team';
import { applyGymWin } from '../game/battle';
import { initialState } from './initialState';

// Cada acción delega en su función de game/. El sorteo del gacha se hace fuera
// (rollPokemon) y llega ya resuelto en `PULL`: así el reducer es puro.
export function gameReducer(state, action) {
  switch (action.type) {
    case 'CLICK':
      return click(state);
    case 'TICK':
      return tick(state, action.seconds);
    case 'PULL':
      return applyPull(state, action.id);
    case 'BUY_UPGRADE':
      return buyUpgrade(state, action.key);
    case 'BUY_ITEM':
      return buyItem(state, action.key);
    case 'BUY_BOOST':
      return buyBoost(state, action.key);
    case 'LEVEL_UP':
      return levelUp(state, action.id);
    case 'EQUIP':
      return equip(state, action.id, action.replaceId);
    case 'UNEQUIP':
      return unequip(state, action.id);
    case 'GYM_WON':
      return applyGymWin(state, action.number);
    case 'POKEMON_LOADED':
      return {
        ...state,
        pokemonById: {
          ...state.pokemonById,
          ...Object.fromEntries(action.pokemon.map((p) => [p.id, p])),
        },
      };
    case 'DISMISS_OFFLINE':
      return { ...state, offlineEarnings: null };
    case 'RESET':
      return { ...initialState, pokemonById: state.pokemonById };
    default:
      return state;
  }
}
