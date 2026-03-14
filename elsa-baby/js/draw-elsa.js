/**
 * Draw Elsa - loads SVG assets and renders them on canvas
 * Disney Frozen style characters
 */

// Asset cache
const assets = {};
let assetsLoaded = false;

const ASSET_LIST = {
  mom: 'assets/elsa-mom.svg',
  baby: 'assets/baby-elsa.svg',
  babyHappy: 'assets/baby-elsa-happy.svg',
  babySad: 'assets/baby-elsa-sad.svg',
  babyAngry: 'assets/baby-elsa-angry.svg',
};

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// Preload all assets
export async function preloadElsaAssets() {
  const entries = Object.entries(ASSET_LIST);
  const results = await Promise.all(entries.map(([, src]) => loadImage(src)));
  entries.forEach(([key], i) => {
    assets[key] = results[i];
  });
  assetsLoaded = true;
}

// Start loading immediately on import
const _preloadPromise = preloadElsaAssets();
export { _preloadPromise as elsaAssetsReady };

// Draw Mom Elsa using SVG asset
export function drawElsaMom(ctx, x, y, scale = 1) {
  const img = assets.mom;
  if (!img) return;

  const drawW = 100 * scale;
  const drawH = 150 * scale;

  ctx.save();
  ctx.drawImage(img, x - drawW / 2, y - drawH * 0.35, drawW, drawH);
  ctx.restore();
}

// Draw baby Elsa using SVG assets
export function drawBabyElsa(ctx, x, y, size, emotion, phase, growthRatio) {
  // Pick the right asset based on emotion
  let img;
  if (emotion === 'happy') img = assets.babyHappy;
  else if (emotion === 'sad') img = assets.babySad;
  else if (emotion === 'angry') img = assets.babyAngry;
  else img = assets.baby;

  if (!img) return;

  const drawSize = size * 2;

  ctx.save();
  ctx.drawImage(img, x - drawSize / 2, y - drawSize / 2, drawSize, drawSize);

  // Additional hair growth overlay for later stages
  if (growthRatio > 0.5 && assets.baby) {
    // Draw slightly larger hair effect as baby grows
    const hairAlpha = (growthRatio - 0.5) * 0.4;
    ctx.globalAlpha = hairAlpha;
    const hairExtra = drawSize * 0.15 * (growthRatio - 0.5);
    ctx.drawImage(img, x - (drawSize + hairExtra) / 2, y - (drawSize + hairExtra) / 2, drawSize + hairExtra, drawSize + hairExtra);
    ctx.globalAlpha = 1;
  }

  // Tiny snowflake near baby when bigger
  if (growthRatio > 0.6) {
    const sparkAlpha = 0.3 + Math.sin(phase * 3) * 0.2;
    ctx.globalAlpha = sparkAlpha;
    ctx.font = `${size * 0.3}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('❄️', x + size * 0.7, y - size * 0.5);
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}
