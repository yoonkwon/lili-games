/**
 * Game configuration - educational encyclopedia stages
 * 리리탐험대 - 교육 탐험 게임
 */

// Stage definitions - each stage is an educational theme
export const STAGES = [
  {
    id: 'hangul',
    name: '한글 나라',
    emoji: '🇰🇷',
    desc: '자음을 찾아 떠나는 모험!',
    bgColor: '#87CEEB',
    groundColor: '#90EE90',
    decoEmojis: ['🌸', '🌷', '🌿', '🌻', '🍃'],
    terrain: 'forest',
    items: [
      { id: 'g', emoji: 'ㄱ', name: '기역 (ㄱ)', desc: '기린의 ㄱ! 기린은 세상에서 가장 키가 커요 🦒', size: 36 },
      { id: 'n', emoji: 'ㄴ', name: '니은 (ㄴ)', desc: '나비의 ㄴ! 나비는 발로 맛을 느껴요 🦋', size: 36 },
      { id: 'd', emoji: 'ㄷ', name: '디귿 (ㄷ)', desc: '다람쥐의 ㄷ! 다람쥐는 도토리를 3000개나 숨겨요 🐿️', size: 36 },
      { id: 'r', emoji: 'ㄹ', name: '리을 (ㄹ)', desc: '로켓의 ㄹ! 로켓은 초속 11km로 날아요 🚀', size: 36 },
      { id: 'm', emoji: 'ㅁ', name: '미음 (ㅁ)', desc: '무지개의 ㅁ! 무지개는 7가지 색이에요 🌈', size: 36 },
      { id: 'b', emoji: 'ㅂ', name: '비읍 (ㅂ)', desc: '별의 ㅂ! 밤하늘의 별은 셀 수 없이 많아요 ⭐', size: 36 },
      { id: 's', emoji: 'ㅅ', name: '시옷 (ㅅ)', desc: '사자의 ㅅ! 사자의 울음소리는 8km까지 들려요 🦁', size: 36 },
      { id: 'o', emoji: 'ㅇ', name: '이응 (ㅇ)', desc: '오리의 ㅇ! 오리 발에는 물갈퀴가 있어요 🦆', size: 36 },
      { id: 'j', emoji: 'ㅈ', name: '지읒 (ㅈ)', desc: '지구의 ㅈ! 지구는 빙글빙글 돌고 있어요 🌍', size: 36 },
      { id: 'ch', emoji: 'ㅊ', name: '치읓 (ㅊ)', desc: '치타의 ㅊ! 치타는 3초 만에 시속 100km! 🐆', size: 36 },
      { id: 'k', emoji: 'ㅋ', name: '키읔 (ㅋ)', desc: '코끼리의 ㅋ! 코끼리 코에는 뼈가 없어요 🐘', size: 36 },
      { id: 't', emoji: 'ㅌ', name: '티읕 (ㅌ)', desc: '토끼의 ㅌ! 토끼 이빨은 평생 자라요 🐰', size: 36 },
      { id: 'p', emoji: 'ㅍ', name: '피읖 (ㅍ)', desc: '포도의 ㅍ! 포도로 맛있는 주스를 만들 수 있어요 🍇', size: 36 },
      { id: 'h', emoji: 'ㅎ', name: '히읗 (ㅎ)', desc: '해바라기의 ㅎ! 해바라기는 해를 따라 움직여요 🌻', size: 36 },
      // 모음
      { id: 'v_a', emoji: 'ㅏ', name: '아 (ㅏ)', desc: '아이스크림의 ㅏ! 세상에서 가장 달콤한 소리 🍦', size: 36 },
      { id: 'v_eo', emoji: 'ㅓ', name: '어 (ㅓ)', desc: '어린이의 ㅓ! 어린이는 모두 소중해요 👧', size: 36 },
      { id: 'v_o', emoji: 'ㅗ', name: '오 (ㅗ)', desc: '오렌지의 ㅗ! 오렌지는 비타민C가 가득! 🍊', size: 36 },
      { id: 'v_u', emoji: 'ㅜ', name: '우 (ㅜ)', desc: '우주의 ㅜ! 우주는 끝이 없이 넓어요 🚀', size: 36 },
      { id: 'v_eu', emoji: 'ㅡ', name: '으 (ㅡ)', desc: '으뜸의 ㅡ! 모두가 으뜸이 될 수 있어요 🏆', size: 36 },
      { id: 'v_i', emoji: 'ㅣ', name: '이 (ㅣ)', desc: '이슬의 ㅣ! 아침 이슬은 반짝반짝 빛나요 💧', size: 36 },
    ],
  },
  {
    id: 'english',
    name: '영어 나라',
    emoji: '🔤',
    desc: 'ABC를 찾아보자!',
    bgColor: '#FFE0B2',
    groundColor: '#FFCC80',
    decoEmojis: ['📚', '✏️', '🎨', '📝', '🖍️'],
    terrain: 'forest',
    items: [
      { id: 'A', emoji: '🍎', name: 'A - Apple', desc: 'Apple은 사과! 사과는 물에 둥둥 떠요 🍎', size: 32 },
      { id: 'B', emoji: '🐻', name: 'B - Bear', desc: 'Bear는 곰! 곰은 겨울잠을 5개월까지 자요 🐻', size: 32 },
      { id: 'C', emoji: '🐱', name: 'C - Cat', desc: 'Cat은 고양이! 고양이는 하루 16시간 자요 🐱', size: 32 },
      { id: 'D', emoji: '🐕', name: 'D - Dog', desc: 'Dog은 강아지! 코 무늬가 지문처럼 다 달라요 🐕', size: 32 },
      { id: 'E', emoji: '🐘', name: 'E - Elephant', desc: 'Elephant는 코끼리! 점프를 못 하는 유일한 동물! 🐘', size: 32 },
      { id: 'F', emoji: '🐟', name: 'F - Fish', desc: 'Fish는 물고기! 눈을 뜨고 잠을 자요 🐟', size: 32 },
      { id: 'G', emoji: '🦒', name: 'G - Giraffe', desc: 'Giraffe는 기린! 혀 길이가 50cm나 돼요 🦒', size: 32 },
      { id: 'H', emoji: '🐴', name: 'H - Horse', desc: 'Horse는 말! 서서 잠을 잘 수 있어요 🐴', size: 32 },
      { id: 'I', emoji: '🍦', name: 'I - Ice cream', desc: 'Ice cream은 아이스크림! 중국에서 처음 만들었어요 🍦', size: 32 },
      { id: 'J', emoji: '🪼', name: 'J - Jellyfish', desc: 'Jellyfish는 해파리! 뇌가 없어요 🪼', size: 32 },
      { id: 'K', emoji: '🐨', name: 'K - Koala', desc: 'Koala는 코알라! 하루 22시간이나 자요 🐨', size: 32 },
      { id: 'L', emoji: '🦁', name: 'L - Lion', desc: 'Lion은 사자! 수컷만 갈기가 있어요 🦁', size: 32 },
      { id: 'M', emoji: '🌙', name: 'M - Moon', desc: 'Moon은 달! 달에도 지진이 일어나요 🌙', size: 32 },
      { id: 'N', emoji: '🪺', name: 'N - Nest', desc: 'Nest는 둥지! 벌새의 둥지는 동전만 해요 🪺', size: 32 },
      { id: 'O', emoji: '🐙', name: 'O - Octopus', desc: 'Octopus는 문어! 심장이 3개예요 🐙', size: 32 },
      { id: 'P', emoji: '🐧', name: 'P - Penguin', desc: 'Penguin은 펭귄! 날지 못하지만 수영 천재! 🐧', size: 32 },
      { id: 'Q', emoji: '👸', name: 'Q - Queen', desc: 'Queen은 여왕! 여왕벌은 하루에 2000개 알을 낳아요 👸', size: 32 },
      { id: 'R', emoji: '🐇', name: 'R - Rabbit', desc: 'Rabbit은 토끼! 토끼 이빨은 평생 자라요 🐇', size: 32 },
      { id: 'S', emoji: '⭐', name: 'S - Star', desc: 'Star는 별! 우리 눈으로 보이는 별은 약 6000개! ⭐', size: 32 },
      { id: 'T', emoji: '🐯', name: 'T - Tiger', desc: 'Tiger는 호랑이! 줄무늬가 사람 지문처럼 다 달라요 🐯', size: 32 },
      { id: 'U', emoji: '☂️', name: 'U - Umbrella', desc: 'Umbrella는 우산! 4000년 전부터 사용했어요 ☂️', size: 32 },
      { id: 'V', emoji: '🌋', name: 'V - Volcano', desc: 'Volcano는 화산! 지구에는 활화산이 1500개나 있어요 🌋', size: 32 },
      { id: 'W', emoji: '🐳', name: 'W - Whale', desc: 'Whale은 고래! 흰수염고래 심장은 자동차만 해요 🐳', size: 32 },
      { id: 'X', emoji: '🎵', name: 'X - Xylophone', desc: 'Xylophone은 실로폰! 나무 막대를 쳐서 소리를 내요 🎶', size: 32 },
      { id: 'Y', emoji: '🧶', name: 'Y - Yarn', desc: 'Yarn은 실! 거미줄은 같은 굵기의 강철보다 5배 강해요 🧶', size: 32 },
      { id: 'Z', emoji: '🦓', name: 'Z - Zebra', desc: 'Zebra는 얼룩말! 줄무늬가 모기를 쫓아내요 🦓', size: 32 },
    ],
  },
  {
    id: 'numbers',
    name: '숫자 나라',
    emoji: '🔢',
    desc: '숫자 속 비밀을 찾아보자!',
    bgColor: '#E1BEE7',
    groundColor: '#CE93D8',
    decoEmojis: ['🔢', '➕', '✖️', '🎲', '🧮'],
    terrain: 'magical',
    items: [
      { id: 'n1', emoji: '1️⃣', name: '하나 (1)', desc: '지구는 태양계에서 생명이 있는 유일한 행성! 🌍', size: 36 },
      { id: 'n2', emoji: '2️⃣', name: '둘 (2)', desc: '사람의 눈은 2개! 두 눈으로 거리를 알 수 있어요 👀', size: 36 },
      { id: 'n3', emoji: '3️⃣', name: '셋 (3)', desc: '신호등 색깔은 빨강 노랑 초록 3가지! 🚦', size: 36 },
      { id: 'n4', emoji: '4️⃣', name: '넷 (4)', desc: '계절은 봄 여름 가을 겨울 4개! 🍂', size: 36 },
      { id: 'n5', emoji: '5️⃣', name: '다섯 (5)', desc: '불가사리 팔은 5개! 잘려도 다시 자라요 ⭐', size: 36 },
      { id: 'n6', emoji: '6️⃣', name: '여섯 (6)', desc: '눈송이는 항상 6각형이에요! ❄️', size: 36 },
      { id: 'n7', emoji: '7️⃣', name: '일곱 (7)', desc: '무지개는 7가지 색! 빨주노초파남보 🌈', size: 36 },
      { id: 'n8', emoji: '8️⃣', name: '여덟 (8)', desc: '문어 다리는 8개! 각 다리에 뇌가 있어요 🐙', size: 36 },
      { id: 'n9', emoji: '9️⃣', name: '아홉 (9)', desc: '태양계 행성은 8개! 명왕성은 왜소행성이에요 🪐', size: 36 },
      { id: 'n10', emoji: '🔟', name: '열 (10)', desc: '사람 손가락은 10개! 발가락도 10개! ✋', size: 36 },
      { id: 'n0', emoji: '0️⃣', name: '영 (0)', desc: '0은 인도에서 발명했어요! 아무것도 없다는 뜻 🇮🇳', size: 36 },
      { id: 'n100', emoji: '💯', name: '백 (100)', desc: '기린의 혀 색은 보라색! 길이는 약 50cm! 🦒', size: 36 },
    ],
  },
  {
    id: 'dinosaurs',
    name: '공룡 나라',
    emoji: '🦕',
    desc: '멸종된 공룡을 만나보자!',
    bgColor: '#A5D6A7',
    groundColor: '#81C784',
    decoEmojis: ['🌴', '🪨', '🌿', '🦴', '🥚'],
    terrain: 'prehistoric',
    items: [
      { id: 'trex', sprite: 'dino-trex', emoji: '🦖', name: '티라노사우루스', desc: '팔이 너무 짧아서 박수를 못 쳤대요! 이빨은 바나나만 해요 🦖', size: 38 },
      { id: 'tricera', sprite: 'dino-tricera', emoji: '🦕', name: '트리케라톱스', desc: '뿔이 3개! 이름 뜻이 "세 뿔 얼굴"이에요 🦕', size: 38 },
      { id: 'stego', sprite: 'dino-stego', emoji: '🦕', name: '스테고사우루스', desc: '등에 판 모양 뼈가 있어요! 체온 조절용이래요 🌡️', size: 38 },
      { id: 'brachio', sprite: 'dino-brachio', emoji: '🦕', name: '브라키오사우루스', desc: '목이 엄청 길어요! 키가 아파트 4층 높이! 🏢', size: 38 },
      { id: 'ptero', sprite: 'dino-ptero', emoji: '🦅', name: '프테라노돈', desc: '하늘을 나는 파충류! 공룡은 아니에요! 날개폭 7m! ✈️', size: 38 },
      { id: 'veloci', sprite: 'dino-veloci', emoji: '🦖', name: '벨로키랍토르', desc: '아주 빠르고 똑똑했어요! 깃털이 있었대요 🪶', size: 38 },
      { id: 'ankylo', sprite: 'dino-ankylo', emoji: '🦕', name: '안킬로사우루스', desc: '온몸이 갑옷! 꼬리에 거대한 뼈 뭉치가 있어요 🛡️', size: 38 },
      { id: 'spino', sprite: 'dino-spino', emoji: '🦖', name: '스피노사우루스', desc: '등에 큰 돛이 있어요! 물고기를 잡아먹었어요 🐟', size: 38 },
      { id: 'parasauro', sprite: 'dino-parasauro', emoji: '🦕', name: '파라사우롤로푸스', desc: '머리에 긴 볏이 있어요! 나팔처럼 소리를 냈어요 🎺', size: 38 },
      { id: 'diplo', sprite: 'dino-diplo', emoji: '🦕', name: '디플로도쿠스', desc: '꼬리가 채찍처럼 길어요! 길이 27m! 🏃', size: 38 },
      { id: 'compy', sprite: 'dino-compy', emoji: '🦖', name: '콤프소그나투스', desc: '닭만 한 작은 공룡! 아주 빨라요! 🐔', size: 38 },
      { id: 'pachy', sprite: 'dino-pachy', emoji: '🦕', name: '파키케팔로사우루스', desc: '머리뼈가 25cm나 두꺼워요! 박치기왕! 💥', size: 38 },
    ],
  },
  {
    id: 'animals',
    name: '동물 나라',
    emoji: '🐾',
    desc: '세계의 신기한 동물들!',
    bgColor: '#FFF9C4',
    groundColor: '#FFF176',
    decoEmojis: ['🌳', '🌺', '🍃', '🌿', '🪻'],
    terrain: 'jungle',
    items: [
      { id: 'dolphin', emoji: '🐬', name: '돌고래', desc: '잠잘 때 뇌 반쪽만 자요! 한쪽 눈을 뜨고 자요 🐬', size: 34 },
      { id: 'owl', emoji: '🦉', name: '올빼미', desc: '머리를 270도나 돌릴 수 있어요! 밤에 활동해요 🦉', size: 34 },
      { id: 'chameleon', emoji: '🦎', name: '카멜레온', desc: '두 눈이 따로따로 움직여요! 색도 바꿔요 🦎', size: 34 },
      { id: 'whale', emoji: '🐋', name: '흰수염고래', desc: '지구에서 가장 큰 동물! 심장이 자동차만 해요 🐋', size: 34 },
      { id: 'ant', emoji: '🐜', name: '개미', desc: '자기 몸무게의 50배를 들어올려요! 슈퍼 파워! 🐜', size: 34 },
      { id: 'parrot', emoji: '🦜', name: '앵무새', desc: '사람 말을 따라 할 수 있어요! 100살까지 살아요 🦜', size: 34 },
      { id: 'sloth', emoji: '🦥', name: '나무늘보', desc: '하루에 잎사귀 몇 장만 먹어요! 세상에서 가장 느려요 🦥', size: 34 },
      { id: 'flamingo', emoji: '🦩', name: '플라밍고', desc: '원래 하얀색! 새우를 먹어서 분홍색이 돼요 🦩', size: 34 },
      { id: 'panda', emoji: '🐼', name: '판다', desc: '하루에 대나무를 38kg이나 먹어요! 대식가! 🐼', size: 34 },
      { id: 'seahorse', sprite: 'animal-seahorse', emoji: '🐠', name: '해마', desc: '아빠가 아기를 낳아요! 꼬리로 해초를 잡아요 🐠', size: 34 },
      { id: 'bat', emoji: '🦇', name: '박쥐', desc: '초음파로 앞을 볼 수 있어요! 유일하게 나는 포유류 🦇', size: 34 },
      { id: 'frog', emoji: '🐸', name: '개구리', desc: '물을 마시지 않아요! 피부로 물을 흡수해요 🐸', size: 34 },
      { id: 'honeybee', emoji: '🐝', name: '꿀벌', desc: '꿀 1kg을 만들려면 꽃 500만 송이를 방문해요! 🐝', size: 34 },
      { id: 'turtle', emoji: '🐢', name: '거북이', desc: '200살까지 살 수 있어요! 등딱지 안에 뼈가 있어요 🐢', size: 34 },
    ],
  },
];

