export const BATTLE_SECONDS = 30;
export const BATTLE_SECONDS_PER_LEVEL = 5; // mejora Cronómetro
export const BATTLE_DAMAGE_PER_LEVEL = 0.2; // mejora Ataque en combate
export const ATTACK_DIVISOR = 5; // daño por segundo de un Pokémon = ataque / 5 × estrellas × nivel
export const TYPE_ADVANTAGE = 1.5;
export const TEAM_POWER_PER_LEVEL = 0.25; // mejora Poder del equipo
export const GYM_MONEY_REWARD = 0.5; // × vida del líder
export const BATTLE_TICK_MS = 100; // cada cuánto se actualiza el combate
export const EXPECTED_CLICKS_PER_SECOND = 6; // para la pista de la pantalla de gimnasios

// `ace` es el Pokémon que representa al líder en pantalla (su imagen viene de la API).
export const GYMS = {
  1: [
    { number: 1, leader: 'Brock', type: 'rock', hp: 4500, ace: 95 },
    { number: 2, leader: 'Misty', type: 'water', hp: 6000, ace: 121 },
    { number: 3, leader: 'Lt. Surge', type: 'electric', hp: 9000, ace: 26 },
    { number: 4, leader: 'Erika', type: 'grass', hp: 15000, ace: 45 },
    { number: 5, leader: 'Koga', type: 'poison', hp: 22000, ace: 110 },
    { number: 6, leader: 'Sabrina', type: 'psychic', hp: 33000, ace: 65 },
    { number: 7, leader: 'Blaine', type: 'fire', hp: 45000, ace: 59 },
    { number: 8, leader: 'Giovanni', type: 'ground', hp: 62000, ace: 112 },
  ],
  2: [
    { number: 1, leader: 'Pegaso', type: 'flying', hp: 4500, ace: 17 },
    { number: 2, leader: 'Antón', type: 'bug', hp: 6000, ace: 123 },
    { number: 3, leader: 'Blanca', type: 'normal', hp: 9000, ace: 241 },
    { number: 4, leader: 'Morti', type: 'ghost', hp: 13000, ace: 94 },
    { number: 5, leader: 'Aníbal', type: 'fighting', hp: 18000, ace: 62 },
    { number: 6, leader: 'Yasmina', type: 'steel', hp: 26000, ace: 208 },
    { number: 7, leader: 'Fredo', type: 'ice', hp: 36000, ace: 221 },
    { number: 8, leader: 'Débora', type: 'dragon', hp: 50000, ace: 230 },
  ],
  3: [
    { number: 1, leader: 'Petra', type: 'rock', hp: 6000, ace: 299 },
    { number: 2, leader: 'Marcial', type: 'fighting', hp: 8000, ace: 297 },
    { number: 3, leader: 'Erico', type: 'electric', hp: 11000, ace: 310 },
    { number: 4, leader: 'Candela', type: 'fire', hp: 14500, ace: 324 },
    { number: 5, leader: 'Norman', type: 'normal', hp: 20000, ace: 289 },
    { number: 6, leader: 'Alana', type: 'flying', hp: 28000, ace: 334 },
    { number: 7, leader: 'Vito y Leti', type: 'psychic', hp: 37000, ace: 338 },
    { number: 8, leader: 'Plubio', type: 'water', hp: 48000, ace: 350 },
  ],
  4: [
    { number: 1, leader: 'Roco', type: 'rock', hp: 7000, ace: 409 },
    { number: 2, leader: 'Gardenia', type: 'grass', hp: 9000, ace: 407 },
    { number: 3, leader: 'Brega', type: 'fighting', hp: 12000, ace: 448 },
    { number: 4, leader: 'Mananti', type: 'water', hp: 16000, ace: 419 },
    { number: 5, leader: 'Fantina', type: 'ghost', hp: 22000, ace: 429 },
    { number: 6, leader: 'Acero', type: 'steel', hp: 31000, ace: 411 },
    { number: 7, leader: 'Inverna', type: 'ice', hp: 42000, ace: 460 },
    { number: 8, leader: 'Lectro', type: 'electric', hp: 62000, ace: 405 },
  ],
};
