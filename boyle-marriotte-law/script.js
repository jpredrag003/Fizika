const volumeRange = document.getElementById('volumeRange');
const tempRange = document.getElementById('tempRange');
const volumeVal = document.getElementById('volumeVal');
const tempVal = document.getElementById('tempVal');
const pressureDisplay = document.getElementById('pressureDisplay');
const pvConstDisplay = document.getElementById('pvConstDisplay');
const dynamicExplanation = document.getElementById('dynamicExplanation');

const autoVolBtn = document.getElementById('autoVolBtn');
const autoTempBtn = document.getElementById('autoTempBtn');

let isAutoVolPlaying = false;
let autoVolDirection = 1;

let isAutoTempPlaying = false;
let autoTempDirection = 1;

function initHiDPICanvas(canvas, logicalWidth, logicalHeight) {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = logicalWidth * dpr;
    canvas.height = logicalHeight * dpr;
    canvas.style.width = logicalWidth + 'px';
    canvas.style.height = logicalHeight + 'px';
    const ctx = canvas.getContext('2d', { alpha: false });
    ctx.scale(dpr, dpr);
    return ctx;
}

const cylinderWidth = 220, cylinderHeight = 300;
const graphWidth = 400, graphHeight = 240;

const cCtx = initHiDPICanvas(document.getElementById('cylinderCanvas'), cylinderWidth, cylinderHeight);
const gCtx = initHiDPICanvas(document.getElementById('graphCanvas'), graphWidth, graphHeight);

let V = parseFloat(volumeRange.value); 
let T = parseFloat(tempRange.value);    

let lastRenderedV = -1;
let lastRenderedT = -1;

function getPressure(vol, temp) {
    return (temp * 0.1) / vol;
}

const cylinderX = 30;
const cylinderY = 20;
const cylinderW = 160;
const maxCylinderH = 220;
const minGasH = 45;  
const maxGasH = 200; 

function getGasHeight(vol) {
    let normalizedV = (vol - 2) / 8;  
    return minGasH + normalizedV * (maxGasH - minGasH);
}

const numParticles = 35;
let particles = [];
for (let i = 0; i < numParticles; i++) {
    particles.push({
        x: cylinderX + 15 + Math.random() * (cylinderW - 30),
        y: cylinderY + 50 + Math.random() * 120,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4
    });
}

function updateDOMValues() {
    let roundV = parseFloat(V.toFixed(1));
    let roundT = Math.round(T);

    if (roundV !== lastRenderedV || roundT !== lastRenderedT) {
        lastRenderedV = roundV;
        lastRenderedT = roundT;

        volumeRange.value = V;
        tempRange.value = T;

        volumeVal.textContent = V.toFixed(1) + " L";
        tempVal.textContent = Math.round(T) + " K";

        let p = getPressure(V, T);
        pressureDisplay.textContent = p.toFixed(2);
        pvConstDisplay.textContent = (p * V).toFixed(1);

        if (T > 350) {
            dynamicExplanation.innerHTML = `🔥 <strong>Visoka temperatura (${Math.round(T)} K):</strong> Molekuli se kreću znatno brže, jače udaraju o zidove suda, a izoterma na grafiku je viša.`;
        } else if (T < 260) {
            dynamicExplanation.innerHTML = `❄️ <strong>Niska temperatura (${Math.round(T)} K):</strong> Kinetička energija čestica opada, kreću se sporije i vrše manji pritisak.`;
        } else {
            dynamicExplanation.innerHTML = `✨ <strong>Izotermski proces (${Math.round(T)} K):</strong> Proizvod pritiska i zapremine (pV = ${(p*V).toFixed(1)}) ostaje stabilan i konstantan.`;
        }
    }
}

const graphBgCanvas = document.createElement('canvas');
graphBgCanvas.width = graphWidth * (window.devicePixelRatio || 1);
graphBgCanvas.height = graphHeight * (window.devicePixelRatio || 1);
const gbCtx = graphBgCanvas.getContext('2d');
gbCtx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

