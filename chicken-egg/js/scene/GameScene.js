// Main gameplay scene
import { Chicken } from '../entity/Chicken.js';
import { Nest } from '../entity/Nest.js';
import { Chick } from '../entity/Chick.js';
import { Predator, PREDATOR_TYPES } from '../entity/Predator.js';
import { Dog } from '../entity/Dog.js';
import { Gauge } from '../ui/Gauge.js';
import { HUD } from '../ui/HUD.js';
import { Message } from '../ui/Message.js';
import { ParticleSystem } from '../particles.js';
import { audio as Audio } from '../AudioManager.js';
import { DIFFICULTIES } from '../Difficulty.js';
import { AchievementManager } from '../Achievement.js';

const GOLDEN_EGG_VALUE = 3;

// Stage definitions with themes
const STAGES = [
    { name: '봄 농장', emoji: '🌸', skyTop: '#87CEEB', skyMid: '#B0E0FF', skyBot: '#E0F0FF', groundTop: '#7EC850', groundBot: '#4A8B2C' },
    { name: '여름 들판', emoji: '☀️', skyTop: '#4FC3F7', skyMid: '#81D4FA', skyBot: '#B3E5FC', groundTop: '#66BB6A', groundBot: '#388E3C' },
    { name: '가을 숲', emoji: '🍂', skyTop: '#FFB74D', skyMid: '#FFCC80', skyBot: '#FFE0B2', groundTop: '#A1887F', groundBot: '#6D4C41' },
    { name: '겨울 눈밭', emoji: '❄️', skyTop: '#90CAF9', skyMid: '#BBDEFB', skyBot: '#E3F2FD', groundTop: '#E0E0E0', groundBot: '#BDBDBD' },
    { name: '무지개 마을', emoji: '🌈', skyTop: '#CE93D8', skyMid: '#F48FB1', skyBot: '#FFCC80', groundTop: '#A5D6A7', groundBot: '#66BB6A' },
];

// Stage effect descriptions
const STAGE_EFFECTS = [
    null, // Stage 0: no effect
    '☀️ 여름: 천적이 빨라져!',
    '🍂 가을: 바람이 알을 날려!',
    '❄️ 겨울: 추위로 게이지 감소!',
    '🌈 무지개: 랜덤 보너스!',
];

