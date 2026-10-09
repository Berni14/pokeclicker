import { useState } from 'react';
import { Berry } from '../components/Berry/Berry';
import { Modal } from '../components/Modal/Modal';
import {
  BERRIES,
  BERRY_GROW_SECONDS,
  BERRY_SECONDS,
  BERRY_STORAGE,
} from '../config/berries';
import { canGiveBerry, heldBerry, secondsToNextBerry } from '../game/berries';
import { useGame } from '../store/GameContext';
import {
  formatClock,
  formatDexNumber,
  formatDuration,
  formatName,
} from '../utils/format';
import styles from './BerryFarm.module.css';

// Granja de bayas de la pantalla principal: crece sola y sus bayas se dan a
// los Pokémon del equipo.
export function BerryFarm() {
  const { state, dispatch } = useGame();
  const [giving, setGiving] = useState(null); // baya que se va a dar
  const { stock } = state.farm;
  const next = secondsToNextBerry(state);

  // Cuántas hay de cada baya, en el orden de config/berries.js.
  const counts = Object.keys(BERRIES)
    .map((key) => [key, stock.filter((k) => k === key).length])
    .filter(([, count]) => count > 0);

  const nameOf = (id) =>
    state.pokemonById[id]
      ? formatName(state.pokemonById[id].name)
      : formatDexNumber(id);

  function handleGive(id) {
    dispatch({ type: 'GIVE_BERRY', key: giving, id });
    setGiving(null);
  }

  return (
    <section className={styles.farm} aria-labelledby="farm-title">
      <h3 id="farm-title" className={styles.title}>
        Granja de bayas
      </h3>

      {next === null ? (
        <p className={styles.status}>
          Granja llena: da una baya para que siga creciendo.
        </p>
      ) : (
        <>
          <p className={styles.status}>
            Próxima baya en <strong>{formatClock(next)}</strong>
          </p>
          <progress
            className={styles.progress}
            max={BERRY_GROW_SECONDS}
            value={BERRY_GROW_SECONDS - next}
            aria-label="Crecimiento de la próxima baya"
          />
        </>
      )}

      <p className={styles.count}>
        Bayas guardadas: {stock.length} / {BERRY_STORAGE}
      </p>
      {counts.length === 0 ? (
        <p className={styles.empty}>Aún no hay ninguna.</p>
      ) : (
        <ul className={styles.stock}>
          {counts.map(([key, count]) => (
            <li key={key} className={styles.berry}>
              <Berry type={key} size={32} />
              <span className={styles.info}>
                <strong>
                  {BERRIES[key].label}
                  {count > 1 && ` ×${count}`}
                </strong>
                <span>{BERRIES[key].effect}</span>
              </span>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setGiving(key)}
                aria-label={`Dar ${BERRIES[key].label}`}
              >
                Dar
              </button>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={giving !== null}
        onClose={() => setGiving(null)}
        title={giving ? `Dar ${BERRIES[giving].label}` : ''}
      >
        {giving && (
          <div className={styles.give}>
            <p>
              {BERRIES[giving].effect} durante {formatDuration(BERRY_SECONDS)}.
              Cada Pokémon lleva una como máximo.
            </p>
            {state.team.length === 0 ? (
              <p>No tienes Pokémon en el equipo.</p>
            ) : (
              <ul className={styles.targets}>
                {state.team.map((id) => {
                  const held = heldBerry(state, id);
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        className="button button-secondary"
                        disabled={!canGiveBerry(state, giving, id)}
                        onClick={() => handleGive(id)}
                      >
                        {nameOf(id)}
                        {held && ` · ya lleva ${BERRIES[held.key].label}`}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </Modal>
    </section>
  );
}
