import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CARDS,
  APPROACHES,
  BOONS,
  fresh,
  restore,
  play,
  leap,
  drink,
  exert,
  endTurn,
  reason,
  distance,
  intent,
  targets,
  cardEffect,
  movementTargets,
  terrain,
  forecast
} from '../../dist/archive-1d/engine.mjs';

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

// ----------------------------------------------------
// 1. Initial State & Setup Invariants
// ----------------------------------------------------
test('Encounter Setup: verify all approaches conform to rules', () => {
  for (const [key, app] of Object.entries(APPROACHES)) {
    const s = fresh(1000, key);
    assert.equal(s.version, 2);
    assert.equal(s.phase, 'battle');
    assert.equal(s.turn, 1);
    assert.equal(s.energy, 3);
    assert.equal(s.strain, 0);
    assert.equal(s.block, 0);
    assert.equal(s.pos, app.pos);
    assert.equal(s.hand.length, 5);
    assert.deepEqual(s.hand, app.hand);

    if (key === 'lure') {
      assert.equal(s.hp, 18);
      assert.equal(s.enemies[0].pos, 3);
      assert.equal(s.enemies[1].hp, 13);
      assert.equal(s.ruleset, 'lure');
      assert.equal(s.exhaust.length, 0);
    } else {
      assert.equal(s.hp, 48);
      assert.equal(s.maxHp, 48);
      assert.equal(s.enemies[0].pos, 2);
      assert.equal(s.enemies[0].hp, 35);
      assert.equal(s.enemies[1].pos, 4);
      assert.equal(s.enemies[1].hp, 29);
      // Total cards in deck + hand = 18
      assert.equal(s.deck.length + s.hand.length + s.discard.length, 18);
    }
  }
});

test('Boons: verify keepsake initialization effects', () => {
  const sWolf = fresh(1000, 'trail', 'wolf');
  assert.equal(sWolf.boon, 'wolf');
  assert.equal(sWolf.water, 2);

  const sWind = fresh(1000, 'trail', 'wind');
  assert.equal(sWind.boon, 'wind');
  assert.equal(sWind.water, 3); // 1 extra water charge

  const sBow = fresh(1000, 'trail', 'bow');
  assert.equal(sBow.boon, 'bow');
  assert.equal(sBow.water, 2);
});

// ----------------------------------------------------
// 2. State Invariants
// ----------------------------------------------------
test('Invariant: Card conservation holds across standard plays', () => {
  const s = fresh(2000, 'trail');
  const countCards = (state) =>
    state.deck.length + state.hand.length + state.discard.length + (state.exhaust?.length || 0);

  const initialCount = countCards(s);
  assert.equal(initialCount, 18);

  // Play advance (cost 1 energy, +1 move, +4 block)
  const advIdx = s.hand.indexOf('advance');
  const res1 = play(s, advIdx);
  assert.ok(!res1.error);
  assert.equal(countCards(s), initialCount);

  // Exert to strain 2 (no weary yet)
  exert(s);
  assert.equal(countCards(s), initialCount);

  // Leap discarding a card (+1 strain -> strain 3)
  const leapTargets = movementTargets(s);
  assert.ok(leapTargets.length > 0);
  const leapRes = leap(s, 0, leapTargets[0]);
  assert.ok(!leapRes.error);
  assert.equal(countCards(s), initialCount);

  // End turn (discards hand, draws 5)
  endTurn(s);
  assert.equal(countCards(s), initialCount);
});

test('Invariant: HP always in [0, maxHp]', () => {
  const s = fresh(3000, 'trail');
  assert.ok(s.hp >= 0 && s.hp <= s.maxHp);

  // Drink when already full HP should be rejected
  const drinkFull = drink(s);
  assert.ok(drinkFull.error);
  assert.equal(s.hp, s.maxHp);

  // Set HP to 47, drink should cap at 48
  s.hp = 47;
  const drinkHeal = drink(s);
  assert.ok(!drinkHeal.error);
  assert.equal(s.hp, 48);

  // Massive enemy damage should floor at 0
  s.hp = 5;
  s.block = 0;
  // Artificially large incoming damage via endTurn
  s.enemies[0].hp = 35;
  s.enemies[0].pos = s.pos + 1; // distance 1
  s.turn = 3; // heavy strike 11 dmg
  endTurn(s);
  assert.equal(s.hp, 0);
  assert.equal(s.phase, 'defeat');
});

