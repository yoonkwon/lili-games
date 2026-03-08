/**
 * Chick entity - cute baby chick that wanders around
 * Uses SpriteCache for pre-rendered color/state variants
 */

const CHICK_COLORS = [
  '#FFE44D', '#FFD700', '#FFC125', '#FFAA00', '#FFB347',
  '#FF8C69', '#DDA0DD', '#98FB98', '#87CEEB', '#FFB6C1'
];

export class Chick {
  constructor(x, y, color, canvasWidth = 900) {
    this.x = x;
    this.y = y;
    this.baseY = y;
    this.canvasWidth = canvasWidth;
    this.color = color || CHICK_COLORS[Math.floor(Math.random() * CHICK_COLORS.length)];
    this.colorIndex = CHICK_COLORS.indexOf(this.color);
    if (this.colorIndex < 0) this.colorIndex = 0;

    this.size = 0.1;
    this.maxSize = 0.6 + Math.random() * 0.3;

    this.bobble = Math.random() * Math.PI * 2;
    this.facing = Math.random() < 0.5 ? 1 : -1;

    // Blink
    this.blinkTimer = 2 + Math.random() * 2;
    this.isBlinking = false;
    this._blinkDuration = 0;

    // Peep
    this.peepTimer = 4 + Math.random() * 5;
    this.isPeeping = false;
    this._peepDuration = 0;

    // Movement
    this.moveTimer = 2 + Math.random() * 3;
    this.targetX = x;
    this.moveSpeed = 0;

    // Wing flutter
    this.wingFlutter = 0;

    // Accessory: 0=none, 1=bow, 2=glasses, 3=tiny hat
    this.accessory = 0;

    // Celebration state
    this._celebrateTimer = 0;
    this._jumpVelocity = 0;
    this._jumpOffset = 0;

    // Defense system
    this.defendTarget = null;
    this.defendCooldown = 0;
    this.isDefending = false;
    this._defendSpeed = 120;
    this._savedTargetX = 0;
    this._angryTimer = 0;
  }

  update(dt) {
    let result = null;

    // Grow
    if (this.size < this.maxSize) {
      this.size = Math.min(this.maxSize, this.size + dt * 0.3);
    }

    this.bobble += dt * 4;
    this.wingFlutter += dt * 8;
    this.y = this.baseY + Math.sin(this.bobble) * 2 * this.size;

    // Blink
    if (this.isBlinking) {
      this._blinkDuration -= dt;
      if (this._blinkDuration <= 0) {
        this.isBlinking = false;
        this.blinkTimer = 2 + Math.random() * 2;
      }
    } else {
      this.blinkTimer -= dt;
      if (this.blinkTimer <= 0) {
        this.isBlinking = true;
        this._blinkDuration = 0.12;
      }
    }

    // Peep
    if (this.isPeeping) {
      this._peepDuration -= dt;
      if (this._peepDuration <= 0) {
        this.isPeeping = false;
        this.peepTimer = 4 + Math.random() * 5;
      }
    } else {
      this.peepTimer -= dt;
      if (this.peepTimer <= 0) {
        this.isPeeping = true;
        this._peepDuration = 0.3;
        result = 'peep';
      }
    }

    // Movement
    this.moveTimer -= dt;
    if (this.moveTimer <= 0) {
      this.moveTimer = 2 + Math.random() * 3;
      const offset = (Math.random() - 0.5) * 160;
      this.targetX = this.x + offset;
      this.targetX = Math.max(40, Math.min(this.canvasWidth - 40, this.targetX));
      this.facing = offset > 0 ? 1 : -1;
    }

    // Defense cooldown
    if (this.defendCooldown > 0) {
      this.defendCooldown -= dt;
    }
    if (this._angryTimer > 0) {
      this._angryTimer -= dt;
    }

    // Defense movement - chase predator
    if (this.isDefending && this.defendTarget) {
      const ddx = this.defendTarget.x - this.x;
      this.facing = ddx > 0 ? 1 : -1;
      this.x += Math.sign(ddx) * this._defendSpeed * dt;

      if (Math.abs(ddx) < 30) {
        this.isDefending = false;
        this._angryTimer = 1.0;
        this.defendCooldown = 8;
        this.celebrate();
        this.targetX = this._savedTargetX;
        const target = this.defendTarget;
        this.defendTarget = null;
        return { type: 'defend', predator: target };
      }

      if (!this.defendTarget.active || this.defendTarget.phase === 2) {
        this.isDefending = false;
        this.defendTarget = null;
        this.targetX = this._savedTargetX;
      }

      return result;
    }

    // Normal: Move toward target
    const dx = this.targetX - this.x;
    if (Math.abs(dx) > 1) {
      const speed = 40 * this.size;
      this.x += Math.sign(dx) * Math.min(Math.abs(dx), speed * dt);
    }

    // Celebration jump
    if (this._celebrateTimer > 0) {
      this._celebrateTimer -= dt;
      this._jumpOffset += this._jumpVelocity * dt;
      this._jumpVelocity += 400 * dt;
      if (this._jumpOffset > 0) {
        this._jumpOffset = 0;
        this._jumpVelocity = 0;
      }
    }

    return result;
  }

  startDefend(predator) {
    if (this.isDefending || this.defendCooldown > 0 || this.size < 0.5) return false;
    this.defendTarget = predator;
    this.isDefending = true;
    this._savedTargetX = this.targetX;
    return true;
  }

  canDefend() {
    return !this.isDefending && this.defendCooldown <= 0 && this.size >= 0.5;
  }

  celebrate() {
    this._celebrateTimer = 0.5;
    this._jumpVelocity = -150 - Math.random() * 80;
    this._jumpOffset = 0;
  }

  draw(ctx) {
    const sc = window.__spriteCache;
    if (!sc || !sc.ready) return;

    ctx.save();
    ctx.translate(this.x, this.y + this._jumpOffset);
    ctx.scale(this.size * this.facing, this.size);

    // Select sprite variant based on state
    const isAngry = this._angryTimer > 0 || this.isDefending;
    let spriteName;
    if (isAngry) spriteName = `chick-angry-${this.colorIndex}`;
    else if (this.isBlinking) spriteName = `chick-blink-${this.colorIndex}`;
    else spriteName = `chick-${this.colorIndex}`;

    sc.draw(ctx, spriteName, 0, 0);

    // Shield icon when defending
    if (this.isDefending) {
      sc.draw(ctx, 'ui-shield', 0, -35);
    }

    // Accessory overlay
    if (this.accessory > 0) {
      const accNames = [null, 'chick-acc-bow', 'chick-acc-glasses', 'chick-acc-hat'];
      const accPos = [null, {x: 0, y: -24}, {x: 0, y: -12}, {x: 0, y: -31}];
      const pos = accPos[this.accessory];
      if (pos) sc.draw(ctx, accNames[this.accessory], pos.x, pos.y);
    }

    ctx.restore();
  }

  updateBounds(canvasWidth) {
    this.canvasWidth = canvasWidth;
  }
}
