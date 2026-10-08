# Ruta del Pokémon Clicker

Oct 8, 2026 · @Berni

## Cómo usar esta ruta

Sigue las fases en orden: cada una termina con algo que funciona y un commit, así nunca tienes el proyecto roto más de un día. Construyes de abajo arriba, igual que la estructura de carpetas: primero los datos, luego la lógica y al final la interfaz.

1. **Fase 0 · Preparación y diseño.** Entender la PokeAPI, decidir el MVP y bocetar en Figma. Unas 3–4 h.
2. **Fase 1 · Proyecto base.** Vite, Git, GitHub, ESLint, Prettier y carpetas. Unas 2 h.
3. **Fase 2 · Datos.** Pedir Pokémon a la API, transformarlos y cachearlos. Unas 4–5 h.
4. **Fase 3 · Lógica y estado.** Tabla de rarezas, números del juego, reglas (click, gacha, equipo, tienda, entrenador, combate) y el store global. Unas 8–10 h.
5. **Fase 4 · Interfaz.** Navegación, pantalla principal, gacha, caja y tienda. Unas 12–14 h.
6. **Fase 5 · Gimnasios.** Lista de líderes y combate a clicks con temporizador. Unas 6–8 h.
7. **Fase 6 · Juego completo.** Bucle, guardado, animaciones y equilibrio. Unas 6–8 h.
8. **Fase 7 · Calidad y despliegue.** Tests, Lighthouse, GitHub Pages y README. Unas 4–5 h. Aquí sale la **v1.0**.
9. **Fase 8 · Ampliaciones.** Cambio de generación (v1.1), logros, sonidos… cuando quieras.

Qué hace el juego está en `FUNCIONAMIENTO_DEL_JUEGO.md`; esta ruta explica cómo construirlo.

Las horas son orientativas para alguien que está aprendiendo React; no pasa nada si te lleva el doble.

Reglas para todo el proyecto:

- Una rama por fase (`fase-2-datos`), y la fusionas en `main` cuando la fase funciona.
- Commits pequeños con prefijo: `feat:`, `fix:`, `style:`, `refactor:`, `test:`, `docs:`, `chore:`.
- Al terminar cada fase, pasa la parte que toque de `CONTROL_DE_CALIDAD.md`.
- Si algo no lo entiendes, no copies y sigas: para, prueba en la consola y entiéndelo. Es la parte que más te va a servir en las prácticas.

## Fase 0 · Preparación y diseño

Antes de escribir código, sabes qué datos te da la API, qué incluye la primera versión y cómo se ve. Así no improvisas a mitad de camino.

### 0.1 Explorar la PokeAPI

- [ ] Abre en el navegador `https://pokeapi.co/api/v2/pokemon/25` (Pikachu). Instala una extensión de JSON viewer si se ve todo junto.
- [ ] Abre `https://pokeapi.co/api/v2/pokemon?limit=20&offset=0` y fíjate en que solo trae `name` y `url`, no imágenes. Por eso luego habrá que pedir cada Pokémon por separado.
- [ ] Abre `https://pokeapi.co/api/v2/pokemon-species/150` (Mewtwo) y busca `is_legendary` e `is_mythical`. Es la forma fiable de saber si un Pokémon es legendario; la experiencia base no sirve (Chansey tiene más que Mewtwo).
- [ ] Apunta los campos que vas a usar:
  - De `/pokemon/{id}`:
    - `id` y `name`
    - `sprites.other["official-artwork"].front_default` (imagen grande) y `sprites.front_default` (pixel art, de reserva)
    - `types[].type.name` y `types[].slot`
    - `stats[].stat.name` y `stats[].base_stat` (su suma marcará la producción y el precio)
  - De `/pokemon-species/{id}`: `is_legendary` e `is_mythical` (para la rareza).
- [ ] Lee la sección de _fair use_ de la documentación: no hace falta clave, pero hay que cachear para no saturar la API. Son dos peticiones por Pokémon (302 para la primera generación), así que la caché es obligatoria.

### 0.2 Definir el MVP

- [x] Decidido en `FUNCIONAMIENTO_DEL_JUEGO.md`: la **v1.0** es la primera generación completa (click, tienda, gacha, equipo, caja y los 8 gimnasios); el cambio de generación es la **v1.1**.
- [ ] Resúmelo en el README en dos listas: qué entra en la v1.0 y qué queda para después (cambio de generación, logros, sonidos, evoluciones).

### 0.3 Diseño en Figma

- [ ] Wireframes de escritorio y de móvil (360 px) de las pantallas del apartado 10 de `FUNCIONAMIENTO_DEL_JUEGO.md`: juego principal, gacha, caja, tienda, gimnasios y combate.
- [ ] Barra de navegación entre pantallas (abajo en móvil).
- [ ] La tarjeta de Pokémon con rareza y estrellas, en la caja, en el equipo y como resultado del gacha.
- [ ] La mejora de la tienda en sus estados: **disponible** (te llega / no te llega), **máximo** y **bloqueada**.
- [ ] El líder de gimnasio en sus estados: **vencido**, **actual** y **bloqueado**.
- [ ] Tokens: 5–6 colores base, una tipografía para títulos y otra para texto, escala de espaciados (4, 8, 12, 16, 24, 32 px) y radios. Cuando estén, cambia los valores provisionales de `styles/tokens.css`.
- [ ] Colores por tipo (fuego, agua, planta…) y por rareza: busca una paleta ya hecha y ajústala para que el texto blanco tenga contraste.

**Al terminar:** tienes los campos apuntados, el MVP en el README y el diseño de las pantallas.

## Fase 1 · Proyecto base ✅

Al final de esta fase tienes un React vacío y limpio, en GitHub, con las carpetas creadas y las herramientas de calidad funcionando.

> **Fase terminada** (8 oct 2026). Abajo queda lo que se hizo y por qué, como referencia.

### 1.1 Crear el proyecto con Vite dentro de `pokeclicker`

- [x] Proyecto Vite + React (Vite 8, React 19) generado con la plantilla `react` y copiado dentro de `pokeclicker`, sin tocar la estructura de carpetas.
- [x] `package.json` con `"name": "pokeclicker"`.
- [x] `.gitignore` de la plantilla, más `.env` y `.env.*`.

