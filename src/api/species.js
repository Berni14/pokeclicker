import { apiGet } from './client';

export const getSpecies = (id, opts) => apiGet(`/pokemon-species/${id}`, opts);
