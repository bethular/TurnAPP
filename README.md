# TurnApp — estructura modular final

## Objetivo
Separar presentación, lógica compartida y reglas de dominio sin cambiar el modelo de datos existente.

## Entradas
- `index.html`: acceso y registro.
- `panel/panelindex.html`: panel del comercio.
- `catalogo/catalogoindex.html`: catálogo público.
- `admin/adminindex.html`: administración.

## Panel
- `panel.css`: estilos del panel.
- `panel.js`: coordinador de la aplicación y operaciones Firebase que dependen del DOM.
- `panel/modulos/utilidades.js`: fechas, horas, normalización y mailto.
- `panel/modulos/horarios.js`: conversión de rangos y slots.
- `panel/modulos/turnos.js`: reglas puras de turnos y enlace de confirmación.
- `panel/modulos/clientes.js`: clave de identidad de cliente.
- `panel/modulos/caja.js`: cálculo de períodos.
- `panel/modulos/configuracion.js`: reglas del horario habitual.
- `panel/modulos/disponibilidad.js`: presentación de rangos de disponibilidad.
- `panel/modulos/calendario.js`: reexporta utilidades del calendario.

## Regla de arquitectura
`panel.js` queda como coordinador porque varias funciones actuales comparten estado y listeners de Firestore. No se duplican Firebase, autenticación ni estado entre módulos.

## Firebase
`config.js` permanece en la raíz para conservar las rutas del Service Worker y las entradas existentes. `firestore.rules` no fue modificado.

## Service Worker
`sw.js` usa una versión nueva de caché y solo intercepta solicitudes GET. Las operaciones de escritura no pasan por el Service Worker.

## Deploy
Subir el contenido de esta carpeta manteniendo exactamente las carpetas `panel`, `catalogo` y `admin`. No subir la carpeta contenedora como un nivel adicional.

## Verificación
Se comprobó sintaxis JavaScript, JSON, referencias locales y presencia de todos los módulos del shell. La prueba final del comportamiento real debe hacerse en el proyecto publicado con Firebase activo.
