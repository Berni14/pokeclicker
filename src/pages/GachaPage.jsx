import { useEffect, useState } from 'react';
import { Modal } from '../components/Modal/Modal';
import { PokeBall } from '../components/PokeBall/PokeBall';
import { PokemonCard } from '../components/PokemonCard/PokemonCard';
import { BANNERS, MAX_STARS, MAX_STARS_REFUND } from '../config/gacha';
import { POKEDEX, pokedexEntry } from '../config/pokedex';
import { RARITIES } from '../config/rarities';
import {
  bannerPokemon,
  bannerWeights,
  canPull,
  pullOutcome,
  pullPrice,
  rollPokemon,
  totalPulls,
} from '../game/gacha';
import { pokemonLevel } from '../game/levels';
import { pokemonProduction } from '../game/production';
import { useGame } from '../store/GameContext';
import { formatName, formatNumber } from '../utils/format';
import { prefersReducedMotion } from '../utils/motion';
import styles from './GachaPage.module.css';

// `rng` se puede cambiar desde los tests para que la tirada sea siempre la misma.
export function GachaPage({ rng = Math.random }) {
  const { state, dispatch } = useGame();
  const [result, setResult] = useState(null); // { id, banner, outcome, price, pull }
  // Solo los de esta generación: el Pokémon que te traes de la anterior no cuenta.
  const entries = POKEDEX[state.generation];
  const owned = entries.filter(({ id }) => state.collection[id]).length;
  const total = entries.length;

  function handlePull(banner) {
    if (!canPull(state, banner)) return;
    const id = rollPokemon(state.generation, banner, rng);
    // El resultado se calcula antes de aplicar la tirada.
    setResult({
      id,
      banner,
      outcome: pullOutcome(state, id),
      price: pullPrice(state, banner),
      pull: totalPulls(state),
    });
    dispatch({ type: 'PULL', id, banner });
  }

  return (
    <div className={styles.page}>
      <h2 tabIndex={-1}>Gacha</h2>
      <p className={styles.collection}>
        Tienes {owned} de {total} Pokémon
      </p>

      <div className={styles.banners}>
        {Object.keys(BANNERS).map((banner) => (
          <Banner
            key={banner}
            banner={banner}
            state={state}
            onPull={handlePull}
          />
        ))}
      </div>

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
            onPullAgain={
              canPull(state, result.banner)
                ? () => handlePull(result.banner)
                : null
            }
          />
        )}
      </Modal>
    </div>
  );
}

// Una máquina del gacha: su bola, qué puede salir, cuántos tienes y el botón.
function Banner({ banner, state, onPull }) {
  const { label, ball } = BANNERS[banner];
  const weights = bannerWeights(state.generation, banner);
  const pokemon = bannerPokemon(state.generation, banner);
  const owned = pokemon.filter(({ id }) => state.collection[id]).length;
  const price = pullPrice(state, banner);
  const titleId = `banner-${banner}`;

  if (pokemon.length === 0) return null;

  return (
    <section className={styles.machine} aria-labelledby={titleId}>
      <PokeBall type={ball} className={styles.bannerBall} />
      <h3 id={titleId} className={styles.bannerTitle}>
        Gacha {label}
      </h3>
      <ul className={styles.odds} aria-label="Probabilidades">
        {Object.entries(weights).map(([rarity, weight]) => (
          <li key={rarity}>
            <span
              className={styles.rarity}
              style={{ '--rarity-color': `var(--rarity-${rarity})` }}
            >
              {RARITIES[rarity].label}
            </span>{' '}
            {formatNumber(weight)} %
          </li>
        ))}
      </ul>
      <p className={styles.owned}>
        {owned} / {pokemon.length} conseguidos
      </p>
      <button
        type="button"
        className={`button ${styles.pull}`}
        disabled={!canPull(state, banner)}
        onClick={() => onPull(banner)}
      >
        Tirar · {formatNumber(price)} monedas
      </button>
      {!canPull(state, banner) && (
        <p className={styles.missing}>
          Te faltan {formatNumber(Math.ceil(price - state.coins))} monedas
        </p>
      )}
    </section>
  );
}

function resultTitle(outcome) {
  if (outcome === 'new') return '¡Nuevo Pokémon!';
  if (outcome === 'star') return '¡Repetido! Sube de estrellas';
  return 'Repetido con 5 estrellas';
}

const SHAKE_MS = 900; // lo que se agita la última bola antes de abrirse
const EVOLVE_MS = 700; // lo que dura cada bola antes de evolucionar a la siguiente

// Bolas por las que pasa la tirada: empieza en la bola de la rareza más baja
// del gacha y sube hasta la de la que ha salido (en el básico, común → Poké y
// rara → Super; en el legendario, legendaria → Master y singular → Honor).
function ballsUpTo(rarity, banner) {
  const order = Object.keys(RARITIES);
  const from = Math.min(
    ...Object.keys(BANNERS[banner].weights).map((key) => order.indexOf(key)),
  );
  return order
    .slice(from, order.indexOf(rarity) + 1)
    .map((key) => RARITIES[key].ball);
}

// Cada tirada monta un PullResult nuevo (key): la animación empieza de cero.
function PullResult({ result, state, onPullAgain }) {
  const { id, banner, outcome, price } = result;
  const balls = ballsUpTo(pokedexEntry(id).rarity, banner);
  const [stage, setStage] = useState(() =>
    prefersReducedMotion() ? balls.length : 0,
  );
  const opened = stage >= balls.length;

  useEffect(() => {
    if (opened) return;
    const isLast = stage === balls.length - 1;
    const timeout = setTimeout(
      () => setStage((s) => s + 1),
      isLast ? SHAKE_MS : EVOLVE_MS,
    );
    return () => clearTimeout(timeout);
  }, [opened, stage, balls.length]);

  if (!opened) {
    return (
      <div className={styles.opening} role="status">
        <span className={styles.shake}>
          {/* key: cada evolución vuelve a montar la bola y repite el destello */}
          <PokeBall
            key={stage}
            type={balls[stage]}
            className={
              stage > 0 ? `${styles.ball} ${styles.evolve}` : styles.ball
            }
          />
        </span>
        <span className="visually-hidden">Abriendo la bola…</span>
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
        level={pokemonLevel(state, id)}
        production={pokemonProduction(state, id)}
      />
      <p role="status">{message}</p>
      {onPullAgain && (
        <button type="button" className="button" onClick={onPullAgain}>
          Tirar otra vez · {formatNumber(pullPrice(state, banner))}
        </button>
      )}
    </div>
  );
}
