/**
 * Achievement system - tracks and persists player achievements
 */

const ACHIEVEMENTS = [
  // Egg milestones
  { id: 'first_egg',       emoji: '🥚', name: '첫 알!',          desc: '알을 처음 낳았어!',       check: s => s.totalEggs >= 1 },
  { id: 'egg_10',          emoji: '🧺', name: '알 수집가',       desc: '알 10개를 모았어!',        check: s => s.basketEggs >= 10 },
  { id: 'egg_50',          emoji: '🏆', name: '반이나 왔다!',    desc: '알 50개를 모았어!',        check: s => s.basketEggs >= 50 },
  { id: 'egg_100',         emoji: '👑', name: '알 마스터',       desc: '알 100개를 모았어!',       check: s => s.basketEggs >= 100 },

  // Golden eggs
  { id: 'golden_first',    emoji: '⭐', name: '황금알!',         desc: '황금알을 처음 얻었어!',    check: s => s.goldenEggs >= 1 },
  { id: 'golden_10',       emoji: '🌟', name: '황금 수집가',     desc: '황금알 10개를 모았어!',    check: s => s.goldenEggs >= 10 },

  // Combo
  { id: 'combo_5',         emoji: '⚡', name: '빠른 손!',        desc: '5 콤보를 달성했어!',       check: s => s.comboCount >= 5 },
  { id: 'combo_10',        emoji: '🔥', name: '번개 손!',        desc: '10 콤보를 달성했어!',      check: s => s.comboCount >= 10 },

  // Chicks
  { id: 'chick_first',     emoji: '🐣', name: '첫 병아리',       desc: '병아리가 태어났어!',       check: s => s.chickCount >= 1 },
  { id: 'chick_5',         emoji: '🐥', name: '대가족',          desc: '병아리 5마리를 모았어!',   check: s => s.chickCount >= 5 },

  // Defense
  { id: 'scare_first',     emoji: '💪', name: '용감한 닭!',      desc: '천적을 처음 쫓아냈어!',   check: s => s.predatorsScared >= 1 },
  { id: 'scare_10',        emoji: '🛡️', name: '농장 수호자',    desc: '천적 10마리를 쫓아냈어!', check: s => s.predatorsScared >= 10 },

  // Stages
  { id: 'stage_2',         emoji: '☀️', name: '여름이다!',       desc: '여름 들판에 도착!',        check: s => s.currentStage >= 1 },
  { id: 'stage_5',         emoji: '🌈', name: '무지개 마을!',    desc: '마지막 스테이지 도착!',    check: s => s.currentStage >= 4 },

  // Dogs
  { id: 'dog_first',       emoji: '🐕', name: '멍멍이 호출!',    desc: '보리와 좁쌀이를 처음 불렀어!', check: s => s.dogSummons >= 1 },
  { id: 'dog_5',           emoji: '🐕‍🦺', name: '강아지 대장',  desc: '강아지를 5번 호출했어!',    check: s => s.dogSummons >= 5 },

  // Difficulty clears
  { id: 'clear_baby',      emoji: '👶', name: '응애 클리어',     desc: '응애 난이도로 클리어!',    check: s => s.cleared && s.difficulty === 'baby' },
  { id: 'clear_sister',    emoji: '🧒', name: '동생 클리어',     desc: '동생 난이도로 클리어!',    check: s => s.cleared && s.difficulty === 'sister' },
  { id: 'clear_unni',      emoji: '👧', name: '언니 클리어',     desc: '언니 난이도로 클리어!',    check: s => s.cleared && s.difficulty === 'unni' },
  { id: 'clear_mom',       emoji: '👩', name: '엄마 클리어',     desc: '엄마 난이도로 클리어!',    check: s => s.cleared && s.difficulty === 'mom' },
];

const STORAGE_KEY = 'liliGames_achievements';

export class AchievementManager {
  constructor() {
    this.unlocked = this._load();
    this.pending = [];  // newly unlocked, waiting to display
  }

  _load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  }

  _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.unlocked));
    } catch { /* ignore */ }
  }

  check(stats) {
    for (const ach of ACHIEVEMENTS) {
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
    return ACHIEVEMENTS.map(a => ({
      ...a,
      unlocked: this.unlocked.includes(a.id),
    }));
  }

  getUnlockedCount() {
    return this.unlocked.length;
  }

  getTotalCount() {
    return ACHIEVEMENTS.length;
  }
}