// Letter pools for word builder distractors
export const HANGUL_LETTERS = ['ㄱ','ㄴ','ㄷ','ㄹ','ㅁ','ㅂ','ㅅ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ','ㅏ','ㅓ','ㅗ','ㅜ','ㅡ','ㅣ'];
export const ENGLISH_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// How close the player needs to be to discover an item
export const DISCOVER_RADIUS = 80;

// How close the player needs to be for item to show "?" hint
export const HINT_RADIUS = 150;

// Player settings
export const PLAYER = {
  moveSpeed: 180,
  size: 40,
};

// Map size
export const MAP_WIDTH = 1800;
export const MAP_HEIGHT = 1400;

// Companion hints
export const COMPANION_HINT_INTERVAL = 15; // seconds between hints

// Minimum clues needed before guessing is allowed
export const QUIZ_MIN_CLUES = 3;

// How items are hidden in the environment
export const HIDE_STYLES = ['bush', 'rock', 'tree', 'flower', 'sparkle', 'plain'];

// Number of collection items needed to unlock one clue
export const ITEMS_PER_CLUE = 5;

// Companion definitions
export const COMPANIONS = {
  bori: {
    name: '보리',
    emoji: '🐕',
    ability: 'detect',
    abilityInterval: 8,
    speed: 140,
    range: 100,
    collectSpeed: 0.8,
    detectRadius: 60,
    desc: '킁킁! 숨은 아이템을 찾아내요!',
  },
  jopssal: {
    name: '좁쌀이',
    emoji: '🦊',
    ability: 'dash',
    abilityInterval: 10,
    speed: 160,
    range: 90,
    collectSpeed: 0.6,
    dashSpeed: 500,
    dashDuration: 0.8,
    desc: '빠르게 달려서 아이템을 모아요!',
  },
  ikdol: {
    name: '익돌이',
    emoji: '🦅',
    ability: 'swoop',
    abilityInterval: 12,
    speed: 130,
    range: 110,
    collectSpeed: 0.9,
    desc: '하늘에서 내려와 아이템을 찾아요!',
  },
  gosun: {
    name: '고순이',
    emoji: '🐱',
    ability: 'lucky',
    abilityInterval: 15,
    speed: 120,
    range: 100,
    collectSpeed: 1.0,
    luckAuraRadius: 100,
    desc: '행운의 아우라로 특별한 아이템을 찾아요!',
  },
  azzi_white: {
    name: '아찌(흰)',
    emoji: '🐰',
    ability: 'detect',
    abilityInterval: 9,
    speed: 150,
    range: 95,
    collectSpeed: 0.7,
    detectRadius: 55,
    desc: '쌍둥이 토끼! 함께 아이템을 찾아요!',
  },
  azzi_blue: {
    name: '아찌(하늘)',
    emoji: '🐰',
    ability: 'detect',
    abilityInterval: 9,
    speed: 150,
    range: 95,
    collectSpeed: 0.7,
    detectRadius: 55,
    desc: '쌍둥이 토끼! 함께 아이템을 찾아요!',
  },
};

