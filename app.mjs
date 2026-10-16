import { comboModel } from './combos.mjs?v=8';
import { VERSION, fresh, start, activate, assertState, def, stage, targetForAction } from './engine.mjs?v=8';
import { begin, record, restore, exported, textReport } from './report.mjs?v=8';
import {
  gameView,
  endView,
  titleView,
  rewardView,
  relicView,
  interludeView,
  comboView,
  cardEffects,
  bestAxis,
  button as btn,
  esc,
  num,
  ratio
} from './view.mjs?v=8';
import { playSfx, toggleMute, isMuted } from './audio.mjs?v=8';

const root = document.querySelector('#app');
const menu = document.querySelector('#menu');
const KEY = 'shanfara-roguelike-v8';
const LAST = 'shanfara-roguelike-last-v8';

let s = fresh();
let report = null;
let activeReport = null;
let selection = { card: null, cell: null, axis: null, face: null, target: null };
let feedback = '';
let feedbackTimer = null;
let displayedFeedback = '';

try {
  const save = JSON.parse(localStorage.getItem(KEY));
  if (save?.state?.version === VERSION) {
    assertState(save.state);
    s = save.state;
    report = restore(save.report, s);
  }
} catch {}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify({ state: s, report }));
    if (s.screen === 'end') localStorage.setItem(LAST, JSON.stringify(report));
  } catch {
    feedback = 'تعذر الحفظ على الجهاز؛ يمكنك نسخ تقرير الرن.';
  }
}

function render() {
  if (feedback !== displayedFeedback) {
    clearTimeout(feedbackTimer);
    displayedFeedback = feedback;
    if (feedback) {
      feedbackTimer = setTimeout(() => {
        feedback = '';
        displayedFeedback = '';
        root.querySelector('.tactical-toast')?.remove();
      }, 3500);
    }
  }
  document.body.dataset.screen = s.screen;
  if (s.screen === 'title') {
    root.innerHTML = titleView();
  } else if (s.screen === 'end') {
    root.innerHTML = endView(s);
  } else if (s.screen === 'reward') {
    root.innerHTML = rewardView(s);
  } else if (s.screen === 'relic') {
    root.innerHTML = relicView(s);
  } else if (s.screen === 'interlude') {
    root.innerHTML = interludeView(s);
  } else {
    root.innerHTML = gameView(s, selection, feedback);
  }
}

const focus = q => {
  if (typeof window !== 'undefined' && window.innerWidth >= 900) {
    root.querySelector(q)?.focus({ preventScroll: true });
  }
};

function reset(seed = s.seed) {
  if (menu.open) menu.close();
  s = start(fresh(seed));
  report = begin(s);
  selection = { card: null, cell: null, axis: null, face: null, target: null };
  feedback = '';
  persist();
  render();
  focus('[data-card]');
}

function show(title, body) {
  menu.innerHTML = `<div class="dialog-head"><h2>${title}</h2>${btn('×', 'close')}</div>${body}`;
  if (!menu.open) menu.showModal();
  menu.querySelector('button')?.focus();
}

