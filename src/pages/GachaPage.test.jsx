import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { GachaPage } from './GachaPage';
import { GameProvider } from '../store/GameContext';
import { makeState } from '../__mocks__/gameState';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const pokemonById = { 1: { id: 1, name: 'bulbasaur' } };
const alwaysFirst = () => 0; // rareza común y el primero de la lista: el #1

function renderGacha(state) {
  return render(
    <GameProvider initial={makeState({ pokemonById, ...state })}>
      <GachaPage rng={alwaysFirst} />
    </GameProvider>,
  );
}

const pull = () =>
  fireEvent.click(screen.getByRole('button', { name: /^Tirar ·/ }));

describe('GachaPage', () => {
  it('sin dinero el botón está deshabilitado y dice cuánto falta', () => {
    renderGacha({ coins: 10 });
    expect(
      screen.getByRole('button', { name: 'Tirar · 25 monedas' }),
    ).toBeDisabled();
    expect(screen.getByText('Te faltan 15 monedas')).toBeInTheDocument();
  });

  it('tira con un rng fijo y sale el Pokémon nuevo', () => {
    renderGacha({ coins: 25 });
    pull();

    const dialog = screen.getByRole('dialog', { name: 'Tirada' });
    expect(within(dialog).getByText('¡Nuevo Pokémon!')).toBeInTheDocument();
    expect(dialog).toHaveTextContent('Bulbasaur se ha unido a tu equipo.');
    expect(screen.getByText('Tienes 1 de 151 Pokémon')).toBeInTheDocument();
  });

  it('un repetido sube de estrellas', () => {
    renderGacha({ coins: 25, collection: { 1: 1 }, team: [1] });
    pull();
    const dialog = screen.getByRole('dialog');
    expect(
      within(dialog).getByText('¡Repetido! Sube de estrellas'),
    ).toBeInTheDocument();
    expect(dialog).toHaveTextContent('Bulbasaur sube a 2 de 5 estrellas');
  });

  it('con el equipo lleno, el nuevo va a la caja', () => {
    renderGacha({
      coins: 25,
      collection: { 4: 1, 6: 1, 7: 1, 54: 1, 95: 1, 150: 1 },
      team: [4, 6, 7, 54, 95, 150],
    });
    pull();
    expect(screen.getByRole('dialog')).toHaveTextContent(
      'Bulbasaur está en tu caja: el equipo está lleno.',
    );
  });

  it('con animaciones, primero se abre la bola y luego sale el Pokémon', () => {
    vi.useFakeTimers();
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    renderGacha({ coins: 25 });
    pull();

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Abriendo la bola…')).toBeInTheDocument();
    expect(within(dialog).queryByText('¡Nuevo Pokémon!')).toBeNull();

    act(() => vi.advanceTimersByTime(1000));
    expect(within(dialog).getByText('¡Nuevo Pokémon!')).toBeInTheDocument();
  });
});
