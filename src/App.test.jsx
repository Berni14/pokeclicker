import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import App from './App.jsx';
import { clearCache } from './services/cache';
import { mockPokeApi } from './__mocks__/fetchPokeApi';

// Prueba de punta a punta del juego: la app entera, con la PokeAPI simulada.

beforeEach(() => {
  clearCache();
  mockPokeApi();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const nav = () => screen.getByRole('navigation', { name: 'Secciones' });
const goTo = (label) =>
  fireEvent.click(within(nav()).getByRole('button', { name: label }));
const clickBall = (times) => {
  const ball = screen.getByRole('button', { name: /Click: \+1/ });
  for (let i = 0; i < times; i++) fireEvent.click(ball);
};

describe('App', () => {
  it('muestra el título, las monedas y la pestaña Juego activa', () => {
    render(<App />);
    expect(
      screen.getByRole('heading', { name: 'Pokémon Clicker' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Monedas:').parentElement).toHaveTextContent('0');
    expect(
      within(nav()).getByRole('button', { name: 'Juego' }),
    ).toHaveAttribute('aria-current', 'page');
  });

  it('cada click suma una moneda', () => {
    render(<App />);
    clickBall(3);
    expect(screen.getByText('Monedas:').parentElement).toHaveTextContent('3');
  });

  it('flujo completo: clicar, tirar del gacha y ver el Pokémon en el equipo', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0); // siempre sale el #1 (común)
    render(<App />);

    goTo('Gacha');
    expect(screen.getByRole('button', { name: /Tirar/ })).toBeDisabled();

    goTo('Juego');
    clickBall(25);
    goTo('Gacha');
    fireEvent.click(screen.getByRole('button', { name: /Tirar · 25/ }));

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('¡Nuevo Pokémon!')).toBeInTheDocument();
    // El nombre llega de la API simulada («pokemon-1»).
    expect(
      await within(dialog).findByRole('heading', { name: 'Pokemon 1' }),
    ).toBeInTheDocument();
    expect(within(dialog).getByRole('status')).toHaveTextContent(
      'Pokemon 1 se ha unido a tu equipo.',
    );

    fireEvent.click(within(dialog).getByRole('button', { name: 'Cerrar' }));
    goTo('Juego');
    expect(screen.getByText('Tu equipo (1/6)')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Pokemon 1' }),
    ).toBeInTheDocument();
  });

  it('desde la caja se puede quitar y volver a equipar', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    render(<App />);
    clickBall(25);
    goTo('Gacha');
    fireEvent.click(screen.getByRole('button', { name: /Tirar/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));

    goTo('Caja');
    fireEvent.click(
      await screen.findByRole('button', { name: 'Quitar a Pokemon 1' }),
    );
    expect(
      screen.getByRole('button', { name: 'Equipar a Pokemon 1' }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Pokédex' }));
    expect(screen.getByText('1 / 151 descubiertos')).toBeInTheDocument();
  });

  // 160 clicks: con todos los tests en paralelo puede pasar de los 5 s por defecto.
  it('la tienda compra una mejora cuando hay monedas', () => {
    render(<App />);
    clickBall(160);
    goTo('Tienda');
    fireEvent.click(screen.getByRole('button', { name: /Mejorar · 160/ }));
    expect(screen.getByText('Nv 1/15')).toBeInTheDocument();
    expect(screen.getByText('Monedas:').parentElement).toHaveTextContent('0');
    // Las mejoras de nivel más alto siguen bloqueadas, y se dice con texto.
    expect(
      screen.getByText('Se desbloquea en el nivel 2 de entrenador'),
    ).toBeInTheDocument();
  }, 15_000);

  it('si la API falla, avisa y deja reintentar', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    mockPokeApi({ failIds: [1] });
    render(<App />);
    clickBall(25);
    goTo('Gacha');
    fireEvent.click(screen.getByRole('button', { name: /Tirar/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se han podido cargar los datos',
    );

    mockPokeApi(); // la API vuelve
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    goTo('Juego');
    expect(
      await screen.findByRole('heading', { name: 'Pokemon 1' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('guardado', () => {
  it('al recargar, la partida sigue ahí', () => {
    const first = render(<App />);
    clickBall(5);
    first.unmount(); // cerrar la página guarda la partida

    render(<App />);
    expect(screen.getByText('Monedas:').parentElement).toHaveTextContent('5');
  });

  it('al ocultar la pestaña se guarda', () => {
    render(<App />);
    clickBall(3);
    Object.defineProperty(document, 'visibilityState', {
      value: 'hidden',
      configurable: true,
    });
    fireEvent(document, new Event('visibilitychange'));
    expect(JSON.parse(localStorage.getItem('pkc:save')).coins).toBe(3);
    delete document.visibilityState;
  });

  it('al volver, avisa de lo que ganó el equipo mientras no estabas', () => {
    localStorage.setItem(
      'pkc:save',
      JSON.stringify({
        saveVersion: 1,
        coins: 0,
        trainer: { level: 1, xp: 0 },
        collection: { 25: 1 },
        team: [25],
        savedAt: Date.now() - 2 * 3600 * 1000, // hace 2 horas
      }),
    );
    render(<App />);
    expect(screen.getByText(/Mientras no estabas/)).toHaveTextContent(
      'Mientras no estabas (2 h), tu equipo ganó 7,2 mil monedas.',
    );
    fireEvent.click(screen.getByRole('button', { name: '¡Genial!' }));
    expect(screen.queryByText(/Mientras no estabas/)).not.toBeInTheDocument();
  });
});
