import test from 'node:test';
import assert from 'node:assert/strict';
import {
  fresh,
  start,
  activate,
  assertState,
  goal,
  collapseRow,
  incoming,
  def
} from '../dist/nexus/engine.mjs';

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
// 1. Encounter 1 Victory Paths & Interlude Transition
// ----------------------------------------------------
test('Encounter 1: Escape victory via movement 12 transitions to interlude', () => {
  let s = start(fresh(4001));
  s.progress = 11;
  putInHand(s, 'run.1');

  // Move 2 -> progress reaches 12!
  const res = activate(s, { card: 'run.1', cell: 6, axis: 'row', face: 0 });
  assert.ok(res.valid);
  assert.equal(res.state.progress, 12);
  assert.equal(res.state.screen, 'interlude');
  assert.ok(res.state.firstResult);
  assert.equal(res.state.firstResult.route, 'escape');
  assert.ok(assertState(res.state));
});

test('Encounter 1: Clean sweep victory (loot + rescue3 + enemy0) transitions to interlude', () => {
  let s = start(fresh(4002));
  s.loot = true;
  s.friend = 3;
  s.enemy = 2;
  putInHand(s, 'arrow.0');

  // Arrow hits 2 -> enemy reaches 0!
  const res = activate(s, { card: 'arrow.0', cell: 6, axis: 'row', face: 0 });
  assert.ok(res.valid);
  assert.equal(res.state.enemy, 0);
  assert.equal(res.state.screen, 'interlude');
  assert.ok(res.state.firstResult);
  assert.equal(res.state.firstResult.route, 'clear');
  assert.ok(assertState(res.state));
});

// ----------------------------------------------------
// 2. Interlude, Reward, and Second Encounter Setup
// ----------------------------------------------------
test('Encounter 2 Transition: Grid clears, wards reset, hand refills to 4, 12 cards conserved', () => {
  let s = start(fresh(4003));
  s.progress = 12;
  s.loot = true;
  s.firstResult = { turn: 4, hp: 16, enemy: 5, friend: 3, loot: true, route: 'escape' };
  s.screen = 'interlude';

  // 1. Interlude continue -> moves to reward screen
  const rInterlude = activate(s, { kind: 'continue' });
  assert.ok(rInterlude.valid);
  assert.equal(rInterlude.state.screen, 'reward');

  // 2. Reward keep -> moves to encounter 2
  const rReward = activate(rInterlude.state, { kind: 'reward', choice: 'keep' });
  assert.ok(rReward.valid);
  const s2 = rReward.state;

  assert.equal(s2.encounter, 2);
  assert.equal(s2.phaseTurn, 1);
  assert.equal(s2.progress, 0);
  assert.equal(goal(s2), 8); // Goal in encounter 2 is 8
  assert.equal(s2.enemy, 6);
  assert.equal(s2.screen, 'play');

  // Grid must be completely empty
  assert.deepEqual(s2.grid, Array(9).fill(null));
  assert.deepEqual(s2.wards, Array(9).fill(false));
  assert.deepEqual(s2.faces, {});
  assert.equal(s2.hand.length, 4);

  // Card zone conservation check
  const zones = [...s2.hand, ...s2.draw, ...s2.discard];
  assert.equal(zones.length, 12);
  assert.equal(new Set(zones).size, 12);
  assert.ok(assertState(s2));
});

// ----------------------------------------------------
// 3. Row Collapse in Encounter 2 (collapseRow)
// ----------------------------------------------------
test('Encounter 2 Collapse: Row order cycle [2, 1, 0] discards cards and clears wards', () => {
  let s = start(fresh(4004));
  s.progress = 12;
  s.loot = true;
  s.firstResult = { turn: 3, hp: 18, enemy: 0, friend: 3, loot: true, route: 'clear' };
  s.screen = 'interlude';
  s = activate(s, { kind: 'continue' }).state;
  s = activate(s, { kind: 'reward', choice: 'keep' }).state;
  assert.equal(s.encounter, 2);

  // Turn 1 in Encounter 2: phaseTurn = 1 -> collapseRow = 2 (bottom row: cells 6, 7, 8)
  assert.equal(collapseRow(s), 2);

  // Place a card in cell 6 (row 2)
  const card1 = s.hand[0];
  const r1 = activate(s, { card: card1, cell: 6, axis: 'row', face: 0 });
  assert.ok(r1.valid);
  // Row 2 collapsed!
  assert.equal(r1.summary.collapsedCells.length, 3);
  assert.deepEqual(r1.summary.collapsedCells, [6, 7, 8]);
  assert.ok(r1.summary.collapsed.includes(card1));
  assert.equal(r1.state.grid[6], null); // Cleared by collapse!

  // Turn 2 in Encounter 2: phaseTurn = 2 -> collapseRow = 1 (middle row: cells 3, 4, 5)
  assert.equal(r1.state.phaseTurn, 2);
  assert.equal(collapseRow(r1.state), 1);

  // Turn 3 in Encounter 2: phaseTurn = 3 -> collapseRow = 0 (top row: cells 0, 1, 2)
  const card2 = r1.state.hand[0];
  const r2 = activate(r1.state, { card: card2, cell: 0, axis: 'row', face: 0 });
  assert.ok(r2.valid);
  assert.equal(r2.state.phaseTurn, 3);
  assert.equal(collapseRow(r2.state), 0);
});

