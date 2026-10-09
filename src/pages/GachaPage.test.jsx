import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { GachaPage } from './GachaPage';
import { GameProvider } from '../store/GameContext';
import { makeState } from '../__mocks__/gameState';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const pokemonById = {
  1: { id: 1, name: 'bulbasaur' },
  3: { id: 3, name: 'venusaur' },
};
const alwaysFirst = () => 0; // rareza común y el primero de la lista: el #1

function renderGacha(state) {
  return render(
    <GameProvider initial={makeState({ pokemonById, ...state })}>
      <GachaPage rng={alwaysFirst} />
    </GameProvider>,
  );
}

const banner = (label) =>
  screen.getByRole('region', { name: `Gacha ${label}` });
const pull = (label = 'Básico') =>
  fireEvent.click(
    within(banner(label)).getByRole('button', { name: /^Tirar ·/ }),
  );

describe('GachaPage', () => {
  it('hay tres gachas, cada uno con sus rarezas y su precio', () => {
    renderGacha({ coins: 0 });
    expect(banner('Básico')).toHaveTextContent('Común 70 %');
    expect(banner('Básico')).toHaveTextContent('Rara 30 %');
    expect(banner('Épico')).toHaveTextContent('Épica 85 %');
    expect(banner('Épico')).toHaveTextContent('Legendaria 15 %');
    expect(banner('Legendario')).toHaveTextContent('Legendaria 80 %');
    expect(banner('Legendario')).toHaveTextContent('Singular 20 %');
    expect(banner('Legendario')).toHaveTextContent('0 / 5 conseguidos');
    expect(
      within(banner('Épico')).getByRole('button', { name: /^Tirar ·/ }),
    ).toHaveTextContent('Tirar · 100 mil monedas');
  });

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

  it('el gacha épico da un Pokémon épico y sube solo su precio', () => {
    renderGacha({ coins: 100_000 });
    pull('Épico');
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('Venusaur se ha unido a tu equipo.');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cerrar' }));
    expect(
      within(banner('Épico')).getByRole('button', { name: /^Tirar ·/ }),
    ).toHaveTextContent('Tirar · 110 mil monedas');
    expect(
      within(banner('Básico')).getByRole('button', { name: /^Tirar ·/ }),
    ).toHaveTextContent('Tirar · 25 monedas');
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
