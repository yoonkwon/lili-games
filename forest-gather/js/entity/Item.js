/**
 * Collectible item on the map
 * Supports round modifiers: drifting, shy (flee), fading, swarm
 */
import { RARITY } from '../config.js';

export class Item {
  constructor(x, y, itemDef, rarity) {
    this.x = x;
    this.y = y;
    this.type = itemDef.type;
    this.emoji = itemDef.emoji;
    this.name = itemDef.name;
    this.rarity = rarity;
    this.value = RARITY[rarity].value;
    this.color = RARITY[rarity].color;
    this.glow = RARITY[rarity].glow;
    this.stars = this._getStars(rarity);
    this.collected = false;
    this.hidden = false;
    this.sky = false;

    // Animation
    this.phase = Math.random() * Math.PI * 2;
    this.spawnAnim = 0;
    this.collectAnim = 0;
    this.size = 28;

    // Modifier state
    this.modifier = null;

    // Magnet pull (set by spells/system)
    this.magnetPull = false;
    this.magnetStrength = 0;

    // Frozen state (blizzard spell)
    this.frozen = false;
    this.frozenTimer = 0;

    // Drifting: slow random movement
    this.driftAngle = Math.random() * Math.PI * 2;
    this.driftSpeed = 15 + Math.random() * 20;
    this.driftChangeTimer = 2 + Math.random() * 3;

    // Shy: flee from player when close
    this.fleeing = false;
    this.fleeVx = 0;
    this.fleeVy = 0;

    // Fading: lifetime countdown
    this.lifetime = 12 + Math.random() * 8; // 12-20 seconds to live
    this.age = 0;
    this.fadingOut = false;

    // Swarm: group movement
    this.swarmCenterX = x;
    this.swarmCenterY = y;
    this.swarmAngle = Math.random() * Math.PI * 2;
    this.swarmRadius = 20 + Math.random() * 30;
  }

  _getStars(rarity) {
    return rarity === 'shiny' ? '✦' : rarity === 'rare' ? '✦✦' : rarity === 'legendary' ? '✦✦✦' : '';
  }

  upgradeRarity(newRarity) {
    this.rarity = newRarity;
    this.value = RARITY[newRarity].value;
    this.color = RARITY[newRarity].color;
    this.glow = RARITY[newRarity].glow;
    this.stars = this._getStars(newRarity);
  }

  setModifier(mod) {
    this.modifier = mod;
  }

  _clampToBounds(mapW, mapH) {
    this.x = Math.max(40, Math.min((mapW || 2000) - 40, this.x));
    this.y = Math.max(80, Math.min((mapH || 1500) - 40, this.y));
  }

