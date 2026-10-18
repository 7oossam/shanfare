import {campaign} from './campaign.mjs';
const N=Number(process.argv[2]||24),pols=(process.argv[3]||'look,dmg').split(',');
const relics=[null,'turfseal','falcon','patience'];
for(const pol of pols){for(const relic of relics){
 const reach=[0,0,0,0,0],win=[0,0,0,0,0],hp=[0,0,0,0,0];let full=0;
 for(let seed=1;seed<=N;seed++){const {log,final}=campaign(seed,relic,pol);
  for(const l of log){reach[l.enc-1]++;if(l.win){win[l.enc-1]++;hp[l.enc-1]+=l.hp;}}
  if(final.outcome==='victory')full++;}
 console.log(`${pol.padEnd(8)} ${String(relic).padEnd(9)} campaign ${full}/${N} | `+reach.map((r,i)=>`E${i+1} ${win[i]}/${r} hp ${win[i]?(hp[i]/win[i]).toFixed(1):'-'}`).join(' | '));}}
