// Keširani DOM elementi radi veće brzine
const DOM = {
  infoModal: document.getElementById("infoModal"),
  pvCanvas: document.getElementById("pvCanvas"),
  tsCanvas: document.getElementById("tsCanvas"),
  gasFill: document.getElementById("gasFill"),
  pistonHead: document.getElementById("pistonHead"),
  reservoirBadge: document.getElementById("reservoirBadge"),
  currentProcessName: document.getElementById("currentProcessName"),
  processPhaseDesc: document.getElementById("processPhaseDesc"),
  curP: document.getElementById("curP"),
  curV: document.getElementById("curV"),
  curT: document.getElementById("curT"),
  playText: document.getElementById("playText"),
  playIcon: document.getElementById("playIcon"),
  valSpeedLabel: document.getElementById("valSpeedLabel"),
  stats: {
    T1: document.getElementById("valT1"),
    T2: document.getElementById("valT2"),
    VA: document.getElementById("valVA"),
    VB: document.getElementById("valVB"),
    Q1: document.getElementById("statQ1"),
    Q2: document.getElementById("statQ2"),
    Work: document.getElementById("statWork"),
    Eff: document.getElementById("statEff")
  }
};

const pvCtx = DOM.pvCanvas.getContext("2d");
const tsCtx = DOM.tsCanvas.getContext("2d");

const nR = 100;
const GAMMA = 1.4;
let state = { T1: 500, T2: 300, VA: 1, VB: 2.5, VC: 0, VD: 0, progress: 0, isPlaying: false };
let lastPhase = "";

function openInfoModal() {
  DOM.infoModal.classList.remove("hidden");
  DOM.infoModal.classList.add("flex");
}

function closeInfoModal() {
  DOM.infoModal.classList.add("hidden");
  DOM.infoModal.classList.remove("flex");
}

lucide.createIcons();

function updateDerivedValues() {
  state.T1 = parseFloat(document.getElementById("rangeT1").value);
  state.T2 = parseFloat(document.getElementById("rangeT2").value);
  state.VA = parseFloat(document.getElementById("rangeVA").value);
  state.VB = parseFloat(document.getElementById("rangeVB").value);
  
  state.VC = state.VB * Math.pow(state.T1 / state.T2, 1 / (GAMMA - 1));
  const ratio = state.VB / state.VA;
  state.VD = state.VC / ratio;

  const Q1 = nR * state.T1 * Math.log(ratio);
  const Q2 = nR * state.T2 * Math.log(state.VC / state.VD);
  const work = Q1 - Q2;
  const eff = 1 - state.T2 / state.T1;

  DOM.stats.T1.innerText = state.T1;
  DOM.stats.T2.innerText = state.T2;
  DOM.stats.VA.innerText = state.VA.toFixed(2);
  DOM.stats.VB.innerText = state.VB.toFixed(2);
  
  DOM.stats.Q1.innerText = Q1.toFixed(1) + " J";
  DOM.stats.Q2.innerText = Q2.toFixed(1) + " J";
  DOM.stats.Work.innerText = work.toFixed(1) + " J";
  DOM.stats.Eff.innerText = (100 * eff).toFixed(1) + "%";
}

function resizeCanvases() {
  [{ c: DOM.pvCanvas, ctx: pvCtx }, { c: DOM.tsCanvas, ctx: tsCtx }].forEach(item => {
    const rect = item.c.getBoundingClientRect();
    item.c.width = rect.width * window.devicePixelRatio;
    item.c.height = rect.height * window.devicePixelRatio;
    item.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  });
}

function getStateAtProgress(t) {
  let V, P, T, S, phaseName, phaseDesc, activeRes;
  const S_base = 100 + nR * Math.log(state.VB / state.VA);

  if (t <= .25) {
    const r = t / .25;
    V = state.VA + r * (state.VB - state.VA);
    T = state.T1;
    P = (nR * T) / V;
    S = 100 + nR * Math.log(V / state.VA);
    phaseName = "A → B: Izotermsko širenje na T₁";
    phaseDesc = "Gas prima toplotu Q₁ od grejača i širi se na konstantnoj temperaturi T₁.";
    activeRes = "heater";
  } else if (t <= .5) {
    const r = (t - .25) / .25;
    V = state.VB + r * (state.VC - state.VB);
    T = state.T1 * Math.pow(state.VB / V, GAMMA - 1);
    P = (nR * T) / V;
    S = S_base;
    phaseName = "B → C: Adijabatsko širenje";
    phaseDesc = "Cilindar je izolovan. Gas se širi bez razmene toplote, hladeći se do T₂.";
    activeRes = "insulated";
  } else if (t <= .75) {
    const r = (t - .5) / .25;
    V = state.VC + r * (state.VD - state.VC);
    T = state.T2;
    P = (nR * T) / V;
    S = S_base - nR * Math.log(state.VC / V);
    phaseName = "C → D: Izotermsko sabijanje na T₂";
    phaseDesc = "Gas se sabija uz predaju toplote Q₂ hladnjaku na temperaturi T₂.";
    activeRes = "cooler";
  } else {
    const r = (t - .75) / .25;
    V = state.VD + r * (state.VA - state.VD);
    T = state.T2 * Math.pow(state.VD / V, GAMMA - 1);
    P = (nR * T) / V;
    S = 100;
    phaseName = "D → A: Adijabatsko sabijanje";
    phaseDesc = "Cilindar je izolovan. Gas se sabija i zagreva nazad do T₁, završavajući ciklus.";
    activeRes = "insulated";
  }

  return { V, P, T, S, phaseName, phaseDesc, activeRes };
}

