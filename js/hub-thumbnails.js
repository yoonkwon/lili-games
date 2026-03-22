/**
 * Hub thumbnail renderer - draws game card thumbnails using actual game assets
 */

function loadImg(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// ── Chicken Egg ──
function renderChicken(ctx, w, h) {
  // Sky
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(0, 0, w, h);
  // Clouds
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.beginPath(); ctx.ellipse(80, 40, 50, 20, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(120, 36, 35, 16, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(310, 55, 40, 18, 0, 0, Math.PI * 2); ctx.fill();
  // Ground
  ctx.fillStyle = '#7EC850';
  ctx.fillRect(0, h * 0.7, w, h * 0.3);
  ctx.fillStyle = '#6AB840';
  ctx.fillRect(0, h * 0.73, w, h * 0.27);
  // Fence
  ctx.fillStyle = '#C8956C';
  for (const x of [30, 80, 130]) ctx.fillRect(x, h * 0.58, 8, 50);
  ctx.fillStyle = '#D4A574';
  ctx.fillRect(25, h * 0.62, 120, 6);
  ctx.fillRect(25, h * 0.69, 120, 6);
}

function drawChickenSprite(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  // Body
  ctx.fillStyle = '#FFF5E0';
  ctx.beginPath(); ctx.ellipse(0, 8, 32, 28, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.ellipse(0, 10, 30, 26, 0, 0, Math.PI * 2); ctx.fill();
  // Head
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(22, -14, 16, 0, Math.PI * 2); ctx.fill();
  // Comb
  ctx.fillStyle = '#FF4444';
  ctx.beginPath(); ctx.arc(22, -30, 5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(16, -28, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(28, -28, 4, 0, Math.PI * 2); ctx.fill();
  // Eye
  ctx.fillStyle = '#333';
  ctx.beginPath(); ctx.arc(28, -17, 3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFF';
  ctx.beginPath(); ctx.arc(29, -18, 1, 0, Math.PI * 2); ctx.fill();
  // Beak
  ctx.fillStyle = '#FF9800';
  ctx.beginPath(); ctx.moveTo(38, -14); ctx.lineTo(48, -10); ctx.lineTo(38, -6); ctx.fill();
  // Wing
  ctx.fillStyle = '#F5E6C8';
  ctx.save(); ctx.rotate(-0.25);
  ctx.beginPath(); ctx.ellipse(-10, 5, 16, 12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // Tail
  ctx.strokeStyle = '#D4A060'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-32, -2); ctx.quadraticCurveTo(-45, -20, -40, -32); ctx.stroke();
  ctx.strokeStyle = '#C89050';
  ctx.beginPath(); ctx.moveTo(-30, 0); ctx.quadraticCurveTo(-48, -15, -46, -28); ctx.stroke();
  // Legs
  ctx.strokeStyle = '#FF9800'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-8, 33); ctx.lineTo(-12, 50); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(8, 33); ctx.lineTo(12, 50); ctx.stroke();
  ctx.restore();
}

function drawNest(ctx, x, y) {
  ctx.fillStyle = '#A0722A';
  ctx.beginPath(); ctx.ellipse(x, y, 40, 18, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#C49A3C';
  ctx.beginPath(); ctx.ellipse(x, y, 35, 14, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#F5E6C8';
  ctx.beginPath(); ctx.ellipse(x, y, 28, 10, 0, 0, Math.PI * 2); ctx.fill();
  // Eggs
  ctx.fillStyle = '#FFF8E7'; ctx.strokeStyle = '#E8D5A8'; ctx.lineWidth = 1;
  for (const [ex, ey] of [[-10, -5], [5, -7], [15, -4]]) {
    ctx.beginPath(); ctx.ellipse(x + ex, y + ey, 10, 13, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
}

function renderForest(ctx, w, h) {
  // Sky
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(0, 0, w, h);
  // Clouds
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.beginPath(); ctx.ellipse(90, 35, 45, 18, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(310, 50, 50, 20, 0, 0, Math.PI * 2); ctx.fill();
  // Ground
  ctx.fillStyle = '#7EC850';
  ctx.fillRect(0, h * 0.67, w, h * 0.33);
  ctx.fillStyle = '#6AB840';
  ctx.fillRect(0, h * 0.7, w, h * 0.3);
  // Trees
  ctx.fillStyle = '#2E7D32';
  ctx.beginPath(); ctx.moveTo(60, 75); ctx.lineTo(25, h * 0.69); ctx.lineTo(95, h * 0.69); ctx.fill();
  ctx.fillStyle = '#388E3C';
  ctx.beginPath(); ctx.moveTo(60, 95); ctx.lineTo(35, h * 0.69); ctx.lineTo(85, h * 0.69); ctx.fill();
  ctx.fillStyle = '#5D4037';
  ctx.fillRect(55, h * 0.69, 10, 18);
  ctx.fillStyle = '#2E7D32';
  ctx.beginPath(); ctx.moveTo(340, 65); ctx.lineTo(305, h * 0.69); ctx.lineTo(375, h * 0.69); ctx.fill();
  ctx.fillStyle = '#388E3C';
  ctx.beginPath(); ctx.moveTo(340, 85); ctx.lineTo(315, h * 0.69); ctx.lineTo(365, h * 0.69); ctx.fill();
  ctx.fillStyle = '#5D4037';
  ctx.fillRect(335, h * 0.69, 10, 18);
  // Items
  ctx.font = '20px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🌷', 120, h * 0.82);
  ctx.fillText('🍓', 260, h * 0.85);
  ctx.font = '16px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
  ctx.fillText('🦋', 290, h * 0.75);
  // Sparkles
  ctx.font = '16px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
  ctx.fillText('✨', 200, h * 0.45);
  ctx.font = '14px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
  ctx.fillText('⭐', 150, h * 0.55);
  ctx.fillText('🌟', 260, h * 0.5);
}

// ── Baby games: load SVG assets ──
function drawFitted(ctx, img, cx, cy, maxSize) {
  const aspect = img.width / img.height;
  const dw = aspect >= 1 ? maxSize : maxSize * aspect;
  const dh = aspect >= 1 ? maxSize / aspect : maxSize;
  ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
}

async function renderBabyGame(canvasId, bgFn, momSvg, babySvg, extraFn) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  bgFn(ctx, w, h);
  const [mom, baby] = await Promise.all([loadImg(momSvg), loadImg(babySvg)]);
  if (mom) drawFitted(ctx, mom, w * 0.28, h * 0.45, 135);
  if (baby) drawFitted(ctx, baby, w * 0.65, h * 0.5, 80);
  if (extraFn) extraFn(ctx, w, h);
}

function elsaBg(ctx, w, h) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#0d1b3e'); g.addColorStop(0.6, '#1a3a5c'); g.addColorStop(1, '#4fc3f7');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  ctx.font = '14px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
  ctx.globalAlpha = 0.35; ctx.fillText('❄️', 60, 45); ctx.fillText('❄️', 320, 35);
  ctx.globalAlpha = 0.25; ctx.fillText('❄️', 150, 75); ctx.fillText('❄️', 280, 85);
  ctx.globalAlpha = 1;
  // Magic circle
  ctx.strokeStyle = 'rgba(79,195,247,0.3)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(w * 0.65, h * 0.48, 50, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = 'rgba(79,195,247,0.08)';
  ctx.beginPath(); ctx.arc(w * 0.65, h * 0.48, 50, 0, Math.PI * 2); ctx.fill();
}

function snowWhiteBg(ctx, w, h) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#1a2a1a'); g.addColorStop(0.6, '#2d4a2d'); g.addColorStop(1, '#4a7a4a');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  // Trees
  ctx.fillStyle = 'rgba(26,58,26,0.6)';
  ctx.beginPath(); ctx.moveTo(50, 50); ctx.lineTo(20, h * 0.75); ctx.lineTo(80, h * 0.75); ctx.fill();
  ctx.beginPath(); ctx.moveTo(350, 40); ctx.lineTo(315, h * 0.75); ctx.lineTo(385, h * 0.75); ctx.fill();
  // Fireflies
  ctx.fillStyle = 'rgba(255,215,0,0.6)';
  ctx.beginPath(); ctx.arc(80, 90, 3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,215,0,0.4)';
  ctx.beginPath(); ctx.arc(300, 70, 2, 0, Math.PI * 2); ctx.fill();
  // Animals
  ctx.font = '18px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🐰', 60, h * 0.88); ctx.fillText('🐦', 150, h * 0.92);
  ctx.fillText('🦌', 310, h * 0.9); ctx.fillText('🐿️', 250, h * 0.88);
}

function mermaidBg(ctx, w, h) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#050520'); g.addColorStop(0.5, '#0a1a3a'); g.addColorStop(1, '#1a4060');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  // Light rays
  ctx.fillStyle = 'rgba(79,195,247,0.06)';
  ctx.beginPath(); ctx.moveTo(120, 0); ctx.lineTo(140, 0); ctx.lineTo(180, h); ctx.lineTo(150, h); ctx.fill();
  ctx.fillStyle = 'rgba(79,195,247,0.05)';
  ctx.beginPath(); ctx.moveTo(250, 0); ctx.lineTo(275, 0); ctx.lineTo(310, h); ctx.lineTo(280, h); ctx.fill();
  // Bubbles
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath(); ctx.arc(70, 110, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.beginPath(); ctx.arc(330, 75, 3, 0, Math.PI * 2); ctx.fill();
  // Sea creatures
  ctx.font = '18px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🐠', 50, h * 0.83); ctx.fillText('🐢', 150, h * 0.9);
  ctx.fillText('🦑', 310, h * 0.88); ctx.fillText('🦀', 250, h * 0.85);
}

function elsaExtras(ctx, w, h) {
  ctx.font = '18px "Segoe UI Emoji", "Apple Color Emoji", sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('✨', w * 0.5, h * 0.35); ctx.fillText('💕', w * 0.58, h * 0.85);
  ctx.font = '20px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
  ctx.fillText('🍓', 50, h * 0.83); ctx.fillText('🍰', w * 0.78, h * 0.88);
}
function snowWhiteExtras(ctx, w, h) {
  ctx.font = '14px "Segoe UI Emoji", "Apple Color Emoji", sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('✨', w * 0.5, h * 0.3); ctx.fillText('🌟', w * 0.82, h * 0.45);
}
function mermaidExtras(ctx, w, h) {
  ctx.font = '14px "Segoe UI Emoji", "Apple Color Emoji", sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('🫧', w * 0.5, h * 0.3); ctx.fillText('✨', w * 0.82, h * 0.45);
}

function ourMomBg(ctx, w, h) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#2a1a3a'); g.addColorStop(0.5, '#5a3a5a'); g.addColorStop(1, '#FFB6C1');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  // Hearts
  ctx.font = '12px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
  ctx.globalAlpha = 0.3;
  ctx.fillText('💕', 50, 50); ctx.fillText('💗', 320, 40);
  ctx.fillText('🌸', 150, 80); ctx.fillText('✨', 270, 90);
  ctx.globalAlpha = 1;
  // Belly circle
  ctx.strokeStyle = 'rgba(255,105,180,0.3)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(w * 0.65, h * 0.48, 50, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = 'rgba(255,105,180,0.08)';
  ctx.beginPath(); ctx.arc(w * 0.65, h * 0.48, 50, 0, Math.PI * 2); ctx.fill();
}
function ourMomExtras(ctx, w, h) {
  ctx.font = '14px "Segoe UI Emoji", "Apple Color Emoji", sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('💕', w * 0.5, h * 0.35); ctx.fillText('🫧', w * 0.82, h * 0.45);
  ctx.font = '18px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
  ctx.fillText('🦠', 50, h * 0.88); ctx.fillText('🍓', w * 0.78, h * 0.85);
}

async function renderForestGather(canvasId, dpr) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = setupCanvas(canvas, dpr);
  const w = canvas.width / dpr, h = canvas.height / dpr;
  renderForest(ctx, w, h);

  const [ria, lisa] = await Promise.all([
    loadImg('our-mom-baby/assets/child-ria.png'),
    loadImg('our-mom-baby/assets/fairy-lisa.png'),
  ]);
  if (ria) drawFitted(ctx, ria, w * 0.4, h * 0.6, 80);
  if (lisa) drawFitted(ctx, lisa, w * 0.62, h * 0.55, 65);

  // Sparkles
  ctx.font = '16px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('✨', w * 0.2, h * 0.45);
  ctx.fillText('⭐', w * 0.82, h * 0.5);
  ctx.fillText('🌟', w * 0.5, h * 0.35);
}

// ── Main init ──
export function initThumbnails() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  // Chicken Egg
  const chickenCanvas = document.getElementById('thumb-chicken');
  if (chickenCanvas) {
    const ctx = setupCanvas(chickenCanvas, dpr);
    const w = chickenCanvas.width / dpr, h = chickenCanvas.height / dpr;
    renderChicken(ctx, w, h);
    drawChickenSprite(ctx, w * 0.55, h * 0.52, 0.85);
    drawNest(ctx, w * 0.82, h * 0.78);
    ctx.font = '14px "Segoe UI Emoji", "Apple Color Emoji", sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('✨', w * 0.7, h * 0.55); ctx.fillText('⭐', w * 0.85, h * 0.5);
  }

  // Forest Gather (async — load PNG assets)
  renderForestGather('thumb-forest', dpr);

  // Baby games (async SVG loading)
  renderBabyGame('thumb-elsa', elsaBg,
    'elsa-baby/assets/elsa-mom.png', 'elsa-baby/assets/baby-elsa-happy.png', elsaExtras);
  renderBabyGame('thumb-snow-white', snowWhiteBg,
    'snow-white-baby/assets/snow-white-mom.png', 'snow-white-baby/assets/baby-snow-white-happy.png', snowWhiteExtras);
  renderBabyGame('thumb-mermaid', mermaidBg,
    'mermaid-baby/assets/mermaid-mom.png', 'mermaid-baby/assets/baby-mermaid-happy.png', mermaidExtras);
  renderBabyGame('thumb-our-mom', ourMomBg,
    'our-mom-baby/assets/mom.png', 'our-mom-baby/assets/baby-ria-happy.png', ourMomExtras);
}

function setupCanvas(canvas, dpr) {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return ctx;
}
