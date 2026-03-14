/**
 * Companion - patrols an assigned sector around the player,
 * autonomously seeks and collects items within its zone.
 * Includes soft-body separation to prevent overlapping.
 */
import { COMPANIONS } from '../config.js';

// Separation physics constants
const SEPARATION_RADIUS = 45;  // min distance between companions
const SEPARATION_RADIUS_SQ = SEPARATION_RADIUS * SEPARATION_RADIUS;
const SEPARATION_FORCE = 200;  // push strength
const PLAYER_SEPARATION_RADIUS = 35;
const PLAYER_SEPARATION_RADIUS_SQ = PLAYER_SEPARATION_RADIUS * PLAYER_SEPARATION_RADIUS;
const PLAYER_SEPARATION_FORCE = 250;

export class Companion {
  constructor(type, ownerRef, angleIndex, totalCompanions) {
    const config = COMPANIONS[type];
    this.type = type;
    this.name = config.name;
    this.emoji = config.emoji;
    this.range = config.range;
    this.collectSpeed = config.collectSpeed;
    this.ability = config.ability;
    this.abilityInterval = config.abilityInterval || 0;
    this.speed = config.speed;

    this.owner = ownerRef;
    this.x = ownerRef.x;
    this.y = ownerRef.y;
    this.vx = 0; // velocity for physics
    this.vy = 0;
    this.facingRight = true;

    this.collectTimer = 0;
    this.abilityTimer = 0;
    this.bobPhase = Math.random() * Math.PI * 2;

    // Patrol zone: each companion covers a sector around the player
    this.patrolRadius = 120; // distance from player to patrol center
    this.patrolWanderRadius = 80; // how far from patrol center to wander
    this.assignAngle(angleIndex, totalCompanions);

    // Patrol wander state
    this.wanderTarget = null;
    this.wanderTimer = 0;

    // Item-seeking state
    this.seekingItem = null;
    this.seekTimer = 0;

    // Range bonus cache for drawing
    this.currentRangeBonus = 0;
  }

  /**
   * Assign an evenly-spaced sector angle around the player.
   */
  assignAngle(index, total) {
    const baseAngle = -Math.PI * 0.75;
    this.sectorAngle = baseAngle + (2 * Math.PI * index) / Math.max(1, total);
    this.sectorSpread = Math.PI / Math.max(2, total); // angular width of this companion's sector
  }

  /** Get the current patrol center position in world space */
  _getPatrolCenter() {
    return {
      x: this.owner.x + Math.cos(this.sectorAngle) * this.patrolRadius,
      y: this.owner.y + Math.sin(this.sectorAngle) * this.patrolRadius,
    };
  }

  /** Check if a world position falls within this companion's sector */
  _isInSector(wx, wy) {
    const dx = wx - this.owner.x;
    const dy = wy - this.owner.y;
    const angle = Math.atan2(dy, dx);
    let diff = angle - this.sectorAngle;
    // Normalize to [-PI, PI]
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    return Math.abs(diff) < this.sectorSpread + 0.3; // slight overlap allowed
  }

  update(dt, items, onCollect, rangeBonus = 0, speedBonus = 0, allCompanions = []) {
    this.currentRangeBonus = rangeBonus;

    // 1. Decide target: seek item in sector, or patrol wander
    this._updateSeekTarget(dt, items);

    let tx, ty;
    if (this.seekingItem && !this.seekingItem.collected) {
      // Move toward targeted item
      tx = this.seekingItem.x;
      ty = this.seekingItem.y;
    } else {
      this.seekingItem = null;
      // Patrol: wander within sector zone
      const center = this._getPatrolCenter();
      if (!this.wanderTarget || this.wanderTimer <= 0) {
        this.wanderTimer = 1.5 + Math.random() * 2;
        const angle = this.sectorAngle + (Math.random() - 0.5) * this.sectorSpread * 2;
        const dist = 30 + Math.random() * this.patrolWanderRadius;
        this.wanderTarget = {
          x: this.owner.x + Math.cos(angle) * dist,
          y: this.owner.y + Math.sin(angle) * dist,
        };
      }
      this.wanderTimer -= dt;
      tx = this.wanderTarget.x;
      ty = this.wanderTarget.y;
    }

    // 2. Movement toward target
    const dx = tx - this.x;
    const dy = ty - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 5) {
      const ldx = this.x - this.owner.x;
      const ldy = this.y - this.owner.y;
      const leashDistSq = ldx * ldx + ldy * ldy;
      const speedMult = leashDistSq > 62500 ? 4 : leashDistSq > 22500 ? 2 : 1; // 250², 150²
      const moveSpeed = Math.min((this.speed + speedBonus) * speedMult, dist * 3);
      this.vx = (dx / dist) * moveSpeed;
      this.vy = (dy / dist) * moveSpeed;
    } else {
      this.vx *= 0.9;
      this.vy *= 0.9;
    }