function drawPVDiagram(curV, curP) {
  let width = DOM.pvCanvas.clientWidth, height = DOM.pvCanvas.clientHeight;
  pvCtx.clearRect(0, 0, width, height);
  
  const margin = 45, w = width - 90, h = height - 90;
  const maxV = Math.max(4.5, 1.1 * state.VC);
  const maxP = (nR * state.T1 / .5) * 1.1;

  const mapX = (v) => margin + (v - .5) / (maxV - .5) * w;
  const mapY = (p) => height - margin - (p / maxP) * h;

  // Mreža
  pvCtx.strokeStyle = "#131c31"; pvCtx.lineWidth = 1; pvCtx.fillStyle = "#64748b"; pvCtx.font = "9px JetBrains Mono, monospace";
  for (let i = 1; i <= 4; i++) {
    const x = mapX(i);
    pvCtx.beginPath(); pvCtx.moveTo(x, margin); pvCtx.lineTo(x, height - margin); pvCtx.stroke();
    pvCtx.fillText(i.toFixed(1), x - 8, height - margin + 15);
  }

  function drawCurve(fn, vStart, vEnd, color) {
    pvCtx.beginPath(); pvCtx.strokeStyle = color; pvCtx.lineWidth = 2.5; pvCtx.shadowColor = color; pvCtx.shadowBlur = 6;
    for (let i = 0; i <= 50; i++) {
      const v = vStart + i / 50 * (vEnd - vStart);
      const T = fn(v);
      const p = (nR * T) / v;
      const x = mapX(v), y = mapY(p);
      if (i === 0) pvCtx.moveTo(x, y); else pvCtx.lineTo(x, y);
    }
    pvCtx.stroke();
    pvCtx.shadowBlur = 0;
  }

  drawCurve(() => state.T1, state.VA, state.VB, "#ff7b54");
  drawCurve(v => state.T1 * Math.pow(state.VB / v, GAMMA - 1), state.VB, state.VC, "#4cc9f0");
  drawCurve(() => state.T2, state.VC, state.VD, "#00b4d8");
  drawCurve(v => state.T2 * Math.pow(state.VD / v, GAMMA - 1), state.VD, state.VA, "#7209b7");

  // Pozicija tekuće tačke
  pvCtx.fillStyle = "#ff7b54"; pvCtx.shadowColor = "#ff7b54"; pvCtx.shadowBlur = 12;
  pvCtx.beginPath(); pvCtx.arc(mapX(curV), mapY(curP), 7, 0, 2 * Math.PI); pvCtx.fill();
  pvCtx.shadowBlur = 0;
}

function drawTSDiagram(curS, curT) {
  let width = DOM.tsCanvas.clientWidth, height = DOM.tsCanvas.clientHeight;
  tsCtx.clearRect(0, 0, width, height);
  
  const margin = 45, w = width - 90, h = height - 90;
  const S_base = 100 + nR * Math.log(state.VB / state.VA);
  const minS = 100 - .15 * (S_base - 100), maxS = S_base + .15 * (S_base - 100);
  const maxT = Math.max(900, 1.2 * state.T1);

  const mapX = (s) => margin + (s - minS) / (maxS - minS) * w;
  const mapY = (t) => height - margin - (t / maxT) * h;

  tsCtx.strokeStyle = "#131e31"; tsCtx.lineWidth = 1;
  tsCtx.beginPath(); tsCtx.moveTo(margin, margin); tsCtx.lineTo(margin, height - margin); tsCtx.lineTo(width - margin, height - margin); tsCtx.stroke();

  // Tekuća tačka
  tsCtx.fillStyle = "#4cc9f0"; tsCtx.shadowColor = "#4cc9f0"; tsCtx.shadowBlur = 12;
  tsCtx.beginPath(); tsCtx.arc(mapX(curS), mapY(curT), 7, 0, 2 * Math.PI); tsCtx.fill();
  tsCtx.shadowBlur = 0;
}

