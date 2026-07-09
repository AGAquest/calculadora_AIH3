// --- BASE DE DATOS Y CONSTANTES ---
const baseDatosPersonajes = {
  "Yuki Lowes": { vida: 23, defensa: 7, fuerza: 5, inteligencia: 20, poder: 46, velocidad: 7 },
  "Koichi Mikazuki": { vida: 37, defensa: 1, fuerza: 4, inteligencia: 20, poder: 31, velocidad: 5 },
  "Aeris Luneveil": { vida: 20, defensa: 21, fuerza: 20, inteligencia: 20, poder: 30, velocidad: 17 },
  "Namui": { vida: 23, defensa: 10, fuerza: 19, inteligencia: 20, poder: 11, velocidad: 12 },
  "Elizabeth": { vida: 20, defensa: 5, fuerza: 12, inteligencia: 5, poder: 18, velocidad: 10 },
  "Adrian Gallar": { vida: 17, defensa: 5, fuerza: 12, inteligencia: 13, poder: 17, velocidad: 18 },
  "Nyx Benevendo": { vida: 21, defensa: 5, fuerza: 4, inteligencia: 20, poder: 25, velocidad: 11 },
  "Kurobane Rei": { vida: 20, defensa: 20, fuerza: 9, inteligencia: 26, poder: 18, velocidad: 10 },
  "Ryo Kamigawa": { vida: 10, defensa: 5, fuerza: 5, inteligencia: 15, poder: 20, velocidad: 5 },
  "Zyra": { vida: 20, defensa: 11, fuerza: 20, inteligencia: 20, poder: 20, velocidad: 4 },
  "Tae Inazuma":{vida: 21, defensa: 1, fuerza: 5, inteligencia: 20, poder: 38, velocidad: 2 },
  "Tatsumi":{vida: 10, defensa: 11,    fuerza: 5, inteligencia: 20, poder: 14, velocidad: 10 },
  "Theodore Lawrence":{vida: 9, defensa: 7, fuerza: 7, inteligencia: 20, poder: 19, velocidad: 8 },
  "Kaori Nanao":{vida: 10, defensa: 3, fuerza: 4, inteligencia: 17, poder: 16, velocidad: 10 },
};


const multiplicadores = {
  defensa: [0.2, 0.4, 0.5, 0.6, 0.7, 0.8], 
  fuerza: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6],
  poder: [0.0, 0.1, 0.2, 0.3, 0.4, 0.5], 
  velocidad: [0.1, 0.3, 0.5, 0.6, 0.8, 1.0],
  canalizacion: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6], 
  infusion: [0.2, 0.3, 0.4, 0.5, 0.6, 0.7],
  disparo: [0.2, 0.3, 0.4, 0.5, 0.6, 0.7], 
  disparo_infundido: [0.3, 0.4, 0.5, 0.6, 0.7, 0.8],
  defensa_imbuida: [0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
};

// --- ESTADO GLOBAL MULTI-SLOT (SANDBOX) ---
let gameState = { turno: 1, dots: {} };
let activeSlots = [];
let slotCounter = 0;
let historialTurnos = [];

// --- INICIALIZACIÓN ---
document.addEventListener("DOMContentLoaded", () => {
  agregarCombatiente(); // Slot 1
  agregarCombatiente(); // Slot 2
});

document.getElementById('btnAddSlot').addEventListener('click', agregarCombatiente);

function agregarCombatiente() {
  slotCounter++;
  const id = slotCounter;
  activeSlots.push(id);
  gameState.dots[id] = [];

  const bf = document.getElementById('battlefield');
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = generarPlantillaPersonaje(id);
  bf.appendChild(tempDiv.firstElementChild);

  vincularEventosCombatiente(id);
  actualizarObjetivosGlobales();
}

function removerCombatiente(id) {
  activeSlots = activeSlots.filter(s => s !== id);
  delete gameState.dots[id];
  const card = document.getElementById(`char${id}`);
  if (card) card.remove();
  actualizarObjetivosGlobales();
}

function vincularEventosCombatiente(id) {
  document.getElementById(`dado${id}`).addEventListener('input', () => {
    document.getElementById(`dotPanel${id}`).style.display = (document.getElementById(`dado${id}`).value == 10) ? "block" : "none";
  });
  document.getElementById(`vida${id}`).addEventListener('input', () => sincronizarVidaManual(id));
  document.getElementById(`name${id}`).addEventListener('input', actualizarObjetivosGlobales);
}

function cambiarEquipo(id) {
  const card = document.getElementById(`char${id}`);
  const teamVal = document.getElementById(`team${id}`).value;
  card.className = `card ${teamVal}`;
  actualizarObjetivosGlobales();
}

