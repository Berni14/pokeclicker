import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { GymsPage } from './GymsPage';
import { GameProvider } from '../store/GameContext';
import { makeState } from '../__mocks__/gameState';

const pokemonById = {
  6: { id: 6, name: 'charizard' },
  25: { id: 25, name: 'pikachu' },
};

function renderGyms(state) {
  return render(
    <GameProvider initial={makeState({ pokemonById, ...state })}>
      <GymsPage />
    </GameProvider>,
  );
}

const endOfKanto = {
  coins: 900,
  collection: { 6: 2, 25: 1 },
  levels: { 6: 20 },
  team: [6, 25],
  medals: { 1: [1, 2, 3, 4, 5, 6, 7, 8] },
};

describe('GymsPage · cambio de región', () => {
  it('sin terminar la región no se puede viajar', () => {
    renderGyms({ medals: { 1: [1, 2] } });
    expect(
      screen.getByRole('heading', { name: 'Gimnasios de Kanto' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Viajar/ })).toBeNull();
  });

  it('con las 8 medallas se elige un Pokémon y se viaja a Johto', () => {
    renderGyms(endOfKanto);
    fireEvent.click(screen.getByRole('button', { name: 'Viajar a Johto' }));

    const dialog = screen.getByRole('dialog', { name: 'Viajar a Johto' });
    // Propone al que más produce.
    expect(
      within(dialog).getByRole('radio', { name: /Charizard/ }),
    ).toBeChecked();

    fireEvent.click(within(dialog).getByRole('radio', { name: /Pikachu/ }));
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Viajar con Pikachu' }),
    );

    expect(
      screen.getByRole('heading', { name: 'Gimnasios de Johto' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Medallas: 0 / 8')).toBeInTheDocument();
    expect(screen.getByText('1. Pegaso')).toBeInTheDocument();
  });

  it('en la última región no hay botón de viajar', () => {
    renderGyms({
      generation: 2,
      collection: { 25: 1 },
      medals: { 2: [1, 2, 3, 4, 5, 6, 7, 8] },
    });
    expect(screen.queryByRole('button', { name: /Viajar/ })).toBeNull();
    expect(
      screen.getByText(/Es la última región por ahora/),
    ).toBeInTheDocument();
  });
});