function initGraphBg() {
    gbCtx.fillStyle = '#ffffff';
    gbCtx.fillRect(0, 0, graphWidth, graphHeight);

    let padding = 40;

    gbCtx.strokeStyle = '#f1f5f9';
    gbCtx.lineWidth = 1;
    gbCtx.fillStyle = '#64748b';
    gbCtx.font = '9px Inter, sans-serif';
    gbCtx.textAlign = 'right';

    for (let i = 0; i <= 5; i++) {
        let pressVal = i * 5; 
        let yPos = (graphHeight - padding) - (pressVal / 25) * (graphHeight - padding - 25);
        
        if (i > 0) {
            gbCtx.beginPath();
            gbCtx.moveTo(padding, yPos);
            gbCtx.lineTo(graphWidth - 15, yPos);
            gbCtx.stroke();
        }
        gbCtx.fillText(pressVal, padding - 8, yPos + 3);
    }

    gbCtx.textAlign = 'center';
    for (let v = 2; v <= 10; v += 2) {
        let xPos = padding + ((v - 2) / 8) * (graphWidth - padding - 30);
        if (v > 2) {
            gbCtx.beginPath();
            gbCtx.moveTo(xPos, 15);
            gbCtx.lineTo(xPos, graphHeight - padding);
            gbCtx.stroke();
        }
        gbCtx.fillText(v + 'L', xPos, graphHeight - padding + 15);
    }

    gbCtx.strokeStyle = '#475569';
    gbCtx.lineWidth = 2;
    gbCtx.beginPath();
    gbCtx.moveTo(padding, 15);
    gbCtx.lineTo(padding, graphHeight - padding);
    gbCtx.lineTo(graphWidth - 10, graphHeight - padding);
    gbCtx.stroke();

    gbCtx.font = 'bold 10px Inter, sans-serif';
    gbCtx.fillText('p (bar)', padding - 5, 12);
    gbCtx.fillText('V (L)', graphWidth - 20, graphHeight - padding - 5);
}
initGraphBg();

function mapX(vol) {
    let padding = 40;
    return padding + ((vol - 2) / 8) * (graphWidth - padding - 30);
}
function mapY(press) {
    let padding = 40;
    let norm = press / 25; 
    return (graphHeight - padding) - norm * (graphHeight - padding - 25);
}