// --- ACTUALIZADOR INTELIGENTE DE OBJETIVOS ---
function actualizarObjetivosGlobales() {
  const is1v1 = (activeSlots.length === 2);

  activeSlots.forEach(id => {
    let targetContainer = document.getElementById(`target-container${id}`);
    let targetSelect = document.getElementById(`target${id}`);
    let currentTarget = targetSelect.value;

    if (is1v1) {
      targetContainer.style.display = 'none';
      let enemyId = activeSlots.find(x => x !== id);
      targetSelect.innerHTML = `<option value="${enemyId}">Slot ${enemyId}</option>`;
    } else {
      targetContainer.style.display = 'block';
      let myTeam = document.getElementById(`team${id}`).value;
      let enemigos = [];
      let aliados = [];

      activeSlots.forEach(otherId => {
        if (otherId === id) return;
        let otherTeam = document.getElementById(`team${otherId}`).value;
        if (myTeam !== 'none' && myTeam === otherTeam) aliados.push(otherId);
        else enemigos.push(otherId);
      });

      let html = '';
      if (enemigos.length > 0) {
        html += `<optgroup label="Enemigos">`;
        enemigos.forEach(e => html += `<option value="${e}">${document.getElementById(`name${e}`).value} (Slot ${e})</option>`);
        html += `</optgroup>`;
      }
      if (aliados.length > 0) {
        html += `<optgroup label="Aliados">`;
        aliados.forEach(a => html += `<option value="${a}">${document.getElementById(`name${a}`).value} (Slot ${a})</option>`);
        html += `</optgroup>`;
      }
      targetSelect.innerHTML = html;

      if (Array.from(targetSelect.options).some(opt => opt.value === currentTarget)) {
        targetSelect.value = currentTarget;
      }
    }
  });
}

function generarPlantillaPersonaje(id) {
  return `
    <div class="card team-none" id="char${id}">
      <button class="btn-remove-slot" onclick="removerCombatiente(${id})" style="${activeSlots.length <= 2 && id <= 2 ? 'display:none;' : ''}">✖ Quitar</button>
      
      <div class="header-actions" style="display: flex; gap: 1rem; margin-bottom: 1rem;">
        <div class="input-group" style="flex: 1; margin: 0;">
          <label>Slot ${id} - Personaje</label>
          <button type="button" class="btn-roster" onclick="abrirRuleta(${id})">Elegir Personaje 🔍</button>
        </div>
        <div class="input-group" style="flex: 1; margin: 0;">
          <label>Asignar Equipo</label>
          <select id="team${id}" onchange="cambiarEquipo(${id})">
            <option value="team-none">Ninguno (FFA)</option>
            <option value="team-a">Equipo A (Azul)</option>
            <option value="team-b">Equipo B (Rojo)</option>
            <option value="team-c">Equipo C (Verde)</option>
            <option value="team-d">Equipo D (Amarillo)</option>
          </select>
        </div>
      </div>

      <div class="static-panel">
        <div class="img-placeholder" id="img-container${id}"><img id="sprite${id}" src="assets/default.png" alt="Sprite P${id}" onerror="this.src=''; this.alt='Sin Imagen'"></div>
        
        <div class="stats-list">
          <div class="stat-row"><strong>Vida Max:</strong> <span id="base-vida${id}">-</span></div>
          <div class="stat-row"><strong>Defensa:</strong> <span id="base-defensa${id}">-</span></div>
          <div class="stat-row"><strong>Fuerza:</strong> <span id="base-fuerza${id}">-</span></div>
          <div class="stat-row"><strong>Inteligencia:</strong> <span id="base-inteligencia${id}">-</span></div>
          <div class="stat-row"><strong>Poder:</strong> <span id="base-poder${id}">-</span></div>
          <div class="stat-row"><strong>Velocidad:</strong> <span id="base-velocidad${id}">-</span></div>
        </div>

        <div class="tactical-toggles">
          <label style="color:var(--damage);" title="Ignora el choque mutuo y ataca directamente">
            <input type="checkbox" id="directo${id}"> 💥 Ataque Directo
          </label>
          <label style="color:var(--defense);" title="Protege a ti y a tu objetivo aliado si defiendes">
            <input type="checkbox" id="zona${id}"> 🛡️ Defender Zona
          </label>
          <label style="color:var(--status);" title="Suma 50% extra al daño final provocado">
            <input type="checkbox" id="debilidad${id}"> 🎯 Explotar Debilidad
          </label>
        </div>
      </div>

      <div class="health-section">
        <div class="health-bar-container"><div id="health-bar${id}" class="health-bar-fill fill-healthy" style="width: 100%;"></div></div>
        <div class="health-labels"><span id="health-status${id}" class="health-status-text">ÓPTIMO</span><span class="health-values"><span id="health-num${id}">0</span> / <span id="health-base-num${id}">0</span> HP</span></div>
      </div>
      <hr class="divider">

      <div class="interactive-panel">
        <div class="input-group"><label>Nombre Actual</label><input type="text" id="name${id}" placeholder="Nombre" value="Jugador ${id}"></div>
        <div class="stats-grid">
          <div class="input-group"><label>Vida Actual</label><input type="number" id="vida${id}" min="0" value="0"></div>
          <div class="input-group"><label>Defensa</label><input type="number" id="defensa${id}" min="0" value="0"></div>
          <div class="input-group"><label>Fuerza</label><input type="number" id="fuerza${id}" min="0" value="0"></div>
          <div class="input-group"><label>Inteligencia</label><input type="number" id="inteligencia${id}" min="0" value="0"></div>
          <div class="input-group"><label>Poder</label><input type="number" id="poder${id}" min="0" value="0"></div>
          <div class="input-group"><label>Velocidad</label><input type="number" id="velocidad${id}" min="0" value="0"></div>
        </div>

        <div class="action-section">
          <div class="input-group">
            <label>Acción a realizar</label>
            <select id="accion${id}">
              <option value="fuerza">Ataque Físico (Fuerza)</option><option value="poder">Ataque de Poder (Poder)</option>
              <option value="velocidad">Esquive / Velocidad</option><option value="defensa">Bloqueo (Defensa)</option>
              <option value="canalizacion">Canalización</option><option value="infusion">Infusión</option>
              <option value="disparo">Disparo</option><option value="disparo_infundido">Disparo Infundido</option>
              <option value="defensa_imbuida">Defensa Imbuida</option>
            </select>
          </div>
          <div class="input-group"><label>Dado Acción</label><input type="number" id="dado${id}" min="1" max="10" value="5"></div>
        </div>

        <div class="input-group target-highlight" id="target-container${id}">
          <label>🎯 Seleccionar Objetivo</label>
          <select id="target${id}"></select>
        </div>

        <div class="dot-section" id="dotPanel${id}" style="display: none;">
          <h4>🩸 Aplicar DoT al Enemigo</h4>
          <div class="input-group">
            <label>SELECCIONAR DOTS (CTRL+CLICK PARA VARIOS)</label>
            <select id="dotsActivos${id}" multiple size="5">
              <option value="vacio" selected>-- Vacío --</option>
              <option value="electro">Electrocución</option><option value="quemadura">Quemadura</option>
              <option value="torbellino">Torbellino</option><option value="sangrado">Sangrado</option>
            </select>
          </div>
          <div class="stats-grid">
            <div class="input-group"><label>DADO DOT</label><input type="number" id="dadoDot${id}" min="1" max="10" value="5"></div>
            <div class="input-group"><label>DADO SANGRADO</label><input type="number" id="dadoSangrado${id}" min="1" max="10" value="5"></div>
          </div>
        </div>

        <div class="effect-section">
          <div class="input-group">
            <label>Estado Inicial</label>
            <select id="efecto${id}">
              <option value="ninguno">Ninguno</option><option value="prision">Prisión</option>
              <option value="congelacion">Congelación</option><option value="lentitud">Lentitud</option>
              <option value="vulnerabilidad">Vulnerabilidad</option><option value="debilidad">Debilidad</option>
            </select>
          </div>
          <div class="input-group"><label>Dado Estado</label><input type="number" id="dadoEfecto${id}" min="1" max="10" value="5"></div>
        </div>

        <div class="active-dots-display"><strong>DoTs Sufriendo:</strong> <span id="dotsDisplay${id}">Ninguno</span></div>
        <button class="btn-hologram" type="button" onclick="abrirModalClon(${id})">👥 Desplegar Clon / Holograma</button>
      </div>
    </div>
  `;
}

