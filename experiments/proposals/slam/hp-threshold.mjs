import {fresh,start,activate,actions} from '../../../dist/engine.mjs';
// greedy: same score as docs; also a "survival-first" policy
const score={dmg:(r,s)=>1000*(r.state.screen!=='play'&&r.state.outcome!=='defeat'?1:0)+2*r.summary.hits-1.5*r.summary.enemyDamage+0.2*r.summary.clearedCells.length,
 safe:(r,s)=>1000*(r.state.screen!=='play'&&r.state.outcome!=='defeat'?1:0)+1*r.summary.hits-4*r.summary.enemyDamage};
for(const [name,f] of Object.entries(score)){
 const out=[0,0,0].map(()=>({turns:0,low:0,min:99,wins:0,n:0}));
 for(let seed=1;seed<=100;seed++){
  let s=start(fresh(seed));
  while(s.screen!=='end'){
   if(s.screen==='reward'){s=activate(s,{kind:'continue'}).state;continue;}
   const enc=s.encounter-1;let best=null,bv=-1e9;
   for(const a of actions(s)){const r=activate(s,a);const v=f(r,s);if(v>bv){bv=v;best=r;}}
   s=best.state;out[enc].turns++;if(s.hp<=12)out[enc].low++;out[enc].min=Math.min(out[enc].min,s.hp);
   if(s.screen==='end'&&s.outcome==='defeat'){break;}
  }
 }
 console.log(name,out.map(o=>`turns ${o.turns} turnsAt<=12hp ${o.low} minHP ${o.min}`));
}
