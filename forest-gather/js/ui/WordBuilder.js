/**
 * WordBuilder - overlay UI for building words from collected letters.
 * Used in hangul/english stages.
 */
import { HANGUL_LETTERS, ENGLISH_LETTERS } from '../config.js';

const BTN_SIZE = 48;
const BTN_GAP = 8;

export class WordBuilder {
  constructor() {
    this.active = false;
    this.mission = null;    // { word, emoji, letters, display, funFact }
    this.slots = [];        // filled letters (null = empty)
    this.pool = [];         // shuffled available letters
    this.poolOriginal = []; // for reset
    this.result = null;     // 'correct' | 'wrong' | null
    this.resultTimer = 0;
    this.shakeTimer = 0;
    this.wrongResetTimer = 0;
    this.anim = 0;
    this.gameTime = 0;
  }

  /** Start a word-building mission */
  start(mission) {
    this.active = true;
    this.mission = mission;
    this.slots = new Array(mission.display.length).fill(null);
    // Pool: mission letters + 2-3 distractors, shuffled
    const extra = this._getDistractors(mission);
    this.poolOriginal = [...mission.display, ...extra];
    this.pool = [...this.poolOriginal].sort(() => Math.random() - 0.5);
    this.result = null;
    this.resultTimer = 0;
    this.shakeTimer = 0;
    this.anim = 0;
  }

