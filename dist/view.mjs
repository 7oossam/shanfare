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
  return activate(s, { card: p.card, cell: p.cell, axis, face: p.face ?? 0 });
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

const pill = (ico, label, cls = '') => `<span class="effect ${cls}">${icon(ico)}<span>${label}</span></span>`;

function cardEffects(uid, s, face) {
  const c = def(uid, s, face);
  const bits = [];
  for (const f of c.effects) {
    if (f.op === 'move') bits.push(pill('foot', 'تقدّم ' + num(f.n), 'move'));
    if (f.op === 'momentum') bits.push(pill('fire', 'زخم ' + num(f.n), 'momentum'));
    if (f.op === 'hit') bits.push(pill('knife', 'أصب ' + num(f.n), 'attack'));
    if (f.op === 'sniper') bits.push(pill('bow', 'قوس ' + num(f.n) + '+زخم', 'attack'));
    if (f.op === 'cyclone_shot') bits.push(pill('bow', 'إعصار ' + num(f.n) + '+كامل الزخم', 'attack'));
    if (f.op === 'hurt') bits.push(pill('heart', 'جرح ' + num(f.n), 'danger'));
    if (f.op === 'block') bits.push(pill('shield', 'صدّ ' + num(f.n), 'guard'));
    if (f.op === 'prime') bits.push(pill('spark', 'بعدي +' + num(f.n), 'setup'));
    if (f.op === 'bleed') bits.push(pill('bleed', 'نزف ' + num(f.n), 'bleed'));
    if (f.op === 'poison') bits.push(pill('poison', 'سم ' + num(f.n), 'poison'));
    if (f.op === 'double_bleed') bits.push(pill('bleed', 'مضاعفة النزف', 'bleed'));
    if (f.op === 'explode_bleed') bits.push(pill('bleed', 'تفجير النزف ×٢', 'attack'));
    if (f.op === 'wolf_pounce') bits.push(pill('wolf', 'نهش ' + num(f.n), 'beast'));
    if (f.op === 'ward') bits.push(pill('cover', 'ساتر لاحقاً', 'guard'));
    if (f.op === 'vanish') bits.push('<small class="vanish-badge">تُطرح</small>');
  }
  return bits.join('');
}

export function comboView(s, m) {
  return `
    <section class="combo-panel" aria-label="ترتيب الأفعال">
      <div class="combo-title">
        <span>الترتيب: ${m.steps.map((x, i) => `<b>${num(i + 1)}</b> ${esc(x.name)}`).join(' ← ')}</span>
        <span class="combo-totals">
          ${m.totals.moves ? pill('foot', '+' + num(m.totals.moves), 'move') : ''}
          ${m.totals.hits ? pill('swords', num(m.totals.hits) + ' ضرر', 'attack') : ''}
          ${m.totals.block ? pill('shield', num(m.totals.block) + ' صد', 'guard') : ''}
        </span>
      </div>
      ${m.links.map(l => `<div class="combo-link good">${esc(l.sources.map(x => (x.name || def(x.uid, s).name)).join(' + '))} ← ${esc((l.targetName || def(l.target, s).name))}: +${num(l.boost)} تقوية</div>`).join('')}
      ${m.expired.map(l => `<div class="combo-warning">${esc((l.name || def(l.uid, s).name))}: لا هجوم بعدها (+${num(l.amount)} تضيع)</div>`).join('')}
    </section>
  `;
}

