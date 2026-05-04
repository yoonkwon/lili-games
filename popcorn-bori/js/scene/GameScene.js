/**
 * Main gameplay - 보리랑 팝콘 만들기
 *
 * Step-by-step popcorn making:
 *   STEP 1 (EMPTY) — tap CORN button → kernels drop into kettle
 *   STEP 2 (CORN)  — tap a flavor button → kettle gets tinted
 *   STEP 3 (FLAVORED) — tap GO button → machine cooks, popcorn pops out colored
 *   COOKING — animation; popcorn flies out into Bori's bowl
 *   DONE — auto-resets to EMPTY for next batch
 *
 * Bori sometimes asks for a specific color (bonus points).
 */
import { CORN, FLAVORS, STEPS, GAME, RAINBOW } from '../config.js';
import { ParticleSystem } from '../../../shared/ParticleSystem.js';
import { Message } from '../../../shared/ui/Message.js';
import { drawBori } from '../draw-bori.js';
import { drawMachine, drawGoButton, drawPopcorn, drawBowl } from '../draw-machine.js';

export class GameScene {
  constructor(w, h, safeTop) {
    this.w = w;
    this.h = h;
    this.safeTop = safeTop || 0;

    this.step = STEPS.EMPTY;
    this.cookingTimer = 0;
    this.popcornsMade = 0;          // total popcorns this session
    this.batchesMade = 0;
    this.currentFlavor = null;       // selected flavor object
    this.shake = 0;
    this.phase = 0;
    this.cornAnim = 0;               // 0..1 falling kernel animation
    this.batchSpawned = false;

    // Bori state
    this.boriPhase = 0;
    this.boriMouthOpen = false;
    this.boriHappy = false;
    this.boriEatTimer = 0;
    this.wantedFlavor = null;       // bori wants a specific color
    this.wantTimer = 0;

    // Popcorns flying out + filling bowl
    this.flyingPopcorns = [];        // {x, y, vx, vy, size, color, core, rot, rotSpeed, landed, landY}
    this.bowlPopcorns = [];          // popcorns that landed in bowl

    // Effects
    this.particles = new ParticleSystem();
    this.message = new Message();

    // Layout cache (computed in update)
    this._layout = null;
    this._computeLayout();

    this.message.show('🌽 옥수수를 먼저 넣어요!', 2.5);
    this._pickWant();
  }

  _computeLayout() {
    const w = this.w;
    const h = this.h;

    // Top stat bar
    const topBarH = 50;

    // Bori on left side
    const boriX = w * 0.22;
    const boriY = h * 0.36;
    const boriScale = Math.min(0.85, w / 600);

    // Machine on right side
    const machineW = Math.min(220, w * 0.5);
    const machineH = machineW * 1.3;
    const machineX = w * 0.68;
    const machineY = h * 0.36;

    // Bowl below Bori
    const bowlW = Math.min(150, w * 0.34);
    const bowlH = bowlW * 0.7;
    const bowlX = boriX;
    const bowlY = boriY + 120 * boriScale + bowlH * 0.5;

    // GO button on side of machine
    const goR = Math.min(38, w * 0.09);
    const goX = machineX - machineW / 2 - goR - 6;
    const goY = machineY + machineH * 0.05;

    // Ingredient buttons at bottom
    const buttonRowY = h * 0.82;
    const buttonRowH = h * 0.16;
    const totalIngredients = 1 + FLAVORS.length;
    const buttonGap = 8;
    const buttonSize = Math.min(58, (w - 40 - buttonGap * (totalIngredients - 1)) / totalIngredients);
    const totalRowW = buttonSize * totalIngredients + buttonGap * (totalIngredients - 1);
    const buttonStartX = (w - totalRowW) / 2 + buttonSize / 2;

    this._layout = {
      topBarH, boriX, boriY, boriScale,
      machineX, machineY, machineW, machineH,
      bowlX, bowlY, bowlW, bowlH,
      goX, goY, goR,
      buttonRowY, buttonSize, buttonStartX, buttonGap, buttonRowH,
    };
  }

  _pickWant() {
    if (Math.random() < GAME.wantBonusChance) {
      this.wantedFlavor = FLAVORS[Math.floor(Math.random() * FLAVORS.length)];
      this.wantTimer = 12;
    } else {
      this.wantedFlavor = null;
    }
  }

