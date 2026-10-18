// Occupied cells after each turn on the real engine (starter deck, encounters 2-4), to compare with GRID_USAGE_FINDING.md.
import * as E from '../../../dist/engine.mjs';
const fn=r=>(r.state.screen!=='play'&&!['defeat','exhausted'].includes(r.state.outcome)?1000:0)+2*r.summary.hits-1.5*r.summary.enemyDamage+0.2*r.summary.clearedCells.length-(['defeat','exhausted'].includes(r.state.outcome)?500:0);
function pick(s,depth){let best=null,bv=-1e18;for(const a of E.actions(s)){const r=E.activate(s,a);let v=fn(r);if(depth>1&&r.state.screen==='play'){const sub=pick(r.state,depth-1);if(sub)v+=sub.v;}if(v>bv){bv=v;best=r;}}return best&&{r:best,v:bv};}
const N=Number(process.argv[2]||20),depth=Number(process.argv[3]||1);
for(const enc of [2,3,4]){let n=0,occ=0,max=0,wins=0,hp=0,dm=0;
 for(let seed=1;seed<=N;seed++){let s=E.start(E.fresh(seed));s.encounter=enc;s.relic=null;
  // jump to encounter by setup: replay is unnecessary, reuse exported setup through a victory-free path
  s=E.start(E.fresh(seed,E.STARTER_RECIPE));if(enc>1&&E.setupEncounter)E.setupEncounter(s,enc);
  for(let g=0;g<60&&s.screen==='play';g++){const c=pick(s,depth);if(!c)break;s=c.r.state;n++;const o=s.grid.filter(Boolean).length;occ+=o;max=Math.max(max,o);dm+=c.r.summary.hits;}
  if(s.screen==='reward'||s.outcome==='victory'){wins++;hp+=s.hp;}}
 console.log(`E${enc} depth ${depth} win ${wins}/${N} hp ${(hp/Math.max(1,wins)).toFixed(1)} cells ${(occ/n).toFixed(2)}/${max} dmg/turn ${(dm/n).toFixed(2)}`);}
