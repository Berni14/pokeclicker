# Control de calidad · Pokémon Clicker

Guía para revisar el proyecto antes de cada commit, cada PR y cada despliegue.
Stack: **React + Vite**, datos de la **PokeAPI**.

---

## 1. Herramientas

| Herramienta           | Para qué                                     | Instalación                                                                                                                     |
| --------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| ESLint                | Errores y malas prácticas en el código       | `npm i -D eslint @eslint/js globals eslint-plugin-react-hooks eslint-plugin-react-refresh` (la plantilla de Vite ya no lo trae) |
| Prettier              | Formato uniforme                             | `npm i -D prettier eslint-config-prettier`                                                                                      |
| Vitest                | Tests unitarios (lógica del juego)           | `npm i -D vitest`                                                                                                               |
| React Testing Library | Tests de componentes                         | `npm i -D @testing-library/react @testing-library/jest-dom jsdom`                                                               |
| Lighthouse            | Rendimiento, accesibilidad, buenas prácticas | DevTools de Chrome                                                                                                              |
| React DevTools        | Ver estado y re-renders                      | Extensión del navegador                                                                                                         |

Scripts en `package.json`:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "lint": "eslint . --max-warnings 0",
  "format": "prettier --write .",
  "format:check": "prettier --check .",
  "test": "vitest",
  "check": "npm run lint && npm run format:check && vitest run && npm run build"
}
```

`--max-warnings 0` hace que un aviso (un `console.log`, una dependencia que falta en un `useEffect`) también bloquee el `check`. Si `format:check` falla, ejecuta `npm run format` y vuelve a probar.

> Antes de hacer push: `npm run check`. Si falla, no se sube.

---

## 2. Convenciones del proyecto

- [ ] Componentes en `PascalCase` (`PokemonCard.jsx`), funciones y hooks en `camelCase` (`usePokemon.js`).
- [ ] Cada componente en su carpeta, con su `.jsx` y su `.module.css`.
- [ ] Los componentes **no** llaman a la PokeAPI: piden datos a través de `hooks/` → `services/`.
- [ ] `game/` y `config/` son JS puro: **sin React, sin DOM, sin fetch**.
- [ ] Ningún número mágico en componentes: costes, multiplicadores y tiempos van en `config/`.
- [ ] Sin `console.log` olvidados.
- [ ] Commits claros: `feat: …`, `fix: …`, `style: …`, `refactor: …`, `test: …`, `docs: …`, `chore: …`.

---

## 3. Checklist por capa

### `api/` y `services/`

- [ ] Toda petición tiene `try/catch` y devuelve un error entendible.
- [ ] Se comprueba `response.ok` antes de leer el JSON.
- [ ] Los datos se transforman con `models/pokemon.js` antes de llegar al juego.
- [ ] Hay caché: el mismo Pokémon no se pide dos veces.
- [ ] En localStorage se guarda el **modelo reducido**, no la respuesta completa de la API.
- [ ] Las cargas van por lotes (p. ej. de 20 en 20), nunca 151 peticiones de golpe sin control.

### `models/`

- [ ] Si falta el artwork oficial, se usa `sprites.front_default`; si falta también, una imagen de reserva.
- [ ] Los nombres se muestran bien (`mr-mime` → `Mr. Mime`).
- [ ] Los tipos se ordenan por `slot`.
- [ ] La rareza legendaria/singular sale de `is_legendary` / `is_mythical` de la especie, no de la experiencia base.

### `game/` y `config/`

- [ ] Las monedas nunca bajan de 0.
- [ ] No se puede tirar, comprar una mejora ni equipar sin cumplir las condiciones (dinero, nivel de entrenador, hueco en el equipo).
- [ ] El precio de cada gacha (solo con sus tiradas) y el de cada mejora suben según las fórmulas de `config/`.
- [ ] Ningún Pokémon pasa de 5 estrellas; el equipo nunca tiene más de 6 ni repetidos.
- [ ] La producción por segundo se calcula igual en el tick y en lo que muestra la interfaz.
- [ ] El azar solo está en `rollPokemon`, que recibe el `rng`; el resto de `game/` es determinista.
- [ ] La tabla `config/pokedex-gen1.json` está generada con los umbrales de rareza actuales (su test lo comprueba).
- [ ] No aparecen `NaN`, `Infinity` ni decimales raros (`0.30000000004`).

### `store/`

- [ ] El reducer es puro: no muta el estado, devuelve uno nuevo. El sorteo del gacha se hace fuera y llega en la acción `PULL`.
- [ ] Toda acción tiene un `type` definido; acciones desconocidas devuelven el estado tal cual.
- [ ] El estado del combate (vida, tiempo) es local de la pantalla; al store solo llega `GYM_WON`.
- [ ] La partida guardada incluye un número de versión (`saveVersion`) por si cambia la estructura.
- [ ] La partida guardada no incluye los datos de los Pokémon (`pokemonById`): esos salen de la caché.
- [ ] Al recargar, el equipo produce desde el primer momento (la producción sale de la tabla de la Pokédex, no de la API).
- [ ] Si el guardado está corrupto o es antiguo, el juego arranca con el estado inicial sin romperse.

### `hooks/`

- [ ] Todo `setInterval` / `addEventListener` se limpia en el `return` del `useEffect`.
- [ ] Las dependencias de `useEffect` están completas (ESLint avisa).
- [ ] Los hooks de datos devuelven al menos `{ loading, error }` y, si pueden fallar, `retry`.
- [ ] Una petición que termina después de desmontar el componente no actualiza el estado (usar `AbortController`).

### `components/`

- [ ] Reciben datos por props, no los buscan ellos.
- [ ] Las listas usan `key={pokemon.id}`, nunca el índice.
- [ ] Hay estado de carga (Loader) y estado de error con opción de reintentar.
- [ ] Las tarjetas se ven bien con nombres largos y con uno o dos tipos.

---

## 4. Pruebas manuales del juego

### Flujo básico

- [ ] Al hacer click en el botón principal, las monedas suben lo que deben.
- [ ] La primera tirada llega tras unos pocos clicks (~25).
- [ ] Cada gacha solo da sus dos rarezas; tirar de uno no cambia el precio de los otros.
- [ ] Una partida guardada de antes de los tres gachas carga con sus tiradas en el básico.
- [ ] Al tirar, se restan las monedas, el precio sube y sale el resultado con su rareza.
- [ ] Un Pokémon nuevo se equipa solo si hay hueco; un repetido sube una estrella; con 5★ se convierte en monedas.
- [ ] La producción pasiva suma cada segundo y solo cuentan los 6 equipados.
- [ ] Equipar con el equipo lleno pide a quién sustituir.
- [ ] «Más dinero» pone los 6 que más producen y las monedas/s suben; «Más daño contra …» cambia con el gimnasio actual; el botón del equipo que ya tienes sale con ✓ y desactivado.
- [ ] La Pokédex muestra en silueta los que faltan y el contador cuadra con la caja.
- [ ] Las mejoras pasan de bloqueada → disponible → máximo; el nivel de entrenador desbloquea las que tocan.
- [ ] El nivel de entrenador sube con las tiradas y los gimnasios, no con los clicks.
- [ ] Los objetos permanentes se compran una vez y pasan a «Comprado»; el click y las monedas/s de arriba se multiplican al momento.
- [ ] Un potenciador activo se ve con su cuenta atrás en la tienda y arriba; comprar otro suma el tiempo; al acabarse, todo vuelve a la normalidad.
- [ ] Los objetos no cambian el daño del click en combate.

### Gimnasios

- [ ] Solo se puede retar al gimnasio actual; los siguientes están bloqueados.
- [ ] El tiempo no corre hasta pulsar «Empezar».
- [ ] El equipo no tiene tope: un equipo con nivel suficiente gana sin clicks, y la pista de gimnasios lo dice.
- [ ] Subir de nivel a un Pokémon cobra su precio y sube su producción y su daño; al Nv 100 ya no se puede.
- [ ] Un Pokémon con ventaja de tipo hace más daño (y se indica).
- [ ] Mantener pulsado Enter no ataca solo.
- [ ] Al ganar: medalla, experiencia, monedas y se desbloquea el siguiente. Al perder: reintento inmediato.
- [ ] Salir a mitad de combate no deja el temporizador corriendo.

### Guardado

- [ ] Recargar la página mantiene monedas, colección con estrellas y niveles, equipo, mejoras, objetos, potenciadores activos, nivel y medallas.
- [ ] Cerrar y abrir el navegador mantiene la partida y da las monedas del tiempo fuera (máximo 8 h).
- [ ] Recargar justo después de tirar no pierde la tirada.
- [ ] Botón de reiniciar partida pide confirmación y deja todo a cero.
- [ ] Funciona en ventana de incógnito (sin localStorage persistente) sin errores.

### Casos límite

- [ ] Hacer clicks muy rápidos no rompe el contador.
- [ ] Dejar la pestaña en segundo plano y volver: el contador no se dispara ni se congela de forma rara.
- [ ] Sin conexión (DevTools → Network → Offline): aparece un mensaje de error, no una pantalla en blanco; se puede seguir clicando y tirando.
- [ ] Red lenta (Network → Slow 3G): se ven los loaders y las imágenes no saltan de tamaño.
- [ ] Cifras muy grandes se formatean bien (`1,5 mil`, `2,3 M`).

### Equilibrio del juego

- [ ] `npm run simulate` da tiempos parecidos a los objetivos: Brock ~3 min, Giovanni ~2–2,5 h.
- [ ] Siempre hay algo que comprar «pronto» (el jugador no se queda 10 minutos esperando).
- [ ] Con las mismas estrellas, un Pokémon más raro o con más stats nunca produce menos.
- [ ] Las mejoras de combate y los niveles se notan: sin ellos el gimnasio 8 no se puede ganar.
- [ ] Apuntar aquí los cambios de números en `config/` y por qué.

| Fecha      | Qué número cambia                                              | De → a                              | Por qué                                                                                                                                                                                                                                                                                                        |
| ---------- | -------------------------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 08/10/2026 | Umbrales de rareza (`rarities.js`)                             | 300/450 → 400/500                   | Con 300/450 salían 59 épicas y 19 comunes; con 400/500, 69 comunes, 49 raras y 28 épicas                                                                                                                                                                                                                       |
| 08/10/2026 | Ninguno (revisión de la fase 6)                                | —                                   | `npm run simulate` (5 semillas): Brock ~2 min, Giovanni ~2 h, 5/5 partidas completas. El equipo llega a su tope enseguida en los primeros gimnasios (2 s de 30 contra Brock) pero no en los últimos (43 s de 45 contra Giovanni): su ataque sí importa donde hace falta                                        |
| 09/10/2026 | Vida de los gimnasios (`gyms.js`); sin `TEAM_DAMAGE_CAP`       | 700…16.000 → 4.500…100.000          | Se quita el tope del equipo y se añaden niveles por Pokémon y Poder del equipo. Sin cambiar la vida, la región se pasaba en 19 min. Con la nueva, `npm run simulate`: Brock ~2 min, Giovanni ~1 h 55 min, 5/5 partidas; el equipo hace >90 % del daño y llega a Nv ~34                                         |
| 09/10/2026 | Objetos nuevos (`items.js`)                                    | —                                   | Objetos permanentes (click y producción ×2 y ×3) y potenciadores. `npm run simulate` comprando objetos (sin potenciadores): Giovanni pasa de ~1 h 55 min a ~1 h 41 min y la producción final de ~500 a ~960 monedas/s. Los primeros gimnasios no cambian                                                       |
| 09/10/2026 | Tres gachas (`gacha.js`): `BANNERS` en vez de `RARITY_WEIGHTS` | 1 gacha → 3                         | Básico 25 (+7 %), Épico 1.000 (+10 %), Legendario 25.000 (+15 %). `npm run simulate`: Brock ~3 min, Giovanni ~1 h 52 min (antes ~1 h 41 min), 5/5 partidas; 103 tiradas al básico, 34 al épico y 1 al legendario. El jugador simulado compra siempre lo más barato y por eso casi no ahorra para el legendario |
| 09/10/2026 | Precio inicial del Épico y del Legendario (`gacha.js`)         | 1.000 → 100.000; 25.000 → 1.000.000 | Decisión de diseño: que sean objetivos caros. `npm run simulate`: Brock ~3 min, Giovanni ~2 h 42 min (antes ~1 h 52 min), 5/5 partidas; el jugador simulado no llega a tirar del Épico ni del Legendario en toda la región (108 tiradas al básico) y acaba con ~490 monedas/s                                  |

---

## 5. Tests automáticos mínimos

Prioridad alta (lógica pura, fáciles de probar con Vitest):

- [ ] `models/pokemon.test.js` → `toPokemon()` con una respuesta real de ejemplo y con sprites vacíos.
- [ ] `config/pokedex.test.js` → 151 entradas sin huecos y el reparto de rarezas esperado.
- [ ] `game/gacha.test.js` → precio de cada gacha, solo sus rarezas, nuevo / estrella / devolución, auto-equipar, `rng` fijo y proporciones de rareza de cada gacha.
- [ ] `game/team.test.js` → límite de 6, sin repetidos, sustituir, equipo automático por dinero y por daño (ventaja de tipo, sin gimnasio, ya era el mejor).
- [ ] `game/shop.test.js` → bloqueada, máximo, coste creciente, sin dinero.
- [ ] `game/battle.test.js` → duración, daño, ventaja de tipo, nivel y Poder del equipo, el equipo gana solo sin pasarse de la vida, solo el gimnasio actual.
- [ ] `game/items.test.js` → objetos bloqueados, comprados y multiplicándose; precio de los potenciadores, sumar tiempo, tope de 1 h y el incienso solo en los segundos que le quedan.
- [ ] `game/levels.test.js` → nivel 1 por defecto, precio creciente, sin dinero o al máximo no sube, también en la caja.
- [ ] `game/production.test.js` y `game/trainer.test.js` → producción del equipo, estrellas, bonus y subida de nivel.
- [ ] `store/gameReducer.test.js` → `CLICK`, `TICK`, `PULL`, `BUY_UPGRADE`, `EQUIP`, `UNEQUIP`, `AUTO_EQUIP`, `GYM_WON`, `POKEMON_LOADED`, `LEVEL_UP`, `BUY_ITEM`, `BUY_BOOST`, `RESET`, acción desconocida.
- [ ] `utils/format.test.js` → `formatName` y `formatNumber` (0, 999, 1500, 2 300 000).

Prioridad media (React Testing Library):

- [ ] `PokemonCard` muestra nombre, número, tipos, rareza, estrellas e imagen.
- [ ] `UpgradeCard`: los tres estados y el botón deshabilitado sin monedas.
- [ ] `GachaPage`: tirar con `rng` fijo y `fetch` simulado muestra el resultado.
- [ ] `BattlePage` con temporizadores falsos: ganar, perder y que mantener Enter no ataque.
- [ ] `useOwnedPokemon` carga los que faltan, y da `error` si falla la API (con `fetch` simulado).

> Los tests nunca llaman a la PokeAPI real: se simula `fetch` con datos de ejemplo guardados en `src/__mocks__/`.

---

## 6. Accesibilidad

- [ ] El botón principal es un `<button>`, no un `<div>` con `onClick`.
- [ ] Todas las imágenes tienen `alt` (`alt="Pikachu"`).
- [ ] Se puede jugar entero con teclado (Tab, Enter, Espacio) y se ve el foco.
- [ ] El contraste de texto sobre los colores de tipo es suficiente (mínimo 4.5:1).
- [ ] El estado de una mejora o de un gimnasio y la rareza de un Pokémon no se indican **solo** con color (añadir texto o icono).
- [ ] Las estrellas tienen texto para lectores de pantalla («3 de 5 estrellas»).
- [ ] El combate se puede jugar con teclado, y su resultado se anuncia con `aria-live` (la vida en cada tick, no).
- [ ] Los modales (`<dialog>`) se cierran con Escape y devuelven el foco al botón que los abrió.
- [ ] El contador de monedas no se anuncia en cada tick al lector de pantalla (evitar `aria-live` en él).
- [ ] Se respeta `prefers-reduced-motion` en las animaciones.
- [ ] Lighthouse → Accesibilidad ≥ 90.

---

## 7. Rendimiento

- [ ] Imágenes con `loading="lazy"` y `width`/`height` fijados.
- [ ] Las tarjetas no se re-renderizan todas en cada tick (comprobar con React DevTools → Profiler; usar `React.memo` si hace falta).
- [ ] El tick del juego es uno solo para toda la app, no uno por tarjeta. El temporizador del combate es aparte y se limpia al salir.
- [ ] El guardado automático no se hace en cada tick, sino cada X segundos.
- [ ] Lighthouse → Rendimiento ≥ 90 en `npm run preview` (no en `dev`).

---

## 8. Diseño y responsive

- [ ] Se ve bien a 360 px, 768 px y 1440 px de ancho.
- [ ] Sin scroll horizontal en móvil.
- [ ] Los colores salen de `styles/tokens.css`, no escritos a mano en cada componente.
- [ ] Los colores de tipo salen de `config/types.js`.
- [ ] Coincide con el diseño de Figma (si lo hay).
- [ ] Probado en Chrome, Firefox y un móvil real.

---

## 9. Antes de cada Pull Request

- [ ] `npm run check` pasa sin errores.
- [ ] He probado a mano lo que he cambiado.
- [ ] No he dejado código comentado ni `console.log`.
- [ ] Si he cambiado la estructura del guardado, he subido `saveVersion`.
- [ ] Si he cambiado la economía, lo he apuntado en la sección de equilibrio.
- [ ] El título del PR explica qué hace, no cómo.

---

## 10. Antes de desplegar

- [ ] `npm run build` y `npm run preview` funcionan.
- [ ] `base` configurado en `vite.config.js` si se sube a GitHub Pages (`base: '/pokeclicker/'`).
- [ ] Favicon y `<title>` correctos.
- [ ] README con captura, enlace a la demo y tecnologías usadas.
- [ ] Mención a la PokeAPI y aviso de que Pokémon es marca de Nintendo / Game Freak y el proyecto no es oficial.
- [ ] Lighthouse pasado sobre la versión desplegada.

---

## 11. Registro de bugs

| Fecha | Descripción | Cómo reproducirlo | Estado |
| ----- | ----------- | ----------------- | ------ |
|       |             |                   |        |
