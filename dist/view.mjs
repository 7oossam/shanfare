import { comboModel, comboHints } from './combos.mjs?v=8';
import {
  def,
  cards,
  alternates,
  cardType,
  rewards,
  activate,
  incoming,
  lineIndices,
  trailCells,
  stage,
  goal,
  collapseRow,
  ARCHETYPES,
  RELICS,
  ENCOUNTERS,
  getEnemyIntent,
  attackTargets,
  targetForAction
} from './engine.mjs?v=8';
import { icon } from './icons.mjs?v=8';
import { isMuted } from './audio.mjs?v=8';

export const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const num = n => new Intl.NumberFormat('ar-SA', { useGrouping: false }).format(n);
export const ratio = (a, b) => `<bdi dir="ltr" class="num">${num(a)} / ${num(b)}</bdi>`;
export const button = (label, action, cls = '', disabled = false, aria = '') =>
  `<button data-action="${action}" class="${cls}" ${disabled ? 'disabled' : ''} ${aria ? `aria-label="${esc(aria)}"` : ''}>${label}</button>`;

export function preview(s, p, axis = p.axis) {
  if (!p.card || p.cell === null || !axis || p.face === null) return null;
  const result = activate(s, { card: p.card, cell: p.cell, axis, face: p.face ?? 0, target: targetForAction(s, { ...p, axis }) });
  return result.valid ? result : null;
}

export function bestAxis(s, card, cell, face = 0, target = null) {
  if (!card || cell === null) return 'row';
  const rowRes = activate(s, { card, cell, axis: 'row', face: face ?? 0, target: targetForAction(s, { cell, axis: 'row', target }) });
  const colRes = activate(s, { card, cell, axis: 'col', face: face ?? 0, target: targetForAction(s, { cell, axis: 'col', target }) });
  if (!rowRes.valid) return 'col';
  if (!colRes.valid) return 'row';

  const rClr = (rowRes.summary.cleared || []).length === 3;
  const cClr = (colRes.summary.cleared || []).length === 3;
  if (rClr && !cClr) return 'row';
  if (cClr && !rClr) return 'col';

  if (rowRes.state.hp > colRes.state.hp) return 'row';
  if (colRes.state.hp > rowRes.state.hp) return 'col';

  const sc = r => (r.summary.hits || 0) * 3 + (r.summary.moves || 0) * 2 + (r.summary.block || 0) * 1.5;
  return sc(colRes) > sc(rowRes) ? 'col' : 'row';
}

const stsStat = (ico, val, extra = '', cls = '') =>
  `<span class="sts-stat ${cls}">${icon(ico)}<b>${val}</b>${extra ? `<small>${extra}</small>` : ''}</span>`;

export function cardEffects(uid, s, face) {
  const c = def(uid, s, face);
  const bits = [];
  for (const f of c.effects) {
    if (f.op === 'move') bits.push(stsStat('foot', num(f.n), '', 'stat-move'));
    if (f.op === 'momentum') bits.push(stsStat('fire', num(f.n), '', 'stat-momentum'));
    if (f.op === 'hit') bits.push(stsStat('knife', num(f.n), '', 'stat-attack'));
    if (f.op === 'sniper') {
      const bonus = s ? s.momentum : 0;
      if (bonus > 0) {
        bits.push(stsStat('bow', num(f.n + bonus), `يصرف ${num(bonus)} زخم`, 'stat-attack bow-boosted'));
      } else {
        bits.push(stsStat('bow', num(f.n), '+ الزخم', 'stat-attack'));
      }
    }
    if (f.op === 'cyclone_shot') {
      const bonus = s ? s.momentum : 0;
      if (bonus > 0) {
        bits.push(stsStat('bow', num(f.n + bonus), `يصرف ${num(bonus)} زخم`, 'stat-attack bow-boosted'));
      } else {
        bits.push(stsStat('bow', num(f.n), '+ الزخم', 'stat-attack'));
      }
    }
    if (f.op === 'hurt') bits.push(stsStat('heart', num(f.n), '', 'stat-danger'));
    if (f.op === 'block') bits.push(stsStat('shield', num(f.n), '', 'stat-guard'));
    if (f.op === 'prime') bits.push(stsStat('spark', '+' + num(f.n), '', 'stat-setup'));
    if (f.op === 'bleed') bits.push(stsStat('bleed', num(f.n), '', 'stat-bleed'));
    if (f.op === 'poison') bits.push(stsStat('poison', num(f.n), '', 'stat-poison'));
    if (f.op === 'double_bleed') bits.push(stsStat('bleed', '×٢', '', 'stat-bleed'));
    if (f.op === 'explode_bleed') bits.push(stsStat('bleed', '💥×٢', '', 'stat-attack'));
    if (f.op === 'wolf_pounce') {
      const bonus = (s && (s.bleed > 0 || s.poison > 0)) ? 2 : 0;
      if (bonus > 0) {
        bits.push(stsStat('wolf', num(f.n + bonus), '🩸نشط', 'stat-beast wolf-empowered'));
      } else {
        bits.push(stsStat('wolf', num(f.n), '+🩸', 'stat-beast'));
      }
    }
    if (f.op === 'ward') bits.push(stsStat('cover', 'ساتر', '', 'stat-guard'));
    if (f.op === 'vanish') bits.push('<span class="vanish-badge">تُطرح</span>');
  }
  return bits.join('');
}

