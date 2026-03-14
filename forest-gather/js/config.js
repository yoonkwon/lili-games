/**
 * Game configuration - rounds, items, companions, difficulty
 */

// Round definitions
export const ROUNDS = [
  {
    id: 1,
    name: '꽃밭 초원',
    emoji: '🌸',
    target: 15,
    bgColor: '#87CEEB',
    groundColor: '#90EE90',
    items: [
      { type: 'flower', emoji: '🌷', name: '튤립', rarity: 'common' },
      { type: 'flower2', emoji: '🌻', name: '해바라기', rarity: 'common' },
      { type: 'butterfly', emoji: '🦋', name: '나비', rarity: 'shiny' },
      { type: 'strawberry', emoji: '🍓', name: '딸기', rarity: 'common' },
      { type: 'clover', emoji: '🍀', name: '네잎클로버', rarity: 'rare' },
      { type: 'fairy_flower', emoji: '💮', name: '요정꽃', rarity: 'legendary' },
    ],
    unlockCompanion: null,
  },
  {
    id: 2,
    name: '깊은 숲',
    emoji: '🌲',
    target: 20,
    bgColor: '#4a7c59',
    groundColor: '#3d6b4f',
    items: [
      { type: 'mushroom', emoji: '🍄', name: '버섯', rarity: 'common' },
      { type: 'acorn', emoji: '🌰', name: '도토리', rarity: 'common' },
      { type: 'firefly', emoji: '✨', name: '반딧불이', rarity: 'shiny' },
      { type: 'pinecone', emoji: '🌲', name: '솔방울', rarity: 'common' },
      { type: 'owl_feather', emoji: '🪶', name: '부엉이 깃털', rarity: 'rare' },
      { type: 'forest_gem', emoji: '💎', name: '숲의 보석', rarity: 'legendary' },
    ],
    unlockCompanion: 'bori',
  },
  {
    id: 3,
    name: '반짝이 해변',
    emoji: '🏖️',
    target: 25,
    bgColor: '#87CEEB',
    groundColor: '#f4d793',
    items: [
      { type: 'shell', emoji: '🐚', name: '조개', rarity: 'common' },
      { type: 'starfish', emoji: '⭐', name: '불가사리', rarity: 'shiny' },
      { type: 'bottle', emoji: '🍾', name: '유리병 편지', rarity: 'rare' },
      { type: 'coral', emoji: '🪸', name: '산호', rarity: 'common' },
      { type: 'pearl', emoji: '🫧', name: '진주', rarity: 'rare' },
      { type: 'mermaid_tear', emoji: '💧', name: '인어의 눈물', rarity: 'legendary' },
    ],
    unlockCompanion: 'jopssal',
  },
  {
    id: 4,
    name: '구름 산',
    emoji: '🏔️',
    target: 30,
    bgColor: '#b3d9ff',
    groundColor: '#a8a8a8',
    items: [
      { type: 'star_piece', emoji: '⭐', name: '별조각', rarity: 'common' },
      { type: 'rainbow_flower', emoji: '🌈', name: '무지개꽃', rarity: 'shiny' },
      { type: 'crystal', emoji: '🔮', name: '크리스탈', rarity: 'rare' },
      { type: 'cloud_candy', emoji: '☁️', name: '구름사탕', rarity: 'common' },
      { type: 'thunder_stone', emoji: '⚡', name: '번개돌', rarity: 'rare' },
      { type: 'dragon_scale', emoji: '🐉', name: '용의 비늘', rarity: 'legendary' },
    ],
    unlockCompanion: 'gosun',
  },
  {
    id: 5,
    name: '별빛 하늘',
    emoji: '🌌',
    target: 35,
    bgColor: '#1a1a3e',
    groundColor: '#2d2d5e',
    items: [
      { type: 'shooting_star', emoji: '🌠', name: '별똥별', rarity: 'common' },
      { type: 'moon_piece', emoji: '🌙', name: '달조각', rarity: 'shiny' },
      { type: 'aurora_flower', emoji: '🌺', name: '오로라꽃', rarity: 'rare' },
      { type: 'comet_dust', emoji: '☄️', name: '혜성먼지', rarity: 'common' },
      { type: 'constellation', emoji: '✨', name: '별자리 조각', rarity: 'rare' },
      { type: 'cosmic_egg', emoji: '🥚', name: '우주알', rarity: 'legendary' },
    ],
    unlockCompanion: 'ikdol',
  },
];

