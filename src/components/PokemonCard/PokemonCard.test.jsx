import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { PokemonCard } from './PokemonCard';
import { pokedexEntry } from '../../config/pokedex';

const pikachu = { id: 25, name: 'pikachu', sprite: 'https://ejemplo/25.png' };

describe('PokemonCard', () => {
  it('muestra número, nombre, imagen, tipo, rareza, estrellas y producción', () => {
    render(
      <PokemonCard
        entry={pokedexEntry(25)}
        pokemon={pikachu}
        stars={3}
        production={2}
      />,
    );
    expect(screen.getByText('#025')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Pikachu' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Pikachu' })).toHaveAttribute(
      'src',
      pikachu.sprite,
    );
    expect(screen.getByText('Eléctrico')).toBeInTheDocument();
    expect(screen.getByText('Común')).toBeInTheDocument();
    expect(screen.getByText('3 de 5 estrellas')).toBeInTheDocument();
    expect(screen.getByText(/^2/)).toHaveTextContent('2 /s');
  });

  it('mientras no llegan los datos de la API, enseña el loader', () => {
    render(<PokemonCard entry={pokedexEntry(25)} stars={1} production={1} />);
    expect(screen.getByRole('status')).toHaveTextContent('Cargando Pokémon…');
    // Lo que sale de la tabla de la Pokédex ya se ve.
    expect(screen.getByText('Eléctrico')).toBeInTheDocument();
  });

  it('la acción recibe el id', () => {
    const onAction = vi.fn();
    render(
      <PokemonCard
        entry={pokedexEntry(25)}
        pokemon={pikachu}
        stars={1}
        production={1}
        actionLabel="Equipar"
        onAction={onAction}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Equipar a Pikachu' }));
    expect(onAction).toHaveBeenCalledWith(25);
  });
});
