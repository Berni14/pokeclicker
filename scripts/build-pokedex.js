// Genera src/config/pokedex-gen{N}.json con los datos de juego de una generación:
// rareza, suma de stats, ataque y tipos. Se ejecuta una vez (npm run pokedex -- 1)
// y el JSON se sube al repositorio: así el juego no tiene que descargar toda la
// generación para sortear el gacha.
import { writeFile } from 'node:fs/promises';
import { GENERATIONS, BATCH_SIZE } from '../src/config/generations.js';
import { getRarity } from '../src/config/rarities.js';

const BASE_URL = 'https://pokeapi.co/api/v2';

async function get(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`La PokeAPI respondió ${res.status} en ${path}`);
  return res.json();
}

async function buildEntry(id) {
  const [pokemon, species] = await Promise.all([
    get(`/pokemon/${id}`),
    get(`/pokemon-species/${id}`),
  ]);
  const statTotal = pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0);
  const attack = pokemon.stats.find((s) => s.stat.name === 'attack').base_stat;
  return {
    id,
    rarity: getRarity({
      statTotal,
      isLegendary: species.is_legendary,
      isMythical: species.is_mythical,
    }),
    statTotal,
    attack,
    types: [...pokemon.types]
      .sort((a, b) => a.slot - b.slot)
      .map((t) => t.type.name),
  };
}

const generation = Number(process.argv[2] ?? 1);
const range = GENERATIONS[generation];
if (!range) {
  console.error(
    `No existe la generación ${generation} en config/generations.js`,
  );
  process.exit(1);
}

const entries = [];
for (let id = range.from; id <= range.to; id += BATCH_SIZE) {
  const last = Math.min(id + BATCH_SIZE - 1, range.to);
  const ids = Array.from({ length: last - id + 1 }, (_, i) => id + i);
  entries.push(...(await Promise.all(ids.map(buildEntry))));
  console.log(`  ${last - range.from + 1}/${range.to - range.from + 1}`);
}

// Una entrada por línea: el archivo se lee bien y los cambios se ven claros en git.
const json = `[\n${entries.map((e) => `  ${JSON.stringify(e)}`).join(',\n')}\n]\n`;
const file = new URL(
  `../src/config/pokedex-gen${generation}.json`,
  import.meta.url,
);
await writeFile(file, json);

const count = {};
for (const e of entries) count[e.rarity] = (count[e.rarity] ?? 0) + 1;
console.log(`Generación ${generation}: ${entries.length} Pokémon`, count);
