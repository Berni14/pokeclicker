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
