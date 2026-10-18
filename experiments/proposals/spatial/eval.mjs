import * as E from './engine.mjs';
const OK=o=>!['defeat','exhausted'].includes(o);
const dmg=r=>(r.state.screen!=='play'&&OK(r.state.outcome)?1000:0)+2*r.summary.hits-1.5*r.summary.enemyDamage+0.2*r.summary.clearedCells.length-(OK(r.state.outcome)?0:500);
const safe=r=>(r.state.screen!=='play'&&OK(r.state.outcome)?1000:0)+r.summary.hits-4*r.summary.enemyDamage-(OK(r.state.outcome)?0:500);
function search(s,fn,depth,K){const cand=[];for(const a of E.actions(s)){const r=E.activate(s,a);if(r.valid)cand.push({a,r,v:fn(r)});}
 cand.sort((x,y)=>y.v-x.v);let best=null,bv=-1e18;for(const c of cand.slice(0,K)){let v=c.v;if(depth>1&&c.r.state.screen==='play'){const sub=search(c.r.state,fn,depth-1,K);if(sub)v+=sub[0];}if(v>bv){bv=v;best=c;}}return best?[bv,best]:null;}
function choose(s,pol){if(pol==='1ply'){let b=null,bv=-1e18;for(const a of E.actions(s)){const r=E.activate(s,a);const v=dmg(r);if(v>bv){bv=v;b={a,r};}}return b;}return search(s,safe,3,4)[1];}
const BASE=E.STARTER_RECIPE;
const V={baseline:['strike','strike'],harvest:['harvest','harvest'],hoard:['hoard','hoard'],'pillar ⚔️':['pillarA','pillarA'],'pillar 🛡️':['pillarD','pillarD'],alternate:['alternate','alternate'],'mirror ⚔️':['mirrorA','mirrorA'],'mirror 🛡️':['mirrorD','mirrorD']};
const pol=process.argv[2]||'1ply',N=Number(process.argv[3]||40),encs=(process.argv[4]||'2,3,4').split(',').map(Number);
console.log('policy',pol,'N',N,'encounters',encs.join(','));
for(const [name,extra] of Object.entries(V)){const key=extra[0];const row=[];
 for(const enc of encs){let t=0,occ=0,max=0,wins=0,dm=0,alone=0,held=0,played=0,cellsUsed=new Set(),hp=0;
  for(let seed=1;seed<=N;seed++){const s0=E.start(E.fresh(seed,[...BASE,...extra]));E.setupEncounter(s0,enc);s0.screen='play';let s=s0,g=0;
   while(s.screen==='play'&&g<60){const {a,r}=choose(s,pol);const line=E.selectedLine(a.cell,a.axis);if(line.filter(i=>s.grid[i]).length===0)alone++;
    if(key!=='strike'){if(s.hand.some(u=>u.startsWith(key+'.')))held++;if(a.card.startsWith(key+'.'))played++;}
    dm+=r.summary.hits;cellsUsed.add(a.cell);s=r.state;g++;t++;const o=s.grid.filter(Boolean).length;occ+=o;max=Math.max(max,o);}
   if(OK(s.outcome)&&s.screen!=='play'){wins++;hp+=s.hp;}}
  row.push(`E${enc} win ${wins}/${N} hp ${(wins?hp/wins:0).toFixed(0)} cells ${(occ/t).toFixed(2)}/${max} alone ${(alone/t*100).toFixed(0)}% dmg ${(dm/t).toFixed(2)}${key!=='strike'?` play ${held?(played/held*100).toFixed(0):'-'}%`:''}`);}
 console.log(name.padEnd(11),row.join(' | '));}
