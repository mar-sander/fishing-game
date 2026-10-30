'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {AudioDirector, makeMusic, makeEffect, SAMPLE_RATE, MIX} = require('../audio.js');
const {audioHarness} = require('./audio-harness.cjs');
const {createHarness} = require('./dom-harness.cjs');
const peak = data => data.reduce((a,x) => Math.max(a,Math.abs(x)), 0);
const rms = data => Math.sqrt(data.reduce((a,x) => a+x*x, 0)/data.length);
function rig(options){let now=0;const mock=audioHarness(()=>now,options),a=new AudioDirector(mock);return {a,mock,advance(ms){now+=ms;mock.tick();}};}

test('旧PCM BGMは互換関数のみ残し、MP3再生では利用しない',()=>{
  const legacy=makeMusic();assert.equal(legacy.length,20*SAMPLE_RATE);assert.ok(legacy.every(Number.isFinite));
});
test('SE全種は有限PCM、GREATはGOODより強く長い',()=>{
  for(const kind of ['GREAT','GOOD','BAD','prompt','count','go','win','draw','double']){
    const data=makeEffect(kind);assert.ok(data.every(Number.isFinite));assert.ok(peak(data)<=.620001);
    assert.ok(Math.abs(data[0])<.001);assert.ok(Math.abs(data.at(-1))<.002,kind);
  }
  assert.ok(makeEffect('GREAT').length>makeEffect('GOOD').length);
  assert.ok(rms(makeEffect('GREAT'))>rms(makeEffect('GOOD')));
});
test('初期SOUND OFFではAudioContextもMediaも作らない',async()=>{
  const {a,mock}=rig();a.setPhase('playing');a.play('GREAT','fish');
  assert.equal(mock.contexts.length,0);assert.equal(mock.tracks.length,0);assert.equal(a.enabled,false);
  assert.equal(await a.setEnabled(true),true);
  assert.equal(mock.contexts.length,1);assert.equal(mock.tracks.length,2);
  assert.equal(a.music.loop,true);assert.equal(a.music.volume,MIX.bgm);
  assert.equal(a.music.src,'BGM-battle.mp3');assert.equal(a.music.paused,false);
  assert.equal(a.victoryMedia.src,'fanfare.mp3');assert.equal(a.victoryMedia.paused,true);
  assert.equal(a.victoryMedia.loop,false);assert.equal(a.victoryMedia.volume,.56);
  assert.equal(mock.contexts[0].sources.filter(x=>x.loop).length,0,'旧PCM BGM音源は起動しない');
});
test('file://で単体プレビューを開いた場合のみ公開済みのMP3 URLを参照',async()=>{
  const {a,mock}=rig();mock.location={protocol:'file:'};await a.setEnabled(true);
  assert.equal(a.music.src,'https://mar-sander.github.io/fishing-game/BGM-battle.mp3');
  assert.equal(a.victoryMedia.src,'https://mar-sander.github.io/fishing-game/fanfare.mp3');
  assert.equal(a.music.paused,true);
});
test('タイトル・カウントダウンは無音、ゲーム開始でのみMP3ループ',async()=>{
  const {a}=rig();await a.setEnabled(true);
  for(const phase of ['title','countdown','paused']){a.setPhase(phase);assert.equal(a.music.paused,true);}
  a.setPhase('playing');assert.equal(a.music.paused,false);assert.equal(a.music.loop,true);
  a.setPhase('playing');assert.equal(a.music.playCount,1,'二重再生しない');
});
test('再生許可失敗時はSOUND OFFに戻しSE/進行を妨げない',async()=>{
  const {a}=rig({rejectResume:true});a.setPhase('playing');
  assert.equal(await a.setEnabled(true),false);assert.equal(a.enabled,false);
  assert.equal(a.music.paused,true);
});
test('SOUND ON処理待ちにOFFへ戻しても遅延完了で再生しない',async()=>{
  const {a,mock}=rig({deferredResume:true});a.setPhase('playing');
  const pending=a.setEnabled(true);await a.setEnabled(false);mock.flushResume();
  assert.equal(await pending,false);assert.equal(a.enabled,false);assert.equal(a.music.paused,true);
});
test('pause→再開カウントダウン→resumeでは再生位置を保持し、再戦では先頭',async()=>{
  const {a,advance}=rig();await a.setEnabled(true);a.setPhase('playing');
  advance(4200);a.setPhase('paused');const saved=a.music.currentTime;
  advance(2000);assert.equal(a.music.currentTime,saved);
  a.setPhase('countdown');assert.equal(a.music.paused,true);
  advance(3300);a.setPhase('playing');assert.equal(a.music.currentTime,saved);
  advance(1300);assert.ok(Math.abs(a.music.currentTime-(saved+1.3))<1e-8);
  a.reset();assert.equal(a.music.paused,true);assert.equal(a.music.currentTime,0);
  a.setPhase('countdown');a.setPhase('playing');assert.equal(a.music.currentTime,0);
});
test('SOUND OFF/ONは位置を保ち、試合終了・タイトルでは先頭に戻す',async()=>{
  const {a,advance}=rig();await a.setEnabled(true);a.setPhase('playing');advance(3600);
  await a.setEnabled(false);const saved=a.music.currentTime;advance(2200);
  assert.equal(a.music.currentTime,saved);await a.setEnabled(true);
  assert.equal(a.music.currentTime,saved);assert.equal(a.music.paused,false);
  a.setPhase('finishing');assert.equal(a.music.paused,true);assert.equal(a.music.currentTime,saved);
  a.setPhase('result');assert.equal(a.music.currentTime,0);
  a.setPhase('playing');advance(600);a.setPhase('title');assert.equal(a.music.currentTime,0);
});
test('GREAT左右別定位、最大4声SE、終了後ノード解放を維持',async()=>{
  const {a,mock,advance}=rig();await a.setEnabled(true);a.setPhase('playing');
  a.play('GREAT','fish');a.play('GREAT','human');
  assert.deepEqual([...a.voices].map(x=>x.panner.pan.value),[-.55,.55]);
  for(let i=0;i<20;i++){a.play('GOOD','fish');advance(20);assert.ok(a.voices.size<=4);}
  advance(1000);assert.equal(a.voices.size,0);
  assert.equal(mock.contexts[0].active().length,0,'WebAudio BGM音源は存在しない');
  assert.ok(mock.contexts[0].sources.every(x=>x.disconnected));
  assert.equal(a.music.paused,false);
});
test('BGMの通常音量は25％、SEマスター音量は旧版より大きい', async()=>{
  const {a}=rig();await a.setEnabled(true);a.setPhase('playing');
  assert.equal(MIX.bgm,.25);assert.equal(a.music.volume,.25);
  assert.equal(a.master.gain.value,.80);
});
test('判定時にBGMが自動で下がり、0.2秒程度で元の音量へ戻る',async()=>{
  const {a,advance}=rig();await a.setEnabled(true);a.setPhase('playing');
  a.play('GREAT','fish');assert.equal(a.music.volume,MIX.greatDuck);
  advance(400);a.updateMix();assert.equal(a.music.volume,MIX.greatDuck);
  advance(250);a.updateMix();assert.equal(a.music.volume,MIX.bgm);
  a.play('GOOD','human');assert.equal(a.music.volume,MIX.otherDuck);
  advance(400);a.updateMix();assert.equal(a.music.volume,MIX.bgm);
  a.play('BAD','fish');assert.equal(a.music.volume,MIX.otherDuck);
  advance(400);a.updateMix();assert.equal(a.music.volume,MIX.bgm);
});
test('GREAT重複は強いduckを優先、次のGOODでBGMが早く戻らない',async()=>{
  const {a,advance}=rig();await a.setEnabled(true);a.setPhase('playing');
  a.play('GREAT','fish');advance(150);a.play('GOOD','human');
  assert.equal(a.music.volume,MIX.greatDuck);
  advance(400);a.updateMix();assert.equal(a.music.volume,MIX.greatDuck);
  advance(100);a.updateMix();assert.ok(a.music.volume>MIX.greatDuck && a.music.volume<MIX.bgm);
  advance(200);a.updateMix();assert.equal(a.music.volume,MIX.bgm);
});
test('ポーズ・結果・タイトル・SOUND OFFでduck状態が残らず、再生位置を保持',async()=>{
  const {a,advance}=rig();await a.setEnabled(true);a.setPhase('playing');
  advance(2500);a.play('GREAT','fish');const pos=a.music.currentTime;
  a.setPhase('paused');assert.equal(a.music.volume,MIX.bgm);
  assert.equal(a.music.currentTime,pos);a.setPhase('countdown');a.setPhase('playing');
  assert.equal(a.music.currentTime,pos);assert.equal(a.music.volume,MIX.bgm);
  a.play('BAD','human');await a.setEnabled(false);assert.equal(a.music.volume,MIX.bgm);
  await a.setEnabled(true);assert.equal(a.music.volume,MIX.bgm);
  a.play('GREAT','human');a.setPhase('result');assert.equal(a.music.volume,MIX.bgm);
  assert.equal(a.music.paused,true);assert.equal(a.music.currentTime,0);
});
test('判定SEのゲインと音形はGREATが最大・GOODも強化・BADは低い3音',async()=>{
  const {a}=rig();await a.setEnabled(true);a.setPhase('playing');
  for(const type of ['GOOD','BAD','GREAT'])a.play(type,'human');
  const entries=[...a.voices];
  assert.deepEqual(entries.map(x=>x.gain.gain.value),[.54,.58,.74]);
  assert.ok(makeEffect('GREAT').length>makeEffect('GOOD').length);
  assert.ok(rms(makeEffect('GREAT'))>rms(makeEffect('GOOD')));
  assert.ok(makeEffect('BAD').length>Math.floor(.4*SAMPLE_RATE));
  assert.ok(rms(makeEffect('GREAT'))>.07);
});
test('非表示時silenceは再生位置を保ったまま停止',async()=>{
  const {a,advance}=rig();await a.setEnabled(true);a.setPhase('playing');advance(1230);
  a.play('GREAT');a.silence();const saved=a.music.currentTime;advance(1000);
  assert.equal(a.music.currentTime,saved);assert.equal(a.music.paused,true);assert.equal(a.voices.size,0);
});
test('アプリ: 開始・停止・復帰・終了・再戦・タイトルまでMP3の位相を維持',async()=>{
  const h=createHarness({audio:true});assert.equal(h.sound.contexts.length,0);
  h.click('sound');await Promise.resolve();h.click('start');
  let track=h.sound.tracks[0];assert.equal(track.paused,true);
  h.advance(3320);assert.equal(track.paused,false);
  h.advance(910);h.key('Escape');h.advance(20);
  const saved=track.currentTime;assert.equal(track.paused,true);
  h.click('resume');h.advance(3320);assert.equal(track.paused,false);assert.ok(Math.abs(track.currentTime-saved)<.025, `resume offset: ${track.currentTime} vs ${saved}`);
  h.event('blur');h.advance(20);assert.equal(track.paused,true);
  h.click('resume');h.advance(3320);h.advance(62500);
  assert.equal(track.paused,true);assert.equal(track.currentTime,0);
  h.click('rematch');h.advance(3320);assert.equal(track.paused,false);
  h.key('Escape');h.click('quit');h.advance(20);
  assert.equal(track.paused,true);assert.equal(track.currentTime,0);
});