  handleTap(x, y) {
    const L = this._layout;

    // Tap on machine GO button
    const dxg = x - L.goX;
    const dyg = y - L.goY;
    if (dxg * dxg + dyg * dyg <= (L.goR + 8) * (L.goR + 8)) {
      this._tapGo();
      return;
    }

    // Tap on machine body itself also triggers GO when ready
    if (this.step === STEPS.FLAVORED) {
      const mx0 = L.machineX - L.machineW / 2;
      const mx1 = L.machineX + L.machineW / 2;
      const my0 = L.machineY - L.machineH / 2;
      const my1 = L.machineY + L.machineH / 2;
      if (x >= mx0 && x <= mx1 && y >= my0 && y <= my1) {
        this._tapGo();
        return;
      }
    }

    // Tap ingredient buttons (corn first, then flavors)
    const total = 1 + FLAVORS.length;
    for (let i = 0; i < total; i++) {
      const cx = L.buttonStartX + i * (L.buttonSize + L.buttonGap);
      const cy = L.buttonRowY + L.buttonSize / 2;
      const dx = x - cx;
      const dy = y - cy;
      const r = L.buttonSize / 2 + 6;
      if (dx * dx + dy * dy <= r * r) {
        if (i === 0) {
          this._tapCorn();
        } else {
          this._tapFlavor(FLAVORS[i - 1]);
        }
        return;
      }
    }
  }

  _tapCorn() {
    if (this.step !== STEPS.EMPTY) {
      if (this.step === STEPS.CORN) {
        this.message.show('🌽 이미 옥수수 들어있어요! 맛을 골라요', 1.6);
      } else if (this.step === STEPS.COOKING) {
        this.message.show('⏳ 잠깐만! 팝콘 튀는 중!', 1.5);
      } else {
        this.message.show('잠깐, 다음 단계예요!', 1.5);
      }
      return;
    }
    this.step = STEPS.CORN;
    this.cornAnim = 0;
    const L = this._layout;
    this.particles.addFloatingText(L.machineX, L.machineY, '🌽 옥수수!', '#FFE066', 22);
    this.message.show('🎨 이제 맛을 골라요!', 2);
  }

  _tapFlavor(flavor) {
    if (this.step === STEPS.EMPTY) {
      this.message.show('🌽 옥수수를 먼저 넣어요!', 1.6);
      return;
    }
    if (this.step === STEPS.COOKING) {
      this.message.show('⏳ 잠깐만! 팝콘 튀는 중!', 1.5);
      return;
    }
    this.currentFlavor = flavor;
    this.step = STEPS.FLAVORED;
    const L = this._layout;
    this.particles.addFloatingText(L.machineX, L.machineY - 20, `${flavor.emoji} ${flavor.name}`, flavor.color, 22);
    this.message.show('🔘 빨간 버튼을 눌러요!', 2);
  }

  _tapGo() {
    if (this.step === STEPS.EMPTY) {
      this.message.show('🌽 옥수수를 먼저 넣어요!', 1.6);
      return;
    }
    if (this.step === STEPS.CORN) {
      this.message.show('🎨 맛을 골라요!', 1.6);
      return;
    }
    if (this.step !== STEPS.FLAVORED) return;

    // Start cooking
    this.step = STEPS.COOKING;
    this.cookingTimer = GAME.cookingDuration;
    this.shake = 0;
    this.batchSpawned = false;
    this.message.show('🍿 펑펑! 팝콘 만드는 중!', 1.8);
  }

  _spawnPopcornBatch() {
    const L = this._layout;
    const flavor = this.currentFlavor;
    if (!flavor) return;

    const count = GAME.popcornsPerBatch;
    const gravity = 600;

    for (let i = 0; i < count; i++) {
      const spawnX = L.machineX + (Math.random() - 0.5) * L.machineW * 0.3;
      const spawnY = L.machineY - L.machineH * 0.05;
      const targetX = L.bowlX + (Math.random() - 0.5) * L.bowlW * 0.7;
      const targetY = L.bowlY - L.bowlH * 0.4 - Math.random() * L.bowlH * 0.3;

      // Parabolic trajectory: pick a flight time, then derive vx/vy.
      const T = 1.0 + Math.random() * 0.4; // 1.0..1.4 sec
      const vx = (targetX - spawnX) / T;
      const vy = (targetY - spawnY - 0.5 * gravity * T * T) / T;

      this.flyingPopcorns.push({
        x: spawnX,
        y: spawnY,
        vx: vx + (Math.random() - 0.5) * 30,
        vy: vy + (Math.random() - 0.5) * 30,
        size: 14 + Math.random() * 6,
        color: flavor.popColor,
        core: flavor.popCore,
        flavorId: flavor.id,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 8,
        landed: false,
        targetX,
        targetY,
        delay: i * 0.08,
      });
    }
  }

