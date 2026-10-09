// Juega una región entera con las funciones reales de game/ y config/ y saca
// cuánto se tarda en cada gimnasio. Sirve para equilibrar: si cambias un número
// de config/, vuelve a ejecutarlo con `npm run simulate`.
//
// Se ejecuta con Vitest (vitest.simulate.config.js) porque el código del juego
// usa imports sin extensión y JSON, que Node no entiende solo.
//
// El jugador simulado:
// - hace 1 click/s fuera de combate y 6 clicks/s en combate;
// - compra siempre lo más barato (tirada, mejora, objeto o subir de nivel a uno
//   del equipo); los potenciadores no, porque dependen de cuánto juegues;
// - equipa a los 6 que más producen;
// - reta al gimnasio en cuanto puede ganarlo.
import { test } from 'vitest';
import { EXPECTED_CLICKS_PER_SECOND } from '../src/config/gyms';
import { ITEMS } from '../src/config/items';
import { UPGRADES } from '../src/config/upgrades';
import {
  battleDuration,
  clickDamage,
  currentGym,
  teamDps,
} from '../src/game/battle';
import { pullPrice, rollPokemon } from '../src/game/gacha';
import { itemStatus } from '../src/game/items';
import { isMaxLevel, levelUpCost, pokemonLevel } from '../src/game/levels';
import { pokemonProduction, teamProduction } from '../src/game/production';
import { nextUpgradeCost, upgradeStatus } from '../src/game/shop';
import { gameReducer } from '../src/store/gameReducer';
import { initialState } from '../src/store/initialState';
import { seededRng } from '../src/__mocks__/gameState';

const SEEDS = [1, 2, 3, 4, 5];
const MAX_SECONDS = 6 * 3600;
const IDLE_CLICKS_PER_SECOND = 1;

function play(seed) {
  const rng = seededRng(seed);
  let state = structuredClone(initialState);
  const dispatch = (action) => (state = gameReducer(state, action));
  const gyms = [];

  for (let t = 1; t <= MAX_SECONDS; t++) {
    dispatch({ type: 'TICK', seconds: 1 });
    for (let c = 0; c < IDLE_CLICKS_PER_SECOND; c++)
      dispatch({ type: 'CLICK' });

    const gym = currentGym(state);
    if (!gym) break;
    const seconds = battleDuration(state);
    const fromTeam = teamDps(state, gym) * seconds;
    const fromClicks =
      clickDamage(state) * EXPECTED_CLICKS_PER_SECOND * seconds;
    if (fromClicks + fromTeam >= gym.hp) {
      gyms.push({
        leader: gym.leader,
        minute: t / 60,
        // Parte de la vida del líder que quita el equipo (como mucho, toda).
        teamShare: Math.min(1, fromTeam / gym.hp),
        levels: state.team.map((id) => pokemonLevel(state, id)),
      });
      dispatch({ type: 'GYM_WON', number: gym.number });
    }

    for (let k = 0; k < 20; k++) {
      const options = [
        {
          cost: pullPrice(state),
          action: { type: 'PULL', id: rollPokemon(1, rng) },
        },
      ];
      for (const key of Object.keys(UPGRADES)) {
        if (upgradeStatus(state, key) === 'available') {
          options.push({
            cost: nextUpgradeCost(state, key),
            action: { type: 'BUY_UPGRADE', key },
          });
        }
      }
      for (const [key, item] of Object.entries(ITEMS)) {
        if (itemStatus(state, key) === 'available') {
          options.push({ cost: item.cost, action: { type: 'BUY_ITEM', key } });
        }
      }
      for (const id of state.team) {
        if (!isMaxLevel(state, id)) {
          options.push({
            cost: levelUpCost(state, id),
            action: { type: 'LEVEL_UP', id },
          });
        }
      }
      options.sort((a, b) => a.cost - b.cost);
      if (state.coins < options[0].cost) break;
      dispatch(options[0].action);

      const best = Object.keys(state.collection)
        .map(Number)
        .sort(
          (a, b) => pokemonProduction(state, b) - pokemonProduction(state, a),
        )
        .slice(0, 6);
      for (const id of state.team)
        if (!best.includes(id)) dispatch({ type: 'UNEQUIP', id });
      for (const id of best) dispatch({ type: 'EQUIP', id });
    }
  }
  return { gyms, state };
}

const fmtMin = (m) =>
  m < 60
    ? `${Math.round(m)} min`
    : `${Math.floor(m / 60)} h ${Math.round(m % 60)} min`;
const avg = (list) => list.reduce((a, b) => a + b, 0) / list.length;
const pct = (n) => `${Math.round(n * 100)} %`;

test('simulación de una región', () => {
  const runs = SEEDS.map(play);
  const leaders = runs[0].gyms.map((g) => g.leader);

  console.log(`\nSimulación con ${SEEDS.length} semillas (media):\n`);
  console.log(
    'Gimnasio      Tiempo de juego   Daño del equipo   Nivel medio del equipo',
  );
  leaders.forEach((leader, i) => {
    const done = runs.filter((r) => r.gyms[i]);
    const minute = avg(done.map((r) => r.gyms[i].minute));
    const share = avg(done.map((r) => r.gyms[i].teamShare));
    const level = avg(done.map((r) => avg(r.gyms[i].levels)));
    console.log(
      `${leader.padEnd(13)} ${fmtMin(minute).padEnd(17)} ${pct(share).padEnd(17)} ${level.toFixed(1)}` +
        (done.length < runs.length
          ? `  (solo ${done.length}/${runs.length} partidas)`
          : ''),
    );
  });
  const finished = runs.filter((r) => r.gyms.length === 8).length;
  console.log(
    `\nPartidas que ganan los 8 gimnasios: ${finished}/${runs.length}`,
  );
  console.log(
    `Al final: nivel ${avg(runs.map((r) => r.state.trainer.level)).toFixed(1)}, ` +
      `${Math.round(avg(runs.map((r) => r.state.pulls)))} tiradas, ` +
      `${Math.round(avg(runs.map((r) => Object.keys(r.state.collection).length)))} Pokémon, ` +
      `${Math.round(avg(runs.map((r) => teamProduction(r.state))))} monedas/s\n`,
  );
}, 300_000);
