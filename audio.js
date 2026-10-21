/* 自作PCM音源とWeb Audio再生管理。ゲームの時計・入力判定には依存しません。 */
(function (root) {
  'use strict';
  const SAMPLE_RATE = 22050;
  const TAU = Math.PI * 2;
  const midi = note => 440 * Math.pow(2, (note - 69) / 12);

  function noise(seed) {
    return () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 2147483648 - 1;
    };
  }

  function addNote(data, start, duration, frequency, level, color = 'pluck', wrap = false) {
    const offset = Math.round(start * SAMPLE_RATE);
    const count = Math.round(duration * SAMPLE_RATE);
    for (let index = 0; index < count; index++) {
      const target = wrap ? (offset + index) % data.length : offset + index;
      if (target >= data.length) break;
      const t = index / SAMPLE_RATE;
      const attack = Math.min(1, t / .004);
      const release = Math.min(1, (duration - t) / .035);
      const decay = Math.exp(-t * (color === 'bass' ? 4 : color === 'bell' ? 7 : 12));
      const phase = TAU * frequency * t;
      let sample = Math.sin(phase);
      if (color === 'bell') sample = .73 * sample + .20 * Math.sin(phase * 2.002) + .07 * Math.sin(phase * 3.997);
      if (color === 'pluck') sample = .80 * sample + .20 * Math.sin(phase * 2);
      if (color === 'bass') sample = .88 * sample + .12 * Math.sin(phase * 2);
      data[target] += sample * attack * release * decay * level;
    }
  }

  function addPercussion(data, start, level, kind, random, wrap = false) {
    const duration = kind === 'kick' ? .15 : .055;
    const offset = Math.round(start * SAMPLE_RATE);
    let filtered = 0;
    for (let index = 0; index < duration * SAMPLE_RATE; index++) {
      const target = wrap ? (offset + index) % data.length : offset + index;
      if (target >= data.length) break;
      const t = index / SAMPLE_RATE;
      filtered = .66 * filtered + .34 * random();
      const sample = kind === 'kick' ? Math.sin(TAU * (59 * t + 3 * (1 - Math.exp(-35 * t)))) : filtered;
      const envelope = Math.min(1, t / .002) * Math.exp(-t * (kind === 'kick' ? 35 : 95));
      data[target] += sample * envelope * level;
    }
  }

  function capPeak(data, maximum) {
    let peak = 0;
    for (const sample of data) peak = Math.max(peak, Math.abs(sample));
    if (peak > maximum) for (let i = 0; i < data.length; i++) data[i] *= maximum / peak;
    return data;
  }

  function makeMusic() {
    // 96 BPM / 8小節。旋律・ベース・木のような打音を疎に重ねます。
    const beat = 60 / 96;
    const data = new Float32Array(Math.round(32 * beat * SAMPLE_RATE));
    const random = noise(17621);
    const roots = [38, 38, 34, 34, 41, 41, 36, 36];
    const phrase = [[0, 62], [.75, 69], [1.5, 65], [2.5, 67], [3.25, 69]];
    for (let bar = 0; bar < 8; bar++) {
      const start = bar * 4 * beat;
      addNote(data, start, 1.1, midi(roots[bar]), .20, 'bass', true);
      addNote(data, start + 2 * beat, .8, midi(roots[bar] + 12), .10, 'bass', true);
      for (const [position, note] of phrase) {
        const shifted = note + (bar >= 6 ? -2 : 0);
        addNote(data, start + position * beat, .58, midi(shifted), .070, 'pluck', true);
        addNote(data, start + position * beat + .19, .55, midi(shifted), .016, 'bell', true);
      }
      addPercussion(data, start, .14, 'kick', random, true);
      addPercussion(data, start + 2.5 * beat, .08, 'kick', random, true);
      for (let tick = 0; tick < 8; tick++) addPercussion(data, start + tick * .5 * beat, tick % 2 ? .045 : .026, 'brush', random, true);
      addNote(data, start + 1.5 * beat, .08, 720, .026, 'pluck', true);
      addNote(data, start + 3.5 * beat, .08, 650, .022, 'pluck', true);
    }
    // 残響は配列の先頭へ折り返しており、ループ境界で切断しません。
    return capPeak(data, .24);
  }

  function makeEffect(kind) {
    const durations = { GREAT: .58, GOOD: .32, BAD: .26, prompt: .10, count: .16, go: .50, win: .95, draw: .95, double: .85 };
    const data = new Float32Array(Math.round((durations[kind] || .2) * SAMPLE_RATE));
    const random = noise(171);
    if (kind === 'GREAT') {
      addPercussion(data, 0, .40, 'kick', random);
      for (const [delay, note, level] of [[0, 74, .36], [.035, 81, .27], [.075, 86, .22]]) {
        addNote(data, delay, .48, midi(note), level, 'bell');
        addNote(data, delay + .09, .36, midi(note), level * .16, 'bell');
      }
    } else if (kind === 'GOOD') {
      addNote(data, 0, .29, midi(74), .32, 'pluck');
      addNote(data, .028, .26, midi(81), .12, 'bell');
    } else if (kind === 'BAD') {
      addNote(data, 0, .18, midi(50), .30, 'bass');
      addNote(data, .075, .16, midi(45), .20, 'pluck');
      addPercussion(data, 0, .06, 'brush', random);
    } else if (kind === 'prompt' || kind === 'count') {
      addNote(data, 0, data.length / SAMPLE_RATE, kind === 'prompt' ? 740 : 370, .17, 'pluck');
      addPercussion(data, 0, .04, 'brush', random);
    } else if (kind === 'double') {
      addPercussion(data, 0, .32, 'kick', random);
      addNote(data, .03, .72, midi(38), .29, 'bass');
      addNote(data, .18, .60, midi(45), .15, 'bell');
    } else {
      const notes = kind === 'draw' ? [62, 67, 69] : [62, 65, 69, 74];
      notes.forEach((note, index) => addNote(data, index * .075, kind === 'go' ? .25 : .62, midi(note), .27, 'bell'));
    }
    return capPeak(data, .62);
  }

  class AudioDirector {
    constructor(host = root, onChange = () => {}) {
      this.host = host;
      this.onChange = onChange;
      this.enabled = false;
      this.context = null;
      this.phase = 'title';
      this.music = null;
      this.musicBuffer = null;
      this.musicOffset = 0;
      this.voices = new Set();
      this.buffers = new Map();
      this.request = 0;
    }

    buffer(samples) {
      const buffer = this.context.createBuffer(1, samples.length, SAMPLE_RATE);
      buffer.getChannelData(0).set(samples);
      return buffer;
    }

    initialize() {
      if (this.context) return;
      const Context = this.host.AudioContext || this.host.webkitAudioContext;
      if (!Context) throw new Error('Audio unavailable');
      this.context = new Context();
      this.master = this.context.createGain();
      this.master.gain.value = .62;
      this.compressor = this.context.createDynamicsCompressor();
      this.compressor.threshold.value = -12;
      this.compressor.knee.value = 12;
      this.compressor.ratio.value = 8;
      this.compressor.attack.value = .003;
      this.compressor.release.value = .16;
      this.master.connect(this.compressor);
      this.compressor.connect(this.context.destination);
      this.musicBuffer = this.buffer(makeMusic());
      for (const kind of ['GREAT', 'GOOD', 'BAD', 'prompt', 'count', 'go', 'win', 'draw', 'double']) this.buffers.set(kind, this.buffer(makeEffect(kind)));
    }

    async setEnabled(enabled) {
      const request = ++this.request;
      this.enabled = enabled;
      if (!enabled) {
        this.stopMusic();
        this.stopVoices();
        this.onChange();
        return false;
      }
      try {
        // この関数はSOUNDボタンのユーザー操作からのみ呼びます。
        this.initialize();
        if (this.context.state !== 'running') await this.context.resume();
        if (request !== this.request || !this.enabled) return false;
        if (this.context.state !== 'running') throw new Error('Audio is suspended');
        if (this.phase === 'playing') this.startMusic();
        this.onChange();
        return true;
      } catch (_) {
        if (request === this.request) {
          this.enabled = false;
          this.stopMusic();
          this.stopVoices();
          this.onChange();
        }
        return false;
      }
    }

    stopEntry(entry) {
      if (!entry || !this.context) return;
      const now = this.context.currentTime;
      try {
        entry.gain.gain.cancelScheduledValues(now);
        entry.gain.gain.setValueAtTime(entry.gain.gain.value, now);
        entry.gain.gain.linearRampToValueAtTime(0, now + .012);
        entry.source.stop(now + .012);
      } catch (_) { /* 終了済みノードは破棄だけでよい */ }
    }

    stopVoices() {
      for (const entry of this.voices) this.stopEntry(entry);
      this.voices.clear();
    }

    stopMusic(reset = false) {
      if (this.music) {
        this.musicOffset = (this.music.offset + this.context.currentTime - this.music.startedAt) % this.musicBuffer.duration;
        this.stopEntry(this.music);
        this.music = null;
      }
      if (reset) this.musicOffset = 0;
    }

    reset() {
      this.stopMusic(true);
      this.stopVoices();
      this.phase = 'title';
    }

    setPhase(phase) {
      this.phase = phase;
      if (phase === 'playing') this.startMusic();
      else {
        this.stopMusic(phase === 'title' || phase === 'result');
        this.stopVoices();
      }
    }

    source(buffer, level, pan = 0) {
      const source = this.context.createBufferSource();
      const gain = this.context.createGain();
      source.buffer = buffer;
      gain.gain.value = level;
      source.connect(gain);
      const panner = this.context.createStereoPanner ? this.context.createStereoPanner() : null;
      if (panner) {
        panner.pan.value = pan;
        gain.connect(panner);
        panner.connect(this.master);
      } else gain.connect(this.master);
      const entry = { source, gain, panner };
      source.onended = () => {
        this.voices.delete(entry);
        source.disconnect();
        gain.disconnect();
        panner?.disconnect();
      };
      return entry;
    }

    startMusic() {
      if (!this.enabled || !this.context || this.context.state !== 'running' || this.music || this.phase !== 'playing') return;
      const entry = this.source(this.musicBuffer, 0);
      entry.source.loop = true;
      entry.offset = this.musicOffset;
      entry.startedAt = this.context.currentTime;
      entry.gain.gain.setValueAtTime(0, entry.startedAt);
      entry.gain.gain.linearRampToValueAtTime(.28, entry.startedAt + .18);
      entry.source.start(0, entry.offset);
      this.music = entry;
    }

    play(kind, player = null) {
      if (!this.enabled || !this.context || this.context.state !== 'running') return;
      if (!['playing', 'countdown', 'finishing'].includes(this.phase)) return;
      const buffer = this.buffers.get(kind);
      if (!buffer) return;
      // 即時SEは最大4声。さらにマスター余裕とコンプレッサーを確保。
      if (this.voices.size >= 4) {
        const oldest = this.voices.values().next().value;
        this.stopEntry(oldest);
        this.voices.delete(oldest);
      }
      const level = kind === 'GREAT' ? .38 : kind === 'GOOD' ? .31 : kind === 'BAD' ? .24 : .28;
      const entry = this.source(buffer, level, player === 'fish' ? -.55 : player === 'human' ? .55 : 0);
      this.voices.add(entry);
      entry.source.start();
      if (kind === 'GREAT' && this.music) {
        const now = this.context.currentTime;
        const gain = this.music.gain.gain;
        gain.cancelScheduledValues(now);
        gain.setValueAtTime(.15, now);
        gain.linearRampToValueAtTime(.28, now + .32);
      }
    }

    silence() {
      this.stopMusic();
      this.stopVoices();
    }
  }

  const api = { SAMPLE_RATE, makeMusic, makeEffect, AudioDirector };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FishingAudio = api;
})(typeof window !== 'undefined' ? window : globalThis);
