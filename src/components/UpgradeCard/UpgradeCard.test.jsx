import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { UpgradeCard } from './UpgradeCard';
import { UPGRADES } from '../../config/upgrades';

const props = {
  upgradeKey: 'training',
  upgrade: UPGRADES.training,
  level: 2,
  cost: 3072,
  canAfford: true,
  onBuy: () => {},
};

describe('UpgradeCard', () => {
  it('disponible: nivel, coste y botón que llama a onBuy con la clave', () => {
    const onBuy = vi.fn();
    render(<UpgradeCard {...props} status="available" onBuy={onBuy} />);
    expect(screen.getByText('Nv 2/10')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Mejorar · 3,1/ }));
    expect(onBuy).toHaveBeenCalledWith('training');
  });

  it('sin dinero, el botón está deshabilitado', () => {
    render(<UpgradeCard {...props} status="available" canAfford={false} />);
    expect(screen.getByRole('button', { name: /Mejorar/ })).toBeDisabled();
  });

  it('bloqueada y máximo se indican con texto, sin botón', () => {
    const { rerender } = render(<UpgradeCard {...props} status="locked" />);
    expect(
      screen.getByText('Se desbloquea en el nivel 2 de entrenador'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    rerender(<UpgradeCard {...props} status="max" level={10} />);
    expect(screen.getByText('Máximo')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
