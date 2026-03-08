/**
 * AudioManager - Class-based audio system with file loading and synth fallback.
 * Replaces procedural audio.js with support for loading audio files.
 */

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.sounds = new Map();
    this.bgmPlaying = false;
    this.bgmStopFn = null;
    this.muted = false;
    this.volume = 0.5;
  }

  async init() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    await this._loadSounds();
  }

  ensureContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this._loadSounds(); // Load WAV files on first user interaction
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  async _loadSounds() {
    const soundFiles = {
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

    for (const [name, path] of Object.entries(soundFiles)) {
      try {
        const response = await fetch(path);
        if (response.ok) {
          const buffer = await response.arrayBuffer();
          this.sounds.set(name, await this.ctx.decodeAudioData(buffer));
        }
      } catch (e) {
        // File not found - will use synth fallback
      }
    }
  }

  play(name) {
    if (this.muted) return;
    this.ensureContext();

    const buffer = this.sounds.get(name);
    if (buffer) {
      const source = this.ctx.createBufferSource();
      const gain = this.ctx.createGain();
      source.buffer = buffer;
      gain.gain.value = this.volume;
      source.connect(gain);
      gain.connect(this.ctx.destination);
      source.start();
      return;
    }

    // Fallback to synthesized sound
    this._playSynth(name);
  }

  _playSynth(name) {
    switch (name) {
      case 'cluck': this._synthCluck(); break;
      case 'egg-pop': this._synthEggPop(); break;
      case 'golden-egg': this._synthGoldenEgg(); break;
      case 'cheer': this._synthCheer(); break;
      case 'peep': this._synthPeep(); break;
      case 'scared': this._synthScared(); break;
      case 'steal': this._synthSteal(); break;
      case 'collect': this._synthCollect(); break;
      case 'warning': this._synthWarning(); break;
      case 'fanfare': this._synthFanfare(); break;
      case 'combo': this._synthComboTrill(); break;
      case 'ending': this._synthEnding(); break;
    }
  }

  _playNote(freq, duration, type = 'sine', vol = 0.2) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = vol * this.volume;

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    osc.start(now);
    gain.gain.setValueAtTime(vol * this.volume, now);
    gain.gain.linearRampToValueAtTime(0, now + duration);
    osc.stop(now + duration);

    return { osc, gain, now };
  }

  // 꼬꼬꼬 sound: 600 -> 500 -> 400 Hz square wave, 240ms total
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

  // Egg laid pop: 800 -> 1000 -> 1200 Hz sine, 200ms
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

  // Golden egg: 5 ascending notes 600-1400 Hz
  _synthGoldenEgg() {
    const ctx = this.ctx;
    const noteDur = 0.08;
    const frequencies = [600, 800, 1000, 1200, 1400];
    const vol = 0.2 * this.volume;

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      osc.connect(gain);
      gain.connect(ctx.destination);

      const startTime = ctx.currentTime + i * noteDur;
      gain.gain.setValueAtTime(vol, startTime);
      gain.gain.linearRampToValueAtTime(0, startTime + noteDur);

      osc.start(startTime);
      osc.stop(startTime + noteDur);
    });
  }

  // Celebration cheer: C5 E5 G5 C6
  _synthCheer() {
    const ctx = this.ctx;
    const noteDur = 0.12;
    const frequencies = [523.25, 659.25, 783.99, 1046.50];
    const vol = 0.2 * this.volume;

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      osc.connect(gain);
      gain.connect(ctx.destination);

      const startTime = ctx.currentTime + i * noteDur;
      gain.gain.setValueAtTime(vol, startTime);
      gain.gain.linearRampToValueAtTime(0, startTime + noteDur);

      osc.start(startTime);
      osc.stop(startTime + noteDur);
    });
  }

  // Chick peep: 1800 -> 2000 Hz sine, 180ms
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

  // Predator flee: 200 -> 150 Hz sawtooth, 300ms
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

  // Egg stolen: 300 -> 200 Hz square, 400ms
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

  // Collect egg: soft clink, 1000Hz sine, 100ms
  _synthCollect() {
    this._playNote(1000, 0.1, 'sine', 0.12);
  }

  // Warning: two descending notes 800, 600 Hz
  _synthWarning() {
    const ctx = this.ctx;
    const noteDur = 0.08;
    const vol = 0.15 * this.volume;

    [800, 600].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.value = freq;

      osc.connect(gain);
      gain.connect(ctx.destination);

      const startTime = ctx.currentTime + i * noteDur;
      gain.gain.setValueAtTime(vol, startTime);
      gain.gain.linearRampToValueAtTime(0, startTime + noteDur);

      osc.start(startTime);
      osc.stop(startTime + noteDur);
    });
  }

  // Fanfare: 5 ascending notes C5 E5 G5 C6 E6
  _synthFanfare() {
    const ctx = this.ctx;
    const noteDur = 0.1;
    const frequencies = [523, 659, 784, 1047, 1319];
    const vol = 0.2 * this.volume;

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      osc.connect(gain);
      gain.connect(ctx.destination);

      const startTime = ctx.currentTime + i * noteDur;
      gain.gain.setValueAtTime(vol, startTime);
      gain.gain.linearRampToValueAtTime(0, startTime + noteDur);

      osc.start(startTime);
      osc.stop(startTime + noteDur);
    });
  }

  // Combo trill: rising pitch 800-1600 Hz
  _synthComboTrill() {
    const ctx = this.ctx;
    const noteDur = 0.05;
    const frequencies = [800, 1000, 1200, 1400, 1600];
    const vol = 0.15 * this.volume;

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      osc.connect(gain);
      gain.connect(ctx.destination);

      const startTime = ctx.currentTime + i * noteDur;
      gain.gain.setValueAtTime(vol, startTime);
      gain.gain.linearRampToValueAtTime(0, startTime + noteDur);

      osc.start(startTime);
      osc.stop(startTime + noteDur);
    });
  }

  // Ending melody: C D E F G A B C scale
  _synthEnding() {
    const ctx = this.ctx;
    const noteDur = 0.2;
    const frequencies = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
    const vol = 0.2 * this.volume;

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      osc.connect(gain);
      gain.connect(ctx.destination);

      const startTime = ctx.currentTime + i * noteDur;
      gain.gain.setValueAtTime(vol, startTime);
      gain.gain.linearRampToValueAtTime(0, startTime + noteDur);

      osc.start(startTime);
      osc.stop(startTime + noteDur);
    });
  }

  // ─── BGM ───────────────────────────────────────────────────────

  playBgm() {
    if (this.bgmPlaying) return this.bgmStopFn;
    this.bgmPlaying = true;
    this.ensureContext();

    const ctx = this.ctx;
    const noteDur = 0.3;
    const frequencies = [261.63, 329.63, 392.00, 440.00, 392.00, 329.63, 261.63, 293.66];
    const loopDuration = frequencies.length * noteDur;
    const vol = 0.06 * this.volume;

    let scheduledOscs = [];
    let timerId = null;

    const scheduleLoop = () => {
      if (!this.bgmPlaying) return;
      const now = ctx.currentTime;

      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = freq;

        osc.connect(gain);
        gain.connect(ctx.destination);

        const startTime = now + i * noteDur;
        gain.gain.setValueAtTime(vol, startTime);
        gain.gain.linearRampToValueAtTime(0, startTime + noteDur);

        osc.start(startTime);
        osc.stop(startTime + noteDur);
        scheduledOscs.push(osc);
      });

      timerId = setTimeout(() => {
        scheduledOscs = [];
        scheduleLoop();
      }, loopDuration * 1000 - 50);
    };

    scheduleLoop();

    this.bgmStopFn = () => {
      this.bgmPlaying = false;
      if (timerId) clearTimeout(timerId);
      scheduledOscs.forEach(osc => {
        try { osc.stop(); } catch (e) { /* already stopped */ }
      });
      scheduledOscs = [];
      this.bgmStopFn = null;
    };

    return this.bgmStopFn;
  }

  stopBgm() {
    if (this.bgmStopFn) {
      this.bgmStopFn();
    } else {
      this.bgmPlaying = false;
    }
  }

  // ─── Vibration ─────────────────────────────────────────────────

  vibrate(ms = 30) {
    try {
      if (navigator && navigator.vibrate) {
        navigator.vibrate(ms);
      }
    } catch (e) {
      // Vibration API not available
    }
  }

  // ─── Volume / Mute ────────────────────────────────────────────

  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, v));
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }
}

// Singleton export
export const audio = new AudioManager();
