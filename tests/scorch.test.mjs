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
  assert.deepEqual(r.summary.clearedCells,[4]);assert.equal(r.state.gridTurf[4],'scorched');assert.equal(r.state.gridHeat[4],1);assertState(r.state);
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
  assert.equal(r2.summary.hits,2,'1 own hit + 1 old bonus');assert.equal(r2.state.gridHeat[4],2);assert.equal(r2.state.gridTurf[4],'scorched');assertState(r2.state);
  const shelter=r2.state.hand.find(u=>u.startsWith('shelter.'));const r3=place(r2.state,4,'row',shelter);
  assert.equal(r3.summary.hits,2,'a plain shield now adds the stacked +2');
});
test('completing the line returns a scorched cell to normal; stacking survives a completing scorch',()=>{
  const s=fixture({0:'strike',1:'shelter'},['scorch','advance']);s.gridTurf[2]='scorched';s.gridHeat[2]=1;
  const lit=place(s,5,'row',s.hand[0]);assert.equal(lit.state.gridTurf[5],'scorched');
  const t=fixture({0:'strike',1:'shelter'},['advance']);t.gridTurf[2]='scorched';t.gridHeat[2]=1;
  const r=place(t,2,'row');
  assert.equal(r.summary.hits,2+2+1,'strike 2 + advance completed 2 + heat bonus 1');assert.deepEqual(r.summary.clearedCells.sort(),[0,1,2]);
  assert.equal(r.state.gridTurf[2],null);assert.equal(r.state.gridHeat[2],0);
  const u=fixture({0:'strike',1:'shelter'},['scorch']);u.gridTurf[2]='scorched';u.gridHeat[2]=1;
  const q=place(u,2,'row');assert.equal(q.state.gridHeat[2],2);assert.equal(q.state.gridTurf[2],'scorched');assert.equal(q.state.grid[0],null);
});
test('incomplete line keeps the bonus cell lit and the card on it',()=>{
  const s=fixture({},['shelter']);s.gridTurf[4]='scorched';s.gridHeat[4]=1;
  const r=place(s,4,'column');assert.equal(r.state.gridTurf[4],'scorched');assert.ok(r.state.grid[4]);
});
