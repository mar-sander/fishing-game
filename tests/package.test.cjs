'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');

test('単体プレビューに正本のCSS/JS/SVGが完全一致で入っている',()=>{
  const page=read('FISHING_DUEL_FA2_Preview.html');
  for(const name of ['style.css','engine.js','scene.js','audio.js','app.js','scene.svg'])assert.ok(page.includes(read(name)),name);
  assert.equal(read('index.html'),read('page.template.html').replace('<!-- SCENE -->',read('scene.svg')));
});
test('公開用ソースとプレビューのSHA-256が記録と一致',()=>{
  const hashes=JSON.parse(read('SOURCE_HASHES.json'));
  for(const [name,expected] of Object.entries(hashes))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,name))).digest('hex'),expected,name);
});
test('HTMLのidに重複がない',()=>{
  const ids=[...read('index.html').matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(new Set(ids).size,ids.length);
});
test('MP3以外の外部CDN・画像ダウンロード依存なし',()=>{
  const preview=read('FISHING_DUEL_FA2_Preview.html');
  assert.equal(/(?:src|href)="https?:\/\//.test(preview),false);
  assert.equal(/\bfetch\s*\(|XMLHttpRequest|WebSocket|@import\b/.test(preview),false);
  assert.ok(preview.includes('BGM-battle.mp3'));
  assert.ok(read('audio.js').includes('new this.host.Audio()'));
  for(const name of ['engine.js','scene.js','audio.js','app.js','style.css'])assert.ok(fs.existsSync(path.join(root,name)));
});
