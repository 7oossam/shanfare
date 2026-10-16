export const cards={
 run:{name:'عَدْو',icon:'↟',tag:'الحركة',text:'تقدّم ٣. مع الغنيمة: ٢. أو اقترب من رفيقك ١. إنذار +١.'},
 arrow:{name:'سهم',icon:'➶',tag:'القوس',text:'أصب الحرس بـ٢، أو عطّل حامل الغنيمة دورين. إنذار +١.'},
 knife:{name:'نصل',icon:'⚔',tag:'المجازفة',text:'أصب الحرس بـ٣ وتلقَّ ١، أو اقطع قيد رفيقك: إنقاذ +٢.'},
 cover:{name:'تغطية',icon:'◈',tag:'الصحبة',text:'احجب عنك ٥ ضرر، أو غطِّ رفيقك: إنقاذ +٢ واحجب عنه ٣.'},
 feint:{name:'تضليل',icon:'〰',tag:'الحيلة',text:'اخفض الإنذار ٢ واحجب عنك ٢ ضرر هذا الدور.'},
 breath:{name:'تدبير',icon:'↺',tag:'استعادة',text:'استعد بطاقة تختارها من الطابور. تدخل هذه البطاقة مكانها في الانتظار.'}
};
export const relics={
 recovery:{name:'نَفَس طويل',icon:'breath',rule:'تستعيد بطاقتين بدل واحدة بنهاية الدور.',before:'القاعدة: استعادة بطاقة واحدة',after:'قاعدتك: استعادة بطاقتين',flavor:'تستجمع قواك أسرع بين دفعات المطاردة.'},
 wind:{name:'نعل العَدّاء',icon:'run',rule:'بطاقة العَدْو لا تستهلك فعلًا؛ تظل تدخل طابور الاستعادة.',before:'القاعدة: كل بطاقة تستهلك فعلًا',after:'قاعدتك: العَدْو يكلف صفر أفعال',flavor:'تجري وتبقى لك القدرة على التصرف.'},
 blade:{name:'نصل لا يُغمد',icon:'knife',rule:'النصل يبقى جاهزًا في يدك بعد استخدامه. كل استخدام يستهلك فعلًا.',before:'القاعدة: البطاقة المستخدمة تدخل الطابور',after:'قاعدتك: النصل لا ينتظر',flavor:'يمكنك الضرب مرة أخرى ما دامت لك أفعال.'}
};
export const cardCost=(s,id)=>s.relic==='wind'&&id==='run'?0:1;
export const recoveryCount=s=>s.relic==='recovery'?2:1;
export const runDistance=s=>(s.phase==='retreat'||s.phase==='duel')&&s.loot?2:3;
export const canStep=s=>s.screen==='play'&&s.ap>0&&(s.phase!=='strike'||!s.loot&&!s.lootLost);
export const stages={approach:'الاقتراب',strike:'الغارة',retreat:'المطاردة',duel:'حارس الممر',end:'خاتمة الغارة'};
export function fresh(campaign=false){const state={v:1,screen:'title',phase:'approach',turn:1,ap:2,hp:16,friendHp:5,rescue:0,guards:4,alarm:0,progress:0,loot:false,lootLost:false,strikeTurns:0,pin:0,block:0,friendBlock:0,assist:false,ready:Object.keys(cards),queue:[],log:[],outcome:null};return campaign?{...state,v:2,campaign:true,encounter:1,relic:null,encounterResults:[]}:state;}
const cap=(n,a,b)=>Math.max(a,Math.min(b,n));
export function damage(s){if(s.screen!=='play')return 0;return Math.max(0,(s.phase==='approach'?(s.guards>0?1:0):s.phase==='strike'||s.phase==='duel'?1+Math.ceil(s.guards/2):2)+Math.floor(s.alarm/3)-s.block);}
export function goal(s){return s.phase==='approach'?3:s.phase==='strike'?4:6;}
function note(s,t){s.log.unshift(t);s.log=s.log.slice(0,5);}
function finishEncounter(s){const outcome=s.loot&&s.rescue>=3&&s.friendHp>0?'full':s.loot?'loot':s.rescue>=3&&s.friendHp>0?'friend':'alone';s.phase='end';s.outcome=outcome;
 if(s.campaign){s.encounterResults.push({encounter:s.encounter,outcome,hp:s.hp,turn:s.turn,loot:s.loot,companion:s.rescue>=3&&s.friendHp>0});s.screen=s.encounter===1?'reward':'end';}else s.screen='end';
 note(s,s.screen==='reward'?'نجوت بالغارة الأولى. اختر أثرًا للمواجهة التالية.':'بلغت المخبأ.');}
