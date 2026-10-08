// Configuración para `npm run simulate`: ejecuta solo scripts/simulate.js.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['scripts/simulate.js'],
    environment: 'node',
  },
});
