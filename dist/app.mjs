import { VERSION, migrateSave, fresh, start, startRun, activate, def, targetForAction } from './engine.mjs?v=32';
import { begin, record, restore, textReport } from './report.mjs?v=9';
import { gameView, titleView, relicView, rewardView, endView, button, esc, num, effectFormula, fullscreenButton } from './view.mjs?v=32';
import { playSfx, toggleMute, isMuted, haptic } from './audio.mjs?v=9';
import { fullscreenActive, enterGameFullscreen, exitGameFullscreen, releaseLandscapeLock } from './fullscreen.mjs?v=9';
import { playCombatFeedback } from './combat-feedback.mjs?v=9';
const SAVE_KEY='shanfara-duel-v9';
const root=document.querySelector('#app'), menu=document.querySelector('#menu');
const emptySelection=()=>({card:null,cell:null,axis:null,target:null});
// The direction is a quick choice, so it is remembered: the last one used is the default for the next placement.
let lastAxis='row';
try{const saved=localStorage.getItem('shanfara-axis');if(saved==='row'||saved==='column')lastAxis=saved;}catch{}
const AXIS_NAME={row:'صف',column:'عمود'};
let s=fresh(), report=null, selection=emptySelection();
let cancelCombat=null,resolving=null;
try {
  const saved=JSON.parse(localStorage.getItem(SAVE_KEY));
  if(saved?.state?.version===VERSION){
    if(saved.state.ruleset!==37)localStorage.setItem(SAVE_KEY+'-before-v37',JSON.stringify(saved));
    s=migrateSave(saved.state);report=restore(saved.report,s);
  }
}catch{}
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify({state:s,report}));}catch{document.querySelector('#live').textContent='تعذّر الحفظ على الجهاز.';}}
let announcedDraw=null;
// A newly drawn card slides in once, not again on every later re-render.
function freshDraw(){const d=s.last?.kind==='turn'?s.last.drawn:null;if(d&&d!==announcedDraw){announcedDraw=d;return d;}return null;}
function render(){root.innerHTML=s.screen==='title'?titleView(s):s.screen==='relic'?relicView(s):s.screen==='reward'?rewardView(s):s.screen==='end'?endView(s):gameView(s,selection,resolving,resolving?null:freshDraw());}
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

