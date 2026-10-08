import { GameProvider } from './store/GameContext';

function App() {
  return (
    <GameProvider>
      <h1>Pokémon Clicker</h1>
    </GameProvider>
  );
}

export default App;
