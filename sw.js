/* Service worker Syahwa.id: menyimpan tampilan aplikasi dan ikon agar cepat terbuka.
   Data keuangan tidak disimpan di sini; selalu diambil langsung dari Google. */
var CACHE = 'syahwa-id-v2';
var FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png',
             'icon-maskable-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request).then(function (res) {
      var salin = res.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, salin); });
      return res;
    }).catch(function () { return caches.match(e.request).then(function (r) { return r || caches.match('index.html'); }); })
  );
});
