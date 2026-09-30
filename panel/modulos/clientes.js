// TurnApp — identidad de clientes
import { normalizarNombre, normalizarTelefono } from "./utilidades.js";
function claveCliente(nombre, whatsapp){ const tel=normalizarTelefono(whatsapp); return tel || ("nombre:"+normalizarNombre(nombre)); }
export { claveCliente };
