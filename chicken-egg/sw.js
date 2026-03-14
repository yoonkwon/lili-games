const CACHE_NAME = 'chicken-egg-v16';

// Use relative paths for GitHub Pages compatibility
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  '../shared/AudioManager.js',
  '../shared/AchievementManager.js',
  '../shared/Input.js',
  '../shared/ParticleSystem.js',
  '../shared/GameEngine.js',
  '../shared/ui/Message.js',
  '../shared/ui/Gauge.js',
  './js/main.js',
  './js/particles.js',
  './js/input.js',
  './js/background.js',
  './js/AudioManager.js',
  './js/SpriteCache.js',
  './js/Achievement.js',
  './js/Difficulty.js',
  './js/entity/Chicken.js',
  './js/entity/Nest.js',
  './js/entity/Chick.js',
  './js/entity/Predator.js',
  './js/entity/Dog.js',
  './js/scene/TitleScene.js',
  './js/scene/GameScene.js',
  './js/scene/EndingScene.js',
  './js/scene/GameOverScene.js',
  './js/ui/Message.js',
  './js/ui/Gauge.js',
  './js/ui/HUD.js',
  '../icons/icon-192.png',
  '../icons/icon-512.png',
];

// Install: precache core files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: stale-while-revalidate strategy
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(event.request).then(cachedResponse => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          if (networkResponse && networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === 'navigate') {
            return cache.match('./index.html');
          }
          return new Response('Offline', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
          });
        });

        return cachedResponse || fetchPromise;
      })
    )
  );
});