// --- SISTEMAS DE CLONACIÓN Y HOLOGRAMA ---
let clonSourceId = null;
document.getElementById('close-modal-clon').addEventListener('click', () => document.getElementById('modal-clon').style.display = 'none');

function abrirModalClon(sourceId) {
  clonSourceId = sourceId;
  let modal = document.getElementById('modal-clon');
  let container = document.getElementById('clon-options');
  container.innerHTML = '';
  activeSlots.forEach(i => {
    if(i !== sourceId) {
      container.innerHTML += `
        <div class="clon-slot-box">
            <h4>Sobrescribir Slot ${i}</h4>
            <div style="display:flex; gap:10px; margin-top:10px;">
                <button style="background-color: var(--defense);" onclick="ejecutarClon(${i}, false)">🔵 Normal (x1)</button>
                <button style="background-color: var(--damage);" onclick="ejecutarClon(${i}, true)">🔴 Extremo (x2)</button>
            </div>
        </div>
      `;
    }
  });
  modal.style.display = 'flex';
}

function ejecutarClon(targetId, esExtremo) {
  guardarEstadoTurno(); // Guardar el estado actual por si se desea deshacer
  let src = clonSourceId;
  
  let baseName = document.getElementById(`name${src}`).value;
  // Limpiamos etiquetas previas por si clonan a un clon
  let cleanName = baseName.replace(" (Holograma)", "").replace(" (Clon Extremo)", "");
  let suffix = esExtremo ? " (Clon Extremo)" : " (Holograma)";
  document.getElementById(`name${targetId}`).value = cleanName + suffix;

  let multiplicador = esExtremo ? 2 : 1;

  // Modificamos tanto los inputs como los textos base visuales
  ['vida', 'defensa', 'fuerza', 'inteligencia', 'poder', 'velocidad'].forEach(attr => { 
      let originalVal = parseFloat(document.getElementById(`${attr}${src}`).value) || 0;
      document.getElementById(`${attr}${targetId}`).value = originalVal * multiplicador; 
  });
  
  ['vida', 'defensa', 'fuerza', 'inteligencia', 'poder', 'velocidad'].forEach(attr => { 
      let baseText = document.getElementById(`base-${attr}${src}`).textContent;
      if(baseText !== "-") {
         document.getElementById(`base-${attr}${targetId}`).textContent = parseFloat(baseText) * multiplicador;
      }
  });

  document.getElementById(`sprite${targetId}`).src = document.getElementById(`sprite${src}`).src;
  
  sincronizarVidaManual(targetId);
  actualizarObjetivosGlobales();
  
  let targetCard = document.getElementById(`char${targetId}`);
  targetCard.classList.remove('fx-hologram'); void targetCard.offsetWidth; targetCard.classList.add('fx-hologram');
  document.getElementById('modal-clon').style.display = 'none';
}