test('Invariant: Energy never negative and correctly deducted', () => {
  const s = fresh(4000, 'trail');
  assert.equal(s.energy, 3);

  // Playing card costing 2 energy
  const wolfIdx = s.hand.indexOf('wolf');
  const res = play(s, wolfIdx, 'guard');
  assert.ok(!res.error);
  assert.equal(s.energy, 1);

  // Trying to play card costing 2 energy with 1 energy left -> rejected
  s.hand.push('wolf');
  const res2 = play(s, s.hand.length - 1, 'guard');
  assert.equal(res2.error, 'طاقة غير كافية — يمكنك التجلّد');
  assert.equal(s.energy, 1);
});

test('Invariant: Position bounds [0, 4] and collision avoidance', () => {
  const s = fresh(5000, 'trail');
  s.pos = 0;
  s.enemies[0].pos = 1;
  s.enemies[1].pos = 4;
  s.hand = ['advance', 'retreat'];

  // Advance right when enemy is at pos 1 -> blocked
  const resAdv = play(s, 0);
  assert.equal(resAdv.error, 'الخصم يسدّ الخطوة؛ وثبة العَدّاء تعبر فوقه');
  assert.equal(s.pos, 0);

  // Retreat left when at pos 0 -> blocked by valley edge
  const resRet = play(s, 1);
  assert.equal(resRet.error, 'طرف الوادي: استخدم وثبة العَدّاء لتبديل موضعك');
  assert.equal(s.pos, 0);

  // Leap cannot land on an occupied tile or out of bounds
  assert.ok(!movementTargets(s).includes(0)); // cannot land on self
  assert.ok(!movementTargets(s).includes(1)); // cannot land on guard
  assert.ok(!movementTargets(s).includes(4)); // cannot land on archer (and dist 4 > 3)
  assert.deepEqual(movementTargets(s), [2, 3]); // only 2 and 3 reachable
});

// ----------------------------------------------------
// 3. Edge Cases
// ----------------------------------------------------
test('Edge Case: Push enemy at position 0 or 4 or into another enemy', () => {
  // Push at right border (pos 4)
  const s1 = fresh(6000, 'trail');
  s1.pos = 3;
  s1.enemies[0].pos = 4; // guard at 4
  s1.enemies[1].pos = 0;
  s1.hand = ['shot'];
  const res1 = play(s1, 0, 'guard');
  assert.ok(!res1.error);
  assert.equal(s1.enemies[0].pos, 4); // did not move beyond 4
  assert.ok(s1.log.at(-1).includes('تعذّر دفع الخصم'));

  // Push at left border (pos 0)
  const s2 = fresh(6001, 'trail');
  s2.pos = 1;
  s2.enemies[0].pos = 0; // guard at 0
  s2.enemies[1].pos = 4;
  s2.hand = ['shot'];
  const res2 = play(s2, 0, 'guard');
  assert.ok(!res2.error);
  assert.equal(s2.enemies[0].pos, 0); // did not move below 0
  assert.ok(s2.log.at(-1).includes('تعذّر دفع الخصم'));

  // Push into another enemy
  const s3 = fresh(6002, 'trail');
  s3.pos = 1;
  s3.enemies[0].pos = 2; // guard at 2
  s3.enemies[1].pos = 3; // archer at 3
  s3.hand = ['shot'];
  const res3 = play(s3, 0, 'guard');
  assert.ok(!res3.error);
  assert.equal(s3.enemies[0].pos, 2); // blocked by archer
  assert.ok(s3.log.at(-1).includes('تعذّر دفع الخصم'));
});

test('Edge Case: Aimed shot steady requirement vs melee fallback', () => {
  const s = fresh(7000, 'trail');
  s.pos = 0;
  s.enemies[0].pos = 2; // distance 2
  s.enemies[1].pos = 4;
  s.hand = ['aim'];
  s.moved = true; // player moved earlier

  // Ranged aimed shot after moving -> REJECTED
  const resRanged = play(s, 0, 'guard');
  assert.equal(resRanged.error, 'الرمي المشدود يتطلب الثبات؛ مقبض القوس يبقى متاحًا قرب خصم');
  assert.equal(s.enemies[0].hp, 35);

  // But if adjacent (distance 1), bow handle melee strike is ALLOWED even after moving
  s.enemies[0].pos = 1;
  const resMelee = play(s, 0, 'guard');
  assert.ok(!resMelee.error);
  // Guard took 5 melee damage + 5 wolf follow-up (since moved=true) = 10 damage!
  assert.equal(s.enemies[0].hp, 25);
  // Guard pushed from 1 to 2
  assert.equal(s.enemies[0].pos, 2);
});

