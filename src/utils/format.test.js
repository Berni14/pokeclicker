import { describe, it, expect } from 'vitest';
import { formatName } from './format';

describe('formatName', () => {
  it('pone la primera letra en mayúscula', () => {
    expect(formatName('pikachu')).toBe('Pikachu');
  });

  it('resuelve los nombres especiales de la primera generación', () => {
    expect(formatName('mr-mime')).toBe('Mr. Mime');
    expect(formatName('nidoran-f')).toBe('Nidoran♀');
    expect(formatName('nidoran-m')).toBe('Nidoran♂');
    expect(formatName('farfetchd')).toBe("Farfetch'd");
  });

  it('separa con espacios los nombres compuestos que no son especiales', () => {
    expect(formatName('tapu-koko')).toBe('Tapu Koko');
  });
});
