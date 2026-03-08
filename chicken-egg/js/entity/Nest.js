/**
 * Nest entity - cozy nest where the chicken sits and broods eggs
 * Split into drawBack (nest bowl + eggs) and drawFront (front rim over chicken)
 */
export class Nest {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 160;
    this.h = 75;
    this.bounce = 0;
  }

  update(dt) {
    if (this.bounce > 0) {
      this.bounce = Math.max(0, this.bounce - dt * 4);
    }
  }

  // Legacy draw (for compatibility)
  draw(ctx, eggCount) {
    this.drawBack(ctx, eggCount);
    this.drawFront(ctx);
  }

  // Back layer: nest bowl + eggs inside (drawn BEHIND chicken)
  drawBack(ctx, eggCount) {
    const bounceOffset = Math.sin(this.bounce * Math.PI) * -6;
    ctx.save();
    ctx.translate(this.x, this.y + bounceOffset);

    const w = this.w;
    const h = this.h;
    const hw = w / 2;

    // Nest shadow
    ctx.beginPath();
    ctx.ellipse(0, h * 0.35, hw * 0.85, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fill();

    // Nest bowl - back half
    ctx.beginPath();
    ctx.moveTo(-hw, -h * 0.1);
    ctx.quadraticCurveTo(-hw - 8, h * 0.3, -hw * 0.6, h * 0.4);
    ctx.quadraticCurveTo(0, h * 0.55, hw * 0.6, h * 0.4);
    ctx.quadraticCurveTo(hw + 8, h * 0.3, hw, -h * 0.1);
    ctx.closePath();
    const bg = ctx.createLinearGradient(-hw, 0, hw, 0);
    bg.addColorStop(0, '#8B6914');
    bg.addColorStop(0.3, '#A0722A');
    bg.addColorStop(0.5, '#B8860B');
    bg.addColorStop(0.7, '#A0722A');
    bg.addColorStop(1, '#8B6914');
    ctx.fillStyle = bg;
    ctx.fill();

    // Twig texture
    ctx.save();
    ctx.clip();
    ctx.strokeStyle = 'rgba(90,60,10,0.35)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    for (let i = 0; i < 10; i++) {
      const y0 = -h * 0.05 + i * 6;
      ctx.beginPath();
      ctx.moveTo(-hw + 5, y0);
      ctx.quadraticCurveTo(0, y0 + 3 + Math.sin(i) * 3, hw - 5, y0 + 1);
      ctx.stroke();
    }
    ctx.restore();

    // Soft lining inside
    ctx.beginPath();
    ctx.ellipse(0, h * 0.08, hw * 0.7, h * 0.28, 0, 0, Math.PI * 2);
    const inner = ctx.createRadialGradient(0, 0, 5, 0, h * 0.08, hw * 0.65);
    inner.addColorStop(0, '#F5E6C8');
    inner.addColorStop(0.6, '#E8D5A8');
    inner.addColorStop(1, '#C49A3C');
    ctx.fillStyle = inner;
    ctx.fill();

    // Eggs peeking out around chicken
    const showCount = Math.min(12, eggCount);
    if (showCount > 0) {
      const eggColors = ['#FFF8DC', '#FFEFD5', '#FFDAB9', '#FFE4C4', '#FFF5EE'];
      for (let i = 0; i < showCount; i++) {
        // Arrange eggs in a circle around center, peeking from edges
        const angle = (i / Math.max(showCount, 8)) * Math.PI * 2 - Math.PI / 2;
        const rx = hw * 0.45 + (i % 3) * 5;
        const ry = h * 0.15 + (i % 2) * 4;
        const ex = Math.cos(angle) * rx;
        const ey = Math.sin(angle) * ry + h * 0.05;

        ctx.beginPath();
        ctx.ellipse(ex, ey, 7, 9, angle * 0.3, 0, Math.PI * 2);
        const eggGrad = ctx.createRadialGradient(ex - 1, ey - 2, 1, ex, ey, 7);
        eggGrad.addColorStop(0, '#FFFFFF');
        eggGrad.addColorStop(1, eggColors[i % eggColors.length]);
        ctx.fillStyle = eggGrad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(180,150,100,0.25)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }

    // Back rim (behind chicken)
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.1, hw + 2, 13, 0, Math.PI, 0); // top half only
    const rg = ctx.createRadialGradient(0, -h * 0.1, hw * 0.5, 0, -h * 0.1, hw + 4);
    rg.addColorStop(0, '#C49A3C');
    rg.addColorStop(0.5, '#A0722A');
    rg.addColorStop(1, '#7A5518');
    ctx.fillStyle = rg;
    ctx.fill();

    // Scattered straw on back rim
    ctx.strokeStyle = '#C49A3C';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    const twigs = [
      [-hw * 0.6, -h * 0.15, -hw * 0.7, -h * 0.35],
      [-hw * 0.2, -h * 0.15, -hw * 0.15, -h * 0.38],
      [hw * 0.3, -h * 0.14, hw * 0.35, -h * 0.36],
      [hw * 0.6, -h * 0.15, hw * 0.65, -h * 0.32],
    ];
    for (const [x1, y1, x2, y2] of twigs) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Counter badge
    if (eggCount > 0) {
      const badgeX = hw + 10;
      const badgeY = -h * 0.4;
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

  // Front layer: front rim of nest (drawn OVER chicken's bottom)
  drawFront(ctx) {
    const bounceOffset = Math.sin(this.bounce * Math.PI) * -6;
    ctx.save();
    ctx.translate(this.x, this.y + bounceOffset);

    const w = this.w;
    const h = this.h;
    const hw = w / 2;

    // Front rim arc (bottom half of ellipse)
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.1, hw + 2, 13, 0, 0, Math.PI); // bottom half
    const rg = ctx.createRadialGradient(0, -h * 0.1, hw * 0.5, 0, -h * 0.1, hw + 4);
    rg.addColorStop(0, '#D4AA4C');
    rg.addColorStop(0.5, '#B8860B');
    rg.addColorStop(1, '#8B6914');
    ctx.fillStyle = rg;
    ctx.fill();

    // Front straw
    ctx.strokeStyle = '#D4AA4C';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    const straw = [
      [-hw * 0.4, -h * 0.05, -hw * 0.5, h * 0.1],
      [0, -h * 0.03, 5, h * 0.12],
      [hw * 0.4, -h * 0.05, hw * 0.45, h * 0.08],
    ];
    for (const [x1, y1, x2, y2] of straw) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    ctx.restore();
  }
}
