/**
 * Companion - patrols an assigned sector around the player,
 * autonomously seeks items and reveals them (boosts visibility).
 * Each companion has a unique, visible ability with distinctive behavior.
 *
 * In discovery mode, companions don't auto-collect - they help the player
 * find items by revealing hidden ones and boosting visibility.
 */
import { COMPANIONS } from '../config.js';
import { drawNameLabel } from '../drawUtils.js';

// Separation physics constants
const SEPARATION_RADIUS = 45;
const SEPARATION_RADIUS_SQ = SEPARATION_RADIUS * SEPARATION_RADIUS;
const SEPARATION_FORCE = 200;
const PLAYER_SEPARATION_RADIUS = 35;
const PLAYER_SEPARATION_RADIUS_SQ = PLAYER_SEPARATION_RADIUS * PLAYER_SEPARATION_RADIUS;
const PLAYER_SEPARATION_FORCE = 250;

// How close a companion must be to reveal an item
const REVEAL_RADIUS = 70;
const REVEAL_RADIUS_SQ = REVEAL_RADIUS * REVEAL_RADIUS;

export class Companion {
  constructor(type, ownerRef, angleIndex, totalCompanions) {
    const config = COMPANIONS[type];
    this.type = type;
    this.name = config.name;
    this.emoji = config.emoji;
    this.range = config.range;
    this.ability = config.ability;
    this.abilityInterval = config.abilityInterval || 0;
    this.speed = config.speed;
    this.config = config;

    this.owner = ownerRef;
    this.x = ownerRef.x;
    this.y = ownerRef.y;
    this.vx = 0;
    this.vy = 0;
    this.facingRight = true;

    this.revealTimer = 0;
    this.abilityTimer = 0;
    this.bobPhase = Math.random() * Math.PI * 2;

    // Patrol zone
    this.patrolRadius = 120;
    this.patrolWanderRadius = 80;
    this.assignAngle(angleIndex, totalCompanions);

    this.wanderTarget = null;
    this.wanderTimer = 0;
    this.seekingItem = null;
    this.seekTimer = 0;
    this.currentRangeBonus = 0;

    // Speech bubble (for ability feedback)
    this.speechBubble = null;
    this.speechTimer = 0;
    this._speechBubbleWidth = 0;

    // === Ability-specific state ===

    // Detect (보리/아찌): sniffing animation + bark pulse
    this.sniffPhase = 0;
    this.barkPulse = 0;
    this.barkPulseAlpha = 0;
    this.detectCooldown = 0;

    // Dash (좁쌀이): sprint state
    this.dashing = false;
    this.dashTimer = 0;
    this.dashTargetX = 0;
    this.dashTargetY = 0;
    this.dashTrail = [];

    // Swoop (익돌이): dive-bomb state
    this.swooping = false;
    this.swoopTimer = 0;
    this.swoopStartX = 0;
    this.swoopStartY = 0;
    this.swoopEndX = 0;
    this.swoopEndY = 0;
    this.swoopProgress = 0;

    // Lucky (고순이): sparkle aura
    this.auraPhase = 0;
    this.auraFlash = 0;
  }

  assignAngle(index, total) {
    const baseAngle = -Math.PI * 0.75;
    this.sectorAngle = baseAngle + (2 * Math.PI * index) / Math.max(1, total);
    this.sectorSpread = Math.PI / Math.max(2, total);
  }

  _isInSector(wx, wy) {
    const dx = wx - this.owner.x;
    const dy = wy - this.owner.y;
    const angle = Math.atan2(dy, dx);
    let diff = angle - this.sectorAngle;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    return Math.abs(diff) < this.sectorSpread + 0.3;
  }