Si alguna vez tienes que repetirlo en una carpeta que ya tiene archivos: `npm create vite@latest . -- --template react` y, cuando pregunte, **Ignore files and continue** (nunca «Remove existing files»).

### 1.2 Git y GitHub

- [x] Repositorio `pokeclicker` en GitHub: `https://github.com/Berni14/pokeclicker`, conectado como `origin` en la rama `main`.
- [x] Fase hecha en la rama `fase-1-base` y fusionada en `main`.

### 1.3 Limpiar la plantilla

- [x] Fuera `App.css`, `index.css`, `src/assets/` y los iconos de Vite.
- [x] `App.jsx` devuelve solo `<h1>Pokémon Clicker</h1>`.
- [x] `index.html` con `lang="es"`, `<title>Pokémon Clicker</title>`, descripción y favicon propio (una Poké Ball en `public/favicon.svg`).

### 1.4 Herramientas de calidad

> La plantilla actual de Vite ya no trae ESLint: trae **oxlint**, que usa un binario nativo. En los ordenadores con la política de control de aplicaciones de Windows activada (como los del aula) ese binario está bloqueado y `npm run lint` no arranca. Por eso se usa ESLint, que es JavaScript puro y funciona en cualquier equipo.

```bash
npm i -D eslint @eslint/js globals eslint-plugin-react-hooks eslint-plugin-react-refresh eslint-config-prettier
npm i -D prettier vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [x] `eslint.config.js` (configuración _flat_) con:
  - las reglas recomendadas de JS, de los hooks de React (incluye `exhaustive-deps`) y de React Refresh;
  - `no-console` como aviso;
  - `eslintConfigPrettier` **la última** del array, para que desactive las reglas que chocan con Prettier.
- [x] `.prettierrc` con `{ "singleQuote": true, "semi": true }` y `.prettierignore` (`dist`, `coverage`, `package-lock.json`).
- [x] Scripts en `package.json`:
  - `lint` → `eslint . --max-warnings 0`: un aviso (un `console.log` olvidado, una dependencia que falta en un `useEffect`) también hace fallar el `check`.
  - `format` → `prettier --write .` y `format:check` → `prettier --check .`.
  - `check` → `lint`, `format:check`, tests y `build`, por ese orden.
- [x] `vite.config.js` con `test: { environment: 'jsdom', setupFiles: './src/setupTests.js' }`.
- [x] `src/setupTests.js`: activa los _matchers_ de jest-dom (`toBeInTheDocument`…) y limpia el DOM entre tests.
- [x] Los tests importan lo que usan: `import { describe, it, expect, vi } from 'vitest';`. Así no hace falta `globals: true`.
- [x] `src/App.test.jsx`: primer test (el título se pinta). Comprueba que todo el montaje de tests funciona y evita que `vitest run` falle por no encontrar tests.
- [x] `.vscode/extensions.json` recomienda las extensiones de ESLint y Prettier. Actívalas y pon _format on save_ en tu VS Code.

### 1.5 Carpetas y estilos base

- [x] Estructura de carpetas (incluidas `Modal` y `public/sounds`). Las carpetas vacías llevan un `.gitkeep` para que Git las guarde.
- [x] `CONTROL_DE_CALIDAD.md` en la raíz.
- [x] `styles/tokens.css` con colores, fuentes, espaciados y radios **provisionales**: cuando tengas el diseño de Figma (0.3), cambia solo los valores.
- [x] `styles/reset.css` (reset corto, con `prefers-reduced-motion`) y `styles/global.css` (body, títulos y foco visible).
- [x] Importados en `main.jsx` en orden: tokens, reset, global.
- [x] `public/pokeball.svg`: imagen de reserva para Pokémon sin sprite.

**Resultado:** `npm run check` pasa (lint, formato, 1 test y build) y `npm run preview` sirve la página con el título, los estilos y el favicon.

## Fase 2 · Datos ✅

Al final puedes pedir un lote de Pokémon y recibirlos ya transformados a tu formato, sin repetir peticiones. Todavía no hay interfaz: lo pruebas en la consola.

> **Fase terminada** (8 oct 2026). Cada archivo tiene su test al lado (`*.test.js`), con respuestas reales de la PokeAPI recortadas en `src/__mocks__/` (Pikachu, Mewtwo y Chansey).

### 2.1 `api/client.js`: el fetch base

```js
const BASE_URL = 'https://pokeapi.co/api/v2';

export async function apiGet(path, { signal } = {}) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, { signal });
  } catch (err) {
    // Una cancelación no es un error de verdad: se deja pasar tal cual.
    if (err.name === 'AbortError') throw err;
    throw new Error('No se pudo conectar con la PokeAPI. Revisa tu conexión.');
  }
  if (!res.ok) throw new Error(`La PokeAPI respondió ${res.status} en ${path}`);
  return res.json();
}
```

### 2.2 `api/pokemon.js` y `api/species.js`: las peticiones

```js
// api/pokemon.js
import { apiGet } from './client';

export const getPokemon = (id, opts) => apiGet(`/pokemon/${id}`, opts);
```

```js
// api/species.js
import { apiGet } from './client';

export const getSpecies = (id, opts) => apiGet(`/pokemon-species/${id}`, opts);
```

Como la lista de la API no trae imágenes, no la necesitas: los IDs de la primera generación son del 1 al 151, así que pides por ID directamente.

### 2.3 `config/rarities.js` y `models/pokemon.js`: tu formato

La rareza se decide con los datos de la especie (legendario o singular) y, para el resto, con la suma de stats. Los umbrales (400 y 500) salen de los datos reales: dejan en la primera generación 69 comunes, 49 raras, 28 épicas (las evoluciones finales fuertes: Charizard, Gengar, Dragonite…), 4 legendarias y 1 singular.

```js
// config/rarities.js
export const RARITIES = {
  common: { label: 'Común', multiplier: 1 },
  rare: { label: 'Rara', multiplier: 1.2 },
  epic: { label: 'Épica', multiplier: 1.5 },
  legendary: { label: 'Legendaria', multiplier: 3 },
  mythical: { label: 'Singular', multiplier: 3 },
};

