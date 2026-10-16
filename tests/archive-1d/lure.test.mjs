import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CARDS,
  fresh,
  play,
  leap,
  exert,
  endTurn,
  forecast,
  isolated,
  movementTargets
} from '../../dist/archive-1d/engine.mjs';

test('Lure Setup: deterministic starting parameters', () => {
  const s = fresh(424242, 'lure');
  assert.equal(s.ruleset, 'lure');
  assert.equal(s.hp, 18);
  assert.equal(s.energy, 3);
  assert.equal(s.pos, 0);
  assert.equal(s.boon, null);
  assert.deepEqual(s.hand, ['aim', 'knife', 'guard', 'shot', 'advance']);
  assert.equal(s.enemies[0].id, 'guard');
  assert.equal(s.enemies[0].pos, 3);
  assert.equal(s.enemies[0].hp, 35);
  assert.equal(s.enemies[1].id, 'archer');
  assert.equal(s.enemies[1].pos, 4);
  assert.equal(s.enemies[1].hp, 13);
  assert.equal(s.enemies[1].maxHp, 13);
  assert.deepEqual(s.exhaust, []);
});

test('Lure Plans: enemy plans are committed at turn start', () => {
  const s = fresh(424242, 'lure');
  const guard = s.enemies.find(e => e.id === 'guard');
  const archer = s.enemies.find(e => e.id === 'archer');

  // Guard commits to lunge across cells [0, 1] for 11 damage
  assert.ok(guard.plan);
  assert.equal(guard.plan.turn, 1);
  assert.equal(guard.plan.origin, 3);
  assert.equal(guard.plan.destination, 1);
  assert.deepEqual(guard.plan.cells, [0, 1]);
  assert.equal(guard.plan.damage, 11);

  // Archer commits to sweep volley across cells [1, 2, 3] for 6 damage
  assert.ok(archer.plan);
  assert.equal(archer.plan.turn, 1);
  assert.equal(archer.plan.origin, 4);
  assert.equal(archer.plan.destination, 4);
  assert.deepEqual(archer.plan.cells, [1, 2, 3]);
  assert.equal(archer.plan.damage, 6);
});

test('Lure Leap: costs 1 energy and exhausts non-weary card without strain', () => {
  const s = fresh(424242, 'lure');
  const aimIdx = s.hand.indexOf('aim');

  const res = leap(s, aimIdx, 2);
  assert.ok(!res.error);
  assert.equal(s.energy, 2); // 3 - 1
  assert.equal(s.strain, 0); // zero strain in lure
  assert.equal(s.pos, 2);
  assert.deepEqual(s.exhaust, ['aim']);
  assert.deepEqual(s.opening.burned, ['aim']);

  // Trying to leap with weary in lure must fail
  s.hand.push('weary');
  s.leaped = false; // reset leaped flag to test weary rejection
  const wearyIdx = s.hand.indexOf('weary');
  const resWeary = leap(s, wearyIdx, 1);
  assert.equal(resWeary.error, 'الوَهَن لا يصلح ثمنًا؛ اختر مهارة تتخلّى عنها');
});

test('Lure Push: pushing enemy away from origin interrupts committed attack', () => {
  const s = fresh(424242, 'lure');
  // Kill archer with aim (cost 2) so pos 4 becomes free
  play(s, s.hand.indexOf('aim'), 'archer');
  assert.equal(s.enemies.find(e => e.id === 'archer').hp, 0);

  // Exert to gain +2 energy
  exert(s);

  // Player at 0 leaps to 2 using advance (cost 1 energy)
  leap(s, s.hand.indexOf('advance'), 2);

  // Guard is at 3 (adjacent to player at 2). Player uses bow close strike (shot) (cost 1 energy)
  const shotIdx = s.hand.indexOf('shot');
  const playRes = play(s, shotIdx, 'guard');
  assert.ok(!playRes.error);

  // Guard is pushed from 3 to 4 (into the vacated pos 4)
  assert.equal(s.enemies[0].pos, 4);
  assert.ok(s.log.at(-2).includes('دفعتَ الخصم بمقبض القوس'));

  // Forecast should show guard attack interrupted
  const fc = forecast(s);
  const guardFc = fc.find(f => f.id === 'guard');
  assert.equal(guardFc.interrupted, true);
  assert.equal(guardFc.damage, 0);
  assert.equal(guardFc.hpLoss, 0);
});

