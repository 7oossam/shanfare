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
  incoming,
  RELICS
} from '../dist/engine.mjs';

function putOnGrid(s, uid, cell) {
  if (s.grid[cell]) {
    delete s.faces[s.grid[cell]];
    s.grid[cell] = null;
  }
  s.hand = s.hand.filter(u => u !== uid);
  s.draw = s.draw.filter(u => u !== uid);
  s.discard = s.discard.filter(u => u !== uid);
  const oldGridIdx = s.grid.indexOf(uid);
  if (oldGridIdx >= 0) {
    s.grid[oldGridIdx] = null;
    delete s.faces[uid];
  }
  s.grid[cell] = uid;
  s.faces[uid] = 0;
}

function putInHand(s, uid) {
  if (s.hand.includes(uid)) return;
  const gridIdx = s.grid.indexOf(uid);
  if (gridIdx >= 0) {
    const replaced = s.hand.pop();
    s.grid[gridIdx] = null;
    delete s.faces[uid];
    s.discard.push(replaced);
    s.hand.push(uid);
    return;
  }
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
}

// ----------------------------------------------------
// 1. Setup & Card Zone Conservation (10 cards starter deck)
// ----------------------------------------------------
test('Roguelike Setup: 10 starter cards distributed across zones', () => {
  const s = fresh(20261016);
  assert.equal(s.version, VERSION);
  assert.equal(s.screen, 'title');
  assert.equal(s.encounter, 1);
  assert.equal(s.hp, 24);
  assert.equal(s.deck.length, 10);
  assert.equal(s.hand.length, 4);
  assert.equal(s.draw.length, 4);
  assert.equal(s.grid.filter(Boolean).length, 2);
  assert.ok(assertState(s));

  const playing = start(s);
  assert.equal(playing.screen, 'play');
  assert.ok(assertState(playing));
});

test('Invariant: Card conservation holds across turn activations', () => {
  let s = start(fresh(12345));

  for (let turn = 1; turn <= 6; turn++) {
    const legal = actions(s);
    if (!legal.length || s.screen !== 'play') break;

    const res = activate(s, legal[0]);
    assert.ok(res.valid);
    s = res.state;

    const zones = [...s.hand, ...s.draw, ...s.discard, ...s.grid.filter(Boolean)];
    assert.equal(zones.length, s.deck.length);
    assert.equal(new Set(zones).size, s.deck.length);
    assert.ok(assertState(s));
  }
});

// ----------------------------------------------------
// 2. Relic 1: Runner's Sandals (نَعْلا العَدَّاء)
// ----------------------------------------------------
test('Relic Sandals: Unspent momentum converts to +2 block per point', () => {
  let s = start(fresh(777));
  s.relics = ['sandals'];
  putInHand(s, 'run.0');

  // Face 0 gives +2 momentum and +2 movement
  const res = activate(s, { card: 'run.0', cell: 1, axis: 'row', face: 0 });
  assert.ok(res.valid);
  // Unspent momentum (2) * 2 = 4 block
  assert.ok(res.summary.block >= 4);
});

// ----------------------------------------------------
// 3. Relic 2: Waterskin of the Wolf (قِرْبَةُ الذِّئْبِ)
// ----------------------------------------------------
test('Relic Waterskin: Full line clear applies 3 Bleed and strikes 3 damage', () => {
  let s = start(fresh(888));
  s.relics = ['wolf_skin'];
  putOnGrid(s, 'run.0', 0);
  putOnGrid(s, 'arrow.0', 1);
  putInHand(s, 'knife.0');

  const enemyBefore = s.enemy;
  const res = activate(s, { card: 'knife.0', cell: 2, axis: 'row', face: 0 });
  assert.ok(res.valid);
  assert.equal(res.summary.cleared.length, 3);
  assert.ok(res.state.bleed >= 3);
  assert.ok(enemyBefore - res.state.enemy >= 6); // 3 knife + 3 wolf strike
});

// ----------------------------------------------------
// 4. Relic 3: Crag of Salaman (صَخْرَةُ سَلامَان)
// ----------------------------------------------------
test('Relic Crag: Erasing a stone ward causes 5 explosion damage and 3 block', () => {
  let s = start(fresh(999));
  s.relics = ['crag_salaman'];
  s.wards[1] = true; // stone ward at cell 1
  putInHand(s, 'cover.0');

  const enemyBefore = s.enemy;
  const res = activate(s, { card: 'cover.0', cell: 1, axis: 'row', face: 0 });
  assert.ok(res.valid);
  assert.ok(enemyBefore - res.state.enemy >= 5);
  assert.ok(res.summary.block >= 6); // 3 cover + 3 crag explosion block
});

// ----------------------------------------------------
// 5. Relic 4: Taabbata Bracer (مِعْصَمُ تَأَبَّطَ شَرّاً)
// ----------------------------------------------------
test('Relic Taabbata Bracer: Empty cells grant +2 damage boost and +1 momentum', () => {
  let s = start(fresh(111));
  s.relics = ['taabbata_bracer'];
  s.grid[0] = null;
  s.grid[1] = null;
  putInHand(s, 'knife.0');

  const enemyBefore = s.enemy;
  // Row 0 has cell 0 and cell 1 empty. That's 2 empty cells = +4 damage!
  const res = activate(s, { card: 'knife.0', cell: 2, axis: 'row', face: 0 });
  assert.ok(res.valid);
  // Knife 3 + 4 bracer boost = 7 damage
  assert.ok(enemyBefore - res.state.enemy >= 7);
});

// ----------------------------------------------------
// 6. Drafting & Ascetic Purge (الزهد والاستغناء)
// ----------------------------------------------------
test('Ascetic Purge: Removes card from deck to thin deck', () => {
  let s = start(fresh(222));
  s.screen = 'reward';
  s.draftChoices = ['sniper_wind', 'flint_blade', 'granite_spire'];

  const deckCountBefore = s.deck.length;
  const res = activate(s, { kind: 'purge' });
  assert.ok(res.valid);
  assert.equal(res.state.deck.length, deckCountBefore - 1);
  assert.equal(res.state.screen, 'interlude');
});
