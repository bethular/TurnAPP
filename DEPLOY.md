# Cómo hacer el deploy de esta versión

1. Descomprimí `TurnApp_DEPLOY_FINAL.zip`.
2. Entrá a la carpeta `TurnApp_FINAL` que contiene directamente `index.html`.
3. Subí TODO el contenido de esa carpeta al repositorio/hosting de TurnApp.
4. Reemplazá los archivos anteriores por estos; no agregues un nivel extra de carpeta.
5. Conservá la estructura `panel/`, `catalogo/` y `admin/`.
6. No cambies `config.js` ni `firestore.rules` durante este deploy.
7. Publicá el sitio.
8. Abrí la aplicación y probá primero login → panel → Turnos.
9. Después probá Calendario, Servicios, Clientes, Caja, Configuración, Solicitudes y catálogo público.
10. Si el navegador conserva una versión anterior, esperá el aviso de nueva versión de TurnApp y tocá `Actualizar`.

## Importante
Esta versión no requiere instalar librerías ni ejecutar npm. Es HTML/CSS/JS con módulos ES y Firebase por CDN.
