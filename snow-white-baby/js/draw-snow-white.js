/**
 * Draw Snow White - loads SVG assets and renders them on canvas
 * Forest fairy tale style characters
 */

// Asset cache
const assets = {};
let assetsLoaded = false;

const ASSET_LIST = {
  mom: 'assets/snow-white-mom.svg',
  baby: 'assets/baby-snow-white.svg',
  babyHappy: 'assets/baby-snow-white-happy.svg',
  babySad: 'assets/baby-snow-white-sad.svg',
  babyAngry: 'assets/baby-snow-white-angry.svg',
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
export async function preloadSnowWhiteAssets() {
  const entries = Object.entries(ASSET_LIST);
  const results = await Promise.all(entries.map(([, src]) => loadImage(src)));
  entries.forEach(([key], i) => {
    assets[key] = results[i];
  });
  assetsLoaded = true;
}

// Start loading immediately on import
const _preloadPromise = preloadSnowWhiteAssets();
export { _preloadPromise as snowWhiteAssetsReady };

// Draw Mom Snow White using SVG asset
export function drawSnowWhiteMom(ctx, x, y, scale = 1) {
  const img = assets.mom;
  if (!img) return;

  const drawW = 100 * scale;
  const drawH = 150 * scale;

  ctx.save();
  ctx.drawImage(img, x - drawW / 2, y - drawH * 0.35, drawW, drawH);
  ctx.restore();
}

// Draw baby Snow White using SVG assets
export function drawBabySnowWhite(ctx, x, y, size, emotion, phase, growthRatio) {
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

  // Additional growth overlay for later stages
  if (growthRatio > 0.5 && assets.baby) {
    const alpha = (growthRatio - 0.5) * 0.4;
    ctx.globalAlpha = alpha;
    const extra = drawSize * 0.15 * (growthRatio - 0.5);
    ctx.drawImage(img, x - (drawSize + extra) / 2, y - (drawSize + extra) / 2, drawSize + extra, drawSize + extra);
    ctx.globalAlpha = 1;
  }

  // Tiny flower near baby when bigger
  if (growthRatio > 0.6) {
    const sparkAlpha = 0.3 + Math.sin(phase * 3) * 0.2;
    ctx.globalAlpha = sparkAlpha;
    ctx.font = `${size * 0.3}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('🌸', x + size * 0.7, y - size * 0.5);
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}