export function comboView(s, m) {
  const hits = m.totals.hits || 0;
  const block = m.totals.block || 0;
  const moves = m.totals.moves || 0;
  const isFull = (m.totals.cleared && m.totals.cleared.length === 3);

  return `
    <section class="combo-panel" aria-label="حصاد خط التدبير">
      <div class="combo-title">
        <span class="combo-flow">المسار: ${m.steps.map((x, i) => `<b>${num(i + 1)}</b> ${esc(x.name)}`).join(' ➔ ')}</span>
        <div class="combo-totals">
          ${hits ? `<span class="stat-badge hit">💥 ${num(hits)} ضرر</span>` : ''}
          ${block ? `<span class="stat-badge block">🛡️ ${num(block)} درع</span>` : ''}
          ${moves ? `<span class="stat-badge move">👟 ${num(moves)} خطوة</span>` : ''}
        </div>
      </div>
      ${m.links.length ? `
        <div class="combo-synergy-pill">
          ⚡ تآزر: ${m.links.map(l => `${esc(l.sources.map(x => (x.name || def(x.uid, s).name)).join('+'))} تمنح ${esc(l.targetName)} +${num(l.boost)} ضرر!`).join(' • ')}
        </div>
      ` : ''}
      ${isFull ? `
        <div class="combo-clear-pill">✨ اكتمال الخط: تفريغ الخانات الثلاث وتوجيه ضربات قاضية!</div>
      ` : ''}
    </section>
  `;
}

// The approved reference is the sprite atlas: no substitute illustrations.
// Coordinates are in its original 1374 × 1145 pixels.
const atlasStyle = (x, y, w, h) => `background-size:${1374 / w * 100}% ${1145 / h * 100}%;background-position:${x / (1374 - w) * 100}% ${y / (1145 - h) * 100}%`;
const atlas = (x, y, w, h, cls = '') => `<span aria-hidden="true" class="reference-piece ${cls}" style="${atlasStyle(x, y, w, h)}"></span>`;
const artKind = c => /bow/.test(c.icon) ? 'bow' : /run|foot/.test(c.icon) ? 'run' : /shield|cover|stone/.test(c.icon) ? 'shield' : /sneak|spark/.test(c.icon) ? 'trick' : c.icon;
const simpleName = c => ({ bow: 'سهم', run: 'ركض', shield: 'حماية', trick: 'خدعة', wolf: 'نهش', knife: 'سكين', bleed: 'نزيف', poison: 'سمّ' })[artKind(c)] || c.name;
const handArt = { run: [758, 905, 127, 139], bow: [895, 905, 129, 139], shield: [1033, 905, 129, 139], trick: [1171, 905, 128, 139] };
const slotArt = { run: [207, 448, 99, 74], bow: [352, 448, 99, 74], shield: [498, 448, 99, 74] };

