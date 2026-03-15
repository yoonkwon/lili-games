/**
 * Title screen - character/difficulty selection
 */
import { DIFFICULTIES } from '../config.js';
import { hasSave, loadSave } from '../SaveManager.js';

const DIFF_KEYS = ['lisa', 'ria', 'together'];

export class TitleScene {
  constructor(spriteCache) {
    this.spriteCache = spriteCache;
    this.savedData = hasSave() ? loadSave() : null;
    this.selectedIndex = 1; // default: ria
    // If save exists, pre-select the saved difficulty
    if (this.savedData) {
      const idx = DIFF_KEYS.indexOf(this.savedData.difficultyKey);
      if (idx >= 0) this.selectedIndex = idx;
    }
    this.phase = 0;
    this.sparkles = [];
    for (let i = 0; i < 20; i++) {
      this.sparkles.push({
        x: Math.random(),
        y: Math.random(),
        speed: 0.3 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        size: 8 + Math.random() * 12,
      });
    }
  }

  get selectedDifficulty() {
    return DIFF_KEYS[this.selectedIndex];
  }

  handleTap(x, y, w, h) {
    // Difficulty buttons
    const btnW = Math.min(200, w * 0.4);
    const btnH = 70;
    const startY = h * 0.42;
    const gap = 15;

    for (let i = 0; i < DIFF_KEYS.length; i++) {
      const bx = (w - btnW) / 2;
      const by = startY + i * (btnH + gap);
      if (x >= bx && x <= bx + btnW && y >= by && y <= by + btnH) {
        this.selectedIndex = i;
        return null;
      }
    }

    // Buttons area
    const sBtnW = Math.min(250, w * 0.6);
    const sBtnH = 65;
    const sBtnX = (w - sBtnW) / 2;
    let btnAreaY = startY + DIFF_KEYS.length * (btnH + gap) + 20;

    // Continue button (if save exists)
    if (this.savedData) {
      if (x >= sBtnX && x <= sBtnX + sBtnW && y >= btnAreaY && y <= btnAreaY + sBtnH) {
        return 'continue';
      }
      btnAreaY += sBtnH + 12;
    }

    // New game button
    if (x >= sBtnX && x <= sBtnX + sBtnW && y >= btnAreaY && y <= btnAreaY + sBtnH) {
      return 'start';
    }

    return null;
  }

  update(dt) {
    this.phase += dt;
  }

