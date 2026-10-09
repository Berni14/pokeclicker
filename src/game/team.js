import { TEAM_SIZE } from '../config/economy';
import { currentGym, pokemonDps } from './battle';
import { pokemonProduction } from './production';

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

// Cómo puntúa cada criterio a un Pokémon de la colección. El daño se mide
// contra el gimnasio actual, así cuenta la ventaja de tipo.
const SCORES = {
  production: (state, id) => pokemonProduction(state, id),
  damage: (state, id) => pokemonDps(state, id, currentGym(state)),
};

// Los 6 mejores de la colección según `by` ('production' o 'damage'). En caso
// de empate gana el de número más bajo, para que el resultado sea estable.
export function bestTeam(state, by) {
  const score = SCORES[by];
  if (!score) return state.team;
  return Object.keys(state.collection)
    .map(Number)
    .map((id) => ({ id, score: score(state, id) }))
    .sort((a, b) => b.score - a.score || a.id - b.id)
    .slice(0, TEAM_SIZE)
    .map(({ id }) => id);
}

// Pone el mejor equipo. Si ya lo era (en cualquier orden), no cambia nada.
export function autoEquip(state, by) {
  const team = bestTeam(state, by);
  const same =
    team.length === state.team.length &&
    team.every((id) => state.team.includes(id));
  return same ? state : { ...state, team };
}
