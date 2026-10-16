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
  enemyCell,
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
      const bonus = s ? Math.floor(s.momentum / 2) : 0;
      if (bonus > 0) {
        bits.push(stsStat('bow', num(f.n + bonus), `+${num(bonus)}🔥`, 'stat-attack bow-boosted'));
      } else {
        bits.push(stsStat('bow', num(f.n), '+🔥', 'stat-attack'));
      }
    }
    if (f.op === 'cyclone_shot') {
      const bonus = s ? s.momentum : 0;
      if (bonus > 0) {
        bits.push(stsStat('bow', num(f.n + bonus), `+${num(bonus)}🔥🔥`, 'stat-attack bow-boosted'));
      } else {
        bits.push(stsStat('bow', num(f.n), '+🔥🔥', 'stat-attack'));
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

// One battlefield: actors occupy the board visually; cards occupy its action slots.
function fighterArt(kind) {
  return `<span class="fighter-art fighter-${kind}" aria-hidden="true"></span>`;
}

function battleHeader(s) {
  const enc = ENCOUNTERS[s.encounter - 1];
  return `<header class="battle-header">
    <div class="battle-heading"><span class="battle-eyebrow">طريق السَّراة · ${num(s.encounter)} / ٤</span><h1>${esc(enc.name)}</h1></div>
    <div class="battle-tools">${button('؟', 'help', 'battle-tool', false, 'كيف ألعب؟')}${button(icon(isMuted() ? 'mute' : 'sound'), 'toggle-audio', 'battle-tool', false, 'تبديل الصوت')}${button('⋯', 'menu', 'battle-tool', false, 'القائمة')}</div>
  </header>
  <div class="journey-strip"><span>${icon('moon')} للفجر <b>${num(Math.max(0, 37 - s.turn))}</b> دورًا</span><span class="journey-track"><i style="width:${Math.min(100, s.progress / goal(s) * 100)}%"></i></span><span>${icon('foot')} المأمن <b>${num(s.progress)} / ${num(goal(s))}</b></span></div>`;
}

function renderBattleBoard(s, p, projected) {
  const prepared = p.card && p.cell !== null ? stage(s, p) : null;
  const grid = prepared?.grid || s.grid;
  const shown = { ...s, faces: { ...s.faces, ...prepared?.faces } };
  const line = p.cell !== null && p.axis ? lineIndices(p.cell, p.axis) : [];
  const target = targetForAction(s, p);
  const pool = attackTargets(s);
  const living = s.enemies.filter(e => e.hp > 0);
  const targetIndex = s.enemies.findIndex(e => e.id === target);
  const targetCell = enemyCell(targetIndex);
  const originCell = p.cell === targetCell ? 7 : p.cell;
  const point = cell => [((cell % 3) * 100) + 50, Math.floor(cell / 3) * 100 + 50];
  const [tx, ty] = point(targetCell);
  const [sx, sy] = point(originCell ?? 7);
  const forecastHp = projected?.state.hp ?? s.hp;
  const collapse = collapseRow(s);

  return `<section class="battle-stage" aria-label="ساحة المعركة وشبكة الأفعال">
    <div class="battle-legend"><span>${icon('swords')} اضغط العدو لتحديد الهدف</span><span>شبكة القتال <b>٣ × ٣</b></span></div>
    <div class="combat-grid" role="group" aria-label="رقعة المعركة، تسع خانات">
      ${grid.map((uid, cell) => {
        const c = uid ? def(uid, shown) : null;
        const enemyIndex = s.enemies.findIndex((e, i) => enemyCell(i) === cell);
        const enemy = s.enemies[enemyIndex];
        const actor = enemy || cell === 7;
        const staged = p.cell === cell;
        let actorHtml = '';
        if (enemy) {
          const intent = getEnemyIntent(enemy, enemyIndex, s.phaseTurn, living.length === 1);
          const after = projected?.state.enemies[enemyIndex]?.hp ?? enemy.hp;
          const lost = Math.max(0, enemy.hp - after);
          const locked = enemy.hp > 0 && !pool.some(e => e.id === enemy.id);
          const kind = /hound/.test(enemy.id) ? 'wolf' : /sniper|scout/.test(enemy.id) ? 'archer' : 'guard';
          actorHtml = `<button type="button" class="board-fighter enemy-fighter ${target === enemy.id ? 'is-target' : ''} ${enemy.hp <= 0 ? 'is-fallen' : ''} ${after <= 0 && enemy.hp > 0 ? 'will-fall' : ''}" data-target="${enemy.id}" ${enemy.hp <= 0 || locked ? 'disabled' : ''} aria-pressed="${target === enemy.id}" aria-label="${esc(enemy.name)}، صحة ${num(enemy.hp)}، ${locked ? 'يحميه حاملو التراس' : esc(intent.desc)}">
            <span class="fighter-intent">${locked ? icon('shield') + ' محمي' : enemy.hp <= 0 ? 'صريع' : intent.damage ? icon('swords') + ' ' + num(intent.damage) : icon('spark') + ' تأهّب'}</span>
            ${fighterArt(kind)}
            <span class="fighter-name">${esc(enemy.name.replace(/\s*\(.*\)/, ''))}</span>
            <span class="fighter-health"><i class="health-before" style="width:${enemy.hp / enemy.maxHp * 100}%"></i><i style="width:${after / enemy.maxHp * 100}%"></i><b>${num(after)} / ${num(enemy.maxHp)}</b></span>
            ${lost ? `<span class="impact-number">−${num(lost)}</span>` : ''}
            ${target === enemy.id && enemy.hp > 0 ? '<span class="target-mark">الهدف</span>' : ''}
          </button>`;
        } else if (cell === 7) {
          actorHtml = `<div class="board-fighter hero-fighter">${fighterArt('hero')}<span class="fighter-name">الشَّنْفَرَى</span><span class="fighter-health"><i class="health-before" style="width:${s.hp / s.maxHp * 100}%"></i><i style="width:${forecastHp / s.maxHp * 100}%"></i><b>${num(forecastHp)} / ${num(s.maxHp)}</b></span>${projected?.summary.block ? `<span class="hero-block">${icon('shield')}${num(projected.summary.block)}</span>` : ''}</div>`;
        }
        return `<div class="battle-tile ${actor ? 'has-fighter' : ''} ${line.includes(cell) ? 'in-path' : ''} ${staged ? 'is-staged' : ''} ${collapse === Math.floor(cell / 3) ? 'will-collapse' : ''}">
          <span class="tile-number" aria-hidden="true">${num(cell + 1)}</span>
          <button type="button" data-cell="${cell}" class="tile-action ${c ? 'has-card ' + (ARCHETYPES[c.build]?.class || '') : ''}" aria-pressed="${staged}" aria-label="خانة ${num(cell + 1)}، ${c ? esc(c.name) : 'ضع بطاقة هنا'}" ${!uid && !p.card ? 'disabled' : ''}>
            ${c ? `<span class="action-token">${icon(c.icon)}<span>${esc(c.name)}</span><small>${esc(c.short)}</small>${staged ? '<b class="placement-tag">معاينة</b>' : ''}</span>` : `<span class="empty-action">${s.wards[cell] ? icon('cover') : trailCells.includes(cell) ? icon('foot') : '＋'}<small>${s.wards[cell] ? 'ساتر' : trailCells.includes(cell) ? 'درب +١' : p.card ? 'ضع هنا' : ''}</small></span>`}
          </button>
          ${actorHtml}
          ${line.includes(cell) ? `<span class="path-order">${num(line.indexOf(cell) + 1)}</span>` : ''}
        </div>`;
      }).join('')}
      ${projected && (projected.summary.hits || 0) > 0 && targetIndex >= 0 ? `<svg class="attack-route" viewBox="0 0 300 300" aria-hidden="true"><defs><marker id="attack-tip" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="none" stroke="currentColor" stroke-width="1.5"/></marker></defs><path d="M${sx},${sy} Q${sx + (sx === tx ? 28 : 0)},${ty + 60} ${tx},${ty + 20}" marker-end="url(#attack-tip)"/></svg>` : ''}
    </div>
    <div class="board-context" role="status">${collapse !== null ? `<span class="collapse-note">${icon('stone')} صف ${num(collapse + 1)} ينهار بعد الدور</span>` : `<span>${icon('shield')} هجوم الأعداء القادم: <b>${num(incoming(s))}</b></span>`}<span>${s.relics.map(r => `<span title="${esc(RELICS[r]?.desc || '')}">${icon(RELICS[r]?.icon || 'spark')}</span>`).join('')}</span></div>
  </section>`;
}

function axisChoices(s, p) {
  if (!p.card || p.cell === null) return `<div class="planning-hint">${p.card ? `${esc(def(p.card, s, p.face ?? 0).name)} · اختر خانة لوضعها` : '١ اختر بطاقة · ٢ ضعها في الرقعة · ٣ فعّل خطّها'}</div>`;
  return `<div class="axis-choices" aria-label="قارن الصف والعمود">${['row', 'col'].map(axis => {
    const result = preview(s, p, axis);
    if (!result) return '';
    return `<button type="button" data-axis="${axis}" aria-pressed="${p.axis === axis}" class="axis-choice ${p.axis === axis ? 'is-selected' : ''}"><strong>${axis === 'row' ? '↔ الصف' : '↕ العمود'}</strong><span>${icon('swords')}${num(result.summary.hits || 0)} ${icon('shield')}${num(result.summary.block || 0)} ${icon('foot')}${num(result.summary.moves || 0)}</span>${result.state.hp < s.hp ? `<small class="axis-cost">−${num(s.hp - result.state.hp)} صحة</small>` : '<small>بلا خسارة صحة</small>'}</button>`;
  }).join('')}</div>`;
}

function renderBattleHand(s, p, projected) {
  const chosen = p.card ? def(p.card, s, p.face ?? 0) : null;
  const hpLoss = projected ? Math.max(0, s.hp - projected.state.hp) : 0;
  return `<section class="battle-hand" aria-label="بطاقاتك وتخطيط الحركة">
    ${axisChoices(s, p)}
    <div class="hand-heading"><span>بطاقاتك <b>${num(s.hand.length)}</b></span>${chosen ? button('شرح البطاقة', 'card-info', 'card-info-button') : '<small>الدائم يبقى · الطارئ يُطرح</small>'}</div>
    <div class="battle-cards">${s.hand.map(uid => {
      const face = p.card === uid ? p.face ?? 0 : s.faces?.[uid] ?? 0;
      const c = def(uid, s, face);
      return `<div class="battle-card ${ARCHETYPES[c.build]?.class || ''} ${p.card === uid ? 'is-selected' : ''}" data-card-frame="${uid}">
        <button type="button" class="card-face-toggle" data-action="flip-card" data-card="${uid}" aria-label="تبديل وجه ${esc(c.name)}" title="${esc(c.text)}">${face === 0 ? 'دائم' : 'طارئ'} ${icon('swap')}</button>
        <button type="button" data-card="${uid}" data-face="${face}" aria-pressed="${p.card === uid}" class="hand-card-main" aria-label="${esc(c.name + '، ' + c.text)}"><span class="hand-card-icon">${icon(c.icon)}</span><strong>${esc(c.name)}</strong><span class="hand-card-effects">${cardEffects(uid, s, face)}</span></button>
      </div>`;
    }).join('')}</div>
    <div class="battle-commit"><div class="commit-result" role="status">${projected ? projected.state.hp <= 0 ? '<b class="danger-text">هذه الحركة تنهي رحلتك</b>' : hpLoss ? `<b class="danger-text">−${num(hpLoss)} صحة</b>` : `<b>${projected.state.hp > s.hp ? '+' + num(projected.state.hp - s.hp) + ' صحة' : 'صحتك آمنة'}</b>` : '<b>خطّط حركتك</b>'}<small>${projected ? 'النتيجة معروضة على الشخصيات' : 'المس الشخصية لاختيار الهدف'}</small></div>${button(p.card ? 'إلغاء' : '؟', p.card ? 'cancel' : 'help', 'battle-cancel', false, p.card ? 'إلغاء الاختيار' : 'دليل اللعب')}${button(projected ? 'نفّذ ' + (p.axis === 'row' ? 'الصف ↔' : 'العمود ↕') : p.card ? 'اختر خانة' : 'اختر بطاقة', 'activate', 'battle-execute', !projected)}</div>
  </section>`;
}

export function gameView(s, p, feedback = '') {
  const projected = preview(s, p);
  return `<div class="battlefield-app">${battleHeader(s)}${renderBattleBoard(s, p, projected)}${renderBattleHand(s, p, projected)}${feedback ? `<div class="battle-notice tactical-toast" role="status">${esc(feedback)}</div>` : ''}</div>`;
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
        <p class="gold-subtitle">ساحة واحدة · تسع خانات · قرارك يصنع النصر</p>
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

