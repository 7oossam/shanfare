export const VERSION='shanfara-nexus-v7';
export const cards={
 run:{name:'اندفع',icon:'run',short:'تقدّم ٢',text:'تقدّم خطوتين نحو الزاد والمخبأ.',effects:[{op:'move',n:2}]},
 arrow:{name:'ارمِ سهمًا',icon:'bow',short:'أصب ٢',text:'أصب الحارس بضررين. تستفيد من «راوغ» إذا سبقتها في الخط.',effects:[{op:'hit',n:2}]},
 knife:{name:'قاتل بالنصل',icon:'knife',short:'أصب ٣ · اجرح نفسك ١',text:'أصب الحارس بثلاثة أضرار، واخسر صحة واحدة. الجرح إلزامي حتى عند الهروب.',effects:[{op:'hurt',n:1},{op:'hit',n:3}]},
 cover:{name:'احتمِ',icon:'cover',short:'صدّ ٣',text:'امنع ثلاثة أضرار من هجمة الحارس هذا الدور.',effects:[{op:'block',n:3}]},
 trick:{name:'راوغ',icon:'feint',short:'صدّ ١ · هجوم بعدي بنفس الخط +٢',text:'امنع ضررًا واحدًا. أول هجوم يأتي بعدها في الخط نفسه يزيد بضررين؛ تنتهي الزيادة بنهاية هذا التفعيل ولا تنتقل للدور القادم.',effects:[{op:'block',n:1},{op:'prime',n:2}]},
 friend:{name:'أنقذ رفيقك',icon:'friend',short:'فكّ قيدًا واحدًا',text:'فكّ قيدًا من قيود رفيقك الثلاثة. بعد تحريره، تصبح هذه البطاقة «غطّني» وتصدّ ضررين.',effects:[{op:'friend',n:1}]},
 shift:{name:'بدّل الخُطى',icon:'swap',short:'بدّل الخانتين الأخريين · تُطرح',text:'عند وضعها، بدّل البطاقات في الخانتين الأخريين من الخط المختار، بما فيه الفراغ، قبل تنفيذ أي فعل. الدروب والسواتر ثابتة؛ انتقال بطاقة فوق ساتر يمحوه. تُطرح هذه البطاقة بعد التفعيل.',effects:[{op:'vanish',n:1}]},
 shelter:{name:'اتّخذ ساترًا',icon:'cover',short:'صدّ ٣',text:'صدّ ثلاثة أضرار في كل تفعيل. يبقى هذا الوجه ثابتًا حتى تُطرح البطاقة؛ الوجه الآخر يترك ساترًا بدل الصدّ الآن.',effects:[{op:'block',n:3}]},
 sneak:{name:'تسلّل',icon:'sneak',short:'تقدّم ١ · صدّ ٢',text:'تقدّم خطوة واحدة وامنع ضررين. حركة أبطأ من الاندفاع، لكنها تحميك أثناء الاقتراب.',effects:[{op:'move',n:1},{op:'block',n:2}]},
 ambush:{name:'انصب كمينًا',icon:'bow',short:'أصب ٤ قبل فراغ؛ وإلا ١',text:'إذا كانت الخانة التالية مباشرة في اتجاه تفعيل الخط فارغة، أصب بأربعة أضرار؛ وإلا بضرر واحد. نهاية الخط ليست خانة فارغة.',effects:[{op:'ambush',n:4}]},
 erase:{name:'امحُ أثرك',icon:'foot',short:'تقدّم ١ · تُطرح وحدها',text:'تقدّم خطوة، ثم تُطرح هذه البطاقة حتى لو لم يمتلئ الخط. تفتح خانتها للدرب أو لإعادة البناء في التفعيل التالي.',effects:[{op:'move',n:1},{op:'vanish',n:1}]}
};
export const alternates={
 run:{name:'واثب',icon:'run',short:'تقدّم ٣ · تُطرح',text:'تقدّم ثلاث خطوات ثم اطرح البطاقة؛ دفعة أكبر مقابل فقدان مصدر حركة متكرر.',effects:[{op:'move',n:3},{op:'vanish',n:1}]},
 arrow:{name:'انسحب',icon:'foot',short:'تقدّم ٢ · تُطرح',text:'تقدّم خطوتين ثم اطرح البطاقة. تتنازل عن رماية قابلة للتكرار لتفتح خانتها.',effects:[{op:'move',n:2},{op:'vanish',n:1}]},
 knife:{name:'تسلّق',icon:'run',short:'تقدّم ٢ · جرح ١',text:'اخسر صحة وتقدّم خطوتين. تبقى للتسلق لاحقًا؛ تختار المخاطرة للعبور بدل القتال.',effects:[{op:'hurt',n:1},{op:'move',n:2}]},
 cover:{name:'تقدّم بحذر',icon:'cover',short:'تقدّم ١ · صدّ ١',text:'خطوة وصدّ ضرر واحد في كل تفعيل؛ حماية أقل من الاحتماء مقابل مصدر تقدّم متكرر.',effects:[{op:'move',n:1},{op:'block',n:1}]},
 trick:{name:'انسَلّ',icon:'sneak',short:'تقدّم ١ · صدّ ٢ · تُطرح',text:'تقدّم خطوة وصدّ ضررين ثم اطرح البطاقة. تتنازل عن بناء تقوية متكررة.',effects:[{op:'move',n:1},{op:'block',n:2},{op:'vanish',n:1}]},
 friend:{name:'شقّ الطريق',icon:'foot',short:'تقدّم ٢ · تُطرح',text:'تقدّم خطوتين ثم اطرح البطاقة. هذا الوجه لا يفك قيود الرفيق ولا يوفّر تغطيته.',effects:[{op:'move',n:2},{op:'vanish',n:1}]},
 shift:{name:'اعقد العزم',icon:'feint',short:'الهجوم التالي +٣ · تُطرح',text:'تقوية ثلاثة للهجوم التالي في الخط نفسه ثم تُطرح. لا تبدّل الخانتين بهذا الوجه.',effects:[{op:'prime',n:3},{op:'vanish',n:1}]},
 shelter:{name:'اترك ساترًا',icon:'cover',short:'ساتر ١ لاحقًا · تُطرح',text:'تُطرح وتترك في خانتها ساترًا يصد ضررًا عند تفعيل خطه لاحقًا. لا تصد ثلاثة الآن.',effects:[{op:'ward',n:1},{op:'vanish',n:1}]},
 ambush:{name:'اقتحم الممر',icon:'run',short:'تقدّم ٣ · جرح ١ · تُطرح',text:'اخسر صحة وتقدّم ثلاث خطوات ثم اطرح البطاقة. تضحّي بالكمين المتكرر لدفعة عبور عاجلة.',effects:[{op:'hurt',n:1},{op:'move',n:3},{op:'vanish',n:1}]},
 erase:{name:'امكث في الظل',icon:'sneak',short:'صدّ ٢ · الهجوم التالي +١',text:'صدّ ضررين وقوّ الهجوم التالي بواحد في الخط نفسه. تبقى؛ لا تمنح حركة ولا تفرغ خانتها.',effects:[{op:'block',n:2},{op:'prime',n:1}]},
 sneak:{name:'انقضّ',icon:'knife',short:'أصب ٢ · تقدّم ١ · تُطرح',text:'ضربة وخطوة ثم تُطرح؛ تتنازل عن التسلل المحمي المتكرر.',effects:[{op:'hit',n:2},{op:'move',n:1},{op:'vanish',n:1}]}
};
export const rewards={keep:{label:'تابع بالبطاقات الحالية'},ambush:{label:'انصب كمينًا'},erase:{label:'امحُ أثرك'},shelter:{label:'اتّخذ ساترًا'}};
export const type=uid=>uid?.split('.')[0];
export const cardType=(uid,s)=>s?.upgrades?.[uid]||type(uid);
export function def(uid,s,face=s?.faces?.[uid]??0){const k=cardType(uid,s),c=face===1?alternates[k]:cards[k];if(face===1)return c;if(k==='friend'&&s?.encounter===2&&s.friend<3)return {...c,name:'واصل وحيدًا',short:'تقدّم ١',text:'بقي رفيقك في الوادي. تتقدّم خطوة وحدك؛ لا تستطيع تحريره بعد مغادرة المواجهة الأولى.',effects:[{op:'move',n:1}]};return k==='friend'&&s?.friend===3?{...c,name:'غطّني',short:'صدّ ٢',text:'رفيقك حرّ ويغطيك من هجمة الحارس بضررين.'}:c;}
const ids=['run','arrow','knife','cover','trick','friend'].flatMap(k=>k==='knife'?['knife.0','shift.0']:[k+'.0',k+'.1']);
function random(s){s.rng=(Math.imul(s.rng,1664525)+1013904223)>>>0;return s.rng/4294967296;}
function shuffle(s,a){for(let i=a.length-1;i>0;i--){const j=Math.floor(random(s)*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function draw(s){while(s.hand.length<4){if(!s.draw.length){if(!s.discard.length)break;s.draw=shuffle(s,s.discard.splice(0));}s.hand.push(s.draw.shift());}}
export const trailCells=[0,4,8];
export function fresh(seed=20261016){const s={v:7,version:VERSION,faces:{},encounter:1,phaseTurn:1,firstResult:null,upgrades:{},rewardClaimed:false,wards:Array(9).fill(false),screen:'title',seed:seed>>>0,rng:seed>>>0,turn:1,hp:18,enemy:12,progress:0,loot:false,friend:0,grid:Array(9).fill(null),hand:['run.1','arrow.0','knife.0','friend.0'],draw:[],discard:[],outcome:null,last:null};s.grid[0]='run.0';s.grid[4]='cover.0';s.draw=shuffle(s,ids.filter(id=>!s.grid.includes(id)&&!s.hand.includes(id)));return s;}
export function lineIndices(cell,axis){return axis==='row'?[0,1,2].map(c=>Math.floor(cell/3)*3+c):[0,1,2].map(r=>r*3+cell%3);}
export const goal=s=>s.encounter===2?8:12;
export const collapseRow=s=>s.encounter===2?[2,1,0][(s.phaseTurn-1)%3]:null;
export function incoming(s){return s.encounter===2?1+(s.enemy>0?2:0)+(s.firstResult?.enemy>0?1:0):s.enemy<=0?0:2+Math.ceil(s.enemy/6);}
function enterSecond(s){s.encounter=2;s.phaseTurn=1;s.turn++;s.progress=0;s.enemy=6;for(const uid of s.grid)if(uid)s.discard.push(uid);s.grid=Array(9).fill(null);s.faces={};s.wards=Array(9).fill(false);s.outcome=null;s.screen='play';draw(s);}
function placementValid(s,a){return s.screen==='play'&&s.hand.includes(a.card)&&Number.isInteger(a.cell)&&a.cell>=0&&a.cell<9&&!s.grid[a.cell]&&['row','col'].includes(a.axis);}
export function stage(s,a){const grid=s.grid.slice(),wards=s.wards.slice(),faces={...s.faces},swaps=[],erasedWards=[];if(!placementValid(s,a))return {grid,wards,faces,swaps,erasedWards};if(wards[a.cell])erasedWards.push(a.cell);wards[a.cell]=false;grid[a.cell]=a.card;faces[a.card]=a.face??0;if(faces[a.card]===0&&cardType(a.card,s)==='shift'){const [x,y]=lineIndices(a.cell,a.axis).filter(i=>i!==a.cell);[grid[x],grid[y]]=[grid[y],grid[x]];swaps.push({from:x,to:y});for(const i of [x,y])if(grid[i]&&wards[i]){wards[i]=false;erasedWards.push(i);}}return {grid,wards,faces,swaps,erasedWards};}
export function valid(s,a){if(s.screen==='interlude')return a.kind==='continue';if(s.screen==='reward')return a.kind==='reward'&&Object.hasOwn(rewards,a.choice)&&(a.choice==='keep'?!a.replace:s.hand.includes(a.replace));return placementValid(s,a)&&!a.trace&&!a.recall&&!a.shelter&&(a.face===undefined||a.face===0||a.face===1);}
export function actions(s){if(s.screen==='interlude')return [{kind:'continue'}];if(s.screen==='reward')return [{kind:'reward',choice:'keep'},...Object.keys(rewards).filter(k=>k!=='keep').flatMap(choice=>s.hand.map(replace=>({kind:'reward',choice,replace})))];if(s.screen!=='play')return [];return s.hand.flatMap(card=>s.grid.flatMap((u,cell)=>u?[]:['row','col'].flatMap(axis=>[0,1].map(face=>({card,cell,axis,face})))));}
export function activate(state,a){if(!valid(state,a))return {state:structuredClone(state),valid:false};const s=structuredClone(state);
 if(s.screen==='interlude'){if(!s.rewardClaimed)s.screen='reward';else enterSecond(s);const summary={action:structuredClone(a),kind:'transition',line:[],effects:[],cleared:[],vanished:[],block:0,hits:0,moves:0,selfDamage:0,enemyDamage:0,log:['غادرت الوادي نحو الشِّعب.']};s.last=summary;assertState(s);return {state:s,valid:true,summary};}
 if(s.screen==='reward'){const uid=a.choice==='keep'?null:a.replace;if(uid)s.upgrades[uid]=a.choice;s.rewardClaimed=true;s.screen='play';if(s.firstResult&&s.encounter===1)enterSecond(s);const summary={action:structuredClone(a),kind:'reward',upgrade:a.choice,uid,line:[],effects:[],cleared:[],vanished:[],block:0,hits:0,moves:0,selfDamage:0,enemyDamage:0,anticipated:0,friendSaved:false,traceLeft:null,log:[uid?'البطاقة الجديدة في يدك الآن.':'تابعت بالبطاقات الحالية.']};s.last=summary;assertState(s);return {state:s,valid:true,summary};}
 const log=[],effects=[],beforeFriend=s.friend,staged=stage(state,a),erasedWard=staged.erasedWards.length>0;s.hand.splice(s.hand.indexOf(a.card),1);s.grid=staged.grid;s.wards=staged.wards;s.faces=staged.faces;if(staged.swaps.length)log.push('تبادلت الخانتان قبل تنفيذ الأفعال.');
 const cells=lineIndices(a.cell,a.axis),line=cells.filter(i=>s.grid[i]).map(i=>({cell:i,uid:s.grid[i],face:s.faces[s.grid[i]]??0,name:def(s.grid[i],s).name}));let block=0,prime=0,hits=0,moves=0,selfDamage=0;const disappear=[],wardSeeds=[];
 function move(amount){const old=s.progress;s.progress=Math.min(goal(s),s.progress+amount);moves+=s.progress-old;if(s.encounter===1&&!s.loot&&s.progress>=4){s.loot=true;log.push('الزاد معك. بقي الوصول للمخبأ.');}return s.progress-old;}
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
 if(wardSeeds.length)log.push('تركت ساترًا يبدأ في التفعيل التالي.');if(erasedWard)log.push('غطّت بطاقتك الساتر؛ زال حجب الخانة.');
 const anticipated=Math.max(0,incoming(s)-block);let enemyDamage=0;const collapsed=[],collapsedCells=[];const completed=s.encounter===1?(s.progress>=12||s.loot&&s.friend===3&&s.enemy===0):s.progress>=goal(s);
 if(s.hp<=0){s.outcome='dead';s.screen='end';}
 else if(completed){if(s.encounter===1){s.firstResult={turn:s.turn,hp:s.hp,enemy:s.enemy,friend:s.friend,loot:s.loot,route:s.enemy===0?'clear':'escape'};if(s.turn>=20){s.screen='end';s.outcome='caught';}else{s.screen='interlude';log.push(s.enemy===0?'حُسمت الأهداف؛ انتهت المواجهة فورًا.':'أفلتّ من الحارس نحو الشِّعب.');}}else{s.outcome=s.friend===3?'full':'supplies';s.screen='end';log.push('عبرت الشِّعب إلى المأمن.');}}
 else{enemyDamage=Math.min(s.hp,anticipated);s.hp-=enemyDamage;if(s.encounter===2){const row=collapseRow(s);for(let i=row*3;i<row*3+3;i++){collapsedCells.push(i);if(s.grid[i]){collapsed.push(s.grid[i]);s.discard.push(s.grid[i]);delete s.faces[s.grid[i]];s.grid[i]=null;}s.wards[i]=false;}log.push('انهار الصف المعلّم؛ طُرحت بطاقاته وزالت سواتره.');}if(s.hp<=0){s.outcome='dead';s.screen='end';}else if(s.turn>=20){s.outcome='caught';s.screen='end';log.push('طلع الفجر.');}else{s.turn++;s.phaseTurn++;draw(s);if(s.encounter===1&&s.loot&&!s.rewardClaimed)s.screen='reward';}}
 s.last={action:structuredClone(a),kind:'turn',line,effects,cleared,vanished,block,hits,moves,selfDamage,enemyDamage,anticipated,friendSaved:beforeFriend<3&&s.friend===3,traceLeft:wardSeeds.length?line.find(x=>wardSeeds.includes(x.cell))?.uid:null,erasedWard,erasedWards:staged.erasedWards,collapsed,collapsedCells,swaps:staged.swaps,unusedPrime:prime,log};assertState(s);return {state:s,valid:true,summary:s.last};}
export function start(s){return s.screen==='title'?{...structuredClone(s),screen:'play'}:s;}
export function assertState(s){const zones=[...s.hand,...s.draw,...s.discard,...s.grid.filter(Boolean)];if(zones.length!==12||new Set(zones).size!==12||zones.some(u=>!ids.includes(u)))throw Error('Card zone corruption');if(s.wards.length!==9||s.wards.some((v,i)=>typeof v!=='boolean'||v&&s.grid[i])||s.grid.length!==9||s.hand.length>4||s.hp<0||s.hp>18||s.enemy<0||s.enemy>12||s.friend<0||s.friend>3||s.progress<0||s.progress>12||Object.entries(s.upgrades).some(([uid,k])=>!ids.includes(uid)||!['ambush','erase','shelter'].includes(k))||Object.keys(s.upgrades).length>1)throw Error('Invalid resources');if(!['title','play','reward','interlude','end'].includes(s.screen)||s.screen==='reward'&&(!s.loot||s.rewardClaimed))throw Error('Invalid screen');if(Object.entries(s.faces).some(([uid,f])=>!s.grid.includes(uid)||![0,1].includes(f)))throw Error('Invalid committed face');if(![1,2].includes(s.encounter)||!Number.isInteger(s.phaseTurn)||s.phaseTurn<1||s.encounter===2&&!s.firstResult||s.screen==='interlude'&&!s.firstResult)throw Error('Invalid journey');if(s.screen==='play'&&!s.grid.includes(null))throw Error('No placement');return true;}
export function snapshot(s){const {last,...rest}=s;return structuredClone(rest);}
