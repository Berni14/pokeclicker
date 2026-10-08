// Juega una región entera con las funciones reales de game/ y config/ y saca
// cuánto se tarda en cada gimnasio. Sirve para equilibrar: si cambias un número
// de config/, vuelve a ejecutarlo con `npm run simulate`.
//
// Se ejecuta con Vitest (vitest.simulate.config.js) porque el código del juego
// usa imports sin extensión y JSON, que Node no entiende solo.
//
// El jugador simulado:
// - hace 1 click/s fuera de combate y 6 clicks/s en combate;
// - compra siempre lo más barato (tirada o mejora);
// - equipa a los 6 que más producen;
// - reta al gimnasio en cuanto puede ganarlo.
import { test } from 'vitest';
import { EXPECTED_CLICKS_PER_SECOND } from '../src/config/gyms';
import { UPGRADES } from '../src/config/upgrades';
import {
  battleDuration,
  clickDamage,
  currentGym,
  maxTeamDamage,
  teamDps,
} from '../src/game/battle';
import { pullPrice, rollPokemon } from '../src/game/gacha';
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
    const dps = teamDps(state, gym);
    const fromTeam = Math.min(dps * seconds, maxTeamDamage(gym));
    const fromClicks =
      clickDamage(state) * EXPECTED_CLICKS_PER_SECOND * seconds;
    if (fromClicks + fromTeam >= gym.hp) {
      gyms.push({
        leader: gym.leader,
        minute: t / 60,
        // Segundos de combate hasta que el equipo llega a su tope.
        teamCapAt: dps > 0 ? maxTeamDamage(gym) / dps : Infinity,
        seconds,
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

test('simulación de una región', () => {
  const runs = SEEDS.map(play);
  const leaders = runs[0].gyms.map((g) => g.leader);

  console.log(`\nSimulación con ${SEEDS.length} semillas (media):\n`);
  console.log('Gimnasio      Tiempo de juego   Equipo en su tope a los');
  leaders.forEach((leader, i) => {
    const done = runs.filter((r) => r.gyms[i]);
    const minute = avg(done.map((r) => r.gyms[i].minute));
    const capAt = avg(done.map((r) => r.gyms[i].teamCapAt));
    const of = done[0].gyms[i].seconds;
    console.log(
      `${leader.padEnd(13)} ${fmtMin(minute).padEnd(17)} ${capAt.toFixed(0)} s de ${of} s` +
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
