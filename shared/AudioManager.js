/**
 * Audio manager base class - Web Audio API with file loading + synth fallback
 * Extend this class and override registerSounds() and registerSynths() for each game
 */
export class AudioManager {
  constructor() {
    this.ctx = null;
    this.sounds = new Map();
    this.synths = new Map();
    this.bgmPlaying = false;
    this.bgmStopFn = null;
    this.muted = false;
    this.volume = 0.5;
  }

  /**
   * Override to return { name: path } map of sound files
   * @returns {Object.<string, string>}
   */
  getSoundFiles() {
    return {};
  }

  /**
   * Override to register synth fallbacks via this.registerSynth(name, fn)
   */
  registerSynths() {
    // override in subclass
  }

  registerSynth(name, fn) {
    this.synths.set(name, fn.bind(this));
  }

  async init() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.registerSynths();
    await this._loadSounds();
  }

  ensureContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.registerSynths();
      this._loadSounds();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  async _loadSounds() {
    const soundFiles = this.getSoundFiles();
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

    // Fallback to synth
    const synthFn = this.synths.get(name);
    if (synthFn) synthFn();
  }

  playNote(freq, duration, type = 'sine', vol = 0.2) {
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

  playSequence(frequencies, noteDur, type = 'sine', vol = 0.2) {
    const ctx = this.ctx;
    const v = vol * this.volume;

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.value = freq;

      osc.connect(gain);
      gain.connect(ctx.destination);

      const startTime = ctx.currentTime + i * noteDur;
      gain.gain.setValueAtTime(v, startTime);
      gain.gain.linearRampToValueAtTime(0, startTime + noteDur);

      osc.start(startTime);
      osc.stop(startTime + noteDur);
    });
  }

  // ─── BGM ──────────────────────────────────────────

  /**
   * Override to return { frequencies: number[], noteDur: number, type: string, vol: number }
   */
  getBgmConfig() {
    return {
      frequencies: [261.63, 329.63, 392.00, 440.00, 392.00, 329.63, 261.63, 293.66],
      noteDur: 0.3,
      type: 'sine',
      vol: 0.06,
    };
  }

  playBgm() {
    if (this.bgmPlaying) return this.bgmStopFn;
    this.bgmPlaying = true;
    this.ensureContext();

    const ctx = this.ctx;
    const config = this.getBgmConfig();
    const { frequencies, noteDur, type, vol } = config;
    const loopDuration = frequencies.length * noteDur;
    const v = vol * this.volume;

    let scheduledOscs = [];
    let timerId = null;

    const scheduleLoop = () => {
      if (!this.bgmPlaying) return;
      const now = ctx.currentTime;

      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.value = freq;

        osc.connect(gain);
        gain.connect(ctx.destination);

        const startTime = now + i * noteDur;
        gain.gain.setValueAtTime(v, startTime);
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

  // ─── Vibration ────────────────────────────────────

  vibrate(ms = 30) {
    try {
      if (navigator && navigator.vibrate) {
        navigator.vibrate(ms);
      }
    } catch (e) {
      // Vibration API not available
    }
  }

  // ─── Volume / Mute ───────────────────────────────

  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, v));
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }
}
