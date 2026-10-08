import { createContext, useContext, useMemo, useReducer } from 'react';
import { gameReducer } from './gameReducer';
import { createInitialState } from './persistence';

const GameContext = createContext(null);

// Sin `initial`, carga la partida guardada antes del primer render (así el
// autoguardado nunca la pisa con una vacía). Los tests pasan su propio estado.
export function GameProvider({ children, initial }) {
  const [state, dispatch] = useReducer(
    gameReducer,
    initial,
    (given) => given ?? createInitialState(),
  );
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <GameContext value={value}>{children}</GameContext>;
}

// El hook vive junto a su provider, como en la estructura del proyecto.
// eslint-disable-next-line react-refresh/only-export-components
export function useGame() {
  const context = useContext(GameContext);
  if (!context)
    throw new Error('useGame() tiene que usarse dentro de <GameProvider>');
  return context;
}