function progress(s,n){s.progress+=n;if(s.phase==='approach'&&s.progress>=3){s.phase='strike';s.progress=0;note(s,'بلغتما القافلة. رفيقك محاصر؛ حامل الزاد يتحرك.');}else if(s.phase==='strike'&&s.progress>=4&&!s.lootLost){s.loot=true;s.progress=4;note(s,'أخذت الزاد. صار العَدْو به أبطأ.');}else if((s.phase==='retreat'||s.phase==='duel')&&s.progress>=6){finishEncounter(s);}}
export function options(s,id){if(s.phase==='end'||s.screen!=='play'||s.ap<cardCost(s,id)||!s.ready.includes(id))return [];const out=[];const add=(target,label,detail)=>out.push({target,label,detail});
 if(id==='run'){if(s.phase!=='strike'||!s.loot&&!s.lootLost)add('move',s.phase==='strike'?'الحق بالغنيمة':'اعبر الطريق',`تقدّم ${runDistance(s)} · إنذار +١`);if(s.phase==='strike'&&s.rescue<3&&s.friendHp>0)add('friend','بلوغ رفيقك','إنقاذ +١ · إنذار +١');}
 if(id==='arrow'){if(s.guards>0&&s.phase!=='retreat')add('guard','رمي الحرس','قوة الحرس −٢ · إنذار +١');if(s.phase==='strike'&&!s.loot&&!s.lootLost)add('carrier','تعطيل حامل الغنيمة','لا تتراجع مسافة الغنيمة لنهايتَي دور · إنذار +١');if(s.phase==='retreat')add('pursuit','صدّ المطاردين','حجب ٤ هذا الدور · إنذار +١');}
 if(id==='knife'){if(s.guards>0&&s.phase!=='retreat')add('guard','مهاجمة الحرس','قوة الحرس −٣ · صحتك −١');if(s.phase==='strike'&&s.rescue<3&&s.friendHp>0)add('friend','قطع القيد','إنقاذ +٢');}
 if(id==='cover'){add('self','احمِ نفسك','حجب ٥ هذا الدور');if(s.phase==='strike'&&s.rescue<3&&s.friendHp>0)add('friend','غطِّ خروج رفيقك','إنقاذ +٢ · حجب ٣ عن رفيقك');}
 if(id==='feint')add('self','ضلّل المطاردين','إنذار −٢ · حجب ٢ هذا الدور');
 if(id==='breath')for(const q of s.queue)add(q,`استعد «${cards[q].name}»`,'تعود ليدك الآن؛ التدبير ينتظر في الطابور');return out;}
