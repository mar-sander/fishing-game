'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./dom-harness.cjs');
const humanKeys={up:'ArrowUp',right:'ArrowRight',down:'ArrowDown',left:'ArrowLeft'};
const fishKeys={up:'KeyW',right:'KeyD',down:'KeyS',left:'KeyA'};
function start(h){h.click('start');h.advance(3320);}
function prompt(h){for(let i=0;i<500;i++){if(h.$('cue').classList.contains('active'))return h.$('direction').getAttribute('data-direction');h.frame(16);}throw Error('No prompt');}
function hp(h,who){return Number(h.$(who+'-bar').getAttribute('aria-valuenow'));}

test('実ソース起動・タイトル・遊び方・フォーカス復帰',()=>{
  const h=createHarness();assert.equal(h.$('intro').hidden,false);assert.equal(h.doc.activeElement,h.$('start'));
  h.click('help-open');assert.equal(h.$('help').hidden,false);assert.equal(h.doc.activeElement,h.$('help-close'));
  h.key('Escape');assert.equal(h.$('help').hidden,true);assert.equal(h.doc.activeElement,h.$('start'));
});
test('カウントダウン中の方向キーは判定されない',()=>{
  const h=createHarness();h.click('start');h.key('KeyW');h.key('ArrowUp');h.advance(2000);
  assert.equal(hp(h,'fish'),100);assert.equal(hp(h,'human'),100);assert.equal(h.$('countdown').hidden,false);
});
test('実DOMハンドラ:両者の独立入力・HP同時反映・反応時間',()=>{
  const h=createHarness();start(h);const dir=prompt(h);h.elapse(100);
  assert.equal(h.key(fishKeys[dir]).defaultPrevented,true);
  assert.equal(h.$('fish-judge').textContent,'GREAT');assert.equal(hp(h,'human'),100);
  h.frame(16);h.advance(500);h.key(humanKeys[dir]);
  assert.equal(h.$('human-judge').textContent,'GOOD');assert.equal(hp(h,'fish'),95);assert.equal(hp(h,'human'),92.5);
});
test('実DOMハンドラ:BAD後の修正・repeat・連打を拒否',()=>{
  const h=createHarness();start(h);const dir=prompt(h);const wrong=dir==='up'?'ArrowLeft':'ArrowUp';
  h.key(wrong);h.up(wrong);h.key(humanKeys[dir]);h.key(humanKeys[dir],true);
  h.advance(1050);assert.equal(hp(h,'human'),97.5);assert.equal(hp(h,'fish'),100);
});
test('実DOMハンドラ:前ラウンドから保持したキーは次の指示で発火しない',()=>{
  const h=createHarness();start(h);const dir=prompt(h);const key=humanKeys[dir];h.key(key);h.advance(1100);prompt(h);
  h.key(key,true);h.key(key,false);assert.equal(h.$('human-judge').textContent,'READY');
  h.up(key);h.key(key);assert.notEqual(h.$('human-judge').textContent,'READY');
});
test('実DOMハンドラ:割当外キーで入力機会を消費しない',()=>{
  const h=createHarness();start(h);const dir=prompt(h);h.key('KeyQ');assert.equal(h.$('human-judge').textContent,'READY');h.key(humanKeys[dir]);assert.equal(h.$('human-judge').textContent,'GREAT');
});
test('Esc停止・再開中は体力もゲーム時間も固定',()=>{
  const h=createHarness();start(h);prompt(h);const time=h.$('timer').textContent;
  h.key('Escape');h.advance(10000);assert.equal(h.$('paused').hidden,false);assert.equal(h.$('timer').textContent,time);
  h.key('KeyW');assert.equal(hp(h,'fish'),100);h.click('resume');h.advance(3320);assert.equal(h.$('paused').hidden,true);h.advance(120);assert.notEqual(h.$('timer').textContent,time);
});
test('タブ非表示/blurで自動停止、再開まで入力無効',()=>{
  const h=createHarness();start(h);prompt(h);h.event('blur');assert.equal(h.$('paused').hidden,false);h.advance(5000);assert.equal(hp(h,'human'),100);
  h.click('resume');h.advance(3320);h.doc.hidden=true;h.doc.dispatch('visibilitychange');assert.equal(h.$('paused').hidden,false);
});
test('大きなフレーム停止では矢印を飛ばさず一時停止',()=>{
  const h=createHarness();start(h);prompt(h);const time=h.$('timer').textContent;h.frame(1000);assert.equal(h.$('paused').hidden,false);assert.equal(h.$('timer').textContent,time);
});
test('入力時に描画停止を検知しても受付しない',()=>{
  const h=createHarness();start(h);const dir=prompt(h);h.elapse(250);h.key(humanKeys[dir]);assert.equal(h.$('paused').hidden,false);assert.equal(h.$('human-judge').textContent,'READY');
});
test('プレイ中RULESを開くと停止し、閉じても勝手に再開しない',()=>{
  const h=createHarness();start(h);prompt(h);h.click('guide');assert.equal(h.$('paused').hidden,false);assert.equal(h.$('help').hidden,false);h.click('help-done');assert.equal(h.$('help').hidden,true);assert.equal(h.$('paused').hidden,false);
});
test('60秒無入力:20回出現・DRAW・NO INPUT20・再戦でHPと結果を初期化',()=>{
  const h=createHarness();start(h);h.advance(62500);
  assert.equal(h.$('round-counter').textContent,'20 / 20');assert.equal(h.$('result-title').textContent,'DRAW');assert.equal(h.$('result').hidden,false);assert.equal(h.$('timer').textContent,'00.0');
  assert.equal(h.$('stats').children[9].textContent,'20');assert.equal(h.$('stats').children[11].textContent,'20');
  h.key('KeyW');assert.equal(hp(h,'fish'),100);h.click('rematch');assert.equal(h.$('result').hidden,true);assert.equal(h.$('round-counter').textContent,'00 / 20');assert.equal(h.$('timer').textContent,'60.0');
});
test('人間だけGREAT:早期HUMAN WIN・演出中入力無効・竿と糸が有限座標',()=>{
  const h=createHarness();start(h);for(let i=0;i<14;i++){const dir=prompt(h);h.key(humanKeys[dir]);h.up(humanKeys[dir]);h.advance(1100);}
  h.advance(2500);assert.equal(h.$('result-title').textContent,'HUMAN WIN');assert.equal(h.$('result').hidden,false);assert.equal(hp(h,'fish'),0);assert.equal(h.$('round-counter').textContent,'14 / 20');
  h.key('ArrowUp');assert.equal(hp(h,'human'),100);assert.ok(!h.$('line').getAttribute('d').includes('NaN'));assert.ok(!h.$('rod').getAttribute('d').includes('NaN'));
});
test('魚だけGREAT:FISH WIN・糸が切れ・餌が魚側へ移る',()=>{
  const h=createHarness();start(h);for(let i=0;i<14;i++){const dir=prompt(h);h.key(fishKeys[dir]);h.up(fishKeys[dir]);h.advance(1100);}
  h.advance(2500);assert.equal(h.$('result-title').textContent,'FISH WIN');assert.equal(h.$('fishing-line').getAttribute('opacity'),'0');assert.equal(h.$('bait').getAttribute('opacity'),'1');
});
test('双方GREAT:同一ラウンド決着はDOUBLE K.O.、DRAWと異なる表示・演出',()=>{
  const h=createHarness();start(h);for(let i=0;i<14;i++){const dir=prompt(h);h.key(fishKeys[dir]);h.key(humanKeys[dir]);h.up(fishKeys[dir]);h.up(humanKeys[dir]);h.advance(1100);}
  h.advance(2500);assert.equal(h.$('result-title').textContent,'DOUBLE K.O.');assert.equal(h.$('result-reason').textContent,'BOTH FELL. NEITHER YIELDED.');assert.equal(hp(h,'fish'),0);assert.equal(hp(h,'human'),0);
});
test('時間切れで体力差のある勝利も反映',()=>{
  const h=createHarness();start(h);const dir=prompt(h);h.key(fishKeys[dir]);h.up(fishKeys[dir]);h.advance(62500);
  assert.equal(h.$('result-title').textContent,'FISH WIN');assert.match(h.$('result-reason').textContent,/TIME UP/);assert.equal(h.$('round-counter').textContent,'20 / 20');
});
test('reduced-motionでも全試合・勝利が機能し粒子を生成しない',()=>{
  const h=createHarness({reduced:true});start(h);for(let i=0;i<14;i++){const dir=prompt(h);h.key(humanKeys[dir]);h.up(humanKeys[dir]);h.advance(1100);}
  h.advance(2500);assert.equal(h.$('result-title').textContent,'HUMAN WIN');assert.equal(h.$('spray').children.length,0);
});
test('タイトルに戻れば試合終了、次回はランダム予定を再生成',()=>{
  const h=createHarness();start(h);const first=[];for(let i=0;i<3;i++){first.push(h.now);prompt(h);h.advance(1100);}h.key('Escape');h.click('quit');assert.equal(h.$('intro').hidden,false);assert.equal(hp(h,'fish'),100);assert.equal(h.$('countdown').hidden,true);h.click('start');h.advance(3320);assert.equal(h.$('intro').hidden,true);
});

