import { RARITIES } from './rarities';

export const CLICK_BASE = 1;
export const TEAM_SIZE = 6;
export const STAR_BONUS = 0.5; // cada estrella por encima de 1: +50 % de producción y daño
export const TRAINING_BONUS = 0.15; // por nivel de la mejora Entrenamiento
export const TICK_MS = 1000;
export const AUTOSAVE_MS = 10_000;
export const MAX_OFFLINE_SECONDS = 8 * 60 * 60;

const round1 = (n) => Math.round(n * 10) / 10;
const round2 = (n) => Math.round(n * 100) / 100;

export const starMultiplier = (stars) => 1 + STAR_BONUS * (stars - 1);

// Monedas por segundo de un Pokémon con 1★: crece con sus stats y su rareza.
export const baseProduction = (entry) =>
  round1(
    (entry.statTotal / 100) ** 2 * 0.1 * RARITIES[entry.rarity].multiplier,
  );

// Monedas por segundo de un Pokémon equipado, con sus estrellas.
export const productionOf = (entry, stars) =>
  round2(baseProduction(entry) * starMultiplier(stars));
