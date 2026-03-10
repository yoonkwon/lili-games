// Main entry point - game loop and scene management
import { Input } from './input.js';
import { Background } from './background.js';
import { TitleScene } from './scene/TitleScene.js';
import { GameScene } from './scene/GameScene.js';
import { EndingScene } from './scene/EndingScene.js';
import { GameOverScene } from './scene/GameOverScene.js';
import { audio } from './AudioManager.js';
import { SpriteCache } from './SpriteCache.js';

// Initialize sprite cache
const spriteCache = new SpriteCache();
spriteCache.init();

// Make sprite cache available globally for entities
window.__spriteCache = spriteCache;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Safe area inset (top) for notched devices
let safeTop = 0;
function updateSafeArea() {
    const style = getComputedStyle(document.body);
    safeTop = parseInt(style.getPropertyValue('--sat')) || 0;
}

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    updateSafeArea();
}
resize();
window.addEventListener('resize', resize);

// Shared background
const bg = new Background();

// Scene management
let currentScene = 'title';
let titleScene = new TitleScene();
let gameScene = null;
let endingScene = null;
let gameOverScene = null;

// Scene transition
let transition = { active: false, alpha: 0, phase: 'none', nextAction: null };
const TRANSITION_SPEED = 3; // fade speed

function startTransition(action) {
    transition.active = true;
    transition.alpha = 0;
    transition.phase = 'fadeOut';
    transition.nextAction = action;
}

// Pause state
let paused = false;

// Input
const input = new Input(canvas);
input.onTap((x, y) => {
    audio.ensureContext();

    // Handle pause toggle
    if (currentScene === 'game' && paused) {
        const bW = 220, bH = 55;
        const bX = canvas.width / 2 - bW / 2;
        const bY = canvas.height / 2 + 5;
        // Resume button
        if (x >= bX && x <= bX + bW && y >= bY && y <= bY + bH) {
            paused = false;
        }
        // Restart button
        const rY = bY + bH + 15;
        if (x >= bX && x <= bX + bW && y >= rY && y <= rY + bH) {
            paused = false;
            startTransition(() => {
                audio.stopBgm();
                titleScene = new TitleScene();
                currentScene = 'title';
                gameScene = null;
            });
        }
        return;
    }

    if (currentScene === 'game') {
        // Pause button (top-right)
        const pbSize = 44;
        const pbX = canvas.width - pbSize - 16;
        const pbY = safeTop + 20;
        if (x >= pbX && x <= pbX + pbSize && y >= pbY && y <= pbY + pbSize) {
            paused = true;
            return;
        }
    }

    if (transition.active) return;

    if (currentScene === 'title') {
        const result = titleScene.handleTap(x, y);
        if (result === 'start') {
            const difficulty = titleScene.selectedDifficulty;
            startTransition(() => {
                gameScene = new GameScene(canvas.width, canvas.height, safeTop, difficulty);
                currentScene = 'game';
                audio.play('cheer');
                audio.playBgm();
            });
        }
    } else if (currentScene === 'game') {
        gameScene.handleTap(x, y);
    } else if (currentScene === 'ending') {
        const result = endingScene.handleTap(x, y);
        if (result === 'restart') {
            startTransition(() => {
                audio.stopBgm();
                titleScene = new TitleScene();
                currentScene = 'title';
            });
        }
    } else if (currentScene === 'gameover') {
        const result = gameOverScene.handleTap(x, y);
        if (result === 'restart') {
            startTransition(() => {
                audio.stopBgm();
                titleScene = new TitleScene();
                currentScene = 'title';
            });
        }
    }
});

// Game loop
let lastTime = 0;

