// Guardar y cargar la partida. Todo el guardado pasa por este archivo: si algún
// día se guarda en la nube, solo cambia esto.
import {
  MAX_OFFLINE_SECONDS,
  MAX_POKEMON_LEVEL,
  TEAM_SIZE,
} from '../config/economy';
import {
  BERRIES,
  BERRY_GROW_SECONDS,
  BERRY_SECONDS,
  BERRY_STORAGE,
} from '../config/berries';
import { BANNERS, MAX_STARS } from '../config/gacha';
import { GYMS } from '../config/gyms';
import { BOOST_MAX_SECONDS, BOOSTS, ITEMS } from '../config/items';
import { POKEDEX, pokedexEntry } from '../config/pokedex';
import { UPGRADES } from '../config/upgrades';
import { tick } from '../game/production';
import { initialState } from './initialState';

const SAVE_KEY = 'pkc:save';

// Lo que se guarda. pokemonById no: sale de la caché de la API.
const SAVED_FIELDS = [
  'saveVersion',
  'generation',
  'coins',
  'trainer',
  'upgrades',
  'items',
  'boosts',
  'pulls',
  'collection',
  'levels',
  'team',
  'medals',
  'farm',
  'heldBerries',
];

export function saveGame(state, now = Date.now()) {
  const data = Object.fromEntries(SAVED_FIELDS.map((key) => [key, state[key]]));
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...data, savedAt: now }));
    return true;
  } catch {
    return false; // incógnito, almacenamiento lleno o bloqueado: se sigue jugando
  }
}

export function loadGame() {
  try {
    return JSON.parse(localStorage.getItem(SAVE_KEY));
  } catch {
    return null; // texto corrupto o sin acceso a localStorage
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // Nada que borrar.
  }
}

// --- Limpieza --------------------------------------------------------------
// Una partida guardada puede estar corrupta o manipulada a mano. Todo lo que no
// sea válido se corrige o se descarta, para que nunca aparezca NaN.

const isInt = (n) => Number.isInteger(n);
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const validNumber = (n, fallback) =>
  Number.isFinite(n) && n >= 0 ? n : fallback;

function cleanCollection(collection) {
  const clean = {};
  for (const [id, stars] of Object.entries(collection ?? {})) {
    if (pokedexEntry(id) && isInt(stars) && stars >= 1) {
      clean[id] = clamp(stars, 1, MAX_STARS);
    }
  }
  return clean;
}

// Solo niveles de Pokémon que tienes. Las partidas de antes de los niveles no
// traen `levels`: todos sus Pokémon empiezan al 1.
function cleanLevels(levels, collection) {
  const clean = {};
  for (const [id, level] of Object.entries(levels ?? {})) {
    if (collection[id] && isInt(level) && level > 1) {
      clean[id] = Math.min(level, MAX_POKEMON_LEVEL);
    }
  }
  return clean;
}

function cleanTeam(team, collection) {
  if (!Array.isArray(team)) return [];
  const ids = team.filter((id) => isInt(id) && collection[id]);
  return [...new Set(ids)].slice(0, TEAM_SIZE);
}

function cleanUpgrades(upgrades) {
  return Object.fromEntries(
    Object.entries(UPGRADES).map(([key, { maxLevel }]) => {
      const level = upgrades?.[key];
      return [key, isInt(level) ? clamp(level, 0, maxLevel) : 0];
    }),
  );
}

function cleanItems(items) {
  if (!Array.isArray(items)) return [];
  return [...new Set(items.filter((key) => Object.hasOwn(ITEMS, key)))];
}

function cleanBoosts(boosts) {
  const clean = {};
  for (const [key, seconds] of Object.entries(boosts ?? {})) {
    if (Object.hasOwn(BOOSTS, key) && Number.isFinite(seconds) && seconds > 0) {
      clean[key] = Math.min(seconds, BOOST_MAX_SECONDS);
    }
  }
  return clean;
}

