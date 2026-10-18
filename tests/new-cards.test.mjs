import test from 'node:test';
import assert from 'node:assert/strict';
import {
  VERSION, RULESET, LINES, def, cardType, selectedLine,
  attackTargets, targetForAction, getEnemyIntent, draw, assertState,
  fresh, setupEncounter
} from '../dist/engine.mjs';

// Extended card definitions including the 3 previously approved cards + the 5 newly approved cards (excluding #3)
export const EXTENDED_CARDS = {
  strike: { name: 'ضربة محسوبة', icon: 'swords', kind: 'attack', effects: [{ op: 'hit', n: 2 }], text: 'ألحق ضررين بعدو تختاره.' },
  shelter: { name: 'ساتر', icon: 'shield', kind: 'defense', effects: [{ op: 'block', n: 2 }], text: 'احصل على درعين لرد الأعداء الحالي.' },
  advance: { name: 'تقدّم محمي', icon: 'swords', kind: 'mixed', effects: [{ op: 'hit', n: 1 }, { op: 'block', n: 1 }], text: 'ألحق ضررًا واحصل على درع. يصبح الضرر ٢ إذا اكتمل الخط المختار.' },
  cross: { name: 'ضربة العارض', icon: 'swords', kind: 'attack', effects: [{ op: 'hit', n: 1 }], text: 'ألحق ضررًا بعدو تختاره. يصبح الضرر ٣ إذا كان المحور المتعامد يحتوي على ورقة أخرى على الأقل.' },
  scout: { name: 'استطلاع الأثر', icon: 'eye', kind: 'utility-attack', effects: [{ op: 'hit', n: 1 }], text: 'ألحق ضررًا بعدو تختاره. إذا اكتمل الخط المختار وفُرّغ، اسحب ورقة إضافية.' },
  haven: { name: 'عياذ الصخر', icon: 'shield', kind: 'defense', effects: [{ op: 'block', n: 1 }], text: 'احصل على درع واحد لرد الأعداء الحالي. إذا اكتمل الخط المختار وفُرّغ، يصبح الدرع ٣.' },
  anvil: { name: 'وتد المرقبة', icon: 'shield', kind: 'terrain-defense', effects: [{ op: 'block', n: 1 }], text: 'احصل على درع واحد لرد الأعداء الحالي. تصبح هذه الخانة موضعًا محصنًا؛ أي ورقة تُفعل في هذه الخانة لاحقًا تمنحك درعًا إضافيًا واحدًا.' },
  scorch: { name: 'حَرّة النار', icon: 'fire', kind: 'terrain-attack', effects: [{ op: 'hit', n: 1 }], text: 'ألحق ضررًا واحدًا بعدو تختاره. تصبح هذه الخانة حَرّةً ملتهبة؛ أي ورقة هجومية تُفعل في هذه الخانة لاحقًا تلحق ضررًا إضافيًا واحدًا.' },
  aegis: { name: 'جلاد الصبر', icon: 'shield', kind: 'defense', effects: [{ op: 'block', n: 2 }], text: 'احصل على درعين لرد الأعداء الحالي. يصبح الدرع ٤ إذا كانت صحتك ١٢ أو أقل.' },
  disrupt: { name: 'عقر البأس', icon: 'swords', kind: 'disrupt-attack', effects: [{ op: 'hit', n: 1 }], text: 'ألحق ضررًا واحدًا بعدو تختاره، وخفّض هجومه المعلن لهذا الدور بمقدار ١.' },
  stagger: { name: 'قاصمة التوازن', icon: 'swords', kind: 'heavy-attack', effects: [{ op: 'hit', n: 2 }], text: 'ألحق ضررين بعدو تختاره. إذا ألحق هذا الخط إجمالي ٤ أضرار أو أكثر في هذا الدور، يتراجع هجوم العدو لهذا الدور بمقدار ٢.' }
};

export const EXTENDED_TYPES = Object.keys(EXTENDED_CARDS);

export function extendedDef(uid) {
  const type = cardType(uid);
  return EXTENDED_CARDS[type];
}

export function perpendicularLine(cell, axis) {
  return axis === 'row' ? selectedLine(cell, 'column') : selectedLine(cell, 'row');
}

