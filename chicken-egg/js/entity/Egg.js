/**
 * Egg entity - pops out from under chicken with a bounce animation
 * Uses SpriteCache sprites with golden sparkle overlay
 */
export class Egg {
  constructor(startX, startY, targetX, targetY, golden = false) {
    this.startX = startX;
    this.startY = startY;
    this.targetX = targetX;
    this.targetY = targetY;
    this.golden = golden;

    this.progress = 0;
    this.collected = false;
    this.sparkle = 0;

    this.radius = golden ? 22 : 18;

    // Pop arc - small upward bounce
    this.midX = (startX + targetX) / 2;
    this.midY = Math.min(startY, targetY) - 40 - Math.random() * 30;

    // Current draw position
    this.drawX = startX;
    this.drawY = startY;

    // Pop scale animation
    this.popScale = 0;
  }

  update(dt) {
    this.progress += dt * 3.5; // faster than before
    this.sparkle += dt * 3;

    // Pop scale: quick grow then settle
    this.popScale = Math.min(1, this.progress * 3);

    const t = Math.min(1, this.progress);
    const mt = 1 - t;
    this.drawX = mt * mt * this.startX + 2 * mt * t * this.midX + t * t * this.targetX;
    this.drawY = mt * mt * this.startY + 2 * mt * t * this.midY + t * t * this.targetY;

    if (this.progress >= 1) {
      this.collected = true;
      return true;
    }
    return false;
  }

  draw(ctx) {
    const sc = window.__spriteCache;
    if (!sc || !sc.ready) return;

    ctx.save();
    ctx.translate(this.drawX, this.drawY);

    // Pop scale effect
    const s = this.popScale;
    const bounce = s < 1 ? 0.8 + Math.sin(s * Math.PI) * 0.4 : 1;
    ctx.scale(bounce, bounce);

    // Scale sprite to match entity's radius
    const baseR = this.golden ? 16 : 14;
    const scale = this.radius / baseR;
    const spriteName = this.golden ? 'egg-golden' : 'egg-normal';
    sc.draw(ctx, spriteName, 0, 0, scale, scale);

    // Golden sparkle particles overlay
    if (this.golden) {
      const r = this.radius;
      for (let i = 0; i < 5; i++) {
        const angle = this.sparkle + i * Math.PI * 2 / 5;
        const orbitR = r + 8 + Math.sin(this.sparkle * 2 + i) * 4;
        const sx = Math.cos(angle) * orbitR;
        const sy = Math.sin(angle) * orbitR * 0.8;
        const size = 2 + Math.sin(this.sparkle * 3 + i * 2) * 1;

        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(angle);
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size * 0.3, -size * 0.3);
        ctx.lineTo(size, 0);
        ctx.lineTo(size * 0.3, size * 0.3);
        ctx.lineTo(0, size);
        ctx.lineTo(-size * 0.3, size * 0.3);
        ctx.lineTo(-size, 0);
        ctx.lineTo(-size * 0.3, -size * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    ctx.restore();
  }
}
