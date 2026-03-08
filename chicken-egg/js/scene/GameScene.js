// Main gameplay scene
import { Chicken } from '../entity/Chicken.js';
import { Basket } from '../entity/Basket.js';
import { Egg } from '../entity/Egg.js';
import { Chick } from '../entity/Chick.js';
import { Predator, PREDATOR_TYPES } from '../entity/Predator.js';
import { Gauge } from '../ui/Gauge.js';
import { HUD } from '../ui/HUD.js';
import { Message } from '../ui/Message.js';
import { ParticleSystem } from '../particles.js';
import { audio as Audio } from '../AudioManager.js';

const TARGET_EGGS = 100;
const TAPS_PER_EGG = 5;
const GOLDEN_EGG_VALUE = 3;
const EGGS_PER_STAGE = 20;

// Stage definitions with themes
const STAGES = [
    { name: '봄 농장', emoji: '🌸', skyTop: '#87CEEB', skyMid: '#B0E0FF', skyBot: '#E0F0FF', groundTop: '#7EC850', groundBot: '#4A8B2C' },
    { name: '여름 들판', emoji: '☀️', skyTop: '#4FC3F7', skyMid: '#81D4FA', skyBot: '#B3E5FC', groundTop: '#66BB6A', groundBot: '#388E3C' },
    { name: '가을 숲', emoji: '🍂', skyTop: '#FFB74D', skyMid: '#FFCC80', skyBot: '#FFE0B2', groundTop: '#A1887F', groundBot: '#6D4C41' },
    { name: '겨울 눈밭', emoji: '❄️', skyTop: '#90CAF9', skyMid: '#BBDEFB', skyBot: '#E3F2FD', groundTop: '#E0E0E0', groundBot: '#BDBDBD' },
    { name: '무지개 마을', emoji: '🌈', skyTop: '#CE93D8', skyMid: '#F48FB1', skyBot: '#FFCC80', groundTop: '#A5D6A7', groundBot: '#66BB6A' },
];

export class GameScene {
    constructor(canvasWidth, canvasHeight, safeTop = 0) {
        const groundY = canvasHeight * 0.65;

        this.chicken = new Chicken(canvasWidth * 0.35, groundY - 30);
        this.basket = new Basket(canvasWidth - 120, groundY + 20);
        this.gauge = new Gauge(TAPS_PER_EGG);
        this.hud = new HUD();
        this.message = new Message();
        this.particles = new ParticleSystem();

        this.eggs = [];
        this.chicks = [];
        this.predators = [];

        this.basketEggs = 0;
        this.totalEggs = 0;
        this.goldenEggs = 0;

        this.predatorTimer = 0;
        this.unlockedHats = [0];
        this.groundY = groundY;
        this.canvasWidth = canvasWidth;
        this.safeTop = safeTop;

        // Combo system
        this.comboCount = 0;
        this.comboTimer = 0;
        this.comboMaxInterval = 0.6; // seconds between taps for combo

        // Stage system
        this.currentStage = 0;
        this._lastStage = 0;
        this._stageTransition = 0; // 0 = none, >0 = transitioning

        // Screen shake
        this.shakeAmount = 0;
        this.shakeTimer = 0;

        // Predators scared count (for stats)
        this.predatorsScared = 0;

        // Load saved progress
        this._loadProgress();
    }

    _loadProgress() {
        try {
            const saved = localStorage.getItem('chickenEgg_progress');
            if (saved) {
                const data = JSON.parse(saved);
                this.basketEggs = data.basketEggs || 0;
                this.totalEggs = data.totalEggs || 0;
                this.goldenEggs = data.goldenEggs || 0;
                this.unlockedHats = data.unlockedHats || [0];
                if (this.unlockedHats.length > 1) {
                    this.chicken.currentHat = this.unlockedHats[this.unlockedHats.length - 1];
                }
                localStorage.removeItem('chickenEgg_progress');
            }
        } catch (e) { /* ignore */ }
    }

    _saveProgress() {
        try {
            localStorage.setItem('chickenEgg_progress', JSON.stringify({
                basketEggs: this.basketEggs,
                totalEggs: this.totalEggs,
                goldenEggs: this.goldenEggs,
                unlockedHats: this.unlockedHats,
            }));
        } catch (e) { /* ignore */ }
    }

