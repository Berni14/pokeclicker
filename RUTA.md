# Ruta del Pokémon Clicker

Oct 8, 2026 · @Berni

## Cómo usar esta ruta

Sigue las fases en orden: cada una termina con algo que funciona y un commit, así nunca tienes el proyecto roto más de un día. Construyes de abajo arriba, igual que la estructura de carpetas: primero los datos, luego la lógica y al final la interfaz.

1. **Fase 0 · Preparación y diseño.** Entender la PokeAPI, decidir el MVP y bocetar en Figma. Unas 3–4 h.
2. **Fase 1 · Proyecto base.** Vite, Git, GitHub, ESLint, Prettier y carpetas. Unas 2 h.
3. **Fase 2 · Datos.** Pedir Pokémon a la API, transformarlos y cachearlos. Unas 4–5 h.
4. **Fase 3 · Lógica y estado.** Economía, compras, producción y el store global. Unas 5–6 h.
5. **Fase 4 · Interfaz.** Tarjetas, rejilla, botón y contador. Unas 8–10 h.
6. **Fase 5 · Juego completo.** Bucle, guardado, animaciones y equilibrio. Unas 5–6 h.
7. **Fase 6 · Calidad y despliegue.** Tests, Lighthouse, GitHub Pages y README. Unas 4–5 h.
8. **Fase 7 · Ampliaciones.** Pokédex, evoluciones, logros… cuando quieras.

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

Escribe en el README qué entra en la versión 1 y qué no. Propuesta:

- **Entra:** click que da monedas; los 151 Pokémon de la primera generación cargados por lotes; comprar un Pokémon y subirlo de nivel; cada uno produce monedas por segundo; guardado automático.
- **No entra (de momento):** evoluciones, logros, mejoras del click, sonidos, Pokédex, varias generaciones.

### 0.3 Diseño en Figma

- [ ] Wireframe de escritorio y de móvil (360 px): cabecera con contador de monedas y producción por segundo, botón grande para clicar y rejilla de tarjetas.
- [ ] La tarjeta en sus tres estados: **bloqueada** (no te llega), **disponible** (puedes comprar) y **comprada** (con nivel).
- [ ] Tokens: 5–6 colores base, una tipografía para títulos y otra para texto, escala de espaciados (4, 8, 12, 16, 24, 32 px) y radios.
- [ ] Colores por tipo (fuego, agua, planta…): busca una paleta ya hecha y ajústala para que el texto blanco tenga contraste.

**Al terminar:** tienes los campos apuntados, el MVP escrito y un diseño de pantalla y tarjeta.

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

## Fase 2 · Datos

Al final puedes pedir un lote de Pokémon y recibirlos ya transformados a tu formato, sin repetir peticiones. Todavía no hay interfaz: lo pruebas en la consola.

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

La rareza se decide con los datos de la especie (legendario o singular) y, para el resto, con la suma de stats:

