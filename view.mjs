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

// Planning desk: compact board, persistent axis comparison, and both card faces.
function fighterArt(kind) {
  return `<span class="fighter-art fighter-${kind}" aria-hidden="true"></span>`;
}

function battleHeader(s, projected) {
  const hp = projected?.state.hp ?? s.hp;
  const enc = ENCOUNTERS[s.encounter - 1];
  return `<header class="planner-header">
    <div class="hero-identity"><span class="hero-portrait">${fighterArt('hero')}</span><span class="hero-vitals">${icon('heart')} ${ratio(hp, s.maxHp)}</span><span class="chapter-diamonds" aria-label="المعبر ${num(s.encounter)} من أربعة">${[1,2,3,4].map(i => `<i class="${i <= s.encounter ? 'complete' : ''}"></i>`).join('')}</span></div>
    <div class="planner-tools">${button('؟', 'help', 'planner-tool', false, 'دليل اللعب')}${button(icon(isMuted() ? 'mute' : 'sound'), 'toggle-audio', 'planner-tool', false, 'تبديل الصوت')}${button('⋯', 'menu', 'planner-tool', false, 'القائمة')}</div>
  </header>
  <div class="planner-route"><span>${esc(enc.name)}</span><span>${icon('moon')} ${num(Math.max(0, 37 - s.turn))} دورًا <b>·</b> ${icon('foot')} ${num(s.progress)} / ${num(goal(s))}</span></div>`;
}

function enemyStrip(s, p, projected) {
  const target = targetForAction(s, p);
  const pool = attackTargets(s);
  const living = s.enemies.filter(e => e.hp > 0);
  return `<section class="enemy-strip" aria-label="الأعداء ونواياهم">${s.enemies.map((enemy, index) => {
    const intent = getEnemyIntent(enemy, index, s.phaseTurn, living.length === 1);
    const after = projected?.state.enemies[index]?.hp ?? enemy.hp;
    const lost = Math.max(0, enemy.hp - after);
    const locked = enemy.hp > 0 && !pool.some(e => e.id === enemy.id);
    const kind = /hound/.test(enemy.id) ? 'wolf' : /sniper|scout/.test(enemy.id) ? 'archer' : 'guard';
    return `<button type="button" class="enemy-summary ${target === enemy.id ? 'is-target' : ''} ${enemy.hp <= 0 ? 'is-fallen' : ''}" data-target="${enemy.id}" aria-pressed="${target === enemy.id}" ${enemy.hp <= 0 || locked ? 'disabled' : ''} aria-label="${esc(enemy.name)}، صحة ${num(enemy.hp)}، ${locked ? 'محمي بحاملي التراس' : esc(intent.desc)}">
      ${fighterArt(kind)}<span class="enemy-summary-data"><span class="enemy-intent">${locked ? icon('shield') + ' محمي' : enemy.hp <= 0 ? 'صريع' : icon(intent.damage ? 'swords' : 'spark') + ' ' + (intent.damage ? num(intent.damage) : 'تأهّب')}${lost ? `<b class="forecast-hit">−${num(lost)}</b>` : ''}</span><span class="enemy-name">${esc(enemy.name.replace(/\s*\(.*\)/, ''))}</span><span class="fighter-health"><i class="health-before" style="width:${enemy.hp / enemy.maxHp * 100}%"></i><i style="width:${after / enemy.maxHp * 100}%"></i><b>${num(after)} / ${num(enemy.maxHp)}</b></span></span>
    </button>`;
  }).join('')}</section>`;
}

