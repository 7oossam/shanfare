import test from 'node:test';
import assert from 'node:assert/strict';
import { fresh, start } from '../dist/engine.mjs';
import { gameView, effectFormula, preview } from '../dist/view.mjs';
import { stateWith } from './helpers.mjs';

test('Game exposes one six-slot grid, five dual-face cards and no manual execution control',()=>{const s=start(fresh());const html=gameView(s,{card:null,cell:null,face:0});assert.equal((html.match(/class="grid-cell /g)||[]).length,6);assert.equal((html.match(/class="card-face /g)||[]).length,10);assert.ok(!html.includes('data-action="activate"'));assert.ok(!/تقدّم|خطوات|المسار/.test(html));});
test('Damage formula uses the live numeric credit and icons',()=>{const s=start(fresh());s.momentum=3;const html=effectFormula('arrow.0',s,0);assert.ok(html.includes('icon-swords'));assert.ok(html.includes('icon-fire'));assert.ok(html.includes('>٣<'));assert.ok(html.includes('يصرف كل'));assert.ok(!html.includes('كل الزخم'));});
test('Hover preview uses line-generated credit without changing the save',()=>{const s=stateWith({grid:['focus.0'],hand:['arrow.0']});const before=structuredClone(s);const p={card:'arrow.0',cell:3,face:0};const r=preview(s,p);assert.equal(r.summary.hits,4);const html=gameView(s,p);assert.ok(html.includes('٢'));assert.ok(html.includes('يكتمل العمود'));assert.deepEqual(s,before);});
test('Emergency arrow shows fixed damage and preserves-credit hint',()=>{const s=start(fresh());const html=effectFormula('arrow.0',s,1);assert.ok(html.includes('يحفظ'));assert.ok(html.includes('>٤<'));assert.ok(!html.includes('يصرف كل'));});
