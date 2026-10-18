import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,start,startRun,activate,actions,cards,ENCOUNTERS,assertState,migrateSave,draw,snapshot,selectedLine,RELIC_IDS,FULL_RECIPE} from '../dist/engine.mjs';
function fixture(grid={},hand=['strike'],enemyHp=100){
  const s=start(fresh(20261017,FULL_RECIPE));const pool=[...s.deck];const take=type=>pool.splice(pool.findIndex(uid=>uid.startsWith(type+'.')),1)[0];
  s.grid=Array(9).fill(null);s.faces={};for(const [i,type]of Object.entries(grid)){s.grid[i]=take(type);s.faces[s.grid[i]]=0;}
  s.hand=hand.map(take);s.draw=pool;s.discard=[];s.enemies=[{id:'dummy',name:'هدف اختبار',hp:enemyHp,maxHp:enemyHp,attack:0,shield:0}];return s;
}
const place=(s,cell,axis='row',card=s.hand[0])=>activate(s,{card,cell,axis,target:s.enemies[0].id});
test('the run starts with nine basic cards, declared enemies and a valid roster',()=>{
  const s=fresh();assert.equal(s.deck.length,9);assert.deepEqual([...new Set(s.deck.map(u=>u.split('.')[0]))].sort(),['advance','shelter','strike']);assert.equal(s.hand.length,3);assert.equal(s.draw.length,6);assert.equal(ENCOUNTERS.length,5);assert.deepEqual(ENCOUNTERS.map(e=>e.enemies.length),[1,2,1,1,3]);assert.ok(ENCOUNTERS.every(e=>e.lesson&&e.enemies.every(x=>x.pattern.length&&x.hp>0)));assertState(s);
});
test('axis is required and face one/invalid targets are rejected without mutation',()=>{
  const s=start(fresh()),before=snapshot(s);const a={card:s.hand[0],cell:0};
  assert.equal(activate(s,a).valid,false);assert.equal(activate(s,{...a,axis:'diagonal'}).valid,false);assert.equal(activate(s,{...a,axis:'row',face:1}).valid,false);assert.equal(activate(s,{...a,axis:'row',target:'missing'}).valid,false);assert.deepEqual(snapshot(s),before);
});
test('row right-to-left, column top-to-bottom and new card included exactly once',()=>{
  const row=fixture({0:'strike',2:'shelter'},['advance']);const r=place(row,1);assert.deepEqual(r.summary.cells,[2,1,0]);assert.deepEqual(r.summary.events.filter(e=>e.type==='activate').map(e=>e.cell),[2,1,0]);assert.equal(r.summary.hits,4);assert.equal(r.summary.block,3);
  const col=fixture({0:'strike',6:'shelter'},['advance']);assert.deepEqual(place(col,3,'column').summary.cells,[0,3,6]);assert.deepEqual(selectedLine(4,'row'),[5,4,3]);
});
test('selected line fires first, then the crossing line fires without completing; incomplete selected line stays',()=>{
  const s=fixture({0:'strike',1:'shelter',3:'strike'},['advance']);const r=place(s,2,'column');
  assert.deepEqual(r.summary.cells,[2,1,0],'column [2] alone, then the crossing row 1 and 0');
  assert.equal(r.summary.hits,1+2+0,'advance 1 + crossing strike 2; crossing shelter only blocks');assert.equal(r.summary.block,1+2);assert.deepEqual(r.summary.clearedCells,[]);assert.equal(r.state.grid[0],s.grid[0]);assert.ok(r.state.grid[2]);assert.equal(r.state.grid[3],s.grid[3],'cards outside both lines do not fire');
});
test('only completed selected line clears; the crossing line fires but survives',()=>{
  const s=fixture({3:'strike',5:'shelter',1:'shelter',7:'strike'},['advance']);const r=place(s,4,'row');assert.deepEqual(r.summary.clearedCells,[5,4,3]);assert.ok(r.state.grid[1]);assert.ok(r.state.grid[7]);assert.equal(r.state.discard.length,3);assert.equal(r.summary.events.filter(e=>e.type==='activate').length,5);assert.equal(r.summary.hits,2+2+2,'strike 2 + completed advance 2 + crossing strike 2');
});
test('advance completion bonus needs no prior damaging card',()=>{
  const s=fixture({0:'shelter',1:'shelter'},['advance']);const r=place(s,2);assert.equal(r.summary.hits,2);assert.equal(r.summary.block,5);
});
test('dead fixed target fizzles later damage; independent block still resolves',()=>{
  const s=fixture({2:'strike'},['advance'],1);s.enemies.push({id:'other',name:'ثان',hp:10,maxHp:10,attack:2,shield:0});
  const r=place(s,1);assert.equal(r.summary.hits,1);assert.equal(r.state.enemies[1].hp,10);assert.equal(r.summary.block,1);assert.equal(r.summary.enemyDamage,1);assert.equal(r.summary.events.filter(e=>e.type==='damage').length,1);
});
test('enemy reply after all effects, death suppresses reply, unused shield expires',()=>{
  const s=fixture({},['shelter','strike']);s.enemies[0].attack=1;const r=place(s,0);assert.equal(r.summary.prevented,1);assert.equal(r.summary.unusedBlock,1);assert.equal(r.state.hp,24);
  const next=place(r.state,8,'row',r.state.hand.find(uid=>uid.startsWith('strike.')));assert.equal(next.summary.block,0);assert.equal(next.summary.enemyDamage,1);
  const lethal=fixture({},['strike'],1);lethal.enemies[0].attack=99;assert.equal(place(lethal,0).summary.incoming,0);
});
test('one card drawn, hand is not refilled; draw reshuffles only discard',()=>{
  const s=fixture({},['strike']);const r=place(s,0);assert.equal(r.state.hand.length,1);assert.equal(r.state.draw.length,s.draw.length-1);
  const q=fixture({0:'strike'},['shelter']);q.discard=q.draw;q.draw=[];const gridCard=q.grid[0],handCard=q.hand[0];const uid=draw(q);assert.notEqual(uid,gridCard);assert.notEqual(uid,handCard);assert.equal(q.grid[0],gridCard);assert.equal(q.hand[0],handCard);assertState(q);
});
test('all seventeen cards circulate without a dead hand for a sustained sequence',()=>{
  let s=start(fresh(81));s.enemies[0].hp=s.enemies[0].maxHp=100000;s.enemies[0].attack=0;s.enemies[0].pattern=[0];
  for(let i=0;i<200;i++){assert.ok(s.hand.length);const a=actions(s)[i%actions(s).length];const r=activate(s,a);assert.ok(r.valid);s=r.state;assertState(s);}
});
test('old saves explicitly reset, current saves retain deterministic replay',()=>{
  const old={...fresh(123),ruleset:31,hand:['arrow.0']};const s=migrateSave(old);assert.equal(s.ruleset,37);assert.equal(s.screen,'title');assert.match(s.migrationNotice,/الحفظ السابق/);assert.ok(s.hand.every(uid=>!uid.startsWith('arrow.')));
  const state=start(fresh(123)),a=actions(state)[0],r=activate(state,a);assert.deepEqual(snapshot(activate(migrateSave(state),a).state),snapshot(r.state));
});
test('a victory offers three new cards; picking one grows the deck and restores health',()=>{
  let s=start(fresh());s.enemies=[{id:'dummy',name:'d',hp:1,maxHp:1,attack:0,pattern:[0],shield:0}];s.hp=7;const r=place(s,0);assert.equal(r.state.screen,'reward');
  const offer=r.state.rewardOffer;assert.equal(offer.length,3);assert.equal(new Set(offer).size,3);assert.ok(offer.every(t=>!r.state.deck.some(u=>u.startsWith(t+'.'))),'only cards the deck does not hold');
  assert.deepEqual(actions(r.state),offer.map(type=>({kind:'pick',type})));
  assert.equal(activate(r.state,{kind:'continue'}).valid,false,'a card must be chosen');assert.equal(activate(r.state,{kind:'pick',type:'strike'}).valid,false,'a card outside the offer is refused');
  const before=r.state.deck.length;s=activate(r.state,{kind:'pick',type:offer[1]}).state;
  assert.equal(s.hp,24);assert.equal(s.encounter,2);assert.equal(s.screen,'play');assert.equal(s.hand.length,3);assert.equal(s.deck.length,before+1);assert.ok(s.deck.includes(offer[1]+'.0'));assert.equal(s.grid.filter(Boolean).length,0);assertState(s);
});
test('a run needs a relic choice; each relic is valid once, and exhausting the deck ends the encounter',()=>{
  const s=startRun(fresh());assert.equal(s.screen,'relic');assert.deepEqual(actions(s).map(a=>a.id),RELIC_IDS);
  assert.equal(activate(s,{kind:'relic',id:'nope'}).valid,false);
  const r=activate(s,{kind:'relic',id:'patience'});assert.ok(r.valid);assert.equal(r.state.relic,'patience');assert.equal(r.state.screen,'play');assert.equal(activate(r.state,{kind:'relic',id:'falcon'}).valid,false,'the relic is chosen once');
  const e=fresh();e.screen='play';e.hand=[e.hand[0]];e.draw=[];e.discard=[];e.grid=Array(9).fill(null);e.grid[3]=e.deck.find(u=>!e.hand.includes(u));
  for(const u of e.deck)if(!e.hand.includes(u)&&u!==e.grid[3]){const c=[...e.grid.keys()].find(i=>!e.grid[i]&&i!==0);e.grid[c]=u;}
  e.enemies=[{id:'x',name:'x',hp:99,maxHp:99,attack:0,pattern:[0],shield:0}];e.faces={};
  const spent=activate(e,{card:e.hand[0],cell:0,axis:'column'});
  assert.ok(spent.valid);
  if(spent.state.screen==='end')assert.equal(spent.state.outcome,'exhausted');
});
test('last laboratory victory ends campaign; loss is resolved after enemy attack',()=>{
  const s=fixture({},['strike'],1);s.encounter=ENCOUNTERS.length;const win=place(s,0);assert.equal(win.state.screen,'end');assert.equal(win.state.outcome,'victory');assert.equal(activate(win.state,{kind:'continue'}).valid,false);
  const lose=fixture({},['strike'],10);lose.hp=1;lose.enemies[0].attack=2;const r=place(lose,0);assert.equal(r.state.outcome,'defeat');assert.equal(r.state.hp,0);
});
test('fresh hand deliberately presents all three cards on every seed',()=>{
  for(let seed=1;seed<=20;seed++)assert.deepEqual(fresh(seed).hand.map(uid=>uid.split('.')[0]),['strike','shelter','advance']);
});
