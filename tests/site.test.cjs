const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');
const root=path.resolve(__dirname,'..');
const scripts=['lumi.js','app.js'].map(f=>fs.readFileSync(path.join(root,f),'utf8'));
const fixture={name:'Alex',sex:'male',age:30,height:180,weight:80,domain:'sommeil'};
function load(file='index',locale='fr',profile=null,storage={}){
 const dom=new JSDOM('<html><head></head><body></body></html>',{url:'http://localhost:4174/'+file+'.html',runScripts:'outside-only',virtualConsole:new VirtualConsole()});
 const w=dom.window;w.localStorage.setItem('protocol-language',locale);
 if(profile)w.localStorage.setItem('protocol-profile-v1',JSON.stringify(profile));
 for(const [key,value] of Object.entries(storage))w.localStorage.setItem(key,value);
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
 w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};
 for(const source of scripts)w.eval(source);
 return dom;
}
function fill(dom,selector,value){const el=dom.window.document.querySelector(selector);assert(el,selector);if(['radio','checkbox'].includes(el.type))el.checked=true;else el.value=value;el.dispatchEvent(new dom.window.Event('input',{bubbles:true}));}
function submit(dom){dom.window.document.querySelector('form').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));}
test('all pages in four languages have working internal routes and assets',()=>{
 for(const locale of ['fr','en','es','de'])for(const page of ['index','profil','dashboard','metabolisme','domaines','sommeil','mental','routine','nutrition','performance','programme','calendrier','outils','shop']){
  const dom=load(page,locale,fixture);const doc=dom.window.document;
  assert(!doc.body.textContent.includes('undefined'),locale+' '+page);
  assert.equal(doc.querySelectorAll('header nav').length,0);
  assert.equal(doc.querySelectorAll('.bottom-nav').length,1);
  for(const el of doc.querySelectorAll('a[href],img[src],source[src]')){
   const url=new URL(el.href||el.src);if(url.hostname!=='localhost')continue;
   assert(fs.existsSync(path.join(root,url.pathname)),url.href);
   if(url.hash){const target=load(url.pathname.slice(1).replace('.html',''),locale,fixture);assert(target.window.document.getElementById(url.hash.slice(1)),url.href);target.window.close();}
  }
  dom.window.close();
 }
});
test('profile rejects invalid steps and requires consent before saving',()=>{
 const d=load('profil'),doc=d.window.document;
 fill(d,'[name=name]','   ');submit(d);assert(doc.querySelector('[name=name]'));
 fill(d,'[name=name]','Alex');submit(d);submit(d);assert(doc.querySelector('[name=sex]'));
 fill(d,'[value=male]');submit(d);
 fill(d,'[name=age]','16');submit(d);assert(doc.querySelector('[name=age]'));
 fill(d,'[name=age]','30');submit(d);
 fill(d,'[name=height]','180');submit(d);
 fill(d,'[name=weight]','80');submit(d);
 submit(d);assert.equal(d.window.localStorage.getItem('protocol-profile-v1'),null);
 fill(d,'[name=consent]');submit(d);
 const saved=JSON.parse(d.window.localStorage.getItem('protocol-profile-v1'));
 assert.deepEqual(saved,fixture);
 assert.equal(d.window.ProtocolLumi.energy(saved),1780);
 assert.equal(d.window.ProtocolLumi.energy({...saved,sex:'female'}),1614);
 d.window.close();
});
test('blank numbers and draft name survive theme and language changes',()=>{
 const d=load('profil'),doc=d.window.document;
 fill(d,'[name=name]','Alex Marie');doc.querySelector('#theme').click();assert.equal(doc.querySelector('[name=name]').value,'Alex Marie');
 submit(d);fill(d,'[value=female]');submit(d);
 fill(d,'[name=age]','');const select=doc.querySelector('#language');select.value='en';select.dispatchEvent(new d.window.Event('change'));
 assert.equal(doc.querySelector('[name=age]').value,'');
 d.window.close();
});
test('theme does not replace the video, form, timer, or journal',()=>{
 for(const file of ['index','profil','outils']){
  const d=load(file),doc=d.window.document;const main=doc.querySelector('main');doc.querySelector('#theme').click();assert.equal(doc.querySelector('main'),main);assert.equal(doc.documentElement.dataset.theme,'dark');d.window.close();
 }
});
test('dashboard escapes names and deletes only profile data',()=>{
 const d=load('dashboard','fr',{...fixture,name:'<img src=x onerror=alert(1)>'},{'protocol-journal':'keep'}),doc=d.window.document;
 assert.equal(doc.querySelector('h1 img'),null);assert(doc.querySelector('a[href="outils.html#journal"]'));
 d.window.confirm=()=>true;doc.querySelector('#delete-profile').click();assert.equal(d.window.localStorage.getItem('protocol-profile-v1'),null);assert.equal(d.window.localStorage.getItem('protocol-journal'),'keep');d.window.close();
 const empty=load('dashboard');assert(empty.window.document.querySelector('.empty-profile'));empty.window.close();
});
test('Lumi explains the result with keyboard-accessible tabs',()=>{
 const d=load('metabolisme','fr',fixture),doc=d.window.document;
 doc.querySelector('.explain-trigger').click();assert(doc.querySelector('dialog').open);assert(doc.querySelector('dialog').getAttribute('aria-label'));
 doc.querySelector('[data-tab="1"]').click();assert.match(doc.querySelector('#explain-body').textContent,/Mifflin/);assert.equal(doc.querySelector('[data-tab="1"]').getAttribute('aria-selected'),'true');d.window.close();
});
test('storage failure never claims a journal or calendar change was saved',()=>{
 for(const file of ['outils','calendrier']){
  const d=load(file),doc=d.window.document;
  d.window.Storage.prototype.setItem=()=>{throw Error('blocked');};
  if(file==='outils'){fill(d,'#journal','note');doc.querySelector('#save').click();assert.match(doc.querySelector('#saved').textContent,/impossible/);}
  else{const b=doc.querySelector('[data-day]');b.click();assert.equal(b.getAttribute('aria-pressed'),'false');assert.match(doc.querySelector('#progress').textContent,/impossible/);}
  d.window.close();
 }
});
test('timer recovers corrupted data and preserves a running deadline',()=>{
 const bad=load('outils','fr',null,{'protocol-timer-deadline':'Infinity','protocol-timer-seconds':'NaN'});
 assert.equal(bad.window.document.querySelector('#clock').textContent,'25:00');bad.window.close();
 const d=load('outils'),doc=d.window.document;doc.querySelector('#start').click();const deadline=d.window.localStorage.getItem('protocol-timer-deadline');assert(Number(deadline)>Date.now());doc.querySelector('#theme').click();assert.equal(doc.querySelector('#start').textContent,'Pause');doc.querySelector('#start').click();assert.equal(d.window.localStorage.getItem('protocol-timer-deadline'),'0');doc.querySelector('#reset').click();assert.equal(doc.querySelector('#clock').textContent,'25:00');d.window.close();
});
