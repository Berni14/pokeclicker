import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getCached, setCached, clearCache } from './cache';

const STORAGE_KEY = 'pkc:pokemon:v1';
const pikachu = { id: 25, name: 'pikachu' };

beforeEach(() => {
  clearCache();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('cache', () => {
  it('devuelve lo guardado, también si el id llega como texto', () => {
    setCached(pikachu);
    expect(getCached(25)).toEqual(pikachu);
    expect(getCached('25')).toEqual(pikachu);
    expect(getCached(1)).toBeUndefined();
  });

  it('guarda en localStorage con clave versionada', () => {
    setCached(pikachu);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual([pikachu]);
  });

  it('recupera desde localStorage tras recargar la página', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([pikachu]));
    expect(getCached(25)).toEqual(pikachu);
  });

  it('ignora datos corruptos en localStorage', () => {
    localStorage.setItem(STORAGE_KEY, '{esto no es json');
    expect(getCached(25)).toBeUndefined();
    setCached(pikachu);
    expect(getCached(25)).toEqual(pikachu);
  });

  it('sigue funcionando en memoria si localStorage falla', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    expect(() => setCached(pikachu)).not.toThrow();
    expect(getCached(25)).toEqual(pikachu);
  });
});
