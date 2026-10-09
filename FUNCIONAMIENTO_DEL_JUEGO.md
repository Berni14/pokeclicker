# Pokémon Clicker · Funcionamiento del juego

Documento de diseño del juego (qué hace y cómo funciona). Para la parte técnica, ver `RUTA.md` y `CONTROL_DE_CALIDAD.md`.

> **Leyenda:** ✅ decidido · 💡 propuesta pendiente de confirmar · ❓ por definir
>
> Los números concretos (precios, probabilidades, vida de los líderes…) están en `RUTA.md` y viven en `src/config/`. Son un punto de partida: se ajustan jugando.

---

## 1. Concepto

Clicker incremental de Pokémon. Empiezas en la **primera generación**, haces click para ganar dinero y lo inviertes en **mejorarte** o en **tirar del gacha** para conseguir Pokémon que generan dinero solos. Para pasar a la siguiente generación tienes que **vencer a los 8 líderes de gimnasio** de la región.

Los datos de los Pokémon (nombre, imagen, tipos, estadísticas) vienen de la [PokeAPI](https://pokeapi.co).

### Alcance de cada versión

- ✅ **v1.0:** la primera generación completa: click, tienda, gacha, equipo, caja y los 8 gimnasios.
- ✅ **v1.1:** cambio de generación (de la 1 a la 2).
- ❓ Qué pasa al terminar la última generación: se decide cuando haya varias.

---

## 2. Bucle principal

1. Haces **click** → ganas dinero.
2. Gastas el dinero en:
   - **Tienda** → mejoras de la generación actual.
   - **Gacha** → un Pokémon aleatorio de la generación actual.
3. Tus Pokémon **equipados** producen dinero automáticamente (autoclicker).
4. Cuando eres lo bastante fuerte, retas a los **gimnasios**.
5. Al vencer a los 8 líderes, **pasas de generación** y el ciclo vuelve a empezar, más rápido gracias al bonus de tu nivel de entrenador y al Pokémon que te llevas.

---

## 3. Dinero y click

- ✅ Cada click da dinero según tu **poder de click**.
- ✅ Las mejoras de la tienda aumentan el poder de click y la producción.
- ✅ El nivel de entrenador multiplica **todo** el dinero que ganas (clicks y producción).
- ✅ El dinero se **reinicia a 0** al cambiar de generación.

---

## 4. Nivel de entrenador

- ✅ Tu nivel de entrenador **desbloquea objetos** (mejoras) en la tienda.
- ✅ Cada nivel da un **bonus permanente de dinero** (+5 % por nivel). Es lo que hace que cada generación vaya más rápido que la anterior.
- ✅ El nivel **se mantiene** al cambiar de generación. Es la progresión permanente del juego.
- ✅ La experiencia se gana con **tiradas del gacha** y **gimnasios vencidos**, no con clicks: así no se sube de nivel con un autoclicker.
- ✅ Un repetido de un Pokémon que ya tiene 5 estrellas también da experiencia.

---

## 5. Tienda (mejoras de la generación)

- ✅ Las mejoras duran **mientras estés en la generación**.
- ✅ Al cambiar de generación **todas las mejoras vuelven a 0**.
- ✅ Algunas mejoras están **bloqueadas** hasta alcanzar cierto nivel de entrenador.
- ✅ Cada mejora tiene varios niveles (por ejemplo, Nv 1/5) y cada nivel cuesta más que el anterior.
- ✅ Lista de mejoras de la v1.0:

| Mejora               | Qué hace                                   | Desbloqueo |
| -------------------- | ------------------------------------------ | ---------- |
| Poder de click       | Más dinero y más daño por click            | Nivel 1    |
| Entrenamiento        | Multiplica la producción de todo el equipo | Nivel 2    |
| Ataque en combate    | Más daño de tus clicks en los gimnasios    | Nivel 3    |
| Poder del equipo     | Más daño de tu equipo en los gimnasios     | Nivel 3    |
| Cronómetro           | Más tiempo en los combates                 | Nivel 4    |
| Descuento en tiradas | Tiradas del gacha más baratas              | Nivel 5    |

Estados de una mejora en la interfaz: **Disponible**, **Máximo** y **Bloqueada** (y, dentro de Disponible, si te llega el dinero o no).

### Objetos

Multiplican **solo el dinero** (clicks o producción), no el daño en combate.

- ✅ **Permanentes:** se compran una vez y duran toda la generación. Se multiplican entre sí.

| Objeto         | Qué hace            | Precio  | Desbloqueo |
| -------------- | ------------------- | ------- | ---------- |
| Garra Rápida   | Dinero por click ×2 | 3.000   | Nivel 2    |
| Amuleto Moneda | Producción ×2       | 20.000  | Nivel 3    |
| Cinta Elección | Dinero por click ×3 | 250.000 | Nivel 5    |
| Restos         | Producción ×3       | 600.000 | Nivel 6    |

- ✅ **Potenciadores:** de un solo uso, con un efecto fuerte durante un rato. Su precio son unos segundos de lo que ganas en ese momento, así que nunca se quedan baratos ni imposibles. Comprar otro mientras dura **suma el tiempo** (como mucho 1 h acumulada). El tiempo corre también mientras no juegas.

| Potenciador    | Qué hace                         | Precio                     | Desbloqueo |
| -------------- | -------------------------------- | -------------------------- | ---------- |
| Ataque X       | Dinero por click ×5 durante 60 s | 60 s clicando a 5 clicks/s | Nivel 1    |
| Incienso Duplo | Producción ×2 durante 10 min     | 4 min de producción        | Nivel 2    |

---

## 6. Gacha

- ✅ Cada tirada da un **Pokémon aleatorio de la generación actual**.
- ✅ Cada Pokémon tiene un **valor distinto**: según sus estadísticas y su rareza, produce más o menos.
- ✅ Si te sale un Pokémon **repetido**, sube de **estrellas** y produce más. Máximo **5 estrellas**.
- ✅ Un repetido con 5 estrellas se convierte en **dinero y experiencia**.
- ✅ Rareza calculada a partir de la PokeAPI: legendario o singular según `pokemon-species` (`is_legendary`, `is_mythical`); el resto, según la suma de sus estadísticas. **No** se usa `base_experience`: no refleja la rareza (Chansey tiene más que Mewtwo).
- ✅ Cinco rarezas: **común, rara, épica, legendaria y singular** (singular es Mew: aún más rara que los legendarios).
- ✅ Probabilidad por rareza: los comunes salen mucho y los legendarios y singulares muy poco. Primero se sortea la rareza y después un Pokémon de esa rareza.
- ✅ El precio de la tirada **sube un poco con cada tirada** y vuelve al precio inicial al cambiar de generación.
- ✅ Si tienes un hueco libre en el equipo, el Pokémon nuevo se equipa solo.

---

## 7. Equipo y caja

- ✅ Puedes tener **6 Pokémon equipados** a la vez.
- ✅ Todos los Pokémon que consigues se guardan en la **caja**.
- ✅ Desde la caja puedes equipar a cualquiera o cambiarlo por uno del equipo.
- ✅ Solo los **6 equipados** producen dinero y combaten; los de la caja no.
- ✅ Un Pokémon de la caja también sube de estrellas si te sale repetido.
- ✅ La caja tiene una pestaña de **Pokédex de la generación** con los que te faltan en silueta.
- ✅ Filtros por tipo y rareza, y orden por producción.
- ✅ **Equipo automático**: un botón pone los 6 que **más dinero** producen y otro los 6 que **más daño** hacen contra el gimnasio actual (contando la ventaja de tipo, estrellas y nivel). Si ya tienes ese equipo, el botón sale marcado con ✓.

### Niveles de los Pokémon

- ✅ Cada Pokémon tiene un **nivel**, del 1 al **100**. Empieza en el 1.
- ✅ Se sube **con monedas**, desde la caja o desde el equipo de la pantalla principal. También se puede subir a los de la caja.
- ✅ Cada nivel por encima de 1 suma un **10 %** de producción **y** de daño en combate (Nv 11 = el doble).
- ✅ El precio depende de lo que produce el Pokémon: subir a un legendario cuesta más que a un común. Cada nivel cuesta un **15 %** más que el anterior.
- ✅ Estrellas y nivel se multiplican: un 5★ al Nv 11 produce y pega ×6.

---

## 8. Gimnasios

- ✅ Hay **8 gimnasios** por región. En la primera generación: Brock (roca), Misty (agua), Lt. Surge (eléctrico), Erika (planta), Koga (veneno), Sabrina (psíquico), Blaine (fuego) y Giovanni (tierra).
- ✅ Cada combate dura **un tiempo fijo**: tienes que quitarle toda la vida al líder antes de que acabe.
- ✅ El combate dura **30 segundos**, ampliables con la mejora Cronómetro.
- ✅ En el combate cuentan **tus clicks y el daño de tus Pokémon** equipados.
- ✅ El daño de tus Pokémon sale de su estadística de **ataque**, sus estrellas, su **nivel** y la mejora **Poder del equipo**, no de su producción: así un Pokémon puede ser bueno para ganar dinero, para combatir o para las dos cosas.
- ✅ El equipo **no tiene tope de daño**: es lo que más pega. Un equipo bien subido puede ganar solo; si no llega, tus clicks ponen lo que falta.
- ✅ **Ventajas de tipo:** un Pokémon cuyo tipo es fuerte contra el del líder hace ×1,5 de daño (agua contra fuego…).
- ✅ Los gimnasios se desbloquean **en orden** (del 1 al 8).
- ✅ Cada gimnasio tiene más vida que el anterior.
- ✅ Si pierdes, puedes **reintentar al momento**, sin coste.
- ✅ Recompensa por ganar: **medalla, experiencia y dinero**. La medalla desbloquea el siguiente gimnasio.

---

## 9. Cambio de generación (v1.1)

Al vencer al octavo líder puedes pasar a la siguiente región.

- ✅ Eliges **1 solo Pokémon** para llevarte contigo, y **conserva sus estrellas y su nivel**.
- ✅ El **dinero** se reinicia a 0.
- ✅ Las **mejoras** de la tienda se reinician a 0, y se pierden los **objetos** y los potenciadores activos.
- ✅ El precio de la tirada vuelve al inicial.
- ✅ El **nivel de entrenador** se mantiene.
- ✅ El resto de la caja se pierde, y el gacha pasa a dar Pokémon de la nueva generación.
- ✅ Las **medallas** se quedan como colección; los gimnasios de la nueva región empiezan de cero.

| Al cambiar de gen    | Se mantiene                   | Se reinicia                  |
| -------------------- | ----------------------------- | ---------------------------- |
| Dinero               |                               | ✅                           |
| Mejoras de la tienda |                               | ✅                           |
| Precio de la tirada  |                               | ✅                           |
| Nivel de entrenador  | ✅                            |                              |
| Pokémon              | Solo 1 elegido, con estrellas | El resto                     |
| Medallas             | ✅ (colección)                | Gimnasios de la nueva región |

---

## 10. Pantallas

| Pantalla             | Qué muestra                                                                          |
| -------------------- | ------------------------------------------------------------------------------------ |
| Juego principal      | Zona de click, dinero, producción por segundo, nivel de entrenador y los 6 equipados |
| Gacha                | Precio de la tirada, animación y resultado con rareza y estrellas                    |
| Caja                 | Todos tus Pokémon con estrellas, filtros, y pestaña de Pokédex de la generación      |
| Tienda               | Mejoras disponibles, al máximo y bloqueadas por nivel                                |
| Gimnasios            | Los 8 líderes: vencidos, el actual y los bloqueados                                  |
| Combate              | Temporizador, vida del líder, zona de click y daño del equipo                        |
| Cambio de generación | Resumen de la región y elección del Pokémon que te llevas (v1.1)                     |

---

## 11. Datos de la PokeAPI

| Dato                                | De dónde sale                                                                                                 | Uso en el juego                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Nombre, imagen, tipos, estadísticas | `/pokemon/{id}`                                                                                               | Tarjetas, caja, equipo, producción y daño                           |
| Legendario / singular               | `/pokemon-species/{id}`                                                                                       | Rareza                                                              |
| Rareza de toda la generación        | Tabla `config/pokedex-gen1.json`, generada **una vez** con un script a partir de los dos endpoints anteriores | Sortear el gacha sin tener que descargar los 151 Pokémon al empezar |
| Qué Pokémon hay en cada generación  | `config/generations.js` (1–151, 152–251…)                                                                     | Gacha y Pokédex de la generación                                    |
| Silueta de la Pokédex               | La imagen del Pokémon con un filtro CSS                                                                       | Pokémon que te faltan                                               |

No hace falta el endpoint `/generation/{id}`: los números de cada generación son consecutivos.

---

## 12. Cambios respecto al plan técnico inicial

La ruta y la estructura de carpetas se hicieron para un clicker donde se compraban Pokémon concretos. Con este diseño se añade (todo está ya en `RUTA.md`):

- `scripts/build-pokedex.js` y `config/pokedex-gen1.json` → tabla de rarezas para el gacha.
- `game/gacha.js` → tiradas, probabilidades, repetidos y precio.
- `game/team.js` → equipar, desequipar y límite de 6.
- `game/trainer.js` → experiencia, niveles y bonus.
- `game/shop.js` → mejoras, sus niveles y desbloqueos.
- `game/battle.js` → vida de los líderes, daño, tipos y tiempo.
- `game/prestige.js` → cambio de generación y qué se reinicia (v1.1).
- `config/gacha.js`, `config/trainer.js`, `config/gyms.js` y `config/typeChart.js` → los números de cada sistema.
- Pantallas: `GamePage`, `GachaPage`, `BoxPage`, `ShopPage`, `GymsPage` y `BattlePage`, con una barra de navegación por pestañas.
