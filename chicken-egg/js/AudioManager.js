/**
 * Chicken-egg game audio - extends shared AudioManager with game-specific sounds
 */
import { AudioManager } from '../../shared/AudioManager.js';

class ChickenAudioManager extends AudioManager {
  getSoundFiles() {
    return {
      'cluck': 'assets/sounds/cluck.wav',
      'egg-pop': 'assets/sounds/egg-pop.wav',
      'golden-egg': 'assets/sounds/golden-egg.wav',
      'cheer': 'assets/sounds/cheer.wav',
      'peep': 'assets/sounds/peep.wav',
      'scared': 'assets/sounds/scared.wav',
      'steal': 'assets/sounds/steal.wav',
      'collect': 'assets/sounds/collect.wav',
      'warning': 'assets/sounds/warning.wav',
      'fanfare': 'assets/sounds/fanfare.wav',
      'combo': 'assets/sounds/combo.wav',
      'ending': 'assets/sounds/ending.wav',
    };
  }

  registerSynths() {
    this.registerSynth('cluck', this._synthCluck);
    this.registerSynth('egg-pop', this._synthEggPop);
    this.registerSynth('golden-egg', this._synthGoldenEgg);
    this.registerSynth('cheer', this._synthCheer);
    this.registerSynth('peep', this._synthPeep);
    this.registerSynth('scared', this._synthScared);
    this.registerSynth('steal', this._synthSteal);
    this.registerSynth('collect', this._synthCollect);
    this.registerSynth('warning', this._synthWarning);
    this.registerSynth('fanfare', this._synthFanfare);
    this.registerSynth('combo', this._synthComboTrill);
    this.registerSynth('ending', this._synthEnding);
  }

  _synthCluck() {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    const vol = 0.15 * this.volume;
    gain.gain.value = vol;
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    const noteDur = 0.08;
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.setValueAtTime(500, now + noteDur);
    osc.frequency.setValueAtTime(400, now + noteDur * 2);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.24);
    osc.start(now);
    osc.stop(now + 0.24);
  }

  _synthEggPop() {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const vol = 0.2 * this.volume;
    gain.gain.value = vol;
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.linearRampToValueAtTime(1000, now + 0.1);
    osc.frequency.linearRampToValueAtTime(1200, now + 0.2);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  _synthGoldenEgg() {
    this.playSequence([600, 800, 1000, 1200, 1400], 0.08, 'sine', 0.2);
  }

  _synthCheer() {
    this.playSequence([523.25, 659.25, 783.99, 1046.50], 0.12, 'sine', 0.2);
  }

  _synthPeep() {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const vol = 0.12 * this.volume;
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.linearRampToValueAtTime(2000, now + 0.18);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.18);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  _synthScared() {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    const vol = 0.15 * this.volume;
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.linearRampToValueAtTime(150, now + 0.3);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  _synthSteal() {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    const vol = this.volume;
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(200, now + 0.4);
    gain.gain.setValueAtTime(0.12 * vol, now);
    gain.gain.linearRampToValueAtTime(0.2 * vol, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  _synthCollect() {
    this.playNote(1000, 0.1, 'sine', 0.12);
  }

  _synthWarning() {
    this.playSequence([800, 600], 0.08, 'square', 0.15);
  }

  _synthFanfare() {
    this.playSequence([523, 659, 784, 1047, 1319], 0.1, 'sine', 0.2);
  }

  _synthComboTrill() {
    this.playSequence([800, 1000, 1200, 1400, 1600], 0.05, 'sine', 0.15);
  }

  _synthEnding() {
    this.playSequence([261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25], 0.2, 'sine', 0.2);
  }
}

export { ChickenAudioManager as AudioManager };
export const audio = new ChickenAudioManager();
