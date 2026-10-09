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
    { number: 1, leader: 'Pegaso', type: 'flying', hp: 8000, ace: 17 },
    { number: 2, leader: 'Antón', type: 'bug', hp: 11000, ace: 123 },
    { number: 3, leader: 'Blanca', type: 'normal', hp: 15000, ace: 241 },
    { number: 4, leader: 'Morti', type: 'ghost', hp: 22000, ace: 94 },
    { number: 5, leader: 'Aníbal', type: 'fighting', hp: 30000, ace: 62 },
    { number: 6, leader: 'Yasmina', type: 'steel', hp: 45000, ace: 208 },
    { number: 7, leader: 'Fredo', type: 'ice', hp: 62000, ace: 221 },
    { number: 8, leader: 'Débora', type: 'dragon', hp: 90000, ace: 230 },
  ],
};