```js
// config/rarities.js
export const RARITIES = {
  common: { label: 'Común', multiplier: 1 },
  rare: { label: 'Rara', multiplier: 1.2 },
  epic: { label: 'Épica', multiplier: 1.5 },
  legendary: { label: 'Legendaria', multiplier: 3 },
  mythical: { label: 'Singular', multiplier: 3 },
};

export function getRarity({ statTotal, isLegendary, isMythical }) {
  if (isMythical) return 'mythical';
  if (isLegendary) return 'legendary';
  if (statTotal >= 450) return 'epic';
  if (statTotal >= 300) return 'rare';
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

- [ ] Añade una función `formatName(name)` en `utils/format.js` para casos como `mr-mime` o `nidoran-f`.

### 2.4 `services/cache.js`

- [ ] Un `Map` en memoria y, detrás, localStorage con una clave versionada (`pkc:pokemon:v1`). Guarda el **modelo reducido**, nunca la respuesta de la API.
- [ ] Funciones `getCached(id)` y `setCached(pokemon)`.
- [ ] Envuelve todo acceso a localStorage en `try/catch` (en incógnito o con el almacenamiento lleno puede fallar).
- [ ] Usa siempre el prefijo `pkc:` en las claves: en GitHub Pages todos tus proyectos de `berni14.github.io` comparten el mismo localStorage.

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

- [ ] Las peticiones compartidas no se cancelan con `signal` (si una la cancelara, la otra se quedaría sin datos). La cancelación se gestiona en el hook (4.1).
- [ ] `getPokemonByIds` servirá también para cargar al arrancar los Pokémon que ya tienes, aunque estén en lotes que todavía no se han mostrado (5.2).

### 2.6 Probarlo

- [ ] En `App.jsx`, dentro de un `useEffect`, llama a `getPokemonBatch(1, 20)` y haz `console.log` del resultado.
- [ ] Recarga: en la pestaña Network de DevTools, la segunda vez no debería salir ninguna petición a la PokeAPI.
- [ ] La primera vez deberían salir 40 peticiones (20 de `pokemon` y 20 de `pokemon-species`), no 80, aunque `StrictMode` ejecute el efecto dos veces.
- [ ] Quita el `console.log` cuando funcione.

**Al terminar:** commit `feat: capa de datos con caché`.

## Fase 3 · Lógica y estado

Al final tienes las reglas del juego en funciones puras, con tests, y un store global al que cualquier componente puede acceder. Es la fase más importante: si aquí está bien hecho, la interfaz es solo pintar.

### 3.1 `config/economy.js`: los números

La idea: primero se calcula lo que **produce** cada Pokémon (según stats y rareza) y el precio sale de ahí. Cuanto más produce, más tarda en devolver lo que cuesta. Así, por construcción, un Pokémon más caro siempre produce más que uno más barato.

```js
import { RARITIES } from './rarities';

export const CLICK_VALUE = 1;
export const COST_GROWTH = 1.15; // cada nivel cuesta un 15 % más
export const TICK_MS = 1000;
export const AUTOSAVE_MS = 10_000;
export const MAX_OFFLINE_SECONDS = 8 * 60 * 60;

const round1 = (n) => Math.round(n * 10) / 10;

// Monedas por segundo que da cada nivel.
export const productionPerLevel = (p) =>
  round1((p.statTotal / 100) ** 2 * 0.1 * RARITIES[p.rarity].multiplier);

// Segundos que tarda en recuperarse lo que cuesta: más producción, más espera.
const paybackSeconds = (production) => 20 + 10 * production;

export const baseCost = (p) => {
  const production = productionPerLevel(p);
  return Math.max(5, Math.round(production * paybackSeconds(production)));
};

export const costAt = (p, level) =>
  Math.round(baseCost(p) * COST_GROWTH ** level);
