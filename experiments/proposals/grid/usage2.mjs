import * as E from '../../../dist/engine.mjs';
const dmg=r=>(r.state.screen!=='play'&&!['defeat','exhausted'].includes(r.state.outcome)?1000:0)+2*r.summary.hits-1.5*r.summary.enemyDamage+0.2*r.summary.clearedCells.length-(['defeat','exhausted'].includes(r.state.outcome)?500:0);
function best(s){let b=null,bv=-1e18;for(const a of E.actions(s)){const r=E.activate(s,a);const v=dmg(r);if(v>bv){bv=v;b={a,r};}}return b;}
const ARCH={random:null,visitors:['raid','rampart','assault','sandstorm','scorch','anvil','disrupt','slam','cross','scout','haven'],turf:['anvil','scorch','cross','slam','disrupt','scout','haven','raid','rampart','assault','sandstorm']};
for(const [an,pref] of Object.entries(ARCH)){
 const stats={};
 for(let seed=1;seed<=60;seed++){let s=E.start(E.fresh(seed));
  for(let g=0;g<500&&s.screen!=='end';g++){
   if(s.screen==='reward'){const offer=s.rewardOffer;const type=pref?(pref.find(t=>offer.includes(t))??offer[0]):offer[0];s=E.activate(s,{kind:'pick',type}).state;continue;}
   if(s.screen!=='play')break;const {a,r}=best(s);const enc=s.encounter;const line=E.selectedLine(a.cell,a.axis);const others=line.filter(i=>s.grid[i]).length;
   const st=stats[enc]??={t:0,occ:0,max:0,into:0,lines:new Set(),axisRow:0,vanish:0};
   s=r.state;st.t++;const o=s.grid.filter(Boolean).length;st.occ+=o;st.max=Math.max(st.max,o);if(others>=1)st.into++;if(a.axis==='row')st.axisRow++;}
 }
 console.log(an.padEnd(9),Object.entries(stats).map(([e,st])=>`E${e}: avg cells ${(st.occ/st.t).toFixed(2)} max ${st.max} intoLine ${(st.into/st.t*100).toFixed(0)}% rows ${(st.axisRow/st.t*100).toFixed(0)}%`).join(' | '));}