  update(dt, w, h) {
    const wChanged = w !== this.w || h !== this.h;
    this.w = w;
    this.h = h;
    if (wChanged) this._computeLayout();
    this.phase += dt;
    this.boriPhase += dt;

    // Bori "want" timer
    if (this.wantedFlavor) {
      this.wantTimer -= dt;
      if (this.wantTimer <= 0) this._pickWant();
    } else if (Math.random() < dt * 0.15) {
      this._pickWant();
    }

    // Corn drop animation
    if (this.step === STEPS.CORN || this.step === STEPS.FLAVORED || this.step === STEPS.COOKING) {
      this.cornAnim = Math.min(1, this.cornAnim + dt * 2);
    } else {
      this.cornAnim = 0;
    }

    // Cooking phase
    if (this.step === STEPS.COOKING) {
      this.cookingTimer -= dt;
      this.shake += dt;

      // Spawn popcorns mid-way through cooking
      if (!this.batchSpawned && this.cookingTimer < GAME.cookingDuration * 0.6) {
        this._spawnPopcornBatch();
        this.batchSpawned = true;
      }

      if (this.cookingTimer <= 0) {
        this._finishBatch();
      }
    }

    // Update flying popcorns
    for (const p of this.flyingPopcorns) {
      if (p.delay > 0) {
        p.delay -= dt;
        continue;
      }
      if (p.landed) continue;
      p.rot += p.rotSpeed * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 600 * dt; // gravity

      // Check if popcorn is near bowl target — snap to it
      const dx = p.x - p.targetX;
      const dy = p.y - p.targetY;
      if (p.vy > 0 && Math.abs(dx) < 30 && p.y >= p.targetY - 5) {
        p.landed = true;
        p.x = p.targetX;
        p.y = p.targetY;
        this.bowlPopcorns.push({
          x: p.x, y: p.y, size: p.size, color: p.color, core: p.core, rot: p.rot
        });
        this.popcornsMade++;
        this._onPopcornLanded(p);
      }

      // Off-screen safety: also count as landed at bowl
      if (p.y > this.h) {
        p.landed = true;
        this.bowlPopcorns.push({
          x: p.targetX, y: p.targetY, size: p.size, color: p.color, core: p.core, rot: p.rot
        });
        this.popcornsMade++;
        this._onPopcornLanded(p);
      }
    }
    // Cleanup landed
    this.flyingPopcorns = this.flyingPopcorns.filter(p => !p.landed);

    // Cap bowl render count
    if (this.bowlPopcorns.length > GAME.bowlCapacity * 2) {
      this.bowlPopcorns.splice(0, this.bowlPopcorns.length - GAME.bowlCapacity * 2);
    }

    // Bori eats popcorns over time when bowl has some
    this.boriEatTimer -= dt;
    if (this.bowlPopcorns.length >= 4 && this.boriEatTimer <= 0) {
      this._boriEat();
      this.boriEatTimer = 0.6 + Math.random() * 0.4;
    }
    this.boriHappy = this.bowlPopcorns.length > 0;
    // Mouth flap during eating
    if (this.boriEatTimer > 0.3) {
      this.boriMouthOpen = Math.sin(this.phase * 14) > 0;
    } else {
      this.boriMouthOpen = false;
    }

    this.particles.update(dt);
    this.message.update(dt);

    // Win condition
    if (this.popcornsMade >= GAME.goalPopcorns && this.step !== STEPS.COOKING) {
      return 'celebrate';
    }
    return null;
  }

