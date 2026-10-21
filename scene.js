/* SVG演出専用。引く・耐えるを同じ力の応答として描きます。 */
(function (root) {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const ease = value => 1 - Math.pow(1 - clamp(value, 0, 1), 3);
  const rotate = (x, y, cx, cy, degrees) => {
    const rad = degrees * Math.PI / 180;
    return { x: cx + (x - cx) * Math.cos(rad) - (y - cy) * Math.sin(rad), y: cy + (x - cx) * Math.sin(rad) + (y - cy) * Math.cos(rad) };
  };

  class LakeScene {
    constructor(doc = document) {
      this.doc = doc;
      this.el = {};
      for (const id of ['fish', 'fish-flex', 'fish-tail', 'boat', 'angler', 'stance', 'rod', 'rod-shine', 'fishing-line', 'line', 'line-shadow', 'line-flash', 'bait', 'spray', 'bubbles', 'surface', 'fish-wake', 'boat-wake']) this.el[id] = doc.getElementById(id);
      this.signals = { fish: null, human: null };
      for (const player of ['fish', 'human']) {
        for (const part of ['signal', 'great-mark', 'bad-mark']) this.el[player + '-' + part] = doc.getElementById(player + '-' + part);
      }
      this.reduced = root.matchMedia('(prefers-reduced-motion: reduce)');
      this.time = 0;
      this.engaged = false;
      this.attacks = { fish: null, human: null };
      this.particles = [];
      this.pool = [];
      this.particleCount = 0;
      this.lastWake = 0;
      this.outcome = null;
      this.outcomeAt = 0;
      this.flash = 0;
      this.pose = { fishX: 285, fishY: 582 };
      this.bubbles = [];
      for (let i = 0; i < 18; i++) {
        const node = doc.createElementNS(NS, 'circle');
        this.el.bubbles.appendChild(node);
        this.bubbles.push({ node, x: 90 + Math.random() * 1280, y: 450 + Math.random() * 360, radius: 2 + Math.random() * 4, speed: 10 + Math.random() * 18 });
      }
    }

    reset() {
      this.clearSignals();
      this.outcome = null;
      this.engaged = false;
      this.flash = 0;
      this.attacks = { fish: null, human: null };
      for (const particle of this.particles) {
        particle.node.setAttribute('opacity', '0');
        this.pool.push(particle.node);
      }
      this.particles = [];
      this.el['fishing-line'].setAttribute('opacity', '1');
      this.el.fish.setAttribute('opacity', '1');
      this.el.bait.setAttribute('opacity', '0');
    }

    react(event) {
      if (event.type === 'prompt') this.clearSignals();
      else if (event.type === 'judge') {
        const strength = event.result === 'GREAT' ? 1 : event.result === 'GOOD' ? .55 : -.32;
        this.attacks[event.player] = { at: this.time, strength, result: event.result };
        this.signals[event.player] = ['GREAT', 'BAD'].includes(event.result) ? { at: this.time, kind: event.result } : null;
        this.flash = event.result === 'GREAT' ? .72 : event.result === 'GOOD' ? .3 : 0;
        if (event.result !== 'BAD') {
          if (event.player === 'fish') this.splash(this.pose.fishX + 85, this.pose.fishY, false, event.result === 'GREAT' ? 20 : 8, '#a4f0df');
          else this.splash(1135, 421, true, event.result === 'GREAT' ? 20 : 8, '#fff0ca');
        }
      } else if (event.type === 'resolve') {
        if (event.hp.fish < event.previous.fish) this.splash(this.pose.fishX - 35, this.pose.fishY - 10, false, 12);
        if (event.hp.human < event.previous.human) this.splash(1265, 430, true, 12);
      } else if (event.type === 'finish') {
        this.clearSignals();
        this.outcome = event.result;
        this.outcomeAt = this.time;
        this.splash(290, 418, true, 22);
        if (event.result === 'DOUBLE K.O.') this.splash(1220, 418, true, 22);
      }
    }

    clearSignals() {
      for (const player of ['fish', 'human']) {
        this.signals[player] = null;
        this.el[player + '-signal'].setAttribute('opacity', '0');
      }
    }

    greatAction(player) {
      const attack = this.attacks[player];
      const age = attack ? this.time - attack.at : 1;
      if (this.reduced.matches || this.outcome || attack?.result !== 'GREAT' || age >= .72) return { age, power: 0, twist: 0, gather: 0 };
      // GREATだけの「溜め→振り切り→反動」。GOODの応答式には触れない。
      const power = Math.sin(Math.PI * age / .72) * Math.exp(-age * 1.7);
      const twist = Math.sin(age * 36) * power;
      const gather = Math.sin(Math.PI * Math.min(age / .13, 1)) * Math.max(0, 1 - age / .13);
      return { age, power, twist, gather };
    }

    updateSignals(fishHead, humanHead) {
      for (const player of ['fish', 'human']) {
        const node = this.el[player + '-signal'];
        const signal = this.signals[player];
        const age = signal ? this.time - signal.at : 1;
        if (!signal || age >= .66 || this.outcome) {
          node.setAttribute('opacity', '0');
          this.signals[player] = null;
          continue;
        }
        const motion = !this.reduced.matches;
        const great = signal.kind === 'GREAT';
        const enter = motion ? Math.min(1, age / .045) : 1;
        const fade = motion ? Math.min(1, (.66 - age) / .17) : 1;
        const lift = motion ? Math.min(age / .5, 1) * (great ? 11 : 5) : 0;
        const scale = motion && great ? 1 + .24 * Math.exp(-age * 12) * Math.sin(age * 30) : 1;
        const turn = motion && !great ? Math.sin(age * 28) * 7 * Math.exp(-age * 3) : 0;
        const head = player === 'fish' ? fishHead : humanHead;
        const x = head.x - (player === 'human' ? 45 : 0);
        // 右上HPと帽子の間に収める。魚側は水中の頭のすぐ上。
        const y = player === 'human' ? Math.max(150, head.y - 30) : head.y - 42;
        node.setAttribute('transform', `translate(${x} ${y - lift}) rotate(${turn}) scale(${scale})`);
        node.setAttribute('opacity', String(enter * fade));
        node.setAttribute('data-kind', signal.kind);
        this.el[player + '-great-mark'].setAttribute('opacity', great ? '1' : '0');
        this.el[player + '-bad-mark'].setAttribute('opacity', great ? '0' : '1');
      }
    }

    impulse(player) {
      const attack = this.attacks[player];
      if (!attack) return 0;
      const age = this.time - attack.at;
      // 立ち上がり→力のピーク→小さい反動。タイムラインは判定とは独立。
      const strike = 1.35 * Math.exp(-age * 5) * (1 - Math.exp(-age * 70));
      const recoil = .18 * Math.exp(-Math.pow((age - .43) / .13, 2));
      return attack.strength * (strike - recoil);
    }

    splash(x, y, surface, count = 12, color = '#d6f1df') {
      if (this.reduced.matches) return;
      for (let i = 0; i < count; i++) {
        let node = this.pool.pop();
        if (!node && this.particleCount < 80) {
          node = this.doc.createElementNS(NS, 'circle');
          this.el.spray.appendChild(node);
          this.particleCount++;
        }
        if (!node) break;
        node.setAttribute('fill', surface ? color : 'none');
        node.setAttribute('stroke', color);
        node.setAttribute('stroke-width', surface ? '.5' : '1.6');
        node.setAttribute('opacity', '0');
        this.particles.push({ node, x, y, vx: (Math.random() - .35) * (surface ? 240 : 150), vy: -55 - Math.random() * 190, age: 0, life: .45 + Math.random() * .45, surface, radius: 1.5 + Math.random() * 3.5 });
      }
    }

    update(dt, frozen = false) {
      const motion = !this.reduced.matches;
      const step = frozen ? 0 : Math.min(dt, .05);
      this.time += step;
      const t = this.time;
      this.flash = Math.max(0, this.flash - step * 3.3);
      const effort = motion ? (this.engaged && !this.outcome ? 1 : .23) : 0;
      const fishPull = motion ? this.impulse('fish') : 0;
      const humanPull = motion ? this.impulse('human') : 0;
      const cycle = Math.sin(t * 2.6);
      let fishX = 285 - effort * (12 * cycle + 4 * Math.sin(t * 7.5)) - fishPull * 32 + humanPull * 26;
      let fishY = 582 + effort * (17 * Math.sin(t * 3.2) + 5 * Math.cos(t * 8)) - fishPull * 9 - humanPull * 12;
      let angle = clamp(24 + effort * 9 * Math.sin(t * 3.2) - fishPull * 10 + humanPull * 12, 16, 44);
      let boatX = -effort * 4 * cycle - fishPull * 10 + humanPull * 5;
      let boatY = effort * (3.5 * Math.sin(t * 1.7) + 3 * Math.abs(cycle));
      let boatRoll = effort * 1.1 * cycle - fishPull * 1.1 + humanPull;
      let lean = clamp(effort * (-3 - 8 * Math.sin(t * 2.6 + .4)) - fishPull * 12 + humanPull * 16, -25, 23);
      let tipX = 948 + boatX - fishPull * 22 + humanPull * 12 + effort * 8 * cycle;
      let tipY = 160 + boatY + fishPull * 14 - humanPull * 10 + effort * 6 * cycle;
      const fishGreat = this.greatAction('fish');
      const humanGreat = this.greatAction('human');
      // 移動量だけでなく、胴体のねじれ・尾の連打・全身の溜めを追加する。
      angle = clamp(angle + fishGreat.twist * 23, 12, 55);
      fishX -= fishGreat.power * 9;
      fishY += fishGreat.twist * 6;
      lean = clamp(lean + humanGreat.power * 14 - humanGreat.gather * 9, -25, 32);
      const bodyLift = humanGreat.gather * 9 - humanGreat.power * 20;
      boatY += humanGreat.gather * 4 + humanGreat.power * 3;
      boatRoll += humanGreat.twist * .9;
      tipX += humanGreat.power * 14;
      tipY += humanGreat.gather * 10 - humanGreat.power * 26;
      const finishedFor = Math.max(0, t - this.outcomeAt);
      const progress = motion ? ease(finishedFor / 1.8) : 1;
      let lineOpacity = 1;
      if (this.outcome === 'HUMAN WIN') {
        fishX += 790 * progress;
        fishY -= 265 * Math.sin(progress * Math.PI / 2) + 170 * Math.sin(progress * Math.PI);
        angle -= progress * 110;
        tipY -= 30 * progress;
        lean -= 9 * progress;
      } else if (this.outcome === 'FISH WIN') {
        lineOpacity = Math.max(0, 1 - progress * 4);
        fishX -= 560 * progress;
        fishY += 20 * progress;
        angle = 24 + (motion ? Math.sin(t * 10) * 8 : 0);
        lean += 18 * progress;
        this.el.bait.setAttribute('opacity', '1');
      } else if (this.outcome === 'DOUBLE K.O.') {
        fishY += 135 * progress;
        angle += 100 * progress;
        lean += 30 * progress;
        tipY += 80 * progress;
        lineOpacity = 1 - progress;
      } else if (this.outcome === 'DRAW') {
        fishX += 35 * progress;
        lean += 10 * progress;
        tipY += 30 * progress;
      }
      this.pose = { fishX, fishY, angle, boatX, boatY, boatRoll, lean, tipX, tipY };
      const fishTransform = `translate(${fishX} ${fishY}) rotate(${angle})`;
      this.el.fish.setAttribute('transform', fishTransform);
      const flex = fishGreat.twist;
      this.el['fish-flex'].setAttribute('transform', `translate(-115 3) scale(${1 + flex * .13} ${1 - flex * .17}) translate(115 -3)`);
      this.el['fish-wake'].setAttribute('transform', fishTransform);
      this.el['fish-wake'].setAttribute('opacity', this.outcome || !motion ? '0' : String(.15 + effort * .2 + Math.abs(fishPull) * .25));
      this.el['fish-wake'].setAttribute('stroke-dashoffset', String(-t * 75));
      this.el['boat-wake'].setAttribute('transform', `translate(${boatX} ${boatY})`);
      this.el['boat-wake'].setAttribute('opacity', String(.2 + effort * .25 + Math.abs(fishPull - humanPull) * .2));
      const tail = (motion ? Math.sin(t * (10 + Math.abs(fishPull) * 13)) * (4 + effort * 10 + Math.abs(fishPull) * 5) : 0) + fishGreat.power * Math.sin(fishGreat.age * 65) * 32;
      this.el['fish-tail'].setAttribute('transform', `rotate(${tail} 80 0) scale(${1 - Math.abs(tail) * .006} 1)`);
      this.el.boat.setAttribute('transform', `translate(${boatX} ${boatY}) rotate(${boatRoll} 1250 420)`);
      this.el.angler.setAttribute('transform', (bodyLift ? `translate(0 ${bodyLift}) ` : '') + `rotate(${lean} 1242 340)`);
      this.el.stance.setAttribute('transform', `rotate(${-lean * .12 - humanGreat.gather * 6} 1240 385)`);

      // 魚の口→糸→竿先、および竿の根元→手を、描画と同じ変換で接続。
      const mouth = rotate(-115, 3, 0, 0, angle);
      const mouthX = fishX + mouth.x;
      const mouthY = fishY + mouth.y;
      const line = `M${tipX} ${tipY} L${mouthX} ${mouthY}`;
      for (const id of ['line', 'line-shadow', 'line-flash']) this.el[id].setAttribute('d', line);
      this.el['line-flash'].setAttribute('opacity', String(motion ? this.flash : 0));
      this.el['fishing-line'].setAttribute('opacity', String(lineOpacity));
      const hand = rotate(1161, 275, 1242, 340, lean);
      const grip = rotate(hand.x, hand.y + bodyLift, 1250, 420, boatRoll);
      const rod = `M${grip.x + boatX} ${grip.y + boatY} Q${1073 + boatX - humanGreat.power * 24} ${112 + fishPull * 38 + effort * 9 * cycle + boatY + humanGreat.power * 30} ${tipX} ${tipY}`;
      this.el.rod.setAttribute('d', rod);
      this.el['rod-shine'].setAttribute('d', rod);
      this.el.bait.setAttribute('transform', `translate(${mouthX - 12} ${mouthY}) rotate(${angle})`);
      const fishHead = rotate(-115 + 41 * (1 + flex * .13), 3 - 61 * (1 - flex * .17), 0, 0, angle);
      const head = rotate(1244, 178, 1242, 340, lean);
      const humanHead = rotate(head.x, head.y + bodyLift, 1250, 420, boatRoll);
      this.updateSignals({ x: fishX + fishHead.x, y: fishY + fishHead.y }, { x: humanHead.x + boatX, y: humanHead.y + boatY });
      if (motion) {
        const height = Math.sin(t * 1.7) * 3;
        this.el.surface.setAttribute('d', `M0 419 Q80 ${413 + height} 160 419 T480 419 T800 419 T1120 419 T1440 419`);
      }
      if (this.engaged && !this.outcome && t - this.lastWake > .18) {
        this.lastWake = t;
        this.splash(fishX + 95, fishY + 20, false, 2, '#93cfcf');
      }
      for (const bubble of this.bubbles) {
        if (motion) bubble.y -= step * bubble.speed;
        if (bubble.y < 447) bubble.y = 804;
        bubble.node.setAttribute('cx', String(bubble.x + (motion ? Math.sin(t + bubble.x) * 6 : 0)));
        bubble.node.setAttribute('cy', String(bubble.y));
        bubble.node.setAttribute('r', String(bubble.radius));
      }
      const alive = [];
      for (const particle of this.particles) {
        particle.age += step;
        if (particle.age >= particle.life || !motion) {
          particle.node.setAttribute('opacity', '0');
          this.pool.push(particle.node);
          continue;
        }
        particle.x += particle.vx * step;
        particle.y += particle.vy * step;
        particle.vy += (particle.surface ? 430 : 70) * step;
        const fade = 1 - particle.age / particle.life;
        particle.node.setAttribute('cx', String(particle.x));
        particle.node.setAttribute('cy', String(particle.y));
        particle.node.setAttribute('r', String(particle.radius * (.5 + fade * .5)));
        particle.node.setAttribute('opacity', String(fade * .8));
        alive.push(particle);
      }
      this.particles = alive;
    }
  }
  root.LakeScene = LakeScene;
})(window);
