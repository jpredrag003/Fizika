function openInfoModal() {
  document.getElementById("infoModal").classList.remove("hidden");
  document.getElementById("infoModal").classList.add("flex");
}

function closeInfoModal() {
  document.getElementById("infoModal").classList.add("hidden");
  document.getElementById("infoModal").classList.remove("flex");
}

lucide.createIcons();

const nR = 100;
let state = { T1: 500, T2: 300, VA: 1, VB: 2.5, VC: 0, VD: 0, progress: 0, isPlaying: false };

function updateDerivedValues() {
  state.T1 = parseFloat(document.getElementById("rangeT1").value);
  state.T2 = parseFloat(document.getElementById("rangeT2").value);
  state.VA = parseFloat(document.getElementById("rangeVA").value);
  state.VB = parseFloat(document.getElementById("rangeVB").value);
  state.VC = state.VB * Math.pow(state.T1 / state.T2, 1 / (1.4 - 1));
  var t = state.VB / state.VA;
  state.VD = state.VC / t;
  let e = nR * state.T1 * Math.log(state.VB / state.VA),
      a = e - nR * state.T2 * Math.log(state.VC / state.VD),
      s = nR * state.T2 * Math.log(state.VC / state.VD);
  t = 1 - state.T2 / state.T1;
  document.getElementById("valT1").innerText = state.T1;
  document.getElementById("valT2").innerText = state.T2;
  document.getElementById("valVA").innerText = state.VA.toFixed(2);
  document.getElementById("valVB").innerText = state.VB.toFixed(2);
  document.getElementById("statQ1").innerText = e.toFixed(1) + " J";
  document.getElementById("statQ2").innerText = s.toFixed(1) + " J";
  document.getElementById("statWork").innerText = a.toFixed(1) + " J";
  document.getElementById("statEff").innerText = (100 * t).toFixed(1) + "%";
}

const pvCanvas = document.getElementById("pvCanvas"),
      pvCtx = pvCanvas.getContext("2d"),
      tsCanvas = document.getElementById("tsCanvas"),
      tsCtx = tsCanvas.getContext("2d");

function resizeCanvases() {
  [{ c: pvCanvas, ctx: pvCtx }, { c: tsCanvas, ctx: tsCtx }].forEach(t => {
    var e = t.c.getBoundingClientRect();
    t.c.width = e.width * window.devicePixelRatio;
    t.c.height = e.height * window.devicePixelRatio;
    t.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  });
}

function getStateAtProgress(t) {
  let e, a, s, n, o, l, i;
  var r, d, x = 100 + nR * Math.log(state.VB / state.VA);
  return i = t <= .25 ? (r = t / .25, e = state.VA + r * (state.VB - state.VA), s = state.T1, a = nR * s / e, n = 100 + nR * Math.log(e / state.VA), o = "A → B: Izotermsko širenje na T₁", l = "Gas prima toplotu Q₁ od grejača i širi se na konstantnoj temperaturi T₁.", "heater") : t <= .5 ? (d = (t - .25) / .25, e = state.VB + d * (state.VC - state.VB), s = state.T1 * Math.pow(state.VB / e, 1.4 - 1), a = nR * s / e, n = x, o = "B → C: Adijabatsko širenje", l = "Cilindar je izolovan. Gas se širi bez razmene toplote, hladeći se do T₂.", "insulated") : t <= .75 ? (d = (t - .5) / .25, e = state.VC + d * (state.VD - state.VC), s = state.T2, a = nR * s / e, n = x - nR * Math.log(state.VC / e), o = "C → D: Izotermsko sabijanje na T₂", l = "Gas se sabija uz predaju toplote Q₂ hladnjaku na temperaturi T₂.", "cooler") : (t = (t - .75) / .25, e = state.VD + t * (state.VA - state.VD), s = state.T2 * Math.pow(state.VD / e, 1.4 - 1), a = nR * s / e, n = 100, o = "D → A: Adijabatsko sabijanje", l = "Cilindar je izolovan. Gas se sabija i zagreva nazad do T₁, završavajući ciklus.", "insulated"), { V: e, P: a, T: s, S: n, phaseName: o, phaseDesc: l, activeRes: i };
}

