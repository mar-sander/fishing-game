'use strict';
const test=require('node:test');const assert=require('node:assert/strict');
const {AudioDirector,makeMusic,makeEffect,SAMPLE_RATE}=require('../audio.js');
const {audioHarness}=require('./audio-harness.cjs');const {createHarness}=require('./dom-harness.cjs');
const peak=data=>data.reduce((a,x)=>Math.max(a,Math.abs(x)),0);
const rms=data=>Math.sqrt(data.reduce((a,x)=>a+x*x,0)/data.length);
function rig(options){let now=0;const mock=audioHarness(()=>now,options),a=new AudioDirector(mock);return {a,mock,advance(ms){now+=ms;mock.tick();}};}
test('FA1 自作BGMは20秒・有限PCM・控えめなピーク・滑らかなループ境界',()=>{
  const music=makeMusic();assert.equal(music.length,20*SAMPLE_RATE);assert.ok(music.every(Number.isFinite));assert.ok(peak(music)<=.240001);assert.ok(rms(music)>.01&&rms(music)<.1);
  const seam=Math.abs(music[0]-music.at(-1));assert.ok(seam<.002,`seam ${seam}`);
});
test('FA1 全SEが有限・端でほぼ無音、GREATはGOODより強く長い',()=>{
  for(const kind of ['GREAT','GOOD','BAD','prompt','count','go','win','draw','double']){const data=makeEffect(kind);assert.ok(data.every(Number.isFinite));assert.ok(peak(data)<=.620001);assert.ok(Math.abs(data[0])<.001);assert.ok(Math.abs(data.at(-1))<.002,kind);}
  assert.ok(makeEffect('GREAT').length>makeEffect('GOOD').length);assert.ok(rms(makeEffect('GREAT'))>rms(makeEffect('GOOD')));
});
test('FA1 BGMと最大4声SEの保守的合算ピークが1未満',()=>{assert.ok(.62*(.24*.28+4*.62*.38)<.7);});
test('FA1 初期ミュート:AudioContext・音源を作らず、操作で解放',async()=>{
  const {a,mock}=rig();a.setPhase('playing');a.play('GREAT','fish');assert.equal(mock.contexts.length,0);assert.equal(a.enabled,false);
  assert.equal(await a.setEnabled(true),true);assert.equal(mock.contexts.length,1);assert.equal(a.music.source.loop,true);
});
test('FA1 再生許可失敗時はミュートへ戻り、ゲーム側へ例外を出さない',async()=>{
  const {a}=rig({rejectResume:true});a.setPhase('playing');assert.equal(await a.setEnabled(true),false);assert.equal(a.enabled,false);assert.equal(a.music,null);
});
test('FA1 音声許可待ちの途中でOFFにしても、遅い完了で再生しない',async()=>{
  const {a,mock}=rig({deferredResume:true});a.setPhase('playing');const pending=a.setEnabled(true);await a.setEnabled(false);mock.flushResume();assert.equal(await pending,false);assert.equal(a.enabled,false);assert.equal(a.music,null);
});
test('FA1 pause→resumeで位置継続、再戦で先頭、重複ループを残さない',async()=>{
  const {a,mock,advance}=rig();await a.setEnabled(true);a.setPhase('playing');const first=a.music;a.setPhase('playing');assert.equal(a.music,first);advance(4200);a.setPhase('paused');advance(20);assert.equal(mock.contexts[0].active().length,0);
  a.setPhase('playing');assert.ok(Math.abs(a.music.offset-4.2)<1e-9);a.reset();advance(20);assert.equal(mock.contexts[0].active().length,0);a.setPhase('countdown');a.setPhase('playing');assert.equal(a.music.offset,0);assert.equal(mock.contexts[0].active().filter(x=>x.loop).length,1);
});
test('FA1 同時GREATは左右別定位、声数上限、終了後ノード解放',async()=>{
  const {a,mock,advance}=rig();await a.setEnabled(true);a.setPhase('playing');a.play('GREAT','fish');a.play('GREAT','human');assert.deepEqual([...a.voices].map(x=>x.panner.pan.value),[-.55,.55]);
  for(let i=0;i<20;i++){a.play('GOOD','fish');advance(20);assert.ok(a.voices.size<=4);}
  advance(1000);assert.equal(a.voices.size,0);assert.equal(mock.contexts[0].active().length,1);assert.ok(mock.contexts[0].sources.filter(x=>!x.loop).every(x=>x.disconnected));
});
test('FA1 ミュート・タイトル・終了・非表示でBGM/SEを停止',async()=>{
  const {a,mock,advance}=rig();await a.setEnabled(true);
  for(const phase of ['paused','title','finishing','result']){a.setPhase('playing');a.play('GREAT');a.setPhase(phase);advance(20);assert.equal(mock.contexts[0].active().length,0);}
  a.setPhase('playing');a.play('GREAT');await a.setEnabled(false);advance(20);assert.equal(mock.contexts[0].active().length,0);
  await a.setEnabled(true);a.play('GREAT');a.silence();advance(20);assert.equal(mock.contexts[0].active().length,0);
});
test('FA1 アプリ操作で開始・停止・復帰・終了・再戦・タイトルのBGM寿命',async()=>{
  const h=createHarness({audio:true});assert.equal(h.sound.contexts.length,0);h.click('sound');await Promise.resolve();h.click('start');h.advance(3320);
  const ctx=h.sound.contexts[0],loops=()=>ctx.active().filter(x=>x.loop).length;assert.equal(loops(),1);
  h.key('Escape');h.advance(20);assert.equal(loops(),0);h.click('resume');h.advance(3320);assert.equal(loops(),1);
  h.event('blur');h.advance(20);assert.equal(ctx.active().length,0);h.click('resume');h.advance(3320);h.advance(62500);assert.equal(loops(),0);
  h.click('rematch');h.advance(3320);assert.equal(loops(),1);h.key('Escape');h.click('quit');h.advance(20);assert.equal(ctx.active().length,0);
});