  /**
   * @param {number} dt
   * @param {Item[]} items - items with .discovered property
   * @param {function} onReveal - callback(item) when companion reveals an item
   * @param {number} rangeBonus
   * @param {number} speedBonus
   * @param {Companion[]} allCompanions
   */
  update(dt, items, onReveal, rangeBonus = 0, speedBonus = 0, allCompanions = []) {
    this._allCompanions = allCompanions;
    this.currentRangeBonus = rangeBonus;
    this.bobPhase += dt * 6;

    // Speech timer
    if (this.speechTimer > 0) {
      this.speechTimer -= dt;
      if (this.speechTimer <= 0) this.speechBubble = null;
    }

    // Update ability-specific behavior
    this._updateAbility(dt, items, onReveal);

    // If in special movement state (dash/swoop), skip normal movement
    if (this.dashing || this.swooping) {
      this._updateSpecialMovement(dt, items, onReveal);
      return;
    }

    // 1. Decide target
    this._updateSeekTarget(dt, items);

    let tx, ty;
    if (this.seekingItem && !this.seekingItem.discovered) {
      tx = this.seekingItem.x;
      ty = this.seekingItem.y;
    } else {
      this.seekingItem = null;
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
      const speedMult = leashDistSq > 62500 ? 4 : leashDistSq > 22500 ? 2 : 1;
      const moveSpeed = Math.min((this.speed + speedBonus) * speedMult, dist * 3);
      this.vx = (dx / dist) * moveSpeed;
      this.vy = (dy / dist) * moveSpeed;
    } else {
      this.vx *= 0.9;
      this.vy *= 0.9;
    }

    // 3. Separation forces
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

    // 4. Reveal nearby items (boost visibility instead of auto-collecting)
    this.revealTimer -= dt;
    if (this.revealTimer <= 0) {
      this.revealTimer = 0.3;
      const revealRange = REVEAL_RADIUS + rangeBonus;
      const revealRangeSq = revealRange * revealRange;
      for (const item of items) {
        if (item.discovered) continue;
        const ix = item.x - this.x;
        const iy = item.y - this.y;
        if (ix * ix + iy * iy < revealRangeSq) {
          // Boost item visibility so player can see and tap it
          if (item.visibility < 0.8) {
            item.visibility = Math.min(1, item.visibility + 0.4);
            item.tapReady = true;
            onReveal(item);
          }
        }
      }
    }
  }

  /** Set speech bubble text with cached width estimate */
  setSpeech(text, duration) {
    this.speechBubble = text;
    this.speechTimer = duration;
    this._speechBubbleWidth = text.length * 8 + 16; // estimate, avoids per-frame measureText
  }

  // ==================== ABILITY LOGIC ====================

