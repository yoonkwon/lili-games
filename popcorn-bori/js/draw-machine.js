/**
 * 팝콘 기계 (popcorn cart) drawing helpers.
 * Classic red-and-yellow striped cart with glass dome.
 */

export function drawMachine(ctx, cx, cy, w, h, opts = {}) {
  const {
    cornCount = 0,        // 0..1 — kernel fill ratio
    flavorColor = null,   // tint inside kettle
    cooking = false,      // shaking + popping animation
    shake = 0,            // 0..1
    glow = 0,             // 0..1 button highlight
  } = opts;

  ctx.save();
  ctx.translate(cx, cy);

  if (cooking && shake > 0) {
    ctx.translate(Math.sin(shake * 60) * 3, Math.cos(shake * 50) * 2);
  }

  const x = -w / 2;
  const y = -h / 2;

  // ── Striped roof (red & white awning) ──
  const roofH = h * 0.16;
  const stripes = 7;
  const sw = w / stripes;
  for (let i = 0; i < stripes; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#E63946' : '#F8F0E3';
    ctx.beginPath();
    ctx.moveTo(x + i * sw, y);
    ctx.lineTo(x + (i + 1) * sw, y);
    ctx.lineTo(x + (i + 1) * sw - sw * 0.3, y + roofH);
    ctx.lineTo(x + i * sw + sw * 0.3, y + roofH);
    ctx.closePath();
    ctx.fill();
  }
  // Roof base bar
  ctx.fillStyle = '#B8252F';
  ctx.fillRect(x - 4, y + roofH - 6, w + 8, 8);
  ctx.fillStyle = '#FFD93D';
  ctx.fillRect(x - 4, y + roofH - 2, w + 8, 4);

  // Pennant flag on top
  ctx.fillStyle = '#FFD93D';
  ctx.beginPath();
  ctx.moveTo(0, y - 2);
  ctx.lineTo(0, y - 28);
  ctx.lineTo(14, y - 22);
  ctx.lineTo(0, y - 16);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#8B4513';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, y - 2);
  ctx.lineTo(0, y - 32);
  ctx.stroke();

  // ── Glass dome (kettle area) ──
  const domeY = y + roofH + 6;
  const domeH = h * 0.55;
  const domeW = w * 0.84;
  const domeX = -domeW / 2;

  // Frame
  ctx.fillStyle = '#FFF0CC';
  ctx.beginPath();
  ctx.roundRect(x, domeY - 6, w, domeH + 12, 10);
  ctx.fill();

  // Glass
  ctx.fillStyle = 'rgba(220, 240, 255, 0.4)';
  ctx.beginPath();
  ctx.roundRect(domeX, domeY, domeW, domeH, 10);
  ctx.fill();
  ctx.strokeStyle = '#7B4019';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Glass shine
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath();
  ctx.roundRect(domeX + 8, domeY + 6, domeW * 0.18, domeH * 0.7, 6);
  ctx.fill();

  // ── Kettle (the black pot inside the dome) ──
  const kettleY = domeY + domeH - 28;
  const kettleW = domeW * 0.7;
  const kettleH = 36;
  // Hanging arms
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(domeX + 4, domeY + 6);
  ctx.lineTo(-kettleW / 2 + 2, kettleY - 4);
  ctx.moveTo(domeX + domeW - 4, domeY + 6);
  ctx.lineTo(kettleW / 2 - 2, kettleY - 4);
  ctx.stroke();

  // Kettle body
  ctx.fillStyle = '#2a2a2a';
  ctx.beginPath();
  ctx.roundRect(-kettleW / 2, kettleY, kettleW, kettleH, 6);
  ctx.fill();
  // Kettle top rim
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(-kettleW / 2 - 3, kettleY - 4, kettleW + 6, 6);
  // Kettle highlight
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(-kettleW / 2 + 3, kettleY + 4, kettleW * 0.3, 4);

  // Flavor tint glow inside kettle
  if (flavorColor) {
    const isRainbow = flavorColor === 'rainbow';
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(-kettleW / 2 + 3, kettleY + 3, kettleW - 6, kettleH - 6, 4);
    ctx.clip();
    if (isRainbow) {
      const rg = ctx.createLinearGradient(-kettleW / 2, kettleY, kettleW / 2, kettleY);
      rg.addColorStop(0, '#FF6B6B');
      rg.addColorStop(0.25, '#FFD93D');
      rg.addColorStop(0.5, '#6BCB77');
      rg.addColorStop(0.75, '#4D96FF');
      rg.addColorStop(1, '#B983FF');
      ctx.fillStyle = rg;
    } else {
      ctx.fillStyle = flavorColor;
    }
    ctx.globalAlpha = 0.65;
    ctx.fillRect(-kettleW / 2, kettleY, kettleW, kettleH);
    ctx.restore();
  }

  // Corn kernels visible inside kettle (yellow dots)
  if (cornCount > 0) {
    const dots = Math.floor(cornCount * 12);
    for (let i = 0; i < dots; i++) {
      const dx = (-kettleW / 2 + 6) + (i / dots) * (kettleW - 12) + Math.sin(i * 7) * 2;
      const dy = kettleY + 8 + Math.sin(i * 3) * 6;
      ctx.fillStyle = '#FFE066';
      ctx.beginPath();
      ctx.arc(dx, dy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Steam puffs while cooking
  if (cooking) {
    for (let i = 0; i < 4; i++) {
      const sx = (-kettleW * 0.3) + (i / 3) * kettleW * 0.6;
      const sy = kettleY - 8 - (shake * 50 + i * 15) % 50;
      const sa = Math.max(0, 1 - ((shake * 50 + i * 15) % 50) / 50);
      ctx.globalAlpha = sa * 0.5;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(sx, sy, 6 + i, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  // ── Cart base (under glass) ──
  const baseY = domeY + domeH + 6;
  const baseH = h * 0.18;
  // Yellow band with text
  ctx.fillStyle = '#FFD93D';
  ctx.beginPath();
  ctx.roundRect(x, baseY, w, baseH * 0.55, 4);
  ctx.fill();
  ctx.fillStyle = '#E63946';
  ctx.font = `Bold ${Math.floor(baseH * 0.32)}px "Apple SD Gothic Neo", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🍿 POPCORN 🍿', 0, baseY + baseH * 0.27);

  // Red lower body
  ctx.fillStyle = '#E63946';
  ctx.beginPath();
  ctx.roundRect(x, baseY + baseH * 0.5, w, baseH * 0.5, 6);
  ctx.fill();
  ctx.fillStyle = '#B8252F';
  ctx.fillRect(x, baseY + baseH * 0.78, w, 4);

  ctx.restore();
}

/**
 * GO 버튼 - 기계 측면에 붙어있음. 위치는 외부에서 결정.
 */
export function drawGoButton(ctx, x, y, r, opts = {}) {
  const { active = true, pulse = 0, label = 'GO' } = opts;
  const scale = active ? (1 + Math.sin(pulse * 6) * 0.05) : 1;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Outer ring
  ctx.fillStyle = '#8B4513';
  ctx.beginPath();
  ctx.arc(0, 0, r + 6, 0, Math.PI * 2);
  ctx.fill();

  // Button face
  const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.2, 0, 0, r);
  if (active) {
    grad.addColorStop(0, '#FF6B6B');
    grad.addColorStop(1, '#C92A2A');
  } else {
    grad.addColorStop(0, '#999');
    grad.addColorStop(1, '#555');
  }
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.3, -r * 0.4, r * 0.4, r * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Glow when active
  if (active && Math.sin(pulse * 6) > 0) {
    ctx.shadowColor = '#FFD93D';
    ctx.shadowBlur = 20;
    ctx.strokeStyle = 'rgba(255,217,61,0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, r + 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // Label
  ctx.fillStyle = '#FFF';
  ctx.font = `Bold ${Math.floor(r * 0.7)}px "Apple SD Gothic Neo", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 0, 1);

  ctx.restore();
}

/**
 * 팝콘 한 알 그리기 — 색에 따라 다른 색의 팝콘.
 */
export function drawPopcorn(ctx, cx, cy, size, popColor, popCore) {
  ctx.save();
  ctx.translate(cx, cy);

  // Resolve rainbow
  let outer = popColor;
  let core = popCore;
  if (popColor === 'rainbow') {
    const rainbow = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#B983FF', '#FF8FB1'];
    outer = rainbow[Math.floor((cx + cy) * 0.07) % rainbow.length];
    core = rainbow[(Math.floor((cx + cy) * 0.07) + 2) % rainbow.length];
  }

  // Popcorn shape: 4-5 lobes around core
  const lobes = 5;
  for (let i = 0; i < lobes; i++) {
    const a = (i / lobes) * Math.PI * 2;
    const lx = Math.cos(a) * size * 0.45;
    const ly = Math.sin(a) * size * 0.45;
    ctx.fillStyle = outer;
    ctx.beginPath();
    ctx.arc(lx, ly, size * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }
  // Core
  ctx.fillStyle = outer;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.55, 0, Math.PI * 2);
  ctx.fill();

  // Subtle inner shadow
  ctx.fillStyle = core;
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.arc(0, 2, size * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath();
  ctx.arc(-size * 0.2, -size * 0.25, size * 0.18, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Bori's bowl / popcorn bag.
 */
export function drawBowl(ctx, cx, cy, w, h, fillRatio = 0) {
  ctx.save();
  ctx.translate(cx, cy);

  // Striped popcorn bag (red/white)
  const stripes = 6;
  const sw = w / stripes;
  for (let i = 0; i < stripes; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#E63946' : '#F8F0E3';
    ctx.beginPath();
    // Trapezoid shape
    const topX = -w / 2 + i * sw;
    const topW = sw;
    const bottomX = -w * 0.4 + i * (w * 0.8 / stripes);
    const bottomW = (w * 0.8) / stripes;
    ctx.moveTo(topX, -h / 2);
    ctx.lineTo(topX + topW, -h / 2);
    ctx.lineTo(bottomX + bottomW, h / 2);
    ctx.lineTo(bottomX, h / 2);
    ctx.closePath();
    ctx.fill();
  }
  // Top rim
  ctx.fillStyle = '#B8252F';
  ctx.fillRect(-w / 2 - 2, -h / 2 - 4, w + 4, 6);

  ctx.restore();
}
