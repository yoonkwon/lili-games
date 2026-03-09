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
    if (sc && sc.ready && sc.get('dog-bori')) {
      sc.draw(ctx, 'dog-bori', 0, 0, 1, 1);
      return;
    }
    // Fallback drawing
    this._drawBoriFallback(ctx);
  }

  _drawBoriFallback(ctx) {
    // Shadow
    ctx.beginPath();
    ctx.ellipse(0, 20, 28, 6, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fill();

    // Tail (fluffy, curled up - chow chow style)
    ctx.save();
    ctx.translate(-22, -10);
    ctx.beginPath();
    ctx.ellipse(-5, -5, 12, 10, -0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a1a';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-3, -6, 8, 7, -0.3, 0, Math.PI * 2);
    ctx.fillStyle = '#2a2a2a';
    ctx.fill();
    ctx.restore();

    // Body (big, fluffy)
    ctx.beginPath();
    ctx.ellipse(0, 2, 30, 22, 0, 0, Math.PI * 2);
    const bg = ctx.createRadialGradient(-5, -4, 4, 0, 2, 30);
    bg.addColorStop(0, '#2a2a2a');
    bg.addColorStop(1, '#111111');
    ctx.fillStyle = bg;
    ctx.fill();

    // Fluffy chest
    ctx.beginPath();
    ctx.ellipse(8, 5, 18, 16, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#1e1e1e';
    ctx.fill();

    // Legs (stubby, fluffy)
    for (let s = -1; s <= 1; s += 2) {
      ctx.beginPath();
      ctx.ellipse(s * 12, 18, 8, 8, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#151515';
      ctx.fill();
    }

    // Head (big, round - chow chow)
    ctx.beginPath();
    ctx.ellipse(22, -8, 20, 18, 0, 0, Math.PI * 2);
    const hg = ctx.createRadialGradient(18, -12, 3, 22, -8, 20);
    hg.addColorStop(0, '#2a2a2a');
    hg.addColorStop(1, '#111111');
    ctx.fillStyle = hg;
    ctx.fill();

    // Mane (fluffy chow chow mane)
    ctx.beginPath();
    ctx.ellipse(18, -2, 22, 18, 0.1, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a1a';
    ctx.fill();

    // Ears (small, hidden in fluff)
    for (let s = -1; s <= 1; s += 2) {
      ctx.beginPath();
      ctx.ellipse(22 + s * 14, -22, 6, 8, s * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = '#1a1a1a';
      ctx.fill();
    }

    // Muzzle
    ctx.beginPath();
    ctx.ellipse(34, -2, 10, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#222222';
    ctx.fill();

    // Nose
    ctx.beginPath();
    ctx.ellipse(40, -3, 4, 3, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#333';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(39, -4.5, 1.5, 1, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fill();

    // Eyes (small, cute)
    for (let s = -1; s <= 1; s += 2) {
      const ex = 26 + s * 7, ey = -12;
      ctx.beginPath();
      ctx.ellipse(ex, ey, 4, 4.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(ex + 1, ey, 2.5, 3, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#1a0a00';
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(ex, ey - 1.5, 1.2, 1.2, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#FFF';
      ctx.fill();
    }

    // Tongue (when attacking)
    if (this.attacking) {
      ctx.beginPath();
      ctx.ellipse(38, 4, 4, 6, 0.2, 0, Math.PI * 2);
      ctx.fillStyle = '#FF6B6B';
      ctx.fill();
    }
  }

  // 좁쌀이: 흰색 + 누런 점박이, 작고 날렵, 여우 닮음
  _drawJopssal(ctx) {
    const sc = window.__spriteCache;
    if (sc && sc.ready && sc.get('dog-jopssal')) {
      sc.draw(ctx, 'dog-jopssal', 0, 0, 1, 1);
      return;
    }
    this._drawJopssalFallback(ctx);
  }

  _drawJopssalFallback(ctx) {
    // Shadow
    ctx.beginPath();
    ctx.ellipse(0, 16, 22, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fill();

    // Tail (fox-like, fluffy with white tip)
    ctx.save();
    ctx.translate(-18, -6);
    ctx.rotate(-0.3);
    ctx.beginPath();
    ctx.ellipse(-8, 0, 14, 7, -0.3, 0, Math.PI * 2);
    ctx.fillStyle = '#F5E6C8';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-16, 0, 8, 5, -0.2, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.restore();

    // Body (slim, agile)
    ctx.beginPath();
    ctx.ellipse(0, 2, 24, 16, 0, 0, Math.PI * 2);
    const bg = ctx.createRadialGradient(-4, -3, 3, 0, 2, 24);
    bg.addColorStop(0, '#FFFFF0');
    bg.addColorStop(1, '#F5E6C8');
    ctx.fillStyle = bg;
    ctx.fill();

    // Spots (yellowish-brown)
    const spots = [
      [5, -2, 8, 6], [-8, 5, 6, 5], [12, 6, 5, 4], [-3, 8, 7, 4],
    ];
    for (const [sx, sy, srx, sry] of spots) {
      ctx.beginPath();
      ctx.ellipse(sx, sy, srx, sry, i * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(210,180,100,0.4)';
      ctx.fill();
    }

    // Legs (thin, agile)
    for (let s = -1; s <= 1; s += 2) {
      ctx.beginPath();
      ctx.ellipse(s * 10, 14, 5, 6, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#EDE0C8';
      ctx.fill();
    }

    // Belly
    ctx.beginPath();
    ctx.ellipse(3, 6, 14, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    // Head (fox-like, pointy)
    ctx.beginPath();
    ctx.ellipse(20, -6, 16, 14, 0, 0, Math.PI * 2);
    const hg = ctx.createRadialGradient(17, -10, 3, 20, -6, 16);
    hg.addColorStop(0, '#FFFFF8');
    hg.addColorStop(1, '#F5E6C8');
    ctx.fillStyle = hg;
    ctx.fill();

    // Head spots
    ctx.beginPath();
    ctx.ellipse(16, -12, 8, 6, -0.3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(210,180,100,0.35)';
    ctx.fill();

    // Ears (big, fox-like, pointy)
    for (let s = -1; s <= 1; s += 2) {
      ctx.beginPath();
      ctx.moveTo(20 + s * 10, -16);
      ctx.lineTo(20 + s * 16, -32);
      ctx.lineTo(20 + s * 5, -20);
      ctx.closePath();
      ctx.fillStyle = '#F5E6C8';
      ctx.fill();
      // Inner ear
      ctx.beginPath();
      ctx.moveTo(20 + s * 10.5, -17);
      ctx.lineTo(20 + s * 14, -28);
      ctx.lineTo(20 + s * 7, -20);
      ctx.closePath();
      ctx.fillStyle = '#FFD0D0';
      ctx.fill();
    }

    // Muzzle (pointy, fox-like)
    ctx.beginPath();
    ctx.ellipse(32, -2, 9, 6, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    // Nose
    ctx.beginPath();
    ctx.ellipse(38, -3, 3.5, 2.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#FF8080';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(37, -4, 1.2, 0.8, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fill();

    // Eyes (big, sparkly)
    for (let s = -1; s <= 1; s += 2) {
      const ex = 22 + s * 7, ey = -10;
      ctx.beginPath();
      ctx.ellipse(ex, ey, 4.5, 5, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(ex + 1, ey, 2.5, 3, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#3a2a10';
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(ex, ey - 2, 1.3, 1.3, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#FFF';
      ctx.fill();
    }

    // Blush
    for (let s = -1; s <= 1; s += 2) {
      ctx.beginPath();
      ctx.ellipse(22 + s * 14, 0, 5, 3, 0, 0, Math.PI * 2);
      const blush = ctx.createRadialGradient(22 + s * 14, 0, 1, 22 + s * 14, 0, 5);
      blush.addColorStop(0, 'rgba(255,150,140,0.4)');
      blush.addColorStop(1, 'rgba(255,150,160,0)');
      ctx.fillStyle = blush;
      ctx.fill();
    }

    // Tongue when attacking
    if (this.attacking) {
      ctx.beginPath();
      ctx.ellipse(36, 3, 3, 5, 0.2, 0, Math.PI * 2);
      ctx.fillStyle = '#FF6B6B';
      ctx.fill();
    }
  }
}