  _updateAbility(dt, items, onReveal) {
    if (this.abilityInterval > 0) {
      this.abilityTimer += dt;
    }

    // Detect: proximity sniffing + bark pulse to reveal items
    if (this.ability === 'detect') {
      this.sniffPhase += dt * 4;
      this.detectCooldown -= dt;
      if (this.detectCooldown <= 0) {
        this.detectCooldown = 0.5;
        const detectR = this.config.detectRadius || 60;
        const detectRSq = detectR * detectR;
        for (const item of items) {
          if (item.discovered) continue;
          const dx = item.x - this.x;
          const dy = item.y - this.y;
          if (dx * dx + dy * dy < detectRSq) {
            if (item.visibility < 0.6) {
              item.visibility = 0.8;
              item.tapReady = true;
              this.barkPulse = 1;
              this.barkPulseAlpha = 0.6;
              onReveal(item);
            }
          }
        }
      }
      // Bark pulse decay
      if (this.barkPulse > 0) {
        this.barkPulse += dt * 150;
        this.barkPulseAlpha -= dt * 1.2;
        if (this.barkPulseAlpha <= 0) {
          this.barkPulse = 0;
          this.barkPulseAlpha = 0;
        }
      }

      // Periodic big bark pulse
      if (this.abilityTimer >= this.abilityInterval) {
        this.abilityTimer = 0;
        this.barkPulse = 1;
        this.barkPulseAlpha = 0.8;
        // Reveal all items in a large radius
        const bigRadius = 200;
        const bigRadiusSq = bigRadius * bigRadius;
        for (const item of items) {
          if (item.discovered) continue;
          const dx = item.x - this.x;
          const dy = item.y - this.y;
          if (dx * dx + dy * dy < bigRadiusSq) {
            item.visibility = 1;
            item.tapReady = true;
            onReveal(item);
          }
        }
        this.setSpeech('킁킁! 여기 뭔가 있어!', 2);
      }
    }

    // Dash: sprint cooldown + trail
    if (this.ability === 'dash') {
      for (let i = this.dashTrail.length - 1; i >= 0; i--) {
        this.dashTrail[i].age += dt;
        if (this.dashTrail[i].age > 0.3) this.dashTrail.splice(i, 1);
      }

      // Auto-trigger dash toward nearest undiscovered item
      if (!this.dashing && this.abilityTimer >= this.abilityInterval) {
        const target = this._findNearestUndiscovered(items);
        if (target) {
          this.abilityTimer = 0;
          this.dashing = true;
          this.dashTimer = this.config.dashDuration || 0.8;
          this.dashTargetX = target.x;
          this.dashTargetY = target.y;
          this.seekingItem = target;
          this.setSpeech('달려!', 1.5);
        }
      }
    }

    // Swoop: auto-trigger dive toward items
    if (this.ability === 'swoop') {
      if (!this.swooping && this.abilityTimer >= this.abilityInterval) {
        const target = this._findNearestUndiscovered(items);
        if (target) {
          this.abilityTimer = 0;
          this.swooping = true;
          this.swoopTimer = 0;
          this.swoopStartX = this.x;
          this.swoopStartY = this.y - 60;
          this.swoopEndX = target.x;
          this.swoopEndY = target.y;
          this.swoopProgress = 0;
          this.setSpeech('위에서 찾아볼게!', 1.5);
        }
      }
    }

    // Lucky: aura animation + passive reveal boost
    if (this.ability === 'lucky') {
      this.auraPhase += dt * 3;
      if (this.auraFlash > 0) this.auraFlash -= dt * 3;

      // Periodic aura pulse that boosts nearby item visibility
      if (this.abilityTimer >= this.abilityInterval) {
        this.abilityTimer = 0;
        this.auraFlash = 1;
        const auraR = this.config.luckAuraRadius || 100;
        const auraRSq = auraR * auraR;
        for (const item of items) {
          if (item.discovered) continue;
          const dx = item.x - this.x;
          const dy = item.y - this.y;
          if (dx * dx + dy * dy < auraRSq) {
            item.visibility = 1;
            item.tapReady = true;
            onReveal(item);
          }
        }
        this.setSpeech('반짝! 행운이야!', 2);
      }
    }
  }

  /** Items already being sought by other companions */
  _getClaimedItems() {
    const claimed = new Set();
    const allComps = this._allCompanions || [];
    for (const other of allComps) {
      if (other === this) continue;
      if (other.seekingItem && !other.seekingItem.discovered) {
        claimed.add(other.seekingItem);
      }
    }
    return claimed;
  }

  _findNearestUndiscovered(items) {
    const claimedItems = this._getClaimedItems();
    let nearest = null;
    let nearestFallback = null;
    let minDist = Infinity;
    let minDistFallback = Infinity;
    for (const item of items) {
      if (item.discovered) continue;
      const dx = item.x - this.owner.x;
      const dy = item.y - this.owner.y;
      const d = dx * dx + dy * dy;
      if (d >= 90000) continue; // within 300px of owner
      if (!claimedItems.has(item) && d < minDist) {
        minDist = d;
        nearest = item;
      }
      if (d < minDistFallback) {
        minDistFallback = d;
        nearestFallback = item;
      }
    }
    return nearest || nearestFallback;
  }

  /** Reveal items near companion during dash/swoop */
  _revealNearby(rangeSq, items, onReveal) {
    for (const item of items) {
      if (item.discovered) continue;
      const ix = item.x - this.x;
      const iy = item.y - this.y;
      if (ix * ix + iy * iy < rangeSq) {
        item.visibility = 1;
        item.tapReady = true;
        onReveal(item);
      }
    }
  }