// Suma de stats a partir de la cual un Pokémon normal sube de rareza.
const RARE_MIN_STATS = 400;
const EPIC_MIN_STATS = 500;

export function getRarity({ statTotal, isLegendary, isMythical }) {
  if (isMythical) return 'mythical';
  if (isLegendary) return 'legendary';
  if (statTotal >= EPIC_MIN_STATS) return 'epic';
  if (statTotal >= RARE_MIN_STATS) return 'rare';
  return 'common';
}
```

```js
// models/pokemon.js
import { getRarity } from '../config/rarities';

// BASE_URL respeta el `base` de Vite (en GitHub Pages es /pokeclicker/).
const FALLBACK_SPRITE = `${import.meta.env.BASE_URL}pokeball.svg`;

export function toPokemon(raw, species) {
  const stats = Object.fromEntries(
    raw.stats.map((s) => [s.stat.name, s.base_stat]),
  );
  const statTotal = Object.values(stats).reduce((a, b) => a + b, 0);
  return {
    id: raw.id,
    name: raw.name,
    sprite:
      raw.sprites.other?.['official-artwork']?.front_default ??
      raw.sprites.front_default ??
      FALLBACK_SPRITE,
    types: [...raw.types]
      .sort((a, b) => a.slot - b.slot)
      .map((t) => t.type.name),
    stats,
    statTotal,
    rarity: getRarity({
      statTotal,
      isLegendary: species.is_legendary,
      isMythical: species.is_mythical,
    }),
  };
}
```

- [x] Añade una función `formatName(name)` en `utils/format.js` para casos como `mr-mime` o `nidoran-f`.

### 2.4 `services/cache.js`

- [x] Un `Map` en memoria y, detrás, localStorage con una clave versionada (`pkc:pokemon:v1`). Guarda el **modelo reducido**, nunca la respuesta de la API.
- [x] Funciones `getCached(id)` y `setCached(pokemon)`.
- [x] Envuelve todo acceso a localStorage en `try/catch` (en incógnito o con el almacenamiento lleno puede fallar).
- [x] Usa siempre el prefijo `pkc:` en las claves: en GitHub Pages todos tus proyectos de `berni14.github.io` comparten el mismo localStorage.

### 2.5 `services/pokemonService.js`

Además de la caché de resultados, guarda las peticiones **en curso**: si piden el mismo Pokémon dos veces antes de que llegue la respuesta (pasa en desarrollo con `StrictMode`), las dos esperan a la misma petición en vez de lanzar otra.

```js
import { getPokemon } from '../api/pokemon';
import { getSpecies } from '../api/species';
import { toPokemon } from '../models/pokemon';
import { BATCH_SIZE } from '../config/generations';
import { getCached, setCached } from './cache';

const inFlight = new Map(); // id → promesa de la petición en curso

function fetchOne(id) {
  if (!inFlight.has(id)) {
    const promise = Promise.all([getPokemon(id), getSpecies(id)])
      .then(([raw, species]) => {
        const pokemon = toPokemon(raw, species);
        setCached(pokemon);
        return pokemon;
      })
      .finally(() => inFlight.delete(id));
    inFlight.set(id, promise);
  }
  return inFlight.get(id);
}

// Pide cualquier lista de IDs, de BATCH_SIZE en BATCH_SIZE.
export async function getPokemonByIds(ids) {
  const result = [];
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const chunk = ids.slice(i, i + BATCH_SIZE);
    const loaded = await Promise.all(
      chunk.map((id) => getCached(id) ?? fetchOne(id)),
    );
    result.push(...loaded);
  }
  return result.sort((a, b) => a.id - b.id);
}

export function getPokemonBatch(fromId, count) {
  const ids = Array.from({ length: count }, (_, i) => fromId + i);
  return getPokemonByIds(ids);
}
```

- [x] Las peticiones compartidas no se cancelan con `signal` (si una la cancelara, la otra se quedaría sin datos). La cancelación se gestiona en el hook (4.2).
- [x] `getPokemonByIds` es la que usa `useOwnedPokemon` (4.2) para cargar los Pokémon de tu colección.

### 2.6 Probarlo

En vez de un `console.log` temporal en `App.jsx`, lo comprueban los tests (`npm test`), que se quedan para siempre:

- [x] `services/pokemonService.test.js`: un lote son 40 peticiones (pokemon + especie); pedirlo otra vez no hace ninguna; dos peticiones simultáneas del mismo lote (lo que hace `StrictMode`) siguen siendo 40, no 80; nunca hay más de 20 Pokémon pidiéndose a la vez; si falla uno, el reintento solo pide ese.
- [x] `services/cache.test.js`: sobrevive a una recarga (localStorage), a datos corruptos y a un localStorage bloqueado.
- [x] `api/client.test.js`: respuesta no ok, fallo de red y cancelación.
- [x] `models/pokemon.test.js` y `config/rarities.test.js`: imagen de reserva, orden de tipos, Mewtwo legendario y Chansey (rara) no.
- [x] Prueba única contra la API real (no se guarda: los tests nunca llaman a la API real): el primer lote tarda ~1 s, desde caché 0 ms; el último lote va del 141 al 151; cada Pokémon ocupa ~0,3 KB en localStorage (unos 44 KB los 151).

Si quieres verlo tú en el navegador: en `App.jsx`, dentro de un `useEffect`, llama a `getPokemonBatch(1, 20)` y mira la pestaña Network. La primera vez salen 40 peticiones; al recargar, ninguna. Quita el código al terminar.

**Al terminar:** commit `feat: capa de datos con caché`.

## Fase 3 · Lógica y estado

Al final tienes todas las reglas del juego en funciones puras, con tests, y un store global al que cualquier componente puede acceder. Es la fase más importante: si aquí está bien hecho, la interfaz es solo pintar.

La idea clave: **los números del juego no dependen de la API**. La producción, el daño y el sorteo del gacha salen de una tabla pequeña generada una vez (3.1). La API se usa para lo que se ve: nombre, imagen, tipos y estadísticas en las tarjetas. Así el juego funciona desde el primer segundo, aunque la API tarde o falle.

### 3.1 Tabla de la Pokédex: `scripts/build-pokedex.js`

Para sortear el gacha por rareza hay que saber la rareza de los 151 Pokémon antes de la primera tirada. Pedirlos al empezar a jugar serían 302 peticiones y unos 100 MB. En vez de eso, un script lo hace **una sola vez** y guarda el resultado en el repositorio.

- [ ] `scripts/build-pokedex.js` (Node, fuera de `src/`): recibe la generación (`node scripts/build-pokedex.js 1`), pide `/pokemon/{id}` y `/pokemon-species/{id}` de 20 en 20 y calcula la rareza con `getRarity` de `src/config/rarities.js` (es JS puro, se puede importar desde Node).
- [ ] Escribe `src/config/pokedex-gen1.json` con lo mínimo que necesita la lógica del juego:

  ```json
  [{ "id": 1, "rarity": "rare", "statTotal": 318, "attack": 49, "types": ["grass", "poison"] }, …]
  ```

  Son unos 10 KB. Nombre e imágenes **no** van aquí: vienen de la API.

- [ ] Script en `package.json`: `"pokedex": "node scripts/build-pokedex.js"`.
- [ ] Ejecútalo y sube el JSON. Solo se vuelve a ejecutar si cambian los umbrales de rareza o al añadir una generación.
- [ ] `config/pokedex.js` exporta `POKEDEX = { 1: [...] }` (por generación) y `pokedexEntry(id)`.
- [ ] Test `config/pokedex.test.js`: 151 entradas, ids del 1 al 151 sin huecos, y el reparto esperado (69 comunes, 49 raras, 28 épicas, 4 legendarias, 1 singular). Si alguien cambia los umbrales sin regenerar la tabla, el test lo avisa.

### 3.2 `config/`: los números del juego

Todo número que afecte al juego vive aquí. Estos valores se han probado con una simulación de partidas completas (jugando a 1 click/s fuera de combate y 6 clicks/s en combate, comprando siempre lo más barato):

| Momento               | Tiempo de juego |
| --------------------- | --------------- |
| Primera tirada        | ~25 s           |
| Gimnasio 1 (Brock)    | ~3 min          |
| Gimnasio 4 (Erika)    | ~35 min         |
| Gimnasio 6 (Sabrina)  | ~1,5 h          |
| Gimnasio 8 (Giovanni) | ~2–2,5 h        |

Al final de la región el jugador suele tener nivel 7 de entrenador, ~110 tiradas y ~75 Pokémon distintos. Con todas las mejoras al máximo, tus clicks hacen como mucho ~9.600 de daño en un combate; por eso el gimnasio 8 no puede pasar de ~19.000 de vida (la mitad tiene que salir de los clicks).

```js
// config/economy.js
import { RARITIES } from './rarities';