  _onPopcornLanded(p) {
    // Bonus points if matches Bori's want
    if (this.wantedFlavor && this.currentFlavor && this.wantedFlavor.id === this.currentFlavor.id) {
      // We give a tiny visual bonus for the first few, not every popcorn
      if (Math.random() < 0.3) {
        this.particles.addFloatingText(p.x, p.y - 20, '+보너스!', '#FFD93D', 18);
      }
    }
    this.particles.createParticles(p.x, p.y, p.color === 'rainbow' ? '#FF66CC' : p.color, 4);
  }

  _boriEat() {
    // Eat one popcorn (remove from bowl visually)
    const idx = Math.floor(Math.random() * this.bowlPopcorns.length);
    const removed = this.bowlPopcorns.splice(idx, 1)[0];
    if (!removed) return;
    const L = this._layout;
    this.particles.addFloatingText(L.boriX, L.boriY - 20, '냠냠!', '#FFD93D', 22);
    this.boriEatTimer = 0.5;
  }

  _finishBatch() {
    this.batchesMade++;

    // Check if matched bori's want
    let bonusMsg = null;
    if (this.wantedFlavor && this.currentFlavor && this.wantedFlavor.id === this.currentFlavor.id) {
      bonusMsg = `${this.wantedFlavor.emoji} 보리가 좋아하는 ${this.wantedFlavor.label}!`;
      this._pickWant();
    }

    // Reset for next batch
    this.step = STEPS.EMPTY;
    this.currentFlavor = null;
    this.cookingTimer = 0;
    this.shake = 0;

    if (bonusMsg) {
      this.message.show(bonusMsg, 2.4);
    } else {
      this.message.show('완성! 또 만들어볼까요?', 1.8);
    }
  }

  draw(ctx, w, h) {
    if (w !== this.w || h !== this.h) {
      this.w = w; this.h = h;
      this._computeLayout();
    }
    this._drawBackground(ctx, w, h);
    this._drawBori(ctx);
    this._drawBowl(ctx);
    this._drawMachine(ctx);
    this._drawGo(ctx);
    this._drawWantBubble(ctx);
    this._drawIngredientButtons(ctx);
    this._drawStepIndicator(ctx, w, h);
    this._drawProgressBar(ctx, w, h);
    this._drawFlyingPopcorns(ctx);

    this.particles.draw(ctx);
    this.message.draw(ctx, w, h);
  }

