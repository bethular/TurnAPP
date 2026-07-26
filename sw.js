// sw.js — service worker mínimo, solo para que la PWA sea instalable.
// El cacheo de datos lo maneja Firestore (persistencia offline propia);
// acá no cacheamos nada crítico para no servir versiones viejas de la app.

const CACHE_NAME = "turnapp-shell-v1";
const SHELL_FILES = ["./", "./index.html", "./config.js", "./manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
