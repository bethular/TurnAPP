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
  email: "REEMPLAZAR@REEMPLAZAR.com", // correo dedicado a soporte de TurnApp
};

// Duración del período gratuito, en días, para el chequeo de vencimiento.
export const DIAS_PLAN_GRATIS = 90; // ~3 meses
