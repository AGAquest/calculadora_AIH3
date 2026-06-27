// --- BASE DE DATOS Y CONSTANTES ---
const baseDatosPersonajes = {
  "Yuki Lowes": { vida: 10, defensa: 5, fuerza: 5, inteligencia: 20, poder: 15, velocidad: 5 },
  "Koichi Mikazuki": { vida: 20, defensa: 1, fuerza: 4, inteligencia: 20, poder: 10, velocidad: 5 },
  "Aeris Luneveil": { vida: 10, defensa: 12, fuerza: 8, inteligencia: 12, poder: 9, velocidad: 9 },
  "Gabriel Heart Ligth": { vida: 10, defensa: 5, fuerza: 5, inteligencia: 15, poder: 15, velocidad: 10 },
  "Arageul Arashikota": { vida: 5, defensa: 5, fuerza: 5, inteligencia: 20, poder: 20, velocidad: 5 },
  "Namui": { vida: 15, defensa: 2, fuerza: 10, inteligencia: 20, poder: 3, velocidad: 10 },
  "Elizabeth": { vida: 15, defensa: 5, fuerza: 10, inteligencia: 5, poder: 15, velocidad: 10 },
  "Adrian Gallar": { vida: 10, defensa: 5, fuerza: 5, inteligencia: 10, poder: 15, velocidad: 15 },
  "Nyx Benevendo": { vida: 10, defensa: 5, fuerza: 3, inteligencia: 20, poder: 15, velocidad: 7 },
  "Kurobane Rei": { vida: 10, defensa: 5, fuerza: 5, inteligencia: 20, poder: 10, velocidad: 10 },
  "Ryo Kamigawa": { vida: 10, defensa: 5, fuerza: 5, inteligencia: 15, poder: 20, velocidad: 5 },
  "Zyra": { vida: 15, defensa: 9, fuerza: 15, inteligencia: 10, poder: 9, velocidad: 2 }
};

const multiplicadores = {
  defensa: [0.2, 0.4, 0.5, 0.6, 0.7, 0.8], fuerza: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6],
  poder: [0.0, 0.1, 0.2, 0.3, 0.4, 0.5], velocidad: [0.1, 0.3, 0.5, 0.6, 0.8, 1.0],
  canalizacion: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6], infusion: [0.2, 0.3, 0.4, 0.5, 0.6, 0.7],
  disparo: [0.2, 0.3, 0.4, 0.5, 0.6, 0.7], disparo_infundido: [0.3, 0.4, 0.5, 0.6, 0.7, 0.8],
  defensa_imbuida: [0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
};

// --- GESTOR DE ESTADO GLOBAL Y SISTEMA DE DESHACER ---
let gameState = { turno: 1, p1: { dotsSufriendo: [] }, p2: { dotsSufriendo: [] } };
let historialTurnos = [];

// --- CONTROLADOR DE LA RULETA DE PERSONAJES (MODAL ESTILO FIGHTING GAME) ---
let jugadorSeleccionando = 1;

document.getElementById('btn-select1').addEventListener('click', () => abrirRuleta(1));
document.getElementById('btn-select2').addEventListener('click', () => abrirRuleta(2));
document.getElementById('close-modal').addEventListener('click', cerrarRuleta);

function abrirRuleta(jugadorNum) {
  jugadorSeleccionando = jugadorNum;
  const modal = document.getElementById('modal-roster');
  const grid = document.getElementById('roster-grid');
  grid.innerHTML = "";
  
  Object.keys(baseDatosPersonajes).forEach(nombre => {
    const card = document.createElement('div');
    card.classList.add('roster-card');
    card.innerHTML = `
      <img src="./assets/${nombre}.png" alt="${nombre}" onerror="this.src=''; this.alt='Sin Imagen'">
      <h4>${nombre}</h4>
    `;
    card.addEventListener('click', () => {
      cargarPersonaje(nombre, jugadorSeleccionando);
      cerrarRuleta();
    });
    grid.appendChild(card);
  });
  
  modal.style.display = 'flex';
}

function cerrarRuleta() { document.getElementById('modal-roster').style.display = 'none'; }

