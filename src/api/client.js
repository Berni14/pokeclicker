const BASE_URL = 'https://pokeapi.co/api/v2';

export async function apiGet(path, { signal } = {}) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, { signal });
  } catch (err) {
    // Una cancelación no es un error de verdad: se deja pasar tal cual.
    if (err.name === 'AbortError') throw err;
    throw new Error('No se pudo conectar con la PokeAPI. Revisa tu conexión.', {
      cause: err,
    });
  }
  if (!res.ok) throw new Error(`La PokeAPI respondió ${res.status} en ${path}`);
  return res.json();
}
