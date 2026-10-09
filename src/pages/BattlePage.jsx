import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { GYM_MONEY_REWARD } from '../config/gyms';
import { XP_PER_GYM } from '../config/trainer';
import { TYPE_NAMES } from '../config/types';
import { battleReducer, createBattle } from '../game/battle';
import { useBattleTimer } from '../hooks/useBattleTimer';
import { pixelSpriteUrl } from '../models/pokemon';
import { useGame } from '../store/GameContext';
import { formatNumber } from '../utils/format';
import styles from './BattlePage.module.css';

const RESULT_TEXT = {
  ready: '',
  fighting: '',
  won: '¡Has ganado!',
  lost: 'Se acabó el tiempo',
};

export function BattlePage({ gym, onExit }) {
  const { state, dispatch } = useGame();
  // Los números del jugador se fijan al entrar (ver createBattle).
  const [battle, battleDispatch] = useReducer(battleReducer, null, () =>
    createBattle(state, gym),
  );

  // Cada golpe cambia la `key` de la imagen: se vuelve a montar y la sacudida
  // empieza de nuevo.
  const [hits, setHits] = useState(0);

  const handleTick = useCallback(
    (seconds) => battleDispatch({ type: 'TICK', seconds }),
    [],
  );
  useBattleTimer(battle.status === 'fighting', handleTick);

  // La victoria se apunta en la partida una sola vez (applyGymWin ignora
  // un gimnasio que ya no es el actual).
  useEffect(() => {
    if (battle.status === 'won')
      dispatch({ type: 'GYM_WON', number: gym.number });
  }, [battle.status, dispatch, gym.number]);

  // El foco siempre en el botón que toca: Empezar/Atacar mientras se combate,
  // Volver o Reintentar al terminar. Así se puede jugar entero con teclado.
  const actionRef = useRef(null);
  const endRef = useRef(null);
  useEffect(() => {
    const fighting = battle.status === 'ready' || battle.status === 'fighting';
    (fighting ? actionRef : endRef).current?.focus();
  }, [battle.status]);

  // Mantener Enter pulsado repite el click del botón: sería un autoclicker.
  function handleKeyDown(event) {
    if (event.key === 'Enter' && event.repeat) event.preventDefault();
  }

  const hp = Math.ceil(battle.hp);
  const seconds = Math.ceil(battle.timeLeft);

  return (
    <div className={styles.page}>
      <div className={styles.top}>
        <button
          type="button"
          className="button button-secondary"
          onClick={onExit}
        >
          ← Gimnasios
        </button>
        <h2 tabIndex={-1} className={styles.title}>
          Gimnasio {gym.number}: {gym.leader}
        </h2>
      </div>

      <section className={styles.arena} data-status={battle.status}>
        <p className={styles.timer} aria-label={`Tiempo: ${seconds} segundos`}>
          {seconds}
          <span aria-hidden="true"> s</span>
        </p>

        <span
          key={hits}
          className={`${styles.leaderWrap} ${hits > 0 ? styles.hit : ''}`}
        >
          <img
            className={styles.leader}
            src={pixelSpriteUrl(gym.ace)}
            alt={`Pokémon de ${gym.leader}`}
            width="160"
            height="160"
          />
        </span>
        <p className={styles.type}>Tipo {TYPE_NAMES[gym.type]}</p>

        <label className={styles.hp}>
          <span>
            Vida: {formatNumber(hp)} / {formatNumber(gym.hp)}
          </span>
          <progress value={battle.hp} max={gym.hp} />
        </label>

        <p className={styles.team}>
          Tu equipo: {formatNumber(battle.teamDps)} de daño/s · Tu click:{' '}
          {formatNumber(battle.clickDamage)}
        </p>

        {/* Un solo botón para empezar y atacar: el foco no se pierde al empezar. */}
        {(battle.status === 'ready' || battle.status === 'fighting') && (
          <button
            ref={actionRef}
            type="button"
            className={`button ${styles.big} ${styles.attack}`}
            onClick={() => {
              if (battle.status === 'ready') {
                battleDispatch({ type: 'START' });
              } else {
                battleDispatch({ type: 'ATTACK' });
                setHits((n) => n + 1);
              }
            }}
            onKeyDown={handleKeyDown}
          >
            {battle.status === 'ready' ? '¡Empezar!' : '¡Atacar!'}
          </button>
        )}

        {/* Siempre en la página para que el lector de pantalla anuncie el cambio. */}
        <p className={styles.result} role="status">
          {RESULT_TEXT[battle.status]}
        </p>

        {battle.status === 'won' && (
          <div className={styles.reward}>
            <p>
              Medalla del gimnasio {gym.number}, +
              {formatNumber(gym.hp * GYM_MONEY_REWARD)} monedas y +
              {XP_PER_GYM * gym.number} de experiencia.
            </p>
            <button
              ref={endRef}
              type="button"
              className="button"
              onClick={onExit}
            >
              Volver a los gimnasios
            </button>
          </div>
        )}

        {battle.status === 'lost' && (
          <div className={styles.reward}>
            <p>
              Le quedaban {formatNumber(hp)} de vida. Sube de nivel a tu equipo
              o compra Poder del equipo en la tienda.
            </p>
            <button
              ref={endRef}
              type="button"
              className="button"
              onClick={() => battleDispatch({ type: 'RETRY' })}
            >
              Reintentar
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
