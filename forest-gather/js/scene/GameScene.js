/**
 * Main gameplay scene - collection game
 */
import { ROUNDS, RARITY, ROUND_TIME, ROUND_EXTEND, DIFFICULTIES } from '../config.js';
import { Character } from '../entity/Character.js';
import { Companion } from '../entity/Companion.js';
import { Item } from '../entity/Item.js';
import { ParticleSystem } from '../../../shared/ParticleSystem.js';
import { Message } from '../../../shared/ui/Message.js';

export class GameScene {
  constructor(w, h, safeTop, difficultyKey, spriteCache) {
    this.spriteCache = spriteCache;
    this.difficultyKey = difficultyKey;
    const diff = DIFFICULTIES[difficultyKey];
    this.difficulty = diff;

    // Map size (larger than screen, scrolls with player)
    this.mapWidth = w * 2;
    this.mapHeight = h * 1.5;
    this.screenW = w;
    this.screenH = h;
    this.safeTop = safeTop;

    // Camera
    this.camX = 0;
    this.camY = 0;

    // Round state
    this.round = 0;
    this.roundConfig = this._getRoundConfig();
    this.timer = ROUND_TIME;
    this.collected = 0;
    this.totalCollected = 0;
    this.target = Math.ceil(this.roundConfig.target * diff.targetMult);

    // Player
    this.player = new Character(this.mapWidth / 2, this.mapHeight / 2, difficultyKey === 'lisa' ? 'lisa' : 'ria', diff);
    this.secondChar = difficultyKey === 'together'
      ? new Character(this.mapWidth / 2 + 40, this.mapHeight / 2, 'lisa', diff)
      : null;

    // Companions
    this.companions = [];
    this._loadUnlockedCompanions();

    // Items on map
    this.items = [];
    this.spawnTimer = 0;
    this.spawnRate = diff.spawnRate;
    this._spawnInitialItems();

    // Effects
    this.particles = new ParticleSystem();
    this.message = new Message();

    // Events
    this.activeEvent = null;
    this.eventTimer = 0;
    this.nextEventTime = 30 + Math.random() * 30;
    this.gameTime = 0;

    // Score
    this.score = 0;

    // Items collected by rarity for stats
    this.rarityCount = { common: 0, shiny: 0, rare: 0, legendary: 0 };

    // Background decorations
    this.bgDecos = this._generateDecos();

    // State
    this.state = 'playing'; // playing, roundClear, timesUp

    // Show round intro
    this.message.show(`${this.roundConfig.emoji} ${this.roundConfig.name} - ${this.target}개 모으자!`, 3);
  }

  _getRoundConfig() {
    const idx = Math.min(this.round, ROUNDS.length - 1);
    const config = { ...ROUNDS[idx] };
    // For rounds beyond defined ones, scale target
    if (this.round >= ROUNDS.length) {
      config.target = 35 + (this.round - ROUNDS.length + 1) * 5;
      config.name = '무지개 세계 ' + (this.round - ROUNDS.length + 2);
      config.emoji = '🌈';
    }
    return config;
  }

  _loadUnlockedCompanions() {
    try {
      const data = localStorage.getItem('forestGather_companions');
      if (data) {
        const unlocked = JSON.parse(data);
        for (const type of unlocked) {
          this.companions.push(new Companion(type, this.player));
        }
      }
    } catch { /* ignore */ }
  }

  _saveUnlockedCompanions() {
    try {
      const types = this.companions.map(c => c.type);
      localStorage.setItem('forestGather_companions', JSON.stringify(types));
    } catch { /* ignore */ }
  }

  _spawnInitialItems() {
    const count = 8 + this.round * 3;
    for (let i = 0; i < count; i++) {
      this._spawnItem();
    }
  }

  _spawnItem() {
    const x = 40 + Math.random() * (this.mapWidth - 80);
    const y = 100 + Math.random() * (this.mapHeight - 140);

    // Pick random item from round config
    const itemDefs = this.roundConfig.items;
    // Determine rarity by roll
    const roll = Math.random();
    let rarity;
    if (roll < RARITY.legendary.chance) rarity = 'legendary';
    else if (roll < RARITY.legendary.chance + RARITY.rare.chance) rarity = 'rare';
    else if (roll < RARITY.legendary.chance + RARITY.rare.chance + RARITY.shiny.chance) rarity = 'shiny';
    else rarity = 'common';

    // Pick item matching rarity, or any
    const matching = itemDefs.filter(d => d.rarity === rarity);
    const def = matching.length > 0 ? matching[Math.floor(Math.random() * matching.length)]
      : itemDefs[Math.floor(Math.random() * itemDefs.length)];

    const item = new Item(x, y, def, rarity);

    // Some items hidden (10% chance)
    if (Math.random() < 0.1) {
      item.hidden = true;
    }

    // Rainbow event: upgrade rarity
    if (this.activeEvent && this.activeEvent.type === 'rainbow') {
      if (rarity === 'common') {
        item.rarity = 'shiny';
        item.value = RARITY.shiny.value;
        item.color = RARITY.shiny.color;
        item.glow = true;
      }
    }

    // Star rain: double spawn (handled by caller)

    this.items.push(item);
  }

