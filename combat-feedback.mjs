import { icon } from './icons.mjs?v=9';
const combatNumber = n => new Intl.NumberFormat('ar-SA', {useGrouping:false}).format(n);
export function combatTimeline(summary, reduced = false) {
  const frames = []; let at = 35; let counter = false; let cleared = false;
  for (const event of summary.events ?? []) {
    if (event.type === 'enemy-attack' && counter) continue;
    if (event.type === 'enemy-attack' && !counter) {
      frames.push({at:at + 30,event:{type:'clear',cells:summary.clearedCells}});
      cleared = true; at += reduced ? 80 : 230; counter = true;
    }
    if (event.type === 'enemy-attack') {
      const replies = summary.events.filter(e=>e.type==='enemy-attack'), last = replies.at(-1);
      frames.push({at,event:{...event,sourceIds:replies.map(e=>e.source),blocked:summary.prevented,damage:summary.enemyDamage,hp:last.hp,shield:last.shield}});
    } else frames.push({at,event});
    at += reduced ? 30 : event.type === 'activate' ? 90 : event.type === 'enemy-attack' ? 230 : 115;
  }
  if (!cleared) frames.push({at,event:{type:'clear',cells:summary.clearedCells}});
  return {frames,duration:at + (reduced ? 650 : 1000)};
}
// This renderer consumes committed engine events. It never computes or changes combat rules.
export function playCombatFeedback({root,summary,onComplete,onSound = () => {},reduced = false}) {
  const arena = root.querySelector('.battle-arena');
  if (!arena) {onComplete();return () => {};}
  const layer = document.createElement('div');layer.className='combat-fx';layer.setAttribute('aria-hidden','true');arena.append(layer);
  const timers = new Set();let cancelled=false;const lanes=new Map();const cut={};
  const later=(fn,ms)=>{const id=setTimeout(()=>{timers.delete(id);if(!cancelled)fn();},ms);timers.add(id);};
  const unit=target=>target==='hero'?root.querySelector('.hero-combatant'):root.querySelector(`[data-target="${target}"]`);
  const pulse=(element,name,duration=320)=>{if(!element)return;element.classList.remove(name);void element.offsetWidth;element.classList.add(name);later(()=>element.classList.remove(name),duration);};
  const hp=(target,value)=>{const element=unit(target);const count=target==='hero'?element?.querySelector('[data-hero-hp]'):element?.querySelector('[data-enemy-hp]');const max=Number(element?.dataset.maxHp)||24;if(count)count.textContent=`${combatNumber(value)} / ${combatNumber(max)}`;const bar=element?.querySelector('.hp-track i');if(bar)bar.style.width=`${value/max*100}%`;if(target==='hero'){const header=root.querySelector('[data-player-hp]');if(header)header.textContent=`${combatNumber(value)} / ${combatNumber(max)}`;}};
  const anchor=target=>{const element=unit(target);const a=arena.getBoundingClientRect();const r=element?.getBoundingClientRect();return r?{x:r.left-a.left+r.width*(target==='hero'?.54:.5),y:r.top-a.top+r.height*.25}:{x:a.width*.3,y:a.height*.4};};
  const pop=(target,amount,kind,label,ico)=>{if(!amount)return;const {x,y}=anchor(target);const lane=(lanes.get(target)??0)%3;lanes.set(target,lane+1);const node=document.createElement('div');node.className=`combat-pop pop-${kind}${reduced?' is-still':''}`;node.dataset.amount=amount;node.dataset.target=target;const dx=target==='hero'?(kind==='blocked'?48:kind==='damage'?-38:kind==='shield'?-46:6):[0,-24,24][lane];const dy=target==='hero'?8:lane*20;node.style.left=`${x+dx}px`;node.style.top=`${Math.max(42,y+dy)}px`;node.innerHTML=`<span class="pop-value" dir="ltr">${kind==='shield'||kind==='heal'||kind==='momentum'?'+':kind==='damage'||kind==='turf'||kind==='weaken'?'−':''}${combatNumber(amount)}${icon(ico)}</span><small>${label}</small>`;layer.append(node);later(()=>node.remove(),1050);};
  const impact=(target,kind)=>{const {x,y}=anchor(target);const node=document.createElement('span');node.className=`combat-impact impact-${kind}`;node.style.left=`${x}px`;node.style.top=`${y+15}px`;node.innerHTML=Array.from({length:6},(_,i)=>`<i style="--angle:${i*60}deg"></i>`).join('');layer.append(node);later(()=>node.remove(),450);};
  const shield=document.createElement('div');shield.className='combat-shield';shield.innerHTML=`${icon('shield')}<b>٠</b><small>درع</small>`;layer.append(shield);
  const setShield=value=>{const {x,y}=anchor('hero');shield.style.left=`${x-45}px`;shield.style.top=`${y+45}px`;shield.querySelector('b').textContent=combatNumber(value);shield.classList.toggle('is-visible',value>0);};
  const process=event=>{
    if(event.type==='activate')pulse(root.querySelector(`[data-cell="${event.cell}"]`),'is-firing');
    else if(event.type==='risk')pulse(root.querySelector(`[data-cell="${event.cell}"]`),'is-risk-triggered',400);
    else if(event.type==='damage'){const turf=event.source==='turf-scorched',bleed=event.source==='bleed';hp(event.target,event.hp);pop(event.target,event.amount,bleed?'bleed':turf?'turf':'damage',bleed?'نزيف':turf?'أرض مشتعلة':'ضرر',bleed?'bleed':turf?'fire':'swords');impact(event.target,bleed?'bleed':'hit');pulse(unit(event.target),'is-hit');onSound(bleed?'knife':'hit');if(event.fatal){later(()=>unit(event.target)?.classList.add('is-fallen'),150);later(()=>onSound('kill'),120);}}
    else if(event.type==='shield'){const [label,ico]={'turf-fortified':['أرض محصنة','stone'],'relic-falcon':['ريشة الصقر','bow'],'relic-carry':['محفوظ','waterskin']}[event.source]||['درع','shield'];setShield(event.value);pop('hero',event.amount,'shield',label,ico);pulse(shield,'shield-gained');onSound('guard');}
    else if(event.type==='weaken'||event.type==='stagger'){const id=event.target;cut[id]=(cut[id]||0)+event.amount;const el=root.querySelector(`[data-intent="${id}"]`);if(el){const raw=Number(el.dataset.raw)||0;const value=el.querySelector('.icon-stat b');if(value)value.textContent=combatNumber(Math.max(0,raw-cut[id]));el.classList.add('is-weakened');}pop(id,event.amount,'weaken',event.type==='stagger'?'ترنح':'إضعاف',event.type==='stagger'?'spark':'feint');pulse(unit(id),'is-weakened-unit',420);onSound('weaken');}
    else if(event.type==='ignite'||event.type==='fortify'){const el=root.querySelector(`[data-cell="${event.cell}"]`);el?.classList.add(event.type==='ignite'?'is-scorched':'is-fortified');pulse(el,event.type==='ignite'?'is-igniting':'is-fortifying',520);onSound(event.type);}
    else if(event.type==='vanish'){const el=root.querySelector(`[data-cell="${event.cell}"]`);if(el&&!reduced){el.classList.add('is-vanishing');later(()=>el.classList.remove('is-vanishing'),420);}}
    else if(event.type==='momentum'){const count=root.querySelector('[data-momentum]');if(count)count.textContent=combatNumber(event.value);pulse(root.querySelector('.momentum-count'),'resource-pulse');pop('hero',event.amount,'momentum','زخم','fire');}
    else if(event.type==='momentum-spend'){const count=root.querySelector('[data-momentum]');if(count)count.textContent=combatNumber(event.value);}
    else if(event.type==='heal'){hp('hero',event.hp);pop('hero',event.amount,'heal','تعافٍ','heart');}
    else if(event.type==='bleed'){pop(event.target,event.amount,'status','نزيف','bleed');}
    else if(event.type==='enemy-attack'){
      (event.sourceIds??[event.source]).forEach((id,i)=>later(()=>pulse(unit(id),'is-attacking'),i*60));hp('hero',event.hp);setShield(event.shield);
      if(event.blocked){pop('hero',event.blocked,'blocked','مُنِع','shield');impact('hero','block');pulse(unit('hero'),'is-blocking');onSound('block');}
      if(event.damage){later(()=>{pop('hero',event.damage,'damage','خسرت صحة','heart');impact('hero','hit');pulse(arena,'hero-hurt',380);pulse(unit('hero'),'is-hit');onSound('hurt');},event.blocked&&!reduced?130:0);}
    }else if(event.type==='clear')for(const cell of event.cells??[])root.querySelector(`[data-cell="${cell}"]`)?.classList.add('is-clearing');
  };
  const {frames,duration}=combatTimeline(summary,reduced);for(const frame of frames)later(()=>process(frame.event),frame.at);
  later(()=>{cancelled=true;for(const id of timers)clearTimeout(id);timers.clear();layer.remove();onComplete();},duration);
  return()=>{cancelled=true;for(const id of timers)clearTimeout(id);timers.clear();layer.remove();};
}
