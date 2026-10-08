import { describe, it, expect } from 'vitest';
import { formatDexNumber, formatName, formatNumber } from './format';

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

describe('formatNumber', () => {
  // Entre el número y la unidad, Intl pone un espacio que no se parte.
  const NBSP = ' ';

  it('números pequeños tal cual, con coma decimal', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(999)).toBe('999');
    expect(formatNumber(7.5)).toBe('7,5');
  });

  it('miles y millones abreviados', () => {
    expect(formatNumber(1500)).toBe(`1,5${NBSP}mil`);
    expect(formatNumber(2_300_000)).toBe(`2,3${NBSP}M`);
  });

  it('como mucho un decimal', () => {
    expect(formatNumber(14.94)).toBe('14,9');
  });
});

describe('formatDexNumber', () => {
  it('rellena con ceros hasta tres cifras', () => {
    expect(formatDexNumber(1)).toBe('#001');
    expect(formatDexNumber(25)).toBe('#025');
    expect(formatDexNumber(151)).toBe('#151');
  });
});
