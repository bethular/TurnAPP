// TurnApp — horarios compartidos
import { minutosDesdeHora, horaDesdeMinutos } from "./utilidades.js";
const DISP_PASO = 30;
function slotsDeRangos(rangos){ const slots=new Set(); (Array.isArray(rangos)?rangos:[]).forEach(r=>{const inicio=minutosDesdeHora(r.desde),fin=minutosDesdeHora(r.hasta);if(!Number.isFinite(inicio)||!Number.isFinite(fin)||fin<=inicio)return;for(let m=inicio;m<fin;m+=DISP_PASO)slots.add(m);});return slots; }
function rangosDesdeSlots(slots){ const ordenado=[...new Set(slots)].sort((a,b)=>a-b),rangos=[];let inicio=null,anterior=null;ordenado.forEach(m=>{if(inicio===null){inicio=m;anterior=m;return;}if(m===anterior+DISP_PASO){anterior=m;return;}rangos.push({desde:horaDesdeMinutos(inicio),hasta:horaDesdeMinutos(anterior+DISP_PASO)});inicio=m;anterior=m;});if(inicio!==null)rangos.push({desde:horaDesdeMinutos(inicio),hasta:horaDesdeMinutos(anterior+DISP_PASO)});return rangos;}
function ordenarRangos(rangos){return [...(rangos||[])].sort((a,b)=>minutosDesdeHora(a.desde)-minutosDesdeHora(b.desde));}
export {slotsDeRangos,rangosDesdeSlots,ordenarRangos,DISP_PASO};
