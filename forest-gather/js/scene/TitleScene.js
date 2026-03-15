/**
 * Title screen - stage selection map
 * Shows encyclopedia stages + quiz stages
 */
import { STAGES, QUIZ_STAGES } from '../config.js';
import { hasSave, loadSave } from '../SaveManager.js';

export class TitleScene {
  constructor(spriteCache, encyclopedia) {
    this.spriteCache = spriteCache;
    this.encyclopedia = encyclopedia || {}; // { stageId: [discoveredItemIds] }
    this.savedData = hasSave() ? loadSave() : null;
    this.phase = 0;
    this.selectedStage = null;
    this.selectedType = null; // 'explore' or 'quiz'
    this.scrollY = 0;

    // All stages combined for display
    this.allStages = [
      ...STAGES.map((s, i) => ({ ...s, type: 'explore', originalIndex: i })),
      ...QUIZ_STAGES.map((s, i) => ({ ...s, type: 'quiz', originalIndex: i })),
    ];

    // Sparkle decorations
    this.sparkles = [];
    for (let i = 0; i < 25; i++) {
      this.sparkles.push({
        x: Math.random(),
        y: Math.random(),
        speed: 0.2 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
        size: 8 + Math.random() * 14,
        emoji: ['✨', '🌟', '🍃', '🌸', '🦋'][Math.floor(Math.random() * 5)],
      });
    }
  }

  handleTap(x, y, w, h) {
    const btnW = Math.min(300, w * 0.85);
    const btnH = 66;
    const startY = h * 0.24;
    const gap = 8;

    for (let i = 0; i < this.allStages.length; i++) {
      const stage = this.allStages[i];
      const bx = (w - btnW) / 2;
      const by = startY + i * (btnH + gap) - this.scrollY;

      if (by + btnH < 0 || by > h) continue; // off screen

      if (x >= bx && x <= bx + btnW && y >= by && y <= by + btnH) {
        this.selectedStage = stage.originalIndex;
        this.selectedType = stage.type;

        // Check if saved data matches
        if (this.savedData) {
          if (stage.type === 'explore' && this.savedData.stageIndex === stage.originalIndex && !this.savedData.quizIndex) {
            return 'continue';
          }
          if (stage.type === 'quiz' && this.savedData.quizIndex === stage.originalIndex) {
            return 'continue';
          }
        }
        return 'start';
      }
    }

    return null;
  }

  handleScroll(dy) {
    this.scrollY = Math.max(0, this.scrollY + dy);
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
      const alpha = 0.3 + Math.sin(this.phase * 2 + s.phase) * 0.25;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `${s.size}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(s.emoji, s.x * w, sy * h);
      ctx.restore();
    }

    // Title
    ctx.save();
    const titleY = h * 0.05;
    const bounce = Math.sin(this.phase * 2) * 3;

    ctx.font = `Bold ${Math.min(36, w * 0.08)}px "Segoe UI", "Apple SD Gothic Neo", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillText('📚 리리 백과사전 📚', w / 2 + 2, titleY + bounce + 2);

    ctx.fillStyle = '#FFD700';
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 3;
    ctx.strokeText('📚 리리 백과사전 📚', w / 2, titleY + bounce);
    ctx.fillText('📚 리리 백과사전 📚', w / 2, titleY + bounce);

    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#C8E6C9';
    ctx.fillText('탐험하며 배우는 신기한 세계!', w / 2, titleY + bounce + 30);
    ctx.restore();

    // Character preview
    const previewY = h * 0.16;
    const charBob = Math.sin(this.phase * 3) * 3;
    if (this.spriteCache) {
      this.spriteCache.draw(ctx, 'ria-idle', w / 2 - 20, previewY + charBob, 1);
      this.spriteCache.draw(ctx, 'bori-idle', w / 2 + 22, previewY - charBob + 4, 0.6);
    }

    // Stage buttons
    const btnW = Math.min(300, w * 0.85);
    const btnH = 66;
    const startY = h * 0.24;
    const gap = 8;

    for (let i = 0; i < this.allStages.length; i++) {
      const stage = this.allStages[i];
      const bx = (w - btnW) / 2;
      const by = startY + i * (btnH + gap) - this.scrollY;

      if (by + btnH < 0 || by > h) continue;

      // Separator before quiz section
      if (i === STAGES.length) {
        ctx.font = 'Bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillText('── 🔍 스무고개 ──', w / 2, by - 4);
      }

      const isQuiz = stage.type === 'quiz';

      // Completion check
      let isComplete = false;
      let hasProgress = false;
      let progressText = '';

      if (isQuiz) {
        const quizEnc = this.encyclopedia[stage.id];
        isComplete = quizEnc && quizEnc.complete;
        if (quizEnc && quizEnc.solved) {
          hasProgress = true;
          progressText = `${quizEnc.solved}/${stage.rounds.length}`;
        }
      } else {
        const completedItems = (this.encyclopedia[stage.id] || []).length;
        const totalItems = stage.items.length;
        isComplete = completedItems >= totalItems;
        hasProgress = completedItems > 0;
        if (hasProgress) progressText = `${completedItems}/${totalItems}`;
      }

      // Button bg
      ctx.save();
      const btnGrad = ctx.createLinearGradient(bx, by, bx, by + btnH);
      if (isComplete) {
        btnGrad.addColorStop(0, '#FFD700');
        btnGrad.addColorStop(1, '#FFA000');
      } else if (isQuiz) {
        btnGrad.addColorStop(0, 'rgba(156,39,176,0.25)');
        btnGrad.addColorStop(1, 'rgba(156,39,176,0.1)');
      } else {
        btnGrad.addColorStop(0, 'rgba(255,255,255,0.15)');
        btnGrad.addColorStop(1, 'rgba(255,255,255,0.05)');
      }
      ctx.fillStyle = btnGrad;
      ctx.beginPath();
      ctx.roundRect(bx, by, btnW, btnH, 14);
      ctx.fill();
      ctx.restore();

      // Stage emoji + name
      ctx.font = 'Bold 20px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isComplete ? '#5D4037' : '#FFF';
      ctx.fillText(`${stage.emoji} ${stage.name}`, bx + 14, by + 26);

      // Description
      ctx.font = '12px sans-serif';
      ctx.fillStyle = isComplete ? '#795548' : 'rgba(255,255,255,0.55)';
      ctx.fillText(stage.desc, bx + 14, by + 48);

      // Right side progress
      ctx.textAlign = 'right';
      if (isComplete) {
        ctx.font = 'Bold 15px sans-serif';
        ctx.fillStyle = '#5D4037';
        ctx.fillText('✅ 완료!', bx + btnW - 14, by + 33);
      } else if (hasProgress) {
        ctx.font = '13px sans-serif';
        ctx.fillStyle = '#C8E6C9';
        ctx.fillText(progressText, bx + btnW - 14, by + 33);
      }
    }

    // Footer
    ctx.font = '11px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.textAlign = 'center';
    ctx.fillText('스테이지를 선택해서 탐험을 시작하세요!', w / 2, h * 0.97);
  }
}
