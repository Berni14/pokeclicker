// Nombres de la API que no salen bien solo con mayúsculas y espacios.
const SPECIAL_NAMES = {
  'nidoran-f': 'Nidoran♀',
  'nidoran-m': 'Nidoran♂',
  farfetchd: "Farfetch'd",
  'mr-mime': 'Mr. Mime',
  'ho-oh': 'Ho-Oh',
  'mime-jr': 'Mime Jr.',
  'porygon-z': 'Porygon-Z',
};

const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1);

// "mr-mime" → "Mr. Mime", "pikachu" → "Pikachu".
export function formatName(name) {
  return SPECIAL_NAMES[name] ?? name.split('-').map(capitalize).join(' ');
}
