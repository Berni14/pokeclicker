import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App.jsx';

describe('App', () => {
  it('muestra el título del juego', () => {
    render(<App />);
    expect(
      screen.getByRole('heading', { name: 'Pokémon Clicker' }),
    ).toBeInTheDocument();
  });
});
