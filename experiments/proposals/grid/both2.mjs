import * as E from './engine-both-axes.mjs';
const fn=r=>(r.state.screen!=='play'&&!['defeat','exhausted'].includes(r.state.outcome)?1000:0)+r.summary.hits-4*r.summary.enemyDamage-(['defeat','exhausted'].includes(r.state.outcome)?500:0);
function search(s,depth,K){const cand=[];for(const a of E.actions(s)){const r=E.activate(s,a);if(r.valid)cand.push({a,r,v:fn(r)});}
 cand.sort((x,y)=>y.v-x.v);let best=null,bv=-1e18;for(const c of cand.slice(0,K)){let v=c.v;if(depth>1&&c.r.state.screen==='play'){const sub=search(c.r.state,depth-1,K);if(sub)v+=sub[0];}if(v>bv){bv=v;best=c;}}return best?[bv,best]:null;}
for(const both of [false,true]){globalThis.BOTH=both;const row=[];
 for(const enc of [1,2,3]){let t=0,occ=0,max=0,wins=0,dm=0,act=0;const N=16;
  for(let seed=1;seed<=N;seed++){const s0=E.start(E.fresh(seed));E.setupEncounter(s0,enc);s0.screen='play';let s=s0,g=0;
   while(s.screen==='play'&&g<60){const c=search(s,3,4)[1];dm+=c.r.summary.hits;act+=c.r.summary.events.filter(e=>e.type==='activate').length;s=c.r.state;g++;t++;const o=s.grid.filter(Boolean).length;occ+=o;max=Math.max(max,o);}
   if(!['defeat','exhausted'].includes(s.outcome)&&s.screen!=='play')wins++;}
  row.push(`E${enc} win ${wins}/${N} cells ${(occ/t).toFixed(2)}/max ${max} act/turn ${(act/t).toFixed(2)} dmg/turn ${(dm/t).toFixed(2)}`);}
 console.log((both?'both axes fire':'selected axis only (now)').padEnd(26),'lookahead3',row.join(' | '));}
