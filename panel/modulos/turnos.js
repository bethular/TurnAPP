// TurnApp — reglas puras de turnos
function duracionSeleccionada(serviciosCache, serviciosElegidos){
  if(!serviciosElegidos.length)return 30;
  return serviciosElegidos.reduce((total,id)=>{const s=serviciosCache.find(sv=>sv.id===id);return total+(s?.duracionMin||30);},0);
}
function armarLinkConfirmacion(nombre, whatsapp, servicioTexto, fecha){
    const fechaTexto = fecha.toLocaleDateString("es-AR") + " a las " + fecha.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
    const texto = `¡Hola ${nombre}! Tu turno de ${servicioTexto} quedó confirmado para el ${fechaTexto}. ¡Te esperamos!`;
    return `https://wa.me/${whatsapp}?text=${encodeURIComponent(texto)}`;
  }
export { duracionSeleccionada, armarLinkConfirmacion };