for(const [elapsed,expected] of [[500,'GREAT'],[500.001,'GOOD'],[1000,'GOOD']]) {
  test(`実DOMハンドラ:表示後${elapsed}msの正方向 = ${expected}`,()=>{
    const h=createHarness();start(h);const dir=prompt(h);h.advance(elapsed);h.key(humanKeys[dir]);assert.equal(h.$('human-judge').textContent,expected);
  });
}
test('音を利用できなくても安全にミュートへ戻る',()=>{const h=createHarness();h.click('sound');assert.equal(h.$('sound').textContent,'SOUND OFF');start(h);prompt(h);});
test('糸の終点は回転・移動後も魚の口と一致する',()=>{
  const h=createHarness();start(h);prompt(h);h.advance(160);
  const values=h.$('fish').getAttribute('transform').match(/-?[\d.]+/g).map(Number);
  const [x,y,angle]=values, r=angle*Math.PI/180;
  const end=h.$('line').getAttribute('d').match(/-?[\d.]+/g).map(Number).slice(2);
  assert.ok(Math.abs(end[0]-(x-115*Math.cos(r)-3*Math.sin(r)))<.00001);
  assert.ok(Math.abs(end[1]-(y-115*Math.sin(r)+3*Math.cos(r)))<.00001);
});
