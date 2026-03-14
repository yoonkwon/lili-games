/**
 * Mermaid Baby game configuration
 */

// Foods the baby can want (ocean-themed)
export const FOODS = [
  { type: 'shrimp', emoji: '🦐', name: '새우', color: '#FF6B6B' },
  { type: 'fish', emoji: '🐟', name: '물고기', color: '#4FC3F7' },
  { type: 'crab', emoji: '🦀', name: '게', color: '#FF4444' },
  { type: 'shell', emoji: '🐚', name: '조개', color: '#FFE0B2' },
  { type: 'oyster', emoji: '🦪', name: '굴', color: '#B0BEC5' },
  { type: 'sushi', emoji: '🍣', name: '초밥', color: '#FF8A65' },
  { type: 'riceball', emoji: '🍙', name: '주먹밥', color: '#FAFAFA' },
  { type: 'seaweed', emoji: '🥬', name: '미역', color: '#66BB6A' },
  { type: 'seajuice', emoji: '🧃', name: '해초즙', color: '#81C784' },
  { type: 'coralcake', emoji: '🧁', name: '산호케이크', color: '#F48FB1' },
  { type: 'pearldango', emoji: '🍡', name: '진주경단', color: '#E0E0E0' },
  { type: 'seabutter', emoji: '🧈', name: '바다버터', color: '#FFE082' },
];

// Sea animals (delivery)
export const ANIMALS = [
  { type: 'tropicalfish', emoji: '🐠', name: '열대어', speed: 120, size: 40, swimAmplitude: 20, swimFrequency: 3 },
  { type: 'turtle', emoji: '🐢', name: '거북이', speed: 50, size: 65, swimAmplitude: 40, swimFrequency: 1 },
  { type: 'squid', emoji: '🦑', name: '오징어', speed: 100, size: 45, swimAmplitude: 30, swimFrequency: 5 },
  { type: 'crab', emoji: '🦀', name: '게', speed: 70, size: 50, swimAmplitude: 10, swimFrequency: 2 },
];

// Sea witch (poison)
export const POISON = {
  emoji: '🐙',
  name: '바다마녀',
  foodEmoji: '☠️🌿',
  foodName: '독해초',
  speed: 60,
  size: 55,
  stayDuration: 5,
};

// Baby growth stages
export const GROWTH_STAGES = [
  { name: '진주알', size: 0.3, threshold: 0, desc: '아주 작은 아기에요' },
  { name: '올챙이', size: 0.45, threshold: 0.15, desc: '조금 커졌어요!' },
  { name: '치어', size: 0.6, threshold: 0.30, desc: '점점 자라고 있어요!' },
  { name: '꼬마인어', size: 0.75, threshold: 0.50, desc: '많이 컸어요!' },
  { name: '인어아기', size: 0.9, threshold: 0.70, desc: '거의 다 자랐어요!' },
  { name: '공주님', size: 1.0, threshold: 0.90, desc: '세상에 나올 준비!' },
];

// Game settings
export const GAME = {
  maxGrowth: 100,
  growthPerCorrect: 8,
  growthPerWrong: -2,
  dislikePerWrong: 20,
  dislikeDecay: 3,
  maxDislike: 100,
  poisonPenalty: -15,
  poisonDislike: 40,
  curseDuration: 5,
  wantChangeInterval: 10,
  comboBonus: 2,
  maxAnimals: 5,
  minAnimals: 3,
  animalSpawnInterval: 2,
  crowInterval: 15,
  wantedFoodChance: 0.4,
};
