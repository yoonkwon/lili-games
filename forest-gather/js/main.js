// Main entry point - forest gather game
import { Input } from '../../shared/Input.js';
import { SpriteCache } from './SpriteCache.js';
import { TitleScene } from './scene/TitleScene.js';
import { GameScene } from './scene/GameScene.js';
import { RoundClearScene } from './scene/RoundClearScene.js';
import { GameOverScene } from './scene/GameOverScene.js';

// Initialize
const spriteCache = new SpriteCache();
spriteCache.init();

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

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

// Scene management
let currentScene = 'title';
let titleScene = new TitleScene(spriteCache);
let gameScene = null;
let roundClearScene = null;
let gameOverScene = null;

// Transition
let transition = { active: false, alpha: 0, phase: 'none', nextAction: null };
const TRANSITION_SPEED = 3;

function startTransition(action) {
  transition.active = true;
  transition.alpha = 0;
  transition.phase = 'fadeOut';
  transition.nextAction = action;
}

// Input
const input = new Input(canvas);
input.onTap((x, y) => {
  if (transition.active) return;

  if (currentScene === 'title') {
    const result = titleScene.handleTap(x, y, canvas.width, canvas.height);
    if (result === 'start') {
      const difficulty = titleScene.selectedDifficulty;
      startTransition(() => {
        gameScene = new GameScene(canvas.width, canvas.height, safeTop, difficulty, spriteCache);
        currentScene = 'game';
      });
    }
  } else if (currentScene === 'game') {
    gameScene.handleTap(x, y);
  } else if (currentScene === 'roundClear') {
    const result = roundClearScene.handleTap(x, y);
    if (result === 'continue') {
      startTransition(() => {
        gameScene.advanceRound();
        currentScene = 'game';
      });
    } else if (result === 'home') {
      window.location.href = '../';
    }
  } else if (currentScene === 'gameover') {
    const result = gameOverScene.handleTap(x, y);
    if (result === 'restart') {
      startTransition(() => {
        titleScene = new TitleScene(spriteCache);
        currentScene = 'title';
        gameScene = null;
      });
    } else if (result === 'home') {
      window.location.href = '../';
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

    // Update
    if (currentScene === 'title') {
      titleScene.update(dt);
    } else if (currentScene === 'game') {
      const result = gameScene.update(dt, canvas.width, canvas.height);
      if (result === 'roundClear' && !transition.active) {
        startTransition(() => {
          const stats = gameScene.getStats();
          roundClearScene = new RoundClearScene(canvas.width, canvas.height, stats, gameScene.round + 1);
          currentScene = 'roundClear';
        });
      } else if (result === 'gameover' && !transition.active) {
        startTransition(() => {
          const stats = gameScene.getStats();
          gameOverScene = new GameOverScene(canvas.width, canvas.height, stats);
          currentScene = 'gameover';
        });
      }
    } else if (currentScene === 'roundClear') {
      roundClearScene.update(dt);
    } else if (currentScene === 'gameover') {
      gameOverScene.update(dt);
    }

    // Draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (currentScene === 'title') {
      titleScene.draw(ctx, canvas.width, canvas.height);
    } else if (currentScene === 'game') {
      gameScene.draw(ctx, canvas.width, canvas.height);
    } else if (currentScene === 'roundClear') {
      roundClearScene.draw(ctx, canvas.width, canvas.height);
    } else if (currentScene === 'gameover') {
      gameOverScene.draw(ctx, canvas.width, canvas.height);
    }

    // Transition overlay
    if (transition.active && transition.alpha > 0) {
      ctx.save();
      ctx.fillStyle = `rgba(0,0,0,${transition.alpha * 0.6})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
  } catch (e) {
    console.error('[Forest Gather Error]', e);
  }

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
