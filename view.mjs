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
  getEnemyIntent
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
  const result = activate(s, { card: p.card, cell: p.cell, axis, face: p.face ?? 0 });
  return result.valid ? result : null;
}

export function bestAxis(s, card, cell, face = 0) {
  if (!card || cell === null) return 'row';
  const rowRes = activate(s, { card, cell, axis: 'row', face: face ?? 0 });
  const colRes = activate(s, { card, cell, axis: 'col', face: face ?? 0 });
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

// -------------------------------------------------------------
// Top Navigation & Journey Bar (Unified HUD)
// -------------------------------------------------------------
function renderTopBar(s) {
  const enc = ENCOUNTERS[s.encounter - 1] || ENCOUNTERS[0];
  const threat = incoming(s);

  return `
    <header class="top-bar">
      <!-- 1. Encounter Badge -->
      <div class="encounter-badge">
        <span class="enc-dot"></span>
        <strong>المعبر ${num(enc.index)}: ${enc.name}</strong>
      </div>

      <!-- 2. Dawn & Threat Center HUD -->
      <div class="top-center-hud">
        <span class="dawn-tag dawn-dial ${s.turn >= 30 ? 'danger' : ''}">${icon('moon')} <b>${num(36 - s.turn)} دوراً</b></span>
        ${threat > 0 ? `<span class="threat-tag">${icon('swords')} <b>${num(threat)}</b></span>` : ''}
      </div>

      <!-- 3. Top Quick Actions & Relics -->
      <div class="top-actions">
        ${s.relics.map(rKey => {
          const r = RELICS[rKey];
          return `<span class="relic-chip" title="${esc(r?.title || '')}">${icon(r?.icon || 'spark')}</span>`;
        }).join('')}
        ${button('؟', 'help', 'icon-btn help-btn', false, 'دليل اللعب السريع')}
        ${button(isMuted() ? icon('mute') : icon('sound'), 'toggle-audio', 'icon-btn', false, 'الصوت')}
        ${button('⋯', 'menu', 'icon-btn menu-btn', false, 'القائمة')}
      </div>
    </header>
  `;
}

// -------------------------------------------------------------
// Left Side (55%): The Live Cinematic Arena (Pure Scenic Landscape)
// -------------------------------------------------------------
function renderCinematicArena(s, projected, p = {}) {
  return `
    <section class="cinematic-arena">
      <!-- 1. The Living Gorge Field: Enemies Standing Openly in the Terrain -->
      <div class="enemy-squad squad-size-${s.enemies.length}" aria-label="أعداء بني سلامان ونواياهم">
        ${s.enemies.map((e, idx) => {
          const living = s.enemies.filter(x => x.hp > 0);
          const isSolo = living.length === 1;
          const intent = getEnemyIntent(e, idx, s.phaseTurn, isSolo);
          const intentIcon = intent.intent === 'defend' ? 'shield' : intent.intent === 'scheme' ? 'spark' : intent.intent === 'lunge' ? 'swords' : 'knife';
          const isDead = e.hp <= 0;

          // Projected Impact
          const projEnemy = projected?.state?.enemies?.[idx];
          const projHp = projEnemy !== undefined ? projEnemy.hp : e.hp;
          const dmgTaken = Math.max(0, e.hp - projHp);
          const willDie = !isDead && projHp <= 0;

          return `
            <div class="enemy-actor ${isDead ? 'defeated' : ''} ${e.isBoss ? 'boss-actor' : ''} ${dmgTaken > 0 ? 'taking-preview-hit' : ''}">
              <!-- STS Floating Intent Icon -->
              <div class="enemy-intent-crest enemy-intent-badge intent-${intent.intent}" title="${intent.desc}">
                ${!isDead ? (intent.damage > 0 
                  ? `${icon(intentIcon)}<b>${num(intent.damage)}</b>` 
                  : `${icon(intentIcon)}<b>${intent.intent === 'defend' ? 'درع' : 'مكر'}</b>`
                ) : '<span class="dead">صريع</span>'}
              </div>

              <!-- Enemy Plate: Name + HP Bar + Ghost Damage Forecast -->
              <div class="enemy-crest-body">
                <div class="enemy-head">
                  <span class="enemy-name">${e.name}</span>
                  ${dmgTaken > 0 ? `<b class="preview-dmg-tag">-${num(dmgTaken)} 💥</b>` : ''}
                </div>
                <div class="enemy-hp-track">
                  <i class="hp-fill" style="width:${(projHp / e.maxHp) * 100}%"></i>
                  ${dmgTaken > 0 ? `<i class="hp-ghost" style="width:${(e.hp / e.maxHp) * 100}%"></i>` : ''}
                  <span class="hp-num">${willDie ? '<b class="kill-tag">صريع!</b>' : ratio(projHp, e.maxHp)}</span>
                </div>
                ${(s.bleed > 0 || s.poison > 0) && !isDead ? `
                  <div class="status-chips">
                    ${s.bleed > 0 ? `<span class="chip bleed">${icon('bleed')} <b>${num(s.bleed)}</b></span>` : ''}
                    ${s.poison > 0 ? `<span class="chip poison">${icon('poison')} <b>${num(s.poison)}</b></span>` : ''}
                  </div>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- 2. Ambient Outlaw Line: Sleek footer strip for Shanfara with Real-Time Defense Forecast -->
      <div class="hero-vanguard-bar">
        <div class="hero-plate">
          <span class="hero-ico">${icon('bow')}</span>
          <div class="hero-hp-wrap">
            <span class="hero-name">الشَّنْفَرَى</span>
            <div class="hero-hp-bar">
              <i style="width:${((projected ? projected.state.hp : s.hp) / s.maxHp) * 100}%"></i>
              <span>${ratio(projected ? projected.state.hp : s.hp, s.maxHp)}</span>
            </div>
          </div>
          ${projected?.summary?.block ? `<span class="proj-block-tag">${icon('shield')} <b>+${num(projected.summary.block)}</b></span>` : ''}
          ${s.momentum > 0 ? `
            <span class="momentum-tag" title="زخم حركي: يتحول إلى دروع نهاية الدور أو يضاعف رميات القوس">
              ${icon('fire')} <b>${num(s.momentum)}</b> <small class="mom-convert">➔ +${num(s.momentum * (s.relics.includes('sandals') ? 2 : 1))}🛡️</small>
            </span>
          ` : ''}
        </div>

        <div class="center-turn-banner">
          ${p.axis ? `
            <span class="staged-action-banner">
              نفّذ ${p.axis === 'row' ? 'الصف ↔' : 'العمود ↕'} 
              <small>(${projected?.summary?.hits ? `💥 ${num(projected.summary.hits)}` : ''} ${projected?.summary?.block ? `🛡️ ${num(projected.summary.block)}` : ''} ${projected?.summary?.moves ? `👟 ${num(projected.summary.moves)}` : ''})</small>
            </span>
          ` : p.cell !== null ? `
            <span class="guide-step">الخطوة ٣: حدّد الصف (↔) أو العمود (↕) للتنفيذ</span>
          ` : p.card ? `
            <span class="guide-step">الخطوة ٢: المس خانة فارغة (＋) في الصخرة</span>
          ` : `
            <span class="guide-step">الخطوة ١: اختر بطاقة من يدك للبدء</span>
          `}
        </div>

        <div class="haven-mini-tag">
          <small>المأمن</small>
          <b>${num(goal(s) - (projected ? projected.state.progress : s.progress))}</b>
          ${projected?.summary?.moves ? `<small class="haven-gain">+${num(projected.summary.moves)}</small>` : ''}
        </div>
      </div>
    </section>
  `;
}

// -------------------------------------------------------------
// Right Side (45%): 3x3 Basalt Nexus Altar (شبكة التدبير)
// -------------------------------------------------------------
function renderNexusAltar(s, p, projected, model) {
  const prepared = p.axis ? stage(s, { card: p.card, cell: p.cell, axis: p.axis, face: p.face ?? 0 }) : null;
  const staged = prepared?.grid || s.grid.slice();
  if (!prepared && p.cell !== null && p.card) staged[p.cell] = p.card;

  const shown = { ...s, faces: { ...s.faces, ...prepared?.faces, ...(p.card ? { [p.card]: p.face ?? 0 } : {}) } };
  const indices = p.cell !== null && p.axis ? lineIndices(p.cell, p.axis) : [];

  return `
    <section class="nexus-altar">
      <div class="altar-slab">
        <div class="slab-header">
          <div class="crest-wings"></div>
          <h3>شَبَكَةُ التَّدْبِير <small>٣×٣</small></h3>
          <span class="slab-instruction">
            ${!p.card ? 'اختر فعلاً من يدك' : p.cell === null ? 'المس خانة فارغة في الصخرة' : 'حدّد الصف أو العمود للتنفيذ'}
          </span>
        </div>

        <!-- 3x3 Grid Matrix with Molten Gold Channels & Golden Lightning Arcs -->
        <div class="matrix-grid ${p.axis ? `axis-${p.axis}` : ''}">
          ${staged.map((uid, i) => {
            const c = uid ? def(uid, shown) : null;
            const b = c?.build || 'general';
            const isStaged = p.cell === i;
            const inLine = indices.includes(i);
            const isTrail = !uid && trailCells.includes(i);
            const isWard = !uid && s.wards[i];
            const arch = ARCHETYPES[b] || ARCHETYPES.general;

            return `
              <div
                data-cell="${i}"
                role="button"
                tabindex="${!uid && !p.card ? '-1' : '0'}"
                class="matrix-cell ${uid ? `placed-card ${arch.class}` : 'empty-cell'} ${isStaged ? 'staged-cell' : ''} ${inLine ? 'active-line' : ''} ${isTrail ? 'trail-cell' : ''} ${isWard ? 'ward-cell' : ''}"
                aria-label="خانة ${num(i + 1)}${c ? `: ${esc(c.name)}` : '، فارغة'}"
                aria-pressed="${isStaged}"
              >
                ${inLine ? `<span class="order-badge">${num(indices.indexOf(i) + 1)}</span>` : ''}
                ${c ? `
                  <div class="card-miniature">
                    <span class="card-icon">${icon(c.icon)}</span>
                    <strong class="card-title">${c.name}</strong>
                    <div class="card-effects-mini">${cardEffects(uid, shown)}</div>
                  </div>
                ` : isTrail ? `
                  <div class="terrain-marker">${icon('foot')}<span>درب +١</span></div>
                ` : isWard ? `
                  <div class="terrain-marker ward">${icon('cover')}<span>ساتر</span></div>
                ` : `
                  <span class="plus-sign">＋</span>
                `}

                ${isStaged ? `
                  <div class="spatial-axis-controls">
                    <button type="button" data-axis="row" aria-pressed="${p.axis === 'row'}" class="axis-btn ${p.axis === 'row' ? 'selected' : ''}" title="تفعيل الصف">↔ صف</button>
                    <button type="button" data-axis="col" aria-pressed="${p.axis === 'col'}" class="axis-btn ${p.axis === 'col' ? 'selected' : ''}" title="تفعيل العمود">↕ عمود</button>
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>

        <!-- Combo Feedback and Action Preview -->
        <div class="altar-preview">
          ${model ? comboView(s, model) : `
            <div class="idle-prompt">
              ${p.card ? `<strong>${esc(def(p.card, s, p.face ?? 0).name)}</strong> · ${esc(def(p.card, s, p.face ?? 0).text)}` : 'اختر بطاقة، ثم خانة فارغة، وراجع النتيجة قبل التنفيذ.'}
            </div>
          `}
        </div>
      </div>
    </section>
  `;
}

// -------------------------------------------------------------
// Bottom Dock: Hand Fan, Momentum Gauge, End Turn Pommel
// -------------------------------------------------------------
function renderBottomDock(s, p, projected) {
  return `
    <footer class="bottom-dock">
      <!-- Hand Cards Fan: Single Active Face with Quick Flip -->
      <div class="hand-fan-tray" aria-label="أوراق التدبير في يدك">
        ${s.hand.map(uid => {
          const curFace = (p.card === uid && p.face !== undefined) ? p.face : (s.faces?.[uid] ?? 0);
          const c = def(uid, s, curFace);
          const altFace = curFace === 0 ? 1 : 0;
          const altC = def(uid, s, altFace);
          const isSel = p.card === uid;
          const arch = ARCHETYPES[c.build] || ARCHETYPES.general;

          return `
            <div class="fan-card ${arch.class} ${isSel ? 'selected' : ''}" data-card-frame="${uid}">
              <div class="card-header-bar">
                <span class="card-archetype-badge">${arch.tag || arch.name}</span>
                <button type="button" class="flip-face-btn" data-action="flip-card" data-card="${uid}" title="تبديل إلى: ${altC.name}">
                  ${curFace === 0 ? '🔄 طارئ' : '🔄 أصيل'}
                </button>
              </div>
              <button type="button" data-card="${uid}" data-face="${curFace}" aria-pressed="${isSel}" class="card-main-body ${isSel ? 'active' : ''}">
                <div class="face-title">
                  <span class="face-ico">${icon(c.icon)}</span>
                  <strong class="card-title-text">${c.name}</strong>
                  ${curFace === 1 ? '<span class="alt-pill">طارئ</span>' : ''}
                </div>
                <div class="face-effects">${cardEffects(uid, s, curFace)}</div>
              </button>
            </div>
          `;
        }).join('')}
      </div>

      <!-- End Turn / Commit Blade Button with Dynamic Live Metrics -->
      <div class="dock-actions">
        ${button(
          p.axis && projected ? `
            <div class="blade-content">
              ${projected ? `<div class="health-forecast ${projected.state.hp < s.hp ? 'at-risk' : ''}" role="status">${projected.state.hp <= 0 ? 'خطر: هذه الحركة تنهي رحلتك' : projected.state.hp < s.hp ? `ستفقد ${num(s.hp - projected.state.hp)} صحة` : projected.state.hp > s.hp ? `ستستعيد ${num(projected.state.hp - s.hp)} صحة` : 'صحتك آمنة هذا الدور'}</div>` : ''}
              <span class="blade-main-text">نفّذ ${p.axis === 'row' ? 'الصف ↔' : 'العمود ↕'}</span>
              <span class="blade-stats-preview">
                ${projected.summary.hits ? `<b>💥 ${num(projected.summary.hits)}</b>` : ''}
                ${projected.summary.block ? `<b>🛡️ ${num(projected.summary.block)}</b>` : ''}
                ${projected.summary.moves ? `<b>👟 ${num(projected.summary.moves)}</b>` : ''}
              </span>
            </div>
            <i class="blade-gem"></i>
          ` : `<span>${p.cell !== null ? 'حدّد الصف أو العمود' : p.card ? 'المس خانة بالصخرة' : 'اختر فعلاً'}</span><i class="blade-gem"></i>`,
          'activate',
          `end-turn-blade ${p.axis && projected ? 'blade-ready-pulse' : ''}`,
          !projected
        )}
        ${button('إلغاء', 'cancel', 'cancel-btn', !p.card)}
      </div>
    </footer>
  `;
}

// -------------------------------------------------------------
// Main Game View Assembler
// -------------------------------------------------------------
export function gameView(s, p, feedback = '') {
  const projected = preview(s, p);
  const model = projected
    ? comboModel(s, { card: p.card, cell: p.cell, axis: p.axis, face: p.face ?? 0 }, projected)
    : null;

  return `
    <div class="shanfara-widescreen-app">
      ${renderTopBar(s)}
      <main class="widescreen-battlefield">
        ${renderCinematicArena(s, projected, p)}
        ${renderNexusAltar(s, p, projected, model)}
      </main>
      ${renderBottomDock(s, p, projected)}
      ${feedback ? `<div class="tactical-toast" role="status">${esc(feedback)}</div>` : ''}
    </div>
  `;
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
        <p class="gold-subtitle">رن الصعاليك الكامل · المسرح المزدوج</p>
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
          ${button('قوانين البناءات والشبكة', 'rules', 'secondary')}
        </div>
      </div>
    </main>
  `;
}

