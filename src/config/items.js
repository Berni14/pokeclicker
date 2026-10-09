// Objetos de la tienda. Solo multiplican el dinero (clicks o producción), no el
// daño en combate. `effect` es el texto que se ve en la tienda: si cambias un
// número, cámbialo también.

// Permanentes: se compran una vez y duran toda la generación. Se multiplican
// entre sí (Garra Rápida × Cinta Elección = click ×6).
export const ITEMS = {
  quickClaw: {
    label: 'Garra Rápida',
    effect: 'Dinero por click ×2',
    target: 'click',
    multiplier: 2,
    cost: 3000,
    minTrainerLevel: 2,
  },
  amuletCoin: {
    label: 'Amuleto Moneda',
    effect: 'Producción ×2',
    target: 'production',
    multiplier: 2,
    cost: 20_000,
    minTrainerLevel: 3,
  },
  choiceBand: {
    label: 'Cinta Elección',
    effect: 'Dinero por click ×3',
    target: 'click',
    multiplier: 3,
    cost: 250_000,
    minTrainerLevel: 5,
  },
  leftovers: {
    label: 'Restos',
    effect: 'Producción ×3',
    target: 'production',
    multiplier: 3,
    cost: 600_000,
    minTrainerLevel: 6,
  },
};

// Potenciadores: de un solo uso, durante `seconds`. Su precio son
// `costSeconds` segundos de lo que ganas ahora (sin potenciadores), con un
// mínimo: así nunca se quedan baratos ni imposibles. Comprar otro mientras
// dura suma el tiempo, hasta BOOST_MAX_SECONDS.
export const BOOSTS = {
  xAttack: {
    label: 'Ataque X',
    effect: 'Dinero por click ×5 durante 60 s',
    target: 'click',
    multiplier: 5,
    seconds: 60,
    costSeconds: 60, // 60 s clicando a BOOST_CLICKS_PER_SECOND
    minTrainerLevel: 1,
  },
  luckIncense: {
    label: 'Incienso Duplo',
    effect: 'Producción ×2 durante 10 min',
    target: 'production',
    multiplier: 2,
    seconds: 600,
    costSeconds: 240,
    minTrainerLevel: 2,
  },
};

export const BOOST_MIN_COST = 100;
export const BOOST_MAX_SECONDS = 3600;
export const BOOST_CLICKS_PER_SECOND = 5; // para poner precio a lo que da un click
