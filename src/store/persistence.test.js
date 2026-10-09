import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  clearSave,
  createInitialState,
  loadGame,
  sanitizeSave,
  saveGame,
} from './persistence';
import { initialState } from './initialState';
import { makeState } from '../__mocks__/gameState';

const SAVE_KEY = 'pkc:save';
const HOUR = 3600 * 1000;

afterEach(() => {
  vi.restoreAllMocks();
});

const save = (data) => localStorage.setItem(SAVE_KEY, JSON.stringify(data));
const validSave = (overrides = {}) => ({
  saveVersion: 1,
  generation: 1,
  coins: 100,
  trainer: { level: 2, xp: 30 },
  upgrades: { clickPower: 3 },
  pulls: 4,
  collection: { 25: 2, 150: 1 },
  team: [25],
  medals: { 1: [1] },
  savedAt: 1_000_000,
  ...overrides,
});

describe('saveGame y loadGame', () => {
  it('guarda la partida con la hora, sin los datos de la API', () => {
    const state = makeState({
      coins: 42,
      pokemonById: { 25: { name: 'pikachu' } },
      offlineEarnings: { seconds: 5, coins: 5 },
    });
    expect(saveGame(state, 123)).toBe(true);
    const saved = loadGame();
    expect(saved.coins).toBe(42);
    expect(saved.savedAt).toBe(123);
    expect(saved).not.toHaveProperty('pokemonById');
    expect(saved).not.toHaveProperty('offlineEarnings');
  });

  it('sin partida, o con texto corrupto, loadGame da null', () => {
    expect(loadGame()).toBeNull();
    localStorage.setItem(SAVE_KEY, '{roto');
    expect(loadGame()).toBeNull();
  });

  it('si localStorage falla, no rompe el juego', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(saveGame(makeState())).toBe(false);
    expect(loadGame()).toBeNull();
    expect(createInitialState()).toBe(initialState);
  });

  it('clearSave borra la partida', () => {
    saveGame(makeState());
    clearSave();
    expect(loadGame()).toBeNull();
  });
});

describe('sanitizeSave', () => {
  it('una partida válida se carga tal cual', () => {
    expect(sanitizeSave(validSave())).toMatchObject({
      coins: 100,
      trainer: { level: 2, xp: 30 },
      upgrades: { clickPower: 3, training: 0 },
      collection: { 25: 2, 150: 1 },
      team: [25],
      medals: { 1: [1] },
    });
  });

  it('otra versión o algo que no es una partida → null', () => {
    expect(sanitizeSave(validSave({ saveVersion: 999 }))).toBeNull();
    expect(sanitizeSave(null)).toBeNull();
    expect(sanitizeSave('hola')).toBeNull();
  });

  it('corrige números imposibles en vez de dejar NaN', () => {
    const state = sanitizeSave(
      validSave({
        coins: -50,
        pulls: 2.5,
        trainer: { level: 'nueve', xp: NaN },
        upgrades: { clickPower: 999, training: -1, battleTime: 'x' },
      }),
    );
    expect(state.coins).toBe(0);
    expect(state.pulls).toBe(0);
    expect(state.trainer).toEqual({ level: 1, xp: 0 });
    expect(state.upgrades).toMatchObject({
      clickPower: 15, // el máximo
      training: 0,
      battleTime: 0,
    });
  });

  it('limpia colección, equipo y medallas', () => {
    const state = sanitizeSave(
      validSave({
        collection: { 25: 9, 150: 0, 999: 3, 7: '2', 1: 1 },
        team: [25, 25, 150, 999, 1, 'x'],
        medals: { 1: [1, 1, 3, 42], 7: [1] },
      }),
    );
    // 25 con 9★ → 5★; 150 con 0★, 999 (no existe) y '2' (texto) fuera.
    expect(state.collection).toEqual({ 25: 5, 1: 1 });
    // Solo ids de la colección, sin repetir.
    expect(state.team).toEqual([25, 1]);
    // Sin repetidas, sin gimnasios que no existen ni generaciones sin gimnasios.
    expect(state.medals).toEqual({ 1: [1, 3] });
  });

  it('una partida de antes de los niveles carga con todos al nivel 1', () => {
    const state = sanitizeSave(validSave());
    expect(state.levels).toEqual({});
    expect(state.upgrades.teamPower).toBe(0);
  });

  it('limpia los niveles', () => {
    const state = sanitizeSave(
      validSave({ levels: { 25: 12, 150: 500, 7: 4, 1: 'x', 6: 0 } }),
    );
    // 7 no está en la colección; 150 se queda en el máximo.
    expect(state.levels).toEqual({ 25: 12, 150: 100 });
  });

  it('nunca más de 6 en el equipo', () => {
    const ids = [1, 2, 3, 4, 5, 6, 7, 8];
    const state = sanitizeSave(
      validSave({
        collection: Object.fromEntries(ids.map((id) => [id, 1])),
        team: ids,
      }),
    );
    expect(state.team).toEqual([1, 2, 3, 4, 5, 6]);
  });
});

describe('createInitialState', () => {
  it('sin partida guardada, empieza de cero', () => {
    expect(createInitialState()).toBe(initialState);
  });

  it('con una partida corrupta o de otra versión, empieza de cero', () => {
    save(validSave({ saveVersion: 0 }));
    expect(createInitialState()).toBe(initialState);
  });

  it('suma lo que produjo el equipo mientras no estabas', () => {
    // Pikachu 2★ produce 1,5/s: una hora fuera son 5400 monedas.
    save(validSave({ savedAt: 0 }));
    const state = createInitialState(HOUR);
    expect(state.coins).toBeCloseTo(100 + 5400 * 1.05); // nivel 2: +5 %
    expect(state.offlineEarnings.seconds).toBe(3600);
    expect(state.offlineEarnings.coins).toBeCloseTo(5400 * 1.05);
  });

  it('como mucho 8 horas', () => {
    save(validSave({ savedAt: 0 }));
    const state = createInitialState(3 * 24 * HOUR);
    expect(state.offlineEarnings.seconds).toBe(8 * 3600);
  });

  it('sin equipo o con la hora del futuro no hay aviso', () => {
    save(validSave({ team: [], savedAt: 0 }));
    expect(createInitialState(HOUR).offlineEarnings).toBeNull();
    save(validSave({ savedAt: 10 * HOUR }));
    const state = createInitialState(HOUR);
    expect(state.offlineEarnings).toBeNull();
    expect(state.coins).toBe(100);
  });

  it('guardar y cargar al momento devuelve la misma partida', () => {
    const state = makeState({
      coins: 77,
      collection: { 25: 3 },
      team: [25],
      medals: { 1: [1, 2] },
      upgrades: { training: 2 },
    });
    saveGame(state, 5000);
    const loaded = createInitialState(5000);
    for (const key of ['coins', 'collection', 'team', 'medals', 'upgrades']) {
      expect(loaded[key]).toEqual(state[key]);
    }
  });
});
