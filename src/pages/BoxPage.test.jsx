import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { BoxPage } from './BoxPage';
import { GameProvider } from '../store/GameContext';
import { makeState } from '../__mocks__/gameState';

const pokemonById = Object.fromEntries(
  [1, 4, 6, 7, 54, 95, 150].map((id) => [
    id,
    { id, name: `poke-${id}`, sprite: '' },
  ]),
);

function renderBox(state) {
  return render(
    <GameProvider initial={makeState({ pokemonById, ...state })}>
      <BoxPage />
    </GameProvider>,
  );
}

describe('BoxPage', () => {
  it('con el equipo lleno, equipar pide a quién sustituir', () => {
    renderBox({
      collection: { 1: 1, 4: 1, 6: 1, 7: 1, 54: 1, 95: 1, 150: 1 },
      team: [1, 4, 6, 7, 54, 95],
    });

    fireEvent.click(screen.getByRole('button', { name: 'Equipar a Poke 150' }));
    const dialog = screen.getByRole('dialog', { name: 'Equipo lleno' });
    expect(dialog).toHaveTextContent('¿A quién sustituye Poke 150?');

    fireEvent.click(within(dialog).getByRole('button', { name: 'Poke 6' }));
    expect(
      screen.getByRole('button', { name: 'Quitar a Poke 150' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Equipar a Poke 6' }),
    ).toBeInTheDocument();
  });

  it('filtra por rareza y ordena', () => {
    renderBox({ collection: { 1: 1, 6: 1, 150: 1 }, team: [] });
    const names = () =>
      screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);

    // Por defecto, de más a menos producción.
    expect(names()).toEqual(['Poke 150', 'Poke 6', 'Poke 1']);

    fireEvent.change(screen.getByLabelText('Rareza'), {
      target: { value: 'legendary' },
    });
    expect(names()).toEqual(['Poke 150']);

    fireEvent.change(screen.getByLabelText('Rareza'), {
      target: { value: 'all' },
    });
    fireEvent.change(screen.getByLabelText('Ordenar por'), {
      target: { value: 'number' },
    });
    expect(names()).toEqual(['Poke 1', 'Poke 6', 'Poke 150']);
  });

  it('la Pokédex muestra en silueta los que faltan', () => {
    renderBox({
      collection: { 25: 1 },
      pokemonById: { 25: { id: 25, name: 'pikachu' } },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Pokédex' }));
    expect(screen.getByText('1 / 151 descubiertos')).toBeInTheDocument();
    expect(screen.getByText('Pikachu')).toBeInTheDocument();
    expect(screen.getAllByText('???')).toHaveLength(150);
  });
});