// -------------------------------------------------------------
// Top Navigation & Journey Bar
// -------------------------------------------------------------
function renderTopBar(s) {
  const encIdx = s.encounter;
  return `
    <header class="top-bar">
      <!-- 1. Relics Tray -->
      <div class="relics-tray" aria-label="مواثيق الصحراء والآثار">
        ${['sandals', 'wolf_skin', 'crag_salaman', 'taabbata_bracer'].map(rKey => {
          const has = s.relics.includes(rKey);
          const r = RELICS[rKey];
          return `
            <div class="relic-socket ${has ? 'active' : 'empty'}" title="${esc(r.title)}: ${esc(r.desc)}">
              ${has ? `${icon(r.icon)}<span class="relic-label">${r.name}</span>` : `<span class="empty-socket">+</span>`}
            </div>
          `;
        }).join('')}
      </div>

      <!-- 2. Journey Waypoints Track (4 Encounters) -->
      <div class="journey-track" aria-label="مسار الرحلة في شِعاب السَّراة">
        ${ENCOUNTERS.map(enc => {
          const isPassed = enc.index < encIdx;
          const isCurrent = enc.index === encIdx;
          return `
            <div class="waypoint ${isPassed ? 'passed' : ''} ${isCurrent ? 'current' : ''}">
              <span class="waypoint-node">${isPassed ? '✓' : num(enc.index)}</span>
              <span class="waypoint-name">${enc.name}</span>
            </div>
          `;
        }).join('<div class="journey-connector"></div>')}
      </div>

      <!-- 3. Dawn Dial (ساعة الفجر) -->
      <div class="dawn-dial ${s.turn >= 30 ? 'danger' : ''}">
        ${icon('moon')}
        <div class="dawn-text">
          <small>حتى الفجر</small>
          <b>${num(36 - s.turn)} أدوار</b>
        </div>
      </div>

      <!-- 4. Top Quick Actions -->
      <div class="top-actions">
        ${button(isMuted() ? icon('mute') : icon('sound'), 'toggle-audio', 'icon-btn', false, 'الصوت')}
        ${button(icon('spark'), 'rules', 'icon-btn', false, 'القواعد')}
        ${button('⋯', 'menu', 'icon-btn menu-btn', false, 'القائمة')}
      </div>
    </header>
  `;
}

