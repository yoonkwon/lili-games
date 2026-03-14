/**
 * Companion - follows player and auto-collects items
 */
import { COMPANIONS } from '../config.js';

export class Companion {
  constructor(type, ownerRef) {
    const config = COMPANIONS[type];
    this.type = type;
    this.name = config.name;
    this.emoji = config.emoji;
    this.range = config.range;
    this.collectSpeed = config.collectSpeed;
    this.ability = config.ability;
    this.abilityInterval = config.abilityInterval || 0;
    this.speed = config.speed;

    this.owner = ownerRef;
    this.x = ownerRef.x - 30;
    this.y = ownerRef.y + 20;
    this.facingRight = true;

    this.collectTimer = 0;
    this.abilityTimer = 0;
    this.bobPhase = Math.random() * Math.PI * 2;

    // Follow offset (staggered behind player)
    this.followOffset = { x: -30 - Math.random() * 20, y: 15 + Math.random() * 15 };
  }

  update(dt, items, onCollect) {
    // Follow owner with offset
    const tx = this.owner.x + this.followOffset.x;
    const ty = this.owner.y + this.followOffset.y;
    const dx = tx - this.x;
    const dy = ty - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 5) {
      const moveSpeed = Math.min(this.speed, dist * 3);
      this.x += (dx / dist) * moveSpeed * dt;
      this.y += (dy / dist) * moveSpeed * dt;
      if (Math.abs(dx) > 2) this.facingRight = dx > 0;
    }

    // Auto-collect nearby items
    this.collectTimer -= dt;
    if (this.collectTimer <= 0) {
      for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        if (item.collected) continue;
        const ix = item.x - this.x;
        const iy = item.y - this.y;
        if (Math.sqrt(ix * ix + iy * iy) < this.range) {
          // Sky items only collectible by ikdol
          if (item.sky && this.ability !== 'fly') continue;
          this.collectTimer = this.collectSpeed;
          onCollect(item, i);
          break;
        }
      }
    }

    // Ability timer
    if (this.abilityInterval > 0) {
      this.abilityTimer += dt;
    }

    this.bobPhase += dt * 6;
  }

  shouldRevealHidden() {
    if (this.ability !== 'detect') return false;
    if (this.abilityTimer >= this.abilityInterval) {
      this.abilityTimer = 0;
      return true;
    }
    return false;
  }

  draw(ctx, spriteCache) {
    const bobY = Math.sin(this.bobPhase) * 2;
    const flyY = this.ability === 'fly' ? -20 + Math.sin(this.bobPhase * 0.7) * 5 : 0;
    spriteCache.draw(ctx, `${this.type}-idle`, this.x, this.y + bobY + flyY, 0.8, !this.facingRight);
  }
}
