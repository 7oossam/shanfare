import {campaign} from './campaign.mjs';
const N=Number(process.argv[2]||80),pol=process.argv[3]||'dmg';
const ARCH={turf:['anvil','scorch','disrupt','cross','scout','haven','slam','raid','rampart','assault','sandstorm'],
 visitors:['raid','rampart','assault','sandstorm','scorch','anvil','disrupt','slam','cross','scout','haven'],
 block:['slam','rampart','haven','shelter','disrupt','cross','scout','raid','assault','sandstorm','anvil','scorch']};
const PAIRS=[['turfseal','turf'],['falcon','visitors'],['patience','block']];
console.log('policy',pol,'N',N,'(conditional win rate and mean health at the end of each encounter)');
for(const [relic,arch] of PAIRS){
 const pref=ARCH[arch];const pick=offer=>pref.find(t=>offer.includes(t));
 for(const r of [null,relic]){
  const reach=[0,0,0,0,0],win=[0,0,0,0,0],hp=[0,0,0,0,0];
  for(let seed=1;seed<=N;seed++){const {log}=campaign(seed,r,pol,'x',pick);for(const l of log){reach[l.enc-1]++;if(l.win){win[l.enc-1]++;hp[l.enc-1]+=l.hp;}}}
  console.log(`${arch.padEnd(9)} ${String(r).padEnd(9)} `+reach.map((x,i)=>`E${i+1} ${(win[i]/x*100).toFixed(0)}% hp ${win[i]?(hp[i]/win[i]).toFixed(1):'-'}`).join(' | '));}}
