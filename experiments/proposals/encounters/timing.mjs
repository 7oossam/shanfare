import * as E from '../../../dist/engine.mjs';
const mk=(id,name,hp,pattern)=>({id,name,hp,maxHp:hp,attack:pattern[0],pattern,shield:0});
const VARIANTS={'E3 [1,2,9]':[mk('armor','x',28,[1,2,9])],'E3 [1,2,11]':[mk('armor','x',28,[1,2,11])],'E3 [1,1,12] hp 30':[mk('armor','x',30,[1,1,12])]};
const fn=r=>(r.state.screen!=='play'&&r.state.outcome!=='defeat'?1000:0)+r.summary.hits-4*r.summary.enemyDamage-(r.state.outcome==='defeat'?500:0);
function search(s,depth,K){const cand=[];for(const a of E.actions(s)){const r=E.activate(s,a);if(r.valid)cand.push({r,v:fn(r)});}
 cand.sort((x,y)=>y.v-x.v);let best=null,bv=-1e18;for(const c of cand.slice(0,K)){let v=c.v;if(depth>1&&c.r.state.screen==='play'){const sub=search(c.r.state,depth-1,K);if(sub)v+=sub[0];}if(v>bv){bv=v;best=c.r;}}return best?[bv,best]:null;}
for(const [name,enemies] of Object.entries(VARIANTS)){
 E.ENCOUNTERS.length=0;E.ENCOUNTERS.push({name:'t',lesson:'t',enemies});
 const N=24;let wins=0,hp=0;const blockOnSpike={spike:[0,0],other:[0,0]},slam={spike:0,other:0,spikeTurns:0,otherTurns:0};
 for(let seed=1;seed<=N;seed++){const s0=E.start(E.fresh(seed));E.setupEncounter(s0,1);s0.screen='play';let s=s0,t=0;
  while(s.screen==='play'&&t<60){const [,b]=search(s,3,4);t++;const spike=(t%3===0);
   const k=spike?'spike':'other';blockOnSpike[k][0]+=b.summary.block;blockOnSpike[k][1]++;
   if(b.summary.action.card.startsWith('slam.'))slam[k]++;slam[spike?'spikeTurns':'otherTurns']++;s=b.state;}
  if(s.outcome!=='defeat'&&s.screen!=='play'){wins++;hp+=s.hp;}}
 console.log(`${name}: win ${wins}/${N} hpLeft ${(wins?hp/wins:0).toFixed(1)} | avg block on spike turns ${(blockOnSpike.spike[0]/blockOnSpike.spike[1]).toFixed(2)} vs other ${(blockOnSpike.other[0]/blockOnSpike.other[1]).toFixed(2)} | slam plays spike ${slam.spike}/${slam.spikeTurns} other ${slam.other}/${slam.otherTurns}`);}
