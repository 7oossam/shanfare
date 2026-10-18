import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,start,activate,assertState} from '../dist/engine.mjs';
function fixture(grid={},hand=['scorch'],enemyHp=100){
  const s=start(fresh());const pool=[...s.deck];const take=type=>pool.splice(pool.findIndex(uid=>uid.startsWith(type+'.')),1)[0];
  s.grid=Array(9).fill(null);s.faces={};for(const [i,type]of Object.entries(grid)){s.grid[i]=take(type);s.faces[s.grid[i]]=0;}
  s.hand=hand.map(take);s.draw=pool;s.discard=[];s.enemies=[{id:'dummy',name:'هدف اختبار',hp:enemyHp,maxHp:enemyHp,attack:0,shield:0}];return s;
}
const place=(s,cell,axis='row',card=s.hand[0])=>activate(s,{card,cell,axis,target:s.enemies[0].id});
test('scorch fires, is spent at once even on an incomplete line, and lights its cell',()=>{
  const s=fixture({},['scorch']);const r=place(s,4);
  assert.ok(r.valid);assert.equal(r.summary.hits,1);assert.equal(r.state.grid[4],null);assert.equal(r.state.discard.length,1);
  assert.deepEqual(r.summary.clearedCells,[4]);assert.equal(r.state.gridTurf[4],'scorched');assert.equal(r.state.gridLevel[4],1);assertState(r.state);
});
test('any card placed on a scorched cell adds damage, even a pure shield card',()=>{
  const s=fixture({},['scorch','shelter']);const r1=place(s,4);const shelter=r1.state.hand.find(u=>u.startsWith('shelter.'));
  const r2=place(r1.state,4,'row',shelter);
  assert.equal(r2.summary.block,2);assert.equal(r2.summary.hits,1);assert.equal(r2.state.grid[4],shelter);assert.equal(r2.state.gridTurf[4],'scorched');
});
test('scorch on an already scorched cell stacks to +2 and takes the old bonus itself',()=>{
  const s=fixture({},['scorch']);const card=s.hand[0];
  const r1=place(s,4);const s2=structuredClone(r1.state);s2.discard=s2.discard.filter(u=>u!==card);s2.hand.push(card);
  const r2=place(s2,4,'row',card);
  assert.equal(r2.summary.hits,2,'1 own hit + 1 old bonus');assert.equal(r2.state.gridLevel[4],2);assert.equal(r2.state.gridTurf[4],'scorched');assertState(r2.state);
  const shelter=r2.state.hand.find(u=>u.startsWith('shelter.'));const r3=place(r2.state,4,'row',shelter);
  assert.equal(r3.summary.hits,2,'a plain shield now adds the stacked +2');
});
test('completing the line returns a scorched cell to normal; a visiting scorch stacks without completing',()=>{
  const s=fixture({0:'strike',1:'shelter'},['scorch','advance']);s.gridTurf[2]='scorched';s.gridLevel[2]=1;
  const lit=place(s,5,'row',s.hand[0]);assert.equal(lit.state.gridTurf[5],'scorched');
  const t=fixture({0:'strike',1:'shelter'},['advance']);t.gridTurf[2]='scorched';t.gridLevel[2]=1;
  const r=place(t,2,'row');
  assert.equal(r.summary.hits,2+2+1,'strike 2 + advance completed 2 + heat bonus 1');assert.deepEqual(r.summary.clearedCells.sort(),[0,1,2]);
  assert.equal(r.state.gridTurf[2],null);assert.equal(r.state.gridLevel[2],0);
  const u=fixture({0:'strike',1:'shelter'},['scorch']);u.gridTurf[2]='scorched';u.gridLevel[2]=1;
  const q=place(u,2,'row');assert.equal(q.state.gridLevel[2],2);assert.equal(q.state.gridTurf[2],'scorched');assert.ok(q.state.grid[0]&&q.state.grid[1],'the two persistent cards survive a visiting scorch');assert.equal(q.summary.lines.length,0);
});
test('incomplete line keeps the bonus cell lit and the card on it',()=>{
  const s=fixture({},['shelter']);s.gridTurf[4]='scorched';s.gridLevel[4]=1;
  const r=place(s,4,'column');assert.equal(r.state.gridTurf[4],'scorched');assert.ok(r.state.grid[4]);
});
test('anvil guards, is spent at once, greens its cell; any card there adds block; stacks; resets on clear',()=>{
  const s=fixture({},['anvil','strike']);const anvil=s.hand[0];const r1=place(s,4);
  assert.equal(r1.summary.block,1);assert.equal(r1.state.grid[4],null);assert.equal(r1.state.gridTurf[4],'fortified');assert.equal(r1.state.gridLevel[4],1);
  const strike=r1.state.hand.find(u=>u.startsWith('strike.'));const r2=place(r1.state,4,'row',strike);
  assert.equal(r2.summary.hits,2);assert.equal(r2.summary.block,1,'plain strike gains the turf shield');
  const s3=structuredClone(r1.state);s3.discard=s3.discard.filter(u=>u!==anvil);s3.hand.push(anvil);
  const r3=place(s3,4,'row',anvil);assert.equal(r3.summary.block,2,'own 1 + old turf 1');assert.equal(r3.state.gridLevel[4],2);assertState(r3.state);
  const c=fixture({0:'strike',1:'shelter'},['advance']);c.gridTurf[2]='fortified';c.gridLevel[2]=1;
  const r4=place(c,2,'row');assert.equal(r4.summary.block,4,'shelter 2 + advance 1 + turf 1');assert.equal(r4.state.gridTurf[2],null);
});
test('slam (ارتطام الترس) hits for the block gathered earlier in the line and keeps it',()=>{
  const s=fixture({2:'shelter',1:'shelter'},['slam']);const r=place(s,0,'row');
  assert.equal(r.summary.hits,4);assert.equal(r.summary.block,4);assert.equal(r.summary.prevented,0);
  const first=fixture({0:'shelter'},['slam']);
  assert.equal(place(first,1,'row').summary.hits,0,'slam before the shelter in activation order');
  assert.equal(place(first,3,'column').summary.hits,2,'slam after the shelter');
  const lone=fixture({},['slam']);assert.equal(place(lone,4).summary.hits,0);
});
test('slam counts fortified-turf block gained in its own cell',()=>{
  const s=fixture({2:'shelter'},['slam']);s.gridTurf[1]='fortified';s.gridLevel[1]=1;
  assert.equal(place(s,1,'row').summary.hits,3,'shelter 2 + turf 1 before the hit');
});

