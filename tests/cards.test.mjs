import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cards,
  alternates,
  rewards,
  def,
  cardType,
  fresh,
  start,
  activate,
  assertState
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
// 1. Definition & Alternates Parity
// ----------------------------------------------------
test('Cards: Every base card and reward card has an alternate face definition', () => {
  const allCardKeys = ['run', 'arrow', 'knife', 'cover', 'trick', 'friend', 'shift', 'shelter', 'sneak', 'ambush', 'erase'];
  for (const k of allCardKeys) {
    assert.ok(cards[k], `Missing base definition for ${k}`);
    assert.ok(alternates[k], `Missing alternate definition for ${k}`);
    assert.equal(typeof cards[k].name, 'string');
    assert.equal(typeof alternates[k].name, 'string');
    assert.ok(Array.isArray(cards[k].effects));
    assert.ok(Array.isArray(alternates[k].effects));
  }
});

test('Face Commitment: Face is committed on placement and retained on grid', () => {
  let s = start(fresh(12345));
  putInHand(s, 'trick.0');

  // Place trick.0 at cell 1 on face 0
  const a1 = { card: 'trick.0', cell: 1, axis: 'row', face: 0 };
  const res1 = activate(s, a1);
  assert.ok(res1.valid);
  assert.equal(res1.state.faces['trick.0'], 0);
  assert.equal(res1.state.grid[1], 'trick.0');

  // Next activation: activate column 1 (cells 1, 4, 7) using another card placed at cell 7
  s = res1.state;
  putInHand(s, 'knife.0');
  const a2 = { card: 'knife.0', cell: 7, axis: 'col', face: 0 };
  const res2 = activate(s, a2);
  assert.ok(res2.valid);

  // trick.0 at cell 1 was resolved with its COMMITTED face 0
  const trickFx = res2.summary.effects.filter(e => e.uid === 'trick.0');
  assert.ok(trickFx.some(e => e.op === 'prime')); // Face 0 has prime
});

test('Face Commitment: Resets when card is cleared from grid', () => {
  let s = start(fresh(12346));
  // Clear row 0 containing run.0 at cell 0
  putInHand(s, 'arrow.0');
  let a = { card: 'arrow.0', cell: 1, axis: 'row', face: 0 };
  s = activate(s, a).state;

  const third = s.hand[0];
  a = { card: third, cell: 2, axis: 'row', face: 0 };
  const res = activate(s, a);
  assert.ok(res.valid);

  // All 3 cards cleared
  assert.equal(res.state.grid[0], null);
  assert.equal(res.state.faces['run.0'], undefined, 'Face commitment must be deleted on clear');
});

// ----------------------------------------------------
// 2. Both Faces of Base Cards
// ----------------------------------------------------
test('Run Card: Face 0 moves 2 and stays; Face 1 moves 3 and vanishes', () => {
  let s0 = start(fresh(2001));
  putInHand(s0, 'run.1');
  const r0 = activate(s0, { card: 'run.1', cell: 6, axis: 'row', face: 0 });
  assert.ok(r0.valid);
  const cardMove0 = r0.summary.effects.find(e => e.uid === 'run.1' && e.op === 'move');
  assert.equal(cardMove0.amount, 2);
  assert.equal(r0.state.grid[6], 'run.1'); // Stays

  let s1 = start(fresh(2002));
  putInHand(s1, 'run.1');
  const r1 = activate(s1, { card: 'run.1', cell: 6, axis: 'row', face: 1 });
  assert.ok(r1.valid);
  const cardMove1 = r1.summary.effects.find(e => e.uid === 'run.1' && e.op === 'move');
  assert.equal(cardMove1.amount, 3);
  assert.equal(r1.state.grid[6], null); // Vanishes
  assert.ok(r1.summary.vanished.includes('run.1'));
});

test('Arrow Card: Face 0 hits 2 and stays; Face 1 moves 2 and vanishes', () => {
  let s0 = start(fresh(2003));
  putInHand(s0, 'arrow.0');
  const r0 = activate(s0, { card: 'arrow.0', cell: 6, axis: 'row', face: 0 });
  assert.ok(r0.valid);
  assert.equal(r0.summary.hits, 2);
  assert.equal(r0.state.grid[6], 'arrow.0');

  let s1 = start(fresh(2004));
  putInHand(s1, 'arrow.0');
  const r1 = activate(s1, { card: 'arrow.0', cell: 6, axis: 'row', face: 1 });
  assert.ok(r1.valid);
  const cardMove1 = r1.summary.effects.find(e => e.uid === 'arrow.0' && e.op === 'move');
  assert.equal(cardMove1.amount, 2);
  assert.equal(r1.state.grid[6], null);
  assert.ok(r1.summary.vanished.includes('arrow.0'));
});

