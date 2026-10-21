/* FISHING DUEL — ルール専用。描画・音・DOMには依存しません。 */
(function (root) {
  'use strict';

  const RULES = Object.freeze({ duration: 60000, rounds: 20, window: 1000, great: 500, maxHp: 200 });
  // HPを0.5単位の整数で保持し、浮動小数点の誤差を避けます。
  const DAMAGE = Object.freeze({ GREAT: 15, GOOD: 10, BAD: 5, MISS: 0 });
  const DIRECTIONS = Object.freeze(['up', 'right', 'down', 'left']);
  const KEYS = Object.freeze({
    ArrowUp: ['human', 'up'], ArrowRight: ['human', 'right'],
    ArrowDown: ['human', 'down'], ArrowLeft: ['human', 'left'],
    KeyW: ['fish', 'up'], KeyD: ['fish', 'right'],
    KeyS: ['fish', 'down'], KeyA: ['fish', 'left']
  });

  function createSchedule(random = Math.random) {
    // 20個の受付窓と21個の可変休止。各休止650ms以上、最終窓も必ず60秒内。
    const idleBudget = RULES.duration - RULES.rounds * RULES.window;
    const minimumIdle = 650;
    const weights = Array.from({ length: 21 }, () => 0.02 + Math.pow(random(), 3));
    // 退化した乱数源でも等間隔に固定しないための最小の変動。
    if (weights.every(value => value === weights[0])) weights[10] += 0.01;
    const total = weights.reduce((sum, value) => sum + value, 0);
    const surplus = idleBudget - minimumIdle * weights.length;
    const gaps = weights.map(value => minimumIdle + surplus * value / total);
    let cursor = gaps[0];
    return Array.from({ length: RULES.rounds }, (_, index) => {
      const round = { at: cursor, direction: DIRECTIONS[Math.min(3, Math.floor(random() * 4))] };
      cursor += RULES.window + gaps[index + 1];
      return round;
    });
  }

  function judge(expected, actual, elapsed) {
    if (elapsed < 0 || elapsed > RULES.window) return null;
    if (expected !== actual) return 'BAD';
    return elapsed <= RULES.great ? 'GREAT' : 'GOOD';
  }

  function resolveHp(hp, results) {
    const next = { ...hp };
    for (const player of ['fish', 'human']) {
      const result = results[player] || 'MISS';
      const target = result === 'BAD' ? player : player === 'fish' ? 'human' : 'fish';
      next[target] -= DAMAGE[result];
    }
    next.fish = Math.max(0, Math.min(RULES.maxHp, next.fish));
    next.human = Math.max(0, Math.min(RULES.maxHp, next.human));
    return next;
  }

  function decide(hp, timeout = false) {
    if (hp.fish === 0 && hp.human === 0) return 'DOUBLE K.O.';
    if (hp.fish === 0) return 'HUMAN WIN';
    if (hp.human === 0) return 'FISH WIN';
    if (!timeout) return null;
    if (hp.fish === hp.human) return 'DRAW';
    return hp.fish > hp.human ? 'FISH WIN' : 'HUMAN WIN';
  }

  class Match {
    constructor(random = Math.random, emit = () => {}) {
      this.schedule = createSchedule(random);
      this.emit = emit;
      this.hp = { fish: RULES.maxHp, human: RULES.maxHp };
      this.active = null;
      this.index = 0;
      this.time = 0;
      this.result = null;
      this.history = [];
      this.stats = { fish: { GREAT: 0, GOOD: 0, BAD: 0, MISS: 0 }, human: { GREAT: 0, GOOD: 0, BAD: 0, MISS: 0 } };
    }

    advance(now) {
      if (this.result) return;
      this.time = Math.max(this.time, Math.min(now, RULES.duration));
      // 1000msちょうどの入力を受け付けるため、締切を越えた時点で閉じます。
      if (this.active && this.time > this.active.openedAt + RULES.window) this.resolve();
      if (this.result) return;
      if (!this.active && this.index < RULES.rounds && this.time >= this.schedule[this.index].at && this.time < RULES.duration) {
        const planned = this.schedule[this.index++];
        // 実際に方向を表示した時点が反応時間の起点です。
        this.active = { number: this.index, direction: planned.direction, openedAt: this.time, inputs: {} };
        this.emit({ type: 'prompt', round: this.active });
      }
      if (this.time >= RULES.duration) {
        if (this.active) this.resolve();
        if (!this.result) this.finish(decide(this.hp, true), 'TIME UP');
      }
    }

    input(player, direction, now) {
      if (this.result || !this.active || this.active.inputs[player]) return null;
      if (!['fish', 'human'].includes(player) || !DIRECTIONS.includes(direction)) return null;
      const elapsed = now - this.active.openedAt;
      const result = judge(this.active.direction, direction, elapsed);
      if (!result) return null;
      this.active.inputs[player] = { result, elapsed };
      this.emit({ type: 'judge', player, result, elapsed });
      if (this.active.inputs.fish && this.active.inputs.human) this.resolve();
      return result;
    }

    resolve() {
      if (!this.active || this.result) return;
      const round = this.active;
      const results = { fish: round.inputs.fish?.result || 'MISS', human: round.inputs.human?.result || 'MISS' };
      const previous = { ...this.hp };
      this.hp = resolveHp(this.hp, results);
      for (const player of ['fish', 'human']) this.stats[player][results[player]]++;
      this.history.push({ number: round.number, openedAt: round.openedAt, results, hp: { ...this.hp } });
      this.active = null;
      this.emit({ type: 'resolve', results, previous, hp: { ...this.hp } });
      const winner = decide(this.hp);
      if (winner) this.finish(winner, 'K.O.');
    }

    finish(result, reason) {
      this.result = result;
      this.active = null;
      this.emit({ type: 'finish', result, reason });
    }
  }

  // 押下済みのキーはkeyupまで再利用不可。別の方向キーでも判定は各ラウンド1回のみ。
  class KeyGate {
    constructor() { this.held = new Set(); }
    down(code, repeat) {
      const held = this.held.has(code);
      this.held.add(code);
      return !repeat && !held ? KEYS[code] || null : null;
    }
    up(code) { this.held.delete(code); }
    clear() { this.held.clear(); }
  }

  const api = { RULES, DAMAGE, DIRECTIONS, KEYS, createSchedule, judge, resolveHp, decide, Match, KeyGate };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FishingRules = api;
})(typeof window !== 'undefined' ? window : globalThis);
