// Service Worker di HB-HomeworkBalancer
// Strategia "prima la rete": scarica sempre la versione più recente dei file
// e usa la copia salvata SOLO quando si è offline. Così ogni nuova versione
// di index.html si vede subito, senza dover svuotare la cache.
// NB: i compiti stanno in localStorage, non in questa cache: cancellare la
// cache NON cancella mai i dati degli studenti.

const CACHE = 'hb-cache-v3'; // cambia il numero se vuoi forzare la pulizia delle copie vecchie

self.addEventListener('install', () => {
  self.skipWaiting(); // la nuova versione del SW si attiva subito
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return; // font Google ecc.: lasciati al browser

  event.respondWith(
    fetch(req, { cache: 'no-store' })
      .then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then(r => r || caches.match('./index.html'))
      )
  );
});
