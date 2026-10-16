import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CARDS,
  APPROACHES,
  fresh,
  play,
  leap,
  drink,
  exert,
  movementTargets,
  forecast
} from '../../dist/archive-1d/engine.mjs';
import { preview, incoming, summary } from '../../dist/archive-1d/presentation.mjs';

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

test('Presentation: preview does not mutate state or advance seed', () => {
  const s = fresh(12345, 'trail');
  const snapshot = JSON.stringify(s);

  // Preview card play
  preview(s, { index: 0, target: 'guard', kind: 'card' });
  assert.equal(JSON.stringify(s), snapshot);

  // Preview leap
  const leapTargets = movementTargets(s);
  if (leapTargets.length > 0) {
    preview(s, { index: 0, destination: leapTargets[0], kind: 'leap' });
    assert.equal(JSON.stringify(s), snapshot);
  }

  // Preview exert
  preview(s, { kind: 'exert' });
  assert.equal(JSON.stringify(s), snapshot);

  // Preview drink
  const sDamaged = structuredClone(s);
  sDamaged.hp = 30;
  const snapDamaged = JSON.stringify(sDamaged);
  preview(sDamaged, { kind: 'drink' });
  assert.equal(JSON.stringify(sDamaged), snapDamaged);
});

test('Presentation: preview matches play results across all hand cards', () => {
  for (const app of ['trail', 'ridge', 'valley', 'lure']) {
    const s = fresh(54321, app);
    for (let i = 0; i < s.hand.length; i++) {
      for (const target of [undefined, 'guard', 'archer']) {
        const p = preview(s, { index: i, target, kind: 'card' });

        const realCopy = structuredClone(s);
        const realRes = play(realCopy, i, target);

        if (p.error) {
          assert.equal(p.error, realRes.error);
        } else {
          assert.ok(!realRes.error);
          assert.ok(deepEqual(p.after, realCopy));
          assert.equal(p.energy, realCopy.energy - s.energy);
          assert.equal(p.block, realCopy.block - s.block);
          assert.equal(p.strain, realCopy.strain - s.strain);
          assert.equal(p.hp, realCopy.hp - s.hp);
        }
      }
    }
  }
});

test('Presentation: preview matches leap, drink, and exert actions', () => {
  const s = fresh(777, 'trail');

  // Exert preview
  const pExert = preview(s, { kind: 'exert' });
  const sExert = structuredClone(s);
  exert(sExert);
  assert.ok(deepEqual(pExert.after, sExert));

  // Drink preview
  const sDamaged = structuredClone(s);
  sDamaged.hp = 20;
  sDamaged.strain = 2;
  const pDrink = preview(sDamaged, { kind: 'drink' });
  const sDrink = structuredClone(sDamaged);
  drink(sDrink);
  assert.ok(deepEqual(pDrink.after, sDrink));
  assert.equal(pDrink.hp, 3);
  assert.equal(pDrink.strain, -2); // strain 2 -> 0

  // Leap preview
  const targets = movementTargets(s);
  for (const dest of targets) {
    const pLeap = preview(s, { kind: 'leap', index: 0, destination: dest });
    const sLeap = structuredClone(s);
    leap(sLeap, 0, dest);
    assert.ok(deepEqual(pLeap.after, sLeap));
  }
});

test('Presentation: incoming matches forecast damage exactly', () => {
  const s = fresh(888, 'trail');
  const expectedIncoming = forecast(s).reduce((acc, f) => acc + f.hpLoss, 0);
  assert.equal(incoming(s), expectedIncoming);

  // When phase is victory or defeat, incoming is 0
  const sWon = structuredClone(s);
  sWon.phase = 'victory';
  assert.equal(incoming(sWon), 0);
});

test('Presentation: summary returns formatted text for all cards', () => {
  const sRock = fresh(999, 'trail');
  sRock.pos = 0; // rock
  const sSand = fresh(999, 'trail');
  sSand.pos = 2; // sand

  for (const id of Object.keys(CARDS)) {
    const sumRock = summary(sRock, id);
    assert.equal(typeof sumRock, 'string');
    assert.ok(sumRock.length > 0);

    const sumSand = summary(sSand, id);
    assert.equal(typeof sumSand, 'string');
    assert.ok(sumSand.length > 0);
  }

  // Guard at rock gets bonus mention
  assert.ok(summary(sRock, 'guard').includes('من الصخر'));
  assert.ok(!summary(sSand, 'guard').includes('من الصخر'));

  // Weary card text differs in lure
  const sLure = fresh(424242, 'lure');
  assert.ok(summary(sLure, 'weary').includes('لا يصلح للوثبة'));
  assert.ok(summary(sRock, 'weary').includes('اطرحه للوثبة'));
});
