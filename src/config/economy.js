import { RARITIES } from './rarities';

export const CLICK_BASE = 1;
export const TEAM_SIZE = 6;
export const STAR_BONUS = 0.5; // cada estrella por encima de 1: +50 % de producción y daño
export const TRAINING_BONUS = 0.15; // por nivel de la mejora Entrenamiento
export const MAX_POKEMON_LEVEL = 100;
export const LEVEL_BONUS = 0.1; // cada nivel por encima de 1: +10 % de producción y daño
export const LEVEL_COST_SECONDS = 60; // subir al Nv 2 cuesta 60 s de lo que produce con 1★
export const LEVEL_COST_GROWTH = 1.15; // cada nivel cuesta un 15 % más
export const LEVEL_MIN_COST = 25;
export const TICK_MS = 1000;
export const AUTOSAVE_MS = 10_000;
export const MAX_OFFLINE_SECONDS = 8 * 60 * 60;

const round1 = (n) => Math.round(n * 10) / 10;
const round2 = (n) => Math.round(n * 100) / 100;

export const starMultiplier = (stars) => 1 + STAR_BONUS * (stars - 1);

export const levelMultiplier = (level) => 1 + LEVEL_BONUS * (level - 1);

// Monedas por segundo de un Pokémon con 1★: crece con sus stats y su rareza.
export const baseProduction = (entry) =>
  round1(
    (entry.statTotal / 100) ** 2 * 0.1 * RARITIES[entry.rarity].multiplier,
  );

// Monedas por segundo de un Pokémon equipado, con sus estrellas y su nivel.
export const productionOf = (entry, stars, level = 1) =>
  round2(
    baseProduction(entry) * starMultiplier(stars) * levelMultiplier(level),
  );

// Precio de subir un Pokémon de `level` a `level + 1`. Depende de lo que
// produce con 1★: subir a un legendario cuesta más que a un Pokémon común.
export const levelUpCostOf = (entry, level) =>
  Math.round(
    Math.max(LEVEL_MIN_COST, baseProduction(entry) * LEVEL_COST_SECONDS) *
      LEVEL_COST_GROWTH ** (level - 1),
  );
