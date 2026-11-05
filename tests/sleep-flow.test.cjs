const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
function load(page,stored){
 const d=new JSDOM('<html><head></head><body></body></html>',{url:`https://theprotocol.world/${page}.html`,runScripts:'outside-only'});
 const w=d.window;w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};
 if(stored)w.localStorage.setItem('protocol-unlock-v1',stored);
 for(const f of ['lumi.js','profile-engine.js','upgrade.js','app.js'])w.eval(fs.readFileSync(path.join(root,f),'utf8'));
 return d;
}
test('sleep answers persist before Next and three shop destinations follow a real result',()=>{
 let d=load('sommeil');let doc=d.window.document;
 doc.querySelector('#start-sleep').click();doc.querySelector('.quiz-options button').click();
 const input=doc.querySelector('[name=answer][value="3"]');input.checked=true;input.dispatchEvent(new d.window.Event('change',{bubbles:true}));
 const saved=d.window.localStorage.getItem('protocol-unlock-v1');d.window.close();
 d=load('sommeil',saved);doc=d.window.document;d.window.ProtocolUpgrade.quiz('sleep');
 assert(doc.querySelector('[name=answer][value="3"]').checked);
 for(const answer of [3,0,0,0,0]){const el=doc.querySelector(`[name=answer][value="${answer}"]`);el.checked=true;doc.querySelector('#question-form').dispatchEvent(new d.window.Event('submit',{bubbles:true,cancelable:true}));}
 assert.equal(d.window.ProfileEngine.load().history.at(-1).result.score,100);
 for(const anchor of ['upgrade','apprentissage','inner-food'])assert(doc.querySelector(`.result-shops a[href="shop.html#${anchor}"]`));
 assert(doc.querySelector('.result-shops a[href="outils.html"]'));
 assert.equal(d.window.ProfileEngine.score('sleep',{s1:0,s2:3,s3:3,s4:3,s5:3}).score,0);
 d.window.close();
});
test('each shop card points to a real section and external searches open safely',()=>{
 const d=load('shop'),doc=d.window.document;
 for(const id of ['upgrade','apprentissage','inner-food'])assert(doc.getElementById(id));
 for(const a of doc.querySelectorAll('a[target="_blank"]')){assert(a.rel.includes('noopener'));assert(new URL(a.href).hostname==='www.amazon.fr');}
 assert.equal(doc.querySelectorAll('#inner-food a[href*="amazon"]').length,0);
 d.window.close();
});
