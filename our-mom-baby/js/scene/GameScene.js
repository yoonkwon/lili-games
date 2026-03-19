/**
 * Main gameplay - Our Mom Baby game
 * "Nutrient Bubble" mechanic: bubbles float around carrying food
 * Tap the right bubble to feed the baby!
 */
import { FOODS, VIRUS, GROWTH_STAGES, GAME } from '../config.js';
import { ParticleSystem } from '../../../shared/ParticleSystem.js';
import { Message } from '../../../shared/ui/Message.js';
import { drawMom, drawBaby, drawFairyLisa, drawChildRia, drawVirus } from '../draw-mom.js';

export class GameScene {
  constructor(w, h, safeTop, mode) {
    this.w = w;
    this.h = h;
    this.safeTop = safeTop;
    this.mode = mode; // 'ria' or 'lisa'

    // Baby state
    this.growth = 0;
    this.dislike = 0;
    this.combo = 0;
    this.totalFed = 0;
    this.correctFed = 0;

    // Current want
    this.wantedFood = null;
    this.wantTimer = 0;
    this._pickNewWant();

    // === Bubble system ===
    this.bubbles = [];
    this.bubbleSpawnTimer = 0.5;
    this.virusTimer = GAME.virusInterval;

    // Fever state (virus penalty)
    this.fever = false;
    this.feverTimer = 0;
    this.feverAlpha = 0;

    // Baby animation
    this.babyPhase = 0;
    this.babyEmotion = 'neutral';
    this.emotionTimer = 0;
    this.babyShake = 0;

    // Mom
    this.momPhase = 0;

    // Helper character
    this.helperPhase = 0;
    this.helperX = w * 0.2;
    this.helperY = mode === 'ria' ? h * 0.08 : h * 0.78;
    this.helperMsg = '';
    this.helperMsgTimer = 0;

    // Effects
    this.particles = new ParticleSystem();
    this.message = new Message();

    // Ambient hearts
    this.ambientItems = [];
    for (let i = 0; i < 15; i++) {
      this.ambientItems.push({
        x: Math.random() * w,
        y: Math.random() * h,
        speed: 10 + Math.random() * 20,
        size: 8 + Math.random() * 10,
        wobble: Math.random() * Math.PI * 2,
        emoji: ['💕', '✨', '🌸', '💗'][Math.floor(Math.random() * 4)],
      });
    }

    const babyName = mode === 'ria' ? '리아' : '리사';
    this.message.show(`버블을 터치! ${babyName}가 원하는 음식을 골라줘요! 💕`, 3);
  }

  _pickNewWant() {
    this.wantedFood = FOODS[Math.floor(Math.random() * FOODS.length)];
    this.wantTimer = GAME.wantChangeInterval;
  }

  _spawnBubble() {
    if (this.bubbles.filter(b => !b.collected).length >= GAME.maxBubbles) return;
    const food = this._pickBubbleFood();
    const size = 45 + Math.random() * 15;
    const x = size + Math.random() * (this.w - size * 2);
    const y = this.h * 0.58 + Math.random() * (this.h * 0.32);

    this.bubbles.push({
      food, x, y, size,
      vx: (Math.random() - 0.5) * 40,
      vy: (Math.random() - 0.5) * 30,
      phase: Math.random() * Math.PI * 2,
      collected: false,
      collectPhase: 0,
      correct: false,
      isVirus: false,
    });
  }

  _spawnVirus() {
    const size = VIRUS.size;
    const side = Math.random() < 0.5 ? -size : this.w + size;
    const y = this.h * 0.6 + Math.random() * (this.h * 0.25);
    this.bubbles.push({
      food: { type: 'virus', emoji: VIRUS.emoji, name: VIRUS.name, color: '#00AA00' },
      x: side, y, size,
      vx: side < 0 ? VIRUS.speed : -VIRUS.speed,
      vy: (Math.random() - 0.5) * 20,
      phase: Math.random() * Math.PI * 2,
      collected: false,
      collectPhase: 0,
      correct: false,
      isVirus: true,
    });
  }

  _pickBubbleFood() {
    if (Math.random() < GAME.wantedFoodChance) return this.wantedFood;
    return FOODS[Math.floor(Math.random() * FOODS.length)];
  }