export function activateExtended(before, a) {
  const invalid = () => ({ valid: false, state: before, summary: null });
  if (!a || before?.version !== VERSION || before.ruleset !== RULESET) return invalid();
  if (before.screen !== 'play' || !before.hand.includes(a.card) || !Number.isInteger(a.cell) || a.cell < 0 || a.cell >= 9 || before.grid[a.cell] || !['row', 'column'].includes(a.axis) || (a.face !== undefined && a.face !== 0) || (a.target !== undefined && !attackTargets(before).some(e => e.id === a.target))) return invalid();

  const s = structuredClone(before);
  s.gridTurf = s.gridTurf || Array(9).fill(null);
  const action = { card: a.card, cell: a.cell, axis: a.axis, face: 0, target: targetForAction(s, a) };
  if (!action.target) return invalid();

  s.hand.splice(s.hand.indexOf(a.card), 1);
  s.grid[a.cell] = a.card;
  s.faces[a.card] = 0;
  s.placements++;

  const line = selectedLine(a.cell, a.axis);
  const cells = line.filter(i => s.grid[i]);
  const complete = cells.length === 3;

  const summary = {
    kind: 'turn', action, cells, lines: complete ? [line] : [], clearedCells: [], events: [], effects: [], cleared: [],
    hits: 0, block: 0, incoming: 0, prevented: 0, unusedBlock: 0, enemyDamage: 0, log: [], drawn: [],
    enemyAttackReduction: 0
  };

  let extraDraws = 0;

  for (const cell of cells) {
    const uid = s.grid[cell];
    const d = extendedDef(uid);
    const qualified = complete;
    const type = cardType(uid);

    summary.events.push({ type: 'activate', cell, card: uid });

    // Turf effects: check if cell is fortified or scorched
    if (s.gridTurf[cell] === 'fortified') {
      summary.block += 1;
      summary.events.push({ type: 'shield', cell, amount: 1, value: summary.block, source: 'turf-fortified', target: 'hero' });
    }

    let extraHit = 0;
    if (s.gridTurf[cell] === 'scorched' && ['attack', 'mixed', 'terrain-attack', 'disrupt-attack', 'heavy-attack'].includes(d.kind)) {
      extraHit = 1;
    }

    // Apply permanent turf modifications when playing anvil or scorch
    if (type === 'anvil') {
      s.gridTurf[cell] = 'fortified';
    } else if (type === 'scorch') {
      s.gridTurf[cell] = 'scorched';
    }

    for (const effect of d.effects) {
      let n = effect.n;

      if (type === 'advance' && effect.op === 'hit' && qualified) {
        n = 2;
      } else if (type === 'cross' && effect.op === 'hit') {
        const perp = perpendicularLine(cell, a.axis);
        const hasPerpOther = perp.some(idx => idx !== cell && s.grid[idx]);
        n = hasPerpOther ? 3 : 1;
      } else if (type === 'haven' && effect.op === 'block' && qualified) {
        n = 3;
      } else if (type === 'scout' && qualified) {
        extraDraws++;
      } else if (type === 'aegis' && effect.op === 'block') {
        n = s.hp <= 12 ? 4 : 2;
      } else if (type === 'disrupt') {
        summary.enemyAttackReduction += 1;
      }

      if (effect.op === 'hit') {
        n += extraHit;
      }

      summary.effects.push({ uid, card: uid, cell, op: effect.op, n, amount: n, target: effect.op === 'hit' ? action.target : 'hero' });

      if (effect.op === 'block') {
        summary.block += n;
        summary.events.push({ type: 'shield', cell, amount: n, value: summary.block, target: 'hero' });
      } else {
        const target = s.enemies.find(e => e.id === action.target);
        if (!target || target.hp <= 0) continue;
        const amount = Math.min(target.hp, n);
        target.hp -= amount;
        summary.hits += amount;
        summary.events.push({ type: 'damage', cell, source: uid, target: target.id, amount, hp: target.hp, fatal: target.hp === 0 });
      }
    }
  }

  // Check stagger threshold: if total line hits >= 4, and a stagger card was activated
  const hasStagger = cells.some(c => cardType(s.grid[c]) === 'stagger');
  if (hasStagger && summary.hits >= 4) {
    summary.enemyAttackReduction += 2;
    summary.events.push({ type: 'stagger', amount: 2 });
  }

  if (complete) {
    for (const cell of line) {
      const uid = s.grid[cell];
      summary.cleared.push(uid);
      summary.clearedCells.push(cell);
      s.discard.push(uid);
      s.grid[cell] = null;
      delete s.faces[uid];
    }
  }

  let shield = summary.block;
  for (const e of attackTargets(s)) {
    const rawDamage = getEnemyIntent(e).damage;
    const damage = Math.max(0, rawDamage - summary.enemyAttackReduction);
    const blocked = Math.min(shield, damage);
    const lost = Math.min(s.hp, damage - blocked);
    shield -= blocked;
    s.hp -= lost;
    summary.incoming += damage;
    summary.prevented += blocked;
    summary.enemyDamage += lost;
    summary.events.push({ type: 'enemy-attack', source: e.id, rawDamage, amount: damage, blocked, damage: lost, hp: s.hp, shield });
  }
  summary.unusedBlock = shield;

  // Standard end of turn draw
  const normalDraw = draw(s);
  if (normalDraw) summary.drawn.push(normalDraw);

  // Extra draws from complete scout lines
  for (let i = 0; i < extraDraws; i++) {
    const bonus = draw(s);
    if (bonus) summary.drawn.push(bonus);
  }

  s.turn++;
  s.phaseTurn++;

  if (s.hp <= 0) {
    s.screen = 'end';
    s.outcome = 'defeat';
  } else if (!attackTargets(s).length) {
    s.screen = s.encounter === 3 ? 'end' : 'reward';
    s.outcome = s.screen === 'end' ? 'victory' : null;
  }

  summary.log = [`ضرر ${summary.hits} · حماية ${summary.block} · خسارة صحة ${summary.enemyDamage}`];
  s.last = summary;
  return { valid: true, state: s, summary };
}

