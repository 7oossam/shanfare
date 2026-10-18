import * as E from '../../../dist/engine.mjs';
const fn={dmg:r=>(r.state.screen!=='play'&&!['defeat','exhausted'].includes(r.state.outcome)?1000:0)+2*r.summary.hits-1.5*r.summary.enemyDamage+0.2*r.summary.clearedCells.length-(['defeat','exhausted'].includes(r.state.outcome)?500:0),
 safe:r=>(r.state.screen!=='play'&&!['defeat','exhausted'].includes(r.state.outcome)?1000:0)+r.summary.hits-4*r.summary.enemyDamage-(['defeat','exhausted'].includes(r.state.outcome)?500:0)};
// a policy that tries to spread: prefers lines that are still empty, breaks ties by the usual score
const spread=(r,s,a)=>{const line=E.selectedLine(a.cell,a.axis);const others=line.filter(i=>s.grid[i]).length;return fn.dmg(r)-6*others;};
function pickBest(s,score){let best=null,bv=-1e18;for(const a of E.actions(s)){const r=E.activate(s,a);const v=score(r,s,a);if(v>bv){bv=v;best={a,r};}}return best;}
const N=100;
for(const [name,score] of [['greedy-dmg',(r)=>fn.dmg(r)],['greedy-safe',(r)=>fn.safe(r)],['forced-spread',spread]]){
 for(const enc of [1,2,3]){
  let placements=0,intoLine=0,occ=0,turns=0,rows=0,cols=0,maxOcc=0,wins=0,hits=0,activ=0;const lineUse={};const occHist={};
  for(let seed=1;seed<=N;seed++){const s0=E.start(E.fresh(seed));E.setupEncounter(s0,enc);s0.screen='play';let s=s0,t=0;
   while(s.screen==='play'&&t<60){const {a,r}=pickBest(s,score);const line=E.selectedLine(a.cell,a.axis);const others=line.filter(i=>s.grid[i]).length;
    placements++;if(others>=1)intoLine++;a.axis==='row'?rows++:cols++;const key=a.axis+Math.floor(a.axis==='row'?a.cell/3:a.cell%3);lineUse[key]=(lineUse[key]||0)+1;
    hits+=r.summary.hits;activ+=r.summary.events.filter(e=>e.type==='activate').length;
    s=r.state;t++;const o=s.grid.filter(Boolean).length;occ+=o;turns++;occHist[o]=(occHist[o]||0)+1;maxOcc=Math.max(maxOcc,o);}
   if(s.outcome!=='defeat'&&s.outcome!=='exhausted')wins++;}
  const total=Object.values(lineUse).reduce((a,b)=>a+b,0);const top=Object.entries(lineUse).sort((x,y)=>y[1]-x[1]).slice(0,3).map(([k,v])=>`${k}:${(v/total*100).toFixed(0)}%`).join(' ');
  const hist=Object.keys(occHist).sort((a,b)=>a-b).map(k=>`${k}:${(occHist[k]/turns*100).toFixed(0)}%`).join(' ');
  console.log(`${name.padEnd(13)} E${enc} win ${wins}/${N} | cells occupied after a turn: avg ${(occ/turns).toFixed(2)} max ${maxOcc} [${hist}] | placed into a line that already had a card ${(intoLine/placements*100).toFixed(0)}% | rows ${(rows/placements*100).toFixed(0)}% cols ${(cols/placements*100).toFixed(0)}% | busiest lines ${top} | card-activations per turn ${(activ/turns).toFixed(2)} dmg/turn ${(hits/turns).toFixed(2)}`);}}
