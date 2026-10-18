import * as E from '../../../dist/engine.mjs';
const dmg=r=>(r.state.screen!=='play'&&!['defeat','exhausted'].includes(r.state.outcome)?1000:0)+2*r.summary.hits-1.5*r.summary.enemyDamage+0.2*r.summary.clearedCells.length-(['defeat','exhausted'].includes(r.state.outcome)?500:0);
const safe=r=>(r.state.screen!=='play'&&!['defeat','exhausted'].includes(r.state.outcome)?1000:0)+r.summary.hits-4*r.summary.enemyDamage-(['defeat','exhausted'].includes(r.state.outcome)?500:0);
function best(s,f){let b=null,bv=-1e18;for(const a of E.actions(s)){const r=E.activate(s,a);const v=f(r);if(v>bv){bv=v;b={a,r};}}return b;}
const VARIANTS={
 'starter (now)':{recipe:E.STARTER_RECIPE},
 'starter + cross x2':{recipe:['strike','shelter','advance','strike','shelter','advance','strike','shelter','cross','cross']},
 'starter, 3 turf cells (diagonal)':{recipe:E.STARTER_RECIPE,turf:{0:['scorched',1],4:['fortified',1],8:['scorched',1]}},
 'starter, 4 turf cells (corners)':{recipe:E.STARTER_RECIPE,turf:{0:['scorched',1],2:['fortified',1],6:['fortified',1],8:['scorched',1]}},
};
for(const [name,v] of Object.entries(VARIANTS)){for(const [pn,f] of [['dmg',dmg],['safe',safe]]){const row=[];
 for(const enc of [1,2,3]){let t=0,occ=0,max=0,wins=0,into=0,dm=0,rowsel=0;const N=60;
  for(let seed=1;seed<=N;seed++){const s0=E.start(E.fresh(seed,v.recipe));E.setupEncounter(s0,enc);s0.screen='play';
   if(v.turf)for(const [c,[kind,lvl]] of Object.entries(v.turf)){s0.gridTurf[c]=kind;s0.gridLevel[c]=lvl;}
   let s=s0,g=0;while(s.screen==='play'&&g<60){const {a,r}=best(s,f);const line=E.selectedLine(a.cell,a.axis);if(line.filter(i=>s.grid[i]).length>=1)into++;dm+=r.summary.hits;s=r.state;g++;t++;const o=s.grid.filter(Boolean).length;occ+=o;max=Math.max(max,o);}
   if(!['defeat','exhausted'].includes(s.outcome)&&s.screen!=='play')wins++;}
  row.push(`E${enc} win ${wins}/${N} cells ${(occ/t).toFixed(2)}/max ${max} dmg/turn ${(dm/t).toFixed(2)}`);}
 console.log(name.padEnd(34),pn.padEnd(4),row.join(' | '));}}
