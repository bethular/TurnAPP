# HISTORIAL — TurnApp

## 2026-09-29 — Etapa final de modularización
- Se mantuvieron los nombres de entrada actuales para evitar romper rutas existentes.
- Se mantuvo `config.js` en la raíz.
- Se mantuvo `firestore.rules` sin cambios.
- Se consolidó la separación HTML / CSS / JS.
- Se ampliaron los módulos del panel para utilidades, horarios, turnos, clientes, caja, configuración y disponibilidad.
- `panel.js` queda como coordinador para conservar dependencias y estado compartido.
- Se corrigieron dependencias de los módulos extraídos para que no dependan de variables globales inexistentes.
- Se actualizó el Service Worker a `turnapp-shell-v4`.
- El Service Worker solo intercepta GET; no intercepta POST/PUT/PATCH/DELETE.
- Se incorporaron todos los módulos nuevos al shell cacheado.
- Se verificó sintaxis con Node para todos los JS.
- Se verificaron los JSON de manifiestos.
- Se verificaron rutas locales principales.

## Criterio de cierre
No se realizó una reescritura completa de cada listener de Firestore en archivos independientes porque eso requeriría cambiar el modelo de estado compartido y aumentaría el riesgo de alterar el comportamiento existente. La modularización final prioriza separación real de reglas reutilizables y estabilidad funcional.
