import test from 'node:test';
import assert from 'node:assert/strict';
import {
  VERSION,
  fresh,
  start,
  actions,
  activate,
  assertState,
  snapshot
} from '../dist/engine.mjs';
import { comboModel, comboHints } from '../dist/combos.mjs';
import { begin, record, restore as restoreReport } from '../dist/report.mjs';

function deepEqual(a, b, path = '') {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object' || a === null || b === null) return false;
  let keysA = Object.keys(a), keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (let k of keysA) {
    if (!keysB.includes(k) || !deepEqual(a[k], b[k], path + '.' + k)) return false;
  }
  return true;
}

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
// 1. Deterministic Replay
// ----------------------------------------------------
test('Replay: Same seed and actions reproduce identical game states', () => {
  const seed = 888123;
  let s1 = start(fresh(seed));
  let s2 = start(fresh(seed));

  assert.deepEqual(s1.draw, s2.draw);
  assert.deepEqual(s1.hand, s2.hand);

  for (let step = 0; step < 5; step++) {
    const legal1 = actions(s1);
    const legal2 = actions(s2);
    assert.deepEqual(legal1, legal2);
    if (!legal1.length) break;

    const act = legal1[0];
    const r1 = activate(s1, act);
    const r2 = activate(s2, act);

    assert.ok(r1.valid && r2.valid);
    assert.ok(deepEqual(r1.state, r2.state));

    s1 = r1.state;
    s2 = r2.state;
  }
});

// ----------------------------------------------------
// 2. Combo Model & Links (Prime + Hit / Ambush / Sniper)
// ----------------------------------------------------
test('Combos: Prime boost correctly links to following hit in line and expires', () => {
  let s = start(fresh(991122, false));

  putInHand(s, 'arrow.0');
  const a1 = { card: 'arrow.0', cell: 5, axis: 'col', face: 0 };
  const r1 = activate(s, a1);
  assert.ok(r1.valid);
  s = r1.state;
  assert.equal(s.grid[5], 'arrow.0');

  putInHand(s, 'trick.0');
  const a2 = { card: 'trick.0', cell: 3, axis: 'row', face: 0 };
  const r2 = activate(s, a2);
  assert.ok(r2.valid);

  const model = comboModel(s, a2, r2);
  assert.equal(model.links.length, 1);
  assert.equal(model.links[0].boost, 2);
  assert.equal(model.links[0].target, 'arrow.0');
  assert.equal(r2.summary.unusedPrime, 0);
});

// ----------------------------------------------------
// 3. Report Logging & Verification
// ----------------------------------------------------
test('Report: begin, record, and restore preserve complete event history', () => {
  const s0 = start(fresh(77123, false));
  let rep = begin(s0);
  assert.equal(rep.version, VERSION);
  assert.equal(rep.events.length, 0);

  const legal = actions(s0);
  const act = legal[0];
  const res = activate(s0, act);

  rep = record(rep, s0, act, res);
  assert.equal(rep.events.length, 1);
  assert.equal(rep.events[0].action, act);

  const restoredRep = restoreReport(rep, res.state);
  assert.equal(restoredRep.coverage, 'complete');
  assert.equal(restoredRep.events.length, 1);
});

// ----------------------------------------------------
// 4. Playthrough Verification
// ----------------------------------------------------
test('Playthrough: Automated greedy search completes turn steps smoothly', () => {
  let s = start(fresh(20261016, false));
  let steps = 0;
  const maxSteps = 30;

  while (s.screen !== 'end' && steps < maxSteps) {
    steps++;
    assert.ok(assertState(s));

    if (s.screen === 'interlude') {
      const r = activate(s, { kind: 'continue' });
      assert.ok(r.valid);
      s = r.state;
      continue;
    }

    if (s.screen === 'reward') {
      const r = activate(s, { kind: 'skip' });
      assert.ok(r.valid);
      s = r.state;
      continue;
    }

    if (s.screen === 'relic') {
      const r = activate(s, { kind: 'relic', choice: 'wolf_skin' });
      assert.ok(r.valid);
      s = r.state;
      continue;
    }

    const legal = actions(s);
    if (!legal.length) break;

    let bestAct = legal[0];
    let bestScore = -Infinity;

    for (const a of legal) {
      const next = activate(s, a);
      if (!next.valid) continue;
      const score = (next.state.progress * 10) + ((30 - next.state.enemy) * 5) + (next.state.hp * 2);
      if (score > bestScore) {
        bestScore = score;
        bestAct = a;
      }
    }

    const res = activate(s, bestAct);
    assert.ok(res.valid);
    s = res.state;
  }

  assert.ok(steps < maxSteps, 'Playthrough did not hang');
  assert.ok(assertState(s));
});
