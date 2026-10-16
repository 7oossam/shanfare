import test from 'node:test';
import assert from 'node:assert/strict';
import {
  fresh,
  start,
  activate,
  assertState,
  goal,
  ENCOUNTERS
} from '../dist/engine.mjs';

function putInHand(s, uid) {
  // Always clear grid if uid was on grid
  const gridIdx = s.grid.indexOf(uid);
  if (gridIdx >= 0) {
    s.grid[gridIdx] = null;
    delete s.faces[uid];
  }
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
  s.hand.push(uid);
}

// ----------------------------------------------------
// 1. Encounter 1: Granite Chokepoint (مَضِيقُ الصَّفَا)
// ----------------------------------------------------
test('Encounter 1: Progress reaches 10 transitions to reward drafting', () => {
  let s = start(fresh(4001));
  s.progress = 9;
  putInHand(s, 'run.0');

  const res = activate(s, { card: 'run.0', cell: 6, axis: 'row', face: 0 });
  assert.ok(res.valid);
  assert.ok(res.state.progress >= 10);
  assert.equal(res.state.screen, 'reward');
  assert.equal(res.state.draftChoices.length, 3);
  assert.ok(assertState(res.state));
});

test('Encounter 1: Defeating all enemies transitions to reward drafting', () => {
  let s = start(fresh(4002));
  s.enemies.forEach(e => e.hp = 0);
  s.enemy = 0;
  putInHand(s, 'run.0');

  const res = activate(s, { card: 'run.0', cell: 6, axis: 'row', face: 0 });
  assert.ok(res.valid);
  assert.equal(res.state.screen, 'reward');
  assert.ok(assertState(res.state));
});

// ----------------------------------------------------
// 2. Encounter 2: Oasis Pool & Relic Selection
// ----------------------------------------------------
test('Encounter 2 Transition: Spring heals health and offers Relic on completion', () => {
  let s = start(fresh(4003));
  s.encounter = 2;
  s.screen = 'play';
  s.hp = 15;
  putInHand(s, 'run.0');

  // Trigger empty trail/spring at cell 4 in row 1
  s.grid[4] = null; // empty spring cell
  const res = activate(s, { card: 'run.0', cell: 3, axis: 'row', face: 0 });
  assert.ok(res.valid);
  // Oasis spring in cell 4 heals +4 HP
  assert.ok(res.state.hp > 15);

  // Complete Encounter 2
  res.state.enemies.forEach(e => e.hp = 0);
  res.state.enemy = 0;
  putInHand(res.state, 'run.0');
  const resWin = activate(res.state, { card: 'run.0', cell: 5, axis: 'row', face: 0 });
  assert.equal(resWin.state.screen, 'reward');

  // Pick draft reward
  const resDraft = activate(resWin.state, { kind: 'draft', choice: resWin.state.draftChoices[0] });
  assert.equal(resDraft.state.screen, 'interlude');

  // Continue from interlude triggers Relic selection screen!
  const resRelic = activate(resDraft.state, { kind: 'continue' });
  assert.equal(resRelic.state.screen, 'relic');

  // Pick wolf skin relic
  const resRelicPick = activate(resRelic.state, { kind: 'relic', choice: 'wolf_skin' });
  assert.ok(resRelicPick.state.relics.includes('wolf_skin'));
  assert.equal(resRelicPick.state.encounter, 3);
  assert.equal(resRelicPick.state.screen, 'play');
});

// ----------------------------------------------------
// 3. Encounter 3 & 4 Progression to Victory
// ----------------------------------------------------
test('Encounter 4: Defeating Boss Awf ibn Sakhr wins the full run', () => {
  let s = start(fresh(4004));
  s.encounter = 4;
  s.screen = 'play';
  s.enemies = ENCOUNTERS[3].enemies.map(e => ({ ...e }));
  s.enemy = s.enemies.reduce((acc, e) => acc + e.hp, 0);

  // Defeat warlord and shields
  s.enemies.forEach(e => e.hp = 0);
  s.enemy = 0;
  putInHand(s, 'run.0');

  const res = activate(s, { card: 'run.0', cell: 6, axis: 'row', face: 0 });
  assert.ok(res.valid);
  assert.equal(res.state.screen, 'end');
  assert.equal(res.state.outcome, 'full');
});
