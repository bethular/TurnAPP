# TurnApp — Especificación técnica

PWA multi-tenant de turnos/reservas para múltiples negocios de servicios (peluquería,
estudio de masajes, y otros que se sumen a futuro). Documento de referencia único:
pegar entero al arrancar una conversación nueva.

---

## 1. Arquitectura base

- **Frontend**: HTML/CSS/JS plano, sin build ni framework. Cada pantalla es un
  `index.html` autocontenido (estilos en `<style>` en el `<head>`, lógica en un único
  `<script type="module">` al final del `<body>`).
- **Datos y sincronización**: Firebase (Firestore).
- **Hosting**: GitHub Pages, sitio estático servido directo desde el repo
  (Settings → Pages → Branch: main).
- **Instalable como app**: PWA (`manifest.json` + `sw.js` + carpeta `icons/`),
  instalable en el celular sin pasar por tienda de aplicaciones.
- **`config.js` compartido**: un solo archivo en la raíz del repo con `firebaseConfig`.
  Todas las pantallas lo cargan con ruta relativa — tiene que quedar en la raíz, un
  nivel arriba de cualquier subcarpeta.
- **Multi-tenant, un solo proyecto de Firebase**: todos los negocios comparten el mismo
  proyecto y el mismo Firestore. No hay un proyecto de Firebase por negocio. Podrían
  sumarse más de dos negocios, independientes entre sí.
- **Repositorio**: GitHub, usuario `Bethular`. Repo `TurnApp` — todavía no creado.

## 2. Autenticación

- **Registro público**: cada dueño de negocio crea su propia cuenta con correo y
  contraseña (Firebase Authentication). No hay cuentas creadas a mano en la consola.
- En el alta, el dueño carga la configuración de su negocio: nombre del comercio
  (configurable libremente, no fijo), WhatsApp de contacto, tema de color.
- El `uid` del dueño funciona como `businessId`: identifica y aísla todos los datos
  de ese negocio. Cada dueño ve y gestiona únicamente sus propios turnos, clientes,
  servicios y caja.
- El catálogo de servicios es de lectura pública (sin login) para que los clientes
  puedan ver precios y pedir turno.

## 3. Personalización por negocio

- **Nombre del negocio**: editable por el dueño, no hardcodeado.
- **Tema visual**: 4-5 variantes de color de fondo, seleccionables por el dueño.
- **Profesionales**: mínimo 4 de arranque, pero la cantidad es configurable — el
  dueño puede agregar o quitar profesionales.

## 4. Catálogo público (cara al cliente)

- Vista sin login donde el cliente navega los servicios del negocio.
- Cada servicio muestra: nombre, precio, duración, y ofertas/promociones si las hay.
- El cliente elige un servicio y un horario disponible, y pide el turno.
- El pedido se guarda en Firestore como solicitud, todavía no confirmado.

## 5. Sistema de turnos y agenda

- Cada servicio tiene una **duración configurable** que se usa para calcular
  automáticamente cuándo el profesional queda libre para el próximo turno — esto
  arma la disponibilidad sugerida en el catálogo.
- El profesional puede **anular ese cálculo a mano**, servicio por servicio y turno
  por turno:
  - Reabrir un horario que quedó marcado como ocupado, si sabe que puede atender a
    otro cliente en el medio (ejemplo: durante el tiempo de espera de una tintura,
    reabrir ese hueco para otro turno, sin afectar otros turnos con tiempos más
    ajustados como un corte).
  - Permitir más de un turno en el mismo horario si lo prefiere.
  - Esta configurabilidad es total: no hay una regla fija de "un turno = un bloque
    cerrado", depende de la decisión del profesional en cada caso.

## 6. Flujo de confirmación (no automático)

1. El cliente pide un turno desde el catálogo.
2. El profesional recibe una **alerta** con la solicitud (todavía no está reservado).
3. El profesional revisa y da el **OK**.
4. Recién ahí el turno queda confirmado/reservado.

Esto le da al profesional el control final sobre superposiciones y reaperturas,
incluso cuando el cálculo automático de disponibilidad diga que un horario está
ocupado.

## 7. Página de turnos reservados

- Lista todos los turnos reservados de forma clara y legible, incluso cuando hay
  varios turnos superpuestos en el mismo horario.
- Cada turno muestra como mínimo: **nombre del cliente** y **servicio/trabajo** a
  realizar — esos dos datos le permiten al profesional decidir si reabre ese hueco
  o da otro turno encima.