function gameLoop(timestamp) {
    try {
        const dt = Math.min(0.05, (timestamp - (lastTime || timestamp)) / 1000);
        lastTime = timestamp;

        // Update transition
        if (transition.active) {
            if (transition.phase === 'fadeOut') {
                transition.alpha = Math.min(1, transition.alpha + dt * TRANSITION_SPEED);
                if (transition.alpha >= 1) {
                    if (transition.nextAction) transition.nextAction();
                    transition.phase = 'fadeIn';
                }
            } else if (transition.phase === 'fadeIn') {
                transition.alpha = Math.max(0, transition.alpha - dt * TRANSITION_SPEED);
                if (transition.alpha <= 0) {
                    transition.active = false;
                    transition.phase = 'none';
                }
            }
        }

        bg.update(dt, canvas.width);

        if (!paused) {
            if (currentScene === 'title') {
                titleScene.update(dt);
            } else if (currentScene === 'game') {
                const result = gameScene.update(dt, canvas.width, canvas.height);
                if (result === 'ending' && !transition.active) {
                    startTransition(() => {
                        audio.stopBgm();
                        // Final achievement check for clear
                    gameScene._checkAchievements();
                    const score = gameScene._calculateScore();
                    const stars = gameScene._getStarRating(score);
                    endingScene = new EndingScene(canvas.width, canvas.height, {
                            goldenEggs: gameScene.goldenEggs,
                            totalEggs: gameScene.totalEggs,
                            predatorsScared: gameScene.predatorsScared,
                            difficulty: gameScene.difficultyKey,
                            score,
                            stars,
                        });
                        currentScene = 'ending';
                        audio.play('ending');
                    });
                } else if (result === 'gameover' && !transition.active) {
                    startTransition(() => {
                        audio.stopBgm();
                        const score = gameScene._calculateScore();
                        gameOverScene = new GameOverScene(canvas.width, canvas.height, {
                            basketEggs: gameScene.basketEggs,
                            goldenEggs: gameScene.goldenEggs,
                            totalEggs: gameScene.totalEggs,
                            predatorsScared: gameScene.predatorsScared,
                            chicksLost: gameScene.chicksLost,
                            difficulty: gameScene.difficultyKey,
                            score,
                        });
                        currentScene = 'gameover';
                        audio.play('warning');
                    });
                }
            } else if (currentScene === 'ending') {
                endingScene.update(dt);
            } else if (currentScene === 'gameover') {
                gameOverScene.update(dt);
            }
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (currentScene === 'title') {
            titleScene.draw(ctx, canvas.width, canvas.height, bg);
        } else if (currentScene === 'game') {
            gameScene.draw(ctx, canvas.width, canvas.height, bg);

            // Pause button (top-right)
            const pbSize = 44;
            const pbX = canvas.width - pbSize - 16;
            const pbY = safeTop + 20;
            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.roundRect(pbX, pbY, pbSize, pbSize, 12);
            ctx.fill();
            // Two vertical bars
            ctx.fillStyle = '#FFF';
            ctx.fillRect(pbX + 14, pbY + 10, 6, 24);
            ctx.fillRect(pbX + 24, pbY + 10, 6, 24);
            ctx.restore();

            // Pause overlay
            if (paused) {
                _drawPauseOverlay(ctx, canvas.width, canvas.height);
            }
        } else if (currentScene === 'ending') {
            endingScene.draw(ctx, canvas.width, canvas.height, bg);
        } else if (currentScene === 'gameover') {
            gameOverScene.draw(ctx, canvas.width, canvas.height, bg);
        }

        // Scene transition overlay
        if (transition.active && transition.alpha > 0) {
            ctx.save();
            ctx.fillStyle = `rgba(0,0,0,${transition.alpha * 0.6})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
        }
    } catch (e) {
        console.error('[Game Error]', e);
    }

    requestAnimationFrame(gameLoop);
}

function _drawPauseOverlay(ctx, w, h) {
    // Dim background
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, w, h);

    // Pause text
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⏸ 일시정지', w / 2, h / 2 - 100);

    // Stats summary
    if (gameScene) {
        ctx.font = 'bold 20px sans-serif';
        ctx.fillStyle = '#FFD700';
        const stageInfo = gameScene.getStageTheme();
        ctx.fillText(`${stageInfo.emoji} ${stageInfo.name}`, w / 2, h / 2 - 60);
        ctx.fillStyle = '#FFF';
        ctx.font = '18px sans-serif';
        ctx.fillText(`🥚 알: ${gameScene.basketEggs}/${gameScene.TARGET_EGGS}  ⭐ 금알: ${gameScene.goldenEggs}  🐣 병아리: ${gameScene.chicks.length}`, w / 2, h / 2 - 32);
    }

    // Resume button
    const bW = 220, bH = 55;
    const bX = w / 2 - bW / 2;
    const bY = h / 2 + 5;

    const grad = ctx.createLinearGradient(bX, bY, bX, bY + bH);
    grad.addColorStop(0, '#4CAF50');
    grad.addColorStop(1, '#388E3C');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(bX, bY, bW, bH, 20);
    ctx.fill();

    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('계속하기! ▶', w / 2, bY + bH / 2);

    // Restart button
    const rY = bY + bH + 15;
    const rGrad = ctx.createLinearGradient(bX, rY, bX, rY + bH);
    rGrad.addColorStop(0, '#FF7043');
    rGrad.addColorStop(1, '#E64A19');
    ctx.fillStyle = rGrad;
    ctx.beginPath();
    ctx.roundRect(bX, rY, bW, bH, 20);
    ctx.fill();

    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('처음부터 🔄', w / 2, rY + bH / 2);

    ctx.restore();
}

requestAnimationFrame(gameLoop);
