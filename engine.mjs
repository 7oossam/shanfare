export const VERSION = 'shanfara-duel-v9';
export const DIRECT_ATTACK_OPS = ['hit','sniper','pounce','area','lifekill','half'];
export const HAND_SIZE = 3;
export const GRID_ROWS = 3;
export const GRID_COLUMNS = 3;
export const GRID_SIZE = GRID_ROWS * GRID_COLUMNS;
export const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8]];
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
  knife: face('جرح', 'knife', [{ op: 'bleed', n: 3 }], 'ثلاث نقاط نزيف على العدو المستهدف وتختفي من الشبكة.'),
  wolf: face('نهش', 'wolf', [{ op: 'pounce', n: 4 }], 'أربعة أضرار، أو سبعة إذا كان الهدف ينزف وتختفي من الشبكة.'),
  trick: face('خدعة', 'spark', [{ op: 'prime', n: 4 }], 'يزيد الهجوم التالي بأربعة أضرار وتختفي من الشبكة.'),
  strong_arrow: face('سهم صقيل', 'bow', [{ op: 'hit', n: 6 }], 'ستة أضرار دون استهلاك الزخم وتختفي من الشبكة.'),
  strong_cover: face('حصن', 'shield', [{ op: 'block', n: 8 }], 'تصد ثمانية أضرار وتختفي من الشبكة.'),
  strong_focus: face('ثبات', 'fire', [{ op: 'momentum', n: 5 }], 'تجمع خمس نقاط زخم وتختفي من الشبكة.')
};
cards.maneuver = face('مناورة', 'swap', [{op:'recall_grid',n:1}], 'بعد التفعيل، أعد دائمة أخرى تختارها إلى يدك.');
alternates.maneuver = face('مناورة', 'swap', [{op:'shift_grid',n:1}], 'بعد التفعيل، انقل دائمة لخانة فارغة لا تكمل خطًا، بلا تفعيل إضافي.');
cards.volley = face('وابل', 'bow', [{op:'area',n:2}], 'ضرران زائد كل الزخم لكل عدو متاح، ثم يصرف الزخم كاملًا.');
alternates.volley = face('وابل', 'bow', [{op:'area',n:3,consume:false}], 'ثلاثة أضرار ثابتة لكل عدو متاح، ويحفظ رصيد الزخم.');
cards.leech = face('اغتنام', 'knife', [{op:'lifekill',n:2}], 'ضرران؛ تستعيد صحتين إذا قتلت الهدف.');
alternates.leech = face('اغتنام', 'knife', [{op:'lifekill',n:4}], 'أربعة أضرار؛ تستعيد صحتين إذا قتلت الهدف.');
cards.reserve = face('سهم الصقر', 'bow', [{op:'half',n:2}], 'ضرران زائد نصف الزخم، ويصرف النصف مقربًا للأعلى.');
alternates.reserve = face('سهم الصقر', 'bow', [{op:'hit',n:4}], 'أربعة أضرار مع الاحتفاظ بالزخم.');
alternates.focus = face('عزم', 'fire', [{op:'convert',n:1}], 'يحوّل رصيد الزخم كله إلى درع ويصرفه.');
export const STARTER_TYPES = ['arrow', 'cover', 'focus', 'maneuver'];
export const rewards = ['volley', 'knife', 'leech', 'reserve', 'wolf', 'strong_cover'];
export const isReward = type => rewards.includes(type) && !STARTER_TYPES.includes(type);
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
  while (s.hand.length < HAND_SIZE) {
    if (!s.draw.length) { if (!s.discard.length) break; s.draw = shuffle(s, s.discard); s.discard = []; }
    s.hand.push(s.draw.shift());
  }
}
export function fresh(seed = 20261017) {
  const deck = ['arrow.0', 'cover.0', 'focus.0', 'arrow.1', 'cover.1', 'maneuver.0'];
  const s = { version: VERSION, seed: seed >>> 0, rng: seed >>> 0, screen: 'title', encounter: 1, turn: 1, placements: 0, phaseTurn: 1, hp: 24, maxHp: 24, momentum: 0, prime: 0, deck, hand: deck.slice(0, HAND_SIZE), draw: [], discard: [], exhausted: [], grid: Array(GRID_SIZE).fill(null), faces: {}, enemies: structuredClone(ENCOUNTERS[0].enemies), cardSeq: 6, ruleset: 31, riskUnlocked: false, riskCell: null, pendingManeuver: null, draftChoices: [], last: null, outcome: null };
  s.draw = shuffle(s, deck.slice(HAND_SIZE));
  return s;
}
export function migrateSave(before) {
  const s = structuredClone(before);
  // Keep the relative positions of cards from the previous 2×2 board.
  if (s.grid?.length === 4) {
    const [a, b, c, d] = s.grid;
    s.grid = [a, b, null, c, d, null];
    s.last = null;
  }
  if (s.grid?.length === 6) { s.grid.push(null,null,null); s.last = null; }
  if (s.screen === 'reward') s.draftChoices = [...new Set([...(s.draftChoices??[]).filter(isReward), ...rewards.filter(isReward)])].slice(0,3);
  s.prime ??= 0; s.pendingManeuver ??= null; if (s.ruleset !== 31) s.last = null; s.ruleset = 31;
  s.riskUnlocked ??= false; s.riskCell ??= null;
  if (s.hand.length > HAND_SIZE) s.draw.unshift(...s.hand.splice(HAND_SIZE));
  s.discard.push(...s.exhausted); s.exhausted = [];
  for (let i = 0; i < s.grid.length; i++) {
    const uid = s.grid[i];
    if (uid && s.faces[uid] === 1) { s.discard.push(uid); delete s.faces[uid]; s.grid[i] = null; }
  }
  assertState(s); return s;
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
  s.encounter = index; s.phaseTurn = 1; s.momentum = 0; s.prime = 0; s.faces = {}; s.grid = Array(GRID_SIZE).fill(null); s.pendingManeuver = null; s.exhausted = []; s.discard = []; s.hand = []; s.last = null;
  s.enemies = structuredClone(ENCOUNTERS[index - 1].enemies);
  s.draw = shuffle(s, s.deck); draw(s); s.riskCell = null; s.screen = s.riskUnlocked ? 'terrain' : 'play'; s.draftChoices = [];
}
export function maneuverOptions(s) {
  const pending = s.pendingManeuver;
  if (!pending || s.screen !== 'play') return [];
  const options = [];
  for (const [from, uid] of s.grid.entries()) {
    if (!uid || uid === pending.source || s.faces[uid] !== 0) continue;
    if (pending.mode === 'recall') options.push({kind:'maneuver',card:uid,to:'hand'});
    else for (const cell of s.grid.keys()) if (!s.grid[cell]) {
      const grid = [...s.grid]; grid[from] = null; grid[cell] = uid;
      if (!completedLines(grid,cell).length) options.push({kind:'maneuver',card:uid,cell});
    }
  }
  return options;
}
export function actions(s) {
  if (s.screen === 'terrain') return [...s.grid.keys()].map(cell=>({kind:'place-risk',cell}));
  if (s.screen === 'reward') return [...s.draftChoices.filter(isReward).map(choice => ({ kind: 'draft', choice })), { kind: 'continue' }];
  if (s.screen !== 'play') return [];
  if (s.pendingManeuver) return [...maneuverOptions(s), {kind:'maneuver',skip:true}];
  const out = [];
  for (const card of s.hand) for (const cell of s.grid.keys()) if (!s.grid[cell]) for (const face of [0, 1]) for (const e of attackTargets(s)) out.push({ card, cell, face, target: e.id });
  return out;
}
export function activate(before, a) {
  const invalid = () => ({ valid: false, state: before, summary: null });
  if (!a || before.version !== VERSION) return invalid();
  if (before.screen === 'reward') {
    if (a.kind !== 'continue' && !(a.kind === 'draft' && isReward(a.choice) && before.draftChoices.includes(a.choice))) return invalid();
    const s = structuredClone(before);
    if (a.kind === 'draft') s.deck.push(`${a.choice}.${s.cardSeq++}`);
    s.hp = Math.min(s.maxHp, s.hp + 6);
    s.riskUnlocked = true;
    setupEncounter(s, s.encounter + 1);
    s.last = { kind: 'transition', action: structuredClone(a), choice: a.choice ?? null };
    assertState(s); return { valid: true, state: s, summary: s.last };
  }
  if (before.screen === 'terrain') {
    if (a.kind !== 'place-risk' || !before.riskUnlocked || !Number.isInteger(a.cell) || a.cell < 0 || a.cell >= GRID_SIZE || before.grid[a.cell]) return invalid();
    const s = structuredClone(before); s.riskCell = a.cell; s.screen = 'play';
    s.last = {kind:'terrain',action:structuredClone(a),cell:a.cell};
    assertState(s); return {valid:true,state:s,summary:s.last};
  }
  if (before.screen === 'play' && before.pendingManeuver) {
    if (a.kind !== 'maneuver') return invalid();
    const legal = maneuverOptions(before).find(x => x.card === a.card && x.to === a.to && x.cell === a.cell);
    if (!a.skip && !legal) return invalid();
    const s = structuredClone(before);
    if (!a.skip) { const from = s.grid.indexOf(a.card); s.grid[from] = null;
      if (a.to === 'hand') {s.hand.push(a.card); delete s.faces[a.card];}
      else s.grid[a.cell] = a.card;
    }
    s.pendingManeuver = null; draw(s); assertState(s);
    return {valid:true,state:s,summary:{kind:'maneuver',action:structuredClone(a)}};
  }
  if (before.screen !== 'play' || !before.hand.includes(a.card) || !Number.isInteger(a.cell) || a.cell < 0 || a.cell >= GRID_SIZE || before.grid[a.cell] || ![0, 1].includes(a.face) || (a.target && !attackTargets(before).some(e => e.id === a.target))) return invalid();
  const s = structuredClone(before);
  const action = { card: a.card, cell: a.cell, face: a.face, target: targetForAction(s, a) };
  s.hand.splice(s.hand.indexOf(a.card), 1); s.grid[a.cell] = a.card; s.faces[a.card] = a.face; s.placements++;
  const lines = completedLines(s.grid, a.cell);
  const cells = [...new Set(LINES.filter(line => line.includes(a.cell)).flat())].filter(cell => s.grid[cell]).sort((x, y) => x - y);
  const clearedCells = [...new Set(lines.flat())].sort((x, y) => x - y);
  const summary = { kind: 'turn', action, lines: structuredClone(lines), cells, clearedCells, events: [], incoming: 0, prevented: 0, unusedBlock: 0, risk: {triggered:false,cell:s.riskCell??null,bonus:0,extraIncoming:0}, effects: [], cleared: [], exhausted: [], hits: 0, block: 0, enemyDamage: 0, momentum: { before: s.momentum, gained: 0, spent: 0, after: s.momentum }, log: [] };
  s.prime ??= 0;
  const hit = amount => {
    const pool = attackTargets(s);
    pool.sort((x, y) => Number(y.id === action.target) - Number(x.id === action.target));
    let left = amount;
    for (const e of pool) { const n = Math.min(e.hp, left); e.hp -= n; left -= n; if (n) summary.events.push({ type: 'damage', source: 'hero', target: e.id, amount: n, hp: e.hp, fatal: e.hp === 0 }); if (!left) break; }
    const dealt = amount - left; summary.hits += dealt; return dealt;
  };
  const execute = (cell, phase) => {
    const uid = s.grid[cell];
    summary.events.push({ type: 'activate', cell, uid });
    const terrainBoost = s.riskUnlocked && cell === s.riskCell && def(uid,s).effects.some(f=>DIRECT_ATTACK_OPS.includes(f.op)) ? 2 : 0;
    if (terrainBoost) {summary.risk.triggered=true;summary.risk.bonus=terrainBoost;summary.events.push({type:'risk',cell,bonus:terrainBoost});}
    for (const fx of def(uid, s).effects) {
      const record = { cell, uid, phase, op: fx.op, amount: fx.n, terrainBoost: DIRECT_ATTACK_OPS.includes(fx.op) ? terrainBoost : 0 };
      if (fx.op === 'momentum') { s.momentum += fx.n; summary.momentum.gained += fx.n; summary.events.push({ type: 'momentum', amount: fx.n, value: s.momentum }); }
      else if (fx.op === 'block') { summary.block += fx.n; summary.events.push({ type: 'shield', amount: fx.n, value: summary.block }); }
      else if (fx.op === 'prime') s.prime += fx.n;
      else if (fx.op === 'recall_grid' || fx.op === 'shift_grid') s.pendingManeuver = {mode: fx.op === 'recall_grid' ? 'recall' : 'shift',source:uid};
      else if (fx.op === 'convert') {const amount=s.momentum;record.converted=amount;summary.block+=amount;summary.momentum.spent+=amount;s.momentum=0;summary.events.push({type:'momentum-spend',amount,value:0});if(amount)summary.events.push({type:'shield',amount,value:summary.block});}
      else if (fx.op === 'area') {let dealt=0;const credit=fx.consume===false?0:s.momentum;record.momentumSpent=credit;if(fx.consume!==false){summary.momentum.spent+=credit;s.momentum=0;summary.events.push({type:'momentum-spend',amount:credit,value:0});}const boost=s.prime+credit+terrainBoost;s.prime=0;for(const e of attackTargets(s)){const n=Math.min(e.hp,fx.n+boost);e.hp-=n;dealt+=n;if(n)summary.events.push({type:'damage',source:'hero',target:e.id,amount:n,hp:e.hp,fatal:e.hp===0});}summary.hits+=dealt;record.damage=dealt;}
      else if (fx.op === 'lifekill') {const target=s.enemies.find(e=>e.id===targetForAction(s,action));const hp=target?.hp??0;const power=fx.n+s.prime+terrainBoost;s.prime=0;record.damage=hit(power);if(hp>0&&hp<=power){const amount=Math.min(2,s.maxHp-s.hp);s.hp+=amount;if(amount)summary.events.push({type:'heal',amount,hp:s.hp});}}
      else if (fx.op === 'half') {const amount=Math.ceil(s.momentum/2);record.momentumSpent=amount;s.momentum-=amount;summary.momentum.spent+=amount;summary.events.push({type:'momentum-spend',amount,value:s.momentum});record.damage=hit(fx.n+amount+s.prime+terrainBoost);s.prime=0;}
      else if (fx.op === 'bleed') { const e = s.enemies.find(e => e.id === targetForAction(s, action)); if (e) { e.bleed += fx.n; record.target = e.id; summary.events.push({ type: 'bleed', target: e.id, amount: fx.n, value: e.bleed }); } }
      else {
        let extra = 0;
        if (fx.op === 'sniper') { extra = s.momentum; record.momentumSpent = extra; summary.momentum.spent += extra; s.momentum = 0; summary.events.push({ type: 'momentum-spend', amount: extra, value: 0 }); }
        if (fx.op === 'pounce' && s.enemies.find(e => e.id === targetForAction(s, action))?.bleed > 0) extra = 3;
        record.boost = extra + s.prime + terrainBoost; record.damage = hit(fx.n + record.boost); s.prime = 0;
      }
      summary.effects.push(record);
    }
  };
  // Resolve the occupied row/column union once, including the newly placed card.
  for (const cell of cells) execute(cell, 'cross');
  if (a.face === 1 && !clearedCells.includes(a.cell)) clearedCells.push(a.cell);
  for (const cell of clearedCells) {
    const uid = s.grid[cell]; if (!uid) continue; summary.cleared.push(uid);
    s.discard.push(uid);
    delete s.faces[uid]; s.grid[cell] = null;
  }
  {
    for (const e of s.enemies) if (e.hp > 0 && e.bleed > 0) { const dealt = Math.min(e.hp, e.bleed); e.hp -= dealt; summary.hits += dealt; summary.effects.push({ op: 'bleed_tick', target: e.id, amount: dealt }); summary.events.push({ type: 'damage', source: 'bleed', target: e.id, amount: dealt, hp: e.hp, fatal: e.hp === 0 }); e.bleed--; }
    if (s.enemies.every(e => e.hp <= 0)) {
      if (s.encounter === 4) { s.screen = 'end'; s.outcome = 'victory'; }
      else { s.screen = 'reward'; s.draftChoices = s.encounter === 1 ? rewards.slice(0, 3) : shuffle(s, rewards).slice(0, 3); }
    } else {
      let shield = summary.block;
      let riskPending = summary.risk.triggered ? 1 : 0;
      for (const [i, e] of s.enemies.entries()) {
        if (e.hp <= 0) continue;
        const riskBonus = riskPending; riskPending = 0;
        summary.risk.extraIncoming += riskBonus;
        const incoming = getEnemyIntent(e, i, s.phaseTurn).damage + riskBonus;
        if (!incoming) continue;
        const blocked = Math.min(shield, incoming); shield -= blocked;
        const damage = Math.min(s.hp, incoming - blocked); s.hp -= damage;
        summary.incoming += incoming; summary.prevented += blocked; summary.enemyDamage += damage;
        summary.events.push({ type: 'enemy-attack', source: e.id, target: 'hero', riskBonus, incoming, blocked, damage, hp: s.hp, shield });
        if (!s.hp) break;
      }
      if (!s.hp) { s.screen = 'end'; s.outcome = 'defeat'; }
    }
    s.turn++; s.phaseTurn++;
  }
  summary.unusedBlock = summary.block - summary.prevented;
  summary.momentum.after = s.momentum;
  if (s.screen !== 'play' || !maneuverOptions(s).length) s.pendingManeuver = null;
  if (!s.pendingManeuver) draw(s);
  const usable = [...s.hand, ...s.draw, ...s.discard, ...s.grid.filter(Boolean)];
  const canAttack = usable.some(uid => [0, 1].some(face => def(uid, s, face).effects.some(f => ['hit', 'sniper', 'pounce', 'bleed', 'area', 'lifekill', 'half'].includes(f.op))));
  if (s.screen === 'play' && !s.pendingManeuver && (!s.hand.length || (!canAttack && !s.enemies.some(e => e.hp > 0 && e.bleed > 0)))) { s.screen = 'end'; s.outcome = 'exhausted'; }
  s.last = summary; assertState(s); return { valid: true, state: s, summary };
}
export function assertState(s) {
  const check = (ok, text) => { if (!ok) throw new Error(text); };
  check(typeof s.riskUnlocked === 'boolean' && (s.riskCell === null || (s.riskUnlocked && Number.isInteger(s.riskCell) && s.riskCell >= 0 && s.riskCell < GRID_SIZE)), 'Invalid risk tile');
  check(s.screen !== 'terrain' || (s.riskUnlocked && s.riskCell === null && s.grid.every(uid=>!uid)), 'Invalid terrain placement phase');
  check(s.version === VERSION, 'Invalid version'); check(s.grid.length === GRID_SIZE, 'Grid must have nine slots');
  check(Number.isInteger(s.hp) && s.hp >= 0 && s.hp <= s.maxHp, 'Invalid health');
  check(Number.isInteger(s.momentum) && s.momentum >= 0, 'Invalid momentum');
  check(s.hand.length <= HAND_SIZE, 'Hand exceeds three'); check(s.encounter >= 1 && s.encounter <= 4, 'Invalid encounter');
  const zones = [...s.hand, ...s.draw, ...s.discard, ...s.exhausted, ...s.grid.filter(Boolean)];
  check(zones.length === s.deck.length && new Set(zones).size === zones.length && zones.every(uid => s.deck.includes(uid) && cards[cardType(uid)]), 'Card conservation violated');
  check(Object.keys(s.faces).every(uid => s.grid.includes(uid) && [0, 1].includes(s.faces[uid])), 'Invalid face commitments');
  check(s.grid.every(uid => !uid || [0, 1].includes(s.faces[uid])), 'Missing face commitment');
  check(s.enemies.every(e => e.hp >= 0 && e.hp <= e.maxHp && e.bleed >= 0), 'Invalid enemy');
  return true;
}
