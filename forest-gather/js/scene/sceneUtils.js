/**
 * Shared utilities for exploration scenes (GameScene, QuizGameScene)
 */
import { Companion } from '../entity/Companion.js';

/** Draw wrapped text (character-by-character for CJK) */
export function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
  const chars = text.split('');
  let line = '';
  let currentY = y;
  for (const char of chars) {
    const testLine = line + char;
    if (ctx.measureText(testLine).width > maxWidth && line.length > 0) {
      ctx.fillText(line, x, currentY);
      line = char;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
}

/** Generate random background decorations (simple fallback) */
export function generateDecos(emojis, mapWidth, mapHeight, count = 40) {
  const decos = [];
  for (let i = 0; i < count; i++) {
    decos.push({
      x: Math.random() * mapWidth,
      y: Math.random() * mapHeight,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      size: 18 + Math.random() * 18,
      phase: Math.random() * Math.PI * 2,
    });
  }
  return decos;
}

/**
 * Generate rich terrain features from a TERRAIN_PRESETS config.
 * Returns an array of terrain objects sorted by y for depth ordering.
 */
export function generateTerrain(preset, mapWidth, mapHeight) {
  if (!preset) return [];
  const terrain = [];
  const margin = 60;

  // Helper: place items in clusters for natural feel
  function placeCluster(emoji, count, sizeMin, sizeMax, layer) {
    // Place items in 2-4 clusters + some scattered
    const clusterCount = Math.max(1, Math.floor(count / 4));
    const clusterCenters = [];
    for (let c = 0; c < clusterCount; c++) {
      clusterCenters.push({
        x: margin + Math.random() * (mapWidth - margin * 2),
        y: margin + Math.random() * (mapHeight - margin * 2),
      });
    }

    for (let i = 0; i < count; i++) {
      let x, y;
      if (i < count * 0.7 && clusterCenters.length > 0) {
        // Place near a cluster center
        const center = clusterCenters[i % clusterCenters.length];
        x = center.x + (Math.random() - 0.5) * 200;
        y = center.y + (Math.random() - 0.5) * 160;
      } else {
        // Scatter randomly
        x = margin + Math.random() * (mapWidth - margin * 2);
        y = margin + Math.random() * (mapHeight - margin * 2);
      }
      x = Math.max(margin, Math.min(mapWidth - margin, x));
      y = Math.max(margin, Math.min(mapHeight - margin, y));

      const size = sizeMin + Math.random() * (sizeMax - sizeMin);
      terrain.push({
        x, y,
        emoji,
        size,
        font: `${Math.round(size)}px sans-serif`, // cached font string
        phase: Math.random() * Math.PI * 2,
        layer, // 'bg' = behind player, 'fg' = in front based on y
      });
    }
  }

  // Trees (large, background layer)
  if (preset.trees) {
    for (const t of preset.trees) {
      placeCluster(t.emoji, t.count, t.sizeMin, t.sizeMax, 'bg');
    }
  }

  // Rocks
  if (preset.rocks) {
    for (const r of preset.rocks) {
      placeCluster(r.emoji, r.count, r.sizeMin, r.sizeMax, 'bg');
    }
  }

  // Flowers (small, scattered more evenly)
  if (preset.flowers) {
    for (const f of preset.flowers) {
      placeCluster(f.emoji, f.count, f.sizeMin, f.sizeMax, 'bg');
    }
  }

  // Bush clusters - groups of bushes that create natural boundaries
  if (preset.bushClusters) {
    for (let i = 0; i < preset.bushClusters; i++) {
      const cx = margin + Math.random() * (mapWidth - margin * 2);
      const cy = margin + Math.random() * (mapHeight - margin * 2);
      const bushCount = 3 + Math.floor(Math.random() * 4);
      for (let b = 0; b < bushCount; b++) {
        const bSize = 22 + Math.random() * 16;
        terrain.push({
          x: cx + (Math.random() - 0.5) * 80,
          y: cy + (Math.random() - 0.5) * 50,
          emoji: '🌿',
          size: bSize,
          font: `${Math.round(bSize)}px sans-serif`,
          phase: Math.random() * Math.PI * 2,
          layer: 'bg',
        });
      }
    }
  }

  // Sort by y for depth ordering
  terrain.sort((a, b) => a.y - b.y);
  return terrain;
}

/** Draw background decorations */
export function drawDecos(ctx, decos, gameTime) {
  for (const d of decos) {
    const bobY = Math.sin(gameTime * 0.8 + d.phase) * 2;
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.font = `${d.size}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(d.emoji, d.x, d.y + bobY);
    ctx.restore();
  }
}

/** Draw terrain features with depth, subtle animation, and frustum culling */
export function drawTerrain(ctx, terrain, gameTime, camX, camY, viewW, viewH) {
  // Frustum margins (elements can be larger than their position)
  const pad = 80;
  const left = (camX || 0) - pad;
  const right = (camX || 0) + (viewW || 9999) + pad;
  const top = (camY || 0) - pad;
  const bottom = (camY || 0) + (viewH || 9999) + pad;

  for (const t of terrain) {
    // Frustum culling: skip off-screen terrain
    if (t.x < left || t.x > right || t.y < top || t.y > bottom) continue;

    const sway = t.size > 30
      ? Math.sin(gameTime * 0.5 + t.phase) * 1.5  // trees sway slowly
      : Math.sin(gameTime * 0.8 + t.phase) * 0.8;  // small items sway less
    ctx.save();
    ctx.globalAlpha = t.size > 30 ? 0.85 : 0.65;
    ctx.font = t.font; // use cached font string
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(t.emoji, t.x + sway, t.y);
    ctx.restore();
  }
}

/** Update companions and CompanionNPCs for a scene */
export function updateCompanions(scene, dt, items) {
  const onReveal = (item) => {
    const sx = (item.x - scene.camX) * scene.gameScale;
    const sy = (item.y - scene.camY) * scene.gameScale;
    scene.particles.addFloatingText(sx, sy - 20, '!', '#FFD700');
  };

  for (const comp of scene.companions) {
    comp.update(dt, items, onReveal, 0, 0, scene.companions);
  }

  // Update CompanionNPCs
  for (const npc of scene.companionNPCs) {
    const discovered = npc.update(dt, scene.player.x, scene.player.y);
    if (discovered) {
      const newComp = new Companion(npc.type, scene.player, scene.companions.length, scene.companions.length + 1);
      scene.companions.push(newComp);
      for (let i = 0; i < scene.companions.length; i++) {
        scene.companions[i].assignAngle(i, scene.companions.length);
      }
      scene.message.show(`🎉 ${npc.name}이(가) 합류했어요!`, 3);
      const sx = (npc.x - scene.camX) * scene.gameScale;
      const sy = (npc.y - scene.camY) * scene.gameScale;
      scene.particles.createStars(sx, sy, 12);
    }
  }
}

/** Draw a mini-map for a scene, with optional custom item renderer */
export function drawMiniMap(ctx, scene, items, drawItemFn) {
  const mapW = 90;
  const mapH = Math.round(mapW * (scene.mapHeight / scene.mapWidth));
  const mx = scene.screenW - mapW - 12;
  const my = scene.screenH - mapH - 12;

  ctx.save();
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.roundRect(mx - 2, my - 2, mapW + 4, mapH + 4, 6);
  ctx.fill();

  ctx.fillStyle = scene.stageConfig.groundColor;
  ctx.fillRect(mx, my, mapW, mapH);

  // Items
  for (const item of items) {
    const ix = mx + (item.x / scene.mapWidth) * mapW;
    const iy = my + (item.y / scene.mapHeight) * mapH;
    if (drawItemFn) {
      drawItemFn(ctx, item, ix, iy);
    } else {
      ctx.fillStyle = item.discovered ? '#4CAF50' : 'rgba(255,255,255,0.5)';
      ctx.beginPath();
      ctx.arc(ix, iy, item.discovered ? 2.5 : 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Player
  const px = mx + (scene.player.x / scene.mapWidth) * mapW;
  const py = my + (scene.player.y / scene.mapHeight) * mapH;
  ctx.fillStyle = '#FF4444';
  ctx.beginPath();
  ctx.arc(px, py, 3, 0, Math.PI * 2);
  ctx.fill();

  // Viewport indicator
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 1;
  const vx = mx + (scene.camX / scene.mapWidth) * mapW;
  const vy = my + (scene.camY / scene.mapHeight) * mapH;
  const vw = (scene.viewW / scene.mapWidth) * mapW;
  const vh = (scene.viewH / scene.mapHeight) * mapH;
  ctx.strokeRect(vx, vy, vw, vh);

  ctx.restore();
}

/** Update camera to follow player with smooth interpolation */
export function updateCamera(scene, dt) {
  const targetCamX = scene.player.x - scene.viewW / 2;
  const targetCamY = scene.player.y - scene.viewH / 2;
  scene.camX += (targetCamX - scene.camX) * Math.min(1, dt * 5);
  scene.camY += (targetCamY - scene.camY) * Math.min(1, dt * 5);
  scene.camX = Math.max(0, Math.min(scene.mapWidth - scene.viewW, scene.camX));
  scene.camY = Math.max(0, Math.min(scene.mapHeight - scene.viewH, scene.camY));
}

/** Find nearest undiscovered item from a list */
export function findNearestUndiscovered(items, playerX, playerY) {
  let nearest = null;
  let minDist = Infinity;
  for (const item of items) {
    if (item.discovered) continue;
    const dx = item.x - playerX;
    const dy = item.y - playerY;
    const d = dx * dx + dy * dy;
    if (d < minDist) { minDist = d; nearest = item; }
  }
  return nearest;
}

/** Draw a sprite if available, otherwise draw emoji text */
export function drawSpriteOrEmoji(ctx, spriteCache, sprite, emoji, x, y, size) {
  if (sprite && spriteCache) {
    const s = spriteCache.get(sprite);
    if (s) {
      ctx.drawImage(s, x - size / 2, y - size / 2, size, size);
      return;
    }
  }
  ctx.font = `${size}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, x, y);
}

/** Get directional hint text for companion */
export function getDirectionHint(fromX, fromY, toX, toY) {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const angle = Math.atan2(dy, dx);
  if (angle > -Math.PI / 4 && angle < Math.PI / 4) return '오른쪽';
  if (angle >= Math.PI / 4 && angle < 3 * Math.PI / 4) return '아래쪽';
  if (angle >= -3 * Math.PI / 4 && angle < -Math.PI / 4) return '위쪽';
  return '왼쪽';
}
