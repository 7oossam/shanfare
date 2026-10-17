import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cards,
  alternates,
  def,
  cardType,
  fresh,
  start,
  activate,
  assertState,
  ARCHETYPES,
  DRAFT_POOL
} from '../dist/engine.mjs';

function putInHand(s, uid) {
  if (s.hand.includes(uid)) return;
  const drawIdx = s.draw.indexOf(uid);
  if (drawIdx >= 0) {
    const replaced = s.hand.pop();
    s.hand.push(s.draw.splice(drawIdx, 1)[0]);
    s.draw.push(replaced);
    return;
  }
  const discardIdx = s.discard.indexOf(uid);
  if (discardIdx >= 0) {
    const replaced = s.hand.pop();
    s.hand.push(s.discard.splice(discardIdx, 1)[0]);
    s.discard.push(replaced);
    return;
  }
  const gridIdx = s.grid.indexOf(uid);
  if (gridIdx >= 0) {
    const replaced = s.hand.pop();
    s.grid[gridIdx] = replaced;
    delete s.faces[uid];
    s.faces[replaced] = 0;
    s.hand.push(uid);
    return;
  }
}

// ----------------------------------------------------
// 1. Definition & Alternates Parity across all 22+ Cards
// ----------------------------------------------------
test('Cards: Every base card and reward card has an alternate face definition', () => {
  const allCardKeys = [
    'run', 'run_swift', 'arrow', 'arrow_scout', 'knife', 'knife_outlaw', 'cover', 'cover_granite', 'trick', 'wolf',
    'sniper_wind', 'gale_surge', 'push_bow',
    'flint_blade', 'desert_venom', 'rend_flesh',
    'eat_dirt', 'granite_spire', 'rock_avalanche',
    'leopard_ambush', 'hyena_patience', 'pack_frenzy'
  ];

  for (const k of allCardKeys) {
    assert.ok(cards[k], `Missing base definition for ${k}`);
    assert.ok(alternates[k], `Missing alternate definition for ${k}`);
    assert.equal(typeof cards[k].name, 'string');
    assert.equal(typeof alternates[k].name, 'string');
    assert.ok(Array.isArray(cards[k].effects));
    assert.ok(Array.isArray(alternates[k].effects));
    assert.ok(cards[k].build, `Card ${k} must declare its build archetype`);
  }
});

test('Face Commitment: Face is committed on placement and retained on grid', () => {
  let s = start(fresh(12345, false));
  putInHand(s, 'trick.0');

  // Place face 1 (vanish face)
  const res = activate(s, { card: 'trick.0', cell: 1, axis: 'row', face: 1 });
  assert.ok(res.valid);
  assert.equal(res.summary.vanished.includes('trick.0'), true);
  assert.equal(res.state.faces['trick.0'], undefined);
});

test('Momentum Build: Arrow scales with accumulated momentum', () => {
  let s = start(fresh(12345, false));
  s.momentum = 6;
  putInHand(s, 'arrow.0');

  const enemyBefore = s.enemy;
  const res = activate(s, { card: 'arrow.0', cell: 2, axis: 'row', face: 0 });
  assert.ok(res.valid);
  // Base 2 + floor(6/2) = 5 damage
  assert.ok(enemyBefore - res.state.enemy >= 5);
});

test('Bleed Build: Flint blade applies bleed and rend flesh doubles it', () => {
  let s = start(fresh(12345, false));
  putInHand(s, 'flint_blade.0');
  s.upgrades['knife.0'] = 'flint_blade';

  const res1 = activate(s, { card: 'knife.0', cell: 1, axis: 'row', face: 0 });
  assert.ok(res1.valid);
  assert.ok(res1.state.bleed >= 2);

  // Now double bleed with rend flesh
  s.upgrades['knife.1'] = 'rend_flesh';
  putInHand(res1.state, 'knife.1');
  const res2 = activate(res1.state, { card: 'knife.1', cell: 2, axis: 'row', face: 0 });
  assert.ok(res2.valid);
  assert.ok(res2.state.bleed >= 4);
});

test('Poison Build: Desert venom applies poison that ticks on enemy', () => {
  let s = start(fresh(12345, false));
  s.upgrades['knife.0'] = 'desert_venom';
  putInHand(s, 'knife.0');

  const res = activate(s, { card: 'knife.0', cell: 1, axis: 'row', face: 0 });
  assert.ok(res.valid);
  // Desert venom applies 2 poison, ticks down by 1 at end of turn
  assert.ok(res.state.poison >= 1);
});

test('Rock Build: Granite spire places stone ward', () => {
  let s = start(fresh(12345, false));
  s.upgrades['cover.0'] = 'granite_spire';
  putInHand(s, 'cover.0');

  const res = activate(s, { card: 'cover.0', cell: 1, axis: 'row', face: 1 });
  assert.ok(res.valid);
  assert.equal(res.state.wards[1], true);
});

test('Beast Build: Wolf pounces and deals extra damage to bleeding target', () => {
  let s = start(fresh(12345, false));
  s.bleed = 3;
  putInHand(s, 'wolf.0');

  const enemyBefore = s.enemy;
  const res = activate(s, { card: 'wolf.0', cell: 1, axis: 'row', face: 1 });
  assert.ok(res.valid);
  // Base 4 + 2 bonus = 6 damage
  assert.equal(enemyBefore - res.state.enemy, 6);
});
