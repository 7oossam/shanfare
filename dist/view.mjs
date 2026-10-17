import { cards, alternates, def, cardType, activate, attackTargets, targetForAction, getEnemyIntent, ENCOUNTERS } from './engine.mjs?v=9';
import { icon } from './icons.mjs?v=9';
import { fullscreenActive, fullscreenSupported } from './fullscreen.mjs?v=9';
export const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const num = n => new Intl.NumberFormat('ar-SA', { useGrouping: false }).format(n);
export const ratio = (a, b) => `<bdi dir="ltr">${num(a)} / ${num(b)}</bdi>`;
export const button = (label, action, cls = '', disabled = false, aria = '') => `<button class="${cls}" data-action="${action}" ${disabled ? 'disabled' : ''} ${aria ? `aria-label="${esc(aria)}"` : ''}>${label}</button>`;
const ASSET_ROOT = typeof document === 'undefined' ? 'assets/landscape/' : new URL('assets/landscape/', document.currentScript?.src || location.href).href;
const style = (x, y, w, h, W = 1672, H = 941) => `background-size:${W / w * 100}% ${H / h * 100}%;background-position:${x / (W - w) * 100}% ${y / (H - h) * 100}%`;
const slice = (x, y, w, h, cls = '', source = 'layout-reference.png', W = 1672, H = 941) => `<span class="art-slice ${cls}" aria-hidden="true" style="background-image:url('${ASSET_ROOT}${source}');${style(x, y, w, h, W, H)}"></span>`;
const stat = (value, ico, cls = '') => `<span class="icon-stat ${cls}" dir="ltr"><b>${num(value)}</b>${icon(ico)}</span>`;
export function preview(s, p) { if (!p.card || p.cell === null || p.cell === undefined) return null; const r = activate(s, { card: p.card, cell: p.cell, face: p.face ?? 0, target: targetForAction(s, p) }); return r.valid ? r : null; }
export function effectFormula(uid, s, face = 0, projected = null) {
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
export function fullscreenButton() {
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
    <div class="duel-grid ${animation ? 'is-resolving' : ''}" role="group" aria-label="شبكة صفين وثلاثة أعمدة">${grid.map((uid, cell) => {
      const c = uid ? def(uid, { ...s, faces }, faces[uid] ?? 0) : null;
      const isPreview = p.card && p.cell === cell;
      return `<button class="grid-cell ${uid ? 'has-card' : ''} ${chosen.includes(cell) ? 'in-line' : ''} ${animation?.cells?.includes(cell) ? 'is-clearing' : ''} ${isPreview ? 'is-preview' : ''}" data-cell="${cell}" aria-label="الخانة ${num(cell + 1)}${c ? '، ' + esc(c.name) : ' فارغة'}" ${animation ? 'disabled' : ''}>
        ${c ? `<span class="slot-symbol">${icon(c.icon)}</span><strong>${esc(c.name)}</strong>${(faces[uid] ?? 0) === 1 ? '<small class="instant-mark">طارئ</small>' : ''}` : '<span class="empty-plus">+</span>'}
        ${chosen.includes(cell) ? `<b class="line-order">${num(chosen.indexOf(cell) + 1)}</b>` : ''}
      </button>`;
    }).join('')}</div>
    <div class="board-feedback" aria-live="polite">${projected ? projected.summary.lines.length ? `<strong>${projected.summary.lines.length > 1 ? 'يكتمل الصف والعمود' : projected.summary.lines[0][1] - projected.summary.lines[0][0] === 1 ? 'يكتمل الصف' : 'يكتمل العمود'}</strong><div class="preview-totals">${stat(projected.summary.hits, 'swords')}${stat(projected.summary.block, 'shield')}${stat(projected.summary.enemyDamage, 'heart')}</div><small>تفعيل فوري + إعادة تفعيل الخط</small>` : `<strong>تتفعّل فورًا ${p.face ? 'وتختفي' : 'وتبقى'}</strong><div class="preview-totals">${stat(projected.summary.hits, 'swords')}${stat(projected.summary.block, 'shield')}${stat(projected.summary.enemyDamage, 'heart')}</div><small>بطاقة واحدة في الدور</small>` : animation ? '<strong>تُفعّل البطاقات ثم تُزال</strong>' : `<strong>${p.card ? 'اختر خانة فارغة' : 'اختر بطاقة ووجهًا'}</strong><small>صف ٣ · عمود ٢ · الدائم يبقى</small>`}</div>
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
export function gameView(s, p, animation = null) {
  const projected = animation ? null : preview(s, p);
  return `<main class="duel-app" data-version="9">${header(s)}<div class="main-stage">${arena(s, p, projected)}${board(s, p, projected, animation)}</div>${hand(s, p, projected, !!animation)}${rotationHint()}</main>`;
}
export function titleView(s) { return `<main class="landing">${slice(4, 76, 1136, 552, 'landing-scene')}<div class="landing-paper"><span class="eyebrow">ملحمة الصعاليك</span><h1>الشنفرى</h1><p>بطاقة واحدة في الدور، تتفعّل فورًا. أكمل خطًا لتفعيل الدائم مجددًا.</p>${button(fullscreenSupported() ? 'العب بملء الشاشة' : 'ابدأ المواجهة', 'start', 'gold-button')}<small>صفّان × ٣ خانات · أربعة لقاءات</small></div>${rotationHint()}</main>`; }
export function rewardView(s) { return `<main class="screen-panel"><h1>حُسمت المواجهة</h1><p>اختر بطاقة جديدة · تستعيد ${stat(Math.min(6, s.maxHp - s.hp), 'heart')}</p><div class="reward-cards">${s.draftChoices.map(key => `<article class="reward-card"><h2>${esc(cards[key].name)}</h2>${cardArt(key + '.reward', s, 'reward-art')}<div><b>دائم</b>${effectFormula(key + '.reward', s, 0)}</div><div><b>طارئ</b>${effectFormula(key + '.reward', s, 1)}</div>${button('اختر البطاقة', 'draft-' + key, 'gold-button')}</article>`).join('')}</div>${button('أكمل بدون بطاقة', 'continue', 'text-button')}${rotationHint()}</main>`; }
export function endView(s) { return `<main class="screen-panel end-screen"><h1>${s.outcome === 'victory' ? 'انتصار الشنفرى' : s.outcome === 'exhausted' ? 'استُنفدت الأوراق' : 'انتهت المواجهة'}</h1><p>${s.outcome === 'victory' ? 'هزمت خصومك في اللقاءات الأربعة.' : s.outcome === 'exhausted' ? 'لم تبق بطاقات هجومية متاحة.' : 'جرّب مزج الصدّ والهجوم في الخط نفسه.'}</p>${button('العب من جديد', 'restart', 'gold-button')}${rotationHint()}</main>`; }
