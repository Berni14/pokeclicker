import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ItemCard } from './ItemCard';
import { BOOSTS, ITEMS } from '../../config/items';

const props = {
  itemKey: 'quickClaw',
  item: ITEMS.quickClaw,
  cost: 3000,
  canAfford: true,
  onBuy: () => {},
};

describe('ItemCard', () => {
  it('disponible: efecto, precio y botón que llama a onBuy con la clave', () => {
    const onBuy = vi.fn();
    render(<ItemCard {...props} status="available" onBuy={onBuy} />);
    expect(screen.getByText('Dinero por click ×2')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Comprar · 3\smil/ }));
    expect(onBuy).toHaveBeenCalledWith('quickClaw');
  });

  it('sin dinero, el botón está deshabilitado', () => {
    render(<ItemCard {...props} status="available" canAfford={false} />);
    expect(screen.getByRole('button', { name: /Comprar/ })).toBeDisabled();
  });

  it('bloqueado y comprado se indican con texto, sin botón', () => {
    const { rerender } = render(<ItemCard {...props} status="locked" />);
    expect(
      screen.getByText('Se desbloquea en el nivel 2 de entrenador'),
    ).toBeInTheDocument();
    rerender(<ItemCard {...props} status="owned" />);
    expect(screen.getByText('Comprado')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('un potenciador activo enseña el tiempo y se puede alargar', () => {
    render(
      <ItemCard
        {...props}
        itemKey="xAttack"
        item={BOOSTS.xAttack}
        cost={300}
        status="available"
        timeLeft={41.5}
      />,
    );
    expect(screen.getByText(/^Activo:/)).toHaveTextContent('Activo: 0:42');
    expect(
      screen.getByRole('button', { name: 'Alargar · 300' }),
    ).toBeInTheDocument();
  });
});