function details(uid){const c=def(uid,s);show(esc(c.name),`<div class="prototype-details"><div>${effectFormula(uid,s)}</div><p>${esc(c.text)}</p><p>تتفعّل حين يُختار خطها، وكذلك حين تُوضع بطاقة في الخط المتعامد معها. تبقى حتى يكتمل خطها المختار فيُفرَّغ؛ والأرض تبقى حتى نهاية المواجهة.</p></div>`);}
function help(){show('مختبر التوليفات','<ol><li>اسحب بطاقة إلى خانة فارغة (أو اضغط البطاقة ثم الخانة). اضغط الخانة المختارة مرة أخرى لتبديل التفعيل بين صف وعمود؛ ويتذكر اللعب آخر اتجاه استخدمته. مفتاح X يبدّل أيضًا.</li><li>راجع المعاينة ثم اضغط «نفّذ التوليفة». تتفعّل البطاقة الجديدة وكل بطاقات الخط المختار حتى لو كان ناقصًا.</li><li>الصف من اليمين لليسار، والعمود من الأعلى للأسفل. الأرقام على الشبكة توضح الترتيب.</li><li>الخط المكتمل المختار يُفرّغ بعد التفعيل. غير المختار يبقى حتى لو اكتمل. بطاقة «⏳ تزول» تُفعَّل مع الخط ثم تغادر ولا تُكمله، فتبقى بقية بطاقاته.</li><li>الأوراق المفرّغة تذهب للمستهلك، ويُعاد خلطه عند نفاد رزمة السحب.</li><li>بطاقة واحدة في الدور، ثم يرد الأعداء الأحياء. الحماية للرد الحالي فقط، وتسحب بطاقة بعد الحسم.</li><li>كل هجمات التوليفة تستهدف العدو المختار. إن مات، لا ينتقل الضرر لعدو آخر؛ الحماية تظل تعمل.</li><li>تحصين المرقبة: يعمل كالإشعال لكن بالدرع؛ تصير خانته خضراء وأي بطاقة تُفعَّل فيها تمنح درعًا إضافيًا.</li><li>إشعال النار: تتفعّل ثم تُفرَّغ فورًا وتصير خانتها حمراء؛ أي بطاقة تُفعَّل فيها تلحق ضررًا إضافيًا، والإشعال المتكرر يتراكم. تعود الخانة طبيعية حين يكتمل خطها.</li><li>تقدّم محمي: ضرر واحد وحماية واحدة، ويصبح الضرر اثنين إذا اكتمل الخط المختار.</li></ol>');}
let beatTimer=null;
function newGame(){clearTimeout(beatTimer);beatTimer=null;cancelCombat?.();cancelCombat=null;resolving=null;s=startRun(fresh());report=begin(s);selection=emptySelection();if(menu.open)menu.close();save();render();}
function commit(a){
  if(resolving)return;
  const before=s,result=activate(before,a);if(!result.valid)return;
  report=record(report||begin(before),before,a,result);s=result.state;
  selection={...emptySelection(),target:a.target??null};save();
  if(result.summary.kind!=='turn'){render();playSfx('select');return;}
  const grid=[...before.grid];grid[a.cell]=a.card;
  resolving={grid,cells:result.summary.clearedCells,activeCells:result.summary.cells};
  root.innerHTML=gameView({...before,hand:s.hand,last:null},selection,resolving);
  cancelCombat=playCombatFeedback({root,summary:result.summary,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,onSound:type=>{playSfx(type);haptic(type);},onComplete:()=>{
    resolving=null;cancelCombat=null;
    if(s.screen==='reward'||s.screen==='end'){
      // Hold the final board for a beat so the last blow lands before the result screen.
      root.innerHTML=gameView({...s,screen:'play',last:null},selection,null);
      if(s.screen==='reward'||s.outcome==='victory')playSfx('victory');else if(s.outcome==='defeat')playSfx('defeat');
      beatTimer=setTimeout(()=>{beatTimer=null;render();},matchMedia('(prefers-reduced-motion: reduce)').matches?300:1000);
    }else{render();if(s.last?.drawn)playSfx('draw');}
  }});
  document.querySelector('#live').textContent=`ألحقت ${num(result.summary.hits)} ضرر. اكتسبت ${num(result.summary.block)} حماية. منعت ${num(result.summary.prevented)} ضرر. خسرت ${num(result.summary.enemyDamage)} صحة.${result.summary.enemyAttackReduction?` خُفّض هجوم العدو ${num(result.summary.enemyAttackReduction)}.`:''}${result.summary.events.some(e=>e.type==='ignite')?' صارت الخانة مشتعلة.':''}${result.summary.events.some(e=>e.type==='fortify')?' صارت الخانة محصنة.':''}`;
}
function action(name){
  if(name==='close'){menu.close();return;}
  if(name==='fullscreen'){requestFullscreenFromGesture(true);return;}
  if(name==='restart'){requestFullscreenFromGesture();newGame();return;}
  if(name==='retry'){commit({kind:'retry'});return;}
  if(name==='help'){help();return;}
  if(name==='menu'){show('الشنفرى · مختبر التوليفات',`<nav class="menu-options">${button('أكمل اللعب','close','gold-button')}${button('شرح اللعب','help')}${button(isMuted()?'تشغيل الصوت':'كتم الصوت','audio')}${button('تحميل تقرير اللعب','export')}${button('ابدأ من جديد','restart')}</nav><p>السحب ${num(s.draw.length)} · المستهلك ${num(s.discard.length)} · الرزمة ${num(s.deck.length)}</p>`);return;}
  if(name==='audio'){toggleMute();menu.close();return;}
  if(name==='export'){const url=URL.createObjectURL(new Blob([textReport(report)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='shanfara-report.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return;}
  if(resolving)return;
  if(name==='start'){requestFullscreenFromGesture();s=startRun(s);report=begin(s);save();render();playSfx('select');}
  else if(name==='confirm-play')commit({card:selection.card,cell:selection.cell,axis:selection.axis,face:0,target:targetForAction(s,selection)});
}
document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b||b.disabled)return;
  if(b.dataset.action==='relic'){if(!resolving)commit({kind:'relic',id:b.dataset.id});return;}
  if(b.dataset.action==='pick'){if(!resolving)commit({kind:'pick',type:b.dataset.type});return;}
  if(b.dataset.action){action(b.dataset.action);return;}
  if(resolving||s.screen!=='play')return;
  if(b.dataset.info){details(b.dataset.info);return;}
  if(b.dataset.target){selection.target=b.dataset.target;render();return;}
  if(b.dataset.card){chooseCard(b.dataset.card);return;}
  if(b.dataset.axis){setAxis(b.dataset.axis);render();return;}
  if(b.dataset.cell!==undefined){chooseCell(Number(b.dataset.cell));}
});
function setAxis(axis){selection.axis=axis;lastAxis=axis;try{localStorage.setItem('shanfara-axis',axis);}catch{}}
// Changing the card keeps a still-valid cell and direction, so cards can be compared on the same spot.
function chooseCard(uid){
  selection.card=uid;if(selection.cell!==null&&s.grid[selection.cell])selection.cell=null;
  selection.axis=selection.axis||lastAxis;render();playSfx('select');
}
// Pressing the chosen cell again flips row <-> column.
function chooseCell(cell){
  if(s.grid[cell]){details(s.grid[cell]);return;}
  if(!selection.card){document.querySelector('#live').textContent='اختر بطاقة أولًا.';return;}
  if(selection.cell===cell&&selection.axis){setAxis(selection.axis==='row'?'column':'row');document.querySelector('#live').textContent=`الاتجاه: ${AXIS_NAME[selection.axis]}.`;}
  else{selection.cell=cell;if(!selection.axis)setAxis(lastAxis);}
  render();playSfx('select');
}
// Dragging a hand card onto an empty cell places it in one gesture. Tapping still works as before.
let drag=null,dragEndedAt=0;
const cellUnder=(x,y)=>{const el=document.elementFromPoint(x,y)?.closest('.grid-cell');return el&&!el.classList.contains('has-card')?el:null;};
function endDrag(){if(!drag)return;drag.ghost?.remove();drag.source?.classList.remove('is-dragging');document.querySelectorAll('.is-drop-target').forEach(el=>el.classList.remove('is-drop-target'));drag=null;}
document.addEventListener('pointerdown',e=>{
  if(resolving||s.screen!=='play'||!e.isPrimary||e.button>0)return;
  const source=e.target.closest('[data-hand-card]');if(!source||e.target.closest('.card-details'))return;
  drag={uid:source.dataset.handCard,source,x:e.clientX,y:e.clientY,active:false,pointer:e.pointerId,ghost:null};
});
document.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.pointer)return;
  if(!drag.active){
    if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<10)return;
    drag.active=true;drag.source.classList.add('is-dragging');
    const ghost=drag.source.cloneNode(true);ghost.removeAttribute('data-hand-card');ghost.classList.add('drag-ghost');ghost.style.width=`${Math.min(110,drag.source.offsetWidth*.7)}px`;document.body.append(ghost);drag.ghost=ghost;
  }
  drag.ghost.style.transform=`translate(${e.clientX-40}px,${e.clientY-30}px)`;
  const target=cellUnder(e.clientX,e.clientY);
  for(const el of document.querySelectorAll('.is-drop-target'))if(el!==target)el.classList.remove('is-drop-target');
  target?.classList.add('is-drop-target');
});
document.addEventListener('pointerup',e=>{
  if(!drag||e.pointerId!==drag.pointer)return;
  if(drag.active){
    const target=cellUnder(e.clientX,e.clientY),uid=drag.uid;dragEndedAt=Date.now();endDrag();
    if(target&&!resolving&&s.screen==='play'){selection.card=uid;selection.cell=Number(target.dataset.cell);selection.axis=selection.axis||lastAxis;render();playSfx('select');}
  }else endDrag();
});
document.addEventListener('pointercancel',endDrag);
// A drag must not also register as a tap on whatever lies under the pointer.
document.addEventListener('click',e=>{if(Date.now()-dragEndedAt<300){e.stopPropagation();e.preventDefault();}},true);
document.addEventListener('keydown',e=>{
  if(menu.open||resolving||s.screen!=='play')return;
  if(e.key==='Escape'){selection=emptySelection();render();}
  if(/^[1-9]$/.test(e.key)&&!e.ctrlKey&&!e.metaKey&&s.hand[Number(e.key)-1])chooseCard(s.hand[Number(e.key)-1]);
  if((e.key==='x'||e.key==='X'||e.key==='س')&&selection.cell!==null){setAxis(selection.axis==='row'?'column':'row');render();}
});
render();