    update(dt, canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.groundY = canvasHeight * 0.65;

        // Reposition entities on resize
        this.chicken.x = canvasWidth * 0.35;
        this.chicken.baseY = this.groundY - 30;
        this.basket.x = canvasWidth - 120;
        this.basket.y = this.groundY + 20;

        // Update entities
        this.chicken.update(dt);
        this.basket.update(dt);
        this.gauge.update(dt);
        this.hud.update(dt);
        this.message.update(dt);
        this.particles.update(dt);

        // Combo decay
        if (this.comboTimer > 0) {
            this.comboTimer -= dt;
            if (this.comboTimer <= 0) {
                this.comboCount = 0;
            }
        }

        // Screen shake decay
        if (this.shakeTimer > 0) {
            this.shakeTimer -= dt;
            if (this.shakeTimer <= 0) this.shakeAmount = 0;
        }

        // Stage transition
        if (this._stageTransition > 0) {
            this._stageTransition = Math.max(0, this._stageTransition - dt * 2);
        }

        // Stage calculation
        this.currentStage = Math.min(4, Math.floor(this.basketEggs / EGGS_PER_STAGE));

        // Update flying eggs
        for (let i = this.eggs.length - 1; i >= 0; i--) {
            const egg = this.eggs[i];
            const arrived = egg.update(dt);
            if (arrived) {
                const bonus = this._getEggValueBonus();
                const baseValue = egg.golden ? GOLDEN_EGG_VALUE : 1;
                const value = baseValue + bonus;
                const prevEggs = this.basketEggs;
                this.basketEggs += value;
                this.particles.createParticles(
                    egg.targetX, egg.targetY,
                    egg.golden ? '#FFD700' : '#FFF', 8
                );
                const bonusText = bonus > 0 ? ` (+${bonus}👑)` : '';
                this.particles.addFloatingText(
                    egg.targetX, egg.targetY - 30,
                    egg.golden ? `+${value} ⭐${bonusText}` : `+${value}${bonusText}`,
                    egg.golden ? '#FFD700' : '#FFF'
                );
                this.basket.bounce = 1;
                Audio.play('collect');
                this.eggs.splice(i, 1);

                // Stage clear check
                const prevStage = Math.min(4, Math.floor(prevEggs / EGGS_PER_STAGE));
                const newStage = Math.min(4, Math.floor(this.basketEggs / EGGS_PER_STAGE));
                if (newStage > prevStage && this.basketEggs < TARGET_EGGS) {
                    const stageInfo = STAGES[newStage];
                    this.message.show(`${stageInfo.emoji} ${stageInfo.name}으로 이동! (${newStage + 1}/5)`);
                    Audio.play('fanfare');
                    this._stageTransition = 1;
                    this._triggerShake(6, 0.5);
                    // Chicks celebrate
                    for (const chick of this.chicks) {
                        chick.celebrate();
                    }
                }
                // Milestone cheer every 10 eggs (not on stage boundaries)
                else if (this.basketEggs % 10 === 0 && this.basketEggs > 0) {
                    Audio.play('cheer');
                    this.message.show(`🎉 ${this.basketEggs}개 달성!`);
                    this._triggerShake(3, 0.3);
                }
            }
        }

        // Update chicks + auto-defense
        for (const chick of this.chicks) {
            chick.updateBounds(canvasWidth);
            // Apply flower hat bonus: halve defend cooldown
            if (this.unlockedHats.includes(3) && chick.defendCooldown > 0) {
                chick.defendCooldown -= dt; // double speed decay (normal + this extra)
            }
            const event = chick.update(dt);
            if (event === 'peep') {
                Audio.play('peep');
            } else if (event && event.type === 'defend') {
                // Chick reached a predator - scare it!
                const pred = event.predator;
                if (pred.active && pred.phase <= 1) {
                    const scareResult = pred.scare();
                    if (scareResult === 'scared') {
                        this.predatorsScared++;
                        this.message.show(`🐣 병아리가 ${pred.info.name}을 쫓아냈어! 💪`);
                        Audio.play('cheer');
                        Audio.play('scared');
                        this.particles.createParticles(pred.x, pred.y, '#FFD700', 10);
                        this.particles.addFloatingText(pred.x, pred.y - 50, '병아리 방어!', '#4CAF50');
                        this._triggerShake(3, 0.2);
                    } else if (scareResult === 'hit') {
                        // Chick weakened the predator
                        this.particles.createParticles(pred.x, pred.y, '#FFFFFF', 5);
                        this.particles.addFloatingText(pred.x, pred.y - 40, '찍!', '#FFD700');
                    }
                }
            }
        }

        // Chick auto-defense assignment
        this._assignChickDefenders();

        // Predator spawning
        this.predatorTimer += dt;
        const spawnInterval = Math.max(5, 12 - this.basketEggs * 0.08);
        if (this.predatorTimer > spawnInterval && this.basketEggs > 5) {
            this.predatorTimer = 0;
            // Bias toward harder predators in later stages
            let type;
            if (this.currentStage >= 3 && Math.random() < 0.4) {
                type = 2; // raccoon more common in later stages
            } else {
                type = Math.floor(Math.random() * 3);
            }
            const pred = new Predator(type, this.groundY + 25, canvasWidth, this.basket.x);
            pred.setStealAmount(this.basketEggs);
            this.predators.push(pred);
        }

        // Update predators
        for (let i = this.predators.length - 1; i >= 0; i--) {
            const pred = this.predators[i];
            const event = pred.update(dt);

            if (event === 'warning') {
                const tapHint = pred.info.tapsToScare > 1 ? ` (${pred.info.tapsToScare}번 터치!)` : '';
                this.message.show(`${pred.info.emoji} ${pred.info.name}다! 터치해서 쫓아내!${tapHint}`);
                Audio.play('warning');
            } else if (event === 'steal') {
                const stolen = Math.min(pred.stealAmount, this.basketEggs);
                if (stolen > 0) {
                    this.basketEggs -= stolen;
                    this.message.show(`${pred.info.emoji} ${pred.info.stealMsg} (-${stolen})`);
                    Audio.play('steal');
                    this._triggerShake(4, 0.3);
                    this.particles.createParticles(this.basket.x, this.basket.y, '#FF6B6B', 8);
                    this.particles.addFloatingText(
                        this.basket.x, this.basket.y - 40,
                        `-${stolen}`, '#FF4444'
                    );
                }
            }

            if (!pred.active) this.predators.splice(i, 1);
        }

        // Milestone chicks (every 20 eggs = every stage)
        const chickMilestone = Math.floor(this.basketEggs / 20);
        while (this.chicks.length < chickMilestone && this.chicks.length < 5) {
            const colors = ['#FFE44D', '#FFD700', '#FFC125', '#FFAA00', '#FFB347', '#FF8C69', '#DDA0DD', '#98FB98'];
            const chick = new Chick(
                canvasWidth * 0.2 + Math.random() * canvasWidth * 0.5,
                this.groundY + 20,
                colors[Math.floor(Math.random() * colors.length)],
                canvasWidth
            );
            // Assign random accessory
            chick.accessory = Math.floor(Math.random() * 4); // 0:none, 1:bow, 2:glasses, 3:hat
            this.chicks.push(chick);
            const count = this.chicks.length;
            // Show defense unlock info
            let abilityMsg = '';
            if (count === 1) abilityMsg = ' 🛡️ 여우 방어!';
            else if (count === 3) abilityMsg = ' 🛡️ 족제비도 방어!';
            else if (count === 5) abilityMsg = ' 🛡️ 모두 방어!';
            this.message.show(`🐣 병아리 ${count}마리!${abilityMsg}`);
            Audio.play('fanfare');
        }

        // Hat unlocks (with ability description)
        if (this.basketEggs >= 30 && !this.unlockedHats.includes(1)) {
            this.unlockedHats.push(1);
            this.chicken.currentHat = 1;
            this.message.show('👑 왕관! 알 가치 +1 UP!');
            Audio.play('fanfare');
            this._triggerShake(4, 0.3);
        }
        if (this.basketEggs >= 60 && !this.unlockedHats.includes(2)) {
            this.unlockedHats.push(2);
            this.chicken.currentHat = 2;
            // Ribbon: reduce gauge taps
            this.gauge.max = this._getEffectiveTapsPerEgg();
            this.message.show('🎀 리본! 게이지 1칸 감소!');
            Audio.play('fanfare');
            this._triggerShake(4, 0.3);
        }
        if (this.basketEggs >= 80 && !this.unlockedHats.includes(3)) {
            this.unlockedHats.push(3);
            this.chicken.currentHat = 3;
            this.message.show('🌸 꽃! 병아리 방어력 2배!');
            Audio.play('fanfare');
            this._triggerShake(4, 0.3);
        }

        // Auto-save every 10 eggs
        if (this.basketEggs > 0 && this.basketEggs % 10 === 0) {
            this._saveProgress();
        }

        // Win condition
        if (this.basketEggs >= TARGET_EGGS) {
            localStorage.removeItem('chickenEgg_progress');
            return 'ending';
        }

        return null;
    }

