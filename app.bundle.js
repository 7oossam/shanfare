(function() {
  'use strict';
  // --- icons.mjs ---
const paths = {
  risk: 'M12 3L23 22H1L12 3zM12 9v6M12 18h.01',
  expand: 'M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5',
  contract: 'M3 8h5V3M16 3v5h5M8 21v-5H3M21 16h-5v5',
  exhaust: 'M6 2h10l4 4v16H4V2h2M14 2v6h6M2 2l20 20',
  sound: 'M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14',
  mute: 'M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6',
  swap: 'M3 7h17M16 3l4 4-4 4M21 17H4M8 13l-4 4 4 4',
  heart: 'M12 21S2 15 2 8c0-6 8-7 10-2 2-5 10-4 10 2 0 7-10 13-10 13z',
  bag: 'M8 3h8l-2 5 5 5c5 9-19 9-14 0l5-5zM9 8h6M9 15h6',
  cave: 'M2 21l3-12 7-6 7 6 3 12H2zM8 21v-8l4-3 4 3v8',
  moon: 'M20 15A9 9 0 0 1 9 4 9 9 0 1 0 20 15z',
  chain: 'M9 8l2-3c5-5 12 2 7 7l-3 2M15 16l-2 3C8 24 1 17 6 12l3-2M8 16l8-8',
  sneak: 'M3 16c4-9 6 6 10-3s5 0 8-7M5 21h4M14 21h4',
  bow: 'M4 3c21 2 21 16 0 18L15 12 4 3zM3 12h18M18 9l3 3-3 3',
  arrow: 'M4 20L20 4M12 4h8v8M4 14v6h6',
  knife: 'M5 19l5-5M8 16l-3-3M10 14l8-10 2 2-6 10z',
  cover: 'M12 3l8 3v6c0 5-8 9-8 9s-8-4-8-9V6zM8 11l3 3 5-6',
  feint: 'M3 8c8-12 8 18 18 6M3 14c8-12 8 10 18-6',
  friend: 'M9 6a3 3 0 1 0 6 0a3 3 0 1 0-6 0M6 21v-7c0-5 12-5 12 0v7M9 15v6M15 15v6',
  grid: 'M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18',
  // High polish thematic icons
  wolf: 'M4 7l4 4-2 6 6-2 4 4 4-4 6 2-2-6 4-4-5-3-5 5-5-5zM9 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm6 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  bleed: 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z',
  poison: 'M12 2v6m0 4v2m-6 2a6 6 0 1 0 12 0c0-3.3-2.7-6-6-6s-6 2.7-6 6zm3-1h.01m5.99 0h.01M9 18s1 1.5 3 1.5 3-1.5 3-1.5',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  fire: 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z',
  stone: 'M3 20h18L17 5l-5 6-3-4-6 13z',
  waterskin: 'M9 3h6v3H9zm-2 5h10c2 3 3 8 0 12-2 3-8 3-10 0-3-4-2-9 0-12z',
  bracer: 'M6 4h12l-2 16H8zm2 5h8m-7 5h6m-5 4h4',
  covenant: 'M12 4a8 8 0 1 0 8 8 8 8 0 0 0-8-8zm0 4a4 4 0 1 1-4 4 4 4 0 0 1 4-4z',
  swords: 'M14.5 17.5L3 6V3h3l11.5 11.5m-5 0l2 2m-4-4l2 2M6 21l3-3m-6 0l3 3M18 3h3v3l-7 7-2-2 6-6z',
  spark: 'M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z'
};

const icon = id => `<svg class="icon icon-${id}" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[id] || paths.grid}"/></svg>`;


// --- engine.mjs ---
const VERSION = 'shanfara-duel-v9';
const RULESET = 34;
const HAND_SIZE = 3;
const GRID_ROWS = 3, GRID_COLUMNS = 3, GRID_SIZE = 9;
const LINES = [[2,1,0],[5,4,3],[8,7,6],[0,3,6],[1,4,7],[2,5,8]];
const DIRECT_ATTACK_OPS = ['hit'];
const cards = {
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
  stagger: {name:'قاصمة التوازن',icon:'spark',kind:'heavy-attack',effects:[{op:'hit',n:2}],text:'ألحق ضررين بعدو تختاره. إذا ألحق هذا الخط ٤ أضرار أو أكثر في هذا الدور، يتراجع هجوم العدو بمقدار ٢.'}
};
const alternates = {}, rewards = [];
const STARTER_TYPES = ['strike', 'shelter', 'advance'];
const DECK_RECIPE = [
  'strike', 'shelter', 'advance',
  'strike', 'shelter', 'advance',
  'cross', 'scout', 'haven',
  'anvil', 'scorch', 'disrupt',
  'slam', 'raid', 'rampart', 'assault'
];
const isReward = () => false;
const maneuverOptions = () => [];
const enemy = (id,name,hp,pattern,role='') => {
  const p = Array.isArray(pattern) ? pattern : [pattern];
  return {id, name, hp, maxHp:hp, attack:p[0], pattern:p, shield:0, role};
};
// Each encounter teaches one decision; intents repeat in the declared cycle (0 = the enemy is preparing).
const ENCOUNTERS = [
  {name:'اختبار الإيقاع',lesson:'اقرأ النية: احتمِ قبل الضربة الكبرى واضرب حين يخف الضغط.',enemies:[enemy('tracker','صائد الأثر',14,[2,4,1],'إيقاع')]},
  {name:'كمين الممر',lesson:'اختر من تقتل أولًا: الرامي هشّ لكنه موجع.',enemies:[enemy('archer','رامي المرقب',7,[1,5],'هشّ موجع'),enemy('guard','حارس الدرب',16,[2,3],'متين')]},
  {name:'اختبار الاستعداد',lesson:'الضربة الكبرى معلنة: اجمع الدرع قبلها، وحوّله إلى ضرر.',enemies:[enemy('armor','درّاع الحيّ',26,[1,2,9],'يستعد')]},
  {name:'اختبار الاستنزاف',lesson:'معركة طويلة: ابنِ خطًا وأرضًا تعمل لك كل دور.',enemies:[enemy('elder','شيخ الغزاة',34,[2,3,5],'استنزاف')]},
  {name:'الكمين الأخير',lesson:'ثلاثة أعداء: وزّع الضرب، وأضعِف القائد قبل ضربته.',enemies:[enemy('leader','قائد الكمين',14,[2,3,0,6],'قائد'),enemy('thrower','رامي الحجارة',4,[2],'تابع'),enemy('rear','حارس الظهر',4,[1],'تابع')]}
];
const cardType = uid => typeof uid === 'string' ? uid.split('.')[0] : undefined;
const def = (uid,s,face = 0) => face === 0 ? cards[cardType(uid)] : undefined;
const snapshot = s => { const {last,...rest}=s; return structuredClone(rest); };
function random(s) { s.rng=(Math.imul(s.rng,1664525)+1013904223)>>>0; return s.rng/4294967296; }
function shuffle(s,list) { const out=[...list]; for(let i=out.length-1;i>0;i--){const j=Math.floor(random(s)*(i+1));[out[i],out[j]]=[out[j],out[i]];} return out; }
// A draw is exactly one card. Grid and hand never enter the reshuffle.
function draw(s) {
  if(!s.draw.length && s.discard.length){s.draw=shuffle(s,s.discard);s.discard=[];}
  if(!s.draw.length) return null;
  const uid=s.draw.shift();s.hand.push(uid);return uid;
}
function setupEncounter(s,index) {
  if(!ENCOUNTERS[index-1]) throw Error('Unknown encounter');
  s.encounter=index;s.phaseTurn=1;s.hp=s.maxHp;s.grid=Array(9).fill(null);s.gridTurf=Array(9).fill(null);s.gridLevel=Array(9).fill(0);s.faces={};s.discard=[];s.hand=[];
  s.hand=STARTER_TYPES.map(type=>s.deck.find(uid=>cardType(uid)===type));
  s.draw=shuffle(s,s.deck.filter(uid=>!s.hand.includes(uid)));s.enemies=structuredClone(ENCOUNTERS[index-1].enemies);
  for(const e of s.enemies) e.attack = getEnemyIntent(e, 1).damage;
  s.screen='play';s.outcome=null;s.last=null;
}
function fresh(seed=20261017) {
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
function migrateSave(before) {
  if(before?.ruleset!==RULESET || before?.version!==VERSION){const s=fresh(before?.seed??20261017);s.migrationNotice='بدأ نموذج بطاقات جديد؛ الحفظ السابق لا يطابق قواعده.';return s;}
  const s=structuredClone(before);assertState(s);return s;
}
const start = s => s.screen==='title'?{...structuredClone(s),screen:'play'}:s;
const attackTargets = s => s.enemies.filter(e=>e.hp>0);
function targetForAction(s,a={}) { const alive=attackTargets(s);return alive.find(e=>e.id===a.target)?.id??alive[0]?.id??null; }
function getEnemyIntent(e, arg1 = 1, arg2) {
  if (!e || e.hp <= 0) return { damage: 0, shield: 0, defending: false };
  const turn = typeof arg2 === 'number' ? arg2 : typeof arg1 === 'number' ? arg1 : 1;
  const pattern = Array.isArray(e.pattern) && e.pattern.length ? e.pattern : [e.attack ?? 2];
  const idx = Math.max(0, (turn - 1) % pattern.length);
  const damage = pattern[idx];
  return { damage, shield: 0, defending: false };
}
function selectedLine(cell,axis) { return axis==='row'?LINES[Math.floor(cell/3)]:axis==='column'?LINES[3+cell%3]:null; }
function perpendicularLine(cell,axis) { return axis==='row'?selectedLine(cell,'column'):selectedLine(cell,'row'); }
function completedLines(grid,cell,axis) { const lines=axis?[selectedLine(cell,axis)].filter(Boolean):LINES.filter(line=>line.includes(cell));return lines.filter(line=>line.every(i=>grid[i])); }
const placePreview = (s,a) => activate(s,a);
function actions(s) {
  if(s.screen==='reward')return [{kind:'continue'}];
  if(s.screen!=='play')return [];
  const out=[];
  for(const card of s.hand)for(let cell=0;cell<9;cell++)if(!s.grid[cell])for(const axis of ['row','column'])for(const target of attackTargets(s))out.push({card,cell,axis,face:0,target:target.id});
  return out;
}
function activate(before,a) {
  const invalid=()=>({valid:false,state:before,summary:null});
  if(!a || before?.version!==VERSION || before.ruleset!==RULESET)return invalid();
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
  const summary={kind:'turn',action,cells,lines:complete?[line]:[],clearedCells:[],events:[],effects:[],cleared:[],hits:0,block:0,incoming:0,prevented:0,unusedBlock:0,enemyDamage:0,log:[],drawn:null,enemyAttackReduction:0,reductions:{}};
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
      else if(type==='disrupt'){summary.enemyAttackReduction+=1;summary.reductions[action.target]=(summary.reductions[action.target]||0)+1;}
      summary.effects.push({uid,card:uid,cell,op:effect.op,n,amount:n,target:effect.op==='hit'?action.target:'hero'});
      if(effect.op==='block'){summary.block+=n;summary.events.push({type:'shield',cell,amount:n,value:summary.block,target:'hero'});}
      else {
        const target=s.enemies.find(e=>e.id===action.target);
        if(!target||target.hp<=0)continue;
        const amount=Math.min(target.hp,n);target.hp-=amount;summary.hits+=amount;
        summary.events.push({type:'damage',cell,source:uid,target:target.id,amount,hp:target.hp,fatal:target.hp===0});
      }
    }
    if(heat){
      const target=s.enemies.find(e=>e.id===action.target);
      if(target&&target.hp>0){
        const amount=Math.min(target.hp,heat);target.hp-=amount;summary.hits+=amount;
        summary.effects.push({uid,card:uid,cell,op:'hit',n:heat,amount,target:action.target,source:'turf-scorched'});
        summary.events.push({type:'damage',cell,source:'turf-scorched',target:target.id,amount,hp:target.hp,fatal:target.hp===0});
      }
    }
  }
  const hasStagger=cells.some(c=>cardType(s.grid[c])==='stagger');
  if(hasStagger&&summary.hits>=4){
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
function assertState(s) {
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


// --- report.mjs ---

const begin = s => ({ version: VERSION, initial: snapshot(s), events: [], final: snapshot(s), coverage: 'complete' });
function record(r, before, action, result) { return { ...r, events: [...r.events, { action: structuredClone(action), after: snapshot(result.state), summary: result.summary }], final: snapshot(result.state) }; }
function restore(raw, s) {
  try {
    if (raw?.version === VERSION) {
      let state = raw.initial;
      for (const e of raw.events) { const r = activate(state, e.action); if (!r.valid || JSON.stringify(snapshot(r.state)) !== JSON.stringify(e.after)) throw Error(); state = r.state; }
      if (JSON.stringify(snapshot(state)) === JSON.stringify(snapshot(s))) return raw;
    }
  } catch {}
  return { ...begin(s), coverage: 'partial' };
}
const textReport = r => JSON.stringify(r, null, 2);


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

      case 'hurt': {
        const osc=c.createOscillator(), gain=c.createGain();osc.type='triangle';osc.frequency.setValueAtTime(95,now);osc.frequency.exponentialRampToValueAtTime(35,now+.14);gain.gain.setValueAtTime(.18,now);gain.gain.exponentialRampToValueAtTime(.001,now+.16);osc.connect(gain);gain.connect(c.destination);osc.start(now);osc.stop(now+.17);break;
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


// --- fullscreen.mjs ---
// Fullscreen must be requested synchronously from a user gesture.
let landscapeLocked = false;
const fullscreenActive = () => typeof document !== 'undefined' && !!(document.fullscreenElement || document.webkitFullscreenElement);
const fullscreenSupported = () => typeof document !== 'undefined' && !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen);
const enterGameFullscreen = async () => {
  if (fullscreenActive()) return { ok: true };
  if (!fullscreenSupported()) return { ok: false, reason: 'unsupported' };
  try {
    const element = document.documentElement;
    if (element.requestFullscreen) await element.requestFullscreen({ navigationUI: 'hide' });
    else await element.webkitRequestFullscreen();
    if (typeof screen !== 'undefined' && screen.orientation?.lock) {
      try { await screen.orientation.lock('landscape'); landscapeLocked = true; } catch {}
    }
    return { ok: fullscreenActive() };
  } catch { return { ok: false, reason: 'denied' }; }
};
const releaseLandscapeLock = () => {
  if (!fullscreenActive() && landscapeLocked) {
    try { screen.orientation?.unlock?.(); } catch {}
    landscapeLocked = false;
  }
};
const exitGameFullscreen = async () => {
  try {
    if (document.exitFullscreen) await document.exitFullscreen();
    else await document.webkitExitFullscreen?.();
    releaseLandscapeLock(); return { ok: true };
  } catch { return { ok: false, reason: 'denied' }; }
};


// --- combat-feedback.mjs ---

const combatNumber = n => new Intl.NumberFormat('ar-SA', {useGrouping:false}).format(n);
function combatTimeline(summary, reduced = false) {
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
function playCombatFeedback({root,summary,onComplete,onSound = () => {},reduced = false}) {
  const arena = root.querySelector('.battle-arena');
  if (!arena) {onComplete();return () => {};}
  const layer = document.createElement('div');layer.className='combat-fx';layer.setAttribute('aria-hidden','true');arena.append(layer);
  const timers = new Set();let cancelled=false;const lanes=new Map();
  const later=(fn,ms)=>{const id=setTimeout(()=>{timers.delete(id);if(!cancelled)fn();},ms);timers.add(id);};
  const unit=target=>target==='hero'?root.querySelector('.hero-combatant'):root.querySelector(`[data-target="${target}"]`);
  const pulse=(element,name,duration=320)=>{if(!element)return;element.classList.remove(name);void element.offsetWidth;element.classList.add(name);later(()=>element.classList.remove(name),duration);};
  const hp=(target,value)=>{const element=unit(target);const count=target==='hero'?element?.querySelector('[data-hero-hp]'):element?.querySelector('[data-enemy-hp]');const max=Number(element?.dataset.maxHp)||24;if(count)count.textContent=`${combatNumber(value)} / ${combatNumber(max)}`;const bar=element?.querySelector('.hp-track i');if(bar)bar.style.width=`${value/max*100}%`;if(target==='hero'){const header=root.querySelector('[data-player-hp]');if(header)header.textContent=`${combatNumber(value)} / ${combatNumber(max)}`;}};
  const anchor=target=>{const element=unit(target);const a=arena.getBoundingClientRect();const r=element?.getBoundingClientRect();return r?{x:r.left-a.left+r.width*(target==='hero'?.54:.5),y:r.top-a.top+r.height*.25}:{x:a.width*.3,y:a.height*.4};};
  const pop=(target,amount,kind,label,ico)=>{if(!amount)return;const {x,y}=anchor(target);const lane=(lanes.get(target)??0)%3;lanes.set(target,lane+1);const node=document.createElement('div');node.className=`combat-pop pop-${kind}${reduced?' is-still':''}`;node.dataset.amount=amount;node.dataset.target=target;const dx=target==='hero'?(kind==='blocked'?48:kind==='damage'?-38:kind==='shield'?-46:6):[0,-24,24][lane];const dy=target==='hero'?8:lane*20;node.style.left=`${x+dx}px`;node.style.top=`${Math.max(42,y+dy)}px`;node.innerHTML=`<span class="pop-value" dir="ltr">${kind==='shield'||kind==='heal'||kind==='momentum'?'+':kind==='damage'?'−':''}${combatNumber(amount)}${icon(ico)}</span><small>${label}</small>`;layer.append(node);later(()=>node.remove(),1050);};
  const impact=(target,kind)=>{const {x,y}=anchor(target);const node=document.createElement('span');node.className=`combat-impact impact-${kind}`;node.style.left=`${x}px`;node.style.top=`${y+15}px`;node.innerHTML=Array.from({length:6},(_,i)=>`<i style="--angle:${i*60}deg"></i>`).join('');layer.append(node);later(()=>node.remove(),450);};
  const shield=document.createElement('div');shield.className='combat-shield';shield.innerHTML=`${icon('shield')}<b>٠</b><small>درع</small>`;layer.append(shield);
  const setShield=value=>{const {x,y}=anchor('hero');shield.style.left=`${x-45}px`;shield.style.top=`${y+45}px`;shield.querySelector('b').textContent=combatNumber(value);shield.classList.toggle('is-visible',value>0);};
  const process=event=>{
    if(event.type==='activate')pulse(root.querySelector(`[data-cell="${event.cell}"]`),'is-firing');
    else if(event.type==='risk')pulse(root.querySelector(`[data-cell="${event.cell}"]`),'is-risk-triggered',400);
    else if(event.type==='damage'){hp(event.target,event.hp);pop(event.target,event.amount,event.source==='bleed'?'bleed':'damage',event.source==='bleed'?'نزيف':'ضرر',event.source==='bleed'?'bleed':'swords');impact(event.target,event.source==='bleed'?'bleed':'hit');pulse(unit(event.target),'is-hit');onSound(event.source==='bleed'?'knife':'hit');if(event.fatal)later(()=>unit(event.target)?.classList.add('is-fallen'),150);}
    else if(event.type==='shield'){setShield(event.value);pop('hero',event.amount,'shield','درع','shield');pulse(shield,'shield-gained');onSound('guard');}
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


// --- view.mjs ---



const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = n => new Intl.NumberFormat('ar-SA', { useGrouping: false }).format(n);
const ratio = (a, b) => `<bdi dir="ltr">${num(a)} / ${num(b)}</bdi>`;
const button = (label, action, cls = '', disabled = false, aria = '') => `<button class="${cls}" data-action="${action}" ${disabled ? 'disabled' : ''} ${aria ? `aria-label="${esc(aria)}"` : ''}>${label}</button>`;
const ASSET_ROOT = typeof document === 'undefined' ? 'assets/landscape/' : new URL('assets/landscape/', document.currentScript?.src || location.href).href;
const style = (x, y, w, h, W = 1672, H = 941) => `background-size:${W / w * 100}% ${H / h * 100}%;background-position:${x / (W - w) * 100}% ${y / (H - h) * 100}%`;
const slice = (x, y, w, h, cls = '', source = 'layout-reference.png', W = 1672, H = 941) => `<span class="art-slice ${cls}" aria-hidden="true" style="background-image:url('${ASSET_ROOT}${source}');${style(x, y, w, h, W, H)}"></span>`;
const stat = (value, ico, cls = '') => `<span class="icon-stat ${cls}" dir="ltr"><b>${num(value)}</b>${icon(ico)}</span>`;
function fullscreenButton() {
  const active = fullscreenActive();
  return `<button class="fullscreen-button ${active ? 'is-fullscreen' : ''}" data-action="fullscreen" aria-pressed="${active}" aria-label="${active ? 'الخروج من ملء الشاشة' : 'إخفاء شريط المتصفح وملء الشاشة'}">${icon(active ? 'contract' : 'expand')}<span>${active ? 'تصغير' : 'ملء الشاشة'}</span></button>`;
}
function preview(s, p) {
  if (!p.card || !Number.isInteger(p.cell) || !p.axis) return null;
  const result = activate(s, {card:p.card,cell:p.cell,axis:p.axis,face:0,target:targetForAction(s,p)});
  return result.valid ? result : null;
}
function effectFormula(uid, s, face = 0, projected = null) {
  const c = def(uid,s);
  if (cardType(uid) === 'slam' && !projected) return `<span class="icon-stat" dir="ltr">${icon('shield')}<span class="effect-divider">⟶</span>${icon('swords')}</span>`;
  return c.effects.map(f => {
    const actual = projected?.summary.effects.find(e=>e.uid===uid&&e.op===f.op);
    const value = actual?.amount ?? f.n;
    return stat(value, f.op==='block'?'shield':'swords');
  }).join('<span class="effect-divider">·</span>');
}
function cardArt(uid,s,cls='') {
  return `<span class="focus-art card-art-${cardType(uid)} ${cls}" aria-hidden="true">${icon(def(uid,s).icon)}</span>`;
}
function header(s) {
  return `<header class="game-header">${slice(0,0,1672,75,'template-art','blank-template.png')}
    <div class="player-resources"><span class="health-count" aria-label="الصحة">${icon('heart')}<span data-player-hp>${ratio(s.hp,s.maxHp)}</span></span></div>
    <h1>${esc(ENCOUNTERS[s.encounter-1].name)}<small>اختبار ${num(s.encounter)} / ${num(ENCOUNTERS.length)}</small></h1>
    ${fullscreenButton()}${button(slice(1585,19,45,45),'menu','settings-button',false,'قائمة اللعبة')}
  </header>`;
}
function board(s,p,projected,animation) {
  const grid=animation?.grid??[...s.grid];
  if(projected)grid[p.cell]=p.card;
  const chosen=projected?.summary.cells??animation?.activeCells??[];
  const complete=!!projected?.summary.lines.length;
  return `<aside class="command-panel">${slice(1142,76,526,554,'template-art','blank-template.png')}
    <div class="panel-heading"><h2>شبكة التوليفات</h2>${button('؟','help','help-button',false,'شرح اللعب')}</div>
    <div class="axis-controls" role="group" aria-label="اتجاه التفعيل">
      ${['row','column'].map(axis=>`<button data-axis="${axis}" aria-pressed="${p.axis===axis}" ${animation?'disabled':''}>${axis==='row'?'صف ←':'عمود ↓'}</button>`).join('')}
    </div>
    <div class="grid-wrap"><div class="duel-grid ${animation?'is-resolving':''}" role="group" aria-label="شبكة ثلاثة صفوف وثلاثة أعمدة">${grid.map((uid,cell)=>{
      const c=uid?def(uid,s):null;
      const turf=s.gridTurf?.[cell];
      const turfCls=turf==='fortified'?'is-fortified':turf==='scorched'?'is-scorched':'';
      const turfBadge=turf==='fortified'?`<span class="turf-icon turf-fortified">${icon('stone')}${(s.gridLevel?.[cell]||1)>1?`<b class="turf-level">${num(s.gridLevel[cell])}</b>`:''}</span>`:turf==='scorched'?`<span class="turf-icon turf-scorched">${icon('fire')}${(s.gridLevel?.[cell]||1)>1?`<b class="turf-level">${num(s.gridLevel[cell])}</b>`:''}</span>`:'';
      return `<button class="grid-cell ${uid?'has-card':''} ${turfCls} ${chosen.includes(cell)?'in-line':''} ${animation?.cells.includes(cell)?'will-clear':''} ${projected&&p.cell===cell?'is-preview':''}" data-cell="${cell}" aria-label="الخانة ${num(cell+1)}${turf==='fortified'?'، محصنة'+((s.gridLevel?.[cell]||1)>1?' ×'+num(s.gridLevel[cell]):''):turf==='scorched'?'، مشتعلة'+((s.gridLevel?.[cell]||1)>1?' ×'+num(s.gridLevel[cell]):''):''}${c?'، '+esc(c.name):' فارغة'}" ${animation?'disabled':''}>
      ${turfBadge}
      ${c?`<span class="slot-symbol">${icon(c.icon)}</span><strong>${esc(c.name)}</strong>`:'<span class="empty-plus">+</span>'}
      ${chosen.includes(cell)?`<b class="line-order">${num(chosen.indexOf(cell)+1)}</b>`:''}</button>`;
    }).join('')}</div></div>
    <div class="board-feedback" aria-live="polite">${animation?'<strong>جارٍ تنفيذ التوليفة…</strong>':projected?`<strong>${complete?'خط مكتمل · يتفعّل ثم يُفرّغ':'يتفعّل المختار · البطاقات تبقى'}</strong>${combatForecast(projected.summary)}`:`<strong>${!p.card?'اختر بطاقة':!p.axis?'اختر صفًا أو عمودًا':'اختر خانة فارغة'}</strong><small>صف: يمين ← يسار · عمود: أعلى ↓ أسفل</small>`}</div>
    ${button('نفّذ التوليفة','confirm-play','confirm-play gold-button',!projected||!!animation)}
  </aside>`;
}
function hand(s,p,projected,busy) {
  return `<section class="hand-panel" aria-label="بطاقات اليد">${slice(0,635,1672,306,'template-art','blank-template.png')}<div class="hand-cards">${s.hand.map(uid=>{
    const selected=p.card===uid,c=def(uid,s);
    return `<article class="duel-card ${selected?'is-selected':''}" data-hand-card="${uid}"><button class="card-art-button" data-card="${uid}" ${busy?'disabled':''} aria-label="اختر ${esc(c.name)}">${cardArt(uid,s,'hand-art')}</button><div class="card-name"><strong>${esc(c.name)}</strong>${c.vanish?'<span class="vanish-badge" title="تزول بعد التفعيل">⏳ تزول</span>':''}<button class="card-details" data-info="${uid}" aria-label="شرح ${esc(c.name)}">ⓘ</button></div>
    <button class="card-face ${selected?'is-active':''}" data-card="${uid}" aria-pressed="${selected}" ${busy?'disabled':''} aria-label="${esc(c.text)}"><span class="face-effect">${effectFormula(uid,s,0,selected?projected:null)}</span></button>
    <small class="card-rule">${esc(c.text)}</small></article>`;
  }).join('')}</div></section>`;
}
function rotationHint(){return `<div class="rotate-hint"><span>⤾</span><strong>أدر الجهاز أفقيًا</strong><p>لتظهر المواجهة والشبكة والبطاقات كاملة</p></div>`;}
function gameView(s,p,animation=null){const projected=animation?null:preview(s,p);return `<main class="duel-app" data-version="35">${header(s)}<div class="main-stage">${arena(s,p,projected,animation)}${board(s,p,projected,animation)}</div>${hand(s,p,projected,!!animation)}${rotationHint()}</main>`;}
function titleView(s){return `<main class="landing">${slice(4,76,1136,552,'landing-scene')}<div class="landing-paper"><span class="eyebrow">حُماة الممرات · مختبر التوليفات</span><h1>الشنفرى</h1><p>ضع بطاقة واختر صفّها أو عمودها. ابنِ توليفتك، ثم أكمل الخط لاستثماره.</p>${s.migrationNotice?'<small class="migration-notice">تغيّرت البطاقات والقواعد؛ تبدأ نسخة الاختبار بجولة جديدة.</small>':''}${button(fullscreenSupported()?'العب بملء الشاشة':'ابدأ الاختبار','start','gold-button')}<small>١٦ ورقة · ١٣ نوعًا · يد من ٣ · بلا مانا</small></div>${rotationHint()}</main>`;}
function rewardView(s){return `<main class="screen-panel"><h1>اكتمل الاختبار ${num(s.encounter)}</h1><p>المواجهة التالية: ${esc(ENCOUNTERS[s.encounter]?.name??'')}</p><p>تستعيد صحتك كاملة وتبدأ بالشبكة والرزمة من جديد.</p>${button('ابدأ الاختبار التالي','continue','gold-button')}${rotationHint()}</main>`;}
function endView(s){return `<main class="screen-panel end-screen"><h1>${s.outcome==='victory'?'اكتملت اختبارات التوليفات':s.outcome==='exhausted'?'نفدت الخيارات':'انتهت المواجهة'}</h1><p>${s.outcome==='victory'?'جرّب ترتيبًا آخر وقارن قرارات الهجوم والحماية.':s.outcome==='exhausted'?'لم تبق بطاقة قابلة للعب أو وسيلة لهزيمة الأعداء.':'جرّب توقيت إكمال الخط وتوزيع الهجوم والحماية.'}</p>${button('اختبار جديد','restart','gold-button')}${rotationHint()}</main>`;}
function combatRecap(summary) {
  const items = [[summary.hits,'swords','ألحقت','dealt'],[summary.block,'shield','اكتسبت درع','guard'],[summary.prevented??0,'shield','مُنِع','prevented'],[summary.enemyDamage,'heart','خسرت صحة','taken']];
  return `<div class="battle-result" role="status" aria-label="نتيجة الدور">${items.map(([value,ico,label,kind])=>`<span class="recap-item recap-${kind}" data-recap="${kind}" data-value="${value}"><span>${icon(ico)}<b>${num(value)}</b></span><small>${label}</small></span>`).join('')}</div>`;
}
function arena(s, p, projected, animation) {
  const pool = attackTargets(s);
  const target = targetForAction(s, p);
  return `<section class="battle-arena ${s.enemies.length === 3 ? 'has-boss' : ''}" aria-label="ساحة المواجهة، اختر عدوًا">${slice(4, 76, 1136, 552, 'arena-backdrop')}<span class="old-enemy-label-cover">${slice(656,149,160,136,'','blank-template.png')}</span>${s.enemies.length===1?`<span class="unused-enemy-cover">${slice(881,76,257,552,'','blank-template.png')}</span>`:''}
    <div class="combatant hero-combatant" data-max-hp="${s.maxHp}"><div class="unit-hud">${slice(193, 105, 164, 82, 'hud-paper', 'blank-template.png')}<strong>الشنفرى</strong><span class="hp-track"><i style="width:${(projected?.state.hp ?? s.hp) / s.maxHp * 100}%"></i></span><b data-hero-hp>${ratio(projected?.state.hp ?? s.hp, s.maxHp)}</b></div></div>
    ${s.enemies.map((e, i) => {
      const after = projected?.state.enemies[i]?.hp ?? e.hp;
      const locked = e.hp <= 0 || !pool.some(x => x.id === e.id);
      const intent = getEnemyIntent(e, i, s.phaseTurn);
      const rect = i % 2 === 0 ? [612, 280, 266, 344] : [881, 278, 257, 347];
      return `<button class="combatant enemy enemy-${i} ${target === e.id ? 'is-target' : ''} ${e.hp <= 0 ? 'is-fallen' : ''}" data-target="${e.id}" data-max-hp="${e.maxHp}" aria-pressed="${target === e.id}" ${locked ? 'disabled' : ''} aria-label="${esc(e.name)}، صحة ${num(e.hp)}، ${locked ? 'محمي' : 'هجوم ' + num(intent.damage)}">
        ${slice(...rect, 'fallen-cover', 'blank-template.png')}${i === 2 ? slice(446, 257, 316, 290, 'extra-enemy', 'extra-characters.png', 1374, 1145) : ''}
        <span class="unit-hud">${slice(...(i % 2 === 0 ? [656, 149, 160, 136] : [936, 150, 162, 138]), 'hud-paper', 'blank-template.png')}<strong>${esc(e.name)}</strong><span class="hp-track"><i style="width:${after / e.maxHp * 100}%"></i></span><b data-enemy-hp="${e.id}">${ratio(after, e.maxHp)}</b><small class="enemy-intent">${e.hp <= 0 ? 'صريع' : locked ? icon('shield') : stat(intent.damage, 'swords')}${e.bleed ? stat(e.bleed, 'bleed') : ''}</small></span>
        ${e.hp > after ? `<span class="forecast-damage">−${num(e.hp - after)}</span>` : ''}
      </button>`;
    }).join('')}
    ${!animation && s.last?.kind === 'turn' ? combatRecap(s.last) : ''}
  </section>`;
}
function combatForecast(summary) {
  return `<div class="preview-totals">${[[summary.hits,'swords','ضرر'],[summary.block,'shield','درع'],[summary.prevented,'shield','منع'],[summary.enemyDamage,'heart','صحة']].map(([value,ico,label])=>`<span class="forecast-stat">${stat(value??0,ico)}<small>${label}</small></span>`).join('')}</div>`;
}

const btn = button;


// --- app.mjs ---






const SAVE_KEY='shanfara-duel-v9';
const root=document.querySelector('#app'), menu=document.querySelector('#menu');
const emptySelection=()=>({card:null,cell:null,axis:null,target:null});
let s=fresh(), report=null, selection=emptySelection();
let cancelCombat=null,resolving=null;
try {
  const saved=JSON.parse(localStorage.getItem(SAVE_KEY));
  if(saved?.state?.version===VERSION){
    if(saved.state.ruleset!==34)localStorage.setItem(SAVE_KEY+'-before-v34',JSON.stringify(saved));
    s=migrateSave(saved.state);report=restore(saved.report,s);
  }
}catch{}
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify({state:s,report}));}catch{document.querySelector('#live').textContent='تعذّر الحفظ على الجهاز.';}}
function render(){root.innerHTML=s.screen==='title'?titleView(s):s.screen==='reward'?rewardView(s):s.screen==='end'?endView(s):gameView(s,selection,resolving);}
function syncFullscreenControls() {
  const template = document.createElement('template');
  template.innerHTML = fullscreenButton();
  const next = template.content.firstElementChild;
  for (const element of document.querySelectorAll('.fullscreen-button')) {
    element.innerHTML = next.innerHTML;
    for (const attribute of ['class', 'aria-pressed', 'aria-label']) element.setAttribute(attribute, next.getAttribute(attribute));
  }
}
function requestFullscreenFromGesture(explicit = false) {
  // Call before rendering, audio, or any await can consume the tap's activation.
  const pending = explicit && fullscreenActive() ? exitGameFullscreen() : enterGameFullscreen();
  if (menu.open) menu.close();
  pending.then(result => {
    syncFullscreenControls();
    if (!result.ok && explicit) show('ملء الشاشة', `<p>${result.reason === 'unsupported' ? 'هذا المتصفح لا يدعم ملء الشاشة لهذه الصفحة. افتح الرابط في Chrome على أندرويد لتفعيلها.' : 'لم يسمح المتصفح بملء الشاشة. اضغط زر «ملء الشاشة» مرة أخرى، أو افتح الرابط مباشرة في المتصفح.'}</p>`);
  });
}
for (const event of ['fullscreenchange', 'webkitfullscreenchange']) document.addEventListener(event, () => { releaseLandscapeLock(); syncFullscreenControls(); });
function show(title, body) { menu.innerHTML = `<header class="dialog-header"><h2>${title}</h2>${button('×', 'close', '', false, 'إغلاق')}</header>${body}`; if (!menu.open) menu.showModal(); }

function details(uid){const c=def(uid,s);show(esc(c.name),`<div class="prototype-details"><div>${effectFormula(uid,s)}</div><p>${esc(c.text)}</p><p>تتفعّل مرة عند اختيار خطها. تبقى في الشبكة حتى اكتمال الخط المختار وتفريغه.</p></div>`);}
function help(){show('مختبر التوليفات','<ol><li>اختر بطاقة، واتجاهًا: صف أو عمود، وخانة فارغة.</li><li>راجع المعاينة ثم اضغط «نفّذ التوليفة». تتفعّل البطاقة الجديدة وكل بطاقات الخط المختار حتى لو كان ناقصًا.</li><li>الصف من اليمين لليسار، والعمود من الأعلى للأسفل. الأرقام على الشبكة توضح الترتيب.</li><li>الخط المكتمل المختار يُفرّغ بعد التفعيل. غير المختار يبقى حتى لو اكتمل. بطاقة «⏳ تزول» تُفعَّل مع الخط ثم تغادر ولا تُكمله، فتبقى بقية بطاقاته.</li><li>الأوراق المفرّغة تذهب للمستهلك، ويُعاد خلطه عند نفاد رزمة السحب.</li><li>بطاقة واحدة في الدور، ثم يرد الأعداء الأحياء. الحماية للرد الحالي فقط، وتسحب بطاقة بعد الحسم.</li><li>كل هجمات التوليفة تستهدف العدو المختار. إن مات، لا ينتقل الضرر لعدو آخر؛ الحماية تظل تعمل.</li><li>تحصين المرقبة: يعمل كالإشعال لكن بالدرع؛ تصير خانته خضراء وأي بطاقة تُفعَّل فيها تمنح درعًا إضافيًا.</li><li>إشعال النار: تتفعّل ثم تُفرَّغ فورًا وتصير خانتها حمراء؛ أي بطاقة تُفعَّل فيها تلحق ضررًا إضافيًا، والإشعال المتكرر يتراكم. تعود الخانة طبيعية حين يكتمل خطها.</li><li>تقدّم محمي: ضرر واحد وحماية واحدة، ويصبح الضرر اثنين إذا اكتمل الخط المختار.</li></ol>');}
function newGame(){cancelCombat?.();cancelCombat=null;resolving=null;s=start(fresh());report=begin(s);selection=emptySelection();if(menu.open)menu.close();save();render();}
function commit(a){
  if(resolving)return;
  const before=s,result=activate(before,a);if(!result.valid)return;
  report=record(report||begin(before),before,a,result);s=result.state;
  selection={...emptySelection(),target:a.target??null};save();
  if(result.summary.kind!=='turn'){render();playSfx('select');return;}
  const grid=[...before.grid];grid[a.cell]=a.card;
  resolving={grid,cells:result.summary.clearedCells,activeCells:result.summary.cells};
  root.innerHTML=gameView({...before,hand:s.hand,last:null},selection,resolving);
  cancelCombat=playCombatFeedback({root,summary:result.summary,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,onSound:playSfx,onComplete:()=>{
    resolving=null;cancelCombat=null;render();
    if(s.screen==='reward'||s.outcome==='victory')playSfx('victory');else if(s.outcome==='defeat')playSfx('defeat');
  }});
  document.querySelector('#live').textContent=`ألحقت ${num(result.summary.hits)} ضرر. اكتسبت ${num(result.summary.block)} حماية. منعت ${num(result.summary.prevented)} ضرر. خسرت ${num(result.summary.enemyDamage)} صحة.`;
}
function action(name){
  if(name==='close'){menu.close();return;}
  if(name==='fullscreen'){requestFullscreenFromGesture(true);return;}
  if(name==='restart'){requestFullscreenFromGesture();newGame();return;}
  if(name==='help'){help();return;}
  if(name==='menu'){show('الشنفرى · مختبر التوليفات',`<nav class="menu-options">${button('أكمل اللعب','close','gold-button')}${button('شرح اللعب','help')}${button(isMuted()?'تشغيل الصوت':'كتم الصوت','audio')}${button('تحميل تقرير اللعب','export')}${button('ابدأ من جديد','restart')}</nav><p>السحب ${num(s.draw.length)} · المستهلك ${num(s.discard.length)} · الرزمة ${num(s.deck.length)}</p>`);return;}
  if(name==='audio'){toggleMute();menu.close();return;}
  if(name==='export'){const url=URL.createObjectURL(new Blob([textReport(report)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='shanfara-report.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return;}
  if(resolving)return;
  if(name==='start'){requestFullscreenFromGesture();s=start(s);report=begin(s);save();render();playSfx('select');}
  else if(name==='continue')commit({kind:'continue'});
  else if(name==='confirm-play')commit({card:selection.card,cell:selection.cell,axis:selection.axis,face:0,target:targetForAction(s,selection)});
}
document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b||b.disabled)return;
  if(b.dataset.action){action(b.dataset.action);return;}
  if(resolving||s.screen!=='play')return;
  if(b.dataset.info){details(b.dataset.info);return;}
  if(b.dataset.target){selection.target=b.dataset.target;render();return;}
  if(b.dataset.card){selection.card=b.dataset.card;selection.cell=null;render();playSfx('select');return;}
  if(b.dataset.axis){selection.axis=b.dataset.axis;render();return;}
  if(b.dataset.cell!==undefined){const cell=Number(b.dataset.cell);if(s.grid[cell]){details(s.grid[cell]);return;}if(!selection.card){document.querySelector('#live').textContent='اختر بطاقة أولًا.';return;}selection.cell=cell;render();}
});
document.addEventListener('keydown',e=>{
  if(menu.open||resolving||s.screen!=='play')return;
  if(e.key==='Escape'){selection=emptySelection();render();}
  if(/^[1-3]$/.test(e.key)&&!e.ctrlKey&&!e.metaKey&&s.hand[Number(e.key)-1]){selection.card=s.hand[Number(e.key)-1];selection.cell=null;render();}
});
render();

})();