export class GameScene {
    constructor(canvasWidth, canvasHeight, safeTop = 0, difficultyKey = 'sister') {
        this.difficultyKey = difficultyKey;
        this.diff = DIFFICULTIES[difficultyKey] || DIFFICULTIES.normal;
        this.TARGET_EGGS = this.diff.targetEggs;
        this.TAPS_PER_EGG = this.diff.tapsPerEgg;
        this.EGGS_PER_STAGE = Math.floor(this.TARGET_EGGS / 5);

        const groundY = canvasHeight * 0.65;

        // Chicken sits in the nest (same position)
        const nestX = canvasWidth * 0.5;
        const nestY = groundY + 10;
        this.nest = new Nest(nestX, nestY);
        this.chicken = new Chicken(nestX, nestY - 35);
        this.gauge = new Gauge(this.TAPS_PER_EGG);
        this.hud = new HUD();
        this.message = new Message();
        this.particles = new ParticleSystem();

        this.chicks = [];
        this.predators = [];
        this.dogs = [];

        this.basketEggs = 0;
        this.totalEggs = 0;
        this.goldenEggs = 0;

        // HP system
        this.maxHp = this.diff.maxHp || 15;
        this.hp = this.maxHp;
        this.damageFlashTimer = 0; // red flash when taking damage
        this.chicksLost = 0; // stat tracking

        // Dog summon system - Improvement 3: separate charges for each dog
        const baseChargeMax = this.diff.dogChargeEggs || 15;
        this.dogChargeMaxPer = Math.ceil(baseChargeMax / 2); // half charge per dog
        this.dogChargeBori = 0;
        this.dogChargeJopssal = 0;
        this._boriBtnRect = null;
        this._jopssalBtnRect = null;
        this._healBtnRect = null;

        this.predatorTimer = 0;
        this.gameTime = 0; // total elapsed time for grace period
        this.unlockedHats = new Set([0]);
        this.groundY = groundY;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.safeTop = safeTop;

        // Combo system
        this.comboCount = 0;
        this.comboTimer = 0;
        this.comboMaxInterval = 0.6; // seconds between taps for combo

        // Improvement 5: Score system
        this.maxCombo = 0;

        // Stage system
        this.currentStage = 0;
        this._lastStage = 0;
        this._stageTransition = 0; // 0 = none, >0 = transitioning

        // Improvement 4: Stage environmental event timers
        this._windTimer = 0;       // Stage 2 wind timer
        this._lastEggTime = -999;  // timestamp of last egg laid
        this._bonusTimer = 0;      // Stage 4 bonus timer
        this._stageEffectShown = -1; // which stage effect msg was last shown

        // Screen shake
        this.shakeAmount = 0;
        this.shakeTimer = 0;

        // Predators scared count (for stats)
        this.predatorsScared = 0;
        this.dogSummons = 0;

        // Cached dog active state (updated each frame)
        this._boriActive = false;
        this._jopssalActive = false;

        // Achievement system
        this.achievements = new AchievementManager();
        this._achNotification = null;  // { ach, timer }
        this._achNotifyDuration = 3;

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

    /**
     * Improvement 1: Check if any predator is occupying the nest (phase === 1)
     */
    _isPredatorAtNest() {
        return this.predators.some(p => p.phase === 1);
    }

    update(dt, canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.groundY = canvasHeight * 0.65;
        this.gameTime += dt;

        // Reposition entities on resize (chicken sits in nest)
        const nestX = canvasWidth * 0.5;
        const nestY = this.groundY + 10;
        this.nest.x = nestX;
        this.nest.y = nestY;
        this.chicken.x = nestX;
        this.chicken.baseY = nestY - 35;

        // Cache dog active state
        this._boriActive = this.dogs.some(d => d.type === 0 && d.active);
        this._jopssalActive = this.dogs.some(d => d.type === 1 && d.active);

        // Update entities
        this.chicken.update(dt);
        this.nest.update(dt);
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

        // Damage flash decay
        if (this.damageFlashTimer > 0) {
            this.damageFlashTimer -= dt;
        }

        // Stage transition
        if (this._stageTransition > 0) {
            this._stageTransition = Math.max(0, this._stageTransition - dt * 2);
        }

        // Stage calculation
        this.currentStage = Math.min(4, Math.floor(this.basketEggs / this.EGGS_PER_STAGE));

        // Improvement 4: Stage environmental effects
        this._updateStageEffects(dt);

        // Update chicks + auto-defense
        for (const chick of this.chicks) {
            chick.updateBounds(canvasWidth);
            // Apply flower hat bonus: halve defend cooldown
            if (this.unlockedHats.has(3) && chick.defendCooldown > 0) {
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

        // Predator spawning (scaled by difficulty) - spawn from the start after grace period
        this.predatorTimer += dt;
        const minInterval = this.diff.predatorMinInterval || 2.5;
        const spawnInterval = Math.max(minInterval, this.diff.predatorSpawnBase - this.basketEggs * this.diff.predatorSpawnScale);
        const maxPred = this.diff.predatorMaxConcurrent || 3;
        if (this.predatorTimer > spawnInterval && this.gameTime > 3 && this.predators.length < maxPred) {
            this.predatorTimer = 0;
            // Burst spawn: chance to spawn 2 at once on higher difficulties
            const burstChance = this.diff.predatorBurstChance || 0;
            const spawnCount = (Math.random() < burstChance && this.predators.length + 1 < maxPred) ? 2 : 1;

            for (let sp = 0; sp < spawnCount && this.predators.length < maxPred; sp++) {
                let type;
                if (this.currentStage >= 3 && Math.random() < 0.4) {
                    type = 2;
                } else {
                    type = Math.floor(Math.random() * 3);
                }
                const pred = new Predator(type, this.groundY + 25, canvasWidth, this.nest.x);
                pred.speed *= this.diff.predatorSpeedMult;
                // Improvement 4: Stage 1 speed bonus
                if (this.currentStage === 1) {
                    pred.speed *= 1.2;
                }
                pred.setStealAmount(this.basketEggs);
                pred.stealAmount = Math.min(5, Math.ceil(pred.stealAmount * this.diff.predatorStealMult));
                // Apply difficulty taps multiplier
                const tapsMult = this.diff.predatorTapsMult || 1;
                pred.tapsRemaining = Math.ceil(pred.info.tapsToScare * tapsMult);
                // Apply steal delay override
                if (this.diff.predatorStealDelay) {
                    pred._stealDelay = this.diff.predatorStealDelay;
                }
                this.predators.push(pred);
            }
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
                // Improvement 2: Separate penalties
                // Priority: capture chick -> steal eggs (no HP) -> attack mother (HP damage)
                const capturedChick = this._tryCapturChick(pred);

                if (!capturedChick) {
                    const stolen = Math.min(pred.stealAmount, this.basketEggs);
                    if (stolen > 0) {
                        // Egg theft: reduces eggs + HP damage scaled by stolen amount
                        this.basketEggs -= stolen;
                        const hpLoss = stolen >= 4 ? 3 : stolen >= 2 ? 2 : 1;
                        this._takeDamage(hpLoss, this.nest.x, this.nest.y - 50);
                        this.message.show(`${pred.info.emoji} ${pred.info.stealMsg} (-${stolen})`);
                        Audio.play('steal');
                        this._triggerShake(4, 0.3);
                        this.particles.createParticles(this.nest.x, this.nest.y, '#FF6B6B', 8);
                        this.particles.addFloatingText(
                            this.nest.x, this.nest.y - 40,
                            `-${stolen}`, '#FF4444'
                        );
                    } else {
                        // Nothing to steal/capture - predator attacks mother: HP -3
                        this._takeDamage(3, this.nest.x, this.nest.y - 50);
                        this.message.show(`${pred.info.emoji} ${pred.info.name}가 공격했어!`);
                        Audio.play('steal');
                    }
                }
            }

            if (!pred.active) this.predators.splice(i, 1);
        }

        // Update dogs
        for (let i = this.dogs.length - 1; i >= 0; i--) {
            const dog = this.dogs[i];
            dog.canvasWidth = canvasWidth;
            const event = dog.update(dt);

            if (event && event.type === 'attack') {
                const pred = event.predator;
                if (pred.active && pred.phase <= 1) {
                    // Apply scare power
                    for (let p = 0; p < event.power; p++) {
                        const scareResult = pred.scare();
                        if (scareResult === 'scared') {
                            this.predatorsScared++;
                            this.message.show(`🐕 ${dog.info.name}가 ${pred.info.name}을 쫓아냈어!`);
                            Audio.play('cheer');
                            Audio.play('scared');
                            this.particles.createParticles(pred.x, pred.y, '#FFD700', 12);
                            this.particles.addFloatingText(pred.x, pred.y - 50, `${dog.info.name} 멍멍!`, '#FF6B00');
                            this._triggerShake(3, 0.2);
                            break;
                        } else if (scareResult === 'hit') {
                            this.particles.createParticles(pred.x, pred.y, '#FFF', 5);
                            this.particles.addFloatingText(pred.x, pred.y - 40, '멍!', '#FF6B00');
                        }
                    }
                }
            }

            if (!dog.active) this.dogs.splice(i, 1);
        }

        // Assign dogs to predators
        this._assignDogTargets();

        // Milestone chicks (every 20 eggs = every stage)
        const chickMilestone = Math.floor(this.basketEggs / this.EGGS_PER_STAGE);
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

        // Hat unlocks at 40%, 65%, 85% of target
        const HAT_UNLOCKS = [
            { id: 1, pct: 0.4, msg: '👑 왕관! 알 가치 +1 UP!' },
            { id: 2, pct: 0.65, msg: '🎀 리본! 게이지 1칸 감소!' },
            { id: 3, pct: 0.85, msg: '🌸 꽃! 병아리 방어력 2배!' },
        ];
        for (const hat of HAT_UNLOCKS) {
            const threshold = Math.floor(this.TARGET_EGGS * hat.pct);
            if (this.basketEggs >= threshold && !this.unlockedHats.has(hat.id)) {
                this.unlockedHats.add(hat.id);
                this.chicken.currentHat = hat.id;
                if (hat.id === 2) this.gauge.max = this._getEffectiveTapsPerEgg();
                this.message.show(hat.msg);
                Audio.play('fanfare');
                this._triggerShake(4, 0.3);
            }
        }

        // Auto-save every 10 eggs
        if (this.basketEggs > 0 && this.basketEggs % 10 === 0) {
            this._saveProgress();
        }

        // Game over check
        if (this.hp <= 0) {
            localStorage.removeItem('chickenEgg_progress');
            return 'gameover';
        }

        // Win condition
        // Check achievements
        this._checkAchievements();

        // Update achievement notification
        if (this._achNotification) {
            this._achNotification.timer -= dt;
            if (this._achNotification.timer <= 0) {
                this._achNotification = null;
            }
        }
        // Show next pending achievement
        if (!this._achNotification) {
            const next = this.achievements.popPending();
            if (next) {
                this._achNotification = { ach: next, timer: this._achNotifyDuration };
                Audio.play('fanfare');
            }
        }

        if (this.basketEggs >= this.TARGET_EGGS) {
            localStorage.removeItem('chickenEgg_progress');
            return 'ending';
        }

        return null;
    }

    /**
     * Improvement 4: Update stage-specific environmental effects
     */
    _updateStageEffects(dt) {
        // Stage 2 (가을 숲): Wind gusts every 15 seconds
        if (this.currentStage === 2) {
            this._windTimer += dt;
            if (this._windTimer >= 15) {
                this._windTimer = 0;
                // Check if egg was laid within last 2 seconds
                const timeSinceEgg = this.gameTime - this._lastEggTime;
                if (timeSinceEgg <= 2 && this.basketEggs > 0) {
                    this.basketEggs = Math.max(0, this.basketEggs - 1);
                    this.message.show('🌪️ 바람! 알이 날아갔어!');
                    this.particles.addFloatingText(this.nest.x, this.nest.y - 60, '🌪️ -1', '#8B4513');
                    this._triggerShake(3, 0.3);
                    Audio.play('warning');
                } else {
                    this.message.show('🌪️ 바람이 불었어!');
                }
            }
        }

        // Stage 3 (겨울 눈밭): Gauge slowly decays
        if (this.currentStage === 3) {
            if (this.gauge.gauge > 0) {
                this.gauge.gauge = Math.max(0, this.gauge.gauge - 0.15 * dt);
            }
        }

        // Stage 4 (무지개 마을): Random bonus every 20 seconds
        if (this.currentStage === 4) {
            this._bonusTimer += dt;
            if (this._bonusTimer >= 20) {
                this._bonusTimer = 0;
                const roll = Math.random();
                if (roll < 0.33) {
                    // +2 eggs
                    this.basketEggs += 2;
                    this.message.show('🌈 보너스! +2 알!');
                    this.particles.addFloatingText(this.nest.x, this.nest.y - 60, '+2 🥚', '#FFD700');
                    Audio.play('cheer');
                } else if (roll < 0.66) {
                    // +1 HP heal
                    const healed = Math.min(1, this.maxHp - this.hp);
                    this.hp = Math.min(this.maxHp, this.hp + 1);
                    this.message.show('🌈 보너스! HP +1 회복!');
                    if (healed > 0) {
                        this.particles.addFloatingText(this.nest.x, this.nest.y - 60, `+${healed} ❤️`, '#4CAF50');
                    }
                    Audio.play('cheer');
                } else {
                    // Instant dog charge +5
                    this.dogChargeBori = Math.min(this.dogChargeMaxPer, this.dogChargeBori + 5);
                    this.dogChargeJopssal = Math.min(this.dogChargeMaxPer, this.dogChargeJopssal + 5);
                    this.message.show('🌈 보너스! 강아지 충전!');
                    this.particles.addFloatingText(this.nest.x, this.nest.y - 60, '+5 🐶', '#FF6B00');
                    Audio.play('cheer');
                }
                this._triggerShake(3, 0.2);
            }
        }
    }

    /**
     * Improvement 5: Calculate final score
     */
    _calculateScore() {
        return this.basketEggs * 10
            + this.goldenEggs * 50
            + this.predatorsScared * 20
            + this.maxCombo * 5
            + this.hp * 30
            - this.chicksLost * 50;
    }

    /**
     * Improvement 5: Get star rating based on score thresholds
     */
    _getStarRating(score) {
        const t1 = this.TARGET_EGGS * 15;
        const t2 = this.TARGET_EGGS * 25;
        if (score >= t2) return 3;
        if (score >= t1) return 2;
        return 1;
    }

    /**
     * Assign available chicks to defend against approaching predators.
     * Chicks can only auto-defend foxes (type 0).
     * Weasels and raccoons must be handled by player taps or dogs.
     */
    _assignChickDefenders() {
        const chickCount = this.chicks.length;
        if (chickCount === 0) return;

        for (const pred of this.predators) {
            // Only target approaching predators within 400px of basket
            if (pred.phase !== 0) continue;
            const distToNest = Math.abs(pred.x - this.nest.x);
            if (distToNest > 400) continue;

            // Chicks can only auto-defend foxes (type 0)
            // Weasels and raccoons must be handled by player taps or dogs
            if (pred.type !== 0) continue;

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
        return this.unlockedHats.has(1) ? 1 : 0;
    }

    /**
     * Get taps per egg (reduced by ribbon hat).
     * Ribbon: gauge needs 1 fewer tap (5 -> 4)
     */
    _getEffectiveTapsPerEgg() {
        return this.unlockedHats.has(2) ? Math.max(2, this.TAPS_PER_EGG - 1) : this.TAPS_PER_EGG;
    }

    _triggerShake(amount, duration) {
        this.shakeAmount = amount;
        this.shakeTimer = duration;
    }

    _assignDogTargets() {
        for (const dog of this.dogs) {
            if (dog.targetPredator) continue;
            // Find closest approaching predator
            let best = null, bestDist = Infinity;
            for (const pred of this.predators) {
                if (pred.phase > 1 || pred.scared) continue;
                // Check not already targeted by another dog
                const alreadyTargeted = this.dogs.some(d => d !== dog && d.targetPredator === pred);
                if (alreadyTargeted) continue;
                const d = Math.abs(dog.x - pred.x);
                if (d < bestDist) { bestDist = d; best = pred; }
            }
            if (best) dog.assignTarget(best);
        }
    }

    /**
     * Improvement 3: Summon a single dog by type (0 = bori, 1 = jopssal)
     */
    _summonDog(type) {
        const duration = this.diff.dogDuration || 10;
        const gY = this.groundY + 15;

        if (type === 0) {
            // 보리 enters from left
            const bori = new Dog(0, -30, gY, this.canvasWidth, duration);
            bori.patrolCenter = this.nest.x - 60;
            this.dogs.push(bori);
            this.dogChargeBori = 0;
            this.dogSummons++;
            this.message.show('🐕 보리 등장!');
            Audio.play('fanfare');
            this._triggerShake(4, 0.3);
            this.particles.addFloatingText(bori.x, gY - 50, '🐕 보리', '#333');
        } else {
            // 좁쌀이 enters from right
            const jopssal = new Dog(1, this.canvasWidth + 30, gY, this.canvasWidth, duration);
            jopssal.patrolCenter = this.nest.x + 60;
            jopssal.patrolDir = -1;
            this.dogs.push(jopssal);
            this.dogChargeJopssal = 0;
            this.dogSummons++;
            this.message.show('🐶 좁쌀이 등장!');
            Audio.play('fanfare');
            this._triggerShake(4, 0.3);
            this.particles.addFloatingText(jopssal.x, gY - 50, '🐕‍🦺 좁쌀이', '#D4AA4C');
        }
    }

    /**
     * Improvement 3: Heal using dog charge
     */
    _healWithCharge() {
        // Use whichever charge is full (bori first)
        if (this.dogChargeBori >= this.dogChargeMaxPer) {
            this.dogChargeBori = 0;
        } else if (this.dogChargeJopssal >= this.dogChargeMaxPer) {
            this.dogChargeJopssal = 0;
        } else {
            return; // no charge available
        }

        const healAmount = 2;
        const healed = Math.min(healAmount, this.maxHp - this.hp);
        this.hp = Math.min(this.maxHp, this.hp + healAmount);
        this.message.show(`❤️ HP +${healed} 회복!`);
        Audio.play('cheer');
        this._triggerShake(2, 0.2);
        this.particles.addFloatingText(this.nest.x, this.nest.y - 60, `+${healed} ❤️`, '#4CAF50');
        this.particles.createParticles(this.nest.x, this.nest.y, '#FF69B4', 10);
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

        // Chicks (behind nest)
        for (const chick of this.chicks) {
            chick.draw(ctx);
        }

        // Nest (back layer)
        this.nest.drawBack(ctx, this.basketEggs);

        // Chicken (sitting in nest)
        this.chicken.draw(ctx);

        // Nest front rim (over chicken's bottom)
        this.nest.drawFront(ctx);

        // Popping eggs animation
        // Dogs
        for (const dog of this.dogs) {
            dog.draw(ctx);
        }

        // Predators
        for (const pred of this.predators) {
            pred.draw(ctx);
        }

        // Particles
        this.particles.draw(ctx);

        // Damage red flash overlay (inside shake context)
        if (this.damageFlashTimer > 0) {
            ctx.save();
            ctx.globalAlpha = Math.min(0.4, this.damageFlashTimer * 1.5);
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(0, 0, w, h);
            ctx.restore();
        }

        ctx.restore(); // end screen shake

        // UI (pass safeTop) - drawn outside shake
        this.gauge.draw(ctx, w, this.safeTop);

        // Build active abilities list
        const activeAbilities = [];
        if (this.unlockedHats.has(1)) activeAbilities.push({ text: '👑 알+1', color: '#FFD700' });
        if (this.unlockedHats.has(2)) activeAbilities.push({ text: '🎀 게이지-1', color: '#FF69B4' });
        if (this.unlockedHats.has(3)) activeAbilities.push({ text: '🌸 방어×2', color: '#4CAF50' });
        const chickCount = this.chicks.length;
        if (chickCount >= 1) {
            const defTypes = chickCount >= 5 ? '전체' : chickCount >= 3 ? '여우+족제비' : '여우';
            activeAbilities.push({ text: `🛡️ ${defTypes} 방어`, color: '#81D4FA' });
        }

        this.hud.draw(ctx, w, h, {
            basketEggs: this.basketEggs,
            targetEggs: this.TARGET_EGGS,
            chickCount: this.chicks.length,
            totalEggs: this.totalEggs,
            gaugeEmpty: this.gauge.gauge === 0 && this.gauge._fullFlash <= 0,
            comboCount: this.comboCount,
            currentStage: this.currentStage,
            stageName: STAGES[this.currentStage].name,
            stageEmoji: STAGES[this.currentStage].emoji,
            activeAbilities,
            hp: this.hp,
            maxHp: this.maxHp,
        }, this.safeTop);

        this.message.draw(ctx, w, h);

        // Dog summon buttons (Improvement 3)
        this._drawDogButtons(ctx, w, h);

        // Achievement notification
        if (this._achNotification) {
            this._drawAchNotification(ctx, w, h);
        }
    }

    /**
     * Improvement 3: Draw two dog buttons + heal button
     */
    _drawDogButtons(ctx, w, h) {
        const btnSize = 48;
        const gap = 6;
        const startX = w - (btnSize * 3 + gap * 2) - 10;
        const btnY = h - btnSize - 10;

        // Bori button (left)
        const boriX = startX;
        const boriReady = this.dogChargeBori >= this.dogChargeMaxPer && !this._boriActive;
        const boriRatio = Math.min(1, this.dogChargeBori / this.dogChargeMaxPer);
        this._boriBtnRect = { x: boriX, y: btnY, w: btnSize, h: btnSize };
        this._drawSingleDogBtn(ctx, boriX, btnY, btnSize, '🐕', '보리', boriReady, boriRatio, this._boriActive);

        // Jopssal button (middle)
        const jopssalX = startX + btnSize + gap;
        const jopssalReady = this.dogChargeJopssal >= this.dogChargeMaxPer && !this._jopssalActive;
        const jopssalRatio = Math.min(1, this.dogChargeJopssal / this.dogChargeMaxPer);
        this._jopssalBtnRect = { x: jopssalX, y: btnY, w: btnSize, h: btnSize };
        this._drawSingleDogBtn(ctx, jopssalX, btnY, btnSize, '🐶', '좁쌀이', jopssalReady, jopssalRatio, this._jopssalActive);

        // Heal button (right)
        const healX = startX + (btnSize + gap) * 2;
        const healReady = (this.dogChargeBori >= this.dogChargeMaxPer || this.dogChargeJopssal >= this.dogChargeMaxPer)
            && this.hp < this.maxHp;
        this._healBtnRect = { x: healX, y: btnY, w: btnSize, h: btnSize };
        this._drawHealBtn(ctx, healX, btnY, btnSize, healReady);

        // Active dogs timer display (show on bori/jopssal buttons)
        for (const dog of this.dogs) {
            const rect = dog.type === 0 ? this._boriBtnRect : this._jopssalBtnRect;
            if (rect) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(rect.x + btnSize / 2, rect.y + btnSize / 2, btnSize / 2 - 2,
                    -Math.PI / 2, -Math.PI / 2 + dog.getRemainingRatio() * Math.PI * 2);
                ctx.strokeStyle = '#4CAF50';
                ctx.lineWidth = 3;
                ctx.stroke();
                ctx.restore();
            }
        }
    }

    _drawSingleDogBtn(ctx, x, y, size, emoji, name, ready, ratio, active) {
        ctx.save();

        // Button background
        ctx.beginPath();
        ctx.roundRect(x, y, size, size, 12);
        ctx.fillStyle = ready ? 'rgba(255,107,0,0.85)' : 'rgba(0,0,0,0.35)';
        ctx.fill();

        // Charge ring
        if (!ready && !active) {
            ctx.beginPath();
            ctx.arc(x + size / 2, y + size / 2, size / 2 - 2,
                -Math.PI / 2, -Math.PI / 2 + ratio * Math.PI * 2);
            ctx.strokeStyle = '#FF9800';
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        // Active glow
        if (ready) {
            ctx.shadowColor = '#FF6B00';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.roundRect(x, y, size, size, 12);
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        // Dog icon
        ctx.font = '22px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emoji, x + size / 2, y + size / 2 - 4);

        // Name label
        ctx.fillStyle = ready ? '#FFF' : 'rgba(255,255,255,0.6)';
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText(name, x + size / 2, y + size - 6);

        ctx.restore();
    }

    _drawHealBtn(ctx, x, y, size, ready) {
        ctx.save();

        // Button background
        ctx.beginPath();
        ctx.roundRect(x, y, size, size, 12);
        ctx.fillStyle = ready ? 'rgba(76,175,80,0.85)' : 'rgba(0,0,0,0.35)';
        ctx.fill();

        // Active glow
        if (ready) {
            ctx.shadowColor = '#4CAF50';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.roundRect(x, y, size, size, 12);
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        // Heart icon
        ctx.font = '22px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('❤️', x + size / 2, y + size / 2 - 4);

        // Label
        ctx.fillStyle = ready ? '#FFF' : 'rgba(255,255,255,0.6)';
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText('회복', x + size / 2, y + size - 6);

        ctx.restore();
    }

    _checkAchievements() {
        this.achievements.check({
            totalEggs: this.totalEggs,
            basketEggs: this.basketEggs,
            goldenEggs: this.goldenEggs,
            comboCount: this.comboCount,
            chickCount: this.chicks.length,
            predatorsScared: this.predatorsScared,
            dogSummons: this.dogSummons,
            currentStage: this.currentStage,
            difficulty: this.difficultyKey,
            cleared: this.basketEggs >= this.TARGET_EGGS,
        });
    }

    _drawAchNotification(ctx, w, h) {
        const n = this._achNotification;
        if (!n) return;
        const a = n.ach;

        // Slide in from bottom
        const progress = Math.min(1, (this._achNotifyDuration - n.timer) / 0.4);
        const exitProgress = Math.max(0, 1 - n.timer / 0.4);
        const slideY = progress < 1 ? 60 - progress * 60 : (exitProgress > 0 ? exitProgress * 60 : 0);

        ctx.save();
        ctx.translate(w / 2, h - 80 + slideY);

        // Background pill
        const pw = 260, ph = 50;
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.beginPath();
        ctx.roundRect(-pw / 2, -ph / 2, pw, ph, 25);
        ctx.fill();

        // Gold border
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Emoji
        ctx.font = '22px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(a.emoji, -pw / 2 + 16, 0);

        // Text
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('업적 달성!', -pw / 2 + 50, -10);
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText(a.name, -pw / 2 + 50, 10);

        ctx.restore();
    }

    /**
     * Apply HP damage with visual feedback.
     */
    _takeDamage(amount, floatX, floatY) {
        this.hp = Math.max(0, this.hp - amount);
        this.damageFlashTimer = 0.3;
        this._triggerShake(5, 0.4);
        this.particles.addFloatingText(
            floatX, floatY,
            `-${amount} ❤️`, '#FF0000'
        );
    }

    /**
     * Try to have a predator capture a chick when it reaches the nest.
     * Returns true if a chick was captured.
     */
    _tryCapturChick(pred) {
        if (this.chicks.length === 0) return false;

        // Predators prefer eggs when there are many; grab chicks when eggs are scarce
        // Chance to capture chick: higher when fewer eggs, always possible
        const chickCaptureChance = this.basketEggs > 5 ? 0.3 : 0.6;
        if (Math.random() > chickCaptureChance) return false;

        // Find an undefended chick (not currently defending)
        let targetIdx = -1;
        for (let i = 0; i < this.chicks.length; i++) {
            if (!this.chicks[i].defendTarget) {
                targetIdx = i;
                break;
            }
        }
        // If all chicks are defending, pick the last one
        if (targetIdx === -1) targetIdx = this.chicks.length - 1;

        const chick = this.chicks[targetIdx];
        // Particles at chick position
        this.particles.createParticles(chick.x, chick.y, '#FFE44D', 15);
        this.particles.addFloatingText(chick.x, chick.y - 40, '🐣 잡혀갔어!', '#FF4444');

        // Remove the chick
        this.chicks.splice(targetIdx, 1);
        this.chicksLost++;

        this.message.show(`🐣 병아리가 잡혀갔어!`);
        Audio.play('steal');

        // HP damage for chick captured
        this._takeDamage(3, chick.x, chick.y - 60);

        return true;
    }

    handleTap(x, y) {
        Audio.ensureContext();
        Audio.vibrate();
        this.hud.resetIdle();

        // Improvement 3: Dog summon buttons
        // Bori button
        const bb = this._boriBtnRect;
        if (bb && x >= bb.x && x <= bb.x + bb.w && y >= bb.y && y <= bb.y + bb.h
            && this.dogChargeBori >= this.dogChargeMaxPer && !this._boriActive) {
            this._summonDog(0);
            return null;
        }

        // Jopssal button
        const jb = this._jopssalBtnRect;
        if (jb && x >= jb.x && x <= jb.x + jb.w && y >= jb.y && y <= jb.y + jb.h
            && this.dogChargeJopssal >= this.dogChargeMaxPer && !this._jopssalActive) {
            this._summonDog(1);
            return null;
        }

        // Heal button
        const hb = this._healBtnRect;
        if (hb && x >= hb.x && x <= hb.x + hb.w && y >= hb.y && y <= hb.y + hb.h) {
            const canHeal = (this.dogChargeBori >= this.dogChargeMaxPer || this.dogChargeJopssal >= this.dogChargeMaxPer)
                && this.hp < this.maxHp;
            if (canHeal) {
                this._healWithCharge();
                return null;
            }
        }

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

        // Improvement 1: Nest occupation - block egg production if predator at nest
        if (this._isPredatorAtNest()) {
            this.message.show('🚫 천적을 먼저 쫓아내!');
            this._triggerShake(2, 0.15);
            Audio.play('warning');
            return null;
        }

        // Combo system
        this.comboCount++;
        this.comboTimer = this.comboMaxInterval;

        // Improvement 5: Track max combo
        if (this.comboCount > this.maxCombo) {
            this.maxCombo = this.comboCount;
        }

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
        const comboBonus = Math.min(0.18, this.comboCount * this.diff.goldenChanceComboBonus);
        const goldenChance = Math.min(0.30, this.diff.goldenChanceBase + comboBonus);
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

        // Particles from nest area
        this.particles.createParticles(
            this.nest.x, this.nest.y,
            golden ? '#FFD700' : '#FFF5E6', 12
        );

        // Chicks react to egg laying
        for (const chick of this.chicks) {
            chick.celebrate();
        }

        // Egg goes directly into the nest
        const baseValue = golden ? GOLDEN_EGG_VALUE : 1;
        const value = baseValue + bonus;
        const prevEggs = this.basketEggs;
        this.basketEggs += value;
        this.totalEggs++;
        // Improvement 3: charge both dogs independently
        this.dogChargeBori += value;
        this.dogChargeJopssal += value;

        // Improvement 4: track last egg time for wind effect
        this._lastEggTime = this.gameTime;

        const bonusText = bonus > 0 ? ` (+${bonus}👑)` : '';
        this.particles.addFloatingText(
            this.nest.x, this.nest.y - 40,
            golden ? `+${value} ⭐${bonusText}` : `+${value}${bonusText}`,
            golden ? '#FFD700' : '#FFF'
        );
        this.nest.bounce = 1;

        // Stage clear check
        const prevStage = Math.min(4, Math.floor(prevEggs / this.EGGS_PER_STAGE));
        const newStage = Math.min(4, Math.floor(this.basketEggs / this.EGGS_PER_STAGE));
        if (newStage > prevStage && this.basketEggs < this.TARGET_EGGS) {
            const stageInfo = STAGES[newStage];
            const effectMsgs = ['', ' ⚡천적이 빨라져!', ' 🌪️바람 주의!', ' ❄️추위로 게이지 감소!', ' 🌈랜덤 보너스!'];
            this.message.show(`${stageInfo.emoji} ${stageInfo.name}으로 이동!${effectMsgs[newStage]} (${newStage + 1}/5)`);
            Audio.play('fanfare');
            this._stageTransition = 1;
            this._triggerShake(6, 0.5);
            for (const chick of this.chicks) {
                chick.celebrate();
            }
            // Improvement 4: Show stage effect message
            if (STAGE_EFFECTS[newStage]) {
                // Delay the effect message slightly so it doesn't overlap
                setTimeout(() => {
                    this.message.show(STAGE_EFFECTS[newStage]);
                }, 1500);
            }
            // Reset stage-specific timers
            this._windTimer = 0;
            this._bonusTimer = 0;
        } else if (this.basketEggs % 10 === 0 && this.basketEggs > 0) {
            Audio.play('cheer');
            this.message.show(`🎉 ${this.basketEggs}개 달성!`);
            this._triggerShake(3, 0.3);
        }
    }
}
