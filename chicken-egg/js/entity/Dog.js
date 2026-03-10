/**
 * Dog entity - 보리 (black chow chow) and 좁쌀이 (fox-like white/yellow spotted)
 * Time-limited defense helpers that patrol and auto-scare predators
 */
export const DOG_TYPES = [
  {
    id: 'bori',
    name: '보리',
    desc: '검은 차우차우',
    emoji: '🐕',
    speed: 80,
    patrolRange: 120,
    scarePower: 3, // can scare any predator instantly
  },
  {
    id: 'jopssal',
    name: '좁쌀이',
    emoji: '🐕‍🦺',
    desc: '날렵한 점박이',
    speed: 180,
    patrolRange: 250,
    scarePower: 1, // needs multiple passes for tough predators
  },
];

export class Dog {
  constructor(type, x, groundY, canvasWidth, duration) {
    this.type = type;
    this.info = DOG_TYPES[type];
    this.x = x;
    this.y = groundY;
    this.canvasWidth = canvasWidth;

    this.duration = duration;
    this.timer = 0;
    this.active = true;

    // Patrol state
    this.patrolCenter = x;
    this.patrolDir = type === 0 ? 1 : -1;
    this.facing = this.patrolDir;
    this.bobble = Math.random() * Math.PI * 2;

    // Attack state
    this.targetPredator = null;
    this.attacking = false;

    // Entrance animation
    this.enterProgress = 0;

    // Bark cooldown
    this.barkTimer = 0;
  }

  update(dt) {
    this.timer += dt;
    this.bobble += dt * 5;
    this.barkTimer = Math.max(0, this.barkTimer - dt);

    // Entrance slide-in
    if (this.enterProgress < 1) {
      this.enterProgress = Math.min(1, this.enterProgress + dt * 3);
    }

    // Check expiry
    if (this.timer >= this.duration) {
      this.active = false;
      return 'expired';
    }

    // Flash warning when about to expire (last 3 seconds)
    const remaining = this.duration - this.timer;

    // If chasing a predator
    if (this.targetPredator) {
      const pred = this.targetPredator;
      if (!pred.active || pred.scared) {
        this.targetPredator = null;
        this.attacking = false;
        return null;
      }

      // Move towards predator
      const dx = pred.x - this.x;
      const dir = dx > 0 ? 1 : -1;
      this.facing = dir;
      this.x += dir * this.info.speed * 1.5 * dt;

      // Close enough to attack
      if (Math.abs(dx) < 40) {
        this.attacking = true;
        if (this.barkTimer <= 0) {
          this.barkTimer = 0.5;
          return { type: 'attack', predator: pred, power: this.info.scarePower };
        }
      }
      return null;
    }

    // Patrol movement
    const range = this.info.patrolRange;
    this.x += this.patrolDir * this.info.speed * dt;
    this.facing = this.patrolDir;

    if (this.x > this.patrolCenter + range) {
      this.patrolDir = -1;
    } else if (this.x < this.patrolCenter - range) {
      this.patrolDir = 1;
    }

    // Keep within screen bounds
    this.x = Math.max(30, Math.min(this.canvasWidth - 30, this.x));

    return null;
  }

  assignTarget(predator) {
    if (this.targetPredator) return;
    this.targetPredator = predator;
    this.attacking = false;
  }

  getRemainingRatio() {
    return Math.max(0, 1 - this.timer / this.duration);
  }

  draw(ctx) {
    if (!this.active) return;

    const enterScale = this.enterProgress < 1
      ? 0.5 + this.enterProgress * 0.5
      : 1;

    // Fade when expiring (last 2 seconds)
    const remaining = this.duration - this.timer;
    if (remaining < 2) {
      // Blink effect
      const blink = Math.sin(remaining * 8) > 0;
      if (!blink && remaining < 1) return;
      if (remaining < 2) {
        ctx.save();
        ctx.globalAlpha = Math.max(0.3, remaining / 2);
      }
    }

    const bob = Math.sin(this.bobble) * 2;

    ctx.save();
    ctx.translate(this.x, this.y + bob);
    ctx.scale(this.facing * enterScale, enterScale);

    if (this.type === 0) {
      this._drawBori(ctx);
    } else {
      this._drawJopssal(ctx);
    }

    ctx.restore();

    // Duration bar above dog
    if (this.enterProgress >= 1) {
      ctx.save();
      ctx.translate(this.x, this.y - 45);
      const bw = 36, bh = 5;
      const ratio = this.getRemainingRatio();
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(-bw / 2, 0, bw, bh);
      const barColor = ratio > 0.3 ? '#4CAF50' : ratio > 0.15 ? '#FF9800' : '#F44336';
      ctx.fillStyle = barColor;
      ctx.fillRect(-bw / 2, 0, bw * ratio, bh);
      ctx.restore();
    }

    if (remaining < 2) {
      ctx.restore(); // globalAlpha
    }

    // Bark effect
    if (this.attacking && this.barkTimer > 0.3) {
      ctx.save();
      ctx.translate(this.x + this.facing * 25, this.y - 20);
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = '#FF4444';
      ctx.textAlign = 'center';
      ctx.fillText('멍!', 0, 0);
      ctx.restore();
    }
  }

  // 보리: 검은 차우차우 - 크고 뭉실뭉실
  _drawBori(ctx) {
    const sc = window.__spriteCache;
    if (!sc || !sc.ready) return;
    const sprite = this.attacking ? 'dog-bori-attack' : 'dog-bori';
    sc.draw(ctx, sprite, 0, 0, 1, 1);
  }

  // 좁쌀이: 흰색 + 누런 점박이, 작고 날렵, 여우 닮음
  _drawJopssal(ctx) {
    const sc = window.__spriteCache;
    if (!sc || !sc.ready) return;
    const sprite = this.attacking ? 'dog-jopssal-attack' : 'dog-jopssal';
    sc.draw(ctx, sprite, 0, 0, 1, 1);
  }
}
