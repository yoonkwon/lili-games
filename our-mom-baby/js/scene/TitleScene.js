/**
 * Title scene - Our Mom Baby game
 * Select which baby to raise: Ria or Lisa
 */
import { drawMom, drawBaby, drawFairyLisa, drawChildRia } from '../draw-mom.js';
import { SaveManager } from '../../../shared/SaveManager.js';

export class TitleScene {
  constructor() {
    this.phase = 0;
    this.savedDataRia = new SaveManager('our-mom-ria-save').load();
    this.savedDataLisa = new SaveManager('our-mom-lisa-save').load();

    this.hearts = [];
    for (let i = 0; i < 20; i++) {
      this.hearts.push({
        x: Math.random(), y: Math.random(),
        speed: 0.01 + Math.random() * 0.02,
        size: 10 + Math.random() * 12,
        wobble: Math.random() * Math.PI * 2,
        emoji: ['💕', '✨', '🌸', '💗'][Math.floor(Math.random() * 4)],
      });
    }
  }

  handleTap(x, y, w, h) {
    const cardW = Math.min(160, w * 0.4);
    const cardH = 200;
    const gap = 16;
    const totalW = cardW * 2 + gap;
    const startX = (w - totalW) / 2;
    const cardY = h * 0.48;

    // Ria card
    if (x >= startX && x <= startX + cardW && y >= cardY && y <= cardY + cardH) {
      return 'select-ria';
    }
    // Lisa card
    if (x >= startX + cardW + gap && x <= startX + totalW && y >= cardY && y <= cardY + cardH) {
      return 'select-lisa';
    }
    return null;
  }

  update(dt) { this.phase += dt; }

  draw(ctx, w, h) {
    // Background
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#2a1a3a');
    grad.addColorStop(0.4, '#4a2a5a');
    grad.addColorStop(0.7, '#6a3a5a');
    grad.addColorStop(1, '#FFB6C1');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Hearts
    for (const s of this.hearts) {
      const sy = (s.y - this.phase * s.speed) % 1.1;
      const sx = s.x + Math.sin(this.phase * 1.5 + s.wobble) * 0.03;
      ctx.save();
      ctx.globalAlpha = 0.25 + Math.sin(this.phase * 2 + s.wobble) * 0.15;
      ctx.font = `${s.size}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(s.emoji, sx * w, (sy < 0 ? sy + 1.1 : sy) * h);
      ctx.restore();
    }

    // Mom
    const momY = h * 0.12;
    const bounce = Math.sin(this.phase * 1.5) * 5;
    drawMom(ctx, w / 2, momY + bounce, 1.3);

    // Sparkles
    for (let i = 0; i < 5; i++) {
      const a = this.phase * 1.5 + (i / 5) * Math.PI * 2;
      const r = 55 + Math.sin(this.phase * 2 + i) * 5;
      ctx.save();
      ctx.globalAlpha = 0.5 + Math.sin(this.phase * 3 + i) * 0.3;
      ctx.font = '18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✨', w / 2 + Math.cos(a) * r, momY + Math.sin(a) * r);
      ctx.restore();
    }

    // Title
    ctx.save();
    ctx.font = 'Bold 34px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const titleY = h * 0.34;
    ctx.shadowColor = '#FF69B4';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#FFF';
    ctx.fillText('💕 우리엄마 아기낳기 💕', w / 2, titleY);
    ctx.shadowBlur = 0;
    ctx.font = '15px sans-serif';
    ctx.fillStyle = '#FFB6C1';
    ctx.fillText('누구를 키울까요?', w / 2, titleY + 32);
    ctx.restore();

    // Selection cards
    const cardW = Math.min(160, w * 0.4);
    const cardH = 200;
    const gap = 16;
    const totalW = cardW * 2 + gap;
    const startX = (w - totalW) / 2;
    const cardY = h * 0.48;

    this._drawCard(ctx, startX, cardY, cardW, cardH, 'ria', this.savedDataRia);
    this._drawCard(ctx, startX + cardW + gap, cardY, cardW, cardH, 'lisa', this.savedDataLisa);

    // Footer
    ctx.font = '13px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.textAlign = 'center';
    ctx.fillText('건강한 음식 버블을 터치! 세균을 조심하세요!', w / 2, h * 0.93);
  }

  _drawCard(ctx, x, y, w, h, mode, savedData) {
    const pulse = 1 + Math.sin(this.phase * 3 + (mode === 'lisa' ? 1 : 0)) * 0.02;
    const cx = x + w / 2;
    const cy = y + h / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(pulse, pulse);
    ctx.translate(-cx, -cy);

    // Card bg
    const isRia = mode === 'ria';
    const cardGrad = ctx.createLinearGradient(x, y, x, y + h);
    cardGrad.addColorStop(0, isRia ? 'rgba(76,175,80,0.3)' : 'rgba(255,105,180,0.3)');
    cardGrad.addColorStop(1, isRia ? 'rgba(46,125,50,0.2)' : 'rgba(233,30,99,0.2)');
    ctx.fillStyle = cardGrad;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 20);
    ctx.fill();
    ctx.strokeStyle = isRia ? 'rgba(76,175,80,0.5)' : 'rgba(255,105,180,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Baby preview
    const babyY = y + 60;
    ctx.fillStyle = isRia ? 'rgba(76,175,80,0.15)' : 'rgba(255,105,180,0.15)';
    ctx.beginPath();
    ctx.arc(cx, babyY, 35, 0, Math.PI * 2);
    ctx.fill();
    drawBaby(ctx, cx, babyY, 20, 'neutral', this.phase, 0.3, mode);

    // Helper preview
    if (isRia) {
      ctx.globalAlpha = 0.5;
      drawFairyLisa(ctx, cx + 30, babyY - 25, 30);
      ctx.globalAlpha = 1;
    } else {
      ctx.globalAlpha = 0.5;
      drawChildRia(ctx, cx + 30, babyY + 15, 28);
      ctx.globalAlpha = 1;
    }

    // Name
    ctx.font = 'Bold 22px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFF';
    ctx.fillText(isRia ? '🌿 리아' : '🎀 리사', cx, y + 115);

    // Description
    ctx.font = '12px sans-serif';
    ctx.fillStyle = isRia ? '#A5D6A7' : '#F8BBD0';
    ctx.fillText(isRia ? '요정 리사가 응원해요' : '언니 리아가 도와줘요', cx, y + 138);

    // Continue or start
    if (savedData) {
      const pct = Math.round(savedData.growth || 0);
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.roundRect(x + 10, y + h - 55, w - 20, 22, 8);
      ctx.fill();
      ctx.font = 'Bold 11px sans-serif';
      ctx.fillStyle = '#FFD700';
      ctx.fillText(`▶ 이어하기 (${pct}%)`, cx, y + h - 40);

      ctx.fillStyle = isRia ? '#4CAF50' : '#FF69B4';
      ctx.beginPath();
      ctx.roundRect(x + 10, y + h - 28, w - 20, 22, 8);
      ctx.fill();
      ctx.fillStyle = '#FFF';
      ctx.font = 'Bold 11px sans-serif';
      ctx.fillText('새로 시작', cx, y + h - 13);
    } else {
      ctx.fillStyle = isRia ? '#4CAF50' : '#FF69B4';
      ctx.beginPath();
      ctx.roundRect(x + 10, y + h - 40, w - 20, 30, 12);
      ctx.fill();
      ctx.font = 'Bold 15px sans-serif';
      ctx.fillStyle = '#FFF';
      ctx.fillText('시작하기', cx, y + h - 21);
    }
    ctx.restore();
  }
}
