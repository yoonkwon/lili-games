/**
 * Elsa Baby game configuration
 * Snowflake falling mechanic - Frozen theme
 */

// Foods the baby can want
export const FOODS = [
  { type: 'strawberry', emoji: '🍓', name: '딸기', color: '#FF4444' },
  { type: 'chocolate', emoji: '🍫', name: '초콜릿', color: '#8B4513' },
  { type: 'icecream', emoji: '🍦', name: '아이스크림', color: '#FFE4B5' },
  { type: 'cake', emoji: '🍰', name: '케이크', color: '#FFB6C1' },
  { type: 'cookie', emoji: '🍪', name: '쿠키', color: '#D2691E' },
  { type: 'apple', emoji: '🍎', name: '사과', color: '#FF0000' },
  { type: 'grape', emoji: '🍇', name: '포도', color: '#8B008B' },
  { type: 'milk', emoji: '🥛', name: '우유', color: '#FFFAFA' },
  { type: 'bread', emoji: '🍞', name: '빵', color: '#DEB887' },
  { type: 'candy', emoji: '🍬', name: '사탕', color: '#FF69B4' },
  { type: 'banana', emoji: '🍌', name: '바나나', color: '#FFE135' },
  { type: 'watermelon', emoji: '🍉', name: '수박', color: '#2E8B57' },
];

// Troll villain (disguised as snowflake)
export const TROLL = {
  emoji: '⛄',
  name: '트롤',
  foodEmoji: '☠️❄️',
  foodName: '독눈송이',
  speed: 35,
  size: 55,
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
  freezeDuration: 5,
  wantChangeInterval: 10,
  comboBonus: 2,
  maxSnowflakes: 6,        // max snowflakes on screen
  minSnowflakes: 3,        // minimum to maintain
  snowflakeSpawnInterval: 1.5, // seconds between spawns
  trollInterval: 15,       // seconds between troll appearances
  poisonPenalty: -15,
  poisonDislike: 40,
  wantedFoodChance: 0.5,   // 50% chance snowflake carries wanted food
};