// Item rarity config
export const RARITY = {
  common:    { value: 1, chance: 0.60, color: '#FFFFFF', glow: false },
  shiny:     { value: 2, chance: 0.25, color: '#FFD700', glow: true },
  rare:      { value: 3, chance: 0.12, color: '#9B59B6', glow: true },
  legendary: { value: 5, chance: 0.03, color: '#FF6B6B', glow: true },
};

// Companion definitions
export const COMPANIONS = {
  bori: {
    name: '보리',
    emoji: '🐕',
    desc: '검은 차우차우, 숨은 아이템을 찾아요!',
    color: '#333333',
    range: 80,
    collectSpeed: 3,
    ability: 'detect', // reveals hidden items every 30s
    abilityInterval: 30,
    speed: 100,
  },
  jopssal: {
    name: '좁쌀이',
    emoji: '🐶',
    desc: '점박이 강아지, 넓은 범위를 돌아다녀요!',
    color: '#D4A574',
    range: 150,
    collectSpeed: 2,
    ability: 'wide', // wider collection range
    speed: 180,
  },
  ikdol: {
    name: '익돌이',
    emoji: '🦖',
    desc: '주황색 익룡, 하늘을 날아요!',
    color: '#FF8C00',
    range: 200,
    collectSpeed: 4,
    ability: 'fly', // collects sky items
    speed: 140,
  },
  gosun: {
    name: '고순이',
    emoji: '🐱',
    desc: '흰색 얼룩 고양이, 희귀 아이템을 잘 찾아요!',
    color: '#FFFFFF',
    range: 100,
    collectSpeed: 2.5,
    ability: 'lucky', // increases rare item spawn chance nearby
    abilityInterval: 20,
    speed: 160,
  },
};

// Difficulty modes
export const DIFFICULTIES = {
  lisa: {
    label: '리사 모드',
    emoji: '👧',
    desc: '쉬움 (4살용)',
    color: '#FF69B4',
    targetMult: 0.7,
    spawnRate: 1.5,    // items per second
    moveSpeed: 120,
    collectRadius: 60,
    bonusTime: 0,
  },
  ria: {
    label: '리아 모드',
    emoji: '🧒',
    desc: '보통 (6살용)',
    color: '#4CAF50',
    targetMult: 1.0,
    spawnRate: 1.0,
    moveSpeed: 150,
    collectRadius: 50,
    bonusTime: 0,
  },
  together: {
    label: '함께 모드',
    emoji: '👧🧒',
    desc: '둘이 함께!',
    color: '#FF9800',
    targetMult: 1.3,
    spawnRate: 1.2,
    moveSpeed: 135,
    collectRadius: 55,
    bonusTime: 0,
  },
};

// Special events
export const EVENTS = [
  { type: 'star_rain',   emoji: '🌟', name: '별비!',       desc: '30초간 아이템 2배', chance: 0.15, duration: 30 },
  { type: 'butterflies', emoji: '🦋', name: '나비 무리!',  desc: '나비를 잡으면 보너스!', chance: 0.20, duration: 15 },
  { type: 'rainbow',     emoji: '🌈', name: '무지개!',     desc: '10초간 등급 UP', chance: 0.10, duration: 10 },
  { type: 'wind',        emoji: '💨', name: '바람!',       desc: '아이템이 흩어져요', chance: 0.15, duration: 0 },
  { type: 'gift',        emoji: '🎁', name: '선물 상자!',  desc: '터치하면 보너스!', chance: 0.05, duration: 0 },
];

// Round time
export const ROUND_TIME = 300; // 5 minutes in seconds
export const ROUND_EXTEND = 300; // extension time
