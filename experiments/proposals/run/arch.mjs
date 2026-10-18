import {campaign} from './campaign.mjs';
const N=Number(process.argv[2]||60),pol=process.argv[3]||'dmg';
const ARCH={random:null,
 turf:['anvil','scorch','disrupt','cross','scout','haven','slam','raid','rampart','assault','sandstorm'],
 visitors:['raid','rampart','assault','sandstorm','scorch','anvil','disrupt','slam','cross','scout','haven'],
 block:['slam','rampart','haven','shelter','disrupt','cross','scout','raid','assault','sandstorm','anvil','scorch']};
const pick=pref=>pref?(offer=>pref.find(t=>offer.includes(t))):null;
console.log('policy',pol,'N',N);
const ONLY=(process.argv[4]||'').split(',').filter(Boolean);
for(const [an,pref] of Object.entries(ARCH)){ if(ONLY.length&&!ONLY.includes(an))continue;
 const row=[];
 for(const relic of [null,'turfseal','falcon','patience']){
  let full=0,hp=0,n=0;
  for(let seed=1;seed<=N;seed++){const {log,final}=campaign(seed,relic,pol,'x',pick(pref));if(final.outcome==='victory')full++;for(const l of log){if(l.win&&l.enc>=3){hp+=l.hp;n++;}}}
  row.push(`${String(relic).padEnd(9)} ${String(full).padStart(2)}/${N} hp(E3-5) ${(n?hp/n:0).toFixed(1)}`);}
 console.log(an.padEnd(9),row.join(' | '));}