// --- LISTENERS UI ---
function revisarAparicionDoT(num) {
  const dadoAccion = parseInt(document.getElementById(`dado${num}`).value);
  document.getElementById(`dotPanel${num}`).style.display = (dadoAccion === 10) ? "block" : "none";
}
document.getElementById('dado1').addEventListener('input', () => revisarAparicionDoT(1));
document.getElementById('dado2').addEventListener('input', () => revisarAparicionDoT(2));

document.getElementById('vida1').addEventListener('input', () => sincronizarVidaManual(1));
document.getElementById('vida2').addEventListener('input', () => sincronizarVidaManual(2));

function sincronizarVidaManual(num) {
  const baseText = document.getElementById(`base-vida${num}`).textContent;
  const base = baseText !== "-" ? parseFloat(baseText) : parseFloat(document.getElementById(`vida${num}`).value) || 10;
  const actual = parseFloat(document.getElementById(`vida${num}`).value) || 0;
  actualizarBarraVida(num, actual, base);
}

// --- ACTUALIZADOR MODULAR DE SALUD ---
function actualizarBarraVida(num, actual, base) {
  const bar = document.getElementById(`health-bar${num}`);
  const txtNum = document.getElementById(`health-num${num}`);
  const txtBase = document.getElementById(`health-base-num${num}`);
  const txtStatus = document.getElementById(`health-status${num}`);
  actual = Math.max(0, Math.floor(actual)); base = Math.max(1, Math.floor(base));
  
  if (txtNum) txtNum.textContent = actual; 
  if (txtBase) txtBase.textContent = base;
  
  const pct = Math.min(100, Math.max(0, (actual / base) * 100));
  if (bar) bar.style.width = `${pct}%`;

  if (bar && txtStatus) {
    bar.classList.remove('fill-healthy', 'fill-warning', 'fill-danger');
    if (pct > 50) { bar.classList.add('fill-healthy'); txtStatus.textContent = "ÓPTIMO"; txtStatus.style.color = "var(--speed)"; } 
    else if (pct > 20) { bar.classList.add('fill-warning'); txtStatus.textContent = "ALERTA"; txtStatus.style.color = "var(--status)"; } 
    else { bar.classList.add('fill-danger'); txtStatus.textContent = "CRÍTICO"; txtStatus.style.color = "var(--damage)"; }
  }
}

// --- SISTEMA DE NÚMEROS FLOTANTES ---
function mostrarDanioFlotante(idTarget, cantidad, esCritico = false, esDot = false) {
  const container = document.getElementById(`img-container${idTarget}`);
  if (!container || cantidad <= 0) return;
  
  const floatEl = document.createElement('div');
  floatEl.classList.add('floating-damage');
  if (esCritico) floatEl.classList.add('floating-critical');
  if (esDot) floatEl.classList.add('floating-dot');
  
  floatEl.textContent = `-${cantidad}`;
  
  const randomX = Math.floor(Math.random() * 50) - 25; 
  const randomY = Math.floor(Math.random() * 30) - 15;
  floatEl.style.left = `calc(50% + ${randomX}px)`; 
  floatEl.style.top = `calc(50% + ${randomY}px)`;
  
  container.appendChild(floatEl);

  if (!esDot) {
    const sprite = document.getElementById(`sprite${idTarget}`);
    if (sprite) { sprite.classList.remove('sprite-flash'); void sprite.offsetWidth; sprite.classList.add('sprite-flash'); }
  }
  
  setTimeout(() => floatEl.remove(), 1200);
}

