import {CARDS,play,leap,exert,drink,forecast,cardEffect,terrain} from './engine.mjs?v=4';
export function incoming(state){return state.phase==='battle'?forecast(state).reduce((n,f)=>n+f.hpLoss,0):0}
// Preview the actual rules on a copy. Never approximate damage or advance the real RNG.
export function preview(state,{index,target,destination,kind='card'}){
  let after=structuredClone(state),result;
  if(kind==='leap')result=leap(after,index,destination);
  else if(kind==='drink')result=drink(after);
  else if(kind==='exert')result=exert(after)?{events:[]}:{error:'تجلّدتَ هذا الدور'};
  else result=play(after,index,target);
  if(result.error)return {error:result.error};
  return {after,events:result.events||[],incoming:incoming(after),beforeIncoming:incoming(state),hp:after.hp-state.hp,block:after.block-state.block,strain:after.strain-state.strain,energy:after.energy-state.energy,damage:state.enemies.map(e=>({id:e.id,amount:e.hp-after.enemies.find(x=>x.id===e.id).hp,remaining:after.enemies.find(x=>x.id===e.id).hp})),effect:kind==='card'?cardEffect(state,state.hand[index],state.enemies.find(e=>e.id===target)):null};
}
export function summary(state,id){
  let c=CARDS[id],e=cardEffect(state,id);
  if(c.close)return `بعيد ${c.dmg} · قريب ${c.close} + دفع`;
  if(c.unplayable)return state.ruleset==='lure'?'عبء · لا يصلح للوثبة':'عبء · اطرحه للوثبة';
  if(c.mark)return 'علّم الفريسة · اسحب ١';
  if(c.recoverBow)return 'أعد بطاقة قوس إلى يدك';
  if(c.move)return `${c.move>0?'يمين →':'← يسار'} · ${c.block} اتّقاء`;
  if(c.dmg&&c.weak)return `${c.dmg} ضرر · −${c.weak} هجوم`;
  if(c.dmg)return `${c.dmg} ضرر · ${c.max?'قريب':'كل المسافات'}`;
  if(c.weak)return `−${c.weak} من هجوم الخصم`;
  if(c.strain)return `−${Math.abs(c.strain)} إجهاد · ${c.block} اتّقاء`;
  return `${e.block} اتّقاء${c.rockBonus&&terrain(state.pos)==='rock'?' · من الصخر':''}`;
}