// --- RESTO DE FUNCIONES DE INTERFAZ ---
let jugadorSeleccionando = 1;
document.getElementById('close-modal').addEventListener('click', () => document.getElementById('modal-roster').style.display = 'none');
function abrirRuleta(jugadorNum) {
  jugadorSeleccionando = jugadorNum;
  const modal = document.getElementById('modal-roster');
  const grid = document.getElementById('roster-grid');
  grid.innerHTML = "";
  Object.keys(baseDatosPersonajes).forEach(nombre => {
    const card = document.createElement('div'); card.classList.add('roster-card');
    card.innerHTML = `<img src="./assets/${nombre}.png" alt="${nombre}" onerror="this.src=''; this.alt='Sin Imagen'"><h4>${nombre}</h4>`;
    card.addEventListener('click', () => { cargarPersonaje(nombre, jugadorSeleccionando); modal.style.display = 'none'; });
    grid.appendChild(card);
  });
  modal.style.display = 'flex';
}

function sincronizarVidaManual(num) {
  const baseText = document.getElementById(`base-vida${num}`).textContent;
  const base = baseText !== "-" ? parseFloat(baseText) : parseFloat(document.getElementById(`vida${num}`).value) || 10;
  const actual = parseFloat(document.getElementById(`vida${num}`).value) || 0;
  actualizarBarraVida(num, actual, base);
}

function actualizarBarraVida(num, actual, base) {
  const bar = document.getElementById(`health-bar${num}`); const txtNum = document.getElementById(`health-num${num}`); const txtBase = document.getElementById(`health-base-num${num}`); const txtStatus = document.getElementById(`health-status${num}`);
  actual = Math.max(0, Math.floor(actual)); base = Math.max(1, Math.floor(base));
  if (txtNum) txtNum.textContent = actual; if (txtBase) txtBase.textContent = base;
  const pct = Math.min(100, Math.max(0, (actual / base) * 100));
  if (bar) bar.style.width = `${pct}%`;
  if (bar && txtStatus) {
    bar.classList.remove('fill-healthy', 'fill-warning', 'fill-danger');
    if (pct > 50) { bar.classList.add('fill-healthy'); txtStatus.textContent = "ÓPTIMO"; txtStatus.style.color = "var(--speed)"; } 
    else if (pct > 20) { bar.classList.add('fill-warning'); txtStatus.textContent = "ALERTA"; txtStatus.style.color = "var(--status)"; } 
    else { bar.classList.add('fill-danger'); txtStatus.textContent = "CRÍTICO"; txtStatus.style.color = "var(--damage)"; }
  }
}

function cargarPersonaje(nombreLlave, num) {
  if (!nombreLlave || !baseDatosPersonajes[nombreLlave]) return;
  const card = document.getElementById(`char${num}`);
  card.classList.add('hatch-closing'); 
  setTimeout(() => {
    const stats = baseDatosPersonajes[nombreLlave];
    document.getElementById(`base-vida${num}`).textContent = stats.vida; document.getElementById(`base-defensa${num}`).textContent = stats.defensa;
    document.getElementById(`base-fuerza${num}`).textContent = stats.fuerza; document.getElementById(`base-inteligencia${num}`).textContent = stats.inteligencia;
    document.getElementById(`base-poder${num}`).textContent = stats.poder; document.getElementById(`base-velocidad${num}`).textContent = stats.velocidad;
    document.getElementById(`name${num}`).value = nombreLlave;
    ['vida', 'defensa', 'fuerza', 'inteligencia', 'poder', 'velocidad'].forEach(s => document.getElementById(`${s}${num}`).value = stats[s]);
    document.getElementById(`sprite${num}`).src = `./assets/${nombreLlave}.png`;
    actualizarBarraVida(num, stats.vida, stats.vida);
    actualizarObjetivosGlobales();
    card.classList.remove('hatch-closing'); card.classList.add('hatch-opening'); 
    setTimeout(() => card.classList.remove('hatch-opening'), 400);
  }, 500); 
}

