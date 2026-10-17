import { VERSION, fresh, start, activate, assertState, def, targetForAction, snapshot } from './engine.mjs?v=9';
import { begin, record, restore, textReport } from './report.mjs?v=9';
import { gameView, titleView, rewardView, endView, button, esc, num, effectFormula, fullscreenButton } from './view.mjs?v=9';
import { playSfx, toggleMute, isMuted } from './audio.mjs?v=9';
import { fullscreenActive, enterGameFullscreen, exitGameFullscreen, releaseLandscapeLock } from './fullscreen.mjs?v=9';
const SAVE_KEY = 'shanfara-duel-v9';
const root = document.querySelector('#app');
const menu = document.querySelector('#menu');
let s = fresh(); let report = null;
let selection = { card: null, face: 0, cell: null, target: null };
let inputModality = 'pointer';
let resolving = null; let resolveTimer = null; let longPressTimer = null; let longPressConsumed = false;
try { const save = JSON.parse(localStorage.getItem(SAVE_KEY)); if (save?.state?.version === VERSION) { assertState(save.state); s = save.state; s.discard.push(...s.exhausted); s.exhausted = []; for (let i = 0; i < 4; i++) { const uid = s.grid[i]; if (uid && s.faces[uid] === 1) { s.discard.push(uid); delete s.faces[uid]; s.grid[i] = null; } } report = restore(save.report, s); } } catch {}
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify({ state: s, report })); } catch { document.querySelector('#live').textContent = 'تعذّر الحفظ على الجهاز.'; } }
function render() { root.innerHTML = s.screen === 'title' ? titleView(s) : s.screen === 'reward' ? rewardView(s) : s.screen === 'end' ? endView(s) : gameView(s, selection, resolving); }
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
function details(uid) { show(esc(def(uid, s, 0).name), `<div class="card-explanation">${[0, 1].map(f => `<section><h3>${f ? 'طارئ' : 'دائم'}</h3><div>${effectFormula(uid, s, f)}</div><p>${esc(def(uid, s, f).text)}</p><small>${f ? 'يتفعّل فورًا ويختفي من الشبكة إلى الرزمة.' : 'يتفعّل فور وضعه ويبقى، ثم يتفعّل مجددًا عند اكتمال خطه ويُزال.'}</small></section>`).join('')}</div>`); }
function help() { show('شبكة الأوامر ٢ × ٢', '<ol><li>بطاقة واحدة في كل دور: اختر عدوًا ووجه بطاقة ثم خانة فارغة.</li><li>كل بطاقة تتفعّل فور وضعها. الدائمة تبقى في الشبكة، والطارئة تُكمل الخط قبل اختفائها وتعود للرزمة.</li><li>امتلاء صف أو عمود يُفعّل بطاقاته الدائمة مرة ثانية ثم يزيل الخط كاملًا. البطاقة التي أكملت الخط تعمل فورًا ثم مجددًا مع الخط.</li><li>عند اكتمال خطين، تتفعّل كل بطاقة مشتركة مرة واحدة ضمن الخطوط.</li><li>يرد الأعداء بعد كل بطاقة تلعبها. معاينة الخانة تعرض مجموع تأثير البطاقة والخط وردّ الأعداء.</li></ol><p>العزم يجمع الزخم فورًا، والسهم الدائم يصرفه كضرر إضافي. اضغط ⓘ للتفاصيل.</p>'); }
function newGame() { clearTimeout(resolveTimer); resolving = null; s = start(fresh()); report = begin(s); selection = { card: null, face: 0, cell: null, target: null }; if (menu.open) menu.close(); save(); render(); }
function commit(action) {
  if (resolving) return;
  const a = s.screen === 'play' ? { ...action, target: targetForAction(s, action) } : action;
  const before = s; const result = activate(before, a); if (!result.valid) return;
  report = record(report || begin(before), before, a, result); s = result.state;
  selection = { card: null, face: 0, cell: null, target: a.target ?? null };
  save();
  if ((result.summary.lines?.length || a.face === 1) && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const grid = [...before.grid]; grid[a.cell] = a.card;
    resolving = { grid, cells: result.summary.cells.length ? result.summary.cells : [a.cell], faces: { ...before.faces, [a.card]: a.face } };
    // Show activation before the committed removal, including a lethal final line.
    root.innerHTML = gameView({ ...s, screen: 'play' }, selection, resolving);
    resolveTimer = setTimeout(() => { resolving = null; render(); }, 420);
  } else render();
  playSfx(result.summary.hits ? 'hit' : result.summary.block ? 'block' : 'select');
  document.querySelector('#live').textContent = result.summary.kind === 'turn' ? `تفعّلت البطاقة${result.summary.lines.length ? ' ثم الخط' : ''}: ${num(result.summary.hits)} ضرر، ${num(result.summary.block)} صدّ.` : 'وُضعت البطاقة. أكمل الخط لتفعيله.';
}
function action(name) {
  if (name === 'close') menu.close();
  else if (name === 'start') { requestFullscreenFromGesture(); s = start(s); report = begin(s); save(); render(); playSfx('select'); }
  else if (name === 'restart') { requestFullscreenFromGesture(); newGame(); }
  else if (name === 'help') help();
  else if (name === 'menu') show('الشنفرى', `<nav class="menu-options">${button('أكمل اللعب', 'close', 'gold-button')}${button('شرح اللعب والأيقونات', 'help')}${button(isMuted() ? 'تشغيل الصوت' : 'كتم الصوت', 'audio')}${button(fullscreenActive() ? 'الخروج من ملء الشاشة' : 'ملء الشاشة', 'fullscreen')}${button('تحميل تقرير اللعب', 'export')}${button('ابدأ من جديد', 'restart')}</nav><p>الرزمة ${num(s.draw.length)}</p>`);
  else if (name === 'audio') { toggleMute(); menu.close(); render(); }
  else if (name === 'fullscreen') requestFullscreenFromGesture(true);
  else if (name === 'momentum-info') show('رصيد الزخم', `<p>رصيدك الآن: ${num(s.momentum)} 🔥</p><p>بطاقة العزم تجمع الزخم. كل ١ 🔥 = +١ ⚔ للسهم الدائم، ثم يصرف السهم الرصيد كاملًا. السهم الطارئ يحافظ عليه.</p><p>مثال: عزم ٢ 🔥 ثم سهم ٢ ⚔ يساوي ٤ ⚔. العزم يتفعّل فورًا، والسهم فور وضعه، ثم يتفعّلان مجددًا عند اكتمال خطهما.</p>`);
  else if (name === 'continue') commit({ kind: 'continue' });
  else if (name.startsWith('draft-')) commit({ kind: 'draft', choice: name.slice(6) });
  else if (name === 'export') { const url = URL.createObjectURL(new Blob([textReport(report)], { type: 'application/json' })); const a = document.createElement('a'); a.href = url; a.download = 'shanfara-report.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
}
document.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b || b.disabled) return;
  if (longPressConsumed && b.dataset.card) { longPressConsumed = false; return; }
  longPressConsumed = false;
  if (b.dataset.action) { action(b.dataset.action); return; }
  if (resolving || s.screen !== 'play') return;
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
  if (menu.open || resolving || s.screen !== 'play') return;
  if (e.key === 'Escape') { selection = { card: null, face: 0, cell: null, target: selection.target }; render(); }
  if (/^[1-5]$/.test(e.key) && !e.ctrlKey && !e.metaKey && s.hand[Number(e.key) - 1]) { selection = { ...selection, card: s.hand[Number(e.key) - 1], face: e.shiftKey ? 1 : 0, cell: null }; render(); }
});
render();