function commandIcon(c, large = false) {
  const kind = artKind(c);
  const rect = (large ? handArt : slotArt)[kind];
  return rect ? atlas(...rect, large ? 'card-painting' : 'slot-painting') : `<span class="fallback-card-art">${icon(c.icon)}<small>${esc(simpleName(c))}</small></span>`;
}

function commandHeader(s, projected) {
  const m = projected?.summary.momentum;
  return `<header class="command-header">${atlas(741, 60, 576, 44, 'header-paper scene-clean')}
    <span class="header-health" aria-label="الصحة ${num(s.hp)} من ${num(s.maxHp)}">${icon('heart')}${ratio(s.hp, s.maxHp)}</span>
    <button class="header-momentum" data-action="momentum-info" aria-label="رصيد الزخم ${num(s.momentum)}، اضغط للتفاصيل">${icon('fire')}<span>الزخم <b data-momentum-current>${num(s.momentum)}</b></span></button>
    ${button(atlas(1273, 69, 27, 27), 'menu', 'header-menu', false, 'قائمة اللعبة')}
    ${m ? `<div class="credit-preview" role="status">ستجمع <b>${num(m.gained)}</b> · ستصرف <b>${num(m.spent)}</b> · سيبقى <b data-momentum-after>${num(m.after)}</b></div>` : ''}
  </header>`;
}

function commandArena(s, p, projected, planning) {
  const target = targetForAction(s, p);
  const pool = attackTargets(s);
  const living = s.enemies.filter(e => e.hp > 0);
  const hp = projected?.state.hp ?? s.hp;
  return `<section class="command-arena ${s.enemies.length > 2 ? 'three-enemies' : ''}" aria-label="ساحة القتال، اختر العدو المستهدف">
    ${planning ? atlas(58, 105, 575, 269, 'scene-backdrop') : atlas(741, 105, 576, 535, 'scene-backdrop')}
    <div class="arena-actor actor-hero">
      ${planning ? atlas(68, 176, 270, 198, 'actor-art art-hero') : atlas(742, 281, 321, 345, 'actor-art art-hero')}
      <div class="actor-label">${planning ? atlas(154, 119, 105, 52, 'label-paper scene-clean') : atlas(790, 182, 113, 64, 'label-paper scene-clean')}<strong>الشنفرى</strong><span class="actor-health"><i style="width:${hp / s.maxHp * 100}%"></i></span><b>${ratio(hp, s.maxHp)}</b></div>
    </div>
    ${s.enemies.map((e, i) => {
      const after = projected?.state.enemies[i]?.hp ?? e.hp;
      const locked = e.hp <= 0 || !pool.some(x => x.id === e.id);
      const intent = getEnemyIntent(e, i, s.phaseTurn, living.length === 1);
      const rect = planning ? i % 2 === 0 ? [375, 211, 142, 163] : [509, 210, 124, 164] : i % 2 === 0 ? [1056, 339, 145, 288] : [1187, 347, 130, 280];
      return `<button class="arena-actor actor-enemy enemy-${i} ${target === e.id ? 'is-target' : ''} ${e.hp <= 0 ? 'is-fallen' : ''}" data-target="${e.id}" aria-pressed="${target === e.id}" ${locked ? 'disabled' : ''} aria-label="${esc(e.name)}، صحة ${num(e.hp)}، ${locked && e.hp > 0 ? 'يحميه حاملو التراس' : esc(intent.desc)}">
        ${atlas(...rect, 'actor-art ' + (i % 2 === 0 ? 'art-guard' : 'art-scout'))}
        <span class="actor-label">${planning ? atlas(...(i % 2 === 0 ? [387, 151, 94, 54] : [520, 151, 96, 54]), 'label-paper scene-clean') : atlas(...(i % 2 === 0 ? [1060, 264, 105, 67] : [1205, 263, 108, 65]), 'label-paper scene-clean')}<strong>${esc(e.name)}</strong><span class="actor-health"><i style="width:${after / e.maxHp * 100}%"></i></span><b>${ratio(after, e.maxHp)}</b><small class="actor-intent">${e.hp <= 0 ? 'صريع' : locked ? 'محمي' : intent.damage ? `${icon('swords')} ${num(intent.damage)}` : 'تأهّب'}</small></span>
        ${e.hp > after ? `<span class="arena-damage">−${num(e.hp - after)}</span>` : ''}
      </button>`;
    }).join('')}
    ${!planning ? `<span class="old-damage-cover">${atlas(1127, 331, 52, 31, 'scene-clean')}</span>` : ''}
    <button class="arena-route" data-action="journey" aria-label="تقدم الرحلة">${num(s.encounter)} / ٤ · ${icon('foot')} ${num(s.progress)} / ${num(goal(s))}</button>
  </section>`;
}

