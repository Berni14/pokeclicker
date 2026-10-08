import { TEAM_SIZE } from '../config/economy';

export const isEquipped = (state, id) => state.team.includes(id);

export const isTeamFull = (state) => state.team.length >= TEAM_SIZE;

// Equipa un Pokémon de la colección. Con el equipo lleno, sustituye a `replaceId`.
export function equip(state, id, replaceId) {
  if (!state.collection[id] || isEquipped(state, id)) return state;
  if (!isTeamFull(state)) return { ...state, team: [...state.team, id] };
  if (!isEquipped(state, replaceId)) return state;
  return {
    ...state,
    team: state.team.map((teamId) => (teamId === replaceId ? id : teamId)),
  };
}

export function unequip(state, id) {
  if (!isEquipped(state, id)) return state;
  return { ...state, team: state.team.filter((teamId) => teamId !== id) };
}
