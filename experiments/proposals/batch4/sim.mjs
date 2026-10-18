import * as E from './engine-with-pack.mjs';
const base=['strike','shelter','advance','strike','shelter','advance','cross','scout','haven','anvil','scorch','disrupt','slam'];
const swap=(m)=>base.map(x=>m[x]??x);
const decks={
 base,
 'pack: cross->finisher scout->rampart haven->assault':swap({cross:'finisher',scout:'rampart',haven:'assault'}),
 'pack(weaker assault 2/1)':swap({cross:'finisher',scout:'rampart',haven:'assault2'}),
 '+finisher only':[...base,'finisher'],'+rampart only':[...base,'rampart'],'+assault only':[...base,'assault'],
};
const pol={dmg:r=>1000*(r.state.screen!=='play'&&r.state.outcome!=='defeat'?1:0)+2*r.summary.hits-1.5*r.summary.enemyDamage+0.2*r.summary.clearedCells.length,
 safe:r=>1000*(r.state.screen!=='play'&&r.state.outcome!=='defeat'?1:0)+r.summary.hits-4*r.summary.enemyDamage};
const VN=['finisher','rampart','assault','assault2'];
for(const [dn,rec] of Object.entries(decks)){E.setRecipe(rec);for(const [pn,f] of Object.entries(pol)){
 let wins=0,turns=0,N=100,held={},played={},maxHit=0,clears=0,fires=0,twoCardFires=0,streak=0,maxStreak=0;
 for(const seed of Array.from({length:N},(_,i)=>i+1)){let s=E.start(E.fresh(seed));let ok=true;
  while(s.screen!=='end'){if(s.screen==='reward'){s=E.activate(s,{kind:'continue'}).state;continue;}
   let best=null,bv=-1e9;for(const a of E.actions(s)){const r=E.activate(s,a);const v=f(r);if(v>bv){bv=v;best=r;}}
   const c=best.summary.action.card.split('.')[0];
   for(const u of new Set(s.hand.map(x=>x.split('.')[0])))held[u]=(held[u]||0)+1;
   played[c]=(played[c]||0)+1;
   maxHit=Math.max(maxHit,best.summary.hits);if(best.summary.lines.length)clears++;
   if(VN.includes(c)&&best.summary.cells.length===3&&!best.summary.lines.length){twoCardFires++;streak++;maxStreak=Math.max(maxStreak,streak);}else streak=0;
   s=best.state;turns++;if(s.outcome==='defeat'){ok=false;break;}}
  if(ok)wins++;}
 const rate=VN.filter(k=>held[k]).map(k=>`${k} ${played[k]||0}/${held[k]} (${((played[k]||0)/held[k]*100).toFixed(0)}%)`).join(' ; ');
 console.log(`${dn}\n  ${pn} wins ${wins}/${N} turns/run ${(turns/N).toFixed(1)} maxHit/turn ${maxHit} clears/run ${(clears/N).toFixed(1)} visitorOn2CardLine ${twoCardFires} maxStreak ${maxStreak}\n  play-rate when held: ${rate||'-'}`);}}
