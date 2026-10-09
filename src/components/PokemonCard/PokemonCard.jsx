import { memo } from 'react';
import { MAX_POKEMON_LEVEL } from '../../config/economy';
import { RARITIES } from '../../config/rarities';
import { TYPE_COLORS } from '../../config/types';
import { formatDexNumber, formatName, formatNumber } from '../../utils/format';
import { Loader } from '../Loader/Loader';
import { StarRating } from '../StarRating/StarRating';
import { TypeBadge } from '../TypeBadge/TypeBadge';
import styles from './PokemonCard.module.css';

// Recibe todo hecho: `entry` (tabla de la Pokédex), `pokemon` (datos de la
// API, puede no haber llegado aún), estrellas, nivel y producción. Las acciones
// opcionales (equipar, quitar, subir de nivel…) llegan como funciones que
// reciben el id: así no cambian en cada render y React.memo evita repintar la
// tarjeta en cada tick.
export const PokemonCard = memo(function PokemonCard({
  entry,
  pokemon,
  stars,
  level = 1,
  production,
  levelUpCost,
  canLevelUp,
  onLevelUp,
  actionLabel,
  onAction,
}) {
  const name = pokemon ? formatName(pokemon.name) : null;
  const isMax = level >= MAX_POKEMON_LEVEL;

  return (
    <article
      className={styles.card}
      style={{
        '--type-color': TYPE_COLORS[entry.types[0]],
        '--rarity-color': `var(--rarity-${entry.rarity})`,
      }}
    >
      <div className={styles.top}>
        <span className={styles.number}>{formatDexNumber(entry.id)}</span>
        <span className={styles.rarity}>{RARITIES[entry.rarity].label}</span>
      </div>

      {pokemon ? (
        <>
          <img
            className={styles.image}
            src={pokemon.sprite}
            alt={name}
            width="120"
            height="120"
            loading="lazy"
          />
          <h3 className={styles.name}>{name}</h3>
        </>
      ) : (
        <Loader label="Cargando Pokémon…" />
      )}

      <ul className={styles.types} aria-label="Tipos">
        {entry.types.map((type) => (
          <li key={type}>
            <TypeBadge type={type} />
          </li>
        ))}
      </ul>

      <StarRating stars={stars} />
      <p className={styles.stats}>
        <span className={styles.level}>
          <abbr title="Nivel">Nv.</abbr> {level}
        </span>
        <span className={styles.production}>
          {formatNumber(production)} <abbr title="monedas por segundo">/s</abbr>
        </span>
      </p>

      {(onLevelUp || onAction) && (
        <div className={styles.actions}>
          {onLevelUp &&
            (isMax ? (
              <p className={styles.maxLevel}>Nivel máximo</p>
            ) : (
              <button
                type="button"
                className="button"
                disabled={!canLevelUp}
                onClick={() => onLevelUp(entry.id)}
                aria-label={`Subir a ${name ?? 'este Pokémon'} al nivel ${
                  level + 1
                } por ${formatNumber(levelUpCost)} monedas`}
              >
                Nv. {level + 1} · {formatNumber(levelUpCost)}
              </button>
            ))}
          {onAction && (
            <button
              type="button"
              className="button button-secondary"
              onClick={() => onAction(entry.id)}
              aria-label={name ? `${actionLabel} a ${name}` : actionLabel}
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </article>
  );
});