function rules() {
  show(
    'دليل ملحمة السَّراة وقوانين البناءات',
    `
    <ol class="steps">
      <li><strong>الرقعة هي المعركة:</strong> الأعداء في الصف العلوي والشنفرى في الأسفل. لكل خانة موضع بطاقة مستقل تحت الشخصية؛ اضغط الشخصية لتحديد الهدف أو موضع البطاقة للتخطيط. العمود يفضّل العدو المحاذي له ما لم تحدد هدفًا يدويًا. حاملو التراس يحمون الزعيم حتى إسقاطهم.</li>
      <li><strong>مسارات البناء الأربعة:</strong>
        <ul>
          <li><b style="color:#f0b842">الزَّخَم والقَوْس:</b> مراكمة السرعة الحركية وتحويل فائض الزخم لصد (+٢ لكل خطوة) ومضاعفة ضرر رميات القوس.</li>
          <li><b style="color:#e64a38">النَّزْف والسُّمُوم:</b> إدماء الأعداء، وتطبيق السم الذي يتجاوز الدروع، وتفجير النزف بضربات قاضية.</li>
          <li><b style="color:#4aaed9">الصَّخْر والجَلَد:</b> غرس السواتر المتينة، واستفاف الترب لتحويل الجراح لدروع ورد هجومي.</li>
          <li><b style="color:#ba7ae8">مِيثَاق الضَّوَارِي:</b> انقضاض الذئب، وكمائن النمر، واسترداد غنائم الضبعة.</li>
        </ul>
      </li>
      <li><strong>الآثار كاسرة القواعد:</strong> تمنحك مزايا خارقة تغيّر قوانين المعركة (مثل تفجير السواتر، وتطبيق النزف الجماعي عند تفريغ الخط).</li>
      <li><strong>المراحل الأربع:</strong> مَضِيق الصَّفَا ➔ قَلْت المَاءِ (المورد والشفاء) ➔ شِعَاب الغَبَش (الضباب والسموم) ➔ مُعَسْكَر سَلامَان (نزال الزعيم عوف بن صخر).</li>
    </ol>
    `
  );
}

function commit(chosen = selection) {
  const action = s.screen === 'play' ? { ...chosen, target: targetForAction(s, chosen) } : { ...chosen };
  const result = activate(s, action);
  if (!result.valid) return;

  report = record(report || begin(s), s, action, result);
  s = result.state;
  selection = { card: null, cell: null, axis: null, face: null, target: null };

  if (result.summary.kind === 'reward') {
    feedback = result.summary.choice === 'purge' ? '✨ تطهرت رزمتك من بطاقة زائدة.' : '✨ ظفرتَ ببطاقة جديدة للمسير!';
  } else if (result.summary.kind === 'relic') {
    feedback = '🏆 اكتسبتَ أثراً صعلوكياً جديداً!';
  } else if (result.summary.kind === 'transition') {
    feedback = '⚔️ اقتحمتَ المعبر التالي.';
  } else {
    const hits = result.summary.hits || 0;
    const block = result.summary.block || 0;
    const moves = result.summary.moves || 0;
    const dmg = result.summary.enemyDamage || 0;
    const cleared = result.summary.cleared?.length === 3;
    feedback = `${hits ? `💥 ضربت ${num(hits)} ضرر` : 'لم تضرب'} • ${block ? `🛡️ صدَدت ${num(block)}` : 'بلا درع'} • ${moves ? `👟 تقدّمت ${num(moves)}` : 'ثابت'}${dmg ? ` • 💔 خسرت ${num(dmg)} صحة` : ' • 🛡️ لم تصبك جراح'}${cleared ? ' • ⚡ فرّغت الخط!' : ''}`;
  }

  persist();
  render();

  // Play appropriate audio SFX
  if (result.summary.hits) playSfx('hit');
  else if (result.summary.selfDamage) playSfx('knife');
  else if (result.summary.block) playSfx('block');
  else if (result.summary.moves) playSfx('move');
  else playSfx('select');

  if (s.outcome === 'victory' || s.outcome === 'full') playSfx('victory');
  else if (s.outcome === 'dead' || s.outcome === 'caught') playSfx('defeat');
}

