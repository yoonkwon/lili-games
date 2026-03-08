// particles.js - Particle system for chicken egg game

export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.floatingTexts = [];
  }

  createParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 400,   // random +/-200
        vy: -(Math.random() * 200 + 50),     // random -50 to -250 (upward)
        life: 1,
        color,
        size: Math.random() * 6 + 2,         // 2 to 8
        type: 'circle'
      });
    }
  }

  createStars(x, y) {
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const speed = 120;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color: '#FFD700',
        size: 16,
        type: 'star',
        emoji: '\u2B50'
      });
    }
  }

  addFloatingText(x, y, text, color) {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      life: 1,
      vy: -40   // float upward 40px/s
    });
  }

  update(dt) {
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 300 * dt;       // gravity
      p.life -= dt * 2;       // life decay

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * dt;     // float upward
      ft.life -= dt;           // fade over 1 second

      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    // Draw particles
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);

      if (p.type === 'star') {
        ctx.font = `${p.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.emoji, p.x, p.y);
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // Draw floating texts
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.life);
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }
}
