export const VERSION = 'shanfara-duel-v9';
export const RULESET = 35;
export const HAND_SIZE = 3;
export const GRID_ROWS = 3, GRID_COLUMNS = 3, GRID_SIZE = 9;
export const LINES = [[2,1,0],[5,4,3],[8,7,6],[0,3,6],[1,4,7],[2,5,8]];
export const DIRECT_ATTACK_OPS = ['hit'];
export const cards = {
  strike: {name:'ضربة محسوبة',icon:'swords',kind:'attack',effects:[{op:'hit',n:2}],text:'ألحق ضررين بعدو تختاره.'},
  shelter: {name:'ساتر',icon:'shield',kind:'defense',effects:[{op:'block',n:2}],text:'احصل على درعين لرد الأعداء الحالي.'},
  advance: {name:'تقدّم محمي',icon:'swords',kind:'mixed',effects:[{op:'hit',n:1},{op:'block',n:1}],text:'ألحق ضررًا واحصل على درع. يصبح الضرر ٢ إذا اكتمل الخط المختار.'},
  cross: {name:'ضربة العارض',icon:'swords',kind:'attack',effects:[{op:'hit',n:1}],text:'ألحق ضررًا بعدو تختاره. يصبح الضرر ٣ إذا كان المحور المتعامد يحتوي على ورقة أخرى على الأقل.'},
  scout: {name:'استطلاع الأثر',icon:'arrow',kind:'utility-attack',effects:[{op:'hit',n:1}],text:'ألحق ضررًا بعدو تختاره. إذا اكتمل الخط المختار وفُرّغ، اسحب ورقة إضافية.'},
  haven: {name:'عياذ الصخر',icon:'stone',kind:'defense',effects:[{op:'block',n:1}],text:'احصل على درع واحد لرد الأعداء الحالي. إذا اكتمل الخط المختار وفُرّغ، يصبح الدرع ٣.'},
  anvil: {name:'تحصين المرقبة',icon:'stone',kind:'terrain-defense',vanish:true,effects:[{op:'block',n:1}],text:'احصل على درع واحد ثم تُفرَّغ فورًا وتبقى خانتها محصنة؛ أي ورقة تُفعَّل فيها تمنحك درعًا إضافيًا حتى يكتمل خطها. التحصين المتكرر يتراكم.'},
  scorch: {name:'إشعال النار',icon:'fire',kind:'terrain-attack',vanish:true,effects:[{op:'hit',n:1}],text:'ألحق ضررًا واحدًا ثم تُفرَّغ فورًا وتبقى خانتها مشتعلة؛ أي ورقة تُفعَّل فيها تلحق ضررًا إضافيًا حتى يكتمل خطها. الإشعال المتكرر يتراكم.'},
  aegis: {name:'جلاد الصبر',icon:'shield',kind:'defense',effects:[{op:'block',n:2}],text:'احصل على درعين لرد الأعداء الحالي. يتضاعف الدرع إلى ٤ إذا كانت صحتك ١٢ أو أقل.'},
  disrupt: {name:'إضعاف البأس',icon:'swords',kind:'disrupt-attack',effects:[{op:'hit',n:1}],text:'ألحق ضررًا واحدًا بعدو تختاره، وخفّض هجومه المعلن لهذا الدور بمقدار ١.'},
  slam: {name:'ارتطام الترس',icon:'shield',kind:'slam-attack',effects:[{op:'hit',n:0}],text:'ألحق ضررًا بعدد دِرْعك الحالي. الدرع يبقى. الترتيب مهم: يُحسب ما سبقه في الخط.'},
  raid: {name:'غارة خاطفة',icon:'arrow',kind:'attack',vanish:true,effects:[{op:'hit',n:3}],text:'ألحق ٣ ضرر بعدو تختاره، ثم تزول.'},
  rampart: {name:'سور الممر',icon:'stone',kind:'defense',vanish:true,effects:[{op:'block',n:3}],text:'احصل على ٣ درع لرد الأعداء الحالي، ثم تزول.'},
  assault: {name:'اقتحام',icon:'swords',kind:'mixed',vanish:true,effects:[{op:'hit',n:2},{op:'block',n:1}],text:'ألحق ضررين بعدو تختاره واحصل على درع، ثم تزول.'},
  sandstorm: {name:'عاصفة الرمل',icon:'spark',kind:'attack',vanish:true,effects:[{op:'hit',n:2,all:true}],text:'ألحق ٢ ضرر بكل الأعداء الأحياء، ثم تزول.'},
  stagger: {name:'قاصمة التوازن',icon:'spark',kind:'heavy-attack',effects:[{op:'hit',n:2}],text:'ألحق ضررين بعدو تختاره. إذا ألحق هذا الخط ٤ أضرار أو أكثر في هذا الدور، يتراجع هجوم العدو بمقدار ٢.'}
};
export const alternates = {}, rewards = [];
export const STARTER_TYPES = ['strike', 'shelter', 'advance'];
export const DECK_RECIPE = [
  'strike', 'shelter', 'advance',
  'strike', 'shelter', 'advance',
  'cross', 'scout', 'haven',
  'anvil', 'scorch', 'disrupt',
  'slam', 'raid', 'rampart', 'assault',
  'sandstorm'
];
export const isReward = () => false;
export const maneuverOptions = () => [];
const enemy = (id,name,hp,pattern,role='') => {
  const p = Array.isArray(pattern) ? pattern : [pattern];
  return {id, name, hp, maxHp:hp, attack:p[0], pattern:p, shield:0, role};
};
// Each encounter teaches one decision; intents repeat in the declared cycle (0 = the enemy is preparing).
export const ENCOUNTERS = [
  {name:'اختبار الإيقاع',lesson:'اقرأ النية: احتمِ قبل الضربة الكبرى واضرب حين يخف الضغط.',enemies:[enemy('tracker','صائد الأثر',14,[2,4,1],'إيقاع')]},
  {name:'كمين الممر',lesson:'اختر من تقتل أولًا: الرامي هشّ لكنه موجع.',enemies:[enemy('archer','رامي المرقب',7,[1,5],'هشّ موجع'),enemy('guard','حارس الدرب',16,[2,3],'متين')]},
  {name:'اختبار الاستعداد',lesson:'الضربة الكبرى معلنة: اجمع الدرع قبلها، وحوّله إلى ضرر.',enemies:[enemy('armor','درّاع الحيّ',26,[1,2,9],'يستعد')]},
  {name:'اختبار الاستنزاف',lesson:'معركة طويلة: ابنِ خطًا وأرضًا تعمل لك كل دور.',enemies:[enemy('elder','شيخ الغزاة',34,[2,3,5],'استنزاف')]},
  {name:'الكمين الأخير',lesson:'ثلاثة أعداء: وزّع الضرب، وأضعِف القائد قبل ضربته.',enemies:[enemy('leader','قائد الكمين',14,[2,3,0,6],'قائد'),enemy('thrower','رامي الحجارة',4,[2],'تابع'),enemy('rear','حارس الظهر',4,[1],'تابع')]}
];
export const cardType = uid => typeof uid === 'string' ? uid.split('.')[0] : undefined;
export const def = (uid,s,face = 0) => face === 0 ? cards[cardType(uid)] : undefined;
export const snapshot = s => { const {last,...rest}=s; return structuredClone(rest); };
function random(s) { s.rng=(Math.imul(s.rng,1664525)+1013904223)>>>0; return s.rng/4294967296; }
function shuffle(s,list) { const out=[...list]; for(let i=out.length-1;i>0;i--){const j=Math.floor(random(s)*(i+1));[out[i],out[j]]=[out[j],out[i]];} return out; }
// A draw is exactly one card. Grid and hand never enter the reshuffle.
export function draw(s) {
  if(!s.draw.length && s.discard.length){s.draw=shuffle(s,s.discard);s.discard=[];}
  if(!s.draw.length) return null;
  const uid=s.draw.shift();s.hand.push(uid);return uid;
}
export function setupEncounter(s,index) {
  if(!ENCOUNTERS[index-1]) throw Error('Unknown encounter');
  s.encounter=index;s.phaseTurn=1;s.hp=s.maxHp;s.grid=Array(9).fill(null);s.gridTurf=Array(9).fill(null);s.gridLevel=Array(9).fill(0);s.faces={};s.discard=[];s.hand=[];
  s.hand=STARTER_TYPES.map(type=>s.deck.find(uid=>cardType(uid)===type));
  s.draw=shuffle(s,s.deck.filter(uid=>!s.hand.includes(uid)));s.enemies=structuredClone(ENCOUNTERS[index-1].enemies);
  for(const e of s.enemies) e.attack = getEnemyIntent(e, 1).damage;
  s.screen='play';s.outcome=null;s.last=null;
}
export function fresh(seed=20261017) {
  const counts = {};
  const deck = DECK_RECIPE.map(type => {
    counts[type] = (counts[type] || 0);
    const uid = `${type}.${counts[type]}`;
    counts[type]++;
    return uid;
  });
  const s={version:VERSION,ruleset:RULESET,seed:seed>>>0,rng:seed>>>0,deck,draw:[],discard:[],hand:[],grid:Array(9).fill(null),gridTurf:Array(9).fill(null),gridLevel:Array(9).fill(0),faces:{},enemies:[],encounter:1,turn:1,phaseTurn:1,placements:0,hp:24,maxHp:24,screen:'title',outcome:null,last:null};
  setupEncounter(s,1);s.screen='title';return s;
}
export function migrateSave(before) {
  if(before?.ruleset!==RULESET || before?.version!==VERSION){const s=fresh(before?.seed??20261017);s.migrationNotice='بدأ نموذج بطاقات جديد؛ الحفظ السابق لا يطابق قواعده.';return s;}
  const s=structuredClone(before);assertState(s);return s;
}
export const start = s => s.screen==='title'?{...structuredClone(s),screen:'play'}:s;
export const attackTargets = s => s.enemies.filter(e=>e.hp>0);
export function targetForAction(s,a={}) { const alive=attackTargets(s);return alive.find(e=>e.id===a.target)?.id??alive[0]?.id??null; }
export function getEnemyIntent(e, arg1 = 1, arg2) {
  if (!e || e.hp <= 0) return { damage: 0, shield: 0, defending: false };
  const turn = typeof arg2 === 'number' ? arg2 : typeof arg1 === 'number' ? arg1 : 1;
  const pattern = Array.isArray(e.pattern) && e.pattern.length ? e.pattern : [e.attack ?? 2];
  const idx = Math.max(0, (turn - 1) % pattern.length);
  const damage = pattern[idx];
  return { damage, shield: 0, defending: false };
}
export function selectedLine(cell,axis) { return axis==='row'?LINES[Math.floor(cell/3)]:axis==='column'?LINES[3+cell%3]:null; }
export function perpendicularLine(cell,axis) { return axis==='row'?selectedLine(cell,'column'):selectedLine(cell,'row'); }
export function completedLines(grid,cell,axis) { const lines=axis?[selectedLine(cell,axis)].filter(Boolean):LINES.filter(line=>line.includes(cell));return lines.filter(line=>line.every(i=>grid[i])); }
export const placePreview = (s,a) => activate(s,a);
export function actions(s) {
  if(s.screen==='reward')return [{kind:'continue'}];
  if(s.screen!=='play')return [];
  const out=[];
  for(const card of s.hand)for(let cell=0;cell<9;cell++)if(!s.grid[cell])for(const axis of ['row','column'])for(const target of attackTargets(s))out.push({card,cell,axis,face:0,target:target.id});
  return out;
}
export function activate(before,a) {
  const invalid=()=>({valid:false,state:before,summary:null});
  if(!a || before?.version!==VERSION || before.ruleset!==RULESET)return invalid();
  if(before.screen==='end'){
    // After a defeat the same encounter can be retried with full health; the campaign is not lost.
    if((a.kind??a.type)!=='retry'||before.outcome!=='defeat')return invalid();
    const s=structuredClone(before);setupEncounter(s,s.encounter);s.last={kind:'transition',action:structuredClone(a)};assertState(s);return {valid:true,state:s,summary:s.last};
  }
  if(before.screen==='reward'){
    if((a.kind??a.type)!=='continue' || before.encounter>=ENCOUNTERS.length)return invalid();
    const s=structuredClone(before);setupEncounter(s,s.encounter+1);s.last={kind:'transition',action:structuredClone(a)};assertState(s);return {valid:true,state:s,summary:s.last};
  }
  if(before.screen!=='play'||!before.hand.includes(a.card)||!Number.isInteger(a.cell)||a.cell<0||a.cell>=9||before.grid[a.cell]||!['row','column'].includes(a.axis)||(a.face!==undefined&&a.face!==0)||(a.target!==undefined&&!attackTargets(before).some(e=>e.id===a.target)))return invalid();
  const s=structuredClone(before);
  s.gridTurf=s.gridTurf||Array(9).fill(null);s.gridLevel=s.gridLevel||Array(9).fill(0);
  const action={card:a.card,cell:a.cell,axis:a.axis,face:0,target:targetForAction(s,a)};
  if(!action.target)return invalid();
  s.hand.splice(s.hand.indexOf(a.card),1);s.grid[a.cell]=a.card;s.faces[a.card]=0;s.placements++;
  const line=selectedLine(a.cell,a.axis),cells=line.filter(i=>s.grid[i]),
    // A vanishing (⏳) card passes through: it fires with the line, leaves, and never completes it.
    complete=cells.length===3&&!cells.some(c=>def(s.grid[c]).vanish);
  const summary={kind:'turn',action,cells,lines:complete?[line]:[],clearedCells:[],events:[],effects:[],cleared:[],hits:0,block:0,incoming:0,prevented:0,unusedBlock:0,enemyDamage:0,log:[],drawn:null,enemyAttackReduction:0,reductions:{},targetHits:0};
  let extraDraws=0;const ignitions=[],vanishing=[];
  for(const cell of cells){
    const uid=s.grid[cell],d=def(uid),qualified=complete,type=cardType(uid);
    summary.events.push({type:'activate',cell,card:uid});
    if(d.vanish)vanishing.push(cell);
    const turf=s.gridTurf[cell],level=turf?(s.gridLevel[cell]||1):0,heat=turf==='scorched'?level:0;
    if(turf==='fortified'){
      summary.block+=level;summary.events.push({type:'shield',cell,amount:level,value:summary.block,source:'turf-fortified',target:'hero'});
    }
    if(type==='anvil')ignitions.push({cell,turf:'fortified',level:(turf==='fortified'?level:0)+1});
    else if(type==='scorch')ignitions.push({cell,turf:'scorched',level:(turf==='scorched'?level:0)+1});
    for(const effect of d.effects){
      let n=effect.n;
      if(type==='advance'&&effect.op==='hit'&&qualified) n=2;
      else if(type==='cross'&&effect.op==='hit'){
        const perp=perpendicularLine(cell,a.axis);
        n=perp.some(idx=>idx!==cell&&s.grid[idx])?3:1;
      }
      else if(type==='haven'&&effect.op==='block'&&qualified) n=3;
      else if(type==='slam'&&effect.op==='hit') n=summary.block;
      else if(type==='scout'&&qualified) extraDraws++;
      else if(type==='aegis'&&effect.op==='block') n=s.hp<=12?4:2;
      else if(type==='disrupt'){summary.enemyAttackReduction+=1;summary.reductions[action.target]=(summary.reductions[action.target]||0)+1;summary.events.push({type:'weaken',cell,target:action.target,amount:1});}
      summary.effects.push({uid,card:uid,cell,op:effect.op,n,amount:n,target:effect.op==='hit'?action.target:'hero'});
      if(effect.op==='block'){summary.block+=n;summary.events.push({type:'shield',cell,amount:n,value:summary.block,target:'hero'});}
      else {
        // «شامل»: the same hit lands on every living enemy; otherwise only on the chosen target.
        const victims=effect.all?s.enemies.filter(e=>e.hp>0):[s.enemies.find(e=>e.id===action.target)].filter(e=>e&&e.hp>0);
        for(const target of victims){
          const amount=Math.min(target.hp,n);target.hp-=amount;summary.hits+=amount;
          if(target.id===action.target)summary.targetHits+=amount;
          summary.events.push({type:'damage',cell,source:uid,target:target.id,amount,hp:target.hp,fatal:target.hp===0});
        }
      }
    }
    if(d.vanish)summary.events.push({type:'vanish',cell,card:uid});
    if(heat){
      const target=s.enemies.find(e=>e.id===action.target);
      if(target&&target.hp>0){
        const amount=Math.min(target.hp,heat);target.hp-=amount;summary.hits+=amount;summary.targetHits+=amount;
        summary.effects.push({uid,card:uid,cell,op:'hit',n:heat,amount,target:action.target,source:'turf-scorched'});
        summary.events.push({type:'damage',cell,source:'turf-scorched',target:target.id,amount,hp:target.hp,fatal:target.hp===0});
      }
    }
  }
  const hasStagger=cells.some(c=>cardType(s.grid[c])==='stagger');
  if(hasStagger&&summary.targetHits>=4){
    summary.enemyAttackReduction+=2;summary.reductions[action.target]=(summary.reductions[action.target]||0)+2;summary.events.push({type:'stagger',amount:2,target:action.target});
  }
  // A vanishing card is spent as soon as it fires; a completed selected line is spent too.
  const leaving=new Set(vanishing);
  if(complete)for(const cell of line)leaving.add(cell);
  for(const cell of line){
    if(!leaving.has(cell)||!s.grid[cell])continue;
    const uid=s.grid[cell];summary.cleared.push(uid);summary.clearedCells.push(cell);s.discard.push(uid);s.grid[cell]=null;delete s.faces[uid];
    if(complete&&s.gridTurf[cell]){s.gridTurf[cell]=null;s.gridLevel[cell]=0;}
  }
  for(const {cell,turf,level} of ignitions){s.gridTurf[cell]=turf;s.gridLevel[cell]=level;summary.events.push({type:turf==='scorched'?'ignite':'fortify',cell,level});}
  let shield=summary.block;
  for(const e of attackTargets(s)){
    const rawDamage=getEnemyIntent(e, s.phaseTurn).damage;
    const damage=Math.max(0,rawDamage-(summary.reductions[e.id]||0));
    const blocked=Math.min(shield,damage),lost=Math.min(s.hp,damage-blocked);
    shield-=blocked;s.hp-=lost;summary.incoming+=damage;summary.prevented+=blocked;summary.enemyDamage+=lost;
    summary.events.push({type:'enemy-attack',source:e.id,amount:damage,rawDamage,blocked,damage:lost,hp:s.hp,shield});
  }
  summary.unusedBlock=shield;
  summary.drawn=draw(s);
  if(extraDraws) draw(s);
  s.turn++;s.phaseTurn++;
  for(const e of s.enemies) e.attack = getEnemyIntent(e, s.phaseTurn).damage;
  if(s.hp<=0){s.screen='end';s.outcome='defeat';}
  else if(!attackTargets(s).length){s.screen=s.encounter===ENCOUNTERS.length?'end':'reward';s.outcome=s.screen==='end'?'victory':null;}
  summary.log=[`ضرر ${summary.hits} · حماية ${summary.block} · خسارة صحة ${summary.enemyDamage}`];s.last=summary;assertState(s);return {valid:true,state:s,summary};
}
export function assertState(s) {
  if(s.version!==VERSION||s.ruleset!==RULESET)throw Error('Invalid ruleset');
  if(!Array.isArray(s.grid)||s.grid.length!==9)throw Error('Invalid grid');
  if(!Number.isInteger(s.hp)||s.hp<0||s.hp>s.maxHp)throw Error('Invalid health');
  if(!['title','play','reward','end'].includes(s.screen)||!ENCOUNTERS[s.encounter-1])throw Error('Invalid screen or encounter');
  if(s.deck.length!==DECK_RECIPE.length||new Set(s.deck).size!==s.deck.length||s.deck.some(uid=>!def(uid)))throw Error('Invalid roster');
  const zones=[...s.hand,...s.draw,...s.discard,...s.grid.filter(Boolean)];
  if(zones.length!==s.deck.length||new Set(zones).size!==zones.length||zones.some(uid=>!s.deck.includes(uid)||!def(uid)))throw Error('Invalid card zones');
  if(Object.values(s.faces).some(face=>face!==0))throw Error('Alternate faces removed');
  if(!Array.isArray(s.enemies)||!s.enemies.length||s.enemies.some(e=>!Number.isInteger(e.hp)||e.hp<0||e.hp>e.maxHp||!Number.isInteger(e.attack)||e.attack<0))throw Error('Invalid enemies');
  return true;
}
