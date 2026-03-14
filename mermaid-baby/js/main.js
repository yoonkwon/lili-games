// Main entry point - Mermaid Baby game
import { Input } from '../../shared/Input.js';
import { mermaidAssetsReady } from './draw-mermaid.js';
import { TitleScene } from './scene/TitleScene.js';
import { GameScene } from './scene/GameScene.js';
import { BornScene } from './scene/BornScene.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let safeTop = 0;
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const style = getComputedStyle(document.body);
  safeTop = parseInt(style.getPropertyValue('--sat')) || 0;
}
resize();
window.addEventListener('resize', resize);

// Loading screen while assets load
function drawLoading(phase) {
  const w = canvas.width, h = canvas.height;
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#0a1628');
  grad.addColorStop(1, '#1a6b8a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.font = '40px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🫧', w / 2, h / 2 - 30);
  ctx.font = 'Bold 20px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
  ctx.fillStyle = '#FFF';
  const dots = '.'.repeat(Math.floor(phase % 4));
  ctx.fillText('로딩중' + dots, w / 2, h / 2 + 20);
}

let loadingPhase = 0;
function loadingLoop(timestamp) {
  loadingPhase += 0.03;
  drawLoading(loadingPhase);
  if (!assetsReady) requestAnimationFrame(loadingLoop);
}
let assetsReady = false;
requestAnimationFrame(loadingLoop);

mermaidAssetsReady
  .catch(() => console.warn('Some Mermaid assets failed to load'))
  .finally(() => {
    assetsReady = true;
    requestAnimationFrame(gameLoop);
  });

// Scenes
let currentScene = 'title';
let titleScene = new TitleScene();
let gameScene = null;
let bornScene = null;

// Transition
let transition = { active: false, alpha: 0, phase: 'none', nextAction: null };
const TRANSITION_SPEED = 2.5;

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
      startTransition(() => {
        gameScene = new GameScene(canvas.width, canvas.height, safeTop);
        currentScene = 'game';
      });
    }
  } else if (currentScene === 'game') {
    gameScene.handleTap(x, y);
  } else if (currentScene === 'born') {
    const result = bornScene.handleTap(x, y);
    if (result === 'restart') {
      startTransition(() => {
        titleScene = new TitleScene();
        currentScene = 'title';
        gameScene = null;
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

    // Transition
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
      if (result === 'born' && !transition.active) {
        startTransition(() => {
          const stats = gameScene.getStats();
          bornScene = new BornScene(canvas.width, canvas.height, stats);
          currentScene = 'born';
        });
      }
    } else if (currentScene === 'born') {
      bornScene.update(dt);
    }

    // Draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (currentScene === 'title') {
      titleScene.draw(ctx, canvas.width, canvas.height);
    } else if (currentScene === 'game') {
      gameScene.draw(ctx, canvas.width, canvas.height);
    } else if (currentScene === 'born') {
      bornScene.draw(ctx, canvas.width, canvas.height);
    }

    // Transition overlay
    if (transition.active && transition.alpha > 0) {
      ctx.save();
      ctx.fillStyle = `rgba(0,0,0,${transition.alpha * 0.7})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
  } catch (e) {
    console.error('[Mermaid Baby Error]', e);
  }

  requestAnimationFrame(gameLoop);
}