export const CLICK_BASE = 1;
export const STAR_BONUS = 0.5; // cada estrella por encima de 1: +50 % de producción y daño
export const TRAINING_BONUS = 0.15; // por nivel de la mejora Entrenamiento
export const TICK_MS = 1000;
export const AUTOSAVE_MS = 10_000;
export const MAX_OFFLINE_SECONDS = 8 * 60 * 60;

const round1 = (n) => Math.round(n * 10) / 10;

export const starMultiplier = (stars) => 1 + STAR_BONUS * (stars - 1);

// Monedas por segundo de un Pokémon equipado (entrada de la Pokédex + estrellas).
export const productionOf = (entry, stars) =>
  round1(
    (entry.statTotal / 100) ** 2 * 0.1 * RARITIES[entry.rarity].multiplier,
  ) * starMultiplier(stars);
```

```js
// config/gacha.js
export const PULL_BASE_PRICE = 25;
export const PULL_PRICE_GROWTH = 1.07; // cada tirada cuesta un 7 % más
export const PULL_DISCOUNT_PER_LEVEL = 0.05;
export const MAX_STARS = 5;
export const MAX_STARS_REFUND = 2; // repetido con 5★: 2 × precio actual de la tirada

// Probabilidad de cada rareza (en %). Primero se sortea la rareza y luego un Pokémon de esa rareza.
export const RARITY_WEIGHTS = {
  common: 55,
  rare: 30,
  epic: 12,
  legendary: 2.5,
  mythical: 0.5,
};
```

```js
// config/trainer.js
export const XP_PER_PULL = 5;
export const XP_PER_GYM = 50; // × número del gimnasio (el 8 da 400)
export const XP_PER_MAX_DUPLICATE = 20;
export const MONEY_BONUS_PER_LEVEL = 0.05; // +5 % de dinero por nivel

export const xpToNextLevel = (level) => 100 * level;
```

```js
// config/upgrades.js
export const UPGRADES = {
  clickPower: {
    label: 'Poder de click',
    effect: '+1 por click',
    baseCost: 160,
    growth: 1.5,
    maxLevel: 15,
    minTrainerLevel: 1,
  },
  training: {
    label: 'Entrenamiento',
    effect: '+15 % de producción',
    baseCost: 1200,
    growth: 1.6,
    maxLevel: 10,
    minTrainerLevel: 2,
  },
  battleDamage: {
    label: 'Ataque en combate',
    effect: '+20 % de daño por click',
    baseCost: 2400,
    growth: 1.7,
    maxLevel: 5,
    minTrainerLevel: 3,
  },
  battleTime: {
    label: 'Cronómetro',
    effect: '+5 s de combate',
    baseCost: 4000,
    growth: 2,
    maxLevel: 4,
    minTrainerLevel: 4,
  },
  pullDiscount: {
    label: 'Descuento en tiradas',
    effect: '−5 % en el precio',
    baseCost: 3200,
    growth: 1.8,
    maxLevel: 5,
    minTrainerLevel: 5,
  },
};
```

```js
// config/gyms.js
export const BATTLE_SECONDS = 30;
export const BATTLE_SECONDS_PER_LEVEL = 5; // mejora Cronómetro
export const BATTLE_DAMAGE_PER_LEVEL = 0.2; // mejora Ataque en combate
export const ATTACK_DIVISOR = 5; // daño por segundo de un Pokémon = ataque / 5 × estrellas
export const TYPE_ADVANTAGE = 1.5;
export const TEAM_DAMAGE_CAP = 0.5; // el equipo hace como mucho la mitad de la vida
export const GYM_MONEY_REWARD = 0.5; // × vida del líder

