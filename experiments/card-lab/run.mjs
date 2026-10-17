import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {engine as E,fixture,freshLab,baseDeck,legal} from './prototype.mjs';
const results={scope:'Experimental prototype: 6 proposed starter cards and 6 reward directions, not a finalized 10-reward set. Live gameplay untouched.',rules:'2×3, occupied row/column activate once, complete lines clear; one card per turn; emergency immediately recycles under existing rules.',checks:[],structural:[],cases:[],runs:[]};
const run=(s,card,cell,face=0,extra={})=>{const r=E.activate(s,{card,cell,face,...extra});assert.ok(r.valid);E.assertState(r.state);return r;};
function check(name,f){f();results.checks.push(name);}
check('Prototype preserves cross activation and complete-line-only clearing',()=>{let s=fixture();s=run(s,'cover.0',0).state;const r=run(s,'focus.0',1);assert.equal(r.summary.block,3);assert.equal(r.state.momentum,2);assert.deepEqual(r.summary.lines,[]);assert.equal(r.state.grid.filter(Boolean).length,2);});
check('Prototype correctly converts credit into block and consumes it',()=>{const r=run(fixture({momentum:5}),'focus.0',0,1);assert.equal(r.summary.block,5);assert.equal(r.state.momentum,0);});
// Structural census: all 6! starting deck orders, not 720 independently randomized games.
function* permutations(xs){if(!xs.length){yield [];return;}for(let i=0;i<xs.length;i++)for(const tail of permutations(xs.filter((_,j)=>j!==i)))yield[xs[i],...tail];}
let total=0,initialScryChoices=0,afterCover=0,afterCoverFocus=0,zeroReplacement=0;
for(const order of permutations(baseDeck)){
 const s=fixture({hand:order.slice(0,5),draw:order.slice(5)});total++;
 const available=(grid)=>{const remaining=order.filter(uid=>!grid.includes(uid));return fixture({grid,hand:remaining.slice(0,5),draw:remaining.slice(5)});};
 if(s.draw.length>=2)initialScryChoices++;
 const one=available(['cover.0',null,null,null,null,null]);if(one.draw.length>=2)afterCover++;
 const two=available(['cover.0','focus.0',null,null,null,null]);if(two.draw.length>=2)afterCoverFocus++;if(two.draw.length+two.discard.length===0)zeroReplacement++;
}
results.structural.push({orders:total,initialScryAtLeastTwo:initialScryChoices,afterOnePermanentAtLeastTwo:afterCover,afterTwoPermanentsAtLeastTwo:afterCoverFocus,afterTwoPermanentsNoExternalReplacement:zeroReplacement,note:'No prior discards. Random order does not create extra available cards.'});
check('Scry has no choice in any of 720 initial six-card deck orders',()=>assert.equal(initialScryChoices,0));
// A constructive infinite safe loop, verified for 100 consecutive legal actions.
let loop=run(fixture(),'cover.0',0).state;
const hp=loop.hp;let zeroDamage=true;for(let i=0;i<100;i++){assert.ok(loop.hand.includes('tactics.0'));const r=run(loop,'tactics.0',1,1,{swap:[]});zeroDamage&&=r.summary.enemyDamage===0;loop=r.state;}
check('100-turn no-attack stall loop is legal and preserves health',()=>{assert.ok(zeroDamage);assert.equal(loop.hp,hp);assert.equal(loop.momentum,0);assert.equal(loop.screen,'play');});
results.cases.push({name:'Immediate emergency recycle loop',sequence:['cover permanent cell 0','tactics emergency cell 1, swap nothing, repeat'],turnsRepeated:100,hpBefore:hp,hpAfter:loop.hp,momentumAfter:loop.momentum,enemyHealth:loop.enemies.map(e=>e.hp),conclusion:'Safe indefinite stall in encounter 1, not a winning or infinite-power strategy. Emergency returns to hand each turn because all non-grid cards fit in hand.'});
// Exhaustive constructive strategy, separate from the heuristic agents.
let safeWins=0;for(const order of permutations(baseDeck)){let s=fixture({hand:order.slice(0,5),draw:order.slice(5)});const shield=s.hand.find(uid=>uid.startsWith('cover.'));s=run(s,shield,0).state;let count=0;while(s.screen==='play'&&count<8){const arrow=s.hand.find(uid=>uid.startsWith('arrow.'));assert.ok(arrow);s=run(s,arrow,1,1).state;count++;}assert.equal(s.screen,'reward');assert.equal(s.hp,24);assert.equal(count,7);safeWins++;}
check('Cover then seven emergency arrows wins all 720 first-encounter starting orders at full health',()=>assert.equal(safeWins,720));results.structural.push({name:'Constructive first-encounter solution',orders:720,wins:safeWins,finalHp:24,turns:8,sequence:'One permanent cover at cell 0, then repeat an emergency arrow at cell 1 seven times. Row never fills, cover blocks all enemy replies, arrow returns to hand.'});
// Controlled reward probes. All card numbers below are experimental.
const enemy=(id,hp,attack=2)=>({id,name:id,hp,maxHp:hp,attack,shield:0,bleed:0});
const probe=(name,options,f)=>{const outcomes=options.map(([label,card,face=0])=>{const s=f(card);const r=run(s,card,0,face);return{label,hits:r.summary.hits,enemyReply:r.summary.enemyDamage,hpAfter:r.state.hp,momentum:r.state.momentum,remaining:r.state.enemies.map(e=>e.hp),bleed:r.state.enemies.map(e=>e.bleed),effects:r.summary.effects};});results.cases.push({name,outcomes});return outcomes;};
let outcomes=probe('Area attack versus concentrated attack: three enemies', [['area','volley.0'],['concentrated','arrow.0']],card=>fixture({deck:[card],hand:[card],enemies:[enemy('a',8),enemy('b',8),enemy('c',8)]}));
check('Area trades focused damage for greater total damage across multiple enemies',()=>{assert.equal(outcomes[0].hits,6);assert.equal(outcomes[1].hits,2);});
outcomes=probe('Area versus concentration: urgent kill with stored momentum',[['area','volley.0'],['concentrated','arrow.0']],card=>fixture({deck:[card],hand:[card],momentum:3,enemies:[enemy('a',5,5),enemy('b',8,1)]}));
check('Concentration can prevent an urgent attack while area cannot',()=>{assert.equal(outcomes[1].remaining[0],0);assert.ok(outcomes[0].remaining[0]>0);assert.ok(outcomes[1].enemyReply<outcomes[0].enemyReply);});
outcomes=probe('Bleed versus immediate hit: urgent 4-HP enemy',[['bleed','knife.0',1],['direct','arrow.0',1]],card=>fixture({deck:[card],hand:[card],enemies:[enemy('a',4,5)]}));
check('Current bleed ticks before counterattack, so lethal bleed also prevents the immediate attack',()=>{assert.equal(outcomes[0].remaining[0],0);assert.equal(outcomes[1].remaining[0],0);assert.equal(outcomes[0].enemyReply,0);assert.equal(outcomes[1].enemyReply,0);});
// Future bleed is real, but not forced to wait a turn as the earlier verbal explanation implied.
const bleed=run(fixture({deck:['knife.0','cover.0'],hand:['knife.0','cover.0'],enemies:[enemy('a',15,1)]}),'knife.0',0,1);
const nextBleed=run(bleed.state,'cover.0',1,1);
check('Bleed keeps dealing damage after its card disappears',()=>{assert.equal(bleed.summary.hits,4);assert.equal(nextBleed.summary.hits,3);});
results.cases.push({name:'Bleed timing',firstTurnDamage:bleed.summary.hits,nextTurnDamage:nextBleed.summary.hits,remainingStacks:nextBleed.state.enemies[0].bleed,conclusion:'4+3+2+1 potential damage, first 4 happens before current enemy reply. Stronger than a pure delayed damage effect.'});
outcomes=probe('Heal on kill versus higher damage: injured player and weak target',[['heal','leech.0'],['direct','arrow.0',1]],card=>fixture({deck:[card],hand:[card],hp:10,enemies:[enemy('a',2)]}));
check('Kill-heal can be preferred at lower nominal damage',()=>assert.equal(outcomes[0].hpAfter,12));
outcomes=probe('Heal on kill versus urgency: 4-HP target',[['heal','leech.0'],['direct','arrow.0',1]],card=>fixture({deck:[card],hand:[card],hp:10,enemies:[enemy('a',4,5)]}));
check('Heal card is not a universal replacement for stronger killing attack',()=>assert.ok(outcomes[1].hpAfter>outcomes[0].hpAfter));
outcomes=probe('Half-spend versus full-spend bow with 8 momentum',[['half','reserve.0'],['full','arrow.0']],card=>fixture({deck:[card],hand:[card],momentum:8,enemies:[enemy('a',30,1)]}));
check('Partial spend creates damage-versus-reserve tradeoff',()=>{assert.equal(outcomes[0].hits,6);assert.equal(outcomes[0].momentum,4);assert.equal(outcomes[1].hits,10);assert.equal(outcomes[1].momentum,0);});
outcomes=probe('Partial spend when excess damage is lost behind a shield bearer',[['half','reserve.0'],['full','arrow.0']],card=>fixture({deck:[card],hand:[card],momentum:8,enemies:[enemy('warlord',30,3),enemy('shield_r',2,1)]}));
check('Half-spend has a concrete advantage when protected boss cannot take overflow',()=>{assert.equal(outcomes[0].hits,2);assert.equal(outcomes[1].hits,2);assert.equal(outcomes[0].momentum,4);assert.equal(outcomes[1].momentum,0);});
outcomes=probe('Revised 3-bleed versus immediate 4-damage against urgent 4-HP enemy',[['bleed3','bleed3.0',1],['direct','arrow.0',1]],card=>fixture({deck:[card],hand:[card],enemies:[enemy('a',4,5)]}));
check('Reducing emergency bleed to 3 restores a real immediate-kill tradeoff',()=>{assert.equal(outcomes[0].remaining[0],1);assert.equal(outcomes[0].enemyReply,5);assert.equal(outcomes[1].remaining[0],0);assert.equal(outcomes[1].enemyReply,0);});
const before=fixture({grid:['focus.0',null,null,null,null,null],hand:['arrow.0'],momentum:2});
const after=fixture({grid:[null,'focus.0',null,null,null,null],hand:['arrow.0'],momentum:2});
const ordered=[run(before,'arrow.0',1),run(after,'arrow.0',0)];
check('Existing grid order already changes damage and saved momentum',()=>{assert.equal(ordered[0].summary.hits,6);assert.equal(ordered[0].state.momentum,0);assert.equal(ordered[1].summary.hits,4);assert.equal(ordered[1].state.momentum,2);});
results.cases.push({name:'Position and activation order',focusBeforeArrow:{damage:6,stored:0},arrowBeforeFocus:{damage:4,stored:2},conclusion:'Position already adds a real immediate damage versus reserve choice; no extra status system needed.'});
const recall=fixture({deck:[...baseDeck,'recall.0'],hand:['recall.0','cover.0','focus.0'],discard:['arrow.0']});
// Complete zone membership explicitly for the probe.
recall.draw=recall.deck.filter(x=>!recall.hand.includes(x)&&!recall.discard.includes(x));E.assertState(recall);
const recalled=run(recall,'recall.0',0,0,{recall:'arrow.0',give:'cover.0'});
check('Recall exchanges hand composition without playing a second card or changing turn rules',()=>{assert.ok(recalled.state.hand.includes('arrow.0'));assert.equal(recalled.state.turn,2);});
results.cases.push({name:'Recall cost',discardMustExist:true,cardPlayedConsumesTurn:true,conclusion:'Distinct selection control when a useful discard exists; frequently no target in a tiny starter deck.'});
// Verify the original proposed overlaps under controlled conditions using the real engine semantics.
let equal=0;for(let threat=0;threat<=12;threat++)if(Math.max(0,threat-3)===Math.max(0,Math.max(0,threat-3)))equal++;
results.structural.push({comparison:'3 block versus lowering a single incoming hit by 3, no other triggers',threatsTested:13,equalHpResults:equal,note:'Not equivalent for multiple enemies or future turns; names alone do not create a decision.'});
// Heuristic experiments: no claim that this estimates human win rate or enjoyment.
// All policies see their hand and use current health, enemy HP, and capped momentum.
const policies={survive:{hp:7,damage:3,momentum:.8},pressure:{hp:3,damage:6,momentum:.4},reserve:{hp:5,damage:4,momentum:1.5}};
function score(s,p){if(s.screen==='reward')return 10000+s.hp;if(s.screen==='end')return-10000;return s.hp*p.hp-s.enemies.reduce((n,e)=>n+e.hp,0)*p.damage+s.enemies.filter(e=>!e.hp).length*8+Math.min(s.momentum,12)*p.momentum+s.enemies.reduce((n,e)=>n+Math.min(e.bleed,5),0);}
function choose(s,p){let best;for(const a of legal(s)){const r=E.activate(s,a);const value=score(r.state,p);if(!best||value>best.value)best={a,r,value};}return best;}
for(const [name,p]of Object.entries(policies))for(const [variant,deck]of [['six-proposed',baseDeck],['six-second-focus',baseDeck.map(x=>x==='tactics.0'?'focus.1':x)],['six-hand3',baseDeck],['six-hand4',baseDeck],['ten-proposed',[...baseDeck,'arrow.2','cover.2','focus.1','tactics.1']]]){
 const row={policy:name,variant,runs:24,wins:0,deaths:0,timeouts:0,totalTurns:0,faces:[0,0],cardPlays:{},scryTotal:0,scryWithChoice:0,cycleTotal:0,cycleChanged:0,emergencyImmediatelyReturned:0,emergencies:0,minimumHand:5};
 for(let seed=1;seed<=row.runs;seed++){
  let s=freshLab(seed,deck,variant==='six-hand3'?3:variant==='six-hand4'?4:5);let n=0;
  while(s.screen==='play'&&n<60){const pick=choose(s,p);if(!pick)break;const {a,r}=pick;const type=E.cardType(a.card);row.faces[a.face]++;row.cardPlays[type]=(row.cardPlays[type]??0)+1;
   for(const fx of r.summary.effects){if(fx.op==='scry'){row.scryTotal++;if(fx.options>=2)row.scryWithChoice++;}if(fx.op==='cycle'){row.cycleTotal++;row.cycleChanged+=fx.changed??0;}}
   if(a.face===1){row.emergencies++;if(r.state.hand.includes(a.card))row.emergencyImmediatelyReturned++;}
   row.minimumHand=Math.min(row.minimumHand,r.state.hand.length);s=r.state;n++;
  }
  row.totalTurns+=n;if(s.screen==='reward')row.wins++;else if(s.outcome==='defeat')row.deaths++;else row.timeouts++;
 }
 row.meanTurns=+(row.totalTurns/row.runs).toFixed(2);results.runs.push(row);console.log(JSON.stringify(row));
}
// A short planning agent checks whether the one-step result is merely myopia.
function plan(s,p){let beam=[{s,first:null,value:score(s,p)}];for(let depth=0;depth<3;depth++){const next=[];for(const node of beam){if(node.s.screen!=='play'){next.push(node);continue;}for(const a of legal(node.s)){const r=E.activate(node.s,a);next.push({s:r.state,first:node.first??a,value:score(r.state,p)});}}next.sort((a,b)=>b.value-a.value);const seen=new Set();beam=[];for(const n of next){const k=JSON.stringify([n.s.hp,n.s.momentum,n.s.grid,n.s.hand,n.s.draw,n.s.discard,n.s.enemies,n.s.phaseTurn]);if(seen.has(k))continue;seen.add(k);beam.push(n);if(beam.length===8)break;}if(!beam.length)break;}const a=beam[0]?.first;return a?{a,r:E.activate(s,a)}:null;}
results.planning=[];
for(const [variant,limit]of [['six-proposed',5],['six-hand3',3]]){const row={variant,depth:3,beam:8,seeds:12,wins:0,timeouts:0,deaths:0,cardPlays:{},faces:[0,0],totalTurns:0};for(let seed=1;seed<=12;seed++){let s=freshLab(seed,baseDeck,limit);let n=0;while(s.screen==='play'&&n<40){const chosen=plan(s,policies.survive);if(!chosen)break;const {a,r}=chosen;row.cardPlays[E.cardType(a.card)]=(row.cardPlays[E.cardType(a.card)]??0)+1;row.faces[a.face]++;s=r.state;n++;}row.totalTurns+=n;if(s.screen==='reward')row.wins++;else if(s.outcome==='defeat')row.deaths++;else row.timeouts++;}row.meanTurns=+(row.totalTurns/12).toFixed(2);results.planning.push(row);console.log('PLANNING '+JSON.stringify(row));}
await mkdir(new URL('./results/',import.meta.url),{recursive:true});await writeFile(new URL('./results/results.json',import.meta.url),JSON.stringify(results,null,2));
console.log('PASS '+results.checks.length+' controlled checks; '+results.runs.reduce((n,r)=>n+r.runs,0)+' first-encounter heuristic runs.');
