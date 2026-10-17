import test from 'node:test';
import assert from 'node:assert/strict';
import { fresh, start, activate, setupEncounter, assertState, def } from '../dist/engine.mjs';
import { gameView } from '../dist/view.mjs';

test('First encounter teaches momentum without bleed or pounce; advanced cards unlock once', () => {
  const s = start(fresh(92));
  assert.equal(s.deck.length, 10);
  for (const uid of s.deck) for (const face of [0, 1]) {
    assert.ok(!def(uid, s, face).effects.some(f => ['bleed', 'poison', 'wolf_pounce', 'prime'].includes(f.op)));
  }
  setupEncounter(s, 2);
  assert.ok(s.deck.includes('wolf.0'));
  assert.ok(s.deck.includes('knife.0'));
  assert.equal(s.deck.length, 14);
  assertState(s);
  setupEncounter(s, 3);
  assert.equal(s.deck.length, 14);
  assertState(s);
});

test('Guided example gives exactly three damage and four block, with no actors in grid', () => {
  const s = start(fresh(93));
  const r = activate(s, { card: 'arrow.0', cell: 1, axis: 'row', face: 0, target: 'scout' });
  assert.ok(r.valid);
  assert.equal(r.summary.hits, 3);
  assert.equal(r.summary.block, 4);
  assert.equal(r.state.momentum, 0);
  assert.equal(r.state.enemies[1].hp, s.enemies[1].hp - 3);
  const html = gameView(s, {card:null, cell:null, axis:null, face:null, target:null});
  assert.ok(html.includes('momentum-example'));
  assert.ok(!html.includes('board-fighter'));
});
