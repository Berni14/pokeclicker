import { useState } from 'react';
import { Modal } from '../components/Modal/Modal';
import { StarRating } from '../components/StarRating/StarRating';
import { pokemonLevel } from '../game/levels';
import { nextGeneration, regionOf } from '../game/prestige';
import { pokemonProduction } from '../game/production';
import { pixelSpriteUrl } from '../models/pokemon';
import { useGame } from '../store/GameContext';
import { formatDexNumber, formatName, formatNumber } from '../utils/format';
import styles from './TravelPanel.module.css';

// Aviso de región completada con el botón para viajar a la siguiente. Al
// viajar eliges el único Pokémon que te llevas.
export function TravelPanel() {
  const { state, dispatch } = useGame();
  const [open, setOpen] = useState(false);
  const [keepId, setKeepId] = useState(null);
  const region = regionOf(state.generation);
  const next = regionOf(nextGeneration(state));

  // De más a menos producción: el primero es el que se propone llevarse.
  const options = Object.keys(state.collection)
    .map(Number)
    .map((id) => ({ id, production: pokemonProduction(state, id) }))
    .sort((a, b) => b.production - a.production || a.id - b.id);
  const chosen = keepId ?? options[0]?.id;

  const nameOf = (id) =>
    state.pokemonById[id]
      ? formatName(state.pokemonById[id].name)
      : formatDexNumber(id);

  function handleTravel() {
    dispatch({ type: 'CHANGE_GENERATION', keepId: chosen });
    setOpen(false);
  }

  return (
    <section className={styles.panel} aria-labelledby="travel-title">
      <h3 id="travel-title">¡Has vencido a todos los líderes de {region}!</h3>
      <p>
        Puedes viajar a <strong>{next}</strong>: nuevos Pokémon en el gacha y 8
        gimnasios nuevos. Te llevas tu nivel de entrenador, tus medallas y un
        solo Pokémon.
      </p>
      <button type="button" className="button" onClick={() => setOpen(true)}>
        Viajar a {next}
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`Viajar a ${next}`}
      >
        <div className={styles.travel}>
          <ul className={styles.summary}>
            <li>
              <strong>Se mantiene:</strong> nivel de entrenador, medallas y el
              Pokémon que elijas, con sus estrellas y su nivel.
            </li>
            <li>
              <strong>Vuelve a empezar:</strong> monedas, mejoras, objetos,
              potenciadores, precio de los gachas y el resto de tu caja.
            </li>
          </ul>

          <fieldset className={styles.choose}>
            <legend>¿Qué Pokémon te llevas?</legend>
            <ul className={styles.options}>
              {options.map(({ id, production }) => (
                <li key={id}>
                  <label className={styles.option}>
                    <input
                      type="radio"
                      name="keep"
                      value={id}
                      checked={chosen === id}
                      onChange={() => setKeepId(id)}
                    />
                    <img
                      src={pixelSpriteUrl(id)}
                      alt=""
                      width="48"
                      height="48"
                      loading="lazy"
                    />
                    <span className={styles.name}>
                      <strong>{nameOf(id)}</strong>
                      <span>
                        Nv {pokemonLevel(state, id)} ·{' '}
                        {formatNumber(production)}/s
                      </span>
                    </span>
                    <StarRating stars={state.collection[id]} />
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>

          <button
            type="button"
            className="button"
            disabled={chosen === undefined}
            onClick={handleTravel}
          >
            Viajar con {chosen !== undefined && nameOf(chosen)}
          </button>
        </div>
      </Modal>
    </section>
  );
}
