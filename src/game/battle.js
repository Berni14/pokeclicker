import { levelMultiplier, starMultiplier } from '../config/economy';
import {
  ATTACK_DIVISOR,
  BATTLE_DAMAGE_PER_LEVEL,
  BATTLE_SECONDS,
  BATTLE_SECONDS_PER_LEVEL,
  GYM_MONEY_REWARD,
  GYMS,
  TEAM_POWER_PER_LEVEL,
  TYPE_ADVANTAGE,
} from '../config/gyms';
import { pokedexEntry } from '../config/pokedex';
import { XP_PER_GYM } from '../config/trainer';
import { STRONG_AGAINST } from '../config/typeChart';
import { clickPower } from './clicker';
import { pokemonLevel } from './levels';
import { addXp } from './trainer';

export const gymsOf = (state) => GYMS[state.generation] ?? [];

export const medalsOf = (state) => state.medals[state.generation] ?? [];

export const battleDuration = (state) =>
  BATTLE_SECONDS + BATTLE_SECONDS_PER_LEVEL * state.upgrades.battleTime;

// Daño de un click en combate.
export const clickDamage = (state) =>
  clickPower(state) *
  (1 + BATTLE_DAMAGE_PER_LEVEL * state.upgrades.battleDamage);

// Sin gimnasio (todos ganados) no hay ventaja de tipo.
export const hasTypeAdvantage = (entry, gym) =>
  Boolean(gym) &&
  entry.types.some((type) => STRONG_AGAINST[gym.type]?.includes(type));

// Multiplicador de la mejora Poder del equipo.
export const teamPowerMultiplier = (state) =>
  1 + TEAM_POWER_PER_LEVEL * state.upgrades.teamPower;

// Daño por segundo de un Pokémon de tu colección contra un líder.
export function pokemonDps(state, id, gym) {
  const entry = pokedexEntry(id);
  const advantage = hasTypeAdvantage(entry, gym) ? TYPE_ADVANTAGE : 1;
  return (
    (entry.attack / ATTACK_DIVISOR) *
    starMultiplier(state.collection[id]) *
    levelMultiplier(pokemonLevel(state, id)) *
    teamPowerMultiplier(state) *
    advantage
  );
}

export const teamDps = (state, gym) =>
  state.team.reduce((sum, id) => sum + pokemonDps(state, id, gym), 0);

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

// Clicks por segundo que harían falta para ganar, contando con el equipo.
// 0 o menos si el equipo gana solo. Infinity si no hay daño de click (no
// debería pasar: el click base es 1).
export function clicksPerSecondNeeded(state, gym) {
  const seconds = battleDuration(state);
  const fromTeam = teamDps(state, gym) * seconds;
  return (gym.hp - fromTeam) / (clickDamage(state) * seconds);
}

// --- Combate ---------------------------------------------------------------
// El estado de un combate es local de la pantalla (no va al store). Al empezar
// se guardan los números del jugador: cambiar el equipo o comprar mejoras a
// mitad de combate no lo altera.

export function createBattle(state, gym) {
  const duration = battleDuration(state);
  return {
    gym,
    duration,
    clickDamage: clickDamage(state),
    teamDps: teamDps(state, gym),
    hp: gym.hp,
    timeLeft: duration,
    teamDamage: 0,
    status: 'ready', // 'ready' | 'fighting' | 'won' | 'lost'
  };
}

export function battleReducer(battle, action) {
  switch (action.type) {
    case 'START':
      return battle.status === 'ready'
        ? { ...battle, status: 'fighting' }
        : battle;

    case 'ATTACK': {
      if (battle.status !== 'fighting') return battle;
      const hp = Math.max(0, battle.hp - battle.clickDamage);
      return { ...battle, hp, status: hp === 0 ? 'won' : 'fighting' };
    }

    case 'TICK': {
      if (battle.status !== 'fighting') return battle;
      const seconds = Math.min(action.seconds, battle.timeLeft);
      if (!(seconds > 0)) return battle;
      const teamHit = Math.min(battle.teamDps * seconds, battle.hp);
      const hp = Math.max(0, battle.hp - teamHit);
      const timeLeft = battle.timeLeft - seconds;
      let status = 'fighting';
      if (hp === 0) status = 'won';
      else if (timeLeft <= 0) status = 'lost';
      return {
        ...battle,
        hp,
        timeLeft,
        teamDamage: battle.teamDamage + teamHit,
        status,
      };
    }

    case 'RETRY':
      return {
        ...battle,
        hp: battle.gym.hp,
        timeLeft: battle.duration,
        teamDamage: 0,
        status: 'ready',
      };

    default:
      return battle;
  }
}
