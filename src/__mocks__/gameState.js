import { initialState } from '../store/initialState';

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
  }
  return value;
}

// Estado de partida para los tests: el inicial con los cambios que se pidan.
// Está congelado: si una función de game/ intenta modificarlo, el test falla.
export function makeState({ trainer, upgrades, ...rest } = {}) {
  const base = structuredClone(initialState);
  return deepFreeze({
    ...base,
    ...rest,
    trainer: { ...base.trainer, ...trainer },
    upgrades: { ...base.upgrades, ...upgrades },
  });
}

// Generador de números aleatorios con semilla (mulberry32): siempre da la misma
// secuencia para la misma semilla.
export function seededRng(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
