/**
 * Player character - Ria or Lisa
 */
export class Character {
  constructor(x, y, type, difficulty) {
    this.x = x;
    this.y = y;
    this.type = type; // 'ria' or 'lisa'
    this.speed = difficulty.moveSpeed;
    this.collectRadius = difficulty.collectRadius;

    // Movement
    this.targetX = x;
    this.targetY = y;
    this.moving = false;
    this.facingRight = true;

    // Animation
    this.bobPhase = 0;
    this.bobAmount = 0;
  }

  moveTo(tx, ty) {
    this.targetX = tx;
    this.targetY = ty;
    this.moving = true;
  }

  update(dt, mapWidth, mapHeight) {
    if (!this.moving) {
      this.bobAmount = Math.max(0, this.bobAmount - dt * 4);
      return;
    }

    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 5) {
      this.moving = false;
      this.bobAmount = Math.max(0, this.bobAmount - dt * 4);
      return;
    }

    const moveX = (dx / dist) * this.speed * dt;
    const moveY = (dy / dist) * this.speed * dt;

    this.x += moveX;
    this.y += moveY;

    // Clamp to map
    this.x = Math.max(30, Math.min(mapWidth - 30, this.x));
    this.y = Math.max(80, Math.min(mapHeight - 30, this.y));

    // Facing
    if (Math.abs(dx) > 2) {
      this.facingRight = dx > 0;
    }

    // Walk animation
    this.bobPhase += dt * 10;
    this.bobAmount = Math.min(1, this.bobAmount + dt * 8);
  }

  draw(ctx, spriteCache) {
    const bobY = Math.sin(this.bobPhase) * 3 * this.bobAmount;
    spriteCache.draw(ctx, `${this.type}-idle`, this.x, this.y + bobY, 1, !this.facingRight);

    // Name label
    const name = this.type === 'lisa' ? '리사' : '리아';
    ctx.font = 'Bold 11px "Apple SD Gothic Neo", "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillText(name, this.x + 1, this.y + 29);
    ctx.fillStyle = '#FFF';
    ctx.fillText(name, this.x, this.y + 28);
  }
}
