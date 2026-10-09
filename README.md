# Pokémon Clicker

Un juego incremental en el navegador: haz click para ganar monedas, consigue Pokémon en el gacha, sube a tu equipo de nivel y derrota a los líderes de gimnasio de Kanto y Johto.

**[▶ Jugar](https://pokeclickers.netlify.app/)**

## Cómo se juega

1. **Click**: cada click en la Poké Ball da monedas.
2. **Gacha**: gasta monedas en tres gachas (básico, épico y legendario), cada uno con sus rarezas y su precio. Si te sale un repetido, sube de estrellas.
3. **Equipo**: los 6 Pokémon equipados producen monedas cada segundo. Desde la caja los subes de nivel o eliges el mejor equipo automáticamente.
4. **Gimnasios**: combates a contrarreloj en los que tu equipo y tus clicks atacan juntos. El tipo importa: Squirtle le pega más fuerte a Brock. Con las 8 medallas viajas a la siguiente región llevándote un solo Pokémon.

La partida se guarda sola y sigues ganando monedas mientras no estás.

## Tecnologías

- **React 19** con `useReducer` y Context para el estado global.
- **Vite** para el desarrollo y la compilación.
- **CSS Modules** y variables CSS (sin librerías de componentes).
- **Vitest** y **React Testing Library** para los tests.
- **[PokeAPI](https://pokeapi.co/)** para los nombres, imágenes y estadísticas.
- **ESLint** y **Prettier**, y despliegue en **Netlify** con cada push a `main`.

## Estructura

```
src/
├── api/          Llamadas a la PokeAPI (solo fetch, sin lógica)
├── models/       Transforman la respuesta de la API en los objetos del juego
├── services/     Caché y carga por lotes de los Pokémon
├── config/       Números del juego: rarezas, gachas, gimnasios, tabla de tipos
├── game/         Reglas del juego como funciones puras (click, gacha, combate, cambio de región…)
├── store/        Reducer, estado inicial, Context y guardado en localStorage
├── hooks/        Bucle de juego, autoguardado, temporizador de combate
├── components/   Piezas reutilizables de la interfaz (tarjetas, modal…)
├── pages/        Una por pestaña: juego, gacha, caja, tienda, gimnasios
└── utils/        Formato, azar y preferencias de movimiento
scripts/
├── build-pokedex.js   Genera la tabla de la Pokédex desde la PokeAPI
└── simulate.js        Juega partidas enteras para equilibrar el juego
```

Está organizado **de abajo arriba**, para que cada capa dependa solo de la de debajo:

- **Las reglas del juego (`game/`) no saben nada de React.** Son funciones puras que reciben el estado y devuelven el nuevo, así que se prueban con tests rápidos y sin pantalla. El reducer solo reparte cada acción a su función.
- **Los números están separados de las reglas (`config/`).** Equilibrar el juego es cambiar un número, no tocar la lógica.
- **La API está aislada (`api/`, `models/`, `services/`).** Si la PokeAPI cambia, solo se tocan esas carpetas.

**¿Por qué la tabla de la Pokédex se genera con un script?** Para sortear el gacha, el juego necesita la rareza y las estadísticas de todos los Pokémon de la región desde el principio. Pedirlas a la API en cada partida serían más de 300 peticiones antes de poder jugar. `npm run pokedex -- 1` (o `-- 2`) las descarga una sola vez y las guarda en `src/config/pokedex-gen1.json` (o `gen2`), que va en el repositorio. Durante el juego, la API solo se usa para los nombres y las imágenes de los Pokémon que tienes.

**Equilibrio con simulación.** `npm run simulate` juega regiones enteras con las mismas funciones que el juego real. Así se ajustaron la vida de los gimnasios y los precios: cada región dura unas 2 horas (Kanto ~1 h 54 min y Johto ~1 h 44 min).

## Ejecutarlo en local

Necesitas Node.js 20.19+ o 22.12+.

```bash
git clone https://github.com/Berni14/pokeclicker.git
cd pokeclicker
npm install
npm run dev
```

Otros comandos:

| Comando            | Qué hace                                       |
| ------------------ | ---------------------------------------------- |
| `npm test`         | Tests en modo vigilancia                       |
| `npm run check`    | Lint, formato, tests y compilación, todo junto |
| `npm run build`    | Compila la versión de producción en `dist/`    |
| `npm run simulate` | Simula partidas para revisar el equilibrio     |

## Aviso

Proyecto personal sin ánimo de lucro y **no oficial**. Pokémon y sus nombres son marcas de Nintendo, Game Freak y The Pokémon Company. Los datos y las imágenes vienen de la [PokeAPI](https://pokeapi.co/).
