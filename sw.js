const CACHE_NAME = 'wannyan-v1';
const CACHE_FILES = ['./', './index.html', './manifest.json', './pets.jpg'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(CACHE_FILES).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() => caches.match('./index.html')))
  );
});

// アプリからのメッセージで通知を表示
self.addEventListener('message', e => {
  if (e.data?.type === 'SHOW_REMINDER') {
    self.registration.showNotification('🐾 わんにゃんまんまカレンダー', {
      body: '今日のごはん、まだ記録されていないよ！',
      icon: './pets.jpg',
      badge: './pets.jpg',
      tag: 'dinner-reminder',
      renotify: false,
      vibrate: [200, 100, 200]
    });
  }
  if (e.data?.type === 'SCHEDULE_REMINDER') {
    // 夜8時に通知を予約（ページを閉じても動く）
    const now = new Date();
    const target = new Date(now);
    target.setHours(20, 0, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    const delay = target.getTime() - now.getTime();
    setTimeout(() => {
      // クライアントに今日の投稿確認を依頼
      self.clients.matchAll().then(clientList => {
        if (clientList.length > 0) {
          clientList[0].postMessage({ type: 'CHECK_AND_NOTIFY' });
        } else {
          // アプリが閉じていれば直接通知
          self.registration.showNotification('🐾 わんにゃんまんまカレンダー', {
            body: '今日のごはん、まだ記録されていないよ！',
            icon: './pets.jpg',
            badge: './pets.jpg',
            tag: 'dinner-reminder'
          });
        }
      });
    }, delay);
  }
});

// 相手からのプッシュ通知を受信して表示
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : { title: '🐾', body: '投稿があったよ！' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: './pets.jpg',
      badge: './pets.jpg',
      vibrate: [200, 100, 200],
      tag: 'partner-post'
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      if (list.length > 0) return list[0].focus();
      return clients.openWindow('./');
    })
  );
});
