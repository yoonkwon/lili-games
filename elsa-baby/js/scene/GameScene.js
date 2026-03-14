/**
 * Main gameplay - feed the baby with conveyor belt food selection!
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
    this.growth = 0;
    this.dislike = 0;
    this.combo = 0;
    this.totalFed = 0;
    this.correctFed = 0;

    // Current want
    this.wantedFood = null;
    this.wantTimer = 0;
    this._pickNewWant();

    // === Conveyor belt ===
    this.conveyorItems = [];
    this.conveyorSpeed = 35; // px per second (slow, easy for kids)
    this.spawnTimer = 0;
    this.spawnInterval = 2.2; // seconds between spawns (no overlap)
    this._fillConveyor(w);

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

    this.message.show('컨베이어 위 음식을 터치! 아기가 원하는 걸 골라줘요! 💕', 3);
  }

  _pickNewWant() {
    const idx = Math.floor(Math.random() * FOODS.length);
    this.wantedFood = FOODS[idx];
    this.wantTimer = GAME.wantChangeInterval;
  }

  _fillConveyor(w) {
    // Pre-fill conveyor with well-spaced foods
    const spacing = this._getItemSpacing();
    const count = Math.ceil(w / spacing) + 2;
    for (let i = 0; i < count; i++) {
      this.conveyorItems.push({
        food: this._pickConveyorFood(),
        x: i * spacing,
        collected: false,
        collectPhase: 0,
      });
    }
  }

  _getItemSpacing() {
    return Math.max(90, this.conveyorSpeed * this.spawnInterval);
  }

  _pickConveyorFood() {
    // 40% chance to spawn the wanted food, 60% random other
    if (Math.random() < 0.4) {
      return this.wantedFood;
    }
    return FOODS[Math.floor(Math.random() * FOODS.length)];
  }

  _spawnConveyorItem() {
    const itemSize = 60;
    this.conveyorItems.push({
      food: this._pickConveyorFood(),
      x: -itemSize,
      collected: false,
      collectPhase: 0,
    });
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

    // Check conveyor item taps
    const beltY = this._getBeltY();
    const itemSize = this._getItemSize();

    for (const item of this.conveyorItems) {
      if (item.collected) continue;
      const ix = item.x;
      const iy = beltY;
      if (x >= ix - itemSize / 2 && x <= ix + itemSize / 2 &&
          y >= iy - itemSize / 2 && y <= iy + itemSize / 2) {
        this._feedBaby(item);
        return;
      }
    }
  }

  _getBeltY() {
    return this.h * 0.85;
  }

  _getItemSize() {
    return Math.min(60, this.w * 0.14);
  }

  _feedBaby(item) {
    this.totalFed++;
    const correct = item.food.type === this.wantedFood.type;

    // Mark as collected (animate away)
    item.collected = true;
    item.collectPhase = 0;

    if (correct) {
      this.combo++;
      this.correctFed++;
      const bonus = GAME.growthPerCorrect + this.combo * GAME.comboBonus;
      this.growth = Math.min(GAME.maxGrowth, this.growth + bonus);
      this.dislike = Math.max(0, this.dislike - 10);

      this.babyEmotion = 'happy';
      this.emotionTimer = 1.5;

      this.particles.createParticles(item.x, this._getBeltY() - 30, '#FFD700', 12);
      this.particles.createStars(this.w / 2, this.h * 0.35, 5);
      this.particles.addFloatingText(item.x, this._getBeltY() - 50, `+${bonus} 💕`, '#FF69B4', 28);

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

      this.particles.addFloatingText(item.x, this._getBeltY() - 50, '싫어요! 😣', '#88CCFF', 24);

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

    // === Conveyor belt update ===
    if (!this.frozen) {
      // Move items
      for (const item of this.conveyorItems) {
        item.x += this.conveyorSpeed * dt;
        if (item.collected) {
          item.collectPhase += dt * 4;
        }
      }

      // Remove items that went off-screen or fully collected
      this.conveyorItems = this.conveyorItems.filter(
        item => item.x < w + 80 && (!item.collected || item.collectPhase < 1)
      );

      // Spawn new items
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this._spawnConveyorItem();
        this.spawnTimer = this.spawnInterval;
      }
    }

    // Snowflakes
    for (const s of this.snowflakes) {
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
    this._drawConveyorBelt(ctx, w, h);

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
    const cy = h * 0.40;
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
    const cy = h * 0.28;

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
    ctx.fillStyle = '#B3E5FC';
    ctx.fillText(`💕 성장 ${Math.floor(ratio * 100)}%`, barX, barY - 4);

    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 11);
    ctx.fill();

    if (ratio > 0) {
      const grad = ctx.createLinearGradient(barX, 0, barX + barW * ratio, 0);
      grad.addColorStop(0, '#FF69B4');
      grad.addColorStop(1, '#FF1493');
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

  _drawConveyorBelt(ctx, w, h) {
    const beltY = this._getBeltY();
    const beltH = 80;
    const itemSize = this._getItemSize();

    // Belt label
    ctx.save();
    ctx.font = 'Bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFF';
    ctx.fillText('🍽️ 아기가 원하는 음식을 터치!', w / 2, beltY - beltH / 2 - 14);
    ctx.restore();

    // Belt background (solid, not transparent)
    ctx.save();
    ctx.fillStyle = '#1a2a4a';
    ctx.fillRect(0, beltY - beltH / 2, w, beltH);

    // Belt surface pattern
    ctx.fillStyle = '#1e3050';
    ctx.fillRect(0, beltY - beltH / 2 + 3, w, beltH - 6);

    // Belt track lines (moving)
    const trackOffset = (this.babyPhase * this.conveyorSpeed) % 20;
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let x = -20 + trackOffset; x < w + 20; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, beltY - beltH / 2 + 3);
      ctx.lineTo(x, beltY + beltH / 2 - 3);
      ctx.stroke();
    }

    // Belt edges (metallic rails)
    const railGrad = ctx.createLinearGradient(0, beltY - beltH / 2, 0, beltY - beltH / 2 + 4);
    railGrad.addColorStop(0, '#8899aa');
    railGrad.addColorStop(1, '#556677');
    ctx.fillStyle = railGrad;
    ctx.fillRect(0, beltY - beltH / 2, w, 4);

    const railGrad2 = ctx.createLinearGradient(0, beltY + beltH / 2 - 4, 0, beltY + beltH / 2);
    railGrad2.addColorStop(0, '#556677');
    railGrad2.addColorStop(1, '#8899aa');
    ctx.fillStyle = railGrad2;
    ctx.fillRect(0, beltY + beltH / 2 - 4, w, 4);

    ctx.restore();

    // Draw food items on belt (each in its own save/restore)
    for (const item of this.conveyorItems) {
      if (item.x < -itemSize || item.x > w + itemSize) continue;

      ctx.save();
      const ix = item.x;
      const iy = beltY;

      if (item.collected) {
        // Fly up and fade out animation
        const t = item.collectPhase;
        ctx.globalAlpha = 1 - t;
        ctx.translate(ix, iy - t * 60);
        ctx.scale(1 + t * 0.5, 1 + t * 0.5);
      } else {
        ctx.translate(ix, iy);

        // Highlight if it matches wanted food
        if (item.food.type === this.wantedFood.type && !this.frozen) {
          const glow = 0.4 + Math.sin(this.babyPhase * 5) * 0.2;
          ctx.shadowColor = '#FFD700';
          ctx.shadowBlur = 15;
          ctx.fillStyle = `rgba(255, 215, 0, ${glow})`;
          ctx.beginPath();
          ctx.arc(0, 0, itemSize / 2 + 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Solid plate background
        ctx.fillStyle = '#2a3a5e';
        ctx.beginPath();
        ctx.arc(0, 0, itemSize / 2 + 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#354a70';
        ctx.beginPath();
        ctx.arc(0, 0, itemSize / 2, 0, Math.PI * 2);
        ctx.fill();

        // Plate rim
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, itemSize / 2, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Food emoji
      const fontSize = Math.min(34, itemSize * 0.6);
      ctx.font = `${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.food.emoji, 0, -2);

      // Name label
      ctx.font = `Bold ${Math.min(11, itemSize * 0.17)}px "Segoe UI", "Apple SD Gothic Neo", sans-serif`;
      ctx.fillStyle = '#B3E5FC';
      ctx.fillText(item.food.name, 0, itemSize / 2 - 6);

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