export function createFixture(grid = {}, hand = ['strike'], enemyHp = 100, enemyAttack = 0) {
  const deck = EXTENDED_TYPES.flatMap(t => [0, 1, 2, 3].map(i => `${t}.${i}`));
  const pool = [...deck];
  const take = type => {
    const idx = pool.findIndex(uid => uid.startsWith(type + '.'));
    if (idx === -1) throw Error(`Pool empty for ${type}`);
    return pool.splice(idx, 1)[0];
  };

  const s = {
    version: VERSION,
    ruleset: RULESET,
    seed: 20261017,
    rng: 20261017,
    deck,
    draw: [],
    discard: [],
    hand: [],
    grid: Array(9).fill(null),
    gridTurf: Array(9).fill(null),
    faces: {},
    enemies: [{ id: 'dummy', name: 'هدف اختبار', hp: enemyHp, maxHp: enemyHp, attack: enemyAttack, shield: 0 }],
    encounter: 1,
    turn: 1,
    phaseTurn: 1,
    placements: 0,
    hp: 24,
    maxHp: 24,
    screen: 'play',
    outcome: null,
    last: null
  };

  for (const [idxStr, type] of Object.entries(grid)) {
    const idx = Number(idxStr);
    s.grid[idx] = take(type);
    s.faces[s.grid[idx]] = 0;
  }
  s.hand = hand.map(take);
  s.draw = pool;
  return s;
}

// --- UNIT TESTS ---

test('Batch 1: cross, scout, haven verified', () => {
  const s = createFixture({ 1: 'strike' }, ['cross'], 10);
  const r = activateExtended(s, { card: s.hand[0], cell: 4, axis: 'row' });
  assert.equal(r.summary.hits, 3, 'Cross deals 3 damage with perpendicular card');

  const sScout = createFixture({ 1: 'strike', 2: 'shelter' }, ['scout'], 10);
  const rScout = activateExtended(sScout, { card: sScout.hand[0], cell: 0, axis: 'row' });
  assert.equal(rScout.summary.drawn.length, 2, 'Scout draws 2 cards on clear');

  const sHaven = createFixture({ 1: 'strike', 2: 'shelter' }, ['haven'], 10);
  const rHaven = activateExtended(sHaven, { card: sHaven.hand[0], cell: 0, axis: 'row' });
  assert.equal(rHaven.summary.block, 5, 'Haven scales to 3 on complete line');
});