function commandChains(s, p, planning) {
  const prepared = p.card && p.cell !== null ? stage(s, p) : null;
  const grid = prepared?.grid || s.grid;
  const shown = { ...s, faces: { ...s.faces, ...prepared?.faces } };
  const line = p.cell !== null && p.axis ? lineIndices(p.cell, p.axis) : [];
  const collapse = collapseRow(s);
  return `<section class="command-chains" aria-label="خطة الأوامر، ثلاث سلاسل لكل منها ثلاثة مواضع">${[0, 1, 2].map(row => `<div class="command-chain ${collapse === row ? 'will-collapse' : ''}">
    <span class="chain-ribbon"><span>السلسلة ${['الأولى', 'الثانية', 'الثالثة'][row]}</span></span>
    <div class="chain-slots">${[0, 1, 2].map(col => {
      const cell = row * 3 + col;
      const c = grid[cell] ? def(grid[cell], shown) : null;
      return `<button type="button" class="command-slot ${line.includes(cell) ? 'in-path' : ''} ${p.cell === cell ? 'is-staged' : ''}" data-cell="${cell}" aria-pressed="${p.cell === cell}" aria-label="السلسلة ${num(row + 1)}، الموضع ${num(col + 1)}، ${c ? esc(c.name) : 'ضع بطاقة هنا'}">
        ${c ? commandIcon(c) : `<span class="slot-empty">${s.wards[cell] ? icon('cover') : '+'}</span>`}
        ${line.includes(cell) && planning ? `<span class="execution-order">${num(line.indexOf(cell) + 1)}</span>` : ''}
        ${s.grid[cell] && (s.faces[s.grid[cell]] ?? 0) === 1 ? '<span class="slot-instant">٢</span>' : ''}
      </button>`;
    }).join('')}</div>
    ${collapse === row ? '<span class="chain-warning">ينهار بعد الدور</span>' : ''}
  </div>`).join('')}</section>`;
}

function commandComparison(s, p) {
  const prepared = p.card && p.cell !== null ? stage(s, p) : null;
  const shown = { ...s, faces: { ...s.faces, ...prepared?.faces } };
  return `<section class="command-comparison" aria-label="اختر طريقة تفعيل الأوامر">${['row', 'col'].map(axis => {
    const result = preview(s, p, axis);
    const cells = p.cell !== null ? lineIndices(p.cell, axis) : [];
    return `<button class="command-choice ${p.axis === axis && result ? 'is-selected' : ''}" data-axis="${axis}" aria-pressed="${!!result && p.axis === axis}" ${result ? '' : 'disabled'}>
      <strong>${axis === 'row' ? 'سلسلة كاملة' : 'الموضع نفسه'}</strong>
      <span class="choice-sequence">${cells.length ? cells.map(cell => `<span class="sequence-card">${prepared.grid[cell] ? commandIcon(def(prepared.grid[cell], shown)) : '+'}</span>`).join('<span class="sequence-arrow">→</span>') : '<span class="choose-position">اختر موضع البطاقة</span>'}</span>
      <span class="choice-total">${icon('swords')} ${num(result?.summary.hits || 0)} <span>مجموع الهجوم</span></span>
      ${result ? `<small class="choice-survival">${icon('shield')} ${num(result.summary.block)} · ${result.state.hp < s.hp ? `−${num(s.hp - result.state.hp)} صحة` : 'بلا جراح'}</small>` : ''}
    </button>`;
  }).join('')}</section>`;
}

