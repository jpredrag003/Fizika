const state = {
    mode: 'horizontal',
    rho: 1000,
    v1: 2.0,
    d1: 0.20,
    d2: 0.10,
    p1: 105,
    h2: 0.0,
    g: 9.81,
    calc: { v2: 8.0, p2_kPa: 73.0, totalEnergy: 107 }
};

const canvas = document.getElementById('simCanvas');
const ctx = canvas.getContext('2d');

let particles = [];
const numParticles = 60;

function initParticles() {
    particles = [];
    for (let i = 0; i < numParticles; i++) {
        particles.push({
            progress: Math.random(),
            yOffset: (Math.random() - 0.5) * 0.8,
            size: Math.random() * 2 + 2
        });
    }
}

function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    if (particles.length === 0) initParticles();
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('load', () => {
    resizeCanvas();
    updateSimulation();
    requestAnimationFrame(animLoop);
});

function setMode(mode) {
    state.mode = mode;
    const btnH = document.getElementById('modeHorizontal');
    const btnI = document.getElementById('modeIncline');
    const hGroup = document.getElementById('heightControlGroup');

    if (mode === 'horizontal') {
        btnH.className = "px-3 py-1.5 text-xs font-medium rounded-lg transition bg-blue-600 text-white shadow";
        btnI.className = "px-3 py-1.5 text-xs font-medium rounded-lg transition text-slate-400 hover:text-white";
        state.h2 = 0.0;
        document.getElementById('sliderH2').value = 0.0;
        hGroup.style.opacity = '0.3';
        hGroup.style.pointerEvents = 'none';
    } else {
        btnI.className = "px-3 py-1.5 text-xs font-medium rounded-lg transition bg-blue-600 text-white shadow";
        btnH.className = "px-3 py-1.5 text-xs font-medium rounded-lg transition text-slate-400 hover:text-white";
        hGroup.style.opacity = '1';
        hGroup.style.pointerEvents = 'auto';
    }
    updateSimulation();
}

function changeFluidPreset() {
    const select = document.getElementById('fluidPreset');
    const customContainer = document.getElementById('customDensityContainer');
    if (select.value === 'custom') {
        customContainer.classList.remove('hidden');
        state.rho = parseFloat(document.getElementById('sliderRho').value);
    } else {
        customContainer.classList.add('hidden');
        state.rho = parseFloat(select.value);
    }
    document.getElementById('rhoLabel').innerText = state.rho + ' kg/m³';
    updateSimulation();
}

function resetDefaults() {
    document.getElementById('fluidPreset').value = "1000";
    document.getElementById('customDensityContainer').classList.add('hidden');
    state.rho = 1000;
    state.v1 = 2.0;
    document.getElementById('sliderV1').value = 2.0;
    state.d1 = 0.20;
    document.getElementById('sliderD1').value = 0.20;
    state.d2 = 0.10;
    document.getElementById('sliderD2').value = 0.10;
    state.p1 = 105;
    document.getElementById('sliderP1').value = 105;
    state.h2 = 0.0;
    document.getElementById('sliderH2').value = 0.0;
    setMode('horizontal');
    updateSimulation();
}

