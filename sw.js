/* Service worker Syahwa.id
   - Selalu mengambil versi terbaru dari internet (tanpa salinan lama browser).
   - Salinan disimpan hanya untuk dipakai saat tidak ada sinyal.
   Data keuangan tidak disimpan di sini; selalu diambil langsung dari Google. */
var CACHE = 'syahwa-id-v3';
var FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png',
             'icon-maskable-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.all(FILES.map(function (f) {
      return fetch(f, { cache: 'no-store' }).then(function (r) { if (r.ok) return c.put(f, r); }).catch(function () {});
    }));
  }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request, { cache: 'no-store' }).then(function (res) {
      if (res.ok) { var salin = res.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, salin); }); }
      return res;
    }).catch(function () {
      return caches.match(e.request).then(function (r) { return r || caches.match('index.html'); });
    })
  );
});
