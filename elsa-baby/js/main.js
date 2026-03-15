// Main entry point - Elsa Baby game
import { GameEngine } from '../../shared/GameEngine.js';
import { LoadingScreen } from '../../shared/ui/LoadingScreen.js';
import { elsaAssetsReady } from './draw-elsa.js';
import { TitleScene } from './scene/TitleScene.js';
import { GameScene } from './scene/GameScene.js';
import { BornScene } from './scene/BornScene.js';

const SAVE_KEY = 'elsa-baby-save';
function loadSave() {
  try { const r = localStorage.getItem(SAVE_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}
function writeSave(data) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
}
function clearSave() { localStorage.removeItem(SAVE_KEY); }

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
          clearSave();
          engine.transitionTo(() => engine.switchTo('game', new GameScene(engine.width, engine.height, engine.safeTop)));
        } else if (result === 'continue') {
          const save = loadSave();
          if (save) {
            engine.transitionTo(() => {
              const gs = new GameScene(engine.width, engine.height, engine.safeTop);
              gs.loadSaveData(save);
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
        clearSave();
        const stats = engine.currentScene.getStats();
        engine.transitionTo(() => engine.switchTo('born', new BornScene(engine.width, engine.height, stats)));
      }
    });

    // Auto-save periodically
    let lastSavedGrowth = -1;
    const originalUpdate = engine._update;
    if (engine._update) {
      // Can't hook update easily - use setInterval instead
    }
    setInterval(() => {
      if (engine.currentSceneName === 'game' && engine.currentScene) {
        const g = engine.currentScene.growth;
        if (g !== lastSavedGrowth && g > 0) {
          lastSavedGrowth = g;
          writeSave(engine.currentScene.getSaveData());
        }
      }
    }, 5000);

    engine.start('title');
  }
);
