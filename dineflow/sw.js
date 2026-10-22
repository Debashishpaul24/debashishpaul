/**
 * DineFlow Service Worker - PWA Offline Shell & Asset Caching
 */

const CACHE_NAME = 'dineflow-v2.0.0';
const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css?v=2.0.0',
  './app.js?v=2.0.0',
  './data.js?v=2.0.0',
  './qr-engine.js?v=1.8.0',
  './mqttws31.min.js?v=2.0.0',
  './manifest.json',
  '../favicon.svg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only intercept GET requests with http/https schemes (ignore websockets, chrome-extension, etc.)
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  // Handle SPA navigation requests (e.g. ?view=admin, ?section=..., ?r=...&t=...)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return networkResponse;
        })
        .catch(async () => {
          // Fall back to cached app shell so client-side router in app.js can mount the view
          const cachedShell = await caches.match('./index.html') || await caches.match('./');
          if (cachedShell) return cachedShell;
          return caches.match(event.request, { ignoreSearch: true });
        })
    );
    return;
  }

  // Asset Network-First strategy with cache fallback
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cached = await caches.match(event.request, { ignoreSearch: true });
        if (cached) return cached;
        return new Response('Resource temporarily unavailable offline', { status: 503, statusText: 'Service Unavailable' });
      })
  );
});
