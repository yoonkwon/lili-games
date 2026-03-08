/**
 * Difficulty presets for the chicken egg game
 */
export const DIFFICULTIES = {
  easy: {
    label: '쉬움',
    emoji: '😊',
    color: '#4CAF50',
    tapsPerEgg: 3,
    targetEggs: 50,
    predatorSpawnBase: 15,
    predatorSpawnScale: 0.04,
    predatorSpeedMult: 0.7,
    predatorStealMult: 0.5,
    goldenChanceBase: 0.18,
    goldenChanceComboBonus: 0.03,
  },
  normal: {
    label: '보통',
    emoji: '😎',
    color: '#FF9800',
    tapsPerEgg: 5,
    targetEggs: 100,
    predatorSpawnBase: 12,
    predatorSpawnScale: 0.08,
    predatorSpeedMult: 1.0,
    predatorStealMult: 1.0,
    goldenChanceBase: 0.12,
    goldenChanceComboBonus: 0.02,
  },
  hard: {
    label: '어려움',
    emoji: '🤩',
    color: '#F44336',
    tapsPerEgg: 6,
    targetEggs: 100,
    predatorSpawnBase: 9,
    predatorSpawnScale: 0.1,
    predatorSpeedMult: 1.4,
    predatorStealMult: 1.5,
    goldenChanceBase: 0.08,
    goldenChanceComboBonus: 0.015,
  },
};

export const DIFFICULTY_ORDER = ['easy', 'normal', 'hard'];
