import { getPokemon } from '../api/pokemon';
import { getSpecies } from '../api/species';
import { toPokemon } from '../models/pokemon';
import { BATCH_SIZE } from '../config/generations';
import { getCached, setCached } from './cache';

const inFlight = new Map(); // id → promesa de la petición en curso

// Si ya hay una petición en curso para ese id, se reutiliza en vez de lanzar
// otra (pasa en desarrollo con StrictMode). Las peticiones compartidas no se
// cancelan: de eso se encarga quien las usa.
function fetchOne(id) {
  if (!inFlight.has(id)) {
    const promise = Promise.all([getPokemon(id), getSpecies(id)])
      .then(([raw, species]) => {
        const pokemon = toPokemon(raw, species);
        setCached(pokemon);
        return pokemon;
      })
      .finally(() => inFlight.delete(id));
    inFlight.set(id, promise);
  }
  return inFlight.get(id);
}

// Pide cualquier lista de ids, de BATCH_SIZE en BATCH_SIZE.
export async function getPokemonByIds(ids) {
  const result = [];
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const chunk = ids.slice(i, i + BATCH_SIZE).map(Number);
    const loaded = await Promise.all(
      chunk.map((id) => getCached(id) ?? fetchOne(id)),
    );
    result.push(...loaded);
  }
  return result.sort((a, b) => a.id - b.id);
}

export function getPokemonBatch(fromId, count) {
  const ids = Array.from({ length: count }, (_, i) => fromId + i);
  return getPokemonByIds(ids);
}
