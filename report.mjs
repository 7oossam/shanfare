import { VERSION, activate, snapshot } from './engine.mjs?v=9';
export const begin = s => ({ version: VERSION, initial: snapshot(s), events: [], final: snapshot(s), coverage: 'complete' });
export function record(r, before, action, result) { return { ...r, events: [...r.events, { action: structuredClone(action), after: snapshot(result.state), summary: result.summary }], final: snapshot(result.state) }; }
export function restore(raw, s) {
  try {
    if (raw?.version === VERSION) {
      let state = raw.initial;
      for (const e of raw.events) { const r = activate(state, e.action); if (!r.valid || JSON.stringify(snapshot(r.state)) !== JSON.stringify(e.after)) throw Error(); state = r.state; }
      if (JSON.stringify(snapshot(state)) === JSON.stringify(snapshot(s))) return raw;
    }
  } catch {}
  return { ...begin(s), coverage: 'partial' };
}
export const textReport = r => JSON.stringify(r, null, 2);
