/**
 * Particle effects + floating text system
 * Reusable across all games
 */
export class ParticleSystem {
  constructor(options = {}) {
    this.particles = [];
    this.floatingTexts = [];
    this.maxParticles = options.maxParticles || 200;
    this.maxFloatingTexts = options.maxFloatingTexts || 30;
  }

  createParticles(x, y, color, count) {
    count = Math.min(count, this.maxParticles - this.particles.length);
    if (count <= 0) return;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 80;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 20,
        life: 0.5 + Math.random() * 0.5,
        color,
        size: 2 + Math.random() * 4,
      });
    }
  }

  createStars(x, y, count = 5) {
    count = Math.min(count, this.maxParticles - this.particles.length);
    if (count <= 0) return;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 100;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 40,
        life: 0.8 + Math.random() * 0.4,
        emoji: '\u2B50',
        size: 12 + Math.random() * 8,
      });
    }
  }

  addFloatingText(x, y, text, color = '#FFF', size = 24) {
    if (this.floatingTexts.length >= this.maxFloatingTexts) {
      this.floatingTexts.shift();
    }
    this.floatingTexts.push({ x, y, text, color, size, life: 1.5, vy: -40 });
  }

  update(dt) {
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 120 * dt; // gravity
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.floatingTexts[i];
      t.y += t.vy * dt;
      t.life -= dt;
      if (t.life <= 0) this.floatingTexts.splice(i, 1);
    }
  }

  draw(ctx) {
    // Draw particles
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, p.life * 2);
      if (p.emoji) {
        ctx.font = `${p.size}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(p.emoji, p.x, p.y);
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Draw floating texts
    for (const t of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, t.life);
      ctx.font = `Bold ${t.size}px "Segoe UI", "Apple SD Gothic Neo", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = 3;
      ctx.strokeText(t.text, t.x, t.y);
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    }
  }
}
