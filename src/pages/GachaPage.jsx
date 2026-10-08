import { useEffect, useState } from 'react';
import { Modal } from '../components/Modal/Modal';
import { PokemonCard } from '../components/PokemonCard/PokemonCard';
import { MAX_STARS, MAX_STARS_REFUND, RARITY_WEIGHTS } from '../config/gacha';
import { POKEDEX, pokedexByRarity, pokedexEntry } from '../config/pokedex';
import { RARITIES } from '../config/rarities';
import { canPull, pullOutcome, pullPrice, rollPokemon } from '../game/gacha';
import { pokemonProduction } from '../game/production';
import { useGame } from '../store/GameContext';
import { formatName, formatNumber } from '../utils/format';
import { prefersReducedMotion } from '../utils/motion';
import styles from './GachaPage.module.css';

// `rng` se puede cambiar desde los tests para que la tirada sea siempre la misma.
export function GachaPage({ rng = Math.random }) {
  const { state, dispatch } = useGame();
  const [result, setResult] = useState(null); // { id, outcome, price, pull }
  const price = pullPrice(state);
  const owned = Object.keys(state.collection).length;
  const total = POKEDEX[state.generation].length;

  function handlePull() {
    if (!canPull(state)) return;
    const id = rollPokemon(state.generation, rng);
    // El resultado se calcula antes de aplicar la tirada.
    setResult({
      id,
      outcome: pullOutcome(state, id),
      price,
      pull: state.pulls,
    });
    dispatch({ type: 'PULL', id });
  }

  return (
    <div className={styles.page}>
      <h2 tabIndex={-1}>Gacha</h2>

      <section className={styles.machine}>
        <p className={styles.collection}>
          Tienes {owned} de {total} Pokémon
        </p>
        <button
          type="button"
          className={`button ${styles.pull}`}
          disabled={!canPull(state)}
          onClick={handlePull}
        >
          Tirar · {formatNumber(price)} monedas
        </button>
        {!canPull(state) && (
          <p className={styles.missing}>
            Te faltan {formatNumber(Math.ceil(price - state.coins))} monedas
          </p>
        )}
      </section>

      <section aria-labelledby="odds-title">
        <h3 id="odds-title" className={styles.oddsTitle}>
          Probabilidades
        </h3>
        <table className={styles.odds}>
          <thead>
            <tr>
              <th scope="col">Rareza</th>
              <th scope="col">Probabilidad</th>
              <th scope="col">Pokémon</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(RARITY_WEIGHTS).map(([rarity, weight]) => (
              <tr key={rarity}>
                <th scope="row">
                  <span
                    className={styles.rarity}
                    style={{ '--rarity-color': `var(--rarity-${rarity})` }}
                  >
                    {RARITIES[rarity].label}
                  </span>
                </th>
                <td>{formatNumber(weight)} %</td>
                <td>
                  {pokedexByRarity(state.generation)[rarity]?.length ?? 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <Modal
        open={result !== null}
        onClose={() => setResult(null)}
        title="Tirada"
      >
        {result && (
          <PullResult
            key={result.pull}
            result={result}
            state={state}
            onPullAgain={canPull(state) ? handlePull : null}
          />
        )}
      </Modal>
    </div>
  );
}

function resultTitle(outcome) {
  if (outcome === 'new') return '¡Nuevo Pokémon!';
  if (outcome === 'star') return '¡Repetido! Sube de estrellas';
  return 'Repetido con 5 estrellas';
}

const SHAKE_MS = 900; // lo que se agita la Poké Ball antes de abrirse

// Cada tirada monta un PullResult nuevo (key): la animación empieza de cero.
function PullResult({ result, state, onPullAgain }) {
  const { id, outcome, price } = result;
  const [opened, setOpened] = useState(prefersReducedMotion);

  useEffect(() => {
    if (opened) return;
    const timeout = setTimeout(() => setOpened(true), SHAKE_MS);
    return () => clearTimeout(timeout);
  }, [opened]);

  if (!opened) {
    return (
      <div className={styles.opening} role="status">
        <span className={styles.ball} aria-hidden="true" />
        <span className="visually-hidden">Abriendo la Poké Ball…</span>
      </div>
    );
  }

  const pokemon = state.pokemonById[id];
  const name = pokemon ? formatName(pokemon.name) : 'Tu Pokémon';
  const stars = state.collection[id];

  let message;
  if (outcome === 'new') {
    message = state.team.includes(id)
      ? `${name} se ha unido a tu equipo.`
      : `${name} está en tu caja: el equipo está lleno.`;
  } else if (outcome === 'star') {
    message = `${name} sube a ${stars} de ${MAX_STARS} estrellas y produce más.`;
  } else {
    message = `${name} ya tenía ${MAX_STARS} estrellas: recibes ${formatNumber(
      MAX_STARS_REFUND * price,
    )} monedas y experiencia.`;
  }

  return (
    <div
      className={styles.result}
      style={{ '--rarity-color': `var(--rarity-${pokedexEntry(id).rarity})` }}
    >
      <h3 className={styles.outcome}>{resultTitle(outcome)}</h3>
      <PokemonCard
        entry={pokedexEntry(id)}
        pokemon={pokemon}
        stars={stars}
        production={pokemonProduction(state, id)}
      />
      <p role="status">{message}</p>
      {onPullAgain && (
        <button type="button" className="button" onClick={onPullAgain}>
          Tirar otra vez · {formatNumber(pullPrice(state))}
        </button>
      )}
    </div>
  );
}