// ----------------------------------------------------
// 4. Friend Card Evolution Across Encounters
// ----------------------------------------------------
test('Friend Evolution: Rescued friend becomes "دِرْعُ الرَّفِيق" (block 2); unrescued friend becomes "وَحْشَةُ المُنْفَرِد" (move 1)', () => {
  // Case A: Friend rescued (friend === 3)
  const sRescued = { encounter: 2, friend: 3 };
  const dRescued = def('friend.0', sRescued, 0);
  assert.equal(dRescued.name, 'دِرْعُ الرَّفِيق');
  assert.equal(dRescued.short, 'صدّ ٢');

  // Case B: Friend NOT rescued (friend < 3 in Encounter 2)
  const sUnrescued = { encounter: 2, friend: 1 };
  const dUnrescued = def('friend.0', sUnrescued, 0);
  assert.equal(dUnrescued.name, 'وَحْشَةُ المُنْفَرِد');
  assert.equal(dUnrescued.short, 'تقدّم ١');
});

// ----------------------------------------------------
// 5. Incoming Damage Calculation
// ----------------------------------------------------
test('Incoming Damage: Matches encounter 1 and encounter 2 threat formulas', () => {
  // Encounter 1: enemy > 0 ? 2 + ceil(enemy / 6) : 0
  const sE1_full = { encounter: 1, enemy: 12 };
  assert.equal(incoming(sE1_full), 2 + Math.ceil(12 / 6)); // 2 + 2 = 4

  const sE1_half = { encounter: 1, enemy: 5 };
  assert.equal(incoming(sE1_half), 2 + Math.ceil(5 / 6)); // 2 + 1 = 3

  const sE1_dead = { encounter: 1, enemy: 0 };
  assert.equal(incoming(sE1_dead), 0);

  // Encounter 2: 1 + (enemy > 0 ? 2 : 0) + (firstResult.enemy > 0 ? 1 : 0)
  // Both alive
  const sE2_both = { encounter: 2, enemy: 6, firstResult: { enemy: 4 } };
  assert.equal(incoming(sE2_both), 1 + 2 + 1); // 4

  // First guard defeated in encounter 1
  const sE2_firstDead = { encounter: 2, enemy: 6, firstResult: { enemy: 0 } };
  assert.equal(incoming(sE2_firstDead), 1 + 2 + 0); // 3

  // Both dead in encounter 2
  const sE2_allDead = { encounter: 2, enemy: 0, firstResult: { enemy: 0 } };
  assert.equal(incoming(sE2_allDead), 1 + 0 + 0); // 1 (rocks/terrain damage)
});

// ----------------------------------------------------
// 6. Encounter 2 Final Victory
// ----------------------------------------------------
test('Encounter 2 Victory: Reaching progress 8 ends the run with victory outcome', () => {
  let s = start(fresh(4005));
  s.progress = 12;
  s.loot = true;
  s.friend = 3;
  s.firstResult = { turn: 3, hp: 18, enemy: 0, friend: 3, loot: true, route: 'clear' };
  s.screen = 'interlude';
  s = activate(s, { kind: 'continue' }).state;
  s = activate(s, { kind: 'reward', choice: 'keep' }).state;

  // In Encounter 2, set progress to 7 (goal is 8)
  s.progress = 7;
  putInHand(s, 'run.1');

  // Play run.1 (move 2) -> progress reaches 8!
  const res = activate(s, { card: 'run.1', cell: 0, axis: 'row', face: 0 });
  assert.ok(res.valid);
  assert.equal(res.state.progress, 8);
  assert.equal(res.state.screen, 'end');
  assert.equal(res.state.outcome, 'full'); // Friend was 3
});
