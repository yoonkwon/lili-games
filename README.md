# 리리 게임 허브 🎮

리아, 리사 자매를 위한 게임 모음!

## 게임 목록

| 게임 | 설명 |
|------|------|
| [🐔 꼬꼬닭 알 낳기](chicken-egg/) | 꼬꼬닭을 도와 알 100개를 모아보자! |
| [🌲 리리탐험대](forest-gather/) | 한글·영어·숫자·공룡·동물 도감을 채우는 탐험! 단어 만들기·스무고개 퀴즈 포함 |
| [❄️ 엘사 아기 키우기](elsa-baby/) | 엘사 아기에게 맛있는 음식을 먹여주자! |
| [🍎 백설공주 아기 키우기](snow-white-baby/) | 동물 친구들이 가져다주는 음식으로 아기를 키우자! |
| [🧜‍♀️ 인어공주 아기 키우기](mermaid-baby/) | 바닷속에서 물고기를 잡아 아기를 키우자! |
| [💕 우리엄마 아기낳기](our-mom-baby/) | 엄마를 좌우로 움직여 음식을 받고 세균은 피하자! |

## 플레이

**https://yoonkwon.github.io/lili-games/**

## 주요 기능

- **저장/이어하기** — 게임 진행 상황을 저장하고 이어서 플레이
- **컴패니언 시스템** — 리리탐험대에서 동물 친구를 동료로 영입 (보리, 좁쌀이, 고순이, 익돌이, 아찌 쌍둥이)
- **단어 만들기 미션** — 한글 음절·영어 알파벳을 모아 동물 이름 조립 (한글은 음절 블록, 영어는 알파벳)
- **스무고개 퀴즈 모드** — 단서를 모아 동물 정답 맞히기
- **도감 시스템** — 발견한 아이템과 완성한 단어를 도감에 영구 기록
- **레티나 디스플레이 지원** — 모든 게임 캔버스가 devicePixelRatio 적용으로 선명하게 렌더

## 프로젝트 구조

```
lili-games/
├── index.html          # 게임 허브 메인
├── shared/             # 공용 모듈 (GameEngine, Input, Audio, Particles, LoadingScreen 등)
├── chicken-egg/        # 꼬꼬닭 알 낳기
├── forest-gather/      # 리리탐험대
├── elsa-baby/          # 엘사 아기 키우기
├── snow-white-baby/    # 백설공주 아기 키우기
├── mermaid-baby/       # 인어공주 아기 키우기
├── our-mom-baby/       # 우리엄마 아기낳기
├── docs/               # 디자인 가이드
└── icons/              # PWA 아이콘
```

## 기술 스택

- 순수 HTML/CSS/JavaScript (프레임워크 없음, ES 모듈)
- Canvas 2D 기반 게임 렌더링 (devicePixelRatio 적용)
- Web Audio API (합성 폴백 포함)
- PWA 지원 (오프라인 플레이 가능, safe-area-inset 대응)
- GitHub Pages 배포
