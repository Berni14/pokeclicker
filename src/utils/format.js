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

const compact = new Intl.NumberFormat('es-ES', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

// 1500 → "1,5 mil", 2300000 → "2,3 M". Entre número y unidad va un espacio
// que no se parte (U+00A0, el espacio de no separación).
export const formatNumber = (n) => compact.format(n);

// Número de la Pokédex con tres cifras: 25 → "#025".
export const formatDexNumber = (id) => `#${String(id).padStart(3, '0')}`;

// Duración legible: 45 → "45 s", 300 → "5 min", 7500 → "2 h 5 min".
export function formatDuration(totalSeconds) {
  const seconds = Math.floor(totalSeconds);
  if (seconds < 60) return `${seconds} s`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours === 0) return `${minutes} min`;
  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`;
}
