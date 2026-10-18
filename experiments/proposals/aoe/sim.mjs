import * as E from './engine-with-aoe.mjs';
const BASE=[...E.DECK_RECIPE];
const CANDS={sweep:'اجتياح ⚔️2 شامل ⏳',wave:'موجة ⚔️1 شامل (تبقى)',sweepstay:'⚔️2 شامل (تبقى)',sweepmix:'⚔️1 شامل 🛡️1 ⏳'};
const f={dmg:r=>(r.state.screen!=='play'&&r.state.outcome!=='defeat'?1000:0)+2*r.summary.hits-1.5*r.summary.enemyDamage+0.2*r.summary.clearedCells.length-(r.state.outcome==='defeat'?500:0),
 safe:r=>(r.state.screen!=='play'&&r.state.outcome!=='defeat'?1000:0)+r.summary.hits-4*r.summary.enemyDamage-(r.state.outcome==='defeat'?500:0)};
function search(s,fn,depth,K){const cand=[];for(const a of E.actions(s)){const r=E.activate(s,a);if(r.valid)cand.push({r,v:fn(r)});}
 cand.sort((x,y)=>y.v-x.v);let best=null,bv=-1e18;for(const c of cand.slice(0,K)){let v=c.v;if(depth>1&&c.r.state.screen==='play'){const sub=search(c.r.state,fn,depth-1,K);if(sub)v+=sub[0];}if(v>bv){bv=v;best=c.r;}}return best?[bv,best]:null;}
const N=Number(process.argv[2]||20);
for(const [cn,label] of [[null,'base 16'],...Object.entries(CANDS)]){
 E.setRecipe(cn?[...BASE,cn]:BASE);
 for(const k of [2,5,1,3,4]){for(const [pn,fn] of Object.entries(f)){let wins=0,hp=0,turns=0,held=0,played=0;
  for(let seed=1;seed<=N;seed++){const s0=E.start(E.fresh(seed));E.setupEncounter(s0,k);s0.screen='play';let s=s0,t=0;
   while(s.screen==='play'&&t<60){const [,b]=search(s,fn,2,5);if(cn&&s.hand.some(u=>u.startsWith(cn+'.')))held++;if(cn&&b.summary.action.card.startsWith(cn+'.'))played++;s=b.state;t++;}
   turns+=t;if(s.outcome!=='defeat'&&s.screen!=='play'){wins++;hp+=s.hp;}}
  console.log(`${label.padEnd(24)} E${k}(${E.ENCOUNTERS[k-1].enemies.length}en) ${pn.padEnd(4)} win ${wins}/${N} hp ${(wins?hp/wins:0).toFixed(1)} turns ${(turns/N).toFixed(1)}${cn?` | played when held ${played}/${held} (${held?(played/held*100).toFixed(0):0}%)`:''}`);}}}
