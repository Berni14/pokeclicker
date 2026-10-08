export const initialState = {
  saveVersion: 1,
  generation: 1,
  coins: 0,
  trainer: { level: 1, xp: 0 },
  upgrades: {
    clickPower: 0,
    training: 0,
    battleDamage: 0,
    battleTime: 0,
    pullDiscount: 0,
  },
  pulls: 0,
  collection: {}, // { [id]: estrellas }
  team: [], // hasta 6 ids
  medals: {}, // { [generación]: [1, 2, …] }
  pokemonById: {}, // datos de la API para pintar; no se guarda en la partida
};
