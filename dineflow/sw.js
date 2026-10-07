/**
 * DineFlow Service Worker — PWA Offline Shell & Asset Caching
 */

const CACHE_NAME = 'dineflow-v1.6.2';
const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css?v=1.6.2',
  './app.js?v=1.6.2',
  './data.js?v=1.6.2',
  './qr-engine.js?v=1.6.2',
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
  // Always use Network-First for core scripts and styles to guarantee latest updates
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
