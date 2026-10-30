/* 戦闘MP3 BGMはHTMLAudioElement、判定SEは従来のWeb Audio。試合時計とは独立。 */
(function (root) {
  'use strict';
  const SAMPLE_RATE = 22050;
  const TAU = Math.PI * 2;
  // MP3は元のマスター出力とは別経路。BGMを下げ、判定音に音量の余地を渡す。
  const MIX = Object.freeze({
    bgm: .25, greatDuck: .085, otherDuck: .14, promptDuck: .17,
    greatDuckSeconds: .60, otherDuckSeconds: .37, promptDuckSeconds: .16
  });
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

  // RC3以前の互換エクスポート。現行BGMとして再生しません。
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
    const durations = { GREAT: .76, GOOD: .38, BAD: .42, prompt: .10, count: .16, go: .50, win: .95, draw: .95, double: .85 };
    const data = new Float32Array(Math.round((durations[kind] || .2) * SAMPLE_RATE));
    const random = noise(171);
    if (kind === 'GREAT') {
      // 低い衝撃→上昇ファンファーレ→高い余韻。GOODとは違う音形にする。
      addPercussion(data, 0, .66, 'kick', random);
      addNote(data, 0, .22, midi(45), .32, 'bass');
      for (const [delay, note, level] of [[0, 74, .40], [.045, 81, .34], [.11, 86, .29], [.195, 93, .23], [.32, 98, .15]]) {
        addNote(data, delay, delay < .2 ? .55 : .38, midi(note), level, 'bell');
        addNote(data, delay + .08, .32, midi(note + 12), level * .12, 'bell');
      }
      addPercussion(data, .12, .16, 'brush', random);
    } else if (kind === 'GOOD') {
      // 軽いアタック＋2音の肯定音。GREATの長い連続上昇音とは区別。
      addPercussion(data, 0, .17, 'kick', random);
      addNote(data, 0, .32, midi(74), .37, 'pluck');
      addNote(data, .038, .30, midi(81), .17, 'bell');
    } else if (kind === 'BAD') {
      // 低い2音が落ちるコミカルな失敗音。攻撃成功音と明確に分離。
      addPercussion(data, 0, .20, 'brush', random);
      addNote(data, 0, .21, midi(51), .34, 'bass');
      addNote(data, .085, .26, midi(44), .28, 'pluck');
      addNote(data, .16, .23, midi(37), .18, 'bass');
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

  // 結果画面用ファンファーレ。追加素材なし・著作権上の外部依存なし。
  // 4小節×2秒の約8秒。勝敗・引き分け・同時KOで旋律を変える。
  const FANFARE_SECONDS = 8;

  function addBrass(data, start, duration, note, level) {
    const offset = Math.round(start * SAMPLE_RATE);
    const count = Math.min(Math.round(duration * SAMPLE_RATE), data.length - offset);
    if (offset < 0 || count <= 0) return;
    const frequency = midi(note);
    for (let i = 0; i < count; i++) {
      const t = i / SAMPLE_RATE;
      const swell = Math.min(1, t / .022);
      const release = Math.min(1, (duration - t) / .15);
      const body = .83 + .17 * Math.exp(-t * 2);
      const pitch = TAU * frequency * (t + .00033 * Math.sin(t * 27));
      const sound = .64 * Math.sin(pitch) + .25 * Math.sin(2 * pitch) + .11 * Math.sin(3 * pitch);
      data[offset + i] += sound * swell * release * body * level;
    }
  }

  // RESULT-1 Final Adjustment 1: 壮大なWIN専用、約8秒のオリジナル・オーケストラ調ファンファーレ。
  // DRAW・DOUBLE K.O.、戦闘BGMと判定SEは従来どおり。
  function addVictoryBrass(data, start, duration, note, level, variant = 0) {
    const offset = Math.round(start * SAMPLE_RATE);
    const count = Math.min(Math.round(duration * SAMPLE_RATE), data.length - offset);
    if (offset < 0 || count <= 0) return;
    const frequency = midi(note);
    for (let i = 0; i < count; i++) {
      const t = i / SAMPLE_RATE;
      const attack = Math.min(1, t / (.014 + variant * .008));
      const release = Math.min(1, (duration - t) / .16);
      const vibrato = .0016 * Math.sin(TAU * 5.5 * t) * Math.min(1, t * 2);
      const angle = TAU * frequency * (t + vibrato / frequency) + variant * .19;
      const tone = .43 * Math.sin(angle) + .30 * Math.sin(2 * angle)
        + .16 * Math.sin(3 * angle) + .075 * Math.sin(4 * angle)
        + .035 * Math.sin(5 * angle);
      const body = .72 + .28 * Math.exp(-t * 2.5);
      data[offset + i] += level * tone * body * attack * release;
    }
  }

  function addVictoryStrings(data, start, duration, note, level) {
    const offset = Math.round(start * SAMPLE_RATE);
    const count = Math.min(Math.round(duration * SAMPLE_RATE), data.length - offset);
    if (offset < 0 || count <= 0) return;
    const frequency = midi(note);
    for (let i = 0; i < count; i++) {
      const t = i / SAMPLE_RATE;
      const attack = Math.min(1, t / .10);
      const release = Math.min(1, (duration - t) / .30);
      const shimmer = 1 + .045 * Math.sin(t * 11);
      const angle = TAU * frequency * t;
      const sound = .43 * Math.sin(angle * .997) + .43 * Math.sin(angle * 1.003)
        + .10 * Math.sin(angle * 2.004) + .04 * Math.sin(angle * 3.002);
      data[offset + i] += sound * attack * release * shimmer * level;
    }
  }

  function addVictoryTimpani(data, start, level, random) {
    const offset = Math.round(start * SAMPLE_RATE);
    const count = Math.min(Math.round(.68 * SAMPLE_RATE), data.length - offset);
    if (offset < 0 || count <= 0) return;
    let low = 0;
    for (let i = 0; i < count; i++) {
      const t = i / SAMPLE_RATE;
      const phase = TAU * (61 * t + 19 * (1 - Math.exp(-17 * t)) / 17);
      low = .8 * low + .2 * random();
      const strike = Math.sin(phase) * Math.exp(-5.7 * t)
        + .25 * low * Math.exp(-43 * t);
      data[offset + i] += level * strike;
    }
  }

  function addVictorySnare(data, start, level, random) {
    const offset = Math.round(start * SAMPLE_RATE);
    const count = Math.min(Math.round(.19 * SAMPLE_RATE), data.length - offset);
    if (offset < 0 || count <= 0) return;
    let low = 0;
    for (let i = 0; i < count; i++) {
      const t = i / SAMPLE_RATE;
      const input = random();
      low = .6 * low + .4 * input;
      const high = input - low;
      const signal = .78 * high + .22 * Math.sin(TAU * 185 * t);
      data[offset + i] += level * signal * Math.exp(-27 * t) * Math.min(1, t / .003);
    }
  }

  function addVictoryCymbal(data, start, level, random, seconds = 1.15) {
    const offset = Math.round(start * SAMPLE_RATE);
    const count = Math.min(Math.round(seconds * SAMPLE_RATE), data.length - offset);
    if (offset < 0 || count <= 0) return;
    let low = 0;
    for (let i = 0; i < count; i++) {
      const t = i / SAMPLE_RATE;
      const input = random();
      low = .84 * low + .16 * input;
      const high = input - low;
      const decay = Math.exp(-t * (seconds > 1 ? 2.6 : 5.5));
      data[offset + i] += level * high * decay * Math.min(1, t / .006);
    }
  }

  function addVictoryChime(data, start, note, level, seconds = .95) {
    const offset = Math.round(start * SAMPLE_RATE);
    const count = Math.min(Math.round(seconds * SAMPLE_RATE), data.length - offset);
    if (offset < 0 || count <= 0) return;
    const f = midi(note);
    for (let i = 0; i < count; i++) {
      const t = i / SAMPLE_RATE;
      const angle = TAU * f * t;
      const sound = .58 * Math.sin(angle) * Math.exp(-4 * t)
        + .25 * Math.sin(angle * 2.01) * Math.exp(-7 * t)
        + .17 * Math.sin(angle * 3.95) * Math.exp(-12 * t);
      data[offset + i] += level * sound * Math.min(1, t / .006);
    }
  }

  function makeVictoryFanfare() {
    const data = new Float32Array(Math.round(FANFARE_SECONDS * SAMPLE_RATE));
    const random = noise(20261028);
    // 0–2秒「勝利！」→ 2–4秒「高揚」→ 4–6秒「加速」→ 6–8秒「大団円」。
    // 4/4、120 BPM。D majorを基調に、最後は高音の主和音へ解決する。
    const harmonies = [
      [0,  [50, 62, 66, 69, 74]],   // D major
      [2,  [47, 59, 62, 66, 71]],   // B minor
      [4,  [43, 55, 59, 62, 67]],   // G major
      [5,  [45, 57, 61, 64, 69]],   // A major
      [6,  [50, 62, 66, 69, 74]]    // final D major
    ];
    for (const [t, chord] of harmonies) {
      const duration = t === 4 || t === 5 ? .98 : 1.92;
      addNote(data, t, duration, midi(chord[0]), .21, 'bass');
      addVictoryBrass(data, t, duration * .85, chord[1], .105, .5);
      for (const [i, note] of chord.slice(2).entries()) {
        addVictoryStrings(data, t, duration, note, .12);
        addVictoryBrass(data, t, Math.min(duration, t === 6 ? 1.72 : .78), note, .087, i);
      }
      addVictoryTimpani(data, t, t === 6 ? .46 : .31, random);
      if (t === 0 || t === 6) addVictoryCymbal(data, t, t === 6 ? .33 : .22, random, 1.5);
    }
    // 8ビートの打楽器は少しずつ密度を上げ、最後の2秒でドラムロール。
    for (let t = .5; t < 6; t += .5) {
      addVictorySnare(data, t, t >= 4 ? .24 : .15, random);
      if (Math.round(t * 2) % 2 === 0) addVictoryTimpani(data, t, .15, random);
    }
    for (let t = 5.32; t < 6; t += .11) addVictorySnare(data, t, .14 + (t - 5.3) * .22, random);
    addVictoryCymbal(data, 4, .11, random, .62);
    addVictoryCymbal(data, 5.92, .20, random, .95);
    // 速い上行音型＋朗々とした金管の旋律。短音で跳ね、要所で全音符に広がる。
    const lead = [
      [0, 74, .32], [.34, 78, .3], [.68, 81, .31], [1.04, 86, .85],
      [2.0, 83, .39], [2.43, 81, .25], [2.72, 78, .25], [3.02, 81, .32], [3.4, 83, .5],
      [4.0, 79, .27], [4.3, 83, .25], [4.58, 86, .25], [4.87, 88, .30],
      [5.2, 86, .25], [5.47, 88, .25], [5.75, 90, .22],
      [6.04, 98, 1.72]
    ];
    lead.forEach(([t, note, dur], i) => {
      addVictoryBrass(data, t, dur, note, i === lead.length - 1 ? .36 : .33);
      // トランペットの厚みとステレオ前提にしない重奏感を作る。
      addVictoryBrass(data, t + .018, dur * .95, note - 12, .085, 1.1);
    });
    // ファンファーレの合いの手、上行アルペジオ、輝くベル。
    for (const [time, notes] of [[.10, [86, 90, 93]], [2.13, [83, 86, 90]], [4.07, [86, 90, 93]], [6.07, [98, 102, 105]]]) {
      notes.forEach((note, i) => addVictoryChime(data, time + i * .135, note, time > 6 ? .15 : .08, 1.0));
    }
    // 最終和音を厚くし、8秒目まで豊かな余韻を保つ。
    for (const note of [74, 78, 81, 86, 90]) {
      addVictoryBrass(data, 6.02, 1.83, note, note >= 86 ? .11 : .085);
    }
    addVictoryChime(data, 6.10, 98, .16, 1.7);
    addVictoryChime(data, 6.3, 102, .12, 1.45);
    addVictoryTimpani(data, 6.02, .32, random);
    // 原音の2層の遅延反射を足し、会場の広がりを模した短い響きを付加する。
    const dry = data.slice();
    for (const [delay, gain] of [[.115, .12], [.23, .1], [.36, .065]]) {
      const shift = Math.round(delay * SAMPLE_RATE);
      for (let i = shift; i < data.length; i++) data[i] += dry[i - shift] * gain;
    }
    // 先頭・末尾のクリックを避け、最大音量を制限する。
    for (let i = 0; i < Math.floor(.008 * SAMPLE_RATE); i++) data[i] *= i / (.008 * SAMPLE_RATE);
    for (let i = Math.floor(7.72 * SAMPLE_RATE); i < data.length; i++) {
      data[i] *= Math.max(0, (data.length - i - 1) / (data.length - Math.floor(7.72 * SAMPLE_RATE)));
    }
    // 歪みや突然の音量ピークを避けながら、余韻と和声の厚みを持ち上げる。
    for (let i = 0; i < data.length; i++) {
      const v = data[i];
      data[i] = Math.sign(v) * Math.pow(Math.abs(v), .82);
    }
    return capPeak(data, .59);
  }

  function makeResultFanfare(result = 'HUMAN WIN') {
    const data = new Float32Array(Math.round(FANFARE_SECONDS * SAMPLE_RATE));
    const random = noise(51826);
    const outcome = result === 'DOUBLE K.O.' ? 'double' : result === 'DRAW' ? 'draw' : 'win';
    if (outcome === 'win') return makeVictoryFanfare();
    const victory = false;
    // 各小節のベース・和声。WIN=明るい長調、DRAW=未決着、DOUBLE K.O.=短調。
    const chords = victory
      ? [[48, 60, 64, 67], [53, 65, 69, 72], [55, 67, 71, 74], [48, 60, 64, 67]]
      : outcome === 'draw'
        ? [[50, 62, 67, 69], [53, 65, 69, 72], [55, 62, 67, 74], [50, 62, 67, 69]]
        : [[43, 55, 58, 62], [46, 58, 62, 65], [50, 57, 62, 66], [43, 55, 58, 62]];
    chords.forEach((chord, bar) => {
      const t = bar * 2;
      addPercussion(data, t, victory ? .32 : .18, 'kick', random);
      addNote(data, t, 1.95, midi(chord[0]), .18, 'bass');
      for (const note of chord.slice(1)) {
        addBrass(data, t, .9, note, victory ? .065 : .047);
        addBrass(data, t + 1, .8, note, victory ? .058 : .039);
      }
      for (let beat = 0; beat < 4; beat++) {
        addPercussion(data, t + beat * .5, victory ? .060 : .035, 'brush', random);
      }
    });
    // 音階とリズムは書き下ろし。持続音と刻みを交互に配置し、勝利時だけ華やかに上昇。
    const melody = victory
      ? [[0, 67, .25], [.3, 72, .25], [.6, 76, .30], [.95, 79, .82], [2, 77, .25], [2.3, 81, .24], [2.6, 84, .3], [2.95, 81, .82], [4, 79, .25], [4.3, 83, .25], [4.6, 86, .28], [4.95, 83, .83], [6, 84, .22], [6.26, 88, .26], [6.56, 91, .23], [6.88, 84, .98]]
      : outcome === 'draw'
        ? [[0, 69, .35], [.48, 67, .36], [1.05, 74, .65], [2, 72, .45], [2.6, 69, .44], [3.2, 72, .56], [4, 74, .45], [4.6, 69, .35], [5.2, 67, .55], [6, 69, .38], [6.55, 74, .38], [7.1, 69, .68]]
        : [[0, 67, .45], [.62, 65, .38], [1.15, 62, .65], [2, 65, .46], [2.65, 62, .42], [3.2, 58, .57], [4, 66, .48], [4.65, 62, .4], [5.2, 57, .56], [6, 62, .4], [6.55, 58, .38], [7.1, 55, .67]];
    melody.forEach(([time, note, duration], i) => {
      addBrass(data, time, duration, note, victory ? .26 : .16);
      if (victory && i % 3 === 0) addNote(data, time + .04, Math.min(duration, .4), midi(note + 12), .10, 'bell');
    });
    if (victory) {
      for (let t = 6.05; t < 7.6; t += .19) addPercussion(data, t, .048, 'brush', random);
      addNote(data, 7.08, .65, midi(96), .080, 'bell');
    } else if (outcome === 'double') {
      addPercussion(data, 7.05, .34, 'kick', random);
      addNote(data, 7.05, .84, midi(31), .24, 'bass');
    }
    // ファンファーレの末尾に無音化フェードを設け、演奏後のクリックを防ぐ。
    for (let i = Math.floor(7.72 * SAMPLE_RATE); i < data.length; i++) {
      data[i] *= Math.max(0, (data.length - i - 1) / (data.length - Math.floor(7.72 * SAMPLE_RATE)));
    }
    return capPeak(data, .59);
  }

  class AudioDirector {
    constructor(host = root, onChange = () => {}) {
      this.host = host;
      this.onChange = onChange;
      this.enabled = false;
      this.context = null;
      this.phase = 'title';
      this.music = null; // 戦闘BGM用HTMLAudioElement。
      this.victoryMedia = null; // WIN画面用MP3。戦闘BGM・DRAW/DKOのWeb Audioと独立。
      this.victoryTicket = 0;
      this.musicTicket = 0;
      this.duckUntil = 0;
      this.duckVolume = MIX.bgm;
      this.lastMixAt = 0;
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
      this.master.gain.value = .80;
      this.compressor = this.context.createDynamicsCompressor();
      this.compressor.threshold.value = -12;
      this.compressor.knee.value = 12;
      this.compressor.ratio.value = 8;
      this.compressor.attack.value = .003;
      this.compressor.release.value = .16;
      this.master.connect(this.compressor);
      this.compressor.connect(this.context.destination);
      // 本番は同階層のMP3を使用。単体HTMLをfile://で開いた時だけ公開済み音源へ接続。
      const url = this.host.location?.protocol === 'file:'
        ? 'https://mar-sander.github.io/fishing-game/BGM-battle.mp3'
        : 'BGM-battle.mp3';
      this.music = new this.host.Audio();
      this.music.src = url;
      this.music.preload = 'auto';
      this.music.loop = true;
      this.music.volume = MIX.bgm;
      // 単体プレビューはGitHub Pages上の素材を直接参照。本番は同じディレクトリのMP3を利用。
      const standalone = this.host.location?.protocol === 'file:'
        || (this.host.location?.pathname || '').endsWith('_Preview.html');
      this.victoryMedia = new this.host.Audio();
      this.victoryMedia.src = standalone
        ? 'https://mar-sander.github.io/fishing-game/fanfare.mp3' : 'fanfare.mp3';
      this.victoryMedia.preload = 'auto';
      this.victoryMedia.loop = false;
      this.victoryMedia.volume = .56; // 旧 .70 × 0.8：勝利MP3のみ20％減音
      for (const kind of ['GREAT', 'GOOD', 'BAD', 'prompt', 'count', 'go', 'win', 'draw', 'double']) this.buffers.set(kind, this.buffer(makeEffect(kind)));
      // DRAWとDOUBLE K.O.は従来の約8秒合成ファンファーレを維持。WINだけMP3へ置換。
      for (const result of ['DRAW', 'DOUBLE K.O.']) this.buffers.set('fanfare:' + result, this.buffer(makeResultFanfare(result)));
    }

    async setEnabled(enabled) {
      const request = ++this.request;
      this.enabled = enabled;
      if (!enabled) {
        this.stopMusic();
        this.stopVictoryMedia();
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
          this.stopVictoryMedia();
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
      ++this.musicTicket; // 遅れて解決するplay()が停止を打ち消さないための世代番号。
      this.duckUntil = 0;
      this.duckVolume = MIX.bgm;
      if (!this.music) return;
      this.music.volume = MIX.bgm;
      this.music.pause(); // currentTimeは保持。ポーズ解除時に続きから再生する。
      if (reset) {
        try { this.music.currentTime = 0; } catch (_) { /* メタデータ取得前 */ }
      }
    }

    // ページ遷移やSOUND OFFで勝利MP3を止め、次回は必ず先頭から鳴らす。
    stopVictoryMedia() {
      ++this.victoryTicket;
      if (!this.victoryMedia) return;
      this.victoryMedia.pause();
      try { this.victoryMedia.currentTime = 0; } catch (_) { /* 読み込み前でも進行は維持 */ }
    }

    reset() {
      this.stopMusic(true);
      this.stopVictoryMedia();
      this.stopVoices();
      this.phase = 'title';
    }

    setPhase(phase) {
      this.phase = phase;
      if (phase !== 'result') this.stopVictoryMedia();
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

    // 同じ指示への両者の判定が重なっても、低いBGM音量を保持する。
    duckMusic(kind) {
      if (!this.music || this.music.paused || this.phase !== 'playing') return;
      const isGreat = kind === 'GREAT';
      const isJudge = isGreat || kind === 'GOOD' || kind === 'BAD';
      if (!isJudge && kind !== 'prompt') return;
      const now = this.context.currentTime;
      if (now >= this.duckUntil) this.duckVolume = MIX.bgm;
      const target = isGreat ? MIX.greatDuck : isJudge ? MIX.otherDuck : MIX.promptDuck;
      const duration = isGreat ? MIX.greatDuckSeconds : isJudge ? MIX.otherDuckSeconds : MIX.promptDuckSeconds;
      this.duckUntil = Math.max(this.duckUntil, now + duration);
      this.duckVolume = Math.min(this.duckVolume, target);
      this.music.volume = this.duckVolume; // SEと同時に即時減衰。
      this.lastMixAt = now;
    }

    // ゲーム描画フレームから呼び、判定終了後は自然な速度でBGM音量を戻す。
    updateMix() {
      if (!this.music || !this.context || this.music.paused || this.phase !== 'playing') return;
      const now = this.context.currentTime;
      const dt = Math.max(0, now - this.lastMixAt);
      this.lastMixAt = now;
      if (now < this.duckUntil) return;
      this.duckVolume = MIX.bgm;
      this.music.volume = Math.min(MIX.bgm, this.music.volume + dt / .20 * (MIX.bgm - this.music.volume));
    }

    startMusic() {
      if (!this.enabled || !this.context || this.context.state !== 'running' || !this.music || this.phase !== 'playing' || !this.music.paused) return;
      this.music.volume = MIX.bgm;
      this.lastMixAt = this.context.currentTime;
      const ticket = ++this.musicTicket;
      // SOUND ONはユーザー操作で解放。play()拒否時も既存SEを維持する。
      try {
        const playPromise = this.music.play();
        if (playPromise?.then) playPromise.then(() => {
          if (ticket === this.musicTicket && (!this.enabled || this.phase !== 'playing')) this.music.pause();
        }).catch(() => { /* 音源未取得・再生制限時はゲームを止めない */ });
      } catch (_) { /* ブラウザで音声を許可できない場合もゲーム進行は維持 */ }
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
      const level = kind === 'GREAT' ? .74 : kind === 'GOOD' ? .54 : kind === 'BAD' ? .58 : kind === 'win' || kind === 'double' ? .56 : .34;
      const entry = this.source(buffer, level, player === 'fish' ? -.55 : player === 'human' ? .55 : 0);
      this.voices.add(entry);
      entry.source.start();
      this.duckMusic(kind);
    }

    // 結果画面表示後に一度だけ演奏。勝利だけアップロード済みMP3に差し替える。
    playResultFanfare(result) {
      if (!this.enabled || !this.context || this.context.state !== 'running' || this.phase !== 'result') return;
      this.stopVoices(); // 決着SEの残響と重ならないようにする。
      this.stopVictoryMedia();
      if (result === 'HUMAN WIN' || result === 'FISH WIN') {
        const ticket = ++this.victoryTicket;
        try {
          const playPromise = this.victoryMedia.play();
          if (playPromise?.then) playPromise.then(() => {
            if (ticket !== this.victoryTicket || !this.enabled || this.phase !== 'result') this.victoryMedia.pause();
          }).catch(() => { /* 音源未取得・再生制限でもゲームは正常に進行 */ });
        } catch (_) { /* 再生できない環境でも結果画面を維持 */ }
        return;
      }
      const kind = result === 'DRAW' ? 'DRAW' : result === 'DOUBLE K.O.' ? 'DOUBLE K.O.' : null;
      if (!kind) return;
      const buffer = this.buffers.get('fanfare:' + kind);
      if (!buffer) return;
      const entry = this.source(buffer, .78);
      this.voices.add(entry);
      entry.source.start();
    }

    silence() {
      this.stopMusic();
      this.stopVictoryMedia();
      this.stopVoices();
    }
  }

  const api = { SAMPLE_RATE, MIX, FANFARE_SECONDS, makeMusic, makeEffect, makeResultFanfare, AudioDirector };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FishingAudio = api;
})(typeof window !== 'undefined' ? window : globalThis);
