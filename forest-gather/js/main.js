// Main entry point - educational encyclopedia exploration game
import { Input } from '../../shared/Input.js';
import { SpriteCache } from './SpriteCache.js';
import { STAGES, QUIZ_STAGES } from './config.js';
import { TitleScene } from './scene/TitleScene.js';
import { GameScene } from './scene/GameScene.js';
import { QuizGameScene } from './scene/QuizGameScene.js';
import { RoundClearScene } from './scene/RoundClearScene.js';
import { loadSave, writeSave, clearSave, loadEncyclopedia, updateEncyclopedia, saveEncyclopedia } from './SaveManager.js';
import { showHomeConfirm } from '../../shared/ui/HomeConfirm.js';

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
let titleScene = new TitleScene(spriteCache, loadEncyclopedia());
let gameScene = null; // GameScene or QuizGameScene
let gameType = null; // 'explore' or 'quiz'
let stageClearScene = null;

// Transition
let transition = { active: false, alpha: 0, phase: 'none', nextAction: null };
const TRANSITION_SPEED = 3;

function startTransition(action) {
  transition.active = true;
  transition.alpha = 0;
  transition.phase = 'fadeOut';
  transition.nextAction = action;
}

function goToTitle() {
  startTransition(() => {
    titleScene = new TitleScene(spriteCache, loadEncyclopedia());
    currentScene = 'title';
    gameScene = null;
    gameType = null;
  });
}

// Auto-save interval
setInterval(() => {
  if ((currentScene === 'game' || currentScene === 'quiz') && gameScene) {
    writeSave(gameScene.getSaveData());
  }
}, 5000);

// Input
const input = new Input(canvas);
input.onTap((x, y) => {
  if (transition.active) return;

  if (currentScene === 'title') {
    const result = titleScene.handleTap(x, y, canvas.width, canvas.height);
    if (result === 'start' || result === 'continue') {
      const type = titleScene.selectedType;
      const idx = titleScene.selectedStage;

      if (result === 'start') clearSave();

      if (type === 'quiz') {
        startTransition(() => {
          gameScene = new QuizGameScene(canvas.width, canvas.height, safeTop, idx, spriteCache);
          if (result === 'continue') {
            const save = loadSave();
            if (save) gameScene.loadSaveData(save);
          }
          gameType = 'quiz';
          currentScene = 'quiz';
        });
      } else {
        startTransition(() => {
          gameScene = new GameScene(canvas.width, canvas.height, safeTop, idx, spriteCache);
          if (result === 'continue') {
            const save = loadSave();
            if (save) gameScene.loadSaveData(save);
          }
          gameType = 'explore';
          currentScene = 'game';
        });
      }
    }
  } else if (currentScene === 'game' && gameScene) {
    const result = gameScene.handleTap(x, y);
    if (result === 'stageClear') {
      const stats = gameScene.getStats();
      const stageId = STAGES[stats.stageIndex].id;
      updateEncyclopedia(stageId, gameScene.getDiscoveredIds());
      // Save completed words to encyclopedia
      if (gameScene.completedWords && gameScene.completedWords.length > 0) {
        const enc = loadEncyclopedia();
        enc[stageId + '_words'] = gameScene.completedWords;
        saveEncyclopedia(enc);
      }
      clearSave();

      startTransition(() => {
        stageClearScene = new RoundClearScene(canvas.width, canvas.height, stats);
        currentScene = 'stageClear';
      });
    }
  } else if (currentScene === 'quiz' && gameScene) {
    const result = gameScene.handleTap(x, y);
    if (result === 'quizComplete') {
      // Save quiz completion to encyclopedia
      const stats = gameScene.getStats();
      const stageId = QUIZ_STAGES[stats.quizIndex].id;
      const enc = loadEncyclopedia();
      enc[stageId] = { complete: true, solved: stats.solvedRounds };
      saveEncyclopedia(enc);
      clearSave();

      startTransition(() => {
        stats.discovered = stats.solvedRounds;
        stats.total = stats.totalRounds;
        stats.items = [];
        stageClearScene = new RoundClearScene(canvas.width, canvas.height, stats);
        currentScene = 'stageClear';
      });
    }
  } else if (currentScene === 'stageClear') {
    const result = stageClearScene.handleTap(x, y);
    if (result === 'nextStage') {
      if (gameType === 'explore') {
        const nextIdx = gameScene.stageIndex + 1;
        if (nextIdx < STAGES.length) {
          startTransition(() => {
            gameScene = new GameScene(canvas.width, canvas.height, safeTop, nextIdx, spriteCache);
            currentScene = 'game';
          });
        } else {
          goToTitle();
        }
      } else if (gameType === 'quiz') {
        const nextIdx = gameScene.quizIndex + 1;
        if (nextIdx < QUIZ_STAGES.length) {
          startTransition(() => {
            gameScene = new QuizGameScene(canvas.width, canvas.height, safeTop, nextIdx, spriteCache);
            currentScene = 'quiz';
          });
        } else {
          goToTitle();
        }
      } else {
        goToTitle();
      }
    } else if (result === 'home') {
      showHomeConfirm();
    } else if (result === 'menu') {
      goToTitle();
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
    } else if (currentScene === 'game' || currentScene === 'quiz') {
      gameScene.update(dt, canvas.width, canvas.height);
    } else if (currentScene === 'stageClear') {
      stageClearScene.update(dt);
    }

    // Draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (currentScene === 'title') {
      titleScene.draw(ctx, canvas.width, canvas.height);
    } else if (currentScene === 'game' || currentScene === 'quiz') {
      gameScene.draw(ctx, canvas.width, canvas.height);
    } else if (currentScene === 'stageClear') {
      stageClearScene.draw(ctx, canvas.width, canvas.height);
    }

    // Transition overlay
    if (transition.active && transition.alpha > 0) {
      ctx.save();
      ctx.fillStyle = `rgba(0,0,0,${transition.alpha * 0.6})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
  } catch (e) {
    console.error('[Encyclopedia Error]', e);
  }

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
