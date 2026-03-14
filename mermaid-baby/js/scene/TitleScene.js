/**
 * Title scene - Mermaid baby game
 * Ocean theme with floating bubbles and sea creatures
 */
import { drawMermaidMom, drawBabyMermaid } from '../draw-mermaid.js';

export class TitleScene {
  constructor() {
    this.phase = 0;

    // Floating bubbles, shells, fish (float UPWARD)
    this.floaters = [];
    for (let i = 0; i < 25; i++) {
      this.floaters.push({
        x: Math.random(),
        y: Math.random(),
        speed: 0.015 + Math.random() * 0.025,
        size: 12 + Math.random() * 16,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.8 + Math.random() * 1.5,
        emoji: ['🫧', '🐚', '🐠', '🌊', '✨'][Math.floor(Math.random() * 5)],
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
    // Background - deep ocean gradient
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#050520');
    grad.addColorStop(0.3, '#0a1a3a');
    grad.addColorStop(0.6, '#1a3050');
    grad.addColorStop(1, '#1a4060');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Coral silhouettes in background
    this._drawCoralSilhouettes(ctx, w, h);

    // Floating bubbles/shells (float UPWARD - reverse y direction)
    for (const f of this.floaters) {
      const fy = (f.y - this.phase * f.speed) % 1.15;
      const wrappedY = ((fy % 1) + 1) % 1;
      const fx = f.x + Math.sin(this.phase * f.wobbleSpeed + f.wobble) * 0.04 + this.phase * f.drift;
      const wrappedX = ((fx % 1) + 1) % 1;
      const alpha = 0.3 + Math.sin(this.phase * 2 + f.wobble) * 0.2;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `${f.size}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(f.emoji, wrappedX * w, wrappedY * h);
      ctx.restore();
    }

    // Mermaid mom
    const momY = h * 0.2;
    const bounce = Math.sin(this.phase * 1.5) * 5;
    drawMermaidMom(ctx, w / 2, momY + bounce, 1.3);

    // Sparkles around
    ctx.font = '20px sans-serif';
    const sparkAngle = this.phase * 1.5;
    for (let i = 0; i < 5; i++) {
      const a = sparkAngle + (i / 5) * Math.PI * 2;
      const r = 55 + Math.sin(this.phase * 2 + i) * 5;
      ctx.save();
      ctx.globalAlpha = 0.5 + Math.sin(this.phase * 3 + i) * 0.3;
      const sparkEmojis = ['🫧', '🌊', '🐚', '🦀', '✨'];
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
    ctx.shadowColor = '#0097A7';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#FFF';
    ctx.fillText('🔱 인어공주 아기 키우기 🔱', w / 2, titleY);
    ctx.shadowBlur = 0;

    // Subtitle
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#80DEEA';
    ctx.fillText('바다 속 물고기가 음식을 가져다줘요!', w / 2, titleY + 35);
    ctx.fillText('좋아하는 음식을 낚아채세요~ 🐠', w / 2, titleY + 58);
    ctx.restore();

    // Baby preview
    const babyY = h * 0.58;
    ctx.save();
    const babyScale = 1 + Math.sin(this.phase * 2) * 0.05;
    ctx.translate(w / 2, babyY);
    ctx.scale(babyScale, babyScale);

    // Belly circle (cyan/teal glow)
    ctx.fillStyle = 'rgba(0, 188, 212, 0.15)';
    ctx.beginPath();
    ctx.arc(0, 0, 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 188, 212, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    drawBabyMermaid(ctx, 0, 0, 25, 'neutral', this.phase, 0.3);
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
    btnGrad.addColorStop(0, '#0097A7');
    btnGrad.addColorStop(1, '#00695C');
    ctx.fillStyle = btnGrad;
    ctx.beginPath();
    ctx.roundRect(btnX, btnY, btnW, btnH, 22);
    ctx.fill();

    ctx.shadowColor = '#0097A7';
    ctx.shadowBlur = 15;
    ctx.font = 'Bold 26px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFF';
    ctx.fillText('🌊 시작하기 🌊', w / 2, btnY + btnH / 2);
    ctx.restore();

    // Footer hint
    ctx.font = '13px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.textAlign = 'center';
    ctx.fillText('물고기를 터치해서 음식을 낚아채세요!', w / 2, h * 0.88);
  }

  _drawCoralSilhouettes(ctx, w, h) {
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#0a0a2e';

    // Left corals
    this._drawCoral(ctx, w * 0.05, h * 0.95, 30, 100);
    this._drawCoral(ctx, w * 0.15, h * 0.95, 25, 80);

    // Right corals
    this._drawCoral(ctx, w * 0.85, h * 0.95, 25, 90);
    this._drawCoral(ctx, w * 0.95, h * 0.95, 30, 110);

    ctx.restore();
  }

  _drawCoral(ctx, x, baseY, width, height) {
    // Coral stem
    ctx.fillRect(x - width * 0.08, baseY - height * 0.5, width * 0.16, height * 0.5);

    // Rounded coral branches
    for (let i = 0; i < 4; i++) {
      const branchY = baseY - height * 0.3 - i * height * 0.18;
      const branchR = width * (0.5 - i * 0.08);
      const offsetX = (i % 2 === 0 ? -1 : 1) * width * 0.2;
      ctx.beginPath();
      ctx.arc(x + offsetX, branchY, branchR, 0, Math.PI * 2);
      ctx.fill();
    }

    // Top rounded cap
    ctx.beginPath();
    ctx.arc(x, baseY - height * 0.85, width * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }
}
