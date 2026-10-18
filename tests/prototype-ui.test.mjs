import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,start,activate,actions,snapshot,assertState} from '../dist/engine.mjs';
import {gameView,preview,effectFormula,titleView} from '../dist/view.mjs';
import {begin,record,restore} from '../dist/report.mjs';
import {combatTimeline} from '../dist/combat-feedback.mjs';

test('Direction and cell selection preview the exact committed state without mutation',()=>{
  const s=start(fresh(91)),before=structuredClone(s);
  const selection={card:s.hand[0],cell:4,axis:'column',target:s.enemies[0].id};
  const projected=preview(s,selection),committed=activate(s,selection);
  assert.deepEqual(projected,committed);assert.deepEqual(s,before);
  assert.equal(preview(s,{...selection,axis:null}),null);
  const html=gameView(s,selection);
  assert.match(html,/data-axis="column" aria-pressed="true"/);
  assert.match(html,/class="line-order">١/);
  assert.match(html,/data-action="confirm-play"/);
});
test('Only three new single-face cards and current encounter controls are rendered',()=>{
  const s=start(fresh()),html=gameView(s,{card:null,cell:null,axis:null});
  assert.equal((html.match(/class="grid-cell /g)||[]).length,9);
  assert.equal((html.match(/class="card-face /g)||[]).length,3);
  assert.ok(!/data-face=|momentum-count|خانة الخطر|طارئ|عزم|مناورة|حامل الترس/.test(html));
  assert.match(html,/ضربة محسوبة/);assert.match(html,/ساتر/);assert.match(html,/تقدّم محمي/);
  assert.match(html,/data-action="confirm-play"[^>]*disabled/);
  assert.match(titleView(s),/١٦ ورقة/);
});
test('Projected mixed card formula shows its completion bonus from engine effects',()=>{
  const s=start(fresh());const advance=s.hand.find(uid=>uid.startsWith('advance.'));
  for(const [cell,type] of [[2,'strike'],[1,'shelter']]){
    const uid=s.draw.find(uid=>uid.startsWith(type+'.'));s.draw.splice(s.draw.indexOf(uid),1);s.grid[cell]=uid;s.faces[uid]=0;
  }
  assertState(s);const p={card:advance,cell:0,axis:'row',target:s.enemies[0].id};
  const projected=preview(s,p);assert.equal(projected.summary.effects.find(f=>f.uid===advance&&f.op==='hit').amount,2);
  assert.match(effectFormula(advance,s,0,projected),/>٢</);
});
test('Replay preserves axis decisions and exactly reproduces multiple turns and transitions',()=>{
  let s=start(fresh(23)),report=begin(s);
  for(let i=0;i<18&&s.screen!=='end';i++){
    const candidates=actions(s).map(a=>({a,r:activate(s,a)}));
    candidates.sort((x,y)=>(y.r.summary?.hits??0)-(x.r.summary?.hits??0));
    const {a,r}=candidates[0];assert.ok(r.valid);report=record(report,s,a,r);s=r.state;
  }
  const saved=JSON.parse(JSON.stringify({state:s,report}));
  assert.equal(restore(saved.report,saved.state).coverage,'complete');
  assert.deepEqual(saved.report.final,snapshot(s));
  const corrupt=structuredClone(report);corrupt.events[0].action.axis='diagonal';
  assert.equal(restore(corrupt,s).coverage,'partial');
});
test('Combat feedback reflects actual damage, block, response and clearing in order',()=>{
  const s=start(fresh()),r=activate(s,{card:s.hand[0],cell:0,axis:'row'});
  const timeline=combatTimeline(r.summary);
  assert.ok(timeline.frames.find(f=>f.event.type==='damage').at<timeline.frames.find(f=>f.event.type==='enemy-attack').at);
  assert.ok(timeline.frames.some(f=>f.event.type==='clear'));
  assert.equal(r.summary.hits,r.summary.events.filter(e=>e.type==='damage').reduce((n,e)=>n+e.amount,0));
});
