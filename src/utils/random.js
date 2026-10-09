// `rng` devuelve un número en [0, 1), como Math.random. En los tests se pasa uno
// fijo para que el resultado sea siempre el mismo.

// Recibe { clave: peso, … } y devuelve una clave con probabilidad proporcional a su peso.
export function pickWeighted(weights, rng = Math.random) {
  const entries = Object.entries(weights).filter(([, weight]) => weight > 0);
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = rng() * total;
  for (const [key, weight] of entries) {
    if (roll < weight) return key;
    roll -= weight;
  }
  return entries.at(-1)[0]; // por si el redondeo deja `roll` justo en el total
}

export const pickOne = (list, rng = Math.random) =>
  list[Math.min(list.length - 1, Math.floor(rng() * list.length))];

// Número en [0, 1) que parece al azar pero sale siempre igual para el mismo `n`
// (un paso de mulberry32). Sirve para sorteos dentro del reducer, que tiene que
// ser puro.
export function unitHash(n) {
  let t = (Math.imul(n + 1, 0x6d2b79f5) + 0x9e3779b9) | 0;
  t = Math.imul(t ^ (t >>> 15), 1 | t);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
