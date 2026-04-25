/**
 * Main gameplay - Our Mom Baby game
 * ACTION CATCH mechanic: drag mom left/right to catch falling food, dodge viruses!
 * - Any food = small growth, wanted food = big growth (x3)
 * - Viruses = damage, must dodge
 * - Ria mode: fairy Lisa drops bonus items (offensive support)
 * - Lisa mode: child Ria blocks viruses (defensive support)
 */
import { FOODS, VIRUS, GROWTH_STAGES, GAME } from '../config.js';
import { ParticleSystem } from '../../../shared/ParticleSystem.js';
import { Message } from '../../../shared/ui/Message.js';
import { drawMom, drawBaby, drawFairyLisa, drawChildRia, drawVirus } from '../draw-mom.js';

const BONUS_TYPES = [
  { emoji: '💊', name: '비타민', growth: 15 },
  { emoji: '💕', name: '사랑', growth: 12 },
  { emoji: '⭐', name: '별', growth: 10 },
];

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

    // === Mom position (player-controlled) ===
    this.momX = w / 2;
    this.momTargetX = w / 2;
    this.momW = 70;  // catch hitbox width
    this.momY = h * 0.78; // fixed Y, updated on resize

    // === Falling items ===
    this.items = [];
    this.spawnTimer = 0.5;
    this.virusTimer = GAME.virusInterval;
    this.difficulty = 1; // increases over time

    // Fever state
    this.fever = false;
    this.feverTimer = 0;
    this.feverAlpha = 0;

    // Baby animation
    this.babyPhase = 0;
    this.babyEmotion = 'neutral';
    this.emotionTimer = 0;
    this.babyShake = 0;

    // Cached per-frame derived values
    this.growthRatio = 0;
    this.currentStage = GROWTH_STAGES[0];

    // Helper state
    this.helperPhase = 0;
    // Ria mode: fairy Lisa position & bonus drop
    this.fairyX = w * 0.5;
    this.fairyBonusTimer = 8;
    // Lisa mode: child Ria position & block
    this.riaX = w * 0.5;
    this.riaBlockCooldown = 0;

    // Effects
    this.particles = new ParticleSystem();
    this.message = new Message();

    // Ambient
    this.ambientItems = [];
    for (let i = 0; i < 12; i++) {
      this.ambientItems.push({
        x: Math.random() * w, y: Math.random() * h,
        speed: 8 + Math.random() * 15, size: 8 + Math.random() * 10,
        wobble: Math.random() * Math.PI * 2,
        emoji: ['💕', '✨', '🌸', '💗'][Math.floor(Math.random() * 4)],
      });
    }

    // Pointer tracking (for drag)
    this._pointerDown = false;
    this._setupInput();

    const name = mode === 'ria' ? '리아' : '리사';
    this.message.show(`엄마를 움직여 음식을 잡아요! 세균 조심! 💕`, 3);
  }

  _setupInput() {
    // Document-level listeners so dragging continues outside the canvas.
    // Canvas is offset by safe-area insets, so subtract its rect for canvas-local coords.
    // Rect is cached at pointerdown and reused during pointermove to avoid per-event layout reads.
    const canvas = document.querySelector('canvas');
    let canvasLeft = 0;

    this._onPointerDown = (e) => {
      this._pointerDown = true;
      canvasLeft = canvas.getBoundingClientRect().left;
      this.momTargetX = e.clientX - canvasLeft;
    };
    this._onPointerMove = (e) => {
      if (this._pointerDown) {
        this.momTargetX = e.clientX - canvasLeft;
      }
    };
    this._onPointerUp = () => { this._pointerDown = false; };

    document.addEventListener('pointerdown', this._onPointerDown);
    document.addEventListener('pointermove', this._onPointerMove);
    document.addEventListener('pointerup', this._onPointerUp);
  }

  destroy() {
    document.removeEventListener('pointerdown', this._onPointerDown);
    document.removeEventListener('pointermove', this._onPointerMove);
    document.removeEventListener('pointerup', this._onPointerUp);
  }

  _pickNewWant() {
    this.wantedFood = FOODS[Math.floor(Math.random() * FOODS.length)];
    this.wantTimer = GAME.wantChangeInterval;
  }

  _spawnItem(type, food, size, baseVy, vyRange, vxRange, x) {
    this.items.push({
      type, food,
      x: x ?? (size + Math.random() * (this.w - size * 2)),
      y: -size, size,
      vy: baseVy + Math.random() * vyRange + this.difficulty * (type === 'virus' ? 8 : 10),
      vx: (Math.random() - 0.5) * vxRange,
      wobblePhase: Math.random() * Math.PI * 2,
      collected: false, collectPhase: 0,
    });
  }

  _spawnFood() {
    const food = Math.random() < GAME.wantedFoodChance ? this.wantedFood
      : FOODS[Math.floor(Math.random() * FOODS.length)];
    this._spawnItem('food', food, 36 + Math.random() * 12, 80, 40, 30);
  }

  _spawnVirus() {
    this._spawnItem('virus', null, VIRUS.size, 60, 30, 50);
  }

  _spawnBonus() {
    const bonus = BONUS_TYPES[Math.floor(Math.random() * BONUS_TYPES.length)];
    this._spawnItem('bonus', bonus, 40, 70, 20, 20, this.fairyX);
  }

  handleTap(x, y) {
    // Tap also sets mom target (for quick repositioning)
    this.momTargetX = x;
  }

  _catchItem(item) {
    item.collected = true;
    item.collectPhase = 0;

    if (item.type === 'virus') {
      // HIT by virus!
      this.growth = Math.max(0, this.growth + GAME.virusPenalty);
      this.dislike = Math.min(GAME.maxDislike, this.dislike + GAME.virusDislike);
      this.combo = 0;
      this.babyEmotion = 'angry';
      this.emotionTimer = 2.0;
      this.babyShake = 0.8;
      this.particles.addFloatingText(item.x, this.momY - 40, '세균! 🦠', '#00AA00', 28);
      this.particles.createParticles(item.x, this.momY, '#00AA00', 12);
      this.message.show('🦠 세균에 닿았어요! 조심! 🤒', 2);
      if (this.dislike >= GAME.maxDislike) this._triggerFever();
      return;
    }

    if (item.type === 'bonus') {
      // Bonus item!
      const g = item.food.growth;
      this.growth = Math.min(GAME.maxGrowth, this.growth + g);
      this.combo++;
      this.babyEmotion = 'happy';
      this.emotionTimer = 1.5;
      this.particles.addFloatingText(item.x, this.momY - 40, `+${g} ${item.food.emoji}`, '#FFD700', 30);
      this.particles.createStars(item.x, this.momY - 20, 8);
      this.message.show(`${item.food.name}! 대박 보너스! ✨`, 2);
      return;
    }

    // Food item
    this.totalFed++;
    const isWanted = item.food.type === this.wantedFood.type;
    if (isWanted) {
      this.combo++;
      this.correctFed++;
      const bonus = GAME.growthPerCorrect + this.combo * GAME.comboBonus;
      this.growth = Math.min(GAME.maxGrowth, this.growth + bonus);
      this.dislike = Math.max(0, this.dislike - 10);
      this.babyEmotion = 'happy';
      this.emotionTimer = 1.5;
      this.particles.createParticles(item.x, this.momY - 20, '#FF69B4', 10);
      this.particles.createStars(this.w / 2, this.h * 0.35, 5);
      this.particles.addFloatingText(item.x, this.momY - 40, `+${bonus} 💕`, '#FF69B4', 28);
      if (this.combo >= 3) this.message.show(`${this.combo} 콤보! 아기가 좋아해요! ✨`);
      this._pickNewWant();
    } else {
      // Any food = small growth (no penalty!)
      this.growth = Math.min(GAME.maxGrowth, this.growth + GAME.growthPerAny);
      this.particles.addFloatingText(item.x, this.momY - 40, `+${GAME.growthPerAny}`, '#AAAAFF', 22);
      // Don't reset combo for wrong food, just don't increase it
    }
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

  update(dt, w, h) {
    this.w = w;
    this.h = h;
    this.momY = h * 0.78;
    this.babyPhase += dt;
    this.helperPhase += dt;

    // Derived state (cached for draw methods)
    this.growthRatio = this.growth / GAME.maxGrowth;
    this.difficulty = 1 + this.growthRatio * 3;
    let stage = GROWTH_STAGES[0];
    for (const s of GROWTH_STAGES) { if (this.growthRatio >= s.threshold) stage = s; }
    this.currentStage = stage;

    if (this.growth >= GAME.maxGrowth) return 'born';

    // Fever
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
        this._pickNewWant();
      }
    }

    // Emotion
    if (this.emotionTimer > 0) {
      this.emotionTimer -= dt;
      if (this.emotionTimer <= 0 && !this.fever) this.babyEmotion = 'neutral';
    }
    if (this.babyShake > 0) this.babyShake = Math.max(0, this.babyShake - dt * 2);

    // === Mom movement (smooth follow) ===
    const momSpeed = 12;
    this.momX += (this.momTargetX - this.momX) * Math.min(1, dt * momSpeed);
    this.momX = Math.max(this.momW / 2, Math.min(w - this.momW / 2, this.momX));

    // === Falling items ===
    if (!this.fever) {
      // Spawn food
      this.spawnTimer -= dt;
      const spawnRate = Math.max(0.6, GAME.bubbleSpawnInterval - this.difficulty * 0.15);
      if (this.spawnTimer <= 0) {
        this._spawnFood();
        this.spawnTimer = spawnRate;
      }

      // Spawn virus
      this.virusTimer -= dt;
      const virusRate = Math.max(6, GAME.virusInterval - this.difficulty * 2);
      if (this.virusTimer <= 0) {
        this._spawnVirus();
        this.virusTimer = virusRate;
      }

      // Fairy Lisa bonus drop (ria mode only)
      if (this.mode === 'ria') {
        this.fairyBonusTimer -= dt;
        if (this.fairyBonusTimer <= 0) {
          this._spawnBonus();
          this.fairyBonusTimer = 7 + Math.random() * 5;
        }
      }
    }

    // Update items
    for (const item of this.items) {
      if (item.collected) {
        item.collectPhase += dt * 4;
        continue;
      }

      item.wobblePhase += dt * 3;
      item.y += item.vy * dt;
      item.x += item.vx * dt + Math.sin(item.wobblePhase) * 15 * dt;

      // Bounce off walls
      if (item.x < item.size / 2) { item.x = item.size / 2; item.vx = Math.abs(item.vx); }
      if (item.x > w - item.size / 2) { item.x = w - item.size / 2; item.vx = -Math.abs(item.vx); }

      // Check collision with mom
      const catchY = this.momY;
      const catchH = 50; // vertical catch zone
      if (item.y >= catchY - catchH && item.y <= catchY + 20) {
        if (Math.abs(item.x - this.momX) < (this.momW / 2 + item.size / 3)) {
          // Lisa mode: Ria blocks viruses
          if (item.type === 'virus' && this.mode === 'lisa' && this.riaBlockCooldown <= 0) {
            if (Math.abs(item.x - this.riaX) < 50) {
              // Ria blocks it!
              item.collected = true;
              item.collectPhase = 0;
              this.riaBlockCooldown = 4; // cooldown
              this.particles.addFloatingText(this.riaX, this.momY - 50, '리아가 막았어! 🛡️', '#4CAF50', 22);
              this.particles.createParticles(this.riaX, this.momY - 20, '#4CAF50', 8);
              continue;
            }
          }
          this._catchItem(item);
          continue;
        }
      }

      // Fell off screen
      if (item.y > h + 50) {
        item.collected = true;
        item.collectPhase = 10; // instant remove
        // Missed wanted food = slight dislike increase
        if (item.type === 'food' && item.food.type === this.wantedFood.type) {
          this.dislike = Math.min(GAME.maxDislike, this.dislike + 5);
        }
      }
    }

    // Remove done items
    this.items = this.items.filter(i => !i.collected || i.collectPhase < 1.5);

    // Helper positions
    if (this.mode === 'ria') {
      // Fairy Lisa follows loosely above
      this.fairyX += (this.momX - this.fairyX) * dt * 1.5;
      this.fairyX += Math.sin(this.helperPhase * 1.5) * 20 * dt;
    } else {
      // Child Ria patrols near mom
      this.riaX += (this.momX - this.riaX) * dt * 2;
      this.riaX += Math.sin(this.helperPhase * 0.8) * 40 * dt;
      this.riaX = Math.max(30, Math.min(w - 30, this.riaX));
      if (this.riaBlockCooldown > 0) this.riaBlockCooldown -= dt;
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
    this._drawBelly(ctx, w, h);
    this._drawBabyInBelly(ctx, w, h);
    this._drawWantBubble(ctx, w, h);
    this._drawFallingItems(ctx, w, h);
    this._drawMomPlayer(ctx, w, h);
    this._drawHelper(ctx, w, h);
    this._drawGrowthBar(ctx, w, h);
    this._drawDislikeBar(ctx, w, h);
    this.particles.draw(ctx);
    if (this.combo >= 2) {
      ctx.save();
      ctx.font = 'Bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFD700';
      ctx.fillText(`💕 ${this.combo} 콤보!`, w / 2, h * 0.48);
      ctx.restore();
    }
    this.message.draw(ctx, w, h);
    if (this.fever || this.feverAlpha > 0) this._drawFeverOverlay(ctx, w, h);
  }

  _drawBackground(ctx, w, h) {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#2a1a3a');
    grad.addColorStop(0.3, '#3a2a4a');
    grad.addColorStop(0.5, '#5a3a5a');
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

    // Ground line
    ctx.fillStyle = 'rgba(255,182,193,0.15)';
    ctx.fillRect(0, this.momY + 35, w, h - this.momY - 35);
  }

  _drawMomPlayer(ctx, w, h) {
    const bob = Math.sin(this.babyPhase * 3) * 2;
    drawMom(ctx, this.momX, this.momY - 45 + bob, 0.8);

    // Catch zone indicator
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#FF69B4';
    ctx.beginPath();
    ctx.ellipse(this.momX, this.momY + 10, this.momW / 2 + 5, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  _drawHelper(ctx, w, h) {
    ctx.save();
    if (this.mode === 'ria') {
      // Fairy Lisa in sky
      const fy = 45 + Math.sin(this.helperPhase * 1.5) * 8;
      ctx.globalAlpha = 0.8;
      drawFairyLisa(ctx, this.fairyX, fy, 55);
      ctx.globalAlpha = 1;
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFB6C1';
      ctx.fillText('요정 리사 ✨', this.fairyX, fy + 34);
    } else {
      // Child Ria near mom
      const ry = this.momY + 5;
      drawChildRia(ctx, this.riaX, ry, 50);
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#A5D6A7';
      ctx.fillText('언니 리아 🛡️', this.riaX, ry + 32);
      // Shield indicator
      if (this.riaBlockCooldown <= 0) {
        ctx.globalAlpha = 0.4 + Math.sin(this.helperPhase * 3) * 0.2;
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.riaX, ry - 10, 28, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  _drawBelly(ctx, w, h) {
    const cx = w / 2;
    const cy = h * 0.28;
    const baseRadius = 40 + this.growthRatio * 25;
    ctx.save();

    const glowGrad = ctx.createRadialGradient(cx, cy, baseRadius * 0.5, cx, cy, baseRadius * 1.3);
    glowGrad.addColorStop(0, 'rgba(255,105,180,0.1)');
    glowGrad.addColorStop(1, 'rgba(255,105,180,0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath(); ctx.arc(cx, cy, baseRadius * 1.3, 0, Math.PI * 2); ctx.fill();

    const bellyGrad = ctx.createRadialGradient(cx, cy - 5, 0, cx, cy, baseRadius);
    bellyGrad.addColorStop(0, 'rgba(255,182,193,0.25)');
    bellyGrad.addColorStop(1, 'rgba(219,68,129,0.1)');
    ctx.fillStyle = bellyGrad;
    ctx.beginPath(); ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,105,180,0.3)';
    ctx.lineWidth = 1.5; ctx.stroke();

    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 + this.babyPhase * 0.5;
      ctx.globalAlpha = 0.3 + Math.sin(this.babyPhase * 3 + i) * 0.2;
      ctx.font = '8px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('✦', cx + Math.cos(angle) * (baseRadius + 6), cy + Math.sin(angle) * (baseRadius + 6));
    }
    ctx.restore();
  }

  _drawBabyInBelly(ctx, w, h) {
    const cx = w / 2, cy = h * 0.28;
    const babySize = 16 + this.growthRatio * 25;
    const bob = Math.sin(this.babyPhase * 2) * 3;
    const shakeX = this.babyShake > 0 ? Math.sin(this.babyPhase * 30) * 4 * this.babyShake : 0;

    drawBaby(ctx, cx + shakeX, cy + bob, babySize, this.babyEmotion, this.babyPhase, this.growthRatio, this.mode);

    ctx.save();
    ctx.font = '11px "Segoe UI","Apple SD Gothic Neo",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFB6C1';
    ctx.fillText(`${this.currentStage.name} - ${this.currentStage.desc}`, cx, cy + babySize + 15);
    ctx.restore();
  }

  _drawWantBubble(ctx, w, h) {
    if (this.fever) return;
    const cx = w / 2 + 45, cy = h * 0.14;
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath(); ctx.roundRect(cx - 30, cy - 24, 60, 48, 14); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - 12, cy + 22); ctx.lineTo(cx - 20, cy + 34); ctx.lineTo(cx - 4, cy + 24); ctx.fill();

    const pulse = 1 + Math.sin(this.babyPhase * 4) * 0.08;
    ctx.translate(cx, cy); ctx.scale(pulse, pulse);
    ctx.font = '28px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(this.wantedFood.emoji, 0, 0);
    ctx.restore();
  }

  _drawGrowthBar(ctx, w, h) {
    const barX = 16, barY = this.safeTop + 12, barW = w - 32, barH = 18;
    const ratio = this.growthRatio;
    ctx.save();
    ctx.font = 'Bold 12px sans-serif'; ctx.textAlign = 'left'; ctx.fillStyle = '#FFB6C1';
    ctx.fillText(`💕 ${Math.floor(ratio * 100)}%`, barX, barY - 3);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.roundRect(barX, barY, barW, barH, 9); ctx.fill();
    if (ratio > 0) {
      const grad = ctx.createLinearGradient(barX, 0, barX + barW * ratio, 0);
      grad.addColorStop(0, '#FF69B4'); grad.addColorStop(1, '#E91E63');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.roundRect(barX, barY, barW * ratio, barH, 9); ctx.fill();
    }
    ctx.restore();
  }

  _drawDislikeBar(ctx, w, h) {
    const barX = 16, barY = this.safeTop + 38, barW = w * 0.35, barH = 10;
    const ratio = this.dislike / GAME.maxDislike;
    if (ratio <= 0) return;
    ctx.save();
    ctx.font = '10px sans-serif'; ctx.textAlign = 'left';
    ctx.fillStyle = ratio > 0.6 ? '#FF4444' : '#FFB6C1';
    ctx.fillText('🤒', barX, barY - 2);
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath(); ctx.roundRect(barX + 16, barY, barW, barH, 5); ctx.fill();
    const grad = ctx.createLinearGradient(barX + 16, 0, barX + 16 + barW * ratio, 0);
    grad.addColorStop(0, '#FF6B6B'); grad.addColorStop(1, '#CC0000');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.roundRect(barX + 16, barY, barW * ratio, barH, 5); ctx.fill();
    ctx.restore();
  }

  _drawFallingItems(ctx, w, h) {
    for (const item of this.items) {
      if (item.collected && item.collectPhase > 1) continue;
      ctx.save();

      if (item.collected) {
        const t = item.collectPhase;
        ctx.globalAlpha = Math.max(0, 1 - t);
        if (item.type === 'virus') {
          const shake = Math.sin(t * 25) * 6 * (1 - t);
          ctx.translate(item.x + shake, item.y);
        } else {
          ctx.translate(item.x, item.y - t * 60);
          ctx.scale(1 + t * 0.4, 1 + t * 0.4);
        }
      } else {
        ctx.translate(item.x, item.y);
      }

      const wobble = Math.sin(item.wobblePhase) * 0.05;
      ctx.rotate(wobble);

      if (item.type === 'virus') {
        drawVirus(ctx, 0, 0, item.size);
        // Glow
        if (!item.collected) {
          ctx.globalAlpha = 0.3 + Math.sin(item.wobblePhase * 2) * 0.2;
          ctx.strokeStyle = '#00CC00';
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(0, 0, item.size * 0.55, 0, Math.PI * 2); ctx.stroke();
        }
      } else if (item.type === 'bonus') {
        // Golden sparkly item
        ctx.fillStyle = 'rgba(255,215,0,0.3)';
        ctx.beginPath(); ctx.arc(0, 0, item.size * 0.5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(255,215,0,0.6)'; ctx.lineWidth = 2; ctx.stroke();
        ctx.font = `${item.size * 0.6}px sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(item.food.emoji, 0, 0);
      } else {
        // Food in bubble
        const bubGrad = ctx.createRadialGradient(-item.size * 0.1, -item.size * 0.1, 0, 0, 0, item.size * 0.5);
        bubGrad.addColorStop(0, 'rgba(255,220,240,0.5)');
        bubGrad.addColorStop(1, 'rgba(255,105,180,0.1)');
        ctx.fillStyle = bubGrad;
        ctx.beginPath(); ctx.arc(0, 0, item.size * 0.5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(255,182,193,0.4)'; ctx.lineWidth = 1; ctx.stroke();
        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.beginPath(); ctx.arc(-item.size * 0.15, -item.size * 0.15, item.size * 0.1, 0, Math.PI * 2); ctx.fill();
        // Food emoji
        ctx.font = `${Math.max(16, item.size * 0.5)}px sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(item.food.emoji, 0, 0);
        // Wanted food glow
        if (item.food.type === this.wantedFood.type) {
          ctx.strokeStyle = 'rgba(255,215,0,0.5)';
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(0, 0, item.size * 0.55, 0, Math.PI * 2); ctx.stroke();
        }
      }
      ctx.restore();
    }
  }

  _drawFeverOverlay(ctx, w, h) {
    ctx.save();
    ctx.fillStyle = `rgba(180,0,0,${this.feverAlpha * 0.4})`;
    ctx.fillRect(0, 0, w, h);
    const edgeGrad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.2, w / 2, h / 2, Math.max(w, h) * 0.7);
    edgeGrad.addColorStop(0, 'rgba(255,100,100,0)');
    edgeGrad.addColorStop(1, `rgba(180,0,0,${this.feverAlpha * 0.5})`);
    ctx.fillStyle = edgeGrad; ctx.fillRect(0, 0, w, h);

    ctx.globalAlpha = this.feverAlpha;
    const emojis = ['🤒', '🦠', '💊', '🌡️'];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + this.babyPhase * 0.4;
      const r = 70 + Math.sin(i * 1.7) * 25;
      ctx.font = '20px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(emojis[i % emojis.length], w / 2 + Math.cos(angle) * r, h / 2 + Math.sin(angle) * r);
    }
    if (this.fever) {
      ctx.globalAlpha = 1;
      ctx.font = 'Bold 30px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFF'; ctx.shadowColor = '#FF0000'; ctx.shadowBlur = 20;
      ctx.fillText(`🤒 ${Math.ceil(this.feverTimer)}초 🤒`, w / 2, h / 2);
      ctx.shadowBlur = 0;
      ctx.font = '16px sans-serif'; ctx.fillStyle = '#FFB6C1';
      ctx.fillText('엄마가 열이 나요! 쉬는 중...', w / 2, h / 2 + 30);
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
