// Caché de Pokémon ya transformados: en memoria y, detrás, en localStorage.
// Solo se guarda el modelo reducido, nunca la respuesta de la API.
const STORAGE_KEY = 'pkc:pokemon:v1';

const memory = new Map();
let storageLoaded = false;

function loadFromStorage() {
  if (storageLoaded) return;
  storageLoaded = true;
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(saved)) return;
    for (const pokemon of saved) {
      if (Number.isInteger(pokemon?.id)) memory.set(pokemon.id, pokemon);
    }
  } catch {
    // Sin localStorage (incógnito, bloqueado) o datos corruptos: solo memoria.
  }
}

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...memory.values()]));
  } catch {
    // Almacenamiento lleno o bloqueado: la caché en memoria sigue funcionando.
  }
}

export function getCached(id) {
  loadFromStorage();
  return memory.get(Number(id));
}

export function setCached(pokemon) {
  loadFromStorage();
  memory.set(pokemon.id, pokemon);
  saveToStorage();
}

export function clearCache() {
  memory.clear();
  storageLoaded = false;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nada que borrar si no hay localStorage.
  }
}
