// TurnApp — representación de disponibilidad
import { formatearHora } from "./utilidades.js";
const DISP_PASO = 30;
function formatearRangosDisponibilidad(slots){
    const ordenado = [...slots].sort((a, b) => a - b);
    const rangos = [];
    let inicio = null, anterior = null;
    ordenado.forEach(m => {
      if (inicio === null){ inicio = m; anterior = m; return; }
      if (m === anterior + DISP_PASO){ anterior = m; return; }
      rangos.push([inicio, anterior + DISP_PASO]);
      inicio = m; anterior = m;
    });
    if (inicio !== null) rangos.push([inicio, anterior + DISP_PASO]);
    return rangos.map(([i, f]) => formatearHora(i) + "–" + formatearHora(f)).join(", ");
  }
export { formatearRangosDisponibilidad };