// Tiradas de cada gacha. Las partidas de antes de los tres gachas guardan un
// solo número: eran todas del básico.
function cleanPulls(pulls) {
  const saved = isInt(pulls) ? { basic: pulls } : (pulls ?? {});
  return Object.fromEntries(
    Object.keys(BANNERS).map((key) => {
      const n = saved[key];
      return [key, isInt(n) && n >= 0 ? n : 0];
    }),
  );
}

// Las partidas de antes de la granja no la traen: empieza vacía.
function cleanFarm(farm) {
  const stock = Array.isArray(farm?.stock)
    ? farm.stock.filter((key) => Object.hasOwn(BERRIES, key))
    : [];
  return {
    growth: clamp(validNumber(farm?.growth, 0), 0, BERRY_GROW_SECONDS),
    stock: stock.slice(0, BERRY_STORAGE),
    harvested:
      isInt(farm?.harvested) && farm.harvested >= 0 ? farm.harvested : 0,
  };
}

// Solo bayas de Pokémon que tienes, de una baya que exista y con tiempo.
function cleanHeldBerries(heldBerries, collection) {
  const clean = {};
  for (const [id, held] of Object.entries(heldBerries ?? {})) {
    if (
      collection[id] &&
      Object.hasOwn(BERRIES, held?.key) &&
      Number.isFinite(held.seconds) &&
      held.seconds > 0
    ) {
      clean[id] = {
        key: held.key,
        seconds: Math.min(held.seconds, BERRY_SECONDS),
      };
    }
  }
  return clean;
}

function cleanMedals(medals) {
  const clean = {};
  for (const [generation, numbers] of Object.entries(medals ?? {})) {
    const gyms = GYMS[generation];
    if (!gyms || !Array.isArray(numbers)) continue;
    const valid = numbers.filter((n) => gyms.some((gym) => gym.number === n));
    clean[generation] = [...new Set(valid)].sort((a, b) => a - b);
  }
  return clean;
}

// Devuelve el estado de juego a partir de lo guardado, o null si no sirve
// (no hay partida, es de otra versión o no tiene forma de partida).
export function sanitizeSave(save) {
  if (!save || typeof save !== 'object') return null;
  if (save.saveVersion !== initialState.saveVersion) return null;

  const collection = cleanCollection(save.collection);
  return {
    ...initialState,
    generation: POKEDEX[save.generation] ? save.generation : 1,
    coins: validNumber(save.coins, 0),
    trainer: {
      level:
        isInt(save.trainer?.level) && save.trainer.level >= 1
          ? save.trainer.level
          : 1,
      xp: validNumber(save.trainer?.xp, 0),
    },
    upgrades: cleanUpgrades(save.upgrades),
    items: cleanItems(save.items),
    boosts: cleanBoosts(save.boosts),
    pulls: cleanPulls(save.pulls),
    collection,
    levels: cleanLevels(save.levels, collection),
    team: cleanTeam(save.team, collection),
    medals: cleanMedals(save.medals),
    farm: cleanFarm(save.farm),
    heldBerries: cleanHeldBerries(save.heldBerries, collection),
  };
}

// Estado al abrir el juego: la partida guardada (limpia) más lo que produjo el
// equipo mientras no estabas, con un máximo de MAX_OFFLINE_SECONDS. Se usa como
// inicializador de useReducer: la partida está cargada antes del primer render.
export function createInitialState(now = Date.now()) {
  const save = loadGame();
  const state = sanitizeSave(save);
  if (!state) return initialState;

  const away = (now - save.savedAt) / 1000;
  if (!Number.isFinite(away) || away <= 0) return state;

  const seconds = Math.min(away, MAX_OFFLINE_SECONDS);
  const withEarnings = tick(state, seconds);
  const coins = withEarnings.coins - state.coins;
  return {
    ...withEarnings,
    offlineEarnings: coins >= 1 ? { seconds, coins } : null,
  };
}
