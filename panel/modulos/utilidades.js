// TurnApp — utilidades compartidas
import { soporte } from "../../config.js";

function formatearHora(m){
  const h = String(Math.floor(m / 60)).padStart(2, "0");
  const mm = String(m % 60).padStart(2, "0");
  return `${h}:${mm}`;
}
function normalizarNombre(s){ return (s || "").trim().replace(/\s+/g, " ").toLowerCase(); }
function normalizarTelefono(s){ return (s || "").replace(/\D/g, ""); }
function armarMailto(asunto, cuerpo){ return `mailto:${soporte.email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`; }
function fechaAISO(d){ return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function esMismoDia(a,b){ return fechaAISO(a)===fechaAISO(b); }
function minutosDesdeHora(hhmm){ if(!hhmm)return NaN; const [h,m]=hhmm.split(":").map(Number); return h*60+m; }
function horaDesdeMinutos(minutos){ const h=String(Math.floor(minutos/60)).padStart(2,"0"); const m=String(minutos%60).padStart(2,"0"); return `${h}:${m}`; }
function fechasEntre(desdeISO,hastaISO){ const fechas=[]; const ini=new Date(desdeISO+"T00:00:00"), fin=new Date(hastaISO+"T00:00:00"); if(!Number.isFinite(ini.getTime())||!Number.isFinite(fin.getTime())||ini>fin)return fechas; for(let d=new Date(ini);d<=fin;d.setDate(d.getDate()+1))fechas.push(fechaAISO(new Date(d))); return fechas; }
export { formatearHora,normalizarNombre,normalizarTelefono,armarMailto,fechaAISO,esMismoDia,minutosDesdeHora,horaDesdeMinutos,fechasEntre };