- Clic sobre el nombre del cliente → abre un mensaje de WhatsApp prearmado (`wa.me`)
  recordándole el turno.

## 8. Gestión de estados

Cada turno tiene un desplegable con estos estados:

```
Reservado → Confirmado → Atendido → Ausente → Cambio de turno
```

- Los estados se cambian desde el desplegable en cualquier momento.
- Al seleccionar **"Cambio de turno"**, se habilita la carga de un nuevo horario y
  día para ese turno (reprograma, no es solo una etiqueta).

## 9. Clientes con historial

- Pestaña "Clientes" separada por negocio.
- Cada cliente tiene su propia ficha con historial de turnos anteriores, teléfono
  con link directo a WhatsApp, y totales.

## 10. Caja

Módulo financiero independiente por negocio (cada uno con su propia caja, separado
de la operación diaria de turnos):

- Ingresos y gastos, con categoría editable y método de pago.
- Resumen por período (semana/mes/año) con ganancia neta, saldo, y comparación con
  períodos anteriores.
- Ranking de servicios más vendidos.
- Botón para compartir el resumen por WhatsApp.

## 11. Fotos (si aplica)

Se comprimen en el navegador y se guardan embebidas en el propio documento de
Firestore, para no depender de Firebase Storage ni de cuenta de facturación de
Google. Sirve para fotos de trabajos/servicios, no para video.

## 12. Respaldo

Botón de exportar/importar un archivo `.json` con todos los datos del negocio, como
respaldo manual además de la sincronización automática de Firestore.

## 13. Usuarios múltiples por negocio (a definir)

Con el modelo actual (`businessId = uid del dueño`) solo hay un login por negocio.
Si se implementa acceso individual por profesional, el modelo cambia así:

- `businessId` pasa a ser un ID propio del negocio, no el `uid` directo del dueño.
- Colección `businesses/{businessId}/usuarios/{uid}` vincula cada cuenta de
  Firebase Auth a ese negocio, con un rol (`dueño` / `profesional`).
- Las reglas de Firestore verifican que `request.auth.uid` exista en esa lista de
  usuarios del negocio, en vez de comparar contra un único `uid`.
- El dueño invita/carga el correo de cada profesional desde su panel.
- Función exclusiva de la versión Pro (ver sección 15).

## 14. Consultorios/salas (configurable, opcional)

No todos los negocios lo necesitan — depende de si los consultorios son fijos por
profesional o compartidos/rotativos:

```
businesses/{businessId}/consultorios/{consultorioId}
  - nombre (ej: "Sala 1", "Box 2")

businesses/{businessId}/profesionales/{profesionalId}
  - nombre
  - consultorioFijo (opcional)

businesses/{businessId}/turnos/{turnoId}
  - ...campos existentes...
  - consultorioId (opcional)
```

Si el negocio no carga consultorios, el campo no se usa y la disponibilidad se
calcula solo por profesional. Si los carga, la disponibilidad de un horario cruza
**profesional libre + consultorio libre**. Función exclusiva de la versión Pro.

## 15. Plan gratis vs Pro

Dos versiones de TurnApp:

- **Gratis**: 6 meses de uso; al vencer, Sebas la reactiva manualmente tras el pago.
- **Pro**: sin período gratuito, pago único anual, con todos los servicios adicionales.

El plan y su vencimiento se guardan en el propio documento del negocio:

```
businesses/{businessId}
  - ...campos existentes...
  - plan: "gratis" | "pro"
  - fechaVencimiento
```

| Función | Gratis | Pro |
|---|---|---|
| Catálogo + turnos + estados | ✅ | ✅ |
| Un profesional (hasta 4) | ✅ | ✅ ilimitado |
| Un usuario/login | ✅ | ✅ varios usuarios (sección 13) |
| Un tema de color fijo | ✅ | ✅ 4-5 a elección |
| WhatsApp recordatorio | ✅ | ✅ |
| Clientes — solo última fecha de turno | ✅ | ✅ historial completo |
| Consultorios/salas (sección 14) | ❌ | ✅ |
| Ofertas/promociones en catálogo | ❌ | ✅ |
| Reapertura manual / superposición de turnos | ❌ | ✅ |
| Caja/Cuentas | ❌ | ✅ |
| Respaldo exportar/importar | ❌ | ✅ |

**Bloqueo al vencer los 6 meses gratis** (minimalista pero estricto):
- No se pueden guardar turnos nuevos.
- El catálogo público deja de funcionar (muestra aviso de no disponible).
- Los datos existentes no se borran ni se ocultan — el profesional puede seguir
  viendo lo que ya tenía cargado.