// --- SISTEMA CINEMÁTICO DE ANIMACIÓN ---
function ejecutarFeedbackVisual(idTarget, accionEjecutada, sufrioDano, esGolpeFuerte) {
  const card = document.getElementById(`char${idTarget}`);
  const inputVida = document.getElementById(`vida${idTarget}`);
  
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

// --- FUNCIONES DE UTILIDAD Y COMPUERTA ---
function cargarPersonaje(nombreLlave, num) {
  if (!nombreLlave || !baseDatosPersonajes[nombreLlave]) return;
  const card = document.getElementById(`char${num}`);
  
  // Cierre de compuerta con impacto
  card.classList.add('hatch-closing');
  
  // Esperar a que termine la vibración del impacto (500ms)
  setTimeout(() => {
    const stats = baseDatosPersonajes[nombreLlave];
    
    document.getElementById(`base-vida${num}`).textContent = stats.vida;
    document.getElementById(`base-defensa${num}`).textContent = stats.defensa;
    document.getElementById(`base-fuerza${num}`).textContent = stats.fuerza;
    document.getElementById(`base-inteligencia${num}`).textContent = stats.inteligencia;
    document.getElementById(`base-poder${num}`).textContent = stats.poder;
    document.getElementById(`base-velocidad${num}`).textContent = stats.velocidad;

    document.getElementById(`name${num}`).value = nombreLlave;
    ['vida', 'defensa', 'fuerza', 'inteligencia', 'poder', 'velocidad'].forEach(s => document.getElementById(`${s}${num}`).value = stats[s]);
    
    document.getElementById(`sprite${num}`).src = `./assets/${nombreLlave}.png`;
    actualizarBarraVida(num, stats.vida, stats.vida);
    
    // Apertura de compuerta
    card.classList.remove('hatch-closing');
    card.classList.add('hatch-opening');
    
    setTimeout(() => card.classList.remove('hatch-opening'), 400);
  }, 500); 
}

function obtenerIndiceDado(dado) {
  if (dado <= 1) return 0; if (dado <= 3) return 1; if (dado <= 5) return 2;
  if (dado <= 7) return 3; if (dado <= 9) return 4; return 5;
}

function obtenerDoTsSeleccionados(num) {
  let options = document.getElementById(`dotsActivos${num}`).options;
  let selected = [];
  for (let i = 0; i < options.length; i++) { if (options[i].selected && options[i].value !== 'vacio') selected.push(options[i].value); }
  return selected;
}

function obtenerDatosPersonaje(num) {
  const baseDefText = document.getElementById(`base-defensa${num}`).textContent;
  const baseVidText = document.getElementById(`base-vida${num}`).textContent;
  return {
    id: num, 
    nombre: document.getElementById(`name${num}`).value,
    vidaBase: baseVidText !== "-" ? parseFloat(baseVidText) : parseFloat(document.getElementById(`vida${num}`).value) || 10,
    vidaActual: parseFloat(document.getElementById(`vida${num}`).value) || 0,
    defensaBase: baseDefText !== "-" ? parseFloat(baseDefText) : parseFloat(document.getElementById(`defensa${num}`).value) || 0,
    fuerza: parseFloat(document.getElementById(`fuerza${num}`).value) || 0,
    inteligencia: parseFloat(document.getElementById(`inteligencia${num}`).value) || 0,
    poder: parseFloat(document.getElementById(`poder${num}`).value) || 0,
    velocidad: parseFloat(document.getElementById(`velocidad${num}`).value) || 0,
    accion: document.getElementById(`accion${num}`).value,
    dado: parseInt(document.getElementById(`dado${num}`).value) || 1,
    efecto: document.getElementById(`efecto${num}`).value,
    dadoEfecto: parseInt(document.getElementById(`dadoEfecto${num}`).value) || 1,
    nuevosDotsGenerados: obtenerDoTsSeleccionados(num),
    dadoDot: parseInt(document.getElementById(`dadoDot${num}`).value) || 1,
    dadoSangrado: parseInt(document.getElementById(`dadoSangrado${num}`).value) || 1,
    mensajes: []
  };
}

// --- MATEMÁTICA DE ESTADOS Y ACCIONES ---
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
  let mult = multiplicadores[p.accion][obtenerIndiceDado(p.dado)];
  let total = Math.floor(stat * mult);

  // Penalización por Inteligencia EXCLUSIVA para Magia
  const ataquesMagicos = ["poder", "canalizacion", "infusion", "disparo_infundido", "defensa_imbuida"];
  
  if (ataquesMagicos.includes(p.accion) && p.inteligencia < 20) {
    let puntosFaltantes = 20 - p.inteligencia;
    let penalizacion = puntosFaltantes * 0.05; 
    if (penalizacion > 1) penalizacion = 1; 
    
    total = Math.floor(total * (1 - penalizacion));
    p.mensajes.push(`🧠 Inteligencia Baja (${p.inteligencia}/20): Penalización del ${Math.round(penalizacion * 100)}% al ataque mágico.`);
  }

  return { base: stat, mult: mult, total: total, formula: formula };
}

