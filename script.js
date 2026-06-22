// --- BASE DE DATOS Y CONSTANTES ---
const baseDatosPersonajes = {
  "Yuki Lowes": { vida: 10, defensa: 5, fuerza: 5, inteligencia: 20, poder: 15, velocidad: 5 },
  "Koichi Mikazuki": { vida: 20, defensa: 1, fuerza: 4, inteligencia: 20, poder: 10, velocidad: 5 },
  "Gabriel Heart Ligth": { vida: 10, defensa: 5, fuerza: 5, inteligencia: 15, poder: 15, velocidad: 10 },
  "Arageul Arashikota": { vida: 5, defensa: 5, fuerza: 5, inteligencia: 20, poder: 20, velocidad: 5 },
  "Namui": { vida: 15, defensa: 2, fuerza: 10, inteligencia: 20, poder: 3, velocidad: 10 },
  "Elizabeth": { vida: 15, defensa: 5, fuerza: 10, inteligencia: 5, poder: 15, velocidad: 10 },
  "Adrian Gallar": { vida: 10, defensa: 5, fuerza: 5, inteligencia: 10, poder: 15, velocidad: 15 },
  "Nyx Benevendo": { vida: 10, defensa: 5, fuerza: 5, inteligencia: 15, poder: 15, velocidad: 10 }
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

// --- GESTOR DE ESTADO GLOBAL ---
const gameState = {
  turno: 1,
  p1: { dotsSufriendo: [] },
  p2: { dotsSufriendo: [] }
};

// --- LISTENERS UI ---
document.getElementById('selector1').addEventListener('change', (e) => cargarPersonaje(e.target.value, 1));
document.getElementById('selector2').addEventListener('change', (e) => cargarPersonaje(e.target.value, 2));

function revisarAparicionDoT(num) {
  const dadoAccion = parseInt(document.getElementById(`dado${num}`).value);
  document.getElementById(`dotPanel${num}`).style.display = (dadoAccion === 10) ? "block" : "none";
}
document.getElementById('dado1').addEventListener('input', () => revisarAparicionDoT(1));
document.getElementById('dado2').addEventListener('input', () => revisarAparicionDoT(2));

// --- FUNCIONES DE UTILIDAD ---
function cargarPersonaje(nombreLlave, num) {
  if (!nombreLlave || !baseDatosPersonajes[nombreLlave]) return;
  const stats = baseDatosPersonajes[nombreLlave];
  
  document.getElementById(`base-vida${num}`).textContent = stats.vida;
  document.getElementById(`base-defensa${num}`).textContent = stats.defensa;
  document.getElementById(`base-fuerza${num}`).textContent = stats.fuerza;
  document.getElementById(`base-inteligencia${num}`).textContent = stats.inteligencia;
  document.getElementById(`base-poder${num}`).textContent = stats.poder;
  document.getElementById(`base-velocidad${num}`).textContent = stats.velocidad;

  document.getElementById(`name${num}`).value = nombreLlave;
  document.getElementById(`vida${num}`).value = stats.vida;
  document.getElementById(`defensa${num}`).value = stats.defensa;
  document.getElementById(`fuerza${num}`).value = stats.fuerza;
  document.getElementById(`inteligencia${num}`).value = stats.inteligencia;
  document.getElementById(`poder${num}`).value = stats.poder;
  document.getElementById(`velocidad${num}`).value = stats.velocidad;
  
  // Asignar el sprite dinámicamente usando la carpeta local
  document.getElementById(`sprite${num}`).src = `./assets/${nombreLlave}.png`;
}

function obtenerIndiceDado(dado) {
  if (dado <= 1) return 0; if (dado <= 3) return 1; if (dado <= 5) return 2;
  if (dado <= 7) return 3; if (dado <= 9) return 4; return 5;
}

function obtenerDoTsSeleccionados(num) {
  let options = document.getElementById(`dotsActivos${num}`).options;
  let selected = [];
  for (let i = 0; i < options.length; i++) {
    if (options[i].selected && options[i].value !== 'vacio') selected.push(options[i].value);
  }
  return selected;
}

function obtenerDatosPersonaje(num) {
  const baseDefensaText = document.getElementById(`base-defensa${num}`).textContent;
  const defensaBase = baseDefensaText !== "-" ? parseFloat(baseDefensaText) : parseFloat(document.getElementById(`defensa${num}`).value);
  const baseVidaText = document.getElementById(`base-vida${num}`).textContent;
  const vidaBase = baseVidaText !== "-" ? parseFloat(baseVidaText) : parseFloat(document.getElementById(`vida${num}`).value);

  return {
    id: num,
    nombre: document.getElementById(`name${num}`).value,
    vidaBase: vidaBase || 0,
    vidaActual: parseFloat(document.getElementById(`vida${num}`).value) || 0,
    defensaBase: defensaBase || 0,
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
  if (dado === 1) return 0;
  if (dado >= 2 && dado <= 3) return 0.05;
  if (dado >= 4 && dado <= 5) return 0.1;
  if (dado >= 6 && dado <= 7) return 0.15;
  if (dado >= 8 && dado <= 9) return 0.2;
  if (dado === 10) return 0.25;
  return 0;
}

function aplicarEstadosPrevios(p) {
  if (p.efecto === "congelacion") {
    p.defensaBase *= 0.9;
    p.mensajes.push("❄️ Congelación: Defensa reducida un 10%.");
  }
  if (p.efecto === "lentitud") {
    let penalty = 0;
    if (p.dadoEfecto >= 6 && p.dadoEfecto <= 7) penalty = 0.1;
    else if (p.dadoEfecto >= 8 && p.dadoEfecto <= 9) penalty = 0.2;
    else if (p.dadoEfecto === 10) penalty = 0.3;
    if (penalty > 0) { p.velocidad *= (1 - penalty); p.mensajes.push(`⏳ Lentitud: Vel -${penalty*100}%.`); }
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
  let mult = multiplicadores[p.accion][obtenerIndiceDado(p.dado)];
  return { base: stat, mult: mult, total: stat * mult, formula: formula };
}

function aplicarEstadosPostCalculo(p, res) {
  if (p.efecto === "prision" && p.dadoEfecto >= 8) {
    res.total = 0; p.mensajes.push("🛑 Prisión: Turno anulado.");
  }
  if (p.efecto === "debilidad") {
    let pen = 0;
    if (p.dadoEfecto >= 1 && p.dadoEfecto <= 3) pen = 0.1;
    else if (p.dadoEfecto >= 4 && p.dadoEfecto <= 6) pen = 0.2;
    else if (p.dadoEfecto >= 7 && p.dadoEfecto <= 9) pen = 0.3;
    else if (p.dadoEfecto === 10) pen = 0.5;
    if (pen > 0 && res.total > 0) { res.total *= (1 - pen); p.mensajes.push(`⬇️ Debilidad: Daño -${pen*100}%.`); }
  }
}

// --- LÓGICA DE DOTS PERSISTENTES ---
function inyectarDoTs(atacante, defensor) {
  if (atacante.dado !== 10 || atacante.nuevosDotsGenerados.length === 0) return;
  
  let pDefensorState = (defensor.id === 1) ? gameState.p1 : gameState.p2;

  atacante.nuevosDotsGenerados.forEach(tipo => {
    let dmgBase = (atacante.dadoDot + (atacante.poder * 0.5) + (defensor.vidaBase * 0.1)) / 3;
    let dotExistente = pDefensorState.dotsSufriendo.find(d => d.tipo === tipo);

    if (tipo === 'sangrado') {
      let fzPdMax = Math.max(atacante.poder, atacante.fuerza);
      let multGrado = 0.4, gradoTxt = "G1";
      if (atacante.dadoSangrado >= 4 && atacante.dadoSangrado <= 6) { multGrado = 0.6; gradoTxt = "G2"; }
      else if (atacante.dadoSangrado >= 7 && atacante.dadoSangrado <= 9) { multGrado = 0.8; gradoTxt = "G3"; }
      else if (atacante.dadoSangrado === 10) { multGrado = 1.2; gradoTxt = "G4"; }
      
      dmgBase = (atacante.dadoDot + (fzPdMax * 0.5) + (defensor.vidaBase * 0.2) + multGrado) / 3;
      pDefensorState.dotsSufriendo.push({ tipo: 'sangrado', dmg: dmgBase, turnos: 3, grado: gradoTxt });
      atacante.mensajes.push(`🩸 Aplica Sangrado ${gradoTxt} (${dmgBase.toFixed(1)} dmg/t).`);
      return; 
    }

    if (dotExistente) {
      if (tipo === 'electro') {
        dotExistente.turnos *= 2;
        atacante.mensajes.push(`⚡ Electrocución renovada: Duración x2 (Quedan ${dotExistente.turnos} t).`);
      } 
      else if (tipo === 'quemadura') {
        dotExistente.dmg *= 2;
        dotExistente.turnos = 3; 
        atacante.mensajes.push(`🔥 Quemadura escaló: Daño x2 (${dotExistente.dmg.toFixed(1)} dmg/t).`);
      }
      else if (tipo === 'torbellino') {
        dotExistente.dmg *= 2;
        if (pDefensorState.dotsSufriendo.length > 1) {
          let detonacionDmg = 0;
          pDefensorState.dotsSufriendo.forEach(d => { if(d.tipo !== 'torbellino') detonacionDmg += (d.dmg * d.turnos); });
          defensor.hpVirtual = (defensor.hpVirtual || defensor.vidaActual) - detonacionDmg;
          atacante.mensajes.push(`🌪️ ¡DETONACIÓN DEL TORBELLINO! Todos los DoTs explotan haciendo -${detonacionDmg.toFixed(1)} de daño masivo.`);
          pDefensorState.dotsSufriendo = []; 
        } else {
          atacante.mensajes.push(`🌪️ Torbellino escaló: Daño x2 (${dotExistente.dmg.toFixed(1)} dmg/t).`);
        }
      }
    } else {
      pDefensorState.dotsSufriendo.push({ tipo: tipo, dmg: dmgBase, turnos: 3 });
      atacante.mensajes.push(`🎯 Aplica ${tipo.toUpperCase()} (${dmgBase.toFixed(1)} dmg/t por 3 turnos).`);
    }
  });
}

function procesarDanoDoT(personaje, id) {
  let state = (id === 1) ? gameState.p1 : gameState.p2;
  let dmgTotalDot = 0;
  
  state.dotsSufriendo = state.dotsSufriendo.filter(dot => {
    dmgTotalDot += dot.dmg;
    dot.turnos -= 1;
    personaje.mensajes.push(`<span class="dot-msg">Daño por ${dot.tipo}: -${dot.dmg.toFixed(1)} HP (Quedan ${dot.turnos}t)</span>`);
    return dot.turnos > 0;
  });

  let uiText = state.dotsSufriendo.map(d => `${d.tipo} [${d.turnos}t]`).join(', ');
  document.getElementById(`dotsDisplay${id}`).textContent = uiText || "Ninguno";

  return dmgTotalDot;
}

// --- BUCLE PRINCIPAL DE COMBATE ---
function calcularCombate() {
  const p1 = obtenerDatosPersonaje(1);
  const p2 = obtenerDatosPersonaje(2);
  p1.hpVirtual = p1.vidaActual; p2.hpVirtual = p2.vidaActual;

  aplicarEstadosPrevios(p1); aplicarEstadosPrevios(p2);
  const res1 = calcularAccion(p1); const res2 = calcularAccion(p2);
  aplicarEstadosPostCalculo(p1, res1); aplicarEstadosPostCalculo(p2, res2);

  let msg1 = "", msg2 = "";
  const def = ["velocidad", "defensa", "defensa_imbuida"];

  // 1. Choque
  if (res1.total > res2.total) {
    let diff = res1.total - res2.total;
    if (!def.includes(p1.accion)) {
      if (p2.efecto === "vulnerabilidad") {
        let v = calcularVulnerabilidad(p2.dadoEfecto); diff *= (1 + v);
        p2.mensajes.push(`💥 Vulnerabilidad: Daño recibido +${v*100}%.`);
      }
      p2.hpVirtual -= diff;
      msg1 = `<span style="color: var(--speed);">¡Ataque Exitoso!</span>`; msg2 = `<span style="color: var(--damage);">- ${diff.toFixed(2)} Daño Base</span>`;
    } else { msg1 = `<span style="color: var(--defense);">¡Bloqueo Perfecto!</span>`; msg2 = `Anulado`; }
  } else if (res2.total > res1.total) {
    let diff = res2.total - res1.total;
    if (!def.includes(p2.accion)) {
      if (p1.efecto === "vulnerabilidad") {
        let v = calcularVulnerabilidad(p1.dadoEfecto); diff *= (1 + v);
        p1.mensajes.push(`💥 Vulnerabilidad: Daño recibido +${v*100}%.`);
      }
      p1.hpVirtual -= diff;
      msg2 = `<span style="color: var(--speed);">¡Ataque Exitoso!</span>`; msg1 = `<span style="color: var(--damage);">- ${diff.toFixed(2)} Daño Base</span>`;
    } else { msg2 = `<span style="color: var(--defense);">¡Bloqueo Perfecto!</span>`; msg1 = `Anulado`; }
  } else { msg1 = msg2 = `Empate`; }

  // 2. Inyectar Nuevos DoTs
  inyectarDoTs(p1, p2);
  inyectarDoTs(p2, p1);

  // 3. Sufrir Daño por DoTs Activos
  p1.hpVirtual -= procesarDanoDoT(p1, 1);
  p2.hpVirtual -= procesarDanoDoT(p2, 2);

  // 4. Agotamiento Global
  let dmgAgo = (gameState.turno >= 10) ? 2 : (gameState.turno >= 5 ? 1 : 0);
  if (dmgAgo > 0) {
    p1.hpVirtual -= dmgAgo; p2.hpVirtual -= dmgAgo;
    p1.mensajes.push(`💦 Agotamiento Global: -${dmgAgo} HP`);
    p2.mensajes.push(`💦 Agotamiento Global: -${dmgAgo} HP`);
  }

  // 5. Render
  document.getElementById('vida1').value = Math.max(0, Math.round(p1.hpVirtual));
  document.getElementById('vida2').value = Math.max(0, Math.round(p2.hpVirtual));

  const fLogs = (logs) => logs.map(l => `<div class="status-msg">${l}</div>`).join('');

  document.getElementById('resultados').innerHTML = `
    <div class="result-box">
      <h3 style="color: var(--primary);">${p1.nombre}</h3>
      <p>Cálculo: ${res1.base.toFixed(2)} <span style="font-size:0.8rem;">[${res1.formula}]</span></p>
      <p>Puntos: <span class="highlight">${res1.total.toFixed(2)}</span></p>
      <p><strong>${msg1}</strong></p>
      ${fLogs(p1.mensajes)}
    </div>
    <div class="result-box">
      <h3 style="color: var(--primary);">${p2.nombre}</h3>
      <p>Cálculo: ${res2.base.toFixed(2)} <span style="font-size:0.8rem;">[${res2.formula}]</span></p>
      <p>Puntos: <span class="highlight">${res2.total.toFixed(2)}</span></p>
      <p><strong>${msg2}</strong></p>
      ${fLogs(p2.mensajes)}
    </div>
  `;

  gameState.turno++;
  document.getElementById('turnoDisplay').textContent = gameState.turno;
}

document.getElementById('btnCalcular').addEventListener('click', calcularCombate);
