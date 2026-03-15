// Main entry point - Elsa Baby game
import { GameEngine } from '../../shared/GameEngine.js';
import { LoadingScreen } from '../../shared/ui/LoadingScreen.js';
import { SaveManager } from '../../shared/SaveManager.js';
import { showHomeConfirm } from '../../shared/ui/HomeConfirm.js';
import { elsaAssetsReady } from './draw-elsa.js';
import { TitleScene } from './scene/TitleScene.js';
import { GameScene } from './scene/GameScene.js';
import { BornScene } from './scene/BornScene.js';

const save = new SaveManager('elsa-baby-save');

const engine = new GameEngine('game');

new LoadingScreen(engine.canvas, engine.ctx, {
  gradientStart: '#0d1b3e', gradientEnd: '#4fc3f7', icon: '❄️'
}).start(
  elsaAssetsReady.catch(() => console.warn('Some Elsa assets failed to load')),
  () => {
    engine.registerScene('title', new TitleScene());

    engine.onTap((x, y, scene) => {
      if (scene === 'title') {
        const result = engine.currentScene.handleTap(x, y, engine.width, engine.height);
        if (result === 'start') {
          save.clear();
          engine.transitionTo(() => engine.switchTo('game', new GameScene(engine.width, engine.height, engine.safeTop)));
        } else if (result === 'continue') {
          const saved = save.load();
          if (saved) {
            engine.transitionTo(() => {
              const gs = new GameScene(engine.width, engine.height, engine.safeTop);
              gs.loadSaveData(saved);
              engine.switchTo('game', gs);
            });
          }
        }
      } else if (scene === 'game') {
        engine.currentScene.handleTap(x, y);
      } else if (scene === 'born') {
        const result = engine.currentScene.handleTap(x, y);
        if (result === 'restart') {
          engine.transitionTo(() => engine.switchTo('title', new TitleScene()));
        } else if (result === 'home') {
          showHomeConfirm();
        }
      }
    });

    engine.onSceneResult((result) => {
      if (result === 'born') {
        save.clear();
        const stats = engine.currentScene.getStats();
        engine.transitionTo(() => engine.switchTo('born', new BornScene(engine.width, engine.height, stats)));
      }
    });

    // Auto-save periodically
    let lastSavedGrowth = -1;
    setInterval(() => {
      if (engine.currentSceneName !== 'game' || !engine.currentScene) return;
      const g = engine.currentScene.growth;
      if (g !== lastSavedGrowth && g > 0) {
        lastSavedGrowth = g;
        save.write(engine.currentScene.getSaveData());
      }
    }, 5000);

    engine.start('title');
  }
);
