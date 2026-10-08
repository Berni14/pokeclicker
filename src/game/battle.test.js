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
  maxTeamDamage,
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

  it('el equipo hace como mucho la mitad de la vida', () => {
    expect(maxTeamDamage(BROCK)).toBe(350);
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
    expect(next.coins).toBe(350);
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
    // Brock: 700 de vida, 30 s, 1 de daño por click → 23,3 clicks/s.
    expect(clicksPerSecondNeeded(makeState(), BROCK)).toBeCloseTo(700 / 30);
  });

  it('el equipo ayuda, pero como mucho con la mitad', () => {
    const strong = makeState({ collection: { 150: 5 }, team: [150] });
    // Mewtwo 5★ haría 66 de daño/s × 30 s, pero el tope es 350.
    expect(clicksPerSecondNeeded(strong, BROCK)).toBeCloseTo(350 / 30);
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
      hp: 700,
      timeLeft: 30,
      clickDamage: 10,
      teamCap: 350,
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
    expect(battle.hp).toBe(690);
    for (let i = 0; i < 69; i++)
      battle = battleReducer(battle, { type: 'ATTACK' });
    expect(battle).toMatchObject({ hp: 0, status: 'won' });
    // Ganado: ya no cambia nada.
    expect(battleReducer(battle, { type: 'ATTACK' })).toBe(battle);
  });

  it('el equipo daña con el tiempo, sin pasar del tope', () => {
    let battle = start();
    battle = battleReducer(battle, { type: 'TICK', seconds: 10 });
    expect(battle.hp).toBeCloseTo(700 - 144);
    expect(battle.timeLeft).toBeCloseTo(20);
    battle = battleReducer(battle, { type: 'TICK', seconds: 19 });
    expect(battle.teamDamage).toBe(350); // tope: la mitad de la vida
    expect(battle.hp).toBe(350);
    expect(battle.status).toBe('fighting');
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
      hp: 700,
      timeLeft: 30,
      teamDamage: 0,
      status: 'ready',
    });
  });
});
