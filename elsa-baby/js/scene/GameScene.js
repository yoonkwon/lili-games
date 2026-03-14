/**
 * Main gameplay - Elsa baby game
 * "Snowflake Falling" mechanic: snowflakes carry food and fall from the sky
 * Tap the right snowflake before it reaches the ground!
 */
import { FOODS, TROLL, GROWTH_STAGES, GAME } from '../config.js';
import { ParticleSystem } from '../../../shared/ParticleSystem.js';
import { Message } from '../../../shared/ui/Message.js';
import { drawElsaMom, drawBabyElsa } from '../draw-elsa.js';

export class GameScene {
  constructor(w, h, safeTop) {
    this.w = w;
    this.h = h;
    this.safeTop = safeTop;

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

    // === Snowflake falling system ===
    this.snowflakeItems = [];
    this.snowflakeSpawnTimer = 0.5;
    this.trollTimer = GAME.trollInterval;

    // Ice freeze state
    this.frozen = false;
    this.freezeTimer = 0;
    this.iceAlpha = 0;
    this.iceCracks = this._generateIceCracks(w, h);

    // Baby animation
    this.babyPhase = 0;
    this.babyEmotion = 'neutral';
    this.emotionTimer = 0;
    this.babyShake = 0;

    // Elsa mom
    this.momPhase = 0;

    // Effects
    this.particles = new ParticleSystem();
    this.message = new Message();

    // Ambient snowflakes (decorative, small)
    this.ambientSnow = [];
    for (let i = 0; i < 20; i++) {
      this.ambientSnow.push({
        x: Math.random() * w,
        y: Math.random() * h,
        speed: 15 + Math.random() * 25,
        size: 6 + Math.random() * 8,
        wobble: Math.random() * Math.PI * 2,
      });
    }

    // Snow ground
    this.groundY = h * 0.92;

    this.message.show('떨어지는 눈송이를 터치! 아기가 원하는 음식을 잡아요! ❄️', 3);
  }

  _pickNewWant() {
    const idx = Math.floor(Math.random() * FOODS.length);
    this.wantedFood = FOODS[idx];
    this.wantTimer = GAME.wantChangeInterval;
  }

  _spawnSnowflake() {
    if (this.snowflakeItems.filter(s => !s.collected).length >= GAME.maxSnowflakes) return;

    const food = this._pickSnowflakeFood();
    const size = 45 + Math.random() * 15;
    const x = size + Math.random() * (this.w - size * 2);
    const fallSpeed = 30 + Math.random() * 25; // pixels per second

    this.snowflakeItems.push({
      food: food,
      x: x,
      y: -size,
      fallSpeed: fallSpeed,
      size: size,
      wobblePhase: Math.random() * Math.PI * 2,
      wobbleAmp: 15 + Math.random() * 25,
      wobbleFreq: 1 + Math.random() * 1.5,
      baseX: x,
      collected: false,
      collectPhase: 0,
      correct: false,
      isTroll: false,
      rotation: 0,
    });
  }

  _spawnTroll() {
    const size = TROLL.size;
    const x = size + Math.random() * (this.w - size * 2);

    this.snowflakeItems.push({
      food: { type: 'poison', emoji: this.wantedFood.emoji, name: TROLL.foodName, color: '#6A0DAD' },
      x: x,
      y: -size,
      fallSpeed: TROLL.speed,
      size: size,
      wobblePhase: Math.random() * Math.PI * 2,
      wobbleAmp: 10 + Math.random() * 15,
      wobbleFreq: 0.8 + Math.random(),
      baseX: x,
      collected: false,
      collectPhase: 0,
      correct: false,
      isTroll: true,
      rotation: 0,
    });
  }

  _pickSnowflakeFood() {
    if (Math.random() < GAME.wantedFoodChance) {
      return this.wantedFood;
    }
    return FOODS[Math.floor(Math.random() * FOODS.length)];
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

    // Check snowflake taps (reverse order for z-ordering)
    for (let i = this.snowflakeItems.length - 1; i >= 0; i--) {
      const s = this.snowflakeItems[i];
      if (s.collected) continue;

      const hitSize = s.size * 1.2;
      if (x >= s.x - hitSize && x <= s.x + hitSize &&
          y >= s.y - hitSize && y <= s.y + hitSize) {
        if (s.isTroll) {
          this._tapTroll(s);
        } else {
          this._feedBaby(s);
        }
        return;
      }
    }
  }

