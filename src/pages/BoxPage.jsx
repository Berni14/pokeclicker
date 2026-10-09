import { useCallback, useState } from 'react';
import { CardGrid } from '../components/CardGrid/CardGrid';
import { Modal } from '../components/Modal/Modal';
import { PokemonCard } from '../components/PokemonCard/PokemonCard';
import { POKEDEX, pokedexEntry } from '../config/pokedex';
import { RARITIES } from '../config/rarities';
import { TYPE_NAMES } from '../config/types';
import { currentGym } from '../game/battle';
import { canLevelUp, levelUpCost, pokemonLevel } from '../game/levels';
import { pokemonProduction } from '../game/production';
import { bestTeam, isTeamFull } from '../game/team';
import { pixelSpriteUrl } from '../models/pokemon';
import { useGame } from '../store/GameContext';
import { formatDexNumber, formatName } from '../utils/format';
import styles from './BoxPage.module.css';

const RARITY_ORDER = Object.keys(RARITIES);

const SORTS = {
  production: {
    label: 'Producción',
    compare: (a, b) => b.production - a.production,
  },
  rarity: {
    label: 'Rareza',
    compare: (a, b) =>
      RARITY_ORDER.indexOf(b.entry.rarity) -
      RARITY_ORDER.indexOf(a.entry.rarity),
  },
  number: { label: 'Número', compare: (a, b) => a.entry.id - b.entry.id },
};

export function BoxPage() {
  const [view, setView] = useState('mine');

  return (
    <div className={styles.page}>
      <h2 tabIndex={-1}>Caja</h2>
      <div className={styles.views} role="group" aria-label="Vista">
        <button
          type="button"
          aria-pressed={view === 'mine'}
          onClick={() => setView('mine')}
        >
          Mis Pokémon
        </button>
        <button
          type="button"
          aria-pressed={view === 'dex'}
          onClick={() => setView('dex')}
        >
          Pokédex
        </button>
      </div>
      {view === 'mine' ? <MyPokemon /> : <Pokedex />}
    </div>
  );
}

function MyPokemon() {
  const { state, dispatch } = useGame();
  const [type, setType] = useState('all');
  const [rarity, setRarity] = useState('all');
  const [sort, setSort] = useState('production');
  const [replacing, setReplacing] = useState(null); // id que quiere entrar con el equipo lleno

  const items = Object.keys(state.collection)
    .map((id) => {
      const entry = pokedexEntry(id);
      return { entry, production: pokemonProduction(state, entry.id) };
    })
    .filter(({ entry }) => type === 'all' || entry.types.includes(type))
    .filter(({ entry }) => rarity === 'all' || entry.rarity === rarity)
    .sort(SORTS[sort].compare);

  const ownedTypes = [
    ...new Set(
      Object.keys(state.collection).flatMap((id) => pokedexEntry(id).types),
    ),
  ].sort((a, b) => TYPE_NAMES[a].localeCompare(TYPE_NAMES[b]));

  // Depende solo del equipo, que no cambia en cada tick: las tarjetas
  // memorizadas no se repintan cada segundo.
  const team = state.team;
  const handleToggle = useCallback(
    (id) => {
      if (team.includes(id)) dispatch({ type: 'UNEQUIP', id });
      else if (isTeamFull({ team })) setReplacing(id);
      else dispatch({ type: 'EQUIP', id });
    },
    [team, dispatch],
  );

  const handleLevelUp = useCallback(
    (id) => dispatch({ type: 'LEVEL_UP', id }),
    [dispatch],
  );

  function handleReplace(replaceId) {
    dispatch({ type: 'EQUIP', id: replacing, replaceId });
    setReplacing(null);
  }

  const nameOf = (id) =>
    state.pokemonById[id]
      ? formatName(state.pokemonById[id].name)
      : formatDexNumber(id);

  if (Object.keys(state.collection).length === 0) {
    return (
      <p className={styles.empty}>
        Aún no tienes Pokémon. ¡Prueba suerte en el gacha!
      </p>
    );
  }

  const gym = currentGym(state);
  const autoOptions = [
    { by: 'production', label: 'Más dinero' },
    {
      by: 'damage',
      label: gym ? `Más daño contra ${gym.leader}` : 'Más daño',
    },
  ];

  return (
    <>
      <div className={styles.auto} role="group" aria-label="Equipo automático">
        <span className={styles.autoTitle}>Equipo automático</span>
        {autoOptions.map(({ by, label }) => {
          const best = bestTeam(state, by);
          const isBest =
            best.length === team.length &&
            best.every((id) => team.includes(id));
          return (
            <button
              key={by}
              type="button"
              className="button button-secondary"
              disabled={isBest}
              onClick={() => dispatch({ type: 'AUTO_EQUIP', by })}
            >
              {label}
              {isBest && ' ✓'}
            </button>
          );
        })}
      </div>

      <div className={styles.filters}>
        <label>
          Tipo
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">Todos</option>
            {ownedTypes.map((t) => (
              <option key={t} value={t}>
                {TYPE_NAMES[t]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Rareza
          <select value={rarity} onChange={(e) => setRarity(e.target.value)}>
            <option value="all">Todas</option>
            {Object.entries(RARITIES).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Ordenar por
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            {Object.entries(SORTS).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {items.length === 0 ? (
        <p className={styles.empty}>Ningún Pokémon con esos filtros.</p>
      ) : (
        <CardGrid label="Tus Pokémon" minWidth="180px">
          {items.map(({ entry, production }) => (
            <li key={entry.id}>
              <PokemonCard
                entry={entry}
                pokemon={state.pokemonById[entry.id]}
                stars={state.collection[entry.id]}
                level={pokemonLevel(state, entry.id)}
                production={production}
                levelUpCost={levelUpCost(state, entry.id)}
                canLevelUp={canLevelUp(state, entry.id)}
                onLevelUp={handleLevelUp}
                actionLabel={team.includes(entry.id) ? 'Quitar' : 'Equipar'}
                onAction={handleToggle}
              />
            </li>
          ))}
        </CardGrid>
      )}

      <Modal
        open={replacing !== null}
        onClose={() => setReplacing(null)}
        title="Equipo lleno"
      >
        <p>¿A quién sustituye {replacing && nameOf(replacing)}?</p>
        <ul className={styles.replaceList}>
          {team.map((id) => (
            <li key={id}>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => handleReplace(id)}
              >
                {nameOf(id)}
              </button>
            </li>
          ))}
        </ul>
      </Modal>
    </>
  );
}

function Pokedex() {
  const { state } = useGame();
  const entries = POKEDEX[state.generation];
  const owned = entries.filter((e) => state.collection[e.id]).length;

  return (
    <>
      <p className={styles.dexCount}>
        {owned} / {entries.length} descubiertos
      </p>
      <ul className={styles.dex}>
        {entries.map(({ id }) => {
          const has = Boolean(state.collection[id]);
          const pokemon = state.pokemonById[id];
          return (
            <li key={id} className={has ? styles.owned : styles.unknown}>
              <img
                src={pixelSpriteUrl(id)}
                alt=""
                width="72"
                height="72"
                loading="lazy"
              />
              <span className={styles.dexNumber}>{formatDexNumber(id)}</span>
              <span>{has && pokemon ? formatName(pokemon.name) : '???'}</span>
            </li>
          );
        })}
      </ul>
    </>
  );
}
