#!/usr/bin/env node
/**
 * Game sound effect generator - produces WAV files for all 12 game sounds.
 * Enhanced sfxr-style synthesis with harmonics, noise, and proper envelopes.
 */
const fs = require('fs');
const path = require('path');

const SR = 44100;
const outDir = path.join(__dirname, 'assets', 'sounds');

// ── Utilities ──────────────────────────────────────────────────

function lerp(a, b, t) { return a + (b - a) * Math.max(0, Math.min(1, t)); }
function clamp(v) { return Math.max(-1, Math.min(1, v)); }

function sine(phase) { return Math.sin(phase); }
function square(phase) { return Math.sin(phase) >= 0 ? 0.8 : -0.8; }
function sawtooth(phase) { return ((phase / (2 * Math.PI)) % 1) * 2 - 1; }
function triangle(phase) { return Math.abs(((phase / (2 * Math.PI)) % 1) * 4 - 2) - 1; }
function noise() { return Math.random() * 2 - 1; }

// ADSR envelope
function adsr(t, a, d, s, r, dur) {
  if (t < a) return t / a;
  if (t < a + d) return 1 - (1 - s) * ((t - a) / d);
  if (t < dur - r) return s;
  if (t < dur) return s * (1 - (t - (dur - r)) / r);
  return 0;
}

// Generate samples
function render(duration, fn) {
  const n = Math.ceil(SR * duration);
  const buf = new Float32Array(n);
  for (let i = 0; i < n; i++) buf[i] = clamp(fn(i / SR, i));
  return buf;
}

// Concatenate sample buffers
function concat(...buffers) {
  const total = buffers.reduce((s, b) => s + b.length, 0);
  const out = new Float32Array(total);
  let offset = 0;
  for (const b of buffers) { out.set(b, offset); offset += b.length; }
  return out;
}

// Mix buffers (same length assumed or padded)
function mix(...buffers) {
  const len = Math.max(...buffers.map(b => b.length));
  const out = new Float32Array(len);
  for (const b of buffers) {
    for (let i = 0; i < b.length; i++) out[i] += b[i];
  }
  return out;
}

// Write WAV file
function writeWav(filename, samples) {
  // Normalize to avoid clipping
  let peak = 0;
  for (let i = 0; i < samples.length; i++) peak = Math.max(peak, Math.abs(samples[i]));
  const norm = peak > 1 ? 0.95 / peak : 1;

  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);    // PCM
  buf.writeUInt16LE(1, 22);    // mono
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(n * 2, 40);

  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.round(clamp(samples[i] * norm) * 32767), 44 + i * 2);
  }

  const filepath = path.join(outDir, filename);
  fs.writeFileSync(filepath, buf);
  console.log(`  ✓ ${filename} (${(buf.length / 1024).toFixed(1)}KB, ${(n / SR * 1000).toFixed(0)}ms)`);
}

// ── Sound Generators ────────────────────────────────────────────

function genCluck() {
  // Chicken cluck: square wave burst with frequency drop + noise
  const dur = 0.28;
  return render(dur, (t) => {
    const p = t / dur;
    // Three distinct "bawk" notes
    let freq;
    if (p < 0.3) freq = 580 + Math.sin(t * 60) * 40;
    else if (p < 0.6) freq = 480 + Math.sin(t * 50) * 30;
    else freq = 380 + Math.sin(t * 40) * 20;

    const phase = 2 * Math.PI * freq * t;
    const env = adsr(t, 0.005, 0.02, 0.6, 0.05, dur);
    const sig = square(phase) * 0.5 + sine(phase * 2) * 0.2 + noise() * 0.08;
    return sig * env * 0.4;
  });
}

function genEggPop() {
  // Bright pop: quick rising sine + click transient
  const dur = 0.22;
  return render(dur, (t) => {
    const p = t / dur;
    const freq = lerp(700, 1400, p * p);
    const phase = 2 * Math.PI * freq * t;
    const env = adsr(t, 0.002, 0.05, 0.3, 0.08, dur);
    // Click transient at start
    const click = t < 0.005 ? noise() * 0.6 * (1 - t / 0.005) : 0;
    return (sine(phase) * 0.5 + sine(phase * 2) * 0.15 + click) * env;
  });
}

function genGoldenEgg() {
  // Sparkly ascending arpeggio with shimmer
  const freqs = [659, 880, 1047, 1319, 1568]; // E5 A5 C6 E6 G6
  const noteDur = 0.09;
  const dur = freqs.length * noteDur + 0.15;
  return render(dur, (t) => {
    let sig = 0;
    for (let i = 0; i < freqs.length; i++) {
      const start = i * noteDur;
      const lt = t - start;
      if (lt < 0) continue;
      const env = Math.exp(-lt * 6) * 0.35;
      const phase = 2 * Math.PI * freqs[i] * t;
      sig += sine(phase) * env;
      // Shimmer: detuned overtone
      sig += sine(phase * 2.01) * env * 0.15;
      sig += sine(phase * 3.005) * env * 0.08;
    }
    return sig;
  });
}

function genCheer() {
  // Major chord arpeggio: C5-E5-G5-C6 with rich tone
  const freqs = [523.25, 659.25, 783.99, 1046.50];
  const noteDur = 0.13;
  const dur = freqs.length * noteDur + 0.2;
  return render(dur, (t) => {
    let sig = 0;
    for (let i = 0; i < freqs.length; i++) {
      const start = i * noteDur;
      const lt = t - start;
      if (lt < 0) continue;
      const env = Math.exp(-lt * 4) * 0.3;
      const phase = 2 * Math.PI * freqs[i] * t;
      sig += sine(phase) * env;
      sig += triangle(phase * 2) * env * 0.12;
    }
    return sig;
  });
}