function updateVisuals(t) {
  DOM.curP.innerText = (t.P / 100).toFixed(2);
  DOM.curV.innerText = t.V.toFixed(2);
  DOM.curT.innerText = Math.round(t.T);
  DOM.currentProcessName.innerText = t.phaseName;
  DOM.processPhaseDesc.innerText = t.phaseDesc;

  const heightPercent = 15 + (t.V - .5) / 3.5 * 53;
  DOM.gasFill.style.height = heightPercent + "%";
  DOM.pistonHead.style.bottom = heightPercent + "%";

  const tempRatio = (t.T - state.T2) / (state.T1 - state.T2 || 1);
  if (t.activeRes === "heater") {
    DOM.gasFill.style.backgroundColor = `rgba(255, 123, 84, ${.2 + .2 * tempRatio})`;
    DOM.reservoirBadge.className = "absolute top-3 left-3 px-3 py-1 bg-orange-500/15 border border-orange-500/40 text-orange-400 rounded-lg text-[11px] mono-font flex items-center gap-2 shadow-md z-20";
    DOM.reservoirBadge.innerHTML = `<i data-lucide="flame" class="w-4 h-4"></i><span>Grejač aktivan ($T_1 = ${state.T1}$ K)</span>`;
  } else if (t.activeRes === "cooler") {
    DOM.gasFill.style.backgroundColor = "rgba(0, 180, 216, 0.25)";
    DOM.reservoirBadge.className = "absolute top-3 left-3 px-3 py-1 bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 rounded-lg text-[11px] mono-font flex items-center gap-2 shadow-md z-20";
    DOM.reservoirBadge.innerHTML = `<i data-lucide="snowflake" class="w-4 h-4"></i><span>Hladnjak aktivan ($T_2 = ${state.T2}$ K)</span>`;
  } else {
    DOM.gasFill.style.backgroundColor = "rgba(114, 9, 183, 0.25)";
    DOM.reservoirBadge.className = "absolute top-3 left-3 px-3 py-1 bg-purple-500/15 border border-purple-500/40 text-purple-400 rounded-lg text-[11px] mono-font flex items-center gap-2 shadow-md z-20";
    DOM.reservoirBadge.innerHTML = '<i data-lucide="shield" class="w-4 h-4"></i><span>Toplotna izolacija (Adijabata)</span>';
  }

  lucide.createIcons();
  
  // Renderuj KaTeX samo ako se promenila faza da se ne opterećuje procesor
  if (lastPhase !== t.phaseName && typeof renderMathInElement === "function") {
    lastPhase = t.phaseName;
    renderMathInElement(DOM.reservoirBadge, { delimiters: [{ left: "$$", right: "$$", display: true }, { left: "$", right: "$", display: false }] });
  }
}

function render() {
  updateDerivedValues();
  const current = getStateAtProgress(state.progress);
  drawPVDiagram(current.V, current.P);
  drawTSDiagram(current.S, current.T);
  updateVisuals(current);
}

window.addEventListener("resize", resizeCanvases);
resizeCanvases();

let lastTime = performance.now();
function animateLoop(time) {
  if (state.isPlaying) {
    const delta = (time - lastTime) / 1000;
    const speed = parseFloat(document.getElementById("rangeSpeed").value);
    state.progress += delta * speed / 8;
    if (state.progress > 1) state.progress = 0;
  }
  lastTime = time;
  render();
  requestAnimationFrame(animateLoop);
}

function togglePlay() {
  state.isPlaying = !state.isPlaying;
  DOM.playText.innerText = state.isPlaying ? "Pauziraj" : "Pokreni Ciklus";
  DOM.playIcon.setAttribute("data-lucide", state.isPlaying ? "pause" : "play");
  lucide.createIcons();
}

function resetSimulation() {
  state.isPlaying = false;
  state.progress = 0;
  DOM.playText.innerText = "Pokreni Ciklus";
  DOM.playIcon.setAttribute("data-lucide", "play");
  lucide.createIcons();
  render();
}

function stepSimulation() {
  state.isPlaying = false;
  DOM.playText.innerText = "Pokreni Ciklus";
  DOM.playIcon.setAttribute("data-lucide", "play");
  lucide.createIcons();
  state.progress += .05;
  if (state.progress > 1) state.progress = 0;
  render();
}

["rangeT1", "rangeT2", "rangeVA", "rangeVB", "rangeSpeed"].forEach(id => {
  document.getElementById(id).addEventListener("input", (e) => {
    if (id === "rangeSpeed") {
      DOM.valSpeedLabel.innerText = e.target.value + "x";
    }
    render();
  });
});

render();
requestAnimationFrame(animateLoop);