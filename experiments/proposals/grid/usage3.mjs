import * as E from '../../../dist/engine.mjs';
const fn=r=>(r.state.screen!=='play'&&!['defeat','exhausted'].includes(r.state.outcome)?1000:0)+r.summary.hits-4*r.summary.enemyDamage-(['defeat','exhausted'].includes(r.state.outcome)?500:0);
function search(s,depth,K){const cand=[];for(const a of E.actions(s)){const r=E.activate(s,a);if(r.valid)cand.push({a,r,v:fn(r)});}
 cand.sort((x,y)=>y.v-x.v);let best=null,bv=-1e18;for(const c of cand.slice(0,K)){let v=c.v;if(depth>1&&c.r.state.screen==='play'){const sub=search(c.r.state,depth-1,K);if(sub)v+=sub[0];}if(v>bv){bv=v;best=c;}}return best?[bv,best]:null;}
const VIS=['raid','rampart','assault','sandstorm','scorch','anvil','disrupt','slam','cross','scout','haven'];
const stats={};
for(let seed=1;seed<=12;seed++){let s=E.start(E.fresh(seed));
 for(let g=0;g<500&&s.screen!=='end';g++){
  if(s.screen==='reward'){const type=VIS.find(t=>s.rewardOffer.includes(t))??s.rewardOffer[0];s=E.activate(s,{kind:'pick',type}).state;continue;}
  if(s.screen!=='play')break;const enc=s.encounter;const c=search(s,3,4)[1];const line=E.selectedLine(c.a.cell,c.a.axis);const others=line.filter(i=>s.grid[i]).length;
  const st=stats[enc]??={t:0,occ:0,max:0,into:0,row:0,vis:0};s=c.r.state;st.t++;const o=s.grid.filter(Boolean).length;st.occ+=o;st.max=Math.max(st.max,o);if(others>=1)st.into++;if(c.a.axis==='row')st.row++;}}
console.log('lookahead(3) + visitors drafts:',Object.entries(stats).map(([e,st])=>`E${e}: avg cells ${(st.occ/st.t).toFixed(2)} max ${st.max} intoLine ${(st.into/st.t*100).toFixed(0)}% rows ${(st.row/st.t*100).toFixed(0)}%`).join(' | '));