function renderBattleBoard(s, p, projected) {
  const prepared = p.card && p.cell !== null ? stage(s, p) : null;
  const grid = prepared?.grid || s.grid;
  const shown = { ...s, faces: { ...s.faces, ...prepared?.faces } };
  const line = p.cell !== null && p.axis ? lineIndices(p.cell, p.axis) : [];
  const target = targetForAction(s, p);
  const collapse = collapseRow(s);
  return `<section class="battle-stage" aria-label="شبكة التخطيط">
    <div class="engraved-heading"><span>الشَّبَكَة</span></div>
    <div class="combat-grid" role="group" aria-label="رقعة التخطيط، تسع خانات">
    ${grid.map((uid, cell) => {
      const c = uid ? def(uid, shown) : null;
      const staged = p.cell === cell;
      return `<div class="battle-tile ${line.includes(cell) ? 'in-path' : ''} ${staged ? 'is-staged' : ''} ${collapse === Math.floor(cell / 3) ? 'will-collapse' : ''}">
        <button type="button" data-cell="${cell}" class="tile-action ${c ? 'has-card card-' + c.build : ''}" aria-pressed="${staged}" aria-label="خانة ${num(cell + 1)}، ${c ? esc(c.name) : 'ضع بطاقة هنا'}" ${!uid && !p.card ? 'disabled' : ''}>
          ${c ? `<span class="action-token token-${c.build}">${icon(c.icon)}<small>${esc(c.short)}</small></span>` : `<span class="empty-action">${s.wards[cell] ? icon('cover') : trailCells.includes(cell) ? icon('foot') : '◇'}<small>${s.wards[cell] ? 'ساتر' : trailCells.includes(cell) ? 'درب' : p.card ? '＋' : ''}</small></span>`}
        </button>
        ${line.includes(cell) ? `<span class="path-order">${num(line.indexOf(cell) + 1)}</span>` : ''}
      </div>`;
    }).join('')}</div>
    <div class="board-context">${collapse !== null ? `${icon('stone')} الصف ${num(collapse + 1)} ينهار بعد الدور` : p.card ? 'اختر موضعًا، ثم قارن الصف والعمود' : 'اختر بطاقة أو أحد وجهيها للتخطيط'}</div>
  </section>`;
}

function axisChoices(s, p) {
  const ready = p.card && p.cell !== null;
  return `<section class="forecast-section" aria-label="توقع الضرر"><div class="engraved-heading"><span>تَوَقُّع الضَّرَر</span></div><div class="axis-choices">${['row', 'col'].map(axis => {
    const result = ready ? preview(s, p, axis) : null;
    return `<button type="button" data-axis="${axis}" aria-pressed="${!!result && p.axis === axis}" class="axis-choice ${result && p.axis === axis ? 'is-selected' : ''}" ${result ? '' : 'disabled'}>
      <span class="axis-label"><b class="direction-arrow">${axis === 'row' ? '⟷' : '↑'}</b><strong>${axis === 'row' ? 'أفقي' : 'عمودي'}</strong></span>
      <span class="axis-totals"><span>${icon('swords')} <b>${result ? num(result.summary.hits || 0) : '—'}</b></span><span>${icon('shield')} <b>${result ? num(result.summary.block || 0) : '—'}</b></span></span>
      <small class="${result && result.state.hp < s.hp ? 'axis-cost' : ''}">${result ? result.state.hp < s.hp ? '−' + num(s.hp - result.state.hp) + ' صحة' : 'بلا خسارة صحة' : 'اختر موضع البطاقة'}</small>
    </button>`;
  }).join('')}</div></section>`;
}

function renderBattleHand(s, p, projected) {
  const uid = p.card || s.hand[0];
  const hpLoss = projected ? Math.max(0, s.hp - projected.state.hp) : 0;
  return `<section class="battle-hand" aria-label="البطاقات ووجها البطاقة المختارة">
    <div class="hand-title"><div class="engraved-heading"><span>البِطَاقَات</span></div><div class="hand-controls">${p.card ? button('×', 'cancel', 'cancel-selection', false, 'إلغاء الاختيار') + button('ⓘ', 'card-info', 'card-info-button', false, 'شرح وجهي البطاقة') : ''}</div></div>
    <div class="card-tabs" role="group" aria-label="اختر بطاقة من يدك">${s.hand.map(card => {
      const face = p.card === card ? p.face ?? 0 : s.faces?.[card] ?? 0;
      const c = def(card, s, face);
      return `<button type="button" data-card="${card}" data-face="${face}" class="card-tab tab-${c.build} ${card === uid ? 'is-selected' : ''}" aria-pressed="${p.card === card}" aria-label="${esc(c.name)}"><span class="tab-art">${icon(c.icon)}</span><small>${esc(c.name)}</small></button>`;
    }).join('')}</div>
    <div class="expanded-card" aria-label="وجها البطاقة">${uid ? [0, 1].map(face => {
      const c = def(uid, s, face);
      const active = p.card === uid && p.face === face;
      return `<button type="button" class="card-face-panel face-${face} ${active ? 'is-active' : ''}" data-card="${uid}" data-face="${face}" aria-pressed="${active}" aria-label="${face === 0 ? 'تأثير دائم' : 'تأثير فوري'}: ${esc(c.name + '، ' + c.text)}">
        <span class="face-heading">${face === 0 ? 'تأثير دائم' : 'تأثير فوري'}${active ? '<b>✓</b>' : ''}</span>
        <span class="face-content"><span class="face-large-icon">${icon(c.icon)}</span><span class="face-content-text"><strong>${esc(c.name)}</strong><span class="face-effect-summary">${cardEffects(uid, s, face)}</span></span></span>
        <span class="face-description">${esc(c.short)}</span>
      </button>`;
    }).join('') : '<p>لا بطاقات في اليد</p>'}</div>
    <div class="sr" role="status">${projected ? projected.state.hp <= 0 ? 'هذه الحركة تنهي رحلتك' : hpLoss ? `ستفقد ${num(hpLoss)} صحة` : 'صحتك آمنة هذا الدور' : 'اختر وجه البطاقة ثم موضعًا في الشبكة'}</div>
    ${button(projected ? '▶︎ نَفِّذ ' + (p.axis === 'row' ? 'الصف' : 'العمود') : '▶︎ نَفِّذ', 'activate', 'planner-execute', !projected)}
  </section>`;
}

