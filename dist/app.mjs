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
    feedback = result.summary.choice === 'purge' ? 'تطهرت رزمتك من بطاقة زائدة.' : 'ظفرتَ ببطاقة جديدة للمسير!';
  } else if (result.summary.kind === 'relic') {
    feedback = 'اكتسبتَ أثراً صعلوكياً جديداً!';
  } else if (result.summary.kind === 'transition') {
    feedback = 'اقتحمتَ المعبر التالي.';
  } else {
    feedback = `تقدّمت ${num(result.summary.moves || 0)} · أصبت ${num(result.summary.hits || 0)} · صدَدت ${num(result.summary.block || 0)} · ضرر ${num(result.summary.enemyDamage || 0)}`;
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

  // Grid cell select
  if (b.dataset.cell !== undefined) {
    const i = Number(b.dataset.cell);
    if (!selection.card) return;
    if (s.grid[i]) {
      const c = def(s.grid[i], s);
      show(c.name, `<p>${c.text}</p>`);
      return;
    }
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