test('a vanishing card fires with a two-card line, leaves, and never completes it',()=>{
  const s=fixture({0:'strike',1:'shelter'},['anvil']);const r=place(s,2,'row');
  assert.deepEqual(r.summary.cells,[2,1,0],'all three fire');assert.equal(r.summary.hits,2);assert.equal(r.summary.block,3,'shelter 2 + anvil 1');
  assert.deepEqual(r.summary.clearedCells,[2]);assert.equal(r.summary.lines.length,0);assert.ok(r.state.grid[0]&&r.state.grid[1]);assert.equal(r.state.grid[2],null);
});
test('line completion bonuses do not trigger when a vanishing card fills the line',()=>{
  const s=fixture({0:'strike',1:'shelter'},['scorch','advance']);
  assert.equal(place(s,2,'row',s.hand[0]).summary.lines.length,0);
  const t=fixture({0:'strike',1:'shelter'},['advance']);assert.equal(place(t,2,'row').summary.lines.length,1,'a persistent third card still completes');
});

const crowd=(hps)=>hps.map((hp,i)=>({id:'e'+i,name:'e'+i,hp,maxHp:hp,attack:1,pattern:[1],shield:0}));
test('sandstorm (شامل) hits every living enemy for the same amount and vanishes',()=>{
  const s=fixture({},['sandstorm']);s.enemies=crowd([5,5,5]);
  const r=activate(s,{card:s.hand[0],cell:4,axis:'row',target:'e1'});
  assert.deepEqual(r.state.enemies.map(e=>e.hp),[3,3,3]);assert.equal(r.summary.hits,6);assert.equal(r.summary.targetHits,2,'only the chosen target counts for line thresholds');
  assert.equal(r.summary.events.filter(e=>e.type==='damage').length,3);assert.equal(r.state.grid[4],null);assert.equal(r.summary.lines.length,0);
});
test('sandstorm kills independently, skips fallen enemies, and killed enemies do not reply',()=>{
  const s=fixture({},['sandstorm']);s.enemies=crowd([2,0,6]);s.enemies[1].hp=0;
  const r=activate(s,{card:s.hand[0],cell:4,axis:'row',target:'e0'});
  assert.deepEqual(r.state.enemies.map(e=>e.hp),[0,0,4]);
  assert.equal(r.summary.events.filter(e=>e.type==='enemy-attack').length,1,'only the survivor replies');
  const all=fixture({},['sandstorm']);all.enemies=crowd([2,2]);
  const w=activate(all,{card:all.hand[0],cell:4,axis:'row'});assert.ok(w.state.screen==='reward'||w.state.screen==='end','all enemies dead ends the fight');
});
test('sandstorm with a single enemy is a plain visiting ⚔️2; scorched turf bonus hits the target only',()=>{
  const one=fixture({},['sandstorm']);one.enemies=crowd([9]);assert.equal(activate(one,{card:one.hand[0],cell:4,axis:'row'}).summary.hits,2);
  const s=fixture({},['sandstorm']);s.enemies=crowd([9,9]);s.gridTurf[4]='scorched';s.gridLevel[4]=1;
  const r=activate(s,{card:s.hand[0],cell:4,axis:'row',target:'e0'});
  assert.deepEqual(r.state.enemies.map(e=>e.hp),[6,7],'target takes 2+1 from turf, the other only 2');
});