function aplicarEstadosPostCalculo(p, res) {
  if (p.efecto === "prision" && p.dadoEfecto >= 8) { res.total = 0; p.mensajes.push("🛑 Prisión: Turno anulado."); }
  if (p.efecto === "debilidad") {
    let pen = p.dadoEfecto === 10 ? 0.5 : (p.dadoEfecto >= 7 ? 0.3 : (p.dadoEfecto >= 4 ? 0.2 : 0.1));
    if (pen > 0 && res.total > 0) { res.total = Math.floor(res.total * (1 - pen)); p.mensajes.push(`⬇️ Debilidad: Daño -${pen*100}%.`); }
  }
}

// --- LÓGICA DE DoTs ---
function inyectarDoTs(at, def) {
  if (at.dado !== 10 || at.nuevosDotsGenerados.length === 0) return;
  let pDefSt = (def.id === 1) ? gameState.p1 : gameState.p2;
  
  at.nuevosDotsGenerados.forEach(tipo => {
    let dmgBase = Math.floor((at.dadoDot + (at.poder * 0.5) + (def.vidaBase * 0.1)) / 3);
    let dotEx = pDefSt.dotsSufriendo.find(d => d.tipo === tipo);
    
    if (tipo === 'sangrado') {
      let fzPdMax = Math.max(at.poder, at.fuerza);
      let mG = 0.4, gTxt = "G1";
      if (at.dadoSangrado >= 4 && at.dadoSangrado <= 6) { mG = 0.6; gTxt = "G2"; }
      else if (at.dadoSangrado >= 7 && at.dadoSangrado <= 9) { mG = 0.8; gTxt = "G3"; }
      else if (at.dadoSangrado === 10) { mG = 1.2; gTxt = "G4"; }
      
      dmgBase = Math.floor((at.dadoDot + (fzPdMax * 0.5) + (def.vidaBase * 0.2) + mG) / 3);
      if(dmgBase < 1) dmgBase = 1;
      pDefSt.dotsSufriendo.push({ tipo: 'sangrado', dmg: dmgBase, turnos: 3, grado: gTxt });
      at.mensajes.push(`🩸 Aplica Sangrado ${gTxt} (${dmgBase} dmg/t).`); 
      return; 
    }
    
    if(dmgBase < 1) dmgBase = 1; 
    
    if (dotEx) {
      if (tipo === 'electro') { dotEx.turnos *= 2; at.mensajes.push(`⚡ Electrocución renovada.`); } 
      else if (tipo === 'quemadura') { dotEx.dmg = Math.floor(dotEx.dmg * 2); dotEx.turnos = 3; at.mensajes.push(`🔥 Quemadura escaló (${dotEx.dmg} dmg/t).`); }
      else if (tipo === 'torbellino') {
        dotEx.dmg = Math.floor(dotEx.dmg * 2);
        if (pDefSt.dotsSufriendo.length > 1) {
          let detDmg = 0; 
          pDefSt.dotsSufriendo.forEach(d => { if(d.tipo !== 'torbellino') detDmg += (d.dmg * d.turnos); });
          def.hpVirtual = (def.hpVirtual || def.vidaActual) - detDmg;
          at.mensajes.push(`🌪️ DETONACIÓN: -${detDmg} de daño masivo.`); 
          pDefSt.dotsSufriendo = []; 
        } else {
          at.mensajes.push(`🌪️ Torbellino escaló.`);
        }
      }
    } else { 
      pDefSt.dotsSufriendo.push({ tipo: tipo, dmg: dmgBase, turnos: 3 }); 
      at.mensajes.push(`🎯 Aplica ${tipo.toUpperCase()} (${dmgBase} dmg/t).`); 
    }
  });
}