// Face summaries use the definitions; contextual totals use the resolved preview.
export function faceEffectLines(uid, s, face) {
  const c = def(uid, s, face);
  const lines = [];
  for (const f of c.effects) {
    const n = num(f.n);
    const label = {
      momentum: `+${n} زخم`, move: `تقدّم ${n}`, hit: `${n} ضرر`, block: `صدّ ${n}`,
      hurt: `−${n} صحة`, prime: `التالي +${n} ضرر`, bleed: `نزيف ${n}`, poison: `سمّ ${n}`,
      ward: `ساتر: صدّ ${n} لاحقًا`, double_bleed: 'ضاعف النزيف', explode_bleed: 'الضرر = ضعف النزيف',
      aoe_hit: `${n} ضرر للجميع`, detonate_wards: `${n} ضرر لكل ساتر`,
      ambush: '٤ ضرر قبل فراغ؛ وإلا ١', wolf_pounce: `${n} ضرر؛ ٦ مع نزيف/سم`,
      friend: 'فكّ قيد؛ ثم صدّ ٢', mark: 'وسم', push: `دفع ${n}`, blind: `هجوم العدو −${n}`,
      grit_damage: 'ضرر حسب الجراح', frenzy: 'هجوم الضواري', scavenge: 'استرداد بطاقة'
    }[f.op];
    if (f.op === 'vanish') continue;
    if (f.op === 'sniper' || f.op === 'cyclone_shot') lines.push(`${n} + الزخم ضرر`, 'يصرف الزخم');
    else if (label) lines.push(label);
    else if (!lines.includes(c.short)) lines.push(c.short);
  }
  if (cardType(uid, s) === 'shift' && face === 0) lines.unshift('تبديل موضعين');
  return lines;
}

export function cardDecision(s, p, projected = preview(s, p)) {
  if (!p.card) return null;
  const c = def(p.card, s, p.face ?? 0);
  const vanishes = c.effects.some(f => f.op === 'vanish');
  if (!projected) return {
    title: `${simpleName(c)} · ${p.face ? 'طارئ' : 'دائم'}`,
    text: faceEffectLines(p.card, s, p.face ?? 0).join(' · '),
    outcome: `${vanishes ? 'يُطرح عند التفعيل.' : 'يتكرر أثره عند تفعيل موضعه.'} اختر موضعًا لرؤية النتيجة.`
  };
  const effects = projected.summary.effects.filter(f => f.uid === p.card);
  const parts = [];
  const gained = effects.filter(f => f.op === 'momentum').reduce((n, f) => n + f.amount, 0);
  if (gained) parts.push(`تضيف هذه البطاقة ${num(gained)} زخم`);
  const bows = projected.summary.effects.filter(f => f.op === 'sniper' || f.op === 'cyclone_shot');
  if (bows.length) parts.push(bows.map(f => `سهم الموضع ${num(f.cell + 1)}: ${num(f.amount)} أساس + ${num(f.momentumSpent)} زخم${(f.boost || 0) > f.momentumSpent ? ` + ${num(f.boost - f.momentumSpent)} تعزيز` : ''} = ${num(f.amount + (f.boost || 0))} ضرر`).join('؛ '));
  if (!parts.length) parts.push(faceEffectLines(p.card, s, p.face ?? 0).join(' · '));
  const remains = projected.state.grid.includes(p.card);
  const lifetime = remains ? 'تبقى البطاقة لتفعيلها لاحقًا.' : projected.summary.vanished.includes(p.card) ? 'تُطرح البطاقة بعد التنفيذ.' : 'تُزال البطاقة مع اكتمال الخط.';
  return {
    title: `${simpleName(c)} · ${p.face ? 'طارئ' : 'دائم'} · في خطتك`,
    text: parts.join(' ← '),
    outcome: `${lifetime} إجمالي الخطة: ${num(projected.summary.hits)} هجوم · ${num(projected.summary.block)} صدّ · ${num(Math.max(0, s.hp - projected.state.hp))} خسارة صحة.`
  };
}

