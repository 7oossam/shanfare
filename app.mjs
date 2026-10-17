import { VERSION, migrateSave, fresh, start, activate, assertState, def, targetForAction, snapshot } from './engine.mjs?v=9';
import { begin, record, restore, textReport } from './report.mjs?v=9';
import { gameView, titleView, rewardView, riskPlacementView, endView, button, esc, num, effectFormula, fullscreenButton } from './view.mjs?v=9';
import { playSfx, toggleMute, isMuted } from './audio.mjs?v=9';
import { fullscreenActive, enterGameFullscreen, exitGameFullscreen, releaseLandscapeLock } from './fullscreen.mjs?v=9';
import { playCombatFeedback } from './combat-feedback.mjs?v=9';
const SAVE_KEY = 'shanfara-duel-v9';
const root = document.querySelector('#app');
const menu = document.querySelector('#menu');
let s = fresh(); let report = null;
let selection = { card: null, face: 0, cell: null, target: null };
let inputModality = 'pointer';
let cancelCombat = null;
let resolving = null; let resolveTimer = null; let longPressTimer = null; let longPressConsumed = false;
try { const save = JSON.parse(localStorage.getItem(SAVE_KEY)); if (save?.state?.version === VERSION) { s = migrateSave(save.state); report = restore(save.report, s); } } catch {}
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify({ state: s, report })); } catch { document.querySelector('#live').textContent = 'تعذّر الحفظ على الجهاز.'; } }
function render() { root.innerHTML = s.screen === 'title' ? titleView(s) : s.screen === 'reward' ? rewardView(s) : s.screen === 'end' ? endView(s) : s.screen === 'terrain' ? riskPlacementView(s,selection) : gameView(s, selection, resolving); }
function syncFullscreenControls() {
  const template = document.createElement('template');
  template.innerHTML = fullscreenButton();
  const next = template.content.firstElementChild;
  for (const element of document.querySelectorAll('.fullscreen-button')) {
    element.innerHTML = next.innerHTML;
    for (const attribute of ['class', 'aria-pressed', 'aria-label']) element.setAttribute(attribute, next.getAttribute(attribute));
  }
}
function requestFullscreenFromGesture(explicit = false) {
  // Call before rendering, audio, or any await can consume the tap's activation.
  const pending = explicit && fullscreenActive() ? exitGameFullscreen() : enterGameFullscreen();
  if (menu.open) menu.close();
  pending.then(result => {
    syncFullscreenControls();
    if (!result.ok && explicit) show('ملء الشاشة', `<p>${result.reason === 'unsupported' ? 'هذا المتصفح لا يدعم ملء الشاشة لهذه الصفحة. افتح الرابط في Chrome على أندرويد لتفعيلها.' : 'لم يسمح المتصفح بملء الشاشة. اضغط زر «ملء الشاشة» مرة أخرى، أو افتح الرابط مباشرة في المتصفح.'}</p>`);
  });
}
for (const event of ['fullscreenchange', 'webkitfullscreenchange']) document.addEventListener(event, () => { releaseLandscapeLock(); syncFullscreenControls(); });
function show(title, body) { menu.innerHTML = `<header class="dialog-header"><h2>${title}</h2>${button('×', 'close', '', false, 'إغلاق')}</header>${body}`; if (!menu.open) menu.showModal(); }
function details(uid) {
  const maneuver = def(uid,s,0).name === 'مناورة';
  const danger = s.riskUnlocked && s.grid[s.riskCell] === uid;
  show(esc(def(uid,s,0).name), `<div class="card-explanation">${[0,1].map(f=>`<section><h3>${f?'طارئ':'دائم'}</h3><div>${effectFormula(uid,s,f)}</div><p>${esc(def(uid,s,f).text)}</p><small>${f?'يتفعّل مع الصف والعمود ثم يختفي إلى الرزمة.':'يتفعّل عند وضعه ومع كل بطاقة توضع في صفّه أو عموده. الاكتمال يحدد إزالة الخط.'}</small></section>`).join('')}</div>${danger?'<p class="risk-card-note">هذه الورقة على خانة الخطر: ضرباتها المباشرة +٢، ومجموع ردّ الأعداء +١ عند تفعيل هجومها. الدفاع والنزيف وحده لا يشغّلانها.</p>':''}${maneuver?'<p class="maneuver-example"><b>مثال بالسهم:</b> الوجه الدائم يرجّع سهمًا من الشبكة إلى يدك لتلعبه لاحقًا بمكان أو وجه آخر. الوجه الطارئ ينقل السهم لخانة فارغة لتغيّر ترتيب تجهيزك. النقل والاسترجاع لا يفعّلان السهم مرة ثانية، ولا يأخذان دورًا آخر.</p>':''}`);
}
function help() { show('شبكة الأوامر ٣ × ٣', '<ol><li>بطاقة واحدة في الدور: اختر عدوًا ووجه بطاقة ثم خانة فارغة.</li><li>الوضع يُفعّل البطاقة وكل البطاقات الموجودة في صفّها وعمودها، حتى لو لم يكتمل الخط.</li><li>كل بطاقة تعمل مرة واحدة فقط، بما فيها البطاقة المشتركة بين الصف والعمود. الترتيب من اليسار لليمين ثم من الأعلى للأسفل.</li><li>الدائمة تبقى بين الأدوار، والطارئة تختفي بعد التفعيل.</li><li>الاكتمال يحدد الإزالة فقط: يُزال الخط المكتمل، وتبقى الدائمات في الخط الناقص الذي تفعّل. صف أو عمود من ٣ بطاقات.</li><li>يرد الأعداء مرة واحدة بعد كل بطاقة. معاينة الخانة تعرض النتيجة كاملة. اليد ثلاث أوراق، والبداية سهمان ودرعان وعزم ومناورة.</li></ol>'); }
function newGame() { cancelCombat?.(); cancelCombat = null; clearTimeout(resolveTimer); resolving = null; s = start(fresh()); report = begin(s); selection = { card: null, face: 0, cell: null, target: null }; if (menu.open) menu.close(); save(); render(); }
function commit(action) {
  if (resolving) return;
  const a = s.screen === 'play' && !s.pendingManeuver ? { ...action, target: targetForAction(s, action) } : action;
  const before = s; const result = activate(before, a); if (!result.valid) return;
  report = record(report || begin(before), before, a, result); s = result.state;
  selection = { card: null, face: 0, cell: null, target: a.target ?? null };
  save();
  if (result.summary.kind === 'turn') {
    const grid = [...before.grid]; grid[a.cell] = a.card;
    resolving = { grid, cells: result.summary.clearedCells, faces: { ...before.faces, [a.card]: a.face } };
    root.innerHTML = gameView({ ...before, hand: s.hand, screen: 'play', last: null }, selection, resolving);
    cancelCombat = playCombatFeedback({ root, summary: result.summary, reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches, onSound: playSfx, onComplete: () => { resolving = null; cancelCombat = null; render(); if (s.screen === 'reward' || s.outcome === 'victory') playSfx('victory'); else if (s.outcome === 'defeat') playSfx('defeat'); } });
    document.querySelector('#live').textContent = `ألحقت ${num(result.summary.hits)} ضرر. اكتسبت ${num(result.summary.block)} درع. منع الدرع ${num(result.summary.prevented)} ضرر. خسرت ${num(result.summary.enemyDamage)} صحة.`;
  } else { render(); playSfx('select'); }

}
function action(name) {
  if (name === 'close') menu.close();
  else if (name === 'start') { requestFullscreenFromGesture(); s = start(s); report = begin(s); save(); render(); playSfx('select'); }
  else if (name === 'restart') { requestFullscreenFromGesture(); newGame(); }
  else if (name === 'help') help();
  else if (name === 'menu') show('الشنفرى', `<nav class="menu-options">${button('أكمل اللعب', 'close', 'gold-button')}${button('شرح اللعب والأيقونات', 'help')}${button(isMuted() ? 'تشغيل الصوت' : 'كتم الصوت', 'audio')}${button(fullscreenActive() ? 'الخروج من ملء الشاشة' : 'ملء الشاشة', 'fullscreen')}${button('تحميل تقرير اللعب', 'export')}${button('ابدأ من جديد', 'restart')}</nav><p>الرزمة ${num(s.draw.length)}</p>`);
  else if (name === 'audio') { toggleMute(); menu.close(); render(); }
  else if (name === 'fullscreen') requestFullscreenFromGesture(true);
  else if (name === 'momentum-info') show('رصيد الزخم', `<p>رصيدك الآن: ${num(s.momentum)} 🔥</p><p>بطاقة العزم تجمع الزخم. كل ١ 🔥 = +١ ⚔ للسهم الدائم، ثم يصرف السهم الرصيد كاملًا. السهم الطارئ يحافظ عليه.</p><p>مثال: إذا كان رصيدك ٢ 🔥 وتفعّل عزم ٢ 🔥 قبل سهم ٢ ⚔ في الصف، يصبح رصيدك ٤ 🔥 ثم يضرب السهم ٦ ⚔ ويصرف الرصيد.</p>`);
  else if (name === 'confirm-risk') commit({kind:'place-risk',cell:selection.riskCell});
  else if (name === 'risk-info') show('خانة الخطر', '<p>الهجوم المباشر الموجود فيها يزيد ضرره ٢ عند تفعيله. بالمقابل يزيد مجموع رد الأعداء ١ في هذا الدور، ويمكن للدرع منعه.</p><p>مثال: سهم ٢ يصبح ٤ قبل إضافة الزخم. الوابل يضيف ٢ لكل عدو. النزيف وحده والدفاع والمهارات لا يشغّلونها.</p><p>تظل الخانة بعد اختفاء الطارئ أو تفريغ الخط. المناورة تنقل الورقة فقط. تختار مكان الخطر مجددًا قبل كل مواجهة لاحقة.</p>');
  else if (name === 'skip-maneuver') commit({kind:'maneuver',skip:true});
  else if (name === 'continue') commit({ kind: 'continue' });
  else if (name.startsWith('draft-')) commit({ kind: 'draft', choice: name.slice(6) });
  else if (name === 'export') { const url = URL.createObjectURL(new Blob([textReport(report)], { type: 'application/json' })); const a = document.createElement('a'); a.href = url; a.download = 'shanfara-report.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
}
document.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b || b.disabled) return;
  if (longPressConsumed && b.dataset.card) { longPressConsumed = false; return; }
  longPressConsumed = false;
  if (b.dataset.action) { action(b.dataset.action); return; }
  if (resolving) return;
  if (s.screen === 'terrain') { if (b.dataset.riskCell !== undefined) { selection.riskCell=Number(b.dataset.riskCell);render();if(inputModality==='keyboard')root.querySelector('[data-action="confirm-risk"]')?.focus({preventScroll:true}); } return; }
  if (s.screen !== 'play') return;
  if (s.pendingManeuver) {
    if (b.dataset.maneuverCard) { if (s.pendingManeuver.mode === 'recall') commit({kind:'maneuver',card:b.dataset.maneuverCard,to:'hand'}); else { selection.utilityCard = b.dataset.maneuverCard; render(); } }
    else if (b.dataset.maneuverCell !== undefined && selection.utilityCard) commit({kind:'maneuver',card:selection.utilityCard,cell:Number(b.dataset.maneuverCell)});
    return;
  }
  if (b.dataset.info) { details(b.dataset.info); return; }
  if (b.dataset.target) { selection.target = b.dataset.target; selection.cell = null; render(); return; }
  if (b.dataset.card) { selection = { ...selection, card: b.dataset.card, face: Number(b.dataset.face), cell: null }; render(); playSfx('select'); return; }
  if (b.dataset.cell !== undefined) {
    const cell = Number(b.dataset.cell);
    if (s.grid[cell]) { details(s.grid[cell]); return; }
    if (!selection.card) { document.querySelector('#live').textContent = 'اختر وجه بطاقة من اليد أولًا.'; return; }
    commit({ card: selection.card, face: selection.face, cell, target: selection.target });
  }
});
function hover(cell) {
  if (resolving || s.screen !== 'play' || !selection.card || s.grid[cell] || selection.cell === cell) return;
  selection.cell = cell; render();
}
document.addEventListener('pointerover', e => { const cell = e.target.closest('[data-cell]'); if (cell && e.pointerType === 'mouse') hover(Number(cell.dataset.cell)); });
document.addEventListener('pointerdown', () => { inputModality = 'pointer'; }, true);
document.addEventListener('keydown', () => { inputModality = 'keyboard'; }, true);
document.addEventListener('focusin', e => { if (inputModality !== 'keyboard') return; const cell = e.target.closest('[data-cell]'); if (cell) { const index = Number(cell.dataset.cell); if (selection.card && !s.grid[index] && selection.cell !== index) { hover(index); root.querySelector(`[data-cell="${index}"]`)?.focus({preventScroll:true}); } } });
document.addEventListener('pointerdown', e => { const b = e.target.closest('.card-face'); if (!b) return; longPressConsumed = false; longPressTimer = setTimeout(() => { longPressConsumed = true; details(b.dataset.card); }, 550); });
for (const event of ['pointerup', 'pointercancel', 'pointermove']) document.addEventListener(event, () => clearTimeout(longPressTimer));
document.addEventListener('keydown', e => {
  if (menu.open || resolving || s.pendingManeuver || s.screen !== 'play') return;
  if (e.key === 'Escape') { selection = { card: null, face: 0, cell: null, target: selection.target }; render(); }
  if (/^[1-5]$/.test(e.key) && !e.ctrlKey && !e.metaKey && s.hand[Number(e.key) - 1]) { selection = { ...selection, card: s.hand[Number(e.key) - 1], face: e.shiftKey ? 1 : 0, cell: null }; render(); }
});
render();
