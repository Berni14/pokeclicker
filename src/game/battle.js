import { starMultiplier } from '../config/economy';
import {
  ATTACK_DIVISOR,
  BATTLE_DAMAGE_PER_LEVEL,
  BATTLE_SECONDS,
  BATTLE_SECONDS_PER_LEVEL,
  GYM_MONEY_REWARD,
  GYMS,
  TEAM_DAMAGE_CAP,
  TYPE_ADVANTAGE,
} from '../config/gyms';
import { pokedexEntry } from '../config/pokedex';
import { XP_PER_GYM } from '../config/trainer';
import { STRONG_AGAINST } from '../config/typeChart';
import { clickPower } from './clicker';
import { addXp } from './trainer';

export const gymsOf = (state) => GYMS[state.generation] ?? [];

export const medalsOf = (state) => state.medals[state.generation] ?? [];

export const battleDuration = (state) =>
  BATTLE_SECONDS + BATTLE_SECONDS_PER_LEVEL * state.upgrades.battleTime;

// Daño de un click en combate.
export const clickDamage = (state) =>
  clickPower(state) *
  (1 + BATTLE_DAMAGE_PER_LEVEL * state.upgrades.battleDamage);

export const hasTypeAdvantage = (entry, gym) =>
  entry.types.some((type) => STRONG_AGAINST[gym.type]?.includes(type));

// Daño por segundo de un Pokémon de tu colección contra un líder.
export function pokemonDps(state, id, gym) {
  const entry = pokedexEntry(id);
  const advantage = hasTypeAdvantage(entry, gym) ? TYPE_ADVANTAGE : 1;
  return (
    (entry.attack / ATTACK_DIVISOR) *
    starMultiplier(state.collection[id]) *
    advantage
  );
}

export const teamDps = (state, gym) =>
  state.team.reduce((sum, id) => sum + pokemonDps(state, id, gym), 0);

// El equipo nunca puede hacer más de esto: el resto tiene que salir de los clicks.
export const maxTeamDamage = (gym) => gym.hp * TEAM_DAMAGE_CAP;

// El primer gimnasio sin medalla, o null si ya están todos.
export const currentGym = (state) =>
  gymsOf(state).find((gym) => !medalsOf(state).includes(gym.number)) ?? null;

// 'won', 'current' o 'locked'.
export function gymStatus(state, number) {
  if (medalsOf(state).includes(number)) return 'won';
  if (currentGym(state)?.number === number) return 'current';
  return 'locked';
}

// Solo se puede ganar el gimnasio actual: ni uno bloqueado ni uno ya vencido.
export function applyGymWin(state, number) {
  const gym = currentGym(state);
  if (!gym || gym.number !== number) return state;
  const next = {
    ...state,
    coins: state.coins + gym.hp * GYM_MONEY_REWARD,
    medals: {
      ...state.medals,
      [state.generation]: [...medalsOf(state), number],
    },
  };
  return addXp(next, XP_PER_GYM * number);
}