function procesarDanoDoT(personaje, id) {
  let state = (id === 1) ? gameState.p1 : gameState.p2; 
  let dmgTotalDot = 0;
  
  state.dotsSufriendo = state.dotsSufriendo.filter((dot, idx) => {
    dmgTotalDot += dot.dmg; 
    dot.turnos -= 1;
    personaje.mensajes.push(`<span class="dot-msg">Daño por ${dot.tipo}: -${dot.dmg} HP (Quedan ${dot.turnos}t)</span>`);
    
    setTimeout(() => mostrarDanioFlotante(id, dot.dmg, false, true), idx * 250);
    return dot.turnos > 0;
  });
  
  document.getElementById(`dotsDisplay${id}`).textContent = state.dotsSufriendo.map(d => `${d.tipo} [${d.turnos}t]`).join(', ') || "Ninguno";
  return dmgTotalDot;
}

// --- FUNCIÓN DE GUARDADO PARA DESHACER ---
function guardarEstadoTurno() {
  const estado = {
    turno: gameState.turno,
    p1Dots: JSON.stringify(gameState.p1.dotsSufriendo),
    p2Dots: JSON.stringify(gameState.p2.dotsSufriendo),
    p1VidaVal: document.getElementById('vida1').value,
    p2VidaVal: document.getElementById('vida2').value,
    htmlResultados: document.getElementById('resultados').innerHTML,
    dotsDisp1: document.getElementById('dotsDisplay1').textContent,
    dotsDisp2: document.getElementById('dotsDisplay2').textContent
  };
  historialTurnos.push(estado);
}

document.getElementById('btnDeshacer').addEventListener('click', () => {
  if (historialTurnos.length === 0) { alert("No hay turnos anteriores para deshacer."); return; }
  
  const estadoAnterior = historialTurnos.pop();
  
  gameState.turno = estadoAnterior.turno;
  gameState.p1.dotsSufriendo = JSON.parse(estadoAnterior.p1Dots);
  gameState.p2.dotsSufriendo = JSON.parse(estadoAnterior.p2Dots);
  
  document.getElementById('turnoDisplay').textContent = gameState.turno;
  document.getElementById('vida1').value = estadoAnterior.p1VidaVal;
  document.getElementById('vida2').value = estadoAnterior.p2VidaVal;
  document.getElementById('resultados').innerHTML = estadoAnterior.htmlResultados;
  document.getElementById('dotsDisplay1').textContent = estadoAnterior.dotsDisp1;
  document.getElementById('dotsDisplay2').textContent = estadoAnterior.dotsDisp2;
  
  sincronizarVidaManual(1); 
  sincronizarVidaManual(2);
});