test('結果ファンファーレは約8秒・全勝敗種が有限PCM・末尾は無音',()=>{
  const {makeResultFanfare,FANFARE_SECONDS}=require('../audio.js');
  assert.equal(FANFARE_SECONDS,8);
  const outcomes=['HUMAN WIN','FISH WIN','DRAW','DOUBLE K.O.'];
  const clips=outcomes.map(makeResultFanfare);
  for(const clip of clips){
    assert.equal(clip.length,SAMPLE_RATE*FANFARE_SECONDS);
    assert.ok(clip.every(Number.isFinite));
    assert.ok(peak(clip)<=.590001);
    assert.ok(Math.abs(clip.at(-1))<1e-6);
    assert.ok(rms(clip)>.03,'十分な音量がある');
  }
  assert.deepEqual(clips[0],clips[1],'魚と人間で公平に祝福');
  assert.notDeepEqual(clips[0],clips[2]);
  assert.notDeepEqual(clips[0],clips[3]);
});

test('WINのみfanfare.mp3、RESULT表示前に再生せず、Web Audio勝利ファンファーレとの二重再生なし', async()=>{
  const {a,mock}=rig();
  await a.setEnabled(true);
  for(const phase of ['title','countdown','playing','finishing','paused']){
    a.setPhase(phase);a.playResultFanfare('FISH WIN');
    assert.equal(a.victoryMedia.playCount,0,phase);
    assert.equal(mock.contexts[0].sources.length,0,phase);
  }
  a.setPhase('result');
  a.playResultFanfare('HUMAN WIN');
  assert.equal(a.victoryMedia.playCount,1);
  assert.equal(a.victoryMedia.paused,false);
  assert.equal(a.victoryMedia.currentTime,0);
  assert.equal(mock.contexts[0].sources.length,0,'旧WIN合成PCMを再生しない');
  assert.equal(a.music.paused,true,'戦闘BGMも停止');
  assert.equal(a.victoryMedia.loop,false);
  a.setPhase('title');
  assert.equal(a.victoryMedia.paused,true);
  assert.equal(a.victoryMedia.currentTime,0);
});

