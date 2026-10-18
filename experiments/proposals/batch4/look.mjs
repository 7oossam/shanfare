import * as E from './engine-with-pack.mjs';
const base=['strike','shelter','advance','strike','shelter','advance','cross','scout','haven','anvil','scorch','disrupt','slam'];
const swap=m=>base.map(x=>m[x]??x);
const decks={base,'pack':swap({cross:'finisher',scout:'rampart',haven:'assault'}),'+finisher':[...base,'finisher'],'+rampart':[...base,'rampart'],'+assault':[...base,'assault']};
const f={dmg:r=>(r.state.screen!=='play'&&r.state.outcome!=='defeat'?1000:0)+2*r.summary.hits-1.5*r.summary.enemyDamage+0.2*r.summary.clearedCells.length-(r.state.outcome==='defeat'?500:0),
 safe:r=>(r.state.screen!=='play'&&r.state.outcome!=='defeat'?1000:0)+r.summary.hits-4*r.summary.enemyDamage-(r.state.outcome==='defeat'?500:0)};
function search(s,fn,depth,K){ // returns [bestValue, bestResult]
  const cand=[];for(const a of E.actions(s)){const r=E.activate(s,a);if(r.valid)cand.push({r,v:fn(r)});}
  cand.sort((x,y)=>y.v-x.v);let best=null,bv=-1e18;
  for(const c of cand.slice(0,K)){let v=c.v;
    if(depth>1&&c.r.state.screen==='play'){const sub=search(c.r.state,fn,depth-1,K);if(sub)v+=sub[0];}
    if(v>bv){bv=v;best=c.r;}}
  return best?[bv,best]:null;}
const VN=['finisher','rampart','assault'];
for(const [dn,rec] of Object.entries(decks)){E.setRecipe(rec);for(const [pn,fn] of Object.entries(f)){
 let wins=0,turns=0,N=30,held={},played={};
 for(let seed=1;seed<=N;seed++){let s=E.start(E.fresh(seed));let ok=true;
  while(s.screen!=='end'){if(s.screen==='reward'){s=E.activate(s,{kind:'continue'}).state;continue;}
   const [,best]=search(s,fn,3,5);const c=best.summary.action.card.split('.')[0];
   for(const u of new Set(s.hand.map(x=>x.split('.')[0])))held[u]=(held[u]||0)+1;played[c]=(played[c]||0)+1;
   s=best.state;turns++;if(s.outcome==='defeat'){ok=false;break;}}
  if(ok)wins++;}
 const rate=VN.filter(k=>held[k]).map(k=>`${k} ${played[k]||0}/${held[k]} (${((played[k]||0)/held[k]*100).toFixed(0)}%)`).join(' ; ');
 console.log(`${dn.padEnd(10)} ${pn} wins ${wins}/${N} turns/run ${(turns/N).toFixed(1)} | ${rate||'-'}`);}}
