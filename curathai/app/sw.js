/* Service worker van de Cura Thai app.
   Shell in de cache, navigaties network-first, API nooit cachen.
   Eigen code (css, js, manifest) network-first zodat een update meteen aankomt; fonts en beeld stale-while-revalidate. */
const VERSIE = 'curathai-app-v3';
const SHELL = [
  './', './index.html', './app.css?v=3', './app.js?v=3', './manifest.webmanifest',
  '../assets/iconen.svg', '../assets/img/logo-embleem.webp', '../favicon.svg',
  '../assets/fonts/gloock-regular.woff2', '../assets/fonts/figtree-regular.woff2', '../assets/fonts/figtree-500.woff2', '../assets/fonts/figtree-600.woff2', '../assets/fonts/figtree-700.woff2',
  './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSIE).then((c) => Promise.allSettled(SHELL.map((u) => c.add(u)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSIE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.startsWith('/api/')) return;
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then((r) => { const kopie = r.clone(); caches.open(VERSIE).then((c) => c.put('./index.html', kopie)); return r; }).catch(() => caches.match('./index.html')));
    return;
  }
  const eigen = /\.(css|js|webmanifest)$/.test(url.pathname);
  e.respondWith(caches.match(e.request).then((cached) => {
    const vers = fetch(e.request).then((r) => { if (r.ok) caches.open(VERSIE).then((c) => c.put(e.request, r.clone())); return r; }).catch(() => cached);
    return eigen ? vers : (cached || vers);
  }));
});
