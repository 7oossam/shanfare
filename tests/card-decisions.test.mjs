import test from 'node:test';
import assert from 'node:assert/strict';
import { fresh, start } from '../dist/engine.mjs';
import { faceEffectLines, cardDecision, preview, gameView } from '../dist/view.mjs';

test('Both faces expose numbers and costs without opening card details', () => {
  const s = start(fresh(77));
  assert.deepEqual(faceEffectLines('run.0', s, 0), ['+٢ زخم', 'تقدّم ٢']);
  assert.deepEqual(faceEffectLines('run.0', s, 1), ['+٣ زخم', 'تقدّم ٣']);
  assert.deepEqual(faceEffectLines('knife.0', s, 0), ['−١ صحة', '٣ ضرر']);
  const html = gameView(s, {card:null,cell:null,axis:null,face:null,target:null});
  assert.equal((html.match(/class="hand-face face-/g)||[]).length,s.hand.length*2);
  assert.equal((html.match(/class="hand-face-life"/g)||[]).length,s.hand.length*2);
  assert.ok(!html.includes('hand-face-toggle'));
});

test('Decision reflects resolved bow credit and updates on face change without mutating state', () => {
  const s = start(fresh(78));
  const before = structuredClone(s);
  const p = {card:'arrow.0',cell:1,axis:'row',face:0,target:'scout'};
  const result = preview(s,p);
  const d = cardDecision(s,p,result);
  assert.ok(d.text.includes('٢ أساس + ٢ زخم = ٤ ضرر'));
  assert.ok(d.outcome.includes('تبقى البطاقة'));
  const alternative = cardDecision(s,{...p,face:1});
  assert.ok(alternative.text.includes('تضيف هذه البطاقة ٢ زخم'));
  assert.ok(alternative.outcome.includes('تُطرح البطاقة'));
  assert.ok(!alternative.text.includes('سهم الموضع'));
  assert.deepEqual(s,before);
});

test('Decision explains full-line removal and incomplete placement honestly', () => {
  const s = start(fresh(79));
  s.hand=s.hand.filter(x=>x!=='arrow.1');
  s.grid[2]='arrow.1';
  const p={card:'arrow.0',cell:1,axis:'row',face:0,target:'scout'};
  const d=cardDecision(s,p);
  assert.ok(d.outcome.includes('تُزال البطاقة مع اكتمال الخط'));
  assert.ok(d.text.includes('سهم الموضع ٢: ٢ أساس + ٢ زخم = ٤ ضرر'));
  assert.ok(d.text.includes('سهم الموضع ٣: ٢ أساس + ٠ زخم = ٢ ضرر'));
  const unstaged=cardDecision(s,{...p,cell:null,axis:null});
  assert.ok(unstaged.outcome.includes('اختر موضعًا'));
  assert.ok(!unstaged.text.includes('٤ ضرر'));
});
