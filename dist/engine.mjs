export const VERSION = 'shanfara-duel-v9';
export const GRID_SIZE = 2;
export const LINES = [[0, 1], [2, 3], [0, 2], [1, 3]];
const face = (name, icon, effects, text) => ({ name, icon, effects, text });
export const cards = {
  focus: face('عزم', 'fire', [{ op: 'momentum', n: 2 }], 'تجمع نقطتي زخم للهجوم القادم.'),
  arrow: face('سهم', 'bow', [{ op: 'sniper', n: 2 }], 'ضرران زائد كل الزخم، ثم يصرف الرصيد كاملًا.'),
  cover: face('احتماء', 'shield', [{ op: 'block', n: 3 }], 'تصد ثلاثة أضرار من الهجوم القادم.'),
  knife: face('جرح', 'knife', [{ op: 'hit', n: 2 }, { op: 'bleed', n: 1 }], 'ضرران ونقطة نزيف على العدو المستهدف.'),
  wolf: face('نهش', 'wolf', [{ op: 'hit', n: 3 }], 'ثلاثة أضرار للعدو المستهدف.'),
  trick: face('خدعة', 'spark', [{ op: 'prime', n: 2 }], 'يزيد الهجوم التالي بضررين.'),
  strong_arrow: face('سهم صقيل', 'bow', [{ op: 'sniper', n: 3 }], 'ثلاثة أضرار زائد الزخم كله، ثم يصرفه.'),
  strong_cover: face('حصن', 'shield', [{ op: 'block', n: 4 }], 'تصد أربعة أضرار من الهجوم القادم.'),
  strong_focus: face('ثبات', 'fire', [{ op: 'momentum', n: 3 }], 'تجمع ثلاث نقاط زخم.')
};
export const alternates = {
  focus: face('عزم', 'fire', [{ op: 'momentum', n: 4 }], 'تجمع أربع نقاط زخم وتختفي من الشبكة.'),
  arrow: face('سهم', 'bow', [{ op: 'hit', n: 4 }], 'أربعة أضرار دون استهلاك الزخم، وتختفي من الشبكة.'),
  cover: face('احتماء', 'shield', [{ op: 'block', n: 6 }], 'تصد ستة أضرار وتختفي من الشبكة.'),
  knife: face('جرح', 'knife', [{ op: 'bleed', n: 4 }], 'أربع نقاط نزيف على العدو المستهدف وتختفي من الشبكة.'),
  wolf: face('نهش', 'wolf', [{ op: 'pounce', n: 4 }], 'أربعة أضرار، أو سبعة إذا كان الهدف ينزف وتختفي من الشبكة.'),
  trick: face('خدعة', 'spark', [{ op: 'prime', n: 4 }], 'يزيد الهجوم التالي بأربعة أضرار وتختفي من الشبكة.'),
  strong_arrow: face('سهم صقيل', 'bow', [{ op: 'hit', n: 6 }], 'ستة أضرار دون استهلاك الزخم وتختفي من الشبكة.'),
  strong_cover: face('حصن', 'shield', [{ op: 'block', n: 8 }], 'تصد ثمانية أضرار وتختفي من الشبكة.'),
  strong_focus: face('ثبات', 'fire', [{ op: 'momentum', n: 5 }], 'تجمع خمس نقاط زخم وتختفي من الشبكة.')
};
export const rewards = ['strong_arrow', 'strong_cover', 'strong_focus', 'knife', 'wolf', 'trick'];
const enemy = (id, name, hp, attack, shield = 0) => ({ id, name, hp, maxHp: hp, attack, shield, bleed: 0 });
export const ENCOUNTERS = [
  { name: 'مضيق الصفا', enemies: [enemy('guard', 'حارس المضيق', 16, 2), enemy('scout', 'متربّص الصحراء', 12, 1)] },
  { name: 'كمين المورد', enemies: [enemy('captain', 'قائد الكمين', 20, 3), enemy('archer', 'رامي الكمين', 14, 1)] },
  { name: 'شعاب الغبش', enemies: [enemy('hunter', 'صائد الجوائز', 24, 3), enemy('raider', 'قاطع الطريق', 18, 2)] },
  { name: 'معسكر سلامان', enemies: [enemy('warlord', 'عوف بن صخر', 32, 3), enemy('shield_r', 'حامل الترس', 12, 1), enemy('shield_l', 'حامل الترس', 12, 1)] }
];
export const cardType = uid => uid?.split('.')[0];
export const def = (uid, s, f = s?.faces?.[uid] ?? 0) => (f === 1 ? alternates : cards)[cardType(uid)];
export const snapshot = s => { const { last, ...rest } = s; return structuredClone(rest); };
function random(s) { s.rng = (Math.imul(s.rng, 1664525) + 1013904223) >>> 0; return s.rng / 4294967296; }
function shuffle(s, list) { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(random(s) * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
export function draw(s) {
  while (s.hand.length < 5) {
    if (!s.draw.length) { if (!s.discard.length) break; s.draw = shuffle(s, s.discard); s.discard = []; }
    s.hand.push(s.draw.shift());
  }
}
export function fresh(seed = 20261017) {
  const deck = ['focus.0', 'arrow.0', 'cover.0', 'focus.1', 'arrow.1', 'focus.2', 'arrow.2', 'cover.1', 'arrow.3', 'cover.2'];
  const s = { version: VERSION, seed: seed >>> 0, rng: seed >>> 0, screen: 'title', encounter: 1, turn: 1, placements: 0, phaseTurn: 1, hp: 24, maxHp: 24, momentum: 0, prime: 0, deck, hand: deck.slice(0, 5), draw: [], discard: [], exhausted: [], grid: Array(4).fill(null), faces: {}, enemies: structuredClone(ENCOUNTERS[0].enemies), cardSeq: 10, draftChoices: [], last: null, outcome: null };
  s.draw = shuffle(s, deck.slice(5));
  return s;
}
export const start = s => s.screen === 'title' ? { ...structuredClone(s), screen: 'play' } : s;
export function attackTargets(s) { const alive = s.enemies.filter(e => e.hp > 0); const shields = alive.filter(e => e.id.startsWith('shield_')); return shields.length ? shields : alive; }
export function targetForAction(s, a = {}) { const pool = attackTargets(s); return pool.find(e => e.id === a.target)?.id ?? pool[0]?.id ?? null; }
export function getEnemyIntent(e, index, turn) {
  const defending = (turn + index) % 3 === 0;
  return { damage: e.hp <= 0 ? 0 : defending ? Math.max(0, e.attack - 1) : e.attack, shield: defending ? e.shield + 1 : e.shield, defending };
}
export function completedLines(grid, cell) { return LINES.filter(line => line.includes(cell) && line.every(i => grid[i])); }
export function placePreview(s, a) { return activate(s, a); }
export function setupEncounter(s, index) {
  s.encounter = index; s.phaseTurn = 1; s.momentum = 0; s.prime = 0; s.faces = {}; s.grid = Array(4).fill(null); s.exhausted = []; s.discard = []; s.hand = []; s.last = null;
  s.enemies = structuredClone(ENCOUNTERS[index - 1].enemies);
  s.draw = shuffle(s, s.deck); draw(s); s.screen = 'play'; s.draftChoices = [];
}
export function actions(s) {
  if (s.screen === 'reward') return [...s.draftChoices.map(choice => ({ kind: 'draft', choice })), { kind: 'continue' }];
  if (s.screen !== 'play') return [];
  const out = [];
  for (const card of s.hand) for (const cell of [0, 1, 2, 3]) if (!s.grid[cell]) for (const face of [0, 1]) for (const e of attackTargets(s)) out.push({ card, cell, face, target: e.id });
  return out;
}
export function activate(before, a) {
  const invalid = () => ({ valid: false, state: before, summary: null });
  if (!a || before.version !== VERSION) return invalid();
  if (before.screen === 'reward') {
    if (a.kind !== 'continue' && !(a.kind === 'draft' && before.draftChoices.includes(a.choice))) return invalid();
    const s = structuredClone(before);
    if (a.kind === 'draft') s.deck.push(`${a.choice}.${s.cardSeq++}`);
    s.hp = Math.min(s.maxHp, s.hp + 6);
    setupEncounter(s, s.encounter + 1);
    s.last = { kind: 'transition', action: structuredClone(a), choice: a.choice ?? null };
    assertState(s); return { valid: true, state: s, summary: s.last };
  }
  if (before.screen !== 'play' || !before.hand.includes(a.card) || !Number.isInteger(a.cell) || a.cell < 0 || a.cell > 3 || before.grid[a.cell] || ![0, 1].includes(a.face) || (a.target && !attackTargets(before).some(e => e.id === a.target))) return invalid();
  const s = structuredClone(before);
  const action = { card: a.card, cell: a.cell, face: a.face, target: targetForAction(s, a) };
  s.hand.splice(s.hand.indexOf(a.card), 1); s.grid[a.cell] = a.card; s.faces[a.card] = a.face; s.placements++;
  const lines = a.face === 0 ? completedLines(s.grid, a.cell) : [];
  const cells = [...new Set(lines.flat())].sort((x, y) => x - y);
  const summary = { kind: 'turn', action, lines: structuredClone(lines), cells, effects: [], cleared: [], exhausted: [], hits: 0, block: 0, enemyDamage: 0, momentum: { before: s.momentum, gained: 0, spent: 0, after: s.momentum }, log: [] };
  s.prime ??= 0;
  const hit = amount => {
    const pool = attackTargets(s);
    pool.sort((x, y) => Number(y.id === action.target) - Number(x.id === action.target));
    let left = amount;
    for (const e of pool) { const n = Math.min(e.hp, left); e.hp -= n; left -= n; if (!left) break; }
    const dealt = amount - left; summary.hits += dealt; return dealt;
  };
  const execute = (cell, phase) => {
    const uid = s.grid[cell];
    for (const fx of def(uid, s).effects) {
      const record = { cell, uid, phase, op: fx.op, amount: fx.n };
      if (fx.op === 'momentum') { s.momentum += fx.n; summary.momentum.gained += fx.n; }
      else if (fx.op === 'block') summary.block += fx.n;
      else if (fx.op === 'prime') s.prime += fx.n;
      else if (fx.op === 'bleed') { const e = s.enemies.find(e => e.id === targetForAction(s, action)); if (e) { e.bleed += fx.n; record.target = e.id; } }
      else {
        let extra = 0;
        if (fx.op === 'sniper') { extra = s.momentum; record.momentumSpent = extra; summary.momentum.spent += extra; s.momentum = 0; }
        if (fx.op === 'pounce' && s.enemies.find(e => e.id === targetForAction(s, action))?.bleed > 0) extra = 3;
        record.boost = extra + s.prime; record.damage = hit(fx.n + record.boost); s.prime = 0;
      }
      summary.effects.push(record);
    }
  };
  execute(a.cell, 'placement');
  if (a.face === 1) { s.grid[a.cell] = null; delete s.faces[a.card]; s.discard.push(a.card); summary.cleared.push(a.card); }
  for (const cell of cells) execute(cell, 'line');
  for (const cell of cells) {
    const uid = s.grid[cell]; summary.cleared.push(uid);
    s.discard.push(uid);
    delete s.faces[uid]; s.grid[cell] = null;
  }
  {
    for (const e of s.enemies) if (e.hp > 0 && e.bleed > 0) { const dealt = Math.min(e.hp, e.bleed); e.hp -= dealt; summary.hits += dealt; summary.effects.push({ op: 'bleed_tick', target: e.id, amount: dealt }); e.bleed--; }
    if (s.enemies.every(e => e.hp <= 0)) {
      if (s.encounter === 4) { s.screen = 'end'; s.outcome = 'victory'; }
      else { s.screen = 'reward'; s.draftChoices = s.encounter === 1 ? rewards.slice(0, 3) : shuffle(s, rewards).slice(0, 3); }
    } else {
      const threat = s.enemies.reduce((n, e, i) => n + getEnemyIntent(e, i, s.phaseTurn).damage, 0);
      summary.enemyDamage = Math.min(s.hp, Math.max(0, threat - summary.block)); s.hp -= summary.enemyDamage;
      if (!s.hp) { s.screen = 'end'; s.outcome = 'defeat'; }
    }
    s.turn++; s.phaseTurn++;
  }
  summary.momentum.after = s.momentum;
  draw(s);
  const usable = [...s.hand, ...s.draw, ...s.discard, ...s.grid.filter(Boolean)];
  const canAttack = usable.some(uid => [0, 1].some(face => def(uid, s, face).effects.some(f => ['hit', 'sniper', 'pounce', 'bleed'].includes(f.op))));
  if (s.screen === 'play' && (!s.hand.length || (!canAttack && !s.enemies.some(e => e.hp > 0 && e.bleed > 0)))) { s.screen = 'end'; s.outcome = 'exhausted'; }
  s.last = summary; assertState(s); return { valid: true, state: s, summary };
}
export function assertState(s) {
  const check = (ok, text) => { if (!ok) throw new Error(text); };
  check(s.version === VERSION, 'Invalid version'); check(s.grid.length === 4, 'Grid must have four slots');
  check(Number.isInteger(s.hp) && s.hp >= 0 && s.hp <= s.maxHp, 'Invalid health');
  check(Number.isInteger(s.momentum) && s.momentum >= 0, 'Invalid momentum');
  check(s.hand.length <= 5, 'Hand exceeds five'); check(s.encounter >= 1 && s.encounter <= 4, 'Invalid encounter');
  const zones = [...s.hand, ...s.draw, ...s.discard, ...s.exhausted, ...s.grid.filter(Boolean)];
  check(zones.length === s.deck.length && new Set(zones).size === zones.length && zones.every(uid => s.deck.includes(uid) && cards[cardType(uid)]), 'Card conservation violated');
  check(Object.keys(s.faces).every(uid => s.grid.includes(uid) && [0, 1].includes(s.faces[uid])), 'Invalid face commitments');
  check(s.grid.every(uid => !uid || [0, 1].includes(s.faces[uid])), 'Missing face commitment');
  check(s.enemies.every(e => e.hp >= 0 && e.hp <= e.maxHp && e.bleed >= 0), 'Invalid enemy');
  return true;
}