  update(dt, playerX, playerY, mapW, mapH) {
    this.phase += dt * 3;
    if (this.spawnAnim < 1) {
      this.spawnAnim = Math.min(1, this.spawnAnim + dt * 4);
    }
    if (this.collected) {
      this.collectAnim += dt * 5;
      return;
    }

    if (!this.modifier) return;

    // === Drifting: gentle random movement ===
    if (this.modifier === 'drifting') {
      this.driftChangeTimer -= dt;
      if (this.driftChangeTimer <= 0) {
        this.driftAngle += (Math.random() - 0.5) * Math.PI;
        this.driftChangeTimer = 2 + Math.random() * 3;
      }
      this.x += Math.cos(this.driftAngle) * this.driftSpeed * dt;
      this.y += Math.sin(this.driftAngle) * this.driftSpeed * dt;
      // Bounce off map edges
      if (this.x < 40 || this.x > (mapW || 2000) - 40) this.driftAngle = Math.PI - this.driftAngle;
      if (this.y < 80 || this.y > (mapH || 1500) - 40) this.driftAngle = -this.driftAngle;
      this._clampToBounds(mapW, mapH);
    }

    // === Shy: flee when player gets close ===
    if (this.modifier === 'shy' && playerX !== undefined) {
      const dx = this.x - playerX;
      const dy = this.y - playerY;
      const distSq = dx * dx + dy * dy;
      const fleeRange = 100;

      if (distSq < fleeRange * fleeRange && distSq > 0) {
        this.fleeing = true;
        const dist = Math.sqrt(distSq);
        const fleeForce = (1 - dist / fleeRange) * 250;
        this.fleeVx = (dx / dist) * fleeForce;
        this.fleeVy = (dy / dist) * fleeForce;
      } else {
        this.fleeing = false;
        this.fleeVx *= 0.9;
        this.fleeVy *= 0.9;
      }
      this.x += this.fleeVx * dt;
      this.y += this.fleeVy * dt;
      this._clampToBounds(mapW, mapH);
    }

    // === Fading: items disappear over time ===
    if (this.modifier === 'fading') {
      this.age += dt;
      if (this.age > this.lifetime * 0.7) {
        this.fadingOut = true;
      }
      if (this.age > this.lifetime) {
        this.collected = true; // remove without scoring
        this.collectAnim = 1.1;
      }
    }

    // === Swarm: orbit around a center point that drifts ===
    if (this.modifier === 'swarm') {
      this.swarmAngle += dt * 1.5;
      this.driftChangeTimer -= dt;
      if (this.driftChangeTimer <= 0) {
        this.driftAngle += (Math.random() - 0.5) * Math.PI * 0.5;
        this.driftChangeTimer = 3 + Math.random() * 3;
      }
      // Drift the center slowly
      this.swarmCenterX += Math.cos(this.driftAngle) * 25 * dt;
      this.swarmCenterY += Math.sin(this.driftAngle) * 25 * dt;
      this.swarmCenterX = Math.max(80, Math.min((mapW || 2000) - 80, this.swarmCenterX));
      this.swarmCenterY = Math.max(120, Math.min((mapH || 1500) - 80, this.swarmCenterY));
      // Orbit around center
      this.x = this.swarmCenterX + Math.cos(this.swarmAngle) * this.swarmRadius;
      this.y = this.swarmCenterY + Math.sin(this.swarmAngle) * this.swarmRadius;
    }
  }

  draw(ctx) {
    if (this.collected && this.collectAnim > 1) return;
    if (this.hidden) return;

    ctx.save();

    const bobY = Math.sin(this.phase) * 3;
    const scale = this.spawnAnim * (this.collected ? Math.max(0, 1 - this.collectAnim) : 1);
    let alpha = this.collected ? Math.max(0, 1 - this.collectAnim) : 1;

    // Fading effect: blink when about to disappear
    if (this.fadingOut && !this.collected) {
      const fadeProgress = (this.age - this.lifetime * 0.7) / (this.lifetime * 0.3);
      alpha *= 1 - fadeProgress * 0.7;
      // Blink faster as time runs out
      if (fadeProgress > 0.5) {
        alpha *= 0.5 + Math.sin(this.phase * 4) * 0.5;
      }
    }

    // Shy: visual shake when fleeing
    let shakeX = 0;
    if (this.fleeing) {
      shakeX = Math.sin(this.phase * 8) * 3;
    }

    ctx.globalAlpha = alpha;
    ctx.translate(this.x + shakeX, this.y + bobY);
    ctx.scale(scale, scale);

    // Frozen tint
    if (this.frozen) {
      ctx.globalAlpha = alpha * 0.85;
      ctx.fillStyle = 'rgba(135,206,235,0.4)';
      ctx.beginPath();
      ctx.arc(0, 0, this.size * 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = alpha;
    }

    // Glow effect for rare+ items
    if (this.glow && !this.collected) {
      const glowAlpha = 0.2 + Math.sin(this.phase * 2) * 0.15;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 15;
      ctx.globalAlpha = alpha * (0.5 + glowAlpha);

      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(0, 0, this.size * 0.7, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.globalAlpha = alpha;
    }

    // Draw emoji
    ctx.font = `${this.size}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.emoji, 0, 0);

    // Rarity indicator
    if (this.stars) {
      ctx.font = '10px sans-serif';
      ctx.fillStyle = this.color;
      ctx.fillText(this.stars, 0, this.size * 0.6);
    }

    ctx.restore();
  }

  isFinished() {
    return this.collected && this.collectAnim > 1;
  }
}