test('Lure Wolf: isolation requirement', () => {
  const s = fresh(424242, 'lure');
  const guard = s.enemies.find(e => e.id === 'guard');
  const archer = s.enemies.find(e => e.id === 'archer');

  // Initially guard is at 3 and archer is at 4 -> distance is 1 -> NOT isolated
  assert.equal(isolated(s, guard), false);
  assert.equal(isolated(s, archer), false);

  // Playing wolf card directly when not isolated is rejected
  s.hand.push('wolf');
  const resWolf = play(s, s.hand.length - 1, 'guard');
  assert.equal(resWolf.error, 'السِّيد لا ينقضّ على خصمين متجاورين؛ افصل الفريسة أولًا');

  // If archer dies, guard is automatically isolated
  archer.hp = 0;
  assert.equal(isolated(s, guard), true);
});

test('Lure Exposure: missed tracker lunge creates exposure window', () => {
  const s = fresh(424242, 'lure');
  // Player leaps to pos 2 (out of guard's lunge cells [0, 1])
  leap(s, s.hand.indexOf('aim'), 2);
  endTurn(s);

  // Guard missed! Guard should be exposed on turn 2
  const guard = s.enemies.find(e => e.id === 'guard');
  assert.equal(guard.exposed, true);
  assert.equal(guard.pos, 1); // Guard lunged to 1
  const archer = s.enemies.find(e => e.id === 'archer');
  assert.equal(archer.pos, 4);
  // Guard and Archer are separated by |1 - 4| = 3 > 1 -> Guard is isolated!
  assert.equal(isolated(s, guard), true);

  // Player attacks exposed guard without moving
  s.hand.push('knife');
  s.pos = 2; // adjacent to guard at 1
  const hitRes = play(s, s.hand.length - 1, 'guard');
  assert.ok(!hitRes.error);
  // Wolf follow-up triggered due to exposure!
  assert.ok(hitRes.events.some(ev => ev.kind === 'wolf'));
  assert.equal(guard.exposed, false); // exposure consumed
});

test('Lure Plan 1 (Hold): verifies README opening specification', () => {
  const s = fresh(424242, 'lure');
  // 1. Aimed shot kills archer (13 HP)
  const aimIdx = s.hand.indexOf('aim');
  const r1 = play(s, aimIdx, 'archer');
  assert.ok(!r1.error);
  assert.equal(s.enemies.find(e => e.id === 'archer').hp, 0);

  // 2. Guard card gives 8 block at rock (pos 0)
  const guardIdx = s.hand.indexOf('guard');
  const r2 = play(s, guardIdx);
  assert.ok(!r2.error);
  assert.equal(s.block, 8);

  // 3. End turn: tracker deals 11 - 8 = 3 damage. 15 HP left. Aim in discard (not exhausted)
  endTurn(s);
  assert.equal(s.hp, 15);
  assert.equal(s.damageTaken, 3);
  assert.deepEqual(s.exhaust, []);
});

test('Lure Plan 2 (Bait): verifies README opening specification', () => {
  const s = fresh(424242, 'lure');
  // 1. Sacrifice aimed shot to leap to pos 2
  const aimIdx = s.hand.indexOf('aim');
  const r1 = leap(s, aimIdx, 2);
  assert.ok(!r1.error);
  assert.deepEqual(s.exhaust, ['aim']);

  // 2. Knife the tracker (pos 3, player at 2)
  const knifeIdx = s.hand.indexOf('knife');
  const r2 = play(s, knifeIdx, 'guard');
  assert.ok(!r2.error);
  assert.equal(s.enemies.find(e => e.id === 'guard').hp, 26);

  // 3. Guard card gives 5 block in sand (pos 2)
  const guardIdx = s.hand.indexOf('guard');
  const r3 = play(s, guardIdx);
  assert.ok(!r3.error);
  assert.equal(s.block, 5);

  // 4. End turn: tracker misses (0 damage, exposed), archer volley deals 6 - 5 = 1 damage. 17 HP left.
  endTurn(s);
  assert.equal(s.hp, 17);
  assert.equal(s.damageTaken, 1);
  const guard = s.enemies.find(e => e.id === 'guard');
  assert.equal(guard.hp, 26);
  assert.equal(guard.exposed, true);
  assert.ok(s.openingReport);
  assert.equal(s.openingReport.hpLeft, 17);
  assert.equal(s.openingReport.hpLost, 1);
  assert.deepEqual(s.openingReport.burned, ['aim']);
});
