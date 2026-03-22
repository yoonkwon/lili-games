const CACHE_NAME = 'lili-games-cache';

// Install: activate immediately, wipe ALL existing caches for clean slate
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => caches.delete(k)))
    )
  );
  self.skipWaiting();
});

// Activate: take control of all clients immediately
self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

// Fetch: network-first with cache fallback
// - Online: always fetch from network, update cache with latest response
// - Offline: serve from cache
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
