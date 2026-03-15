/**
 * Local save/load using localStorage
 */
const SAVE_KEY = 'forest-gather-save';

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
  } catch { /* quota exceeded - ignore */ }
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}
