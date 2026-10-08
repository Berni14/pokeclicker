// true si el usuario ha pedido menos animaciones en su sistema. Las animaciones
// de CSS ya lo respetan con @media; esto es para las esperas hechas en JS.
export const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
