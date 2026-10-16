(function() {
  'use strict';
  // --- icons.mjs ---
const paths={sound:'M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14',mute:'M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6',swap:'M3 7h17M16 3l4 4-4 4M21 17H4M8 13l-4 4 4 4',heart:'M12 21S2 15 2 8c0-6 8-7 10-2 2-5 10-4 10 2 0 7-10 13-10 13z',bag:'M8 3h8l-2 5 5 5c5 9-19 9-14 0l5-5zM9 8h6M9 15h6',cave:'M2 21l3-12 7-6 7 6 3 12H2zM8 21v-8l4-3 4 3v8',moon:'M20 15A9 9 0 0 1 9 4 9 9 0 1 0 20 15z',foot:'M7 3c-4 0-5 9-2 11 4 2 7-8 2-11zM18 10c-4 0-6 10-2 11 4 1 6-10 2-11zM4 17v3M15 5v2',chain:'M9 8l2-3c5-5 12 2 7 7l-3 2M15 16l-2 3C8 24 1 17 6 12l3-2M8 16l8-8',sneak:'M3 16c4-9 6 6 10-3s5 0 8-7M5 21h4M14 21h4',bow:'M4 3c21 2 21 16 0 18L15 12 4 3zM3 12h18M18 9l3 3-3 3',run:'M5 19l5-6 4 2 5-8M10 13l-1-5 5-3 3 3 4 1M9 8l-4 2M14 15l-1 6',arrow:'M4 20L20 4M12 4h8v8M4 14v6h6',knife:'M5 19l5-5M8 16l-3-3M10 14l8-10 2 2-6 10z',cover:'M12 3l8 3v6c0 5-8 9-8 9s-8-4-8-9V6zM8 11l3 3 5-6',feint:'M3 8c8-12 8 18 18 6M3 14c8-12 8 10 18-6',friend:'M9 6a3 3 0 1 0 6 0a3 3 0 1 0-6 0M6 21v-7c0-5 12-5 12 0v7M9 15v6M15 15v6',grid:'M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18'};
const icon=id=>`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[id]||paths.grid}"/></svg>`;


// --- engine.mjs ---
const VERSION='shanfara-nexus-v7';
const cards={
 run:{name:'خَبَبُ العَدَّاء',icon:'run',short:'تقدّم ٢',text:'تقدّم خطوتين في سُرَى الليل؛ خَبَبٌ كعدو الذئب نحو الزاد والمأمن.',effects:[{op:'move',n:2}]},
 arrow:{name:'هَتَافُ العَيْطَل',icon:'bow',short:'أصب ٢',text:'ترنُّ القوس الهتوف بضررين في نحر الحارس. تتعاظم إن سبقتها مراوغة في الخط.',effects:[{op:'hit',n:2}]},
 knife:{name:'حَدُّ الإصْلِيت',icon:'knife',short:'أصب ٣ · جرح ١',text:'تُجرّد الأبيض الإصليت بثلاثة أضرار وتجرح يدك؛ ألم الجرح لازم لكبرياء الصعلوك.',effects:[{op:'hurt',n:1},{op:'hit',n:3}]},
 cover:{name:'عِيَاذُ الصَّفَا',icon:'cover',short:'صدّ ٣',text:'تلوذ بحيد صخرٍ أصم؛ تمنع ثلاثة أضرار من بطش الحارس هذا الدور.',effects:[{op:'block',n:3}]},
 trick:{name:'رَوَاغُ الزُّهْلُول',icon:'feint',short:'صدّ ١ · هجوم بعدي بالخط +٢',text:'تزوغ كالنمر الأرقط؛ تصدّ ضررًا، ويزيد أول هجوم بعدها في الخط بضررين حتى نهاية التفعيل.',effects:[{op:'block',n:1},{op:'prime',n:2}]},
 friend:{name:'وَفَاءُ الرَّهْط',icon:'friend',short:'فكّ قيدًا واحدًا',text:'«لا الجاني بما جرّ يُخذل»؛ تفكّ قيدًا من قيود رفيقك الثلاثة. بعد تحريره تصبح «دِرْعُ الرَّفِيق».',effects:[{op:'friend',n:1}]},
 shift:{name:'حِيلَةُ التَّحَوُّل',icon:'swap',short:'بدّل الخانتين الأخريين · تُطرح',text:'«إلا أنما أتحوّل»؛ تبدّل بطاقتي الخانتين الأخريين بالخط قبل التنفيذ، ثم تُطرح بعده.',effects:[{op:'vanish',n:1}]},
 shelter:{name:'مَلاذُ الجَلْمَد',icon:'cover',short:'صدّ ٣',text:'تربض خلف حيد صخري منيع يصدّ ثلاثة أضرار في كل تفعيل ما دامت على الشبكة.',effects:[{op:'block',n:3}]},
 sneak:{name:'دَبِيبُ السِّيد',icon:'sneak',short:'تقدّم ١ · صدّ ٢',text:'تدبّ كذئبٍ خميص البطن؛ تخطو للأمام وتتّقي ضررين في كل تفعيل.',effects:[{op:'move',n:1},{op:'block',n:2}]},
 ambush:{name:'كَمِينُ الشِّعْب',icon:'bow',short:'أصب ٤ قبل فراغ؛ وإلا ١',text:'مباغتة من شعاب الجبل؛ إن كانت الخانة التالية فارغة تصيب بأربعة أضرار، وإلا بضرر واحد.',effects:[{op:'ambush',n:4}]},
 erase:{name:'عَفَاءُ الأَثَر',icon:'foot',short:'تقدّم ١ · تُطرح وحدها',text:'تتقدّم خطوة وتطمس أثرك عن القوم؛ تُطرح وحدها لتفتح خانتها لإعادة البناء.',effects:[{op:'move',n:1},{op:'vanish',n:1}]}
};
const alternates={
 run:{name:'وَثْبَةُ العَدَّاء',icon:'run',short:'تقدّم ٣ · تُطرح',text:'«أعدى من الشنفرى»؛ تثبُ ثلاث خُطى تُسابق الخيل وتطرح البطاقة ثمناً للسرعة الخاطفة.',effects:[{op:'move',n:3},{op:'vanish',n:1}]},
 arrow:{name:'مَنْأَى الكَرِيم',icon:'foot',short:'تقدّم ٢ · تُطرح',text:'«وفي الأرض منأى للكريم»؛ تفتح خطوتين للعبور وتطرح رمايتك لتفسح موضع الخُطى.',effects:[{op:'move',n:2},{op:'vanish',n:1}]},
 knife:{name:'اقْتِحَامُ الوَعْر',icon:'run',short:'تقدّم ٢ · جرح ١',text:'تطأ شوك السَّراة الدامي؛ تخسر صحة وتتقدّم خطوتين في وعور الجبال بدل النزال.',effects:[{op:'hurt',n:1},{op:'move',n:2}]},
 cover:{name:'حَذَرُ السَّارِي',icon:'cover',short:'تقدّم ١ · صدّ ١',text:'تخطو في دجى الليل كذئبٍ وجل؛ تتقدّم خطوة وتتّقي ضرراً واحداً في كل تفعيل.',effects:[{op:'move',n:1},{op:'block',n:1}]},
 trick:{name:'انْسِلالُ الغَبَش',icon:'sneak',short:'تقدّم ١ · صدّ ٢ · تُطرح',text:'تنسلّ في غبش الفجر بين الصخور؛ تخطو خطوة وتصدّ ضررين، ثم تتوارى وتُطرح البطاقة.',effects:[{op:'move',n:1},{op:'block',n:2},{op:'vanish',n:1}]},
 friend:{name:'عَزْمُ السُّرَى',icon:'foot',short:'تقدّم ٢ · تُطرح',text:'تؤثر شقّ مسلك النجاة العاجل بخطوتين للأمام وتطرح البطاقة، مؤجلاً فكّ القيود.',effects:[{op:'move',n:2},{op:'vanish',n:1}]},
 shift:{name:'صِدْقُ الزِّمَاع',icon:'feint',short:'الهجوم التالي بالخط +٣ · تُطرح',text:'«مضاءٌ لا تردد فيه»؛ تشحذ عزماً قاطعاً يزيد الهجوم التالي بالخط نفسه بثلاثة أضرار ثم تُطرح.',effects:[{op:'prime',n:3},{op:'vanish',n:1}]},
 shelter:{name:'أَثَرُ السَّاتِر',icon:'cover',short:'ساتر ١ لاحقًا · تُطرح',text:'تُطرح وتخلّف وراءك أثر صخرةٍ تمنح ساتراً يصدّ ضرراً في التفعيلات اللاحقة.',effects:[{op:'ward',n:1},{op:'vanish',n:1}]},
 ambush:{name:'دَعْسُ النَّمْشَاء',icon:'run',short:'تقدّم ٣ · جرح ١ · تُطرح',text:'«وأدعس في نمشائها غير أعزل»؛ تخسر صحة وتقتحم ثلاث خطوات عاجلة نحو المأمن ثم تُطرح.',effects:[{op:'hurt',n:1},{op:'move',n:3},{op:'vanish',n:1}]},
 erase:{name:'لُبُوثُ الظِّلال',icon:'sneak',short:'صدّ ٢ · الهجوم التالي +١',text:'تلبث في سواد الليل متوارياً؛ تصدّ ضررين وتقوّي الهجوم اللاحق في الخط بضررٍ واحد.',effects:[{op:'block',n:2},{op:'prime',n:1}]},
 sneak:{name:'انْقِضَاضُ السِّيد',icon:'knife',short:'أصب ٢ · تقدّم ١ · تُطرح',text:'وثبة الذئب الكاسر؛ تصيب الحارس بضررين وتتقدّم خطوة، ثم تُطرح البطاقة.',effects:[{op:'hit',n:2},{op:'move',n:1},{op:'vanish',n:1}]}
};
const rewards={keep:{label:'ثباتٌ على التدبير الحالي'},ambush:{label:'كَمِينُ الشِّعْب'},erase:{label:'عَفَاءُ الأَثَر'},shelter:{label:'مَلاذُ الجَلْمَد'}};
const type=uid=>uid?.split('.')[0];
const cardType=(uid,s)=>s?.upgrades?.[uid]||type(uid);
function def(uid,s,face=s?.faces?.[uid]??0){const k=cardType(uid,s),c=face===1?alternates[k]:cards[k];if(face===1)return c;if(k==='friend'&&s?.encounter===2&&s.friend<3)return {...c,name:'وَحْشَةُ المُنْفَرِد',short:'تقدّم ١',text:'«وَلِي دُونَكُمْ أَهْلُونَ»؛ بقي رفيقك في قيود الوادي، تتقدّم خطوة وحدك مستغنياً.',effects:[{op:'move',n:1}]};return k==='friend'&&s?.friend===3?{...c,name:'دِرْعُ الرَّفِيق',short:'صدّ ٢',text:'«وفاء الصاحب»؛ رفيقك طليقٌ معك ويصدّ عنك ضربة الحارس بضررين.',effects:[{op:'block',n:2}]}:c;}
const ids=['run','arrow','knife','cover','trick','friend'].flatMap(k=>k==='knife'?['knife.0','shift.0']:[k+'.0',k+'.1']);
function random(s){s.rng=(Math.imul(s.rng,1664525)+1013904223)>>>0;return s.rng/4294967296;}
function shuffle(s,a){for(let i=a.length-1;i>0;i--){const j=Math.floor(random(s)*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function draw(s){while(s.hand.length<4){if(!s.draw.length){if(!s.discard.length)break;s.draw=shuffle(s,s.discard.splice(0));}s.hand.push(s.draw.shift());}}
const trailCells=[0,4,8];
function fresh(seed=20261016){const s={v:7,version:VERSION,faces:{},encounter:1,phaseTurn:1,firstResult:null,upgrades:{},rewardClaimed:false,wards:Array(9).fill(false),screen:'title',seed:seed>>>0,rng:seed>>>0,turn:1,hp:18,enemy:12,progress:0,loot:false,friend:0,grid:Array(9).fill(null),hand:['run.1','arrow.0','knife.0','friend.0'],draw:[],discard:[],outcome:null,last:null};s.grid[0]='run.0';s.grid[4]='cover.0';s.draw=shuffle(s,ids.filter(id=>!s.grid.includes(id)&&!s.hand.includes(id)));return s;}
function lineIndices(cell,axis){return axis==='row'?[0,1,2].map(c=>Math.floor(cell/3)*3+c):[0,1,2].map(r=>r*3+cell%3);}
const goal=s=>s.encounter===2?8:12;
const collapseRow=s=>s.encounter===2?[2,1,0][(s.phaseTurn-1)%3]:null;
function incoming(s){return s.encounter===2?1+(s.enemy>0?2:0)+(s.firstResult?.enemy>0?1:0):s.enemy<=0?0:2+Math.ceil(s.enemy/6);}
function enterSecond(s){s.encounter=2;s.phaseTurn=1;s.turn++;s.progress=0;s.enemy=6;for(const uid of s.grid)if(uid)s.discard.push(uid);s.grid=Array(9).fill(null);s.faces={};s.wards=Array(9).fill(false);s.outcome=null;s.screen='play';draw(s);}
function placementValid(s,a){return s.screen==='play'&&s.hand.includes(a.card)&&Number.isInteger(a.cell)&&a.cell>=0&&a.cell<9&&!s.grid[a.cell]&&['row','col'].includes(a.axis);}
function stage(s,a){const grid=s.grid.slice(),wards=s.wards.slice(),faces={...s.faces},swaps=[],erasedWards=[];if(!placementValid(s,a))return {grid,wards,faces,swaps,erasedWards};if(wards[a.cell])erasedWards.push(a.cell);wards[a.cell]=false;grid[a.cell]=a.card;faces[a.card]=a.face??0;if(faces[a.card]===0&&cardType(a.card,s)==='shift'){const [x,y]=lineIndices(a.cell,a.axis).filter(i=>i!==a.cell);[grid[x],grid[y]]=[grid[y],grid[x]];swaps.push({from:x,to:y});for(const i of [x,y])if(grid[i]&&wards[i]){wards[i]=false;erasedWards.push(i);}}return {grid,wards,faces,swaps,erasedWards};}
function valid(s,a){if(s.screen==='interlude')return a.kind==='continue';if(s.screen==='reward')return a.kind==='reward'&&Object.hasOwn(rewards,a.choice)&&(a.choice==='keep'?!a.replace:s.hand.includes(a.replace));return placementValid(s,a)&&!a.trace&&!a.recall&&!a.shelter&&(a.face===undefined||a.face===0||a.face===1);}
function actions(s){if(s.screen==='interlude')return [{kind:'continue'}];if(s.screen==='reward')return [{kind:'reward',choice:'keep'},...Object.keys(rewards).filter(k=>k!=='keep').flatMap(choice=>s.hand.map(replace=>({kind:'reward',choice,replace})))];if(s.screen!=='play')return [];return s.hand.flatMap(card=>s.grid.flatMap((u,cell)=>u?[]:['row','col'].flatMap(axis=>[0,1].map(face=>({card,cell,axis,face})))));}
function activate(state,a){if(!valid(state,a))return {state:structuredClone(state),valid:false};const s=structuredClone(state);
 if(s.screen==='interlude'){if(!s.rewardClaimed)s.screen='reward';else enterSecond(s);const summary={action:structuredClone(a),kind:'transition',line:[],effects:[],cleared:[],vanished:[],block:0,hits:0,moves:0,selfDamage:0,enemyDamage:0,log:['خلّفتَ الوادي وراءك واقتحمتَ ممرّ الشِّعب المنهار، وليلُ السَّراة يُطوى على أثرك.']};s.last=summary;assertState(s);return {state:s,valid:true,summary};}
 if(s.screen==='reward'){const uid=a.choice==='keep'?null:a.replace;if(uid)s.upgrades[uid]=a.choice;s.rewardClaimed=true;s.screen='play';if(s.firstResult&&s.encounter===1)enterSecond(s);const summary={action:structuredClone(a),kind:'reward',upgrade:a.choice,uid,line:[],effects:[],cleared:[],vanished:[],block:0,hits:0,moves:0,selfDamage:0,enemyDamage:0,anticipated:0,friendSaved:false,traceLeft:null,log:[uid?'أحكمتَ خطتك بأسلوبٍ جديد من مكائد الصعاليك.':'ثبتَّ على تدبيرك الأول دون تبديل في اليد.']};s.last=summary;assertState(s);return {state:s,valid:true,summary};}
 const log=[],effects=[],beforeFriend=s.friend,staged=stage(state,a),erasedWard=staged.erasedWards.length>0;s.hand.splice(s.hand.indexOf(a.card),1);s.grid=staged.grid;s.wards=staged.wards;s.faces=staged.faces;if(staged.swaps.length)log.push('«إلا أنما أتحوّل».. تبدّلت الخانتان بحيلة التحوّل قبل حلول الأفعال.');
 const cells=lineIndices(a.cell,a.axis),line=cells.filter(i=>s.grid[i]).map(i=>({cell:i,uid:s.grid[i],face:s.faces[s.grid[i]]??0,name:def(s.grid[i],s).name}));let block=0,prime=0,hits=0,moves=0,selfDamage=0;const disappear=[],wardSeeds=[];
 function move(amount){const old=s.progress;s.progress=Math.min(goal(s),s.progress+amount);moves+=s.progress-old;if(s.encounter===1&&!s.loot&&s.progress>=4){s.loot=true;log.push('«وإن مُدّت الأيدي إلى الزاد».. ظفرتَ بزاد الرحلة؛ بقي أن تبلغ به المأمن.');}return s.progress-old;}
 for(let pos=0;pos<cells.length;pos++){const cell=cells[pos],uid=s.grid[cell];if(!uid){if(trailCells.includes(cell))effects.push({cell,uid:null,op:'trail',amount:move(1)});if(s.wards[cell]){block++;effects.push({cell,uid:null,op:'ward',amount:1});}continue;}
 for(const fx of def(uid,s).effects){let amount=fx.n,boost=0;
 if(fx.op==='move')amount=move(amount);
 else if(fx.op==='hit'||fx.op==='ambush'){if(fx.op==='ambush')amount=pos<2&&!s.grid[cells[pos+1]]?4:1;boost=prime;amount=Math.min(s.enemy,amount+prime);prime=0;s.enemy-=amount;hits+=amount;}
 else if(fx.op==='hurt'){s.hp=Math.max(0,s.hp-amount);selfDamage+=amount;}
 else if(fx.op==='block')block+=amount;
 else if(fx.op==='prime')prime+=amount;
 else if(fx.op==='friend'){if(s.friend<3)s.friend=Math.min(3,s.friend+amount);else{block+=2;amount=2;}}
 else if(fx.op==='ward')wardSeeds.push(cell);
 else if(fx.op==='vanish')disappear.push(cell);
 effects.push({cell,uid,op:fx.op,amount,...(boost?{boost}:{})});}}
 const cleared=line.length===3?line.map(x=>x.uid):[],vanished=[];for(const i of cells){if(s.grid[i]&&(cleared.length||disappear.includes(i))){if(!cleared.length)vanished.push(s.grid[i]);if(wardSeeds.includes(i))s.wards[i]=true;s.discard.push(s.grid[i]);delete s.faces[s.grid[i]];s.grid[i]=null;}}
 if(wardSeeds.length)log.push('أقمتَ ساترَ صخرٍ وراءك يصدّ عنك في الكرّة القادمة.');if(erasedWard)log.push('غطّت خُطوتك موضعَ الصخرة؛ زال ستر الخانة.');
 const anticipated=Math.max(0,incoming(s)-block);let enemyDamage=0;const collapsed=[],collapsedCells=[];const completed=s.encounter===1?(s.progress>=12||s.loot&&s.friend===3&&s.enemy===0):s.progress>=goal(s);
 if(s.hp<=0){s.outcome='dead';s.screen='end';}
 else if(completed){if(s.encounter===1){s.firstResult={turn:s.turn,hp:s.hp,enemy:s.enemy,friend:s.friend,loot:s.loot,route:s.enemy===0?'clear':'escape'};if(s.turn>=20){s.screen='end';s.outcome='caught';}else{s.screen='interlude';log.push(s.enemy===0?'أحكمتَ الغارة: ظفرتَ بالزاد وحرّرتَ رفيقك وأسقطتَ الحارس صريعاً!':'أفلتَّ من ملاحقة الحارس بكرامةِ الصعلوك نحو الشِّعب.');}}else{s.outcome=s.friend===3?'full':'supplies';s.screen='end';log.push('«كأنما نفضتُ غبار الريح عن جيدِ أجدلِ».. عبرتَ الشِّعبَ إلى المأمن حراً عزيزاً.');}}
 else{enemyDamage=Math.min(s.hp,anticipated);s.hp-=enemyDamage;if(s.encounter===2){const row=collapseRow(s);for(let i=row*3;i<row*3+3;i++){collapsedCells.push(i);if(s.grid[i]){collapsed.push(s.grid[i]);s.discard.push(s.grid[i]);delete s.faces[s.grid[i]];s.grid[i]=null;}s.wards[i]=false;}log.push('تداعى جدار الشِّعب؛ هوت صخوره وطُرحت بطاقات الصف وزالت سواتره.');}if(s.hp<=0){s.outcome='dead';s.screen='end';}else if(s.turn>=20){s.outcome='caught';s.screen='end';log.push('«والليلُ مقمرٌ.. فانصدع الصبحُ»؛ أدركك الفجر وانكشفت المسالك قبل بلوغ المخبأ.');}else{s.turn++;s.phaseTurn++;draw(s);if(s.encounter===1&&s.loot&&!s.rewardClaimed)s.screen='reward';}}
 s.last={action:structuredClone(a),kind:'turn',line,effects,cleared,vanished,block,hits,moves,selfDamage,enemyDamage,anticipated,friendSaved:beforeFriend<3&&s.friend===3,traceLeft:wardSeeds.length?line.find(x=>wardSeeds.includes(x.cell))?.uid:null,erasedWard,erasedWards:staged.erasedWards,collapsed,collapsedCells,swaps:staged.swaps,unusedPrime:prime,log};assertState(s);return {state:s,valid:true,summary:s.last};}
function start(s){return s.screen==='title'?{...structuredClone(s),screen:'play'}:s;}
function assertState(s){const zones=[...s.hand,...s.draw,...s.discard,...s.grid.filter(Boolean)];if(zones.length!==12||new Set(zones).size!==12||zones.some(u=>!ids.includes(u)))throw Error('Card zone corruption');if(s.wards.length!==9||s.wards.some((v,i)=>typeof v!=='boolean'||v&&s.grid[i])||s.grid.length!==9||s.hand.length>4||s.hp<0||s.hp>18||s.enemy<0||s.enemy>12||s.friend<0||s.friend>3||s.progress<0||s.progress>12||Object.entries(s.upgrades).some(([uid,k])=>!ids.includes(uid)||!['ambush','erase','shelter'].includes(k))||Object.keys(s.upgrades).length>1)throw Error('Invalid resources');if(!['title','play','reward','interlude','end'].includes(s.screen)||s.screen==='reward'&&(!s.loot||s.rewardClaimed))throw Error('Invalid screen');if(Object.entries(s.faces).some(([uid,f])=>!s.grid.includes(uid)||![0,1].includes(f)))throw Error('Invalid committed face');if(![1,2].includes(s.encounter)||!Number.isInteger(s.phaseTurn)||s.phaseTurn<1||s.encounter===2&&!s.firstResult||s.screen==='interlude'&&!s.firstResult)throw Error('Invalid journey');if(s.screen==='play'&&!s.grid.includes(null))throw Error('No placement');return true;}
function snapshot(s){const {last,...rest}=s;return structuredClone(rest);}


// --- combos.mjs ---

// Presentation evidence derived from resolved effects; this does not change the rules.
function comboModel(s,a,result=activate(s,a)){
 if(!result.valid||result.summary.kind!=='turn')return {steps:[],links:[],expired:[],ambushes:[],swaps:[]};
 const {grid,faces}=stage(s,a),shown={...s,faces},cells=lineIndices(a.cell,a.axis),effects=result.summary.effects,links=[],ambushes=[];let pending=[];
 for(const fx of effects){if(fx.op==='prime')pending.push({uid:fx.uid,name:def(fx.uid,shown).name,cell:fx.cell,amount:fx.amount});if(fx.op==='hit'||fx.op==='ambush'){
 const pos=cells.indexOf(fx.cell),next=pos<2?cells[pos+1]:null,open=next!==null&&!grid[next],base=fx.op==='ambush'?(open?4:1):cardType(fx.uid,s)==='knife'?3:2;
 if(fx.op==='ambush')ambushes.push({uid:fx.uid,cell:fx.cell,next,open,base,damage:fx.amount});
 if(pending.length){links.push({sources:pending,target:fx.uid,targetName:def(fx.uid,shown).name,cell:fx.cell,base,boost:fx.boost||0,power:base+(fx.boost||0),damage:fx.amount});pending=[];}
 }}
 return {totals:result.summary,steps:cells.map(cell=>({cell,uid:grid[cell],name:grid[cell]?def(grid[cell],shown).name:effects.some(e=>e.cell===cell&&e.op==='ward')?'ساتر':effects.some(e=>e.cell===cell&&e.op==='trail')?'درب':'فراغ',effects:effects.filter(e=>e.cell===cell)})),links,expired:pending,ambushes,swaps:result.summary.swaps||[]};
}
function comboHints(s,card,face=0){const hints={};for(const a of actions(s)){if(a.card!==card||a.face!==face)continue;const x=activate(s,a),m=comboModel(s,a,x);if(m.links.length){const boost=m.links.reduce((n,l)=>n+l.boost,0);(hints[a.cell]??=[]).push({axis:a.axis,boost,targets:m.links.map(l=>l.target)});}}return hints;}


// --- report.mjs ---

const begin=s=>({version:VERSION,runId:globalThis.crypto?.randomUUID?.()||String(Date.now()),startedAt:new Date().toISOString(),coverage:'complete',initial:snapshot(s),events:[],final:snapshot(s)});
function record(r,before,action,result){const alternatives=actions(before).map(a=>{const x=activate(before,a);return {action:a,after:snapshot(x.state),summary:x.summary};});const after=snapshot(result.state);return {...r,events:[...r.events,{index:r.events.length+1,at:new Date().toISOString(),before:snapshot(before),action,after,summary:result.summary,alternatives}],final:after,endedAt:after.screen==='end'?new Date().toISOString():null};}
function restore(raw,s){try{if(raw?.version===VERSION&&JSON.stringify(raw.final)===JSON.stringify(snapshot(s))){let state=raw.initial;for(const e of raw.events){if(JSON.stringify(snapshot(state))!==JSON.stringify(e.before))throw Error();state=activate(state,e.action).state;if(JSON.stringify(snapshot(state))!==JSON.stringify(e.after))throw Error();}if(JSON.stringify(snapshot(state))!==JSON.stringify(raw.final))throw Error();return raw;}}catch{}return {...begin(s),coverage:'partial'};}
function exported(r){return {...r,game:'الشنفرى — شبكة التدبير',cardDefinitions:cards,alternateDefinitions:alternates,rewardDefinitions:rewards,rules:{grid:'3x3; place one hand card into an empty cell, activate either its row or its column.',order:'Rows resolve right-to-left (ascending array index); columns top-to-bottom. Every effect is mandatory; Knife always costs 1 health. Resolve all effects before checking victory or defeat.',terrain:'Empty cells 0,4,8 grant 1 movement when their line resolves. Placing a card covers this trail. Empty ward cells grant 1 block; placement erases a ward. Shelter face0 blocks3 repeatedly; face1 leaves a ward after self-discard, with no immediate block. Face choice is fixed on placement; Friend never leaves wards. New wards start next activation.',clear:'Only the chosen line is cleared, if it holds 3 cards after placement. Other full lines remain. Cleared cards go to discard.',reward:'After collecting supplies and surviving the turn, pause at screen reward. Choose ambush, erase, shelter, or keep. A non-keep action requires replace=UID of a current hand card. That UID transforms immediately in hand for the rest of the run. No turn consumed; all 12 physical UIDs conserved. One Knife copy has been replaced with Shift in the starting deck.',faces:'Every physical UID has two definitions selected by action.face (0 or 1; API default 0). The selected face is committed in state.faces while the UID is on the grid. All future row/column activations use that committed face. Full clear, vanish, collapse and encounter transition remove the commitment; after re-drawing it may be selected anew. No global recall or per-activation Shelter mode remains.',shift:'Face0 only: on placement Shift swaps the two OTHER cells of its chosen line before any effect resolves. Cards and empty spaces swap; fixed terrain and wards do not. A card moved onto a ward erases it. Shift then discards itself after the line, including when the line is not full. A full line clears normally.',cards:'Ambush hits 4 if the next cell in line order is empty, otherwise 1. Erase discards itself after effects even when the line is not full; it reopens terrain only next activation.',draw:'Refill hand to 4 after surviving enemy hit; shuffle discard into draw when draw is exhausted using seeded RNG.',win:'Encounter 1 ends immediately on supplies+rescue3+enemy0 OR movement12. Interlude continue carries health, deck upgrade, hand/draw/discard and global turn; grid cards go to discard and wards reset. Encounter 2 wins at movement8; first encounter rescue is irreversible.',loss:'HP 0 or global turn20 exhausted before completing both encounters.',damage:'First: enemy>0 ? 2+ceil(enemy/6) : 0. Second: rocks1 + (archers alive ? 2 : 0) + (first guard survived ? 1 : 0), minus block. No counterhit after completing an encounter. Second collapse removes the marked row cards/wards after effects and counterhit; row order bottom,middle,top repeats; no extra damage from card removal.',adaptation:'Original isolated experiment inspired by the Nexus placement/line-clearing concept; not the complete Tidal Blades 2 rules.'},metrics:{faceChoices:[0,1].map(face=>({face,plays:r.events.filter(e=>e.summary.kind==='turn'&&(e.action.face??0)===face).length})),firstResult:r.final.firstResult,encounterTurns:[1,2].map(encounter=>({encounter,turns:r.events.filter(e=>e.summary.kind==='turn'&&e.before.encounter===encounter).length})),collapseLosses:r.events.reduce((n,e)=>n+(e.summary.collapsed?.length||0),0),turns:r.events.filter(e=>e.summary.kind==='turn').length,rewardChoices:r.events.filter(e=>e.action.kind==='reward').map(e=>e.action.choice),tracesLeft:r.events.filter(e=>e.summary.traceLeft).length,swapPlays:r.events.filter(e=>e.summary.swaps?.length).length,clearedLines:r.events.filter(e=>e.summary.cleared.length).length,enemyDamage:r.events.reduce((n,e)=>n+e.summary.enemyDamage,0),selfDamage:r.events.reduce((n,e)=>n+e.summary.selfDamage,0),rows:r.events.filter(e=>e.action.axis==='row').length,columns:r.events.filter(e=>e.action.axis==='col').length},analysisNotes:['Do not infer enjoyment or confusion from action repetition alone.','Compare line activation and placement consequences across later turns; more immediate damage is not automatically better.','Snapshots and seeded RNG permit deterministic replay.','Timestamps include pauses and are not decision-time measurements.']};}
function textReport(r){const x=exported(r),delta=(b,a)=>Object.fromEntries(Object.entries(a).filter(([k,v])=>JSON.stringify(v)!==JSON.stringify(b[k])));return 'حلّل بالعربية تقرير نموذج شبكة الشنفرى. هل تغيّر سبب الاختيار بين الأدوار؟ قارن بدائل وضع البطاقة وتفعيل الخط، وقدّم أهم ثلاثة اقتراحات مع الاستشهاد بأرقام الأدوار. ميّز بين النتائج المثبتة والفرضيات.\nSHANFARA_NEXUS_REPORT_V7\n'+JSON.stringify({...x,format:'Each changes object patches event.before; alternatives use that same before-state.',events:r.events.map(e=>({index:e.index,at:e.at,before:e.before,action:e.action,changes:delta(e.before,e.after),summary:e.summary,alternatives:e.alternatives.map(a=>({action:a.action,changes:delta(e.before,a.after),summary:a.summary}))}))});}


// --- audio.mjs ---
// Procedural Web Audio Engine for Al-Shanfara: Nexus Matrix
// 100% offline, zero external sound assets, procedural synthesis.

let ctx = null;
let muted = false;

try {
  muted = localStorage.getItem('shanfara-audio-muted') === 'true';
} catch {}

function getContext() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) ctx = new AudioCtx();
  }
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

function isMuted() {
  return muted;
}

function toggleMute() {
  muted = !muted;
  try {
    localStorage.setItem('shanfara-audio-muted', muted ? 'true' : 'false');
  } catch {}
  return muted;
}

// Generate brief white noise buffer for tactile sand/grit/rumble synthesis
function createNoiseBuffer(c, duration = 0.5) {
  const bufferSize = Math.floor(c.sampleRate * duration);
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function playSfx(type) {
  if (muted) return;
  const c = getContext();
  if (!c) return;

  const now = c.currentTime;

  try {
    switch (type) {
      case 'select': {
        // Crisp stone bead click (card/cell selection)
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.035);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(now);
        osc.stop(now + 0.035);
        break;
      }

      case 'move':
      case 'step': {
        // Soft desert footstep: filtered noise burst on gravel/sand
        const noise = c.createBufferSource();
        noise.buffer = createNoiseBuffer(c, 0.12);
        const filter = c.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(550, now);
        filter.Q.setValueAtTime(1.8, now);
        const gain = c.createGain();
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(c.destination);
        noise.start(now);
        noise.stop(now + 0.1);
        break;
      }

      case 'bow':
      case 'hit': {
        // Arrow string release twang + impact thrum
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(620, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.18);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(now);
        osc.stop(now + 0.18);
        break;
      }

      case 'knife':
      case 'blade': {
        // Steel edge glint (high resonant metallic ping)
        const osc1 = c.createOscillator();
        const osc2 = c.createOscillator();
        const gain = c.createGain();
        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(1180, now);
        osc2.frequency.setValueAtTime(2360, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(c.destination);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.22);
        osc2.stop(now + 0.22);
        break;
      }

      case 'guard':
      case 'block': {
        // Deep shield block / rock deflect thud
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.16);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(now);
        osc.stop(now + 0.16);
        break;
      }

      case 'friend':
      case 'chain': {
        // Iron chain link breaking: high ringing chime with harmonic spread
        const freqs = [880, 1320, 1760];
        freqs.forEach((f, idx) => {
          const osc = c.createOscillator();
          const gain = c.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + idx * 0.02);
          gain.gain.setValueAtTime(0.12, now + idx * 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.02 + 0.35);
          osc.connect(gain);
          gain.connect(c.destination);
          osc.start(now + idx * 0.02);
          osc.stop(now + idx * 0.02 + 0.35);
        });
        break;
      }

      case 'collapse': {
        // Canyon cliff rockfall: low brown rumble with filter sweep
        const noise = c.createBufferSource();
        noise.buffer = createNoiseBuffer(c, 0.6);
        const filter = c.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(180, now);
        filter.frequency.linearRampToValueAtTime(50, now + 0.5);
        const gain = c.createGain();
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(c.destination);
        noise.start(now);
        noise.stop(now + 0.55);
        break;
      }

      case 'victory': {
        // Arabian desert modal arpeggio (Bayati / Rast cadence: D - F - G - A - D')
        const notes = [293.66, 349.23, 392.00, 440.00, 587.33];
        notes.forEach((freq, idx) => {
          const osc = c.createOscillator();
          const gain = c.createGain();
          osc.type = 'triangle';
          const t = now + idx * 0.12;
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.18, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
          osc.connect(gain);
          gain.connect(c.destination);
          osc.start(t);
          osc.stop(t + 0.45);
        });
        break;
      }

      case 'defeat': {
        // Mournful low descending interval
        const notes = [220.00, 196.00, 164.81, 146.83];
        notes.forEach((freq, idx) => {
          const osc = c.createOscillator();
          const gain = c.createGain();
          osc.type = 'sine';
          const t = now + idx * 0.18;
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.2, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
          osc.connect(gain);
          gain.connect(c.destination);
          osc.start(t);
          osc.stop(t + 0.5);
        });
        break;
      }
    }
  } catch {}
}


// --- view.mjs ---




const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=n=>new Intl.NumberFormat('ar-SA',{useGrouping:false}).format(n);
const ratio=(a,b)=>`<bdi dir="ltr" class="num">${num(a)} / ${num(b)}</bdi>`;
const button=(label,action,cls='',disabled=false,aria='')=>`<button data-action="${action}" class="${cls}" ${disabled?'disabled':''} ${aria?`aria-label="${esc(aria)}"`:''}>${label}</button>`;
function preview(s,p,axis=p.axis){if(!p.card||p.cell===null||!axis||p.face===null)return null;return activate(s,{card:p.card,cell:p.cell,axis,face:p.face??0});}
const tone=(uid,s)=>{const ops=def(uid,s).effects.map(e=>e.op);return ops.some(o=>o==='hit'||o==='ambush')?'attack':ops.includes('move')?'move':ops.includes('friend')?'ally':ops.includes('prime')?'setup':'guard';};
const pill=(ico,label,cls='')=>`<span class="effect ${cls}">${icon(ico)}<span>${label}</span></span>`;
function cardEffects(uid,s,face){const c=def(uid,s,face),bits=[];for(const f of c.effects){if(f.op==='move')bits.push(pill('foot','تقدّم '+num(f.n),'move'));if(f.op==='hit'||f.op==='ambush')bits.push(pill('bow',f.op==='ambush'?'٤ قبل فراغ؛ وإلا ١':'أصب '+num(f.n),'attack'));if(f.op==='hurt')bits.push(pill('heart','جرح '+num(f.n),'danger'));if(f.op==='block')bits.push(pill('cover','صدّ '+num(f.n),'guard'));if(f.op==='prime')bits.push(pill('bow','بعدي +'+num(f.n),'attack'));if(f.op==='friend')bits.push(s.friend===3?pill('cover','صدّ ٢','guard'):pill('chain','فكّ قيدًا','ally'));if(f.op==='ward')bits.push(pill('cover','ساتر لاحقًا ١','guard'));if(f.op==='vanish')bits.push('<small>تُطرح وحدها</small>');}if(cardType(uid,s)==='shift'&&(face??s.faces?.[uid]??0)===0)bits.unshift(pill('swap','بدّل الخانتين','setup'));return bits.join('');}
function facePicker(s,p){return `<section class="face-picker" aria-label="اختر أحد فعلي البطاقة"><small>اختيارك يثبت حتى تُطرح البطاقة</small><div>${[0,1].map(face=>{const c=def(p.card,s,face),temporary=c.effects.some(e=>e.op==='vanish');return `<button data-face="${face}" class="face-option ${p.face===face?'selected':''}" aria-pressed="${p.face===face}">${icon(c.icon)}<strong>${c.name}</strong><span class="card-effects">${cardEffects(p.card,s,face)}</span><small>${temporary?'تُطرح بعد التفعيل':'يبقى لتفعيل لاحق'}</small></button>`;}).join('')}</div></section>`;}
function comboView(s,m){const op={move:'خطوة',trail:'خطوة',hit:'ضرر',ambush:'ضرر',block:'صدّ',ward:'صدّ',prime:'تقوية',friend:'رفيق',hurt:'جرح',vanish:'تُطرح',shelter:'ساتر لاحق',reposition:'تموضع'};
return `<section class="combo-panel" aria-label="ترتيب الأفعال وعلاقاتها"><div class="combo-title">ترتيب التنفيذ <small>الزيادة تنتهي بنهاية هذا الخط</small></div><div class="combo-chain">${m.steps.map((x,i)=>`<div class="combo-step ${m.links.some(l=>l.target===x.uid&&x.uid)?'linked-target':''} ${m.expired.some(l=>l.uid===x.uid&&x.uid)?'expired-step':''}"><b>${num(i+1)}</b><strong>${esc(x.name)}</strong><small>${x.effects.map(e=>e.op==='vanish'?'تُطرح':`${op[e.op]||e.op} ${num(e.amount)}`).join(' · ')||'لا فعل'}</small></div>`).join('')}</div><div class="combo-totals">${m.totals.moves?pill('foot','تقدّم '+num(m.totals.moves),'move'):''}${m.totals.hits?pill('bow','أصب '+num(m.totals.hits),'attack'):''}${m.totals.block?pill('cover','صدّ '+num(m.totals.block),'guard'):''}</div>${m.links.map(l=>`<div class="combo-link good">${esc(l.sources.map(x=>(x.name||def(x.uid,s).name)).join(' + '))} ← ${esc((l.targetName||def(l.target,s).name))}: <bdi dir="ltr">${num(l.base)} + ${num(l.boost)} = ${num(l.power)}</bdi>${l.damage<l.power?`<small>يصيب ${num(l.damage)} فقط؛ هذه صحة الحارس المتبقية</small>`:''}</div>`).join('')}${m.expired.map(l=>`<div class="combo-warning">${esc((l.name||def(l.uid,s).name))}: لا هجوم بعدها؛ ستضيع +${num(l.amount)}.<small>لن تنتقل للدور القادم.</small></div>`).join('')}${m.ambushes.map(l=>`<div class="combo-condition">الكمين: ${l.open?'الخانة التالية فارغة':l.next===null?'عند نهاية الخط':'الخانة التالية مشغولة'} ← قوة ${num(l.base)}</div>`).join('')}${m.swaps.length?'<small class="swap-caption">تم تبديل الخانتين قبل هذا التسلسل.</small>':''}</section>`;}
function hud(s,n,projected){const damage=incoming(s),hpLoss=s.hp-n.hp;return `<section class="encounter" aria-label="الموقف"><div class="actors"><button data-action="health-info" class="actor hero-actor" aria-label="الشنفرى: ${num(s.hp)} صحة من ١٨${projected?'؛ بعد التفعيل '+num(n.hp):''}"><span class="portrait shanfara" aria-hidden="true"></span><span class="actor-info"><strong>الشنفرى</strong><span class="health-value">${icon('heart')}${num(s.hp)}${hpLoss?`<small>← ${num(n.hp)}</small>`:''}</span><span class="meter hp-meter"><i style="width:${s.hp/18*100}%"></i></span></span></button><button data-action="enemy-info" class="actor enemy-actor" aria-label="${s.encounter===2?'رماة الشِّعب':'الحارس'}: ${num(s.enemy)} صحة؛ خطر الدور ${num(damage)}"><span class="portrait guard-portrait ${s.enemy?'':'defeated'}" aria-hidden="true"></span><span class="actor-info"><strong>${s.encounter===2?(s.enemy?'رماة الشِّعب':'سقط الرماة'):(s.enemy?'الحارس':'هُزم الحارس')}</strong><span class="enemy-value">${icon('knife')}${s.encounter===2?`خطر الدور ${num(damage)}`:s.enemy?`يضرب بـ${num(damage)}`:'الطريق آمن'}</span><span class="meter enemy-meter"><i style="width:${s.enemy/(s.encounter===2?6:12)*100}%"></i>${projected?`<b style="width:${n.enemy/(s.encounter===2?6:12)*100}%"></b>`:''}</span></span></button></div><button data-action="friend-info" class="companion ${s.friend===3?'rescued':''}">${icon(s.friend===3?'friend':'chain')}<strong>${s.friend===3?'رفيقك معك':s.encounter===2?'رفيقك بقي في الوادي':'حرّر رفيقك'}</strong><span class="chains" aria-hidden="true">${[0,1,2].map(i=>`<i class="${i<s.friend?'broken':''}">${icon(i<s.friend?'friend':'chain')}</i>`).join('')}</span><span class="sr">${num(s.friend)} من ٣ قيود مفكوكة</span>${projected&&n.friend>s.friend?`<small>← ${n.friend===3?'حرّ':num(n.friend)+' قيود مفكوكة'}</small>`:''}</button><div class="route" aria-label="المخبأ على بعد ${num(goal(s)-s.progress)} خطوة؛ ${s.loot?'الزاد معك':'الزاد عند الخطوة الرابعة'}"><div class="route-caption"><span>${icon('bag')}${s.loot?'الزاد معك':'اجمع الزاد'}</span><strong>${icon('cave')}${projected&&n.progress>s.progress?`${s.encounter===2?'العبور':'الإفلات'}: ${num(goal(s)-n.progress)} بعد التفعيل`:`${s.encounter===2?'العبور':'الإفلات'}: ${num(goal(s)-s.progress)} خطوات`}</strong></div><div class="route-stones" style="--stones:${goal(s)+1}" aria-hidden="true">${Array.from({length:goal(s)+1},(_,i)=>`<span class="stone ${i<=s.progress?'passed':''} ${i>s.progress&&i<=n.progress?'projected':''} ${i===s.progress?'you':''}">${i===s.progress?icon('run'):i===4&&s.encounter===1?icon('bag'):i===goal(s)?icon('cave'):'<i></i>'}</span>`).join('')}</div></div></section>`;}
function gameView(s,p,feedback=''){const projected=preview(s,p),n=projected?.state||s,indices=p.cell!==null&&p.axis?lineIndices(p.cell,p.axis):[],prepared=p.axis?stage(s,{card:p.card,cell:p.cell,axis:p.axis,face:p.face??0}):null,staged=prepared?.grid||s.grid.slice();if(!prepared&&p.cell!==null&&p.card)staged[p.cell]=p.card;const shown={...s,faces:{...s.faces,...prepared?.faces,...(p.card?{[p.card]:p.face??0}:{})}};const populated=indices.filter(i=>staged[i]),full=populated.length===3;
 const guide=!p.card?'احسم: زاد + رفيق + حارس، أو أفلت':p.face===null?'اختر أحد الفعلين':p.cell===null?'أين ستضعه؟':!p.axis?'أي خط ستفعّل؟':'النتيجة أمامك؛ أكّد أو غيّر اختيارك';
 const lineButton=axis=>{const x=preview(s,p,axis),v=x.summary,a={card:p.card,cell:p.cell,axis,face:p.face??0},m=comboModel(s,a,x);return `<button data-axis="${axis}" class="line-button ${p.axis===axis?'selected':''}" aria-pressed="${p.axis===axis}"><strong>${axis==='row'?'صف ↔':'عمود ↕'}</strong><span class="line-result">${v.moves?pill('foot',`تقدّم ${num(v.moves)}`,'move'):''}${v.hits?pill('bow',`أصب ${num(v.hits)}`,'attack'):''}${v.block?pill('cover',`صدّ ${num(v.block)}`,'guard'):''}${x.state.friend>s.friend?pill('chain','حرّر قيدًا','ally'):''}</span><small class="${x.state.hp<s.hp?'danger':'good'}">${x.state.screen==='interlude'?'تنتهي المواجهة الأولى':x.state.screen==='end'?x.state.outcome==='dead'?'ستسقط':x.state.outcome==='caught'?'سيدركك الفجر':'ستصل للمخبأ':v.enemyDamage+v.selfDamage?`ستتلقّى ${num(v.enemyDamage+v.selfDamage)} ضرر`:'لن تتضرّر'}${v.cleared.length?' · يُفرَّغ الخط':''}</small>${m.links.length?`<small class="good">تقوية مرتبطة +${num(m.links.reduce((n,l)=>n+l.boost,0))}</small>`:m.expired.length?'<small class="danger">+٢ بلا هجوم بعدها</small>':''}</button>`;};
 const model=projected?comboModel(s,{card:p.card,cell:p.cell,axis:p.axis,face:p.face??0},projected):null,hints=p.card&&p.cell===null&&p.face!==null?comboHints(s,p.card,p.face??0):{};
 return `<main class="game"><header class="top"><h1>الشنفرى <small>· ${s.encounter===2?'الشِّعب المنهار':'غارة الوادي'}</small></h1><div class="dawn ${s.turn>=17?'danger':''}">${icon('moon')}<span>حتى الفجر <b>${num(21-s.turn)}</b> أدوار</span></div><div class="top-actions">${button(isMuted()?icon('mute'):icon('sound'),'toggle-audio','icon-button',false,isMuted()?'تشغيل المؤثرات الصوتية':'كتم الصوت')}${button('⋯','menu','menu-button',false,'القائمة')}</div></header>${hud(s,n,!!projected)}<div class="guide"><span>${s.encounter===2?(projected?.state.outcome==='full'||projected?.state.outcome==='supplies'?'تعبر قبل انهيار الصف':`الصف ${['العلوي','الأوسط','السفلي'][collapseRow(s)]} ينهار بنهاية الدور`):guide}</span>${p.card&&p.cell!==null?button('غيّر الفعل','change-face'):p.card?button('تفاصيل الوجهين','card-info'):button('القواعد','rules')}</div><section class="grid" aria-label="شبكة التدبير؛ ثلاثة صفوف وثلاثة أعمدة">${staged.map((uid,i)=>{const c=uid?def(uid,shown):null,terrain=!uid&&(trailCells.includes(i)||s.wards[i]),active=indices.includes(i)&&(uid||terrain),ordinal=indices.indexOf(i)+1;return `<button data-cell="${i}" class="cell ${uid?tone(uid,shown):'empty'} ${!uid&&trailCells.includes(i)?'trail-cell':''} ${!uid&&s.wards[i]?'ward-cell':''} ${!s.grid[i]&&p.card&&p.face!==null?'placeable':''} ${p.cell===i?'staged':''} ${active?'active-line':''} ${active&&full&&uid?'will-clear':''}  ${s.encounter===2&&Math.floor(i/3)===collapseRow(s)?'collapse-cell':''} ${model?.links.some(l=>l.target===uid&&uid)?'combo-target':''} ${model?.links.some(l=>l.sources.some(q=>q.uid===uid&&uid))?'combo-source':''} ${model?.expired.some(l=>l.uid===uid&&uid)?'combo-expiring':''}" aria-label="${s.encounter===2&&Math.floor(i/3)===collapseRow(s)?'ينهار بنهاية الدور. ':''}صف ${num(Math.floor(i/3)+1)} عمود ${num(i%3+1)}: ${c?c.name:terrain?(trailCells.includes(i)?'درب: تقدّم ١ ':'')+(s.wards[i]?'ساتر: صدّ ١':''):'فارغة'}" ${!uid&&(!p.card||p.face===null)?'disabled':''}>${hints[i]?.length?`<span class="combo-hint">${hints[i].map(h=>`${h.axis==='row'?'↔':'↕'} +${num(h.boost)}`).join(' · ')}</span>`:''}${model?.expired.some(l=>l.uid===uid&&uid)?'<span class="expiry-badge">+٢ تضيع</span>':''}${active?`<span class="order">${num(ordinal)}</span>`:''}${active&&full&&uid?`<span class="burn">تُطرح</span>`:''}${c?`${icon(c.icon)}<strong>${c.name}</strong>${projected?.summary.effects.some(e=>e.uid===uid&&e.boost)?`<span class="boost-badge">+${num(projected.summary.effects.find(e=>e.uid===uid&&e.boost).boost)}</span>`:''}<span class="card-effects">${cardEffects(uid,shown)}</span>`:terrain?`${trailCells.includes(i)?icon('foot')+'<small>تقدّم ١</small>':''}${s.wards[i]?`<span class="ward-mark">${icon('cover')}<strong>ساتر</strong><small>صدّ ١</small></span>`:''}`:'<span class="plus" aria-hidden="true">＋</span>'}</button>`;}).join('')}</section><section class="hand-section" aria-label="أفعالك"><div class="section-title"><strong>أفعالك</strong><small>بطاقة واحدة كل دور</small></div><div class="hand">${s.hand.map(uid=>{const c=def(uid,s);return `<button data-card="${uid}" class="hand-card ${tone(uid,s)} ${p.card===uid?'selected':''}" aria-pressed="${p.card===uid}">${icon(c.icon)}<strong>${c.name}</strong><small>${def(uid,s,1).name}</small></button>`;}).join('')}</div></section><section class="activation" aria-label="نتيجة اختيارك">${p.card&&p.cell===null?facePicker(s,p):''}<div class="line-options">${p.cell!==null&&p.face!==null?lineButton('row')+lineButton('col'):`<div class="empty-preview">${p.card?'اختر خانة؛ ستظهر نتيجة صفها وعمودها':'اختر فعلًا لتبني خطوتك القادمة'}</div>`}</div>${model?comboView(s,model):''}${projected?`<div class="line-consequence">${prepared?.erasedWards.length?'⚠ هذا الاختيار يمحو ساترًا. ':''}${prepared?.swaps.length?'تبادل الخانتين أولًا، ثم نفّذ الترتيب المرقّم. ':''}${projected.summary.collapsed?.length?`الانهيار يطرح ${num(projected.summary.collapsed.length)} بطاقة بعد التفعيل. `:''}${full?'تُطرح بطاقات الخط؛ تُفتح خاناته للتفعيل القادم.':projected.summary.vanished.length?'تُطرح البطاقة المؤقتة؛ بقية الخط يبقى.':'تبقى البطاقات لتفعيل لاحق.'}${p.cell!==null&&trailCells.includes(p.cell)?' تغطي البطاقة خطوة الدرب.':''}</div>`:''}<div class="footer-actions">${button(p.axis?`نفّذ ${p.axis==='row'?'الصف':'العمود'}`:'اختر فعلًا ثم خانة','activate','primary',!projected)}${button('إلغاء','cancel','cancel',!p.card)}</div></section><div class="feedback" role="status">${feedback?button(esc(feedback),'last-result'):'الصف: من اليمين لليسار · العمود: من الأعلى للأسفل'}</div></main>`;
}
function rewardView(s,pick=null){const chosen=pick&&cards[pick];return `<main class="hero reward-screen"><p class="gold">«وإن مُدّت الأيدي إلى الزاد»</p><h1>${chosen?'أيّ مهارةٍ تستبدل؟':'اختر أسلوب عودتك'}</h1>${chosen?`<div class="reward-selected">${icon(chosen.icon)}<strong>${chosen.name} / ${alternates[pick].name}</strong><p>${chosen.text}</p><p>${alternates[pick].text}</p></div><p>المهارة الجديدة تدخل يدك الآن، وتبقى في مجموعتك لبقية المسير.</p><div class="reward-options">${s.hand.map(uid=>{const c=def(uid,s);return `<button data-replace="${uid}" class="reward-card">${icon(c.icon)}<span><strong>استبدل «${c.name}»</strong><small>${c.short}</small></span></button>`;}).join('')}</div>${button('الرجوع لخيارات المهارات','reward-back')}`:`<p>تختار بعدها بطاقة من يدك لتستبدلها بأسلوبٍ من أساليب الصعاليك.</p><div class="reward-options">${['ambush','erase','shelter'].map(k=>{const c=cards[k];return `<button data-reward="${k}" class="reward-card">${icon(c.icon)}<span><strong>${c.name} / ${alternates[k].name}</strong><small>${c.text}</small><small>${alternates[k].text}</small></span></button>`;}).join('')}</div><button data-reward="keep">ثباتٌ على التدبير الحالي</button>`}<small>التدبير لا يستهلك دوراً. حتى الفجر ${num(s.firstResult&&s.encounter===1?20-s.turn:21-s.turn)} أدوار.</small></main>`;}
function interludeView(s){const f=s.firstResult;return `<main class="hero"><p class="gold">انقضاء الغارة الأولى</p><h1>${f.route==='clear'?'حسمتَ غارة الوادي':'أفلتَّ من قبضة الحارس'}</h1><div class="result-stats"><span>${icon('heart')} ${num(s.hp)} صحة للمسير</span><span>${icon('moon')} بقي ${num(20-s.turn)} دورًا قبل الفجر</span><span>${icon('friend')} ${s.friend===3?'رفيقك طليقٌ معك':'بقي رفيقك في قيود الوادي'}</span></div><p>${f.enemy>0?'الحارس يتعقّب أثرك في العتمة: يزيد خطر كل دور في الشِّعب بضرر واحد.':'سقط الحارس في الوادي: دروب الشِّعب آمن من الملاحقة المباشرة.'}</p><div class="next-encounter"><h2>٢ · الشِّعب المنهار</h2><p>جدار الشِّعب يتداعى صخراً بعد كل دور؛ استثمر بطاقات الصف قبل انهياره أو بدّل موضعها. اعبر ٨ خُطى؛ إصابة الرماة تخفف نبلهم، والردى يتربص بمن تباطأ.</p></div>${button(s.rewardClaimed?'ادخل الشِّعب':'اختر أسلوبك ثم ادخل الشِّعب','continue','primary')}${button('سجلّ الرحلة حتى الآن','report')}<small>صحتك ورزمتك ووقت الفجر مستمرة. تُطرح بطاقات الشبكة، وتبقى سواتر الوادي خلفك.</small></main>`;}
function endView(s){const r={full:['وفاءُ الرَّهْطِ والظَّفَر','«كأنما نفضتُ غبار الريح عن جيدِ أجدل».. عبرتما الشِّعبَ معاً والزاد في أيديكما؛ وفيتَ بعهد الصاحب ولم تخذل الجاني بما جرّ.'],supplies:['نَجَاةُ المُنْفَرِد','«ولي دونكم أهلون».. أفلتَّ بالزادِ وحدك وبقي رفيقك مقيداً في الوادي؛ مضيتَ مستغنياً وفي النفس شجى الأسر.'],dead:['ثَوَى البَاسِل','«غير أعزل».. سقطتَ في بطن السَّراة مضرجاً بكبرياء الصعاليك؛ طويتَ على الخمصِ الحوايا ولقيتَ المنية مقبلاً.'],caught:['انْصِدَاعُ الفَجْر','«فقد حُمّت الحاجات».. أسفر الصبحُ وانكشفت الدروب قبل بلوغ المأمن؛ حاصرتك خيلُ القوم وأنت على شرف المنازلة.']}[s.outcome];return `<main class="hero"><p class="gold">خاتمة الغارة</p><h1>${r[0]}</h1><p>${r[1]}</p><div class="result-stats"><span>${icon('heart')} بقيت ${num(s.hp)} صحة</span><span>${icon('moon')} ${num(s.turn)} أدوار</span><span>${icon('friend')} ${s.friend===3?'رفيقك معك':'رفيقك خلفك'}</span></div><div class="end-actions">${button('سجلّ الغارة','report','primary')}${button('أعد نفس الغارة','restart')}${button('غارة بتوزيع جديد','new-seed')}</div><a href="raid/">النموذج السابق</a></main>`;}
function titleView(){return `<main class="hero"><p class="gold">الشنفرى · طريق العودة</p><h1>شبكة التدبير</h1><div class="hero-art" aria-hidden="true">${icon('grid')}</div><p>«أقيموا بني أمي صدورَ مطيكم».. اجمع الزاد، وفكّ قيد رفيقك، واعبر شِعاب السَّراة قبل انصداع الفجر.</p>${button('ابدأ الرحلة','start','primary')}${button('قوانين الغارة','rules')}<small>ضع فعلاً في خانة فارغة، ثم فعّل صفه أو عموده لبناء طريق نجاتك.</small></main>`;}

const btn = button;


// --- app.mjs ---



const root=document.querySelector('#app'),menu=document.querySelector('#menu'),KEY='shanfara-nexus-v7',LAST='shanfara-nexus-last-v7';let s=fresh(),report=null,activeReport=null,selection={card:null,cell:null,axis:null,face:null},feedback='',rewardPick=null;
try{const save=JSON.parse(localStorage.getItem(KEY));if(save?.state?.version===VERSION){assertState(save.state);s=save.state;report=restore(save.report,s);}}catch{}
function persist(){try{localStorage.setItem(KEY,JSON.stringify({state:s,report}));if(s.screen==='end')localStorage.setItem(LAST,JSON.stringify(report));}catch{feedback='تعذر الحفظ على الجهاز؛ يمكنك نسخ تقرير الرن.';}}
function render(){document.body.dataset.screen=s.screen;root.innerHTML=s.screen==='title'?titleView():s.screen==='end'?endView(s):s.screen==='reward'?rewardView(s,rewardPick):s.screen==='interlude'?interludeView(s):gameView(s,selection,feedback);}
const focus=q=>root.querySelector(q)?.focus({preventScroll:true});
function reset(seed=s.seed){if(menu.open)menu.close();s=start(fresh(seed));report=begin(s);selection={card:null,cell:null,axis:null,face:null};feedback='';rewardPick=null;persist();render();focus('[data-card]');}
function show(title,body){menu.innerHTML=`<div class="dialog-head"><h2>${title}</h2>${btn('×','close')}</div>${body}`;if(!menu.open)menu.showModal();menu.querySelector('button')?.focus();}
function rules(){show('طريق العودة',`<ol class="steps"><li>اختر بطاقة وأحد فعليها، ثم خانة فارغة، ثم صفًا أو عمودًا.</li><li>نفّذ الخط بالترتيب الظاهر. تتقدّم عبر الدروب الفارغة أيضًا.</li><li>ثلاث بطاقات تملأ الخط: تُنفّذ ثم تُطرح. غير ذلك تبقى.</li><li>«حِيلَةُ التَّحَوُّل» تبدّل الخانتين الأخريين قبل تنفيذ الخط، ثم تُطرح.</li><li>لكل بطاقة فعلان مستلهمان من خصال الشنفرى؛ دائم وطارئ مضحٍّ. اختر وجهًا قبل وضعها؛ يثبت على الشبكة حتى تُطرح وتسحبها مجددًا.</li><li>عند بلوغ الزاد، تظفر بأسلوب جديد من مكائد الصعاليك تستبدله ببطاقة من يدك.</li></ol><p>حرّر قيود رفيقك الثلاثة («وَفَاءُ الرَّهْط»). بعدها تصبح البطاقة «دِرْعُ الرَّفِيق» وتصدّ ضررين. «مَلاذُ الجَلْمَد» جائزة مستقلة: صدّ ٣ الآن، ووجهها الآخر «أَثَرُ السَّاتِر» يصدّ ١ في تفعيلات لاحقة. وضع بطاقة فوقه يمحوه.</p><p>المواجهة الأولى تنتهي بجمع الزاد وتحرير الرفيق وهزيمة الحارس، أو بالإفلات بـ١٢ خطوة. الثانية تتطلب عبور ٨ خطوات في الشِّعب؛ الصف المعلّم يفقد بطاقاته وسواتره بعد كل دور. الصحة ووقت الفجر مستمران، وبقاء الحارس حيًا يزيد وطأة الخطر في الشِّعب.</p><p class="danger">«حَدُّ الإصْلِيت» يجرحك حتى عند الهروب لكبرياء الصعلوك. «رَوَاغُ الزُّهْلُول» تقوّي الهجوم الذي يأتي بعدها في الخط نفسه.</p>${btn('ابدأ الرحلة','start','primary',s.screen!=='title')}`);}
function effects(){if(!s.last)return;const l=s.last,event=report?.events.at(-1),model=event?.summary.kind==='turn'?comboModel(event.before,event.action,{valid:true,summary:event.summary}):null;show('ما حدث',`${model?comboView(event.before,model):''}<p>تقدّمت ${num(l.moves)} · أصبت ${num(l.hits)} · صدَدت ${num(l.block)}</p>${l.collapsed?.length?`<p>طرح الانهيار: ${l.collapsed.map(uid=>def(uid,s).name).join('، ')}</p>`:''}<p>جرح النصل: ${num(l.selfDamage)} · ضربة الحارس: ${num(l.enemyDamage)}</p>${l.log.map(t=>`<p>${esc(t)}</p>`).join('')}<p>${l.cleared.length?'طُرحت بطاقات الخط.':l.vanished?.length?'طُرحت البطاقة المؤقتة وحدها.':'بقيت البطاقات في أماكنها.'}</p>`);}
function animate(result,rects){if(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;for(const x of result.summary.line){const node=root.querySelector(`[data-cell="${x.cell}"]`);node?.animate?.([{filter:'brightness(1.5)'},{filter:'brightness(1)'}],{duration:350,easing:'ease-out'});if(result.summary.cleared.includes(x.uid)){const r=rects[x.cell];if(!r?.width)continue;const ghost=document.createElement('span');ghost.className='clear-ghost';ghost.textContent=x.name||def(x.uid,s).name;Object.assign(ghost.style,{top:r.top+'px',left:r.left+'px',width:r.width+'px',height:r.height+'px'});document.body.append(ghost);const a=ghost.animate?.([{opacity:.9,transform:'scale(1)'},{opacity:0,transform:'translateY(20px) scale(.7)'}],{duration:380,easing:'ease-out'});if(a)a.onfinish=()=>ghost.remove();else ghost.remove();}}}
function commit(chosen=selection){const action={...chosen},rects={};for(let i=0;i<9;i++)rects[i]=root.querySelector(`[data-cell="${i}"]`)?.getBoundingClientRect?.();const result=activate(s,action);if(!result.valid)return;report=record(report||begin(s),s,action,result);s=result.state;rewardPick=null;selection={card:null,cell:null,axis:null,face:null};feedback=result.summary.kind==='reward'?(result.summary.uid?'ظفرتَ بمهارة جديدة؛ اختر أين توظّفها في الشبكة.':'ثبتَّ على تدبيرك الحالي.'):result.summary.friendSaved?'«وفاءُ الرَّهْط»؛ تحرّر رفيقك وصار درعاً يصدّ عنك.':`تقدّمت ${num(result.summary.moves)} · أصبت ${num(result.summary.hits)} · تلقّيت ${num(result.summary.enemyDamage+result.summary.selfDamage)}${result.summary.traceLeft?' · خلّفت ساترًا':''}`;if(result.summary.collapsed?.length)feedback=`طرح الانهيار ${num(result.summary.collapsed.length)} بطاقة · `+feedback;if(result.summary.unusedPrime)feedback=`ضاعت تقوية +${num(result.summary.unusedPrime)}؛ لا هجوم بعدها · `+feedback;persist();render();animate(result,rects);if(result.summary.friendSaved)playSfx('friend');else if(result.summary.collapsed?.length)playSfx('collapse');else if(result.summary.hits)playSfx('hit');else if(result.summary.selfDamage)playSfx('knife');else if(result.summary.block)playSfx('block');else if(result.summary.moves)playSfx('move');else playSfx('select');if(s.outcome==='full'||s.outcome==='supplies')playSfx('victory');else if(s.outcome==='dead'||s.outcome==='caught')playSfx('defeat');document.querySelector('#live').textContent=feedback;focus(s.screen==='end'?'[data-action="report"]':s.screen==='reward'?'[data-reward]':s.screen==='interlude'?'[data-action="continue"]':'[data-card]');}
function reportDialog(r=report){if(!r){show('التقرير','<p>ابدأ تجربة لتسجيل قراراتها.</p>');return;}activeReport=r;const x=exported(r);show('تقرير تجربة الشبكة',`<p>الأدوار المسجّلة ${num(x.metrics.turns)} · خطوط فرّغتها ${num(x.metrics.clearedLines)}</p><p>${r.coverage==='complete'?'السجل كامل من بداية التجربة.':'السجل جزئي؛ بداية التجربة غير مسجلة.'}</p><p>انسخ التقرير والصقه في المحادثة لتحليل مواضع البطاقات واختيار الخطوط.</p>${btn('نسخ التقرير للتحليل','copy','primary')}${btn('تنزيل JSON','download')}<p id="copy-status" role="status"></p><details><summary>النص القابل للنسخ</summary><textarea readonly class="report-box" id="report-text" aria-label="تقرير الرن">${esc(textReport(r))}</textarea></details><small>التقرير يُحفظ على جهازك، ولا يُرسل تلقائيًا.</small>`);}
async function copy(){const status=menu.querySelector('#copy-status');try{if(!globalThis.navigator?.clipboard?.writeText)throw Error();await navigator.clipboard.writeText(textReport(activeReport));status.textContent='تم النسخ؛ الصقه في المحادثة.';}catch{const box=menu.querySelector('#report-text'),details=box?.closest?.('details');if(details)details.open=true;box?.focus();box?.select();status.textContent='تعذر النسخ التلقائي؛ انسخ النص المحدد أو نزّل الملف.';}}
function download(){const blob=new Blob([JSON.stringify(exported(activeReport),null,2)],{type:'application/json;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`shanfara-nexus-${activeReport.runId}.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function action(a){if(a==='close'){menu.close();focus('[data-action="menu"]');}else if(a==='toggle-audio'){toggleMute();render();playSfx('select');}else if(a==='start'){if(s.screen==='title'){s=start(s);report=begin(s);if(menu.open)menu.close();persist();render();playSfx('select');focus('[data-card]');}}else if(a==='restart'){reset();playSfx('select');}else if(a==='new-seed'){reset(Date.now()>>>0);playSfx('select');}else if(a==='reward-back'){rewardPick=null;render();focus('[data-reward]');}else if(a==='cancel'){selection={card:null,cell:null,axis:null,face:null};render();playSfx('select');focus('[data-card]');}else if(a==='change-face'){selection={...selection,cell:null,axis:null};render();playSfx('select');focus('[data-face]');}else if(a==='activate')commit();else if(a==='continue')commit({kind:'continue'});else if(a==='card-info'&&selection.card){show('فعلا البطاقة',`${[0,1].map(face=>{const c=def(selection.card,s,face);return `<h2>${c.name}</h2><p>${c.text}</p>`;}).join('')}<small>الوجه الذي تختاره يثبت حتى تُطرح البطاقة وتسحبها مجددًا.</small>`);}else if(a==='rules')rules();else if(a==='last-result')effects();else if(a==='report')reportDialog();else if(a==='copy')copy();else if(a==='download')download();else if(a==='last-report'){try{reportDialog(JSON.parse(localStorage.getItem(LAST)));}catch{reportDialog(null);}}else if(a==='health-info')show('صحتك',`<p>بقيت ${num(s.hp)} صحة من ١٨. نفادها ينهي الرحلة.</p>`);else if(a==='enemy-info')show('الحارس',`<p>بقيت له ${num(s.enemy)} صحة من ${s.encounter===2?'٦':'١٢'}. ${s.enemy?'يضرب في نهاية الدور؛ أفعال الصدّ تقلّل الضرر.':'هُزم؛ لن يهاجمك.'}</p><p>${s.encounter===1?'أخذ الزاد وتحرير الرفيق وإسقاط الحارس ينهي المواجهة فورًا. أو أفلت بالوصول إلى ١٢ خطوة.':'الخطر = حجارة ١ + رماة ٢ إن بقوا أحياء'+(s.firstResult?.enemy>0?' + مطاردة الحارس ١.':'.')+' إسقاط الرماة لا يوقف انهيار الشِّعب.'}</p>`);else if(a==='friend-info')show('رفيقك',`<p>${s.encounter===2&&s.friend<3?'بقي رفيقك أسيراً في الوادي؛ مضيتَ وحيداً ببطاقات تقدّمك خطوة بدل التغطية: «وَلِي دُونَكُمْ أَهْلُونَ».':s.friend===3?'صار طليقاً بوفاء الصاحب. بطاقة «دِرْعُ الرَّفِيق» تصدّ ضررين؛ وتستطيع اكتساب «مَلاذُ الجَلْمَد» عند الزاد.':'فُكّ '+num(s.friend)+' من ٣ قيود. فعّل «وَفَاءُ الرَّهْط» لفكّ البقية.'}</p>`);else if(a==='menu')show('شبكة التدبير',`${btn('أكمل اللعب','close','primary')}${btn(isMuted()?'تشغيل المؤثرات الصوتية':'كتم المؤثرات الصوتية','toggle-audio')}${btn('قواعد النموذج','rules')}${btn('نتيجة آخر تفعيل','last-result','',!s.last)}${btn('تقرير التجربة الحالية','report')}${btn('آخر تقرير مكتمل','last-report')}${btn('إعادة نفس التجربة','restart')}${btn('توزيع سحب جديد','new-seed')}<p><a href="raid/">نموذج المواجهتين السابق</a></p>`);}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;if(b.dataset.action){action(b.dataset.action);return;}if(b.dataset.reward){playSfx('select');if(s.screen==='reward'){if(b.dataset.reward==='keep')commit({kind:'reward',choice:'keep'});else{rewardPick=b.dataset.reward;render();focus('[data-replace]');}}return;}if(b.dataset.replace){playSfx('select');if(s.screen==='reward'&&rewardPick)commit({kind:'reward',choice:rewardPick,replace:b.dataset.replace});return;}if(s.screen!=='play')return;if(b.dataset.face!==undefined){const face=Number(b.dataset.face);if(selection.card&&[0,1].includes(face)){selection={...selection,face,cell:null,axis:null};render();playSfx('select');focus('[data-cell]:not(:disabled)');}return;}if(b.dataset.card){selection={card:b.dataset.card,cell:null,axis:null,face:null};render();playSfx('select');focus('[data-face]');return;}if(b.dataset.cell!==undefined){const i=Number(b.dataset.cell);const shown=selection.axis?stage(s,{card:selection.card,cell:selection.cell,axis:selection.axis,face:selection.face??0}).grid:s.grid;if(shown[i]&&i!==selection.cell){const c=def(shown[i],{...s,faces:{...s.faces,...(selection.card?{[selection.card]:selection.face??0}:{})}});show(c.name,`<p>${c.text}</p><small>يبقى هذا الفعل ثابتًا حتى تُطرح البطاقة.</small>`);return;}if(s.grid[i]){const c=def(s.grid[i],s);show(c.name,`<p>${c.text}</p>`);return;}if(!selection.card||selection.face===null)return;selection={...selection,cell:i,axis:null};render();playSfx('select');focus('[data-axis]');return;}if(b.dataset.axis){selection.axis=b.dataset.axis;render();playSfx('select');focus('[data-action="activate"]');}});
document.addEventListener('keydown',e=>{if(menu.open||s.screen!=='play')return;if(e.key==='Escape')action('cancel');if(e.key>='1'&&e.key<='4'&&!e.ctrlKey&&!e.metaKey){const b=root.querySelectorAll('[data-card]')[Number(e.key)-1];b?.click();}});
render();focus(s.screen==='title'?'[data-action="start"]':s.screen==='reward'?'[data-reward]':s.screen==='end'?'[data-action="report"]':'[data-card]');

})();