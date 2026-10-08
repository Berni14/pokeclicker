// `effect` es el texto que se ve en la tienda: si cambias un número, cámbialo también.
export const UPGRADES = {
  clickPower: {
    label: 'Poder de click',
    effect: '+1 por click',
    baseCost: 160,
    growth: 1.5,
    maxLevel: 15,
    minTrainerLevel: 1,
  },
  training: {
    label: 'Entrenamiento',
    effect: '+15 % de producción',
    baseCost: 1200,
    growth: 1.6,
    maxLevel: 10,
    minTrainerLevel: 2,
  },
  battleDamage: {
    label: 'Ataque en combate',
    effect: '+20 % de daño por click',
    baseCost: 2400,
    growth: 1.7,
    maxLevel: 5,
    minTrainerLevel: 3,
  },
  battleTime: {
    label: 'Cronómetro',
    effect: '+5 s de combate',
    baseCost: 4000,
    growth: 2,
    maxLevel: 4,
    minTrainerLevel: 4,
  },
  pullDiscount: {
    label: 'Descuento en tiradas',
    effect: '−5 % en el precio',
    baseCost: 3200,
    growth: 1.8,
    maxLevel: 5,
    minTrainerLevel: 5,
  },
};
