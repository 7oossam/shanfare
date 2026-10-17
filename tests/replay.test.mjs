import test from 'node:test';
import assert from 'node:assert/strict';
import { fresh, start, activate, actions, assertState, snapshot } from '../dist/engine.mjs';
import { begin, record, restore } from '../dist/report.mjs';

test('Save and replay reproduce staged cards, faces, targets, and immediate effects',()=>{let s=start(fresh(91));let report=begin(s);for(const a of [{card:'focus.0',cell:0,face:1,target:'scout'},{card:'arrow.0',cell:1,face:0,target:'scout'}]){const r=activate(s,a);assert.ok(r.valid);report=record(report,s,a,r);s=r.state;}const save=JSON.parse(JSON.stringify({state:s,report}));assert.equal(restore(save.report,save.state).coverage,'complete');assert.deepEqual(save.report.final,snapshot(s));assert.equal(save.state.exhausted.length,0);assert.equal(save.state.grid[0],null);assert.equal(save.state.turn,3);});
test('Corrupted replay falls back to a partial report without changing saved state',()=>{const s=start(fresh());const before=structuredClone(s);const r=begin(s);r.initial.hp=0;assert.equal(restore(r,s).coverage,'partial');assert.deepEqual(s,before);});
test('Long sequences preserve card conservation for many seeds',()=>{for(let seed=1;seed<=12;seed++){let s=start(fresh(seed));for(let n=0;n<80&&s.screen!=='end';n++){const legal=actions(s);const a=legal[(seed*31+n*17)%legal.length];assert.ok(a);s=activate(s,a).state;assertState(s);}}});
