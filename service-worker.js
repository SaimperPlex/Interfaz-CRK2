// service-worker.js
const CACHE_NAME = 'miapp-static-v1';
const RUNTIME_CACHE = 'miapp-runtime-v1';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// INSTALAR: precache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ACTIVATE: limpiar caches viejos
self.addEventListener('activate', event => {
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (!currentCaches.includes(key)) return caches.delete(key);
      }))
    ).then(() => self.clients.claim())
  );
});

// FUNCIONES AUX: abrir IndexedDB desde SW (para imágenes si las migras)
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('miapp-db', 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('images')) {
        db.createObjectStore('images', { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// FETCH: estrategia mixta y soporte para imágenes de usuario en IndexedDB
self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // 1) Rutas virtuales para imágenes guardadas en IndexedDB: /user-images/{id}
  if (url.pathname.startsWith('/user-images/')) {
    const idStr = url.pathname.split('/user-images/')[1];
    const id = Number(idStr);
    event.respondWith((async () => {
      try {
        const db = await openIndexedDB();
        const tx = db.transaction('images', 'readonly');
        const store = tx.objectStore('images');
        const getReq = store.get(id);
        const record = await new Promise((res, rej) => {
          getReq.onsuccess = () => res(getReq.result);
          getReq.onerror = () => rej(getReq.error);
        });
        if (record && record.file) {
          return new Response(record.file, { headers: { 'Content-Type': record.type || 'image/png' }});
        }
      } catch (err) {
        // no importa: sigue a cache/network
      }
      // si no estuvo en IndexedDB -> fallback cache / offline
      return caches.match('/offline.html') || new Response('Not found', { status: 404 });
    })());
    return;
  }

  // 2) Navegación (HTML): NetworkFirst → fallback cache → offline.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches.match(request).then(cached => cached || caches.match('/offline.html'))
        )
    );
    return;
  }

  // 3) Assets estáticos (css/js/imagenes): CacheFirst (mejor UX)
  if (request.destination === 'style' || request.destination === 'script' || request.destination === 'image' ||
      url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) {
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(res => {
        const copy = res.clone();
        caches.open(RUNTIME_CACHE).then(cache => cache.put(request, copy));
        return res;
      })).catch(() => caches.match('/offline.html'))
    );
    return;
  }

  // 4) API / llamadas a servidor: NetworkFirst con fallback a cache
  if (url.pathname.startsWith('/api') || url.hostname.includes('tu-api') || request.url.includes('/api/')) {
    event.respondWith(
      fetch(request).then(response => {
        const copy = response.clone();
        caches.open(RUNTIME_CACHE).then(cache => cache.put(request, copy));
        return response;
      }).catch(() => caches.match(request))
    );
    return;
  }

  // 5) Default: try cache then network
  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request))
  );
});
