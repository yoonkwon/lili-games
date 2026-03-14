/**
 * Main gameplay - Snow White baby game
 * "Animal Delivery" mechanic: forest animals bring food to the baby
 */
import { FOODS, ANIMALS, POISON, GROWTH_STAGES, GAME } from '../config.js';
import { ParticleSystem } from '../../../shared/ParticleSystem.js';
import { Message } from '../../../shared/ui/Message.js';
import { drawSnowWhiteMom, drawBabySnowWhite } from '../draw-snow-white.js';

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

    // === Animal delivery system ===
    this.animals = [];
    this.animalSpawnTimer = 0.5; // start spawning quickly
    this.crowTimer = GAME.crowInterval;

    // Magic mirror curse state (replaces ice freeze)
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

    // Ambient floating elements (leaves, fireflies)
    this.ambientItems = [];
    for (let i = 0; i < 12; i++) {
      this.ambientItems.push({
        x: Math.random() * w,
        y: Math.random() * h,
        speed: 10 + Math.random() * 20,
        size: 8 + Math.random() * 10,
        wobble: Math.random() * Math.PI * 2,
        emoji: Math.random() > 0.5 ? '🍃' : '✨',
      });
    }

    // Fireflies
    this.fireflies = [];
    for (let i = 0; i < 8; i++) {
      this.fireflies.push({
        x: Math.random() * w,
        y: h * 0.3 + Math.random() * h * 0.5,
        phase: Math.random() * Math.PI * 2,
        radius: 20 + Math.random() * 40,
        speed: 0.5 + Math.random() * 1.0,
      });
    }

    this.message.show('동물을 터치! 아기가 원하는 음식을 골라줘요! 🌸', 3);
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
    const spawn = this._getSpawnPosition();
    const targetX = this.w * (0.2 + Math.random() * 0.6);
    const targetY = this.h * (0.6 + Math.random() * 0.15);

    this.animals.push({
      animalType: animal,
      food: food,
      x: spawn.x,
      y: spawn.y,
      targetX: targetX,
      targetY: targetY,
      speed: animal.speed,
      size: animal.size,
      collected: false,
      collectPhase: 0,
      correct: false,        // set on collection
      isCrow: false,
      bouncePhase: Math.random() * Math.PI * 2,
      arrived: false,
      lifetime: 0,
      stayTimer: 8,          // how long to stay at target before leaving
    });
  }

  _spawnCrow() {
    const spawn = this._getSpawnPosition();
    const targetX = this.w * (0.2 + Math.random() * 0.6);
    const targetY = this.h * (0.6 + Math.random() * 0.15);

    this.animals.push({
      animalType: { type: 'crow', emoji: POISON.emoji, name: POISON.name, speed: POISON.speed, size: POISON.size },
      food: { type: 'poison', emoji: POISON.foodEmoji, name: POISON.foodName, color: '#800080' },
      x: spawn.x,
      y: spawn.y,
      targetX: targetX,
      targetY: targetY,
      speed: POISON.speed,
      size: POISON.size,
      collected: false,
      collectPhase: 0,
      correct: false,
      isCrow: true,
      bouncePhase: Math.random() * Math.PI * 2,
      arrived: false,
      lifetime: 0,
      stayTimer: POISON.stayDuration,
    });
  }

  _getSpawnPosition() {
    const edge = Math.floor(Math.random() * 3); // 0=top, 1=left, 2=right
    if (edge === 0) {
      return { x: Math.random() * this.w, y: -50 };
    } else if (edge === 1) {
      return { x: -50, y: this.h * (0.2 + Math.random() * 0.4) };
    } else {
      return { x: this.w + 50, y: this.h * (0.2 + Math.random() * 0.4) };
    }
  }

  _pickAnimalFood() {
    if (Math.random() < GAME.wantedFoodChance) {
      return this.wantedFood;
    }
    return FOODS[Math.floor(Math.random() * FOODS.length)];
  }

  handleTap(x, y) {
    if (this.cursed) return;

    // Check animal taps (check in reverse for z-order, newest on top)
    for (let i = this.animals.length - 1; i >= 0; i--) {
      const a = this.animals[i];
      if (a.collected) continue;

      const hitSize = a.size * 1.2; // generous tap target for children
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

      this.particles.createParticles(animal.x, animal.y - 20, '#FFD700', 12);
      this.particles.createStars(this.w / 2, this.h * 0.35, 5);
      this.particles.addFloatingText(animal.x, animal.y - 40, `+${bonus} 🌸`, '#FF69B4', 28);

      if (this.combo >= 3) {
        this.message.show(`${this.combo} 콤보! 아기가 아주 좋아해요! ✨`);
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
        this._triggerMirrorCurse();
      }
    }
  }

  _tapCrow(crow) {
    crow.collected = true;
    crow.collectPhase = 0;
    crow.correct = false;

    // Poison penalty
    this.growth = Math.max(0, this.growth + GAME.poisonPenalty);
    this.dislike = Math.min(GAME.maxDislike, this.dislike + GAME.poisonDislike);
    this.combo = 0;

    this.babyEmotion = 'angry';
    this.emotionTimer = 2.0;
    this.babyShake = 0.8;

    this.particles.addFloatingText(crow.x, crow.y - 40, '독사과! ☠️', '#800080', 30);
    this.particles.createParticles(crow.x, crow.y, '#800080', 15);
    this.message.show('☠️ 독사과예요! 까마귀를 조심하세요! ☠️', 3);

    if (this.dislike >= GAME.maxDislike) {
      this._triggerMirrorCurse();
    }
  }

  _triggerMirrorCurse() {
    this.cursed = true;
    this.curseTimer = GAME.curseDuration;
    this.curseAlpha = 0;
    this.dislike = 0;
    this.babyEmotion = 'angry';
    this.emotionTimer = GAME.curseDuration;
    this.message.show('🪞 마법 거울의 저주! 🪞', 3);
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

    // === Animal system update ===
    if (!this.cursed) {
      // Spawn animals
      this.animalSpawnTimer -= dt;
      if (this.animalSpawnTimer <= 0 && this.animals.filter(a => !a.collected).length < GAME.maxAnimals) {
        this._spawnAnimal();
        this.animalSpawnTimer = GAME.animalSpawnInterval;
      }

      // Ensure minimum animals
      const activeAnimals = this.animals.filter(a => !a.collected && !a.isCrow);
      if (activeAnimals.length < GAME.minAnimals) {
        this._spawnAnimal();
      }

      // Crow timer
      this.crowTimer -= dt;
      if (this.crowTimer <= 0) {
        this._spawnCrow();
        this.crowTimer = GAME.crowInterval;
      }

      // Update animals
      for (const a of this.animals) {
        a.lifetime += dt;
        a.bouncePhase += dt * 4;

        if (a.collected) {
          a.collectPhase += dt * 3;
        } else {
          // Move toward target
          const dx = a.targetX - a.x;
          const dy = a.targetY - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 5) {
            const moveSpeed = a.speed * dt;
            a.x += (dx / dist) * moveSpeed;
            a.y += (dy / dist) * moveSpeed;
          } else {
            a.arrived = true;
            a.stayTimer -= dt;

            // Gentle hovering when arrived
            a.x = a.targetX + Math.sin(a.bouncePhase * 0.5) * 5;
            a.y = a.targetY + Math.sin(a.bouncePhase * 0.7) * 3;
          }

          // If stayed too long, fly away (especially crow)
          if (a.arrived && a.stayTimer <= 0) {
            a.collected = true; // mark for removal via fade
            a.collectPhase = 0;
            a.correct = true; // neutral exit, no shake
          }
        }
      }

      // Remove fully faded animals
      this.animals = this.animals.filter(a => !a.collected || a.collectPhase < 1.2);
    }

    // Ambient items
    for (const s of this.ambientItems) {
      s.y += s.speed * dt;
      s.x += Math.sin(this.babyPhase + s.wobble) * 8 * dt;
      if (s.y > h + 20) { s.y = -20; s.x = Math.random() * w; }
    }

    // Fireflies
    for (const f of this.fireflies) {
      f.phase += f.speed * dt;
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
      ctx.fillStyle = '#FFD700';
      ctx.fillText(`🌟 ${this.combo} 콤보!`, w / 2, h * 0.52);
      ctx.restore();
    }

    this.message.draw(ctx, w, h);

    // Magic mirror curse overlay
    if (this.cursed || this.curseAlpha > 0) {
      this._drawCurseOverlay(ctx, w, h);
    }
  }

  _drawBackground(ctx, w, h) {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#0a1a0a');
    grad.addColorStop(0.4, '#1a2a1a');
    grad.addColorStop(0.7, '#1a3020');
    grad.addColorStop(1, '#2a3a2a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Tree silhouettes
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#0a1a0a';
    this._drawBgTree(ctx, w * 0.02, h, 30, 150);
    this._drawBgTree(ctx, w * 0.12, h, 25, 120);
    this._drawBgTree(ctx, w * 0.88, h, 25, 130);
    this._drawBgTree(ctx, w * 0.98, h, 30, 140);
    ctx.restore();

    // Ambient leaves
    for (const s of this.ambientItems) {
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.font = `${s.size}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(s.emoji, s.x, s.y);
      ctx.restore();
    }

    // Fireflies
    for (const f of this.fireflies) {
      const fx = f.x + Math.cos(f.phase) * f.radius;
      const fy = f.y + Math.sin(f.phase * 0.7) * f.radius * 0.5;
      const glow = 0.2 + Math.sin(f.phase * 3) * 0.2;
      ctx.save();
      ctx.globalAlpha = glow;
      ctx.fillStyle = '#FFFF88';
      ctx.beginPath();
      ctx.arc(fx, fy, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = '#FFFF44';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();
    }
  }

  _drawBgTree(ctx, x, baseY, width, height) {
    ctx.fillRect(x - width * 0.1, baseY - height * 0.4, width * 0.2, height * 0.4);
    for (let i = 0; i < 3; i++) {
      const layerY = baseY - height * 0.3 - i * height * 0.22;
      const layerW = width * (1.1 - i * 0.2);
      ctx.beginPath();
      ctx.moveTo(x, layerY - height * 0.25);
      ctx.lineTo(x - layerW, layerY);
      ctx.lineTo(x + layerW, layerY);
      ctx.closePath();
      ctx.fill();
    }
  }

  _drawMom(ctx, w, h) {
    const momX = w / 2;
    const momY = h * 0.12;
    const bob = Math.sin(this.momPhase * 1.2) * 3;

    drawSnowWhiteMom(ctx, momX, momY + bob, 1.0);

    ctx.save();
    ctx.font = 'Bold 14px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#A5D6A7';
    ctx.fillText('백설공주', momX, momY + bob + 65);
    ctx.restore();
  }

  _drawBelly(ctx, w, h) {
    const cx = w / 2;
    const cy = h * 0.35;
    const growthRatio = this.growth / GAME.maxGrowth;
    const baseRadius = 55 + growthRatio * 35;

    ctx.save();
    // Glow
    const glowGrad = ctx.createRadialGradient(cx, cy, baseRadius * 0.5, cx, cy, baseRadius * 1.3);
    glowGrad.addColorStop(0, 'rgba(76, 175, 80, 0.1)');
    glowGrad.addColorStop(0.7, 'rgba(76, 175, 80, 0.05)');
    glowGrad.addColorStop(1, 'rgba(76, 175, 80, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, baseRadius * 1.3, 0, Math.PI * 2);
    ctx.fill();

    // Belly
    const bellyGrad = ctx.createRadialGradient(cx, cy - 10, 0, cx, cy, baseRadius);
    bellyGrad.addColorStop(0, 'rgba(129, 199, 132, 0.25)');
    bellyGrad.addColorStop(0.7, 'rgba(76, 175, 80, 0.15)');
    bellyGrad.addColorStop(1, 'rgba(56, 142, 60, 0.1)');
    ctx.fillStyle = bellyGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(76, 175, 80, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Sparkles around belly
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

    drawBabySnowWhite(ctx, cx + shakeX, cy + bob, babySize, this.babyEmotion, this.babyPhase, growthRatio);

    ctx.save();
    ctx.font = '13px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#A5D6A7';
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
    ctx.fillStyle = '#A5D6A7';
    ctx.fillText(`🌸 성장 ${Math.floor(ratio * 100)}%`, barX, barY - 4);

    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 11);
    ctx.fill();

    if (ratio > 0) {
      const grad = ctx.createLinearGradient(barX, 0, barX + barW * ratio, 0);
      grad.addColorStop(0, '#66BB6A');
      grad.addColorStop(1, '#2E7D32');
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
    ctx.fillStyle = ratio > 0.6 ? '#FF4444' : '#A5D6A7';
    ctx.fillText(`🪞 싫음`, barX, barY - 3);

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
    ctx.fillText('🐾 동물을 터치해서 음식을 주세요!', w / 2, h * 0.55);
    ctx.restore();

    for (const a of this.animals) {
      ctx.save();

      const bounce = Math.sin(a.bouncePhase) * 6;

      if (a.collected) {
        const t = a.collectPhase;
        ctx.globalAlpha = Math.max(0, 1 - t);

        if (a.correct) {
          // Happy jump and fade
          ctx.translate(a.x, a.y - t * 50 + bounce);
          ctx.scale(1 + t * 0.3, 1 + t * 0.3);
        } else {
          // Shake head and fade
          const shake = Math.sin(t * 20) * 8 * (1 - t);
          ctx.translate(a.x + shake, a.y + bounce);
        }
      } else {
        ctx.translate(a.x, a.y + bounce);
      }

      // Draw animal body circle
      const bgColor = a.isCrow ? 'rgba(80, 0, 80, 0.5)' : 'rgba(60, 100, 60, 0.4)';
      const borderColor = a.isCrow ? 'rgba(150, 0, 150, 0.6)' : 'rgba(100, 180, 100, 0.5)';
      ctx.fillStyle = bgColor;
      ctx.beginPath();
      ctx.arc(0, 0, a.size * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Animal emoji
      const animalFontSize = Math.max(20, a.size * 0.65);
      ctx.font = `${animalFontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(a.animalType.emoji, 0, -a.size * 0.25);

      // Food emoji (below animal)
      const foodFontSize = Math.max(16, a.size * 0.5);
      ctx.font = `${foodFontSize}px sans-serif`;
      ctx.fillText(a.food.emoji, 0, a.size * 0.3);

      // Crow warning glow
      if (a.isCrow && !a.collected) {
        const warnAlpha = 0.2 + Math.sin(a.bouncePhase * 2) * 0.15;
        ctx.fillStyle = `rgba(128, 0, 128, ${warnAlpha})`;
        ctx.beginPath();
        ctx.arc(0, 0, a.size * 0.9, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  _drawCurseOverlay(ctx, w, h) {
    ctx.save();

    // Dark purple overlay
    ctx.fillStyle = `rgba(40, 0, 60, ${this.curseAlpha * 0.7})`;
    ctx.fillRect(0, 0, w, h);

    // Vignette
    const edgeGrad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.15, w / 2, h / 2, Math.max(w, h) * 0.7);
    edgeGrad.addColorStop(0, 'rgba(80, 0, 120, 0)');
    edgeGrad.addColorStop(0.6, 'rgba(60, 0, 90, 0)');
    edgeGrad.addColorStop(1, `rgba(40, 0, 60, ${this.curseAlpha * 0.5})`);
    ctx.fillStyle = edgeGrad;
    ctx.fillRect(0, 0, w, h);

    // Magic mirror in center
    if (this.curseAlpha > 0.3) {
      const mirrorAlpha = (this.curseAlpha - 0.3) * 1.4;
      ctx.globalAlpha = Math.min(1, mirrorAlpha);

      // Mirror frame
      const mirrorSize = Math.min(120, w * 0.3);
      ctx.strokeStyle = '#C0A060';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(w / 2, h / 2 - 20, mirrorSize * 0.6, mirrorSize * 0.8, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Mirror surface
      const mirrorGrad = ctx.createRadialGradient(w / 2, h / 2 - 20, 0, w / 2, h / 2 - 20, mirrorSize * 0.6);
      mirrorGrad.addColorStop(0, 'rgba(200, 180, 255, 0.3)');
      mirrorGrad.addColorStop(0.7, 'rgba(120, 80, 180, 0.2)');
      mirrorGrad.addColorStop(1, 'rgba(80, 40, 120, 0.1)');
      ctx.fillStyle = mirrorGrad;
      ctx.beginPath();
      ctx.ellipse(w / 2, h / 2 - 20, mirrorSize * 0.55, mirrorSize * 0.75, 0, 0, Math.PI * 2);
      ctx.fill();

      // Floating curse emojis
      const curseEmojis = ['🪞', '💀', '👑', '🍎'];
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
      ctx.shadowColor = '#9C27B0';
      ctx.shadowBlur = 20;
      ctx.fillText(`🪞 ${Math.ceil(this.curseTimer)}초 🪞`, w / 2, h / 2 + 60);
      ctx.shadowBlur = 0;

      ctx.font = '18px sans-serif';
      ctx.fillStyle = '#CE93D8';
      ctx.fillText('마법 거울의 저주!', w / 2, h / 2 + 95);
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
