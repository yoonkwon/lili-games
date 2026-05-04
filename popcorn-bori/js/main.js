// Main entry — 보리랑 팝콘 만들기
import { GameEngine } from '../../shared/GameEngine.js';
import { LoadingScreen } from '../../shared/ui/LoadingScreen.js';
import { showHomeConfirm } from '../../shared/ui/HomeConfirm.js';
import { TitleScene } from './scene/TitleScene.js';
import { GameScene } from './scene/GameScene.js';
import { CelebrateScene } from './scene/CelebrateScene.js';

const engine = new GameEngine('game');

new LoadingScreen(engine.canvas, engine.ctx, {
  gradientStart: '#3a1f0a', gradientEnd: '#FFD93D', icon: '🍿',
}).start(
  Promise.resolve(),
  () => {
    engine.registerScene('title', new TitleScene());

    engine.onTap((x, y, sceneName) => {
      const scene = engine.currentScene;
      if (sceneName === 'title') {
        const result = scene.handleTap(x, y, engine.width, engine.height);
        if (result === 'start') {
          engine.transitionTo(() => engine.switchTo('game', new GameScene(engine.width, engine.height, engine.safeTop)));
        }
      } else if (sceneName === 'game') {
        scene.handleTap(x, y);
      } else if (sceneName === 'celebrate') {
        const result = scene.handleTap(x, y);
        if (result === 'restart') {
          engine.transitionTo(() => engine.switchTo('game', new GameScene(engine.width, engine.height, engine.safeTop)));
        } else if (result === 'home') {
          showHomeConfirm();
        }
      }
    });

    engine.onSceneResult((result) => {
      if (result === 'celebrate') {
        const stats = engine.currentScene.getStats();
        engine.transitionTo(() => engine.switchTo('celebrate', new CelebrateScene(engine.width, engine.height, stats)));
      }
    });

    engine.start('title');
  }
);
