/**
 * Main exploration scene - educational encyclopedia adventure
 * Zelda/Animal Crossing style: free roam, discover items, fill encyclopedia
 */
import { STAGES, PLAYER, MAP_WIDTH, MAP_HEIGHT, DISCOVER_RADIUS, COMPANION_HINT_INTERVAL, HIDE_STYLES, TERRAIN_PRESETS, WORD_MISSIONS } from '../config.js';
import { Character } from '../entity/Character.js';
import { Item } from '../entity/Item.js';
import { Companion } from '../entity/Companion.js';
import { CompanionNPC } from '../entity/CompanionNPC.js';
import { ParticleSystem } from '../../../shared/ParticleSystem.js';
import { Message } from '../../../shared/ui/Message.js';
import { CollectionTray } from '../ui/CollectionTray.js';
import { WordBuilder } from '../ui/WordBuilder.js';
import { drawWrappedText, generateTerrain, drawTerrain, findNearestUndiscovered, getDirectionHint, updateCompanions, drawMiniMap, updateCamera, drawSpriteOrEmoji } from './sceneUtils.js';

export class GameScene {
  constructor(w, h, safeTop, stageIndex, spriteCache) {
    this.spriteCache = spriteCache;
    this.stageIndex = stageIndex;
    this.stageConfig = STAGES[stageIndex];

    // Map
    this.mapWidth = MAP_WIDTH;
    this.mapHeight = MAP_HEIGHT;
    this.gameScale = Math.max(w / this.mapWidth, h / this.mapHeight);
    this.screenW = w;
    this.screenH = h;
    this.viewW = w / this.gameScale;
    this.viewH = h / this.gameScale;
    this.safeTop = safeTop;

    // Camera
    this.camX = 0;
    this.camY = 0;

    // Player (always Ria for now)
    this.player = new Character(this.mapWidth / 2, this.mapHeight / 2, 'ria', { moveSpeed: PLAYER.moveSpeed, collectRadius: 0 });

    // Companions - start with default (리아→익돌이)
    this.companions = [new Companion('ikdol', this.player, 0, 1)];

    // Companion NPCs discoverable on the map
    this.companionNPCs = this._placeCompanionNPCs();

    // Hint timer
    this.hintTimer = COMPANION_HINT_INTERVAL * 0.5;

    // Items - scatter across the map
    this.items = [];
    this.discoveredCount = 0;
    this.totalItems = this.stageConfig.items.length;
    this._placeItems();

    // Discovery popup
    this.popup = null; // { item, timer }
    this.popupAnim = 0;

    // Effects
    this.particles = new ParticleSystem();
    this.message = new Message();

    // Rich terrain features
    const terrainPreset = TERRAIN_PRESETS[this.stageConfig.terrain] || TERRAIN_PRESETS.forest;
    this.terrain = generateTerrain(terrainPreset, this.mapWidth, this.mapHeight);

    // Time tracking (no timer pressure - just for animations)
    this.gameTime = 0;

    // Mini-map
    this.showMiniMap = true;

    // Collection tray
    this.collectionTray = new CollectionTray(spriteCache);

    // Word builder
    this.wordBuilder = new WordBuilder();
    this.completedWords = [];
    this.wordMissions = WORD_MISSIONS[this.stageConfig.id] || [];
    this.wordReadyMission = null; // mission ready to start

    // State
    this.state = 'exploring'; // exploring, popup, complete, wordReady, wordBuilding

    // Show intro
    this.message.show(`${this.stageConfig.emoji} ${this.stageConfig.name}에 오신 걸 환영해요!\n돌아다니며 숨겨진 것들을 찾아보세요!`, 4);
  }

  _placeItems() {
    const items = this.stageConfig.items;
    const count = items.length;
    const margin = 120;
    const usableW = this.mapWidth - margin * 2;
    const usableH = this.mapHeight - margin * 2;

    // Distribute items across the map with minimum spacing
    const positions = [];
    for (let i = 0; i < count; i++) {
      let x, y, attempts = 0;
      do {
        x = margin + Math.random() * usableW;
        y = margin + Math.random() * usableH;
        attempts++;
      } while (attempts < 50 && positions.some(p => {
        const dx = p.x - x;
        const dy = p.y - y;
        return dx * dx + dy * dy < 150 * 150;
      }));
      positions.push({ x, y });

      const hideStyle = HIDE_STYLES[Math.floor(Math.random() * HIDE_STYLES.length)];
      this.items.push(new Item(x, y, items[i], hideStyle));
    }
  }

