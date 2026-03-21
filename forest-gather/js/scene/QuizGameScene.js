/**
 * Quiz exploration scene - 3-stage gameplay:
 *   1. Collection: gather items scattered on the map (20-25 items)
 *   2. Clue unlock: every ITEMS_PER_CLUE items unlocks a clue
 *   3. Quiz: with enough clues, guess the answer!
 */
import { QUIZ_STAGES, PLAYER, MAP_WIDTH, MAP_HEIGHT, DISCOVER_RADIUS, QUIZ_MIN_CLUES, COMPANION_HINT_INTERVAL, HIDE_STYLES, ITEMS_PER_CLUE, TERRAIN_PRESETS, COLLECT_ITEMS_POOL } from '../config.js';
import { Character } from '../entity/Character.js';
import { Item } from '../entity/Item.js';
import { Companion } from '../entity/Companion.js';
import { CompanionNPC } from '../entity/CompanionNPC.js';
import { ParticleSystem } from '../../../shared/ParticleSystem.js';
import { Message } from '../../../shared/ui/Message.js';
import { CollectionTray } from '../ui/CollectionTray.js';
import { drawWrappedText, generateTerrain, drawTerrain, findNearestUndiscovered, getDirectionHint, updateCompanions, drawMiniMap, updateCamera, updateBuddy } from './sceneUtils.js';

export class QuizGameScene {
  constructor(w, h, safeTop, quizIndex, spriteCache) {
    this.spriteCache = spriteCache;
    this.quizIndex = quizIndex;
    this.stageConfig = QUIZ_STAGES[quizIndex];

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

    // Companions - start with default (익돌이)
    this.companions = [new Companion('ikdol', this.player, 0, 1)];

    // Companion NPCs discoverable on the map
    this.companionNPCs = [];

    // Hint companion (simple follower for speech bubbles)
    this.hintTimer = COMPANION_HINT_INTERVAL * 0.4;

    // Quiz state — shuffle rounds each session
    this.shuffledRounds = [...this.stageConfig.rounds];
    for (let i = this.shuffledRounds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.shuffledRounds[i], this.shuffledRounds[j]] = [this.shuffledRounds[j], this.shuffledRounds[i]];
    }
    this.currentRound = 0;
    this.totalRounds = this.shuffledRounds.length;
    this.solvedRounds = 0;
    this.roundData = this.shuffledRounds[0];

    // 3-stage state
    // Stage 1: Collection items
    this.collectItems = [];
    this.collectedCount = 0;
    this.totalCollectItems = this.totalClues * ITEMS_PER_CLUE; // items to place on map

    // Stage 2: Clue unlock tracking
    this.cluesUnlocked = 0;
    this.totalClues = this.roundData.clues.length;
    this.unlockedClueTexts = [];

    // Stage 3: Quiz
    this.selectedChoice = -1;

    // Collection tray
    this.collectionTray = new CollectionTray(spriteCache);

    // Place items on map
    this._placeCollectItems();

    // UI state
    // exploring, clueUnlock, cluePopup, guessing, correct, wrong, roundComplete, allComplete
    this.state = 'exploring';
    this.popup = null;
    this.popupAnim = 0;
    this.guessAnim = 0;
    this.resultTimer = 0;
    this.clueUnlockAnim = 0;
    this.pendingClue = null; // clue waiting to show after unlock animation

    // Effects
    this.particles = new ParticleSystem();
    this.message = new Message();
    this.gameTime = 0;

    // Rich terrain
    const terrainPreset = TERRAIN_PRESETS[this.stageConfig.terrain] || TERRAIN_PRESETS.forest;
    this.terrain = generateTerrain(terrainPreset, this.mapWidth, this.mapHeight);

