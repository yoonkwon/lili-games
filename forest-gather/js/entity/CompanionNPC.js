/**
 * CompanionNPC - a companion waiting to be discovered on the map
 * Shows up as a wandering animal with a "?" bubble.
 * When the player gets close, it joins the party.
 */
import { COMPANIONS } from '../config.js';

export class CompanionNPC {
  constructor(type, x, y) {
    const config = COMPANIONS[type];
    this.type = type;
    this.name = config.name;
    this.x = x;
    this.y = y;
    this.discovered = false;
    this.phase = Math.random() * Math.PI * 2;

    // Wander around a home point
    this.homeX = x;
    this.homeY = y;
    this.wanderTarget = { x, y };
    this.wanderTimer = 2 + Math.random() * 3;
    this.facingRight = Math.random() > 0.5;

    this.discoveryRadius = 70;
    this.noticeRadius = 140; // shows "!" when player is this close
    this.playerDist = Infinity; // cached distance to player
  }

  update(dt, playerX, playerY) {
    if (this.discovered) return;
    this.phase += dt * 4;

    // Wander
    this.wanderTimer -= dt;
    if (this.wanderTimer <= 0) {
      this.wanderTimer = 2 + Math.random() * 3;
      this.wanderTarget = {
        x: this.homeX + (Math.random() - 0.5) * 80,
        y: this.homeY + (Math.random() - 0.5) * 60,
      };
    }

    const dx = this.wanderTarget.x - this.x;
    const dy = this.wanderTarget.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 3) {
      this.x += (dx / dist) * 30 * dt;
      this.y += (dy / dist) * 30 * dt;
      if (Math.abs(dx) > 2) this.facingRight = dx > 0;
    }

    // Cache distance to player for use in draw()
    const px = playerX - this.x;
    const py = playerY - this.y;
    this.playerDist = Math.sqrt(px * px + py * py);

    if (this.playerDist < this.discoveryRadius) {
      this.discovered = true;
      return true; // signal: companion discovered!
    }
    return false;
  }

  draw(ctx, spriteCache) {
    if (this.discovered) return;

    const bobY = Math.sin(this.phase) * 3;

    // Draw the NPC sprite
    spriteCache.draw(ctx, `${this.type}-npc`, this.x, this.y + bobY, 1, !this.facingRight);

    // If player is close, show "!" excitement
    if (this.playerDist < this.noticeRadius) {
      ctx.save();
      ctx.font = 'Bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFD700';
      const exciteY = this.y + bobY - 40 + Math.sin(this.phase * 2) * 3;
      ctx.fillText('!', this.x, exciteY);
      ctx.restore();
    }
  }
}
