const CACHE_NAME = 'lili-games-v26';

// Install: activate immediately (don't wait for old tabs to close)
self.addEventListener('install', () => {
  self.skipWaiting();
});

// Activate: clean old caches + take control + reload all tabs
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
     .then(() => {
       // Force reload all open tabs to pick up new code
       return self.clients.matchAll({ type: 'window' }).then((clients) => {
         clients.forEach((client) => client.navigate(client.url));
       });
     })
  );
});

// Fetch: network-first, cache as fallback for offline
// Always tries network first so updates are immediate when online
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
