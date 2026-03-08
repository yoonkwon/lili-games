// audio.js - Web Audio API sound synthesis for chicken egg game

let audioCtx = null;
let bgmPlaying = false;
let bgmStopFn = null;

export function ensureAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playNote(freq, duration, type = 'sine', vol = 0.2) {
  const ctx = ensureAudio();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = vol;

  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;
  osc.start(now);
  gain.gain.setValueAtTime(vol, now);
  gain.gain.linearRampToValueAtTime(0, now + duration);
  osc.stop(now + duration);

  return { osc, gain, now };
}

// 꼬꼬꼬 sound: 600 -> 500 -> 400 Hz square wave, 240ms total, vol 15%
export function playCluck() {
  const ctx = ensureAudio();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'square';
  gain.gain.value = 0.15;

  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;
  const noteDur = 0.08;

  osc.frequency.setValueAtTime(600, now);
  osc.frequency.setValueAtTime(500, now + noteDur);
  osc.frequency.setValueAtTime(400, now + noteDur * 2);

  gain.gain.setValueAtTime(0.15, now);
  gain.gain.linearRampToValueAtTime(0, now + 0.24);

  osc.start(now);
  osc.stop(now + 0.24);
}

// Egg laid pop: 800 -> 1000 -> 1200 Hz sine, 200ms, vol 20%
export function playEggPop() {
  const ctx = ensureAudio();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  gain.gain.value = 0.2;

  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;

  osc.frequency.setValueAtTime(800, now);
  osc.frequency.linearRampToValueAtTime(1000, now + 0.1);
  osc.frequency.linearRampToValueAtTime(1200, now + 0.2);

  gain.gain.setValueAtTime(0.2, now);
  gain.gain.linearRampToValueAtTime(0, now + 0.2);

  osc.start(now);
  osc.stop(now + 0.2);
}

// Golden egg: 600 -> 1400 Hz, 5 ascending notes, 400ms total, vol 20%
export function playGoldenEgg() {
  const ctx = ensureAudio();
  const noteDur = 0.08;
  const frequencies = [600, 800, 1000, 1200, 1400];

  frequencies.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;

    osc.connect(gain);
    gain.connect(ctx.destination);

    const startTime = ctx.currentTime + i * noteDur;
    gain.gain.setValueAtTime(0.2, startTime);
    gain.gain.linearRampToValueAtTime(0, startTime + noteDur);

    osc.start(startTime);
    osc.stop(startTime + noteDur);
  });
}

// Celebration cheer: 도(C) -> 미(E) -> 솔(G) -> 높은도(C5) sine, 480ms, vol 20%
export function playCheer() {
  const ctx = ensureAudio();
  const noteDur = 0.12;
  const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

  frequencies.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;

    osc.connect(gain);
    gain.connect(ctx.destination);

    const startTime = ctx.currentTime + i * noteDur;
    gain.gain.setValueAtTime(0.2, startTime);
    gain.gain.linearRampToValueAtTime(0, startTime + noteDur);

    osc.start(startTime);
    osc.stop(startTime + noteDur);
  });
}

// Chick peep: 1800 -> 2000 Hz sine, 180ms, vol 12%
export function playPeep() {
  const ctx = ensureAudio();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';

  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;

  osc.frequency.setValueAtTime(1800, now);
  osc.frequency.linearRampToValueAtTime(2000, now + 0.18);

  gain.gain.setValueAtTime(0.12, now);
  gain.gain.linearRampToValueAtTime(0, now + 0.18);

  osc.start(now);
  osc.stop(now + 0.18);
}

// Predator flee / scared: 200 -> 150 Hz sawtooth, 300ms, vol 15%
export function playScared() {
  const ctx = ensureAudio();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';

  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;

  osc.frequency.setValueAtTime(200, now);
  osc.frequency.linearRampToValueAtTime(150, now + 0.3);

  gain.gain.setValueAtTime(0.15, now);
  gain.gain.linearRampToValueAtTime(0, now + 0.3);

  osc.start(now);
  osc.stop(now + 0.3);
}

// Egg stolen: 300 -> 200 Hz square, 400ms, vol 20% - gentle, not scary
export function playSteal() {
  const ctx = ensureAudio();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'square';

  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;

  osc.frequency.setValueAtTime(300, now);
  osc.frequency.linearRampToValueAtTime(200, now + 0.4);

  // Gentle fade: start softer and ease out smoothly
  gain.gain.setValueAtTime(0.12, now);
  gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

  osc.start(now);
  osc.stop(now + 0.4);
}

