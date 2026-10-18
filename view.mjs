import { def, cardType, activate, attackTargets, targetForAction, getEnemyIntent, ENCOUNTERS } from './engine.mjs?v=32';
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
export function fullscreenButton() {
  const active = fullscreenActive();
  return `<button class="fullscreen-button ${active ? 'is-fullscreen' : ''}" data-action="fullscreen" aria-pressed="${active}" aria-label="${active ? 'الخروج من ملء الشاشة' : 'إخفاء شريط المتصفح وملء الشاشة'}">${icon(active ? 'contract' : 'expand')}<span>${active ? 'تصغير' : 'ملء الشاشة'}</span></button>`;
}
export function preview(s, p) {
  if (!p.card || !Number.isInteger(p.cell) || !p.axis) return null;
  const result = activate(s, {card:p.card,cell:p.cell,axis:p.axis,face:0,target:targetForAction(s,p)});
  return result.valid ? result : null;
}
export function effectFormula(uid, s, face = 0, projected = null) {
  const c = def(uid,s);
  if (cardType(uid) === 'slam' && !projected) return `<span class="icon-stat" dir="ltr">${icon('shield')}<span class="effect-divider">⟶</span>${icon('swords')}</span>`;
  return c.effects.map(f => {
    const actual = projected?.summary.effects.find(e=>e.uid===uid&&e.op===f.op);
    const value = actual?.amount ?? f.n;
    return stat(value, f.op==='block'?'shield':'swords');
  }).join('<span class="effect-divider">·</span>');
}
function cardArt(uid,s,cls='') {
  return `<span class="focus-art card-art-${cardType(uid)} ${cls}" aria-hidden="true">${icon(def(uid,s).icon)}</span>`;
}
function header(s) {
  return `<header class="game-header">${slice(0,0,1672,75,'template-art','blank-template.png')}
    <div class="player-resources"><span class="health-count" aria-label="الصحة">${icon('heart')}<span data-player-hp>${ratio(s.hp,s.maxHp)}</span></span></div>
    <h1>${esc(ENCOUNTERS[s.encounter-1].name)}<small>اختبار ${num(s.encounter)} / ${num(ENCOUNTERS.length)}</small></h1>
    ${fullscreenButton()}${button(slice(1585,19,45,45),'menu','settings-button',false,'قائمة اللعبة')}
  </header>`;
}
function board(s,p,projected,animation) {
  const grid=animation?.grid??[...s.grid];
  if(projected)grid[p.cell]=p.card;
  const chosen=projected?.summary.cells??animation?.activeCells??[];
  const complete=!!projected?.summary.lines.length;
  return `<aside class="command-panel">${slice(1142,76,526,554,'template-art','blank-template.png')}
    <div class="panel-heading"><h2>شبكة التوليفات</h2>${button('؟','help','help-button',false,'شرح اللعب')}</div>
    <div class="axis-controls" role="group" aria-label="اتجاه التفعيل">
      ${['row','column'].map(axis=>`<button data-axis="${axis}" aria-pressed="${p.axis===axis}" ${animation?'disabled':''}>${axis==='row'?'صف ←':'عمود ↓'}</button>`).join('')}
    </div>
    <div class="grid-wrap"><div class="duel-grid ${animation?'is-resolving':''}" role="group" aria-label="شبكة ثلاثة صفوف وثلاثة أعمدة">${grid.map((uid,cell)=>{
      const c=uid?def(uid,s):null;
      const turf=s.gridTurf?.[cell];
      const turfCls=turf==='fortified'?'is-fortified':turf==='scorched'?'is-scorched':'';
      const turfBadge=turf==='fortified'?`<span class="turf-icon turf-fortified">${icon('stone')}${(s.gridLevel?.[cell]||1)>1?`<b class="turf-level">${num(s.gridLevel[cell])}</b>`:''}</span>`:turf==='scorched'?`<span class="turf-icon turf-scorched">${icon('fire')}${(s.gridLevel?.[cell]||1)>1?`<b class="turf-level">${num(s.gridLevel[cell])}</b>`:''}</span>`:'';
      return `<button class="grid-cell ${uid?'has-card':''} ${turfCls} ${chosen.includes(cell)?'in-line':''} ${animation?.cells.includes(cell)?'will-clear':''} ${projected&&p.cell===cell?'is-preview':''}" data-cell="${cell}" aria-label="الخانة ${num(cell+1)}${turf==='fortified'?'، محصنة'+((s.gridLevel?.[cell]||1)>1?' ×'+num(s.gridLevel[cell]):''):turf==='scorched'?'، مشتعلة'+((s.gridLevel?.[cell]||1)>1?' ×'+num(s.gridLevel[cell]):''):''}${c?'، '+esc(c.name):' فارغة'}" ${animation?'disabled':''}>
      ${turfBadge}
      ${c?`<span class="slot-symbol">${icon(c.icon)}</span><strong>${esc(c.name)}</strong>`:'<span class="empty-plus">+</span>'}
      ${chosen.includes(cell)?`<b class="line-order">${num(chosen.indexOf(cell)+1)}</b>`:''}</button>`;
    }).join('')}</div></div>
    <div class="board-feedback" aria-live="polite">${animation?'<strong>جارٍ تنفيذ التوليفة…</strong>':projected?`<strong>${complete?'خط مكتمل · يتفعّل ثم يُفرّغ':'يتفعّل المختار · البطاقات تبقى'}</strong>${combatForecast(projected.summary)}`:`<strong>${!p.card?'اختر بطاقة':!p.axis?'اختر صفًا أو عمودًا':'اختر خانة فارغة'}</strong><small>صف: يمين ← يسار · عمود: أعلى ↓ أسفل</small>`}</div>
    ${button('نفّذ التوليفة','confirm-play','confirm-play gold-button',!projected||!!animation)}
  </aside>`;
}
function hand(s,p,projected,busy) {
  return `<section class="hand-panel" aria-label="بطاقات اليد">${slice(0,635,1672,306,'template-art','blank-template.png')}<div class="hand-cards">${s.hand.map(uid=>{
    const selected=p.card===uid,c=def(uid,s);
    return `<article class="duel-card ${selected?'is-selected':''}" data-hand-card="${uid}"><button class="card-art-button" data-card="${uid}" ${busy?'disabled':''} aria-label="اختر ${esc(c.name)}">${cardArt(uid,s,'hand-art')}</button><div class="card-name"><strong>${esc(c.name)}</strong>${c.vanish?'<span class="vanish-badge" title="تزول بعد التفعيل">⏳ تزول</span>':''}<button class="card-details" data-info="${uid}" aria-label="شرح ${esc(c.name)}">ⓘ</button></div>
    <button class="card-face ${selected?'is-active':''}" data-card="${uid}" aria-pressed="${selected}" ${busy?'disabled':''} aria-label="${esc(c.text)}"><span class="face-effect">${effectFormula(uid,s,0,selected?projected:null)}</span></button>
    <small class="card-rule">${esc(c.text)}</small></article>`;
  }).join('')}</div></section>`;
}
function rotationHint(){return `<div class="rotate-hint"><span>⤾</span><strong>أدر الجهاز أفقيًا</strong><p>لتظهر المواجهة والشبكة والبطاقات كاملة</p></div>`;}
export function gameView(s,p,animation=null){const projected=animation?null:preview(s,p);return `<main class="duel-app" data-version="33">${header(s)}<div class="main-stage">${arena(s,p,projected,animation)}${board(s,p,projected,animation)}</div>${hand(s,p,projected,!!animation)}${rotationHint()}</main>`;}
export function titleView(s){return `<main class="landing">${slice(4,76,1136,552,'landing-scene')}<div class="landing-paper"><span class="eyebrow">حُماة الممرات · مختبر التوليفات</span><h1>الشنفرى</h1><p>ضع بطاقة واختر صفّها أو عمودها. ابنِ توليفتك، ثم أكمل الخط لاستثماره.</p>${s.migrationNotice?'<small class="migration-notice">تغيّرت البطاقات والقواعد؛ تبدأ نسخة الاختبار بجولة جديدة.</small>':''}${button(fullscreenSupported()?'العب بملء الشاشة':'ابدأ الاختبار','start','gold-button')}<small>١٣ ورقة · ١٠ أنواع · يد من ٣ · بلا مانا</small></div>${rotationHint()}</main>`;}
export function rewardView(s){return `<main class="screen-panel"><h1>اكتمل الاختبار ${num(s.encounter)}</h1><p>المواجهة التالية: ${esc(ENCOUNTERS[s.encounter]?.name??'')}</p><p>تستعيد صحتك كاملة وتبدأ بالشبكة والرزمة من جديد.</p>${button('ابدأ الاختبار التالي','continue','gold-button')}${rotationHint()}</main>`;}
export function endView(s){return `<main class="screen-panel end-screen"><h1>${s.outcome==='victory'?'اكتملت اختبارات التوليفات':s.outcome==='exhausted'?'نفدت الخيارات':'انتهت المواجهة'}</h1><p>${s.outcome==='victory'?'جرّب ترتيبًا آخر وقارن قرارات الهجوم والحماية.':s.outcome==='exhausted'?'لم تبق بطاقة قابلة للعب أو وسيلة لهزيمة الأعداء.':'جرّب توقيت إكمال الخط وتوزيع الهجوم والحماية.'}</p>${button('اختبار جديد','restart','gold-button')}${rotationHint()}</main>`;}
export function combatRecap(summary) {
  const items = [[summary.hits,'swords','ألحقت','dealt'],[summary.block,'shield','اكتسبت درع','guard'],[summary.prevented??0,'shield','مُنِع','prevented'],[summary.enemyDamage,'heart','خسرت صحة','taken']];
  return `<div class="battle-result" role="status" aria-label="نتيجة الدور">${items.map(([value,ico,label,kind])=>`<span class="recap-item recap-${kind}" data-recap="${kind}" data-value="${value}"><span>${icon(ico)}<b>${num(value)}</b></span><small>${label}</small></span>`).join('')}</div>`;
}
function arena(s, p, projected, animation) {
  const pool = attackTargets(s);
  const target = targetForAction(s, p);
  return `<section class="battle-arena ${s.enemies.length === 3 ? 'has-boss' : ''}" aria-label="ساحة المواجهة، اختر عدوًا">${slice(4, 76, 1136, 552, 'arena-backdrop')}<span class="old-enemy-label-cover">${slice(656,149,160,136,'','blank-template.png')}</span>${s.enemies.length===1?`<span class="unused-enemy-cover">${slice(881,76,257,552,'','blank-template.png')}</span>`:''}
    <div class="combatant hero-combatant" data-max-hp="${s.maxHp}"><div class="unit-hud">${slice(193, 105, 164, 82, 'hud-paper', 'blank-template.png')}<strong>الشنفرى</strong><span class="hp-track"><i style="width:${(projected?.state.hp ?? s.hp) / s.maxHp * 100}%"></i></span><b data-hero-hp>${ratio(projected?.state.hp ?? s.hp, s.maxHp)}</b></div></div>
    ${s.enemies.map((e, i) => {
      const after = projected?.state.enemies[i]?.hp ?? e.hp;
      const locked = e.hp <= 0 || !pool.some(x => x.id === e.id);
      const intent = getEnemyIntent(e, i, s.phaseTurn);
      const rect = i % 2 === 0 ? [612, 280, 266, 344] : [881, 278, 257, 347];
      return `<button class="combatant enemy enemy-${i} ${target === e.id ? 'is-target' : ''} ${e.hp <= 0 ? 'is-fallen' : ''}" data-target="${e.id}" data-max-hp="${e.maxHp}" aria-pressed="${target === e.id}" ${locked ? 'disabled' : ''} aria-label="${esc(e.name)}، صحة ${num(e.hp)}، ${locked ? 'محمي' : 'هجوم ' + num(intent.damage)}">
        ${slice(...rect, 'fallen-cover', 'blank-template.png')}${i === 2 ? slice(446, 257, 316, 290, 'extra-enemy', 'extra-characters.png', 1374, 1145) : ''}
        <span class="unit-hud">${slice(...(i % 2 === 0 ? [656, 149, 160, 136] : [936, 150, 162, 138]), 'hud-paper', 'blank-template.png')}<strong>${esc(e.name)}</strong><span class="hp-track"><i style="width:${after / e.maxHp * 100}%"></i></span><b data-enemy-hp="${e.id}">${ratio(after, e.maxHp)}</b><small class="enemy-intent">${e.hp <= 0 ? 'صريع' : locked ? icon('shield') : stat(intent.damage, 'swords')}${e.bleed ? stat(e.bleed, 'bleed') : ''}</small></span>
        ${e.hp > after ? `<span class="forecast-damage">−${num(e.hp - after)}</span>` : ''}
      </button>`;
    }).join('')}
    ${!animation && s.last?.kind === 'turn' ? combatRecap(s.last) : ''}
  </section>`;
}
function combatForecast(summary) {
  return `<div class="preview-totals">${[[summary.hits,'swords','ضرر'],[summary.block,'shield','درع'],[summary.prevented,'shield','منع'],[summary.enemyDamage,'heart','صحة']].map(([value,ico,label])=>`<span class="forecast-stat">${stat(value??0,ico)}<small>${label}</small></span>`).join('')}</div>`;
}