function mostrarDanioFlotante(idTarget, cantidad, esCritico = false, esDot = false) {
  const container = document.getElementById(`img-container${idTarget}`);
  if (!container || cantidad <= 0) return;
  const floatEl = document.createElement('div'); floatEl.classList.add('floating-damage');
  if (esCritico) floatEl.classList.add('floating-critical'); if (esDot) floatEl.classList.add('floating-dot');
  floatEl.textContent = `-${cantidad}`;
  const randomX = Math.floor(Math.random() * 50) - 25; const randomY = Math.floor(Math.random() * 30) - 15;
  floatEl.style.left = `calc(50% + ${randomX}px)`; floatEl.style.top = `calc(50% + ${randomY}px)`;
  container.appendChild(floatEl);
  if (!esDot) { const sprite = document.getElementById(`sprite${idTarget}`); if (sprite) { sprite.classList.remove('sprite-flash'); void sprite.offsetWidth; sprite.classList.add('sprite-flash'); } }
  setTimeout(() => floatEl.remove(), 1200);
}

function ejecutarFeedbackVisual(idTarget, accionEjecutada, sufrioDano, esGolpeFuerte) {
  const card = document.getElementById(`char${idTarget}`); const inputVida = document.getElementById(`vida${idTarget}`);
  if(!card) return;
  card.classList.remove('fx-lunge', 'fx-shake', 'fx-shake-heavy', 'fx-magic', 'fx-block', 'fx-dodge');
  void card.offsetWidth; 
  if (sufrioDano) {
    if (esGolpeFuerte) card.classList.add('fx-shake-heavy'); else card.classList.add('fx-shake');
    if (inputVida) { inputVida.classList.add('input-flash-damage'); setTimeout(() => inputVida.classList.remove('input-flash-damage'), 600); }
    return;
  }
  if (["fuerza", "disparo", "disparo_infundido"].includes(accionEjecutada)) card.classList.add('fx-lunge');
  else if (["poder", "canalizacion", "infusion"].includes(accionEjecutada)) card.classList.add('fx-magic');
  else if (["defensa", "defensa_imbuida"].includes(accionEjecutada)) card.classList.add('fx-block');
  else if (accionEjecutada === "velocidad") card.classList.add('fx-dodge');
}

// --- OBTENER DATOS DEL COMBATIENTE ---
function obtenerDatosPersonaje(num) {
  const baseDefText = document.getElementById(`base-defensa${num}`).textContent;
  const baseVidText = document.getElementById(`base-vida${num}`).textContent;
  let options = document.getElementById(`dotsActivos${num}`).options;
  let dots = [];
  for (let i = 0; i < options.length; i++) { if (options[i].selected && options[i].value !== 'vacio') dots.push(options[i].value); }
  
  return {
    id: num, nombre: document.getElementById(`name${num}`).value,
    vidaBase: baseVidText !== "-" ? parseFloat(baseVidText) : parseFloat(document.getElementById(`vida${num}`).value) || 10,
    hpVirtual: parseFloat(document.getElementById(`vida${num}`).value) || 0, 
    defensaBase: baseDefText !== "-" ? parseFloat(baseDefText) : parseFloat(document.getElementById(`defensa${num}`).value) || 0,
    fuerza: parseFloat(document.getElementById(`fuerza${num}`).value) || 0, inteligencia: parseFloat(document.getElementById(`inteligencia${num}`).value) || 0,
    poder: parseFloat(document.getElementById(`poder${num}`).value) || 0, velocidad: parseFloat(document.getElementById(`velocidad${num}`).value) || 0,
    accion: document.getElementById(`accion${num}`).value,
    dado: parseInt(document.getElementById(`dado${num}`).value) || 1,
    target: parseInt(document.getElementById(`target${num}`).value),
    isDirect: document.getElementById(`directo${num}`).checked, 
    isZone: document.getElementById(`zona${num}`).checked,       
    isWeakness: document.getElementById(`debilidad${num}`).checked, 
    efecto: document.getElementById(`efecto${num}`).value,
    dadoEfecto: parseInt(document.getElementById(`dadoEfecto${num}`).value) || 1,
    nuevosDotsGenerados: dots, dadoDot: parseInt(document.getElementById(`dadoDot${num}`).value) || 1, dadoSangrado: parseInt(document.getElementById(`dadoSangrado${num}`).value) || 1,
    mensajes: [], danioRecibidoFrame: 0 
  };
}

// --- MATEMÁTICAS NÚCLEO ---
function calcularVulnerabilidad(dado) {
  if (dado === 1) return 0; if (dado >= 2 && dado <= 3) return 0.05;
  if (dado >= 4 && dado <= 5) return 0.1; if (dado >= 6 && dado <= 7) return 0.15;
  if (dado >= 8 && dado <= 9) return 0.2; return 0.25;
}

function aplicarEstadosPrevios(p) {
  if (p.efecto === "congelacion") { p.defensaBase = Math.floor(p.defensaBase * 0.9); p.mensajes.push("❄️ Congelación: Defensa -10%."); }
  if (p.efecto === "lentitud") {
    let pen = p.dadoEfecto === 10 ? 0.3 : (p.dadoEfecto >= 8 ? 0.2 : (p.dadoEfecto >= 6 ? 0.1 : 0));
    if (pen > 0) { p.velocidad = Math.floor(p.velocidad * (1 - pen)); p.mensajes.push(`⏳ Lentitud: Vel -${pen*100}%.`); }
  }
}

