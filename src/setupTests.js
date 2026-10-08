import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(cleanup);

// jsdom no implementa los métodos de <dialog>: se simulan con el atributo `open`.
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close() {
    this.open = false;
    this.dispatchEvent(new Event('close'));
  };
}

// Cada test empieza sin partida guardada ni caché. Antes y no después: al
// desmontar la app, el autoguardado vuelve a escribir la partida.
beforeEach(() => localStorage.clear());

// jsdom no tiene matchMedia. Se simula un usuario que prefiere menos
// animaciones: así los tests no esperan a que terminen.
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: query.includes('prefers-reduced-motion: reduce'),
    media: query,
    addEventListener() {},
    removeEventListener() {},
  });
}
