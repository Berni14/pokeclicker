import { describe, it, expect } from 'vitest';
import { toPokemon, FALLBACK_SPRITE } from './pokemon';
import pikachu from '../__mocks__/pikachu.json';
import pikachuSpecies from '../__mocks__/pikachu-species.json';
import mewtwo from '../__mocks__/mewtwo.json';
import mewtwoSpecies from '../__mocks__/mewtwo-species.json';
import chansey from '../__mocks__/chansey.json';
import chanseySpecies from '../__mocks__/chansey-species.json';

describe('toPokemon', () => {
  it('transforma una respuesta real al modelo reducido', () => {
    expect(toPokemon(pikachu, pikachuSpecies)).toEqual({
      id: 25,
      name: 'pikachu',
      sprite:
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
      types: ['electric'],
      stats: {
        hp: 35,
        attack: 55,
        defense: 40,
        'special-attack': 50,
        'special-defense': 50,
        speed: 90,
      },
      statTotal: 320,
      rarity: 'rare',
    });
  });

  it('usa el pixel art si no hay artwork oficial', () => {
    const raw = {
      ...pikachu,
      sprites: { ...pikachu.sprites, other: {} },
    };
    expect(toPokemon(raw, pikachuSpecies).sprite).toBe(
      pikachu.sprites.front_default,
    );
  });

  it('usa la imagen de reserva si no hay ningún sprite', () => {
    const raw = { ...pikachu, sprites: { front_default: null, other: null } };
    expect(toPokemon(raw, pikachuSpecies).sprite).toBe(FALLBACK_SPRITE);
  });

  it('ordena los tipos por slot', () => {
    const raw = {
      ...pikachu,
      types: [
        { slot: 2, type: { name: 'poison' } },
        { slot: 1, type: { name: 'grass' } },
      ],
    };
    expect(toPokemon(raw, pikachuSpecies).types).toEqual(['grass', 'poison']);
  });

  it('marca a Mewtwo como legendario', () => {
    expect(toPokemon(mewtwo, mewtwoSpecies).rarity).toBe('legendary');
  });

  it('no marca a Chansey como legendaria aunque tenga mucha experiencia', () => {
    expect(chansey.base_experience).toBeGreaterThan(mewtwo.base_experience);
    expect(toPokemon(chansey, chanseySpecies).rarity).toBe('epic');
  });

  it('no guarda campos de la API que no se usan', () => {
    expect(toPokemon(pikachu, pikachuSpecies)).not.toHaveProperty(
      'base_experience',
    );
  });
});
