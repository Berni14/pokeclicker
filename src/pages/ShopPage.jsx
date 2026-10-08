import { useCallback } from 'react';
import { CardGrid } from '../components/CardGrid/CardGrid';
import { UpgradeCard } from '../components/UpgradeCard/UpgradeCard';
import { UPGRADES } from '../config/upgrades';
import { canBuyUpgrade, nextUpgradeCost, upgradeStatus } from '../game/shop';
import { useGame } from '../store/GameContext';

export function ShopPage() {
  const { state, dispatch } = useGame();
  const handleBuy = useCallback(
    (key) => dispatch({ type: 'BUY_UPGRADE', key }),
    [dispatch],
  );

  return (
    <div>
      <h2 tabIndex={-1}>Tienda</h2>
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
              onBuy={handleBuy}
            />
          </li>
        ))}
      </CardGrid>
    </div>
  );
}
