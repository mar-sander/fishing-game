'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHarness}=require('./dom-harness.cjs');
const {KEYS}=require('../engine.js');
const mapping={up:['KeyW','ArrowUp',0,'上'],right:['KeyD','ArrowRight',90,'右'],down:['KeyS','ArrowDown',180,'下'],left:['KeyA','ArrowLeft',270,'左']};
function start(h){h.click('start');h.advance(3320);}
function next(h){for(let i=0;i<500;i++){if(h.$('cue').classList.contains('active'))return h.$('direction').getAttribute('data-direction');h.frame();}throw Error('No prompt');}
const nums=s=>s.match(/-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g).map(Number);
const rot=(x,y,cx,cy,a)=>{const r=a*Math.PI/180;return [cx+(x-cx)*Math.cos(r)-(y-cy)*Math.sin(r),cy+(x-cx)*Math.sin(r)+(y-cy)*Math.cos(r)];};
for(const [direction,[fish,human,angle,name]] of Object.entries(mapping)) {
  test(`FA1 ${name}: WASDは魚・矢印キーは人間、同時GREATと図形方向`,()=>{
    assert.deepEqual(KEYS[fish],['fish',direction]);assert.deepEqual(KEYS[human],['human',direction]);
    const h=createHarness();start(h);
    for(let i=0;i<20;i++) {const d=next(h);if(d===direction)break;h.advance(1100);}
    assert.equal(h.$('direction').getAttribute('data-direction'),direction);
    assert.equal(h.$('direction').tagName,'svg');assert.equal(h.$('direction').getAttribute('hidden'),null);
    assert.equal(h.$('prompt-idle').getAttribute('hidden'),'');
    assert.equal(h.$('direction-arrow').getAttribute('transform'),`rotate(${angle} 50 50)`);
    assert.equal(h.$('direction-name').textContent,name);assert.equal(h.$('cue').getAttribute('aria-label'),'共通方向指示 '+name);
    const before=Number(h.$('fish-bar').getAttribute('aria-valuenow'));
    h.key(fish);assert.equal(h.$('fish-judge').textContent,'GREAT');assert.equal(h.$('human-judge').textContent,'READY');
    h.key(human);for(const player of ['fish','human']){assert.equal(h.$(player+'-judge').textContent,'GREAT');assert.equal(Number(h.$(player+'-bar').getAttribute('aria-valuenow')),before-7.5);assert.ok(h.$(player+'-judge').parentElement.querySelector('.verdict-burst'));}
  });
}
test('FA1 タイトル左右順・HP・ヘルプ・カウントダウン・読み上げ案内の一致',()=>{
  const h=createHarness();const text=h.$('intro').textContent;
  assert.ok(text.indexOf('FISH')<text.indexOf('HUMAN'));
  assert.match(h.doc.querySelector('.fish-health').textContent,/W A S D/);
  assert.match(h.doc.querySelector('.human-health').textContent,/↑ ← ↓ →/);
  assert.match(h.$('help').textContent,/魚.*W A S D/);assert.match(h.$('help').textContent,/人間.*矢印/);
  assert.match(h.$('countdown').textContent,/左の魚はWASD.*右の人間は矢印キー/);
  assert.equal(h.$('fish-detail').textContent,'WASD');assert.equal(h.$('human-detail').textContent,'矢印キー');
  start(h);assert.match(h.$('announcer').textContent,/左の魚はWASD、右の人間は矢印キー/);
});
test('FA1 図形矢印と1秒リングが同時に始まり、500msで半周',()=>{
  const h=createHarness();start(h);next(h);assert.equal(Number(h.$('deadline-ring').style.strokeDashoffset),0);
  h.advance(500);assert.equal(Number(h.$('deadline-ring').style.strokeDashoffset),50);
  h.advance(500);assert.equal(Number(h.$('deadline-ring').style.strokeDashoffset),100);
});
test('FA1 1000ms超の両入力は無効、未入力のダメージなし',()=>{
  const h=createHarness();start(h);const d=next(h);h.advance(1000.001);h.key(mapping[d][0]);h.key(mapping[d][1]);
  for(const who of ['fish','human']){assert.equal(h.$(who+'-judge').textContent,'NO INPUT');assert.equal(h.$(who+'-bar').getAttribute('aria-valuenow'),'100');}
});
test('FA1 両者BADはそれぞれ自傷2.5、同時GREATと独立した表示',()=>{
  const h=createHarness();start(h);const d=next(h),wrong=mapping[d==='up'?'left':'up'];h.key(wrong[0]);h.key(wrong[1]);
  for(const who of ['fish','human']){assert.equal(h.$(who+'-judge').textContent,'BAD');assert.equal(h.$(who+'-bar').getAttribute('aria-valuenow'),'97.5');assert.ok(h.$(who+'-judge').parentElement.classList.contains('bad'));}
});
test('FA1 攻防6000フレーム:左右配置、口・糸・竿先・手の接続と粒子上限',()=>{
  const h=createHarness(),s=new h.context.LakeScene(h.doc);s.engaged=true;
  for(let i=0;i<6000;i++){
    if(i%43===0)s.react({type:'judge',player:i%86?'human':'fish',result:['GREAT','GOOD','BAD'][Math.floor(i/43)%3]});
    s.update(1/60);const p=s.pose;
    for(const v of Object.values(p))assert.ok(Number.isFinite(v));
    assert.ok(p.fishX>220&&p.fishX<340&&p.fishY>535&&p.fishY<620);
    assert.ok(p.tipX>900&&p.tipX<995&&p.tipY>125&&p.tipY<195);
    const line=nums(h.$('line').getAttribute('d')),rod=nums(h.$('rod').getAttribute('d'));
    assert.deepEqual(line.slice(0,2),rod.slice(-2));
    const mouth=rot(-115,3,0,0,p.angle);assert.ok(Math.abs(line[2]-p.fishX-mouth[0])<1e-9);assert.ok(Math.abs(line[3]-p.fishY-mouth[1])<1e-9);
    // FA2: 上半身の引き上げ移動も実SVGの変換順で接続を検査する。
    const bodyMove=h.$('angler').getAttribute('transform').match(/^translate\(0 ([^)]+)\)/);
    const hand=rot(1161,275,1242,340,p.lean),grip=rot(hand[0],hand[1]+(bodyMove?Number(bodyMove[1]):0),1250,420,p.boatRoll);
    assert.ok(Math.abs(rod[0]-p.boatX-grip[0])<1e-9);assert.ok(Math.abs(rod[1]-p.boatY-grip[1])<1e-9);
    assert.equal(h.$('fishing-line').getAttribute('opacity'),'1');assert.ok(s.particleCount<=80);
  }
});
test('FA1 GREATの反応はGOODより大きく、成功側に応じて逆向きに力が働く',()=>{
  function pose(player,result){const h=createHarness(),s=new h.context.LakeScene(h.doc);s.engaged=true;s.update(.05);if(player)s.react({type:'judge',player,result});s.update(.05);return s.pose;}
  const base=pose(),fish=pose('fish','GREAT'),human=pose('human','GREAT'),good=pose('fish','GOOD');
  assert.ok(fish.fishX<base.fishX&&human.fishX>base.fishX);assert.ok(fish.lean<base.lean&&human.lean>base.lean);
  assert.ok(base.fishX-fish.fishX>(base.fishX-good.fishX)*1.5);
});
test('FA1 一時停止で攻防の姿勢が固定され、resetで判定反応を消去',()=>{
  const h=createHarness(),s=new h.context.LakeScene(h.doc);s.engaged=true;s.react({type:'judge',player:'fish',result:'GREAT'});s.update(.05);
  const pose=JSON.stringify(s.pose);s.update(10,true);assert.equal(JSON.stringify(s.pose),pose);s.reset();assert.equal(s.attacks.fish,null);assert.equal(s.outcome,null);assert.equal(s.particles.length,0);
});
test('FA1 reduced-motionは大きな姿勢変化・粒子・発光を停止',()=>{
  const h=createHarness({reduced:true}),s=new h.context.LakeScene(h.doc);s.engaged=true;s.update(.05);const pose=JSON.stringify(s.pose);
  s.react({type:'judge',player:'fish',result:'GREAT'});s.update(.05);assert.equal(JSON.stringify(s.pose),pose);assert.equal(s.particleCount,0);assert.equal(h.$('line-flash').getAttribute('opacity'),'0');
});