```

Con estos números (aproximados):

| Pokémon         | Stats | Rareza     | Producción | Coste inicial |
| --------------- | ----- | ---------- | ---------- | ------------- |
| Caterpie (#10)  | 195   | Común      | 0,4/s      | 10            |
| Bulbasaur (#1)  | 318   | Rara       | 1,2/s      | 38            |
| Chansey (#113)  | 450   | Épica      | 3/s        | 150           |
| Charizard (#6)  | 534   | Épica      | 4,3/s      | 271           |
| Articuno (#144) | 580   | Legendaria | 10,1/s     | 1222          |
| Mew (#151)      | 600   | Singular   | 10,8/s     | 1382          |
| Mewtwo (#150)   | 680   | Legendaria | 13,9/s     | 2210          |

El primer Pokémon cuesta unos 10 clicks y los legendarios son los más caros y los que más producen. Son un punto de partida: en 5.4 los ajustarás jugando.

- [ ] `config/types.js` con un color por tipo.
- [ ] `config/generations.js`: `export const GENERATIONS = { 1: { from: 1, to: 151 } };` y `export const BATCH_SIZE = 20;`. Para añadir la segunda generación más adelante, solo añades una línea.

### 3.2 `game/`: las reglas, sin React

Los datos de los Pokémon cargados viven en el estado, en `pokemonById` (ver 3.4). Así las reglas los tienen siempre a mano.

- [ ] `clicker.js` → `click(state)` devuelve el estado con `CLICK_VALUE` sumado a las monedas.
- [ ] `shop.js` → `canBuy(state, id)` y `buy(state, id)`: buscan el Pokémon en `state.pokemonById`, restan `costAt(pokemon, nivelActual)` y suben el nivel. Si no llega (o el Pokémon no está cargado), devuelve el estado sin cambios.
- [ ] `production.js` → `totalProduction(state)` suma `productionPerLevel(pokemon) * nivel` de cada Pokémon de `owned`. Si alguno aún no está en `pokemonById`, cuenta 0 (solo pasa un instante al arrancar).
- [ ] `production.js` → `tick(state, seconds)` suma `totalProduction(state) * seconds` a las monedas.
- [ ] La interfaz muestra la producción con la misma `totalProduction(state)` que usa el tick: nunca la recalcules por tu cuenta en un componente.
- [ ] Ninguna función modifica el estado que recibe: siempre devuelven uno nuevo con `{ ...state }`.

### 3.3 Tests de la lógica (ahora, no al final)

- [ ] `shop.test.js`: comprar con monedas suficientes, sin monedas, y que el segundo nivel cuesta más que el primero.
- [ ] `production.test.js`: sin Pokémon da 0; con dos Pokémon suma bien; un Pokémon en `owned` que no está en `pokemonById` no rompe nada.
- [ ] `economy.test.js`: ordenando los 7 Pokémon de la tabla por coste, la producción también queda ordenada.
- [ ] `npm test` en verde antes de seguir.

### 3.4 `store/`: el estado global

- [ ] `initialState.js` → `{ saveVersion: 1, coins: 0, owned: {}, pokemonById: {} }`.
  - En `owned` guardas `{ [id]: nivel }`.
  - En `pokemonById` van los Pokémon ya cargados. **No se guarda en la partida**: se rellena desde la caché al arrancar.
- [ ] `gameReducer.js` → acciones:
  - `CLICK`
  - `BUY_POKEMON` con `{ id }`
  - `TICK` con `{ seconds }`
  - `POKEMON_LOADED` con `{ pokemon: [...] }`: añade el lote a `pokemonById`
  - `RESET`: vuelve a monedas y Pokémon a cero, pero conserva `pokemonById`
  - Cada una llama a la función de `game/` correspondiente. Las acciones desconocidas devuelven el estado tal cual.
- [ ] `GameContext.jsx` → `GameProvider` con `useReducer`, y un hook `useGame()` que devuelve `{ state, dispatch }` y lanza un error si se usa fuera del provider.
- [ ] El `GameProvider` va en `App.jsx` (es donde están los providers en la estructura), envolviendo el layout.
- [ ] `gameReducer.test.js`: una prueba por acción y una con una acción desconocida.

**Al terminar:** tests en verde y commit `feat: lógica del juego y store`.

## Fase 4 · Interfaz

Al final se puede jugar: clicas, ganas monedas y compras Pokémon desde sus tarjetas. Haz los componentes de los más simples a los más complejos, y un commit por componente.

### 4.1 `hooks/usePokemonList.js`

- [ ] Devuelve `{ pokemon, loading, error, hasMore, loadMore, retry }`.
- [ ] Al montar carga el primer lote; `loadMore` carga el siguiente hasta llegar al 151.
- [ ] El último lote es más corto (del 141 al 151 son 11): `count = Math.min(BATCH_SIZE, to - nextId + 1)`. Nunca pidas el 152.
- [ ] Cada lote recibido, además de guardarlo en su estado, lo envía al store con `dispatch({ type: 'POKEMON_LOADED', pokemon: lote })`.
- [ ] Crea un `AbortController` en el `useEffect` y aborta en la limpieza. Antes de cualquier `setState` (datos o error), comprueba `if (controller.signal.aborted) return;`. Así un componente desmontado no se actualiza y una cancelación nunca aparece como error.
- [ ] Al añadir un lote, descarta los IDs que ya estén en la lista: si se llama dos veces seguidas (en desarrollo, `StrictMode` monta los efectos dos veces), no se duplican Pokémon.

### 4.2 Componentes pequeños

1. **`CoinCounter`**: monedas y producción por segundo. Lee de `useGame()`; la producción sale de `totalProduction(state)`.
2. **`ClickButton`**: un `<button>` grande (una Poké Ball dibujada con CSS, por ejemplo) que hace `dispatch({ type: 'CLICK' })`.
3. **`TypeBadge`**: recibe `type` y pinta la etiqueta con su color de `config/types.js`.
4. **`Loader`**: esqueletos con la forma de la tarjeta, mejor que un spinner.

### 4.3 `PokemonCard`

- [ ] Props: `pokemon`, `level`, `cost`, `canAfford`, `onBuy`. La tarjeta **no** calcula nada: recibe todo hecho.
- [ ] Al pulsar comprar llama a `onBuy(pokemon.id)`: así `CardGrid` puede pasar la misma función a todas las tarjetas.
- [ ] Estructura semántica: `<article>` con número, imagen, nombre como `<h3>`, tipos en `<ul>`, nivel y producción en `<dl>`, y un `<button>` de compra.
- [ ] Texto del botón: «Capturar» si nivel 0 y «Subir nivel» si ya es tuyo, siempre con el coste.
- [ ] Estados con atributos: `data-state="locked|available|owned"` y estilos en el CSS Module. Además del color, muestra el estado con texto o icono.
- [ ] Color de fondo según el primer tipo con una variable: `style={{ '--type-color': TYPE_COLORS[pokemon.types[0]] }}`.
- [ ] Imagen con `alt={nombre}`, `loading="lazy"`, `width` y `height` fijos.
- [ ] Envuélvela en `React.memo`: así solo se repinta la tarjeta que cambia.

### 4.4 `CardGrid`

- [ ] Recibe por props `pokemon`, `loading`, `error`, `hasMore`, `onLoadMore` y `onRetry` (los datos los pide `GamePage` con `usePokemonList`, no la rejilla).
- [ ] Para cada Pokémon calcula `level`, `cost` y `canAfford` con las funciones de `game/` y `config/`.
- [ ] `key={pokemon.id}`.
- [ ] CSS Grid: `grid-template-columns: repeat(auto-fill, minmax(180px, 1fr))`.
- [ ] Debajo, `Loader` si `loading`; botón «Cargar más» si `hasMore`; mensaje de error con «Reintentar» si `error`.
- [ ] Una sola función de compra para todas las tarjetas, con `useCallback`:

  ```js
  const handleBuy = useCallback(
    (id) => dispatch({ type: 'BUY_POKEMON', id }),
    [dispatch],
  );
  // <PokemonCard … onBuy={handleBuy} />
  ```

  Nunca `onBuy={() => buy(p)}`: crea una función nueva en cada render y `React.memo` deja de servir.

### 4.5 `pages/GamePage.jsx`

- [ ] Junta todo: llama a `usePokemonList`, y pinta la cabecera con `CoinCounter`, la zona del `ClickButton` y `CardGrid`.
- [ ] En escritorio, botón a la izquierda y tarjetas a la derecha; en móvil, todo en columna con el contador fijo arriba.
- [ ] Compáralo con tu diseño de Figma.

**Al terminar:** puedes clicar, comprar y subir de nivel. Commit `feat: interfaz jugable`.

## Fase 5 · Juego completo

Al final el juego produce solo, guarda la partida y se siente bien al jugarlo. Es tu MVP terminado.

### 5.1 `hooks/useGameLoop.js`

- [ ] Un único `setInterval` de `TICK_MS` en `App`, no uno por tarjeta.
- [ ] Calcula los segundos reales pasados con `Date.now()` y envía `dispatch({ type: 'TICK', seconds })`. Así, si el navegador ralentiza la pestaña en segundo plano, no pierdes producción.
- [ ] Limpia el intervalo en el `return` del `useEffect`.

### 5.2 Guardado (`store/persistence.js` y `hooks/useAutosave.js`)

- [ ] `saveGame(state)` y `loadGame()` con `try/catch`, en la clave `pkc:save`.
- [ ] Se guarda solo `{ saveVersion, coins, owned, savedAt }`. Nunca `pokemonById`: ya está en la caché.
- [ ] La partida se carga **antes** del primer render, con el inicializador perezoso de `useReducer`:

  ```js
  const [state, dispatch] = useReducer(
    gameReducer,
    undefined,
    createInitialState,
  );
  ```

  `createInitialState()` llama a `loadGame()`. Si la partida existe y su `saveVersion` coincide, la mezcla con `initialState`; si no coincide o está corrupta, devuelve `initialState`. Así el autoguardado nunca puede pisar la partida con un estado vacío.

- [ ] Al arrancar, en un `useEffect` del `GameProvider`:
  1. Pide los Pokémon que ya tienes, aunque no estén en el primer lote: `getPokemonByIds(Object.keys(owned).map(Number))` y `POKEMON_LOADED`. Normalmente salen de la caché al instante.
  2. Después, si hay `savedAt`, da las monedas del tiempo fuera: `TICK` con `Math.min((Date.now() - savedAt) / 1000, MAX_OFFLINE_SECONDS)` segundos. Tiene que ir después del paso 1 o la producción saldría 0.
- [ ] Autoguardado cada `AUTOSAVE_MS` y también en `visibilitychange` (cuando el usuario cambia de pestaña).
- [ ] Botón «Reiniciar partida» con confirmación (`RESET`).

### 5.3 Formato y sensación de juego

- [ ] `utils/format.js` → `formatNumber` con `Intl.NumberFormat('es-ES', { notation: 'compact', maximumFractionDigits: 1 })`: 1500 → «1,5 mil».
- [ ] Las monedas se guardan con decimales (la producción los tiene), pero se muestran con `formatNumber(Math.floor(coins))`. Nunca enseñes el número en bruto.
- [ ] Animación de «+1» flotando al clicar y un pequeño rebote del botón.
- [ ] Animación al capturar un Pokémon por primera vez.
- [ ] Todas las animaciones dentro de `@media (prefers-reduced-motion: no-preference)`.

### 5.4 Equilibrar

- [ ] Juega 15 minutos seguidos y apunta: cuánto tardas en el primer Pokémon, cuándo te aburres esperando y qué Pokémon nadie compraría.
- [ ] Ajusta **solo** los números de `config/economy.js` y `config/rarities.js`. `economy.test.js` te avisa si rompes el orden coste–producción.
- [ ] Apunta los cambios en la sección de equilibrio de `CONTROL_DE_CALIDAD.md`.

**Al terminar:** pasa el apartado 4 del control de calidad (pruebas manuales) y commit `feat: bucle de juego y guardado`. Fusiona en `main`.

## Fase 6 · Calidad, despliegue y portfolio

Al final el juego está publicado con un enlace que puedes enseñar, y el repositorio da buena impresión a quien lo abra.

### 6.1 Completar los tests

- [ ] `models/pokemon.test.js` con JSON de ejemplo en `src/__mocks__/`: `pikachu.json` y `pikachu-species.json`, y otro Pokémon con sprites vacíos que debe acabar con la imagen de reserva. Comprueba también que Mewtwo sale legendario y Chansey no.
- [ ] `utils/format.test.js`.
- [ ] `PokemonCard.test.jsx`: muestra nombre, tipos e imagen; el botón está deshabilitado sin monedas; llama a `onBuy` con el ID al hacer click.
- [ ] `CardGrid.test.jsx`: con `loading` muestra el `Loader`; con `error` muestra el mensaje y «Reintentar» llama a `onRetry`. Solo props, sin `fetch`.
- [ ] `usePokemonList.test.js` con `renderHook`: simulando `fetch` con `vi.fn()`, primero `loading` y luego los datos; si `fetch` falla, `error`.

### 6.2 Revisión de calidad

- [ ] Recorre entero `CONTROL_DE_CALIDAD.md`.
- [ ] Lighthouse sobre `npm run build && npm run preview`: rendimiento y accesibilidad por encima de 90.
- [ ] Juega solo con teclado.
- [ ] Prueba en Chrome, Firefox y tu móvil.
- [ ] React DevTools → Profiler: al pasar un tick, solo se repintan el contador y las tarjetas que cambian de estado.

### 6.3 Desplegar en GitHub Pages

- [ ] En `vite.config.js`: `base: '/pokeclicker/'` (el nombre exacto del repositorio).
- [ ] `npm i -D gh-pages` y añade el script `"deploy": "npm run build && gh-pages -d dist"`.
- [ ] `npm run deploy` y en GitHub → Settings → Pages elige la rama `gh-pages`.
- [ ] Abre `https://berni14.github.io/pokeclicker/` en el móvil y comprueba que carga todo (imágenes, imagen de reserva, guardado).
- [ ] Más adelante puedes cambiarlo por un GitHub Action que despliegue en cada push a `main`.

