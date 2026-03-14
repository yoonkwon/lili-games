/**
 * Born scene - baby is born! Happy ending
 */
import { drawElsaMom, drawBabyElsa } from '../draw-elsa.js';

export class BornScene {
  constructor(w, h, stats) {
    this.w = w;
    this.h = h;
    this.stats = stats;
    this.phase = 0;

    // Celebration particles
    this.hearts = [];
    for (let i = 0; i < 25; i++) {
      this.hearts.push({
        x: Math.random() * w,
        y: h + 20 + Math.random() * 200,
        vy: -(40 + Math.random() * 60),
        vx: (Math.random() - 0.5) * 30,
        size: 14 + Math.random() * 14,
        emoji: ['💕', '❤️', '💖', '✨', '🌟', '❄️'][Math.floor(Math.random() * 6)],
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  handleTap(x, y) {
    if (this.phase < 4) return null;
    const btnW = 220;
    const btnH = 55;
    const btnX = (this.w - btnW) / 2;
    const btnY = this.h * 0.82;
    if (x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH) {
      return 'restart';
    }
    return null;
  }

  update(dt) {
    this.phase += dt;
    for (const h of this.hearts) {
      h.y += h.vy * dt;
      h.x += h.vx * dt;
      h.phase += dt * 2;
      if (h.y < -30) {
        h.y = this.h + 20;
        h.x = Math.random() * this.w;
      }
    }
  }

  draw(ctx, w, h) {
    this.w = w;
    this.h = h;

    // Background - warm gradient
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#1a1a3e');
    grad.addColorStop(0.3, '#2a3a6e');
    grad.addColorStop(0.7, '#4a2a5e');
    grad.addColorStop(1, '#FF69B4');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Floating hearts
    for (const heart of this.hearts) {
      ctx.save();
      ctx.globalAlpha = 0.5 + Math.sin(heart.phase) * 0.3;
      ctx.font = `${heart.size}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(heart.emoji, heart.x, heart.y);
      ctx.restore();
    }

    // Phase 1: Light appears
    if (this.phase > 0.5) {
      const lightAlpha = Math.min(0.3, (this.phase - 0.5) * 0.15);
      const lightGrad = ctx.createRadialGradient(w / 2, h * 0.35, 0, w / 2, h * 0.35, 200);
      lightGrad.addColorStop(0, `rgba(255,255,255,${lightAlpha})`);
      lightGrad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = lightGrad;
      ctx.fillRect(0, 0, w, h);
    }

    // Phase 2: Mom and baby together
    if (this.phase > 1.5) {
      const alpha = Math.min(1, (this.phase - 1.5) * 1.5);
      ctx.save();
      ctx.globalAlpha = alpha;

      const centerY = h * 0.3;

      // Mom Elsa
      drawElsaMom(ctx, w / 2, centerY, 1.2);

      // Baby in arms
      const babyBob = Math.sin(this.phase * 1.5) * 3;
      drawBabyElsa(ctx, w / 2, centerY + 75 + babyBob, 22, 'happy', this.phase, 1.0);

      // Heart between them
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('💕', w / 2, centerY + 55);

      ctx.restore();
    }

    // Phase 3: Text
    if (this.phase > 2.5) {
      const textAlpha = Math.min(1, (this.phase - 2.5) * 1.5);
      ctx.save();
      ctx.globalAlpha = textAlpha;

      ctx.font = 'Bold 36px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.shadowColor = '#FF69B4';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#FFF';
      ctx.fillText('🎉 아기가 태어났어요! 🎉', w / 2, h * 0.52);
      ctx.shadowBlur = 0;

      ctx.font = '20px sans-serif';
      ctx.fillStyle = '#FFB6C1';
      ctx.fillText('엄마 품에서 행복해하고 있어요 💕', w / 2, h * 0.58);
      ctx.restore();
    }

    // Phase 4: Stats
    if (this.phase > 3.5) {
      const statsAlpha = Math.min(1, (this.phase - 3.5));
      ctx.save();
      ctx.globalAlpha = statsAlpha;

      ctx.font = '18px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#E1F5FE';

      const statsY = h * 0.65;
      ctx.fillText(`🍽️ 총 ${this.stats.totalFed}번 먹었어요`, w / 2, statsY);
      ctx.fillText(`✅ 정확도: ${this.stats.accuracy}%`, w / 2, statsY + 28);
      ctx.fillText(`💕 사랑으로 키웠어요!`, w / 2, statsY + 56);

      ctx.restore();
    }

    // Restart button
    if (this.phase > 4) {
      const btnW = 220;
      const btnH = 55;
      const btnX = (w - btnW) / 2;
      const btnY = h * 0.82;

      ctx.save();
      const pulse = 1 + Math.sin(this.phase * 3) * 0.02;
      ctx.translate(w / 2, btnY + btnH / 2);
      ctx.scale(pulse, pulse);
      ctx.translate(-w / 2, -(btnY + btnH / 2));

      const btnGrad = ctx.createLinearGradient(btnX, btnY, btnX, btnY + btnH);
      btnGrad.addColorStop(0, '#FF69B4');
      btnGrad.addColorStop(1, '#E91E63');
      ctx.fillStyle = btnGrad;
      ctx.beginPath();
      ctx.roundRect(btnX, btnY, btnW, btnH, 18);
      ctx.fill();

      ctx.font = 'Bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFF';
      ctx.fillText('다시 하기 💕', w / 2, btnY + btnH / 2);
      ctx.restore();
    }
  }
}