  draw(ctx, w, h) {
    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#1a472a');
    grad.addColorStop(0.5, '#2e7d32');
    grad.addColorStop(1, '#1b5e20');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Sparkles
    for (const s of this.sparkles) {
      const sy = ((s.y + this.phase * s.speed * 0.05) % 1.2) - 0.1;
      const alpha = 0.3 + Math.sin(this.phase * 3 + s.phase) * 0.3;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `${s.size}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('✨', s.x * w, sy * h);
      ctx.restore();
    }

    // Title
    ctx.save();
    const titleY = h * 0.12;
    const bounce = Math.sin(this.phase * 2) * 5;

    ctx.font = `Bold 42px "Segoe UI", "Apple SD Gothic Neo", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillText('🌲 리리탐험대 🌲', w / 2 + 2, titleY + bounce + 2);

    ctx.fillStyle = '#FFD700';
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 3;
    ctx.strokeText('🌲 리리탐험대 🌲', w / 2, titleY + bounce);
    ctx.fillText('🌲 리리탐험대 🌲', w / 2, titleY + bounce);

    // Subtitle
    ctx.font = '18px sans-serif';
    ctx.fillStyle = '#C8E6C9';
    ctx.fillText('반짝이 열매를 모아 숲을 깨워줘요!', w / 2, titleY + bounce + 40);
    ctx.restore();

    // Character preview (using sprite assets)
    const previewY = h * 0.28;
    const charBob = Math.sin(this.phase * 3) * 3;
    if (this.spriteCache) {
      this.spriteCache.draw(ctx, 'ria-idle', w / 2 - 30, previewY + charBob, 1.5);
      this.spriteCache.draw(ctx, 'lisa-idle', w / 2 + 30, previewY - charBob, 1.5);
    }

    // Difficulty buttons
    const btnW = Math.min(200, w * 0.4);
    const btnH = 70;
    const startY = h * 0.42;
    const gap = 15;

    for (let i = 0; i < DIFF_KEYS.length; i++) {
      const key = DIFF_KEYS[i];
      const diff = DIFFICULTIES[key];
      const bx = (w - btnW) / 2;
      const by = startY + i * (btnH + gap);
      const selected = i === this.selectedIndex;

      // Button bg
      ctx.save();
      if (selected) {
        ctx.shadowColor = diff.color;
        ctx.shadowBlur = 15;
      }
      const btnGrad = ctx.createLinearGradient(bx, by, bx, by + btnH);
      btnGrad.addColorStop(0, selected ? diff.color : 'rgba(255,255,255,0.15)');
      btnGrad.addColorStop(1, selected ? diff.color + 'CC' : 'rgba(255,255,255,0.05)');
      ctx.fillStyle = btnGrad;
      ctx.beginPath();
      ctx.roundRect(bx, by, btnW, btnH, 16);
      ctx.fill();

      if (selected) {
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();

      // Button text with character sprites
      ctx.font = 'Bold 22px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFF';
      const labelX = w / 2 + 12;
      ctx.fillText(diff.label, labelX, by + 28);
      // Draw character sprite(s) left of label
      if (this.spriteCache) {
        const spriteX = labelX - ctx.measureText(diff.label).width / 2 - 18;
        if (key === 'lisa') {
          this.spriteCache.draw(ctx, 'lisa-idle', spriteX, by + 28, 0.5);
        } else if (key === 'ria') {
          this.spriteCache.draw(ctx, 'ria-idle', spriteX, by + 28, 0.5);
        } else {
          this.spriteCache.draw(ctx, 'lisa-idle', spriteX - 8, by + 28, 0.45);
          this.spriteCache.draw(ctx, 'ria-idle', spriteX + 8, by + 28, 0.45);
        }
      }

      ctx.font = '14px sans-serif';
      ctx.fillStyle = selected ? '#FFF' : 'rgba(255,255,255,0.6)';
      ctx.fillText(diff.desc, w / 2, by + 52);
    }

    // Buttons
    const sBtnW = Math.min(250, w * 0.6);
    const sBtnH = 65;
    const sBtnX = (w - sBtnW) / 2;
    let curBtnY = startY + DIFF_KEYS.length * (btnH + gap) + 20;
    const pulse = 1 + Math.sin(this.phase * 4) * 0.03;

    // Continue button (if save exists)
    if (this.savedData) {
      ctx.save();
      ctx.translate(w / 2, curBtnY + sBtnH / 2);
      ctx.scale(pulse, pulse);
      ctx.translate(-w / 2, -(curBtnY + sBtnH / 2));

      const cGrad = ctx.createLinearGradient(sBtnX, curBtnY, sBtnX, curBtnY + sBtnH);
      cGrad.addColorStop(0, '#4CAF50');
      cGrad.addColorStop(1, '#388E3C');
      ctx.fillStyle = cGrad;
      ctx.beginPath();
      ctx.roundRect(sBtnX, curBtnY, sBtnW, sBtnH, 20);
      ctx.fill();

      ctx.font = 'Bold 24px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFF';
      ctx.fillText(`▶ 이어하기 (R${this.savedData.round + 1})`, w / 2, curBtnY + sBtnH / 2);
      ctx.restore();

      curBtnY += sBtnH + 12;
    }

    // New game button
    ctx.save();
    ctx.translate(w / 2, curBtnY + sBtnH / 2);
    ctx.scale(this.savedData ? 1 : pulse, this.savedData ? 1 : pulse);
    ctx.translate(-w / 2, -(curBtnY + sBtnH / 2));

    const sGrad = ctx.createLinearGradient(sBtnX, curBtnY, sBtnX, curBtnY + sBtnH);
    sGrad.addColorStop(0, '#FFB300');
    sGrad.addColorStop(1, '#FF8F00');
    ctx.fillStyle = sGrad;
    ctx.beginPath();
    ctx.roundRect(sBtnX, curBtnY, sBtnW, sBtnH, 20);
    ctx.fill();

    ctx.font = `Bold ${this.savedData ? 22 : 28}px "Segoe UI", "Apple SD Gothic Neo", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFF';
    ctx.fillText(this.savedData ? '🌿 새로 시작' : '🌿 모험 시작! 🌿', w / 2, curBtnY + sBtnH / 2);
    ctx.restore();
  }
}