test('Edge Case: Exert at strain 3 triggers wear card at strain 5', () => {
  const s = fresh(8000, 'trail');
  s.strain = 3;
  const initialDiscard = s.discard.length;

  const res = exert(s);
  assert.equal(res, true);
  assert.equal(s.strain, 5);
  assert.equal(s.energy, 5); // 3 + 2
  assert.equal(s.discard.length, initialDiscard + 1);
  assert.equal(s.discard.at(-1), 'weary');
  assert.ok(s.log.at(-2).includes('بلغت مشقّة الجسد حدّها: أُضيف وَهَن'));
});

test('Edge Case: Breath reduces strain without going below 0', () => {
  const s = fresh(8001, 'trail');
  s.strain = 1;
  s.hand = ['breath'];
  play(s, 0);
  assert.equal(s.strain, 0);
  assert.equal(s.block, 3);
});

test('Edge Case: Leap with no valid destinations or empty hand', () => {
  const s = fresh(9000, 'trail');

  // Invalid index
  const res1 = leap(s, 99, 1);
  assert.equal(res1.error, 'اختر بطاقة تطرحها ثمنًا للوثبة');

  // Destination already occupied by guard
  const res2 = leap(s, 0, s.enemies[0].pos);
  assert.equal(res2.error, 'اختر موضعًا خاليًا مضاءً؛ الوثبة مرة كل دور');

  // Destination beyond max leap (distance > 3)
  s.pos = 0;
  const res3 = leap(s, 0, 4);
  assert.equal(res3.error, 'اختر موضعًا خاليًا مضاءً؛ الوثبة مرة كل دور');

  // Once leaped, movementTargets is empty and second leap rejected
  const res4 = leap(s, 0, 1); // wait, pos 1 is free if guard at 2
  assert.ok(!res4.error);
  assert.equal(s.leaped, true);
  assert.deepEqual(movementTargets(s), []);
  const res5 = leap(s, 0, 3);
  assert.equal(res5.error, 'اختر موضعًا خاليًا مضاءً؛ الوثبة مرة كل دور');
});

test('Edge Case / Known Bug: Card entering discard before resolution causes self-draw loop', () => {
  // Scavenge when deck and discard are empty
  const s1 = fresh(10000, 'trail');
  s1.deck = [];
  s1.discard = [];
  s1.hand = ['scavenge'];
  const res1 = play(s1, 0);
  assert.ok(!res1.error);
  // Scavenge draws itself back because it was pushed to discard before draw(1)
  assert.deepEqual(s1.hand, ['scavenge'], 'Demonstrating bug: scavenge draws itself');

  // Track when deck and discard are empty
  const s2 = fresh(10001, 'trail');
  s2.deck = [];
  s2.discard = [];
  s2.hand = ['track'];
  const res2 = play(s2, 0, 'guard');
  assert.ok(!res2.error);
  assert.deepEqual(s2.hand, ['track'], 'Demonstrating bug: track draws itself');
});

// ----------------------------------------------------
// 4. Save/Restore Roundtrip
// ----------------------------------------------------
test('Save/Restore: Full roundtrip preserves state fidelity across all approaches', () => {
  for (const app of ['trail', 'ridge', 'valley', 'lure']) {
    const s = fresh(11000, app);
    const json = JSON.stringify(s);
    const restored = restore(JSON.parse(json));
    assert.ok(restored !== null);
    assert.ok(deepEqual(s, restored));
  }
});

test('Save/Restore: Rejects corrupted or invalid states', () => {
  const valid = fresh(12000, 'trail');

  // Out of bounds player position
  const s1 = structuredClone(valid);
  s1.pos = 5;
  assert.equal(restore(s1), null);

  // Negative player position
  const s2 = structuredClone(valid);
  s2.pos = -1;
  assert.equal(restore(s2), null);

  // Negative HP
  const s3 = structuredClone(valid);
  s3.hp = -1;
  assert.equal(restore(s3), null);

  // HP > maxHp
  const s4 = structuredClone(valid);
  s4.hp = s4.maxHp + 1;
  assert.equal(restore(s4), null);

  // Negative energy
  const s5 = structuredClone(valid);
  s5.energy = -1;
  assert.equal(restore(s5), null);

  // Unknown card in hand
  const s6 = structuredClone(valid);
  s6.hand.push('unknown_card_id');
  assert.equal(restore(s6), null);

  // Invalid phase
  const s7 = structuredClone(valid);
  s7.phase = 'game_over';
  assert.equal(restore(s7), null);
});