function action(a) {
  if (a === 'close') {
    menu.close();
  } else if (a === 'toggle-audio') {
    toggleMute();
    render();
    playSfx('select');
  } else if (a === 'start') {
    s = start(s);
    report = begin(s);
    if (menu.open) menu.close();
    persist();
    render();
    playSfx('select');
  } else if (a === 'restart') {
    reset();
    playSfx('select');
  } else if (a === 'new-seed') {
    reset(Date.now() >>> 0);
    playSfx('select');
  } else if (a === 'cancel') {
    selection = { card: null, cell: null, axis: null, face: null, target: null };
    render();
    playSfx('select');
  } else if (a === 'activate') {
    commit();
  } else if (a === 'continue') {
    commit({ kind: 'continue' });
  } else if (a === 'purge') {
    commit({ kind: 'purge' });
  } else if (a === 'skip') {
    commit({ kind: 'skip' });
  } else if (a.startsWith('draft-')) {
    const cardId = a.replace('draft-', '');
    commit({ kind: 'draft', choice: cardId });
  } else if (a.startsWith('relic-')) {
    const relicId = a.replace('relic-', '');
    commit({ kind: 'relic', choice: relicId });
  } else if (a === 'card-info' && selection.card) {
    const uid = selection.card;
    const permanent = def(uid, s, 0);
    const instant = def(uid, s, 1);
    show('وجها البطاقة', `<div class="quick-guide-dialog"><div class="guide-card"><div class="guide-body"><strong>دائم · ${esc(permanent.name)}</strong><p>${esc(permanent.text)}</p><div>${cardEffects(uid, s, 0)}</div></div></div><div class="guide-card"><div class="guide-body"><strong>طارئ · ${esc(instant.name)}</strong><p>${esc(instant.text)}</p><div>${cardEffects(uid, s, 1)}</div></div></div></div>`);
  } else if (a === 'rules') {
    rules();
  } else if (a === 'help') {
    show('ساحة واحدة، قرارك يصنع النصر', `
      <div class="quick-guide-dialog">
        <div class="guide-card"><div class="guide-num">١</div><div class="guide-body"><strong>اقرأ الأعداء داخل الرقعة</strong><p>فوق كل عدو هجومه القادم، وتحته صحته. المس شخصيته لتحديده هدفًا. حاملو التراس يحمون الزعيم.</p></div></div>
        <div class="guide-card"><div class="guide-num">٢</div><div class="guide-body"><strong>اختر بطاقة ووجهًا من يدك</strong><p>زر دائم / طارئ يبدّل الوجه. الدائم يبقى ليتكرر أثره، والطارئ ينفّذ أثره ثم يُطرح.</p></div></div>
        <div class="guide-card"><div class="guide-num">٣</div><div class="guide-body"><strong>ضعها في موضع بطاقة فارغ</strong><p>كل خانة تستقبل بطاقة حتى لو كانت فيها شخصية؛ موضع البطاقة تحت الشخصية مستقل عنها. وجود الشخصية لا يغلق الخانة.</p></div></div>
        <div class="guide-card"><div class="guide-num">٤</div><div class="guide-body"><strong>قارن الصف والعمود ثم نفّذ</strong><p>الخط المضيء ينفّذ البطاقات بالترتيب المرقّم. السهم يبيّن الهدف، وصحة الشخصيات تعرض النتيجة المتوقعة. يمكنك تغيير الهدف قبل التنفيذ.</p></div></div>
        <div class="guide-footer-tip">العمود يختار عدوًا محاذيًا تلقائيًا إن وجد. ترتيب تنفيذ الصفوف من اليسار لليمين والأعمدة من الأعلى للأسفل. اكتمال خط بثلاث بطاقات يفرّغه. الزخم الفائض يتحوّل إلى دروع.</div>
      </div>`);
  } else if (a === 'menu') {
    show(
      'ملحمة الشَّنْفَرَى',
      `
      <div style="display:grid;gap:8px;">
        ${btn('أكمل اللعب', 'close', 'primary')}
        ${btn(isMuted() ? 'تشغيل المؤثرات الصوتية' : 'كتم الصوت', 'toggle-audio')}
        ${btn('دليل القواعد والبناءات', 'rules')}
        ${btn('إعادة نفس الرن', 'restart')}
        ${btn('رن جديد بتوزيع عشوائي', 'new-seed')}
      </div>
      `
    );
  }
}