// `ace` es el Pokémon que representa al líder en la pantalla (su imagen viene de la API).
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
```

```js
// config/typeChart.js
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
```

- [ ] `config/types.js` con un color por tipo (para `TypeBadge` y las tarjetas).
- [ ] El `effect` de cada mejora es el texto que se ve en la tienda: si cambias un número, cambia también el texto.

### 3.3 `utils/random.js`

- [ ] `pickWeighted(weights, rng = Math.random)`: recibe `{ common: 55, rare: 30, … }` y devuelve una clave.
- [ ] `pickOne(list, rng = Math.random)`: un elemento al azar.
- [ ] El `rng` se puede pasar desde fuera: en los tests se usa uno fijo (`() => 0.99`) y el resultado es siempre el mismo.

### 3.4 `game/`: las reglas, sin React

Todas reciben el estado y devuelven uno nuevo (`{ ...state }`), sin modificar el que reciben. **Ninguna usa `Math.random`** salvo `rollPokemon`, que recibe el `rng`.

- [ ] `trainer.js`
  - `moneyMultiplier(state)` → `1 + MONEY_BONUS_PER_LEVEL × (nivel − 1)`.
  - `addXp(state, xp)` → suma experiencia y sube de nivel las veces que haga falta (un gimnasio puede dar para dos niveles).
- [ ] `clicker.js`
  - `clickPower(state)` → `CLICK_BASE + nivel de Poder de click`.
  - `click(state)` → suma `clickPower × moneyMultiplier` a las monedas.
- [ ] `production.js`
  - `teamProduction(state)` → suma `productionOf` de los 6 equipados × `(1 + TRAINING_BONUS × nivel de Entrenamiento)` × `moneyMultiplier`.
  - `tick(state, seconds)` → suma `teamProduction × seconds`.
  - La interfaz muestra la producción con esta misma función: nunca la recalcules en un componente.
- [ ] `gacha.js`
  - `pullPrice(state)` → `round(PULL_BASE_PRICE × PULL_PRICE_GROWTH^tiradas × (1 − descuento))`.
  - `rollPokemon(generation, rng)` → sortea la rareza con `pickWeighted` y luego un Pokémon de esa rareza. Devuelve un id. Es la única función con azar.
  - `applyPull(state, id)` → si no llega el dinero, devuelve el estado sin cambios. Si llega: cobra, suma una tirada y `XP_PER_PULL`, y:
    - Pokémon nuevo → entra en la colección con 1★ y, si hay hueco, en el equipo.
    - Repetido con menos de 5★ → +1★.
    - Repetido con 5★ → `MAX_STARS_REFUND × precio` en monedas y `XP_PER_MAX_DUPLICATE`.
  - `pullOutcome(state, id)` → `'new' | 'star' | 'refund'`, para que la interfaz sepa qué mensaje enseñar.
- [ ] `team.js`
  - `equip(state, id, replaceId?)` → equipa un Pokémon de la colección; si el equipo está lleno, necesita `replaceId`.
  - `unequip(state, id)`.
  - Nunca más de 6, nunca repetidos, nunca un Pokémon que no tienes.
- [ ] `shop.js`
  - `upgradeCost(key, level)` → `round(baseCost × growth^level)`.
  - `upgradeStatus(state, key)` → `'locked' | 'max' | 'available'` (y `canAfford` aparte).
  - `buyUpgrade(state, key)` → solo si está disponible y llega el dinero.
- [ ] `battle.js`
  - `battleDuration(state)` → `BATTLE_SECONDS + BATTLE_SECONDS_PER_LEVEL × nivel de Cronómetro`.
  - `clickDamage(state)` → `clickPower × (1 + BATTLE_DAMAGE_PER_LEVEL × nivel de Ataque)`.
  - `hasTypeAdvantage(entry, gym)` → si alguno de sus tipos está en `STRONG_AGAINST[gym.type]`.
  - `teamDps(state, gym)` → suma de `ataque / ATTACK_DIVISOR × estrellas × ventaja` de los equipados.
  - `maxTeamDamage(gym)` → `gym.hp × TEAM_DAMAGE_CAP`.
  - `currentGym(state)` → el primero sin medalla; `gymStatus(state, number)` → `'won' | 'current' | 'locked'`.
  - `applyGymWin(state, number)` → medalla, `XP_PER_GYM × número` y `GYM_MONEY_REWARD × vida` en monedas. Solo si es el gimnasio actual (no se puede ganar dos veces el mismo).

### 3.5 Tests de la lógica (ahora, no al final)

Un archivo de test al lado de cada uno de `game/`, con estados pequeños escritos a mano:

- [ ] `trainer.test.js`: subir varios niveles de golpe; el bonus de dinero.
- [ ] `clicker.test.js`: el click con y sin mejora y con bonus de nivel.
- [ ] `production.test.js`: equipo vacío da 0; las estrellas y el Entrenamiento multiplican; los de la caja no producen.
- [ ] `gacha.test.js`: el precio sube y el descuento lo baja; sin dinero no pasa nada; nuevo, +1★, tope de 5★ con devolución; se equipa solo si hay hueco; con un `rng` fijo sale siempre el mismo Pokémon; en 10.000 tiradas con `Math.random`, las rarezas salen con proporciones cercanas a `RARITY_WEIGHTS`.
- [ ] `team.test.js`: límite de 6, sin repetidos, cambiar uno por otro.
- [ ] `shop.test.js`: bloqueada por nivel, máximo, coste creciente, sin dinero.
- [ ] `battle.test.js`: duración y daño con mejoras; ventaja de tipo (agua contra Blaine sí, contra Misty no); el tope del equipo; solo se gana el gimnasio actual.
- [ ] `economy.test.js`: con las mismas estrellas, un Pokémon con más stats o más rareza nunca produce menos.
- [ ] `npm test` en verde antes de seguir.

### 3.6 `store/`: el estado global

- [ ] `initialState.js`:

  ```js
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
    pokemonById: {}, // datos de la API para pintar; no se guarda
  };
  ```

- [ ] `gameReducer.js` → acciones, cada una llama a su función de `game/`:
  - `CLICK`
  - `TICK` con `{ seconds }`
  - `PULL` con `{ id }`: el sorteo se hace **fuera** del reducer (`rollPokemon(generation, Math.random)`) y el reducer solo aplica el resultado. Así el reducer sigue siendo puro y se puede testear.
  - `BUY_UPGRADE` con `{ key }`
  - `EQUIP` con `{ id, replaceId }` y `UNEQUIP` con `{ id }`
  - `GYM_WON` con `{ number }`
  - `POKEMON_LOADED` con `{ pokemon: [...] }`: añade datos a `pokemonById`
  - `RESET`: vuelve a `initialState` pero conserva `pokemonById`
  - Las acciones desconocidas devuelven el estado tal cual.
- [ ] El combate **no** va en el store: su vida y su tiempo son estado local de la pantalla de combate (fase 5). Al store solo llega el resultado (`GYM_WON`).
- [ ] `GameContext.jsx` → `GameProvider` con `useReducer`, y un hook `useGame()` que devuelve `{ state, dispatch }` y lanza un error si se usa fuera del provider.
- [ ] El `GameProvider` va en `App.jsx`, envolviendo el layout.
- [ ] `gameReducer.test.js`: una prueba por acción y una con una acción desconocida.

**Al terminar:** tests en verde y commit `feat: lógica del juego y store`.

## Fase 4 · Interfaz

Al final se puede jugar: clicas, tiras del gacha, equipas Pokémon, compras mejoras y ves cómo sube el dinero. Haz los componentes de los más simples a los más complejos, y un commit por pantalla.

### 4.1 Navegación y limpieza de la estructura

- [ ] Barra de pestañas (`components/NavTabs/`): Juego, Gacha, Caja, Tienda y Gimnasios. Con el estado de la pestaña en `App` (`useState`), sin React Router de momento.
- [ ] Cada pestaña es un `<button>` con `aria-current="page"` en la activa. En móvil, la barra va abajo y fija.
- [ ] `pages/`: `GamePage`, `GachaPage`, `BoxPage`, `ShopPage`, `GymsPage`, `BattlePage` y `SettingsPage` (reiniciar partida; más adelante, sonido).
- [ ] Borra `pages/PokedexPage.jsx` (la Pokédex es una pestaña de la caja) y `hooks/usePokemonList.js` (ya no se navega por lotes).

### 4.2 `hooks/usePokemon.js`: datos para pintar

- [ ] `useOwnedPokemon()`: mira qué ids de `collection` (y de los líderes de gimnasio) no están en `pokemonById`, los pide con `getPokemonByIds` y hace `POKEMON_LOADED`. Devuelve `{ loading, error, retry }`.
- [ ] Se llama una vez, en `App`. Al recargar la partida, los datos salen de la caché al instante.
- [ ] `AbortController` en el `useEffect`: antes de cualquier `setState`, `if (controller.signal.aborted) return;`.
- [ ] Mientras no hay datos de un Pokémon, su tarjeta enseña el `Loader`. La producción no espera: sale de la tabla de la Pokédex.

### 4.3 Componentes

1. **`CoinCounter`**: monedas, producción por segundo, nivel de entrenador y una barra de experiencia (`<progress>`).
2. **`ClickButton`**: un `<button>` grande (una Poké Ball dibujada con CSS, por ejemplo) que hace `dispatch({ type: 'CLICK' })`.
3. **`TypeBadge`**: recibe `type` y pinta la etiqueta con su color de `config/types.js`.
4. **`StarRating`**: de 1 a 5 estrellas, con texto para lectores de pantalla («3 de 5 estrellas»).
5. **`Loader`**: esqueletos con la forma de la tarjeta, mejor que un spinner.
6. **`PokemonCard`**: número, imagen, nombre (`formatName`) como `<h3>`, tipos en `<ul>`, rareza, estrellas y producción. Recibe todo por props (no calcula nada) y un hueco para acciones (`children`: equipar, quitar…). Imagen con `alt`, `loading="lazy"`, `width` y `height` fijos. Envuelta en `React.memo`.
7. **`CardGrid`**: rejilla con `grid-template-columns: repeat(auto-fill, minmax(160px, 1fr))` y `key={id}`.
8. **`Modal`**: `<dialog>` con `showModal()`, que ya gestiona el foco y la tecla Escape.
9. **`UpgradeCard`**: nombre, efecto, `Nv 3/10`, coste y botón. Estado con `data-state="locked|available|max"` y, además del color, con texto («Se desbloquea en el nivel 4», «Máximo»).

Las funciones que se pasan a tarjetas memorizadas van con `useCallback` y reciben el id (`onEquip(id)`), nunca `onEquip={() => equip(p)}`.

### 4.4 `GamePage`

- [ ] Cabecera con `CoinCounter`, `ClickButton` en el centro y debajo el equipo: 6 huecos, vacíos con un «+» que lleva a la caja.
- [ ] En escritorio, botón a la izquierda y equipo a la derecha; en móvil, todo en columna.

### 4.5 `GachaPage`

- [ ] Precio de la siguiente tirada y botón «Tirar» (deshabilitado si no llega).
- [ ] Al tirar: `const id = rollPokemon(state.generation)` → `dispatch({ type: 'PULL', id })` → abre el `Modal` con el resultado.
- [ ] El resultado según `pullOutcome` (calculado **antes** del `dispatch`): «¡Nuevo!», «★ +1 (3/5)» o «Ya tenía 5★: +X monedas».
- [ ] El color del fondo del resultado según la rareza, y el nombre de la rareza escrito.
- [ ] Si los datos del Pokémon aún no han llegado de la API, el `Loader` en el modal; si fallan, mensaje y «Reintentar». La tirada ya está hecha y guardada: lo que falla es solo la imagen.
- [ ] Tabla con las probabilidades de cada rareza (es buena práctica enseñarlas en cualquier gacha).

### 4.6 `BoxPage`

- [ ] Dos pestañas: **Mis Pokémon** y **Pokédex**.
- [ ] Mis Pokémon: `CardGrid` con tu colección; filtros por tipo y rareza (`<select>`) y orden por producción, rareza o número. Botón «Equipar» o «Quitar» en cada tarjeta.
- [ ] Equipar con el equipo lleno: abre el `Modal` para elegir a quién sustituir.
- [ ] Pokédex: los 151 en orden; los que tienes con su imagen, los que no en silueta (`filter: brightness(0)`) y con «???». La imagen de los que no tienes se construye con la URL fija de los sprites (`…/sprites/pokemon/{id}.png`): no hace falta pedirlos a la API. Contador «45 / 151».

### 4.7 `ShopPage`

- [ ] Una `UpgradeCard` por mejora, en el orden de `UPGRADES`.
- [ ] Comprar hace `dispatch({ type: 'BUY_UPGRADE', key })`.

**Al terminar:** puedes clicar, tirar, equipar y comprar mejoras, y el dinero sube solo cuando tienes equipo (lo hará de verdad con el bucle de la fase 6; para probar ahora, un botón temporal que haga `TICK`). Commit `feat: interfaz jugable`.

## Fase 5 · Gimnasios

Al final puedes retar a los 8 líderes en orden y ganar medallas.

### 5.1 `GymsPage`

- [ ] Los 8 líderes con el Pokémon que los representa (`ace`), su tipo y su vida.
- [ ] Estado con `gymStatus`: vencido (medalla), actual (botón «Retar») y bloqueado (con texto, no solo gris).
- [ ] Junto al actual, una pista: «Tu equipo hace X de daño por segundo» y qué Pokémon de tu equipo tienen ventaja de tipo.

### 5.2 `BattlePage`

El estado del combate es local: `useReducer` dentro de la página con `{ hp, timeLeft, teamDamage, status }`, donde `status` es `'ready' | 'fighting' | 'won' | 'lost'`.

- [ ] Pantalla de inicio: líder, vida, tiempo y botón «¡Empezar!». El tiempo no corre hasta pulsarlo.
- [ ] `hooks/useBattleTimer.js`: un `setInterval` de 100 ms que calcula el tiempo real pasado con `Date.now()` (igual que el bucle del juego) y se limpia al terminar o al salir de la pantalla.
- [ ] Cada tick resta a la vida el daño del equipo (`teamDps × segundos`), sin pasar del tope `maxTeamDamage`.
- [ ] Cada click resta `clickDamage(state)`. El botón de ataque es un `<button>`.
- [ ] **Teclado:** con Enter o Espacio se puede atacar, pero ignora las pulsaciones repetidas de mantener la tecla (`event.repeat`): si no, dejar Enter pulsado sería un autoclicker.
- [ ] Barra de vida (`<progress>` o `role="progressbar"`) y temporizador grande.
- [ ] Vida a 0 → `won`: `dispatch({ type: 'GYM_WON', number })`, pantalla de victoria con la recompensa. Tiempo a 0 → `lost`: «Reintentar» al momento.
- [ ] El resultado se anuncia con una región `aria-live` (solo el resultado, no la vida en cada tick).

### 5.3 Tests del combate

- [ ] `BattlePage.test.jsx` con `vi.useFakeTimers()`: el tiempo no corre antes de empezar; clicks hasta ganar → se envía `GYM_WON`; sin clicks se pierde al acabar el tiempo; mantener Enter (`repeat: true`) no hace daño.

**Al terminar:** commit `feat: gimnasios y combate`.

## Fase 6 · Juego completo

Al final el juego produce solo, guarda la partida y se siente bien al jugarlo. Es tu MVP terminado.

### 6.1 `hooks/useGameLoop.js`

- [ ] Un único `setInterval` de `TICK_MS` en `App`, no uno por componente.
- [ ] Calcula los segundos reales pasados con `Date.now()` y envía `dispatch({ type: 'TICK', seconds })`. Así, si el navegador ralentiza la pestaña en segundo plano, no pierdes producción.
- [ ] Limpia el intervalo en el `return` del `useEffect`.
- [ ] Durante un combate el juego sigue produciendo (el bucle está en `App`, no en la página).

### 6.2 Guardado (`store/persistence.js` y `hooks/useAutosave.js`)

- [ ] `saveGame(state)` y `loadGame()` con `try/catch`, en la clave `pkc:save`.
- [ ] Se guarda todo menos `pokemonById`, más `savedAt`.
- [ ] La partida se carga **antes** del primer render, con el inicializador perezoso de `useReducer`:

  ```js
  const [state, dispatch] = useReducer(
    gameReducer,
    undefined,
    createInitialState,
  );
  ```

  `createInitialState()` llama a `loadGame()`. Si la partida existe y su `saveVersion` coincide, la mezcla con `initialState`; si no coincide o está corrupta, devuelve `initialState`. Así el autoguardado nunca puede pisar la partida con un estado vacío.

- [ ] Ganancias mientras no estabas: al cargar, `tick(state, min((ahora − savedAt) / 1000, MAX_OFFLINE_SECONDS))`. Como la producción sale de la tabla de la Pokédex, no hay que esperar a la API. Enséñalo al volver: «Mientras no estabas, tu equipo ganó X monedas».
- [ ] Autoguardado cada `AUTOSAVE_MS` y también en `visibilitychange`.
- [ ] `SettingsPage`: «Reiniciar partida» con confirmación en el `Modal` (`RESET`).

### 6.3 Formato y sensación de juego

- [ ] `utils/format.js` → `formatNumber` con `Intl.NumberFormat('es-ES', { notation: 'compact', maximumFractionDigits: 1 })`: 1500 → «1,5 mil».
- [ ] Las monedas se guardan con decimales, pero se muestran con `formatNumber(Math.floor(coins))`.
- [ ] Animación de «+X» flotando al clicar y un pequeño rebote del botón.
- [ ] Animación de la tirada (la Poké Ball se agita y se abre) y destello del color de la rareza.
- [ ] Sacudida del líder al recibir daño.
- [ ] Todas las animaciones dentro de `@media (prefers-reduced-motion: no-preference)`.

### 6.4 Equilibrar

- [ ] `scripts/simulate.js` (`npm run simulate`): juega una región entera usando **las funciones reales** de `game/` y `config/`, con varias semillas de azar, y saca la tabla de tiempos de 3.2. Si cambias un número, vuelve a ejecutarlo.
- [ ] Juega tú 20 minutos seguidos y apunta: cuánto tardas en la primera tirada y en Brock, cuándo te aburres esperando y qué mejora nadie compraría.
- [ ] Ajusta **solo** los números de `config/`.
- [ ] Apunta los cambios en la sección de equilibrio de `CONTROL_DE_CALIDAD.md`.

**Al terminar:** pasa el apartado 4 del control de calidad (pruebas manuales) y commit `feat: bucle de juego y guardado`.

## Fase 7 · Calidad, despliegue y portfolio

Al final el juego está publicado con un enlace que puedes enseñar, y el repositorio da buena impresión a quien lo abra.

### 7.1 Completar los tests

- [ ] `utils/format.test.js` con `formatNumber`: 0, 999, 1500, 2 300 000.
- [ ] `PokemonCard.test.jsx`: nombre, número, tipos, rareza, estrellas e imagen.
- [ ] `UpgradeCard.test.jsx`: los tres estados y el botón deshabilitado sin dinero.
- [ ] `GachaPage.test.jsx`: tirar con un `rng` fijo y `fetch` simulado → resultado en el modal; sin dinero, botón deshabilitado.
- [ ] `useOwnedPokemon.test.js` con `renderHook`: carga los que faltan; si `fetch` falla, `error`.

### 7.2 Revisión de calidad

- [ ] Recorre entero `CONTROL_DE_CALIDAD.md`.
- [ ] Lighthouse sobre `npm run build && npm run preview`: rendimiento y accesibilidad por encima de 90.
- [ ] Juega solo con teclado, combate incluido.
- [ ] Prueba en Chrome, Firefox y tu móvil.
- [ ] React DevTools → Profiler: al pasar un tick, solo se repintan el contador y lo que cambia.

### 7.3 Desplegar en GitHub Pages

- [ ] En `vite.config.js`: `base: '/pokeclicker/'` (el nombre exacto del repositorio).
- [ ] `npm i -D gh-pages` y añade el script `"deploy": "npm run build && gh-pages -d dist"`.
- [ ] `npm run deploy` y en GitHub → Settings → Pages elige la rama `gh-pages`.
- [ ] Abre `https://berni14.github.io/pokeclicker/` en el móvil y comprueba que carga todo (imágenes, imagen de reserva, guardado).
- [ ] Más adelante puedes cambiarlo por un GitHub Action que despliegue en cada push a `main`.