export function apply(state,a){const s=structuredClone(state);
 if(s.screen==='reward'){if(a.type!=='relic'||!relics[a.relic])return s;s.relic=a.relic;s.encounter=2;s.screen='play';s.phase='duel';s.outcome=null;s.hp=Math.min(16,s.hp+6);s.guards=8;s.alarm=1;s.progress=0;s.ap=2;s.pin=0;s.block=0;s.friendBlock=0;s.strikeTurns=0;s.ready=Object.keys(cards);s.queue=[];s.assist=s.rescue>=3&&s.friendHp>0;s.turn++;note(s,`اخترت ${relics[s.relic].name}. استعدت حتى ٦ صحة. حارس الممر أمامك.`);return s;}
 if(a.type==='start'){if(s.screen==='title')s.screen='play';return s;}if(s.screen!=='play'||s.phase==='end')return s;
 if(a.type==='play'){if(!options(s,a.card).some(o=>o.target===a.target))return s;const id=a.card;if(!(s.relic==='blade'&&id==='knife')){s.ready=s.ready.filter(c=>c!==id);s.queue.push(id);}s.ap-=cardCost(s,id);note(s,`استخدمت ${cards[id].name}.`);
 if(id==='run'){s.alarm=cap(s.alarm+1,0,6);if(a.target==='friend')s.rescue=cap(s.rescue+1,0,3);else progress(s,runDistance(s));}
 if(id==='arrow'){s.alarm=cap(s.alarm+1,0,6);if(a.target==='guard')s.guards=Math.max(0,s.guards-2);else if(a.target==='carrier')s.pin=2;else s.block+=4;}
 if(id==='knife'){if(a.target==='guard'){s.guards=Math.max(0,s.guards-3);s.hp--;}else s.rescue=cap(s.rescue+2,0,3);}
 if(id==='cover'){if(a.target==='self')s.block+=5;else {s.rescue=cap(s.rescue+2,0,3);s.friendBlock+=3;}}
 if(id==='feint'){s.alarm=Math.max(0,s.alarm-2);s.block+=2;}
 if(id==='breath'){s.queue=s.queue.filter(c=>c!==a.target);s.ready.push(a.target);}
 if(s.rescue>=3&&s.friendHp>0&&!state.assist&&state.rescue<3){s.assist=true;note(s,'رفيقك معك. يمكنه تغطيتك أو مساعدتك في العبور مرة واحدة.');}
 }else if(a.type==='step'&&canStep(s)){s.ap--;progress(s,1);note(s,'تقدّمت بحذر.');}
 else if(a.type==='assist'&&s.assist){s.assist=false;if(a.target==='move')progress(s,1);else s.block+=3;note(s,'ساندك رفيقك.');}
 else if(a.type==='retreat'&&s.phase==='strike'){s.phase='retreat';s.progress=0;note(s,s.rescue>=3?'بدأتما العودة.':'بدأت العودة؛ بقي رفيقك خلفك.');}
 else if(a.type==='drop'&&(s.phase==='retreat'||s.phase==='duel')&&s.loot){s.loot=false;s.lootLost=true;note(s,'تركت الغنيمة لتخفّ خطواتك.');}
 else if(a.type==='end'){
 const d=damage(s);s.hp=Math.max(0,s.hp-d);note(s,`تلقّيت ${d} ضرر.`);
 if(s.phase==='strike'){s.strikeTurns++;if(s.rescue<3){s.friendHp=Math.max(0,s.friendHp-Math.max(0,1-s.friendBlock));if(!s.friendHp)note(s,'سقط رفيقك.');}if(!s.loot&&!s.lootLost){if(!s.pin)s.progress=Math.max(0,s.progress-1);if(s.strikeTurns>=5){s.lootLost=true;s.progress=0;note(s,'ابتعدت القافلة بالزاد. بقي طريق العودة.');}}}
 s.pin=Math.max(0,s.pin-1);s.alarm=cap(s.alarm+1,0,6);s.block=0;s.friendBlock=0;s.ap=2;s.turn++;for(let i=0;i<recoveryCount(s)&&s.queue.length;i++){const id=s.queue.shift();s.ready.push(id);note(s,`استعدت ${cards[id].name}.`);}
 }else return s;
 if(s.hp>0&&s.screen==='play'&&s.phase==='duel'&&s.guards<=0)finishEncounter(s);
 if(s.hp<=0){s.hp=0;s.phase='end';s.screen='end';s.outcome='dead';note(s,'أدركك المطاردون.');}return s;}
export function assertState(s){const z=[...s.ready,...s.queue];if(z.length!==6||new Set(z).size!==6||z.some(c=>!cards[c]))throw Error('Invalid card zones');if(s.ap<0||s.ap>2||s.hp<0||s.alarm<0||s.alarm>6)throw Error('Invalid resources');return true;}