// -------------------------------------------------------------
// Left Side (55%): The Live Cinematic Arena
// -------------------------------------------------------------
// -------------------------------------------------------------
// Left Side (55%): The Live Cinematic Arena (3-Tier Layered Gorge)
// -------------------------------------------------------------
function renderCinematicArena(s, projected, p = {}) {
  const enc = ENCOUNTERS[s.encounter - 1] || ENCOUNTERS[0];
  const threat = incoming(s);

  return `
    <section class="cinematic-arena">
      <!-- 1. Ambient Scenic Topline Strip -->
      <div class="arena-topline">
        <div class="encounter-badge">
          <span class="enc-dot"></span>
          <strong>المعبر ${num(enc.index)}: ${enc.name}</strong>
        </div>
        <div class="haven-tracker">
          <span>المأمن: <b>${num(goal(s) - s.progress)}</b> خطوات</span>
          <div class="track-pips" style="--track-steps:${goal(s) + 1}">
            ${Array.from({ length: goal(s) + 1 }, (_, i) => `
              <i class="track-pip ${i <= s.progress ? 'passed' : ''} ${i === s.progress ? 'hero' : ''}"></i>
            `).join('')}
          </div>
        </div>
        <div class="threat-tag">
          ${icon('knife')} <span>خطر الدور: <b>${num(threat)}</b></span>
        </div>
      </div>

      <!-- 2. The Living Gorge Field: Enemies Standing Openly in the Terrain -->
      <div class="enemy-squad" aria-label="أعداء بني سلامان ونواياهم">
        ${s.enemies.map((e, idx) => {
          const living = s.enemies.filter(x => x.hp > 0);
          const isSolo = living.length === 1;
          const intent = getEnemyIntent(e, idx, s.phaseTurn, isSolo);
          const intentIcon = intent.intent === 'defend' ? 'cover' : intent.intent === 'scheme' ? 'spark' : intent.intent === 'lunge' ? 'swords' : 'knife';
          return `
            <div class="enemy-actor ${e.hp <= 0 ? 'defeated' : ''} ${e.isBoss ? 'boss-actor' : ''}">
              <div class="enemy-head">
                <span class="enemy-avatar">${e.isBoss ? icon('swords') : icon('knife')}</span>
                <strong class="enemy-title">${e.name}</strong>
              </div>
              <div class="enemy-hp-track">
                <i style="width:${(e.hp / e.maxHp) * 100}%"></i>
                <span class="hp-num">${ratio(e.hp, e.maxHp)}</span>
              </div>
              <div class="enemy-intent-badge intent-${intent.intent}">
                ${e.hp > 0 ? `${icon(intentIcon)} <strong>${intent.desc}</strong>` : '<span class="dead">صريع</span>'}
              </div>
              ${(s.bleed > 0 || s.poison > 0) && e.hp > 0 ? `
                <div class="status-chips">
                  ${s.bleed > 0 ? `<span class="chip bleed">${icon('bleed')} نزف ${num(s.bleed)}</span>` : ''}
                  ${s.poison > 0 ? `<span class="chip poison">${icon('poison')} سم ${num(s.poison)}</span>` : ''}
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>

      <!-- 3. Ambient Outlaw Line: Sleek footer strip for Shanfara & Allies -->
      <div class="hero-vanguard-bar">
        <div class="hero-plate">
          <span class="hero-ico">${icon('bow')}</span>
          <div class="hero-hp-wrap">
            <span class="hero-name">الشَّنْفَرَى</span>
            <div class="hero-hp-bar"><i style="width:${(s.hp/s.maxHp)*100}%"></i><span>${ratio(s.hp, s.maxHp)}</span></div>
          </div>
          ${s.momentum > 0 ? `<span class="momentum-tag">${icon('fire')} ${num(s.momentum)}</span>` : ''}
        </div>

        <div class="center-turn-banner">
          <span>${p.axis ? `نفّذ ${p.axis === 'row' ? 'الصف ↔' : 'العمود ↕'}` : p.card ? 'المس خانة بالصخرة' : 'اختر بطاقة لتبدأ'}</span>
        </div>

        <div class="allies-mini-tag">
          <span class="ally-ico" title="الذئب العَمَلَّس">${icon('wolf')}</span>
          <span class="ally-ico" title="تأبط شراً">${icon('knife')}</span>
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
                aria-label="خانة ${num(i + 1)}"
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
                    <button type="button" data-axis="row" class="axis-btn ${p.axis === 'row' ? 'selected' : ''}" title="تفعيل الصف">↔ صف</button>
                    <button type="button" data-axis="col" class="axis-btn ${p.axis === 'col' ? 'selected' : ''}" title="تفعيل العمود">↕ عمود</button>
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
              ${p.card ? 'ضع البطاقة في الصخرة لترى نتائج أفعالك وتآزرها.' : 'اختر بطاقة لتبدأ رسم خطوتك.'}
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
      <!-- Hand Cards Fan -->
      <div class="hand-fan-tray" aria-label="أوراق التدبير في يدك">
        ${s.hand.map(uid => {
          const c0 = def(uid, s, 0);
          const c1 = def(uid, s, 1);
          const isSel = p.card === uid;
          const isF0 = isSel && p.face === 0;
          const isF1 = isSel && p.face === 1;
          const arch = ARCHETYPES[c0.build] || ARCHETYPES.general;

          return `
            <div class="fan-card ${arch.class} ${isSel ? 'selected' : ''}">
              <div class="card-archetype-badge">${arch.name}</div>
              <button data-card="${uid}" data-face="0" class="face-toggle ${isF0 ? 'active' : ''}">
                <div class="face-title">${icon(c0.icon)}<strong>${c0.name}</strong></div>
                <div class="face-effects">${cardEffects(uid, s, 0)}</div>
              </button>
              <button data-card="${uid}" data-face="1" class="face-toggle ${isF1 ? 'active' : ''}">
                <div class="face-title"><small class="alt-pill">طارئ</small><strong>${c1.name}</strong></div>
                <div class="face-effects">${cardEffects(uid, s, 1)}</div>
              </button>
            </div>
          `;
        }).join('')}
      </div>

      <!-- End Turn / Commit Blade Button -->
      <div class="dock-actions">
        ${button(
          `<span>${p.axis ? `نفّذ ${p.axis === 'row' ? 'الصف ↔' : 'العمود ↕'}` : 'اختر فعلاً'}</span><i class="blade-gem"></i>`,
          'activate',
          'end-turn-blade',
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
