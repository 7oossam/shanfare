import test from 'node:test';
import assert from 'node:assert/strict';
import { fresh, start, activate, setupEncounter, attackTargets, targetForAction, enemyCell } from '../dist/engine.mjs';
import { begin, record, restore } from '../dist/report.mjs';
import { preview } from '../dist/view.mjs';

test('Board positions and column targeting agree with actor locations', () => {
  const s = start(fresh(81));
  assert.deepEqual([0, 1, 2].map(enemyCell), [0, 2, 1]);
  assert.equal(targetForAction(s, { cell: 5, axis: 'col' }), 'scout');
  assert.equal(targetForAction(s, { cell: 5, axis: 'col', target: 'guard' }), 'guard');
  s.enemies[1].hp = 0;
  assert.equal(targetForAction(s, { cell: 5, axis: 'col', target: 'scout' }), 'guard');
});

test('Manual target receives direct damage and preview matches execution', () => {
  const s = start(fresh(82));
  const action = { card: 'arrow.0', cell: 5, axis: 'col', face: 0, target: 'scout' };
  const before = structuredClone(s);
  const projected = preview(s, action);
  const result = activate(s, action);
  assert.ok(result.valid);
  assert.equal(result.state.enemies[0].hp, s.enemies[0].hp);
  assert.ok(result.state.enemies[1].hp < s.enemies[1].hp);
  assert.deepEqual(projected.state, result.state);
  assert.deepEqual(s, before);
  assert.equal(Object.hasOwn(result.state, 'pendingTarget'), false);
  const report = record(begin(s), s, action, result);
  assert.equal(restore(report, result.state).coverage, 'complete');
});

test('Invalid and guarded targets cannot bypass boss protection', () => {
  const s = start(fresh(83));
  setupEncounter(s, 4);
  assert.deepEqual(attackTargets(s).map(e => e.id), ['shield_r', 'shield_l']);
  const action = { card: s.hand[0], cell: 3, axis: 'row', face: 0 };
  assert.equal(activate(s, { ...action, target: 'warlord' }).valid, false);
  assert.equal(activate(s, { ...action, target: 'missing' }).valid, false);
  assert.notEqual(targetForAction(s, { target: 'warlord' }), 'warlord');
  assert.ok(activate(s, { ...action, target: 'shield_l' }).valid);
  s.enemies[1].hp = 0;
  s.enemies[2].hp = 0;
  s.enemy = s.enemies[0].hp;
  assert.deepEqual(attackTargets(s).map(e => e.id), ['warlord']);
  assert.ok(activate(s, { ...action, target: 'warlord' }).valid);
});

test('Excess damage spills over without duplicating or losing damage', () => {
  const s = start(fresh(84));
  s.enemies[1].hp = 1;
  s.enemy = s.enemies.reduce((sum, e) => sum + e.hp, 0);
  const result = activate(s, { card: 'arrow.0', cell: 5, axis: 'col', face: 0, target: 'scout' });
  assert.ok(result.valid);
  assert.equal(result.state.enemies[1].hp, 0);
  assert.ok(result.state.enemies[0].hp < s.enemies[0].hp);
  assert.equal(result.state.enemy, result.state.enemies.reduce((sum, e) => sum + e.hp, 0));
});
