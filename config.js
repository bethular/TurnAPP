// config.js — raíz del repo. Todas las pantallas lo importan con ruta relativa.
// Reemplazar firebaseConfig con las credenciales reales del proyecto de Firebase
// de TurnApp (Firebase Console → Configuración del proyecto → Tus apps → SDK).

export const firebaseConfig = {
  apiKey: "AIzaSyCY9qgRC1XEeP9H1pODe1ngvjGKKlLBlYs",
  authDomain: "turnapp-717ba.firebaseapp.com",
  projectId: "turnapp-717ba",
  storageBucket: "turnapp-717ba.firebasestorage.app",
  messagingSenderId: "811218200487",
  appId: "1:811218200487:web:6c2260a35ba92109553882",
};

// Datos fijos de TurnApp (no configurables por negocio — son de Sebas como dueño
// de la plataforma, no de cada comercio que usa la app).
export const soporte = {
  email: "tusappasistente@gmail.com", // correo dedicado a soporte de TurnApp
};

// Duración del período gratuito, en días, para el chequeo de vencimiento.
export const DIAS_PLAN_GRATIS = 182; // ~6 meses

// --- Service worker: registro + aviso de "nueva versión" ---
// Estas dos funciones están acá (y no repetidas en cada página) porque config.js
// ya lo importan todas las pantallas (raíz, panel, catálogo). Así el cliente
// nunca necesita borrar caché a mano: cuando hay una versión nueva publicada
// (ver el comentario de CACHE_NAME en sw.js), aparece un cartel abajo de la
// pantalla con un botón para actualizar cuando la persona quiera.

// import.meta.url apunta a este mismo archivo (config.js), que siempre vive en
// la raíz del repo — por eso "./sw.js" resuelve bien la ruta sin importar si
// quien llama a esta función está en la raíz, en /panel/ o en /catalogo/.
export function registrarServiceWorker(onNuevaVersion) {
  if (!("serviceWorker" in navigator)) return;

  const swUrl = new URL("./sw.js", import.meta.url).href;

  navigator.serviceWorker.register(swUrl).then((registro) => {
    // Por si la página se abrió justo cuando ya había una actualización lista.
    if (registro.waiting && navigator.serviceWorker.controller) {
      onNuevaVersion?.();
    }

    registro.addEventListener("updatefound", () => {
      const nuevoWorker = registro.installing;
      if (!nuevoWorker) return;
      nuevoWorker.addEventListener("statechange", () => {
        // "installed" + ya había un controller = es una actualización, no la
        // primera instalación de la PWA.
        if (nuevoWorker.state === "installed" && navigator.serviceWorker.controller) {
          onNuevaVersion?.();
        }
      });
    });

    // Revisa si hay versión nueva cada vez que se vuelve a esta pestaña.
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") registro.update();
    });
  }).catch(() => {});
}

// Cartelito chico y no invasivo abajo de la pantalla. No recarga solo — espera
// a que la persona toque "Actualizar" para no interrumpirla en medio de una carga.
export function mostrarAvisoActualizacion(){
  if (document.getElementById("aviso-actualizacion")) return;
  const aviso = document.createElement("div");
  aviso.id = "aviso-actualizacion";
  aviso.style.cssText = "position:fixed;left:0;right:0;bottom:0;z-index:200;display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:12px;padding:12px 16px;background:#2F4033;color:#F5EFE4;font-family:'Work Sans',system-ui,sans-serif;font-size:13.5px;box-shadow:0 -6px 20px -6px rgba(0,0,0,0.3);";
  aviso.innerHTML = `
    <span>Hay una nueva versión de TurnApp lista.</span>
    <button id="btn-actualizar-ahora" style="background:#B8862E;color:#fff;border:none;border-radius:8px;padding:8px 14px;font-weight:600;font-family:inherit;font-size:13px;cursor:pointer;">Actualizar</button>
  `;
  document.body.appendChild(aviso);
  document.getElementById("btn-actualizar-ahora").addEventListener("click", () => window.location.reload());
}
