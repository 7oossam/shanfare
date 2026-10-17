(function() {
  'use strict';
  // --- icons.mjs ---
const paths = {
  expand: 'M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5',
  contract: 'M3 8h5V3M16 3v5h5M8 21v-5H3M21 16h-5v5',
  exhaust: 'M6 2h10l4 4v16H4V2h2M14 2v6h6M2 2l20 20',
  sound: 'M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14',
  mute: 'M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6',
  swap: 'M3 7h17M16 3l4 4-4 4M21 17H4M8 13l-4 4 4 4',
  heart: 'M12 21S2 15 2 8c0-6 8-7 10-2 2-5 10-4 10 2 0 7-10 13-10 13z',
  bag: 'M8 3h8l-2 5 5 5c5 9-19 9-14 0l5-5zM9 8h6M9 15h6',
  cave: 'M2 21l3-12 7-6 7 6 3 12H2zM8 21v-8l4-3 4 3v8',
  moon: 'M20 15A9 9 0 0 1 9 4 9 9 0 1 0 20 15z',
  chain: 'M9 8l2-3c5-5 12 2 7 7l-3 2M15 16l-2 3C8 24 1 17 6 12l3-2M8 16l8-8',
  sneak: 'M3 16c4-9 6 6 10-3s5 0 8-7M5 21h4M14 21h4',
  bow: 'M4 3c21 2 21 16 0 18L15 12 4 3zM3 12h18M18 9l3 3-3 3',
  arrow: 'M4 20L20 4M12 4h8v8M4 14v6h6',
  knife: 'M5 19l5-5M8 16l-3-3M10 14l8-10 2 2-6 10z',
  cover: 'M12 3l8 3v6c0 5-8 9-8 9s-8-4-8-9V6zM8 11l3 3 5-6',
  feint: 'M3 8c8-12 8 18 18 6M3 14c8-12 8 10 18-6',
  friend: 'M9 6a3 3 0 1 0 6 0a3 3 0 1 0-6 0M6 21v-7c0-5 12-5 12 0v7M9 15v6M15 15v6',
  grid: 'M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18',
  // High polish thematic icons
  wolf: 'M4 7l4 4-2 6 6-2 4 4 4-4 6 2-2-6 4-4-5-3-5 5-5-5zM9 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm6 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  bleed: 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z',
  poison: 'M12 2v6m0 4v2m-6 2a6 6 0 1 0 12 0c0-3.3-2.7-6-6-6s-6 2.7-6 6zm3-1h.01m5.99 0h.01M9 18s1 1.5 3 1.5 3-1.5 3-1.5',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  fire: 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z',
  stone: 'M3 20h18L17 5l-5 6-3-4-6 13z',
  waterskin: 'M9 3h6v3H9zm-2 5h10c2 3 3 8 0 12-2 3-8 3-10 0-3-4-2-9 0-12z',
  bracer: 'M6 4h12l-2 16H8zm2 5h8m-7 5h6m-5 4h4',
  covenant: 'M12 4a8 8 0 1 0 8 8 8 8 0 0 0-8-8zm0 4a4 4 0 1 1-4 4 4 4 0 0 1 4-4z',
  swords: 'M14.5 17.5L3 6V3h3l11.5 11.5m-5 0l2 2m-4-4l2 2M6 21l3-3m-6 0l3 3M18 3h3v3l-7 7-2-2 6-6z',
  spark: 'M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z'
};

const icon = id => `<svg class="icon icon-${id}" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[id] || paths.grid}"/></svg>`;


// --- engine.mjs ---
const VERSION = 'shanfara-duel-v9';
const GRID_SIZE = 2;
const LINES = [[0, 1], [2, 3], [0, 2], [1, 3]];
const face = (name, icon, effects, text) => ({ name, icon, effects, text });
const cards = {
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
const alternates = {
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
const rewards = ['strong_arrow', 'strong_cover', 'strong_focus', 'knife', 'wolf', 'trick'];
const enemy = (id, name, hp, attack, shield = 0) => ({ id, name, hp, maxHp: hp, attack, shield, bleed: 0 });
const ENCOUNTERS = [
  { name: 'مضيق الصفا', enemies: [enemy('guard', 'حارس المضيق', 16, 2), enemy('scout', 'متربّص الصحراء', 12, 1)] },
  { name: 'كمين المورد', enemies: [enemy('captain', 'قائد الكمين', 20, 3), enemy('archer', 'رامي الكمين', 14, 1)] },
  { name: 'شعاب الغبش', enemies: [enemy('hunter', 'صائد الجوائز', 24, 3), enemy('raider', 'قاطع الطريق', 18, 2)] },
  { name: 'معسكر سلامان', enemies: [enemy('warlord', 'عوف بن صخر', 32, 3), enemy('shield_r', 'حامل الترس', 12, 1), enemy('shield_l', 'حامل الترس', 12, 1)] }
];
const cardType = uid => uid?.split('.')[0];
const def = (uid, s, f = s?.faces?.[uid] ?? 0) => (f === 1 ? alternates : cards)[cardType(uid)];
const snapshot = s => { const { last, ...rest } = s; return structuredClone(rest); };
function random(s) { s.rng = (Math.imul(s.rng, 1664525) + 1013904223) >>> 0; return s.rng / 4294967296; }
function shuffle(s, list) { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(random(s) * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function draw(s) {
  while (s.hand.length < 5) {
    if (!s.draw.length) { if (!s.discard.length) break; s.draw = shuffle(s, s.discard); s.discard = []; }
    s.hand.push(s.draw.shift());
  }
}
function fresh(seed = 20261017) {
  const deck = ['focus.0', 'arrow.0', 'cover.0', 'focus.1', 'arrow.1', 'focus.2', 'arrow.2', 'cover.1', 'arrow.3', 'cover.2'];
  const s = { version: VERSION, seed: seed >>> 0, rng: seed >>> 0, screen: 'title', encounter: 1, turn: 1, placements: 0, phaseTurn: 1, hp: 24, maxHp: 24, momentum: 0, prime: 0, deck, hand: deck.slice(0, 5), draw: [], discard: [], exhausted: [], grid: Array(4).fill(null), faces: {}, enemies: structuredClone(ENCOUNTERS[0].enemies), cardSeq: 10, draftChoices: [], last: null, outcome: null };
  s.draw = shuffle(s, deck.slice(5));
  return s;
}
const start = s => s.screen === 'title' ? { ...structuredClone(s), screen: 'play' } : s;
function attackTargets(s) { const alive = s.enemies.filter(e => e.hp > 0); const shields = alive.filter(e => e.id.startsWith('shield_')); return shields.length ? shields : alive; }
function targetForAction(s, a = {}) { const pool = attackTargets(s); return pool.find(e => e.id === a.target)?.id ?? pool[0]?.id ?? null; }
function getEnemyIntent(e, index, turn) {
  const defending = (turn + index) % 3 === 0;
  return { damage: e.hp <= 0 ? 0 : defending ? Math.max(0, e.attack - 1) : e.attack, shield: defending ? e.shield + 1 : e.shield, defending };
}
function completedLines(grid, cell) { return LINES.filter(line => line.includes(cell) && line.every(i => grid[i])); }
function placePreview(s, a) { return activate(s, a); }
function setupEncounter(s, index) {
  s.encounter = index; s.phaseTurn = 1; s.momentum = 0; s.prime = 0; s.faces = {}; s.grid = Array(4).fill(null); s.exhausted = []; s.discard = []; s.hand = []; s.last = null;
  s.enemies = structuredClone(ENCOUNTERS[index - 1].enemies);
  s.draw = shuffle(s, s.deck); draw(s); s.screen = 'play'; s.draftChoices = [];
}
function actions(s) {
  if (s.screen === 'reward') return [...s.draftChoices.map(choice => ({ kind: 'draft', choice })), { kind: 'continue' }];
  if (s.screen !== 'play') return [];
  const out = [];
  for (const card of s.hand) for (const cell of [0, 1, 2, 3]) if (!s.grid[cell]) for (const face of [0, 1]) for (const e of attackTargets(s)) out.push({ card, cell, face, target: e.id });
  return out;
}
function activate(before, a) {
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
function assertState(s) {
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


// --- report.mjs ---

const begin = s => ({ version: VERSION, initial: snapshot(s), events: [], final: snapshot(s), coverage: 'complete' });
function record(r, before, action, result) { return { ...r, events: [...r.events, { action: structuredClone(action), after: snapshot(result.state), summary: result.summary }], final: snapshot(result.state) }; }
function restore(raw, s) {
  try {
    if (raw?.version === VERSION) {
      let state = raw.initial;
      for (const e of raw.events) { const r = activate(state, e.action); if (!r.valid || JSON.stringify(snapshot(r.state)) !== JSON.stringify(e.after)) throw Error(); state = r.state; }
      if (JSON.stringify(snapshot(state)) === JSON.stringify(snapshot(s))) return raw;
    }
  } catch {}
  return { ...begin(s), coverage: 'partial' };
}
const textReport = r => JSON.stringify(r, null, 2);


// --- audio.mjs ---
// Procedural Web Audio Engine for Al-Shanfara: Nexus Matrix
// 100% offline, zero external sound assets, procedural synthesis.

let ctx = null;
let muted = false;

try {
  muted = localStorage.getItem('shanfara-audio-muted') === 'true';
} catch {}

function getContext() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) ctx = new AudioCtx();
  }
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

function isMuted() {
  return muted;
}

function toggleMute() {
  muted = !muted;
  try {
    localStorage.setItem('shanfara-audio-muted', muted ? 'true' : 'false');
  } catch {}
  return muted;
}

// Generate brief white noise buffer for tactile sand/grit/rumble synthesis
function createNoiseBuffer(c, duration = 0.5) {
  const bufferSize = Math.floor(c.sampleRate * duration);
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function playSfx(type) {
  if (muted) return;
  const c = getContext();
  if (!c) return;

  const now = c.currentTime;

  try {
    switch (type) {
      case 'select': {
        // Crisp stone bead click (card/cell selection)
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.035);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(now);
        osc.stop(now + 0.035);
        break;
      }

      case 'bow':
      case 'hit': {
        // Arrow string release twang + impact thrum
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(620, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.18);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(now);
        osc.stop(now + 0.18);
        break;
      }

      case 'knife':
      case 'blade': {
        // Steel edge glint (high resonant metallic ping)
        const osc1 = c.createOscillator();
        const osc2 = c.createOscillator();
        const gain = c.createGain();
        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(1180, now);
        osc2.frequency.setValueAtTime(2360, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(c.destination);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.22);
        osc2.stop(now + 0.22);
        break;
      }

      case 'guard':
      case 'block': {
        // Deep shield block / rock deflect thud
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.16);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(now);
        osc.stop(now + 0.16);
        break;
      }

      case 'friend':
      case 'chain': {
        // Iron chain link breaking: high ringing chime with harmonic spread
        const freqs = [880, 1320, 1760];
        freqs.forEach((f, idx) => {
          const osc = c.createOscillator();
          const gain = c.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + idx * 0.02);
          gain.gain.setValueAtTime(0.12, now + idx * 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.02 + 0.35);
          osc.connect(gain);
          gain.connect(c.destination);
          osc.start(now + idx * 0.02);
          osc.stop(now + idx * 0.02 + 0.35);
        });
        break;
      }

      case 'collapse': {
        // Canyon cliff rockfall: low brown rumble with filter sweep
        const noise = c.createBufferSource();
        noise.buffer = createNoiseBuffer(c, 0.6);
        const filter = c.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(180, now);
        filter.frequency.linearRampToValueAtTime(50, now + 0.5);
        const gain = c.createGain();
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(c.destination);
        noise.start(now);
        noise.stop(now + 0.55);
        break;
      }

      case 'victory': {
        // Arabian desert modal arpeggio (Bayati / Rast cadence: D - F - G - A - D')
        const notes = [293.66, 349.23, 392.00, 440.00, 587.33];
        notes.forEach((freq, idx) => {
          const osc = c.createOscillator();
          const gain = c.createGain();
          osc.type = 'triangle';
          const t = now + idx * 0.12;
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.18, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
          osc.connect(gain);
          gain.connect(c.destination);
          osc.start(t);
          osc.stop(t + 0.45);
        });
        break;
      }

      case 'defeat': {
        // Mournful low descending interval
        const notes = [220.00, 196.00, 164.81, 146.83];
        notes.forEach((freq, idx) => {
          const osc = c.createOscillator();
          const gain = c.createGain();
          osc.type = 'sine';
          const t = now + idx * 0.18;
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.2, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
          osc.connect(gain);
          gain.connect(c.destination);
          osc.start(t);
          osc.stop(t + 0.5);
        });
        break;
      }
    }
  } catch {}
}


// --- fullscreen.mjs ---
// Fullscreen must be requested synchronously from a user gesture.
let landscapeLocked = false;
const fullscreenActive = () => typeof document !== 'undefined' && !!(document.fullscreenElement || document.webkitFullscreenElement);
const fullscreenSupported = () => typeof document !== 'undefined' && !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen);
const enterGameFullscreen = async () => {
  if (fullscreenActive()) return { ok: true };
  if (!fullscreenSupported()) return { ok: false, reason: 'unsupported' };
  try {
    const element = document.documentElement;
    if (element.requestFullscreen) await element.requestFullscreen({ navigationUI: 'hide' });
    else await element.webkitRequestFullscreen();
    if (typeof screen !== 'undefined' && screen.orientation?.lock) {
      try { await screen.orientation.lock('landscape'); landscapeLocked = true; } catch {}
    }
    return { ok: fullscreenActive() };
  } catch { return { ok: false, reason: 'denied' }; }
};
const releaseLandscapeLock = () => {
  if (!fullscreenActive() && landscapeLocked) {
    try { screen.orientation?.unlock?.(); } catch {}
    landscapeLocked = false;
  }
};
const exitGameFullscreen = async () => {
  try {
    if (document.exitFullscreen) await document.exitFullscreen();
    else await document.webkitExitFullscreen?.();
    releaseLandscapeLock(); return { ok: true };
  } catch { return { ok: false, reason: 'denied' }; }
};


// --- view.mjs ---



const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = n => new Intl.NumberFormat('ar-SA', { useGrouping: false }).format(n);
const ratio = (a, b) => `<bdi dir="ltr">${num(a)} / ${num(b)}</bdi>`;
const button = (label, action, cls = '', disabled = false, aria = '') => `<button class="${cls}" data-action="${action}" ${disabled ? 'disabled' : ''} ${aria ? `aria-label="${esc(aria)}"` : ''}>${label}</button>`;
const ASSET_ROOT = typeof document === 'undefined' ? 'assets/landscape/' : new URL('assets/landscape/', document.currentScript?.src || location.href).href;
const style = (x, y, w, h, W = 1672, H = 941) => `background-size:${W / w * 100}% ${H / h * 100}%;background-position:${x / (W - w) * 100}% ${y / (H - h) * 100}%`;
const slice = (x, y, w, h, cls = '', source = 'layout-reference.png', W = 1672, H = 941) => `<span class="art-slice ${cls}" aria-hidden="true" style="background-image:url('${ASSET_ROOT}${source}');${style(x, y, w, h, W, H)}"></span>`;
const stat = (value, ico, cls = '') => `<span class="icon-stat ${cls}" dir="ltr"><b>${num(value)}</b>${icon(ico)}</span>`;
function preview(s, p) { if (!p.card || p.cell === null || p.cell === undefined) return null; const r = activate(s, { card: p.card, cell: p.cell, face: p.face ?? 0, target: targetForAction(s, p) }); return r.valid ? r : null; }
function effectFormula(uid, s, face = 0, projected = null) {
  const c = def(uid, s, face);
  return c.effects.map(f => {
    if (f.op === 'sniper') {
      const actual = projected?.summary.effects.find(e => e.uid === uid && e.op === 'sniper');
      const credit = actual?.momentumSpent ?? s.momentum;
      return `<span class="effect-stack"><span class="formula" dir="ltr">${stat(f.n, 'swords')}<b class="plus">+</b>${stat(credit, 'fire', 'momentum-stat')}</span><small>يصرف كل ${icon('fire')}</small></span>`;
    }
    if (f.op === 'pounce') return `<span class="effect-stack">${stat(f.n, 'swords')}<small>${stat(f.n + 3, 'swords')} مع ${icon('bleed')}</small></span>`;
    const ico = { momentum: 'fire', hit: 'swords', block: 'shield', bleed: 'bleed', prime: 'spark' }[f.op];
    return stat(f.n, ico, f.op === 'momentum' ? 'momentum-stat' : '');
  }).join('<span class="effect-divider">·</span>') + (face === 1 && c.effects.some(f => f.op === 'hit') && c.icon === 'bow' ? `<small class="preserve-credit">يحفظ ${icon('fire')}</small>` : '');
}
function cardArt(uid, s, cls = '') {
  const type = cardType(uid);
  if (type.includes('arrow')) return slice(603, 163, 480, 223, cls, 'cards-reference.png', 1685, 933);
  if (type.includes('cover')) return slice(1127, 163, 491, 223, cls, 'cards-reference.png', 1685, 933);
  if (type.includes('focus')) return `<span class="focus-art ${cls}" aria-hidden="true">${icon('fire')}</span>`;
  return `<span class="focus-art ${cls}" aria-hidden="true">${icon(def(uid, s).icon)}</span>`;
}
function fullscreenButton() {
  const active = fullscreenActive();
  return `<button class="fullscreen-button ${active ? 'is-fullscreen' : ''}" data-action="fullscreen" aria-pressed="${active}" aria-label="${active ? 'الخروج من ملء الشاشة' : 'إخفاء شريط المتصفح وملء الشاشة'}">${icon(active ? 'contract' : 'expand')}<span>${active ? 'تصغير' : 'ملء الشاشة'}</span></button>`;
}
function header(s) {
  return `<header class="game-header">${slice(0, 0, 1672, 75, 'template-art', 'blank-template.png')}
    <div class="player-resources"><span class="health-count" aria-label="الصحة">${icon('heart')}${ratio(s.hp, s.maxHp)}</span><button class="momentum-count" data-action="momentum-info" aria-label="رصيد الزخم ${num(s.momentum)}">${icon('fire')}<span>الزخم <b data-momentum>${num(s.momentum)}</b></span></button></div>
    <h1>${esc(ENCOUNTERS[s.encounter - 1].name)}<small>المواجهة ${num(s.encounter)} / ٤</small></h1>
    ${fullscreenButton()}
    ${button(slice(1585, 19, 45, 45), 'menu', 'settings-button', false, 'قائمة اللعبة')}
  </header>`;
}
function arena(s, p, projected) {
  const pool = attackTargets(s);
  const target = targetForAction(s, p);
  return `<section class="battle-arena ${s.enemies.length === 3 ? 'has-boss' : ''}" aria-label="ساحة المواجهة، اختر عدوًا">${slice(4, 76, 1136, 552, 'arena-backdrop')}
    <div class="combatant hero-combatant"><div class="unit-hud">${slice(193, 105, 164, 82, 'hud-paper', 'blank-template.png')}<strong>الشنفرى</strong><span class="hp-track"><i style="width:${(projected?.state.hp ?? s.hp) / s.maxHp * 100}%"></i></span><b>${ratio(projected?.state.hp ?? s.hp, s.maxHp)}</b></div></div>
    ${s.enemies.map((e, i) => {
      const after = projected?.state.enemies[i]?.hp ?? e.hp;
      const locked = e.hp <= 0 || !pool.some(x => x.id === e.id);
      const intent = getEnemyIntent(e, i, s.phaseTurn);
      const rect = i % 2 === 0 ? [612, 280, 266, 344] : [881, 278, 257, 347];
      return `<button class="combatant enemy enemy-${i} ${target === e.id ? 'is-target' : ''} ${e.hp <= 0 ? 'is-fallen' : ''}" data-target="${e.id}" aria-pressed="${target === e.id}" ${locked ? 'disabled' : ''} aria-label="${esc(e.name)}، صحة ${num(e.hp)}، ${locked ? 'محمي' : 'هجوم ' + num(intent.damage)}">
        ${slice(...rect, 'fallen-cover', 'blank-template.png')}${i === 2 ? slice(446, 257, 316, 290, 'extra-enemy', 'extra-characters.png', 1374, 1145) : ''}
        <span class="unit-hud">${slice(...(i % 2 === 0 ? [656, 149, 160, 136] : [936, 150, 162, 138]), 'hud-paper', 'blank-template.png')}<strong>${esc(e.name)}</strong><span class="hp-track"><i style="width:${after / e.maxHp * 100}%"></i></span><b data-enemy-hp="${e.id}">${ratio(after, e.maxHp)}</b><small class="enemy-intent">${e.hp <= 0 ? 'صريع' : locked ? icon('shield') : stat(intent.damage, 'swords')}${e.bleed ? stat(e.bleed, 'bleed') : ''}</small></span>
        ${e.hp > after ? `<span class="floating-damage">−${num(e.hp - after)}</span>` : ''}
      </button>`;
    }).join('')}
    ${s.last?.kind === 'turn' ? `<div class="battle-result" role="status">${stat(s.last.hits, 'swords')}${stat(s.last.block, 'shield')}${s.last.enemyDamage ? stat(s.last.enemyDamage, 'heart') : ''}</div>` : ''}
  </section>`;
}
function board(s, p, projected, animation) {
  const grid = animation?.grid ?? (projected ? (() => { const a = [...s.grid]; a[p.cell] = p.card; return a; })() : s.grid);
  const faces = { ...s.faces, ...(p.card ? { [p.card]: p.face ?? 0 } : {}), ...animation?.faces };
  const chosen = projected?.summary.cells ?? [];
  return `<aside class="command-panel">${slice(1142, 76, 526, 554, 'template-art', 'blank-template.png')}
    <div class="panel-heading"><span></span><h2>شبكة الأوامر</h2><span></span>${button('؟', 'help', 'help-button', false, 'شرح اللعب')}</div>
    <div class="duel-grid ${animation ? 'is-resolving' : ''}" role="group" aria-label="شبكة صفين وعمودين">${grid.map((uid, cell) => {
      const c = uid ? def(uid, { ...s, faces }, faces[uid] ?? 0) : null;
      const isPreview = p.card && p.cell === cell;
      return `<button class="grid-cell ${uid ? 'has-card' : ''} ${chosen.includes(cell) ? 'in-line' : ''} ${animation?.cells?.includes(cell) ? 'is-clearing' : ''} ${isPreview ? 'is-preview' : ''}" data-cell="${cell}" aria-label="الخانة ${num(cell + 1)}${c ? '، ' + esc(c.name) : ' فارغة'}" ${animation ? 'disabled' : ''}>
        ${c ? `<span class="slot-symbol">${icon(c.icon)}</span><strong>${esc(c.name)}</strong>${(faces[uid] ?? 0) === 1 ? '<small class="instant-mark">طارئ</small>' : ''}` : '<span class="empty-plus">+</span>'}
        ${chosen.includes(cell) ? `<b class="line-order">${num(chosen.indexOf(cell) + 1)}</b>` : ''}
      </button>`;
    }).join('')}</div>
    <div class="board-feedback" aria-live="polite">${projected ? projected.summary.lines.length ? `<strong>${projected.summary.lines.length > 1 ? 'يكتمل الصف والعمود' : projected.summary.lines[0][1] - projected.summary.lines[0][0] === 1 ? 'يكتمل الصف' : 'يكتمل العمود'}</strong><div class="preview-totals">${stat(projected.summary.hits, 'swords')}${stat(projected.summary.block, 'shield')}${stat(projected.summary.enemyDamage, 'heart')}</div><small>تفعيل فوري + إعادة تفعيل الخط</small>` : `<strong>تتفعّل فورًا ${p.face ? 'وتختفي' : 'وتبقى'}</strong><div class="preview-totals">${stat(projected.summary.hits, 'swords')}${stat(projected.summary.block, 'shield')}${stat(projected.summary.enemyDamage, 'heart')}</div><small>بطاقة واحدة في الدور</small>` : animation ? '<strong>تُفعّل البطاقات ثم تُزال</strong>' : `<strong>${p.card ? 'اختر خانة فارغة' : 'اختر بطاقة ووجهًا'}</strong><small>تفعيل فوري · الدائم يبقى · الطارئ يختفي</small>`}</div>
  </aside>`;
}
function hand(s, p, projected, busy) {
  return `<section class="hand-panel" aria-label="بطاقات اليد بوجهيها">${slice(0, 635, 1672, 306, 'template-art', 'blank-template.png')}<div class="hand-cards">${s.hand.map(uid => {
    const selected = p.card === uid;
    return `<article class="duel-card ${selected ? 'is-selected' : ''}" data-hand-card="${uid}"><button class="card-art-button" data-card="${uid}" data-face="${selected ? p.face ?? 0 : 0}" ${busy ? 'disabled' : ''} aria-label="اختر ${esc(def(uid, s).name)}">${cardArt(uid, s, 'hand-art')}</button><div class="card-name"><strong>${esc(def(uid, s).name)}</strong><button class="card-details" data-info="${uid}" aria-label="شرح ${esc(def(uid, s).name)}">ⓘ</button></div>
      ${[0, 1].map(face => `<button class="card-face ${selected && p.face === face ? 'is-active' : ''}" data-card="${uid}" data-face="${face}" aria-pressed="${selected && p.face === face}" ${busy ? 'disabled' : ''} aria-label="${face ? 'طارئ' : 'دائم'}: ${esc(def(uid, s, face).text)}"><span class="face-label">${face ? 'طارئ' : 'دائم'}</span><span class="face-effect">${effectFormula(uid, s, face, selected && p.face === face ? projected : null)}</span>${face ? icon('exhaust') : ''}</button>`).join('')}
    </article>`;
  }).join('')}</div></section>`;
}
function rotationHint() { return `<div class="rotate-hint"><span>⤾</span><strong>أدر الجهاز أفقيًا</strong><p>لتظهر المواجهة والشبكة والبطاقات كاملة</p></div>`; }
function gameView(s, p, animation = null) {
  const projected = animation ? null : preview(s, p);
  return `<main class="duel-app" data-version="9">${header(s)}<div class="main-stage">${arena(s, p, projected)}${board(s, p, projected, animation)}</div>${hand(s, p, projected, !!animation)}${rotationHint()}</main>`;
}
function titleView(s) { return `<main class="landing">${slice(4, 76, 1136, 552, 'landing-scene')}<div class="landing-paper"><span class="eyebrow">ملحمة الصعاليك</span><h1>الشنفرى</h1><p>بطاقة واحدة في الدور، تتفعّل فورًا. أكمل خطًا لتفعيل الدائم مجددًا.</p>${button(fullscreenSupported() ? 'العب بملء الشاشة' : 'ابدأ المواجهة', 'start', 'gold-button')}<small>شبكة ٢ × ٢ · أربعة لقاءات</small></div>${rotationHint()}</main>`; }
function rewardView(s) { return `<main class="screen-panel"><h1>حُسمت المواجهة</h1><p>اختر بطاقة جديدة · تستعيد ${stat(Math.min(6, s.maxHp - s.hp), 'heart')}</p><div class="reward-cards">${s.draftChoices.map(key => `<article class="reward-card"><h2>${esc(cards[key].name)}</h2>${cardArt(key + '.reward', s, 'reward-art')}<div><b>دائم</b>${effectFormula(key + '.reward', s, 0)}</div><div><b>طارئ</b>${effectFormula(key + '.reward', s, 1)}</div>${button('اختر البطاقة', 'draft-' + key, 'gold-button')}</article>`).join('')}</div>${button('أكمل بدون بطاقة', 'continue', 'text-button')}${rotationHint()}</main>`; }
function endView(s) { return `<main class="screen-panel end-screen"><h1>${s.outcome === 'victory' ? 'انتصار الشنفرى' : s.outcome === 'exhausted' ? 'استُنفدت الأوراق' : 'انتهت المواجهة'}</h1><p>${s.outcome === 'victory' ? 'هزمت خصومك في اللقاءات الأربعة.' : s.outcome === 'exhausted' ? 'لم تبق بطاقات هجومية متاحة.' : 'جرّب مزج الصدّ والهجوم في الخط نفسه.'}</p>${button('العب من جديد', 'restart', 'gold-button')}${rotationHint()}</main>`; }

const btn = button;


// --- app.mjs ---





const SAVE_KEY = 'shanfara-duel-v9';
const root = document.querySelector('#app');
const menu = document.querySelector('#menu');
let s = fresh(); let report = null;
let selection = { card: null, face: 0, cell: null, target: null };
let inputModality = 'pointer';
let resolving = null; let resolveTimer = null; let longPressTimer = null; let longPressConsumed = false;
try { const save = JSON.parse(localStorage.getItem(SAVE_KEY)); if (save?.state?.version === VERSION) { assertState(save.state); s = save.state; s.discard.push(...s.exhausted); s.exhausted = []; for (let i = 0; i < 4; i++) { const uid = s.grid[i]; if (uid && s.faces[uid] === 1) { s.discard.push(uid); delete s.faces[uid]; s.grid[i] = null; } } report = restore(save.report, s); } } catch {}
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify({ state: s, report })); } catch { document.querySelector('#live').textContent = 'تعذّر الحفظ على الجهاز.'; } }
function render() { root.innerHTML = s.screen === 'title' ? titleView(s) : s.screen === 'reward' ? rewardView(s) : s.screen === 'end' ? endView(s) : gameView(s, selection, resolving); }
function syncFullscreenControls() {
  const template = document.createElement('template');
  template.innerHTML = fullscreenButton();
  const next = template.content.firstElementChild;
  for (const element of document.querySelectorAll('.fullscreen-button')) {
    element.innerHTML = next.innerHTML;
    for (const attribute of ['class', 'aria-pressed', 'aria-label']) element.setAttribute(attribute, next.getAttribute(attribute));
  }
}
function requestFullscreenFromGesture(explicit = false) {
  // Call before rendering, audio, or any await can consume the tap's activation.
  const pending = explicit && fullscreenActive() ? exitGameFullscreen() : enterGameFullscreen();
  if (menu.open) menu.close();
  pending.then(result => {
    syncFullscreenControls();
    if (!result.ok && explicit) show('ملء الشاشة', `<p>${result.reason === 'unsupported' ? 'هذا المتصفح لا يدعم ملء الشاشة لهذه الصفحة. افتح الرابط في Chrome على أندرويد لتفعيلها.' : 'لم يسمح المتصفح بملء الشاشة. اضغط زر «ملء الشاشة» مرة أخرى، أو افتح الرابط مباشرة في المتصفح.'}</p>`);
  });
}
for (const event of ['fullscreenchange', 'webkitfullscreenchange']) document.addEventListener(event, () => { releaseLandscapeLock(); syncFullscreenControls(); });
function show(title, body) { menu.innerHTML = `<header class="dialog-header"><h2>${title}</h2>${button('×', 'close', '', false, 'إغلاق')}</header>${body}`; if (!menu.open) menu.showModal(); }
function details(uid) { show(esc(def(uid, s, 0).name), `<div class="card-explanation">${[0, 1].map(f => `<section><h3>${f ? 'طارئ' : 'دائم'}</h3><div>${effectFormula(uid, s, f)}</div><p>${esc(def(uid, s, f).text)}</p><small>${f ? 'يتفعّل فورًا ويختفي من الشبكة إلى الرزمة.' : 'يتفعّل فور وضعه ويبقى، ثم يتفعّل مجددًا عند اكتمال خطه ويُزال.'}</small></section>`).join('')}</div>`); }
function help() { show('شبكة الأوامر ٢ × ٢', '<ol><li>بطاقة واحدة في كل دور: اختر عدوًا ووجه بطاقة ثم خانة فارغة.</li><li>كل بطاقة تتفعّل فور وضعها. الدائمة تبقى في الشبكة، والطارئة تختفي بعد التفعيل وتعود للرزمة.</li><li>امتلاء صف أو عمود يُفعّل بطاقاته الدائمة مرة ثانية ثم يزيل الخط كاملًا. البطاقة التي أكملت الخط تعمل فورًا ثم مجددًا مع الخط.</li><li>عند اكتمال خطين، تتفعّل كل بطاقة مشتركة مرة واحدة ضمن الخطوط.</li><li>يرد الأعداء بعد كل بطاقة تلعبها. معاينة الخانة تعرض مجموع تأثير البطاقة والخط وردّ الأعداء.</li></ol><p>العزم يجمع الزخم فورًا، والسهم الدائم يصرفه كضرر إضافي. اضغط ⓘ للتفاصيل.</p>'); }
function newGame() { clearTimeout(resolveTimer); resolving = null; s = start(fresh()); report = begin(s); selection = { card: null, face: 0, cell: null, target: null }; if (menu.open) menu.close(); save(); render(); }
function commit(action) {
  if (resolving) return;
  const a = s.screen === 'play' ? { ...action, target: targetForAction(s, action) } : action;
  const before = s; const result = activate(before, a); if (!result.valid) return;
  report = record(report || begin(before), before, a, result); s = result.state;
  selection = { card: null, face: 0, cell: null, target: a.target ?? null };
  save();
  if ((result.summary.lines?.length || a.face === 1) && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const grid = [...before.grid]; grid[a.cell] = a.card;
    resolving = { grid, cells: a.face === 1 ? [a.cell] : result.summary.cells, faces: { ...before.faces, [a.card]: a.face } };
    // Show activation before the committed removal, including a lethal final line.
    root.innerHTML = gameView({ ...s, screen: 'play' }, selection, resolving);
    resolveTimer = setTimeout(() => { resolving = null; render(); }, 420);
  } else render();
  playSfx(result.summary.hits ? 'hit' : result.summary.block ? 'block' : 'select');
  document.querySelector('#live').textContent = result.summary.kind === 'turn' ? `تفعّلت البطاقة${result.summary.lines.length ? ' ثم الخط' : ''}: ${num(result.summary.hits)} ضرر، ${num(result.summary.block)} صدّ.` : 'وُضعت البطاقة. أكمل الخط لتفعيله.';
}
function action(name) {
  if (name === 'close') menu.close();
  else if (name === 'start') { requestFullscreenFromGesture(); s = start(s); report = begin(s); save(); render(); playSfx('select'); }
  else if (name === 'restart') { requestFullscreenFromGesture(); newGame(); }
  else if (name === 'help') help();
  else if (name === 'menu') show('الشنفرى', `<nav class="menu-options">${button('أكمل اللعب', 'close', 'gold-button')}${button('شرح اللعب والأيقونات', 'help')}${button(isMuted() ? 'تشغيل الصوت' : 'كتم الصوت', 'audio')}${button(fullscreenActive() ? 'الخروج من ملء الشاشة' : 'ملء الشاشة', 'fullscreen')}${button('تحميل تقرير اللعب', 'export')}${button('ابدأ من جديد', 'restart')}</nav><p>الرزمة ${num(s.draw.length)}</p>`);
  else if (name === 'audio') { toggleMute(); menu.close(); render(); }
  else if (name === 'fullscreen') requestFullscreenFromGesture(true);
  else if (name === 'momentum-info') show('رصيد الزخم', `<p>رصيدك الآن: ${num(s.momentum)} 🔥</p><p>بطاقة العزم تجمع الزخم. كل ١ 🔥 = +١ ⚔ للسهم الدائم، ثم يصرف السهم الرصيد كاملًا. السهم الطارئ يحافظ عليه.</p><p>مثال: عزم ٢ 🔥 ثم سهم ٢ ⚔ يساوي ٤ ⚔. العزم يتفعّل فورًا، والسهم فور وضعه، ثم يتفعّلان مجددًا عند اكتمال خطهما.</p>`);
  else if (name === 'continue') commit({ kind: 'continue' });
  else if (name.startsWith('draft-')) commit({ kind: 'draft', choice: name.slice(6) });
  else if (name === 'export') { const url = URL.createObjectURL(new Blob([textReport(report)], { type: 'application/json' })); const a = document.createElement('a'); a.href = url; a.download = 'shanfara-report.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
}
document.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b || b.disabled) return;
  if (longPressConsumed && b.dataset.card) { longPressConsumed = false; return; }
  longPressConsumed = false;
  if (b.dataset.action) { action(b.dataset.action); return; }
  if (resolving || s.screen !== 'play') return;
  if (b.dataset.info) { details(b.dataset.info); return; }
  if (b.dataset.target) { selection.target = b.dataset.target; selection.cell = null; render(); return; }
  if (b.dataset.card) { selection = { ...selection, card: b.dataset.card, face: Number(b.dataset.face), cell: null }; render(); playSfx('select'); return; }
  if (b.dataset.cell !== undefined) {
    const cell = Number(b.dataset.cell);
    if (s.grid[cell]) { details(s.grid[cell]); return; }
    if (!selection.card) { document.querySelector('#live').textContent = 'اختر وجه بطاقة من اليد أولًا.'; return; }
    commit({ card: selection.card, face: selection.face, cell, target: selection.target });
  }
});
function hover(cell) {
  if (resolving || s.screen !== 'play' || !selection.card || s.grid[cell] || selection.cell === cell) return;
  selection.cell = cell; render();
}
document.addEventListener('pointerover', e => { const cell = e.target.closest('[data-cell]'); if (cell && e.pointerType === 'mouse') hover(Number(cell.dataset.cell)); });
document.addEventListener('pointerdown', () => { inputModality = 'pointer'; }, true);
document.addEventListener('keydown', () => { inputModality = 'keyboard'; }, true);
document.addEventListener('focusin', e => { if (inputModality !== 'keyboard') return; const cell = e.target.closest('[data-cell]'); if (cell) { const index = Number(cell.dataset.cell); if (selection.card && !s.grid[index] && selection.cell !== index) { hover(index); root.querySelector(`[data-cell="${index}"]`)?.focus({preventScroll:true}); } } });
document.addEventListener('pointerdown', e => { const b = e.target.closest('.card-face'); if (!b) return; longPressConsumed = false; longPressTimer = setTimeout(() => { longPressConsumed = true; details(b.dataset.card); }, 550); });
for (const event of ['pointerup', 'pointercancel', 'pointermove']) document.addEventListener(event, () => clearTimeout(longPressTimer));
document.addEventListener('keydown', e => {
  if (menu.open || resolving || s.screen !== 'play') return;
  if (e.key === 'Escape') { selection = { card: null, face: 0, cell: null, target: selection.target }; render(); }
  if (/^[1-5]$/.test(e.key) && !e.ctrlKey && !e.metaKey && s.hand[Number(e.key) - 1]) { selection = { ...selection, card: s.hand[Number(e.key) - 1], face: e.shiftKey ? 1 : 0, cell: null }; render(); }
});
render();

})();