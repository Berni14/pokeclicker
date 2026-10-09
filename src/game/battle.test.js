import { describe, it, expect } from 'vitest';
import {
  applyGymWin,
  battleDuration,
  battleReducer,
  clicksPerSecondNeeded,
  createBattle,
  clickDamage,
  currentGym,
  gymStatus,
  hasTypeAdvantage,
  pokemonDps,
  teamDps,
} from './battle';
import { GYMS } from '../config/gyms';
import { pokedexEntry } from '../config/pokedex';
import { makeState } from '../__mocks__/gameState';

const [BROCK, MISTY, , , , , BLAINE] = GYMS[1];

describe('duración y daño de click', () => {
  it('30 s base, +5 s por nivel de Cronómetro', () => {
    expect(battleDuration(makeState())).toBe(30);
    expect(battleDuration(makeState({ upgrades: { battleTime: 2 } }))).toBe(40);
  });

  it('el click hace el poder de click × Ataque en combate', () => {
    expect(clickDamage(makeState())).toBe(1);
    const state = makeState({ upgrades: { clickPower: 3, battleDamage: 5 } });
    expect(clickDamage(state)).toBe(8);
  });
});

describe('ventaja de tipo', () => {
  it('agua contra fuego sí; agua contra agua no', () => {
    const squirtle = pokedexEntry(7);
    expect(hasTypeAdvantage(squirtle, BLAINE)).toBe(true);
    expect(hasTypeAdvantage(squirtle, MISTY)).toBe(false);
  });

  it('basta con uno de los dos tipos', () => {
    expect(hasTypeAdvantage(pokedexEntry(1), BROCK)).toBe(true); // planta/veneno
  });
});

describe('daño del equipo', () => {
  it('ataque / 5, por estrellas y por ventaja de tipo', () => {
    const state = makeState({ collection: { 7: 1 }, team: [7] });
    expect(pokemonDps(state, 7, MISTY)).toBeCloseTo(9.6);
    expect(pokemonDps(state, 7, BLAINE)).toBeCloseTo(14.4);
    const threeStars = makeState({ collection: { 7: 3 }, team: [7] });
    expect(pokemonDps(threeStars, 7, MISTY)).toBeCloseTo(19.2);
  });

  it('solo cuenta el equipo, no la caja', () => {
    const state = makeState({ collection: { 7: 1, 150: 1 }, team: [7] });
    expect(teamDps(state, MISTY)).toBeCloseTo(9.6);
  });

  it('cada nivel por encima de 1 suma un 10 % de daño', () => {
    const state = makeState({ collection: { 7: 1 }, levels: { 7: 11 } });
    expect(pokemonDps(state, 7, MISTY)).toBeCloseTo(19.2);
  });

  it('Poder del equipo suma un 25 % por nivel', () => {
    const state = makeState({
      collection: { 7: 1 },
      upgrades: { teamPower: 2 },
    });
    expect(pokemonDps(state, 7, MISTY)).toBeCloseTo(14.4);
  });
});

describe('gimnasios', () => {
  it('al empezar, el actual es Brock y el resto están bloqueados', () => {
    const state = makeState();
    expect(currentGym(state)).toBe(BROCK);
    expect(gymStatus(state, 1)).toBe('current');
    expect(gymStatus(state, 2)).toBe('locked');
  });

  it('ganar da medalla, monedas y experiencia, y desbloquea el siguiente', () => {
    const next = applyGymWin(makeState(), 1);
    expect(next.medals).toEqual({ 1: [1] });
    expect(next.coins).toBe(2250);
    expect(next.trainer.xp).toBe(50);
    expect(gymStatus(next, 1)).toBe('won');
    expect(currentGym(next)).toBe(MISTY);
  });

  it('no se puede ganar un gimnasio bloqueado ni repetir uno vencido', () => {
    const state = makeState();
    expect(applyGymWin(state, 2)).toBe(state);
    const won = applyGymWin(state, 1);
    expect(applyGymWin(won, 1)).toBe(won);
  });

  it('con las 8 medallas no queda gimnasio actual', () => {
    const state = makeState({ medals: { 1: [1, 2, 3, 4, 5, 6, 7, 8] } });
    expect(currentGym(state)).toBeNull();
  });
});

