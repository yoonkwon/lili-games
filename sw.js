const CACHE_NAME = 'lili-games-v21';

// Use relative paths for GitHub Pages compatibility
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './shared/AudioManager.js',
  './shared/AchievementManager.js',
  './shared/Input.js',
  './shared/ParticleSystem.js',
  './shared/AssetLoader.js',
  './shared/GameEngine.js',
  './shared/ui/Message.js',
  './shared/ui/Gauge.js',
  './shared/ui/LoadingScreen.js',
  './elsa-baby/',
  './elsa-baby/index.html',
  './elsa-baby/js/main.js',
  './elsa-baby/js/config.js',
  './elsa-baby/js/draw-elsa.js',
  './elsa-baby/js/scene/TitleScene.js',
  './elsa-baby/js/scene/GameScene.js',
  './elsa-baby/js/scene/BornScene.js',
  './elsa-baby/assets/elsa-mom.svg',
  './elsa-baby/assets/baby-elsa.svg',
  './elsa-baby/assets/baby-elsa-happy.svg',
  './elsa-baby/assets/baby-elsa-sad.svg',
  './elsa-baby/assets/baby-elsa-angry.svg',
  './snow-white-baby/',
  './snow-white-baby/index.html',
  './snow-white-baby/js/main.js',
  './snow-white-baby/js/config.js',
  './snow-white-baby/js/draw-snow-white.js',
  './snow-white-baby/js/scene/TitleScene.js',
  './snow-white-baby/js/scene/GameScene.js',
  './snow-white-baby/js/scene/BornScene.js',
  './snow-white-baby/assets/snow-white-mom.svg',
  './snow-white-baby/assets/baby-snow-white.svg',
  './snow-white-baby/assets/baby-snow-white-happy.svg',
  './snow-white-baby/assets/baby-snow-white-sad.svg',
  './snow-white-baby/assets/baby-snow-white-angry.svg',
  './mermaid-baby/',
  './mermaid-baby/index.html',
  './mermaid-baby/js/main.js',
  './mermaid-baby/js/config.js',
  './mermaid-baby/js/draw-mermaid.js',
  './mermaid-baby/js/scene/TitleScene.js',
  './mermaid-baby/js/scene/GameScene.js',
  './mermaid-baby/js/scene/BornScene.js',
  './mermaid-baby/assets/mermaid-mom.svg',
  './mermaid-baby/assets/baby-mermaid.svg',
  './mermaid-baby/assets/baby-mermaid-happy.svg',
  './mermaid-baby/assets/baby-mermaid-sad.svg',
  './mermaid-baby/assets/baby-mermaid-angry.svg',
  './chicken-egg/',
  './chicken-egg/index.html',
  './chicken-egg/js/main.js',
  './chicken-egg/js/input.js',
  './chicken-egg/js/background.js',
  './chicken-egg/js/AudioManager.js',
  './chicken-egg/js/SpriteCache.js',
  './chicken-egg/js/Achievement.js',
  './chicken-egg/js/Difficulty.js',
  './chicken-egg/js/particles.js',
  './chicken-egg/js/entity/Chicken.js',
  './chicken-egg/js/entity/Nest.js',
  './chicken-egg/js/entity/Chick.js',
  './chicken-egg/js/entity/Predator.js',
  './chicken-egg/js/entity/Dog.js',
  './chicken-egg/js/scene/TitleScene.js',
  './chicken-egg/js/scene/GameScene.js',
  './chicken-egg/js/scene/EndingScene.js',
  './chicken-egg/js/scene/GameOverScene.js',
  './chicken-egg/js/ui/Gauge.js',
  './chicken-egg/js/ui/HUD.js',
  './chicken-egg/js/ui/Message.js',
];

// Install: cache all assets, activate immediately
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches + take control immediately
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: network-first (try network, fallback to cache for offline)
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request).then((response) => {
      if (response.ok) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
      }
      return response;
    }).catch(() => {
      return caches.match(e.request).then((cached) => {
        return cached || new Response('Offline', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' }
        });
      });
    })
  );
});
