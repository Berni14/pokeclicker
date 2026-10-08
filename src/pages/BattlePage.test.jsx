import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { GymsPage } from './GymsPage';
import { GameProvider } from '../store/GameContext';
import { makeState } from '../__mocks__/gameState';

// Tiempo falso: se puede adelantar el reloj sin esperar de verdad.
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

function renderGyms(state) {
  const utils = render(
    <GameProvider initial={makeState(state)}>
      <GymsPage />
    </GameProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Retar' }));
  return utils;
}

const advance = (ms) => act(() => vi.advanceTimersByTime(ms));
const timer = () => screen.getByLabelText(/^Tiempo:/);
const actionButton = () =>
  screen.getByRole('button', { name: /¡Empezar!|¡Atacar!/ });

describe('BattlePage', () => {
  it('el tiempo no corre hasta pulsar «¡Empezar!»', () => {
    renderGyms();
    expect(timer()).toHaveTextContent('30');
    advance(5000);
    expect(timer()).toHaveTextContent('30');

    fireEvent.click(actionButton());
    advance(5000);
    expect(timer()).toHaveTextContent('25');
  });

  it('a clicks se gana: medalla y el siguiente gimnasio se desbloquea', () => {
    // Poder de click 9 → 10 de daño: 70 clicks para los 700 de Brock.
    renderGyms({ upgrades: { clickPower: 9 } });
    fireEvent.click(actionButton());
    for (let i = 0; i < 70; i++) fireEvent.click(actionButton());

    expect(screen.getByRole('status')).toHaveTextContent('¡Has ganado!');
    expect(
      screen.getByText(/\+350 monedas y \+50 de experiencia/),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: 'Volver a los gimnasios' }),
    );
    expect(screen.getByText('Medallas: 1 / 8')).toBeInTheDocument();
    expect(screen.getByText('Vencido')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Contra Misty' }),
    ).toBeInTheDocument();
  });

  it('sin clicks se pierde al acabar el tiempo, y se puede reintentar', () => {
    renderGyms();
    fireEvent.click(actionButton());
    advance(31_000);
    expect(screen.getByRole('status')).toHaveTextContent('Se acabó el tiempo');

    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(timer()).toHaveTextContent('30');
    expect(actionButton()).toHaveTextContent('¡Empezar!');
  });

  it('el equipo hace daño con el tiempo, con ventaja de tipo', () => {
    // Squirtle (agua) contra Brock (roca): 9,6 × 1,5 = 14,4 de daño/s.
    renderGyms({ collection: { 7: 1 }, team: [7] });
    fireEvent.click(actionButton());
    advance(10_000);
    expect(screen.getByText(/^Vida:/)).toHaveTextContent('Vida: 556 / 700');
  });

  it('mantener Enter pulsado no ataca', () => {
    renderGyms();
    fireEvent.click(actionButton());
    const attack = actionButton();
    // fireEvent devuelve false si el evento se canceló con preventDefault.
    expect(fireEvent.keyDown(attack, { key: 'Enter', repeat: true })).toBe(
      false,
    );
    expect(fireEvent.keyDown(attack, { key: 'Enter', repeat: false })).toBe(
      true,
    );
  });

  it('el foco sigue al botón que toca, para jugar con teclado', () => {
    renderGyms({ upgrades: { clickPower: 699 } });
    expect(actionButton()).toHaveFocus();
    fireEvent.click(actionButton()); // empezar
    expect(actionButton()).toHaveFocus();
    fireEvent.click(actionButton()); // un click: 700 de daño
    expect(
      screen.getByRole('button', { name: 'Volver a los gimnasios' }),
    ).toHaveFocus();
  });

  it('salir a mitad de combate para el temporizador', () => {
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval');
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');
    const { unmount } = renderGyms();
    fireEvent.click(actionButton());
    const battleInterval = setIntervalSpy.mock.results.at(-1).value;
    unmount();
    expect(clearIntervalSpy).toHaveBeenCalledWith(battleInterval);
  });
});
