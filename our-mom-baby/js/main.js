// Main entry point - Our Mom Baby game
import { GameEngine } from '../../shared/GameEngine.js';
import { LoadingScreen } from '../../shared/ui/LoadingScreen.js';
import { SaveManager } from '../../shared/SaveManager.js';
import { showHomeConfirm } from '../../shared/ui/HomeConfirm.js';
import { assetsReady } from './draw-mom.js';
import { TitleScene } from './scene/TitleScene.js';
import { GameScene } from './scene/GameScene.js';
import { BornScene } from './scene/BornScene.js';

let currentMode = 'ria';
function getSave() { return new SaveManager(`our-mom-${currentMode}-save`); }

const engine = new GameEngine('game');

new LoadingScreen(engine.canvas, engine.ctx, {
  gradientStart: '#3a1a2a', gradientEnd: '#FFB6C1', icon: '💕'
}).start(
  assetsReady.catch(() => console.warn('Some assets failed to load')),
  () => {
    engine.registerScene('title', new TitleScene());

    engine.onTap((x, y, scene) => {
      if (scene === 'title') {
        const result = engine.currentScene.handleTap(x, y, engine.width, engine.height);
        if (result === 'select-ria' || result === 'select-lisa') {
          currentMode = result === 'select-ria' ? 'ria' : 'lisa';
          const save = getSave();
          const saved = save.load();
          if (saved) {
            // Has save data - go to continue
            engine.transitionTo(() => {
              const gs = new GameScene(engine.width, engine.height, engine.safeTop, currentMode);
              gs.loadSaveData(saved);
              engine.switchTo('game', gs);
            });
          } else {
            save.clear();
            engine.transitionTo(() => engine.switchTo('game', new GameScene(engine.width, engine.height, engine.safeTop, currentMode)));
          }
        }
      } else if (scene === 'game') {
        engine.currentScene.handleTap(x, y);
      } else if (scene === 'born') {
        const result = engine.currentScene.handleTap(x, y);
        if (result === 'restart') {
          engine.transitionTo(() => {
            if (engine.currentScene && engine.currentScene.destroy) engine.currentScene.destroy();
            engine.switchTo('title', new TitleScene());
          });
        } else if (result === 'home') {
          showHomeConfirm();
        }
      }
    });

    engine.onSceneResult((result) => {
      if (result === 'born') {
        getSave().clear();
        const stats = engine.currentScene.getStats();
        if (engine.currentScene.destroy) engine.currentScene.destroy();
        engine.transitionTo(() => engine.switchTo('born', new BornScene(engine.width, engine.height, stats)));
      }
    });

    // Auto-save
    let lastSavedGrowth = -1;
    setInterval(() => {
      if (engine.currentSceneName !== 'game' || !engine.currentScene) return;
      const g = engine.currentScene.growth;
      if (g !== lastSavedGrowth && g > 0) {
        lastSavedGrowth = g;
        getSave().write(engine.currentScene.getSaveData());
      }
    }, 5000);

    engine.start('title');
  }
);