### 7.4 README

- [ ] Título, una frase de qué es, GIF o captura y enlace a la demo.
- [ ] Cómo se juega, en cuatro líneas (click, gacha, equipo, gimnasios).
- [ ] Tecnologías: React, Vite, CSS Modules, Vitest, PokeAPI.
- [ ] Estructura de carpetas y por qué está organizada así (es lo que más se fija un técnico), y por qué la tabla de la Pokédex se genera con un script.
- [ ] Cómo ejecutarlo en local.
- [ ] Aviso: proyecto no oficial; Pokémon es marca de Nintendo, Game Freak y The Pokémon Company; datos de la PokeAPI.
- [ ] En inglés, o en los dos idiomas, si piensas usarlo fuera de España.

### 7.5 Darlo a conocer

- [ ] Fija el repositorio en tu perfil de GitHub.
- [ ] Añádelo a tu portfolio.
- [ ] Publicación en LinkedIn con el GIF: qué has hecho, qué has aprendido (cachear una API, estado con `useReducer`, lógica pura con tests, equilibrar con una simulación) y el enlace.

**Al terminar:** versión `v1.0.0` publicada. Crea la _release_ en GitHub con ese tag.

## Fase 8 · Ampliaciones

Con la v1.0 publicada, cada ampliación es una rama, una versión nueva y algo nuevo que contar. La primera es la que completa el diseño del juego.