- Al reactivarse (plan `"pro"`), todo vuelve a funcionar sobre los mismos datos —
  no hay migración ni importación de archivos.

## 16. Asistencia técnica / contacto

Correo de contacto de Sebas, fijo en `config.js` (no configurable por negocio).

- **Menú desplegable del panel**, último ítem: "Asistencia técnica" → botón
  `mailto:` con asunto y cuerpo prearmados pidiendo que se especifique brevemente
  el problema.
- **Pantalla de bloqueo** (cuenta vencida): botón "Pasar a la versión Pro" →
  `mailto:` con asunto y cuerpo prearmados pidiendo el número de teléfono del
  negocio, indicando que se van a comunicar a la brevedad.

## 17. Pagos (Mercado Pago) — Fase 2, pendiente

Evaluado pero pospuesto. Dos caminos posibles cuando se retome:

- **Opción simple** (sin backend): cada profesional genera un link/botón de cobro
  desde su propia cuenta de Mercado Pago y lo carga en la configuración de cada
  servicio; el pago se marca a mano en TurnApp (sin confirmación automática).
- **Opción integrada** (Checkout Pro): requiere backend (Firebase Cloud Functions)
  para generar la preferencia de pago con el Access Token privado de cada negocio,
  y pasar el proyecto de Firebase al plan Blaze.

## 18. Modelo de datos en Firestore

```
businesses/{businessId}
  - nombreComercio, whatsapp, tema, profesionales: [...]

businesses/{businessId}/servicios/{servicioId}
  - nombre, precio, duracionMin, oferta (opcional)

businesses/{businessId}/turnos/{turnoId}
  - clienteNombre, clienteWhatsapp, servicioId, profesionalId
  - fechaHora, estado (Reservado/Confirmado/Atendido/Ausente/Cambio de turno)
  - reabierto (bool)

businesses/{businessId}/clientes/{clienteId}
  - nombre, whatsapp, historialTurnos: [...]

businesses/{businessId}/caja/{movimientoId}
  - tipo (ingreso/gasto), monto, categoría, fecha, medioPago
```

`businessId` = `uid` del dueño del negocio (Firebase Auth).

## 19. Reglas de Firestore (patrón)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Catálogo de servicios: lectura pública, escritura solo del dueño del negocio
    match /businesses/{businessId}/servicios/{id} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == businessId;
    }

    // Turnos: cualquiera puede crear una solicitud, solo el dueño lee/gestiona
    match /businesses/{businessId}/turnos/{id} {
      allow create: if true;
      allow read, update, delete: if request.auth != null && request.auth.uid == businessId;
    }

    // Clientes y caja: privados, solo el dueño del negocio
    match /businesses/{businessId}/{coleccion=clientes|caja}/{id} {
      allow read, write: if request.auth != null && request.auth.uid == businessId;
    }

    // Datos del negocio (nombre, tema, config)
    match /businesses/{businessId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == businessId;
    }
  }
}
```

Cada colección nueva que se agregue necesita su propia regla explícita en la consola
de Firebase — si falta, esa parte de la app se queda "cargando" sin avisar el motivo.

## 20. Errores típicos a tener en cuenta

- Nunca abrir el `index.html` con doble clic desde la compu (`file:///...`): el
  navegador bloquea la carga de `config.js`. Siempre entrar por la URL real de
  GitHub Pages.
- URL de GitHub Pages: `https://bethular.github.io/TurnApp/...` — confirmar que
  Pages esté activado en el repo.
- Un botón que no responde: casi siempre el script se frenó en un error temprano
  (típicamente `config.js` no cargó, o `firebaseConfig` está mal). Se diagnostica en
  la pestaña **Console** del navegador, viendo el primer error en rojo.
- Un valor `undefined` al guardar: Firestore lo rechaza y el guardado falla en
  silencio si no se controla. Usar `null` en vez de `undefined`, y mostrar un
  mensaje de error visible si algo falla al guardar.

## 21. Estado del proyecto

- Recién arrancando el código — se creó la estructura base del repo `TurnApp`.
- Proyecto de Firebase existente hoy: solo "Punto Electro" (`punto-electro-f3b73`).
  Falta crear el proyecto de Firebase para TurnApp (o decidir si se reutiliza uno).
- Correo de contacto de asistencia técnica: pendiente (Sebas va a crear uno nuevo,
  dedicado a esto).
