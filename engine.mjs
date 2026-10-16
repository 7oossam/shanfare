// Serializable encounter rules. No DOM, network, or implicit randomness.
export const CARDS = {
  shot: {name:'سهمٌ خاطف', type:'قوس', cost:1, icon:'bow', text:'٦ ضرر من بعيد. عند الاشتباك: مقبض القوس، ٣ ضرر ودفع موضع.', dmg:6, min:2, close:3, push:1},
  aim: {name:'وترٌ مشدود', type:'قوس', cost:2, icon:'bow', text:'١٣ ضرر بثبات من بعيد. قريبًا: دفعة بالقوس، ٥ ضرر ودفع موضع.', dmg:13, min:2, steady:true, close:5, push:1},
  knife: {name:'حدُّ الخنجر', type:'نصل', cost:1, icon:'knife', text:'٩ ضرر عند الاشتباك. مسافة ١.', dmg:9, max:1},
  advance: {name:'مرور الخاطف', type:'عَدْو', cost:1, icon:'run', text:'تحرّك موضعًا إلى اليمين واحصل على ٤ اتّقاء.', move:1, block:4},
  retreat: {name:'أسبقُ ظلي', type:'عَدْو', cost:1, icon:'run', text:'تحرّك موضعًا إلى اليسار واحصل على ٤ اتّقاء.', move:-1, block:4},
  guard: {name:'أحتمي بالصخر', type:'اتّقاء', cost:1, icon:'shield', text:'٥ اتّقاء، أو ٨ عند النتوء الصخري. الموضع يغيّر قوة الاحتماء.', block:5, rockBonus:3},
  wolf: {name:'نداءُ السِّيد', type:'أهل', cost:2, icon:'wolf', text:'ينقضّ الذئب على الخصم: ١٠ ضرر، مهما كانت مسافتك.', dmg:10},
  feint: {name:'أثرٌ كاذب', type:'حيلة', cost:0, icon:'eye', text:'ضلّل خصمًا: خفّض هجومه ٤ هذا الدور.', weak:4},
  breath: {name:'أُميتُ الجوع', type:'جَلَد', cost:1, icon:'wind', text:'أزل نقطتي إجهاد واحصل على ٣ اتّقاء.', strain:-2, block:3},
  scavenge: {name:'أستعيدُ سهمي', type:'حيلة', cost:0, icon:'bow', text:'أعد آخر بطاقة قوس مطروحة إلى يدك. إن لم توجد، اسحب بطاقة.', recoverBow:true},
  track: {name:'اقتفاءُ الأثر', type:'أهل', cost:0, icon:'eye', text:'دلّ الذئب على خصم، واسحب بطاقة. ضرب الفريسة يفعّل انقضاضته دون حركة.', mark:true, draw:1},
  sand: {name:'حفنةٌ من الرمل', type:'حيلة', cost:1, icon:'sun', text:'عند الاشتباك: ٢ ضرر، وخفّض هجوم الخصم ٦ هذا الدور.', dmg:2, weak:6, max:1},
  weary: {name:'وَهَن', type:'عبء', cost:0, icon:'sun', text:'لا تُلعب. يمكنك طرحها ثمنًا لوثبة العَدّاء.', unplayable:true}
};
export const APPROACHES = {
  lure:{name:'موقف الاستدراج',icon:'eye',desc:'نفس اليد في كل محاولة. الخصم يلتزم بهجومه، والوثبة تُخرج بطاقة من المواجهة.',pos:0,hand:['aim','knife','guard','shot','advance']},
  ridge:{name:'من المَرْقَبة', icon:'bow', desc:'ابدأ خلف الصخر، وبيدك وتر مشدود. رميٌ محسوب وثبات.', pos:0, hand:['shot','aim','retreat','guard','scavenge']},
  trail:{name:'على أثر السِّيد', icon:'wolf', desc:'ابدأ مع الذئب واقتفاء الأثر. عزل الفريسة والتعاون.', pos:0, hand:['shot','guard','advance','wolf','track']},
  valley:{name:'من بطن الوادي', icon:'knife', desc:'ابدأ قريبًا من المتعقّب، بخنجر وحفنة رمل. مواجهة ومراوغة.', pos:1, hand:['knife','sand','advance','guard','feint']}
};
export const BOONS = {wolf:{name:'عهد السِّيد',text:'انقضاضة الذئب الأولى في المواجهة +٣ ضرر.'},bow:{name:'وتر المتعقّب',text:'ضربة القوس البعيدة الأولى في المواجهة +٣ ضرر.'},wind:{name:'قِربة ممتلئة',text:'رشفة ماء إضافية في المواجهة.'}};
const POOL=['shot','shot','shot','guard','guard','advance','advance','wolf','wolf','feint','aim','knife','knife','retreat','breath','scavenge','track','sand'];
export function random(s){s.seed=(s.seed*1664525+1013904223)>>>0;return s.seed/4294967296}
function shuffle(s,a){for(let i=a.length-1;i>0;i--){let j=Math.floor(random(s)*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function log(s,t){s.log.push(t);s.log=s.log.slice(-40)}
export function fresh(seed=Date.now()>>>0,approach='trail',boon=null){
  if(!APPROACHES[approach])approach='trail';if(!BOONS[boon])boon=null;if(approach==='lure'){seed=424242;boon=null;}
  let route=APPROACHES[approach];
  let s={version:2,seed,phase:'battle',turn:1,hp:48,maxHp:48,block:0,energy:3,strain:0,pos:route.pos,moved:false,wolfUsed:false,exerted:false,leaped:false,waterUsed:false,water:boon==='wind'?3:2,approach,boon,boonUsed:false,played:0,damageTaken:0,enemies:[{id:'guard',name:'متعقّب الوادي',hp:35,maxHp:35,pos:2,weak:0,marked:false},{id:'archer',name:'رامي سلامان',hp:29,maxHp:29,pos:4,weak:0,marked:false}],deck:[],hand:[...route.hand],discard:[],log:[`وصلت إلى المورد ${route.name}. الصخر ساتر، والسِّيد رفيق.`],reward:null};
  let pool=[...POOL];for(let card of s.hand)pool.splice(pool.indexOf(card),1);s.deck=shuffle(s,pool);if(approach==='lure'){s.ruleset='lure';s.hp=18;s.enemies[0].pos=3;s.enemies[1].hp=13;s.enemies[1].maxHp=13;s.exhaust=[];s.opening={startHp:18,cards:[],burned:[]};s.log=['بلغتَ المورد مصابًا. المتعقّب ينوي اندفاعًا إلى أثرك، والرامي يغطي الممر.'];commitPlans(s);}return s;
}
export function restore(value){
  if(!value||![1,2].includes(value.version)||!['battle','victory','defeat'].includes(value.phase)||!Array.isArray(value.enemies)||value.enemies.length!==2)return null;
  if(!['hp','energy','strain','pos','turn','seed','block','maxHp'].every(k=>Number.isFinite(value[k])))return null;
  if(value.pos<0||value.pos>4||value.hp<0||value.hp>value.maxHp||value.energy<0)return null;
  if(!['hand','deck','discard'].every(k=>Array.isArray(value[k])&&value[k].every(c=>CARDS[c])))return null;
  if(!Array.isArray(value.log)||!value.log.every(t=>typeof t==='string'))return null;
  if(!value.enemies.every(e=>['guard','archer'].includes(e.id)&&Number.isFinite(e.hp)&&Number.isFinite(e.pos)&&e.pos>=0&&e.pos<=4))return null;
  let s=structuredClone(value);if(s.version===1){s.version=2;s.water=2;s.waterUsed=false;s.leaped=false;s.approach='trail';s.boon=null;s.boonUsed=false;s.enemies.forEach(e=>e.marked=false);log(s,'وصلت تحسينات المورد: وثبة العَدّاء ومقبض القوس متاحان الآن، ومحاولتك محفوظة.');}
  if(s.ruleset==='lure'){if(!Array.isArray(s.exhaust)||!s.exhaust.every(id=>CARDS[id]))return null;if(!s.enemies.every(e=>e.hp<=0||validPlan(e.plan,s.turn)))return null;}return s;
}
export function distance(s,e){return Math.abs(s.pos-e.pos)}
export function terrain(pos){return pos===0||pos===4?'rock':'sand'}
export function targets(c){return !!(c.dmg||c.weak||c.mark)}
export function cardEffect(s,id,e){let c=CARDS[id],close=!!(e&&c.close&&distance(s,e)<2),bonus=!close&&c.type==='قوس'&&s.boon==='bow'&&!s.boonUsed?3:0;return {...c,block:(c.block||0)+(c.rockBonus&&terrain(s.pos)==='rock'?c.rockBonus:0),dmg:(close?c.close:c.dmg)||0,close,bonus,push:close?c.push:0,label:close?'مقبض القوس':c.name}}
export function intent(s,e){if(s.ruleset==='lure'&&e.plan)return {...e.plan,move:e.plan.destination!==e.pos?1:0,range:e.id==='guard'?1:4};if(e.id==='guard'){let heavy=s.turn%3===0;return {damage:heavy?11:7,move:distance(s,e)>1?1:0,label:heavy?'طعنة ثقيلة':'تقدّم وطعن',range:1}}return {damage:s.turn%3===2?9:6,move:distance(s,e)<=1?1:0,label:s.turn%3===2?'شدُّ الوتر':'رمية قوس',range:4}}
function occupied(s,p){return s.enemies.some(e=>e.hp>0&&e.pos===p)}
export function movementTargets(s){if(s.phase!=='battle'||s.leaped||!s.hand.length||(s.ruleset==='lure'&&s.energy<1)||(s.ruleset==='lure'&&!s.hand.some(id=>!CARDS[id].unplayable)))return [];return [0,1,2,3,4].filter(p=>p!==s.pos&&Math.abs(p-s.pos)<=3&&!occupied(s,p))}
export function reason(s,id,e){
  let c=CARDS[id];if(!c)return 'بطاقة غير معروفة';if(s.phase!=='battle')return 'انتهت المواجهة';if(c.unplayable)return s.ruleset==='lure'?'الوَهَن لا يُلعب ولا يصلح ثمنًا للوثبة':'اطرح الوَهَن لتثب فوق الحصار';if(s.energy<c.cost)return 'طاقة غير كافية — يمكنك التجلّد';
  if(c.steady&&s.moved&&(!e||distance(s,e)>=2)){
    // A moving archer can still use the bow as a melee tool.
    if(e||!s.enemies.some(x=>x.hp>0&&distance(s,x)===1))return 'الرمي المشدود يتطلب الثبات؛ مقبض القوس يبقى متاحًا قرب خصم';
  }
  if(c.move){let p=s.pos+c.move;if(p<0||p>4)return 'طرف الوادي: استخدم وثبة العَدّاء لتبديل موضعك';if(occupied(s,p))return 'الخصم يسدّ الخطوة؛ وثبة العَدّاء تعبر فوقه'}
  if(s.ruleset==='lure'&&id==='wolf'&&e&&!isolated(s,e))return 'السِّيد لا ينقضّ على خصمين متجاورين؛ افصل الفريسة أولًا';
  if(targets(c)&&e){if(e.hp<=0)return 'هذا الخصم سقط';let d=distance(s,e);if(c.min&&d<c.min&&!c.close)return 'ابتعد عن الهدف أولًا';if(c.max&&d>c.max)return 'تحتاج الاشتباك؛ اقترب أو استخدم وثبة العَدّاء'}
  return '';
}
function addStrain(s,n){let previous=s.strain;s.strain=Math.max(0,s.strain+n);if(n>0&&s.strain>=4){s.discard.push('weary');log(s,'بلغت مشقّة الجسد حدّها: أُضيف وَهَن إلى المطروح.')}return previous}
function draw(s,n){while(n--){if(!s.deck.length){if(!s.discard.length)break;s.deck=shuffle(s,s.discard.splice(0));}s.hand.push(s.deck.pop())}}
function hit(s,e,amount,events,kind='hit'){e.hp=Math.max(0,e.hp-amount);events.push({kind,target:e.id,amount})}
function checkWin(s){if(s.enemies.every(e=>e.hp===0)){s.phase='victory';captureOpening(s);log(s,'أصبح المورد آمنًا. وفيت بعهد رفيقك.')}}
export function leap(s,index,destination){
  if(!Number.isInteger(index)||!s.hand[index])return {error:'اختر بطاقة تطرحها ثمنًا للوثبة'};
  if(s.ruleset==='lure'&&CARDS[s.hand[index]].unplayable)return {error:'الوَهَن لا يصلح ثمنًا؛ اختر مهارة تتخلّى عنها'};
  if(!movementTargets(s).includes(destination))return {error:'اختر موضعًا خاليًا مضاءً؛ الوثبة مرة كل دور'};
  let card=s.hand.splice(index,1)[0],from=s.pos;if(s.ruleset==='lure'){s.exhaust.push(card);if(s.turn===1)s.opening.burned.push(card);}else s.discard.push(card);s.pos=destination;s.leaped=true;s.moved=true;if(s.ruleset==='lure')s.energy--;else addStrain(s,1);log(s,`وثبة العَدّاء: ${s.ruleset==='lure'?'تخلّيت عن':'طرحت'} ${CARDS[card].name}${s.ruleset==='lure'?' لبقية المواجهة':''}، وتجاوزت ${Math.abs(from-destination)} مواضع. ${s.ruleset==='lure'?'−١ طاقة':' +١ إجهاد'}.`);return {events:[{kind:'move'}]};
}
export function drink(s){if(s.phase!=='battle'||s.waterUsed||s.water<1||s.energy<1||(!s.strain&&s.hp===s.maxHp))return {error:'تحتاج طاقة واحدة، ورشفة، وصحة ناقصة أو إجهادًا'};s.water--;s.waterUsed=true;s.energy--;s.hp=Math.min(s.maxHp,s.hp+3);s.strain=Math.max(0,s.strain-3);log(s,'رشفة من القِربة: استعَدت ٣ صحة وأزلت حتى ٣ إجهاد.');return {events:[{kind:'heal'}]}}
export function play(s,index,targetId){
  let id=s.hand[index],c=CARDS[id];if(!c)return {error:'بطاقة غير متاحة'};let e=s.enemies.find(e=>e.id===targetId);if(targets(c)&&!e)return {error:'اختر عدوًا'};let error=reason(s,id,e);if(error)return {error};
  let effect=cardEffect(s,id,e);s.energy-=c.cost;s.hand.splice(index,1);s.discard.push(id);s.played++;if(s.ruleset==='lure'&&s.turn===1)s.opening.cards.push(id);let events=[];
  if(c.move){s.pos+=c.move;s.moved=true;events.push({kind:'move'})}if(effect.block)s.block+=effect.block;if(c.strain)addStrain(s,c.strain);
  if(c.weak){e.weak+=c.weak;events.push({kind:'weak',target:e.id})}if(c.mark){e.marked=true;log(s,`قرأ السِّيد أثر ${e.name}؛ الفريسة معلّمة حتى الانقضاض.`)}
  if(c.dmg){let amount=effect.dmg+effect.bonus;if(effect.bonus)s.boonUsed=true;hit(s,e,amount,events);log(s,`${effect.label}: ${amount} ضرر على ${e.name}.`);
    if(effect.push&&e.hp>0){let p=e.pos+Math.sign(e.pos-s.pos);if(p>=0&&p<=4&&p!==s.pos&&!occupied(s,p)){e.pos=p;log(s,'دفعتَ الخصم بمقبض القوس وفتحتَ مسافة.')}else log(s,'تعذّر دفع الخصم: ظهره إلى عائق. ضربة المقبض أصابته.')}
    if((s.moved||e.marked||(s.ruleset==='lure'&&e.exposed))&&!s.wolfUsed&&e.hp>0&&(s.ruleset!=='lure'||isolated(s,e))){let bonus=s.boon==='wolf'&&!s.boonUsed?3:0;if(bonus)s.boonUsed=true;s.wolfUsed=true;e.marked=false;e.exposed=false;hit(s,e,5+bonus,events,'wolf');log(s,`السِّيد يتبع ${s.moved?'حركتك':'الأثر'} وينقضّ: ${5+bonus} ضرر إضافي.`)}
  }else if(!c.mark)log(s,`لعبت ${c.name}.`);
  if(c.recoverBow){let i=s.discard.findLastIndex(id=>CARDS[id].type==='قوس');if(i>=0){let recovered=s.discard.splice(i,1)[0];s.hand.push(recovered);log(s,`استعدت ${CARDS[recovered].name} من المطروح.`)}else draw(s,1)}if(c.draw)draw(s,c.draw);checkWin(s);return {events};
}
export function exert(s){if(s.phase!=='battle'||s.exerted)return false;s.exerted=true;s.energy+=2;addStrain(s,2);log(s,'تجلّدت: +٢ طاقة، +٢ إجهاد.');return true}
export function forecast(s){
  if(s.ruleset==='lure')return committedForecast(s);
  let copy=structuredClone(s),result=[];
  for(let e of copy.enemies.filter(e=>e.hp>0)){let i=intent(copy,e);if(i.move){let direction=e.id==='guard'?Math.sign(copy.pos-e.pos):Math.sign(e.pos-copy.pos),next=e.pos+direction;if(next>=0&&next<=4&&next!==copy.pos&&!occupied(copy,next))e.pos=next;}
    let inRange=distance(copy,e)<=i.range,cover=e.id==='archer'&&terrain(copy.pos)==='rock'?3:0,damage=inRange?Math.max(0,i.damage-e.weak-cover):0,blocked=Math.min(copy.block,damage);copy.block-=blocked;result.push({id:e.id,destination:e.pos,inRange,damage,blocked,hpLoss:damage-blocked,cover});
  }return result;
}
export function endTurn(s){
  if(s.phase!=='battle')return [];let events=[];let predicted=forecast(s);
  for(let f of predicted){let e=s.enemies.find(e=>e.id===f.id);e.pos=f.destination;s.block-=f.blocked;s.hp=Math.max(0,s.hp-f.hpLoss);s.damageTaken+=f.hpLoss;events.push({kind:'hurt',amount:f.hpLoss,blocked:f.blocked,source:e.id});if(s.ruleset==='lure')e.exposed=e.id==='guard'&&!f.inRange&&!f.interrupted;log(s,f.interrupted?`${e.name}: أُربك هجومه بتغيير موضعه.`:s.ruleset==='lure'&&!f.inRange?`${e.name}: أصاب المواضع المعلنة، لكن أثرك كان كاذبًا.${e.exposed?' اندفاعته تركته مكشوفًا.':''}`:f.inRange?`${e.name}: ${f.hpLoss} ضرر${f.blocked?`؛ اتّقيت ${f.blocked}`:''}${f.cover?'؛ الصخر حجب ٣':''}.`:`${e.name} يقترب؛ أنت خارج مداه.`);e.weak=0;if(!s.hp){s.phase='defeat';captureOpening(s);return events}}
  captureOpening(s);
  s.discard.push(...s.hand);s.hand=[];s.turn++;s.block=0;s.energy=3;s.moved=false;s.wolfUsed=false;s.exerted=false;s.leaped=false;s.waterUsed=false;draw(s,5);if(s.ruleset==='lure')commitPlans(s);return events;
}

// A bounded alternate encounter for testing commitment and opportunity cost.
function validPlan(p,turn){return p&&p.turn===turn&&Number.isInteger(p.origin)&&Number.isInteger(p.destination)&&p.origin>=0&&p.origin<=4&&p.destination>=0&&p.destination<=4&&Array.isArray(p.cells)&&p.cells.every(c=>Number.isInteger(c)&&c>=0&&c<=4)&&Number.isFinite(p.damage)&&p.damage>=0;}
export function isolated(s,e){return s.enemies.every(other=>other.id===e.id||other.hp<=0||Math.abs(other.pos-e.pos)>1);}
export function cardText(s,id){if(s.ruleset!=='lure')return CARDS[id].text;if(id==='weary')return 'لا يُلعب، ولا يصلح ثمنًا للوثبة.';if(id==='wolf')return '١٠ ضرر من السِّيد. يتطلب فريسة بعيدة عن رفيقها بأكثر من موضع.';if(id==='track')return 'علّم الفريسة واسحب بطاقة. انقضاضة السِّيد تتطلب عزل الهدف أولًا.';return CARDS[id].text;}
export function commitPlans(s){
  for(let e of s.enemies){if(e.hp<=0){e.plan=null;continue;}let destination=e.pos,cells,damage,label;
    if(e.id==='guard'){let dir=Math.sign(e.pos-s.pos)||1;destination=Math.max(0,Math.min(4,s.pos+dir));cells=[s.pos,s.pos+dir].filter(p=>p>=0&&p<=4);damage=s.turn===1||s.turn%3===0?11:7;label='اندفاع ملتزم';}
    else{if(distance(s,e)<=1){let next=e.pos+Math.sign(e.pos-s.pos);if(next>=0&&next<=4&&!occupied(s,next))destination=next;}let sweep=s.turn%2===1;cells=sweep?[0,1,2,3,4].filter(p=>p!==s.pos&&p!==e.pos):[s.pos];damage=s.turn%3===2?9:6;label=sweep?'تغطية الانسحاب':'رمية إلى الأثر';}
    e.plan={turn:s.turn,origin:e.pos,destination,cells,damage,label};
  }
}
function committedForecast(s){
  let copy=structuredClone(s),result=[];
  for(let e of copy.enemies.filter(e=>e.hp>0)){
    let plan=e.plan;if(!validPlan(plan,s.turn))throw new Error('Missing committed enemy plan');
    let interrupted=e.pos!==plan.origin,destination=interrupted?e.pos:plan.destination;
    if(destination===copy.pos){let fallback=destination+Math.sign(e.pos-destination);destination=fallback>=0&&fallback<=4&&!occupied(copy,fallback)?fallback:e.pos;}
    if(copy.enemies.some(other=>other.id!==e.id&&other.hp>0&&other.pos===destination))destination=e.pos;
    let inRange=!interrupted&&plan.cells.includes(copy.pos)&&(e.id!=='guard'||Math.abs(destination-copy.pos)<=1);
    e.pos=destination;let cover=e.id==='archer'&&terrain(copy.pos)==='rock'?3:0,damage=inRange?Math.max(0,plan.damage-e.weak-cover):0,blocked=Math.min(copy.block,damage);copy.block-=blocked;
    result.push({id:e.id,destination,inRange,damage,blocked,hpLoss:damage-blocked,cover,interrupted,cells:[...plan.cells]});
  }return result;
}

function captureOpening(s){if(s.ruleset!=='lure'||s.turn!==1||s.openingReport)return;s.openingReport={hpLost:s.damageTaken,hpLeft:s.hp,cards:[...s.opening.cards],burned:[...s.opening.burned],enemies:s.enemies.map(e=>({id:e.id,hp:e.hp,pos:e.pos,exposed:!!e.exposed})),pos:s.pos,strain:s.strain,energyLeft:s.energy};}