  _placeCompanionNPCs() {
    const margin = 200;
    const npcTypes = ['bori', 'jopssal', 'gosun'];
    const npcs = [];
    const count = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < count && i < npcTypes.length; i++) {
      const nx = margin + Math.random() * (this.mapWidth - margin * 2);
      const ny = margin + Math.random() * (this.mapHeight - margin * 2);
      npcs.push(new CompanionNPC(npcTypes[i], nx, ny));
    }
    return npcs;
  }

  // terrain is generated in constructor via generateTerrain()

  handleTap(x, y) {
    // If popup is showing, tap to dismiss
    if (this.state === 'popup') {
      this.popup = null;
      this.state = this.discoveredCount >= this.totalItems ? 'complete' : 'exploring';
      if (this.state === 'complete') return 'stageClear';
      // Check word missions after dismissing popup
      this._checkWordMissions();
      return null;
    }

    // Word ready - tap to start building
    if (this.state === 'wordReady') {
      if (this.wordReadyMission) {
        this.wordBuilder.start(this.wordReadyMission);
        this.state = 'wordBuilding';
      }
      return null;
    }

    // Word building - delegate to word builder
    if (this.state === 'wordBuilding') {
      const result = this.wordBuilder.handleTap(x, y, this.screenW, this.screenH);
      if (result === 'wordSuccess') {
        this.completedWords.push(this.wordReadyMission.word);
        this.particles.createStars(this.screenW / 2, this.screenH / 2, 25);
        this.wordReadyMission = null;
        this.state = this.discoveredCount >= this.totalItems ? 'complete' : 'exploring';
        if (this.state === 'complete') return 'stageClear';
      }
      return null;
    }

    if (this.state !== 'exploring') return null;

    // Convert screen coords to world coords
    const wx = x / this.gameScale + this.camX;
    const wy = y / this.gameScale + this.camY;

    // Check if tapping an item first
    for (const item of this.items) {
      if (item.hitTest(wx, wy)) {
        this._discoverItem(item);
        return null;
      }
    }

    // Otherwise, move player
    this.player.moveTo(wx, wy);
    return null;
  }

  _discoverItem(item) {
    item.discovered = true;
    this.discoveredCount++;

    // Add to collection tray
    this.collectionTray.addItem(item.emoji, item.sprite);

    // Celebration particles
    const sx = this._toScreenX(item.x);
    const sy = this._toScreenY(item.y);
    this.particles.createStars(sx, sy, 12);
    this.particles.createParticles(sx, sy, '#FFD700', 15);
    this.particles.addFloatingText(sx, sy - 30, '새로운 발견!', '#FFD700');

    // Show popup
    this.popup = item;
    this.popupAnim = 0;
    this.state = 'popup';

    // Check word missions after popup dismiss is handled in handleTap
  }

  _checkWordMissions() {
    if (this.wordMissions.length === 0) return;

    const discoveredIds = new Set(this.items.filter(i => i.discovered).map(i => i.emoji));

    for (const mission of this.wordMissions) {
      if (this.completedWords.includes(mission.word)) continue;

      const hasAll = mission.display.every(letter => discoveredIds.has(letter));
      if (hasAll) {
        this.wordReadyMission = mission;
        this.state = 'wordReady';
        this.message.show(`✨ "${mission.word}" 글자가 모두 모였어요! 터치해서 단어를 만들어보세요!`, 5);
        return;
      }
    }
  }

  _updateCompanions(dt) {
    updateCompanions(this, dt, this.items);

    // Direction hints from lead companion
    this.hintTimer -= dt;
    if (this.hintTimer <= 0 && this.discoveredCount < this.totalItems) {
      this.hintTimer = COMPANION_HINT_INTERVAL;
      const lead = this.companions[0];
      if (!lead) return;

      const nearest = findNearestUndiscovered(this.items, this.player.x, this.player.y);
      if (nearest) {
        const dx = nearest.x - this.player.x;
        const dy = nearest.y - this.player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > DISCOVER_RADIUS * 2) {
          const dir = getDirectionHint(this.player.x, this.player.y, nearest.x, nearest.y);
          lead.setSpeech(`${dir}에서 뭔가 느껴져!`, 4);
        } else {
          lead.setSpeech('가까이에 뭔가 있어!', 3);
        }
      }
    }
  }

  update(dt, w, h) {
    if (this.state === 'complete') return 'stageClear';

    this.screenW = w;
    this.screenH = h;
    this.gameScale = Math.max(w / this.mapWidth, h / this.mapHeight);
    this.viewW = w / this.gameScale;
    this.viewH = h / this.gameScale;
    this.gameTime += dt;

    // Player
    this.player.update(dt, this.mapWidth, this.mapHeight);

    // Companions
    this._updateCompanions(dt);

    // Items proximity check
    for (const item of this.items) {
      if (!item.discovered) {
        item.updateProximity(this.player.x, this.player.y);
      }
      item.update(dt);
    }

    // Camera follow player
    updateCamera(this, dt);

    // Popup animation
    if (this.popup) {
      this.popupAnim = Math.min(1, this.popupAnim + dt * 4);
    }

    // Collection tray
    this.collectionTray.update(dt);

    // Word builder
    this.wordBuilder.update(dt);

    // Effects
    this.particles.update(dt);
    this.message.update(dt);

    return null;
  }

  draw(ctx, w, h) {
    // Background
    ctx.fillStyle = this.stageConfig.bgColor;
    ctx.fillRect(0, 0, w, h);

    // Apply game scale
    ctx.save();
    ctx.scale(this.gameScale, this.gameScale);

    // Ground
    const groundY = this.mapHeight * 0.2 - this.camY;
    if (groundY < this.viewH) {
      ctx.fillStyle = this.stageConfig.groundColor;
      ctx.fillRect(0, Math.max(0, groundY), this.viewW, this.viewH - Math.max(0, groundY));
    }

    ctx.save();
    ctx.translate(-this.camX, -this.camY);

    // Rich terrain features
    drawTerrain(ctx, this.terrain, this.gameTime, this.camX, this.camY, this.viewW, this.viewH);

    // Items
    for (const item of this.items) {
      item.draw(ctx, this.spriteCache);
    }

    // CompanionNPCs
    for (const npc of this.companionNPCs) {
      npc.draw(ctx, this.spriteCache);
    }

    // Active companions
    for (const comp of this.companions) {
      comp.draw(ctx, this.spriteCache);
    }

    // Player
    this.player.draw(ctx, this.spriteCache);

    ctx.restore(); // end camera
    ctx.restore(); // end scale

    // HUD (screen coords)
    this._drawHUD(ctx, w, h);

    // Mini-map
    if (this.showMiniMap) {
      this._drawMiniMap(ctx, w, h);
    }

    // Collection tray
    this.collectionTray.draw(ctx, w, h);

    // Particles
    this.particles.draw(ctx);

    // Message
    this.message.draw(ctx, w, h);

    // Discovery popup overlay
    if (this.popup) {
      this._drawPopup(ctx, w, h);
    }

    // Word ready banner
    if (this.state === 'wordReady' && this.wordReadyMission) {
      this._drawWordReadyBanner(ctx, w, h);
    }

    // Word builder overlay
    if (this.state === 'wordBuilding') {
      this.wordBuilder.draw(ctx, w, h);
    }
  }

  _drawWordReadyBanner(ctx, w, h) {
    const bannerH = 60;
    const bannerY = h / 2 - bannerH / 2;
    const pulse = 1 + Math.sin(this.gameTime * 4) * 0.03;

    ctx.save();
    ctx.translate(w / 2, bannerY + bannerH / 2);
    ctx.scale(pulse, pulse);
    ctx.translate(-w / 2, -(bannerY + bannerH / 2));

    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.beginPath();
    ctx.roundRect(20, bannerY, w - 40, bannerH, 16);
    ctx.fill();

    ctx.font = 'Bold 20px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`${this.wordReadyMission.emoji} "${this.wordReadyMission.word}" 만들기! 터치!`, w / 2, bannerY + bannerH / 2);

    ctx.restore();
  }

  _drawHUD(ctx, w, h) {
    const safeTop = this.safeTop;

    // Top bar
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(0, 0, w, safeTop + 55);

    const centerY = safeTop + 28;

    // Stage name
    ctx.font = 'Bold 20px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFF';
    ctx.fillText(`${this.stageConfig.emoji} ${this.stageConfig.name}`, 16, centerY);

    // Progress
    ctx.textAlign = 'right';
    ctx.font = 'Bold 18px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.fillStyle = this.discoveredCount >= this.totalItems ? '#FFD700' : '#FFF';
    ctx.fillText(`📖 ${this.discoveredCount} / ${this.totalItems}`, w - 16, centerY);

    // Progress bar
    const barX = 16;
    const barY = safeTop + 45;
    const barW = w - 32;
    const barH = 6;
    const progress = this.totalItems > 0 ? this.discoveredCount / this.totalItems : 0;

    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 3);
    ctx.fill();

    if (progress > 0) {
      const grad = ctx.createLinearGradient(barX, 0, barX + barW * progress, 0);
      grad.addColorStop(0, '#FFD700');
      grad.addColorStop(1, '#FFA000');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW * progress, barH, 3);
      ctx.fill();
    }
  }

  _drawMiniMap(ctx, w, h) {
    drawMiniMap(ctx, this, this.items);
  }

  _drawPopup(ctx, w, h) {
    if (!this.popup) return;

    const anim = this.popupAnim;
    const scale = 0.5 + anim * 0.5 + Math.sin(anim * Math.PI) * 0.1;

    // Dim background
    ctx.save();
    ctx.fillStyle = `rgba(0,0,0,${anim * 0.5})`;
    ctx.fillRect(0, 0, w, h);

    // Popup card
    ctx.translate(w / 2, h * 0.4);
    ctx.scale(scale, scale);

    const cardW = Math.min(320, w * 0.85);
    const cardH = 260;

    // Card background
    ctx.fillStyle = '#FFF';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, 20);
    ctx.fill();
    ctx.shadowBlur = 0;

    // "New Discovery!" banner
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.roundRect(-cardW / 2, -cardH / 2, cardW, 44, [20, 20, 0, 0]);
    ctx.fill();

    ctx.font = 'Bold 18px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#5D4037';
    ctx.fillText(`🎉 새로운 발견! (${this.discoveredCount}/${this.totalItems})`, 0, -cardH / 2 + 22);

    // Big emoji or sprite
    drawSpriteOrEmoji(ctx, this.spriteCache, this.popup.sprite, this.popup.emoji, 0, -cardH / 2 + 100, this.popup.displaySize * 2);

    // Name
    ctx.font = 'Bold 22px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.fillStyle = '#333';
    ctx.fillText(this.popup.name, 0, -cardH / 2 + 155);

    // Description
    ctx.font = '15px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.fillStyle = '#666';
    this._drawWrappedText(ctx, this.popup.desc, 0, -cardH / 2 + 190, cardW - 40, 20);

    // "Tap to continue"
    ctx.globalAlpha = 0.4 + Math.sin(this.gameTime * 3) * 0.3;
    ctx.font = '13px sans-serif';
    ctx.fillStyle = '#999';
    ctx.fillText('터치하면 계속 탐험!', 0, cardH / 2 - 16);

    ctx.restore();
  }

  _drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
    drawWrappedText(ctx, text, x, y, maxWidth, lineHeight);
  }

  /** Convert world X to screen X */
  _toScreenX(worldX) { return (worldX - this.camX) * this.gameScale; }
  /** Convert world Y to screen Y */
  _toScreenY(worldY) { return (worldY - this.camY) * this.gameScale; }

  /** Save data for localStorage */
  getSaveData() {
    return {
      stageIndex: this.stageIndex,
      discovered: this.items.filter(i => i.discovered).map(i => i.id),
      playerX: this.player.x,
      playerY: this.player.y,
      completedWords: [...this.completedWords],
      savedAt: Date.now(),
    };
  }

  /** Restore from save */
  loadSaveData(save) {
    if (!save) return;
    const discoveredIds = new Set(save.discovered || []);
    for (const item of this.items) {
      if (discoveredIds.has(item.id)) {
        item.discovered = true;
        item.discoveredAnim = 1;
      }
    }
    this.discoveredCount = discoveredIds.size;
    if (save.playerX !== undefined) {
      this.player.x = save.playerX;
      this.player.y = save.playerY;
      this.player.targetX = save.playerX;
      this.player.targetY = save.playerY;
    }
    // Restore completed words
    this.completedWords = save.completedWords || [];
    // Restore collection tray from discovered items
    const discoveredItems = this.items.filter(i => i.discovered);
    this.collectionTray.restore(discoveredItems.map(i => ({ emoji: i.emoji, sprite: i.sprite })));
  }

  getDiscoveredIds() {
    return this.items.filter(i => i.discovered).map(i => i.id);
  }

  getStats() {
    return {
      stageIndex: this.stageIndex,
      stageName: this.stageConfig.name,
      stageEmoji: this.stageConfig.emoji,
      discovered: this.discoveredCount,
      total: this.totalItems,
      items: this.items.map(i => i.emoji),
    };
  }
}
