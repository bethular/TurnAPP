import { firebaseConfig } from "../config.js";
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
  import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
  import {
    getFirestore, doc, setDoc, collection, getDocs, orderBy, query
  } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

  const ADMIN_UID = "eYcLh69WczLsEa0f612k5hbyULq2";

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  const loginGate = document.getElementById("login-gate");
  const panel = document.getElementById("panel");
  const loginMsg = document.getElementById("login-msg");

  document.getElementById("btn-admin-login").addEventListener("click", async () => {
    loginMsg.className = "msg";
    const email = document.getElementById("admin-email").value.trim();
    const pass = document.getElementById("admin-pass").value;
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err) {
      loginMsg.className = "msg show";
      loginMsg.textContent = "No pudimos iniciar sesión. Revisá el correo y la contraseña.";
    }
  });

  onAuthStateChanged(auth, (user) => {
    if (user && user.uid === ADMIN_UID) {
      loginGate.style.display = "none";
      panel.style.display = "block";
      cargarCodigos();
    } else {
      loginGate.style.display = "block";
      panel.style.display = "none";
      if (user && user.uid !== ADMIN_UID) {
        loginMsg.className = "msg show";
        loginMsg.textContent = "Esta cuenta no tiene permiso de administrador.";
      }
    }
  });

  function generarCodigoAlAzar(){
    const letras = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin caracteres confusos (0/O, 1/I)
    let parte = "";
    for (let i = 0; i < 6; i++) parte += letras[Math.floor(Math.random() * letras.length)];
    return "PRO-" + parte;
  }

  document.getElementById("btn-generar").addEventListener("click", async () => {
    const nota = document.getElementById("nota-codigo").value.trim();
    const codigo = generarCodigoAlAzar();

    await setDoc(doc(db, "codigosPro", codigo), {
      usado: false,
      nota: nota || null,
      creadoEl: new Date(),
    });

    document.getElementById("codigo-generado").textContent = codigo;
    document.getElementById("resultado").classList.add("show");

    document.getElementById("btn-copiar").onclick = () => {
      navigator.clipboard.writeText(codigo);
      document.getElementById("btn-copiar").textContent = "¡Copiado!";
      setTimeout(() => { document.getElementById("btn-copiar").textContent = "Copiar código"; }, 1500);
    };
    document.getElementById("btn-whatsapp").onclick = () => {
      const texto = `¡Hola! Tu versión Pro de TurnApp ya está lista. Para activarla, entrá a Configuración dentro de la app y cargá este código: ${codigo}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank");
    };

    document.getElementById("nota-codigo").value = "";
    cargarCodigos();
  });

  async function cargarCodigos(){
    const tabla = document.getElementById("tabla-codigos");
    tabla.innerHTML = `<tr><td colspan="3">Cargando…</td></tr>`;
    const snap = await getDocs(query(collection(db, "codigosPro"), orderBy("creadoEl", "desc")));
    if (snap.empty){
      tabla.innerHTML = `<tr><td colspan="3">Todavía no generaste ningún código.</td></tr>`;
      return;
    }
    tabla.innerHTML = "";
    snap.forEach((d) => {
      const c = d.data();
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${d.id}</td>
        <td>${c.nota || "—"}</td>
        <td class="${c.usado ? "estado-usado" : "estado-libre"}">${c.usado ? "Usado" : "Libre"}</td>
      `;
      tabla.appendChild(fila);
    });
  }
