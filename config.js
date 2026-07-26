// config.js — raíz del repo. Todas las pantallas lo importan con ruta relativa.
// Reemplazar firebaseConfig con las credenciales reales del proyecto de Firebase
// de TurnApp (Firebase Console → Configuración del proyecto → Tus apps → SDK).

export const firebaseConfig = {
  apiKey: "REEMPLAZAR",
  authDomain: "REEMPLAZAR.firebaseapp.com",
  projectId: "REEMPLAZAR",
  storageBucket: "REEMPLAZAR.appspot.com",
  messagingSenderId: "REEMPLAZAR",
  appId: "REEMPLAZAR",
};

// Datos fijos de TurnApp (no configurables por negocio — son de Sebas como dueño
// de la plataforma, no de cada comercio que usa la app).
export const soporte = {
  email: "REEMPLAZAR@REEMPLAZAR.com", // correo dedicado a soporte de TurnApp
};

// Duración del período gratuito, en días, para el chequeo de vencimiento.
export const DIAS_PLAN_GRATIS = 182; // ~6 meses
