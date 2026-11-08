const CACHE_NAME = 'itau-pwa-v2';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './assets/apple-touch-icon.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/itau-squircle.png',
  './assets/itau-small-white.png',
  './assets/faceid-orb.png',
  './assets/evino-logo.png',
  './assets/nivel5-badge.png',
  './assets/emoji-1.png',
  './assets/emoji-2.png',
  './assets/emoji-3.png',
  './assets/emoji-4.png',
  './assets/emoji-5.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : null)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
