/**
 * Main gameplay - Mermaid baby game
 * "Fish Delivery" mechanic: sea creatures swim across the screen carrying food
 * Key difference: fish swim continuously (pass-through) instead of stopping at targets
 */
import { FOODS, ANIMALS, POISON, GROWTH_STAGES, GAME } from '../config.js';
import { ParticleSystem } from '../../../shared/ParticleSystem.js';
import { Message } from '../../../shared/ui/Message.js';
import { drawMermaidMom, drawBabyMermaid, drawSeaWitch } from '../draw-mermaid.js';

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

    // === Fish delivery system ===
    this.animals = [];
    this.animalSpawnTimer = 0.5;
    this.crowTimer = GAME.crowInterval;

    // Whirlpool curse state
    this.cursed = false;
    this.curseTimer = 0;
    this.curseAlpha = 0;

    // Baby animation
    this.babyPhase = 0;
    this.babyEmotion = 'neutral';
    this.emotionTimer = 0;
    this.babyShake = 0;

    // Mom phase
    this.momPhase = 0;

    // Effects
    this.particles = new ParticleSystem();
    this.message = new Message();

    // Ambient bubbles (float UPWARD)
    this.ambientItems = [];
    for (let i = 0; i < 12; i++) {
      this.ambientItems.push({
        x: Math.random() * w,
        y: Math.random() * h,
        speed: 10 + Math.random() * 20,
        size: 8 + Math.random() * 10,
        wobble: Math.random() * Math.PI * 2,
        emoji: Math.random() > 0.5 ? '🫧' : '✨',
      });
    }

    // Light rays (caustic effect) - diagonal beams from top
    this.lightRays = [];
    for (let i = 0; i < 6; i++) {
      this.lightRays.push({
        x: Math.random() * w,
        width: 30 + Math.random() * 60,
        speed: 0.3 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.03 + Math.random() * 0.04,
        angle: -0.15 + Math.random() * 0.3,
      });
    }

    this.message.show('물고기를 터치! 아기가 원하는 음식을 낚아채요! 🐠', 3);
  }

  _pickNewWant() {
    const idx = Math.floor(Math.random() * FOODS.length);
    this.wantedFood = FOODS[idx];
    this.wantTimer = GAME.wantChangeInterval;
  }

  _spawnAnimal() {
    if (this.animals.length >= GAME.maxAnimals) return;

    const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    const food = this._pickAnimalFood();

    // Spawn from left or right edge
    const fromLeft = Math.random() < 0.5;
    const swimDirection = fromLeft ? 1 : -1;
    const spawnX = fromLeft ? -50 : this.w + 50;
    // Fish area: 60-90% of screen height
    const spawnY = this.h * (0.60 + Math.random() * 0.30);

    this.animals.push({
      animalType: animal,
      food: food,
      x: spawnX,
      y: spawnY,
      baseY: spawnY,
      vx: 0,
      vy: 0,
      speed: animal.speed,
      size: animal.size,
      swimDirection: swimDirection,
      swimAmplitude: animal.swimAmplitude,
      swimFrequency: animal.swimFrequency,
      collected: false,
      collectPhase: 0,
      correct: false,
      isCrow: false,
      bouncePhase: Math.random() * Math.PI * 2,
      lifetime: 0,
      swimTime: 0,
    });
  }

  _spawnCrow() {
    const fromLeft = Math.random() < 0.5;
    const swimDirection = fromLeft ? 1 : -1;
    const spawnX = fromLeft ? -50 : this.w + 50;
    const spawnY = this.h * (0.60 + Math.random() * 0.30);

    // Sea witch disguises food as what baby wants
    this.animals.push({
      animalType: { type: 'seawitch', emoji: POISON.emoji, name: POISON.name, speed: POISON.speed, size: POISON.size,
        swimAmplitude: 25, swimFrequency: 2 },
      food: { type: 'poison', emoji: this.wantedFood.emoji, name: POISON.foodName, color: '#800080' },
      x: spawnX,
      y: spawnY,
      baseY: spawnY,
      vx: 0,
      vy: 0,
      speed: POISON.speed,
      size: POISON.size,
      swimDirection: swimDirection,
      swimAmplitude: 25,
      swimFrequency: 2,
      collected: false,
      collectPhase: 0,
      correct: false,
      isCrow: true,
      bouncePhase: Math.random() * Math.PI * 2,
      lifetime: 0,
      swimTime: 0,
    });
  }

  _pickAnimalFood() {
    if (Math.random() < 0.5) {
      return this.wantedFood;
    }
    return FOODS[Math.floor(Math.random() * FOODS.length)];
  }

  handleTap(x, y) {
    if (this.cursed) return;

    // Check animal taps (reverse for z-order)
    for (let i = this.animals.length - 1; i >= 0; i--) {
      const a = this.animals[i];
      if (a.collected) continue;

      const hitSize = a.size * 1.2;
      if (x >= a.x - hitSize && x <= a.x + hitSize &&
          y >= a.y - hitSize && y <= a.y + hitSize) {
        if (a.isCrow) {
          this._tapCrow(a);
        } else {
          this._feedBaby(a);
        }
        return;
      }
    }
  }

  _feedBaby(animal) {
    this.totalFed++;
    const correct = animal.food.type === this.wantedFood.type;

    animal.collected = true;
    animal.collectPhase = 0;
    animal.correct = correct;

    if (correct) {
      this.combo++;
      this.correctFed++;
      const bonus = GAME.growthPerCorrect + this.combo * GAME.comboBonus;
      this.growth = Math.min(GAME.maxGrowth, this.growth + bonus);
      this.dislike = Math.max(0, this.dislike - 10);

      this.babyEmotion = 'happy';
      this.emotionTimer = 1.5;

      this.particles.createParticles(animal.x, animal.y - 20, '#4FC3F7', 12);
      this.particles.createStars(this.w / 2, this.h * 0.35, 5);
      this.particles.addFloatingText(animal.x, animal.y - 40, `+${bonus} 🫧`, '#4FC3F7', 28);

      if (this.combo >= 3) {
        this.message.show(`🌊 ${this.combo} 콤보! 아기가 아주 좋아해요! ✨`);
      }

      this._pickNewWant();

      if (this.growth >= GAME.maxGrowth) {
        return;
      }
    } else {
      this.combo = 0;
      this.growth = Math.max(0, this.growth + GAME.growthPerWrong);
      this.dislike = Math.min(GAME.maxDislike, this.dislike + GAME.dislikePerWrong);

      this.babyEmotion = 'sad';
      this.emotionTimer = 1.2;
      this.babyShake = 0.5;

      this.particles.addFloatingText(animal.x, animal.y - 40, '싫어요! 😣', '#FFA726', 24);

      if (this.dislike >= GAME.maxDislike) {
        this._triggerWhirlpoolCurse();
      }
    }
  }

  _tapCrow(crow) {
    crow.collected = true;
    crow.collectPhase = 0;
    crow.correct = false;

    this.growth = Math.max(0, this.growth + GAME.poisonPenalty);
    this.dislike = Math.min(GAME.maxDislike, this.dislike + GAME.poisonDislike);
    this.combo = 0;

    this.babyEmotion = 'angry';
    this.emotionTimer = 2.0;
    this.babyShake = 0.8;

    this.particles.addFloatingText(crow.x, crow.y - 40, '먹물이다! 🖤', '#1A1A2E', 30);
    this.particles.createParticles(crow.x, crow.y, '#1A1A2E', 15);
    const healthTips = [
      '🐙 바닷물을 마시면 안 돼요! 소금물이라 배탈나요!',
      '🐙 물놀이할 때는 어른과 함께해야 안전해요!',
      '🐙 바다에서 모르는 생물은 만지면 안 돼요!',
      '🐙 수영 전에 준비운동을 꼭 해야 해요!',
      '🐙 햇볕이 강할 때는 선크림을 발라요!',
    ];
    this.message.show(healthTips[Math.floor(Math.random() * healthTips.length)], 4);

    if (this.dislike >= GAME.maxDislike) {
      this._triggerWhirlpoolCurse();
    }
  }

  _triggerWhirlpoolCurse() {
    this.cursed = true;
    this.curseTimer = GAME.curseDuration;
    this.curseAlpha = 0;
    this.dislike = 0;
    this.babyEmotion = 'angry';
    this.emotionTimer = GAME.curseDuration;
    this.message.show('🌀 소용돌이 저주! 🌀', 3);
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

    // Curse state
    if (this.cursed) {
      this.curseTimer -= dt;
      this.curseAlpha = Math.min(1, this.curseAlpha + dt * 3);
      if (this.curseTimer <= 0) {
        this.cursed = false;
        this.curseAlpha = 0;
        this.babyEmotion = 'neutral';
        this._pickNewWant();
      }
    }

    // Want timer
    if (!this.cursed) {
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
      if (this.emotionTimer <= 0 && !this.cursed) {
        this.babyEmotion = 'neutral';
      }
    }

    // Baby shake
    if (this.babyShake > 0) {
      this.babyShake = Math.max(0, this.babyShake - dt * 2);
    }

    // Difficulty ramp
    const difficulty = 1 + (this.growth / GAME.maxGrowth) * 2;

    // === Fish system update ===
    if (!this.cursed) {
      // Spawn fish (faster as difficulty rises)
      this.animalSpawnTimer -= dt;
      const spawnRate = Math.max(0.8, GAME.animalSpawnInterval / difficulty);
      if (this.animalSpawnTimer <= 0 && this.animals.filter(a => !a.collected).length < GAME.maxAnimals) {
        this._spawnAnimal();
        this.animalSpawnTimer = spawnRate;
      }

      // Ensure minimum fish
      const activeAnimals = this.animals.filter(a => !a.collected && !a.isCrow);
      if (activeAnimals.length < GAME.minAnimals) {
        this._spawnAnimal();
      }

      // Sea witch timer (more frequent)
      this.crowTimer -= dt;
      const witchRate = Math.max(6, GAME.crowInterval / difficulty);
      if (this.crowTimer <= 0) {
        this._spawnCrow();
        this.crowTimer = witchRate;
      }

      // Update fish
      for (const a of this.animals) {
        a.lifetime += dt;
        a.bouncePhase += dt * 4;
        a.swimTime += dt;

        if (a.collected) {
          a.collectPhase += dt * 3;
        } else {
          // === CONTINUOUS SWIM (pass-through) ===
          // Fish swim horizontally across the screen
          a.x += a.swimDirection * a.speed * dt;

          // Sine-wave vertical oscillation
          a.y = a.baseY + Math.sin(a.swimTime * a.swimFrequency) * a.swimAmplitude;

          // Clamp y to fish area (60-90% screen)
          const minY = h * 0.60;
          const maxY = h * 0.90;
          if (a.y < minY) a.y = minY;
          if (a.y > maxY) a.y = maxY;

          // Remove if reached opposite edge
          if (a.swimDirection > 0 && a.x > w + 60) {
            a.collected = true;
            a.collectPhase = 10; // instant removal
          } else if (a.swimDirection < 0 && a.x < -60) {
            a.collected = true;
            a.collectPhase = 10; // instant removal
          }
        }
      }

      // Collision detection & response between active fish
      const active = this.animals.filter(a => !a.collected);
      for (let i = 0; i < active.length; i++) {
        for (let j = i + 1; j < active.length; j++) {
          const a = active[i];
          const b = active[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = (a.size + b.size) * 0.75;

          if (dist < minDist && dist > 0.01) {
            const nx = dx / dist;
            const ny = dy / dist;

            // Push apart vertically (don't stop horizontal swim)
            const overlap = minDist - dist;
            a.baseY -= ny * overlap * 0.5;
            b.baseY += ny * overlap * 0.5;

            // Clamp baseY to fish area
            const minBaseY = h * 0.60;
            const maxBaseY = h * 0.90;
            a.baseY = Math.max(minBaseY, Math.min(maxBaseY, a.baseY));
            b.baseY = Math.max(minBaseY, Math.min(maxBaseY, b.baseY));
          }
        }
      }

      // Remove fully faded or exited fish
      this.animals = this.animals.filter(a => !a.collected || a.collectPhase < 1.2);
    }

    // Ambient bubbles (float upward)
    for (const s of this.ambientItems) {
      s.y -= s.speed * dt;
      s.x += Math.sin(this.babyPhase + s.wobble) * 8 * dt;
      if (s.y < -20) { s.y = h + 20; s.x = Math.random() * w; }
    }

    // Light rays sway
    for (const r of this.lightRays) {
      r.phase += r.speed * dt;
    }

    this.particles.update(dt);
    this.message.update(dt);

    return null;
  }

  draw(ctx, w, h) {
    this._drawBackground(ctx, w, h);
    this._drawMom(ctx, w, h);
    this._drawBelly(ctx, w, h);
    this._drawBaby(ctx, w, h);
    this._drawWantBubble(ctx, w, h);
    this._drawGrowthBar(ctx, w, h);
    this._drawDislikeBar(ctx, w, h);
    this._drawAnimals(ctx, w, h);

    this.particles.draw(ctx);

    // Combo indicator
    if (this.combo >= 2) {
      ctx.save();
      ctx.font = 'Bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#4FC3F7';
      ctx.fillText(`🌊 ${this.combo} 콤보!`, w / 2, h * 0.52);
      ctx.restore();
    }

    this.message.draw(ctx, w, h);

    // Whirlpool curse overlay
    if (this.cursed || this.curseAlpha > 0) {
      this._drawCurseOverlay(ctx, w, h);
    }
  }

  _drawBackground(ctx, w, h) {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#050520');
    grad.addColorStop(0.4, '#0a1a3a');
    grad.addColorStop(0.7, '#1a3050');
    grad.addColorStop(1, '#1a4060');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Light rays (caustic effect from top)
    for (const r of this.lightRays) {
      const sway = Math.sin(r.phase) * 30;
      ctx.save();
      ctx.globalAlpha = r.alpha;
      ctx.fillStyle = '#4FC3F7';

      ctx.beginPath();
      const topX = r.x + sway;
      const bottomX = topX + r.angle * h;
      ctx.moveTo(topX - r.width * 0.3, 0);
      ctx.lineTo(topX + r.width * 0.3, 0);
      ctx.lineTo(bottomX + r.width * 0.8, h);
      ctx.lineTo(bottomX - r.width * 0.8, h);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Coral/seaweed silhouettes at bottom
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#0a0a2e';
    this._drawBgCoral(ctx, w * 0.02, h, 30, 150);
    this._drawBgCoral(ctx, w * 0.12, h, 25, 120);
    this._drawBgSeaweed(ctx, w * 0.08, h, 15, 100);
    this._drawBgCoral(ctx, w * 0.88, h, 25, 130);
    this._drawBgCoral(ctx, w * 0.98, h, 30, 140);
    this._drawBgSeaweed(ctx, w * 0.92, h, 15, 110);
    ctx.restore();

    // Ambient bubbles (float upward)
    for (const s of this.ambientItems) {
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.font = `${s.size}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(s.emoji, s.x, s.y);
      ctx.restore();
    }
  }

  _drawBgCoral(ctx, x, baseY, width, height) {
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

    // Top cap
    ctx.beginPath();
    ctx.arc(x, baseY - height * 0.85, width * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawBgSeaweed(ctx, x, baseY, width, height) {
    // Wavy seaweed using sine curves
    ctx.beginPath();
    ctx.moveTo(x - width * 0.5, baseY);
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const sy = baseY - t * height;
      const sx = x + Math.sin(t * Math.PI * 3 + this.babyPhase * 0.5) * width * 0.5;
      ctx.lineTo(sx + width * 0.3, sy);
    }
    for (let i = 20; i >= 0; i--) {
      const t = i / 20;
      const sy = baseY - t * height;
      const sx = x + Math.sin(t * Math.PI * 3 + this.babyPhase * 0.5) * width * 0.5;
      ctx.lineTo(sx - width * 0.3, sy);
    }
    ctx.closePath();
    ctx.fill();
  }

  _drawMom(ctx, w, h) {
    const momX = w / 2;
    const momY = h * 0.12;
    const bob = Math.sin(this.momPhase * 1.2) * 3;

    drawMermaidMom(ctx, momX, momY + bob, 1.0);

    ctx.save();
    ctx.font = 'Bold 14px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#80DEEA';
    ctx.fillText('인어공주', momX, momY + bob + 65);
    ctx.restore();
  }

  _drawBelly(ctx, w, h) {
    const cx = w / 2;
    const cy = h * 0.35;
    const growthRatio = this.growth / GAME.maxGrowth;
    const baseRadius = 55 + growthRatio * 35;

    ctx.save();
    // Glow (cyan tones)
    const glowGrad = ctx.createRadialGradient(cx, cy, baseRadius * 0.5, cx, cy, baseRadius * 1.3);
    glowGrad.addColorStop(0, 'rgba(0, 188, 212, 0.1)');
    glowGrad.addColorStop(0.7, 'rgba(0, 188, 212, 0.05)');
    glowGrad.addColorStop(1, 'rgba(0, 188, 212, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, baseRadius * 1.3, 0, Math.PI * 2);
    ctx.fill();

    // Belly
    const bellyGrad = ctx.createRadialGradient(cx, cy - 10, 0, cx, cy, baseRadius);
    bellyGrad.addColorStop(0, 'rgba(128, 222, 234, 0.25)');
    bellyGrad.addColorStop(0.7, 'rgba(0, 188, 212, 0.15)');
    bellyGrad.addColorStop(1, 'rgba(0, 131, 143, 0.1)');
    ctx.fillStyle = bellyGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(0, 188, 212, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Bubble sparkles around belly
    const sparkCount = 6;
    for (let i = 0; i < sparkCount; i++) {
      const angle = (i / sparkCount) * Math.PI * 2 + this.babyPhase * 0.5;
      const sx = cx + Math.cos(angle) * (baseRadius + 8);
      const sy = cy + Math.sin(angle) * (baseRadius + 8);
      ctx.globalAlpha = 0.3 + Math.sin(this.babyPhase * 3 + i) * 0.2;
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🫧', sx, sy);
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

    drawBabyMermaid(ctx, cx + shakeX, cy + bob, babySize, this.babyEmotion, this.babyPhase, growthRatio);

    ctx.save();
    ctx.font = '13px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#80DEEA';
    ctx.fillText(`${stage.name} 단계 - ${stage.desc}`, cx, cy + babySize + 20);
    ctx.restore();
  }

  _drawWantBubble(ctx, w, h) {
    if (this.cursed) return;

    const cx = w / 2 + 50;
    const cy = h * 0.22;

    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.roundRect(cx - 35, cy - 28, 70, 56, 16);
    ctx.fill();

    // Speech bubble tail
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

    // Timer urgency
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
    ctx.fillStyle = '#80DEEA';
    ctx.fillText(`🫧 성장 ${Math.floor(ratio * 100)}%`, barX, barY - 4);

    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 11);
    ctx.fill();

    if (ratio > 0) {
      const grad = ctx.createLinearGradient(barX, 0, barX + barW * ratio, 0);
      grad.addColorStop(0, '#26C6DA');
      grad.addColorStop(1, '#00838F');
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
    ctx.fillStyle = ratio > 0.6 ? '#FF4444' : '#80DEEA';
    ctx.fillText(`🌀 싫음`, barX, barY - 3);

    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 7);
    ctx.fill();

    if (ratio > 0) {
      const grad = ctx.createLinearGradient(barX, 0, barX + barW * ratio, 0);
      grad.addColorStop(0, '#9C27B0');
      grad.addColorStop(1, ratio > 0.7 ? '#6A1B9A' : '#AB47BC');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW * ratio, barH, 7);
      ctx.fill();
    }

    if (ratio > 0.7) {
      const flash = Math.sin(this.babyPhase * 6) * 0.3;
      ctx.fillStyle = `rgba(128,0,128,${0.1 + flash})`;
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW, barH, 7);
      ctx.fill();
    }

    ctx.restore();
  }

  _drawAnimals(ctx, w, h) {
    // Label
    ctx.save();
    ctx.font = 'Bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFF';
    ctx.fillText('🐠 물고기를 터치해서 음식을 낚아채세요!', w / 2, h * 0.58);
    ctx.restore();

    for (const a of this.animals) {
      ctx.save();

      const bounce = Math.sin(a.bouncePhase) * 6;

      if (a.collected && a.collectPhase < 1.2) {
        const t = a.collectPhase;
        ctx.globalAlpha = Math.max(0, 1 - t);

        if (a.correct) {
          // Correct: fish gets "pulled up" toward baby (animate y upward while fading)
          ctx.translate(a.x, a.y - t * 80 + bounce);
          ctx.scale(1 - t * 0.5, 1 - t * 0.5);
        } else {
          // Wrong: fish darts away quickly in its swim direction
          const dartX = a.swimDirection * t * 150;
          ctx.translate(a.x + dartX, a.y + bounce);
          ctx.scale(1 - t * 0.3, 1 - t * 0.3);
        }
      } else if (a.collected) {
        ctx.restore();
        continue;
      } else {
        // Flip fish based on swim direction
        ctx.translate(a.x, a.y + bounce);
        if (a.swimDirection < 0) {
          ctx.scale(-1, 1);
        }
      }

      // Draw fish body circle
      const bgColor = a.isCrow ? '#3D1A3D' : '#1A2A4A';
      const borderColor = a.isCrow ? '#6B2D6B' : '#4A6A8A';
      ctx.fillStyle = bgColor;
      ctx.beginPath();
      ctx.arc(0, 0, a.size * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Reset scale for emoji (so text isn't mirrored)
      if (a.swimDirection < 0 && !a.collected) {
        ctx.scale(-1, 1);
      }

      // Animal emoji or sea witch sprite
      if (a.isCrow) {
        drawSeaWitch(ctx, 0, -a.size * 0.25, a.size * 0.7, POISON.emoji);
      } else {
        const animalFontSize = Math.max(20, a.size * 0.65);
        ctx.font = `${animalFontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(a.animalType.emoji, 0, -a.size * 0.25);
      }

      // Food emoji (below animal)
      const foodFontSize = Math.max(16, a.size * 0.5);
      ctx.font = `${foodFontSize}px sans-serif`;
      ctx.fillText(a.food.emoji, 0, a.size * 0.3);

      // Sea witch warning pulse
      if (a.isCrow && !a.collected) {
        // Undo any scale for the circle
        if (a.swimDirection < 0) {
          ctx.scale(-1, 1);
        }
        const warnWidth = 1.5 + Math.sin(a.bouncePhase * 2) * 1.5;
        ctx.strokeStyle = '#AA44AA';
        ctx.lineWidth = warnWidth;
        ctx.beginPath();
        ctx.arc(0, 0, a.size * 0.8, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  _drawCurseOverlay(ctx, w, h) {
    ctx.save();

    // Dark blue/purple overlay
    ctx.fillStyle = `rgba(10, 10, 50, ${this.curseAlpha * 0.7})`;
    ctx.fillRect(0, 0, w, h);

    // Vignette
    const edgeGrad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.15, w / 2, h / 2, Math.max(w, h) * 0.7);
    edgeGrad.addColorStop(0, 'rgba(20, 0, 60, 0)');
    edgeGrad.addColorStop(0.6, 'rgba(15, 0, 45, 0)');
    edgeGrad.addColorStop(1, `rgba(10, 0, 40, ${this.curseAlpha * 0.5})`);
    ctx.fillStyle = edgeGrad;
    ctx.fillRect(0, 0, w, h);

    // Whirlpool spiral in center
    if (this.curseAlpha > 0.3) {
      const spiralAlpha = (this.curseAlpha - 0.3) * 1.4;
      ctx.globalAlpha = Math.min(1, spiralAlpha);

      // Draw concentric rotating arcs (whirlpool)
      const spiralSize = Math.min(120, w * 0.3);
      for (let ring = 0; ring < 5; ring++) {
        const radius = spiralSize * (0.2 + ring * 0.18);
        const rotation = this.babyPhase * (2 - ring * 0.3) + ring * 0.5;
        const arcLength = Math.PI * (1.2 + ring * 0.15);

        ctx.strokeStyle = `rgba(0, 188, 212, ${0.4 - ring * 0.06})`;
        ctx.lineWidth = 3 - ring * 0.3;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2 - 20, radius, rotation, rotation + arcLength);
        ctx.stroke();
      }

      // Whirlpool center glow
      const whirlGrad = ctx.createRadialGradient(w / 2, h / 2 - 20, 0, w / 2, h / 2 - 20, spiralSize * 0.3);
      whirlGrad.addColorStop(0, 'rgba(0, 188, 212, 0.3)');
      whirlGrad.addColorStop(0.7, 'rgba(26, 35, 126, 0.2)');
      whirlGrad.addColorStop(1, 'rgba(10, 10, 50, 0.1)');
      ctx.fillStyle = whirlGrad;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2 - 20, spiralSize * 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Floating curse emojis
      const curseEmojis = ['🌀', '🐙', '⚡', '🔱'];
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + this.babyPhase * 0.4;
        const r = 90 + Math.sin(i * 1.7) * 30;
        ctx.font = '22px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(curseEmojis[i % curseEmojis.length], w / 2 + Math.cos(angle) * r, h / 2 + Math.sin(angle) * r);
      }
    }

    if (this.cursed) {
      ctx.globalAlpha = 1;
      ctx.font = 'Bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFF';
      ctx.shadowColor = '#0097A7';
      ctx.shadowBlur = 20;
      ctx.fillText(`🌀 ${Math.ceil(this.curseTimer)}초 🌀`, w / 2, h / 2 + 60);
      ctx.shadowBlur = 0;

      ctx.font = '18px sans-serif';
      ctx.fillStyle = '#80DEEA';
      ctx.fillText('소용돌이 저주!', w / 2, h / 2 + 95);
    }

    ctx.restore();
  }

  getSaveData() {
    return {
      growth: this.growth,
      dislike: this.dislike,
      combo: this.combo,
      totalFed: this.totalFed,
      correctFed: this.correctFed,
      savedAt: Date.now(),
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
      growth: this.growth,
      totalFed: this.totalFed,
      correctFed: this.correctFed,
      accuracy: this.totalFed > 0 ? Math.round((this.correctFed / this.totalFed) * 100) : 0,
    };
  }
}
