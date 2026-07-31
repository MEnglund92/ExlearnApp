const CACHE = 'exlearn-v10';

const PRECACHE = [
  'index.html',
  'manifest.json',
  'img/congrats.webp',
  'icons/icon-180.png',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache =>
      Promise.allSettled(PRECACHE.map(url => cache.add(url)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put('index.html', copy));
        return response;
      }).catch(() => caches.match('index.html').then(cached => cached || new Response('Offline', {status: 503})))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      return caches.open(CACHE).then(cache => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch(() => caches.match('index.html')))
  );
});
