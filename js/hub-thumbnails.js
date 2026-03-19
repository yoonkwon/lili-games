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

// ── Forest Gather (Ria & Lisa) ──
function drawRia(ctx, x, y, scale) {
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
  const headY = -20, bodyY = 0;
  const skin = '#FDDCB5', hair = '#3E2723', body = '#4CAF50', dark = '#2E7D32';
  // Hair back
  ctx.fillStyle = hair;
  ctx.beginPath(); ctx.arc(0, headY - 1, 17, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-14, headY + 6, 5, 10, -0.1, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(14, headY + 6, 5, 10, 0.1, 0, Math.PI * 2); ctx.fill();
  // Body
  ctx.fillStyle = body;
  ctx.beginPath(); ctx.moveTo(-11, bodyY - 6); ctx.quadraticCurveTo(-14, bodyY + 12, -12, bodyY + 16);
  ctx.lineTo(12, bodyY + 16); ctx.quadraticCurveTo(14, bodyY + 12, 11, bodyY - 6); ctx.closePath(); ctx.fill();
  // Head
  ctx.fillStyle = skin;
  ctx.beginPath(); ctx.arc(0, headY, 15, 0, Math.PI * 2); ctx.fill();
  // Hair front
  ctx.fillStyle = hair;
  ctx.beginPath(); ctx.arc(0, headY - 1, 16, Math.PI * 0.95, Math.PI * 2.05); ctx.fill();
  // Eyes
  ctx.fillStyle = '#2E4A1E';
  ctx.beginPath(); ctx.arc(-6, headY + 3.5, 2, 0, Math.PI * 2); ctx.arc(6, headY + 3.5, 2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFF';
  ctx.beginPath(); ctx.arc(-4.5, headY + 1.5, 1.5, 0, Math.PI * 2); ctx.arc(7.5, headY + 1.5, 1.5, 0, Math.PI * 2); ctx.fill();
  // Blush
  ctx.fillStyle = 'rgba(255,140,140,0.35)';
  ctx.beginPath(); ctx.ellipse(-9, headY + 6, 4, 2.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(9, headY + 6, 4, 2.5, 0, 0, Math.PI * 2); ctx.fill();
  // Mouth
  ctx.strokeStyle = '#E57373'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, headY + 8, 3, 0.3, Math.PI - 0.3); ctx.stroke();
  // Legs
  ctx.fillStyle = skin; ctx.fillRect(-6, bodyY + 14, 5, 8); ctx.fillRect(1, bodyY + 14, 5, 8);
  ctx.fillStyle = dark;
  ctx.beginPath(); ctx.ellipse(-4, bodyY + 23, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(4, bodyY + 23, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawLisa(ctx, x, y, scale) {
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
  const headY = -20, bodyY = 0;
  const skin = '#FDDCB5', hair = '#5D4037', body = '#FF69B4', dark = '#E91E63';
  // Hair back + pigtails
  ctx.fillStyle = hair;
  ctx.beginPath(); ctx.arc(0, headY, 17, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-17, headY + 4, 6, 12, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(17, headY + 4, 6, 12, 0.2, 0, Math.PI * 2); ctx.fill();
  // Hair ties
  ctx.fillStyle = '#FF4081';
  ctx.beginPath(); ctx.arc(-17, headY - 5, 3, 0, Math.PI * 2); ctx.arc(17, headY - 5, 3, 0, Math.PI * 2); ctx.fill();
  // Body
  ctx.fillStyle = body;
  ctx.beginPath(); ctx.moveTo(-11, bodyY - 6); ctx.quadraticCurveTo(-14, bodyY + 12, -12, bodyY + 16);
  ctx.lineTo(12, bodyY + 16); ctx.quadraticCurveTo(14, bodyY + 12, 11, bodyY - 6); ctx.closePath(); ctx.fill();
  // Head
  ctx.fillStyle = skin;
  ctx.beginPath(); ctx.arc(0, headY, 15, 0, Math.PI * 2); ctx.fill();
  // Hair front
  ctx.fillStyle = hair;
  ctx.beginPath(); ctx.arc(0, headY, 16, Math.PI * 1.1, Math.PI * 1.9); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-12, headY - 8); ctx.quadraticCurveTo(-6, headY - 2, 0, headY - 6);
  ctx.quadraticCurveTo(6, headY - 2, 12, headY - 8);
  ctx.lineTo(15, headY - 12); ctx.arc(0, headY, 16, -0.4, Math.PI + 0.4, true); ctx.closePath(); ctx.fill();
  // Eyes
  ctx.fillStyle = '#6B4226';
  ctx.beginPath(); ctx.arc(-6, headY + 3.5, 2, 0, Math.PI * 2); ctx.arc(6, headY + 3.5, 2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFF';
  ctx.beginPath(); ctx.arc(-4.5, headY + 1.5, 1.5, 0, Math.PI * 2); ctx.arc(7.5, headY + 1.5, 1.5, 0, Math.PI * 2); ctx.fill();
  // Blush
  ctx.fillStyle = 'rgba(255,140,140,0.35)';
  ctx.beginPath(); ctx.ellipse(-9, headY + 6, 4, 2.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(9, headY + 6, 4, 2.5, 0, 0, Math.PI * 2); ctx.fill();
  // Mouth
  ctx.strokeStyle = '#E57373'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, headY + 8, 3, 0.3, Math.PI - 0.3); ctx.stroke();
  // Legs
  ctx.fillStyle = skin; ctx.fillRect(-6, bodyY + 14, 5, 8); ctx.fillRect(1, bodyY + 14, 5, 8);
  ctx.fillStyle = dark;
  ctx.beginPath(); ctx.ellipse(-4, bodyY + 23, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(4, bodyY + 23, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawBori(ctx, x, y, scale) {
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
  // Body
  ctx.fillStyle = '#2a2a2a';
  ctx.beginPath(); ctx.ellipse(-2, 4, 14, 10, 0, 0, Math.PI * 2); ctx.fill();
  // Head
  ctx.beginPath(); ctx.arc(10, -6, 9, 0, Math.PI * 2); ctx.fill();
  // Ears
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath(); ctx.arc(4, -12, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(16, -12, 4, 0, Math.PI * 2); ctx.fill();
  // Eyes
  ctx.fillStyle = '#FFF';
  ctx.beginPath(); ctx.arc(8, -7, 2, 0, Math.PI * 2); ctx.arc(13, -7, 2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath(); ctx.arc(8.5, -7, 1.2, 0, Math.PI * 2); ctx.arc(13.5, -7, 1.2, 0, Math.PI * 2); ctx.fill();
  // Tongue
  ctx.fillStyle = '#4a3a6a';
  ctx.beginPath(); ctx.ellipse(10, 0, 2, 3, 0, 0, Math.PI); ctx.fill();
  // Nose
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.ellipse(10, -2, 2.5, 2, 0, 0, Math.PI * 2); ctx.fill();
  // Legs
  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(-8, 10, 4, 6); ctx.fillRect(-2, 10, 4, 6);
  ctx.fillRect(4, 10, 4, 6); ctx.fillRect(10, 10, 4, 6);
  ctx.restore();
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
async function renderBabyGame(canvasId, bgFn, momSvg, babySvg, extraFn) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  bgFn(ctx, w, h);
  const [mom, baby] = await Promise.all([loadImg(momSvg), loadImg(babySvg)]);
  if (mom) ctx.drawImage(mom, w * 0.16, h * 0.1, 90, 135);
  if (baby) ctx.drawImage(baby, w * 0.52, h * 0.25, 80, 80);
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

  // Forest Gather
  const forestCanvas = document.getElementById('thumb-forest');
  if (forestCanvas) {
    const ctx = setupCanvas(forestCanvas, dpr);
    const w = forestCanvas.width / dpr, h = forestCanvas.height / dpr;
    renderForest(ctx, w, h);
    drawRia(ctx, w * 0.43, h * 0.62, 1.4);
    drawLisa(ctx, w * 0.57, h * 0.66, 1.2);
    drawBori(ctx, w * 0.3, h * 0.8, 1);
  }

  // Baby games (async SVG loading)
  renderBabyGame('thumb-elsa', elsaBg,
    'elsa-baby/assets/elsa-mom.svg', 'elsa-baby/assets/baby-elsa-happy.svg', elsaExtras);
  renderBabyGame('thumb-snow-white', snowWhiteBg,
    'snow-white-baby/assets/snow-white-mom.svg', 'snow-white-baby/assets/baby-snow-white-happy.svg', snowWhiteExtras);
  renderBabyGame('thumb-mermaid', mermaidBg,
    'mermaid-baby/assets/mermaid-mom.svg', 'mermaid-baby/assets/baby-mermaid-happy.svg', mermaidExtras);
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
