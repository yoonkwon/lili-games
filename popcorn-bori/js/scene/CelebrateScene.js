/**
 * Celebration scene - 보리 배 다 채웠어요!
 */
import { drawBori } from '../draw-bori.js';
import { drawPopcorn } from '../draw-machine.js';
import { RAINBOW } from '../config.js';

export class CelebrateScene {
  constructor(w, h, stats) {
    this.w = w;
    this.h = h;
    this.stats = stats;
    this.phase = 0;

    // Confetti popcorns shooting from sides
    this.confetti = [];
    for (let i = 0; i < 50; i++) {
      this.confetti.push({
        x: Math.random() * w,
        y: h + 20 + Math.random() * 200,
        vy: -(80 + Math.random() * 100),
        vx: (Math.random() - 0.5) * 60,
        size: 12 + Math.random() * 12,
        color: RAINBOW[Math.floor(Math.random() * RAINBOW.length)],
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 5,
      });
    }
  }

  handleTap(x, y) {
    if (this.phase < 1.8) return null;

    const btnW = 240;
    const btnH = 60;
    const btnX = (this.w - btnW) / 2;
    const btnY1 = this.h * 0.74;
    const btnY2 = btnY1 + btnH + 12;

    if (x >= btnX && x <= btnX + btnW && y >= btnY1 && y <= btnY1 + btnH) {
      return 'restart';
    }
    if (x >= btnX && x <= btnX + btnW && y >= btnY2 && y <= btnY2 + 50) {
      return 'home';
    }
    return null;
  }

  update(dt) {
    this.phase += dt;
    for (const c of this.confetti) {
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      c.vy += 80 * dt;
      c.rot += c.rotSpeed * dt;
      if (c.y > this.h + 30) {
        c.y = -30;
        c.vy = 80 + Math.random() * 100;
        c.x = Math.random() * this.w;
      }
    }
  }

  draw(ctx, w, h) {
    this.w = w;
    this.h = h;

    // Background
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#7A3A14');
    g.addColorStop(0.6, '#C9582E');
    g.addColorStop(1, '#FFD93D');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Confetti popcorns
    for (const c of this.confetti) {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);
      drawPopcorn(ctx, 0, 0, c.size, c.color, c.color);
      ctx.restore();
    }

    // Bori jumping with joy
    if (this.phase > 0.3) {
      const alpha = Math.min(1, (this.phase - 0.3) * 2);
      ctx.save();
      ctx.globalAlpha = alpha;
      const jump = Math.abs(Math.sin(this.phase * 4)) * 18;
      const scale = Math.min(1.2, w / 500);
      drawBori(ctx, w / 2, h * 0.34 - jump, scale, {
        mouthOpen: Math.floor(this.phase * 6) % 2 === 0,
        happy: true,
        phase: this.phase,
      });
      ctx.restore();
    }

    // Title
    if (this.phase > 0.8) {
      const alpha = Math.min(1, (this.phase - 0.8) * 1.5);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `Bold ${Math.min(40, w * 0.09)}px "Apple SD Gothic Neo", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#FFF';
      ctx.fillText('🎉 다 만들었어요! 🎉', w / 2, h * 0.52);

      ctx.font = `${Math.min(18, w * 0.045)}px "Apple SD Gothic Neo", sans-serif`;
      ctx.shadowBlur = 6;
      ctx.fillStyle = '#FFEFC2';
      ctx.fillText('보리가 행복해요 💕', w / 2, h * 0.59);

      ctx.shadowBlur = 0;
      ctx.font = `Bold ${Math.min(16, w * 0.04)}px "Apple SD Gothic Neo", sans-serif`;
      ctx.fillStyle = '#FFD93D';
      ctx.fillText(`🍿 팝콘 ${this.stats.popcornsMade}개 만들었어요!`, w / 2, h * 0.65);
      ctx.restore();
    }

    // Buttons
    if (this.phase > 1.8) {
      const btnW = 240;
      const btnH = 60;
      const btnX = (w - btnW) / 2;
      const btnY1 = h * 0.74;
      const pulse = 1 + Math.sin(this.phase * 4) * 0.03;

      ctx.save();
      ctx.translate(w / 2, btnY1 + btnH / 2);
      ctx.scale(pulse, pulse);
      ctx.translate(-w / 2, -(btnY1 + btnH / 2));

      const grad = ctx.createLinearGradient(btnX, btnY1, btnX, btnY1 + btnH);
      grad.addColorStop(0, '#FFD93D');
      grad.addColorStop(1, '#FF8C00');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(btnX, btnY1, btnW, btnH, 22);
      ctx.fill();
      ctx.strokeStyle = '#7A3A14';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.font = 'Bold 22px "Apple SD Gothic Neo", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#5A2A0A';
      ctx.fillText('또 만들기 🍿', w / 2, btnY1 + btnH / 2);
      ctx.restore();

      // Home button
      const btnY2 = btnY1 + btnH + 12;
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.beginPath();
      ctx.roundRect(btnX, btnY2, btnW, 50, 18);
      ctx.fill();
      ctx.font = 'Bold 18px "Apple SD Gothic Neo", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillText('🏠 다른 게임하기', w / 2, btnY2 + 25);
    }
  }
}
