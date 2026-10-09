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
    teamPower: 0,
  },
  items: [], // objetos permanentes comprados
  boosts: {}, // { [potenciador]: segundos que le quedan }
  pulls: { basic: 0, epic: 0, legendary: 0 }, // tiradas de cada gacha
  collection: {}, // { [id]: estrellas }
  levels: {}, // { [id]: nivel }; si no está, nivel 1
  team: [], // hasta 6 ids
  medals: {}, // { [generación]: [1, 2, …] }
  // Granja de bayas: segundos hacia la próxima, bayas guardadas y cuántas ha
  // dado en total (decide cuál sale en la siguiente).
  farm: { growth: 0, stock: [], harvested: 0 },
  heldBerries: {}, // { [id]: { key, seconds } } bayas equipadas
  pokemonById: {}, // datos de la API para pintar; no se guarda en la partida
  offlineEarnings: null, // { seconds, coins } al volver al juego; no se guarda
};
