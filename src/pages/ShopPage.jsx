import { useCallback } from 'react';
import { CardGrid } from '../components/CardGrid/CardGrid';
import { ItemCard } from '../components/ItemCard/ItemCard';
import { UpgradeCard } from '../components/UpgradeCard/UpgradeCard';
import { BOOSTS, ITEMS } from '../config/items';
import { UPGRADES } from '../config/upgrades';
import { boostCost, boostStatus, canBuyBoost } from '../game/boosts';
import { boostTimeLeft, canBuyItem, itemStatus } from '../game/items';
import { canBuyUpgrade, nextUpgradeCost, upgradeStatus } from '../game/shop';
import { useGame } from '../store/GameContext';
import styles from './ShopPage.module.css';

export function ShopPage() {
  const { state, dispatch } = useGame();
  const handleBuyUpgrade = useCallback(
    (key) => dispatch({ type: 'BUY_UPGRADE', key }),
    [dispatch],
  );
  const handleBuyItem = useCallback(
    (key) => dispatch({ type: 'BUY_ITEM', key }),
    [dispatch],
  );
  const handleBuyBoost = useCallback(
    (key) => dispatch({ type: 'BUY_BOOST', key }),
    [dispatch],
  );

  return (
    <div className={styles.page}>
      <h2 tabIndex={-1}>Tienda</h2>

      <section aria-labelledby="upgrades-title">
        <h3 id="upgrades-title" className={styles.sectionTitle}>
          Mejoras
        </h3>
        <CardGrid label="Mejoras">
          {Object.entries(UPGRADES).map(([key, upgrade]) => (
            <li key={key}>
              <UpgradeCard
                upgradeKey={key}
                upgrade={upgrade}
                level={state.upgrades[key]}
                cost={nextUpgradeCost(state, key)}
                status={upgradeStatus(state, key)}
                canAfford={canBuyUpgrade(state, key)}
                onBuy={handleBuyUpgrade}
              />
            </li>
          ))}
        </CardGrid>
      </section>

      <section aria-labelledby="items-title">
        <h3 id="items-title" className={styles.sectionTitle}>
          Objetos
        </h3>
        <p className={styles.intro}>
          Se compran una vez y multiplican tu dinero durante toda la generación.
        </p>
        <CardGrid label="Objetos">
          {Object.entries(ITEMS).map(([key, item]) => (
            <li key={key}>
              <ItemCard
                itemKey={key}
                item={item}
                status={itemStatus(state, key)}
                cost={item.cost}
                canAfford={canBuyItem(state, key)}
                onBuy={handleBuyItem}
              />
            </li>
          ))}
        </CardGrid>
      </section>

      <section aria-labelledby="boosts-title">
        <h3 id="boosts-title" className={styles.sectionTitle}>
          Potenciadores
        </h3>
        <p className={styles.intro}>
          De un solo uso: un empujón fuerte durante un rato. Si compras otro
          mientras dura, se suma el tiempo. El precio depende de lo que ganas.
        </p>
        <CardGrid label="Potenciadores">
          {Object.entries(BOOSTS).map(([key, boost]) => (
            <li key={key}>
              <ItemCard
                itemKey={key}
                item={boost}
                status={boostStatus(state, key)}
                cost={boostCost(state, key)}
                canAfford={canBuyBoost(state, key)}
                timeLeft={boostTimeLeft(state, key)}
                onBuy={handleBuyBoost}
              />
            </li>
          ))}
        </CardGrid>
      </section>
    </div>
  );
}
