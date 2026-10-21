/* Web Audioの呼び出しとノード寿命を検査する模擬環境。音の実再生ではありません。 */
'use strict';
function audioHarness(clock = () => 0, { rejectResume = false, deferredResume = false } = {}) {
  const contexts = [];
  const pending = [];
  class Param {
    constructor(value = 1) { this.value = value; this.events = []; }
    setValueAtTime(value, time) { this.value = value; this.events.push(['set', value, time]); }
    linearRampToValueAtTime(value, time) { this.value = value; this.events.push(['ramp', value, time]); }
    cancelScheduledValues(time) { this.events.push(['cancel', time]); }
  }
  class Node {
    constructor() { this.connections = []; this.disconnected = false; }
    connect(node) { this.connections.push(node); }
    disconnect() { this.disconnected = true; }
  }
  class Context {
    constructor() { this.state = 'suspended'; this.destination = new Node(); this.sources = []; contexts.push(this); }
    get currentTime() { return clock() / 1000; }
    resume() {
      if (rejectResume) return Promise.reject(new Error('blocked'));
      if (deferredResume) return new Promise(resolve => pending.push(() => { this.state = 'running'; resolve(); }));
      this.state = 'running';
      return Promise.resolve();
    }
    createGain() { const node = new Node(); node.gain = new Param(); return node; }
    createStereoPanner() { const node = new Node(); node.pan = new Param(0); return node; }
    createDynamicsCompressor() {
      const node = new Node();
      for (const name of ['threshold','knee','ratio','attack','release']) node[name] = new Param();
      return node;
    }
    createBuffer(channels, length, sampleRate) {
      const arrays = Array.from({length: channels}, () => new Float32Array(length));
      return { length, duration: length/sampleRate, sampleRate, getChannelData: channel => arrays[channel] };
    }
    createBufferSource() {
      const node = new Node();
      node.loop = false; node.started = false; node.ended = false; node.stopAt = Infinity;
      node.start = (when=0, offset=0) => { node.started = true; node.startedAt = Math.max(this.currentTime, when); node.offset = offset; };
      node.stop = when => { node.stopAt = when ?? this.currentTime; };
      this.sources.push(node);
      return node;
    }
    tick() {
      for (const node of this.sources) {
        if (node.ended || !node.started) continue;
        if (this.currentTime >= node.stopAt || (!node.loop && this.currentTime >= node.startedAt + node.buffer.duration)) {
          node.ended = true; node.onended?.();
        }
      }
    }
    active() { this.tick(); return this.sources.filter(node => node.started && !node.ended); }
  }
  return { AudioContext: Context, contexts, flushResume() { for (const resolve of pending.splice(0)) resolve(); }, tick() { for (const context of contexts) context.tick(); } };
}
module.exports = { audioHarness };
