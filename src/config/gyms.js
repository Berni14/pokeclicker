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
    { number: 2, leader: 'Misty', type: 'water', hp: 6500, ace: 121 },
    { number: 3, leader: 'Lt. Surge', type: 'electric', hp: 10000, ace: 26 },
    { number: 4, leader: 'Erika', type: 'grass', hp: 18000, ace: 45 },
    { number: 5, leader: 'Koga', type: 'poison', hp: 28000, ace: 110 },
    { number: 6, leader: 'Sabrina', type: 'psychic', hp: 48000, ace: 65 },
    { number: 7, leader: 'Blaine', type: 'fire', hp: 70000, ace: 59 },
    { number: 8, leader: 'Giovanni', type: 'ground', hp: 100000, ace: 112 },
  ],
};