function drawIsotherm(ctx, temp, color, width, dashed = false) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.setLineDash(dashed ? [4, 4] : []);
    ctx.beginPath();
    for (let vol = 2; vol <= 10; vol += 0.2) {
        let press = getPressure(vol, temp);
        let x = mapX(vol);
        let y = mapY(press);
        if (vol === 2) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawGraph() {
    gCtx.drawImage(graphBgCanvas, 0, 0, graphWidth, graphHeight);

    if (T > 250) drawIsotherm(gCtx, T - 100, '#93c5fd', 1.5, true);
    if (T < 350) drawIsotherm(gCtx, T + 100, '#fca5a5', 1.5, true);
    drawIsotherm(gCtx, T, '#2563eb', 2.5);

    let currentP = getPressure(V, T);
    let cx = mapX(V);
    let cy = mapY(currentP);
    let padding = 40;

    gCtx.strokeStyle = '#cbd5e1';
    gCtx.setLineDash([2, 2]);
    gCtx.beginPath();
    gCtx.moveTo(cx, cy);
    gCtx.lineTo(cx, graphHeight - padding);
    gCtx.moveTo(cx, cy);
    gCtx.lineTo(padding, cy);
    gCtx.stroke();
    gCtx.setLineDash([]);

    gCtx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    gCtx.shadowBlur = 6;
    gCtx.beginPath();
    gCtx.arc(cx, cy, 6, 0, Math.PI * 2);
    gCtx.fillStyle = '#dc2626';
    gCtx.fill();
    gCtx.strokeStyle = '#ffffff';
    gCtx.lineWidth = 2;
    gCtx.stroke();
    gCtx.shadowBlur = 0;

    gCtx.fillStyle = '#1e293b';
    gCtx.font = 'bold 10px Inter, sans-serif';
    gCtx.fillText(`(${V.toFixed(1)}L, ${currentP.toFixed(2)}bar)`, cx + 12, cy - 4);
}

function drawCylinder() {
    cCtx.fillStyle = '#ffffff';
    cCtx.fillRect(0, 0, cylinderWidth, cylinderHeight);

    let currentGasH = getGasHeight(V);
    let pistonY = cylinderY + (maxCylinderH - currentGasH);

    let gasColor = T > 350 ? 'rgba(254, 226, 226, 0.9)' : (T < 260 ? 'rgba(219, 234, 254, 0.9)' : 'rgba(224, 242, 254, 0.9)');
    cCtx.fillStyle = gasColor;
    cCtx.fillRect(cylinderX, pistonY, cylinderW, currentGasH);

    let speedFactor = Math.sqrt(T / 300);
    
    particles.forEach(p => {
        p.x += p.vx * speedFactor;
        p.y += p.vy * speedFactor;

        if (p.x < cylinderX + 6) { p.x = cylinderX + 6; p.vx *= -1; }
        if (p.x > cylinderX + cylinderW - 6) { p.x = cylinderX + cylinderW - 6; p.vx *= -1; }
        
        let topLimit = pistonY + 6;
        let bottomLimit = cylinderY + maxCylinderH - 6;

        if (p.y < topLimit) { p.y = topLimit; p.vy *= -1; }
        if (p.y > bottomLimit) { p.y = bottomLimit; p.vy *= -1; }

        cCtx.beginPath();
        cCtx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        cCtx.fillStyle = T > 350 ? '#ef4444' : (T < 260 ? '#3b82f6' : '#0ea5e9');
        cCtx.fill();
    });

    cCtx.strokeStyle = '#64748b';
    cCtx.lineWidth = 3;
    cCtx.beginPath();
    cCtx.moveTo(cylinderX, cylinderY);
    cCtx.lineTo(cylinderX, cylinderY + maxCylinderH);
    cCtx.moveTo(cylinderX + cylinderW, cylinderY);
    cCtx.lineTo(cylinderX + cylinderW, cylinderY + maxCylinderH);
    cCtx.stroke();

    let pistonH = 18;
    let pistonGrad = cCtx.createLinearGradient(cylinderX, 0, cylinderX + cylinderW, 0);
    pistonGrad.addColorStop(0, '#334155');
    pistonGrad.addColorStop(0.5, '#64748b');
    pistonGrad.addColorStop(1, '#334155');

    cCtx.fillStyle = pistonGrad;
    cCtx.fillRect(cylinderX - 3, pistonY - pistonH / 2, cylinderW + 6, pistonH);
    cCtx.strokeStyle = '#1e293b';
    cCtx.lineWidth = 2;
    cCtx.strokeRect(cylinderX - 3, pistonY - pistonH / 2, cylinderW + 6, pistonH);

    cCtx.fillStyle = '#64748b';
    cCtx.fillRect(cylinderX + cylinderW / 2 - 5, pistonY - pistonH / 2 - 30, 10, 30);
}

volumeRange.addEventListener('input', () => {
    V = parseFloat(volumeRange.value);
    updateDOMValues();
    drawGraph();
});

tempRange.addEventListener('input', () => {
    T = parseFloat(tempRange.value);
    updateDOMValues();
    drawGraph();
});

autoVolBtn.addEventListener('click', () => {
    isAutoVolPlaying = !isAutoVolPlaying;
    autoVolBtn.textContent = isAutoVolPlaying ? '⏸ Zaustavi Zapreminu' : '▶ Animiraj Zapreminu';
    autoVolBtn.classList.toggle('active', isAutoVolPlaying);
});

autoTempBtn.addEventListener('click', () => {
    isAutoTempPlaying = !isAutoTempPlaying;
    autoTempBtn.textContent = isAutoTempPlaying ? '⏸ Zaustavi Temperaturu' : '▶ Animiraj Temperaturu';
    autoTempBtn.classList.toggle('active', isAutoTempPlaying);
});

function loop() {
    if (isAutoVolPlaying) {
        V += 0.03 * autoVolDirection;
        if (V >= 10) { V = 10; autoVolDirection = -1; }
        else if (V <= 2) { V = 2; autoVolDirection = 1; }
    }

    if (isAutoTempPlaying) {
        T += 0.93 * autoTempDirection;
        if (T >= 450) { T = 450; autoTempDirection = -1; }
        else if (T <= 200) { T = 200; autoTempDirection = 1; }
    }

    if (isAutoVolPlaying || isAutoTempPlaying) {
        updateDOMValues();
        drawGraph();
    }

    drawCylinder();
    requestAnimationFrame(loop);
}

updateDOMValues();
drawGraph();
loop();