/**
 * Game engine - canvas setup, game loop, scene management, transitions
 *
 * Usage:
 *   const engine = new GameEngine('game'); // canvas element id
 *   engine.registerScene('title', new TitleScene());
 *   engine.onTap((x, y, sceneName) => { ... });
 *   engine.start('title');
 */
export class GameEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.safeTop = 0;
    this.scenes = {};
    this.currentScene = null;
    this.currentSceneName = null;
    this.paused = false;
    this.lastTime = 0;

    // Transition state
    this.transition = { active: false, alpha: 0, phase: 'none', nextAction: null };
    this.transitionSpeed = 3;

    // Callbacks
    this._tapHandler = null;
    this._drawOverlay = null;

    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  _resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    const style = getComputedStyle(document.body);
    this.safeTop = parseInt(style.getPropertyValue('--sat')) || 0;
  }

  get width() { return this.canvas.width; }
  get height() { return this.canvas.height; }

  registerScene(name, scene) {
    this.scenes[name] = scene;
  }

  switchTo(name, scene) {
    if (scene) this.scenes[name] = scene;
    this.currentSceneName = name;
    this.currentScene = this.scenes[name];
  }

  transitionTo(action) {
    this.transition.active = true;
    this.transition.alpha = 0;
    this.transition.phase = 'fadeOut';
    this.transition.nextAction = action;
  }

  onTap(handler) {
    this._tapHandler = handler;
  }

  setDrawOverlay(fn) {
    this._drawOverlay = fn;
  }

  start(sceneName) {
    if (sceneName) {
      this.currentSceneName = sceneName;
      this.currentScene = this.scenes[sceneName];
    }
    requestAnimationFrame((ts) => this._loop(ts));
  }

  _loop(timestamp) {
    try {
      const dt = Math.min(0.05, (timestamp - (this.lastTime || timestamp)) / 1000);
      this.lastTime = timestamp;

      // Update transition
      if (this.transition.active) {
        if (this.transition.phase === 'fadeOut') {
          this.transition.alpha = Math.min(1, this.transition.alpha + dt * this.transitionSpeed);
          if (this.transition.alpha >= 1) {
            if (this.transition.nextAction) this.transition.nextAction();
            this.transition.phase = 'fadeIn';
          }
        } else if (this.transition.phase === 'fadeIn') {
          this.transition.alpha = Math.max(0, this.transition.alpha - dt * this.transitionSpeed);
          if (this.transition.alpha <= 0) {
            this.transition.active = false;
            this.transition.phase = 'none';
          }
        }
      }

      // Update current scene
      if (!this.paused && this.currentScene) {
        const result = this.currentScene.update(dt, this.width, this.height);
        if (this._onSceneResult && result) {
          this._onSceneResult(result, this.currentSceneName);
        }
      }

      // Draw
      this.ctx.clearRect(0, 0, this.width, this.height);
      if (this.currentScene) {
        this.currentScene.draw(this.ctx, this.width, this.height);
      }

      // Custom overlay (pause menu, etc.)
      if (this._drawOverlay) {
        this._drawOverlay(this.ctx, this.width, this.height);
      }

      // Transition overlay
      if (this.transition.active && this.transition.alpha > 0) {
        this.ctx.save();
        this.ctx.fillStyle = `rgba(0,0,0,${this.transition.alpha * 0.6})`;
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.restore();
      }
    } catch (e) {
      console.error('[GameEngine Error]', e);
    }

    requestAnimationFrame((ts) => this._loop(ts));
  }

  onSceneResult(handler) {
    this._onSceneResult = handler;
  }
}
