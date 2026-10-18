import * as E from './engine-with-slam.mjs';
const base=['strike','shelter','advance','strike','shelter','advance','cross','scout','haven','anvil','scorch','disrupt'];
const decks={baseline:base,'+slam(13)':[...base,'slam'],'slam for haven':base.map(x=>x==='haven'?'slam':x),'slam for scout':base.map(x=>x==='scout'?'slam':x)};
const pol={dmg:r=>1000*(r.state.screen!=='play'&&r.state.outcome!=='defeat'?1:0)+2*r.summary.hits-1.5*r.summary.enemyDamage+0.2*r.summary.clearedCells.length,
 safe:r=>1000*(r.state.screen!=='play'&&r.state.outcome!=='defeat'?1:0)+r.summary.hits-4*r.summary.enemyDamage};
for(const consume of [false,true]){globalThis.SLAM_CONSUME=consume;
 for(const [dn,recipe] of Object.entries(decks)){ if(consume&&dn==='baseline')continue; E.setRecipe(recipe);
  for(const [pn,f] of Object.entries(pol)){
   let wins=0,turns=0,hpsum=0,slamPlays=0,slamDmg=0,slamBest=0,slamHand=0,N=100;
   for(let seed=1;seed<=N;seed++){
    let s=E.start(E.fresh(seed));let ok=true;
    while(s.screen!=='end'){
     if(s.screen==='reward'){s=E.activate(s,{kind:'continue'}).state;continue;}
     let best=null,bv=-1e9,acts=E.actions(s);
     for(const a of acts){const r=E.activate(s,a);const v=f(r);if(v>bv){bv=v;best=r;}}
     if(s.hand.some(u=>u.startsWith('slam.')))slamHand++;
     if(best.summary.action.card.startsWith('slam.')){slamPlays++;slamDmg+=best.summary.effects.filter(e=>e.card.startsWith('slam.')).reduce((a,e)=>a+e.amount,0);}
     s=best.state;turns++;
     if(s.outcome==='defeat'){ok=false;break;}
    }
    if(ok)wins++;hpsum+=s.hp;
   }
   console.log(`${consume?'consume':'keep   '} ${dn.padEnd(16)} ${pn.padEnd(5)} wins ${wins}/${N} turns/run ${(turns/N).toFixed(1)} slamPlays ${slamPlays} avgSlamDmg ${slamPlays?(slamDmg/slamPlays).toFixed(2):'-'} turnsHoldingSlam ${slamHand}`);
  }}}
