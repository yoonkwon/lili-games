const CACHE_NAME = 'chicken-egg-v4';

const PRECACHE_URLS = [
    '/chicken-egg/',
    '/chicken-egg/index.html',
    '/chicken-egg/manifest.json',
    '/chicken-egg/js/main.js',
    '/chicken-egg/js/particles.js',
    '/chicken-egg/js/input.js',
    '/chicken-egg/js/background.js',
    '/chicken-egg/js/audio.js',
    '/chicken-egg/js/AudioManager.js',
    '/chicken-egg/js/SpriteCache.js',
    '/chicken-egg/js/entity/Chicken.js',
    '/chicken-egg/js/entity/Egg.js',
    '/chicken-egg/js/entity/Nest.js',
    '/chicken-egg/js/entity/Chick.js',
    '/chicken-egg/js/entity/Predator.js',
    '/chicken-egg/js/scene/TitleScene.js',
    '/chicken-egg/js/scene/GameScene.js',
    '/chicken-egg/js/scene/EndingScene.js',
    '/chicken-egg/js/ui/Message.js',
    '/chicken-egg/js/ui/Gauge.js',
    '/chicken-egg/js/ui/HUD.js',
    '/icons/icon-192.png',
    '/icons/icon-512.png'
];

// Asset directories to cache on fetch
const ASSET_PATHS = [
    '/chicken-egg/assets/sounds/',
    '/chicken-egg/assets/sprites/'
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
    const request = event.request;

    // Only handle GET requests
    if (request.method !== 'GET') return;

    event.respondWith(
        caches.open(CACHE_NAME).then(cache =>
            cache.match(request).then(cachedResponse => {
                const fetchPromise = fetch(request).then(networkResponse => {
                    // Cache valid responses (including asset paths)
                    if (networkResponse && networkResponse.ok) {
                        cache.put(request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch(() => {
                    // Network failed - return cached or offline fallback
                    if (cachedResponse) return cachedResponse;
                    // For navigation requests, try returning cached index
                    if (request.mode === 'navigate') {
                        return cache.match('/chicken-egg/index.html');
                    }
                    return new Response('Offline', {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: { 'Content-Type': 'text/plain' }
                    });
                });

                // Return cached response immediately, update in background
                return cachedResponse || fetchPromise;
            })
        )
    );
});
