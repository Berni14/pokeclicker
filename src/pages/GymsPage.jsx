import { useState } from 'react';
import { TYPE_NAMES } from '../config/types';
import { pokedexEntry } from '../config/pokedex';
import { EXPECTED_CLICKS_PER_SECOND } from '../config/gyms';
import {
  battleDuration,
  clicksPerSecondNeeded,
  currentGym,
  gymsOf,
  gymStatus,
  hasTypeAdvantage,
  teamDps,
} from '../game/battle';
import { canChangeGeneration, regionOf } from '../game/prestige';
import { pixelSpriteUrl } from '../models/pokemon';
import { useGame } from '../store/GameContext';
import { formatName, formatNumber } from '../utils/format';
import { BattlePage } from './BattlePage';
import { TravelPanel } from './TravelPanel';
import styles from './GymsPage.module.css';

const STATUS_TEXT = {
  won: 'Vencido',
  current: 'Siguiente',
  locked: 'Bloqueado',
};

export function GymsPage() {
  const { state } = useGame();
  const [fighting, setFighting] = useState(null); // gimnasio en combate

  // Salir de esta pestaña desmonta el combate y su temporizador.
  if (fighting) {
    return <BattlePage gym={fighting} onExit={() => setFighting(null)} />;
  }

  const gyms = gymsOf(state);
  const medals = gyms.filter(
    (g) => gymStatus(state, g.number) === 'won',
  ).length;

  return (
    <div className={styles.page}>
      <h2 tabIndex={-1}>Gimnasios de {regionOf(state.generation)}</h2>
      <p className={styles.medals}>
        Medallas: {medals} / {gyms.length}
      </p>

      <ol className={styles.list}>
        {gyms.map((gym) => {
          const status = gymStatus(state, gym.number);
          return (
            <li key={gym.number} className={styles.gym} data-state={status}>
              <img
                className={styles.ace}
                src={pixelSpriteUrl(gym.ace)}
                alt=""
                width="64"
                height="64"
                loading="lazy"
              />
              <span className={styles.leader}>
                <strong>
                  {gym.number}. {gym.leader}
                </strong>
                <span>
                  {TYPE_NAMES[gym.type]} · {formatNumber(gym.hp)} de vida
                </span>
              </span>
              {status === 'current' ? (
                <button
                  type="button"
                  className="button"
                  onClick={() => setFighting(gym)}
                >
                  Retar
                </button>
              ) : (
                <span className={styles.status}>
                  {status === 'won' && <span aria-hidden="true">🏅 </span>}
                  {STATUS_TEXT[status]}
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {currentGym(state) && <Hint gym={currentGym(state)} />}
      {!currentGym(state) &&
        (canChangeGeneration(state) ? (
          <TravelPanel />
        ) : (
          <p className={styles.hint}>
            ¡Has vencido a todos los líderes de {regionOf(state.generation)}! Es
            la última región por ahora.
          </p>
        ))}
    </div>
  );
}

// Pista para el gimnasio actual: cuánto ayuda el equipo y cuánto hay que clicar.
function Hint({ gym }) {
  const { state } = useGame();
  const needed = clicksPerSecondNeeded(state, gym);
  const seconds = battleDuration(state);
  const teamShare = (teamDps(state, gym) * seconds) / gym.hp;
  const strong = state.team.filter((id) =>
    hasTypeAdvantage(pokedexEntry(id), gym),
  );
  const nameOf = (id) =>
    state.pokemonById[id] ? formatName(state.pokemonById[id].name) : `#${id}`;

  return (
    <section className={styles.hint} aria-labelledby="hint-title">
      <h3 id="hint-title">Contra {gym.leader}</h3>
      <ul>
        <li>
          Tu equipo hace {formatNumber(teamDps(state, gym))} de daño por
          segundo: {Math.round(Math.min(100, teamShare * 100))} % de su vida en{' '}
          {seconds} s.
        </li>
        <li>
          {strong.length > 0
            ? `Con ventaja de tipo: ${strong.map(nameOf).join(', ')}.`
            : `Ningún Pokémon de tu equipo tiene ventaja contra el tipo ${TYPE_NAMES[gym.type]}.`}
        </li>
        <li>
          {needed <= 0 ? (
            <strong>Tu equipo puede ganarle sin que hagas click.</strong>
          ) : (
            <>
              Necesitas unos{' '}
              <strong>{formatNumber(needed)} clicks por segundo</strong> durante{' '}
              {seconds} s.
              {needed > EXPECTED_CLICKS_PER_SECOND &&
                ' Es mucho: sube de nivel a tu equipo primero.'}
            </>
          )}
        </li>
      </ul>
    </section>
  );
}
