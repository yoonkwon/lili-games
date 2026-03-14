/**
 * Collectible item on the map
 */
import { RARITY } from '../config.js';

export class Item {
  constructor(x, y, itemDef, rarity) {
    this.x = x;
    this.y = y;
    this.type = itemDef.type;
    this.emoji = itemDef.emoji;
    this.name = itemDef.name;
    this.rarity = rarity;
    this.value = RARITY[rarity].value;
    this.color = RARITY[rarity].color;
    this.glow = RARITY[rarity].glow;
    this.collected = false;
    this.hidden = false;
    this.sky = false;

    // Animation
    this.phase = Math.random() * Math.PI * 2;
    this.spawnAnim = 0;
    this.collectAnim = 0;
    this.size = 28;
  }

  update(dt) {
    this.phase += dt * 3;
    if (this.spawnAnim < 1) {
      this.spawnAnim = Math.min(1, this.spawnAnim + dt * 4);
    }
    if (this.collected) {
      this.collectAnim += dt * 5;
    }
  }

  draw(ctx) {
    if (this.collected && this.collectAnim > 1) return;
    if (this.hidden) return;

    ctx.save();

    const bobY = Math.sin(this.phase) * 3;
    const scale = this.spawnAnim * (this.collected ? Math.max(0, 1 - this.collectAnim) : 1);
    const alpha = this.collected ? Math.max(0, 1 - this.collectAnim) : 1;

    ctx.globalAlpha = alpha;
    ctx.translate(this.x, this.y + bobY);
    ctx.scale(scale, scale);

    // Glow effect for rare+ items
    if (this.glow && !this.collected) {
      const glowAlpha = 0.2 + Math.sin(this.phase * 2) * 0.15;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 15;
      ctx.globalAlpha = alpha * (0.5 + glowAlpha);

      // Draw glow circle
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(0, 0, this.size * 0.7, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.globalAlpha = alpha;
    }

    // Draw emoji
    ctx.font = `${this.size}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.emoji, 0, 0);

    // Rarity indicator
    if (this.rarity !== 'common') {
      ctx.font = '10px sans-serif';
      const stars = this.rarity === 'shiny' ? '✦' : this.rarity === 'rare' ? '✦✦' : '✦✦✦';
      ctx.fillStyle = this.color;
      ctx.fillText(stars, 0, this.size * 0.6);
    }

    ctx.restore();
  }

  isFinished() {
    return this.collected && this.collectAnim > 1;
  }
}
