import { useEffect, useRef, useState } from 'react';
import { clickValue } from '../../game/clicker';
import { useGame } from '../../store/GameContext';
import { formatNumber } from '../../utils/format';
import styles from './ClickButton.module.css';

const FLOAT_MS = 800; // lo que dura la animación del «+X»
const MAX_FLOATS = 8; // clicando muy rápido no se acumulan sin fin

export function ClickButton() {
  const { state, dispatch } = useGame();
  const [floats, setFloats] = useState([]); // [{ id, text, x }]
  const nextId = useRef(0);
  const timeouts = useRef(new Set());

  // Al salir de la pantalla, se cancelan los «+X» pendientes.
  useEffect(() => {
    const pending = timeouts.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  function handleClick() {
    const text = `+${formatNumber(clickValue(state))}`;
    dispatch({ type: 'CLICK' });

    const id = nextId.current++;
    const x = Math.round(Math.random() * 60 - 30); // un poco a un lado u otro
    setFloats((list) => [...list.slice(-(MAX_FLOATS - 1)), { id, text, x }]);
    const timeout = setTimeout(() => {
      timeouts.current.delete(timeout);
      setFloats((list) => list.filter((f) => f.id !== id));
    }, FLOAT_MS);
    timeouts.current.add(timeout);
  }

  return (
    <button type="button" className={styles.button} onClick={handleClick}>
      <span className={styles.ball} aria-hidden="true" />
      <span className={styles.label}>
        Click: +{formatNumber(clickValue(state))}
      </span>
      {floats.map((f) => (
        <span
          key={f.id}
          className={styles.float}
          style={{ '--x': `${f.x}px` }}
          aria-hidden="true"
        >
          {f.text}
        </span>
      ))}
    </button>
  );
}
