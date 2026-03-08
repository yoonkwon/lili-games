const CACHE_NAME = 'lili-games-v4';

// Use relative paths for GitHub Pages compatibility
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './chicken-egg/',
  './chicken-egg/index.html',
  './chicken-egg/js/main.js',
  './chicken-egg/js/input.js',
  './chicken-egg/js/background.js',
  './chicken-egg/js/audio.js',
  './chicken-egg/js/AudioManager.js',
  './chicken-egg/js/SpriteCache.js',
  './chicken-egg/js/Achievement.js',
  './chicken-egg/js/Difficulty.js',
  './chicken-egg/js/particles.js',
  './chicken-egg/js/entity/Chicken.js',
  './chicken-egg/js/entity/Egg.js',
  './chicken-egg/js/entity/Nest.js',
  './chicken-egg/js/entity/Chick.js',
  './chicken-egg/js/entity/Predator.js',
  './chicken-egg/js/scene/TitleScene.js',
  './chicken-egg/js/scene/GameScene.js',
  './chicken-egg/js/scene/EndingScene.js',
  './chicken-egg/js/ui/Gauge.js',
  './chicken-egg/js/ui/HUD.js',
  './chicken-egg/js/ui/Message.js',
];

// Install: cache all assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: stale-while-revalidate
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fetchPromise = fetch(e.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => {
        if (cached) return cached;
        return new Response('Offline', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' }
        });
      });
      return cached || fetchPromise;
    })
  );
});
