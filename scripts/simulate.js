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
// - reta al gimnasio en cuanto puede ganarlo;
// - al ganar los 8, viaja a la siguiente región llevándose al que más produce.
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
import { BANNERS } from '../src/config/gacha';
import { pokedexEntry } from '../src/config/pokedex';
import { RARITIES } from '../src/config/rarities';
import { canPull, pullPrice, rollPokemon, totalPulls } from '../src/game/gacha';
import { itemStatus } from '../src/game/items';
import { isMaxLevel, levelUpCost, pokemonLevel } from '../src/game/levels';
import { pokemonProduction, teamProduction } from '../src/game/production';
import { canChangeGeneration, regionOf } from '../src/game/prestige';
import { nextUpgradeCost, upgradeStatus } from '../src/game/shop';
import { gameReducer } from '../src/store/gameReducer';
import { initialState } from '../src/store/initialState';
import { seededRng } from '../src/__mocks__/gameState';

const SEEDS = [1, 2, 3, 4, 5];
const MAX_SECONDS = 10 * 3600;
const IDLE_CLICKS_PER_SECOND = 1;

function play(seed) {
  const rng = seededRng(seed);
  let state = structuredClone(initialState);
  const dispatch = (action) => (state = gameReducer(state, action));
  // Una entrada por región: sus gimnasios y cómo acaba la partida en ella.
  const regions = [{ generation: 1, gyms: [], start: 0 }];
  const region = () => regions.at(-1);
  const bestByProduction = () =>
    Object.keys(state.collection)
      .map(Number)
      .sort(
        (a, b) => pokemonProduction(state, b) - pokemonProduction(state, a),
      );

  for (let t = 1; t <= MAX_SECONDS; t++) {
    dispatch({ type: 'TICK', seconds: 1 });
    for (let c = 0; c < IDLE_CLICKS_PER_SECOND; c++)
      dispatch({ type: 'CLICK' });

    const gym = currentGym(state);
    if (!gym) {
      region().state = state;
      if (!canChangeGeneration(state)) break;
      dispatch({ type: 'CHANGE_GENERATION', keepId: bestByProduction()[0] });
      regions.push({ generation: state.generation, gyms: [], start: t });
      continue;
    }
    const seconds = battleDuration(state);
    const fromTeam = teamDps(state, gym) * seconds;
    const fromClicks =
      clickDamage(state) * EXPECTED_CLICKS_PER_SECOND * seconds;
    if (fromClicks + fromTeam >= gym.hp) {
      region().gyms.push({
        leader: gym.leader,
        minute: (t - region().start) / 60,
        // Parte de la vida del líder que quita el equipo (como mucho, toda).
        teamShare: Math.min(1, fromTeam / gym.hp),
        levels: state.team.map((id) => pokemonLevel(state, id)),
      });
      dispatch({ type: 'GYM_WON', number: gym.number });
    }

    for (let k = 0; k < 20; k++) {
      const options = [];
      for (const banner of Object.keys(BANNERS)) {
        if (canPull({ ...state, coins: Infinity }, banner)) {
          options.push({
            cost: pullPrice(state, banner),
            action: {
              type: 'PULL',
              banner,
              id: rollPokemon(state.generation, banner, rng),
            },
          });
        }
      }
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

      const best = bestByProduction().slice(0, 6);
      for (const id of state.team)
        if (!best.includes(id)) dispatch({ type: 'UNEQUIP', id });
      for (const id of best) dispatch({ type: 'EQUIP', id });
    }
  }
  region().state ??= state;
  return regions;
}

const fmtMin = (m) =>
  m < 60
    ? `${Math.round(m)} min`
    : `${Math.floor(m / 60)} h ${Math.round(m % 60)} min`;
const avg = (list) => list.reduce((a, b) => a + b, 0) / list.length;
const pct = (n) => `${Math.round(n * 100)} %`;

function report(regions) {
  const { generation } = regions[0];
  const leaders = regions[0].gyms.map((g) => g.leader);

  console.log(`\n${regionOf(generation)} (generación ${generation})\n`);
  console.log(
    'Gimnasio      Tiempo en la región   Daño del equipo   Nivel medio del equipo',
  );
  leaders.forEach((leader, i) => {
    const done = regions.filter((r) => r.gyms[i]);
    const minute = avg(done.map((r) => r.gyms[i].minute));
    const share = avg(done.map((r) => r.gyms[i].teamShare));
    const level = avg(done.map((r) => avg(r.gyms[i].levels)));
    console.log(
      `${leader.padEnd(13)} ${fmtMin(minute).padEnd(21)} ${pct(share).padEnd(17)} ${level.toFixed(1)}` +
        (done.length < regions.length
          ? `  (solo ${done.length}/${regions.length} partidas)`
          : ''),
    );
  });
  const finished = regions.filter((r) => r.gyms.length === 8).length;
  console.log(
    `\nPartidas que ganan los 8 gimnasios: ${finished}/${regions.length}`,
  );
  const end = regions.map((r) => r.state);
  console.log(
    `Al final: nivel ${avg(end.map((s) => s.trainer.level)).toFixed(1)}, ` +
      `${Math.round(avg(end.map(totalPulls)))} tiradas, ` +
      `${Math.round(avg(end.map((s) => Object.keys(s.collection).length)))} Pokémon, ` +
      `${Math.round(avg(end.map(teamProduction)))} monedas/s`,
  );
  const rarities = (s) =>
    Object.keys(s.collection).map((id) => pokedexEntry(id).rarity);
  console.log(
    'Tiradas por gacha: ' +
      Object.entries(BANNERS)
        .map(
          ([key, { label }]) =>
            `${label} ${Math.round(avg(end.map((s) => s.pulls[key])))}`,
        )
        .join(' · '),
  );
  console.log(
    'Pokémon por rareza: ' +
      Object.entries(RARITIES)
        .map(
          ([key, { label }]) =>
            `${label} ${avg(end.map((s) => rarities(s).filter((x) => x === key).length)).toFixed(1)}`,
        )
        .join(' · '),
  );
}

test('simulación de las regiones', () => {
  const runs = SEEDS.map(play);
  console.log(`\nSimulación con ${SEEDS.length} semillas (media)`);
  const generations = [...new Set(runs.flat().map((r) => r.generation))];
  for (const generation of generations) {
    report(runs.flatMap((r) => r.filter((g) => g.generation === generation)));
  }
  console.log('');
}, 600_000);
