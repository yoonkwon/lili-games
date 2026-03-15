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
      showHomeConfirm();
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
      showHomeConfirm();
    }
  }
});

// Home confirm overlay
function showHomeConfirm() {
  if (document.getElementById('home-confirm')) return;
  const overlay = document.createElement('div');
  overlay.id = 'home-confirm';
  Object.assign(overlay.style, {
    position: 'fixed', inset: '0', background: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: '999',
  });
  const box = document.createElement('div');
  Object.assign(box.style, {
    background: '#FFF', borderRadius: '20px', padding: '28px 24px', textAlign: 'center',
    maxWidth: '300px', width: '85%', boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
    fontFamily: '"Apple SD Gothic Neo","Segoe UI",sans-serif',
  });
  box.innerHTML = `
    <div style="font-size:36px;margin-bottom:12px">🏠</div>
    <div style="font-size:18px;font-weight:700;color:#333;margin-bottom:8px">다른 게임 하러 갈까요?</div>
    <div style="font-size:14px;color:#888;margin-bottom:20px">진행 중이던 게임은 종료돼요.</div>
    <div style="display:flex;gap:10px;justify-content:center">
      <button id="home-cancel" style="flex:1;padding:12px;border:none;border-radius:12px;font-size:16px;font-weight:700;background:#EEE;color:#555;cursor:pointer">취소</button>
      <button id="home-ok" style="flex:1;padding:12px;border:none;border-radius:12px;font-size:16px;font-weight:700;background:linear-gradient(135deg,#667eea,#764ba2);color:#FFF;cursor:pointer">이동하기</button>
    </div>`;
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  document.getElementById('home-cancel').onclick = () => overlay.remove();
  document.getElementById('home-ok').onclick = () => { window.location.href = '../'; };
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

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
