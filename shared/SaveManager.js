/**
 * Generic localStorage save manager
 * Usage: const save = new SaveManager('my-game-save');
 */
export class SaveManager {
  constructor(key) {
    this.key = key;
  }

  load() {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  write(data) {
    try { localStorage.setItem(this.key, JSON.stringify(data)); } catch { /* ignore */ }
  }

  clear() {
    localStorage.removeItem(this.key);
  }

  has() {
    return localStorage.getItem(this.key) !== null;
  }
}
