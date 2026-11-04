// NYANSATEK Resources: lets the portal install as an app.
// Deliberately keeps nothing usable offline: the page always comes from the network so
// sign-in and access checks run every time. Offline, people see a "connect to the internet" screen.
const VERSION = 'ntr-v1';
const OFFLINE = 'offline.html';
const SHELL = [OFFLINE, 'assets/app/icon-192.png', 'assets/app/favicon-64.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;           // sign-in, data, maps: always straight to the network
  if (req.mode === 'navigate' && url.pathname.startsWith(new URL('./', self.registration.scope).pathname)) {
    e.respondWith(fetch(req, { cache: 'no-store' }).catch(() => caches.match(OFFLINE)));
    return;
  }
  // only our own icons come from the cache; everything else is fetched fresh
  if (SHELL.some(p => url.pathname.endsWith('/' + p))) e.respondWith(caches.match(req).then(r => r || fetch(req)));
});
