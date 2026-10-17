// Experimental rules only. Nothing in dist/ imports this module.
import {readFile} from 'node:fs/promises';
let source=await readFile(new URL('./baseline-engine.mjs',import.meta.url),'utf8');
const replace=(a,b)=>{if(!source.includes(a))throw Error('Prototype hook missing: '+a);source=source.replace(a,b);};
replace("export const rewards =",`cards.tactics = face('تدبير','spark',[{op:'scry',n:2}],'اختيار السحب التالي من أعلى ورقتين');
alternates.tactics = face('تدبير','spark',[{op:'cycle',n:2}],'تبديل حتى ورقتين من اليد');
alternates.focus = face('عزم','fire',[{op:'convert',n:1}],'تحويل كل الزخم إلى صد وصرفه');
cards.volley = face('وابل','bow',[{op:'area',n:2}],'ضرران لكل الأهداف المتاحة');
alternates.volley = face('وابل','bow',[{op:'area',n:3}],'ثلاثة لكل الأهداف المتاحة');
cards.leech = face('اغتنام','knife',[{op:'lifekill',n:2}],'ضرران وعلاج ٢ عند قتل الهدف');
alternates.leech = face('اغتنام','knife',[{op:'lifekill',n:4}],'أربعة وعلاج ٢ عند القتل');
cards.reserve = face('سهم الصقر','bow',[{op:'half',n:2}],'ضرران وصرف نصف الزخم');
alternates.reserve = face('سهم الصقر','bow',[{op:'hit',n:4}],'أربعة أضرار ثابتة');
cards.bleed3 = face('نزيف تجريبي','knife',[{op:'bleed',n:3}],'ثلاث نقاط نزيف');
alternates.bleed3 = cards.bleed3;
cards.recall = face('استرجاع','spark',[{op:'recall',n:1}],'استبدال ورقة من اليد بورقة في المستعمل');
alternates.recall = face('استرجاع','spark',[{op:'recall',n:1}],'استبدال ورقة من اليد بورقة في المستعمل');
export const rewards =`);
replace("else if (fx.op === 'block') summary.block += fx.n;",`else if (fx.op === 'block') summary.block += fx.n;
      else if (fx.op === 'convert') {summary.block+=s.momentum;summary.momentum.spent+=s.momentum;s.momentum=0;}
      else if (fx.op === 'scry') {const visible=s.draw.slice(0,2);record.options=visible.length;if(visible.includes(a.seek)){s.draw.splice(s.draw.indexOf(a.seek),1);s.draw.unshift(a.seek);}}
      else if (fx.op === 'cycle') {const ids=[...new Set(a.swap??[])].filter(uid=>s.hand.includes(uid)).slice(0,2);record.available=s.draw.length+s.discard.length;for(const uid of ids)s.hand.splice(s.hand.indexOf(uid),1);draw(s);s.discard.push(...ids);record.changed=ids.filter(uid=>!s.hand.includes(uid)).length;}
      else if (fx.op === 'recall') {if(s.discard.includes(a.recall)&&s.hand.includes(a.give)){s.discard.splice(s.discard.indexOf(a.recall),1);s.hand.splice(s.hand.indexOf(a.give),1,a.recall);s.discard.push(a.give);record.retrieved=a.recall;}}
      else if (fx.op === 'area') {let dealt=0;for(const e of attackTargets(s)){const n=Math.min(e.hp,fx.n);e.hp-=n;dealt+=n;}summary.hits+=dealt;record.damage=dealt;}
      else if (fx.op === 'lifekill') {const e=s.enemies.find(e=>e.id===targetForAction(s,action));const hp=e?.hp??0;record.damage=hit(fx.n);if(hp>0&&hp<=fx.n){record.healed=Math.min(2,s.maxHp-s.hp);s.hp+=record.healed;}}
      else if (fx.op === 'half') {const n=Math.ceil(s.momentum/2);s.momentum-=n;summary.momentum.spent+=n;record.damage=hit(fx.n+n);}`);
replace('while (s.hand.length < 5)', 'while (s.hand.length < (s.handLimit ?? 5))');
export const engine=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
export const baseDeck=['arrow.0','arrow.1','cover.0','cover.1','focus.0','tactics.0'];
export function fixture({deck=baseDeck,grid=Array(6).fill(null),hand,draw,discard=[],momentum=0,hp=24,enemies}={}){
 const s=engine.start(engine.fresh(11));s.deck=[...new Set([...deck,...grid.filter(Boolean),...(hand??[]),...(draw??[]),...discard])];s.grid=[...grid];s.faces=Object.fromEntries(grid.filter(Boolean).map(x=>[x,0]));s.discard=[...discard];s.exhausted=[];s.momentum=momentum;s.hp=hp;
 const remaining=s.deck.filter(x=>!grid.includes(x)&&!discard.includes(x));s.hand=hand??remaining.slice(0,5);s.draw=draw??remaining.filter(x=>!s.hand.includes(x));if(enemies)s.enemies=structuredClone(enemies);engine.assertState(s);return s;
}
export function freshLab(seed,deck=baseDeck,handLimit=5){const s=engine.start(engine.fresh(seed));s.deck=[...deck];s.handLimit=handLimit;s.hand=[];s.draw=[...deck];s.discard=[];s.grid=Array(6).fill(null);s.faces={};let rng=seed>>>0;for(let i=s.draw.length-1;i>0;i--){rng=(Math.imul(rng,1664525)+1013904223)>>>0;const j=rng%(i+1);[s.draw[i],s.draw[j]]=[s.draw[j],s.draw[i]];}engine.draw(s);engine.assertState(s);return s;}
export function legal(s){const seen=new Set();return engine.actions(s).filter(a=>{const k=[engine.cardType(a.card),a.face,a.cell,a.target].join('/');if(seen.has(k))return false;seen.add(k);return true;}).flatMap(a=>{const op=engine.def(a.card,s,a.face).effects[0].op;if(op==='scry')return (s.draw.slice(0,2).length?s.draw.slice(0,2):[undefined]).map(seek=>({...a,seek}));if(op==='cycle'){const others=s.hand.filter(x=>x!==a.card);const swaps=[[],...others.map(x=>[x])];for(let i=0;i<others.length;i++)for(let j=i+1;j<others.length;j++)swaps.push([others[i],others[j]]);return swaps.map(swap=>({...a,swap}));}return[a];});}
