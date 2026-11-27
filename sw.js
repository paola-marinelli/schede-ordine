// Ordini fornitori locali: funziona anche senza internet.
// La pagina si prende prima dalla rete (cosi' gli aggiornamenti arrivano subito), se manca la rete dalla cache.
var CACHE = 'schede-ordine-20261127-111547';
var FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'favicon-32.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (k) {
    return Promise.all(k.filter(function (n) { return n.indexOf('schede-ordine-') === 0 && n !== CACHE; }).map(function (n) { return caches.delete(n); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  if (r.mode === 'navigate' || r.url.indexOf('index.html') >= 0) {
    e.respondWith(fetch(r, {cache: 'no-store'}).then(function (res) {
      var copia = res.clone();
      caches.open(CACHE).then(function (c) { c.put('index.html', copia); });
      return res;
    }).catch(function () { return caches.match('index.html').then(function (m) { return m || caches.match('./'); }); }));
    return;
  }
  e.respondWith(caches.match(r).then(function (m) { return m || fetch(r); }));
});
