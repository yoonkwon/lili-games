/**
 * Draw characters for Our Mom Baby game
 * Supports two modes: ria (first child) and lisa (second child)
 */

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

const assets = {};

export const assetsReady = (async () => {
  const list = {
    mom: 'assets/mom.png',
    babyRia: 'assets/baby-ria.png',
    babyRiaHappy: 'assets/baby-ria-happy.png',
    babyRiaSad: 'assets/baby-ria-sad.png',
    babyRiaAngry: 'assets/baby-ria-angry.png',
    babyLisa: 'assets/baby-lisa.png',
    babyLisaHappy: 'assets/baby-lisa-happy.png',
    babyLisaSad: 'assets/baby-lisa-sad.png',
    babyLisaAngry: 'assets/baby-lisa-angry.png',
    fairyLisa: 'assets/fairy-lisa.png',
    childRia: 'assets/child-ria.png',
    virus: 'assets/virus.png',
  };
  const entries = Object.entries(list);
  const results = await Promise.all(entries.map(([, src]) => loadImage(src)));
  entries.forEach(([key], i) => { assets[key] = results[i]; });
})();

export function drawMom(ctx, x, y, scale = 1) {
  const img = assets.mom;
  if (!img) return;
  const drawW = 100 * scale;
  const drawH = 150 * scale;
  ctx.save();
  ctx.drawImage(img, x - drawW / 2, y - drawH * 0.35, drawW, drawH);
  ctx.restore();
}

export function drawBaby(ctx, x, y, size, emotion, phase, growthRatio, mode) {
  const prefix = mode === 'lisa' ? 'babyLisa' : 'babyRia';
  let img;
  if (emotion === 'happy') img = assets[prefix + 'Happy'];
  else if (emotion === 'sad') img = assets[prefix + 'Sad'];
  else if (emotion === 'angry') img = assets[prefix + 'Angry'];
  else img = assets[prefix];
  if (!img) return;

  const drawSize = size * 2;
  ctx.save();
  ctx.drawImage(img, x - drawSize / 2, y - drawSize / 2, drawSize, drawSize);

  if (growthRatio > 0.5 && assets[prefix]) {
    ctx.globalAlpha = (growthRatio - 0.5) * 0.4;
    const extra = drawSize * 0.15 * (growthRatio - 0.5);
    ctx.drawImage(assets[prefix], x - (drawSize + extra) / 2, y - (drawSize + extra) / 2, drawSize + extra, drawSize + extra);
    ctx.globalAlpha = 1;
  }

  if (growthRatio > 0.6) {
    ctx.globalAlpha = 0.3 + Math.sin(phase * 3) * 0.2;
    ctx.font = `${size * 0.3}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('💕', x + size * 0.7, y - size * 0.5);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

export function drawFairyLisa(ctx, x, y, size) {
  const img = assets.fairyLisa;
  if (!img) return;
  ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
}

export function drawChildRia(ctx, x, y, size) {
  const img = assets.childRia;
  if (!img) return;
  ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
}

export function drawVirus(ctx, x, y, size) {
  const img = assets.virus;
  if (img) {
    ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
  } else {
    ctx.font = `${size}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🦠', x, y);
  }
}