document.addEventListener('click', e => {
  const b = e.target.closest('button') || e.target.closest('[data-cell]');
  if (!b || b.disabled) return;

  if (b.dataset.action === 'flip-card') {
    const card = b.dataset.card;
    if (!s.faces) s.faces = {};
    const cur = s.faces[card] !== undefined ? s.faces[card] : 0;
    const nextFace = cur === 1 ? 0 : 1;
    s.faces[card] = nextFace;
    if (selection.card === card) {
      selection.face = nextFace;
      if (selection.cell !== null) {
        selection.axis = bestAxis(s, card, selection.cell, nextFace, selection.target);
      }
    }
    render();
    playSfx('select');
    return;
  }

  if (b.dataset.action) {
    action(b.dataset.action);
    return;
  }

  if (s.screen !== 'play') return;

  if (b.dataset.target) {
    selection.target = selection.target === b.dataset.target ? null : b.dataset.target;
    render();
    playSfx('select');
    return;
  }

  // Face toggle or card selection in hand
  if (b.dataset.face !== undefined && b.dataset.card) {
    const face = Number(b.dataset.face);
    const card = b.dataset.card;
    if (selection.cell !== null) {
      const axis = bestAxis(s, card, selection.cell, face, selection.target);
      selection = { ...selection, card, face, cell: selection.cell, axis };
    } else {
      selection = { ...selection, card, face, cell: null, axis: null };
    }
    render();
    playSfx('select');
    return;
  }

  // Card select without specific face
  if (b.dataset.card) {
    const card = b.dataset.card;
    const face = selection.face ?? 0;
    if (selection.cell !== null) {
      const axis = bestAxis(s, card, selection.cell, face, selection.target);
      selection = { ...selection, card, face, cell: selection.cell, axis };
    } else {
      selection = { ...selection, card, face, cell: null, axis: null };
    }
    render();
    playSfx('select');
    return;
  }

  // Grid cell select: inspecting placed cards or placing selected card
  if (b.dataset.cell !== undefined) {
    const i = Number(b.dataset.cell);
    if (s.grid[i]) {
      const c = def(s.grid[i], s);
      show(
        `«${c.name}»`,
        `
        <div class="card-inspect-dialog" style="text-align:right;direction:rtl;">
          <p style="font-size:0.9rem;line-height:1.4;margin:4px 0 8px;">${esc(c.text)}</p>
          <div style="margin:8px 0;display:flex;gap:6px;flex-wrap:wrap;">${cardEffects(s.grid[i], s)}</div>
          <p style="color:#efbf75;font-size:0.8rem;border-top:1px dashed #33444d;padding-top:6px;margin:8px 0 0;">
            💡 هذه البطاقة مستقرة في الرقعة بالخانة ${num(i + 1)}. عند تفعيل صفها أو عمودها، ستنفّذ أثرها مع باقي بطاقات الخط!
          </p>
        </div>
        `
      );
      return;
    }
    if (!selection.card) return;
    const face = selection.face ?? 0;
    const axis = bestAxis(s, selection.card, i, face, selection.target);
    selection = { ...selection, card: selection.card, face, cell: i, axis };
    render();
    playSfx('select');
    return;
  }

  // Axis button (row / col toggle)
  if (b.dataset.axis) {
    selection.axis = b.dataset.axis;
    render();
    playSfx('select');
  }
});

document.addEventListener('keydown', e => {
  if (menu.open || s.screen !== 'play') return;
  if (e.target.matches('input, textarea, select, [contenteditable="true"]')) return;
  const cell = e.target.closest('[data-cell]');
  if (cell && e.target === cell && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    cell.click();
    return;
  }
  // Native buttons must retain their own Enter/Space activation.
  if (e.target.closest('button') && (e.key === 'Enter' || e.key === ' ')) return;
  if (e.key === 'Escape') action('cancel');
  if (e.key >= '1' && e.key <= String(s.hand.length) && !e.ctrlKey && !e.metaKey) {
    const cardIdx = Number(e.key) - 1;
    const uid = s.hand[cardIdx];
    if (uid) {
      const face = e.shiftKey ? 1 : (selection.card === uid && selection.face === 0 ? 1 : 0);
      const cell = selection.cell;
      const axis = cell !== null ? bestAxis(s, uid, cell, face, selection.target) : null;
      selection = { ...selection, card: uid, face, cell, axis };
      render();
      playSfx('select');
    }
  }
  if ((e.key === 'Enter' || e.key === ' ') && selection.card && selection.cell !== null && selection.axis) {
    e.preventDefault();
    commit();
  }
});

render();
focus(s.screen === 'title' ? '[data-action="start"]' : '[data-card]');

