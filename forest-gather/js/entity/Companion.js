/**
 * Companion - patrols an assigned sector around the player,
 * autonomously seeks and collects items within its zone.
 * Each companion has a unique, visible ability with distinctive behavior.
 */
import { COMPANIONS } from '../config.js';

// Separation physics constants
const SEPARATION_RADIUS = 45;
const SEPARATION_RADIUS_SQ = SEPARATION_RADIUS * SEPARATION_RADIUS;
const SEPARATION_FORCE = 200;
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
    this.config = config;

    this.owner = ownerRef;
    this.x = ownerRef.x;
    this.y = ownerRef.y;
    this.vx = 0;
    this.vy = 0;
    this.facingRight = true;

    this.collectTimer = 0;
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

    // === Ability-specific state ===

    // Detect (보리): sniffing animation + bark pulse
    this.sniffPhase = 0;
    this.barkPulse = 0; // visual pulse radius (0 = no pulse)
    this.barkPulseAlpha = 0;

    // Dash (좁쌀이): sprint state
    this.dashing = false;
    this.dashTimer = 0;
    this.dashTargetX = 0;
    this.dashTargetY = 0;
    this.dashTrail = []; // [{x, y, age}]

    // Swoop (익돌이): dive-bomb state
    this.swooping = false;
    this.swoopTimer = 0;
    this.swoopStartX = 0;
    this.swoopStartY = 0;
    this.swoopEndX = 0;
    this.swoopEndY = 0;
    this.swoopProgress = 0;
    this.swoopCollectCount = 0;

    // Lucky (고순이): sparkle aura
    this.auraPhase = 0;
    this.auraFlash = 0; // flash when upgrading items
  }

  assignAngle(index, total) {
    const baseAngle = -Math.PI * 0.75;
    this.sectorAngle = baseAngle + (2 * Math.PI * index) / Math.max(1, total);
    this.sectorSpread = Math.PI / Math.max(2, total);
  }

  _getPatrolCenter() {
    return {
      x: this.owner.x + Math.cos(this.sectorAngle) * this.patrolRadius,
      y: this.owner.y + Math.sin(this.sectorAngle) * this.patrolRadius,
    };
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

  update(dt, items, onCollect, rangeBonus = 0, speedBonus = 0, allCompanions = []) {
    this.currentRangeBonus = rangeBonus;
    this.bobPhase += dt * 6;

    // Update ability-specific behavior
    this._updateAbility(dt, items, onCollect);

    // If in special movement state (dash/swoop), skip normal movement
    if (this.dashing || this.swooping) {
      this._updateSpecialMovement(dt, items, onCollect);
      return;
    }

    // 1. Decide target
    this._updateSeekTarget(dt, items);

    let tx, ty;
    if (this.seekingItem && !this.seekingItem.collected) {
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

    // 4. Auto-collect nearby items
    this.collectTimer -= dt;
    if (this.collectTimer <= 0) {
      const collectRange = this.range * 0.5 + rangeBonus;
      const collectRangeSq = collectRange * collectRange;
      for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        if (item.collected) continue;
        if (item.sky && this.ability !== 'swoop') continue;
        const ix = item.x - this.x;
        const iy = item.y - this.y;
        if (ix * ix + iy * iy < collectRangeSq) {
          this.collectTimer = this.collectSpeed;
          this.seekingItem = null;
          onCollect(item, i);
          break;
        }
      }
    }
  }

  // ==================== ABILITY LOGIC ====================

  _updateAbility(dt, items, onCollect) {
    if (this.abilityInterval > 0) {
      this.abilityTimer += dt;
    }

    // Detect: proximity sniffing (check every 0.3s, not every frame)
    if (this.ability === 'detect') {
      this.sniffPhase += dt * 4;
      this.detectCooldown = (this.detectCooldown || 0) - dt;
      if (this.detectCooldown <= 0) {
        this.detectCooldown = 0.3;
        const detectR = this.config.detectRadius || 60;
        const detectRSq = detectR * detectR;
        for (const item of items) {
          if (!item.hidden || item.collected) continue;
          const dx = item.x - this.x;
          const dy = item.y - this.y;
          if (dx * dx + dy * dy < detectRSq) {
            item.hidden = false;
            this.barkPulse = 1;
            this.barkPulseAlpha = 0.6;
          }
        }
      }
      // Bark pulse decay
      if (this.barkPulse > 0) {
        this.barkPulse += dt * 150; // expand
        this.barkPulseAlpha -= dt * 1.2;
        if (this.barkPulseAlpha <= 0) {
          this.barkPulse = 0;
          this.barkPulseAlpha = 0;
        }
      }
    }

    // Dash: sprint cooldown
    if (this.ability === 'dash') {
      // Update trail
      for (let i = this.dashTrail.length - 1; i >= 0; i--) {
        this.dashTrail[i].age += dt;
        if (this.dashTrail[i].age > 0.3) this.dashTrail.splice(i, 1);
      }
    }

    // Swoop: handled in _updateSpecialMovement
    // Lucky: aura animation
    if (this.ability === 'lucky') {
      this.auraPhase += dt * 3;
      if (this.auraFlash > 0) this.auraFlash -= dt * 3;
    }
  }

  /** Check if the big bark pulse ability should trigger (GameScene calls this) */
  shouldBarkPulse() {
    if (this.ability !== 'detect') return false;
    if (this.abilityTimer >= this.abilityInterval) {
      this.abilityTimer = 0;
      this.barkPulse = 1;
      this.barkPulseAlpha = 0.8;
      return true;
    }
    return false;
  }

  /** Check if dash should trigger */
  shouldDash() {
    if (this.ability !== 'dash' || this.dashing) return false;
    if (this.abilityTimer >= this.abilityInterval) {
      this.abilityTimer = 0;
      return true;
    }
    return false;
  }

  /** Start a dash toward a target item */
  startDash(targetItem) {
    this.dashing = true;
    this.dashTimer = this.config.dashDuration || 0.8;
    this.dashTargetX = targetItem.x;
    this.dashTargetY = targetItem.y;
    this.seekingItem = targetItem;
  }

  /** Check if swoop should trigger */
  shouldSwoop() {
    if (this.ability !== 'swoop' || this.swooping) return false;
    if (this.abilityTimer >= this.abilityInterval) {
      this.abilityTimer = 0;
      return true;
    }
    return false;
  }

  /** Start a swoop dive from current position toward a target */
  startSwoop(targetX, targetY) {
    this.swooping = true;
    this.swoopTimer = 0;
    this.swoopStartX = this.x;
    this.swoopStartY = this.y - 60; // launch up first
    this.swoopEndX = targetX;
    this.swoopEndY = targetY;
    this.swoopProgress = 0;
    this.swoopCollectCount = 0;
  }

  /** Check if lucky aura should pulse */
  shouldLuckyAura() {
    if (this.ability !== 'lucky') return false;
    if (this.abilityTimer >= this.abilityInterval) {
      this.abilityTimer = 0;
      this.auraFlash = 1;
      return true;
    }
    return false;
  }

  /** Collect all items within range of current position */
  _collectNearby(rangeSq, items, onCollect) {
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      if (item.collected) continue;
      const ix = item.x - this.x;
      const iy = item.y - this.y;
      if (ix * ix + iy * iy < rangeSq) {
        onCollect(item, i);
      }
    }
  }

  /** Handle dash and swoop special movement */
  _updateSpecialMovement(dt, items, onCollect) {
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
        this._collectNearby(1600, items, onCollect); // 40²
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
        this._collectNearby(2500, items, onCollect); // 50²
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
    if (this.seekTimer > 0 && this.seekingItem && !this.seekingItem.collected) return;
    this.seekTimer = 0.5 + Math.random() * 0.5;

    let bestItem = null;
    let bestScore = -Infinity;

    for (const item of items) {
      if (item.collected || item.hidden) continue;
      if (item.sky && this.ability !== 'swoop') continue;

      const odx = item.x - this.owner.x;
      const ody = item.y - this.owner.y;
      if (odx * odx + ody * ody > 78400) continue; // 280²

      const sdx = item.x - this.x;
      const sdy = item.y - this.y;
      const distFromSelfSq = sdx * sdx + sdy * sdy;

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

  // ==================== DRAWING ====================

  draw(ctx, spriteCache) {
    const bobY = Math.sin(this.bobPhase) * 2;
    const flyY = this.ability === 'swoop' ? -20 + Math.sin(this.bobPhase * 0.7) * 5 : 0;

    // === Ability-specific visual effects ===

    // Detect: sniffing head bob + bark pulse
    if (this.ability === 'detect') {
      const sniffBob = Math.sin(this.sniffPhase) * 1.5;
      // Bark pulse ring
      if (this.barkPulse > 0) {
        ctx.save();
        ctx.globalAlpha = this.barkPulseAlpha;
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y + bobY, this.barkPulse, 0, Math.PI * 2);
        ctx.stroke();
        // Inner pulse
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
      // Draw trail
      for (const t of this.dashTrail) {
        ctx.save();
        ctx.globalAlpha = 0.4 * (1 - t.age / 0.3);
        spriteCache.draw(ctx, `${this.type}-idle`, t.x, t.y + bobY, 0.8, !this.facingRight);
        ctx.restore();
      }
      // Dash visual: stretch sprite slightly when dashing
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
        // Motion lines behind the swoop
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
        // Draw sprite with swoop tilt
        ctx.save();
        ctx.translate(this.x, this.y);
        const tilt = this.swoopProgress < 0.5 ? -0.3 : 0.3; // nose up then down
        ctx.rotate(tilt * (this.facingRight ? 1 : -1));
        spriteCache.draw(ctx, `${this.type}-idle`, 0, 0, 1.1, !this.facingRight);
        ctx.restore();
      } else {
        spriteCache.draw(ctx, `${this.type}-idle`, this.x, this.y + bobY + flyY, 1, !this.facingRight);
      }
    }

    // Lucky: sparkle aura
    else if (this.ability === 'lucky') {
      // Sparkle ring
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

      // Floating sparkles
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

      // Aura flash when upgrading
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

    // Default draw (shouldn't reach here normally)
    else {
      spriteCache.draw(ctx, `${this.type}-idle`, this.x, this.y + bobY + flyY, 1, !this.facingRight);
    }

    // Name label above companion
    ctx.save();
    ctx.font = 'Bold 11px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    const labelY = this.y + bobY + flyY - 22;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillText(this.name, this.x + 1, labelY + 1);
    ctx.fillStyle = '#FFF';
    ctx.fillText(this.name, this.x, labelY);
    ctx.restore();
  }
}
