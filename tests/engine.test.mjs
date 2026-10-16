import test from 'node:test';
import assert from 'node:assert/strict';
import {
  VERSION,
  fresh,
  start,
  actions,
  activate,
  assertState,
  stage,
  lineIndices,
  trailCells,
  incoming
} from '../dist/engine.mjs';

// ----------------------------------------------------
// 1. Setup & Card Zone Conservation (12 cards)
// ----------------------------------------------------
test('Nexus Setup: 12 unique cards distributed across zones', () => {
  const s = fresh(20261016);
  assert.equal(s.version, VERSION);
  assert.equal(s.screen, 'title');
  assert.equal(s.encounter, 1);
  assert.equal(s.hp, 18);
  assert.equal(s.enemy, 12);
  assert.equal(s.progress, 0);
  assert.equal(s.friend, 0);

  // 2 cards on grid (run.0 at 0, cover.0 at 4)
  assert.equal(s.grid[0], 'run.0');
  assert.equal(s.grid[4], 'cover.0');
  assert.equal(s.grid.filter(Boolean).length, 2);

  // 4 cards in hand
  assert.equal(s.hand.length, 4);

  // 6 cards in draw, 0 in discard
  assert.equal(s.draw.length, 6);
  assert.equal(s.discard.length, 0);

  // assertState validates exact 12 unique cards in zones
  assert.ok(assertState(s));

  // Transition to play screen
  const playing = start(s);
  assert.equal(playing.screen, 'play');
  assert.ok(assertState(playing));
});

test('Invariant: Card conservation holds across all turn activations', () => {
  let s = start(fresh(12345));

  for (let turn = 1; turn <= 8; turn++) {
    const legal = actions(s);
    if (!legal.length || s.screen !== 'play') break;

    const res = activate(s, legal[0]);
    assert.ok(res.valid);
    s = res.state;

    // Verify 12 cards invariant after every action
    const zones = [...s.hand, ...s.draw, ...s.discard, ...s.grid.filter(Boolean)];
    assert.equal(zones.length, 12);
    assert.equal(new Set(zones).size, 12);
    assert.ok(assertState(s));
  }
});

// ----------------------------------------------------
// 2. Line Activation (Row & Col) and Line Indices
// ----------------------------------------------------
test('Line Indices: exact row and column cell mappings', () => {
  // Rows
  assert.deepEqual(lineIndices(0, 'row'), [0, 1, 2]);
  assert.deepEqual(lineIndices(1, 'row'), [0, 1, 2]);
  assert.deepEqual(lineIndices(2, 'row'), [0, 1, 2]);
  assert.deepEqual(lineIndices(3, 'row'), [3, 4, 5]);
  assert.deepEqual(lineIndices(5, 'row'), [3, 4, 5]);
  assert.deepEqual(lineIndices(6, 'row'), [6, 7, 8]);
  assert.deepEqual(lineIndices(8, 'row'), [6, 7, 8]);

  // Columns
  assert.deepEqual(lineIndices(0, 'col'), [0, 3, 6]);
  assert.deepEqual(lineIndices(3, 'col'), [0, 3, 6]);
  assert.deepEqual(lineIndices(6, 'col'), [0, 3, 6]);
  assert.deepEqual(lineIndices(1, 'col'), [1, 4, 7]);
  assert.deepEqual(lineIndices(4, 'col'), [1, 4, 7]);
  assert.deepEqual(lineIndices(2, 'col'), [2, 5, 8]);
  assert.deepEqual(lineIndices(8, 'col'), [2, 5, 8]);
});