function calcularAccion(p) {
  let stat = 0, formula = "";
  switch (p.accion) {
    case "defensa": stat = p.defensaBase; formula = "Defensa Pura"; break;
    case "fuerza": stat = p.fuerza; formula = "Fuerza Pura"; break;
    case "poder": stat = p.poder; formula = "Poder Puro"; break;
    case "velocidad": stat = p.velocidad; formula = "Velocidad Pura"; break;
    case "canalizacion": stat = (p.fuerza + p.poder) / 2; formula = "(F+P)/2"; break;
    case "infusion": stat = (p.fuerza + p.poder) / 2; formula = "(F+P)/2"; break;
    case "disparo": stat = (p.fuerza + p.velocidad) / 2; formula = "(F+V)/2"; break;
    case "disparo_infundido": stat = (p.fuerza + p.velocidad + p.poder) / 3; formula = "(F+V+P)/3"; break;
    case "defensa_imbuida": stat = (p.defensaBase + p.poder) / 2.5; formula = "(D+P)/2.5"; break;
  }
  
  stat = Math.floor(stat);
  let idx = (p.dado <= 1)?0:(p.dado <= 3)?1:(p.dado <= 5)?2:(p.dado <= 7)?3:(p.dado <= 9)?4:5;
  let mult = multiplicadores[p.accion][idx];
  let total = Math.floor(stat * mult);

  const ataquesPoder = ["poder", "canalizacion", "infusion", "disparo_infundido", "defensa_imbuida"];
  if (ataquesPoder.includes(p.accion) && p.inteligencia < 20) {
    let pen = (20 - p.inteligencia) * 0.05; if (pen > 1) pen = 1; 
    total = Math.floor(total * (1 - pen));
    p.mensajes.push(`🧠 Inteligencia Baja: Penalty ${Math.round(pen * 100)}% a Poder.`);
  }

  p.res = { base: stat, mult: mult, total: total, formula: formula };
}

function aplicarEstadosPostCalculo(p) {
  if (p.efecto === "prision" && p.dadoEfecto >= 8) { p.res.total = 0; p.mensajes.push("🛑 Prisión: Turno anulado."); }
  if (p.efecto === "debilidad") {
    let pen = p.dadoEfecto === 10 ? 0.5 : (p.dadoEfecto >= 7 ? 0.3 : (p.dadoEfecto >= 4 ? 0.2 : 0.1));
    if (pen > 0 && p.res.total > 0) { p.res.total = Math.floor(p.res.total * (1 - pen)); p.mensajes.push(`⬇️ Debilidad: Daño -${pen*100}%.`); }
  }
}

function registrarDanio(target, diff, attacker) {
  if (target.efecto === "vulnerabilidad") {
    let v = calcularVulnerabilidad(target.dadoEfecto);
    diff = Math.floor(diff * (1 + v));
    target.mensajes.push(`💥 Vulnerabilidad: Recibe +${v*100}%.`);
  }
  
  if (attacker.isWeakness && diff > 0) {
    let bonus = Math.floor(diff * 0.5);
    diff += bonus;
    attacker.mensajes.push(`🎯 Explotar Debilidad: +${bonus} daño extra.`);
  }

  target.hpVirtual -= diff; target.danioRecibidoFrame += diff;
  let esFuerte = diff >= 5;
  
  attacker.mensajes.push(`<span class="combat-clash-msg">⚔️ Impactó a ${target.nombre} (-${diff})</span>`);
  target.mensajes.push(`<span style="color: var(--damage);">Recibió ${diff} de ${attacker.nombre}</span>`);
  mostrarDanioFlotante(target.id, diff, esFuerte);
}

// --- DoTs ---
function inyectarDoTs_Multi(A, T) {
  if (A.dado !== 10 || A.nuevosDotsGenerados.length === 0) return;
  A.nuevosDotsGenerados.forEach(tipo => {
    let dmgBase = Math.floor((A.dadoDot + (A.poder * 0.5) + (T.vidaBase * 0.1)) / 3);
    let dotEx = gameState.dots[T.id]?.find(d => d.tipo === tipo);
    if (tipo === 'sangrado') {
      let fzPdMax = Math.max(A.poder, A.fuerza); let mG = 0.4, gTxt = "G1";
      if (A.dadoSangrado >= 4 && A.dadoSangrado <= 6) { mG = 0.6; gTxt = "G2"; }
      else if (A.dadoSangrado >= 7 && A.dadoSangrado <= 9) { mG = 0.8; gTxt = "G3"; }
      else if (A.dadoSangrado === 10) { mG = 1.2; gTxt = "G4"; }
      dmgBase = Math.floor((A.dadoDot + (fzPdMax * 0.5) + (T.vidaBase * 0.2) + mG) / 3);
      if(dmgBase < 1) dmgBase = 1;
      if (!gameState.dots[T.id]) gameState.dots[T.id] = [];
      gameState.dots[T.id].push({ tipo: 'sangrado', dmg: dmgBase, turnos: 3, grado: gTxt }); A.mensajes.push(`🩸 Sangrado a ${T.nombre}.`); return; 
    }
    if(dmgBase < 1) dmgBase = 1; 
    if (dotEx) {
      if (tipo === 'electro') { dotEx.turnos *= 2; A.mensajes.push(`⚡ Electro a ${T.nombre} renovada.`); } 
      else if (tipo === 'quemadura') { dotEx.dmg = Math.floor(dotEx.dmg * 2); dotEx.turnos = 3; A.mensajes.push(`🔥 Quemadura escaló.`); }
      else if (tipo === 'torbellino') {
        dotEx.dmg = Math.floor(dotEx.dmg * 2);
        if (gameState.dots[T.id].length > 1) {
          let detDmg = 0; gameState.dots[T.id].forEach(d => { if(d.tipo !== 'torbellino') detDmg += (d.dmg * d.turnos); });
          T.hpVirtual -= detDmg; T.danioRecibidoFrame += detDmg;
          A.mensajes.push(`🌪️ DETONACIÓN en ${T.nombre} (-${detDmg}).`); gameState.dots[T.id] = []; 
        } else A.mensajes.push(`🌪️ Torbellino escaló.`);
      }
    } else { 
      if (!gameState.dots[T.id]) gameState.dots[T.id] = [];
      gameState.dots[T.id].push({ tipo: tipo, dmg: dmgBase, turnos: 3 }); A.mensajes.push(`🎯 Aplica ${tipo.toUpperCase()} a ${T.nombre}.`); 
    }
  });
}

