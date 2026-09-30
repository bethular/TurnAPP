# Módulos del Panel

En esta etapa se separaron utilidades puras y operaciones de horarios/calendario.

- `utilidades.js`: formato de hora, normalización, mailto y fechas.
- `horarios.js`: conversión entre rangos y slots y ordenamiento de rangos.
- `calendario.js`: fachada de utilidades usadas por calendario.

La lógica que mantiene estado compartido, listeners de Firestore y eventos de UI permanece en `panel.js` para evitar romper dependencias cruzadas.