function drawPVDiagram(t, e) {
  let a = pvCanvas.clientWidth, s = pvCanvas.clientHeight;
  pvCtx.clearRect(0, 0, a, s);
  const n = 45, o = a - 90, l = s - 90, i = Math.max(4.5, 1.1 * state.VC), r = nR * state.T1 / .5 * 1.1;
  function d(t) { return n + (t - .5) / (i - .5) * o; }
  function x(t) { return s - n - t / r * l; }
  pvCtx.strokeStyle = "#131c31"; pvCtx.lineWidth = 1; pvCtx.fillStyle = "#64748b"; pvCtx.font = "9px JetBrains Mono, monospace";
  for (let t = 1; t <= 4; t += 1) { var c = d(t); pvCtx.beginPath(); pvCtx.moveTo(c, n); pvCtx.lineTo(c, s - n); pvCtx.stroke(); pvCtx.fillText(t.toFixed(1), c - 8, s - n + 15); }
  for (let t = 1e3; t <= r; t += 2e3) { var C = x(t); pvCtx.beginPath(); pvCtx.moveTo(n, C); pvCtx.lineTo(a - n, C); pvCtx.stroke(); pvCtx.fillText(Math.round(t / 100), 15, C + 3); }
  function p(e, a, s, t) {
    pvCtx.beginPath(); pvCtx.strokeStyle = t; pvCtx.lineWidth = 2.5; pvCtx.shadowColor = t; pvCtx.shadowBlur = 6;
    for (let t = 0; t <= 50; t++) { var n = a + t / 50 * (s - a), o = e(n), o = nR * o / n, n = d(n), o = x(o); 0 === t ? pvCtx.moveTo(n, o) : pvCtx.lineTo(n, o); }
    pvCtx.stroke(); pvCtx.shadowBlur = 0;
  }
  pvCtx.beginPath(); pvCtx.moveTo(n, n); pvCtx.lineTo(n, s - n); pvCtx.lineTo(a - n, s - n); pvCtx.stroke();
  pvCtx.fillText("V [L]", a - n - 25, s - n + 25);
  pvCtx.save(); pvCtx.translate(15, 80); pvCtx.rotate(-Math.PI / 2); pvCtx.fillText("p [bar]", 0, 0); pvCtx.restore();
  p(() => state.T1, state.VA, state.VB, "#ff7b54");
  p(t => state.T1 * Math.pow(state.VB / t, 1.4 - 1), state.VB, state.VC, "#4cc9f0");
  p(() => state.T2, state.VC, state.VD, "#00b4d8");
  p(t => state.T2 * Math.pow(state.VD / t, 1.4 - 1), state.VD, state.VA, "#7209b7");
  pvCtx.fillStyle = "rgba(76, 201, 240, 0.08)"; pvCtx.beginPath();
  let v = true;
  for (let t = 0; t <= 1; t += .005) { var m = getStateAtProgress(t), u = d(m.V), m = x(m.P); v ? (pvCtx.moveTo(u, m), v = false) : pvCtx.lineTo(u, m); }
  pvCtx.closePath(); pvCtx.fill();
  let g = [{ name: "A", v: state.VA, t: state.T1 }, { name: "B", v: state.VB, t: state.T1 }, { name: "C", v: state.VC, t: state.T2 }, { name: "D", v: state.VD, t: state.T2 }];
  g.forEach(t => { var e = nR * t.t / t.v, a = d(t.v), e = x(e); pvCtx.fillStyle = "#ffffff"; pvCtx.beginPath(); pvCtx.arc(a, e, 4, 0, 2 * Math.PI); pvCtx.fill(); pvCtx.fillText(t.name, a + 6, e - 4); });
  t = d(t); e = x(e); pvCtx.fillStyle = "#ff7b54"; pvCtx.shadowColor = "#ff7b54"; pvCtx.shadowBlur = 12; pvCtx.beginPath(); pvCtx.arc(t, e, 7, 0, 2 * Math.PI); pvCtx.fill(); pvCtx.shadowBlur = 0;
}

