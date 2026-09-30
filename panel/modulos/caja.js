// TurnApp — reglas de períodos de caja
function calcularRangoPeriodo(tipo, fechaRef){
    const d = new Date(fechaRef);
    if (tipo === "dia"){
      return [new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0), new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59)];
    }
    if (tipo === "anio"){
      return [new Date(d.getFullYear(), 0, 1, 0, 0, 0), new Date(d.getFullYear(), 11, 31, 23, 59, 59)];
    }
    return [new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0), new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)];
  }
export { calcularRangoPeriodo };
