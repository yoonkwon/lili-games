/**
 * Chicken entity - the mother hen character
 * Uses SpriteCache for pre-rendered sprites with dynamic overlays
 */
export class Chicken {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.baseY = y;
    this.phase = 0;       // 0: idle, 2: laying
    this.timer = 0;
    this.bobble = 0;
    this.squish = 0;
    this.blinkTimer = this._randomBlinkInterval();
    this.isBlinking = false;
    this.happiness = 0;
    this.wingFlap = 0;
    this.tailWag = 0;
    this.currentHat = 0;  // 0:none, 1:crown, 2:ribbon, 3:flower
    this._blinkDuration = 0;
    this._layTimer = 0;
  }

  _randomBlinkInterval() {
    return 3 + Math.random() * 2;
  }

  update(dt) {
    this.bobble += dt * 3;
    this.tailWag += dt * 4;

    if (this.isBlinking) {
      this._blinkDuration -= dt;
      if (this._blinkDuration <= 0) {
        this.isBlinking = false;
        this.blinkTimer = this._randomBlinkInterval();
      }
    } else {
      this.blinkTimer -= dt;
      if (this.blinkTimer <= 0) {
        this.isBlinking = true;
        this._blinkDuration = 0.15;
      }
    }

    this.happiness = Math.max(0, this.happiness - dt * 0.5);
    this.wingFlap *= Math.pow(0.9, dt * 60);
    if (this.wingFlap < 0.01) this.wingFlap = 0;

    if (this.phase === 0) {
      this.y = this.baseY + Math.sin(this.bobble) * 3;
    } else if (this.phase === 2) {
      this._layTimer += dt;
      const progress = Math.min(1, this._layTimer / 0.35);
      this.squish = 0.35 * (1 - progress);
      this.y = this.baseY + Math.sin(this.bobble) * 3;
      if (progress >= 1) {
        this.phase = 0;
        this.squish = 0;
        this._layTimer = 0;
      }
    }
  }

  pump() {
    this.squish = 0.15;
    this.wingFlap = 0.5;
    this.happiness = 0.7;
  }

  layEgg() {
    this.phase = 2;
    this.squish = 0.35;
    this.wingFlap = 1;
    this.happiness = 1;
    this._layTimer = 0;
  }

  draw(ctx) {
    const sc = window.__spriteCache;
    if (!sc || !sc.ready) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    const sq = this.squish;
    const scaleX = 1 + sq * 0.3;
    const scaleY = 1 - sq;

    // Happy glow (behind sprite)
    if (this.happiness > 0.5) {
      ctx.beginPath();
      ctx.ellipse(0, -5, 70, 65, 0, 0, Math.PI * 2);
      const g = ctx.createRadialGradient(0, -5, 20, 0, -5, 70);
      g.addColorStop(0, `rgba(255,255,200,${0.3 * this.happiness})`);
      g.addColorStop(1, 'rgba(255,255,200,0)');
      ctx.fillStyle = g;
      ctx.fill();
    }

    // Draw chicken sprite (idle frame with squish applied via scale)
    const frame = this.isBlinking ? 'chicken-idle-blink' : 'chicken-idle';
    sc.draw(ctx, frame, 0, 0, scaleX, scaleY);

    // Hat overlay
    if (this.currentHat > 0) {
      const hatNames = [null, 'chicken-hat-crown', 'chicken-hat-ribbon', 'chicken-hat-flower'];
      const headBob = Math.sin(this.bobble * 1.3) * 2;
      const hx = this.currentHat === 2 ? 13 : 5;
      const hy = this.currentHat === 2 ? -58 + headBob : -66 + headBob;
      sc.draw(ctx, hatNames[this.currentHat], hx * scaleX, hy * scaleY);
    }

    ctx.restore();
  }
}
