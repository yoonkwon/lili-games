/**
 * Animated gauge/progress bar with segments
 * Reusable across all games
 */
export class Gauge {
  constructor(max = 8, options = {}) {
    this.gauge = 0;
    this.max = max;
    this.anim = 0;
    this._fullFlash = 0;
    this._colors = options.colors || {
      low: ['#FFD700', '#FF8C00'],
      mid: ['#FF8C00', '#FF4444'],
      high: ['#FF4444', '#CC0000'],
    };
    this._icon = options.icon || null; // { draw: (ctx, x, y, ratio) => void }
  }

  pump() {
    this.gauge = Math.min(this.max, this.gauge + 1);
    this.anim = 1;
    if (this.gauge >= this.max) {
      this._fullFlash = 0.25;
      this.gauge = 0;
      return true;
    }
    return false;
  }

  update(dt) {
    this.anim = Math.max(0, this.anim - dt * 3);
    if (this._fullFlash > 0) {
      this._fullFlash = Math.max(0, this._fullFlash - dt);
    }
  }

  draw(ctx, canvasWidth, safeTop = 0) {
    const w = Math.min(350, canvasWidth - 80);
    const h = 40;
    const x = (canvasWidth - w) / 2;
    const pulseY = Math.sin(this.anim * Math.PI) * 3;
    const y = safeTop + 25 + pulseY;
    const r = 20;
    const displayRatio = this._fullFlash > 0 ? 1 : this.gauge / this.max;
    const ratio = displayRatio;

    ctx.save();

    // Full flash glow
    if (this._fullFlash > 0) {
      const flashAlpha = this._fullFlash / 0.25;
      ctx.fillStyle = `rgba(255,215,0,${0.4 * flashAlpha})`;
      ctx.beginPath();
      ctx.roundRect(x - 6, y - 6, w + 12, h + 12, r + 6);
      ctx.fill();
    }

    // Background
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();

    // Empty fill
    const pad = 4;
    const innerW = w - pad * 2;
    const innerH = h - pad * 2;
    const innerX = x + pad;
    const innerY = y + pad;
    const innerR = r - pad;

    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.roundRect(innerX, innerY, innerW, innerH, innerR);
    ctx.fill();

    // Filled portion
    if (ratio > 0) {
      const fillW = innerW * ratio;
      const grad = ctx.createLinearGradient(innerX, 0, innerX + fillW, 0);
      const colors = ratio < 0.5 ? this._colors.low :
                     ratio < 0.85 ? this._colors.mid : this._colors.high;
      grad.addColorStop(0, colors[0]);
      grad.addColorStop(1, colors[1]);

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(innerX, innerY, fillW, innerH, [innerR, ratio >= 0.95 ? innerR : 0, ratio >= 0.95 ? innerR : 0, innerR]);
      ctx.clip();

      ctx.fillStyle = grad;
      ctx.fill();

      const shineH = innerH * 0.35;
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fillRect(innerX, innerY, fillW, shineH);

      ctx.restore();
    }

    // Tick marks
    for (let i = 1; i < this.max; i++) {
      const tickX = innerX + (innerW * i) / this.max;
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(tickX, innerY + 2);
      ctx.lineTo(tickX, innerY + innerH - 2);
      ctx.stroke();
    }

    // Icon at right end (default: egg)
    if (this._icon) {
      this._icon.draw(ctx, x + w - 20, y + h / 2, ratio);
    } else {
      this._drawDefaultIcon(ctx, x + w - 20, y + h / 2, ratio);
    }

    // Number display
    const displayGauge = this._fullFlash > 0 ? this.max : Math.round(this.gauge);
    const text = `${displayGauge} / ${this.max}`;
    ctx.font = 'Bold 32px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const textX = x + w / 2;
    const textY = y + h / 2;

    ctx.strokeStyle = 'rgba(0,0,0,0.7)';
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.strokeText(text, textX, textY);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(text, textX, textY);

    ctx.restore();
  }

  _drawDefaultIcon(ctx, x, y, ratio) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(x, y, 10, 13, 0, 0, Math.PI * 2);
    if (ratio >= 0.85) {
      ctx.fillStyle = '#FFD700';
      ctx.fill();
      ctx.strokeStyle = '#E8A317';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else {
      ctx.fillStyle = '#FFFDF0';
      ctx.fill();
      ctx.strokeStyle = '#DDD';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();
  }

  getHeight() {
    return 40;
  }
}