  _drawBackground(ctx, w, h) {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#3a1f0a');
    g.addColorStop(0.4, '#7a3a14');
    g.addColorStop(0.85, '#C9582E');
    g.addColorStop(1, '#FFB347');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Floor / counter — wooden plank look
    const floorY = h * 0.62;
    ctx.fillStyle = '#5C2E0E';
    ctx.fillRect(0, floorY, w, h - floorY);
    ctx.fillStyle = '#7A3A14';
    for (let i = 0; i < 10; i++) {
      ctx.fillRect(0, floorY + i * 14, w, 2);
    }
    ctx.fillStyle = '#FFD93D';
    ctx.fillRect(0, floorY - 3, w, 4);

    // Polka dots in upper area
    ctx.save();
    ctx.globalAlpha = 0.07;
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 20; i++) {
      const dx = (i * 73) % w;
      const dy = (i * 47) % (h * 0.6);
      ctx.beginPath();
      ctx.arc(dx, dy, 6 + (i % 3) * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  _drawBori(ctx) {
    const L = this._layout;
    const bob = Math.sin(this.boriPhase * 1.5) * 3;
    drawBori(ctx, L.boriX, L.boriY + bob, L.boriScale, {
      mouthOpen: this.boriMouthOpen,
      happy: this.boriHappy,
      phase: this.boriPhase,
    });

    // Name label
    ctx.save();
    ctx.font = 'Bold 14px "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFEFC2';
    ctx.fillText('🐕 보리', L.boriX, L.boriY + 75 * L.boriScale);
    ctx.restore();
  }

  _drawBowl(ctx) {
    const L = this._layout;
    drawBowl(ctx, L.bowlX, L.bowlY, L.bowlW, L.bowlH, this.bowlPopcorns.length / GAME.bowlCapacity);

    // Draw popcorns piled in bowl. Use bowl coordinates as origin.
    // The popcorns positions are already canvas-absolute.
    for (const p of this.bowlPopcorns) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      drawPopcorn(ctx, 0, 0, p.size, p.color, p.core);
      ctx.restore();
    }
  }

  _drawMachine(ctx) {
    const L = this._layout;
    let cornCount = 0;
    if (this.step >= STEPS.CORN) cornCount = this.cornAnim;
    if (this.step === STEPS.COOKING) cornCount = 1 - (1 - this.cookingTimer / GAME.cookingDuration) * 0.5;

    drawMachine(ctx, L.machineX, L.machineY, L.machineW, L.machineH, {
      cornCount,
      flavorColor: this.currentFlavor ? (this.currentFlavor.popColor === 'rainbow' ? 'rainbow' : this.currentFlavor.color) : null,
      cooking: this.step === STEPS.COOKING,
      shake: this.shake,
    });

    // Falling kernels animation when corn was just added
    if (this.step === STEPS.CORN && this.cornAnim < 1) {
      const t = this.cornAnim;
      for (let i = 0; i < 5; i++) {
        const fx = L.machineX + (i - 2) * 8;
        const fy = (L.machineY - L.machineH * 0.45) + t * L.machineH * 0.45 + Math.sin(t * 8 + i) * 4;
        ctx.fillStyle = '#FFE066';
        ctx.beginPath();
        ctx.arc(fx, fy, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#C49A3C';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  _drawGo(ctx) {
    const L = this._layout;
    const active = this.step === STEPS.FLAVORED;
    drawGoButton(ctx, L.goX, L.goY, L.goR, {
      active,
      pulse: this.phase,
      label: 'GO',
    });
  }

  _drawWantBubble(ctx) {
    if (!this.wantedFlavor) return;
    const L = this._layout;
    const cx = L.boriX + 50 * L.boriScale;
    const cy = L.boriY - 70 * L.boriScale;
    const r = 38;

    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#7A3A14';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Tail
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.4, cy + r * 0.7);
    ctx.lineTo(cx - r * 0.8, cy + r * 1.2);
    ctx.lineTo(cx - r * 0.1, cy + r * 0.85);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fill();
    ctx.stroke();

    // Pulsing emoji of wanted flavor
    const pulse = 1 + Math.sin(this.phase * 3) * 0.08;
    ctx.translate(cx, cy);
    ctx.scale(pulse, pulse);
    ctx.font = '34px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.wantedFlavor.emoji, 0, -2);
    ctx.restore();

    // Label below bubble
    ctx.save();
    ctx.font = 'Bold 11px "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFEFC2';
    ctx.fillText('이거 줘!', cx, cy + r + 12);
    ctx.restore();
  }

  _drawIngredientButtons(ctx) {
    const L = this._layout;
    const total = 1 + FLAVORS.length;

    // Background tray
    ctx.save();
    const trayY = L.buttonRowY - 6;
    const trayH = L.buttonSize + 12;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.roundRect(8, trayY, this.w - 16, trayH, 14);
    ctx.fill();
    ctx.restore();

    for (let i = 0; i < total; i++) {
      const cx = L.buttonStartX + i * (L.buttonSize + L.buttonGap);
      const cy = L.buttonRowY + L.buttonSize / 2;
      const r = L.buttonSize / 2;

      const isCorn = i === 0;
      const flavor = isCorn ? CORN : FLAVORS[i - 1];

      // Highlight which step is active
      let highlight = false;
      if (isCorn && this.step === STEPS.EMPTY) highlight = true;
      if (!isCorn && this.step === STEPS.CORN) highlight = true;
      // Show selected flavor as picked
      const isSelected = !isCorn && this.currentFlavor && this.currentFlavor.id === flavor.id;
      // Show wanted flavor with extra glow
      const isWanted = !isCorn && this.wantedFlavor && this.wantedFlavor.id === flavor.id;

      ctx.save();

      // Pulse if highlighted
      const pulse = highlight ? 1 + Math.sin(this.phase * 6) * 0.07 : 1;
      ctx.translate(cx, cy);
      ctx.scale(pulse, pulse);
      ctx.translate(-cx, -cy);

      // Glow ring for highlighted/selected/wanted
      if (highlight) {
        ctx.shadowColor = '#FFD93D';
        ctx.shadowBlur = 18;
      } else if (isSelected) {
        ctx.shadowColor = flavor.color;
        ctx.shadowBlur = 12;
      } else if (isWanted) {
        ctx.shadowColor = '#FFD93D';
        ctx.shadowBlur = 10;
      }

      // Button face
      const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.2, cx, cy, r);
      grad.addColorStop(0, '#FFFFFF');
      grad.addColorStop(1, isSelected ? flavor.color : '#FFEFC2');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Border
      ctx.strokeStyle = highlight ? '#FFD93D' : (isSelected ? flavor.color : '#7A3A14');
      ctx.lineWidth = highlight ? 3 : 2;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Emoji
      ctx.font = `${Math.floor(r * 1.05)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(flavor.emoji, cx, cy + 1);

      // Wanted star indicator
      if (isWanted) {
        ctx.font = '14px sans-serif';
        ctx.fillText('⭐', cx + r * 0.7, cy - r * 0.7);
      }

      ctx.restore();

      // Label below
      ctx.save();
      ctx.font = `${Math.max(9, Math.floor(r * 0.32))}px "Apple SD Gothic Neo", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFEFC2';
      ctx.fillText(flavor.name, cx, cy + r + 11);
      ctx.restore();
    }
  }

  _drawStepIndicator(ctx, w, h) {
    // Three dots showing which step you're on
    const labels = ['1.옥수수', '2.맛', '3.기계 GO!'];
    const activeIdx = this.step === STEPS.EMPTY ? 0
                    : this.step === STEPS.CORN ? 1
                    : 2;

    const y = this.safeTop + 12 + 28;
    const cx = w / 2;
    const dotR = 6;
    const gap = 70;

    ctx.save();
    for (let i = 0; i < 3; i++) {
      const dx = cx + (i - 1) * gap;
      const isActive = i <= activeIdx && this.step !== STEPS.COOKING;
      const isCurrent = i === activeIdx && this.step !== STEPS.COOKING;

      // Connector line
      if (i > 0) {
        ctx.strokeStyle = (i <= activeIdx) ? '#FFD93D' : 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(dx - gap + dotR, y);
        ctx.lineTo(dx - dotR, y);
        ctx.stroke();
      }

      ctx.fillStyle = isActive ? '#FFD93D' : 'rgba(255,255,255,0.4)';
      if (isCurrent) {
        ctx.shadowColor = '#FFD93D';
        ctx.shadowBlur = 12;
      }
      ctx.beginPath();
      ctx.arc(dx, y, dotR + (isCurrent ? 2 : 0), 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.font = `${isCurrent ? 'Bold ' : ''}11px "Apple SD Gothic Neo", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = isCurrent ? '#FFFFFF' : 'rgba(255,239,194,0.7)';
      ctx.fillText(labels[i], dx, y + 18);
    }
    ctx.restore();
  }

  _drawProgressBar(ctx, w, h) {
    const barX = 16;
    const barY = this.safeTop + 14;
    const barW = w - 32;
    const barH = 18;
    const ratio = Math.min(1, this.popcornsMade / GAME.goalPopcorns);

    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 9);
    ctx.fill();

    if (ratio > 0) {
      const grad = ctx.createLinearGradient(barX, 0, barX + barW * ratio, 0);
      grad.addColorStop(0, '#FFD93D');
      grad.addColorStop(1, '#FF8C00');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW * ratio, barH, 9);
      ctx.fill();
    }

    ctx.font = 'Bold 12px "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFF';
    ctx.fillText(`🍿 ${this.popcornsMade} / ${GAME.goalPopcorns}`, w / 2, barY + barH / 2);
    ctx.restore();
  }

  _drawFlyingPopcorns(ctx) {
    for (const p of this.flyingPopcorns) {
      if (p.delay > 0) continue;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      drawPopcorn(ctx, 0, 0, p.size, p.color, p.core);
      ctx.restore();
    }
  }

  // ── Save/celebrate API ──
  getStats() {
    // Count by flavor
    const byFlavor = {};
    for (const p of this.bowlPopcorns) {
      byFlavor[p.color] = (byFlavor[p.color] || 0) + 1;
    }
    return {
      popcornsMade: this.popcornsMade,
      batchesMade: this.batchesMade,
    };
  }

  reset() {
    this.popcornsMade = 0;
    this.batchesMade = 0;
    this.bowlPopcorns = [];
    this.flyingPopcorns = [];
    this.step = STEPS.EMPTY;
    this.currentFlavor = null;
    this._pickWant();
  }
}