  handleTap(x, y) {
    if (this.fever) return;
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i];
      if (b.collected) continue;
      const hitSize = b.size * 1.2;
      if (x >= b.x - hitSize && x <= b.x + hitSize &&
          y >= b.y - hitSize && y <= b.y + hitSize) {
        if (b.isVirus) {
          this._tapVirus(b);
        } else {
          this._feedBaby(b);
        }
        return;
      }
    }
  }

  _feedBaby(bubble) {
    this.totalFed++;
    const correct = bubble.food.type === this.wantedFood.type;
    bubble.collected = true;
    bubble.collectPhase = 0;
    bubble.correct = correct;

    if (correct) {
      this.combo++;
      this.correctFed++;
      const bonus = GAME.growthPerCorrect + this.combo * GAME.comboBonus;
      this.growth = Math.min(GAME.maxGrowth, this.growth + bonus);
      this.dislike = Math.max(0, this.dislike - 10);
      this.babyEmotion = 'happy';
      this.emotionTimer = 1.5;
      this.particles.createParticles(bubble.x, bubble.y - 20, '#FF69B4', 12);
      this.particles.createStars(this.w / 2, this.h * 0.35, 5);
      this.particles.addFloatingText(bubble.x, bubble.y - 40, `+${bonus} 💕`, '#FF69B4', 28);
      if (this.combo >= 3) {
        this.message.show(`${this.combo} 콤보! 아기가 아주 좋아해요! ✨`);
      }
      this._showHelperMsg('맛있겠다~!');
      this._pickNewWant();
    } else {
      this.combo = 0;
      this.growth = Math.max(0, this.growth + GAME.growthPerWrong);
      this.dislike = Math.min(GAME.maxDislike, this.dislike + GAME.dislikePerWrong);
      this.babyEmotion = 'sad';
      this.emotionTimer = 1.2;
      this.babyShake = 0.5;
      this.particles.addFloatingText(bubble.x, bubble.y - 40, '싫어요! 😣', '#FFA726', 24);
      if (this.dislike >= GAME.maxDislike) this._triggerFever();
    }
  }

  _tapVirus(virus) {
    virus.collected = true;
    virus.collectPhase = 0;
    virus.correct = false;
    this.growth = Math.max(0, this.growth + GAME.virusPenalty);
    this.dislike = Math.min(GAME.maxDislike, this.dislike + GAME.virusDislike);
    this.combo = 0;
    this.babyEmotion = 'angry';
    this.emotionTimer = 2.0;
    this.babyShake = 0.8;
    this.particles.addFloatingText(virus.x, virus.y - 40, '세균이다! 🦠', '#00AA00', 30);
    this.particles.createParticles(virus.x, virus.y, '#00AA00', 15);
    this.message.show('🦠 세균을 만졌어요! 엄마가 아파요! 🤒', 3);
    this._showHelperMsg('조심해!');
    if (this.dislike >= GAME.maxDislike) this._triggerFever();
  }

  _triggerFever() {
    this.fever = true;
    this.feverTimer = GAME.feverDuration;
    this.feverAlpha = 0;
    this.dislike = 0;
    this.babyEmotion = 'angry';
    this.emotionTimer = GAME.feverDuration;
    this.message.show('🤒 엄마가 열이 나요! 쉬어야 해요! 🤒', 3);
  }

  _showHelperMsg(msg) {
    this.helperMsg = msg;
    this.helperMsgTimer = 2;
  }

  update(dt, w, h) {
    this.w = w;
    this.h = h;
    this.babyPhase += dt;
    this.momPhase += dt;
    this.helperPhase += dt;

    if (this.growth >= GAME.maxGrowth) return 'born';

    // Fever state
    if (this.fever) {
      this.feverTimer -= dt;
      this.feverAlpha = Math.min(1, this.feverAlpha + dt * 3);
      if (this.feverTimer <= 0) {
        this.fever = false;
        this.feverAlpha = 0;
        this.babyEmotion = 'neutral';
        this._pickNewWant();
      }
    }

    // Want timer
    if (!this.fever) {
      this.wantTimer -= dt;
      if (this.wantTimer <= 0) {
        this.dislike = Math.min(GAME.maxDislike, this.dislike + 8);
        this.babyEmotion = 'sad';
        this.emotionTimer = 0.8;
        this._pickNewWant();
      }
      this.dislike = Math.max(0, this.dislike - GAME.dislikeDecay * dt);
    }

    // Emotion
    if (this.emotionTimer > 0) {
      this.emotionTimer -= dt;
      if (this.emotionTimer <= 0 && !this.fever) this.babyEmotion = 'neutral';
    }
    if (this.babyShake > 0) this.babyShake = Math.max(0, this.babyShake - dt * 2);

    // Helper message
    if (this.helperMsgTimer > 0) this.helperMsgTimer -= dt;

    // Helper position
    if (this.mode === 'ria') {
      // Fairy Lisa floats in sky
      this.helperX = w * 0.18 + Math.sin(this.helperPhase * 0.8) * 30;
      this.helperY = h * 0.08 + Math.sin(this.helperPhase * 1.2) * 10;
    } else {
      // Child Ria walks on bottom
      this.helperX = w * 0.15 + Math.sin(this.helperPhase * 0.5) * (w * 0.2);
      this.helperY = h * 0.88;
    }

    // === Bubble system ===
    if (!this.fever) {
      this.bubbleSpawnTimer -= dt;
      if (this.bubbleSpawnTimer <= 0 && this.bubbles.filter(b => !b.collected).length < GAME.maxBubbles) {
        this._spawnBubble();
        this.bubbleSpawnTimer = GAME.bubbleSpawnInterval;
      }
      if (this.bubbles.filter(b => !b.collected && !b.isVirus).length < GAME.minBubbles) {
        this._spawnBubble();
      }

      this.virusTimer -= dt;
      if (this.virusTimer <= 0) {
        this._spawnVirus();
        this.virusTimer = GAME.virusInterval;
      }

      for (const b of this.bubbles) {
        b.phase += dt * 2;
        if (b.collected) {
          b.collectPhase += dt * 3;
        } else {
          b.x += b.vx * dt;
          b.y += b.vy * dt;
          // Bounce off walls
          const margin = b.size * 0.5;
          if (b.x < margin) { b.x = margin; b.vx = Math.abs(b.vx); }
          if (b.x > w - margin) { b.x = w - margin; b.vx = -Math.abs(b.vx); }
          if (b.y < h * 0.55) { b.y = h * 0.55; b.vy = Math.abs(b.vy); }
          if (b.y > h - margin) { b.y = h - margin; b.vy = -Math.abs(b.vy); }
          // Gentle drift
          b.vx += (Math.random() - 0.5) * 20 * dt;
          b.vy += (Math.random() - 0.5) * 15 * dt;
          // Speed limit
          const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
          const maxSpeed = b.isVirus ? 60 : 35;
          if (speed > maxSpeed) { b.vx = (b.vx / speed) * maxSpeed; b.vy = (b.vy / speed) * maxSpeed; }
        }
      }
      this.bubbles = this.bubbles.filter(b => !b.collected || b.collectPhase < 1.2);
    }

    // Ambient
    for (const s of this.ambientItems) {
      s.y -= s.speed * dt * 0.3;
      s.x += Math.sin(this.babyPhase + s.wobble) * 5 * dt;
      if (s.y < -20) { s.y = h + 20; s.x = Math.random() * w; }
    }

    this.particles.update(dt);
    this.message.update(dt);
    return null;
  }

  draw(ctx, w, h) {
    this._drawBackground(ctx, w, h);
    this._drawHelper(ctx, w, h);
    this._drawMom(ctx, w, h);
    this._drawBelly(ctx, w, h);
    this._drawBabyInBelly(ctx, w, h);
    this._drawWantBubble(ctx, w, h);
    this._drawGrowthBar(ctx, w, h);
    this._drawDislikeBar(ctx, w, h);
    this._drawBubbles(ctx, w, h);
    this.particles.draw(ctx);
    if (this.combo >= 2) {
      ctx.save();
      ctx.font = 'Bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFD700';
      ctx.fillText(`💕 ${this.combo} 콤보!`, w / 2, h * 0.52);
      ctx.restore();
    }
    this.message.draw(ctx, w, h);
    if (this.fever || this.feverAlpha > 0) this._drawFeverOverlay(ctx, w, h);
  }

  _drawBackground(ctx, w, h) {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#2a1a3a');
    grad.addColorStop(0.3, '#3a2a4a');
    grad.addColorStop(0.6, '#5a3a5a');
    grad.addColorStop(1, '#FFB6C1');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    for (const s of this.ambientItems) {
      ctx.save();
      ctx.globalAlpha = 0.2;
      ctx.font = `${s.size}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(s.emoji, s.x, s.y);
      ctx.restore();
    }
  }

  _drawHelper(ctx, w, h) {
    ctx.save();
    if (this.mode === 'ria') {
      // Fairy Lisa in the sky
      ctx.globalAlpha = 0.7 + Math.sin(this.helperPhase * 2) * 0.2;
      drawFairyLisa(ctx, this.helperX, this.helperY, 70);
      ctx.globalAlpha = 1;
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFB6C1';
      ctx.fillText('요정 리사', this.helperX, this.helperY + 42);
    } else {
      // Child Ria on bottom
      drawChildRia(ctx, this.helperX, this.helperY, 65);
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#A5D6A7';
      ctx.fillText('언니 리아', this.helperX, this.helperY + 40);
    }

    // Helper speech bubble
    if (this.helperMsgTimer > 0) {
      const alpha = Math.min(1, this.helperMsgTimer);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      const tw = ctx.measureText(this.helperMsg).width + 16;
      const bx = this.helperX - tw / 2;
      const by = this.helperY - 55;
      ctx.beginPath();
      ctx.roundRect(bx, by, tw, 24, 12);
      ctx.fill();
      ctx.font = 'Bold 13px sans-serif';
      ctx.fillStyle = '#333';
      ctx.textAlign = 'center';
      ctx.fillText(this.helperMsg, this.helperX, by + 16);
    }
    ctx.restore();
  }

  _drawMom(ctx, w, h) {
    const momX = w / 2;
    const momY = h * 0.12;
    const bob = Math.sin(this.momPhase * 1.2) * 3;
    drawMom(ctx, momX, momY + bob, 1.0);
    ctx.save();
    ctx.font = 'Bold 14px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFB6C1';
    ctx.fillText('우리 엄마', momX, momY + bob + 65);
    ctx.restore();
  }

  _drawBelly(ctx, w, h) {
    const cx = w / 2;
    const cy = h * 0.35;
    const growthRatio = this.growth / GAME.maxGrowth;
    const baseRadius = 55 + growthRatio * 35;
    ctx.save();

    const glowGrad = ctx.createRadialGradient(cx, cy, baseRadius * 0.5, cx, cy, baseRadius * 1.3);
    glowGrad.addColorStop(0, 'rgba(255, 105, 180, 0.1)');
    glowGrad.addColorStop(0.7, 'rgba(255, 105, 180, 0.05)');
    glowGrad.addColorStop(1, 'rgba(255, 105, 180, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, baseRadius * 1.3, 0, Math.PI * 2);
    ctx.fill();

    const bellyGrad = ctx.createRadialGradient(cx, cy - 10, 0, cx, cy, baseRadius);
    bellyGrad.addColorStop(0, 'rgba(255, 182, 193, 0.25)');
    bellyGrad.addColorStop(0.7, 'rgba(255, 105, 180, 0.15)');
    bellyGrad.addColorStop(1, 'rgba(219, 68, 129, 0.1)');
    ctx.fillStyle = bellyGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 105, 180, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + this.babyPhase * 0.5;
      const sx = cx + Math.cos(angle) * (baseRadius + 8);
      const sy = cy + Math.sin(angle) * (baseRadius + 8);
      ctx.globalAlpha = 0.3 + Math.sin(this.babyPhase * 3 + i) * 0.2;
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✦', sx, sy);
    }
    ctx.restore();
  }

  _drawBabyInBelly(ctx, w, h) {
    const cx = w / 2;
    const cy = h * 0.35;
    const growthRatio = this.growth / GAME.maxGrowth;
    let stage = GROWTH_STAGES[0];
    for (const s of GROWTH_STAGES) { if (growthRatio >= s.threshold) stage = s; }

    const babySize = 20 + growthRatio * 35;
    const bob = Math.sin(this.babyPhase * 2) * 4;
    const shakeX = this.babyShake > 0 ? Math.sin(this.babyPhase * 30) * 5 * this.babyShake : 0;

    drawBaby(ctx, cx + shakeX, cy + bob, babySize, this.babyEmotion, this.babyPhase, growthRatio, this.mode);

    ctx.save();
    ctx.font = '13px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFB6C1';
    ctx.fillText(`${stage.name} 단계 - ${stage.desc}`, cx, cy + babySize + 20);
    ctx.restore();
  }

  _drawWantBubble(ctx, w, h) {
    if (this.fever) return;
    const cx = w / 2 + 50;
    const cy = h * 0.22;
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.roundRect(cx - 35, cy - 28, 70, 56, 16);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - 15, cy + 26);
    ctx.lineTo(cx - 25, cy + 40);
    ctx.lineTo(cx - 5, cy + 28);
    ctx.fill();

    const pulse = 1 + Math.sin(this.babyPhase * 4) * 0.08;
    ctx.translate(cx, cy);
    ctx.scale(pulse, pulse);
    ctx.font = '32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.wantedFood.emoji, 0, 0);
    ctx.restore();

    const urgency = 1 - (this.wantTimer / GAME.wantChangeInterval);
    ctx.save();
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    if (urgency > 0.7) { ctx.fillStyle = '#FF4444'; ctx.fillText('빨리!', cx, cy + 48); }
    else if (urgency > 0.4) { ctx.fillStyle = '#FFA726'; ctx.fillText('기다려...', cx, cy + 48); }
    ctx.restore();
  }

  _drawGrowthBar(ctx, w, h) {
    const barX = 16, barY = this.safeTop + 16, barW = w - 32, barH = 22;
    const ratio = this.growth / GAME.maxGrowth;
    ctx.save();
    ctx.font = 'Bold 13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFB6C1';
    ctx.fillText(`💕 성장 ${Math.floor(ratio * 100)}%`, barX, barY - 4);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.roundRect(barX, barY, barW, barH, 11); ctx.fill();
    if (ratio > 0) {
      const grad = ctx.createLinearGradient(barX, 0, barX + barW * ratio, 0);
      grad.addColorStop(0, '#FF69B4');
      grad.addColorStop(1, '#E91E63');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.roundRect(barX, barY, barW * ratio, barH, 11); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fillRect(barX + 4, barY + 2, barW * ratio - 8, barH * 0.35);
    }
    ctx.restore();
  }

  _drawDislikeBar(ctx, w, h) {
    const barX = 16, barY = this.safeTop + 48, barW = w * 0.4, barH = 14;
    const ratio = this.dislike / GAME.maxDislike;
    ctx.save();
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = ratio > 0.6 ? '#FF4444' : '#FFB6C1';
    ctx.fillText('🤒 싫음', barX, barY - 3);
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath(); ctx.roundRect(barX, barY, barW, barH, 7); ctx.fill();
    if (ratio > 0) {
      const grad = ctx.createLinearGradient(barX, 0, barX + barW * ratio, 0);
      grad.addColorStop(0, '#FF6B6B');
      grad.addColorStop(1, ratio > 0.7 ? '#CC0000' : '#FF4444');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.roundRect(barX, barY, barW * ratio, barH, 7); ctx.fill();
    }
    if (ratio > 0.7) {
      const flash = Math.sin(this.babyPhase * 6) * 0.3;
      ctx.fillStyle = `rgba(255,0,0,${0.1 + flash})`;
      ctx.beginPath(); ctx.roundRect(barX, barY, barW, barH, 7); ctx.fill();
    }
    ctx.restore();
  }

  _drawBubbles(ctx, w, h) {
    ctx.save();
    ctx.font = 'Bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFF';
    ctx.fillText('🫧 버블을 터치해서 음식을 주세요!', w / 2, h * 0.55);
    ctx.restore();

    for (const b of this.bubbles) {
      ctx.save();
      const wobble = Math.sin(b.phase) * 3;

      if (b.collected) {
        const t = b.collectPhase;
        ctx.globalAlpha = Math.max(0, 1 - t);
        if (b.correct) {
          ctx.translate(b.x, b.y - t * 80 + wobble);
          ctx.scale(1 + t * 0.3, 1 + t * 0.3);
        } else {
          const shake = Math.sin(t * 20) * 8 * (1 - t);
          ctx.translate(b.x + shake, b.y + wobble);
        }
      } else {
        ctx.translate(b.x, b.y + wobble);
      }

      // Bubble background
      const bubbleScale = 1 + Math.sin(b.phase * 1.5) * 0.05;
      ctx.scale(bubbleScale, bubbleScale);

      if (b.isVirus) {
        // Virus: greenish bubble
        ctx.fillStyle = 'rgba(0, 100, 0, 0.3)';
        ctx.beginPath(); ctx.arc(0, 0, b.size * 0.55, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(0, 180, 0, 0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Virus sprite
        drawVirus(ctx, 0, 0, b.size * 0.7);
        // Warning glow
        if (!b.collected) {
          const warnWidth = 1.5 + Math.sin(b.phase * 2) * 1.5;
          ctx.strokeStyle = '#00CC00';
          ctx.lineWidth = warnWidth;
          ctx.beginPath(); ctx.arc(0, 0, b.size * 0.65, 0, Math.PI * 2); ctx.stroke();
        }
      } else {
        // Food bubble: pink/translucent
        const bubGrad = ctx.createRadialGradient(-b.size * 0.15, -b.size * 0.15, 0, 0, 0, b.size * 0.55);
        bubGrad.addColorStop(0, 'rgba(255, 220, 240, 0.6)');
        bubGrad.addColorStop(0.7, 'rgba(255, 182, 193, 0.3)');
        bubGrad.addColorStop(1, 'rgba(255, 105, 180, 0.15)');
        ctx.fillStyle = bubGrad;
        ctx.beginPath(); ctx.arc(0, 0, b.size * 0.55, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(255, 182, 193, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // Shine highlight
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath(); ctx.arc(-b.size * 0.18, -b.size * 0.2, b.size * 0.12, 0, Math.PI * 2); ctx.fill();
        // Food emoji
        const foodSize = Math.max(18, b.size * 0.5);
        ctx.font = `${foodSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.food.emoji, 0, 0);
      }
      ctx.restore();
    }
  }

  _drawFeverOverlay(ctx, w, h) {
    ctx.save();
    ctx.fillStyle = `rgba(180, 0, 0, ${this.feverAlpha * 0.4})`;
    ctx.fillRect(0, 0, w, h);

    const edgeGrad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.2, w / 2, h / 2, Math.max(w, h) * 0.7);
    edgeGrad.addColorStop(0, 'rgba(255,100,100,0)');
    edgeGrad.addColorStop(1, `rgba(180,0,0,${this.feverAlpha * 0.5})`);
    ctx.fillStyle = edgeGrad;
    ctx.fillRect(0, 0, w, h);

    // Thermometer and virus emojis
    ctx.globalAlpha = this.feverAlpha;
    const feverEmojis = ['🤒', '🦠', '💊', '🌡️'];
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2 + this.babyPhase * 0.4;
      const r = 80 + Math.sin(i * 1.7) * 30;
      ctx.font = '22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(feverEmojis[i % feverEmojis.length], w / 2 + Math.cos(angle) * r, h / 2 + Math.sin(angle) * r);
    }

    if (this.fever) {
      ctx.globalAlpha = 1;
      ctx.font = 'Bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFF';
      ctx.shadowColor = '#FF0000';
      ctx.shadowBlur = 20;
      ctx.fillText(`🤒 ${Math.ceil(this.feverTimer)}초 🤒`, w / 2, h / 2);
      ctx.shadowBlur = 0;
      ctx.font = '18px sans-serif';
      ctx.fillStyle = '#FFB6C1';
      ctx.fillText('엄마가 열이 나요! 쉬는 중...', w / 2, h / 2 + 35);
    }
    ctx.restore();
  }

  getSaveData() {
    return {
      growth: this.growth, dislike: this.dislike, combo: this.combo,
      totalFed: this.totalFed, correctFed: this.correctFed,
      mode: this.mode, savedAt: Date.now(),
    };
  }

  loadSaveData(save) {
    this.growth = save.growth || 0;
    this.dislike = save.dislike || 0;
    this.combo = save.combo || 0;
    this.totalFed = save.totalFed || 0;
    this.correctFed = save.correctFed || 0;
  }

  getStats() {
    return {
      growth: this.growth, totalFed: this.totalFed, correctFed: this.correctFed,
      accuracy: this.totalFed > 0 ? Math.round((this.correctFed / this.totalFed) * 100) : 0,
      mode: this.mode,
    };
  }
}
