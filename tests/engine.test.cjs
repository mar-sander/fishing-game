'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { RULES, judge, resolveHp, decide, createSchedule, Match, KeyGate } = require('../engine.js');

function seeded(seed) {
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
}
function open(match) {
  match.advance(match.schedule[match.index].at);
  return match.active;
}
const full = { fish: 200, human: 200 };

for (const [elapsed, expected] of [[0,'GREAT'],[499.999,'GREAT'],[500,'GREAT'],[500.0001,'GOOD'],[999.999,'GOOD'],[1000,'GOOD'],[1000.0001,null],[-.001,null]]) {
  test(`正方向 ${elapsed}ms = ${expected}`, () => assert.equal(judge('up', 'up', elapsed), expected));
}
for (const elapsed of [0, 500, 750, 1000]) {
  test(`誤方向 ${elapsed}ms = BAD`, () => assert.equal(judge('up','left',elapsed),'BAD'));
}
test('受付後の誤方向はBADにもならない', () => assert.equal(judge('up','left',1000.01),null));
test('GREATは相手の体力7.5を減らす', () => assert.deepEqual(resolveHp(full,{fish:'GREAT'}),{fish:200,human:185}));
test('GOODは相手の体力5を減らす', () => assert.deepEqual(resolveHp(full,{human:'GOOD'}),{fish:190,human:200}));
test('BADは自分だけ体力2.5を減らす', () => assert.deepEqual(resolveHp(full,{fish:'BAD'}),{fish:195,human:200}));
test('未入力は双方変化なし', () => assert.deepEqual(resolveHp(full,{}),full));
test('魚GREAT・人間GOODを同時反映', () => assert.deepEqual(resolveHp(full,{fish:'GREAT',human:'GOOD'}),{fish:190,human:185}));
test('双方BADは双方の自傷だけ', () => assert.deepEqual(resolveHp(full,{fish:'BAD',human:'BAD'}),{fish:195,human:195}));
test('HPは負にならない', () => assert.deepEqual(resolveHp({fish:5,human:5},{fish:'GREAT',human:'GREAT'}),{fish:0,human:0}));
test('GOOD20回で100を削りきる', () => {let hp=full;for(let i=0;i<20;i++)hp=resolveHp(hp,{human:'GOOD'});assert.equal(hp.fish,0);});
test('0.5単位のHPに計算誤差なし', () => {let hp=full;for(let i=0;i<13;i++)hp=resolveHp(hp,{fish:'GREAT',human:'BAD'});assert.equal(hp.human,0);assert.ok(Number.isInteger(hp.fish));});

for (const [hp,timeout,result] of [
  [{fish:0,human:5},false,'HUMAN WIN'], [{fish:5,human:0},false,'FISH WIN'],
  [{fish:0,human:0},false,'DOUBLE K.O.'], [{fish:5,human:5},false,null],
  [{fish:10,human:5},true,'FISH WIN'], [{fish:5,human:10},true,'HUMAN WIN'],
  [{fish:5,human:5},true,'DRAW'], [{fish:0,human:0},true,'DOUBLE K.O.']
]) test(`勝敗 ${JSON.stringify(hp)} timeout=${timeout}`, () => assert.equal(decide(hp,timeout),result));

