// Tipos de ataque que son fuertes contra cada tipo de líder.
// Solo los tipos de los líderes de las regiones del juego; se amplía al añadir
// regiones.
export const STRONG_AGAINST = {
  rock: ['water', 'grass', 'fighting', 'ground', 'steel'],
  water: ['electric', 'grass'],
  electric: ['ground'],
  grass: ['fire', 'ice', 'poison', 'flying', 'bug'],
  poison: ['ground', 'psychic'],
  psychic: ['bug', 'ghost', 'dark'],
  fire: ['water', 'ground', 'rock'],
  ground: ['water', 'grass', 'ice'],
  flying: ['electric', 'ice', 'rock'],
  bug: ['fire', 'flying', 'rock'],
  normal: ['fighting'],
  ghost: ['ghost', 'dark'],
  fighting: ['flying', 'psychic', 'fairy'],
  steel: ['fire', 'fighting', 'ground'],
  ice: ['fire', 'fighting', 'rock', 'steel'],
  dragon: ['ice', 'dragon', 'fairy'],
};