function commandHand(s, p, projected) {
  const decision = cardDecision(s, p, projected);
  return `${decision ? `<aside class="card-decision" aria-live="polite"><strong>${esc(decision.title)}</strong><p>${esc(decision.text)}</p><small>${esc(decision.outcome)}</small>${button('ⓘ', 'card-info', 'decision-info', false, 'تفاصيل وجهي البطاقة')}</aside>` : ''}
  <section class="command-hand" aria-label="بطاقات اليد، اضغط التأثير الدائم أو الطارئ لاختياره">${s.hand.map(uid => {
    const selected = p.card === uid;
    const face = selected ? p.face ?? 0 : 0;
    const base = def(uid, s, 0);
    const rect = handArt[artKind(base)];
    const art = rect ? atlas(rect[0] + 8, rect[1] + 25, rect[2] - 16, rect[3] - 57, 'hand-thumbnail') : icon(base.icon);
    return `<article class="hand-card ${selected ? 'is-selected' : ''}" aria-label="${esc(base.name)}">
      <button class="hand-card-select" data-card="${uid}" data-face="${face}" aria-pressed="${selected}" aria-label="اختر ${esc(base.name)}"><span class="hand-picture">${art}</span><strong>${esc(simpleName(base))}</strong></button>
      ${[0, 1].map(f => {
        const c = def(uid, s, f);
        const active = selected && face === f;
        const vanish = c.effects.some(effect => effect.op === 'vanish');
        return `<button class="hand-face face-${f} ${active ? 'is-active' : ''}" data-card="${uid}" data-face="${f}" aria-pressed="${active}" aria-label="${f ? 'طارئ' : 'دائم'}: ${esc(c.name)}، ${esc(faceEffectLines(uid, s, f).join('، '))}، ${vanish ? 'يُطرح' : 'يبقى'}">
          <span class="hand-face-title">${f ? 'طارئ' : 'دائم'}${active ? ' ✓' : ''}</span>
          <span class="hand-face-effects">${faceEffectLines(uid, s, f).map(line => `<span>${esc(line)}</span>`).join('')}</span>
          <small class="hand-face-life">${vanish ? 'يُطرح' : 'يبقى'}</small>
        </button>`;
      }).join('')}
    </article>`;
  }).join('')}</section>`;
}

export function gameView(s, p, feedback = '') {
  const planning = !!p.planning || !!p.card;
  const projected = preview(s, p);
  return `<div class="command-app ${planning ? 'is-planning' : 'is-combat'}" data-turn="${s.turn}">
    ${commandHeader(s, projected)}${commandArena(s, p, projected, planning)}
    <section class="command-desk">${atlas(58, 375, 575, 749, 'desk-paper scene-clean')}
      <div class="command-title"><span></span><h2>${planning ? 'ضع البطاقة' : 'خطة الأوامر'}</h2><span></span>${planning ? button('×', 'cancel', 'desk-close', false, 'إلغاء التخطيط') : button('؟', 'help', 'desk-help', false, 'كيف ألعب؟')}</div>
      ${commandChains(s, p, planning)}${planning ? commandComparison(s, p) : ''}
      ${commandHand(s, p, projected)}
      ${button(atlas(756, 1055, 548, 62, 'execute-frame') + `<span class="execute-label">${planning ? 'نفّذ الخطة' : 'خطّط للدور'}</span>`, planning ? 'activate' : 'plan', 'command-execute', planning && !projected)}
    </section>
    ${feedback ? `<div class="tactical-toast" role="status">${esc(feedback)}</div>` : ''}
  </div>`;
}

