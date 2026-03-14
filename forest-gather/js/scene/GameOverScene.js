/**
 * Game over scene - time's up
 */
export class GameOverScene {
  constructor(w, h, stats) {
    this.w = w;
    this.h = h;
    this.stats = stats;
    this.phase = 0;
  }

  handleTap(x, y) {
    if (this.phase < 1) return null;

    const btnW = 220;
    const btnH = 55;
    const btnX = (this.w - btnW) / 2;
    const btnY = this.h * 0.72;

    if (x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH) {
      return 'restart';
    }
    return null;
  }

  update(dt) {
    this.phase += dt;
  }

  draw(ctx, w, h) {
    this.w = w;
    this.h = h;

    // Background
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#1a1a2e');
    grad.addColorStop(1, '#16213e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Sad character
    const charAlpha = Math.min(1, this.phase * 2);
    ctx.save();
    ctx.globalAlpha = charAlpha;
    ctx.font = '60px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('😢', w / 2, h * 0.18);
    ctx.restore();

    // Title
    ctx.font = 'Bold 36px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFB3B3';
    ctx.fillText('시간 초과!', w / 2, h * 0.28);

    // Encouragement
    ctx.font = '18px sans-serif';
    ctx.fillStyle = '#B0BEC5';
    ctx.fillText('다음엔 더 많이 모을 수 있어!', w / 2, h * 0.34);

    // Stats
    if (this.phase > 0.5) {
      ctx.font = '22px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
      ctx.fillStyle = '#FFF';
      const statsY = h * 0.44;

      ctx.fillText(`📍 도달 라운드: ${this.stats.round}`, w / 2, statsY);
      ctx.fillText(`🧺 총 수집: ${this.stats.totalCollected}개`, w / 2, statsY + 35);
      ctx.fillText(`🏆 점수: ${this.stats.score}`, w / 2, statsY + 70);

      // Rarity breakdown
      const rc = this.stats.rarityCount;
      ctx.font = '16px sans-serif';
      ctx.fillStyle = '#90CAF9';
      ctx.fillText(
        `⚪${rc.common} 🟡${rc.shiny} 🟣${rc.rare} 🌈${rc.legendary}`,
        w / 2, statsY + 105
      );

      if (this.stats.companions) {
        ctx.fillText(`동료: ${this.stats.companions}`, w / 2, statsY + 135);
      }
    }

    // Restart button
    if (this.phase > 1) {
      const btnW = 220;
      const btnH = 55;
      const btnX = (w - btnW) / 2;
      const btnY = h * 0.72;

      const pulse = 1 + Math.sin(this.phase * 4) * 0.02;
      ctx.save();
      ctx.translate(w / 2, btnY + btnH / 2);
      ctx.scale(pulse, pulse);
      ctx.translate(-w / 2, -(btnY + btnH / 2));

      const btnGrad = ctx.createLinearGradient(btnX, btnY, btnX, btnY + btnH);
      btnGrad.addColorStop(0, '#FF7043');
      btnGrad.addColorStop(1, '#E64A19');
      ctx.fillStyle = btnGrad;
      ctx.beginPath();
      ctx.roundRect(btnX, btnY, btnW, btnH, 18);
      ctx.fill();

      ctx.font = 'Bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFF';
      ctx.fillText('다시 도전! 🔄', w / 2, btnY + btnH / 2);
      ctx.restore();
    }
  }
}
