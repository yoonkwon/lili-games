// Main entry point - Snow White Baby game
import { GameEngine } from '../../shared/GameEngine.js';
import { LoadingScreen } from '../../shared/ui/LoadingScreen.js';
import { SaveManager } from '../../shared/SaveManager.js';
import { showHomeConfirm } from '../../shared/ui/HomeConfirm.js';
import { snowWhiteAssetsReady } from './draw-snow-white.js';
import { TitleScene } from './scene/TitleScene.js';
import { GameScene } from './scene/GameScene.js';
import { BornScene } from './scene/BornScene.js';

const save = new SaveManager('snow-white-baby-save');

const engine = new GameEngine('game');

new LoadingScreen(engine.canvas, engine.ctx, {
  gradientStart: '#2d5016', gradientEnd: '#90EE90', icon: '🌸'
}).start(
  snowWhiteAssetsReady.catch(() => console.warn('Some Snow White assets failed to load')),
  () => {
    engine.registerScene('title', new TitleScene());

    engine.onTap((x, y, scene) => {
      if (scene === 'title') {
        const result = engine.currentScene.handleTap(x, y, engine.width, engine.height);
        if (result === 'start') {
          save.clear();
          engine.transitionTo(() => engine.switchTo('game', new GameScene(engine.width, engine.height, engine.safeTop)));
        } else if (result === 'continue') {
          const savedData = save.load();
          if (savedData) {
            engine.transitionTo(() => {
              const gs = new GameScene(engine.width, engine.height, engine.safeTop);
              gs.loadSaveData(savedData);
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
      if (engine.currentSceneName === 'game' && engine.currentScene) {
        const g = engine.currentScene.growth;
        if (g !== lastSavedGrowth && g > 0) {
          lastSavedGrowth = g;
          save.write(engine.currentScene.getSaveData());
        }
      }
    }, 5000);

    engine.start('title');
  }
);
