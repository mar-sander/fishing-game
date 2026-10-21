'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const reference = require('./rc2-good-reference.json');
const { createHarness } = require('./dom-harness.cjs');

function scene(options) {
  const h = createHarness(options);
  const s = new h.context.LakeScene(h.doc);
  s.engaged = true;
  for (let i = 0; i < 40; i++) s.update(.016);
  return { h, s };
}
function judge(s, player, result) { s.react({ type: 'judge', player, result }); }
function visible(h, player) { return Number(h.$(player + '-signal').getAttribute('opacity')) > 0; }
function advance(s, duration) { for (let t = 0; t < duration; t += .016) s.update(.016); }
function position(h, player) {
  return h.$(player + '-signal').getAttribute('transform').match(/^translate\(([^)]+)\)/)[1].split(' ').map(Number);
}

for (const player of ['fish', 'human']) {
  for (const result of ['GREAT', 'GOOD', 'BAD', 'MISS']) {
    test(`FA2 ${player}/${result}: 記号の種類と所属`, () => {
      const { h, s } = scene();
      judge(s, player, result);
      s.update(.05);
      assert.equal(visible(h, player), result === 'GREAT' || result === 'BAD');
      assert.equal(visible(h, player === 'fish' ? 'human' : 'fish'), false);
      if (visible(h, player)) {
        assert.equal(h.$(player + '-signal').getAttribute('data-kind'), result);
        assert.equal(h.$(player + '-great-mark').getAttribute('opacity'), result === 'GREAT' ? '1' : '0');
        assert.equal(h.$(player + '-bad-mark').getAttribute('opacity'), result === 'BAD' ? '1' : '0');
      }
    });
  }
}
for (const [fish, human] of [['GREAT','GREAT'], ['GREAT','BAD'], ['BAD','GREAT'], ['BAD','BAD']]) {
  test(`FA2 同時判定 ${fish}/${human}: 左右の記号を独立表示`, () => {
    const { h, s } = scene();
    judge(s, 'fish', fish);
    judge(s, 'human', human);
    s.update(.05);
    assert.equal(h.$('fish-signal').getAttribute('data-kind'), fish);
    assert.equal(h.$('human-signal').getAttribute('data-kind'), human);
    assert.ok(visible(h, 'fish') && visible(h, 'human'));
    assert.ok(position(h, 'human')[0] - position(h, 'fish')[0] > 800);
  });
}
test('FA2 GOODの両者12姿勢がRC2記録と一致（竿・糸・尾も比較）', () => {
  for (const player of ['fish', 'human']) {
    const { h, s } = scene();
    judge(s, player, 'GOOD');
    for (let i = 0; i < 50; i++) {
      s.update(.016);
      const sample = reference.entries.find(item => item.player === player && item.frame === i);
      if (!sample) continue;
      assert.deepEqual(JSON.parse(JSON.stringify(s.pose)), sample.pose);
      for (const [id, attrs] of Object.entries(sample.attrs)) assert.deepEqual(h.$(id).attrs, attrs, id);
    }
  }
});
test('FA2 GREAT専用: 魚は胴体変形と尾の連打、人間は沈み込み→全身引き上げ', () => {
  const fish = scene(), human = scene(), good = scene();
  judge(fish.s, 'fish', 'GREAT');
  judge(human.s, 'human', 'GREAT');
  judge(good.s, 'human', 'GOOD');
  fish.s.update(.05); human.s.update(.05); good.s.update(.05);
  assert.notEqual(fish.h.$('fish-flex').getAttribute('transform'), 'translate(-115 3) scale(1 1) translate(115 -3)');
  const first = human.h.$('angler').getAttribute('transform');
  assert.match(first, /^translate\(0 /);
  assert.doesNotMatch(good.h.$('angler').getAttribute('transform'), /translate/);
  advance(human.s, .15);
  const second = human.h.$('angler').getAttribute('transform');
  assert.notEqual(first, second);
  assert.match(second, /^translate\(0 -/);
  advance(fish.s, .8); advance(human.s, .8);
  assert.equal(fish.h.$('fish-flex').getAttribute('transform'), 'translate(-115 3) scale(1 1) translate(115 -3)');
  assert.doesNotMatch(human.h.$('angler').getAttribute('transform'), /translate/);
});
test('FA2 頭上記号は両者の移動に追従し、HUD・中央指示の領域へ入らない', () => {
  const { h, s } = scene();
  judge(s, 'fish', 'GREAT'); judge(s, 'human', 'GREAT');
  s.update(.05);
  const start = { fish: position(h, 'fish'), human: position(h, 'human') };
  for (let i = 0; i < 30; i++) {
    s.update(.016);
    const [fx, fy] = position(h, 'fish'), [hx, hy] = position(h, 'human');
    assert.ok(fx > 100 && fx < 340 && fy > 390 && fy < 540);
    assert.ok(hx > 1100 && hx < 1360 && hy > 135 && hy < 205);
    // 中央指示と左右判定欄はx約400〜1040。人間漫符はその右側。
    assert.ok(fx + 45 < 400 && hx - 45 > 1040);
  }
  assert.notDeepEqual(position(h, 'fish'), start.fish);
  assert.notDeepEqual(position(h, 'human'), start.human);
});
test('FA2 記号は0.66秒以内で終了、新指示・決着・resetで即消去', () => {
  for (const end of ['timeout', 'prompt', 'finish', 'reset']) {
    const { h, s } = scene();
    judge(s, 'fish', 'GREAT'); judge(s, 'human', 'BAD'); s.update(.05);
    if (end === 'timeout') advance(s, .7);
    if (end === 'prompt') s.react({ type: 'prompt' });
    if (end === 'finish') s.react({ type: 'finish', result: 'DOUBLE K.O.' });
    if (end === 'reset') s.reset();
    assert.equal(visible(h, 'fish'), false, end);
    assert.equal(visible(h, 'human'), false, end);
  }
});
test('FA2 reduced-motionでも静止した正しい記号を短時間提示', () => {
  const { h, s } = scene({ reduced: true });
  judge(s, 'fish', 'GREAT'); judge(s, 'human', 'BAD'); s.update(.05);
  const before = ['fish', 'human'].map(player => h.$(player + '-signal').getAttribute('transform'));
  advance(s, .2);
  assert.deepEqual(['fish', 'human'].map(player => h.$(player + '-signal').getAttribute('transform')), before);
  assert.ok(visible(h, 'fish') && visible(h, 'human'));
  assert.equal(s.particleCount, 0);
  advance(s, .6);
  assert.equal(visible(h, 'fish'), false); assert.equal(visible(h, 'human'), false);
});
test('FA2 実アプリ: pauseで記号を消し、再開・再戦・タイトルに残さない', () => {
  const h = createHarness();
  h.click('start'); h.advance(3320);
  for (let i = 0; i < 500 && !h.$('cue').classList.contains('active'); i++) h.frame();
  const key = { up:'KeyW', right:'KeyD', down:'KeyS', left:'KeyA' }[h.$('direction').getAttribute('data-direction')];
  h.key(key); h.up(key); h.frame(); assert.ok(visible(h, 'fish'));
  h.key('Escape'); assert.equal(visible(h, 'fish'), false);
  h.click('resume'); h.advance(3320); assert.equal(visible(h, 'fish'), false);
  h.advance(62500); h.click('rematch'); h.advance(3320);
  assert.equal(visible(h, 'fish'), false); assert.equal(visible(h, 'human'), false);
  h.key('Escape'); h.click('quit'); assert.equal(visible(h, 'fish'), false);
  h.click('start'); h.advance(3320); assert.equal(visible(h, 'fish'), false);
});

test('FA2 同時GREAT中も変形した魚の口と糸、全身移動後の手と竿が一致', () => {
  const { h, s } = scene();
  judge(s, 'fish', 'GREAT'); judge(s, 'human', 'GREAT');
  const numbers = value => value.match(/-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g).map(Number);
  const rotate = (x, y, cx, cy, degrees) => {
    const r = degrees * Math.PI / 180;
    return [cx + (x-cx)*Math.cos(r) - (y-cy)*Math.sin(r), cy + (x-cx)*Math.sin(r) + (y-cy)*Math.cos(r)];
  };
  for (let i = 0; i < 50; i++) {
    s.update(.016);
    const p = s.pose, line = numbers(h.$('line').getAttribute('d')), rod = numbers(h.$('rod').getAttribute('d'));
    // 魚の非等方変形は口(-115,3)を支点とするので、口の局所座標は不変。
    const mouth = rotate(-115, 3, 0, 0, p.angle);
    assert.ok(Math.abs(line[2] - p.fishX - mouth[0]) < 1e-9);
    assert.ok(Math.abs(line[3] - p.fishY - mouth[1]) < 1e-9);
    assert.deepEqual(line.slice(0, 2), rod.slice(-2));
    const move = h.$('angler').getAttribute('transform').match(/^translate\(0 ([^)]+)\)/);
    const hand = rotate(1161, 275, 1242, 340, p.lean);
    const grip = rotate(hand[0], hand[1] + (move ? Number(move[1]) : 0), 1250, 420, p.boatRoll);
    assert.ok(Math.abs(rod[0] - p.boatX - grip[0]) < 1e-9);
    assert.ok(Math.abs(rod[1] - p.boatY - grip[1]) < 1e-9);
  }
});
