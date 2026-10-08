import { useEffect, useId, useRef } from 'react';
import styles from './Modal.module.css';

// <dialog> nativo: gestiona el foco y el fondo por nosotros. Solo se abre y se
// cierra según `open`. Escape no lo cierra por su cuenta: avisa con onClose.
// (El evento `close` del <dialog> llega tarde: si se escuchara, un cierre
// seguido de una apertura rápida cerraría también el modal nuevo.)
export function Modal({ open, onClose, title, children }) {
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className={styles.header}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
      </div>
      {open && children}
    </dialog>
  );
}