// -------------------------------------------------------------
// Roguelike Drafting Screen: 1 of 3 Cards + Ascetic Purge
// -------------------------------------------------------------
export function rewardView(s) {
  const choices = s.draftChoices.length ? s.draftChoices : ['sniper_wind', 'flint_blade', 'granite_spire'];

  return `
    <main class="hero reward-screen widescreen-modal">
      <div class="modal-card">
        <p class="gold-subtitle">«وَإِنْ مُدَّتِ الأَيْدِي إِلَى الزَّادِ»</p>
        <h1>غَنِيمَةُ المعْبَر — اختر أسلوبك للمسير</h1>
        <p class="lead-text">انتصرتَ في المواجهة؛ ضمّ بطاقة جديدة من مكائد الصعاليك إلى رزمتك، أو استغنِ وتخفف.</p>

        <div class="draft-grid">
          ${choices.map(k => {
            const c0 = cards[k];
            const c1 = alternates[k];
            const arch = ARCHETYPES[c0?.build] || ARCHETYPES.general;
            return `
              <div class="draft-card ${arch.class}">
                <div class="card-badge">${arch.name}</div>
                <div class="card-hero-icon">${icon(c0?.icon || 'spark')}</div>
                <h3>${c0?.name}</h3>
                <div class="draft-face-desc">
                  <p><b>الوجه الدائم:</b> ${c0?.text}</p>
                  <p><b>الوجه الطارئ:</b> ${c1?.text}</p>
                </div>
                ${button(`اختر «${c0?.name}»`, `draft-${k}`, 'primary draft-pick-btn')}
              </div>
            `;
          }).join('')}
        </div>

        <!-- The Ascetic Purge (الزهد والاستغناء) -->
        <div class="purge-section">
          <div class="purge-box">
            <strong>الزُّهْدُ والاسْتِغْنَاء (Deck Thinning)</strong>
            <p>«وأستفّ ترب الأرض كيلا يُرى له...»؛ ارفض أخذ أي بطاقة، وتخلّص من بطاقة زائدة لتسريع دوران رزمتك القوية.</p>
            ${button('تطهير بطاقة زائدة (الزهد)', 'purge', 'purge-btn')}
          </div>
          ${button('متابعة التدبير دون تغيير', 'skip', 'skip-btn')}
        </div>
      </div>
    </main>
  `;
}

// -------------------------------------------------------------
// Relic Selection Screen: Pick 1 of 4 Rule-Breaking Relics
// -------------------------------------------------------------
export function relicView(s) {
  return `
    <main class="hero relic-screen widescreen-modal">
      <div class="modal-card">
        <p class="gold-subtitle">«آثَارُ شِعَابِ السَّرَاةِ الكُبْرَى»</p>
        <h1>اختر أثراً صعلوكياً يكسر قواعد اللعبة</h1>
        <p class="lead-text">بلغتَ مورد الماء الصافي؛ اختر ميثاقاً من مواثيق الصعاليك يغيّر قوانين حسابك ومعاركك.</p>

        <div class="relics-grid">
          ${Object.values(RELICS).map(r => `
            <div class="relic-card ${s.relics.includes(r.id) ? 'already-owned' : ''}">
              <div class="relic-icon-wrapper">${icon(r.icon)}</div>
              <h3>${r.title}</h3>
              <p>${r.desc}</p>
              ${button(s.relics.includes(r.id) ? 'تمتلك هذا الأثر' : 'اختر هذا الأثر', `relic-${r.id}`, 'primary', s.relics.includes(r.id))}
            </div>
          `).join('')}
        </div>
      </div>
    </main>
  `;
}

// -------------------------------------------------------------
// Interlude Screen (Between Encounters)
// -------------------------------------------------------------
export function interludeView(s) {
  const enc = ENCOUNTERS[s.encounter - 1] || ENCOUNTERS[0];
  const nextEnc = ENCOUNTERS[s.encounter] || null;

  return `
    <main class="hero interlude-screen widescreen-modal">
      <div class="modal-card">
        <p class="gold-subtitle">انْقِضَاءُ المَرْحَلَةِ ${num(s.encounter)}</p>
        <h1>نصرٌ مؤزر في ${enc.name}</h1>
        <p class="verse-quote">${enc.verse}</p>

        <div class="run-stats-chips">
          <span>${icon('heart')} ${num(s.hp)} صحة</span>
          <span>${icon('fire')} رصيد الرزمة: ${num(s.deck.length)} بطاقة</span>
          <span>${icon('moon')} بقي للفجر ${num(36 - s.turn)} دوراً</span>
        </div>

        ${nextEnc ? `
          <div class="next-preview-box">
            <h3>المحطة القادمة: ${nextEnc.name}</h3>
            <p>${nextEnc.desc}</p>
          </div>
        ` : ''}

        <div class="interlude-actions">
          ${button('اقتحم المعبر التالي', 'continue', 'primary continue-btn')}
          ${button('سجلّ الرحلة والمواجهات', 'report', 'secondary')}
        </div>
      </div>
    </main>
  `;
}

