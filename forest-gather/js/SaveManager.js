/**
 * Save system for encyclopedia exploration game
 * Stores both current stage progress and overall encyclopedia completion
 */
const SAVE_KEY = 'forest-gather-save';
const ENCYCLOPEDIA_KEY = 'forest-gather-encyclopedia';

// Current stage save (in-progress exploration)
export function hasSave() {
  return localStorage.getItem(SAVE_KEY) !== null;
}

export function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function writeSave(data) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch { /* quota exceeded */ }
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}

// Encyclopedia (persistent collection across all stages)
export function loadEncyclopedia() {
  try {
    const raw = localStorage.getItem(ENCYCLOPEDIA_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function saveEncyclopedia(data) {
  try {
    localStorage.setItem(ENCYCLOPEDIA_KEY, JSON.stringify(data));
  } catch { /* quota exceeded */ }
}

/** Mark items as discovered in encyclopedia for a specific stage */
export function updateEncyclopedia(stageId, discoveredIds) {
  const enc = loadEncyclopedia();
  const existing = new Set(enc[stageId] || []);
  for (const id of discoveredIds) {
    existing.add(id);
  }
  enc[stageId] = [...existing];
  saveEncyclopedia(enc);
  return enc;
}