describe('clicksPerSecondNeeded', () => {
  it('sin equipo, toda la vida sale de los clicks', () => {
    // Brock: 4500 de vida, 30 s, 1 de daño por click → 150 clicks/s.
    expect(clicksPerSecondNeeded(makeState(), BROCK)).toBeCloseTo(150);
  });

  it('todo el daño del equipo cuenta, sin tope', () => {
    const strong = makeState({ collection: { 150: 5 }, team: [150] });
    // Mewtwo 5★: 66 de daño/s × 30 s = 1980. Quedan 2520 → 84 clicks/s.
    expect(clicksPerSecondNeeded(strong, BROCK)).toBeCloseTo(84);
  });

  it('un equipo fuerte gana sin clicks', () => {
    const strong = makeState({
      collection: { 150: 5 },
      levels: { 150: 11 },
      team: [150],
    });
    // 132 de daño/s × 30 s = 3960: le faltan 540 → 18 clicks/s.
    expect(clicksPerSecondNeeded(strong, BROCK)).toBeCloseTo(18);
    const stronger = makeState({
      collection: { 150: 5 },
      levels: { 150: 21 },
      team: [150],
    });
    expect(clicksPerSecondNeeded(stronger, BROCK)).toBeLessThanOrEqual(0);
  });
});

describe('battleReducer', () => {
  // Squirtle 1★ contra Brock: 9,6 × 1,5 (ventaja) = 14,4 de daño/s.
  const state = makeState({
    collection: { 7: 1 },
    team: [7],
    upgrades: { clickPower: 9 },
  });
  const start = () =>
    battleReducer(createBattle(state, BROCK), { type: 'START' });

  it('guarda los números del jugador al empezar', () => {
    const battle = createBattle(state, BROCK);
    expect(battle).toMatchObject({
      hp: 4500,
      timeLeft: 30,
      clickDamage: 10,
      status: 'ready',
    });
    expect(battle.teamDps).toBeCloseTo(14.4);
  });

  it('antes de empezar ni los clicks ni el tiempo hacen nada', () => {
    const ready = createBattle(state, BROCK);
    expect(battleReducer(ready, { type: 'ATTACK' })).toBe(ready);
    expect(battleReducer(ready, { type: 'TICK', seconds: 5 })).toBe(ready);
  });

  it('cada click quita su daño y a 0 de vida se gana', () => {
    let battle = start();
    battle = battleReducer(battle, { type: 'ATTACK' });
    expect(battle.hp).toBe(4490);
    for (let i = 0; i < 449; i++)
      battle = battleReducer(battle, { type: 'ATTACK' });
    expect(battle).toMatchObject({ hp: 0, status: 'won' });
    // Ganado: ya no cambia nada.
    expect(battleReducer(battle, { type: 'ATTACK' })).toBe(battle);
  });

  it('el equipo daña con el tiempo', () => {
    let battle = start();
    battle = battleReducer(battle, { type: 'TICK', seconds: 10 });
    expect(battle.hp).toBeCloseTo(4500 - 144);
    expect(battle.timeLeft).toBeCloseTo(20);
    expect(battle.status).toBe('fighting');
  });

  it('el equipo puede ganar solo, sin pasarse de la vida', () => {
    const strong = makeState({
      collection: { 150: 5 },
      levels: { 150: 21 },
      team: [150],
    });
    let battle = battleReducer(createBattle(strong, BROCK), { type: 'START' });
    battle = battleReducer(battle, { type: 'TICK', seconds: 30 });
    expect(battle).toMatchObject({ hp: 0, teamDamage: 4500, status: 'won' });
  });

  it('si se acaba el tiempo con vida, se pierde', () => {
    let battle = start();
    battle = battleReducer(battle, { type: 'TICK', seconds: 31 });
    expect(battle).toMatchObject({ timeLeft: 0, status: 'lost' });
  });

  it('reintentar vuelve a la vida y el tiempo del principio', () => {
    let battle = battleReducer(start(), { type: 'TICK', seconds: 31 });
    battle = battleReducer(battle, { type: 'RETRY' });
    expect(battle).toMatchObject({
      hp: 4500,
      timeLeft: 30,
      teamDamage: 0,
      status: 'ready',
    });
  });
});