  /** Handle dash and swoop special movement */
  _updateSpecialMovement(dt, items, onReveal) {
    if (this.dashing) {
      this.dashTimer -= dt;
      this.dashTrail.push({ x: this.x, y: this.y, age: 0 });

      const dashSpd = this.config.dashSpeed || 500;
      const dx = this.dashTargetX - this.x;
      const dy = this.dashTargetY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 10 && this.dashTimer > 0) {
        this.vx = (dx / dist) * dashSpd;
        this.vy = (dy / dist) * dashSpd;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        if (Math.abs(this.vx) > 2) this.facingRight = this.vx > 0;
        this._revealNearby(2500, items, onReveal); // 50px radius
      } else {
        this.dashing = false;
        this.vx *= 0.3;
        this.vy *= 0.3;
      }
    }

    if (this.swooping) {
      this.swoopTimer += dt;
      const duration = 0.6;
      this.swoopProgress = Math.min(1, this.swoopTimer / duration);

      const t = this.swoopProgress;
      const arcHeight = -120 * Math.sin(t * Math.PI);
      this.x = this.swoopStartX + (this.swoopEndX - this.swoopStartX) * t;
      this.y = this.swoopStartY + (this.swoopEndY - this.swoopStartY) * t + arcHeight;
      this.facingRight = this.swoopEndX > this.swoopStartX;

      if (t > 0.3) {
        this._revealNearby(4900, items, onReveal); // 70px radius - wider for aerial
      }

      if (this.swoopProgress >= 1) {
        this.swooping = false;
        this.vx = 0;
        this.vy = 0;
      }
    }
  }

  _updateSeekTarget(dt, items) {
    this.seekTimer -= dt;
    if (this.seekTimer > 0 && this.seekingItem && !this.seekingItem.discovered) return;
    this.seekTimer = 0.5 + Math.random() * 0.5;

    const claimedItems = this._getClaimedItems();

    let bestItem = null;
    let bestScore = -Infinity;

    for (const item of items) {
      if (item.discovered) continue;

      const odx = item.x - this.owner.x;
      const ody = item.y - this.owner.y;
      if (odx * odx + ody * ody > 78400) continue; // 280²

      const sdx = item.x - this.x;
      const sdy = item.y - this.y;
      const distFromSelfSq = sdx * sdx + sdy * sdy;

      let score = 300 - Math.sqrt(distFromSelfSq);
      if (this._isInSector(item.x, item.y)) score += 200;

      // Heavy penalty if another companion is already going there
      if (claimedItems.has(item)) score -= 400;

      if (score > bestScore) {
        bestScore = score;
        bestItem = item;
      }
    }

    this.seekingItem = bestItem;
  }

  // ==================== DRAWING ====================

  draw(ctx, spriteCache) {
    const bobY = Math.sin(this.bobPhase) * 2;
    const flyY = this.ability === 'swoop' ? -20 + Math.sin(this.bobPhase * 0.7) * 5 : 0;

    // === Ability-specific visual effects ===

    // Detect: sniffing head bob + bark pulse
    if (this.ability === 'detect') {
      const sniffBob = Math.sin(this.sniffPhase) * 1.5;
      if (this.barkPulse > 0) {
        ctx.save();
        ctx.globalAlpha = this.barkPulseAlpha;
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y + bobY, this.barkPulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = this.barkPulseAlpha * 0.3;
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(this.x, this.y + bobY, this.barkPulse * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      spriteCache.draw(ctx, `${this.type}-idle`, this.x, this.y + bobY + sniffBob, 1, !this.facingRight);
    }

    // Dash: speed trail
    else if (this.ability === 'dash') {
      for (const t of this.dashTrail) {
        ctx.save();
        ctx.globalAlpha = 0.4 * (1 - t.age / 0.3);
        spriteCache.draw(ctx, `${this.type}-idle`, t.x, t.y + bobY, 0.8, !this.facingRight);
        ctx.restore();
      }
      if (this.dashing) {
        ctx.save();
        ctx.translate(this.x, this.y + bobY);
        const stretchX = 1.3;
        const stretchY = 0.8;
        ctx.scale(this.facingRight ? stretchX : -stretchX, stretchY);
        spriteCache.draw(ctx, `${this.type}-idle`, 0, 0, 1, false);
        ctx.restore();
      } else {
        spriteCache.draw(ctx, `${this.type}-idle`, this.x, this.y + bobY, 1, !this.facingRight);
      }
    }

    // Swoop: swooping arc with motion lines
    else if (this.ability === 'swoop') {
      if (this.swooping) {
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = '#FF8C00';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          const offset = (i - 1) * 8;
          ctx.beginPath();
          ctx.moveTo(this.x - (this.facingRight ? 25 : -25), this.y + offset);
          ctx.lineTo(this.x - (this.facingRight ? 45 : -45), this.y + offset + 5);
          ctx.stroke();
        }
        ctx.restore();
        ctx.save();
        ctx.translate(this.x, this.y);
        const tilt = this.swoopProgress < 0.5 ? -0.3 : 0.3;
        ctx.rotate(tilt * (this.facingRight ? 1 : -1));
        spriteCache.draw(ctx, `${this.type}-idle`, 0, 0, 1.1, !this.facingRight);
        ctx.restore();
      } else {
        spriteCache.draw(ctx, `${this.type}-idle`, this.x, this.y + bobY + flyY, 1, !this.facingRight);
      }
    }

    // Lucky: sparkle aura
    else if (this.ability === 'lucky') {
      const auraR = this.config.luckAuraRadius || 100;
      ctx.save();
      const auraAlpha = 0.08 + Math.sin(this.auraPhase) * 0.04;
      ctx.globalAlpha = auraAlpha + (this.auraFlash > 0 ? this.auraFlash * 0.15 : 0);
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.arc(this.x, this.y + bobY, auraR * 0.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      ctx.save();
      ctx.fillStyle = '#FFD700';
      ctx.font = '8px sans-serif';
      ctx.textAlign = 'center';
      for (let i = 0; i < 4; i++) {
        const sparkAngle = this.auraPhase + i * Math.PI * 0.5;
        const sparkR = 20 + Math.sin(this.auraPhase * 0.7 + i) * 8;
        const sx = this.x + Math.cos(sparkAngle) * sparkR;
        const sy = this.y + bobY + Math.sin(sparkAngle) * sparkR * 0.6;
        ctx.globalAlpha = 0.4 + Math.sin(this.auraPhase * 2 + i * 1.5) * 0.3;
        ctx.fillText('✦', sx, sy);
      }
      ctx.restore();

      if (this.auraFlash > 0) {
        ctx.save();
        ctx.globalAlpha = this.auraFlash * 0.3;
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(this.x, this.y + bobY, auraR * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      spriteCache.draw(ctx, `${this.type}-idle`, this.x, this.y + bobY, 1, !this.facingRight);
    }

    // Default draw
    else {
      spriteCache.draw(ctx, `${this.type}-idle`, this.x, this.y + bobY + flyY, 1, !this.facingRight);
    }

    // Speech bubble
    if (this.speechBubble) {
      ctx.save();
      const bx = this.x;
      const by = this.y + bobY + flyY - 35;
      ctx.font = '11px "Apple SD Gothic Neo", "Segoe UI", sans-serif';
      const bw = this._speechBubbleWidth || (this.speechBubble.length * 8 + 16);
      const bh = 22;
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.roundRect(bx - bw / 2, by - bh, bw, bh, 8);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(bx - 4, by);
      ctx.lineTo(bx + 4, by);
      ctx.lineTo(bx, by + 6);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#333';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.speechBubble, bx, by - bh / 2);
      ctx.restore();
    }

    // Name label
    drawNameLabel(ctx, this.name, this.x, this.y + bobY + flyY - 22);
  }
}