test('Knife Card: Face 0 hurts 1 and hits 3; Face 1 hurts 1 and moves 2', () => {
  let s0 = start(fresh(2005));
  putInHand(s0, 'knife.0');
  const r0 = activate(s0, { card: 'knife.0', cell: 6, axis: 'row', face: 0 });
  assert.ok(r0.valid);
  assert.equal(r0.summary.selfDamage, 1);
  assert.equal(r0.summary.hits, 3);

  let s1 = start(fresh(2006));
  putInHand(s1, 'knife.0');
  const r1 = activate(s1, { card: 'knife.0', cell: 6, axis: 'row', face: 1 });
  assert.ok(r1.valid);
  assert.equal(r1.summary.selfDamage, 1);
  const cardMove1 = r1.summary.effects.find(e => e.uid === 'knife.0' && e.op === 'move');
  assert.equal(cardMove1.amount, 2);
});

test('Cover Card: Face 0 blocks 3; Face 1 moves 1 and blocks 1', () => {
  let s0 = start(fresh(2007));
  putInHand(s0, 'cover.1');
  const r0 = activate(s0, { card: 'cover.1', cell: 6, axis: 'row', face: 0 });
  assert.ok(r0.valid);
  assert.equal(r0.summary.block, 3);

  let s1 = start(fresh(2008));
  putInHand(s1, 'cover.1');
  const r1 = activate(s1, { card: 'cover.1', cell: 6, axis: 'row', face: 1 });
  assert.ok(r1.valid);
  const cardMove1 = r1.summary.effects.find(e => e.uid === 'cover.1' && e.op === 'move');
  assert.equal(cardMove1.amount, 1);
  assert.equal(r1.summary.block, 1);
});

test('Trick Card: Face 0 primes +2; Face 1 moves 1, blocks 2 and vanishes', () => {
  let s0 = start(fresh(2009));
  putInHand(s0, 'trick.0');
  const r0 = activate(s0, { card: 'trick.0', cell: 6, axis: 'row', face: 0 });
  assert.ok(r0.valid);
  assert.equal(r0.summary.block, 1);
  assert.ok(r0.summary.effects.some(e => e.op === 'prime' && e.amount === 2));

  let s1 = start(fresh(2010));
  putInHand(s1, 'trick.0');
  const r1 = activate(s1, { card: 'trick.0', cell: 6, axis: 'row', face: 1 });
  assert.ok(r1.valid);
  const cardMove1 = r1.summary.effects.find(e => e.uid === 'trick.0' && e.op === 'move');
  assert.equal(cardMove1.amount, 1);
  assert.equal(r1.summary.block, 2);
  assert.ok(r1.summary.vanished.includes('trick.0'));
});

test('Friend Card: Face 0 frees friend; Face 1 moves 2 and vanishes', () => {
  let s0 = start(fresh(2011));
  putInHand(s0, 'friend.0');
  const r0 = activate(s0, { card: 'friend.0', cell: 6, axis: 'row', face: 0 });
  assert.ok(r0.valid);
  assert.equal(r0.state.friend, 1);

  let s1 = start(fresh(2012));
  putInHand(s1, 'friend.0');
  const r1 = activate(s1, { card: 'friend.0', cell: 6, axis: 'row', face: 1 });
  assert.ok(r1.valid);
  assert.equal(r1.state.friend, 0); // Face 1 does not free friend
  const cardMove1 = r1.summary.effects.find(e => e.uid === 'friend.0' && e.op === 'move');
  assert.equal(cardMove1.amount, 2);
  assert.ok(r1.summary.vanished.includes('friend.0'));
});

// ----------------------------------------------------
// 3. Reward Upgrades & Reward Faces
// ----------------------------------------------------
test('Reward Replacement: Upgrades card in hand conserving UID', () => {
  let s = start(fresh(3001));
  // Simulate loot collected
  s.loot = true;
  s.progress = 4;
  s.screen = 'reward';

  const replaceUid = s.hand[0];
  // Choose ambush
  const res = activate(s, { kind: 'reward', choice: 'ambush', replace: replaceUid });
  assert.ok(res.valid);
  assert.equal(res.state.upgrades[replaceUid], 'ambush');
  assert.equal(cardType(replaceUid, res.state), 'ambush');

  // Verify card functions with ambush Face 0 (ambush 4/1)
  putInHand(res.state, replaceUid);
  // Row 2 is empty; placing ambush at cell 6 with cell 7 empty deals 4 ambush damage!
  const rAmbush = activate(res.state, { card: replaceUid, cell: 6, axis: 'row', face: 0 });
  assert.ok(rAmbush.valid);
  const ambFx = rAmbush.summary.effects.find(e => e.op === 'ambush');
  assert.ok(ambFx);
  assert.equal(ambFx.amount, 4); // Next cell 7 is open -> 4 damage!
});
