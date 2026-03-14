/**
 * Title scene - Elsa baby game
 */
import { drawElsaMom, drawBabyElsa } from '../draw-elsa.js';

export class TitleScene {
  constructor() {
    this.phase = 0;
    this.snowflakes = [];
    for (let i = 0; i < 30; i++) {
      this.snowflakes.push({
        x: Math.random(),
        y: Math.random(),
        speed: 0.02 + Math.random() * 0.03,
        size: 10 + Math.random() * 15,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 1 + Math.random() * 2,
      });
    }
  }

  handleTap(x, y, w, h) {
    const btnW = Math.min(260, w * 0.65);
    const btnH = 65;
    const btnX = (w - btnW) / 2;
    const btnY = h * 0.72;
    if (x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH) {
      return 'start';
    }
    return null;
  }

  update(dt) {
    this.phase += dt;
  }

  draw(ctx, w, h) {
    // Background - magical blue gradient
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#0d1b3e');
    grad.addColorStop(0.4, '#1a3a5c');
    grad.addColorStop(0.7, '#2a5298');
    grad.addColorStop(1, '#4fc3f7');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Snowflakes
    for (const s of this.snowflakes) {
      const sy = (s.y + this.phase * s.speed) % 1.1 - 0.05;
      const sx = s.x + Math.sin(this.phase * s.wobbleSpeed + s.wobble) * 0.03;
      const alpha = 0.3 + Math.sin(this.phase * 2 + s.wobble) * 0.2;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `${s.size}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('❄️', sx * w, sy * h);
      ctx.restore();
    }

    // Elsa mom
    const elsaY = h * 0.2;
    const bounce = Math.sin(this.phase * 1.5) * 5;
    drawElsaMom(ctx, w / 2, elsaY + bounce, 1.3);

    // Sparkles around
    ctx.font = '20px sans-serif';
    const sparkAngle = this.phase * 1.5;
    for (let i = 0; i < 5; i++) {
      const a = sparkAngle + (i / 5) * Math.PI * 2;
      const r = 55 + Math.sin(this.phase * 2 + i) * 5;
      ctx.save();
      ctx.globalAlpha = 0.5 + Math.sin(this.phase * 3 + i) * 0.3;
      ctx.fillText('✨', w / 2 + Math.cos(a) * r, elsaY + Math.sin(a) * r);
      ctx.restore();
    }

    // Title
    ctx.save();
    ctx.font = 'Bold 38px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const titleY = h * 0.38;

    // Glow
    ctx.shadowColor = '#4fc3f7';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#FFF';
    ctx.fillText('❄️ 엘사 아기 키우기 ❄️', w / 2, titleY);
    ctx.shadowBlur = 0;

    // Subtitle
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#B3E5FC';
    ctx.fillText('엄마 엘사가 아기에게 음식을 줘요!', w / 2, titleY + 35);
    ctx.fillText('좋아하는 음식을 맞춰보세요~ 💕', w / 2, titleY + 58);
    ctx.restore();

    // Baby preview
    const babyY = h * 0.58;
    ctx.save();
    const babyScale = 1 + Math.sin(this.phase * 2) * 0.05;
    ctx.translate(w / 2, babyY);
    ctx.scale(babyScale, babyScale);

    // Belly circle
    ctx.fillStyle = 'rgba(79, 195, 247, 0.15)';
    ctx.beginPath();
    ctx.arc(0, 0, 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(79, 195, 247, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    drawBabyElsa(ctx, 0, 0, 25, 'neutral', this.phase, 0.3);
    ctx.restore();

    // Start button
    const btnW = Math.min(260, w * 0.65);
    const btnH = 65;
    const btnX = (w - btnW) / 2;
    const btnY = h * 0.72;
    const pulse = 1 + Math.sin(this.phase * 4) * 0.03;

    ctx.save();
    ctx.translate(w / 2, btnY + btnH / 2);
    ctx.scale(pulse, pulse);
    ctx.translate(-w / 2, -(btnY + btnH / 2));

    const btnGrad = ctx.createLinearGradient(btnX, btnY, btnX, btnY + btnH);
    btnGrad.addColorStop(0, '#4fc3f7');
    btnGrad.addColorStop(1, '#0288d1');
    ctx.fillStyle = btnGrad;
    ctx.beginPath();
    ctx.roundRect(btnX, btnY, btnW, btnH, 22);
    ctx.fill();

    ctx.shadowColor = '#4fc3f7';
    ctx.shadowBlur = 15;
    ctx.font = 'Bold 26px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFF';
    ctx.fillText('❄️ 시작하기 ❄️', w / 2, btnY + btnH / 2);
    ctx.restore();

    // Footer hint
    ctx.font = '13px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.textAlign = 'center';
    ctx.fillText('아기가 원하는 음식을 골라주세요!', w / 2, h * 0.88);
  }
}
