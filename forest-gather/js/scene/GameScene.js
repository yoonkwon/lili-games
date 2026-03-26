/**
 * Main exploration scene - educational encyclopedia adventure
 * Zelda/Animal Crossing style: free roam, discover items, fill encyclopedia
 */
import { STAGES, PLAYER, MAP_WIDTH, MAP_HEIGHT, DISCOVER_RADIUS, COMPANION_HINT_INTERVAL, HIDE_STYLES, TERRAIN_PRESETS, WORD_MISSIONS, COMPANION_QUESTS, COMPANION_DIALOGUE } from '../config.js';
import { pp } from '../../../shared/korean.js';
import { Character } from '../entity/Character.js';
import { Item } from '../entity/Item.js';
import { Companion } from '../entity/Companion.js';
import { CompanionNPC } from '../entity/CompanionNPC.js';
import { ParticleSystem } from '../../../shared/ParticleSystem.js';
import { Message } from '../../../shared/ui/Message.js';
import { CollectionTray } from '../ui/CollectionTray.js';
import { WordBuilder } from '../ui/WordBuilder.js';
import { drawWrappedText, generateTerrain, drawTerrain, findNearestUndiscovered, getDirectionHint, updateCompanions, drawMiniMap, updateCamera, drawSpriteOrEmoji, updateBuddy } from './sceneUtils.js';

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

    // Players — Ria (main) & Lisa (buddy)
    this.player = new Character(this.mapWidth / 2, this.mapHeight / 2, 'ria', { moveSpeed: PLAYER.moveSpeed, collectRadius: 0 });
    this.lisa = new Character(this.mapWidth / 2 + 30, this.mapHeight / 2 + 20, 'lisa', { moveSpeed: PLAYER.moveSpeed * 1.05, collectRadius: 0 });

    // Single companion (shuffled, azzi = twin pair)
    this.companionTypes = ['bori', 'jopssal', 'ikdol', 'gosun', 'azzi'];
    for (let i = this.companionTypes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.companionTypes[i], this.companionTypes[j]] = [this.companionTypes[j], this.companionTypes[i]];
    }
    this.companionRoundIndex = 0;
    this.companions = this._createCompanion(0);
    this.companionNPCs = [];

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

    // Companion quest system
    const stageQuests = COMPANION_QUESTS[this.stageConfig.id] || [];
    this.companionQuests = stageQuests.map(q => ({ ...q, completed: false }));
    this.currentQuestIndex = 0;
    this.questAnnouncedAt = -1; // gameTime when quest was announced
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

  _createCompanion(roundIndex) {
    const compType = this.companionTypes[roundIndex % this.companionTypes.length];
    if (compType === 'azzi') {
      return [
        new Companion('azzi_white', this.player, 0, 2),
        new Companion('azzi_blue', this.player, 1, 2),
      ];
    }
    return [new Companion(compType, this.player, 0, 1)];
  }

  _placeCompanionNPCs() {
    const margin = 200;
    const npcTypes = ['bori', 'jopssal', 'gosun'];
    // Shuffle so different companions appear each session
    for (let i = npcTypes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [npcTypes[i], npcTypes[j]] = [npcTypes[j], npcTypes[i]];
    }
    const npcs = [];
    const count = 2 + Math.floor(Math.random() * 2); // 2-3 NPCs
    for (let i = 0; i < count && i < npcTypes.length; i++) {
      const nx = margin + Math.random() * (this.mapWidth - margin * 2);
      const ny = margin + Math.random() * (this.mapHeight - margin * 2);
      npcs.push(new CompanionNPC(npcTypes[i], nx, ny));
    }
    return npcs;
  }

  // terrain is generated in constructor via generateTerrain()

  handleTap(x, y) {
    // If popup is showing, handle quiz or confirm
    if (this.state === 'popup') {
      if (this.popupAnim < 0.8) return null;
      const cardH = 280;
      const popupCenterY = this.screenH * 0.4;

      if (this.popupQuiz) {
        // Quiz mode: two choice buttons
        const btnW = 120, btnH = 40, gap = 12;
        const totalW = btnW * 2 + gap;
        const btnY = popupCenterY + cardH / 2 - btnH - 14;
        for (let i = 0; i < this.popupQuiz.choices.length; i++) {
          const bx = this.screenW / 2 - totalW / 2 + i * (btnW + gap);
          if (x >= bx && x <= bx + btnW && y >= btnY && y <= btnY + btnH) {
            if (i === this.popupQuiz.correctIndex) {
              this.particles.createStars(this.screenW / 2, popupCenterY, 8);
              this.message.show('정답! 🎉', 1.5);
              this.popup = null;
              this.popupQuiz = null;
              this.state = this.discoveredCount >= this.totalItems ? 'complete' : 'exploring';
              if (this.state === 'complete') return 'stageClear';
              this._checkWordMissions();
              this._checkCompanionQuest();
            } else {
              this.popupShake = 0.5;
              this.message.show('다시 생각해보자! 🤔', 1.5);
            }
            return null;
          }
        }
        return null;
      }

      // No quiz — confirm button fallback
      const btnW = 140, btnH = 42;
      const btnX = this.screenW / 2 - btnW / 2;
      const btnY = popupCenterY + cardH / 2 - btnH - 12;
      if (x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH) {
        this.popup = null;
        this.popupQuiz = null;
        this.state = this.discoveredCount >= this.totalItems ? 'complete' : 'exploring';
        if (this.state === 'complete') return 'stageClear';
        this._checkWordMissions();
        this._checkCompanionQuest();
      }
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
      } else if (result === 'wordCancel') {
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

    // Companion reaction dialogue
    this._companionReact(item);

    // Check companion quest progress
    this._checkCompanionQuest();

    // Show popup with optional mini quiz
    this.popup = item;
    this.popupAnim = 0;
    this.popupShake = 0;
    this.popupQuiz = this._generateMiniQuiz(item);
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
    if (this.popupShake > 0) this.popupShake = Math.max(0, this.popupShake - dt * 3);

    // Player
    this.player.update(dt, this.mapWidth, this.mapHeight);

    // Lisa follows Ria
    updateBuddy(this.lisa, this.player, dt, this.mapWidth, this.mapHeight);

    // Companions
    this._updateCompanions(dt);

    // Items proximity check
    for (const item of this.items) {
      if (!item.discovered) {
        item.updateProximity(this.player.x, this.player.y);
      }
      item.update(dt);
    }

    // Announce companion quest after 2 seconds
    if (this.questAnnouncedAt < 0 && this.gameTime > 2 &&
        this.currentQuestIndex < this.companionQuests.length &&
        this.state === 'exploring') {
      this._announceQuest();
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

    // Items (all)
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

    // Lisa (behind Ria)
    this.lisa.draw(ctx, this.spriteCache);

    // Player (Ria)
    this.player.draw(ctx, this.spriteCache);

    ctx.restore(); // end camera
    ctx.restore(); // end scale

    // HUD (screen coords)
    this._drawHUD(ctx, w, h);

    // Current quest indicator
    this._drawQuestIndicator(ctx, w, h);

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

    // Popup card (with shake on wrong answer)
    const shakeX = this.popupShake > 0 ? Math.sin(this.gameTime * 40) * 6 * this.popupShake : 0;
    ctx.translate(w / 2 + shakeX, h * 0.4);
    ctx.scale(scale, scale);

    const cardW = Math.min(320, w * 0.85);
    const cardH = 280;

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

    // Buttons (only when animation is done)
    if (anim >= 0.8) {
      if (this.popupQuiz) {
        // Quiz: show question + two choice buttons
        ctx.font = 'Bold 14px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
        ctx.fillStyle = '#FF6F00';
        ctx.fillText(this.popupQuiz.question, 0, cardH / 2 - 68);

        const btnW = 120, btnH = 40, gap = 12;
        const totalW = btnW * 2 + gap;
        for (let i = 0; i < 2; i++) {
          const bx = -totalW / 2 + i * (btnW + gap);
          const by = cardH / 2 - btnH - 14;
          ctx.fillStyle = 'rgba(76,175,80,0.15)';
          ctx.strokeStyle = '#4CAF50';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(bx, by, btnW, btnH, 12);
          ctx.fill();
          ctx.stroke();
          ctx.font = 'Bold 24px sans-serif';
          ctx.fillStyle = '#333';
          ctx.fillText(this.popupQuiz.choices[i], bx + btnW / 2, by + btnH / 2);
        }
      } else {
        // No quiz: confirm button
        const btnW = 140, btnH = 42;
        const btnGrad = ctx.createLinearGradient(0, cardH / 2 - btnH - 12, 0, cardH / 2 - 12);
        btnGrad.addColorStop(0, '#4CAF50');
        btnGrad.addColorStop(1, '#388E3C');
        ctx.fillStyle = btnGrad;
        ctx.beginPath();
        ctx.roundRect(-btnW / 2, cardH / 2 - btnH - 12, btnW, btnH, 14);
        ctx.fill();
        ctx.font = 'Bold 18px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
        ctx.fillStyle = '#FFF';
        ctx.fillText('확인 ✨', 0, cardH / 2 - btnH / 2 - 12);
      }
    }

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
      // Lisa next to Ria
      this.lisa.x = save.playerX + 30;
      this.lisa.y = save.playerY + 20;
      this.lisa.targetX = this.lisa.x;
      this.lisa.targetY = this.lisa.y;
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

  // ── Mini quiz generation for discovery popups ──

  _generateMiniQuiz(item) {
    // Only generate quiz for Korean/English stages with enough items
    const stageId = this.stageConfig.id;
    if (stageId !== 'hangul' && stageId !== 'english' && stageId !== 'numbers') return null;
    // 30% chance to skip quiz (variety)
    if (Math.random() < 0.3) return null;

    const allItems = this.stageConfig.items;
    const others = allItems.filter(i => i.id !== item.id);
    if (others.length === 0) return null;

    const wrong = others[Math.floor(Math.random() * others.length)];
    const correctIndex = Math.random() < 0.5 ? 0 : 1;

    // Question based on stage type
    let question;
    const name = item.name.split(' ')[0]; // e.g., "기역" from "기역 (ㄱ)"
    if (stageId === 'hangul') {
      question = `방금 찾은 글자는?`;
    } else if (stageId === 'english') {
      question = `Which letter did you find?`;
    } else {
      question = `방금 찾은 숫자는?`;
    }

    return {
      question,
      choices: correctIndex === 0
        ? [item.emoji, wrong.emoji]
        : [wrong.emoji, item.emoji],
      correctIndex,
    };
  }

  // ── Companion quest & dialogue system ──

  _companionReact(item) {
    const lead = this.companions[0];
    if (!lead) return;
    const dialogueSet = COMPANION_DIALOGUE[lead.type];
    if (!dialogueSet) return;

    // Pick a random discovery line
    const lines = dialogueSet.onDiscover;
    const line = lines[Math.floor(Math.random() * lines.length)];

    // Add item-specific context: "name + desc snippet"
    const itemName = item.name.split(' ')[0]; // first word (e.g., "기역" from "기역 (ㄱ)")
    const contextLine = `${pp(itemName, '을를')} 찾았어! ${line}`;
    lead.setSpeech(contextLine, 3.5);
  }

  _checkCompanionQuest() {
    if (this.currentQuestIndex >= this.companionQuests.length) return;
    const quest = this.companionQuests[this.currentQuestIndex];
    if (quest.completed) return;

    // Announce quest if not yet announced
    if (this.questAnnouncedAt < 0) {
      this._announceQuest();
      return;
    }

    // Check completion
    let done = false;
    if (quest.target) {
      // Target specific item IDs
      const discoveredIds = new Set(this.items.filter(i => i.discovered).map(i => i.id));
      done = quest.target.every(t => discoveredIds.has(t));
    } else if (quest.targetCount) {
      done = this.discoveredCount >= quest.targetCount;
    }

    if (done) {
      quest.completed = true;
      const lead = this.companions[0];
      const dialogueSet = lead ? COMPANION_DIALOGUE[lead.type] : null;
      const completeLine = dialogueSet ? dialogueSet.onQuestComplete : '해냈다!';

      this.message.show(`⭐ ${quest.reward}`, 3);
      this.particles.createStars(this.screenW / 2, this.screenH * 0.3, 15);
      if (lead) lead.setSpeech(completeLine, 4);

      // Move to next quest
      this.currentQuestIndex++;
      this.questAnnouncedAt = -1;
    }
  }

  _drawQuestIndicator(ctx, w, h) {
    if (this.currentQuestIndex >= this.companionQuests.length) return;
    const quest = this.companionQuests[this.currentQuestIndex];
    if (!quest || this.questAnnouncedAt < 0) return;

    const lead = this.companions[0];
    const emoji = lead ? (COMPANION_DIALOGUE[lead.type]?.personality?.charAt(0) || '⭐') : '⭐';

    ctx.save();
    const panelY = this.safeTop + 42;
    const font = '12px "Apple SD Gothic Neo", "Segoe UI", sans-serif';
    ctx.font = font;
    const text = `⭐ ${quest.desc}`;
    const tw = Math.min(ctx.measureText(text).width + 20, w * 0.7);

    ctx.globalAlpha = 0.7;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.roundRect(w / 2 - tw / 2, panelY, tw, 22, 8);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(text, w / 2, panelY + 11);
    ctx.restore();
  }

  _announceQuest() {
    const quest = this.companionQuests[this.currentQuestIndex];
    if (!quest) return;
    const lead = this.companions[0];
    const dialogueSet = lead ? COMPANION_DIALOGUE[lead.type] : null;
    const startLine = dialogueSet ? dialogueSet.onQuestStart : '찾아보자!';

    if (lead) lead.setSpeech(`${startLine}\n${quest.desc}`, 5);
    this.questAnnouncedAt = this.gameTime;
  }
}