test('Line Clearing: line clears ONLY when filled with 3 cards after placement', () => {
  let s = start(fresh(99999));
  // Initial grid: cell 0 = 'run.0', cell 4 = 'cover.0'
  // Row 0 has only cell 0 filled.
  // Hand has 'arrow.0'. Place at cell 1, activate row 0.
  const a1 = { card: 'arrow.0', cell: 1, axis: 'row', face: 0 };
  const r1 = activate(s, a1);
  assert.ok(r1.valid);
  s = r1.state;

  // Row 0 has 2 cards (cell 0 and 1, cell 2 is empty) -> line NOT full -> NO clear!
  assert.equal(r1.summary.cleared.length, 0);
  assert.equal(s.grid[0], 'run.0');
  assert.equal(s.grid[1], 'arrow.0');
  assert.equal(s.grid[2], null);

  // Now fill cell 2 with a card from hand to complete row 0
  const cardToFill = s.hand[0];
  const a2 = { card: cardToFill, cell: 2, axis: 'row', face: 0 };
  const r2 = activate(s, a2);
  assert.ok(r2.valid);
  s = r2.state;

  // Row 0 now had 3 cards -> ALL 3 CLEARED!
  assert.equal(r2.summary.cleared.length, 3);
  assert.deepEqual(r2.summary.cleared, ['run.0', 'arrow.0', cardToFill]);
  assert.equal(s.grid[0], null);
  assert.equal(s.grid[1], null);
  assert.equal(s.grid[2], null);

  // Cleared cards went to discard
  assert.ok(s.discard.includes('run.0'));
  assert.ok(s.discard.includes('arrow.0'));
  assert.ok(s.discard.includes(cardToFill));

  // Cell 4 ('cover.0') on row 1 was NOT cleared
  assert.equal(s.grid[4], 'cover.0');
});

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
// 3. Trail Cells (0, 4, 8)
// ----------------------------------------------------
test('Trail: Empty trail cells grant +1 movement; placing card covers trail', () => {
  let s = start(fresh(55555));
  // Cell 8 is empty and is a trail cell!
  assert.ok(trailCells.includes(8));

  // Put cover.0 in hand and place at cell 6, activating row 2 (cells 6, 7, 8)
  putInHand(s, 'cover.0');
  const a = { card: 'cover.0', cell: 6, axis: 'row', face: 0 };
  const res = activate(s, a);
  assert.ok(res.valid);

  // Cell 8 was empty on trail -> gave +1 movement!
  const trailEffects = res.summary.effects.filter(e => e.op === 'trail');
  assert.equal(trailEffects.length, 1);
  assert.equal(trailEffects[0].cell, 8);
  assert.equal(trailEffects[0].amount, 1);
  assert.equal(res.state.progress, 1);

  // If a card is placed ON cell 8, trail is covered and no trail effect triggers for cell 8
  let s2 = start(fresh(55556));
  putInHand(s2, 'cover.0');
  const a2 = { card: 'cover.0', cell: 8, axis: 'row', face: 0 };
  const res2 = activate(s2, a2);
  assert.ok(res2.valid);
  const trail2 = res2.summary.effects.filter(e => e.op === 'trail');
  assert.equal(trail2.length, 0); // No trail effect because cell 8 is covered!
});

// ----------------------------------------------------
// 4. Shift Mechanics (Face 0 vs Face 1)
// ----------------------------------------------------
test('Shift Face 0: Swaps the other two cells in line and vanishes', () => {
  let s = start(fresh(33333));
  putInHand(s, 'shift.0');
  // Row 0 currently has grid[0]='run.0', grid[1]=null, grid[2]=null
  // Place shift.0 at cell 1, axis 'row', face 0
  const a = { card: 'shift.0', cell: 1, axis: 'row', face: 0 };
  const staged = stage(s, a);
  // Staged swaps cells 0 and 2 (even if 2 was null)
  assert.deepEqual(staged.swaps, [{ from: 0, to: 2 }]);
  assert.equal(staged.grid[0], null);
  assert.equal(staged.grid[1], 'shift.0');
  assert.equal(staged.grid[2], 'run.0');

  const res = activate(s, a);
  assert.ok(res.valid);
  // Shift vanishes
  assert.ok(res.summary.vanished.includes('shift.0'));
  assert.equal(res.state.grid[1], null);
});

