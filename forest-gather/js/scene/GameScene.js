/**
 * Main gameplay scene - collection game with combo & fever system
 */
import { ROUNDS, RARITY, ITEM_EFFECTS, COMBO, MAGNET, SPELLS, ROUND_TIME, ROUND_CLEAR_BONUS, COLLECT_TIME_BONUS, TIMER_CAP, DIFFICULTIES, COMPANIONS, COMPANION_DISCOVERY, COMPANION_SPAWN_INTERVAL } from '../config.js';
import { Character } from '../entity/Character.js';
import { Companion } from '../entity/Companion.js';
import { CompanionNPC } from '../entity/CompanionNPC.js';
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

    // Companions (active party members)
    this.companions = [];

    // Companion discovery system
    this.discoveryQueue = [...(COMPANION_DISCOVERY[difficultyKey] || COMPANION_DISCOVERY.ria)];
    this.companionNPCs = [];
    this.nextCompanionSpawnTime = 15 + Math.random() * 10;

    // Items on map
    this.items = [];
    this._collectedCount = 0;
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

    // Combo system
    this.combo = 0;
    this.comboTimer = 0; // time since last collection
    this.maxCombo = 0;

    // Fever mode
    this.fever = false;
    this.feverTimer = 0;

    // Active buffs (from item effects)
    this.buffs = [];

    // Magic system
    this.magicGauge = 0;
    this.spellList = Object.keys(SPELLS);
    this.currentSpellIdx = 0;
    this.spellCasting = false;
    this.spellCastTimer = 0;
    this.slowMotion = false;
    this.slowTimer = 0;

    // Items collected by rarity for stats
    this.rarityCount = { common: 0, shiny: 0, rare: 0, legendary: 0 };

    // Background decorations
    this.bgDecos = this._generateDecos();

    // State
    this.state = 'playing';

    // Show round intro
    this._showRoundIntro();
  }

  _showRoundIntro() {
    let msg = `${this.roundConfig.emoji} ${this.roundConfig.name} - ${this.target}개 모으자!`;
    if (this.roundConfig.modifierDesc) {
      msg += `\n${this.roundConfig.modifierDesc}`;
    }
    this.message.show(msg, 4);
  }

  _getRoundConfig() {
    const idx = Math.min(this.round, ROUNDS.length - 1);
    const config = { ...ROUNDS[idx] };
    if (this.round >= ROUNDS.length) {
      const extra = this.round - ROUNDS.length + 1;
      config.target = 35 + extra * 5;
      config.name = '무지개 세계 ' + (extra + 1);
      config.emoji = '🌈';
      // Cycle through modifiers for endless rounds
      const mods = ['drifting', 'shy', 'fading', 'swarm'];
      config.modifier = mods[(extra - 1) % mods.length];
      config.modifierDesc = {
        drifting: '아이템이 둥둥 떠다녀요!',
        shy: '아이템이 도망가요! 빠르게 잡자!',
        fading: '아이템이 사라져요! 서둘러!',
        swarm: '아이템 무리가 몰려와요!',
      }[config.modifier];
    }
    return config;
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

    const itemDefs = this.roundConfig.items;
    const roll = Math.random();
    let rarity;
    if (roll < RARITY.legendary.chance) rarity = 'legendary';
    else if (roll < RARITY.legendary.chance + RARITY.rare.chance) rarity = 'rare';
    else if (roll < RARITY.legendary.chance + RARITY.rare.chance + RARITY.shiny.chance) rarity = 'shiny';
    else rarity = 'common';

    // Fever mode: upgrade rarity
    if (this.fever) {
      if (rarity === 'common' && Math.random() < 0.4) rarity = 'shiny';
      else if (rarity === 'shiny' && Math.random() < 0.3) rarity = 'rare';
    }

    const matching = itemDefs.filter(d => d.rarity === rarity);
    const def = matching.length > 0 ? matching[Math.floor(Math.random() * matching.length)]
      : itemDefs[Math.floor(Math.random() * itemDefs.length)];

    const item = new Item(x, y, def, rarity);

    // Apply round modifier to item
    if (this.roundConfig.modifier) {
      item.setModifier(this.roundConfig.modifier);
    }

    if (Math.random() < 0.1) {
      item.hidden = true;
    }

    if (this.activeEvent && this.activeEvent.type === 'rainbow') {
      if (rarity === 'common') {
        item.upgradeRarity('shiny');
      }
    }

    this.items.push(item);
  }

  /** Spawn a cluster of items near a point (for swarm modifier) */
  _spawnSwarmCluster() {
    const cx = 80 + Math.random() * (this.mapWidth - 160);
    const cy = 120 + Math.random() * (this.mapHeight - 200);
    const count = 4 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const x = cx + (Math.random() - 0.5) * 60;
      const y = cy + (Math.random() - 0.5) * 60;
      const itemDefs = this.roundConfig.items;
      const def = itemDefs[Math.floor(Math.random() * itemDefs.length)];
      const item = new Item(x, y, def, def.rarity);
      item.setModifier('swarm');
      item.swarmCenterX = cx;
      item.swarmCenterY = cy;
      this.items.push(item);
    }
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

    // Check if tapping the spell button (bottom right)
    const spellBtnX = this.screenW - 60;
    const spellBtnY = this.screenH - 70;
    const dx = x - spellBtnX;
    const dy = y - spellBtnY;
    if (dx * dx + dy * dy < 1225) { // 35²
      if (this._isSpellReady()) {
        this._castSpell();
      } else {
        // Cycle to next spell
        this.currentSpellIdx = (this.currentSpellIdx + 1) % this.spellList.length;
      }
      return;
    }

    const mx = x + this.camX;
    const my = y + this.camY;

    this.player.moveTo(mx, my);
    if (this.secondChar) {
      this.secondChar.moveTo(mx + 30, my + 10);
    }
  }

  /** Get current collection radius including buff + fever bonuses */
  getCollectRadius() {
    let radius = this.difficulty.collectRadius;
    for (const buff of this.buffs) {
      if (buff.type === 'range' || buff.type === 'both') radius += buff.amount;
    }
    if (this.fever) radius += COMBO.feverRangeBonus;
    return radius;
  }

  /** Get current move speed bonus from buffs */
  getSpeedBonus() {
    let bonus = 0;
    for (const buff of this.buffs) {
      if (buff.type === 'speed' || buff.type === 'both') bonus += buff.amount;
    }
    if (this.fever) bonus += 40; // fever speed boost
    return bonus;
  }

  _collectItem(item, index) {
    if (item.collected) return;
    item.collected = true;
    this._collectedCount++;

    // Combo tracking
    this.combo++;
    this.comboTimer = 0;
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;

    // Score with combo multiplier
    const comboMult = 1 + Math.min(this.combo, 20) * 0.2; // up to x5 at 20-combo
    const rarityMult = item.rarity === 'legendary' ? 10 : item.rarity === 'rare' ? 5 : item.rarity === 'shiny' ? 2.5 : 1;
    const itemScore = Math.floor(item.value * 10 * rarityMult * comboMult);
    this.score += itemScore;

    this.collected += item.value;
    this.totalCollected += item.value;
    this.rarityCount[item.rarity]++;

    this.particles.createParticles(item.x - this.camX, item.y - this.camY, item.color, 8);
    if (item.rarity !== 'common') {
      this.particles.createStars(item.x - this.camX, item.y - this.camY, 3);
    }

    // Floating text with combo info
    const valueText = item.value > 1 ? `+${item.value} ${item.emoji}` : `+1 ${item.emoji}`;
    this.particles.addFloatingText(item.x - this.camX, item.y - this.camY - 20, valueText, item.color);

    if (this.combo >= 3) {
      const comboColor = this.combo >= COMBO.feverThreshold ? '#FF4444' : '#FFD700';
      this.particles.addFloatingText(
        item.x - this.camX, item.y - this.camY - 45,
        `x${this.combo} COMBO!`, comboColor
      );
    }

    // Time bonus on collection (capped to maintain tension)
    const timeBonus = COLLECT_TIME_BONUS[item.rarity] || 0.3;
    this.timer = Math.min(this.timer + timeBonus, TIMER_CAP);
    if (timeBonus >= 1) {
      this.particles.addFloatingText(item.x - this.camX, item.y - this.camY - 40, `+${timeBonus}s`, '#7DF9FF');
    }

    // Trigger fever mode at threshold
    if (this.combo === COMBO.feverThreshold && !this.fever) {
      this.fever = true;
      this.feverTimer = COMBO.feverDuration;
      this.message.show('FEVER MODE!', 2);
      this.particles.createStars(this.player.x - this.camX, this.player.y - this.camY, 12);
    }

    // Apply item effect (buff)
    const effect = ITEM_EFFECTS[item.type];
    if (effect) {
      this.buffs.push({ type: effect.type, amount: effect.amount, remaining: effect.duration, emoji: effect.emoji });
      const label = effect.type === 'range' ? '수집 범위 UP!'
        : effect.type === 'speed' ? '이동 속도 UP!'
        : '범위+속도 UP!';
      this.message.show(`${effect.emoji} ${label}`, 2);
    }

    // Charge magic gauge
    this.magicGauge += item.value;

    if (this.collected >= this.target) {
      this.state = 'roundClear';
    }
  }

  _getCurrentSpell() {
    return SPELLS[this.spellList[this.currentSpellIdx]];
  }

  _isSpellReady() {
    return this.magicGauge >= this._getCurrentSpell().cost;
  }

  _applyCompanionAbility(comp, range, maxCount, filterFn, applyFn, starCount) {
    const rangeSq = range * range;
    let affected = 0;
    for (const item of this.items) {
      if (affected >= maxCount) break;
      if (!filterFn(item)) continue;
      const dx = item.x - comp.x;
      const dy = item.y - comp.y;
      if (dx * dx + dy * dy < rangeSq) {
        applyFn(item);
        affected++;
        this.particles.createStars(item.x - this.camX, item.y - this.camY, starCount);
      }
    }
    return affected;
  }

  _castSpell() {
    const spellKey = this.spellList[this.currentSpellIdx];
    const spell = SPELLS[spellKey];
    this.magicGauge -= spell.cost;
    this.message.show(`${spell.emoji} ${spell.name}! ${spell.desc}`, 3);
    this.particles.createStars(this.screenW / 2, this.screenH / 2, 15);

    if (spellKey === 'harvest') {
      // Pull ALL visible items toward player instantly
      for (const item of this.items) {
        if (item.collected || item.hidden) continue;
        item.magnetPull = true;
        item.magnetStrength = 800;
      }
    } else if (spellKey === 'blizzard') {
      // Freeze all items (stop drifting/fleeing for 8s)
      for (const item of this.items) {
        if (item.collected) continue;
        item.frozen = true;
        item.frozenTimer = 8;
      }
    } else if (spellKey === 'timewarp') {
      // Add time + slow motion
      this.timer = Math.min(this.timer + 15, TIMER_CAP);
      this.slowMotion = true;
      this.slowTimer = 8;
      this.particles.addFloatingText(this.screenW / 2, this.screenH / 2, '+15s!', '#9B59B6');
    } else if (spellKey === 'starburst') {
      // Spawn a burst of rare/shiny items around the player
      for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 * i) / 12;
        const dist = 60 + Math.random() * 80;
        const x = this.player.x + Math.cos(angle) * dist;
        const y = this.player.y + Math.sin(angle) * dist;
        const itemDefs = this.roundConfig.items;
        const rareDefs = itemDefs.filter(d => d.rarity === 'shiny' || d.rarity === 'rare');
        const def = rareDefs.length > 0
          ? rareDefs[Math.floor(Math.random() * rareDefs.length)]
          : itemDefs[Math.floor(Math.random() * itemDefs.length)];
        const item = new Item(x, y, def, def.rarity);
        if (this.roundConfig.modifier) item.setModifier(this.roundConfig.modifier);
        this.items.push(item);
      }
    }
  }

  _spawnCompanionNPC() {
    if (this.discoveryQueue.length === 0) return;
    const type = this.discoveryQueue.shift();
    let x, y, attempts = 0;
    do {
      x = 80 + Math.random() * (this.mapWidth - 160);
      y = 120 + Math.random() * (this.mapHeight - 200);
      attempts++;
    } while ((x - this.player.x) ** 2 + (y - this.player.y) ** 2 < 40000 && attempts < 20); // 200²
    this.companionNPCs.push(new CompanionNPC(type, x, y));
  }

  _addCompanion(type) {
    const total = this.companions.length + 1;
    const comp = new Companion(type, this.player, this.companions.length, total);
    this.companions.push(comp);
    for (let i = 0; i < this.companions.length; i++) {
      this.companions[i].assignAngle(i, this.companions.length);
    }
    const config = COMPANIONS[type];
    this.message.show(`${config.name} 합류! - ${config.desc}`, 4);
    this.particles.createStars(this.player.x - this.camX, this.player.y - this.camY, 8);
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

    // Combo timer - break combo if too long without collection
    this.comboTimer += dt;
    if (this.combo > 0 && this.comboTimer > COMBO.window) {
      this.combo = 0;
    }

    // Fever mode timer
    if (this.fever) {
      this.feverTimer -= dt;
      if (this.feverTimer <= 0) {
        this.fever = false;
        this.feverTimer = 0;
      }
    }

    // Update buffs
    for (let i = this.buffs.length - 1; i >= 0; i--) {
      this.buffs[i].remaining -= dt;
      if (this.buffs[i].remaining <= 0) this.buffs.splice(i, 1);
    }

    // Cache buff values once per frame (avoid repeated iteration)
    const speedBonus = this.getSpeedBonus();
    const collectRadius = this._cachedCollectRadius = this.getCollectRadius();
    const collectRadiusSq = collectRadius * collectRadius;
    const rangeBonus = collectRadius - this.difficulty.collectRadius;

    // Apply speed bonus to player
    this.player.speed = this.difficulty.moveSpeed + speedBonus;
    if (this.secondChar) this.secondChar.speed = this.difficulty.moveSpeed + speedBonus;

    // Player
    this.player.update(dt, this.mapWidth, this.mapHeight);
    if (this.secondChar) {
      this.secondChar.update(dt, this.mapWidth, this.mapHeight);
    }

    // Magnet pull + auto-collect: use squared distance to avoid sqrt
    const magnetRadius = this.fever ? MAGNET.feverPullRadius : MAGNET.pullRadius;
    const magnetRadiusSq = magnetRadius * magnetRadius;
    const magnetSpeed = this.fever ? MAGNET.feverPullSpeed : MAGNET.pullSpeed;

    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      if (item.collected || item.hidden) continue;

      const dx = item.x - this.player.x;
      const dy = item.y - this.player.y;
      const distSq = dx * dx + dy * dy;

      // Collect if within collect radius (squared comparison)
      if (distSq < collectRadiusSq) {
        this._collectItem(item, i);
        continue;
      }

      // Magnet pull if within magnet radius (or spell-forced)
      if (item.magnetPull || distSq < magnetRadiusSq) {
        const dist = Math.sqrt(distSq); // sqrt only when needed for pull direction
        const pullStrength = item.magnetPull ? item.magnetStrength : magnetSpeed;
        if (dist > 1) {
          const pull = pullStrength * dt;
          item.x -= (dx / dist) * Math.min(pull, dist - 5);
          item.y -= (dy / dist) * Math.min(pull, dist - 5);
        }
      }
    }

    // Companions
    const speedBonusForComp = speedBonus;
    for (const comp of this.companions) {
      comp.update(dt, this.items, (item, idx) => this._collectItem(item, idx), rangeBonus, speedBonusForComp, this.companions);

      // === Detect (보리): bark pulse reveals hidden items in large area ===
      if (comp.shouldBarkPulse()) {
        const count = this._applyCompanionAbility(comp, comp.range * 3, 5,
          item => item.hidden && !item.collected,
          item => { item.hidden = false; }, 3);
        if (count > 0) {
          this.message.show(`${comp.name}: 멍! 숨은 아이템 ${count}개 발견!`);
        } else {
          this.message.show(`${comp.name}: 멍멍! (킁킁...)`, 1);
        }
      }

      // === Dash (좁쌀이): sprint to distant item ===
      if (comp.shouldDash()) {
        // Find the farthest uncollected item in sector
        let bestItem = null;
        let bestDist = 0;
        for (const item of this.items) {
          if (item.collected || item.hidden) continue;
          const dx = item.x - comp.x;
          const dy = item.y - comp.y;
          const distSq = dx * dx + dy * dy;
          if (distSq > bestDist && distSq < 250 * 250) {
            bestDist = distSq;
            bestItem = item;
          }
        }
        if (bestItem) {
          comp.startDash(bestItem);
          this.message.show(`${comp.name}: 돌진! 🏃💨`, 1);
        }
      }

      // === Swoop (익돌이): dive-bomb toward item cluster ===
      if (comp.shouldSwoop()) {
        // Find area with most items (dense cluster)
        let bestX = comp.x + (comp.facingRight ? 150 : -150);
        let bestY = comp.y;
        let bestCount = 0;
        for (const item of this.items) {
          if (item.collected) continue;
          let nearby = 0;
          for (const other of this.items) {
            if (other.collected || other === item) continue;
            const dx = other.x - item.x;
            const dy = other.y - item.y;
            if (dx * dx + dy * dy < 80 * 80) nearby++;
          }
          if (nearby > bestCount) {
            bestCount = nearby;
            bestX = item.x;
            bestY = item.y;
          }
        }
        comp.startSwoop(bestX, bestY);
        this.message.show(`${comp.name}: 급강하! 🦅`, 1);
      }

      // === Lucky (고순이): sparkle aura upgrades nearby items ===
      if (comp.shouldLuckyAura()) {
        const auraR = comp.config.luckAuraRadius || 100;
        const count = this._applyCompanionAbility(comp, auraR, 3,
          item => !item.collected && item.rarity === 'common',
          item => { item.upgradeRarity('shiny'); }, 4);
        if (count > 0) {
          this.message.show(`${comp.name}: 냥~ ✨ 아이템 ${count}개 등급 UP!`);
        }
      }
    }

    // Companion NPC spawning
    if (this.discoveryQueue.length > 0 && this.gameTime >= this.nextCompanionSpawnTime) {
      this._spawnCompanionNPC();
      this.nextCompanionSpawnTime = this.gameTime + COMPANION_SPAWN_INTERVAL + Math.random() * 20;
    }

    // Update companion NPCs
    for (let i = this.companionNPCs.length - 1; i >= 0; i--) {
      const npc = this.companionNPCs[i];
      if (npc.update(dt, this.player.x, this.player.y)) {
        this._addCompanion(npc.type);
        this.companionNPCs.splice(i, 1);
      }
    }

    // Item spawning (faster during fever)
    this.spawnTimer += dt;
    const effectiveSpawnRate = this.fever ? this.spawnRate * COMBO.feverSpawnMult : this.spawnRate;
    const spawnInterval = 1 / effectiveSpawnRate;
    if (this.spawnTimer >= spawnInterval) {
      this.spawnTimer -= spawnInterval;
      const activeCount = this.items.length - this._collectedCount;
      const maxItems = 20 + this.round * 5 + (this.fever ? 10 : 0);
      if (activeCount < maxItems) {
        if (this.roundConfig.modifier === 'swarm' && Math.random() < 0.3) {
          this._spawnSwarmCluster();
        } else {
          this._spawnItem();
        }
        if (this.activeEvent && this.activeEvent.type === 'star_rain') {
          this._spawnItem();
        }
      }
    }

    // Slow motion timer
    if (this.slowMotion) {
      this.slowTimer -= dt;
      if (this.slowTimer <= 0) this.slowMotion = false;
    }

    // Update items (pass player position for shy modifier)
    const itemDt = this.slowMotion ? dt * 0.3 : dt; // slow motion slows items
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      // Handle frozen state from blizzard
      if (item.frozen) {
        item.frozenTimer -= dt;
        if (item.frozenTimer <= 0) item.frozen = false;
        // Don't update item movement while frozen, but do update animations
        item.phase += dt * 3;
        if (item.spawnAnim < 1) item.spawnAnim = Math.min(1, item.spawnAnim + dt * 4);
        if (item.collected) item.collectAnim += dt * 5;
      } else {
        item.update(itemDt, this.player.x, this.player.y, this.mapWidth, this.mapHeight);
      }
      if (item.isFinished()) {
        this.items.splice(i, 1);
        this._collectedCount--;
      }
    }

    // Events
    if (!this.activeEvent && this.gameTime >= this.nextEventTime) {
      this.nextEventTime = this.gameTime + 30 + Math.random() * 30;
    }
    if (this.activeEvent) {
      this.eventTimer -= dt;
      if (this.eventTimer <= 0) this.activeEvent = null;
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

    // Fever screen effect
    if (this.fever) {
      const pulse = 0.03 + Math.sin(this.gameTime * 6) * 0.02;
      ctx.fillStyle = `rgba(255, 100, 50, ${pulse})`;
      ctx.fillRect(0, 0, w, h);
    }

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

    // Collection radius indicators
    this._drawCollectRadius(ctx);

    // Items
    for (const item of this.items) {
      item.draw(ctx);
    }

    // Companion NPCs
    for (const npc of this.companionNPCs) {
      npc.draw(ctx, this.spriteCache);
    }

    // Companions
    for (const comp of this.companions) {
      comp.draw(ctx, this.spriteCache);
    }

    // Second character
    if (this.secondChar) {
      this.secondChar.draw(ctx, this.spriteCache);
    }

    // Player
    this.player.draw(ctx, this.spriteCache);

    ctx.restore();

    // UI overlay
    this._drawHUD(ctx, w, h);
    this._drawComboIndicator(ctx, w, h);
    this._drawBuffIndicators(ctx, w, h);
    this._drawSpellButton(ctx, w, h);

    // Particles
    this.particles.draw(ctx);

    // Message
    this.message.draw(ctx, w, h);
  }

  _drawHUD(ctx, w, h) {
    const safeTop = this.safeTop;

    // Top bar background
    ctx.fillStyle = this.fever ? 'rgba(180,50,20,0.5)' : 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, w, safeTop + 70);

    // Timer
    const mins = Math.floor(this.timer / 60);
    const secs = Math.floor(this.timer % 60);
    const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;

    ctx.font = 'Bold 28px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const timerY = safeTop + 35;

    if (this.timer < 15) {
      const flash = Math.sin(this.gameTime * 8) > 0;
      ctx.fillStyle = flash ? '#FF4444' : '#FF8888';
    } else if (this.timer < 30) {
      ctx.fillStyle = '#FF4444';
    } else {
      ctx.fillStyle = '#FFF';
    }
    ctx.fillText(`⏰ ${timeStr}`, 16, timerY);

    // Collection progress
    const progText = `🧺 ${this.collected} / ${this.target}`;
    ctx.textAlign = 'center';
    ctx.fillStyle = this.collected >= this.target ? '#FFD700' : '#FFF';
    ctx.fillText(progText, w / 2, timerY);

    // Round + modifier indicator
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
      if (this.fever) {
        grad.addColorStop(0, '#FF4444');
        grad.addColorStop(1, '#FF8800');
      } else {
        grad.addColorStop(0, '#FFD700');
        grad.addColorStop(1, '#FF8F00');
      }
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW * progress, barH, 4);
      ctx.fill();
    }

    // Companion indicators (bottom left)
    if (this.companions.length > 0) {
      const indicatorY = h - 30;
      for (let i = 0; i < this.companions.length; i++) {
        const comp = this.companions[i];
        const ix = 24 + i * 44;
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.arc(ix, indicatorY, 18, 0, Math.PI * 2);
        ctx.fill();
        this.spriteCache.draw(ctx, `${comp.type}-idle`, ix, indicatorY, 0.45);
        ctx.font = '9px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFF';
        ctx.fillText(comp.name, ix, indicatorY + 26);
      }
    }
  }

  _drawComboIndicator(ctx, w, h) {
    if (this.combo < 2) return;

    const centerX = w / 2;
    const y = this.safeTop + 80;

    // Combo background
    const comboScale = Math.min(1, 0.8 + this.combo * 0.05);
    const fontSize = Math.floor(22 * comboScale);

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Combo text with pulsing effect
    const pulse = 1 + Math.sin(this.gameTime * 10) * 0.08;
    ctx.font = `Bold ${Math.floor(fontSize * pulse)}px "Segoe UI", "Apple SD Gothic Neo", sans-serif`;

    if (this.fever) {
      ctx.fillStyle = '#FF4444';
      ctx.fillText(`FEVER x${this.combo}`, centerX, y);
    } else if (this.combo >= COMBO.feverThreshold - 1) {
      // Almost fever - exciting color
      ctx.fillStyle = '#FF8800';
      ctx.fillText(`x${this.combo} COMBO!`, centerX, y);
    } else {
      ctx.fillStyle = '#FFD700';
      ctx.fillText(`x${this.combo} COMBO`, centerX, y);
    }

    // Combo timer bar (shows time remaining before combo breaks)
    const barW = 80;
    const barH = 3;
    const barX = centerX - barW / 2;
    const barY2 = y + fontSize * 0.6;
    const remaining = Math.max(0, 1 - this.comboTimer / COMBO.window);

    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(barX, barY2, barW, barH);
    ctx.fillStyle = remaining > 0.3 ? '#FFD700' : '#FF4444';
    ctx.fillRect(barX, barY2, barW * remaining, barH);

    ctx.restore();
  }

  _drawCollectRadius(ctx) {
    const radius = this._cachedCollectRadius || this.getCollectRadius();
    const feverGlow = this.fever ? 0.06 : 0;

    // Player radius
    ctx.save();
    ctx.globalAlpha = 0.12 + feverGlow;
    ctx.fillStyle = this.fever ? '#FF6633' : '#FFD700';
    ctx.beginPath();
    ctx.arc(this.player.x, this.player.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = this.fever ? '#FF6633' : '#FFD700';
    ctx.lineWidth = this.fever ? 2.5 : 1.5;
    ctx.stroke();
    ctx.restore();

    // Second character
    if (this.secondChar) {
      ctx.save();
      ctx.globalAlpha = 0.10 + feverGlow;
      ctx.fillStyle = '#FF69B4';
      ctx.beginPath();
      ctx.arc(this.secondChar.x, this.secondChar.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.30;
      ctx.strokeStyle = '#FF69B4';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }

    // Companion radii
    for (const comp of this.companions) {
      const compRadius = comp.range * 0.5 + (comp.currentRangeBonus || 0);
      ctx.save();
      ctx.globalAlpha = 0.08 + feverGlow;
      ctx.fillStyle = '#90EE90';
      ctx.beginPath();
      ctx.arc(comp.x, comp.y, compRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.25;
      ctx.strokeStyle = '#90EE90';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }
  }

  _drawBuffIndicators(ctx, w, h) {
    if (this.buffs.length === 0 && !this.fever) return;
    const startX = w - 16;
    let y = this.safeTop + 75;

    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';

    // Fever indicator
    if (this.fever) {
      const secs = Math.ceil(this.feverTimer);
      ctx.fillStyle = 'rgba(200,50,20,0.6)';
      ctx.beginPath();
      ctx.roundRect(startX - 100, y - 2, 104, 20, 10);
      ctx.fill();
      ctx.font = 'Bold 13px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
      ctx.fillStyle = '#FF4444';
      ctx.fillText(`FEVER ${secs}s`, startX - 4, y);
      y += 24;
    }

    for (const buff of this.buffs) {
      const secs = Math.ceil(buff.remaining);
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.roundRect(startX - 90, y - 2, 94, 20, 10);
      ctx.fill();
      ctx.font = 'Bold 13px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
      ctx.fillStyle = buff.type === 'speed' ? '#7DF9FF' : buff.type === 'range' ? '#FFD700' : '#FF69B4';
      ctx.fillText(`${buff.emoji} ${secs}s`, startX - 4, y);
      y += 24;
    }
  }

  _drawSpellButton(ctx, w, h) {
    const spell = this._getCurrentSpell();
    const ready = this._isSpellReady();
    const btnX = w - 60;
    const btnY = h - 70;
    const radius = 30;

    ctx.save();

    // Gauge fill (arc around the button)
    const gaugeProgress = Math.min(1, this.magicGauge / spell.cost);
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.arc(btnX, btnY, radius + 3, 0, Math.PI * 2);
    ctx.stroke();

    if (gaugeProgress > 0) {
      ctx.strokeStyle = ready ? spell.color : 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(btnX, btnY, radius + 3, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * gaugeProgress);
      ctx.stroke();
    }

    // Button background
    ctx.globalAlpha = ready ? 0.9 : 0.5;
    ctx.fillStyle = ready ? spell.color : 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.arc(btnX, btnY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Pulse when ready
    if (ready) {
      const pulse = Math.sin(this.gameTime * 5) * 0.15;
      ctx.globalAlpha = 0.3 + pulse;
      ctx.fillStyle = spell.color;
      ctx.beginPath();
      ctx.arc(btnX, btnY, radius + 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Spell emoji
    ctx.globalAlpha = 1;
    ctx.font = '28px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(spell.emoji, btnX, btnY);

    // Gauge count
    ctx.font = 'Bold 10px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.fillStyle = '#FFF';
    ctx.fillText(`${Math.floor(this.magicGauge)}/${spell.cost}`, btnX, btnY + radius + 12);

    ctx.restore();
  }

  advanceRound() {
    this.round++;
    this.roundConfig = this._getRoundConfig();
    this.timer = Math.min(this.timer + ROUND_CLEAR_BONUS, TIMER_CAP);
    this.collected = 0;
    this.target = Math.ceil(this.roundConfig.target * this.difficulty.targetMult);
    this.state = 'playing';
    this.combo = 0;
    // Keep magic gauge across rounds (reward for surplus collection)
    this.bgDecos = this._generateDecos();

    this.items = this.items.filter(i => !i.collected);
    this._collectedCount = 0;
    this._spawnInitialItems();

    this._showRoundIntro();
  }

  getStats() {
    return {
      round: this.round + 1,
      totalCollected: this.totalCollected,
      score: Math.floor(this.score),
      maxCombo: this.maxCombo,
      rarityCount: { ...this.rarityCount },
      companions: this.companions.map(c => c.name).join(', '),
      difficulty: this.difficultyKey,
      roundName: this.roundConfig.name,
    };
  }
}
