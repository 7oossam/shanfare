import * as E from '../../../dist/engine.mjs';
// Campaign simulator: starter deck, one-of-three card rewards (random pick), optional relic.
const fnSafe=r=>(r.state.screen!=='play'&&r.state.outcome!=='defeat'&&r.state.outcome!=='exhausted'?1000:0)+r.summary.hits-4*r.summary.enemyDamage-(['defeat','exhausted'].includes(r.state.outcome)?500:0);
const fnDmg=r=>(r.state.screen!=='play'&&r.state.outcome!=='defeat'&&r.state.outcome!=='exhausted'?1000:0)+2*r.summary.hits-1.5*r.summary.enemyDamage+0.2*r.summary.clearedCells.length-(['defeat','exhausted'].includes(r.state.outcome)?500:0);
function search(s,fn,depth,K){const cand=[];for(const a of E.actions(s)){const r=E.activate(s,a);if(r.valid)cand.push({r,v:fn(r)});}
 cand.sort((x,y)=>y.v-x.v);let best=null,bv=-1e18;for(const c of cand.slice(0,K)){let v=c.v;if(depth>1&&c.r.state.screen==='play'){const sub=search(c.r.state,fn,depth-1,K);if(sub)v+=sub[0];}if(v>bv){bv=v;best=c.r;}}return best?[bv,best]:null;}
function oneply(s,fn){let best=null,bv=-1e18;for(const a of E.actions(s)){const r=E.activate(s,a);const v=fn(r);if(v>bv){bv=v;best=r;}}return best;}
export function campaign(seed,relic,pol,picker='random',picks=null){
  let s=E.start(E.fresh(seed));s.relic=relic;const log=[];
  for(let guard=0;guard<400;guard++){
    if(s.screen==='play'){
      let r=pol==='look'?search(s,fnSafe,2,4)?.[1]:pol==='lookdmg'?search(s,fnDmg,2,4)?.[1]:oneply(s,pol==='dmg'?fnDmg:fnSafe);
      if(!r)break;const enc=s.encounter;const t0=s.phaseTurn;s=r.state;
      if(s.screen!=='play'){log.push({enc,win:s.screen==='reward'||s.outcome==='victory',hp:s.hp,turns:s.phaseTurn-1,outcome:s.outcome});}
    }else if(s.screen==='reward'){
      const offer=s.rewardOffer;let type=offer[0];
      if(picks)type=picks(offer,s)??offer[0];
      else if(picker==='random'){/* offer order already seeded-random: take the first */type=offer[0];}
      s=E.activate(s,{kind:'pick',type}).state;
    }else break;
  }
  return {log,final:s};
}
