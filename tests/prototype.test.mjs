import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,start,activate,actions,cards,ENCOUNTERS,assertState,migrateSave,draw,snapshot,selectedLine} from '../dist/engine.mjs';
function fixture(grid={},hand=['strike'],enemyHp=100){
  const s=start(fresh());const pool=[...s.deck];const take=type=>pool.splice(pool.findIndex(uid=>uid.startsWith(type+'.')),1)[0];
  s.grid=Array(9).fill(null);s.faces={};for(const [i,type]of Object.entries(grid)){s.grid[i]=take(type);s.faces[s.grid[i]]=0;}
  s.hand=hand.map(take);s.draw=pool;s.discard=[];s.enemies=[{id:'dummy',name:'هدف اختبار',hp:enemyHp,maxHp:enemyHp,attack:0,shield:0}];return s;
}
const place=(s,cell,axis='row',card=s.hand[0])=>activate(s,{card,cell,axis,target:s.enemies[0].id});
test('only three new types, twelve physical cards, declared laboratory enemies',()=>{
  const s=fresh();assert.deepEqual(Object.keys(cards),['strike','shelter','advance']);assert.equal(s.deck.length,12);assert.equal(s.hand.length,3);assert.equal(s.draw.length,9);assert.equal(ENCOUNTERS.length,3);assert.ok(ENCOUNTERS.every(e=>e.enemies.length===1));assertState(s);
});
test('axis is required and face one/invalid targets are rejected without mutation',()=>{
  const s=start(fresh()),before=snapshot(s);const a={card:s.hand[0],cell:0};
  assert.equal(activate(s,a).valid,false);assert.equal(activate(s,{...a,axis:'diagonal'}).valid,false);assert.equal(activate(s,{...a,axis:'row',face:1}).valid,false);assert.equal(activate(s,{...a,axis:'row',target:'missing'}).valid,false);assert.deepEqual(snapshot(s),before);
});
test('row right-to-left, column top-to-bottom and new card included exactly once',()=>{
  const row=fixture({0:'strike',2:'shelter'},['advance']);const r=place(row,1);assert.deepEqual(r.summary.cells,[2,1,0]);assert.deepEqual(r.summary.events.filter(e=>e.type==='activate').map(e=>e.cell),[2,1,0]);assert.equal(r.summary.hits,4);assert.equal(r.summary.block,3);
  const col=fixture({0:'strike',6:'shelter'},['advance']);assert.deepEqual(place(col,3,'column').summary.cells,[0,3,6]);assert.deepEqual(selectedLine(4,'row'),[5,4,3]);
});
test('only selected line activates; incomplete selected line stays',()=>{
  const s=fixture({0:'strike',1:'shelter',3:'strike'},['advance']);const r=place(s,2,'column');assert.deepEqual(r.summary.cells,[2]);assert.equal(r.summary.hits,1);assert.equal(r.summary.block,1);assert.deepEqual(r.summary.clearedCells,[]);assert.equal(r.state.grid[0],s.grid[0]);assert.ok(r.state.grid[2]);
});
test('only completed selected line clears, unselected completed crossing survives',()=>{
  const s=fixture({3:'strike',5:'shelter',1:'shelter',7:'strike'},['advance']);const r=place(s,4,'row');assert.deepEqual(r.summary.clearedCells,[5,4,3]);assert.ok(r.state.grid[1]);assert.ok(r.state.grid[7]);assert.equal(r.state.discard.length,3);assert.equal(r.summary.events.filter(e=>e.type==='activate').length,3);
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
test('all twelve cards circulate without a dead hand for a sustained sequence',()=>{
  let s=start(fresh(81));s.enemies[0].hp=s.enemies[0].maxHp=100000;s.enemies[0].attack=0;
  for(let i=0;i<200;i++){assert.ok(s.hand.length);const a=actions(s)[i%actions(s).length];const r=activate(s,a);assert.ok(r.valid);s=r.state;assertState(s);}
});
test('old saves explicitly reset, current saves retain deterministic replay',()=>{
  const old={...fresh(123),ruleset:31,hand:['arrow.0']};const s=migrateSave(old);assert.equal(s.ruleset,32);assert.equal(s.screen,'title');assert.match(s.migrationNotice,/الحفظ السابق/);assert.ok(s.hand.every(uid=>!uid.startsWith('arrow.')));
  const state=start(fresh(123)),a=actions(state)[0],r=activate(state,a);assert.deepEqual(snapshot(activate(migrateSave(state),a).state),snapshot(r.state));
});
test('laboratory progression restores full health with no card reward or terrain',()=>{
  let s=fixture({},['strike'],1);s.hp=7;const r=place(s,0);assert.equal(r.state.screen,'reward');assert.deepEqual(actions(r.state),[{kind:'continue'}]);s=activate(r.state,{kind:'continue'}).state;assert.equal(s.hp,24);assert.equal(s.encounter,2);assert.equal(s.screen,'play');assert.equal(s.hand.length,3);assert.equal(s.deck.length,12);assert.equal(s.grid.filter(Boolean).length,0);
});
test('last laboratory victory ends campaign; loss is resolved after enemy attack',()=>{
  const s=fixture({},['strike'],1);s.encounter=3;const win=place(s,0);assert.equal(win.state.screen,'end');assert.equal(win.state.outcome,'victory');assert.equal(activate(win.state,{kind:'continue'}).valid,false);
  const lose=fixture({},['strike'],10);lose.hp=1;lose.enemies[0].attack=2;const r=place(lose,0);assert.equal(r.state.outcome,'defeat');assert.equal(r.state.hp,0);
});
test('fresh hand deliberately presents all three cards on every seed',()=>{
  for(let seed=1;seed<=20;seed++)assert.deepEqual(fresh(seed).hand.map(uid=>uid.split('.')[0]),['strike','shelter','advance']);
});
