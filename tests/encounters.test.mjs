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