function procesarDanoDoT_Multi(p) {
  let dmgTotalDot = 0;
  if (!gameState.dots[p.id]) gameState.dots[p.id] = [];
  gameState.dots[p.id] = gameState.dots[p.id].filter((dot, idx) => {
    dmgTotalDot += dot.dmg; dot.turnos -= 1;
    p.mensajes.push(`<span class="dot-msg">DoT ${dot.tipo}: -${dot.dmg} HP (Restan ${dot.turnos}t)</span>`);
    setTimeout(() => mostrarDanioFlotante(p.id, dot.dmg, false, true), idx * 250);
    return dot.turnos > 0;
  });
  document.getElementById(`dotsDisplay${p.id}`).textContent = gameState.dots[p.id].map(d => `${d.tipo} [${d.turnos}t]`).join(', ') || "Ninguno";
  return dmgTotalDot;
}

// --- DESHACER (GUARDADO Y RESTAURACIÓN CORREGIDOS) ---
function guardarEstadoTurno() {
  const estado = { 
    turno: gameState.turno, 
    dots: JSON.parse(JSON.stringify(gameState.dots)), 
    activeSlots: [...activeSlots],
    htmlBattlefield: document.getElementById('battlefield').innerHTML,
    htmlResultados: document.getElementById('resultados').innerHTML,
    inputs: {} 
  };
  
  // AQUÍ ESTABA EL ERROR: Solo guardaba "vida". Ahora guarda todas las stats.
  activeSlots.forEach(i => {
    estado.inputs[i] = {
      vida: document.getElementById(`vida${i}`).value,
      defensa: document.getElementById(`defensa${i}`).value,
      fuerza: document.getElementById(`fuerza${i}`).value,
      inteligencia: document.getElementById(`inteligencia${i}`).value,
      poder: document.getElementById(`poder${i}`).value,
      velocidad: document.getElementById(`velocidad${i}`).value,
      name: document.getElementById(`name${i}`).value,
      team: document.getElementById(`team${i}`).value,
      target: document.getElementById(`target${i}`) ? document.getElementById(`target${i}`).value : null,
      directo: document.getElementById(`directo${i}`).checked,
      zona: document.getElementById(`zona${i}`).checked,
      weak: document.getElementById(`debilidad${i}`).checked,
      dotsDisp: document.getElementById(`dotsDisplay${i}`).textContent
    };
  });
  historialTurnos.push(estado);
}

document.getElementById('btnDeshacer').addEventListener('click', () => {
  if (historialTurnos.length === 0) { alert("No hay turnos anteriores para deshacer."); return; }
  const est = historialTurnos.pop();
  
  gameState.turno = est.turno; 
  gameState.dots = JSON.parse(JSON.stringify(est.dots));
  activeSlots = [...est.activeSlots];
  slotCounter = Math.max(...activeSlots, 0); // Ajustar el autoincrementador

  document.getElementById('turnoDisplay').textContent = gameState.turno; 
  document.getElementById('battlefield').innerHTML = est.htmlBattlefield;
  document.getElementById('resultados').innerHTML = est.htmlResultados;
  
  // AHORA SÍ RESTAURA TODAS LAS STATS
  activeSlots.forEach(i => {
    vincularEventosCombatiente(i);
    let inp = est.inputs[i];
    document.getElementById(`vida${i}`).value = inp.vida;
    document.getElementById(`defensa${i}`).value = inp.defensa;
    document.getElementById(`fuerza${i}`).value = inp.fuerza;
    document.getElementById(`inteligencia${i}`).value = inp.inteligencia;
    document.getElementById(`poder${i}`).value = inp.poder;
    document.getElementById(`velocidad${i}`).value = inp.velocidad;
    document.getElementById(`name${i}`).value = inp.name;
    document.getElementById(`team${i}`).value = inp.team;
    if(inp.target && document.getElementById(`target${i}`)) document.getElementById(`target${i}`).value = inp.target;
    document.getElementById(`directo${i}`).checked = inp.directo;
    document.getElementById(`zona${i}`).checked = inp.zona;
    document.getElementById(`debilidad${i}`).checked = inp.weak;
    document.getElementById(`dotsDisplay${i}`).textContent = inp.dotsDisp;
    sincronizarVidaManual(i);
  });
});

