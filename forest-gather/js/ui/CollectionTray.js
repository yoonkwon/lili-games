/**
 * CollectionTray - displays collected item emojis in a horizontal tray at the bottom of the screen.
 */
export class CollectionTray {
  constructor(spriteCache) {
    this.items = [];       // array of { emoji, sprite, anim }
    this.spriteCache = spriteCache || null;
  }

  addItem(emoji, sprite) {
    this.items.push({ emoji, sprite: sprite || null, anim: 0 });
  }

  /** Restore previously collected items (no animation) */
  restore(items) {
    for (const item of items) {
      this.items.push({ emoji: item.emoji, sprite: item.sprite || null, anim: 1 });
    }
  }

  update(dt) {
    for (const item of this.items) {
      if (item.anim < 1) {
        item.anim = Math.min(1, item.anim + dt / 0.4);
      }
    }
  }

  draw(ctx, w, h) {
    if (this.items.length === 0) return;

    const trayH = 44;
    const trayY = h - 56;
    const trayX = 8;
    const maxTrayW = w - 120; // leave room for mini-map
    const itemSize = 28;
    const itemGap = 36;

    // Background
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    const contentW = Math.min(this.items.length * itemGap + 8, maxTrayW);
    ctx.roundRect(trayX, trayY, contentW, trayH, [10, 10, 0, 0]);
    ctx.fill();

    // Clip to tray region
    ctx.beginPath();
    ctx.rect(trayX, trayY, maxTrayW, trayH);
    ctx.clip();

    // Auto-scroll to show newest items
    const totalContentW = this.items.length * itemGap;
    const visibleW = maxTrayW - 16;
    const scrollOffset = Math.max(0, totalContentW - visibleW);

    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      const ix = trayX + 18 + i * itemGap - scrollOffset;
      const iy = trayY + trayH / 2;

      if (ix < trayX - itemGap || ix > trayX + maxTrayW + itemGap) continue;

      // Bounce animation: scale 0→1.3→1.0
      let scale = 1;
      if (item.anim < 1) {
        const t = item.anim;
        if (t < 0.6) {
          scale = (t / 0.6) * 1.3;
        } else {
          scale = 1.3 - (t - 0.6) / 0.4 * 0.3;
        }
      }

      ctx.save();
      ctx.translate(ix, iy);
      ctx.scale(scale, scale);

      // Draw sprite if available, otherwise emoji text
      if (item.sprite && this.spriteCache) {
        const s = this.spriteCache.get(item.sprite);
        if (s) {
          const sz = itemSize;
          ctx.drawImage(s, -sz / 2, -sz / 2, sz, sz);
        } else {
          ctx.font = `${itemSize}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(item.emoji, 0, 0);
        }
      } else {
        ctx.font = `${itemSize}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.emoji, 0, 0);
      }

      ctx.restore();
    }

    ctx.restore();
  }
}
