import { createContext, useContext, useMemo, useReducer } from 'react';
import { gameReducer } from './gameReducer';
import { initialState } from './initialState';

const GameContext = createContext(null);

// `initial` permite empezar con otra partida (en los tests, por ejemplo).
export function GameProvider({ children, initial = initialState }) {
  const [state, dispatch] = useReducer(gameReducer, initial);
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