  _getDistractors(mission) {
    // Add 2-3 random letters not in the mission
    const extras = [];
    const isHangul = /[ㄱ-ㅣ]/.test(mission.display[0]);
    const allLetters = isHangul ? HANGUL_LETTERS : ENGLISH_LETTERS;
    const used = new Set(mission.display);
    const available = allLetters.filter(l => !used.has(l));
    const count = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < count && available.length > 0; i++) {
      const idx = Math.floor(Math.random() * available.length);
      extras.push(available.splice(idx, 1)[0]);
    }
    return extras;
  }

  close() {
    this.active = false;
    this.mission = null;
    this.result = null;
  }

  handleTap(x, y, w, h) {
    if (!this.active) return null;

    // If showing success result, tap to dismiss
    if (this.result === 'correct') {
      if (this.resultTimer > 1) {
        this.close();
        return 'wordSuccess';
      }
      return 'consumed';
    }

    // Back button (top-left)
    const backBtnX = 40;
    const backBtnY = h * 0.08;
    if (Math.abs(x - backBtnX) < 28 && Math.abs(y - backBtnY) < 28) {
      this.close();
      return 'wordCancel';
    }

    // Reset button
    const resetBtnX = w / 2 + 100;
    const resetBtnY = h * 0.35;
    if (Math.abs(x - resetBtnX) < 24 && Math.abs(y - resetBtnY) < 24) {
      this._reset();
      return 'consumed';
    }

    // Pool letter buttons (bottom area)
    const poolY = h * 0.62;
    const btnSize = BTN_SIZE;
    const gap = BTN_GAP;
    const totalPoolW = this.pool.length * (btnSize + gap) - gap;
    const poolStartX = (w - totalPoolW) / 2;

    for (let i = 0; i < this.pool.length; i++) {
      if (this.pool[i] === null) continue; // already used
      const bx = poolStartX + i * (btnSize + gap);
      const by = poolY;
      if (x >= bx && x <= bx + btnSize && y >= by && y <= by + btnSize) {
        this._placeLetterInSlot(i);
        return 'consumed';
      }
    }

    // Tap on filled slot to remove it
    const slotY = h * 0.42;
    const slotSize = BTN_SIZE;
    const slotGap = BTN_GAP;
    const totalSlotW = this.slots.length * (slotSize + slotGap) - slotGap;
    const slotStartX = (w - totalSlotW) / 2;

    for (let i = 0; i < this.slots.length; i++) {
      if (this.slots[i] === null) continue;
      const sx = slotStartX + i * (slotSize + slotGap);
      if (x >= sx && x <= sx + slotSize && y >= slotY && y <= slotY + slotSize) {
        // Return letter to pool
        const letter = this.slots[i].letter;
        const poolIdx = this.slots[i].poolIdx;
        this.pool[poolIdx] = letter;
        this.slots[i] = null;
        return 'consumed';
      }
    }

    return 'consumed'; // consume all taps when overlay is active
  }

  _placeLetterInSlot(poolIdx) {
    // Find next empty slot
    const emptyIdx = this.slots.indexOf(null);
    if (emptyIdx === -1) return;

    this.slots[emptyIdx] = { letter: this.pool[poolIdx], poolIdx };
    this.pool[poolIdx] = null;

    // Check if all slots filled
    if (!this.slots.includes(null)) {
      this._checkAnswer();
    }
  }

  _checkAnswer() {
    const answer = this.slots.map(s => s.letter);
    const correct = this.mission.display;
    const isCorrect = answer.every((l, i) => l === correct[i]);

    if (isCorrect) {
      this.result = 'correct';
      this.resultTimer = 0;
    } else {
      this.result = 'wrong';
      this.shakeTimer = 0.6;
      this.wrongResetTimer = 0.8; // auto reset after 0.8s, handled in update()
    }
  }

  _reset() {
    this.slots = new Array(this.mission.display.length).fill(null);
    this.pool = [...this.poolOriginal].sort(() => Math.random() - 0.5);
    this.result = null;
  }

  update(dt) {
    if (!this.active) return;
    this.gameTime += dt;
    this.anim = Math.min(1, this.anim + dt * 4);
    if (this.result === 'correct') this.resultTimer += dt;
    if (this.shakeTimer > 0) this.shakeTimer = Math.max(0, this.shakeTimer - dt);
    // Auto reset after wrong answer
    if (this.result === 'wrong' && this.wrongResetTimer > 0) {
      this.wrongResetTimer -= dt;
      if (this.wrongResetTimer <= 0) {
        this._reset();
        this.result = null;
      }
    }
  }

  draw(ctx, w, h) {
    if (!this.active) return;

    const anim = this.anim;

    // Dim background
    ctx.save();
    ctx.fillStyle = `rgba(0,0,0,${anim * 0.65})`;
    ctx.fillRect(0, 0, w, h);

    // Back button (top-left)
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.roundRect(12, h * 0.08 - 22, 56, 44, 12);
    ctx.fill();
    ctx.font = 'Bold 18px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFF';
    ctx.fillText('← 닫기', 40, h * 0.08);

    // Hint emoji + instruction
    ctx.font = '60px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.mission.emoji, w / 2, h * 0.18);

    ctx.font = 'Bold 18px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.fillStyle = '#FFD700';
    ctx.fillText('이 동물의 이름을 만들어보세요!', w / 2, h * 0.28);

    // Reset button
    ctx.font = '28px sans-serif';
    ctx.fillText('↩️', w / 2 + 100, h * 0.35);

    // Slots
    const slotSize = BTN_SIZE;
    const slotGap = BTN_GAP;
    const totalSlotW = this.slots.length * (slotSize + slotGap) - slotGap;
    const slotStartX = (w - totalSlotW) / 2;
    const slotY = h * 0.42;

    // Shake offset for wrong answer
    let shakeX = 0;
    if (this.shakeTimer > 0) {
      shakeX = Math.sin(this.shakeTimer * 30) * 8 * (this.shakeTimer / 0.6);
    }

    for (let i = 0; i < this.slots.length; i++) {
      const sx = slotStartX + i * (slotSize + slotGap) + shakeX;

      // Slot background
      ctx.fillStyle = this.slots[i]
        ? (this.result === 'correct' ? 'rgba(76,175,80,0.6)' : 'rgba(255,255,255,0.2)')
        : 'rgba(255,255,255,0.1)';
      ctx.strokeStyle = this.result === 'wrong' ? '#FF5252' : 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(sx, slotY, slotSize, slotSize, 10);
      ctx.fill();
      ctx.stroke();

      if (this.slots[i]) {
        ctx.font = 'Bold 28px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
        ctx.fillStyle = '#FFF';
        ctx.fillText(this.slots[i].letter, sx + slotSize / 2, slotY + slotSize / 2);
      } else {
        ctx.font = '24px sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillText('_', sx + slotSize / 2, slotY + slotSize / 2);
      }
    }

    // Pool buttons
    const poolY = h * 0.62;
    const btnSize = BTN_SIZE;
    const gap = BTN_GAP;
    const totalPoolW = this.pool.length * (btnSize + gap) - gap;
    const poolStartX = (w - totalPoolW) / 2;

    // Wrap pool if too wide
    const maxRowW = w - 40;
    const perRow = Math.floor((maxRowW + gap) / (btnSize + gap));

    for (let i = 0; i < this.pool.length; i++) {
      if (this.pool[i] === null) continue;

      const row = Math.floor(i / perRow);
      const col = i % perRow;
      const rowItems = Math.min(perRow, this.pool.length - row * perRow);
      const rowW = rowItems * (btnSize + gap) - gap;
      const rowStartX = (w - rowW) / 2;

      const bx = rowStartX + col * (btnSize + gap);
      const by = poolY + row * (btnSize + gap);

      ctx.fillStyle = 'rgba(100,181,246,0.3)';
      ctx.strokeStyle = 'rgba(100,181,246,0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(bx, by, btnSize, btnSize, 10);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'Bold 26px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
      ctx.fillStyle = '#FFF';
      ctx.fillText(this.pool[i], bx + btnSize / 2, by + btnSize / 2);
    }

    // Success overlay
    if (this.result === 'correct' && this.resultTimer > 0.3) {
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(0, 0, w, h);

      const scale = 0.5 + Math.min(1, (this.resultTimer - 0.3) * 3) * 0.5;
      ctx.save();
      ctx.translate(w / 2, h * 0.4);
      ctx.scale(scale, scale);

      ctx.font = '70px sans-serif';
      ctx.fillText(this.mission.emoji, 0, -50);

      ctx.font = 'Bold 32px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
      ctx.fillStyle = '#FFD700';
      ctx.fillText(`🎉 ${this.mission.word}!`, 0, 10);

      ctx.font = '15px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
      ctx.fillStyle = '#FFF';
      ctx.fillText(this.mission.funFact, 0, 50);

      if (this.resultTimer > 1) {
        ctx.globalAlpha = 0.5 + Math.sin(this.gameTime * 3) * 0.3;
        ctx.font = '14px sans-serif';
        ctx.fillStyle = '#CCC';
        ctx.fillText('터치하면 계속!', 0, 90);
      }

      ctx.restore();
    }

    ctx.restore();
  }
}
