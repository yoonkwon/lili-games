/**
 * Discoverable item on the map
 * Hidden in the environment - player must get close and tap to discover
 */
import { DISCOVER_RADIUS, HINT_RADIUS } from '../config.js';

const DISCOVER_RADIUS_SQ = DISCOVER_RADIUS * DISCOVER_RADIUS;
const HINT_RADIUS_SQ = HINT_RADIUS * HINT_RADIUS;

export class Item {
  constructor(x, y, itemDef, hideStyle) {
    this.x = x;
    this.y = y;
    this.id = itemDef.id;
    this.emoji = itemDef.emoji;
    this.name = itemDef.name;
    this.desc = itemDef.desc;
    this.displaySize = itemDef.size || 32;

    // Discovery state
    this.discovered = false;
    this.discoveredAnim = 0; // 0→1 pop animation when discovered

    // Visibility based on player proximity
    this.visibility = 0; // 0 = hidden, 1 = fully visible
    this.hintGlow = 0; // pulsing glow when in hint range

    // How item is hidden in the environment
    this.hideStyle = hideStyle; // 'bush', 'rock', 'sparkle', 'plain'
    this.hideEmoji = this._getHideEmoji(hideStyle);

    // Animation
    this.phase = Math.random() * Math.PI * 2;
    this.bobSpeed = 1.5 + Math.random() * 1;

    // Interaction indicator
    this.tapReady = false; // true when player is close enough to tap

    // Cached font strings (avoid per-frame allocation)
    this._fontMain = `${this.displaySize}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
    this._fontDiscovered = `${this.displaySize * 0.7}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
  }

  _getHideEmoji(style) {
    switch (style) {
      case 'bush': return '🌿';
      case 'rock': return '🪨';
      case 'tree': return '🌳';
      case 'flower': return '🌺';
      case 'sparkle': return '✨';
      default: return null;
    }
  }

  updateProximity(playerX, playerY) {
    const dx = this.x - playerX;
    const dy = this.y - playerY;
    const distSq = dx * dx + dy * dy;

    if (distSq < DISCOVER_RADIUS_SQ) {
      this.tapReady = true;
      this.visibility = 1;
    } else if (distSq < HINT_RADIUS_SQ) {
      this.tapReady = false;
      // Only compute sqrt for the interpolation in hint range
      const dist = Math.sqrt(distSq);
      this.visibility = 0.3 + 0.7 * (1 - (dist - DISCOVER_RADIUS) / (HINT_RADIUS - DISCOVER_RADIUS));
    } else {
      this.tapReady = false;
      this.visibility = 0;
    }
  }

  update(dt) {
    this.phase += dt * this.bobSpeed;
    if (this.tapReady && !this.discovered) {
      this.hintGlow = 0.5 + Math.sin(this.phase * 3) * 0.5;
    } else {
      this.hintGlow *= 0.9;
    }
    if (this.discovered && this.discoveredAnim < 1) {
      this.discoveredAnim = Math.min(1, this.discoveredAnim + dt * 3);
    }
  }

  draw(ctx) {
    if (this.discovered) {
      this._drawDiscovered(ctx);
      return;
    }

    // Not visible yet - show nothing or faint sparkle
    if (this.visibility <= 0) return;

    ctx.save();

    const bobY = Math.sin(this.phase) * 3;
    ctx.translate(this.x, this.y + bobY);

    // If hidden behind something, show the hiding element when far
    if (this.hideEmoji && this.visibility < 0.6) {
      ctx.globalAlpha = 0.7;
      ctx.font = '30px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.hideEmoji, 0, 0);
      // Faint sparkle to hint something is here
      if (this.visibility > 0.1) {
        ctx.globalAlpha = this.visibility * 0.5;
        ctx.font = '14px sans-serif';
        ctx.fillText('✨', 8, -12);
      }
      ctx.restore();
      return;
    }

    ctx.globalAlpha = Math.min(1, this.visibility);

    // Tap-ready glow ring
    if (this.tapReady) {
      ctx.save();
      ctx.globalAlpha = this.hintGlow * 0.4;
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(0, 0, this.displaySize * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // "?" indicator
      ctx.save();
      ctx.globalAlpha = 0.6 + this.hintGlow * 0.4;
      ctx.font = 'Bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFD700';
      ctx.fillText('❓', 0, -this.displaySize * 0.7);
      ctx.restore();
    }

    // Show the actual item (partially revealed)
    ctx.font = this._fontMain;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.emoji, 0, 0);

    ctx.restore();
  }

  _drawDiscovered(ctx) {
    ctx.save();
    const bobY = Math.sin(this.phase) * 1.5;
    ctx.translate(this.x, this.y + bobY);

    // Pop animation
    const popScale = this.discoveredAnim < 1
      ? 0.5 + this.discoveredAnim * 0.7 + Math.sin(this.discoveredAnim * Math.PI) * 0.3
      : 1;

    ctx.globalAlpha = 0.5;
    ctx.scale(popScale * 0.8, popScale * 0.8);

    // Dimmed (already collected) item with checkmark
    ctx.font = this._fontDiscovered;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.emoji, 0, 0);

    // Checkmark
    ctx.globalAlpha = 0.8;
    ctx.font = '16px sans-serif';
    ctx.fillText('✅', this.displaySize * 0.4, -this.displaySize * 0.3);

    ctx.restore();
  }

  /** Check if a tap at (tx, ty) hits this item */
  hitTest(tx, ty) {
    if (this.discovered || !this.tapReady) return false;
    const dx = tx - this.x;
    const dy = ty - this.y;
    return dx * dx + dy * dy < (this.displaySize + 15) * (this.displaySize + 15);
  }
}
