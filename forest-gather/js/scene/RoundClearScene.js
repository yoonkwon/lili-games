/**
 * Stage clear celebration scene
 * Shows what was discovered and celebrates completion
 */
export class RoundClearScene {
  constructor(w, h, stats) {
    this.w = w;
    this.h = h;
    this.stats = stats;
    this.phase = 0;

    // Celebration particles
    this.confetti = [];
    for (let i = 0; i < 35; i++) {
      this.confetti.push({
        x: Math.random() * w,
        y: -20 - Math.random() * 300,
        vy: 60 + Math.random() * 50,
        vx: (Math.random() - 0.5) * 30,
        color: ['#FFD700', '#FF69B4', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0'][Math.floor(Math.random() * 6)],
        size: 4 + Math.random() * 5,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 6,
      });
    }
  }

  handleTap(x, y) {
    if (this.phase < 2) return null;

    const btnW = 240;
    const btnH = 55;
    const btnX = (this.w - btnW) / 2;

    // Next stage button
    const btnY = this.h * 0.72;
    if (x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH) {
      return 'nextStage';
    }

    // Home button
    const homeY = btnY + btnH + 14;
    if (x >= btnX && x <= btnX + btnW && y >= homeY && y <= homeY + btnH) {
      return 'home';
    }

    // Back to menu button
    const menuY = homeY + btnH + 14;
    if (x >= btnX && x <= btnX + btnW && y >= menuY && y <= menuY + btnH) {
      return 'menu';
    }

    return null;
  }

  update(dt) {
    this.phase += dt;
    for (const c of this.confetti) {
      c.y += c.vy * dt;
      c.x += c.vx * dt;
      c.rotation += c.rotSpeed * dt;
      if (c.y > this.h + 20) {
        c.y = -20;
        c.x = Math.random() * this.w;
      }
    }
  }

  draw(ctx, w, h) {
    this.w = w;
    this.h = h;

    // Background
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#1a472a');
    grad.addColorStop(1, '#2e7d32');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Confetti
    for (const c of this.confetti) {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rotation);
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size);
      ctx.restore();
    }

    // Title
    const titleAlpha = Math.min(1, this.phase * 2);
    ctx.save();
    ctx.globalAlpha = titleAlpha;
    ctx.font = 'Bold 36px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFD700';
    ctx.fillText('🎉 탐험 완료! 🎉', w / 2, h * 0.1);
    ctx.restore();

    // Stars
    if (this.phase > 0.5) {
      const starY = h * 0.2;
      ctx.font = '44px sans-serif';
      ctx.textAlign = 'center';
      for (let i = 0; i < 3; i++) {
        const delay = 0.5 + i * 0.3;
        if (this.phase > delay) {
          const scale = Math.min(1, (this.phase - delay) * 3);
          ctx.save();
          ctx.translate(w / 2 + (i - 1) * 55, starY);
          ctx.scale(scale, scale);
          ctx.fillText('⭐', 0, 0);
          ctx.restore();
        }
      }
    }

    // Stage info
    if (this.phase > 1) {
      ctx.font = 'Bold 28px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFF';
      ctx.fillText(`${this.stats.stageEmoji} ${this.stats.stageName}`, w / 2, h * 0.32);

      ctx.font = '20px sans-serif';
      ctx.fillStyle = '#C8E6C9';
      ctx.fillText(`📖 ${this.stats.discovered}개 모두 발견!`, w / 2, h * 0.39);
    }

    // Encouragement
    if (this.phase > 1.5) {
      ctx.font = '18px sans-serif';
      ctx.fillStyle = '#A5D6A7';
      ctx.fillText('대단해요! 최고의 탐험대예요!', w / 2, h * 0.46);

      // Show discovered emojis in a grid
      const items = this.stats.items || [];
      if (items.length > 0) {
        const cols = Math.min(7, items.length);
        const emojiSize = 32;
        const gridW = cols * (emojiSize + 8);
        const startX = w / 2 - gridW / 2 + emojiSize / 2;
        const startItemY = h * 0.52;
        ctx.font = `${emojiSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let i = 0; i < items.length; i++) {
          const col = i % cols;
          const row = Math.floor(i / cols);
          ctx.fillText(items[i], startX + col * (emojiSize + 8), startItemY + row * (emojiSize + 8));
        }
      }
    }

    // Buttons
    if (this.phase > 2) {
      const btnW = 240;
      const btnH = 55;
      const btnX = (w - btnW) / 2;
      const btnY = h * 0.72;
      const pulse = 1 + Math.sin(this.phase * 4) * 0.02;

      // Next stage button
      ctx.save();
      ctx.translate(w / 2, btnY + btnH / 2);
      ctx.scale(pulse, pulse);
      ctx.translate(-w / 2, -(btnY + btnH / 2));

      const btnGrad = ctx.createLinearGradient(btnX, btnY, btnX, btnY + btnH);
      btnGrad.addColorStop(0, '#4CAF50');
      btnGrad.addColorStop(1, '#388E3C');
      ctx.fillStyle = btnGrad;
      ctx.beginPath();
      ctx.roundRect(btnX, btnY, btnW, btnH, 18);
      ctx.fill();

      ctx.font = 'Bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFF';
      ctx.fillText('다음 스테이지! ▶', w / 2, btnY + btnH / 2);
      ctx.restore();

      // Other games
      const homeY = btnY + btnH + 14;
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.roundRect(btnX, homeY, btnW, btnH, 18);
      ctx.fill();
      ctx.font = 'Bold 18px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFF';
      ctx.fillText('🏠 다른 게임하기', w / 2, homeY + btnH / 2);

      // Back to stage select
      const menuY = homeY + btnH + 14;
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.beginPath();
      ctx.roundRect(btnX, menuY, btnW, btnH, 18);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = 'Bold 18px sans-serif';
      ctx.fillText('📚 스테이지 선택', w / 2, menuY + btnH / 2);
    }
  }
}