function genPeep() {
  // High-pitched chick chirp with vibrato
  const dur = 0.2;
  return render(dur, (t) => {
    const p = t / dur;
    const vibrato = Math.sin(t * 45) * 80;
    const freq = lerp(1900, 2200, p * 0.5) + vibrato;
    const phase = 2 * Math.PI * freq * t;
    const env = adsr(t, 0.005, 0.03, 0.5, 0.06, dur);
    return sine(phase) * env * 0.3;
  });
}

function genScared() {
  // Predator flee: descending whoosh with noise
  const dur = 0.35;
  return render(dur, (t) => {
    const p = t / dur;
    const freq = lerp(250, 100, p);
    const phase = 2 * Math.PI * freq * t;
    const env = adsr(t, 0.01, 0.1, 0.4, 0.1, dur);
    return (sawtooth(phase) * 0.4 + noise() * 0.15 * (1 - p)) * env;
  });
}

function genSteal() {
  // Dark ominous: descending square with growl
  const dur = 0.45;
  return render(dur, (t) => {
    const p = t / dur;
    const freq = lerp(320, 160, p);
    const phase = 2 * Math.PI * freq * t;
    const env = adsr(t, 0.01, 0.08, 0.5, 0.15, dur);
    const tremolo = 0.8 + Math.sin(t * 25) * 0.2;
    return (square(phase) * 0.3 + sawtooth(phase * 0.5) * 0.15) * env * tremolo;
  });
}

function genCollect() {
  // Pleasant ding: pure tone with bell overtone
  const dur = 0.15;
  return render(dur, (t) => {
    const env = Math.exp(-t * 20);
    const phase = 2 * Math.PI * 1200 * t;
    return (sine(phase) * 0.4 + sine(phase * 2.5) * 0.1) * env;
  });
}

function genWarning() {
  // Two-tone alert: descending
  const dur = 0.22;
  return render(dur, (t) => {
    const noteIdx = t < 0.11 ? 0 : 1;
    const freq = [880, 660][noteIdx];
    const lt = t - noteIdx * 0.11;
    const env = adsr(lt, 0.003, 0.02, 0.6, 0.03, 0.11);
    const phase = 2 * Math.PI * freq * t;
    return (square(phase) * 0.3 + sine(phase) * 0.15) * env;
  });
}

function genCombo() {
  // Quick rising trill
  const freqs = [880, 1047, 1319, 1568, 1760]; // A5 C6 E6 G6 A6
  const noteDur = 0.055;
  const dur = freqs.length * noteDur + 0.05;
  return render(dur, (t) => {
    let sig = 0;
    for (let i = 0; i < freqs.length; i++) {
      const start = i * noteDur;
      const lt = t - start;
      if (lt < 0 || lt > noteDur + 0.03) continue;
      const env = Math.exp(-lt * 15) * 0.3;
      const phase = 2 * Math.PI * freqs[i] * t;
      sig += sine(phase) * env;
    }
    return sig;
  });
}

function genFanfare() {
  // Triumphant ascending: C5-E5-G5-C6-E6 with fuller sound
  const freqs = [523, 659, 784, 1047, 1319];
  const noteDur = 0.12;
  const dur = freqs.length * noteDur + 0.25;
  return render(dur, (t) => {
    let sig = 0;
    for (let i = 0; i < freqs.length; i++) {
      const start = i * noteDur;
      const lt = t - start;
      if (lt < 0) continue;
      const env = Math.exp(-lt * 3.5) * 0.3;
      const phase = 2 * Math.PI * freqs[i] * t;
      sig += sine(phase) * env;
      sig += sine(phase * 1.5) * env * 0.1; // fifth overtone
      sig += triangle(phase * 2) * env * 0.08;
    }
    return sig;
  });
}

function genEnding() {
  // Happy C major scale with warm tone and reverb feel
  const freqs = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50];
  const noteDur = 0.22;
  const dur = freqs.length * noteDur + 0.4;
  return render(dur, (t) => {
    let sig = 0;
    for (let i = 0; i < freqs.length; i++) {
      const start = i * noteDur;
      const lt = t - start;
      if (lt < 0) continue;
      // Last note rings longer
      const decay = i === freqs.length - 1 ? 2 : 3.5;
      const env = Math.exp(-lt * decay) * 0.25;
      const phase = 2 * Math.PI * freqs[i] * t;
      sig += sine(phase) * env;
      sig += sine(phase * 2) * env * 0.08;
      // Subtle chorus
      sig += sine(phase * 1.003) * env * 0.05;
    }
    return sig;
  });
}

// ── Main ────────────────────────────────────────────────────────

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

console.log('🔊 Generating game sound effects...\n');

writeWav('cluck.wav', genCluck());
writeWav('egg-pop.wav', genEggPop());
writeWav('golden-egg.wav', genGoldenEgg());
writeWav('cheer.wav', genCheer());
writeWav('peep.wav', genPeep());
writeWav('scared.wav', genScared());
writeWav('steal.wav', genSteal());
writeWav('collect.wav', genCollect());
writeWav('warning.wav', genWarning());
writeWav('combo.wav', genCombo());
writeWav('fanfare.wav', genFanfare());
writeWav('ending.wav', genEnding());

console.log('\n✅ Done! 12 sound effects saved to assets/sounds/');
