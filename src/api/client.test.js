import { describe, it, expect, vi, afterEach } from 'vitest';
import { apiGet } from './client';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('apiGet', () => {
  it('devuelve el JSON si la respuesta es correcta', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ id: 25 }),
    }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiGet('/pokemon/25')).resolves.toEqual({ id: 25 });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://pokeapi.co/api/v2/pokemon/25',
      { signal: undefined },
    );
  });

  it('lanza un error con el código si la respuesta no es ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 404 })),
    );

    await expect(apiGet('/pokemon/9999')).rejects.toThrow(
      'La PokeAPI respondió 404 en /pokemon/9999',
    );
  });

  it('convierte un fallo de red en un mensaje entendible', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch');
      }),
    );

    await expect(apiGet('/pokemon/25')).rejects.toThrow(
      'No se pudo conectar con la PokeAPI',
    );
  });

  it('deja pasar la cancelación sin convertirla en error de red', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new DOMException('Aborted', 'AbortError');
      }),
    );

    await expect(apiGet('/pokemon/25')).rejects.toMatchObject({
      name: 'AbortError',
    });
  });
});
