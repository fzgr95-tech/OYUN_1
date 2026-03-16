const CACHE_NAME = 'neonhorde-v5';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/pool.js',
  './js/characters.js',
  './js/maps.js',
  './js/camera.js',
  './js/input.js',
  './js/audio.js',
  './js/renderer.js',
  './js/particles.js',
  './js/player.js',
  './js/enemy.js',
  './js/weapons.js',
  './js/xp.js',
  './js/economy.js',
  './js/ui.js',
  './js/main.js',
  './assets/sprites/ufo.png',
  './assets/sprites/volt.png',
  './assets/sprites/phantom.png',
  './assets/sprites/blaze.png',
  './assets/sprites/frost.png',
  './assets/sprites/nexus.png',
  './assets/sprites/kare_dusman.png',
  './assets/sprites/ucak_dusman.png',
  './assets/sprites/ufo_dusman.png',
  './assets/sprites/boss_dusman.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => Promise.resolve())
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isAppCode =
    event.request.destination === 'document' ||
    event.request.destination === 'script' ||
    event.request.destination === 'style' ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css');

  // App code should prefer network to avoid serving stale gameplay logic.
  if (isAppCode) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') return response;
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') return response;
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});