function drawTSDiagram(t, e) {
  let a = tsCanvas.clientWidth, s = tsCanvas.clientHeight;
  tsCtx.clearRect(0, 0, a, s);
  const n = a - 90, o = s - 90;
  var l = 100 + nR * Math.log(state.VB / state.VA);
  let i = 100 - .15 * (l - 100), r = l + .15 * (l - 100), d = Math.max(900, 1.2 * state.T1);
  function x(t) { return 45 + (t - i) / (r - i) * n; }
  function c(t) { return s - 45 - t / d * o; }
  tsCtx.strokeStyle = "#131e31"; tsCtx.lineWidth = 1; tsCtx.fillStyle = "#64748b"; tsCtx.font = "9px JetBrains Mono, monospace";
  tsCtx.beginPath(); tsCtx.moveTo(45, 45); tsCtx.lineTo(45, s - 45); tsCtx.lineTo(a - 45, s - 45); tsCtx.stroke();
  tsCtx.fillText("S [J/K]", a - 45 - 35, s - 45 + 25);
  tsCtx.save(); tsCtx.translate(15, 80); tsCtx.rotate(-Math.PI / 2); tsCtx.fillText("T [K]", 0, 0); tsCtx.restore();
  var C = l, p = l, v = state.T1, m = state.T1, u = state.T2, l = state.T2;
  tsCtx.lineWidth = 2.5; tsCtx.shadowColor = "#00b4d8"; tsCtx.shadowBlur = 6;
  tsCtx.strokeStyle = "#ff7b54"; tsCtx.beginPath(); tsCtx.moveTo(x(100), c(v)); tsCtx.lineTo(x(C), c(m)); tsCtx.stroke();
  tsCtx.strokeStyle = "#4cc9f0"; tsCtx.beginPath(); tsCtx.moveTo(x(C), c(m)); tsCtx.lineTo(x(p), c(u)); tsCtx.stroke();
  tsCtx.strokeStyle = "#00b4d8"; tsCtx.beginPath(); tsCtx.moveTo(x(p), c(u)); tsCtx.lineTo(x(100), c(l)); tsCtx.stroke();
  tsCtx.strokeStyle = "#7209b7"; tsCtx.beginPath(); tsCtx.moveTo(x(100), c(l)); tsCtx.lineTo(x(100), c(v)); tsCtx.stroke();
  tsCtx.shadowBlur = 0; tsCtx.fillStyle = "rgba(255, 123, 84, 0.08)"; tsCtx.beginPath();
  tsCtx.moveTo(x(100), c(v)); tsCtx.lineTo(x(C), c(m)); tsCtx.lineTo(x(p), c(u)); tsCtx.lineTo(x(100), c(l)); tsCtx.closePath(); tsCtx.fill();
  let g = [{ name: "A", s: 100, t: v }, { name: "B", s: C, t: m }, { name: "C", s: p, t: u }, { name: "D", s: 100, t: l }];
  g.forEach(t => { var e = x(t.s), a = c(t.t); tsCtx.fillStyle = "#ffffff"; tsCtx.beginPath(); tsCtx.arc(e, a, 4, 0, 2 * Math.PI); tsCtx.fill(); tsCtx.fillText(t.name, e + 6, a - 4); });
  t = x(t); e = c(e); tsCtx.fillStyle = "#4cc9f0"; tsCtx.shadowColor = "#4cc9f0"; tsCtx.shadowBlur = 12; tsCtx.beginPath(); tsCtx.arc(t, e, 7, 0, 2 * Math.PI); tsCtx.fill(); tsCtx.shadowBlur = 0;
}

