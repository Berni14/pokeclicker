import { memo } from 'react';
import { RARITIES } from '../../config/rarities';
import { TYPE_COLORS } from '../../config/types';
import { formatDexNumber, formatName, formatNumber } from '../../utils/format';
import { Loader } from '../Loader/Loader';
import { StarRating } from '../StarRating/StarRating';
import { TypeBadge } from '../TypeBadge/TypeBadge';
import styles from './PokemonCard.module.css';

// Recibe todo hecho: `entry` (tabla de la Pokédex), `pokemon` (datos de la
// API, puede no haber llegado aún), estrellas y producción. La acción opcional
// (equipar, quitar…) llega como texto + función que recibe el id: así no cambia
// en cada render y React.memo evita repintar la tarjeta en cada tick.
export const PokemonCard = memo(function PokemonCard({
  entry,
  pokemon,
  stars,
  production,
  actionLabel,
  onAction,
}) {
  const name = pokemon ? formatName(pokemon.name) : null;

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
      <p className={styles.production}>
        {formatNumber(production)} <abbr title="monedas por segundo">/s</abbr>
      </p>

      {onAction && (
        <button
          type="button"
          className={`button button-secondary ${styles.action}`}
          onClick={() => onAction(entry.id)}
          aria-label={name ? `${actionLabel} a ${name}` : actionLabel}
        >
          {actionLabel}
        </button>
      )}
    </article>
  );
});
