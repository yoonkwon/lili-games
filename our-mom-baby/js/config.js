/**
 * Our Mom Baby game configuration
 * Nutrient bubble mechanic - family warmth theme
 */

// Foods the baby can want
export const FOODS = [
  { type: 'strawberry', emoji: '🍓', name: '딸기', color: '#FF4444' },
  { type: 'milk', emoji: '🥛', name: '우유', color: '#FFFAFA' },
  { type: 'apple', emoji: '🍎', name: '사과', color: '#FF0000' },
  { type: 'banana', emoji: '🍌', name: '바나나', color: '#FFE135' },
  { type: 'grape', emoji: '🍇', name: '포도', color: '#8B008B' },
  { type: 'carrot', emoji: '🥕', name: '당근', color: '#FF8C00' },
  { type: 'broccoli', emoji: '🥦', name: '브로콜리', color: '#228B22' },
  { type: 'egg', emoji: '🥚', name: '달걀', color: '#FAEBD7' },
  { type: 'cheese', emoji: '🧀', name: '치즈', color: '#FFD700' },
  { type: 'bread', emoji: '🍞', name: '빵', color: '#DEB887' },
  { type: 'orange', emoji: '🍊', name: '오렌지', color: '#FFA500' },
  { type: 'watermelon', emoji: '🍉', name: '수박', color: '#2E8B57' },
];

// Virus villain
export const VIRUS = {
  emoji: '🦠',
  name: '세균',
  speed: 40,
  size: 50,
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
  feverDuration: 5,
  wantChangeInterval: 10,
  comboBonus: 2,
  maxBubbles: 6,
  minBubbles: 3,
  bubbleSpawnInterval: 1.8,
  virusInterval: 15,
  virusPenalty: -15,
  virusDislike: 40,
  wantedFoodChance: 0.5,
};
