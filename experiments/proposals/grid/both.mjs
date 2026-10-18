import * as E from './engine-both-axes.mjs';
const dmg=r=>(r.state.screen!=='play'&&!['defeat','exhausted'].includes(r.state.outcome)?1000:0)+2*r.summary.hits-1.5*r.summary.enemyDamage+0.2*r.summary.clearedCells.length-(['defeat','exhausted'].includes(r.state.outcome)?500:0);
const safe=r=>(r.state.screen!=='play'&&!['defeat','exhausted'].includes(r.state.outcome)?1000:0)+r.summary.hits-4*r.summary.enemyDamage-(['defeat','exhausted'].includes(r.state.outcome)?500:0);
function best(s,f){let b=null,bv=-1e18;for(const a of E.actions(s)){const r=E.activate(s,a);const v=f(r);if(v>bv){bv=v;b={a,r};}}return b;}
for(const both of [false,true]){globalThis.BOTH=both;for(const [pn,f] of [['dmg',dmg],['safe',safe]]){const row=[];
 for(const enc of [1,2,3]){let t=0,occ=0,max=0,wins=0,dm=0,act=0,rows=0;const lines=new Set();const N=60;
  for(let seed=1;seed<=N;seed++){const s0=E.start(E.fresh(seed));E.setupEncounter(s0,enc);s0.screen='play';let s=s0,g=0;
   while(s.screen==='play'&&g<60){const {a,r}=best(s,f);dm+=r.summary.hits;act+=r.summary.events.filter(e=>e.type==='activate').length;s=r.state;g++;t++;const o=s.grid.filter(Boolean).length;occ+=o;max=Math.max(max,o);}
   if(!['defeat','exhausted'].includes(s.outcome)&&s.screen!=='play')wins++;}
  row.push(`E${enc} win ${wins}/${N} cells ${(occ/t).toFixed(2)}/max ${max} act/turn ${(act/t).toFixed(2)} dmg/turn ${(dm/t).toFixed(2)}`);}
 console.log((both?'both axes fire':'selected axis only (now)').padEnd(26),pn.padEnd(4),row.join(' | '));}}
