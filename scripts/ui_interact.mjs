// Placement interactions in the real UI: tap, flip direction, remembered direction, mouse drag, touch drag.
import {fresh,start,setupEncounter,FULL_RECIPE} from '../dist/engine.mjs';
import {createRequire} from 'module';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const b=await chromium.launch(process.env.CHROMIUM?{executablePath:process.env.CHROMIUM}:{});
function mk(){let s=start(fresh(20261017,FULL_RECIPE));setupEncounter(s,2);s.screen='play';const want=['advance','shelter','strike'].map(t=>s.deck.find(u=>u.startsWith(t+'.')));const all=[...s.hand,...s.draw];s.hand=want;s.draw=all.filter(u=>!want.includes(u));return s;}
const st=mk();
async function page(opts={}){const ctx=await b.newContext({viewport:{width:844,height:390},...opts});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));
 await p.addInitScript(s=>{if(!sessionStorage.getItem('seeded')){localStorage.setItem('shanfara-duel-v9',JSON.stringify({state:s,report:null}));sessionStorage.setItem('seeded','1');}},st);
 await p.goto((process.env.GAME_URL||'http://localhost:8770/index.html'));await p.waitForTimeout(400);return {p,errs,ctx};}
const axisPressed=p=>p.$$eval('[data-axis]',e=>e.filter(x=>x.getAttribute('aria-pressed')==='true').map(x=>x.dataset.axis)[0]||null);
const previewCell=p=>p.$eval('.grid-cell.is-preview',e=>e.dataset.cell).catch(()=>null);
// 1) tap flow + toggle + remembered axis
{const {p,errs}=await page();
 await p.click('.card-art-button[data-card^="advance"]');
 assert.equal(await axisPressed(p),'row','default direction is row');
 await p.click('[data-cell="4"]');assert.equal(await previewCell(p),'4');assert.equal(await axisPressed(p),'row');
 const rowOrder=await p.$$eval('.line-order',e=>e.length);
 await p.click('[data-cell="4"]');assert.equal(await axisPressed(p),'column','tapping the same cell flips to column');
 const badge=await p.$eval('.dir-badge',e=>e.textContent);assert.equal(badge,'↓');
 await p.click('[data-cell="4"]');assert.equal(await axisPressed(p),'row','and back to row');
 await p.click('[data-cell="4"]');// column again
 await p.click('[data-cell="6"]');assert.equal(await previewCell(p),'6','another cell moves the selection');assert.equal(await axisPressed(p),'column','direction is kept');
 await p.click('.card-art-button[data-card^="strike"]');assert.equal(await previewCell(p),'6','changing card keeps the chosen cell');
 await p.click('[data-action=confirm-play]');await p.waitForTimeout(2600);
 await p.click('.card-art-button >> nth=0');await p.click('[data-cell="0"]');
 assert.equal(await axisPressed(p),'column','the last direction is the default for the next placement');
 assert.equal(await p.evaluate(()=>localStorage.getItem('shanfara-axis')),'column');
 console.log('tap/toggle/remember OK',errs.length?errs:'');await p.context().close();}
// 2) mouse drag onto a cell
{const {p,errs}=await page();
 const card=await p.$('.card-art-button[data-card^="advance"]');const cb=await card.boundingBox();
 const cell=await p.$('[data-cell="5"]');const gb=await cell.boundingBox();
 await p.mouse.move(cb.x+cb.width/2,cb.y+cb.height/2);await p.mouse.down();
 await p.mouse.move(cb.x+cb.width/2+20,cb.y-20,{steps:4});
 assert.equal(await p.$$eval('.drag-ghost',e=>e.length),1,'a ghost follows the pointer');
 await p.mouse.move(gb.x+gb.width/2,gb.y+gb.height/2,{steps:6});
 assert.equal(await p.$$eval('.is-drop-target',e=>e.length),1,'the cell under the pointer is highlighted');
 await p.mouse.up();await p.waitForTimeout(200);
 assert.equal(await previewCell(p),'5','dropping selects card and cell');assert.equal(await p.$$eval('.drag-ghost',e=>e.length),0,'ghost is removed');
 assert.ok(await p.$eval('.card-art-button[data-card^="advance"]',e=>e.closest('.duel-card').classList.contains('is-selected')));
 // dropping on nothing cancels
 const c2=await p.$('.card-art-button[data-card^="shelter"]');const b2=await c2.boundingBox();
 await p.mouse.move(b2.x+b2.width/2,b2.y+b2.height/2);await p.mouse.down();await p.mouse.move(b2.x+b2.width/2+60,b2.y-10,{steps:5});await p.mouse.up();await p.waitForTimeout(150);
 assert.equal(await previewCell(p),'5','a drop outside the grid changes nothing');
 console.log('mouse drag OK',errs.length?errs:'');await p.context().close();}
// 3) touch drag (pointer events with touch-action:none)
{const {p,errs,ctx}=await page({hasTouch:true,isMobile:true});
 const card=await p.$('.card-art-button[data-card^="strike"]');const cb=await card.boundingBox();const cell=await p.$('[data-cell="7"]');const gb=await cell.boundingBox();
 const cdp=await ctx.newCDPSession(p);const pt=(x,y)=>[{x:Math.round(x),y:Math.round(y),id:1}];
 const sx=cb.x+cb.width/2,sy=cb.y+cb.height/2,ex=gb.x+gb.width/2,ey=gb.y+gb.height/2;
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:pt(sx,sy)});
 for(let i=1;i<=8;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:pt(sx+(ex-sx)*i/8,sy+(ey-sy)*i/8)});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.waitForTimeout(300);
 assert.equal(await previewCell(p),'7','touch drag drops onto the cell');
 // touch tap flips direction
 await p.tap('[data-cell="7"]');assert.equal(await axisPressed(p),'column','touch tap on the chosen cell flips direction');
 console.log('touch drag + tap OK',errs.length?errs:'');await ctx.close();}
await b.close();
