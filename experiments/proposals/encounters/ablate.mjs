import * as E from '../../../dist/engine.mjs';
import {CANDIDATES} from './tune.mjs';
const fn=r=>(r.state.screen!=='play'&&r.state.outcome!=='defeat'?1000:0)+r.summary.hits-4*r.summary.enemyDamage-(r.state.outcome==='defeat'?500:0);
function search(s,depth,K){const cand=[];for(const a of E.actions(s)){const r=E.activate(s,a);if(r.valid)cand.push({r,v:fn(r)});}
 cand.sort((x,y)=>y.v-x.v);let best=null,bv=-1e18;for(const c of cand.slice(0,K)){let v=c.v;if(depth>1&&c.r.state.screen==='play'){const sub=search(c.r.state,depth-1,K);if(sub)v+=sub[0];}if(v>bv){bv=v;best=c.r;}}return best?[bv,best]:null;}
E.ENCOUNTERS.length=0;E.ENCOUNTERS.push(...structuredClone(CANDIDATES[process.argv[2]]));
const FULL=[...E.DECK_RECIPE];const N=Number(process.argv[3]||20);
function measure(k){let wins=0,hp=0,turns=0;for(let seed=1;seed<=N;seed++){const s0=E.start(E.fresh(seed));E.setupEncounter(s0,k);s0.screen='play';let s=s0,t=0;
 while(s.screen==='play'&&t<60){const [,b]=search(s,2,5);s=b.state;t++;}
 turns+=t;if(s.outcome!=='defeat'&&s.screen!=='play'){wins++;hp+=s.hp;}}
 return {wins,hp:wins?hp/wins:0,turns:turns/N};}
const cards=['cross','scout','haven','anvil','scorch','disrupt','slam','raid','rampart','assault'];
const base={};for(let k=1;k<=E.ENCOUNTERS.length;k++)base[k]=measure(k);
console.log('baseline',JSON.stringify(base));
for(const c of cards){E.DECK_RECIPE.length=0;E.DECK_RECIPE.push(...FULL.filter(x=>x!==c));
 const row=[];for(let k=1;k<=E.ENCOUNTERS.length;k++){const m=measure(k);row.push(`E${k}: win ${m.wins-base[k].wins>=0?'+':''}${m.wins-base[k].wins} hp ${(m.hp-base[k].hp).toFixed(1)} turns ${(m.turns-base[k].turns).toFixed(1)}`);}
 console.log(`without ${c.padEnd(8)} | ${row.join(' | ')}`);}
