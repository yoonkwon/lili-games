export class HUD {
  constructor() {
    this._tapHintPhase = 0;
    this._idleTimer = 0;
  }

  draw(ctx, canvasWidth, canvasHeight, state, safeTop = 0) {
    const { basketEggs, targetEggs, chickCount, gaugeEmpty, totalEggs,
            comboCount, currentStage, stageName, stageEmoji, activeAbilities } = state;

    this._drawEggProgress(ctx, canvasWidth, basketEggs, targetEggs, safeTop);

    if (chickCount > 0) {
      this._drawChickCount(ctx, canvasWidth, chickCount, safeTop);
    }

    // Stage indicator
    if (stageName) {
      this._drawStageIndicator(ctx, canvasWidth, stageEmoji, stageName, currentStage, safeTop);
    }

    // Active abilities bar
    if (activeAbilities && activeAbilities.length > 0) {
      this._drawAbilities(ctx, canvasWidth, activeAbilities, safeTop);
    }

    // Combo indicator
    if (comboCount >= 3) {
      this._drawCombo(ctx, canvasWidth, canvasHeight, comboCount);
    }

    // Show tap hint at start OR after 5 seconds idle
    if ((totalEggs === 0 && gaugeEmpty) || this._idleTimer > 5) {
      this._drawTapHint(ctx, canvasWidth, canvasHeight);
    }
  }

  update(dt) {
    this._tapHintPhase += dt * 3;
    this._idleTimer += dt;
  }

  resetIdle() {
    this._idleTimer = 0;
  }

  _drawEggProgress(ctx, canvasWidth, basketEggs, targetEggs, safeTop) {
    const pillX = 20;
    const pillY = safeTop + 75;
    const pillW = 200;
    const pillH = 55;

    ctx.save();

    // Background pill
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 14);
    ctx.fill();

    // Egg count text
    const text = `\u{1F95A} ${basketEggs} / ${targetEggs}`;
    ctx.font = 'Bold 28px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(text, pillX + 12, pillY + 20);

    // Progress bar below text
    const barX = pillX + 12;
    const barY = pillY + 38;
    const barW = 180;
    const barH = 10;
    const progress = Math.min(1, basketEggs / Math.max(1, targetEggs));

    // Bar background
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 5);
    ctx.fill();

    // Bar fill
    if (progress > 0) {
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW * progress, barH, 5);
      ctx.fill();
    }

    ctx.restore();
  }

  _drawChickCount(ctx, canvasWidth, chickCount, safeTop) {
    const x = 235;
    const y = safeTop + 95;

    ctx.save();
    ctx.font = 'Bold 28px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFE44D';
    ctx.fillText(`\u{1F423} ${chickCount}`, x, y);
    ctx.restore();
  }

  _drawStageIndicator(ctx, canvasWidth, emoji, name, stageNum, safeTop) {
    const x = canvasWidth - 20;
    const y = safeTop + 75;

    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.roundRect(x - 140, y - 12, 140, 32, 10);
    ctx.fill();

    ctx.font = 'Bold 18px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`${emoji} ${name} (${stageNum + 1}/5)`, x - 10, y + 4);
    ctx.restore();
  }

  _drawAbilities(ctx, canvasWidth, abilities, safeTop) {
    const x = canvasWidth - 20;
    const y = safeTop + 110;

    ctx.save();
    ctx.font = 'Bold 14px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < abilities.length; i++) {
      const ay = y + i * 20;
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.beginPath();
      ctx.roundRect(x - 130, ay - 8, 130, 18, 6);
      ctx.fill();
      ctx.fillStyle = abilities[i].color || '#FFF';
      ctx.fillText(abilities[i].text, x - 6, ay);
    }

    ctx.restore();
  }

  _drawCombo(ctx, canvasWidth, canvasHeight, comboCount) {
    const x = canvasWidth / 2;
    const y = canvasHeight * 0.18;

    ctx.save();
    const scale = 1 + Math.sin(this._tapHintPhase * 2) * 0.05;
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.font = 'Bold 24px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Glow
    ctx.fillStyle = comboCount >= 10 ? '#FF4444' : comboCount >= 5 ? '#FFD700' : '#FFF';
    const comboText = comboCount >= 10 ? `🔥 ${comboCount} 콤보!` : `⚡ ${comboCount} 콤보`;
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 3;
    ctx.strokeText(comboText, 0, 0);
    ctx.fillText(comboText, 0, 0);

    ctx.restore();
  }

  _drawTapHint(ctx, canvasWidth, canvasHeight) {
    const alpha = 0.2 + 0.6 * (0.5 + 0.5 * Math.sin(this._tapHintPhase));
    const x = canvasWidth / 2;
    const y = canvasHeight * 0.45;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = '40px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\u{1F446}', x, y);
    ctx.restore();
  }
}
