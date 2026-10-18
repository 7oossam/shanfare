import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,start,setupEncounter,activate,actions,ENCOUNTERS,assertState} from '../dist/engine.mjs';

test('Weaken and stagger reduce only the targeted enemy', () => {
  const s = fresh();
  setupEncounter(s, 2);
  const [archer, guard] = s.enemies;
  s.screen = 'play';
  const disrupt = s.deck.find(u => u.startsWith('disrupt.'));
  s.hand = [disrupt];
  s.draw = s.deck.filter(u => u !== disrupt);
  const r = activate(s, { card: disrupt, cell: 0, axis: 'row', target: archer.id });
  assert.ok(r.valid);
  assert.deepEqual(r.summary.reductions, { [archer.id]: 1 });
  assert.deepEqual(r.summary.events.find(e => e.type === 'weaken'), { type: 'weaken', cell: 0, target: archer.id, amount: 1 }, 'weakening is a visible event for feedback');
  const archerEvent = r.summary.events.find(e => e.type === 'enemy-attack' && e.source === archer.id);
  const guardEvent = r.summary.events.find(e => e.type === 'enemy-attack' && e.source === guard.id);
  assert.equal(archerEvent.amount, Math.max(0, archerEvent.rawDamage - 1));
  assert.equal(guardEvent.amount, guardEvent.rawDamage, 'the other enemy keeps its full attack');
});

test('every encounter starts valid, declares intents, and a dead target never attacks',()=>{
  for(let k=1;k<=ENCOUNTERS.length;k++){const s=fresh(k);setupEncounter(s,k);s.screen='play';assertState(s);
    assert.ok(s.enemies.every(e=>e.attack===e.pattern[0]));
    const a=actions(s)[0];const r=activate(s,a);assert.ok(r.valid);}
  const s=fresh(5);setupEncounter(s,5);s.screen='play';
  s.enemies.forEach(e=>{if(e.id!=='leader')e.hp=1;});
  const strike=s.deck.find(u=>u.startsWith('strike.'));s.hand=[strike];s.draw=s.deck.filter(u=>u!==strike);
  const r=activate(s,{card:strike,cell:0,axis:'row',target:'thrower'});
  assert.equal(r.state.enemies.find(e=>e.id==='thrower').hp,0);
  assert.ok(!r.summary.events.some(e=>e.type==='enemy-attack'&&e.source==='thrower'));
});

test('a defeat can be retried at the same encounter with full health; a victory cannot',()=>{
  const s=fresh(11);setupEncounter(s,3);s.screen='play';s.hp=1;s.enemies[0].pattern=[9];s.enemies[0].attack=9;
  const card=s.hand[0];const lost=activate(s,{card,cell:0,axis:'row'});
  assert.equal(lost.state.screen,'end');assert.equal(lost.state.outcome,'defeat');
  const again=activate(lost.state,{kind:'retry'});
  assert.ok(again.valid);assert.equal(again.state.screen,'play');assert.equal(again.state.encounter,3);assert.equal(again.state.hp,again.state.maxHp);assert.equal(again.state.outcome,null);assertState(again.state);
  assert.equal(activate(lost.state,{kind:'continue'}).valid,false);
  const won={...structuredClone(lost.state),outcome:'victory'};assert.equal(activate(won,{kind:'retry'}).valid,false,'a finished campaign is not retried');
});
