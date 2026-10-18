import * as E from './engine-with-burst.mjs';
const base=['strike','shelter','advance','strike','shelter','advance','cross','scout','haven','anvil','scorch','disrupt','slam'];
const decks={base,'+burst':[...base,'burst'],'burst for scout':base.map(x=>x==='scout'?'burst':x)};
const pol={dmg:r=>1000*(r.state.screen!=='play'&&r.state.outcome!=='defeat'?1:0)+2*r.summary.hits-1.5*r.summary.enemyDamage+0.2*r.summary.clearedCells.length,
 safe:r=>1000*(r.state.screen!=='play'&&r.state.outcome!=='defeat'?1:0)+r.summary.hits-4*r.summary.enemyDamage};
for(const [dn,rec] of Object.entries(decks)){E.setRecipe(rec);for(const [pn,f] of Object.entries(pol)){
 let wins=0,turns=0,N=100,place={},act={},burstPlays=0,burstWhenHeld=0;
 for(let seed=1;seed<=N;seed++){let s=E.start(E.fresh(seed));let ok=true;
  while(s.screen!=='end'){if(s.screen==='reward'){s=E.activate(s,{kind:'continue'}).state;continue;}
   let best=null,bv=-1e9;for(const a of E.actions(s)){const r=E.activate(s,a);const v=f(r);if(v>bv){bv=v;best=r;}}
   const t=u=>u.split('.')[0];place[t(best.summary.action.card)]=(place[t(best.summary.action.card)]||0)+1;
   for(const e of best.summary.events)if(e.type==='activate')act[t(e.card)]=(act[t(e.card)]||0)+1;
   if(s.hand.some(u=>u.startsWith('burst.')))burstWhenHeld++;if(best.summary.action.card.startsWith('burst.'))burstPlays++;
   s=best.state;turns++;if(s.outcome==='defeat'){ok=false;break;}}
  if(ok)wins++;}
 const per=Object.keys(place).map(k=>`${k}:${(act[k]/place[k]).toFixed(2)}`).join(' ');
 console.log(`${dn.padEnd(16)} ${pn.padEnd(5)} wins ${wins}/${N} turns/run ${(turns/N).toFixed(1)} burstPlays ${burstPlays}/${burstWhenHeld}\n   activations per placement: ${per}`);}}