// -------------------------------------------------------------
// End Run Screens (Epic Victory & Dignified Fall)
// -------------------------------------------------------------
export function endView(s) {
  const isVictory = s.outcome === 'victory' || s.outcome === 'full';
  return `
    <main class="hero end-screen widescreen-modal">
      <div class="modal-card">
        <p class="gold-subtitle">${isVictory ? '«تَمَّ النَّذْرُ وَوَفَى الصَّاحِب»' : '«ثَوَى البَاسِلُ مُقْبِلاً»'}</p>
        <h1>${isVictory ? 'إتمام ملحمة الشَّنْفَرَى والظَّفَر' : s.outcome === 'caught' ? 'انْصِدَاعُ الفَجْرِ وَالحِصَار' : 'سُقُوطٌ شَرِيفٌ فِي السَّرَاة'}</h1>
        
        <p class="lead-text">
          ${isVictory
            ? '«أَقِيمُوا بَنِي أُمِّي صُدُورَ مَطِيِّكُمْ • فَإِنِّي إِلى قَوْمٍ سِوَاكُمْ لَأَمْيَلُ • هُمُ الرَّهْطُ لا مُسْتَوْدَعُ السِّرِّ ذَائِعٌ لَدَيْهِمْ، وَلا الجَانِي بِمَا جَرَّ يُخْذَلُ».. أتممتَ نذر المئة قتيل وكسرتَ طوق بني سلامان!'
            : '«لا تَدْفِنُونِي! إِنَّ دَفْنِيَ مُحَرَّمٌ عَلَيْكُمْ، وَلَكِنْ أَبْشِرِي أُمَّ عَامِرِ! • إِذَا احْتَمَلُوا رَأْسِي وَفِي الرَّأْسِ أَكْثَرِي • وَغُودِرَ عِنْدَ المُلْتَقَى ثَمَّ سَائِرِي».. سقطتَ مقبلاً غير مدبر.'}
        </p>

        <div class="run-stats-chips">
          <span>${icon('heart')} ${num(s.hp)} صحة باقية</span>
          <span>${icon('moon')} ${num(s.turn)} أدوار مستغرقة</span>
          <span>${icon('sandals')} ${num(s.relics.length)} آثار مكتسبة</span>
        </div>

        <div class="end-actions">
          ${button('ابدأ رناً جديداً بتوزيع مختلف', 'new-seed', 'primary')}
          ${button('أعد نفس الرن', 'restart', 'secondary')}
          ${button('سجلّ التقرير الكامل', 'report', 'secondary')}
        </div>
      </div>
    </main>
  `;
}

// -------------------------------------------------------------
// Title Screen
// -------------------------------------------------------------
export function titleView() {
  return `
    <main class="hero title-screen widescreen-modal">
      <div class="modal-card title-card">
        <p class="gold-subtitle">رقعة التدبير · وجها القرار</p>
        <h1>طَرِيقُ السَّرَاة <small>· مَلْحَمَةُ الشَّنْفَرَى</small></h1>
        <div class="hero-art-widescreen">
          <div class="hero-silhouette"></div>
        </div>
        <p class="epic-prologue">
          «أَقِيمُوا بَنِي أُمِّي صُدُورَ مَطِيِّكُمْ».. انطلق في ٤ مواجهات شاقة عبر شِعاب السَّراة؛
          ابنِ رزمتك من ٤ مسارات تكتيكية (الزَّخَم والقَوْس، النَّزْف والسُّمُوم، الصَّخْر والجَلَد، ومِيثَاق الضَّوَارِي)،
          واكتسب التحف التي تكسر القواعد لإتمام نذر المئة قتيل قبل انصداع الفجر.
        </p>
        <div class="title-actions">
          ${button('ابدأ ملحمة السَّراة', 'start', 'primary start-btn')}
          ${button('كيف تعمل ساحة المعركة؟', 'help', 'secondary')}
        </div>
      </div>
    </main>
  `;
}

