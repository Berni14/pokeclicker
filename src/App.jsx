import { useEffect, useRef, useState } from 'react';
import { CoinCounter } from './components/CoinCounter/CoinCounter';
import { NavTabs } from './components/NavTabs/NavTabs';
import { useGameLoop } from './hooks/useGameLoop';
import { useOwnedPokemon } from './hooks/usePokemon';
import { BoxPage } from './pages/BoxPage';
import { GachaPage } from './pages/GachaPage';
import { GamePage } from './pages/GamePage';
import { GymsPage } from './pages/GymsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ShopPage } from './pages/ShopPage';
import { GameProvider } from './store/GameContext';
import styles from './App.module.css';

function Game() {
  const [tab, setTab] = useState('game');
  const { error, retry } = useOwnedPokemon();
  useGameLoop();

  // Al cambiar de pestaña, el foco va al título de la página nueva (para
  // teclado y lectores de pantalla). En la primera carga no se mueve.
  const mainRef = useRef(null);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    mainRef.current.querySelector('h2')?.focus();
  }, [tab]);

  const pages = {
    game: <GamePage onNavigate={setTab} />,
    gacha: <GachaPage />,
    box: <BoxPage />,
    shop: <ShopPage />,
    gyms: <GymsPage />,
    settings: <SettingsPage />,
  };

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <h1 className={styles.title}>Pokémon Clicker</h1>
          <CoinCounter />
        </div>
      </header>

      <NavTabs current={tab} onChange={setTab} />

      <main ref={mainRef} className={styles.main}>
        {error && (
          <div className={styles.error} role="alert">
            <p>No se han podido cargar los datos de algunos Pokémon. {error}</p>
            <button type="button" className="button" onClick={retry}>
              Reintentar
            </button>
          </div>
        )}
        {pages[tab]}
      </main>
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <Game />
    </GameProvider>
  );
}

export default App;
