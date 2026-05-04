/**
 * 보리랑 팝콘 만들기 - configuration
 */

// 재료 - 옥수수는 항상 먼저, 그 다음 맛 재료
export const CORN = {
  id: 'corn',
  emoji: '🌽',
  name: '옥수수',
  color: '#FFE066',
};

// 맛 재료들. 각 재료에 따라 팝콘 색이 달라진다.
export const FLAVORS = [
  { id: 'butter',     emoji: '🧈', name: '버터',     color: '#FFD93D', popColor: '#FFE082', popCore: '#FFB300', label: '노란 팝콘' },
  { id: 'strawberry', emoji: '🍓', name: '딸기시럽', color: '#FF4D6D', popColor: '#FFB3C1', popCore: '#FF4D6D', label: '분홍 팝콘' },
  { id: 'chocolate',  emoji: '🍫', name: '초콜릿',   color: '#6B3410', popColor: '#A0522D', popCore: '#5A2A0A', label: '초코 팝콘' },
  { id: 'grape',      emoji: '🍇', name: '포도시럽', color: '#7E3FBF', popColor: '#C39BD3', popCore: '#7E3FBF', label: '보라 팝콘' },
  { id: 'matcha',     emoji: '🍵', name: '말차가루', color: '#5BA84A', popColor: '#A5D6A7', popCore: '#388E3C', label: '초록 팝콘' },
  { id: 'blueberry',  emoji: '🫐', name: '블루베리', color: '#3F6FE0', popColor: '#90CAF9', popCore: '#1E5DC9', label: '파란 팝콘' },
  { id: 'rainbow',    emoji: '🌈', name: '무지개가루', color: '#FF66CC', popColor: 'rainbow', popCore: 'rainbow', label: '무지개 팝콘' },
];

// 단계
export const STEPS = {
  EMPTY: 0,        // 옥수수 넣어주세요
  CORN: 1,         // 맛 골라주세요
  FLAVORED: 2,     // 기계 돌려주세요!
  COOKING: 3,      // 펑펑 튀는 중
  DONE: 4,         // 결과 보여줌
};

export const GAME = {
  goalPopcorns: 30,         // 목표 팝콘 수 (보리 배 채우기)
  popcornsPerBatch: 6,      // 한 번에 튀어나오는 팝콘 수
  cookingDuration: 2.2,     // 기계 돌리는 시간(초)
  bowlCapacity: 30,         // 그릇이 다 차는 기준
  wantBonusChance: 0.6,     // 보리가 특정 색을 원할 확률
};

// 무지개 색상 팔레트 (rainbow popcorn)
export const RAINBOW = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#B983FF', '#FF8FB1'];
