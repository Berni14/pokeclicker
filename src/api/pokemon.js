import { apiGet } from './client';

export const getPokemon = (id, opts) => apiGet(`/pokemon/${id}`, opts);
