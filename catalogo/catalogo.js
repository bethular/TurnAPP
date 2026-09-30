// ETAPA 9 — PASO 2 — CARPETA: catalogo — ARCHIVO: index.html
  import { firebaseConfig, registrarServiceWorker, mostrarAvisoActualizacion } from "../config.js";
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
  import {
    getFirestore, doc, getDoc, collection, getDocs, addDoc, query, where, orderBy, Timestamp
  } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

  registrarServiceWorker(mostrarAvisoActualizacion);

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const params = new URLSearchParams(window.location.search);
  const businessId = params.get("negocio");
  const contenedor = document.getElementById("contenedor");
  // El horario real se obtiene de businesses/{businessId}.horarioConfig,
  // igual que en el panel. No se usa un horario fijo como respaldo.
  let horarioConfigCatalogo = null;
  const PASO_MIN = 30;

  function formatearHora(m){
    const h = String(Math.floor(m / 60)).padStart(2, "0");
    const mm = String(m % 60).padStart(2, "0");
    return `${h}:${mm}`;
  }

  // Misma lógica efectiva que usa el panel:
  // 1) si existe una excepción para la fecha, esa excepción tiene prioridad;
  //    incluso slots=[] significa día cerrado.
  // 2) si no hay excepción, se usa el horario habitual de horarioConfig.dias.
  // No se consulta una colección "disponibilidadPatron" porque la configuración
  // vigente se guarda dentro del documento del negocio.
  async function obtenerCapacidadDia(fechaISO){
    const dispSnap = await getDoc(
      doc(db, "businesses", businessId, "disponibilidad", fechaISO)
    );

    if (dispSnap.exists()){
      const slots = dispSnap.data()?.slots;
      return new Set(Array.isArray(slots) ? slots : []);
    }

    const fecha = new Date(fechaISO + "T00:00:00");
    const diaSemana = fecha.getDay();
    const dia = horarioConfigCatalogo?.dias?.[String(diaSemana)];

    if (!dia?.activo || !Array.isArray(dia.rangos) || !dia.rangos.length){
      return new Set();
    }

    const slots = [];
    dia.rangos.forEach(rango => {
      const [desdeH, desdeM] = String(rango.desde || "").split(":").map(Number);
      const [hastaH, hastaM] = String(rango.hasta || "").split(":").map(Number);
      const inicio = desdeH * 60 + desdeM;
      const fin = hastaH * 60 + hastaM;

      if (!Number.isFinite(inicio) || !Number.isFinite(fin) || fin <= inicio) return;

      for (let m = inicio; m < fin; m += PASO_MIN){
        slots.push(m);
      }
    });

    return new Set(slots);
  }

  // --- datos del cliente: se guardan en este dispositivo para no tener que cargarlos cada vez ---
  const LS_NOMBRE = "turnapp_cliente_nombre";
  const LS_WHATSAPP = "turnapp_cliente_whatsapp";

  function pantallaMensaje(titulo, texto){
    contenedor.innerHTML = `<div class="pantalla-msg"><h2>${titulo}</h2><p>${texto}</p></div>`;
  }

  async function iniciar(){
    if (!businessId){
      pantallaMensaje("Falta el link completo", "A este link le falta la parte que identifica al negocio. Pedile al negocio el link completo del catálogo.");
      return;
    }

    const negocioSnap = await getDoc(doc(db, "businesses", businessId));
    if (!negocioSnap.exists()){
      pantallaMensaje("No encontramos este negocio", "Puede que el link esté mal escrito.");
      return;
    }
    const negocio = negocioSnap.data();
    document.getElementById("nombre-negocio").textContent = negocio.nombreComercio || "Reservar turno";
    horarioConfigCatalogo = negocio.horarioConfig || null;

    const vencimiento = negocio.fechaVencimiento?.toDate ? negocio.fechaVencimiento.toDate() : null;
    const vencido = negocio.plan === "gratis" && vencimiento && vencimiento < new Date();
    if (vencido){
      pantallaMensaje("No disponible por el momento", "Este negocio no está tomando turnos por acá ahora mismo. Contactalo directamente.");
      return;
    }

    const serviciosSnap = await getDocs(collection(db, "businesses", businessId, "servicios"));
    if (serviciosSnap.empty){
      pantallaMensaje("Todavía no hay servicios cargados", "Volvé a intentarlo más tarde.");
      return;
    }
    const servicios = serviciosSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    let serviciosElegidos = []; // ids tildados

    contenedor.innerHTML = `
      <div id="lista-servicios"></div>
      <div class="duracion-total" id="duracion-total"></div>
      <div id="zona-form"></div>
    `;
    const listaServicios = document.getElementById("lista-servicios");
    const duracionTotalEl = document.getElementById("duracion-total");

    function duracionElegida(){
      if (!serviciosElegidos.length) return 0;
      return serviciosElegidos.reduce((total, id) => {
        const s = servicios.find(sv => sv.id === id);
        return total + (s?.duracionMin || 30);
      }, 0);
    }

    function actualizarResumen(){
      const dur = duracionElegida();
      if (!serviciosElegidos.length){
        duracionTotalEl.textContent = "";
        mostrarFormulario(null);
        return;
      }
      const nombres = serviciosElegidos
        .map(id => servicios.find(s => s.id === id)?.nombre)
        .filter(Boolean)
        .join(" + ");
      duracionTotalEl.textContent = `${nombres} — ${dur} min en total`;
      mostrarFormulario(dur);
    }

    servicios.forEach(s => {
      const card = document.createElement("div");
      card.className = "servicio-card " + (s.foto ? "con-foto" : "sin-foto");
      const cuerpo = `
        <input type="checkbox" value="${s.id}">
        <div class="servicio-info">
          <div class="servicio-nombre">${s.nombre}</div>
          <div class="servicio-detalle">${s.duracionMin || 30} min</div>
          ${s.oferta ? `<div class="oferta-tag">${s.oferta}</div>` : ""}
        </div>
        <div class="servicio-precio">$${s.precio || 0}</div>
      `;
      card.innerHTML = s.foto
        ? `<img class="servicio-foto-grande" src="${s.foto}" alt="${s.nombre}"><div class="servicio-card-body">${cuerpo}</div>`
        : cuerpo;
      const input = card.querySelector("input");
      card.addEventListener("click", (e) => {
        if (e.target !== input) input.checked = !input.checked;
        card.classList.toggle("elegido", input.checked);
        serviciosElegidos = input.checked
          ? [...serviciosElegidos, s.id]
          : serviciosElegidos.filter(id => id !== s.id);
        actualizarResumen();
      });
      listaServicios.appendChild(card);
    });

    let slotElegido = null;
    let servicioNombreActual = "";

    function mostrarFormulario(duracion){
      const zona = document.getElementById("zona-form");
      if (!duracion){
        zona.innerHTML = "";
        return;
      }
      servicioNombreActual = serviciosElegidos
        .map(id => servicios.find(s => s.id === id)?.nombre)
        .filter(Boolean)
        .join(" + ");

      const hoy = new Date().toISOString().slice(0, 10);
      const nombreGuardado = localStorage.getItem(LS_NOMBRE) || "";
      const whatsappGuardado = localStorage.getItem(LS_WHATSAPP) || "";
      zona.innerHTML = `
        <div class="card-form">
          <div class="campo"><label>Tu nombre</label><input type="text" id="c-nombre" value="${nombreGuardado}"></div>
          <div class="campo"><label>Tu WhatsApp (con código de país, ej: 5493751...)</label><input type="text" id="c-whatsapp" value="${whatsappGuardado}"></div>
          <div class="campo"><label>Día</label>
            <div class="fecha-nav">
              <button type="button" class="fecha-nav-btn" id="c-fecha-atras">‹</button>
              <input type="date" id="c-fecha" min="${hoy}" value="${hoy}">
              <button type="button" class="fecha-nav-btn" id="c-fecha-adelante">›</button>
            </div>
          </div>
          <div class="campo"><label>Horario disponible</label><div class="slots-grid" id="c-slots"></div></div>
          <div class="msg" id="c-msg"></div>
          <button class="submit" id="c-pedir">Pedir turno</button>
        </div>
      `;
      slotElegido = null;
      const cFecha = document.getElementById("c-fecha");
      const cSlots = document.getElementById("c-slots");

      async function refrescarSlots(){
        slotElegido = null;
        cSlots.innerHTML = `<span style="font-size:13px; color:rgba(38,42,32,0.5);">Cargando…</span>`;

        try {
          // 1) horarios que el profesional dejó habilitados ese día (excepción puntual,
          // o si no, el patrón semanal — ver obtenerCapacidadDia)
          const disponibles = await obtenerCapacidadDia(cFecha.value);
          if (!disponibles.size){
            cSlots.innerHTML = `<span style="font-size:13px; color:rgba(38,42,32,0.5);">Este día no se atiende. Probá con otra fecha.</span>`;
            return;
          }

          // 2) ocupación pública del día.
          // El catálogo NO lee "turnos": esa colección contiene datos privados del cliente.
          // El panel publica únicamente las medias horas ocupadas en
          // businesses/{businessId}/ocupacionPublica/{fechaISO}.
          const ocupacionSnap = await getDoc(
            doc(db, "businesses", businessId, "ocupacionPublica", cFecha.value)
          );
          const bloqueadosPorTurnos = new Set(
            ocupacionSnap.exists() && Array.isArray(ocupacionSnap.data()?.ocupados)
              ? ocupacionSnap.data().ocupados
              : []
          );

          function bloqueLibre(inicioSlot, finSlot){
            for (let m = inicioSlot; m < finSlot; m += PASO_MIN){
              if (!disponibles.has(m)) return false; // el profesional no habilitó esa media hora
              if (bloqueadosPorTurnos.has(m)) return false; // ya hay un turno confirmado ahí
            }
            return true;
          }

          cSlots.innerHTML = "";
          const posiblesInicios = [...disponibles].sort((a, b) => a - b);
          for (const m of posiblesInicios){
            if (m + duracion > 24 * 60) continue;
            if (!bloqueLibre(m, m + duracion)) continue;
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "slot-btn";
            btn.textContent = formatearHora(m);
            btn.addEventListener("click", () => {
              cSlots.querySelectorAll(".slot-btn").forEach(b => b.classList.remove("elegido"));
              btn.classList.add("elegido");
              slotElegido = m;
            });
            cSlots.appendChild(btn);
          }
          if (!cSlots.children.length) cSlots.innerHTML = `<span style="font-size:13px; color:rgba(38,42,32,0.5);">No hay horarios libres ese día para lo que elegiste.</span>`;
        } catch (err) {
          console.error("TURNAPP — Error cargando horarios disponibles del catálogo", {
            businessId,
            fecha: cFecha.value,
            codigo: err?.code || "(sin código)",
            mensaje: err?.message || String(err),
            error: err
          });
          cSlots.innerHTML = `<span style="font-size:13px; color:rgba(38,42,32,0.5);">No pudimos cargar los horarios. Volvé a intentar en un momento.</span>`;
        }
      }
      const btnFechaAtras = document.getElementById("c-fecha-atras");
      const btnFechaAdelante = document.getElementById("c-fecha-adelante");
      cFecha.addEventListener("change", () => {
        btnFechaAtras.disabled = cFecha.value <= cFecha.min;
        refrescarSlots();
      });
      refrescarSlots();

      function sumarDias(dias){
        const d = new Date(cFecha.value + "T00:00:00");
        d.setDate(d.getDate() + dias);
        const iso = d.toISOString().slice(0, 10);
        if (iso < cFecha.min) return;
        cFecha.value = iso;
        btnFechaAtras.disabled = cFecha.value <= cFecha.min;
        refrescarSlots();
      }
      btnFechaAtras.disabled = cFecha.value <= cFecha.min;
      btnFechaAtras.addEventListener("click", () => sumarDias(-1));
      btnFechaAdelante.addEventListener("click", () => sumarDias(1));

      document.getElementById("c-pedir").addEventListener("click", async () => {
        const msg = document.getElementById("c-msg");
        const nombre = document.getElementById("c-nombre").value.trim();
        const whatsapp = document.getElementById("c-whatsapp").value.trim();
        if (!nombre){ msg.className = "msg show error"; msg.textContent = "Falta tu nombre."; return; }
        if (!whatsapp){ msg.className = "msg show error"; msg.textContent = "Falta tu WhatsApp — lo necesitamos para avisarte cuando se confirme."; return; }
        if (slotElegido === null){ msg.className = "msg show error"; msg.textContent = "Elegí un horario."; return; }

        const fecha = new Date(cFecha.value + "T00:00:00");
        fecha.setMinutes(slotElegido);

        try {
          await addDoc(collection(db, "businesses", businessId, "solicitudes"), {
            clienteNombre: nombre,
            clienteWhatsapp: whatsapp,
            servicios: serviciosElegidos.map(id => {
              const s = servicios.find(sv => sv.id === id);
              return { id, nombre: s?.nombre || "", duracionMin: s?.duracionMin || 30 };
            }),
            servicioNombre: servicioNombreActual,
            duracionTotal: duracion,
            fechaHora: Timestamp.fromDate(fecha),
            estado: "Pendiente",
            creadoEl: Timestamp.now(),
          });
          localStorage.setItem(LS_NOMBRE, nombre);
          localStorage.setItem(LS_WHATSAPP, whatsapp);
          pantallaMensaje("¡Listo!", "Tu pedido de turno quedó enviado. El negocio lo va a revisar y te confirma por WhatsApp.");
        } catch (err) {
          msg.className = "msg show error";
          msg.textContent = "No pudimos enviar el pedido. Probá de nuevo en un momento.";
        }
      });
    }
  }

  iniciar();
