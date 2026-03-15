/**
 * Round clear celebration scene
 */
export class RoundClearScene {
  constructor(w, h, stats, nextRound) {
    this.w = w;
    this.h = h;
    this.stats = stats;
    this.nextRound = nextRound;
    this.phase = 0;

    // Stars based on remaining time (speed/efficiency)
    const timeLeft = stats.timer || 0;
    this.stars = timeLeft >= 40 ? 3 : timeLeft >= 20 ? 2 : 1;

    // Celebration particles
    this.confetti = [];
    for (let i = 0; i < 30; i++) {
      this.confetti.push({
        x: Math.random() * w,
        y: -20 - Math.random() * 200,
        vy: 80 + Math.random() * 60,
        vx: (Math.random() - 0.5) * 40,
        color: ['#FFD700', '#FF69B4', '#4CAF50', '#2196F3', '#FF9800'][Math.floor(Math.random() * 5)],
        size: 4 + Math.random() * 4,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 8,
      });
    }
  }

  handleTap(x, y) {
    if (this.phase < 1.5) return null;

    // Continue button
    const btnW = 220;
    const btnH = 55;
    const btnX = (this.w - btnW) / 2;
    const btnY = this.h * 0.75;

    if (x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH) {
      return 'continue';
    }
    return null;
  }

  update(dt) {
    this.phase += dt;

    for (const c of this.confetti) {
      c.y += c.vy * dt;
      c.x += c.vx * dt;
      c.rotation += c.rotSpeed * dt;
      if (c.y > this.h + 20) {
        c.y = -20;
        c.x = Math.random() * this.w;
      }
    }
  }

  draw(ctx, w, h) {
    this.w = w;
    this.h = h;

    // Background
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#1a472a');
    grad.addColorStop(1, '#2e7d32');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Confetti
    for (const c of this.confetti) {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rotation);
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size);
      ctx.restore();
    }

    // Title
    const titleAlpha = Math.min(1, this.phase * 2);
    ctx.save();
    ctx.globalAlpha = titleAlpha;
    ctx.font = 'Bold 40px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFD700';
    ctx.fillText('🎉 라운드 클리어! 🎉', w / 2, h * 0.15);
    ctx.restore();

    // Stars
    if (this.phase > 0.5) {
      const starY = h * 0.25;
      ctx.font = '40px sans-serif';
      ctx.textAlign = 'center';
      for (let i = 0; i < 3; i++) {
        const delay = 0.5 + i * 0.3;
        if (this.phase > delay) {
          const scale = Math.min(1, (this.phase - delay) * 3);
          ctx.save();
          ctx.translate(w / 2 + (i - 1) * 50, starY);
          ctx.scale(scale, scale);
          ctx.globalAlpha = i < this.stars ? 1 : 0.2;
          ctx.fillText('⭐', 0, 0);
          ctx.restore();
        }
      }
    }

    // Stats
    if (this.phase > 1) {
      ctx.font = '22px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFF';
      const statsY = h * 0.38;
      ctx.fillText(`🧺 수집: ${this.stats.totalCollected}개`, w / 2, statsY);
      ctx.fillText(`🏆 점수: ${this.stats.score}`, w / 2, statsY + 35);
      if (this.stats.maxCombo >= 3) {
        ctx.fillStyle = '#FFD700';
        ctx.fillText(`x${this.stats.maxCombo} 최대 콤보!`, w / 2, statsY + 70);
        ctx.fillStyle = '#FFF';
      }
      ctx.fillText(`📍 라운드 ${this.stats.round}`, w / 2, statsY + 105);
    }

    // Companion info
    if (this.stats.companions && this.phase > 1.5) {
      const compY = h * 0.6;
      ctx.save();
      ctx.globalAlpha = Math.min(1, (this.phase - 1.5) * 2);
      ctx.font = '18px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#C8E6C9';
      ctx.fillText(`동료: ${this.stats.companions}`, w / 2, compY);
      ctx.restore();
    }

    // Continue button
    if (this.phase > 1.5) {
      const btnW = 220;
      const btnH = 55;
      const btnX = (w - btnW) / 2;
      const btnY = h * 0.75;

      const pulse = 1 + Math.sin(this.phase * 4) * 0.02;
      ctx.save();
      ctx.translate(w / 2, btnY + btnH / 2);
      ctx.scale(pulse, pulse);
      ctx.translate(-w / 2, -(btnY + btnH / 2));

      const btnGrad = ctx.createLinearGradient(btnX, btnY, btnX, btnY + btnH);
      btnGrad.addColorStop(0, '#4CAF50');
      btnGrad.addColorStop(1, '#388E3C');
      ctx.fillStyle = btnGrad;
      ctx.beginPath();
      ctx.roundRect(btnX, btnY, btnW, btnH, 18);
      ctx.fill();

      ctx.font = 'Bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFF';
      ctx.fillText('다음 라운드! ▶', w / 2, btnY + btnH / 2);
      ctx.restore();
    }
  }
}
