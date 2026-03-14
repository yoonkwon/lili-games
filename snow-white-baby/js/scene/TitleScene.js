/**
 * Title scene - Snow White baby game
 * Forest theme with floating leaves and butterflies
 */
import { drawSnowWhiteMom, drawBabySnowWhite } from '../draw-snow-white.js';

export class TitleScene {
  constructor() {
    this.phase = 0;

    // Floating leaves and butterflies
    this.floaters = [];
    for (let i = 0; i < 25; i++) {
      this.floaters.push({
        x: Math.random(),
        y: Math.random(),
        speed: 0.015 + Math.random() * 0.025,
        size: 12 + Math.random() * 16,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.8 + Math.random() * 1.5,
        emoji: ['🍃', '🦋', '🌸', '🍂', '✨'][Math.floor(Math.random() * 5)],
        drift: (Math.random() - 0.5) * 0.02,
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
    // Background - dark forest gradient
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#0a1a0a');
    grad.addColorStop(0.3, '#1a2a1a');
    grad.addColorStop(0.6, '#1a3020');
    grad.addColorStop(1, '#2a4a2a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Forest trees silhouettes in background
    this._drawTreeSilhouettes(ctx, w, h);

    // Floating leaves/butterflies
    for (const f of this.floaters) {
      const fy = (f.y + this.phase * f.speed) % 1.15 - 0.05;
      const fx = f.x + Math.sin(this.phase * f.wobbleSpeed + f.wobble) * 0.04 + this.phase * f.drift;
      const wrappedX = ((fx % 1) + 1) % 1;
      const alpha = 0.3 + Math.sin(this.phase * 2 + f.wobble) * 0.2;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `${f.size}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(f.emoji, wrappedX * w, fy * h);
      ctx.restore();
    }

    // Snow White mom
    const momY = h * 0.2;
    const bounce = Math.sin(this.phase * 1.5) * 5;
    drawSnowWhiteMom(ctx, w / 2, momY + bounce, 1.3);

    // Sparkles around
    ctx.font = '20px sans-serif';
    const sparkAngle = this.phase * 1.5;
    for (let i = 0; i < 5; i++) {
      const a = sparkAngle + (i / 5) * Math.PI * 2;
      const r = 55 + Math.sin(this.phase * 2 + i) * 5;
      ctx.save();
      ctx.globalAlpha = 0.5 + Math.sin(this.phase * 3 + i) * 0.3;
      const sparkEmojis = ['✨', '🌟', '🌸', '🦋', '🍃'];
      ctx.fillText(sparkEmojis[i], w / 2 + Math.cos(a) * r, momY + Math.sin(a) * r);
      ctx.restore();
    }

    // Title
    ctx.save();
    ctx.font = 'Bold 36px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const titleY = h * 0.38;

    // Glow
    ctx.shadowColor = '#4CAF50';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#FFF';
    ctx.fillText('👑 백설공주 아기 키우기 👑', w / 2, titleY);
    ctx.shadowBlur = 0;

    // Subtitle
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#A5D6A7';
    ctx.fillText('숲속 동물들이 음식을 가져다줘요!', w / 2, titleY + 35);
    ctx.fillText('좋아하는 음식을 골라주세요~ 🌸', w / 2, titleY + 58);
    ctx.restore();

    // Baby preview
    const babyY = h * 0.58;
    ctx.save();
    const babyScale = 1 + Math.sin(this.phase * 2) * 0.05;
    ctx.translate(w / 2, babyY);
    ctx.scale(babyScale, babyScale);

    // Belly circle (forest green glow)
    ctx.fillStyle = 'rgba(76, 175, 80, 0.15)';
    ctx.beginPath();
    ctx.arc(0, 0, 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(76, 175, 80, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    drawBabySnowWhite(ctx, 0, 0, 25, 'neutral', this.phase, 0.3);
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
    btnGrad.addColorStop(0, '#4CAF50');
    btnGrad.addColorStop(1, '#2E7D32');
    ctx.fillStyle = btnGrad;
    ctx.beginPath();
    ctx.roundRect(btnX, btnY, btnW, btnH, 22);
    ctx.fill();

    ctx.shadowColor = '#4CAF50';
    ctx.shadowBlur = 15;
    ctx.font = 'Bold 26px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFF';
    ctx.fillText('🌿 시작하기 🌿', w / 2, btnY + btnH / 2);
    ctx.restore();

    // Footer hint
    ctx.font = '13px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.textAlign = 'center';
    ctx.fillText('동물을 터치해서 음식을 주세요!', w / 2, h * 0.88);
  }

  _drawTreeSilhouettes(ctx, w, h) {
    ctx.save();
    ctx.globalAlpha = 0.15;

    // Left trees
    ctx.fillStyle = '#0a1a0a';
    this._drawTree(ctx, w * 0.05, h * 0.95, 40, 120);
    this._drawTree(ctx, w * 0.15, h * 0.95, 35, 100);

    // Right trees
    this._drawTree(ctx, w * 0.85, h * 0.95, 35, 110);
    this._drawTree(ctx, w * 0.95, h * 0.95, 40, 130);

    ctx.restore();
  }

  _drawTree(ctx, x, baseY, width, height) {
    // Trunk
    ctx.fillRect(x - width * 0.1, baseY - height * 0.4, width * 0.2, height * 0.4);

    // Canopy (triangle layers)
    for (let i = 0; i < 3; i++) {
      const layerY = baseY - height * 0.3 - i * height * 0.25;
      const layerW = width * (1.2 - i * 0.25);
      ctx.beginPath();
      ctx.moveTo(x, layerY - height * 0.3);
      ctx.lineTo(x - layerW, layerY);
      ctx.lineTo(x + layerW, layerY);
      ctx.closePath();
      ctx.fill();
    }
  }
}
