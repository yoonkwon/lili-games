/**
 * Main gameplay - feed the baby!
 */
import { FOODS, GROWTH_STAGES, GAME } from '../config.js';
import { ParticleSystem } from '../../../shared/ParticleSystem.js';
import { Message } from '../../../shared/ui/Message.js';
import { drawElsaMom, drawBabyElsa } from '../draw-elsa.js';

export class GameScene {
  constructor(w, h, safeTop) {
    this.w = w;
    this.h = h;
    this.safeTop = safeTop;

    // Baby state
    this.growth = 0;          // 0 ~ maxGrowth
    this.dislike = 0;         // 0 ~ maxDislike
    this.combo = 0;
    this.totalFed = 0;
    this.correctFed = 0;

    // Current want
    this.wantedFood = null;
    this.choices = [];
    this.wantTimer = 0;
    this._pickNewWant();

    // Ice freeze state
    this.frozen = false;
    this.freezeTimer = 0;
    this.iceAlpha = 0;
    this.iceCracks = this._generateIceCracks(w, h);

    // Baby animation
    this.babyPhase = 0;
    this.babyEmotion = 'neutral'; // neutral, happy, sad, angry
    this.emotionTimer = 0;
    this.babyShake = 0;

    // Elsa mom
    this.momPhase = 0;
    this.momHandY = 0;

    // Effects
    this.particles = new ParticleSystem();
    this.message = new Message();

    // Snowflakes (ambient)
    this.snowflakes = [];
    for (let i = 0; i < 15; i++) {
      this.snowflakes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        speed: 15 + Math.random() * 25,
        size: 8 + Math.random() * 10,
        wobble: Math.random() * Math.PI * 2,
      });
    }

    // Food buttons layout
    this.foodBtns = [];

    this.message.show('아기가 원하는 음식을 골라줘요! 💕', 3);
  }

  _pickNewWant() {
    // Pick a random food the baby wants
    const idx = Math.floor(Math.random() * FOODS.length);
    this.wantedFood = FOODS[idx];
    this.wantTimer = GAME.wantChangeInterval;

    // Pick choices (including the correct one)
    const choices = [this.wantedFood];
    const available = FOODS.filter(f => f.type !== this.wantedFood.type);
    while (choices.length < GAME.foodChoices && available.length > 0) {
      const ri = Math.floor(Math.random() * available.length);
      choices.push(available.splice(ri, 1)[0]);
    }
    // Shuffle
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }
    this.choices = choices;
  }

  _generateIceCracks(w, h) {
    const cracks = [];
    for (let i = 0; i < 8; i++) {
      const startX = w * 0.3 + Math.random() * w * 0.4;
      const startY = h * 0.3 + Math.random() * h * 0.4;
      const points = [{ x: startX, y: startY }];
      for (let j = 0; j < 4 + Math.floor(Math.random() * 4); j++) {
        const last = points[points.length - 1];
        points.push({
          x: last.x + (Math.random() - 0.5) * 100,
          y: last.y + (Math.random() - 0.5) * 100,
        });
      }
      cracks.push(points);
    }
    return cracks;
  }

  handleTap(x, y) {
    if (this.frozen) return;

    // Check food button taps
    for (const btn of this.foodBtns) {
      if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
        this._feedBaby(btn.food);
        return;
      }
    }
  }

  _feedBaby(food) {
    this.totalFed++;
    const correct = food.type === this.wantedFood.type;

    if (correct) {
      // Correct food!
      this.combo++;
      this.correctFed++;
      const bonus = GAME.growthPerCorrect + this.combo * GAME.comboBonus;
      this.growth = Math.min(GAME.maxGrowth, this.growth + bonus);
      this.dislike = Math.max(0, this.dislike - 10);

      this.babyEmotion = 'happy';
      this.emotionTimer = 1.5;

      this.particles.createParticles(this.w / 2, this.h * 0.38, '#FFD700', 12);
      this.particles.createStars(this.w / 2, this.h * 0.35, 5);
      this.particles.addFloatingText(this.w / 2, this.h * 0.32, `+${bonus} 💕`, '#FF69B4', 28);

      if (this.combo >= 3) {
        this.message.show(`${this.combo} 콤보! 아기가 아주 좋아해요! ✨`);
      }

      this._pickNewWant();

      // Check if fully grown
      if (this.growth >= GAME.maxGrowth) {
        return; // handled in update
      }
    } else {
      // Wrong food
      this.combo = 0;
      this.growth = Math.max(0, this.growth + GAME.growthPerWrong);
      this.dislike = Math.min(GAME.maxDislike, this.dislike + GAME.dislikePerWrong);

      this.babyEmotion = 'sad';
      this.emotionTimer = 1.2;
      this.babyShake = 0.5;

      this.particles.addFloatingText(this.w / 2, this.h * 0.32, '싫어요! 😣', '#88CCFF', 24);

      // Check if ice magic triggers
      if (this.dislike >= GAME.maxDislike) {
        this._triggerIceMagic();
      }
    }
  }

  _triggerIceMagic() {
    this.frozen = true;
    this.freezeTimer = GAME.freezeDuration;
    this.iceAlpha = 0;
    this.dislike = 0;
    this.babyEmotion = 'angry';
    this.emotionTimer = GAME.freezeDuration;
    this.iceCracks = this._generateIceCracks(this.w, this.h);
    this.message.show('❄️ 아기가 얼음 마법을 썼어요! ❄️', 3);
  }

  update(dt, w, h) {
    this.w = w;
    this.h = h;
    this.babyPhase += dt;
    this.momPhase += dt;

    // Check birth
    if (this.growth >= GAME.maxGrowth) {
      return 'born';
    }

    // Freeze state
    if (this.frozen) {
      this.freezeTimer -= dt;
      this.iceAlpha = Math.min(1, this.iceAlpha + dt * 3);
      if (this.freezeTimer <= 0) {
        this.frozen = false;
        this.iceAlpha = 0;
        this.babyEmotion = 'neutral';
        this._pickNewWant();
      }
    }

    // Want timer - baby changes mind
    if (!this.frozen) {
      this.wantTimer -= dt;
      if (this.wantTimer <= 0) {
        this.dislike = Math.min(GAME.maxDislike, this.dislike + 8);
        this.babyEmotion = 'sad';
        this.emotionTimer = 0.8;
        this._pickNewWant();
      }

      // Dislike decay
      this.dislike = Math.max(0, this.dislike - GAME.dislikeDecay * dt);
    }

    // Emotion timer
    if (this.emotionTimer > 0) {
      this.emotionTimer -= dt;
      if (this.emotionTimer <= 0 && !this.frozen) {
        this.babyEmotion = 'neutral';
      }
    }

    // Baby shake
    if (this.babyShake > 0) {
      this.babyShake = Math.max(0, this.babyShake - dt * 2);
    }

    // Snowflakes
    for (const s of this.snowflakes) {
      s.y += s.speed * dt;
      s.x += Math.sin(this.babyPhase + s.wobble) * 10 * dt;
      if (s.y > h + 20) { s.y = -20; s.x = Math.random() * w; }
    }

    // Update food button positions
    this._layoutFoodBtns(w, h);

    this.particles.update(dt);
    this.message.update(dt);

    return null;
  }

  _layoutFoodBtns(w, h) {
    const btnSize = Math.min(80, (w - 60) / GAME.foodChoices - 10);
    const totalW = this.choices.length * (btnSize + 10) - 10;
    const startX = (w - totalW) / 2;
    const btnY = h * 0.82;

    this.foodBtns = this.choices.map((food, i) => ({
      food,
      x: startX + i * (btnSize + 10),
      y: btnY,
      w: btnSize,
      h: btnSize,
    }));
  }

  draw(ctx, w, h) {
    this._drawBackground(ctx, w, h);
    this._drawMomElsa(ctx, w, h);
    this._drawBelly(ctx, w, h);
    this._drawBaby(ctx, w, h);
    this._drawWantBubble(ctx, w, h);
    this._drawGrowthBar(ctx, w, h);
    this._drawDislikeBar(ctx, w, h);
    this._drawFoodButtons(ctx, w, h);

    // Particles
    this.particles.draw(ctx);

    // Combo indicator
    if (this.combo >= 2) {
      ctx.save();
      ctx.font = 'Bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFD700';
      ctx.fillText(`⚡ ${this.combo} 콤보!`, w / 2, h * 0.68);
      ctx.restore();
    }

    // Message
    this.message.draw(ctx, w, h);

    // Ice freeze overlay
    if (this.frozen || this.iceAlpha > 0) {
      this._drawIceOverlay(ctx, w, h);
    }
  }

  _drawBackground(ctx, w, h) {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#0d1b3e');
    grad.addColorStop(0.5, '#1a3a5c');
    grad.addColorStop(1, '#2a5298');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Snowflakes
    for (const s of this.snowflakes) {
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.font = `${s.size}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('❄️', s.x, s.y);
      ctx.restore();
    }
  }

  _drawMomElsa(ctx, w, h) {
    const momX = w / 2;
    const momY = h * 0.14;
    const bob = Math.sin(this.momPhase * 1.2) * 3;

    drawElsaMom(ctx, momX, momY + bob, 1.0);

    // Label
    ctx.save();
    ctx.font = 'Bold 14px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#B3E5FC';
    ctx.fillText('엄마 엘사', momX, momY + bob + 65);
    ctx.restore();
  }

  _drawBelly(ctx, w, h) {
    const cx = w / 2;
    const cy = h * 0.40;
    const growthRatio = this.growth / GAME.maxGrowth;
    const baseRadius = 60 + growthRatio * 40;

    // Outer glow
    ctx.save();
    const glowGrad = ctx.createRadialGradient(cx, cy, baseRadius * 0.5, cx, cy, baseRadius * 1.3);
    glowGrad.addColorStop(0, 'rgba(79, 195, 247, 0.1)');
    glowGrad.addColorStop(0.7, 'rgba(79, 195, 247, 0.05)');
    glowGrad.addColorStop(1, 'rgba(79, 195, 247, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, baseRadius * 1.3, 0, Math.PI * 2);
    ctx.fill();

    // Belly circle
    const bellyGrad = ctx.createRadialGradient(cx, cy - 10, 0, cx, cy, baseRadius);
    bellyGrad.addColorStop(0, 'rgba(129, 212, 250, 0.25)');
    bellyGrad.addColorStop(0.7, 'rgba(79, 195, 247, 0.15)');
    bellyGrad.addColorStop(1, 'rgba(41, 121, 255, 0.1)');
    ctx.fillStyle = bellyGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
    ctx.fill();

    // Border
    ctx.strokeStyle = 'rgba(79, 195, 247, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Sparkle ring
    const sparkCount = 6;
    for (let i = 0; i < sparkCount; i++) {
      const angle = (i / sparkCount) * Math.PI * 2 + this.babyPhase * 0.5;
      const sx = cx + Math.cos(angle) * (baseRadius + 8);
      const sy = cy + Math.sin(angle) * (baseRadius + 8);
      ctx.globalAlpha = 0.3 + Math.sin(this.babyPhase * 3 + i) * 0.2;
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✦', sx, sy);
    }
    ctx.restore();
  }

  _drawBaby(ctx, w, h) {
    const cx = w / 2;
    const cy = h * 0.40;
    const growthRatio = this.growth / GAME.maxGrowth;

    // Find current stage
    let stage = GROWTH_STAGES[0];
    for (const s of GROWTH_STAGES) {
      if (growthRatio >= s.threshold) stage = s;
    }

    const babySize = 20 + growthRatio * 35;
    const bob = Math.sin(this.babyPhase * 2) * 4;
    const shakeX = this.babyShake > 0 ? Math.sin(this.babyPhase * 30) * 5 * this.babyShake : 0;

    drawBabyElsa(ctx, cx + shakeX, cy + bob, babySize, this.babyEmotion, this.babyPhase, growthRatio);

    // Stage label
    ctx.save();
    ctx.font = '13px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#B3E5FC';
    ctx.fillText(`${stage.name} 단계 - ${stage.desc}`, cx, cy + babySize + 20);
    ctx.restore();
  }

  _drawWantBubble(ctx, w, h) {
    if (this.frozen) return;

    const cx = w / 2 + 50;
    const cy = h * 0.28;

    // Speech bubble
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.roundRect(cx - 35, cy - 28, 70, 56, 16);
    ctx.fill();

    // Bubble tail
    ctx.beginPath();
    ctx.moveTo(cx - 15, cy + 26);
    ctx.lineTo(cx - 25, cy + 40);
    ctx.lineTo(cx - 5, cy + 28);
    ctx.fill();

    // Wanted food emoji
    const pulse = 1 + Math.sin(this.babyPhase * 4) * 0.08;
    ctx.translate(cx, cy);
    ctx.scale(pulse, pulse);
    ctx.font = '32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.wantedFood.emoji, 0, 0);
    ctx.restore();

    // Timer indicator (urgency dots)
    const urgency = 1 - (this.wantTimer / GAME.wantChangeInterval);
    ctx.save();
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    if (urgency > 0.7) {
      ctx.fillStyle = '#FF4444';
      ctx.fillText('빨리!', cx, cy + 48);
    } else if (urgency > 0.4) {
      ctx.fillStyle = '#FFA726';
      ctx.fillText('기다려...', cx, cy + 48);
    }
    ctx.restore();
  }

  _drawGrowthBar(ctx, w, h) {
    const barX = 16;
    const barY = this.safeTop + 16;
    const barW = w - 32;
    const barH = 22;
    const ratio = this.growth / GAME.maxGrowth;

    // Label
    ctx.save();
    ctx.font = 'Bold 13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#B3E5FC';
    ctx.fillText(`💕 성장 ${Math.floor(ratio * 100)}%`, barX, barY - 4);

    // Bar bg
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 11);
    ctx.fill();

    // Bar fill
    if (ratio > 0) {
      const grad = ctx.createLinearGradient(barX, 0, barX + barW * ratio, 0);
      grad.addColorStop(0, '#FF69B4');
      grad.addColorStop(1, '#FF1493');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW * ratio, barH, 11);
      ctx.fill();

      // Shine
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fillRect(barX + 4, barY + 2, barW * ratio - 8, barH * 0.35);
    }

    ctx.restore();
  }

  _drawDislikeBar(ctx, w, h) {
    const barX = 16;
    const barY = this.safeTop + 48;
    const barW = w * 0.4;
    const barH = 14;
    const ratio = this.dislike / GAME.maxDislike;

    ctx.save();
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = ratio > 0.6 ? '#FF4444' : '#90CAF9';
    ctx.fillText(`❄️ 싫음`, barX, barY - 3);

    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 7);
    ctx.fill();

    if (ratio > 0) {
      const grad = ctx.createLinearGradient(barX, 0, barX + barW * ratio, 0);
      grad.addColorStop(0, '#4fc3f7');
      grad.addColorStop(1, ratio > 0.7 ? '#1565C0' : '#29B6F6');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW * ratio, barH, 7);
      ctx.fill();
    }

    // Warning flash when high
    if (ratio > 0.7) {
      const flash = Math.sin(this.babyPhase * 6) * 0.3;
      ctx.fillStyle = `rgba(255,0,0,${0.1 + flash})`;
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW, barH, 7);
      ctx.fill();
    }

    ctx.restore();
  }

  _drawFoodButtons(ctx, w, h) {
    if (this.frozen) return;

    for (const btn of this.foodBtns) {
      ctx.save();

      // Button bg
      const grad = ctx.createLinearGradient(btn.x, btn.y, btn.x, btn.y + btn.h);
      grad.addColorStop(0, 'rgba(255,255,255,0.2)');
      grad.addColorStop(1, 'rgba(255,255,255,0.08)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 16);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Food emoji
      const fontSize = Math.min(36, btn.w * 0.5);
      ctx.font = `${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(btn.food.emoji, btn.x + btn.w / 2, btn.y + btn.h / 2 - 4);

      // Name
      ctx.font = `${Math.min(11, btn.w * 0.15)}px "Segoe UI", "Apple SD Gothic Neo", sans-serif`;
      ctx.fillStyle = '#B3E5FC';
      ctx.fillText(btn.food.name, btn.x + btn.w / 2, btn.y + btn.h - 10);

      ctx.restore();
    }

    // Label
    ctx.save();
    ctx.font = 'Bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFF';
    ctx.fillText('🍽️ 어떤 음식을 줄까요?', w / 2, h * 0.77);
    ctx.restore();
  }

  _drawIceOverlay(ctx, w, h) {
    ctx.save();

    // Ice blue overlay
    ctx.fillStyle = `rgba(173, 216, 250, ${this.iceAlpha * 0.6})`;
    ctx.fillRect(0, 0, w, h);

    // Frost edge effect
    const edgeGrad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.2, w / 2, h / 2, Math.max(w, h) * 0.7);
    edgeGrad.addColorStop(0, 'rgba(255,255,255,0)');
    edgeGrad.addColorStop(0.6, 'rgba(200,230,255,0)');
    edgeGrad.addColorStop(1, `rgba(200,230,255,${this.iceAlpha * 0.5})`);
    ctx.fillStyle = edgeGrad;
    ctx.fillRect(0, 0, w, h);

    // Ice cracks
    if (this.iceAlpha > 0.3) {
      ctx.strokeStyle = `rgba(255,255,255,${(this.iceAlpha - 0.3) * 0.5})`;
      ctx.lineWidth = 1.5;
      for (const crack of this.iceCracks) {
        ctx.beginPath();
        ctx.moveTo(crack[0].x, crack[0].y);
        for (let i = 1; i < crack.length; i++) {
          ctx.lineTo(crack[i].x, crack[i].y);
        }
        ctx.stroke();
      }
    }

    // Frozen snowflakes
    ctx.globalAlpha = this.iceAlpha;
    const frozenEmojis = ['❄️', '🧊', '❄️', '💎'];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + this.babyPhase * 0.3;
      const r = 80 + Math.sin(i * 1.7) * 40;
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(frozenEmojis[i % frozenEmojis.length], w / 2 + Math.cos(angle) * r, h / 2 + Math.sin(angle) * r);
    }

    // Timer text
    if (this.frozen) {
      ctx.globalAlpha = 1;
      ctx.font = 'Bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFF';
      ctx.shadowColor = '#4fc3f7';
      ctx.shadowBlur = 20;
      ctx.fillText(`❄️ ${Math.ceil(this.freezeTimer)}초 ❄️`, w / 2, h / 2);
      ctx.shadowBlur = 0;

      ctx.font = '18px sans-serif';
      ctx.fillStyle = '#E1F5FE';
      ctx.fillText('아기가 얼음 마법을 썼어요!', w / 2, h / 2 + 35);
    }

    ctx.restore();
  }

  getStats() {
    return {
      growth: this.growth,
      totalFed: this.totalFed,
      correctFed: this.correctFed,
      accuracy: this.totalFed > 0 ? Math.round((this.correctFed / this.totalFed) * 100) : 0,
    };
  }
}