test('Save/Restore: v1 save migration initializes v2 fields correctly', () => {
  const v1State = {
    version: 1,
    seed: 42,
    phase: 'battle',
    turn: 2,
    hp: 36,
    maxHp: 48,
    block: 4,
    energy: 2,
    strain: 1,
    pos: 1,
    moved: false,
    wolfUsed: false,
    exerted: false,
    played: 3,
    damageTaken: 12,
    enemies: [
      { id: 'guard', name: 'متعقّب الوادي', hp: 20, maxHp: 35, pos: 2, weak: 0 },
      { id: 'archer', name: 'رامي سلامان', hp: 15, maxHp: 29, pos: 4, weak: 0 }
    ],
    deck: ['shot', 'guard'],
    hand: ['knife', 'advance'],
    discard: ['wolf'],
    log: ['v1 log message']
  };

  const migrated = restore(v1State);
  assert.ok(migrated !== null);
  assert.equal(migrated.version, 2);
  assert.equal(migrated.hp, 36);
  assert.equal(migrated.pos, 1);
  assert.equal(migrated.water, 2);
  assert.equal(migrated.waterUsed, false);
  assert.equal(migrated.leaped, false);
  assert.equal(migrated.approach, 'trail');
  assert.equal(migrated.boon, null);
  assert.equal(migrated.boonUsed, false);
  assert.equal(migrated.enemies[0].marked, false);
  assert.equal(migrated.enemies[1].marked, false);
  assert.ok(migrated.log.at(-1).includes('وصلت تحسينات المورد'));
});

// ----------------------------------------------------
// 5. Tactical Formations & Forecast Precision
// ----------------------------------------------------
test('Formations: Leap escape is ALWAYS possible in all 60 legal 2-enemy formations', () => {
  let count = 0;
  for (let P = 0; P < 5; P++) {
    for (let G = 0; G < 5; G++) {
      if (G === P) continue;
      for (let A = 0; A < 5; A++) {
        if (A === P || A === G) continue;
        count++;
        const s = fresh(4444, 'trail');
        s.pos = P;
        s.enemies[0].pos = G;
        s.enemies[1].pos = A;
        const targets = movementTargets(s);
        // There must be at least 1 reachable destination
        assert.ok(targets.length >= 1, `Failed escape formation: P=${P}, G=${G}, A=${A}`);
      }
    }
  }
  assert.equal(count, 60, 'All 60 distinct formations tested');
});

test('Atomicity: Rejected card plays cause zero side-effects to state', () => {
  const s = fresh(5555, 'trail');
  s.energy = 0; // cannot play any card costing > 0
  const snapshot = JSON.stringify(s);

  // Attempt to play advance (costs 1)
  const res = play(s, s.hand.indexOf('advance'));
  assert.ok(res.error);
  assert.equal(JSON.stringify(s), snapshot, 'State must remain completely unchanged');
});

test('Forecast Fidelity: forecast() matches endTurn() state resolution identically', () => {
  for (let P = 0; P < 5; P++) {
    for (let G = 0; G < 5; G++) {
      if (G === P) continue;
      const s = fresh(6666, 'trail');
      s.pos = P;
      s.enemies[0].pos = G;
      s.enemies[1].pos = (G + 2) % 5 === P ? (G + 3) % 5 : (G + 2) % 5;
      s.block = 5;

      const predicted = forecast(s);
      const after = structuredClone(s);
      const events = endTurn(after);

      for (const f of predicted) {
        const enemyAfter = after.enemies.find(e => e.id === f.id);
        assert.equal(enemyAfter.pos, f.destination);
      }
      const totalHurt = events.filter(e => e.kind === 'hurt').reduce((n, e) => n + e.amount, 0);
      const predictedHurt = predicted.reduce((n, f) => n + f.hpLoss, 0);
      assert.equal(totalHurt, predictedHurt);
      assert.equal(after.hp, s.hp - predictedHurt);
    }
  }
});
