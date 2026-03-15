/**
 * Born scene - baby mermaid is born! Happy ending
 * Shows total babies born count (persisted in localStorage)
 * Ocean celebration theme
 */
import { drawMermaidMom, drawBabyMermaid } from '../draw-mermaid.js';

const STORAGE_KEY = 'mermaid-baby-born-count';

function getBornCount() {
  try { return parseInt(localStorage.getItem(STORAGE_KEY)) || 0; } catch { return 0; }
}

function incrementBornCount() {
  const count = getBornCount() + 1;
  try { localStorage.setItem(STORAGE_KEY, count); } catch { /* noop */ }
  return count;
}

export class BornScene {
  constructor(w, h, stats) {
    this.w = w;
    this.h = h;
    this.stats = stats;
    this.phase = 0;

    // Increment and store born count
    this.babyCount = incrementBornCount();

    // Celebration particles - ocean theme
    this.floaters = [];
    for (let i = 0; i < 25; i++) {
      this.floaters.push({
        x: Math.random() * w,
        y: h + 20 + Math.random() * 200,
        vy: -(40 + Math.random() * 60),
        vx: (Math.random() - 0.5) * 30,
        size: 14 + Math.random() * 14,
        emoji: ['🫧', '🐚', '⭐', '🌊', '✨', '🐠'][Math.floor(Math.random() * 6)],
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  handleTap(x, y) {
    if (this.phase < 4) return null;
    const btnW = 220;
    const btnH = 55;
    const btnX = (this.w - btnW) / 2;
    const btnY = this.h * 0.78;
    if (x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH) {
      return 'restart';
    }
    const hY = btnY + btnH + 12;
    const hH = 45;
    if (x >= btnX && x <= btnX + btnW && y >= hY && y <= hY + hH) {
      return 'home';
    }
    return null;
  }

  update(dt) {
    this.phase += dt;
    for (const f of this.floaters) {
      f.y += f.vy * dt;
      f.x += f.vx * dt;
      f.phase += dt * 2;
      if (f.y < -30) {
        f.y = this.h + 20;
        f.x = Math.random() * this.w;
      }
    }
  }

  draw(ctx, w, h) {
    this.w = w;
    this.h = h;

    // Background - deep ocean to bright ocean gradient
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#1a1a2e');
    grad.addColorStop(0.3, '#1a3a5a');
    grad.addColorStop(0.6, '#26C6DA');
    grad.addColorStop(0.85, '#4FC3F7');
    grad.addColorStop(1, '#81D4FA');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Floating celebration items
    for (const f of this.floaters) {
      ctx.save();
      ctx.globalAlpha = 0.5 + Math.sin(f.phase) * 0.3;
      ctx.font = `${f.size}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(f.emoji, f.x, f.y);
      ctx.restore();
    }

    // Phase 1: Light appears (cyan/blue glow)
    if (this.phase > 0.5) {
      const lightAlpha = Math.min(0.3, (this.phase - 0.5) * 0.15);
      const lightGrad = ctx.createRadialGradient(w / 2, h * 0.3, 0, w / 2, h * 0.3, 200);
      lightGrad.addColorStop(0, `rgba(0,230,255,${lightAlpha})`);
      lightGrad.addColorStop(1, 'rgba(0,230,255,0)');
      ctx.fillStyle = lightGrad;
      ctx.fillRect(0, 0, w, h);
    }

    // Phase 2: Mom and baby together
    if (this.phase > 1.5) {
      const alpha = Math.min(1, (this.phase - 1.5) * 1.5);
      ctx.save();
      ctx.globalAlpha = alpha;

      const centerY = h * 0.25;

      drawMermaidMom(ctx, w / 2, centerY, 1.2);

      const babyBob = Math.sin(this.phase * 1.5) * 3;
      drawBabyMermaid(ctx, w / 2, centerY + 75 + babyBob, 22, 'happy', this.phase, 1.0);

      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🫧', w / 2, centerY + 55);

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

      ctx.shadowColor = '#0097A7';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#FFF';
      ctx.fillText('🎉 아기가 태어났어요! 🎉', w / 2, h * 0.48);
      ctx.shadowBlur = 0;

      ctx.font = '20px sans-serif';
      ctx.fillStyle = '#E0F7FA';
      ctx.fillText('바다 친구들이 축하해요 🫧', w / 2, h * 0.54);
      ctx.restore();
    }

    // Phase 4: Stats + baby count
    if (this.phase > 3.5) {
      const statsAlpha = Math.min(1, (this.phase - 3.5));
      ctx.save();
      ctx.globalAlpha = statsAlpha;

      const statsY = h * 0.60;

      // Baby count badge (teal tones)
      ctx.fillStyle = 'rgba(0, 188, 212, 0.2)';
      ctx.beginPath();
      ctx.roundRect(w / 2 - 100, statsY - 24, 200, 40, 20);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 188, 212, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = 'Bold 20px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFD700';
      ctx.fillText(`👶 ${this.babyCount}번째 아기! 👶`, w / 2, statsY);

      // Stats
      ctx.font = '16px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
      ctx.fillStyle = '#E0F7FA';

      const detailY = statsY + 36;
      ctx.fillText(`🍽️ 총 ${this.stats.totalFed}번 먹었어요`, w / 2, detailY);
      ctx.fillText(`✅ 정확도: ${this.stats.accuracy}%`, w / 2, detailY + 26);
      ctx.fillText(`🫧 사랑으로 키웠어요!`, w / 2, detailY + 52);

      ctx.restore();
    }

    // Buttons
    if (this.phase > 4) {
      const btnW = 220;
      const btnH = 55;
      const btnX = (w - btnW) / 2;
      const btnY = h * 0.78;

      ctx.save();
      const pulse = 1 + Math.sin(this.phase * 3) * 0.02;
      ctx.translate(w / 2, btnY + btnH / 2);
      ctx.scale(pulse, pulse);
      ctx.translate(-w / 2, -(btnY + btnH / 2));

      const btnGrad = ctx.createLinearGradient(btnX, btnY, btnX, btnY + btnH);
      btnGrad.addColorStop(0, '#26C6DA');
      btnGrad.addColorStop(1, '#00838F');
      ctx.fillStyle = btnGrad;
      ctx.beginPath();
      ctx.roundRect(btnX, btnY, btnW, btnH, 18);
      ctx.fill();

      ctx.font = 'Bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFF';
      ctx.fillText('다시 하기 🌊', w / 2, btnY + btnH / 2);
      ctx.restore();

      // "다른 게임하기" button
      const hY = btnY + btnH + 12;
      const hH = 45;
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.roundRect(btnX, hY, btnW, hH, 16);
      ctx.fill();

      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = 'Bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🏠 다른 게임하기', w / 2, hY + hH / 2);
    }
  }
}