function momentumMeter(s, projected) {
  const m = projected?.summary.momentum;
  const shots = projected?.summary.effects.filter(f => f.op === 'sniper' || f.op === 'cyclone_shot') || [];
  return `<section class="momentum-meter" aria-label="رصيد الزخم" aria-live="polite">
    <div class="momentum-balance">${icon('fire')}<span>الزخم الآن<strong data-momentum-current>${num(s.momentum)}</strong></span></div>
    <div class="momentum-plan">${m ? `<span>ستجمع <b>${num(m.gained)}</b> · ستصرف <b>${num(m.spent)}</b> · سيبقى <b data-momentum-after>${num(m.after)}</b></span>${shots.map(f => `<small>سهم الخانة ${num(f.cell + 1)}: ${num(f.amount)} أساس + ${num(f.momentumSpent)} زخم${(f.boost || 0) > f.momentumSpent ? ` + ${num(f.boost - f.momentumSpent)} تعزيز` : ''} = <b>${num(f.amount + (f.boost || 0))} ضرر</b></small>`).join('')}` : '<span>كل ١ زخم = +١ ضرر للسهم</span><small>يبقى للدور التالي حتى يصرفه سهم.</small>'}</div>
  </section>`;
}

function learningGuide(s) {
  if (s.encounter === 1) {
    const example = s.phaseTurn === 1 && s.hand.includes('arrow.0') && s.grid[0] === 'run.0' && !s.grid[1];
    return `<aside class="learning-guide"><strong>الدرس الأول: الزخم يقوّي السهم</strong><span>ركض يجمع ٢ زخم، ثم السهم: ٢ أساس + ٢ زخم = ٤ ضرر. يصرف السهم الرصيد كاملًا.</span>${example ? '<button data-action="momentum-example">جرّب المثال</button>' : '<small>نفّذ الركض قبل السهم في الخط نفسه. الأرقام على الخانات تبين الترتيب.</small>'}</aside>`;
  }
  return `<details class="learning-guide"><summary>كيف يعمل النهش والزخم؟</summary><p>كل ١ زخم = +١ ضرر للسهم. أول سهم يصرف الرصيد كاملًا. إن لم تطلق سهمًا يبقى رصيدك للدور التالي، ويُصفّر عند بدء مواجهة جديدة.</p><p>النهش (وجه الذئب الطارئ): ٤ ضرر عادةً، أو ٦ إذا كان هناك نزيف أو سم. مثال: فعّل وجه السكين الطارئ أولًا لإحداث النزيف، ثم الذئب في الخط نفسه. بطاقة الذئب الطارئة تُطرح بعد التنفيذ.</p></details>`;
}

export function gameView(s, p, feedback = '') {
  const projected = preview(s, p);
  return `<div class="battlefield-app planner-app">${battleHeader(s, projected)}${momentumMeter(s, projected)}${enemyStrip(s, p, projected)}${learningGuide(s)}${renderBattleBoard(s, p, projected)}${axisChoices(s, p)}${renderBattleHand(s, p, projected)}${feedback ? `<div class="battle-notice tactical-toast" role="status">${esc(feedback)}</div>` : ''}</div>`;
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