    /**
     * Assign available chicks to defend against approaching predators.
     * Chick defense capability scales with chick count:
     * 1 chick: can auto-defend fox (type 0)
     * 3 chicks: can also auto-defend weasel (type 1)
     * 5 chicks: can auto-defend all including raccoon (type 2)
     */
    _assignChickDefenders() {
        const chickCount = this.chicks.length;
        if (chickCount === 0) return;

        for (const pred of this.predators) {
            // Only target approaching predators within 400px of basket
            if (pred.phase !== 0) continue;
            const distToBasket = Math.abs(pred.x - this.basket.x);
            if (distToBasket > 400) continue;

            // Check if predator type can be defended by current chick count
            let canAutoDefend = false;
            if (pred.type === 0 && chickCount >= 1) canAutoDefend = true; // fox
            if (pred.type === 1 && chickCount >= 3) canAutoDefend = true; // weasel
            if (pred.type === 2 && chickCount >= 5) canAutoDefend = true; // raccoon
            if (!canAutoDefend) continue;

            // Check if any chick is already defending this predator
            const alreadyAssigned = this.chicks.some(c => c.defendTarget === pred);
            if (alreadyAssigned) continue;

            // Find closest available chick
            let bestChick = null;
            let bestDist = Infinity;
            for (const chick of this.chicks) {
                if (!chick.canDefend()) continue;
                const d = Math.abs(chick.x - pred.x);
                if (d < bestDist) {
                    bestDist = d;
                    bestChick = chick;
                }
            }

            if (bestChick) {
                bestChick.startDefend(pred);
            }
        }
    }

