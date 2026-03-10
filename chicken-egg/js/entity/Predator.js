/**
 * Predator entity - fox, weasel, raccoon that try to steal eggs
 * Uses SpriteCache sprites with dynamic overlays
 */

export const PREDATOR_TYPES = [
  {
    name: '여우',
    bodyColor: '#FF8C42',
    bellyColor: '#FFFFFF',
    tailColor: '#FF8C42',
    tailTip: '#FFFFFF',
    earInner: '#FFB380',
    emoji: '🦊',
    stealMsg: '여우가 알을 훔쳐갔어!',
    speedMin: 100, speedMax: 130,
    tapsToScare: 1,
    stealMult: 0.5,
    movePattern: 'straight',
  },
  {
    name: '족제비',
    bodyColor: '#8B6914',
    bellyColor: '#F5DEB3',
    tailColor: '#8B6914',
    tailTip: '#5C4A0E',
    earInner: '#C4A44A',
    emoji: '🐾',
    stealMsg: '족제비가 알을 훔쳐갔어!',
    speedMin: 70, speedMax: 95,
    tapsToScare: 1,
    stealMult: 1.0,
    movePattern: 'zigzag',
  },
  {
    name: '너구리',
    bodyColor: '#808080',
    bellyColor: '#C8C8C8',
    tailColor: '#808080',
    tailTip: '#404040',
    earInner: '#A0A0A0',
    emoji: '🦝',
    stealMsg: '너구리가 알을 훔쳐갔어!',
    speedMin: 40, speedMax: 60,
    tapsToScare: 3,
    stealMult: 1.5,
    movePattern: 'straight',
  }
];

export class Predator {
  constructor(type, groundY, canvasWidth, basketX) {
    this.type = type;
    this.info = PREDATOR_TYPES[type];
    this.groundY = groundY;
    this.canvasWidth = canvasWidth;
    this.basketX = basketX;

    this.fromRight = Math.random() < 0.5;
    this.x = this.fromRight ? canvasWidth + 80 : -80;
    this.y = groundY - 25;
    this.baseY = groundY - 25;
    this.targetX = basketX;

    const t = this.info;
    this.speed = t.speedMin + Math.random() * (t.speedMax - t.speedMin);
    this.phase = 0; // 0: approaching, 1: stealing, 2: fleeing
    this.stealAmount = 0;
    this._stealTimer = 0;
    this._warningShown = false;
    this.scared = false;
    this.active = true;
    this.tapsRemaining = t.tapsToScare;
    this.hitFlash = 0;

    this.facing = this.fromRight ? -1 : 1;
    this.bobble = 0;
    this._zigzagPhase = Math.random() * Math.PI * 2;
    this._exclamationBob = 0;
  }

  setStealAmount(basketEggs) {
    const base = Math.min(8, Math.max(1, Math.floor(basketEggs * 0.08)));
    this.stealAmount = Math.max(1, Math.round(base * this.info.stealMult));
  }

  update(dt) {
    this.bobble += dt * 6;
    this._exclamationBob += dt * 4;
    this._zigzagPhase += dt * 5;
    if (this.hitFlash > 0) this.hitFlash = Math.max(0, this.hitFlash - dt * 4);

    if (this.phase === 0) {
      const dir = this.targetX > this.x ? 1 : -1;
      this.facing = dir;
      this.x += dir * this.speed * dt;

      if (this.info.movePattern === 'zigzag') {
        this.y = this.baseY + Math.sin(this._zigzagPhase) * 25;
      }

      const dist = Math.abs(this.x - this.targetX);
      if (dist < 250 && !this._warningShown) {
        this._warningShown = true;
        return 'warning';
      }

      if (dist < 20) {
        this.phase = 1;
        this._stealTimer = 0;
        this.y = this.baseY;
      }
    } else if (this.phase === 1) {
      this._stealTimer += dt;
      const stealDelay = this._stealDelay || 0.8;
      if (this._stealTimer >= stealDelay) {
        this.phase = 2;
        this.facing = this.fromRight ? 1 : -1;
        return 'steal';
      }
    } else if (this.phase === 2) {
      const fleeDir = this.fromRight ? 1 : -1;
      this.x += fleeDir * this.speed * 1.8 * dt;
      this.facing = fleeDir;

      if (this.x < -100 || this.x > this.canvasWidth + 100) {
        this.active = false;
      }
    }

    return null;
  }

  scare() {
    if (this.phase <= 1) {
      this.tapsRemaining--;
      this.hitFlash = 1;
      if (this.tapsRemaining <= 0) {
        this.scared = true;
        this.phase = 2;
        this.facing = this.fromRight ? 1 : -1;
        return 'scared';
      }
      return 'hit';
    }
    return false;
  }

  contains(x, y) {
    const hitW = 120;
    const hitH = 90;
    return (
      x >= this.x - hitW / 2 &&
      x <= this.x + hitW / 2 &&
      y >= this.y - hitH / 2 &&
      y <= this.y + hitH / 2
    );
  }

  draw(ctx) {
    if (!this.active) return;

    const sc = window.__spriteCache;
    if (!sc || !sc.ready) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    const bob = Math.sin(this.bobble) * 3;
    ctx.translate(0, bob);

    // Predator sprite (type + scared state)
    const typeName = ['fox', 'weasel', 'raccoon'][this.type];
    const spriteName = this.scared ? `predator-${typeName}-scared` : `predator-${typeName}`;
    sc.draw(ctx, spriteName, 0, 0, this.facing, 1);

    // Hit flash overlay
    if (this.hitFlash > 0) {
      ctx.globalAlpha = this.hitFlash * 0.5;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(0, 0, 50, 35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Tap indicator for multi-tap predators
    if (this.phase <= 1 && this.info.tapsToScare > 1 && this.tapsRemaining > 0) {
      const totalTaps = this.info.tapsToScare;
      const remaining = this.tapsRemaining;
      for (let i = 0; i < totalTaps; i++) {
        const dotX = -((totalTaps - 1) * 8) / 2 + i * 8;
        ctx.beginPath();
        ctx.arc(dotX, 30, 4, 0, Math.PI * 2);
        ctx.fillStyle = i < (totalTaps - remaining) ? '#FF4444' : 'rgba(255,255,255,0.5)';
        ctx.fill();
      }
    }

    // Exclamation mark when approaching
    if (this.phase === 0) {
      const exBob = Math.sin(this._exclamationBob) * 4;
      ctx.save();
      ctx.translate(this.facing * 30, -50 + exBob);
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#FF4444';
      ctx.fill();
      ctx.strokeStyle = '#CC0000';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'Bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', 0, 1);
      ctx.restore();
    }

    ctx.restore();
  }
}