function updateVisuals(t) {
  document.getElementById("curP").innerText = (t.P / 100).toFixed(2);
  document.getElementById("curV").innerText = t.V.toFixed(2);
  document.getElementById("curT").innerText = Math.round(t.T);
  document.getElementById("currentProcessName").innerText = t.phaseName;
  document.getElementById("processPhaseDesc").innerText = t.phaseDesc;
  var e = 15 + (t.V - .5) / 3.5 * 53;
  const a = document.getElementById("gasFill");
  a.style.height = e + "%";
  document.getElementById("pistonHead").style.bottom = e + "%";
  e = (t.T - state.T2) / (state.T1 - state.T2 || 1);
  "heater" === t.activeRes ? a.style.backgroundColor = `rgba(255, 123, 84, ${.2 + .2 * e})` : "cooler" === t.activeRes ? a.style.backgroundColor = "rgba(0, 180, 216, 0.25)" : a.style.backgroundColor = "rgba(114, 9, 183, 0.25)";
  const s = document.getElementById("reservoirBadge");
  "heater" === t.activeRes ? (s.className = "absolute top-3 left-3 px-3 py-1 bg-orange-500/15 border border-orange-500/40 text-orange-400 rounded-lg text-[11px] mono-font flex items-center gap-2 shadow-md z-20", s.innerHTML = `<i data-lucide="flame" class="w-4 h-4"></i><span>Grejač aktivan ($T_1 = ${state.T1}$ K)</span>`) : "cooler" === t.activeRes ? (s.className = "absolute top-3 left-3 px-3 py-1 bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 rounded-lg text-[11px] mono-font flex items-center gap-2 shadow-md z-20", s.innerHTML = `<i data-lucide="snowflake" class="w-4 h-4"></i><span>Hladnjak aktivan ($T_2 = ${state.T2}$ K)</span>`) : (s.className = "absolute top-3 left-3 px-3 py-1 bg-purple-500/15 border border-purple-500/40 text-purple-400 rounded-lg text-[11px] mono-font flex items-center gap-2 shadow-md z-20", s.innerHTML = '<i data-lucide="shield" class="w-4 h-4"></i><span>Toplotna izolacija (Adijabata)</span>');
  lucide.createIcons();
  "function" == typeof renderMathInElement && renderMathInElement(s, { delimiters: [{ left: "$$", right: "$$", display: true }, { left: "$", right: "$", display: false }] });
}

function render() {
  updateDerivedValues();
  var t = getStateAtProgress(state.progress);
  drawPVDiagram(t.V, t.P);
  drawTSDiagram(t.S, t.T);
  updateVisuals(t);
}

window.addEventListener("resize", resizeCanvases);
resizeCanvases();

let lastTime = performance.now();
function animateLoop(t) {
  var e, a;
  state.isPlaying && (e = (t - lastTime) / 1e3, a = parseFloat(document.getElementById("rangeSpeed").value), state.progress += e * a / 8, 1 < state.progress && (state.progress = 0));
  lastTime = t;
  render();
  requestAnimationFrame(animateLoop);
}

function togglePlay() {
  state.isPlaying = !state.isPlaying;
  const t = document.getElementById("playText"), e = document.getElementById("playIcon");
  state.isPlaying ? (t.innerText = "Pauziraj", e.setAttribute("data-lucide", "pause")) : (t.innerText = "Pokreni Ciklus", e.setAttribute("data-lucide", "play"));
  lucide.createIcons();
}

function resetSimulation() {
  state.isPlaying = false; state.progress = 0;
  document.getElementById("playText").innerText = "Pokreni Ciklus";
  document.getElementById("playIcon").setAttribute("data-lucide", "play");
  lucide.createIcons();
  render();
}

function stepSimulation() {
  state.isPlaying = false;
  document.getElementById("playText").innerText = "Pokreni Ciklus";
  document.getElementById("playIcon").setAttribute("data-lucide", "play");
  lucide.createIcons();
  state.progress += .05;
  1 < state.progress && (state.progress = 0);
  render();
}

["rangeT1", "rangeT2", "rangeVA", "rangeVB", "rangeSpeed"].forEach(t => {
  document.getElementById(t).addEventListener("input", () => {
    "rangeSpeed" === t && (document.getElementById("valSpeedLabel").innerText = document.getElementById("rangeSpeed").value + "x");
    render();
  });
});

render();
requestAnimationFrame(animateLoop);