// --- BUCLE PRINCIPAL DE COMBATE ---
function calcularCombate() {
  guardarEstadoTurno(); 

  const p1 = obtenerDatosPersonaje(1); 
  const p2 = obtenerDatosPersonaje(2);
  p1.hpVirtual = p1.vidaActual; 
  p2.hpVirtual = p2.vidaActual;

  aplicarEstadosPrevios(p1); 
  aplicarEstadosPrevios(p2);
  
  const res1 = calcularAccion(p1); 
  const res2 = calcularAccion(p2);
  
  aplicarEstadosPostCalculo(p1, res1); 
  aplicarEstadosPostCalculo(p2, res2);

  let msg1 = "", msg2 = ""; 
  let dmgP1Recibido = 0, dmgP2Recibido = 0;
  const def = ["velocidad", "defensa", "defensa_imbuida"];

  // Choque de acciones
  if (res1.total > res2.total) {
    let diff = res1.total - res2.total;
    if (!def.includes(p1.accion)) {
      if (p2.efecto === "vulnerabilidad") { 
        let v = calcularVulnerabilidad(p2.dadoEfecto); 
        diff = Math.floor(diff * (1 + v)); 
        p2.mensajes.push(`💥 Vulnerabilidad: Daño +${v*100}%.`); 
      }
      p2.hpVirtual -= diff; 
      dmgP2Recibido = diff;
      
      let esFuerte = diff >= 5; 
      mostrarDanioFlotante(2, diff, esFuerte);
      
      msg1 = `<span class="${esFuerte ? 'txt-critical-pulsing' : ''}" style="color: var(--speed);">${esFuerte ? '¡💥 IMPACTO CRÍTICO!' : '¡Ataque Exitoso!'}</span>`;
      msg2 = `<span class="${esFuerte ? 'txt-damage-heavy' : ''}" style="color: var(--damage); font-weight: bold;">- ${diff} Daño Base</span>`;
    } else { msg1 = `<span style="color: var(--defense);">¡Bloqueo Perfecto!</span>`; msg2 = `Anulado`; }
  } else if (res2.total > res1.total) {
    let diff = res2.total - res1.total;
    if (!def.includes(p2.accion)) {
      if (p1.efecto === "vulnerabilidad") { 
        let v = calcularVulnerabilidad(p1.dadoEfecto); 
        diff = Math.floor(diff * (1 + v)); 
        p1.mensajes.push(`💥 Vulnerabilidad: Daño +${v*100}%.`); 
      }
      p1.hpVirtual -= diff; 
      dmgP1Recibido = diff;
      
      let esFuerte = diff >= 5; 
      mostrarDanioFlotante(1, diff, esFuerte);
      
      msg2 = `<span class="${esFuerte ? 'txt-critical-pulsing' : ''}" style="color: var(--speed);">${esFuerte ? '¡💥 IMPACTO CRÍTICO!' : '¡Ataque Exitoso!'}</span>`;
      msg1 = `<span class="${esFuerte ? 'txt-damage-heavy' : ''}" style="color: var(--damage); font-weight: bold;">- ${diff} Daño Base</span>`;
    } else { msg2 = `<span style="color: var(--defense);">¡Bloqueo Perfecto!</span>`; msg1 = `Anulado`; }
  } else { msg1 = msg2 = `Empate`; }

  inyectarDoTs(p1, p2); 
  inyectarDoTs(p2, p1);

  let dotDmgP1 = procesarDanoDoT(p1, 1); 
  let dotDmgP2 = procesarDanoDoT(p2, 2);
  p1.hpVirtual -= dotDmgP1; 
  p2.hpVirtual -= dotDmgP2;
  dmgP1Recibido += dotDmgP1; 
  dmgP2Recibido += dotDmgP2;

  let dmgAgo = (gameState.turno >= 10) ? 2 : (gameState.turno >= 5 ? 1 : 0);
  if (dmgAgo > 0) { 
    p1.hpVirtual -= dmgAgo; 
    p2.hpVirtual -= dmgAgo; 
    dmgP1Recibido += dmgAgo; 
    dmgP2Recibido += dmgAgo; 
    p1.mensajes.push(`💦 Agotamiento: -${dmgAgo} HP`); 
    p2.mensajes.push(`💦 Agotamiento: -${dmgAgo} HP`); 
  }

  ejecutarFeedbackVisual(1, p1.accion, dmgP1Recibido > 0, dmgP1Recibido >= 5);
  ejecutarFeedbackVisual(2, p2.accion, dmgP2Recibido > 0, dmgP2Recibido >= 5);

  document.getElementById('vida1').value = Math.max(0, p1.hpVirtual);
  document.getElementById('vida2').value = Math.max(0, p2.hpVirtual);
  actualizarBarraVida(1, p1.hpVirtual, p1.vidaBase); 
  actualizarBarraVida(2, p2.hpVirtual, p2.vidaBase);

  const fLogs = (logs) => logs.map(l => `<div class="status-msg">${l}</div>`).join('');
  document.getElementById('resultados').innerHTML = `
    <div class="result-box slide-up">
      <h3 style="color: var(--primary);">${p1.nombre}</h3>
      <p class="stat-calc">Cálculo: ${res1.base} <span>[${res1.formula}]</span></p>
      <p class="stat-pts">Puntos: <span class="highlight">${res1.total}</span></p>
      <p class="battle-verdict"><strong>${msg1}</strong></p>
      <div class="battle-logs">${fLogs(p1.mensajes)}</div>
    </div>
    <div class="result-box slide-up">
      <h3 style="color: var(--primary);">${p2.nombre}</h3>
      <p class="stat-calc">Cálculo: ${res2.base} <span>[${res2.formula}]</span></p>
      <p class="stat-pts">Puntos: <span class="highlight">${res2.total}</span></p>
      <p class="battle-verdict"><strong>${msg2}</strong></p>
      <div class="battle-logs">${fLogs(p2.mensajes)}</div>
    </div>
  `;
  
  gameState.turno++; 
  document.getElementById('turnoDisplay').textContent = gameState.turno;
}

document.getElementById('btnCalcular').addEventListener('click', calcularCombate);
