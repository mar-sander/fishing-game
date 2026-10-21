/* 実ブラウザではありません。アプリとSVGアニメーションをNode VMで動かす最小DOM。 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { audioHarness } = require('./audio-harness.cjs');
const root = path.resolve(__dirname, '..');

class Element {
  constructor(tag, doc) { this.tagName=tag;this.doc=doc;this.attrs={};this.children=[];this.parentElement=null;this.listeners={};this.style={};this._text=''; }
  get id(){return this.attrs.id;}
  get className(){return this.attrs.class || '';}
  set className(value){this.attrs.class=value;}
  get hidden(){return Object.hasOwn(this.attrs,'hidden');}
  set hidden(value){if(value)this.attrs.hidden='';else delete this.attrs.hidden;}
  get textContent(){return this._text+this.children.map(child=>child.textContent).join('');}
  set textContent(value){this._text=String(value);this.children=[];}
  set innerHTML(value){this._text=String(value).replace(/<[^>]*>/g,'');this.children=[];}
  get innerHTML(){return this._text;}
  get classList(){
    const element=this;
    return {add(name){element.className=[...new Set([...element.className.split(/\s+/),name])].join(' ').trim();},remove(name){element.className=element.className.split(/\s+/).filter(item=>item!==name).join(' ');},contains(name){return element.className.split(/\s+/).includes(name);},toggle(name,force){const on=force===undefined?!this.contains(name):force;if(on)this.add(name);else this.remove(name);}};
  }
  setAttribute(name,value){this.attrs[name]=String(value);}
  removeAttribute(name){delete this.attrs[name];}
  getAttribute(name){return this.attrs[name]??null;}
  appendChild(child){child.parentElement=this;this.children.push(child);return child;}
  append(...children){for(const child of children)this.appendChild(child);}
  replaceChildren(...children){this.children=[];this._text='';this.append(...children);}
  remove(){if(this.parentElement)this.parentElement.children=this.parentElement.children.filter(item=>item!==this);}
  querySelector(query){return this.children.flatMap(child=>[child,...child.descendants()]).find(child=>query.startsWith('.')?child.classList.contains(query.slice(1)):child.tagName===query)||null;}
  descendants(){return this.children.flatMap(child=>[child,...child.descendants()]);}
  addEventListener(type,fn){(this.listeners[type]||=[]).push(fn);}
  dispatch(type,extra={}){const event={target:this,preventDefault(){this.defaultPrevented=true;},...extra};for(const fn of this.listeners[type]||[])fn(event);return event;}
  focus(){this.doc.activeElement=this;}
  blur(){if(this.doc.activeElement===this)this.doc.activeElement=null;}
  requestFullscreen(){this.doc.fullscreenElement=this;return Promise.resolve();}
}

function createHarness({ reduced=false, seed=2468, audio=false }={}) {
  const doc = new Element('document',null);doc.doc=doc;doc.hidden=false;doc.activeElement=null;
  doc.createElement=tag=>new Element(tag,doc);
  doc.createElementNS=(_,tag)=>new Element(tag,doc);
  doc.getElementById=id=>doc.descendants().find(child=>child.id===id)||null;
  doc.exitFullscreen=()=>{doc.fullscreenElement=null;return Promise.resolve();};
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const stack=[doc];
  const voids=new Set(['meta','link','br','input','img','hr']);
  for(const token of html.match(/<!--[\s\S]*?-->|<[^>]+>|[^<]+/g)||[]) {
    if(token.startsWith('<!--')||token.startsWith('<!'))continue;
    if(token.startsWith('</')){stack.pop();continue;}
    if(token.startsWith('<')) {
      const match=token.match(/^<([\w-]+)/);if(!match)continue;
      const el=new Element(match[1],doc);
      const body=token.slice(match[0].length,-1).replace(/\/$/,'');
      const attr=/([\w:-]+)(?:\s*=\s*"([^"]*)")?/g;
      let item;while((item=attr.exec(body)))el.attrs[item[1]]=item[2]||'';
      stack.at(-1).appendChild(el);
      if(!token.endsWith('/>')&&!voids.has(el.tagName))stack.push(el);
    } else stack.at(-1)._text+=token;
  }
  const idIndex=new Map(doc.descendants().filter(el=>el.id).map(el=>[el.id,el]));
  doc.getElementById=id=>idIndex.get(id)||null;
  let now=0,callback=null;
  const windowEvents={};
  const sound=audio ? audioHarness(()=>now) : null;
  const math=Object.create(Math);
  math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const context=vm.createContext({ document:doc,performance:{now:()=>now},Math:math,console,
    requestAnimationFrame:fn=>{callback=fn;},
    matchMedia:()=>({matches:reduced}),
    addEventListener:(type,fn)=>{(windowEvents[type]||=[]).push(fn);}
  });
  context.window=context;
  if(sound)context.AudioContext=sound.AudioContext;
  for(const file of ['engine.js','scene.js','audio.js','app.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
  function frame(dt=16){now+=dt;sound?.tick();const next=callback;callback=null;next(now);}
  function advance(duration,step=16){const end=now+duration;while(now<end)frame(Math.min(step,end-now));}
  function key(code,repeat=false){return doc.dispatch('keydown',{code,key:code==='Tab'?'Tab':code,repeat});}
  function up(code){doc.dispatch('keyup',{code});}
  return {doc,context,sound,$:id=>doc.getElementById(id),frame,advance,key,up,
    click(id){doc.getElementById(id).dispatch('click');},
    event(type){for(const fn of windowEvents[type]||[])fn();},
    elapse(dt){now+=dt;},get now(){return now;}
  };
}
module.exports={createHarness};