function updateSimulation() {
    if (document.getElementById('fluidPreset').value === 'custom') {
        state.rho = parseFloat(document.getElementById('sliderRho').value);
        document.getElementById('rhoVal').innerText = state.rho + ' kg/m³';
        document.getElementById('rhoLabel').innerText = state.rho + ' kg/m³';
    }
    state.v1 = parseFloat(document.getElementById('sliderV1').value);
    state.d1 = parseFloat(document.getElementById('sliderD1').value);
    state.d2 = parseFloat(document.getElementById('sliderD2').value);
    state.p1 = parseFloat(document.getElementById('sliderP1').value);
    if (state.mode === 'incline') {
        state.h2 = parseFloat(document.getElementById('sliderH2').value);
    }

    document.getElementById('v1Val').innerText = state.v1.toFixed(1) + ' m/s';
    document.getElementById('d1Val').innerText = state.d1.toFixed(2) + ' m';
    document.getElementById('d2Val').innerText = state.d2.toFixed(2) + ' m';
    document.getElementById('p1InputVal').innerText = state.p1 + ' kPa';
    document.getElementById('h2Val').innerText = state.h2.toFixed(1) + ' m';

    const r1 = state.d1 / 2;
    const r2 = state.d2 / 2;
    const A1 = Math.PI * Math.pow(r1, 2);
    const A2 = Math.PI * Math.pow(r2, 2);

    const v2 = state.v1 * (A1 / A2);
    const p1_Pa = state.p1 * 1000;
    const dyn1 = 0.5 * state.rho * Math.pow(state.v1, 2);
    const totalEnergy = p1_Pa + dyn1;

    const dyn2 = 0.5 * state.rho * Math.pow(v2, 2);
    const pot2 = state.rho * state.g * state.h2;
    const p2_Pa = totalEnergy - dyn2 - pot2;
    const p2_kPa = p2_Pa / 1000;
    const flowRate = A1 * state.v1 * 1000;

    // UI Cards Update
    document.getElementById('valD1').innerText = state.d1.toFixed(2) + ' m';
    document.getElementById('valV1').innerText = state.v1.toFixed(1) + ' m/s';
    document.getElementById('valP1').innerText = state.p1.toFixed(1) + ' kPa';
    document.getElementById('valDyn1').innerText = (dyn1 / 1000).toFixed(1) + ' kPa';
    document.getElementById('valH1').innerText = '0.0 m';

    document.getElementById('valD2').innerText = state.d2.toFixed(2) + ' m';
    document.getElementById('valV2').innerText = v2.toFixed(1) + ' m/s';
    document.getElementById('valP2').innerText = p2_kPa.toFixed(1) + ' kPa';
    document.getElementById('valDyn2').innerText = (dyn2 / 1000).toFixed(1) + ' kPa';
    document.getElementById('valH2').innerText = state.h2.toFixed(1) + ' m';

    document.getElementById('statConst').innerText = (totalEnergy / 1000).toFixed(1) + ' kPa';
    document.getElementById('statFlow').innerText = flowRate.toFixed(1) + ' L/s';
    document.getElementById('statSpeedRatio').innerText = `1.0 : ${(v2/state.v1).toFixed(1)}`;

    const effectEl = document.getElementById('statEffect');
    const alertEl = document.getElementById('cavitationAlert');

    if (p2_kPa < 5) {
        effectEl.innerText = "Kavitacija! Ekstreman pad pritiska";
        effectEl.className = "text-xs font-semibold text-rose-500 leading-tight flex items-center justify-center h-full";
        alertEl.classList.remove('hidden');
    } else if (p2_kPa < state.p1) {
        effectEl.innerText = "Venturijev efekt (Pritisak pao u suženju)";
        effectEl.className = "text-xs font-semibold text-rose-400 leading-tight flex items-center justify-center h-full";
        alertEl.classList.add('hidden');
    } else {
        effectEl.innerText = "Povećan pritisak usled visinske razlike";
        effectEl.className = "text-xs font-semibold text-emerald-400 leading-tight flex items-center justify-center h-full";
        alertEl.classList.add('hidden');
    }

    state.calc = { v2, p2_kPa, dyn1: dyn1/1000, dyn2: dyn2/1000, totalEnergy: totalEnergy/1000 };
}

function getPipeRadius(xNorm) {
    let radiusFraction;
    if (xNorm < 0.3) {
        radiusFraction = state.d1 / 0.4;
    } else if (xNorm >= 0.3 && xNorm <= 0.7) {
        const t = (xNorm - 0.3) / 0.4;
        const smoothT = t * t * (3 - 2 * t);
        const r1 = state.d1 / 0.4;
        const r2 = state.d2 / 0.4;
        radiusFraction = r1 + (r2 - r1) * smoothT;
    } else {
        radiusFraction = state.d2 / 0.4;
    }
    return radiusFraction * 65;
}

function getPipeCenterY(xNorm, canvasHeight) {
    const centerY = canvasHeight / 2;
    const hShift = (state.h2 / 2.0) * 40 * xNorm;
    return centerY - hShift;
}

function animLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;
    const step = 5;

    let topPoints = [];
    let botPoints = [];
    for (let x = 0; x <= w; x += step) {
        let xNorm = x / w;
        let r = getPipeRadius(xNorm);
        let cy = getPipeCenterY(xNorm, h);
        topPoints.push({x, y: cy - r});
        botPoints.push({x, y: cy + r});
    }

    // Glass interior gradient
    let grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(59, 130, 246, 0.25)');
    grad.addColorStop(0.5, 'rgba(30, 58, 138, 0.15)');
    grad.addColorStop(1, 'rgba(59, 130, 246, 0.25)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(topPoints[0].x, topPoints[0].y);
    topPoints.forEach(p => ctx.lineTo(p.x, p.y));
    for (let i = botPoints.length - 1; i >= 0; i--) {
        ctx.lineTo(botPoints[i].x, botPoints[i].y);
    }
    ctx.closePath();
    ctx.fill();

    // Glass walls with glossy reflection
    ctx.strokeStyle = '#93c5fd';
    ctx.lineWidth = 4;
    ctx.shadowColor = 'rgba(59, 130, 246, 0.5)';
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.moveTo(topPoints[0].x, topPoints[0].y);
    topPoints.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(botPoints[0].x, botPoints[0].y);
    botPoints.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw Real Manometers & Velocity Vectors
    drawManometersAndVectors(w, h);

    // Particles animation
    particles.forEach(p => {
        let currentR = getPipeRadius(p.progress) / 65;
        let localSpeedFactor = (0.15 / Math.max(currentR, 0.15)) * (state.v1 / 2.0);

        p.progress += 0.003 * localSpeedFactor;
        if (p.progress > 1) p.progress = 0;

        let curX = p.progress * w;
        let curR = getPipeRadius(p.progress);
        let curCy = getPipeCenterY(p.progress, h);
        let curY = curCy + p.yOffset * curR * 0.8;

        let pressureColorRatio = curR / (0.4 * 65);
        let red = Math.floor(59 + (244 - 59) * (1 - pressureColorRatio));
        let green = Math.floor(130 + (63 - 130) * (1 - pressureColorRatio));
        let blue = Math.floor(246 + (94 - 246) * (1 - pressureColorRatio));

        ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
        ctx.beginPath();
        ctx.arc(curX, curY, p.size, 0, Math.PI * 2);
        ctx.fill();
    });

    requestAnimationFrame(animLoop);
}

function drawManometersAndVectors(w, h) {
    const x1 = w * 0.2;
    const x2 = w * 0.5;

    const r1 = getPipeRadius(0.2);
    const cy1 = getPipeCenterY(0.2, h);

    const r2 = getPipeRadius(0.5);
    const cy2 = getPipeCenterY(0.5, h);

    const maxP = 300;
    const h1_liquid = Math.min(Math.max((state.p1 / maxP) * 55, 10), 60);
    const h2_liquid = Math.min(Math.max((state.calc.p2_kPa / maxP) * 55, 5), 60);

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.6)';
    ctx.lineWidth = 2;
    ctx.setLineDash([2, 2]);

    ctx.beginPath();
    ctx.moveTo(x1, cy1 - r1);
    ctx.lineTo(x1, cy1 - r1 - 70);
    ctx.moveTo(x2, cy2 - r2);
    ctx.lineTo(x2, cy2 - r2 - 70);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
    ctx.fillRect(x1 - 3, (cy1 - r1) - h1_liquid, 6, h1_liquid);

    ctx.fillStyle = 'rgba(244, 63, 94, 0.8)';
    ctx.fillRect(x2 - 3, (cy2 - r2) - h2_liquid, 6, h2_liquid);

    drawArrow(x1, cy1, Math.min(state.v1 * 6, 40), '#fbbf24', 'v₁');
    drawArrow(x2, cy2, Math.min(state.calc.v2 * 4, 60), '#fbbf24', 'v₂');

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText(`Tačka 1 (${state.p1} kPa)`, x1 - 30, cy1 - r1 - 75);
    ctx.fillText(`Tačka 2 (${state.calc.p2_kPa.toFixed(1)} kPa)`, x2 - 35, cy2 - r2 - 75);
}

function drawArrow(x, y, length, color, label) {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(x - length / 2, y);
    ctx.lineTo(x + length / 2, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + length / 2, y);
    ctx.lineTo(x + length / 2 - 6, y - 4);
    ctx.lineTo(x + length / 2 - 6, y + 4);
    ctx.closePath();
    ctx.fill();

    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText(label, x - 5, y - 12);
}

function toggleModal(show) {
    const modal = document.getElementById('theoryModal');
    if (show) modal.classList.remove('hidden');
    else modal.classList.add('hidden');
}