### 6.4 README

- [ ] Título, una frase de qué es, GIF o captura y enlace a la demo.
- [ ] Tecnologías: React, Vite, CSS Modules, Vitest, PokeAPI.
- [ ] Estructura de carpetas y por qué está organizada así (es lo que más se fija un técnico).
- [ ] Cómo ejecutarlo en local.
- [ ] Aviso: proyecto no oficial; Pokémon es marca de Nintendo, Game Freak y The Pokémon Company; datos de la PokeAPI.
- [ ] En inglés, o en los dos idiomas, si piensas usarlo fuera de España.

### 6.5 Darlo a conocer

- [ ] Fija el repositorio en tu perfil de GitHub.
- [ ] Añádelo a tu portfolio.
- [ ] Publicación en LinkedIn con el GIF: qué has hecho, qué has aprendido (cachear una API, estado con `useReducer`, tests) y el enlace.

**Al terminar:** versión `v1.0.0` publicada. Crea la _release_ en GitHub con ese tag.

## Fase 7 · Ampliaciones

Con el MVP publicado, cada ampliación es una rama, una versión nueva (`v1.1.0`, `v1.2.0`…) y algo nuevo que contar. Están ordenadas de más fácil a más difícil, y cada una dice qué carpeta toca, para que veas que la estructura aguanta.

