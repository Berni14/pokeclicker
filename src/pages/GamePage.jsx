import { ClickButton } from '../components/ClickButton/ClickButton';
import { PokemonCard } from '../components/PokemonCard/PokemonCard';
import { TEAM_SIZE } from '../config/economy';
import { pokedexEntry } from '../config/pokedex';
import { pokemonProduction } from '../game/production';
import { useGame } from '../store/GameContext';
import styles from './GamePage.module.css';

export function GamePage({ onNavigate }) {
  const { state } = useGame();
  const slots = Array.from({ length: TEAM_SIZE }, (_, i) => state.team[i]);

  return (
    <div className={styles.page}>
      <h2 className="visually-hidden" tabIndex={-1}>
        Juego
      </h2>

      <section className={styles.clickZone} aria-label="Zona de click">
        <ClickButton />
      </section>

      <section className={styles.team} aria-labelledby="team-title">
        <h3 id="team-title" className={styles.teamTitle}>
          Tu equipo ({state.team.length}/{TEAM_SIZE})
        </h3>
        <ul className={styles.slots}>
          {slots.map((id, index) =>
            id ? (
              <li key={id}>
                <PokemonCard
                  entry={pokedexEntry(id)}
                  pokemon={state.pokemonById[id]}
                  stars={state.collection[id]}
                  production={pokemonProduction(state, id)}
                />
              </li>
            ) : (
              <li key={`empty-${index}`}>
                <button
                  type="button"
                  className={styles.empty}
                  onClick={() => onNavigate('box')}
                >
                  <span aria-hidden="true">+</span>
                  Hueco libre
                </button>
              </li>
            ),
          )}
        </ul>
        {state.team.length === 0 && (
          <p className={styles.hint}>
            Consigue tu primer Pokémon en el{' '}
            <button
              type="button"
              className={styles.link}
              onClick={() => onNavigate('gacha')}
            >
              gacha
            </button>
            : producirá monedas por ti.
          </p>
        )}
      </section>
    </div>
  );
}