    /**
     * Get current egg value bonus from crown hat.
     * Crown: all egg values +1
     */
    _getEggValueBonus() {
        return this.unlockedHats.includes(1) ? 1 : 0;
    }

    /**
     * Get taps per egg (reduced by ribbon hat).
     * Ribbon: gauge needs 1 fewer tap (5 → 4)
     */
    _getEffectiveTapsPerEgg() {
        return this.unlockedHats.includes(2) ? TAPS_PER_EGG - 1 : TAPS_PER_EGG;
    }

    _triggerShake(amount, duration) {
        this.shakeAmount = amount;
        this.shakeTimer = duration;
    }

    getStageTheme() {
        return STAGES[this.currentStage];
    }

    draw(ctx, w, h, bg) {
        // Screen shake
        ctx.save();
        if (this.shakeTimer > 0) {
            const intensity = this.shakeAmount * (this.shakeTimer / 0.5);
            ctx.translate(
                (Math.random() - 0.5) * intensity * 2,
                (Math.random() - 0.5) * intensity * 2
            );
        }

        bg.draw(ctx, w, h, this.getStageTheme());

        // Stage transition flash
        if (this._stageTransition > 0) {
            ctx.save();
            ctx.globalAlpha = this._stageTransition * 0.3;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, w, h);
            ctx.restore();
        }

        // Basket
        this.basket.draw(ctx, this.basketEggs);

        // Flying eggs
        for (const egg of this.eggs) {
            egg.draw(ctx);
        }

        // Chicks
        for (const chick of this.chicks) {
            chick.draw(ctx);
        }

        // Chicken
        this.chicken.draw(ctx);

        // Predators
        for (const pred of this.predators) {
            pred.draw(ctx);
        }

        // Particles
        this.particles.draw(ctx);

        ctx.restore(); // end screen shake

