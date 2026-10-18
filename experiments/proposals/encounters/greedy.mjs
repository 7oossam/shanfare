import * as E from '../../../dist/engine.mjs';
const pol={dmg:r=>(r.state.screen!=='play'&&r.state.outcome!=='defeat'?1000:0)+2*r.summary.hits-1.5*r.summary.enemyDamage+0.2*r.summary.clearedCells.length-(r.state.outcome==='defeat'?500:0),
 safe:r=>(r.state.screen!=='play'&&r.state.outcome!=='defeat'?1000:0)+r.summary.hits-4*r.summary.enemyDamage-(r.state.outcome==='defeat'?500:0)};
for(let k=1;k<=E.ENCOUNTERS.length;k++){for(const [pn,f] of Object.entries(pol)){let wins=0,hp=0,N=100,turns=0;
 for(let seed=1;seed<=N;seed++){const s0=E.start(E.fresh(seed));E.setupEncounter(s0,k);s0.screen='play';let s=s0,t=0;
  while(s.screen==='play'&&t<80){let best=null,bv=-1e9;for(const a of E.actions(s)){const r=E.activate(s,a);const v=f(r);if(v>bv){bv=v;best=r;}}s=best.state;t++;}
  turns+=t;if(s.outcome!=='defeat'&&s.screen!=='play'){wins++;hp+=s.hp;}}
 console.log(`E${k} ${E.ENCOUNTERS[k-1].name.padEnd(16)} 1-ply ${pn.padEnd(4)} win ${wins}/${N} turns ${(turns/N).toFixed(1)} hpLeft ${(wins?hp/wins:0).toFixed(1)}`);}}
