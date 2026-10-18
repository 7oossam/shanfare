// Plays a whole run through the real UI (Playwright) and checks it against the engine, turn by turn.
// Usage: python3 -m http.server 8770 --directory dist &  node scripts/ui_campaign.mjs /tmp/out
import * as E from '../dist/engine.mjs';
import {createRequire} from 'module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const b=await chromium.launch(process.env.CHROMIUM?{executablePath:process.env.CHROMIUM}:{});
const p=await b.newPage({viewport:{width:844,height:390}});const errs=[];p.on('pageerror',e=>errs.push(String(e)));
await p.goto((process.env.GAME_URL||'http://localhost:8770/index.html'));await p.waitForTimeout(400);
await p.click('[data-action=start]');await p.waitForTimeout(400);
await p.click('[data-action=relic][data-id="patience"]');await p.waitForTimeout(300);
let s=E.activate(E.startRun(E.fresh()),{kind:'relic',id:'patience'}).state;let turns=0,encounters=[];
function search(s,depth,K){const cand=[];for(const a of E.actions(s)){const r=E.activate(s,a);if(r.valid)cand.push({a,r,v:score(r)});}
 cand.sort((x,y)=>y.v-x.v);let best=null,bv=-1e18;for(const c of cand.slice(0,K)){let v=c.v;if(depth>1&&c.r.state.screen==='play'){const sub=search(c.r.state,depth-1,K);if(sub)v+=sub[0];}if(v>bv){bv=v;best=c.a;}}return best?[bv,best]:null;}
const score=r=>(r.state.screen!=='play'&&r.state.outcome!=='defeat'?1000:0)+2*r.summary.hits-1.5*r.summary.enemyDamage+0.2*r.summary.clearedCells.length;
while(s.screen!=='end'&&turns<120){
 if(s.screen==='reward'){encounters.push(s.encounter);const type=s.rewardOffer[0];await p.waitForSelector(`[data-action=pick][data-type="${type}"]`);await p.click(`[data-action=pick][data-type="${type}"]`);await p.waitForTimeout(300);s=E.activate(s,{kind:'pick',type}).state;continue;}
 const best=search(s,2,4)[1];
 await p.click(`.card-art-button[data-card="${best.card}"]`);
 await p.click(`[data-axis=${best.axis}]`);
 await p.click(`[data-cell="${best.cell}"]`);
 if(s.enemies.length>1)await p.click(`[data-target="${best.target}"]`);
 await p.click('[data-action=confirm-play]');
 await p.waitForSelector('.duel-grid:not(.is-resolving)',{timeout:8000}).catch(()=>{});
 await p.waitForTimeout(250);
 s=E.activate(s,best).state;turns++;
 const uiHp=await p.$eval('[data-player-hp]',e=>e.innerText).catch(()=>'?');const uiEn=await p.$$eval('[data-enemy-hp]',e=>e.map(x=>x.innerText.replace(/\s/g,'')));
 if(turns%6===0||s.screen!=='play')console.log(turns,'enc',s.encounter,'mirror hp',s.hp,'enemies',s.enemies.map(e=>e.hp).join(','),'| UI',uiHp.replace(/\s/g,''),uiEn.join(','));
}
await p.waitForTimeout(500);
await p.waitForTimeout(2500);const title=await p.$eval('h1',e=>e.innerText).catch(()=>'?');
console.log('engine outcome',s.outcome,'turns',turns,'encounters cleared',encounters,'| UI h1:',title,'| errors',errs.length?errs:'none');
await p.screenshot({path:process.argv[2]+'/campaign-end.png'});await b.close();
