export const BERRY_GROW_SECONDS = 5 * 60; // la granja da una baya cada 5 min
export const BERRY_STORAGE = 5; // con 5 guardadas, deja de crecer
export const BERRY_SECONDS = 10 * 60; // lo que dura una baya equipada

// Cada baya multiplica la producción y/o el daño en combate del Pokémon que la
// lleva. `weight` es la probabilidad (en %) de que la granja dé esa baya.
export const BERRIES = {
  oran: {
    label: 'Baya Aranja',
    effect: 'Producción ×2',
    production: 2,
    damage: 1,
    weight: 45,
    color: '#3b6fd8',
  },
  liechi: {
    label: 'Baya Lichi',
    effect: 'Daño en combate ×2',
    production: 1,
    damage: 2,
    weight: 45,
    color: '#d8433b',
  },
  sitrus: {
    label: 'Baya Zidra',
    effect: 'Producción y daño ×2',
    production: 2,
    damage: 2,
    weight: 10,
    color: '#e0b020',
  },
};