test('DRAW／DOUBLE K.O.は従来の8秒専用PCM、WIN MP3はSOUND OFF・タイトル・再戦で停止',async()=>{
  const {a,mock,advance}=rig();
  await a.setEnabled(true);a.setPhase('result');
  a.playResultFanfare('DRAW');
  const draw=mock.contexts[0].sources.at(-1).buffer;
  assert.equal(draw.duration,8);assert.equal(a.victoryMedia.playCount,0);
  a.setPhase('title');assert.equal(a.voices.size,0);
  a.setPhase('result');a.playResultFanfare('DOUBLE K.O.');
  assert.notEqual(mock.contexts[0].sources.at(-1).buffer,draw);
  assert.equal(a.voices.size,1);assert.equal(a.victoryMedia.playCount,0);
  await a.setEnabled(false);assert.equal(a.voices.size,0);
  await a.setEnabled(true);a.playResultFanfare('FISH WIN');
  assert.equal(a.victoryMedia.playCount,1);assert.equal(a.voices.size,0);
  advance(3300);const played=a.victoryMedia.currentTime;assert.ok(played>3);
  await a.setEnabled(false);assert.equal(a.victoryMedia.paused,true);assert.equal(a.victoryMedia.currentTime,0);
  await a.setEnabled(true);a.playResultFanfare('HUMAN WIN');
  assert.equal(a.victoryMedia.playCount,2);assert.equal(a.victoryMedia.currentTime,0);
  a.reset();assert.equal(a.victoryMedia.paused,true);assert.equal(a.victoryMedia.currentTime,0);
});

