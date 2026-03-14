// Main entry point - Mermaid Baby game
import { GameEngine } from '../../shared/GameEngine.js';
import { LoadingScreen } from '../../shared/ui/LoadingScreen.js';
import { mermaidAssetsReady } from './draw-mermaid.js';
import { TitleScene } from './scene/TitleScene.js';
import { GameScene } from './scene/GameScene.js';
import { BornScene } from './scene/BornScene.js';

const engine = new GameEngine('game');

new LoadingScreen(engine.canvas, engine.ctx, {
  gradientStart: '#0a1628', gradientEnd: '#1a6b8a', icon: '🫧'
}).start(
  mermaidAssetsReady.catch(() => console.warn('Some Mermaid assets failed to load')),
  () => {
    engine.registerScene('title', new TitleScene());

    engine.onTap((x, y, scene) => {
      if (scene === 'title') {
        if (engine.currentScene.handleTap(x, y, engine.width, engine.height) === 'start') {
          engine.transitionTo(() => engine.switchTo('game', new GameScene(engine.width, engine.height, engine.safeTop)));
        }
      } else if (scene === 'game') {
        engine.currentScene.handleTap(x, y);
      } else if (scene === 'born') {
        if (engine.currentScene.handleTap(x, y) === 'restart') {
          engine.transitionTo(() => engine.switchTo('title', new TitleScene()));
        }
      }
    });

    engine.onSceneResult((result) => {
      if (result === 'born') {
        const stats = engine.currentScene.getStats();
        engine.transitionTo(() => engine.switchTo('born', new BornScene(engine.width, engine.height, stats)));
      }
    });

    engine.start('title');
  }
);