    // 3. Separation forces (push away from other companions and player)
    for (const other of allCompanions) {
      if (other === this) continue;
      const sx = this.x - other.x;
      const sy = this.y - other.y;
      const sDistSq = sx * sx + sy * sy;
      if (sDistSq < SEPARATION_RADIUS_SQ && sDistSq > 0.01) {
        const sDist = Math.sqrt(sDistSq);
        const overlap = (SEPARATION_RADIUS - sDist) / SEPARATION_RADIUS;
        this.vx += (sx / sDist) * SEPARATION_FORCE * overlap;
        this.vy += (sy / sDist) * SEPARATION_FORCE * overlap;
      }
    }

    // Push away from player
    {
      const px = this.x - this.owner.x;
      const py = this.y - this.owner.y;
      const pDistSq = px * px + py * py;
      if (pDistSq < PLAYER_SEPARATION_RADIUS_SQ && pDistSq > 0.01) {
        const pDist = Math.sqrt(pDistSq);
        const overlap = (PLAYER_SEPARATION_RADIUS - pDist) / PLAYER_SEPARATION_RADIUS;
        this.vx += (px / pDist) * PLAYER_SEPARATION_FORCE * overlap;
        this.vy += (py / pDist) * PLAYER_SEPARATION_FORCE * overlap;
      }
    }

    // Apply velocity
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (Math.abs(this.vx) > 2) this.facingRight = this.vx > 0;

    // 4. Auto-collect nearby items
    this.collectTimer -= dt;
    if (this.collectTimer <= 0) {
      const collectRange = this.range * 0.5 + rangeBonus;
      const collectRangeSq = collectRange * collectRange;
      for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        if (item.collected) continue;
        const ix = item.x - this.x;
        const iy = item.y - this.y;
        if (ix * ix + iy * iy < collectRangeSq) {
          if (item.sky && this.ability !== 'fly') continue;
          this.collectTimer = this.collectSpeed;
          this.seekingItem = null;
          onCollect(item, i);
          break;
        }
      }
    }

    // 5. Ability timer
    if (this.abilityInterval > 0) {
      this.abilityTimer += dt;
    }

    this.bobPhase += dt * 6;
  }

  /**
   * Look for a nearby item to actively pursue, preferring items in this companion's sector.
   */
  _updateSeekTarget(dt, items) {
    this.seekTimer -= dt;
    if (this.seekTimer > 0 && this.seekingItem && !this.seekingItem.collected) return;
    this.seekTimer = 0.5 + Math.random() * 0.5;

    let bestItem = null;
    let bestScore = -Infinity;

    for (const item of items) {
      if (item.collected || item.hidden) continue;
      if (item.sky && this.ability !== 'fly') continue;

      const odx = item.x - this.owner.x;
      const ody = item.y - this.owner.y;
      if (odx * odx + ody * ody > 78400) continue; // 280²

      const sdx = item.x - this.x;
      const sdy = item.y - this.y;
      const distFromSelfSq = sdx * sdx + sdy * sdy;

      // Score: closer is better, in-sector gets a big bonus
      let score = 300 - Math.sqrt(distFromSelfSq);
      if (this._isInSector(item.x, item.y)) score += 200;

      // Lucky companions prefer rare items
      if (this.ability === 'lucky' && (item.rarity === 'rare' || item.rarity === 'legendary')) {
        score += 150;
      }
      // Detect companions prefer hidden-adjacent areas
      if (this.ability === 'detect' && item.rarity !== 'common') {
        score += 80;
      }

      if (score > bestScore) {
        bestScore = score;
        bestItem = item;
      }
    }

    this.seekingItem = bestItem;
  }

  shouldRevealHidden() {
    if (this.ability !== 'detect') return false;
    if (this.abilityTimer >= this.abilityInterval) {
      this.abilityTimer = 0;
      return true;
    }
    return false;
  }

  shouldBoostLuck() {
    if (this.ability !== 'lucky') return false;
    if (this.abilityTimer >= this.abilityInterval) {
      this.abilityTimer = 0;
      return true;
    }
    return false;
  }

  draw(ctx, spriteCache) {
    const bobY = Math.sin(this.bobPhase) * 2;
    const flyY = this.ability === 'fly' ? -20 + Math.sin(this.bobPhase * 0.7) * 5 : 0;
    spriteCache.draw(ctx, `${this.type}-idle`, this.x, this.y + bobY + flyY, 1, !this.facingRight);

    // Name label above companion
    ctx.save();
    ctx.font = 'Bold 11px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillText(this.name, this.x + 1, this.y + bobY + flyY - 22);
    ctx.fillStyle = '#FFF';
    ctx.fillText(this.name, this.x, this.y + bobY + flyY - 23);
    ctx.restore();
  }
}
