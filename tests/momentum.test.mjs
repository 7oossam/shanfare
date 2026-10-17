import test from 'node:test';
import assert from 'node:assert/strict';
import { fresh, start, activate, setupEncounter, assertState } from '../dist/engine.mjs';
import { preview, gameView } from '../dist/view.mjs';
import { begin, record, restore } from '../dist/report.mjs';

function fixture(grid, hand, momentum = 0) {
  const s = start(fresh(42));
  s.grid = [...grid, ...Array(9-grid.length).fill(null)];
  s.hand = hand;
  s.draw = s.deck.filter(uid => !s.grid.includes(uid) && !hand.includes(uid));
  s.discard = [];
  s.momentum = momentum;
  s.relics = [];
  assertState(s);
  return s;
}

test('Unspent credit persists across turns, saves, and previews; encounter transition resets it', () => {
  const s = fixture(['run.0'], ['cover.0', 'arrow.0'], 3);
  const a = { card:'cover.0', cell:1, axis:'row', face:0, target:'guard' };
  const r = activate(s,a);
  assert.deepEqual(r.summary.momentum, {before:3,gained:2,spent:0,after:5});
  assert.equal(r.summary.block,3);
  assert.deepEqual(preview(s,a).state,r.state);
  assert.equal(s.momentum,3);
  const saved = JSON.parse(JSON.stringify(r.state));
  assert.equal(restore(record(begin(s),s,a,r),saved).coverage,'complete');
  const next = activate(saved,{card:'arrow.0',cell:2,axis:'row',face:0});
  assert.equal(next.summary.momentum.spent,7);
  assert.equal(next.summary.hits,9);
  assert.equal(next.state.momentum,0);
  setupEncounter(saved,2);
  assert.equal(saved.momentum,0);
});

test('Only the first arrow spends existing credit; later generation remains available', () => {
  const s = fixture(['arrow.0','arrow.1'],['cover.0'],3);
  const r = activate(s,{card:'cover.0',cell:2,axis:'row',face:0});
  assert.deepEqual(r.summary.effects.filter(f=>f.op==='sniper').map(f=>f.momentumSpent),[3,0]);
  assert.equal(r.summary.hits,7);
  const after = fixture(['arrow.0','run.0'],['cover.0'],3);
  const x = activate(after,{card:'cover.0',cell:2,axis:'row',face:0});
  assert.deepEqual(x.summary.momentum,{before:3,gained:2,spent:3,after:2});
  assert.equal(x.summary.hits,5);
});

test('Visible current credit and forecast agree with execution', () => {
  const s = fixture(['run.0'],['arrow.0'],3);
  const p = {card:'arrow.0',cell:1,axis:'row',face:0};
  const html = gameView(s,p);
  assert.ok(html.includes('data-momentum-current>٣'));
  assert.ok(html.includes('data-momentum-after>٠'));
  assert.ok(html.includes('ستصرف <b>٥</b>'));
  assert.equal(activate(s,p).summary.hits,7);
});