// Terrain features for richer map environments
export const TERRAIN_PRESETS = {
  forest: {
    trees: [
      { emoji: '🌳', count: 15, sizeMin: 35, sizeMax: 55 },
      { emoji: '🌲', count: 10, sizeMin: 30, sizeMax: 50 },
      { emoji: '🌴', count: 3, sizeMin: 35, sizeMax: 45 },
    ],
    rocks: [
      { emoji: '🪨', count: 8, sizeMin: 20, sizeMax: 35 },
    ],
    flowers: [
      { emoji: '🌸', count: 12, sizeMin: 14, sizeMax: 22 },
      { emoji: '🌷', count: 8, sizeMin: 14, sizeMax: 20 },
      { emoji: '🌻', count: 5, sizeMin: 18, sizeMax: 26 },
    ],
    water: [
      { emoji: '💧', count: 0 },
    ],
    paths: true,
    bushClusters: 6,
  },
  jungle: {
    trees: [
      { emoji: '🌴', count: 18, sizeMin: 40, sizeMax: 60 },
      { emoji: '🌳', count: 12, sizeMin: 35, sizeMax: 55 },
    ],
    rocks: [
      { emoji: '🪨', count: 10, sizeMin: 22, sizeMax: 40 },
    ],
    flowers: [
      { emoji: '🌺', count: 15, sizeMin: 16, sizeMax: 24 },
      { emoji: '🪻', count: 8, sizeMin: 14, sizeMax: 22 },
    ],
    water: [
      { emoji: '💧', count: 0 },
    ],
    paths: true,
    bushClusters: 8,
  },
  magical: {
    trees: [
      { emoji: '🌳', count: 10, sizeMin: 30, sizeMax: 50 },
      { emoji: '🎄', count: 5, sizeMin: 30, sizeMax: 45 },
    ],
    rocks: [
      { emoji: '🪨', count: 6, sizeMin: 20, sizeMax: 35 },
      { emoji: '💎', count: 4, sizeMin: 18, sizeMax: 28 },
    ],
    flowers: [
      { emoji: '✨', count: 20, sizeMin: 12, sizeMax: 20 },
      { emoji: '🌟', count: 10, sizeMin: 14, sizeMax: 22 },
      { emoji: '💫', count: 8, sizeMin: 12, sizeMax: 18 },
    ],
    water: [
      { emoji: '💧', count: 0 },
    ],
    paths: true,
    bushClusters: 4,
  },
  prehistoric: {
    trees: [
      { emoji: '🌴', count: 14, sizeMin: 40, sizeMax: 65 },
      { emoji: '🌿', count: 20, sizeMin: 20, sizeMax: 35 },
    ],
    rocks: [
      { emoji: '🪨', count: 15, sizeMin: 25, sizeMax: 50 },
      { emoji: '🦴', count: 8, sizeMin: 18, sizeMax: 28 },
    ],
    flowers: [
      { emoji: '🥚', count: 6, sizeMin: 16, sizeMax: 24 },
      { emoji: '🍃', count: 12, sizeMin: 14, sizeMax: 20 },
    ],
    water: [
      { emoji: '💧', count: 0 },
    ],
    paths: true,
    bushClusters: 5,
  },
};

