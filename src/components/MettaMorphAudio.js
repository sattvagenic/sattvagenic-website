// Equanimity sound: a steady drone whose upper voices bend from rest into tension as the image turns.
// Generated in the browser with Web Audio. No files, no services. Sound starts only from a button press.
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const ROOT = 110;
// [ratio at rest, ratio at full tension, gain]. The root and its octave never move: they are the ground.
const VOICES = [
  [0.5, 0.5, 0.30],      // low root
  [1, 1, 0.34],          // root
  [2, 2, 0.16],          // octave
  [1.5, 1.4142, 0.16],   // the fifth sinks to the tritone
  [2, 2.075, 0.12],      // a second octave pulls away from the first, beating faster and faster
  [3, 3.18, 0.07],       // a high voice drifts sharp against the drone
];

function hold(param, time) {
  if (typeof param.cancelAndHoldAtTime === 'function') param.cancelAndHoldAtTime(time);
  else { const v = param.value; param.cancelScheduledValues(time); param.setValueAtTime(v, time); }
}

export class EquanimityAudio {
  constructor({ amount = 0 } = {}) {
    const Context = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
    if (!Context) throw new Error('Sound is not available in this browser.');
    this.context = new Context();
    this.disposed = false;
    const c = this.context, now = c.currentTime;
    this.master = c.createGain(); this.master.gain.value = 0;
    this.filter = c.createBiquadFilter(); this.filter.type = 'lowpass'; this.filter.Q.value = 0.4;
    this.filter.connect(this.master); this.master.connect(c.destination);
    // A warm, reedy timbre: many soft harmonics, like a bowed or droning string.
    const n = 14, real = new Float32Array(n), imag = new Float32Array(n);
    for (let k = 1; k < n; k++) imag[k] = (1 / k ** 1.35) * (k % 2 ? 1 : 0.7);
    const wave = c.createPeriodicWave(real, imag);
    // A slow swell, so the drone breathes rather than hums.
    this.lfo = c.createOscillator(); this.lfo.frequency.value = 0.09;
    this.voices = VOICES.map(([rest, tense, gain], i) => {
      const o = c.createOscillator(), g = c.createGain(), depth = c.createGain();
      o.setPeriodicWave(wave); o.frequency.setValueAtTime(ROOT * rest, now);
      g.gain.value = gain; depth.gain.value = gain * 0.18;
      this.lfo.connect(depth); depth.connect(g.gain);
      o.connect(g); g.connect(this.filter); o.start(now + i * 0.04);
      return { o, g, depth, rest, tense };
    });
    this.lfo.start();
    this.setAmount(amount, now);
  }

  async start(volume = 25) {
    if (this.disposed) return false;
    if (this.context.state !== 'running') await this.context.resume();
    if (this.disposed) return false;
    this.setVolume(volume);
    return true;
  }

  setAmount(amount, time = this.context.currentTime) {
    if (this.disposed) return;
    const t = clamp(Number.isFinite(amount) ? amount / 100 : 0, 0, 1);
    this.voices.forEach(v => {
      hold(v.o.frequency, time);
      v.o.frequency.setTargetAtTime(ROOT * v.rest * (v.tense / v.rest) ** t, time, 0.05);
    });
    // The sound brightens a little as it tightens.
    hold(this.filter.frequency, time);
    this.filter.frequency.setTargetAtTime(900 + 1700 * t * t, time, 0.08);
  }

  setVolume(volume, time = this.context.currentTime) {
    if (this.disposed) return;
    hold(this.master.gain, time);
    this.master.gain.setTargetAtTime(clamp(volume, 0, 100) / 100 * 0.32, time, 0.06);
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    const c = this.context, time = c.currentTime;
    hold(this.master.gain, time);
    this.master.gain.linearRampToValueAtTime(0, time + 0.4);
    [...this.voices.map(v => v.o), this.lfo].forEach(o => { try { o.stop(time + 0.45); } catch (_) { /* already stopped */ } });
    setTimeout(() => { if (c.state !== 'closed') c.close().catch(() => {}); }, 600);
  }
}
