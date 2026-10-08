import { vi } from 'vitest';
import pikachu from './pikachu.json';
import pikachuSpecies from './pikachu-species.json';

// Simula la PokeAPI: responde a /pokemon/{id} y /pokemon-species/{id} con
// los datos de Pikachu cambiando el id y el nombre.
export function mockPokeApi({ failIds = [] } = {}) {
  const fetchMock = vi.fn(async (url) => {
    const match = url.match(/\/(pokemon|pokemon-species)\/(\d+)$/);
    const id = Number(match[2]);
    if (failIds.includes(id)) return { ok: false, status: 500 };
    const base = match[1] === 'pokemon' ? pikachu : pikachuSpecies;
    return {
      ok: true,
      status: 200,
      json: async () => ({ ...base, id, name: `pokemon-${id}` }),
    };
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}