// Collection items for quiz mode (collected to unlock clues)
export const COLLECT_ITEMS_POOL = {
  forest: [
    { emoji: '🍎', name: '사과' },
    { emoji: '🍊', name: '귤' },
    { emoji: '🍇', name: '포도' },
    { emoji: '🍓', name: '딸기' },
    { emoji: '🫐', name: '블루베리' },
    { emoji: '🍄', name: '버섯' },
    { emoji: '🌰', name: '도토리' },
    { emoji: '🥜', name: '땅콩' },
    { emoji: '🍂', name: '낙엽' },
    { emoji: '🪵', name: '나뭇가지' },
    { emoji: '🐚', name: '조개껍데기' },
    { emoji: '🪶', name: '깃털' },
    { emoji: '💎', name: '보석' },
    { emoji: '🔑', name: '열쇠' },
    { emoji: '⭐', name: '별' },
    { emoji: '🎀', name: '리본' },
    { emoji: '🪺', name: '둥지' },
    { emoji: '🧩', name: '퍼즐 조각' },
    { emoji: '📦', name: '보물 상자' },
    { emoji: '🏺', name: '항아리' },
    { emoji: '🪙', name: '동전' },
    { emoji: '🧲', name: '자석' },
    { emoji: '🔔', name: '종' },
    { emoji: '🎵', name: '음표' },
    { emoji: '🦋', name: '나비' },
  ],
  magical: [
    { emoji: '✨', name: '반짝이' },
    { emoji: '💎', name: '보석' },
    { emoji: '🔮', name: '수정구슬' },
    { emoji: '⭐', name: '별' },
    { emoji: '🌟', name: '빛나는 별' },
    { emoji: '🪄', name: '마법 지팡이' },
    { emoji: '📜', name: '마법 두루마리' },
    { emoji: '🧪', name: '물약' },
    { emoji: '🕯️', name: '초' },
    { emoji: '🗝️', name: '금열쇠' },
    { emoji: '🎭', name: '가면' },
    { emoji: '👑', name: '왕관' },
    { emoji: '💍', name: '반지' },
    { emoji: '🦄', name: '유니콘 뿔' },
    { emoji: '🌈', name: '무지개 조각' },
    { emoji: '🪽', name: '날개' },
    { emoji: '🎪', name: '마법 텐트' },
    { emoji: '🧿', name: '부적' },
    { emoji: '🎐', name: '풍경' },
    { emoji: '🪬', name: '행운의 부적' },
    { emoji: '🏮', name: '등불' },
    { emoji: '🎀', name: '리본' },
    { emoji: '🧩', name: '퍼즐 조각' },
    { emoji: '🪙', name: '금화' },
    { emoji: '🦋', name: '나비' },
  ],
};