        // UI (pass safeTop) - drawn outside shake
        this.gauge.draw(ctx, w, this.safeTop);

        // Build active abilities list
        const activeAbilities = [];
        if (this.unlockedHats.includes(1)) activeAbilities.push({ text: '👑 알+1', color: '#FFD700' });
        if (this.unlockedHats.includes(2)) activeAbilities.push({ text: '🎀 게이지-1', color: '#FF69B4' });
        if (this.unlockedHats.includes(3)) activeAbilities.push({ text: '🌸 방어×2', color: '#4CAF50' });
        const chickCount = this.chicks.length;
        if (chickCount >= 1) {
            const defTypes = chickCount >= 5 ? '전체' : chickCount >= 3 ? '여우+족제비' : '여우';
            activeAbilities.push({ text: `🛡️ ${defTypes} 방어`, color: '#81D4FA' });
        }

        this.hud.draw(ctx, w, h, {
            basketEggs: this.basketEggs,
            targetEggs: TARGET_EGGS,
            chickCount: this.chicks.length,
            totalEggs: this.totalEggs,
            gaugeEmpty: this.gauge.gauge === 0 && this.gauge._fullFlash <= 0,
            comboCount: this.comboCount,
            currentStage: this.currentStage,
            stageName: STAGES[this.currentStage].name,
            stageEmoji: STAGES[this.currentStage].emoji,
            activeAbilities,
        }, this.safeTop);

        this.message.draw(ctx, w, h);
    }

    handleTap(x, y) {
        Audio.ensureContext();
        Audio.vibrate();
        this.hud.resetIdle();

        // Check predators first (priority tap target)
        for (let i = this.predators.length - 1; i >= 0; i--) {
            if (this.predators[i].contains(x, y)) {
                const result = this.predators[i].scare();
                if (result === 'scared') {
                    this.predatorsScared++;
                    this.message.show(`${this.predators[i].info.name}을 쫓아냈어! 👏`);
                    Audio.play('cheer');
                    Audio.play('scared');
                    this.particles.createParticles(this.predators[i].x, this.predators[i].y, '#FFD700', 10);
                    this.particles.addFloatingText(this.predators[i].x, this.predators[i].y - 50, '도망가!', '#FFF');
                    this._triggerShake(3, 0.2);
                    // Chicks celebrate
                    for (const chick of this.chicks) chick.celebrate();
                } else if (result === 'hit') {
                    Audio.play('cluck');
                    this.particles.createParticles(this.predators[i].x, this.predators[i].y, '#FFFFFF', 5);
                    this.particles.addFloatingText(
                        this.predators[i].x, this.predators[i].y - 40,
                        `${this.predators[i].tapsRemaining}번 더!`, '#FFD700'
                    );
                }
                return null;
            }
        }

        // Combo system
        this.comboCount++;
        this.comboTimer = this.comboMaxInterval;

        // Pump gauge
        this.chicken.pump();
        Audio.play('cluck');

        const full = this.gauge.pump();
        if (full) {
            this._layEgg();
        }

        return null;
    }

    _layEgg() {
        // Combo boosts golden egg chance: base 12% + 2% per combo (max 30%)
        const comboBonus = Math.min(0.18, this.comboCount * 0.02);
        const goldenChance = 0.12 + comboBonus;
        const golden = Math.random() < goldenChance;
        this.chicken.layEgg();

        const bonus = this._getEggValueBonus();
        if (golden) {
            Audio.play('golden-egg');
            const totalVal = GOLDEN_EGG_VALUE + bonus;
            this.message.show(`⭐ 금알이다! +${totalVal} ⭐`);
            this.goldenEggs++;
        } else {
            Audio.play('egg-pop');
        }

        // Screen shake on egg lay
        this._triggerShake(2, 0.15);

        this.particles.createParticles(
            this.chicken.x, this.chicken.y + 30,
            golden ? '#FFD700' : '#FFF5E6', 12
        );

        // Chicks react to egg laying
        for (const chick of this.chicks) {
            chick.celebrate();
        }

        const egg = new Egg(
            this.chicken.x, this.chicken.y + 30,
            this.basket.x, this.basket.y + 20,
            golden
        );
        this.eggs.push(egg);
        this.totalEggs++;
    }
}
