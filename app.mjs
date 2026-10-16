import { comboModel } from './combos.mjs?v=8';
import { VERSION, fresh, start, activate, assertState, def, stage } from './engine.mjs?v=8';
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
let selection = { card: null, cell: null, axis: null, face: null };
let feedback = '';

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
  selection = { card: null, cell: null, axis: null, face: null };
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
      <li><strong>المسرح المزدوج:</strong> الساحة على اليسار تعرض المعركة ومواقع الأعداء وتقدمك نحو المأمن؛ وصخرة التدبير على اليمين (٣×٣) تنظم فيها أفعالك وتآزر بطاقاتك.</li>
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
  const action = { ...chosen };
  const result = activate(s, action);
  if (!result.valid) return;

  report = record(report || begin(s), s, action, result);
  s = result.state;
  selection = { card: null, cell: null, axis: null, face: null };

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
    selection = { card: null, cell: null, axis: null, face: null };
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
  } else if (a === 'rules') {
    rules();
  } else if (a === 'help') {
    show(
      'كيف تُلعب ملحمة الشَّنْفَرَى؟ (في ٤ خطوات بسيطة)',
      `
      <div class="quick-guide-dialog">
        <div class="guide-card">
          <div class="guide-num">١</div>
          <div class="guide-body">
            <strong>اختر بطاقة من يدك بالأسفل:</strong>
            <p>لكل بطاقة وجهان: (أصيل 🔄 طارئ). بدّل بينهما بزر 🔄 لاختيار الأثر الأنسب لخطتك.</p>
          </div>
        </div>
        <div class="guide-card">
          <div class="guide-num">٢</div>
          <div class="guide-body">
            <strong>ضعها في خانة فارغة (＋) في الصخرة (٣×٣):</strong>
            <p>البطاقة ستثبت في الصخرة. يمكنك لمس أي بطاقة في الصخرة لقراءة تفاصيلها وقوتها.</p>
          </div>
        </div>
        <div class="guide-card">
          <div class="guide-num">٣</div>
          <div class="guide-body">
            <strong>اختر تفعيل الصف (↔) أو العمود (↕):</strong>
            <p>تفعيل الخط يجمع قوى كل البطاقات الموجودة في ذلك الخط وينفّذها بتسلسل وتآزر هجومي ودفاعي!</p>
          </div>
        </div>
        <div class="guide-card">
          <div class="guide-num">٤</div>
          <div class="guide-body">
            <strong>اضغط زر (نفّذ) بالسيف بالأسفل:</strong>
            <p>قبل الضغط، راقب التوقعات بالأعلى: الضرر الذي سينال العدو، والدروع التي ستصد هجومه القادم!</p>
          </div>
        </div>
        <div class="guide-footer-tip" style="margin-top:6px;">
          💡 <b>سر الصعاليك:</b> عندما يكتمل الخط بـ ٣ بطاقات ينفّذ ضربات قاضية ثم يُفرَّغ لتضع فيه بطاقات جديدة!
        </div>

        <div class="mechanics-breakdown-box" style="margin-top:10px;background:rgba(8,16,20,0.85);border:1px solid #ffd488;border-radius:8px;padding:10px;">
          <h3 style="color:#efbf75;margin:0 0 8px;font-size:0.95rem;">⚡ كيف تستغل الزَّخَم والنَّهْش في معاركك؟</h3>
          <ul style="margin:0;padding-right:18px;font-size:0.8rem;line-height:1.5;color:#e8ded1;">
            <li style="margin-bottom:6px;">
              <b style="color:#f0b842;">🔥 الزَّخَم (Momentum):</b> طاقة سرعة تتراكم.
              <br>• <b>حماية تلقائية:</b> أي زخم يتبقى بنهاية الدور <b>يتحول تلقائياً إلى دروع (+١ درع لكل زخم)</b> تحميك من الأعداء!
              <br>• <b>تقوية القوس:</b> رمية القوس 🏹 تضيف نصف رصيدك من الزخم كضرر إضافي مباشر!
            </li>
            <li style="margin-bottom:6px;">
              <b style="color:#ba7ae8;">🐺 النَّهْش وانقضاض الذئب (Beast Pounce):</b>
              <br>• الذئب يضرب ضرراً أساسياً.
              <br>• <b>التآزر القاتل:</b> إذا ضربت العدو أولاً بـ <b>النَّزْف 🩸</b> أو <b>السُّم 🧪</b>، يشم الذئب الدم ويكسب <b>+٢ ضرر إضافي فوراً!</b>
            </li>
            <li style="margin-bottom:6px;">
              <b style="color:#e64a38;">🩸 النَّزْف (Bleed):</b>
              <br>• يُمكّن الذئب من النهش المضاعف، وتفجيره ببطاقة النصل يضاعف ضرره مرتين 💥!
            </li>
            <li>
              <b style="color:#4aaed9;">🛡️ الصَّخْر والسَّواتر (Rock):</b>
              <br>• تغرس سواتر في خانات الصخرة؛ تفعيلها يمنحك دروعاً صلبة ويصد هجمات العدو.
            </li>
          </ul>
        </div>
      </div>
      `
    );
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
        selection.axis = bestAxis(s, card, selection.cell, nextFace);
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

  // Face toggle or card selection in hand
  if (b.dataset.face !== undefined && b.dataset.card) {
    const face = Number(b.dataset.face);
    const card = b.dataset.card;
    if (selection.cell !== null) {
      const axis = bestAxis(s, card, selection.cell, face);
      selection = { card, face, cell: selection.cell, axis };
    } else {
      selection = { card, face, cell: null, axis: null };
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
      const axis = bestAxis(s, card, selection.cell, face);
      selection = { card, face, cell: selection.cell, axis };
    } else {
      selection = { card, face, cell: null, axis: null };
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
            💡 هذه البطاقة مستقرة في الصخرة بالخانة ${num(i + 1)}. عند تفعيل صفها أو عمودها، ستنفّذ أثرها مع باقي بطاقات الخط!
          </p>
        </div>
        `
      );
      return;
    }
    if (!selection.card) return;
    const face = selection.face ?? 0;
    const axis = bestAxis(s, selection.card, i, face);
    selection = { card: selection.card, face, cell: i, axis };
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
  if (e.key === 'Escape') action('cancel');
  if (e.key >= '1' && e.key <= '4' && !e.ctrlKey && !e.metaKey) {
    const cardIdx = Number(e.key) - 1;
    const uid = s.hand[cardIdx];
    if (uid) {
      const face = e.shiftKey ? 1 : (selection.card === uid && selection.face === 0 ? 1 : 0);
      const cell = selection.cell;
      const axis = cell !== null ? bestAxis(s, uid, cell, face) : null;
      selection = { card: uid, face, cell, axis };
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