test('Card 4: جلاد الصبر (aegis) - 2 block when HP > 12, scales to 4 block when HP <= 12', () => {
  // Test HP > 12
  const sHigh = createFixture({}, ['aegis'], 10, 2);
  sHigh.hp = 20;
  const rHigh = activateExtended(sHigh, { card: sHigh.hand[0], cell: 0, axis: 'row' });
  assert.equal(rHigh.summary.block, 2, '2 block at high HP');

  // Test HP <= 12 (Clutch)
  const sLow = createFixture({}, ['aegis'], 10, 4);
  sLow.hp = 10;
  const rLow = activateExtended(sLow, { card: sLow.hand[0], cell: 0, axis: 'row' });
  assert.equal(rLow.summary.block, 4, '4 block at critical HP');
  assert.equal(rLow.summary.prevented, 4, 'Completely absorbed 4 enemy incoming damage');
  assert.equal(rLow.state.hp, 10, 'Health preserved at 10');
});

test('Card 5: عقر البأس (disrupt) - deals 1 hit and reduces enemy attack by -1', () => {
  const s = createFixture({}, ['disrupt'], 10, 3);
  const r = activateExtended(s, { card: s.hand[0], cell: 0, axis: 'row' });
  assert.equal(r.summary.hits, 1);
  assert.equal(r.summary.enemyAttackReduction, 1, 'Enemy attack reduced by 1');
  assert.equal(r.summary.incoming, 2, 'Incoming damage was 3 - 1 = 2');
  assert.equal(r.summary.enemyDamage, 2, 'Player took 2 damage instead of 3');
});

test('Card 6: قاصمة التوازن (stagger) - 2 hits; triggers -2 enemy attack reduction when line hits >= 4', () => {
  // Scenario A: Stagger alone (2 hits < 4) -> no stagger reduction
  const sAlone = createFixture({}, ['stagger'], 10, 4);
  const rAlone = activateExtended(sAlone, { card: sAlone.hand[0], cell: 0, axis: 'row' });
  assert.equal(rAlone.summary.hits, 2);
  assert.equal(rAlone.summary.enemyAttackReduction, 0, 'No reduction because hits (2) < 4');
  assert.equal(rAlone.summary.incoming, 4);

  // Scenario B: Line has strike (2 hits) + stagger (2 hits) = 4 total hits!
  const sCombo = createFixture({ 1: 'strike' }, ['stagger'], 10, 4);
  const rCombo = activateExtended(sCombo, { card: sCombo.hand[0], cell: 0, axis: 'row' });
  assert.equal(rCombo.summary.hits, 4, 'Line dealt 4 damage');
  assert.equal(rCombo.summary.enemyAttackReduction, 2, 'Stagger triggered! Enemy attack reduced by 2');
  assert.equal(rCombo.summary.incoming, 2, 'Enemy incoming reduced from 4 to 2!');
});

test('Dynamic enemy intents: cyclical patterns, including preparing (0) turns, repeat as declared', () => {
  const s1 = fresh();
  const tracker = s1.enemies[0];
  assert.equal(tracker.hp, 14);
  assert.deepEqual([1, 2, 3, 4].map(t => getEnemyIntent(tracker, t).damage), [2, 4, 1, 2], 'tutorial: small, spike, rest');

  setupEncounter(s1, 5);
  const leader = s1.enemies.find(e => e.id === 'leader');
  assert.deepEqual([1, 2, 3, 4, 5].map(t => getEnemyIntent(leader, t).damage), [2, 3, 0, 6, 2], 'a 0 is a preparing turn, not a frozen enemy');
  assert.equal(s1.enemies.length, 3);

  setupEncounter(s1, 3);
  const armor = s1.enemies[0];
  assert.deepEqual([1, 2, 3, 4, 5, 6].map(t => getEnemyIntent(armor, t).damage), [1, 2, 10, 1, 2, 10], 'telegraphed wind-up spike');
});