// --- MOTOR DE CHOQUES MULTI-TARGET ---
document.getElementById('btnCalcular').addEventListener('click', () => {
  guardarEstadoTurno(); 
  
  let pList = [];
  activeSlots.forEach(i => pList.push(obtenerDatosPersonaje(i)));

  pList.forEach(p => aplicarEstadosPrevios(p));
  pList.forEach(p => calcularAccion(p));
  pList.forEach(p => aplicarEstadosPostCalculo(p));

  const defActions = ["velocidad", "defensa", "defensa_imbuida"];
  let defenseMap = {}; 
  let zoneProtector = {}; 

  pList.forEach(p => {
    if (defActions.includes(p.accion)) {
       defenseMap[p.id] = Math.max(defenseMap[p.id] || 0, p.res.total);
       
       if (p.isZone && p.accion !== "velocidad" && p.target !== p.id) {
         defenseMap[p.target] = Math.max(defenseMap[p.target] || 0, p.res.total);
         zoneProtector[p.target] = p.nombre;
         p.mensajes.push(`🛡️ Despliega Defensa en Zona sobre ${pList.find(x => x.id === p.target)?.nombre || 'su Aliado'}.`);
       }
    }
  });

  let resolvedClashes = new Set();

  pList.forEach(A => {
    if (defActions.includes(A.accion) || A.res.total <= 0) return; 
    let T = pList.find(p => p.id === A.target);
    if (!T) return; 

    let mutualClash = (!defActions.includes(T.accion) && T.target === A.id);

    if (mutualClash && (A.isDirect || T.isDirect)) {
      mutualClash = false;
      A.mensajes.push(`💥 Ataque Directo. Ignorando choque.`);
    }

    if (mutualClash) {
      let key = A.id < T.id ? `${A.id}-${T.id}` : `${T.id}-${A.id}`;
      if (!resolvedClashes.has(key)) {
        resolvedClashes.add(key);
        if (A.res.total > T.res.total) registrarDanio(T, A.res.total - T.res.total, A);
        else if (T.res.total > A.res.total) registrarDanio(A, T.res.total - A.res.total, T);
        else { A.mensajes.push("⚖️ Empate (Armas Chocan)"); T.mensajes.push("⚖️ Empate (Armas Chocan)"); }
      }
    } else {
      let resistance = defenseMap[T.id] || 0; 

      if (A.res.total > resistance) {
        let netDmg = A.res.total - resistance;
        registrarDanio(T, netDmg, A);
        if (resistance > 0) T.mensajes.push(`🛡️ Escudo fracturado por ${A.nombre}.`);
        else if (!defActions.includes(T.accion)) T.mensajes.push(`⚠️ Impacto Directo / Flanqueado. Sin escudo.`);
      } else {
         let defName = zoneProtector[T.id] ? `Zona de ${zoneProtector[T.id]}` : T.nombre;
         T.mensajes.push(`🛡️ Resistió ataque de ${A.nombre}.`);
         A.mensajes.push(`❌ Impacto repelido por ${defName}.`);
      }
    }
  });

  pList.forEach(A => { let T = pList.find(p => p.id === A.target); if(T) inyectarDoTs_Multi(A, T); });
  pList.forEach(p => {
    let dotDmg = procesarDanoDoT_Multi(p);
    p.hpVirtual -= dotDmg; p.danioRecibidoFrame += dotDmg;
    let dmgAgo = (gameState.turno >= 10) ? 2 : (gameState.turno >= 5 ? 1 : 0);
    if (dmgAgo > 0) { p.hpVirtual -= dmgAgo; p.danioRecibidoFrame += dmgAgo; p.mensajes.push(`💦 Agotamiento: -${dmgAgo}`); }
  });

  document.getElementById('resultados').innerHTML = '';
  pList.forEach(p => {
    ejecutarFeedbackVisual(p.id, p.accion, p.danioRecibidoFrame > 0, p.danioRecibidoFrame >= 5);
    document.getElementById(`vida${p.id}`).value = Math.max(0, p.hpVirtual);
    actualizarBarraVida(p.id, p.hpVirtual, p.vidaBase);

    const fLogs = (logs) => logs.map(l => `<div class="status-msg">${l}</div>`).join('');
    document.getElementById('resultados').innerHTML += `
      <div class="result-box slide-up">
        <h3 style="color: var(--primary);">Slot ${p.id} - ${p.nombre}</h3>
        <p class="stat-calc">Cálculo: ${p.res.base} <span>[${p.res.formula}]</span></p>
        <p class="stat-pts">Puntos Alcanzados: <span class="highlight">${p.res.total}</span></p>
        <div class="battle-logs">${fLogs(p.mensajes)}</div>
      </div>
    `;
  });

  gameState.turno++; 
  document.getElementById('turnoDisplay').textContent = gameState.turno;
});