### 8.1 Cambio de generación (v1.1)

- [ ] `node scripts/build-pokedex.js 2` → `config/pokedex-gen2.json` y la generación 2 en `config/generations.js` (152–251).
- [ ] Líderes de Johto en `config/gyms.js`: Pegaso (volador), Antón (bicho), Blanca (normal), Morti (fantasma), Aníbal (lucha), Yasmina (acero), Fredo (hielo) y Débora (dragón). Sus tipos en `config/typeChart.js`.
- [ ] `game/prestige.js` → `changeGeneration(state, keepId)`: aplica la tabla del apartado 9 de `FUNCIONAMIENTO_DEL_JUEGO.md` (dinero, mejoras y tiradas a 0; nivel y medallas se quedan; solo el Pokémon elegido, con sus estrellas).
- [ ] Acción `CHANGE_GENERATION` con `{ keepId }` y su test.
- [ ] Pantalla de cambio de generación: resumen de la región y elección del Pokémon.
- [ ] `saveVersion` a 2, con una función que convierta las partidas de la versión 1 en vez de borrarlas.
- [ ] `npm run simulate` para la región 2 empezando con el nivel y el Pokémon típicos del final de la 1.

### 8.2 Otras ideas

| Ampliación                            | Qué aprendes                                    | Dónde va                                   |
| ------------------------------------- | ----------------------------------------------- | ------------------------------------------ |
| Logros                                | Comprobar condiciones tras cada acción          | `game/achievements.js`, componente `Toast` |
| Sonidos con opción de silenciar       | Audio en el navegador y ajustes guardados       | `public/sounds/`, `pages/SettingsPage.jsx` |
| Pokémon _shiny_ en el gacha           | Probabilidades y animaciones                    | `config/gacha.js`, `game/gacha.js`         |
| Ficha de cada Pokémon                 | Rutas y páginas de detalle (`/pokemon/25`)      | React Router, `api/species.js`             |
| Evoluciones (con X estrellas)         | Datos encadenados de la API (`evolution-chain`) | `api/species.js`, `game/`                  |
| Pasar el estado a Zustand             | Otra forma de estado global                     | Solo `store/`                              |
| Pasar el proyecto a TypeScript        | Tipos para el modelo, el estado y las props     | Todo, archivo a archivo                    |
| PWA instalable y jugable sin conexión | Service workers y caché de imágenes             | `vite-plugin-pwa`                          |

Si alguna ampliación te obliga a tocar muchas carpetas que no son las de la tabla, es una señal de que algo de las fases anteriores está mezclado: es buen momento para refactorizar.

> Con React Router en GitHub Pages, usa `HashRouter` o el `basename="/pokeclicker"`: si no, al recargar una ruta como `/pokemon/25` sale un 404.
