export const VERSION = 'shanfara-duel-v9';
export const RULESET = 32;
export const HAND_SIZE = 3;
export const GRID_ROWS = 3, GRID_COLUMNS = 3, GRID_SIZE = 9;
export const LINES = [[2,1,0],[5,4,3],[8,7,6],[0,3,6],[1,4,7],[2,5,8]];
export const DIRECT_ATTACK_OPS = ['hit'];
export const cards = {
  strike: {name:'ضربة محسوبة',icon:'swords',kind:'attack',effects:[{op:'hit',n:2}],text:'ألحق ضررين بعدو تختاره.'},
  shelter: {name:'ساتر',icon:'shield',kind:'defense',effects:[{op:'block',n:2}],text:'احصل على درعين لرد الأعداء الحالي.'},
  advance: {name:'تقدّم محمي',icon:'swords',kind:'mixed',effects:[{op:'hit',n:1},{op:'block',n:1}],text:'ألحق ضررًا واحصل على درع. يصبح الضرر ٢ إذا اكتمل الخط المختار.'}
};
export const alternates = {}, rewards = [];
export const STARTER_TYPES = Object.keys(cards);
export const isReward = () => false;
export const maneuverOptions = () => [];
const enemy = (id,name,hp,attack) => ({id,name,hp,maxHp:hp,attack,shield:0});
export const ENCOUNTERS = [
  {name:'اختبار الإيقاع',enemies:[enemy('pace','مناوش التدريب',12,2)]},
  {name:'اختبار الضغط',enemies:[enemy('pressure','مقاتل التدريب',16,3)]},
  {name:'اختبار الاستثمار',enemies:[enemy('investment','قائد التدريب',20,4)]}
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
  s.encounter=index;s.phaseTurn=1;s.hp=s.maxHp;s.grid=Array(9).fill(null);s.faces={};s.discard=[];s.hand=[];
  s.hand=STARTER_TYPES.map(type=>s.deck.find(uid=>cardType(uid)===type));
  s.draw=shuffle(s,s.deck.filter(uid=>!s.hand.includes(uid)));s.enemies=structuredClone(ENCOUNTERS[index-1].enemies);s.screen='play';s.outcome=null;s.last=null;
}
export function fresh(seed=20261017) {
  const deck=Array.from({length:4},(_,i)=>STARTER_TYPES.map(type=>`${type}.${i}`)).flat();
  const s={version:VERSION,ruleset:RULESET,seed:seed>>>0,rng:seed>>>0,deck,draw:[],discard:[],hand:[],grid:Array(9).fill(null),faces:{},enemies:[],encounter:1,turn:1,phaseTurn:1,placements:0,hp:24,maxHp:24,screen:'title',outcome:null,last:null};
  setupEncounter(s,1);s.screen='title';return s;
}
export function migrateSave(before) {
  if(before?.ruleset!==RULESET || before?.version!==VERSION){const s=fresh(before?.seed??20261017);s.migrationNotice='بدأ نموذج بطاقات جديد؛ الحفظ السابق لا يطابق قواعده.';return s;}
  const s=structuredClone(before);assertState(s);return s;
}
export const start = s => s.screen==='title'?{...structuredClone(s),screen:'play'}:s;
export const attackTargets = s => s.enemies.filter(e=>e.hp>0);
export function targetForAction(s,a={}) { const alive=attackTargets(s);return alive.find(e=>e.id===a.target)?.id??alive[0]?.id??null; }
export function getEnemyIntent(e) { return {damage:e.hp>0?e.attack:0,shield:0,defending:false}; }
export function selectedLine(cell,axis) { return axis==='row'?LINES[Math.floor(cell/3)]:axis==='column'?LINES[3+cell%3]:null; }
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
  if(before.screen==='reward'){
    if((a.kind??a.type)!=='continue' || before.encounter>=ENCOUNTERS.length)return invalid();
    const s=structuredClone(before);setupEncounter(s,s.encounter+1);s.last={kind:'transition',action:structuredClone(a)};assertState(s);return {valid:true,state:s,summary:s.last};
  }
  if(before.screen!=='play'||!before.hand.includes(a.card)||!Number.isInteger(a.cell)||a.cell<0||a.cell>=9||before.grid[a.cell]||!['row','column'].includes(a.axis)||(a.face!==undefined&&a.face!==0)||(a.target!==undefined&&!attackTargets(before).some(e=>e.id===a.target)))return invalid();
  const s=structuredClone(before),action={card:a.card,cell:a.cell,axis:a.axis,face:0,target:targetForAction(s,a)};
  if(!action.target)return invalid();
  s.hand.splice(s.hand.indexOf(a.card),1);s.grid[a.cell]=a.card;s.faces[a.card]=0;s.placements++;
  const line=selectedLine(a.cell,a.axis),cells=line.filter(i=>s.grid[i]),complete=cells.length===3;
  const summary={kind:'turn',action,cells,lines:complete?[line]:[],clearedCells:[],events:[],effects:[],cleared:[],hits:0,block:0,incoming:0,prevented:0,unusedBlock:0,enemyDamage:0,log:[],drawn:null};
  for(const cell of cells){
    const uid=s.grid[cell],d=def(uid),qualified=complete;
    summary.events.push({type:'activate',cell,card:uid});
    for(const effect of d.effects){
      const n=effect.op==='hit'&&cardType(uid)==='advance'&&qualified?2:effect.n;
      summary.effects.push({uid,card:uid,cell,op:effect.op,n,amount:n,target:effect.op==='hit'?action.target:'hero'});
      if(effect.op==='block'){summary.block+=n;summary.events.push({type:'shield',cell,amount:n,value:summary.block,target:'hero'});}
      else {
        const target=s.enemies.find(e=>e.id===action.target);
        if(!target||target.hp<=0)continue;
        const amount=Math.min(target.hp,n);target.hp-=amount;summary.hits+=amount;
        summary.events.push({type:'damage',cell,source:uid,target:target.id,amount,hp:target.hp,fatal:target.hp===0});
      }
    }
  }
  if(complete)for(const cell of line){const uid=s.grid[cell];summary.cleared.push(uid);summary.clearedCells.push(cell);s.discard.push(uid);s.grid[cell]=null;delete s.faces[uid];}
  let shield=summary.block;
  for(const e of attackTargets(s)){
    const damage=getEnemyIntent(e).damage,blocked=Math.min(shield,damage),lost=Math.min(s.hp,damage-blocked);
    shield-=blocked;s.hp-=lost;summary.incoming+=damage;summary.prevented+=blocked;summary.enemyDamage+=lost;
    summary.events.push({type:'enemy-attack',source:e.id,amount:damage,blocked,damage:lost,hp:s.hp,shield});
  }
  summary.unusedBlock=shield;
  // Exactly one draw follows a resolved placement, even when that placement ends combat.
  summary.drawn=draw(s);s.turn++;s.phaseTurn++;
  if(s.hp<=0){s.screen='end';s.outcome='defeat';}
  else if(!attackTargets(s).length){s.screen=s.encounter===ENCOUNTERS.length?'end':'reward';s.outcome=s.screen==='end'?'victory':null;}
  summary.log=[`ضرر ${summary.hits} · حماية ${summary.block} · خسارة صحة ${summary.enemyDamage}`];s.last=summary;assertState(s);return {valid:true,state:s,summary};
}
export function assertState(s) {
  if(s.version!==VERSION||s.ruleset!==RULESET)throw Error('Invalid ruleset');
  if(!Array.isArray(s.grid)||s.grid.length!==9)throw Error('Invalid grid');
  if(!Number.isInteger(s.hp)||s.hp<0||s.hp>s.maxHp)throw Error('Invalid health');
  if(!['title','play','reward','end'].includes(s.screen)||!ENCOUNTERS[s.encounter-1])throw Error('Invalid screen or encounter');
  if(s.deck.length!==12||new Set(s.deck).size!==12||STARTER_TYPES.some(type=>s.deck.filter(uid=>cardType(uid)===type).length!==4))throw Error('Invalid prototype roster');
  const zones=[...s.hand,...s.draw,...s.discard,...s.grid.filter(Boolean)];
  if(zones.length!==s.deck.length||new Set(zones).size!==zones.length||zones.some(uid=>!s.deck.includes(uid)||!def(uid)))throw Error('Invalid card zones');
  if(Object.values(s.faces).some(face=>face!==0))throw Error('Alternate faces removed');
  if(!Array.isArray(s.enemies)||!s.enemies.length||s.enemies.some(e=>!Number.isInteger(e.hp)||e.hp<0||e.hp>e.maxHp||!Number.isInteger(e.attack)||e.attack<0))throw Error('Invalid enemies');
  return true;
}
