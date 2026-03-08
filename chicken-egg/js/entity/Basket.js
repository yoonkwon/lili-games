/**
 * Basket entity - woven basket that collects eggs
 * Uses SpriteCache for base basket with dynamic egg/badge overlays
 */
export class Basket {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 130;
    this.h = 80;
    this.bounce = 0;
  }

  update(dt) {
    if (this.bounce > 0) {
      this.bounce = Math.max(0, this.bounce - dt * 4);
    }
  }

  draw(ctx, eggCount) {
    const sc = window.__spriteCache;
    if (!sc || !sc.ready) return;

    const bounceOffset = Math.sin(this.bounce * Math.PI) * -8;
    ctx.save();
    ctx.translate(this.x, this.y + bounceOffset);

    const w = this.w;
    const h = this.h;
    const halfW = w / 2;

    // Draw cached basket sprite
    sc.draw(ctx, 'basket-empty', 0, 0);

    // Dynamic eggs inside basket
    const showCount = Math.min(15, eggCount);
    if (showCount > 0) {
      const eggColors = ['#FFF8DC', '#FFEFD5', '#FFDAB9', '#FFE4C4', '#FFF5EE'];
      const cols = 5;
      const eggW = 10;
      const eggH = 13;
      const startX = -cols * eggW + eggW;
      const startY = -h * 0.15;

      for (let i = 0; i < showCount; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const ex = startX + col * (eggW * 2.2) + (row % 2 ? eggW * 0.8 : 0);
        const ey = startY + row * (eggH * 1.1);

        ctx.beginPath();
        ctx.ellipse(ex, ey, eggW * 0.8, eggH * 0.8, 0, 0, Math.PI * 2);
        const eggGrad = ctx.createRadialGradient(ex - 2, ey - 3, 1, ex, ey, eggW);
        eggGrad.addColorStop(0, '#FFFFFF');
        eggGrad.addColorStop(1, eggColors[i % eggColors.length]);
        ctx.fillStyle = eggGrad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(180,150,100,0.3)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }

    // Counter badge
    if (eggCount > 0) {
      const badgeX = halfW - 5;
      const badgeY = -h * 0.55;
      const badgeR = 22;

      ctx.beginPath();
      ctx.arc(badgeX + 1, badgeY + 2, badgeR, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
      const badgeGrad = ctx.createRadialGradient(badgeX - 3, badgeY - 4, 2, badgeX, badgeY, badgeR);
      badgeGrad.addColorStop(0, '#FF6666');
      badgeGrad.addColorStop(1, '#CC0000');
      ctx.fillStyle = badgeGrad;
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(badgeX - 5, badgeY - 7, 6, 4, -0.3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'Bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(eggCount), badgeX, badgeY + 1);
    }

    ctx.restore();
  }
}