// Quiz stages - 스무고개 style
export const QUIZ_STAGES = [
  {
    id: 'quiz_animals',
    name: '동물 스무고개',
    emoji: '🔍',
    desc: '아이템을 모아 단서를 풀어보자!',
    type: 'quiz',
    bgColor: '#B2DFDB',
    groundColor: '#80CBC4',
    decoEmojis: ['🌳', '🌿', '🍃', '🪻', '🌺'],
    terrain: 'forest',
    collectPool: 'forest',
    rounds: [
      {
        answer: '기린',
        emoji: '🦒',
        clues: [
          { emoji: '🌍', text: '나는 아프리카에 살아요' },
          { emoji: '📏', text: '나는 키가 아주아주 커요' },
          { emoji: '🍃', text: '나는 높은 나뭇잎을 먹어요' },
          { emoji: '👅', text: '내 혀는 50cm나 되고 보라색이에요' },
          { emoji: '🟤', text: '나는 노란색에 갈색 점무늬가 있어요' },
        ],
        choices: ['기린', '코끼리', '얼룩말', '사자'],
        funFact: '기린은 세상에서 가장 키가 큰 동물이에요! 키가 5.5m나 돼요!',
      },
      {
        answer: '펭귄',
        emoji: '🐧',
        clues: [
          { emoji: '❄️', text: '나는 아주 추운 곳에 살아요' },
          { emoji: '🏊', text: '나는 수영을 아주 잘해요' },
          { emoji: '🚫', text: '나는 새인데 날지 못해요' },
          { emoji: '⚫', text: '나는 검은색과 흰색이에요' },
          { emoji: '🚶', text: '나는 뒤뚱뒤뚱 걸어요' },
        ],
        choices: ['펭귄', '북극곰', '물개', '올빼미'],
        funFact: '황제펭귄 아빠는 알을 품느라 2달 동안 아무것도 안 먹어요!',
      },
      {
        answer: '문어',
        emoji: '🐙',
        clues: [
          { emoji: '🌊', text: '나는 바다에 살아요' },
          { emoji: '🦵', text: '나는 다리가 8개예요' },
          { emoji: '❤️', text: '내 심장은 3개나 있어요' },
          { emoji: '🎨', text: '나는 몸 색깔을 바꿀 수 있어요' },
          { emoji: '🧠', text: '나는 아주 똑똒해서 병뚜껑도 열 수 있어요' },
        ],
        choices: ['문어', '오징어', '해파리', '게'],
        funFact: '문어는 피가 파란색이에요! 구리 성분 때문이래요!',
      },
      {
        answer: '코끼리',
        emoji: '🐘',
        clues: [
          { emoji: '🏋️', text: '나는 육지에서 가장 무거운 동물이에요' },
          { emoji: '👃', text: '내 코는 아주아주 길어요' },
          { emoji: '👂', text: '내 귀는 부채처럼 커요' },
          { emoji: '🚫', text: '나는 점프를 못 하는 유일한 포유류예요' },
          { emoji: '🥜', text: '나는 풀과 과일을 먹는 초식동물이에요' },
        ],
        choices: ['코끼리', '하마', '코뿔소', '기린'],
        funFact: '코끼리는 거울에 비친 자기 모습을 알아볼 수 있어요!',
      },
      {
        answer: '돌고래',
        emoji: '🐬',
        clues: [
          { emoji: '🌊', text: '나는 바다에 살지만 물고기가 아니에요' },
          { emoji: '😊', text: '나는 항상 웃는 것처럼 보여요' },
          { emoji: '🗣️', text: '나는 소리로 친구와 대화해요' },
          { emoji: '💤', text: '나는 잘 때 뇌 반쪽만 자요' },
          { emoji: '🤸', text: '나는 물 위로 점프하는 걸 좋아해요' },
        ],
        choices: ['돌고래', '상어', '고래', '물개'],
        funFact: '돌고래는 서로 이름을 불러요! 각자 고유한 휘파람 소리가 있어요!',
      },
    ],
  },
  {
    id: 'quiz_what',
    name: '이것은 무엇?',
    emoji: '❓',
    desc: '아이템을 모아 수수께끼를 풀자!',
    type: 'quiz',
    bgColor: '#D1C4E9',
    groundColor: '#B39DDB',
    decoEmojis: ['🔮', '✨', '🌟', '💫', '🎪'],
    terrain: 'magical',
    collectPool: 'magical',
    rounds: [
      {
        answer: '무지개',
        emoji: '🌈',
        clues: [
          { emoji: '🌧️', text: '비가 온 뒤에 나타나요' },
          { emoji: '🎨', text: '나는 7가지 색깔이에요' },
          { emoji: '☀️', text: '햇빛이 있어야 보여요' },
          { emoji: '🌉', text: '나는 하늘에 걸린 다리 같아요' },
          { emoji: '⭕', text: '사실 나는 동그란 원이에요!' },
        ],
        choices: ['무지개', '구름', '번개', '오로라'],
        funFact: '비행기에서 보면 무지개는 동그란 원이에요!',
      },
      {
        answer: '달',
        emoji: '🌙',
        clues: [
          { emoji: '🌃', text: '나는 밤에 볼 수 있어요' },
          { emoji: '💡', text: '나는 빛나지만 스스로 빛을 내지 않아요' },
          { emoji: '🔄', text: '나는 모양이 매일 조금씩 변해요' },
          { emoji: '🚀', text: '사람이 나를 밟은 적이 있어요' },
          { emoji: '🌊', text: '나 때문에 바닷물이 올라갔다 내려가요' },
        ],
        choices: ['달', '별', '태양', '행성'],
        funFact: '달에 찍힌 발자국은 바람이 없어서 수백만 년 동안 남아있어요!',
      },
      {
        answer: '비행기',
        emoji: '✈️',
        clues: [
          { emoji: '☁️', text: '나는 구름 위를 날아요' },
          { emoji: '🔊', text: '나는 아주 큰 소리를 내요' },
          { emoji: '🧳', text: '사람들이 나를 타고 여행해요' },
          { emoji: '🪽', text: '나는 날개가 있지만 새가 아니에요' },
          { emoji: '🛤️', text: '나는 출발할 때 긴 길을 달려요' },
        ],
        choices: ['비행기', '로켓', '헬리콥터', '열기구'],
        funFact: '비행기 안의 공기는 에베레스트산 꼭대기만큼 건조해요!',
      },
      {
        answer: '피아노',
        emoji: '🎹',
        clues: [
          { emoji: '🎵', text: '나를 누르면 소리가 나요' },
          { emoji: '⬛', text: '나는 검은색과 흰색이 번갈아 있어요' },
          { emoji: '🎼', text: '나는 음악을 만들 수 있어요' },
          { emoji: '🔢', text: '나는 건반이 88개예요' },
          { emoji: '🏠', text: '나는 너무 무거워서 옮기기 힘들어요' },
        ],
        choices: ['피아노', '기타', '바이올린', '드럼'],
        funFact: '피아노는 현악기이면서 타악기예요! 건반을 누르면 해머가 줄을 때려요!',
      },
      {
        answer: '눈(snow)',
        emoji: '❄️',
        clues: [
          { emoji: '🥶', text: '나는 추울 때 하늘에서 내려와요' },
          { emoji: '⬜', text: '나는 하얀색이에요' },
          { emoji: '🔬', text: '나를 자세히 보면 아주 예쁜 모양이에요' },
          { emoji: '💧', text: '나는 따뜻해지면 물이 돼요' },
          { emoji: '⛄', text: '나로 사람 모양을 만들 수 있어요' },
        ],
        choices: ['눈', '비', '우박', '서리'],
        funFact: '눈 결정은 모두 6각형이지만 같은 모양은 하나도 없어요!',
      },
    ],
  },
];

