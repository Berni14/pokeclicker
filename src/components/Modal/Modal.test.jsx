import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Modal } from './Modal';

describe('Modal', () => {
  it('se abre y se cierra según `open`', () => {
    const { rerender } = render(
      <Modal open onClose={() => {}} title="Hola">
        <p>Contenido</p>
      </Modal>,
    );
    expect(screen.getByRole('dialog', { name: 'Hola' })).toBeVisible();
    expect(screen.getByText('Contenido')).toBeInTheDocument();

    rerender(
      <Modal open={false} onClose={() => {}} title="Hola">
        <p>Contenido</p>
      </Modal>,
    );
    expect(screen.queryByText('Contenido')).not.toBeInTheDocument();
  });

  it('el botón Cerrar y la tecla Escape avisan con onClose', () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Hola">
        <p>Contenido</p>
      </Modal>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    // Escape en un <dialog> lanza el evento `cancel`.
    fireEvent(
      screen.getByRole('dialog'),
      new Event('cancel', { cancelable: true }),
    );
    expect(onClose).toHaveBeenCalledTimes(2);
    // Escape no lo cierra por su cuenta: lo decide el padre con `open`.
    expect(screen.getByRole('dialog')).toHaveAttribute('open');
  });

  it('cerrar y volver a abrir seguido no cierra el modal nuevo', async () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <Modal open onClose={onClose} title="A">
        <p>A</p>
      </Modal>,
    );
    rerender(
      <Modal open={false} onClose={onClose} title="A">
        <p>A</p>
      </Modal>,
    );
    rerender(
      <Modal open onClose={onClose} title="B">
        <p>B</p>
      </Modal>,
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'B' })).toHaveAttribute('open');
  });
});
