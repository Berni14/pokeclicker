import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { GamePage } from './GamePage';
import { GameProvider } from '../store/GameContext';
import { makeState } from '../__mocks__/gameState';

const pokemonById = {
  6: { id: 6, name: 'charizard', sprite: '' },
  25: { id: 25, name: 'pikachu', sprite: '' },
};

function renderGame(state) {
  return render(
    <GameProvider initial={makeState({ pokemonById, ...state })}>
      <GamePage onNavigate={() => {}} />
    </GameProvider>,
  );
}

const farm = () => screen.getByRole('region', { name: 'Granja de bayas' });

describe('Granja de bayas', () => {
  it('sin bayas dice cuánto falta para la próxima', () => {
    renderGame({ farm: { growth: 60, stock: [], harvested: 0 } });
    expect(farm()).toHaveTextContent('Próxima baya en 4:00');
    expect(farm()).toHaveTextContent('Bayas guardadas: 0 / 5');
    expect(farm()).toHaveTextContent('Aún no hay ninguna.');
  });

  it('llena, avisa de que no crece', () => {
    renderGame({
      farm: { growth: 0, stock: ['oran', 'oran', 'oran', 'oran', 'oran'] },
    });
    expect(farm()).toHaveTextContent('Granja llena');
    expect(farm()).toHaveTextContent('Baya Aranja ×5');
  });

  it('se da una baya a un Pokémon del equipo y su tarjeta la muestra', () => {
    renderGame({
      collection: { 6: 1, 25: 1 },
      team: [6, 25],
      farm: { growth: 0, stock: ['oran', 'liechi'], harvested: 2 },
      heldBerries: { 6: { key: 'sitrus', seconds: 30 } },
    });

    fireEvent.click(
      within(farm()).getByRole('button', { name: 'Dar Baya Aranja' }),
    );
    const dialog = screen.getByRole('dialog', { name: 'Dar Baya Aranja' });
    // Charizard ya lleva una: no se le puede dar otra.
    expect(
      within(dialog).getByRole('button', { name: /Charizard/ }),
    ).toBeDisabled();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Pikachu' }));

    expect(farm()).toHaveTextContent('Bayas guardadas: 1 / 5');
    const pikachu = screen.getByRole('heading', {
      name: 'Pikachu',
    }).parentElement;
    expect(pikachu).toHaveTextContent('Baya Aranja, le quedan 10:00');
  });
});