    // Show intro
    this.message.show(`${this.stageConfig.emoji} ${this.stageConfig.name}\n아이템을 모아 단서를 풀어보세요!`, 4);
  }

  _placeCollectItems() {
    this.collectItems = [];
    this.collectedCount = 0;
    this.cluesUnlocked = 0;
    this.unlockedClueTexts = [];

    const poolKey = this.stageConfig.collectPool || 'forest';
    const pool = COLLECT_ITEMS_POOL[poolKey] || COLLECT_ITEMS_POOL.forest;
    const margin = 120;
    const usableW = this.mapWidth - margin * 2;
    const usableH = this.mapHeight - margin * 2;
    const positions = [];

    // Determine how many collect items we need: enough to unlock all clues
    this.totalCollectItems = this.totalClues * ITEMS_PER_CLUE;

    // Shuffle pool and repeat if needed
    const shuffled = [...pool].sort(() => Math.random() - 0.5);

    for (let i = 0; i < this.totalCollectItems; i++) {
      let x, y, attempts = 0;
      do {
        x = margin + Math.random() * usableW;
        y = margin + Math.random() * usableH;
        attempts++;
      } while (attempts < 50 && positions.some(p => {
        const dx = p.x - x;
        const dy = p.y - y;
        return dx * dx + dy * dy < 120 * 120;
      }));
      positions.push({ x, y });

      const itemData = shuffled[i % shuffled.length];
      const hideStyle = HIDE_STYLES[Math.floor(Math.random() * HIDE_STYLES.length)];
      const itemDef = {
        id: `collect_${i}`,
        emoji: itemData.emoji,
        name: itemData.name,
        desc: `${itemData.name}을(를) 찾았어요!`,
        size: 28,
      };
      this.collectItems.push(new Item(x, y, itemDef, hideStyle));
    }

    // Place 1-2 CompanionNPCs on the map
    this.companionNPCs = [];
    const npcTypes = ['bori', 'jopssal', 'gosun'];
    const npcCount = 1 + Math.floor(Math.random() * 2); // 1-2
    for (let i = 0; i < npcCount && i < npcTypes.length; i++) {
      const nx = margin + Math.random() * usableW;
      const ny = margin + Math.random() * usableH;
      this.companionNPCs.push(new CompanionNPC(npcTypes[i], nx, ny));
    }
  }

  handleTap(x, y) {
    // Clue unlock animation - tap to show the clue
    if (this.state === 'clueUnlock') {
      if (this.clueUnlockAnim > 0.8 && this.pendingClue) {
        this.popup = this.pendingClue;
        this.popupAnim = 0;
        this.state = 'cluePopup';
        this.pendingClue = null;
      }
      return null;
    }

    // Clue popup - only dismiss via confirm button
    if (this.state === 'cluePopup') {
      if (this.popupAnim < 0.8) return null;
      const btnW = 140, btnH = 42;
      const btnX = this.screenW / 2 - btnW / 2;
      const cardH = 220;
      const btnY = this.screenH * 0.4 + cardH / 2 - btnH - 12;
      if (x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH) {
        this.popup = null;
        this.state = 'exploring';
      }
      return null;
    }

    // Correct answer celebration
    if (this.state === 'correct') {
      if (this.resultTimer > 1.5) {
        this._nextRound();
      }
      return null;
    }

    // Wrong answer
    if (this.state === 'wrong') {
      if (this.resultTimer > 1) {
        this.state = 'exploring';
      }
      return null;
    }

    // All complete
    if (this.state === 'allComplete') {
      return 'quizComplete';
    }

    // Guessing mode
    if (this.state === 'guessing') {
      return this._handleGuessInput(x, y);
    }

    if (this.state !== 'exploring') return null;

    // Check "맞춰보기" button
    if (this.cluesUnlocked >= QUIZ_MIN_CLUES) {
      const btnW = 160;
      const btnH = 50;
      const btnX = this.screenW / 2 - btnW / 2;
      const btnY = this.screenH - 80;
      if (x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH) {
        this.state = 'guessing';
        this.guessAnim = 0;
        this.selectedChoice = -1;
        return null;
      }
    }

    // Convert screen coords to world coords
    const wx = x / this.gameScale + this.camX;
    const wy = y / this.gameScale + this.camY;

    // Check collection items
    for (const item of this.collectItems) {
      if (item.hitTest(wx, wy)) {
        this._collectItem(item);
        return null;
      }
    }

    // Move player
    this.player.moveTo(wx, wy);
    return null;
  }

  _collectItem(item) {
    item.discovered = true;
    this.collectedCount++;

    // Add to collection tray
    this.collectionTray.addItem(item.emoji, item.sprite);

    const sx = this._toScreenX(item.x);
    const sy = this._toScreenY(item.y);
    this.particles.createStars(sx, sy, 8);
    this.particles.addFloatingText(sx, sy - 25, `${item.name}! (${this.collectedCount}/${this.totalCollectItems})`, '#4CAF50');

    // Check if we unlock a new clue
    if (this.collectedCount % ITEMS_PER_CLUE === 0) {
      const clueIdx = this.cluesUnlocked;
      if (clueIdx < this.totalClues) {
        this.cluesUnlocked++;
        const clue = this.roundData.clues[clueIdx];
        this.unlockedClueTexts.push({ emoji: clue.emoji, text: clue.text });

        // Show clue unlock animation
        this.pendingClue = {
          emoji: clue.emoji,
          desc: clue.text,
          clueNumber: this.cluesUnlocked,
        };
        this.clueUnlockAnim = 0;
        this.state = 'clueUnlock';
        this.particles.createStars(this.screenW / 2, this.screenH / 2, 15);
      }
    }
  }

  _handleGuessInput(x, y) {
    const choices = this.roundData.choices;
    const cardW = Math.min(340, this.screenW * 0.9);
    const choiceBtnW = cardW - 40;
    const choiceBtnH = 48;
    const startY = this.screenH * 0.4 + 50;
    const gap = 8;
    const choiceBtnX = this.screenW / 2 - choiceBtnW / 2;

    for (let i = 0; i < choices.length; i++) {
      const by = startY + i * (choiceBtnH + gap);
      if (x >= choiceBtnX && x <= choiceBtnX + choiceBtnW && y >= by && y <= by + choiceBtnH) {
        this.selectedChoice = i;
        if (choices[i] === this.roundData.answer) {
          this.state = 'correct';
          this.resultTimer = 0;
          this.solvedRounds++;
          this.particles.createStars(this.screenW / 2, this.screenH / 2, 20);
          this.message.show(`🎉 정답! ${this.roundData.emoji} ${this.roundData.answer}!`, 3);
        } else {
          this.state = 'wrong';
          this.resultTimer = 0;
          this.message.show('🤔 아쉬워요! 아이템을 더 모아 단서를 찾아보세요!', 3);
        }
        return null;
      }
    }

    // Back button
    const backY = startY + choices.length * (choiceBtnH + gap) + 10;
    if (y >= backY && y <= backY + 40) {
      this.state = 'exploring';
    }
    return null;
  }

  _nextRound() {
    this.currentRound++;
    if (this.currentRound >= this.totalRounds) {
      this.state = 'allComplete';
      return;
    }
    this.roundData = this.shuffledRounds[this.currentRound];
    this.totalClues = this.roundData.clues.length;
    // Reset players
    this.player.x = this.mapWidth / 2;
    this.player.y = this.mapHeight / 2;
    this.player.targetX = this.player.x;
    this.player.targetY = this.player.y;
    this.lisa.x = this.player.x + 30;
    this.lisa.y = this.player.y + 20;
    this.lisa.targetX = this.lisa.x;
    this.lisa.targetY = this.lisa.y;
    this._placeCollectItems();
    // Reset companions to default (prevent duplication across rounds)
    this.companions = [new Companion('ikdol', this.player, 0, 1)];
    // Reset collection tray for new round
    this.collectionTray = new CollectionTray(this.spriteCache);
    // Regenerate terrain for variety
    const terrainPreset = TERRAIN_PRESETS[this.stageConfig.terrain] || TERRAIN_PRESETS.forest;
    this.terrain = generateTerrain(terrainPreset, this.mapWidth, this.mapHeight);
    this.state = 'exploring';
    this.message.show(`문제 ${this.currentRound + 1}/${this.totalRounds} - 새로운 수수께끼!\n아이템을 모아 단서를 풀어보세요!`, 3);
  }

  _updateCompanions(dt) {
    updateCompanions(this, dt, this.collectItems);

    // Direction hints from lead companion
    this.hintTimer -= dt;
    if (this.hintTimer <= 0 && this.state === 'exploring') {
      this.hintTimer = COMPANION_HINT_INTERVAL;
      const lead = this.companions[0];
      if (!lead) return;

      const nearest = findNearestUndiscovered(this.collectItems, this.player.x, this.player.y);
      if (nearest) {
        const dx = nearest.x - this.player.x;
        const dy = nearest.y - this.player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const nextClueIn = ITEMS_PER_CLUE - (this.collectedCount % ITEMS_PER_CLUE);

        if (dist > DISCOVER_RADIUS * 2) {
          const dir = getDirectionHint(this.player.x, this.player.y, nearest.x, nearest.y);
          if (nextClueIn <= 2) {
            lead.setSpeech(`${dir}에 아이템이! 단서까지 ${nextClueIn}개!`, 4);
          } else {
            lead.setSpeech(`${dir}에 아이템이 있는 것 같아!`, 4);
          }
        } else {
          lead.setSpeech('가까이에 아이템이!', 3);
        }
      } else if (this.cluesUnlocked >= QUIZ_MIN_CLUES) {
        lead.setSpeech('단서가 충분해! 맞춰보기!', 4);
      }
    }
  }

  update(dt, w, h) {
    if (this.state === 'allComplete') return 'quizComplete';

    this.screenW = w;
    this.screenH = h;
    this.gameScale = Math.max(w / this.mapWidth, h / this.mapHeight);
    this.viewW = w / this.gameScale;
    this.viewH = h / this.gameScale;
    this.gameTime += dt;

    if (this.state === 'correct' || this.state === 'wrong') {
      this.resultTimer += dt;
    }
    if (this.state === 'clueUnlock') {
      this.clueUnlockAnim = Math.min(1, this.clueUnlockAnim + dt * 2.5);
    }

    this.player.update(dt, this.mapWidth, this.mapHeight);

    // Lisa follows Ria
    updateBuddy(this.lisa, this.player, dt, this.mapWidth, this.mapHeight);

    this._updateCompanions(dt);

    for (const item of this.collectItems) {
      if (!item.discovered) item.updateProximity(this.player.x, this.player.y);
      item.update(dt);
    }

    // Camera
    updateCamera(this, dt);

    if (this.popup) this.popupAnim = Math.min(1, this.popupAnim + dt * 4);
    if (this.state === 'guessing') this.guessAnim = Math.min(1, this.guessAnim + dt * 4);

    this.collectionTray.update(dt);
    this.particles.update(dt);
    this.message.update(dt);

    return null;
  }

  draw(ctx, w, h) {
    // Background
    ctx.fillStyle = this.stageConfig.bgColor;
    ctx.fillRect(0, 0, w, h);

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

    // Collection items
    for (const item of this.collectItems) {
      item.draw(ctx, this.spriteCache);
    }

    // CompanionNPCs (discoverable on map)
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

    ctx.restore();
    ctx.restore();

    // HUD
    this._drawHUD(ctx, w, h);

    // Unlocked clues panel
    this._drawCluesPanel(ctx, w, h);

    // Collection progress bar (below HUD)
    this._drawCollectProgress(ctx, w, h);

    // "맞춰보기" button
    if (this.state === 'exploring' && this.cluesUnlocked >= QUIZ_MIN_CLUES) {
      this._drawGuessButton(ctx, w, h);
    }

    // Collection tray
    this.collectionTray.draw(ctx, w, h);

    // Particles & messages
    this.particles.draw(ctx);
    this.message.draw(ctx, w, h);

    // Mini-map
    if (this.state === 'exploring') {
      this._drawMiniMap(ctx, w, h);
    }

    // Overlays
    if (this.state === 'clueUnlock') {
      this._drawClueUnlockOverlay(ctx, w, h);
    }
    if (this.state === 'cluePopup' && this.popup) {
      this._drawCluePopup(ctx, w, h);
    }
    if (this.state === 'guessing') {
      this._drawGuessOverlay(ctx, w, h);
    }
    if (this.state === 'correct') {
      this._drawCorrectOverlay(ctx, w, h);
    }
    if (this.state === 'wrong') {
      this._drawWrongOverlay(ctx, w, h);
    }
  }

  _drawHUD(ctx, w, h) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(0, 0, w, this.safeTop + 55);

    const centerY = this.safeTop + 20;

    ctx.font = 'Bold 18px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFF';
    ctx.fillText(`${this.stageConfig.emoji} 문제 ${this.currentRound + 1}/${this.totalRounds}`, 16, centerY);

    // Clue count on right
    ctx.textAlign = 'right';
    ctx.font = 'Bold 14px sans-serif';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`🔑 단서 ${this.cluesUnlocked}/${this.totalClues}`, w - 16, centerY);

    // Collection count below
    ctx.font = '13px sans-serif';
    ctx.fillStyle = '#CCC';
    ctx.fillText(`📦 ${this.collectedCount}/${this.totalCollectItems}`, w - 16, centerY + 18);
  }

  _drawCollectProgress(ctx, w, h) {
    const barX = 16;
    const barY = this.safeTop + 45;
    const barW = w - 32;
    const barH = 6;

    // Background bar
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 3);
    ctx.fill();

    // Overall collection progress
    const progress = this.totalCollectItems > 0 ? this.collectedCount / this.totalCollectItems : 0;
    if (progress > 0) {
      const grad = ctx.createLinearGradient(barX, 0, barX + barW * progress, 0);
      grad.addColorStop(0, '#4CAF50');
      grad.addColorStop(1, '#8BC34A');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW * progress, barH, 3);
      ctx.fill();
    }

    // Clue unlock markers on the bar
    for (let i = 1; i <= this.totalClues; i++) {
      const markerX = barX + (i * ITEMS_PER_CLUE / this.totalCollectItems) * barW;
      ctx.fillStyle = i <= this.cluesUnlocked ? '#FFD700' : 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.arc(markerX, barY + barH / 2, 4, 0, Math.PI * 2);
      ctx.fill();
      if (i <= this.cluesUnlocked) {
        ctx.font = '6px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#000';
        ctx.fillText('🔑', markerX, barY + barH / 2);
      }
    }
  }

  _drawCluesPanel(ctx, w, h) {
    if (this.unlockedClueTexts.length === 0) return;

    const panelX = 10;
    const panelY = this.safeTop + 62;
    const panelW = Math.min(220, w * 0.4);
    const lineH = 22;
    const panelH = 10 + this.unlockedClueTexts.length * lineH + 10;

    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, panelH, 10);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.font = '13px "Apple SD Gothic Neo", "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < this.unlockedClueTexts.length; i++) {
      const clue = this.unlockedClueTexts[i];
      ctx.fillStyle = '#FFD700';
      ctx.fillText(`${clue.emoji} ${clue.text}`, panelX + 10, panelY + 15 + i * lineH);
    }
    ctx.restore();
  }

  _drawGuessButton(ctx, w, h) {
    const btnW = 160;
    const btnH = 50;
    const btnX = w / 2 - btnW / 2;
    const btnY = h - 80;
    const pulse = 1 + Math.sin(this.gameTime * 5) * 0.04;

    ctx.save();
    ctx.translate(w / 2, btnY + btnH / 2);
    ctx.scale(pulse, pulse);
    ctx.translate(-w / 2, -(btnY + btnH / 2));

    const grad = ctx.createLinearGradient(btnX, btnY, btnX, btnY + btnH);
    grad.addColorStop(0, '#FF6F00');
    grad.addColorStop(1, '#E65100');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(btnX, btnY, btnW, btnH, 16);
    ctx.fill();

    ctx.shadowColor = '#FF6F00';
    ctx.shadowBlur = 12;
    ctx.font = 'Bold 20px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFF';
    ctx.fillText('🤔 맞춰보기!', w / 2, btnY + btnH / 2);
    ctx.restore();
  }

  _drawClueUnlockOverlay(ctx, w, h) {
    const anim = this.clueUnlockAnim;
    const scale = 0.3 + anim * 0.7;

    ctx.save();
    ctx.fillStyle = `rgba(0,0,0,${anim * 0.5})`;
    ctx.fillRect(0, 0, w, h);

    ctx.translate(w / 2, h * 0.4);
    ctx.scale(scale, scale);

    // Glowing key icon
    ctx.font = '80px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🔑', 0, -30);

    // Text
    ctx.font = 'Bold 28px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`단서 ${this.cluesUnlocked}/${this.totalClues} 해제!`, 0, 40);

    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#FFF';
    ctx.fillText(`아이템 ${ITEMS_PER_CLUE}개를 모아 단서가 열렸어요!`, 0, 75);

    if (anim > 0.8) {
      ctx.globalAlpha = 0.5 + Math.sin(this.gameTime * 3) * 0.3;
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#CCC';
      ctx.fillText('터치해서 단서를 확인!', 0, 110);
    }

    ctx.restore();
  }

  _drawCluePopup(ctx, w, h) {
    const anim = this.popupAnim;
    const scale = 0.5 + anim * 0.5 + Math.sin(anim * Math.PI) * 0.1;

    ctx.save();
    ctx.fillStyle = `rgba(0,0,0,${anim * 0.5})`;
    ctx.fillRect(0, 0, w, h);

    ctx.translate(w / 2, h * 0.4);
    ctx.scale(scale, scale);

    const cardW = Math.min(300, w * 0.8);
    const cardH = 220;

    ctx.fillStyle = '#FFF';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, 20);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Header
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.roundRect(-cardW / 2, -cardH / 2, cardW, 44, [20, 20, 0, 0]);
    ctx.fill();

    ctx.font = 'Bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFF';
    ctx.fillText(`🔑 단서 ${this.popup.clueNumber}/${this.totalClues}`, 0, -cardH / 2 + 22);

    // Clue emoji
    ctx.font = '50px sans-serif';
    ctx.fillText(this.popup.emoji, 0, -cardH / 2 + 90);

    // Clue text
    ctx.font = 'Bold 18px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.fillStyle = '#333';
    drawWrappedText(ctx, `"${this.popup.desc}"`, 0, -cardH / 2 + 140, cardW - 40, 22);

    // Confirm button (only when animation is done)
    if (anim >= 0.8) {
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

    ctx.restore();
  }

  _drawGuessOverlay(ctx, w, h) {
    const anim = this.guessAnim;

    ctx.save();
    ctx.fillStyle = `rgba(0,0,0,${anim * 0.6})`;
    ctx.fillRect(0, 0, w, h);

    const cardW = Math.min(340, w * 0.9);

    // Title
    ctx.font = 'Bold 28px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFD700';
    ctx.fillText('🤔 이것은 무엇일까요?', w / 2, h * 0.2);

    // Show found clues
    ctx.font = '14px "Apple SD Gothic Neo", "Segoe UI", sans-serif';
    ctx.fillStyle = '#CCC';
    const clueY = h * 0.28;
    for (let i = 0; i < this.unlockedClueTexts.length; i++) {
      const c = this.unlockedClueTexts[i];
      ctx.fillText(`${c.emoji} ${c.text}`, w / 2, clueY + i * 20);
    }

    // Choice buttons
    const choices = this.roundData.choices;
    const choiceBtnW = cardW - 40;
    const choiceBtnH = 48;
    const startY = h * 0.4 + 50;
    const gap = 8;
    const choiceBtnX = w / 2 - choiceBtnW / 2;

    for (let i = 0; i < choices.length; i++) {
      const by = startY + i * (choiceBtnH + gap);
      const isSelected = i === this.selectedChoice;

      ctx.fillStyle = isSelected
        ? (choices[i] === this.roundData.answer ? 'rgba(76,175,80,0.8)' : 'rgba(244,67,54,0.8)')
        : 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.roundRect(choiceBtnX, by, choiceBtnW, choiceBtnH, 14);
      ctx.fill();

      if (!isSelected) {
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.font = 'Bold 22px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFF';
      ctx.fillText(choices[i], w / 2, by + choiceBtnH / 2);
    }

    // Back button
    const backY = startY + choices.length * (choiceBtnH + gap) + 10;
    ctx.font = '15px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('← 아이템 더 모으러 가기', w / 2, backY + 20);

    ctx.restore();
  }

  _drawCorrectOverlay(ctx, w, h) {
    const t = Math.min(1, this.resultTimer * 2);
    ctx.save();
    ctx.fillStyle = `rgba(0,0,0,${t * 0.6})`;
    ctx.fillRect(0, 0, w, h);

    const scale = 0.5 + t * 0.5;
    ctx.translate(w / 2, h * 0.35);
    ctx.scale(scale, scale);

    ctx.font = '80px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.roundData.emoji, 0, -40);

    ctx.font = 'Bold 32px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`🎉 정답! ${this.roundData.answer}!`, 0, 30);

    if (this.resultTimer > 0.8) {
      ctx.font = '16px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
      ctx.fillStyle = '#FFF';
      drawWrappedText(ctx, this.roundData.funFact, 0, 70, 280, 22);
    }

    if (this.resultTimer > 1.5) {
      ctx.globalAlpha = 0.5 + Math.sin(this.gameTime * 3) * 0.3;
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#CCC';
      ctx.fillText('터치하면 다음 문제!', 0, 130);
    }

    ctx.restore();
  }

  _drawWrongOverlay(ctx, w, h) {
    const t = Math.min(1, this.resultTimer * 3);
    ctx.save();
    ctx.fillStyle = `rgba(0,0,0,${t * 0.5})`;
    ctx.fillRect(0, 0, w, h);

    ctx.font = 'Bold 28px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FF8A80';
    ctx.fillText('🤔 아쉬워요!', w / 2, h * 0.38);

    ctx.font = '18px sans-serif';
    ctx.fillStyle = '#FFF';
    ctx.fillText('아이템을 더 모아 단서를 찾아보세요!', w / 2, h * 0.45);

    if (this.resultTimer > 1) {
      ctx.globalAlpha = 0.5 + Math.sin(this.gameTime * 3) * 0.3;
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#CCC';
      ctx.fillText('터치하면 계속 탐험!', w / 2, h * 0.52);
    }

    ctx.restore();
  }

  _drawMiniMap(ctx, w, h) {
    const gt = this.gameTime;
    drawMiniMap(ctx, this, this.collectItems, (ctx, item, ix, iy) => {
      if (item.discovered) {
        ctx.fillStyle = '#4CAF50';
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(ix, iy, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.6;
      } else {
        ctx.globalAlpha = 0.3 + Math.sin(gt * 2 + item.phase) * 0.2;
        ctx.fillStyle = '#8BC34A';
        ctx.beginPath();
        ctx.arc(ix, iy, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.6;
      }
    });
  }

  _toScreenX(worldX) { return (worldX - this.camX) * this.gameScale; }
  _toScreenY(worldY) { return (worldY - this.camY) * this.gameScale; }

  getSaveData() {
    return {
      quizIndex: this.quizIndex,
      currentRound: this.currentRound,
      solvedRounds: this.solvedRounds,
      collectedCount: this.collectedCount,
      cluesUnlocked: this.cluesUnlocked,
      savedAt: Date.now(),
    };
  }

  loadSaveData(save) {
    if (!save) return;
    const savedRound = Math.min(save.currentRound || 0, this.totalRounds - 1);
    if (savedRound > 0) {
      this.currentRound = savedRound;
    }
    if (this.currentRound < this.totalRounds) {
      this.roundData = this.shuffledRounds[this.currentRound];
      this.totalClues = this.roundData.clues.length;
      this._placeCollectItems();
    }
    this.solvedRounds = Math.min(save.solvedRounds || 0, this.totalRounds);
  }

  getStats() {
    return {
      quizIndex: this.quizIndex,
      stageName: this.stageConfig.name,
      stageEmoji: this.stageConfig.emoji,
      solvedRounds: this.solvedRounds,
      totalRounds: this.totalRounds,
    };
  }
}
