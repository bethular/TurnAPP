// Archivo: sw.js (raíz)
// TurnApp — service worker de la aplicación.
// Solo cachea recursos GET del shell. No intercepta POST/PUT/PATCH/DELETE,
// para no interferir con Firebase/Firestore ni con futuras cargas de datos.
const CACHE_NAME = "turnapp-shell-v4";
const SHELL_FILES = [
  "./", "./index.html", "./config.js", "./manifest.json", "./manifest-catalogo.json",
  "./panel/panelindex.html", "./panel/panel.css", "./panel/panel.js",
  "./panel/modulos/utilidades.js", "./panel/modulos/horarios.js", "./panel/modulos/calendario.js",
  "./panel/modulos/turnos.js", "./panel/modulos/clientes.js", "./panel/modulos/caja.js",
  "./panel/modulos/configuracion.js", "./panel/modulos/disponibilidad.js",
  "./catalogo/catalogoindex.html", "./catalogo/catalogo.css", "./catalogo/catalogo.js",
  "./admin/adminindex.html", "./admin/admin.css", "./admin/admin.js"
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_FILES)));
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
  )));
  self.clients.claim();
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