test('Shift Face 1: Does NOT swap cells, grants prime +3 and vanishes', () => {
  let s = start(fresh(33334));
  putInHand(s, 'shift.0');

  // Place shift.0 at cell 2, face 1 ('اعقد العزم')
  const a = { card: 'shift.0', cell: 2, axis: 'row', face: 1 };
  const staged = stage(s, a);
  assert.equal(staged.swaps.length, 0); // No swap on face 1!

  const res = activate(s, a);
  assert.ok(res.valid);
  const primeFx = res.summary.effects.find(e => e.op === 'prime');
  assert.ok(primeFx);
  assert.equal(primeFx.amount, 3);
  assert.ok(res.summary.vanished.includes('shift.0'));
});

// ----------------------------------------------------
// 5. Wards and Shelters
// ----------------------------------------------------
test('Wards: Shelter face 1 leaves ward; empty ward grants block; placing card erases ward', () => {
  let s = start(fresh(44444));
  // Hand has cards; upgrade hand[0] to shelter
  const targetUid = s.hand[0];
  s.upgrades[targetUid] = 'shelter';

  // Place shelter at cell 2, face 1 ('اترك ساترًا')
  const a1 = { card: targetUid, cell: 2, axis: 'row', face: 1 };
  const res1 = activate(s, a1);
  assert.ok(res1.valid);

  // Shelter vanished and left a ward at cell 2
  assert.equal(res1.state.wards[2], true);
  assert.equal(res1.state.grid[2], null);
  assert.ok(res1.summary.vanished.includes(targetUid));

  // Next turn: activating row 0 (which contains cell 2 with a ward)
  // Empty ward at cell 2 grants 1 block!
  s = res1.state;
  const nextCard = s.hand[0];
  const a2 = { card: nextCard, cell: 1, axis: 'row', face: 0 };
  const res2 = activate(s, a2);
  assert.ok(res2.valid);
  const wardFx = res2.summary.effects.find(e => e.op === 'ward');
  assert.ok(wardFx);
  assert.equal(wardFx.cell, 2);
  assert.equal(wardFx.amount, 1);

  // Now place a card directly ON cell 2: the ward is ERASED!
  s = res2.state;
  if (s.screen === 'reward') {
    const rew = activate(s, { kind: 'reward', choice: 'keep' });
    assert.ok(rew.valid);
    s = rew.state;
  }
  const thirdCard = s.hand[0];
  const a3 = { card: thirdCard, cell: 2, axis: 'row', face: 0 };
  const res3 = activate(s, a3);
  assert.ok(res3.valid);
  assert.equal(res3.state.wards[2], false); // Ward erased!
  assert.ok(res3.summary.erasedWard);
});

// ----------------------------------------------------
// 6. Invariant Checks in assertState()
// ----------------------------------------------------
test('assertState: Throws on corrupted states', () => {
  const valid = start(fresh(11111));
  assert.ok(assertState(valid));

  // Corrupt 1: 11 cards instead of 12
  const s1 = structuredClone(valid);
  s1.hand.pop();
  assert.throws(() => assertState(s1), /Card zone corruption/);

  // Corrupt 2: Duplicate card UID
  const s2 = structuredClone(valid);
  s2.hand[0] = s2.hand[1];
  assert.throws(() => assertState(s2), /Card zone corruption/);

  // Corrupt 3: Ward under a card
  const s3 = structuredClone(valid);
  s3.wards[0] = true; // cell 0 has run.0!
  assert.throws(() => assertState(s3), /Invalid resources/);

  // Corrupt 4: HP out of bounds (> 18)
  const s4 = structuredClone(valid);
  s4.hp = 19;
  assert.throws(() => assertState(s4), /Invalid resources/);

  // Corrupt 5: Negative enemy
  const s5 = structuredClone(valid);
  s5.enemy = -1;
  assert.throws(() => assertState(s5), /Invalid resources/);

  // Corrupt 6: Committed face for a card not on grid
  const s6 = structuredClone(valid);
  s6.faces['knife.0'] = 0; // knife.0 is in hand, not on grid!
  assert.throws(() => assertState(s6), /Invalid committed face/);

  // Corrupt 7: Encounter 2 without firstResult
  const s7 = structuredClone(valid);
  s7.encounter = 2;
  s7.firstResult = null;
  assert.throws(() => assertState(s7), /Invalid journey/);
});
