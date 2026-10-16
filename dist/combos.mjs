import { activate, stage, lineIndices, cardType, def, actions } from './engine.mjs?v=8';

const ATTACK_OPS = ['hit', 'ambush', 'sniper', 'cyclone_shot', 'wolf_pounce', 'aoe_hit', 'explode_bleed'];

// Presentation evidence derived from resolved effects; this does not change the rules.
export function comboModel(s, a, result = activate(s, a)) {
  if (!result.valid || result.summary.kind !== 'turn') {
    return { steps: [], links: [], expired: [], ambushes: [], swaps: [] };
  }

  const { grid, faces } = stage(s, a);
  const shown = { ...s, faces };
  const cells = lineIndices(a.cell, a.axis);
  const effects = result.summary.effects || [];
  const links = [];
  const ambushes = [];
  let pending = [];

  for (const fx of effects) {
    if (fx.op === 'prime') {
      pending.push({ uid: fx.uid, name: def(fx.uid, shown).name, cell: fx.cell, amount: fx.amount });
    }
    if (ATTACK_OPS.includes(fx.op)) {
      const pos = cells.indexOf(fx.cell);
      const next = pos < 2 ? cells[pos + 1] : null;
      const open = next !== null && !grid[next];
      const base = fx.op === 'ambush' ? (open ? 4 : 1) : cardType(fx.uid, s) === 'knife' ? 3 : 2;

      if (fx.op === 'ambush') {
        ambushes.push({ uid: fx.uid, cell: fx.cell, next, open, base, damage: fx.amount });
      }

      if (pending.length) {
        links.push({
          sources: pending,
          target: fx.uid,
          targetName: def(fx.uid, shown).name,
          cell: fx.cell,
          base,
          boost: fx.boost || 0,
          power: base + (fx.boost || 0),
          damage: fx.amount
        });
        pending = [];
      }
    }
  }

  return {
    totals: result.summary,
    steps: cells.map(cell => ({
      cell,
      uid: grid[cell],
      name: grid[cell]
        ? def(grid[cell], shown).name
        : effects.some(e => e.cell === cell && e.op === 'ward')
        ? 'ساتر'
        : effects.some(e => e.cell === cell && e.op === 'trail')
        ? 'درب'
        : 'فراغ',
      effects: effects.filter(e => e.cell === cell)
    })),
    links,
    expired: pending,
    ambushes,
    swaps: result.summary.swaps || []
  };
}

export function comboHints(s, card, face = 0) {
  const hints = {};
  for (const a of actions(s)) {
    if (a.card !== card || a.face !== face) continue;
    const x = activate(s, a);
    const m = comboModel(s, a, x);
    if (m.links.length) {
      const boost = m.links.reduce((n, l) => n + l.boost, 0);
      (hints[a.cell] ??= []).push({ axis: a.axis, boost, targets: m.links.map(l => l.target) });
    }
  }
  return hints;
}
