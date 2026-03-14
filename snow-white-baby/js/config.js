/**
 * Snow White Baby game configuration
 */

// Foods the baby can want
export const FOODS = [
  { type: 'apple', emoji: '🍎', name: '사과', color: '#FF0000' },
  { type: 'strawberry', emoji: '🍓', name: '딸기', color: '#FF4444' },
  { type: 'grape', emoji: '🍇', name: '포도', color: '#8B008B' },
  { type: 'cherry', emoji: '🍒', name: '체리', color: '#DC143C' },
  { type: 'bread', emoji: '🍞', name: '빵', color: '#DEB887' },
  { type: 'cheese', emoji: '🧀', name: '치즈', color: '#FFD700' },
  { type: 'pie', emoji: '🥧', name: '파이', color: '#CD853F' },
  { type: 'honey', emoji: '🍯', name: '꿀', color: '#FFB347' },
  { type: 'milk', emoji: '🥛', name: '우유', color: '#FFFAFA' },
  { type: 'mushroom', emoji: '🍄', name: '버섯', color: '#8B4513' },
  { type: 'blueberry', emoji: '🫐', name: '블루베리', color: '#4169E1' },
  { type: 'carrot', emoji: '🥕', name: '당근', color: '#FF8C00' },
];

// Delivery animals
export const ANIMALS = [
  { type: 'bird', emoji: '🐦', name: '새', speed: 120, size: 40 },
  { type: 'rabbit', emoji: '🐰', name: '토끼', speed: 80, size: 50 },
  { type: 'deer', emoji: '🦌', name: '사슴', speed: 50, size: 65 },
  { type: 'squirrel', emoji: '🐿️', name: '다람쥐', speed: 110, size: 42 },
];

// Poison crow
export const POISON = {
  emoji: '🐦‍⬛',
  name: '까마귀',
  foodEmoji: '☠️🍎',
  foodName: '독사과',
  speed: 90,
  size: 50,
  stayDuration: 4, // seconds before flying away
};

// Baby growth stages
export const GROWTH_STAGES = [
  { name: '콩알', size: 0.3, threshold: 0, desc: '아주 작은 아기에요' },
  { name: '새우', size: 0.45, threshold: 0.15, desc: '조금 커졌어요!' },
  { name: '레몬', size: 0.6, threshold: 0.30, desc: '점점 자라고 있어요!' },
  { name: '사과', size: 0.75, threshold: 0.50, desc: '많이 컸어요!' },
  { name: '멜론', size: 0.9, threshold: 0.70, desc: '거의 다 자랐어요!' },
  { name: '아기', size: 1.0, threshold: 0.90, desc: '세상에 나올 준비!' },
];

// Game settings
export const GAME = {
  maxGrowth: 100,
  growthPerCorrect: 8,
  growthPerWrong: -2,
  dislikePerWrong: 20,
  dislikeDecay: 3,
  maxDislike: 100,
  poisonPenalty: -15,       // growth penalty for tapping poison
  poisonDislike: 40,        // dislike penalty for tapping poison
  curseDuration: 5,         // magic mirror curse duration
  wantChangeInterval: 10,
  comboBonus: 2,
  maxAnimals: 5,
  minAnimals: 3,
  animalSpawnInterval: 2,   // seconds between spawns
  crowInterval: 15,         // seconds between crow appearances
  wantedFoodChance: 0.4,    // 40% chance animal carries wanted food
};
