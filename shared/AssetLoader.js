/**
 * Shared SVG asset loader and character renderer
 * Handles preloading, mom drawing, and baby drawing with growth effects
 */

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** Try PNG first, fall back to SVG */
function loadImageWithFallback(pngSrc) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Fallback: try .svg
      const svgSrc = pngSrc.replace(/\.png$/, '.svg');
      const img2 = new Image();
      img2.onload = () => resolve(img2);
      img2.onerror = () => resolve(null);
      img2.src = svgSrc;
    };
    img.src = pngSrc;
  });
}

/**
 * @param {string} assetPrefix - e.g. 'assets/elsa' → loads assets/elsa-mom.png, assets/baby-elsa.png, etc.
 * @param {string} charName - e.g. 'elsa' for baby-elsa*.png naming
 * @param {string} sparkleEmoji - emoji shown near baby at later growth stages
 * @param {string} [villainFile] - optional villain asset filename e.g. 'assets/troll.png'
 */
export function createCharacterRenderer(assetPrefix, charName, sparkleEmoji, villainFile) {
  const assets = {};

  const assetsReady = (async () => {
    const list = {
      mom: `${assetPrefix}-mom.png`,
      baby: `assets/baby-${charName}.png`,
      babyHappy: `assets/baby-${charName}-happy.png`,
      babySad: `assets/baby-${charName}-sad.png`,
      babyAngry: `assets/baby-${charName}-angry.png`,
    };
    if (villainFile) list.villain = villainFile;
    const entries = Object.entries(list);
    const results = await Promise.all(entries.map(([key, src]) =>
      key === 'villain' ? loadImage(src) : loadImageWithFallback(src)
    ));
    entries.forEach(([key], i) => { assets[key] = results[i]; });
  })();

  function drawMom(ctx, x, y, scale = 1) {
    const img = assets.mom;
    if (!img) return;
    const drawW = 100 * scale;
    const drawH = 150 * scale;
    ctx.save();
    ctx.drawImage(img, x - drawW / 2, y - drawH * 0.35, drawW, drawH);
    ctx.restore();
  }

  function drawBaby(ctx, x, y, size, emotion, phase, growthRatio) {
    let img;
    if (emotion === 'happy') img = assets.babyHappy;
    else if (emotion === 'sad') img = assets.babySad;
    else if (emotion === 'angry') img = assets.babyAngry;
    else img = assets.baby;

    if (!img) return;

    const drawSize = size * 2;
    ctx.save();
    ctx.drawImage(img, x - drawSize / 2, y - drawSize / 2, drawSize, drawSize);

    // Growth overlay for later stages
    if (growthRatio > 0.5 && assets.baby) {
      ctx.globalAlpha = (growthRatio - 0.5) * 0.4;
      const extra = drawSize * 0.15 * (growthRatio - 0.5);
      ctx.drawImage(img, x - (drawSize + extra) / 2, y - (drawSize + extra) / 2, drawSize + extra, drawSize + extra);
      ctx.globalAlpha = 1;
    }

    // Sparkle near baby when bigger
    if (growthRatio > 0.6) {
      ctx.globalAlpha = 0.3 + Math.sin(phase * 3) * 0.2;
      ctx.font = `${size * 0.3}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(sparkleEmoji, x + size * 0.7, y - size * 0.5);
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  function drawVillain(ctx, x, y, size, fallbackEmoji) {
    const img = assets.villain;
    if (img) {
      ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
    } else if (fallbackEmoji) {
      ctx.font = `${size}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(fallbackEmoji, x, y);
    }
  }

  return { assetsReady, drawMom, drawBaby, drawVillain };
}