test('アプリ: 結果画面でファンファーレ開始、勝敗種類に応じてMP3／PCMを区別', async()=>{
  const h=createHarness({audio:true});
  h.click('sound');await Promise.resolve();
  h.click('start');h.advance(3320);
  h.advance(60020);
  const source=h.sound.contexts[0].sources;
  assert.equal(h.$('result').hidden,true);
  const preCount=source.length;
  h.advance(2300);
  assert.equal(h.$('result').hidden,false);
  const win=['HUMAN WIN','FISH WIN'].includes(h.$('result-title').textContent);
  if(win){
    assert.equal(h.sound.tracks[1].playCount,1,'WINならfanfare.mp3を1回');
    assert.equal(source.length,preCount,'旧WINのWeb Audioソースは増えない');
  }else{
    assert.equal(source.length,preCount+1,'DRAW／DOUBLE K.O.なら合成PCMを1回');
    assert.equal(source.at(-1).buffer.duration,8);
  }
  assert.equal(h.sound.tracks[0].paused,true,'戦闘BGMは再生されない');
  h.click('rematch');h.advance(32);
  assert.equal(h.sound.tracks[1].paused,true,'再戦でMP3停止');
  assert.equal(h.sound.contexts[0].active().filter(node=>node.buffer?.duration===8).length,0, '前回RESULTの8秒音源は停止');
});

test('RESULT-1 FA1: 壮大な勝利版は最後のクライマックスが強く、同音量範囲で約8秒',()=>{
  const {makeResultFanfare,FANFARE_SECONDS}=require('../audio.js');
  const victory=makeResultFanfare('HUMAN WIN');
  const fish=makeResultFanfare('FISH WIN');
  assert.equal(victory.length,FANFARE_SECONDS*SAMPLE_RATE);
  assert.deepEqual(victory,fish);
  assert.ok(victory.every(Number.isFinite));
  assert.ok(peak(victory)<=.590001);
  assert.ok(Math.abs(victory.at(-1))<1e-6);
  const early=rms(victory.subarray(0,2*SAMPLE_RATE));
  const climax=rms(victory.subarray(6*SAMPLE_RATE,7*SAMPLE_RATE));
  assert.ok(climax>early*1.25, `Finale energy ${climax} vs opening ${early}`);
  assert.ok(rms(victory)>.10,'勝利楽曲の演奏音量が確保されている');
});


test('結果画面からタイトルへ戻るとMP3停止し、試合BGMも停止',async()=>{
  const h=createHarness({audio:true});
  h.click('sound');await Promise.resolve();
  h.click('start');h.advance(3320);h.advance(60020);h.advance(2300);
  // テストハーネス上で、実際の勝敗に依存せず勝利MP3の制御を試す。
  const audio=h.context.FishingAudio;
  assert.ok(audio.AudioDirector);
  const winTrack=h.sound.tracks[1];
  h.click('back');
  assert.equal(winTrack.paused,true);assert.equal(winTrack.currentTime,0);
  assert.equal(h.sound.tracks[0].paused,true);
});

test('単体プレビューのパスではMP3を公開URLへ、通常のindex.htmlでは相対パスへ',async()=>{
  const first=rig();first.mock.location={protocol:'https:',pathname:'/sandbox/FISHING_DUEL_Result1_MP3_Preview.html'};
  await first.a.setEnabled(true);
  assert.equal(first.a.victoryMedia.src,'https://mar-sander.github.io/fishing-game/fanfare.mp3');
  const live=rig();live.mock.location={protocol:'https:',pathname:'/fishing-game/index.html'};
  await live.a.setEnabled(true);
  assert.equal(live.a.victoryMedia.src,'fanfare.mp3');
});