| Ampliación                               | Qué aprendes                                    | Dónde va                                    |
| ---------------------------------------- | ----------------------------------------------- | ------------------------------------------- |
| Mejoras del click (×2, ×5…)              | Nuevas acciones en el reducer                   | `config/upgrades.js`, `game/`, `store/`     |
| Segunda generación (152–251)             | Que tu estructura escala                        | Una línea en `config/generations.js`        |
| Pokémon _shiny_ aleatorios al clicar     | Probabilidades y animaciones                    | `utils/random.js`, `game/clicker.js`        |
| Logros                                   | Comprobar condiciones tras cada acción          | `game/achievements.js`, componente `Toast`  |
| Sonidos con opción de silenciar          | Audio en el navegador y ajustes guardados       | `public/sounds/`, `pages/SettingsPage.jsx`  |
| Pokédex con React Router                 | Rutas y páginas de detalle (`/pokedex/25`)      | `pages/PokedexPage.jsx`, `api/species.js`   |
| Evoluciones (subir a nivel X evoluciona) | Datos encadenados de la API (`evolution-chain`) | `api/species.js`, `models/`, `game/shop.js` |
| Pasar el estado a Zustand                | Otra forma de estado global                     | Solo `store/`                               |
| Pasar el proyecto a TypeScript           | Tipos para el modelo, el estado y las props     | Todo, archivo a archivo                     |
| PWA instalable y jugable sin conexión    | Service workers y caché de imágenes             | `vite-plugin-pwa`                           |

Si alguna ampliación te obliga a tocar muchas carpetas que no son las de la tabla, es una señal de que algo de las fases anteriores está mezclado: es buen momento para refactorizar.

> Con React Router en GitHub Pages, usa `HashRouter` o el `basename="/pokeclicker"`: si no, al recargar una ruta como `/pokedex/25` sale un 404.
