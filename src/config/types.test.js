import { describe, it, expect } from 'vitest';
import { TYPE_COLORS, TYPE_NAMES } from './types';

// Contraste WCAG entre un color y el blanco.
function contrastWithWhite(hex) {
  const channel = (i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const luminance =
    0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
  return 1.05 / (luminance + 0.05);
}

describe('colores de tipo', () => {
  it('todos los tipos tienen color y nombre en español', () => {
    expect(Object.keys(TYPE_NAMES).sort()).toEqual(
      Object.keys(TYPE_COLORS).sort(),
    );
  });

  it.each(Object.entries(TYPE_COLORS))(
    '%s (%s) tiene contraste suficiente con texto blanco',
    (_, color) => {
      expect(contrastWithWhite(color)).toBeGreaterThanOrEqual(4.5);
    },
  );
});
