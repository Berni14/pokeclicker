export const BATTLE_SECONDS = 30;
export const BATTLE_SECONDS_PER_LEVEL = 5; // mejora Cronómetro
export const BATTLE_DAMAGE_PER_LEVEL = 0.2; // mejora Ataque en combate
export const ATTACK_DIVISOR = 5; // daño por segundo de un Pokémon = ataque / 5 × estrellas
export const TYPE_ADVANTAGE = 1.5;
export const TEAM_DAMAGE_CAP = 0.5; // el equipo hace como mucho la mitad de la vida
export const GYM_MONEY_REWARD = 0.5; // × vida del líder

// `ace` es el Pokémon que representa al líder en pantalla (su imagen viene de la API).
export const GYMS = {
  1: [
    { number: 1, leader: 'Brock', type: 'rock', hp: 700, ace: 95 },
    { number: 2, leader: 'Misty', type: 'water', hp: 2000, ace: 121 },
    { number: 3, leader: 'Lt. Surge', type: 'electric', hp: 3650, ace: 26 },
    { number: 4, leader: 'Erika', type: 'grass', hp: 5650, ace: 45 },
    { number: 5, leader: 'Koga', type: 'poison', hp: 7900, ace: 110 },
    { number: 6, leader: 'Sabrina', type: 'psychic', hp: 10400, ace: 65 },
    { number: 7, leader: 'Blaine', type: 'fire', hp: 13100, ace: 59 },
    { number: 8, leader: 'Giovanni', type: 'ground', hp: 16000, ace: 112 },
  ],
};