  _feedBaby(snowflake) {
    this.totalFed++;
    const correct = snowflake.food.type === this.wantedFood.type;

    snowflake.collected = true;
    snowflake.collectPhase = 0;
    snowflake.correct = correct;

    if (correct) {
      this.combo++;
      this.correctFed++;
      const bonus = GAME.growthPerCorrect + this.combo * GAME.comboBonus;
      this.growth = Math.min(GAME.maxGrowth, this.growth + bonus);
      this.dislike = Math.max(0, this.dislike - 10);

      this.babyEmotion = 'happy';
      this.emotionTimer = 1.5;

      this.particles.createParticles(snowflake.x, snowflake.y - 20, '#4FC3F7', 12);
      this.particles.createStars(this.w / 2, this.h * 0.35, 5);
      this.particles.addFloatingText(snowflake.x, snowflake.y - 40, `+${bonus} ❄️`, '#4FC3F7', 28);

      if (this.combo >= 3) {
        this.message.show(`${this.combo} 콤보! 아기가 아주 좋아해요! ✨`);
      }

      this._pickNewWant();

      if (this.growth >= GAME.maxGrowth) return;
    } else {
      this.combo = 0;
      this.growth = Math.max(0, this.growth + GAME.growthPerWrong);
      this.dislike = Math.min(GAME.maxDislike, this.dislike + GAME.dislikePerWrong);

      this.babyEmotion = 'sad';
      this.emotionTimer = 1.2;
      this.babyShake = 0.5;

      this.particles.addFloatingText(snowflake.x, snowflake.y - 40, '싫어요! 😣', '#88CCFF', 24);

      if (this.dislike >= GAME.maxDislike) {
        this._triggerIceMagic();
      }
    }
  }