test('10000試合の予定:20回・非等間隔・重複なし・全受付が60秒内', () => {
  const sequences = new Set();
  for(let seed=1;seed<=10000;seed++) {
    const schedule=createSchedule(seeded(seed));
    assert.equal(schedule.length,20);
    const intervals=[];
    for(let i=0;i<20;i++) {
      assert.ok(schedule[i].at>=650);
      assert.ok(schedule[i].at+1000<=60000-649.99);
      assert.ok(['up','right','down','left'].includes(schedule[i].direction));
      if(i) {const gap=schedule[i].at-schedule[i-1].at;assert.ok(gap>=1649.99);intervals.push(gap);}
    }
    assert.ok(Math.max(...intervals)-Math.min(...intervals)>1);
    sequences.add(JSON.stringify(schedule.map(round=>round.at)));
  }
  assert.equal(sequences.size,10000);
});
test('退化した乱数でも等間隔を避ける', () => {const s=createSchedule(()=>.5);assert.notEqual(s[10].at-s[9].at,s[1].at-s[0].at);});
test('フレーム周期1/16.67/50/199msで必ず20回完走する（計1200試合）', () => {
  for(const step of [1,16.67,50,199]) for(let seed=1;seed<=300;seed++) {
    const m=new Match(seeded(seed));
    for(let time=0;time<60000;time+=step)m.advance(time);
    m.advance(60000);
    assert.equal(m.index,20);
    assert.equal(m.history.length,20);
    assert.equal(m.result,'DRAW');
    assert.ok(m.history.every(r=>r.openedAt+1000<=60000));
    assert.ok(m.history.every((r,i)=>i===0||r.openedAt>=m.history[i-1].openedAt+1000));
  }
});
test('各プレイヤーが独立して入力し双方が揃ってからHP更新', () => {
  const m=new Match(seeded(1));const r=open(m);
  assert.equal(m.input('fish',r.direction,r.openedAt+200),'GREAT');
  assert.deepEqual(m.hp,full);
  assert.equal(m.input('human',r.direction,r.openedAt+750),'GOOD');
  assert.deepEqual(m.hp,{fish:190,human:185});assert.equal(m.history.length,1);
});
test('入力順序による結果差がない', () => {
  const a=new Match(seeded(2));const b=new Match(seeded(2));open(a);open(b);
  const d=a.active.direction,t=a.active.openedAt;
  a.input('fish',d,t+200);a.input('human',d,t+700);
  b.input('human',d,t+700);b.input('fish',d,t+200);
  assert.deepEqual(a.hp,b.hp);
});
test('片側未入力なら1秒まで相手を待つ', () => {
  const m=new Match(seeded(1));const r=open(m);
  m.input('fish',r.direction,r.openedAt+100);m.advance(r.openedAt+999);assert.deepEqual(m.hp,full);
  m.advance(r.openedAt+1000);assert.ok(m.active);
  m.advance(r.openedAt+1000.01);assert.deepEqual(m.hp,{fish:200,human:185});
});
test('実際の表示が予定より遅れたら表示時刻から500msを計る', () => {
  const m=new Match(seeded(1));m.advance(m.schedule[0].at+100);const r=m.active;
  assert.equal(m.input('fish',r.direction,r.openedAt+500),'GREAT');
});
test('各出現の最初の入力だけ採用・BADの後に修正不可', () => {
  const m=new Match(seeded(1));const r=open(m);const wrong=r.direction==='up'?'left':'up';
  assert.equal(m.input('fish',wrong,r.openedAt+1),'BAD');
  assert.equal(m.input('fish',r.direction,r.openedAt+2),null);
  m.advance(r.openedAt+1001);assert.deepEqual(m.hp,{fish:195,human:200});
});
test('期限超過入力でダメージを与えられない', () => {
  const m=new Match(seeded(1));const r=open(m);assert.equal(m.input('fish',r.direction,r.openedAt+1000.01),null);
  m.advance(r.openedAt+1001);assert.deepEqual(m.hp,full);
});
test('同一ラウンドの双方0はDOUBLE K.O.、以後の出現停止', () => {
  const events=[];const m=new Match(seeded(4),e=>events.push(e));m.hp={fish:10,human:10};const r=open(m);
  m.input('fish',r.direction,r.openedAt+10);assert.equal(m.result,null);
  m.input('human',r.direction,r.openedAt+20);assert.equal(m.result,'DOUBLE K.O.');
  const index=m.index;m.advance(60000);assert.equal(m.index,index);assert.equal(events.filter(e=>e.type==='finish').length,1);
});
test('人間の早期勝利で以後の入力と出現を停止', () => {
  const m=new Match(seeded(5));m.hp.fish=10;const r=open(m);
  m.input('human',r.direction,r.openedAt+200);m.advance(r.openedAt+1001);
  assert.equal(m.result,'HUMAN WIN');m.advance(60000);assert.equal(m.index,1);assert.equal(m.input('fish','up',60000),null);
});
test('魚の早期勝利', () => {const m=new Match(seeded(5));m.hp.human=10;const r=open(m);m.input('fish',r.direction,r.openedAt+200);m.advance(r.openedAt+1001);assert.equal(m.result,'FISH WIN');});
test('割当外の入力はラウンドの入力権を消費しない', () => {const m=new Match(seeded(5));const r=open(m);assert.equal(m.input('other','up',r.openedAt),null);assert.equal(m.input('fish','oops',r.openedAt),null);assert.equal(m.input('fish',r.direction,r.openedAt),'GREAT');});
test('押しっぱなし・repeat・別フレームの同一keydownを拒否、keyup後は有効', () => {
  const g=new KeyGate();assert.deepEqual(g.down('KeyW',false),['fish','up']);
  assert.equal(g.down('KeyW',true),null);assert.equal(g.down('KeyW',false),null);
  g.up('KeyW');assert.deepEqual(g.down('KeyW',false),['fish','up']);
});
test('WASD/矢印の同時押下は独立', () => {const g=new KeyGate();assert.deepEqual(g.down('KeyA',false),['fish','left']);assert.deepEqual(g.down('ArrowLeft',false),['human','left']);});
test('割当外キーは無効', () => {const g=new KeyGate();for(const key of ['Space','KeyQ','Numpad8','Enter'])assert.equal(g.down(key,false),null);});
test('フォーカス復帰でrepeatから新規入力は作らない', () => {const g=new KeyGate();g.down('KeyW',false);g.clear();assert.equal(g.down('KeyW',true),null);g.up('KeyW');assert.deepEqual(g.down('KeyW',false),['fish','up']);});
