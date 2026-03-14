/**
 * Generic achievement system - tracks and persists player achievements
 * Pass achievement definitions to constructor
 *
 * Usage:
 *   const achievements = [
 *     { id: 'first_score', emoji: '🎯', name: 'First!', desc: 'Score your first point', check: s => s.score >= 1 },
 *   ];
 *   const mgr = new AchievementManager(achievements, 'myGame_achievements');
 */
export class AchievementManager {
  constructor(achievements, storageKey = 'game_achievements') {
    this.achievements = achievements;
    this.storageKey = storageKey;
    this.unlocked = this._load();
    this.pending = [];
  }

  _load() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  }

  _save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.unlocked));
    } catch { /* ignore */ }
  }

  check(stats) {
    for (const ach of this.achievements) {
      if (this.unlocked.includes(ach.id)) continue;
      if (ach.check(stats)) {
        this.unlocked.push(ach.id);
        this.pending.push(ach);
      }
    }
    if (this.pending.length > 0) this._save();
  }

  popPending() {
    return this.pending.shift() || null;
  }

  getAll() {
    return this.achievements.map(a => ({
      ...a,
      unlocked: this.unlocked.includes(a.id),
    }));
  }

  getUnlockedCount() {
    return this.unlocked.length;
  }

  getTotalCount() {
    return this.achievements.length;
  }

  reset() {
    this.unlocked = [];
    this.pending = [];
    this._save();
  }
}
