// TurnApp — configuración de horario habitual
const DIAS_SEMANA_TURNAPP=[{id:1,nombre:"Lunes"},{id:2,nombre:"Martes"},{id:3,nombre:"Miércoles"},{id:4,nombre:"Jueves"},{id:5,nombre:"Viernes"},{id:6,nombre:"Sábado"},{id:0,nombre:"Domingo"}];
function horarioConfigVacio(){
    const dias = {};
    DIAS_SEMANA_TURNAPP.forEach(d => dias[String(d.id)] = { activo:false, rangos:[] });
    return { dias };
  }
function normalizarHorarioConfig(raw){
    const base = horarioConfigVacio(), src = raw?.dias || {};
    DIAS_SEMANA_TURNAPP.forEach(d => {
      const x = src[String(d.id)] || {};
      base.dias[String(d.id)] = {
        activo: x.activo === true,
        rangos: Array.isArray(x.rangos) ? x.rangos.filter(r => r && /^([01]\d|2[0-3]):[0-5]\d$/.test(r.desde||'') && /^([01]\d|2[0-3]):[0-5]\d$/.test(r.hasta||'') && r.desde < r.hasta).map(r => ({desde:r.desde,hasta:r.hasta})) : []
      };
    });
    return base;
  }
function validarHorarioConfig(cfg){
    for(const d of DIAS_SEMANA_TURNAPP){
      const dia=cfg.dias[String(d.id)]; if(!dia.activo)continue;
      if(!dia.rangos.length)return `Marcaste ${d.nombre} como día de trabajo pero no tiene horario.`;
      const rangos=dia.rangos.slice().sort((a,b)=>a.desde.localeCompare(b.desde));
      for(const r of rangos)if(r.desde>=r.hasta)return `El horario de ${d.nombre} tiene un rango inválido.`;
      for(let i=1;i<rangos.length;i++)if(rangos[i].desde<rangos[i-1].hasta)return `Los rangos de ${d.nombre} se superponen.`;
    }
    return null;
  }
export { DIAS_SEMANA_TURNAPP, horarioConfigVacio, normalizarHorarioConfig, validarHorarioConfig };
