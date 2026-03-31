const CACHE_NAME = 'wannyan-shopping-v3';
const CACHE_FILES = ['./', './index.html', './manifest.json', './dog.jpg.jpg', './cat.jpg.jpg'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(CACHE_FILES).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  // 古いキャッシュ（カレンダーアプリ含む）をすべて削除
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // APIリクエストはキャッシュしない
  if (e.request.url.includes('/api/')) {
    e.respondWith(fetch(e.request));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() => caches.match('./index.html')))
  );
});