  _tapTroll(troll) {
    troll.collected = true;
    troll.collectPhase = 0;
    troll.correct = false;

    this.growth = Math.max(0, this.growth + GAME.poisonPenalty);
    this.dislike = Math.min(GAME.maxDislike, this.dislike + GAME.poisonDislike);
    this.combo = 0;

    this.babyEmotion = 'angry';
    this.emotionTimer = 2.0;
    this.babyShake = 0.8;

    this.particles.addFloatingText(troll.x, troll.y - 40, '트롤이다! ⛄', '#6A0DAD', 30);
    this.particles.createParticles(troll.x, troll.y, '#6A0DAD', 15);
    this.message.show('⛄ 트롤의 장난! 조심하세요! ⛄', 3);

    if (this.dislike >= GAME.maxDislike) {
      this._triggerIceMagic();
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
    this.groundY = h * 0.92;

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

    // Want timer
    if (!this.frozen) {
      this.wantTimer -= dt;
      if (this.wantTimer <= 0) {
        this.dislike = Math.min(GAME.maxDislike, this.dislike + 8);
        this.babyEmotion = 'sad';
        this.emotionTimer = 0.8;
        this._pickNewWant();
      }
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

    // === Snowflake system update ===
    if (!this.frozen) {
      // Spawn snowflakes
      this.snowflakeSpawnTimer -= dt;
      if (this.snowflakeSpawnTimer <= 0 && this.snowflakeItems.filter(s => !s.collected).length < GAME.maxSnowflakes) {
        this._spawnSnowflake();
        this.snowflakeSpawnTimer = GAME.snowflakeSpawnInterval;
      }

      // Ensure minimum
      const activeCount = this.snowflakeItems.filter(s => !s.collected && !s.isTroll).length;
      if (activeCount < GAME.minSnowflakes) {
        this._spawnSnowflake();
      }

      // Troll timer
      this.trollTimer -= dt;
      if (this.trollTimer <= 0) {
        this._spawnTroll();
        this.trollTimer = GAME.trollInterval;
      }

      // Update snowflakes
      for (const s of this.snowflakeItems) {
        s.wobblePhase += dt * s.wobbleFreq * Math.PI * 2;
        s.rotation += dt * 0.5;

        if (s.collected) {
          s.collectPhase += dt * 3;
        } else {
          // Fall down with wobble
          s.y += s.fallSpeed * dt;
          s.x = s.baseX + Math.sin(s.wobblePhase) * s.wobbleAmp;

          // Keep within horizontal bounds
          if (s.x < s.size) s.x = s.size;
          if (s.x > w - s.size) s.x = w - s.size;

          // Hit the ground - missed!
          if (s.y > this.groundY) {
            s.collected = true;
            s.collectPhase = 0;
            s.correct = true; // neutral exit (no shake)
          }
        }
      }

      // Remove fully faded
      this.snowflakeItems = this.snowflakeItems.filter(s => !s.collected || s.collectPhase < 1.2);
    }

    // Ambient snow
    for (const s of this.ambientSnow) {
      s.y += s.speed * dt;
      s.x += Math.sin(this.babyPhase + s.wobble) * 10 * dt;
      if (s.y > h + 20) { s.y = -20; s.x = Math.random() * w; }
    }

    this.particles.update(dt);
    this.message.update(dt);

    return null;
  }

  draw(ctx, w, h) {
    this._drawBackground(ctx, w, h);
    this._drawMomElsa(ctx, w, h);
    this._drawBelly(ctx, w, h);
    this._drawBaby(ctx, w, h);
    this._drawWantBubble(ctx, w, h);
    this._drawGrowthBar(ctx, w, h);
    this._drawDislikeBar(ctx, w, h);
    this._drawSnowflakes(ctx, w, h);

    this.particles.draw(ctx);

    // Combo indicator
    if (this.combo >= 2) {
      ctx.save();
      ctx.font = 'Bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#4FC3F7';
      ctx.fillText(`❄️ ${this.combo} 콤보!`, w / 2, h * 0.52);
      ctx.restore();
    }

    this.message.draw(ctx, w, h);

    // Ice freeze overlay
    if (this.frozen || this.iceAlpha > 0) {
      this._drawIceOverlay(ctx, w, h);
    }
  }

  _drawBackground(ctx, w, h) {
    // Night sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#050520');
    grad.addColorStop(0.3, '#0d1b3e');
    grad.addColorStop(0.6, '#1a3a5c');
    grad.addColorStop(0.85, '#2a5298');
    grad.addColorStop(1, '#4a6aa8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Snow-covered mountains silhouette
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#1a2a4a';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.75);
    ctx.lineTo(w * 0.15, h * 0.55);
    ctx.lineTo(w * 0.25, h * 0.65);
    ctx.lineTo(w * 0.4, h * 0.5);
    ctx.lineTo(w * 0.55, h * 0.6);
    ctx.lineTo(w * 0.7, h * 0.45);
    ctx.lineTo(w * 0.85, h * 0.55);
    ctx.lineTo(w, h * 0.65);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Snow ground
    ctx.fillStyle = 'rgba(200, 220, 240, 0.15)';
    ctx.fillRect(0, this.groundY, w, h - this.groundY);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(0, this.groundY, w, 3);

    // Ambient snowflakes
    for (const s of this.ambientSnow) {
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.font = `${s.size}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('❄️', s.x, s.y);
      ctx.restore();
    }

    // Pine trees silhouette at bottom
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#0a1a3a';
    this._drawPine(ctx, w * 0.05, this.groundY, 25, 80);
    this._drawPine(ctx, w * 0.12, this.groundY, 20, 65);
    this._drawPine(ctx, w * 0.88, this.groundY, 20, 70);
    this._drawPine(ctx, w * 0.95, this.groundY, 25, 85);
    ctx.restore();
  }

  _drawPine(ctx, x, baseY, width, height) {
    ctx.fillRect(x - 3, baseY - height * 0.2, 6, height * 0.2);
    for (let i = 0; i < 3; i++) {
      const layerY = baseY - height * 0.2 - i * height * 0.25;
      const layerW = width * (1.2 - i * 0.3);
      ctx.beginPath();
      ctx.moveTo(x, layerY - height * 0.25);
      ctx.lineTo(x - layerW, layerY);
      ctx.lineTo(x + layerW, layerY);
      ctx.closePath();
      ctx.fill();
    }
  }

  _drawMomElsa(ctx, w, h) {
    const momX = w / 2;
    const momY = h * 0.12;
    const bob = Math.sin(this.momPhase * 1.2) * 3;

    drawElsaMom(ctx, momX, momY + bob, 1.0);

    ctx.save();
    ctx.font = 'Bold 14px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#B3E5FC';
    ctx.fillText('엄마 엘사', momX, momY + bob + 65);
    ctx.restore();
  }

  _drawBelly(ctx, w, h) {
    const cx = w / 2;
    const cy = h * 0.35;
    const growthRatio = this.growth / GAME.maxGrowth;
    const baseRadius = 55 + growthRatio * 35;

    ctx.save();
    const glowGrad = ctx.createRadialGradient(cx, cy, baseRadius * 0.5, cx, cy, baseRadius * 1.3);
    glowGrad.addColorStop(0, 'rgba(79, 195, 247, 0.1)');
    glowGrad.addColorStop(0.7, 'rgba(79, 195, 247, 0.05)');
    glowGrad.addColorStop(1, 'rgba(79, 195, 247, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, baseRadius * 1.3, 0, Math.PI * 2);
    ctx.fill();

    const bellyGrad = ctx.createRadialGradient(cx, cy - 10, 0, cx, cy, baseRadius);
    bellyGrad.addColorStop(0, 'rgba(129, 212, 250, 0.25)');
    bellyGrad.addColorStop(0.7, 'rgba(79, 195, 247, 0.15)');
    bellyGrad.addColorStop(1, 'rgba(41, 121, 255, 0.1)');
    ctx.fillStyle = bellyGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(79, 195, 247, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

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
    const cy = h * 0.35;
    const growthRatio = this.growth / GAME.maxGrowth;

    let stage = GROWTH_STAGES[0];
    for (const s of GROWTH_STAGES) {
      if (growthRatio >= s.threshold) stage = s;
    }

    const babySize = 20 + growthRatio * 35;
    const bob = Math.sin(this.babyPhase * 2) * 4;
    const shakeX = this.babyShake > 0 ? Math.sin(this.babyPhase * 30) * 5 * this.babyShake : 0;

    drawBabyElsa(ctx, cx + shakeX, cy + bob, babySize, this.babyEmotion, this.babyPhase, growthRatio);

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

    ctx.save();
    ctx.font = 'Bold 13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#B3E5FC';
    ctx.fillText(`❄️ 성장 ${Math.floor(ratio * 100)}%`, barX, barY - 4);

    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 11);
    ctx.fill();

    if (ratio > 0) {
      const grad = ctx.createLinearGradient(barX, 0, barX + barW * ratio, 0);
      grad.addColorStop(0, '#4FC3F7');
      grad.addColorStop(1, '#0288D1');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW * ratio, barH, 11);
      ctx.fill();

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

    if (ratio > 0.7) {
      const flash = Math.sin(this.babyPhase * 6) * 0.3;
      ctx.fillStyle = `rgba(255,0,0,${0.1 + flash})`;
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW, barH, 7);
      ctx.fill();
    }

    ctx.restore();
  }

  _drawSnowflakes(ctx, w, h) {
    // Label
    ctx.save();
    ctx.font = 'Bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFF';
    ctx.fillText('❄️ 눈송이를 터치해서 음식을 잡아요!', w / 2, h * 0.55);
    ctx.restore();

    for (const s of this.snowflakeItems) {
      ctx.save();

      if (s.collected) {
        const t = s.collectPhase;
        ctx.globalAlpha = Math.max(0, 1 - t);

        if (s.correct) {
          // Fly up toward baby
          ctx.translate(s.x, s.y - t * 80);
          ctx.scale(1 + t * 0.3, 1 + t * 0.3);
        } else {
          // Shake and fade
          const shake = Math.sin(t * 20) * 8 * (1 - t);
          ctx.translate(s.x + shake, s.y);
        }
      } else {
        ctx.translate(s.x, s.y);
      }

      // Draw snowflake crystal shape
      const bgColor = s.isTroll ? '#3D1A5D' : '#1a2a4a';
      const borderColor = s.isTroll ? '#8B3DAA' : '#4A7AAA';

      // Snowflake circle background
      ctx.fillStyle = bgColor;
      ctx.beginPath();
      ctx.arc(0, 0, s.size * 0.55, 0, Math.PI * 2);
      ctx.fill();

      // Crystal border
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Snowflake decoration (rotating ❄️ behind)
      if (!s.collected) {
        ctx.save();
        ctx.globalAlpha = 0.2;
        ctx.rotate(s.rotation);
        ctx.font = `${s.size * 0.9}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('❄️', 0, 0);
        ctx.restore();
      }

      // Food emoji
      const foodSize = Math.max(18, s.size * 0.5);
      ctx.font = `${foodSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.food.emoji, 0, 0);

      // Troll warning glow
      if (s.isTroll && !s.collected) {
        const warnWidth = 1.5 + Math.sin(s.wobblePhase * 2) * 1.5;
        ctx.strokeStyle = '#AA44DD';
        ctx.lineWidth = warnWidth;
        ctx.beginPath();
        ctx.arc(0, 0, s.size * 0.65, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  _drawIceOverlay(ctx, w, h) {
    ctx.save();

    ctx.fillStyle = `rgba(173, 216, 250, ${this.iceAlpha * 0.6})`;
    ctx.fillRect(0, 0, w, h);

    const edgeGrad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.2, w / 2, h / 2, Math.max(w, h) * 0.7);
    edgeGrad.addColorStop(0, 'rgba(255,255,255,0)');
    edgeGrad.addColorStop(0.6, 'rgba(200,230,255,0)');
    edgeGrad.addColorStop(1, `rgba(200,230,255,${this.iceAlpha * 0.5})`);
    ctx.fillStyle = edgeGrad;
    ctx.fillRect(0, 0, w, h);

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

    ctx.globalAlpha = this.iceAlpha;
    const frozenEmojis = ['❄️', '🧊', '❄️', '💎'];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + this.babyPhase * 0.3;
      const r = 80 + Math.sin(i * 1.7) * 40;
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(frozenEmojis[i % frozenEmojis.length], w / 2 + Math.cos(angle) * r, h / 2 + Math.sin(angle) * r);
    }

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