// Word-building missions for hangul/english stages
export const WORD_MISSIONS = {
  hangul: [
    { word: '기린', emoji: '🦒', letters: ['ㄱ','ㅣ','ㄹ','ㅣ','ㄴ'], display: ['ㄱ','ㅣ','ㄹ','ㅣ','ㄴ'], funFact: '기린은 세상에서 가장 키가 큰 동물이에요! 키가 5.5m나 돼요!' },
    { word: '나비', emoji: '🦋', letters: ['ㄴ','ㅏ','ㅂ','ㅣ'], display: ['ㄴ','ㅏ','ㅂ','ㅣ'], funFact: '나비는 발로 맛을 느낄 수 있어요! 신기하죠?' },
    { word: '사자', emoji: '🦁', letters: ['ㅅ','ㅏ','ㅈ','ㅏ'], display: ['ㅅ','ㅏ','ㅈ','ㅏ'], funFact: '사자의 울음소리는 8km까지 들려요!' },
    { word: '토끼', emoji: '🐰', letters: ['ㅌ','ㅗ','ㅋ','ㅣ'], display: ['ㅌ','ㅗ','ㅋ','ㅣ'], funFact: '토끼 이빨은 평생 계속 자라요!' },
    { word: '하마', emoji: '🦛', letters: ['ㅎ','ㅏ','ㅁ','ㅏ'], display: ['ㅎ','ㅏ','ㅁ','ㅏ'], funFact: '하마는 물속에서 잠을 잘 수 있어요!' },
    { word: '오리', emoji: '🦆', letters: ['ㅇ','ㅗ','ㄹ','ㅣ'], display: ['ㅇ','ㅗ','ㄹ','ㅣ'], funFact: '오리 발에는 물갈퀴가 있어서 수영을 잘해요!' },
  ],
  english: [
    { word: 'CAT', emoji: '🐱', letters: ['C','A','T'], display: ['C','A','T'], funFact: 'Cats sleep 16 hours a day! 고양이는 하루 16시간 자요!' },
    { word: 'DOG', emoji: '🐕', letters: ['D','O','G'], display: ['D','O','G'], funFact: 'Dogs can smell 10,000 times better than humans! 개의 코는 사람보다 만 배 좋아요!' },
    { word: 'SUN', emoji: '☀️', letters: ['S','U','N'], display: ['S','U','N'], funFact: 'The Sun is a star! 태양은 별이에요!' },
    { word: 'BIG', emoji: '🐘', letters: ['B','I','G'], display: ['B','I','G'], funFact: 'Elephants are the biggest land animals! 코끼리는 육지에서 가장 큰 동물이에요!' },
  ],
};