// Ending melody: 도레미파솔라시도 (C D E F G A B C) sine, 1.6s, vol 20%
export function playEnding() {
  const ctx = ensureAudio();
  const noteDur = 0.2;
  // C4, D4, E4, F4, G4, A4, B4, C5
  const frequencies = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];

  frequencies.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;

    osc.connect(gain);
    gain.connect(ctx.destination);

    const startTime = ctx.currentTime + i * noteDur;
    gain.gain.setValueAtTime(0.2, startTime);
    gain.gain.linearRampToValueAtTime(0, startTime + noteDur);

    osc.start(startTime);
    osc.stop(startTime + noteDur);
  });
}

// Collect egg: soft clink, 1000Hz sine, 100ms, vol 12%
export function playCollect() {
  playNote(1000, 0.1, 'sine', 0.12);
}

// Predator approach warning: two short descending notes, square, 80ms each, vol 15%
export function playWarning() {
  const ctx = ensureAudio();
  const noteDur = 0.08;

  [800, 600].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.value = freq;

    osc.connect(gain);
    gain.connect(ctx.destination);

    const startTime = ctx.currentTime + i * noteDur;
    gain.gain.setValueAtTime(0.15, startTime);
    gain.gain.linearRampToValueAtTime(0, startTime + noteDur);

    osc.start(startTime);
    osc.stop(startTime + noteDur);
  });
}

// Milestone/unlock fanfare: 5 ascending notes, sine, 100ms each, vol 20%
export function playFanfare() {
  const ctx = ensureAudio();
  const noteDur = 0.1;
  const frequencies = [523, 659, 784, 1047, 1319]; // C5, E5, G5, C6, E6

  frequencies.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;

    osc.connect(gain);
    gain.connect(ctx.destination);

    const startTime = ctx.currentTime + i * noteDur;
    gain.gain.setValueAtTime(0.2, startTime);
    gain.gain.linearRampToValueAtTime(0, startTime + noteDur);

    osc.start(startTime);
    osc.stop(startTime + noteDur);
  });
}

// Background music loop: pentatonic melody, sine, vol 6%, loops continuously
export function playBgm() {
  if (bgmPlaying) return bgmStopFn;
  bgmPlaying = true;

  const ctx = ensureAudio();
  const noteDur = 0.3;
  // Pentatonic melody: C4, E4, G4, A4, G4, E4, C4, D4
  const frequencies = [261.63, 329.63, 392.00, 440.00, 392.00, 329.63, 261.63, 293.66];
  const loopDuration = frequencies.length * noteDur;

  let scheduledOscs = [];
  let timerId = null;

  function scheduleLoop() {
    if (!bgmPlaying) return;
    const now = ctx.currentTime;

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      osc.connect(gain);
      gain.connect(ctx.destination);

      const startTime = now + i * noteDur;
      gain.gain.setValueAtTime(0.06, startTime);
      gain.gain.linearRampToValueAtTime(0, startTime + noteDur);

      osc.start(startTime);
      osc.stop(startTime + noteDur);
      scheduledOscs.push(osc);
    });

    // Schedule next loop slightly before current one ends
    timerId = setTimeout(() => {
      scheduledOscs = [];
      scheduleLoop();
    }, loopDuration * 1000 - 50);
  }

  scheduleLoop();

  bgmStopFn = function stopBgmInternal() {
    bgmPlaying = false;
    if (timerId) clearTimeout(timerId);
    scheduledOscs.forEach(osc => {
      try { osc.stop(); } catch (e) { /* already stopped */ }
    });
    scheduledOscs = [];
    bgmStopFn = null;
  };

  return bgmStopFn;
}

// Stop background music and reset flag
export function stopBgm() {
  if (bgmStopFn) {
    bgmStopFn();
  } else {
    bgmPlaying = false;
  }
}

// Combo milestone sound: rising pitch trill, sine, vol 15%
export function playComboTrill() {
  const ctx = ensureAudio();
  const noteDur = 0.05;
  const frequencies = [800, 1000, 1200, 1400, 1600];

  frequencies.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;

    osc.connect(gain);
    gain.connect(ctx.destination);

    const startTime = ctx.currentTime + i * noteDur;
    gain.gain.setValueAtTime(0.15, startTime);
    gain.gain.linearRampToValueAtTime(0, startTime + noteDur);

    osc.start(startTime);
    osc.stop(startTime + noteDur);
  });
}

// Haptic feedback vibration (30ms)
export function playVibrate() {
  try {
    if (navigator && navigator.vibrate) {
      navigator.vibrate(30);
    }
  } catch (e) {
    // Vibration API not available
  }
}
