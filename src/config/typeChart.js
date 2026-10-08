// Tipos de ataque que son fuertes contra cada tipo de líder.
// Solo los 8 de la primera generación; se amplía al añadir regiones.
export const STRONG_AGAINST = {
  rock: ['water', 'grass', 'fighting', 'ground', 'steel'],
  water: ['electric', 'grass'],
  electric: ['ground'],
  grass: ['fire', 'ice', 'poison', 'flying', 'bug'],
  poison: ['ground', 'psychic'],
  psychic: ['bug', 'ghost', 'dark'],
  fire: ['water', 'ground', 'rock'],
  ground: ['water', 'grass', 'ice'],
};