  _generateDecos() {
    const decos = [];
    const types = ['🌳', '🌲', '🪨', '🌿', '🍃'];
    for (let i = 0; i < 30; i++) {
      decos.push({
        x: Math.random() * this.mapWidth,
        y: Math.random() * this.mapHeight,
        emoji: types[Math.floor(Math.random() * types.length)],
        size: 20 + Math.random() * 20,
        phase: Math.random() * Math.PI * 2,
      });
    }
    return decos;
  }

  handleTap(x, y) {
    if (this.state !== 'playing') return;

    // Convert screen coords to map coords
    const mx = x + this.camX;
    const my = y + this.camY;

    // Check if tapped on an item
    let tapped = false;
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      if (item.collected || item.hidden) continue;
      const dx = item.x - mx;
      const dy = item.y - my;
      if (Math.sqrt(dx * dx + dy * dy) < 35) {
        this._collectItem(item, i);
        tapped = true;
        break;
      }
    }

    // If not tapping item, move character
    if (!tapped) {
      this.player.moveTo(mx, my);
      if (this.secondChar) {
        this.secondChar.moveTo(mx + 30, my + 10);
      }
    }
  }

  _collectItem(item, index) {
    if (item.collected) return;
    item.collected = true;
    this.collected += item.value;
    this.totalCollected += item.value;
    this.score += item.value * 10 * (item.rarity === 'legendary' ? 10 : item.rarity === 'rare' ? 5 : item.rarity === 'shiny' ? 2.5 : 1);
    this.rarityCount[item.rarity]++;

    // Particles
    this.particles.createParticles(item.x - this.camX, item.y - this.camY, item.color, 8);
    if (item.rarity !== 'common') {
      this.particles.createStars(item.x - this.camX, item.y - this.camY, 3);
    }

    // Floating text
    const valueText = item.value > 1 ? `+${item.value} ${item.emoji}` : `+1 ${item.emoji}`;
    this.particles.addFloatingText(item.x - this.camX, item.y - this.camY - 20, valueText, item.color);

    // Check round clear
    if (this.collected >= this.target) {
      this.state = 'roundClear';
    }
  }

  update(dt, w, h) {
    if (this.state === 'roundClear') return 'roundClear';
    if (this.state === 'timesUp') return 'gameover';

    this.screenW = w;
    this.screenH = h;
    this.gameTime += dt;

    // Timer
    this.timer -= dt;
    if (this.timer <= 0) {
      this.timer = 0;
      this.state = 'timesUp';
      return 'gameover';
    }

    // Player
    this.player.update(dt, this.mapWidth, this.mapHeight);
    if (this.secondChar) {
      this.secondChar.update(dt, this.mapWidth, this.mapHeight);
    }

    // Auto-collect items near player
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      if (item.collected || item.hidden) continue;
      const dx = item.x - this.player.x;
      const dy = item.y - this.player.y;
      if (Math.sqrt(dx * dx + dy * dy) < this.difficulty.collectRadius) {
        this._collectItem(item, i);
      }
    }

    // Companions
    for (const comp of this.companions) {
      comp.update(dt, this.items, (item, idx) => this._collectItem(item, idx));

      // Reveal hidden items
      if (comp.shouldRevealHidden()) {
        let revealed = 0;
        for (const item of this.items) {
          if (item.hidden && !item.collected && revealed < 3) {
            const dx = item.x - comp.x;
            const dy = item.y - comp.y;
            if (Math.sqrt(dx * dx + dy * dy) < comp.range * 2) {
              item.hidden = false;
              revealed++;
              this.particles.createStars(item.x - this.camX, item.y - this.camY, 2);
            }
          }
        }
        if (revealed > 0) {
          this.message.show(`${comp.emoji} ${comp.name}가 숨은 아이템을 찾았어!`);
        }
      }
    }

    // Item spawning
    this.spawnTimer += dt;
    const spawnInterval = 1 / this.spawnRate;
    if (this.spawnTimer >= spawnInterval) {
      this.spawnTimer -= spawnInterval;
      if (this.items.filter(i => !i.collected).length < 20 + this.round * 5) {
        this._spawnItem();
        if (this.activeEvent && this.activeEvent.type === 'star_rain') {
          this._spawnItem(); // double spawn
        }
      }
    }

    // Update items
    for (let i = this.items.length - 1; i >= 0; i--) {
      this.items[i].update(dt);
      if (this.items[i].isFinished()) {
        this.items.splice(i, 1);
      }
    }

    // Events
    if (!this.activeEvent && this.gameTime >= this.nextEventTime) {
      // Skip events for now in MVP
      this.nextEventTime = this.gameTime + 30 + Math.random() * 30;
    }
    if (this.activeEvent) {
      this.eventTimer -= dt;
      if (this.eventTimer <= 0) {
        this.activeEvent = null;
      }
    }

    // Camera follow player
    const targetCamX = this.player.x - w / 2;
    const targetCamY = this.player.y - h / 2;
    this.camX += (targetCamX - this.camX) * Math.min(1, dt * 5);
    this.camY += (targetCamY - this.camY) * Math.min(1, dt * 5);
    this.camX = Math.max(0, Math.min(this.mapWidth - w, this.camX));
    this.camY = Math.max(0, Math.min(this.mapHeight - h, this.camY));

    // Effects
    this.particles.update(dt);
    this.message.update(dt);

    return null;
  }

  draw(ctx, w, h) {
    // Background
    ctx.fillStyle = this.roundConfig.bgColor;
    ctx.fillRect(0, 0, w, h);

    // Ground
    const groundY = Math.max(0, h * 0.3 - this.camY);
    ctx.fillStyle = this.roundConfig.groundColor;
    ctx.fillRect(0, groundY, w, h - groundY);

    ctx.save();
    ctx.translate(-this.camX, -this.camY);

    // Background decorations
    for (const d of this.bgDecos) {
      const bobY = Math.sin(this.gameTime + d.phase) * 2;
      ctx.font = `${d.size}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.6;
      ctx.fillText(d.emoji, d.x, d.y + bobY);
      ctx.globalAlpha = 1;
    }

    // Items
    for (const item of this.items) {
      item.draw(ctx);
    }

    // Companions
    for (const comp of this.companions) {
      comp.draw(ctx, this.spriteCache);
    }

    // Second character (if together mode)
    if (this.secondChar) {
      this.secondChar.draw(ctx, this.spriteCache);
    }

    // Player
    this.player.draw(ctx, this.spriteCache);

    ctx.restore();

    // UI overlay (not affected by camera)
    this._drawHUD(ctx, w, h);

    // Particles (screen space)
    this.particles.draw(ctx);

    // Message
    this.message.draw(ctx, w, h);
  }

  _drawHUD(ctx, w, h) {
    const safeTop = this.safeTop;

    // Top bar background
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, w, safeTop + 70);

    // Timer
    const mins = Math.floor(this.timer / 60);
    const secs = Math.floor(this.timer % 60);
    const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;

    ctx.font = 'Bold 28px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const timerY = safeTop + 35;

    // Timer color: red when < 30s
    ctx.fillStyle = this.timer < 30 ? '#FF4444' : '#FFF';
    ctx.fillText(`⏰ ${timeStr}`, 16, timerY);

    // Collection progress
    const progText = `🧺 ${this.collected} / ${this.target}`;
    ctx.textAlign = 'center';
    ctx.fillStyle = this.collected >= this.target ? '#FFD700' : '#FFF';
    ctx.fillText(progText, w / 2, timerY);

    // Round indicator
    ctx.textAlign = 'right';
    ctx.fillStyle = '#FFF';
    ctx.font = 'Bold 20px sans-serif';
    ctx.fillText(`${this.roundConfig.emoji} R${this.round + 1}`, w - 16, timerY);

    // Progress bar
    const barX = 16;
    const barY = safeTop + 55;
    const barW = w - 32;
    const barH = 8;
    const progress = Math.min(1, this.collected / this.target);

    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 4);
    ctx.fill();

    if (progress > 0) {
      const grad = ctx.createLinearGradient(barX, 0, barX + barW * progress, 0);
      grad.addColorStop(0, '#FFD700');
      grad.addColorStop(1, '#FF8F00');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW * progress, barH, 4);
      ctx.fill();
    }

    // Companion indicators (bottom left)
    if (this.companions.length > 0) {
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'left';
      for (let i = 0; i < this.companions.length; i++) {
        ctx.fillText(this.companions[i].emoji, 16 + i * 36, h - 20);
      }
    }
  }

  // Called by main when advancing to next round
  advanceRound() {
    this.round++;
    this.roundConfig = this._getRoundConfig();
    this.timer += ROUND_EXTEND;
    this.collected = 0;
    this.target = Math.ceil(this.roundConfig.target * this.difficulty.targetMult);
    this.state = 'playing';
    this.bgDecos = this._generateDecos();

    // Check companion unlock
    const rc = this.roundConfig;
    if (rc.unlockCompanion) {
      const existing = this.companions.find(c => c.type === rc.unlockCompanion);
      if (!existing) {
        this.companions.push(new Companion(rc.unlockCompanion, this.player));
        this._saveUnlockedCompanions();
      }
    }

    // Spawn new items
    this.items = this.items.filter(i => !i.collected);
    this._spawnInitialItems();

    this.message.show(`${rc.emoji} ${rc.name} - ${this.target}개 모으자!`, 3);
  }

  getStats() {
    return {
      round: this.round + 1,
      totalCollected: this.totalCollected,
      score: Math.floor(this.score),
      rarityCount: { ...this.rarityCount },
      companions: this.companions.map(c => c.emoji).join(' '),
      difficulty: this.difficultyKey,
      roundName: this.roundConfig.name,
    };
  }
}
