import { VERSION, cards, alternates, rewards, actions, activate, snapshot } from './engine.mjs?v=8';

export const begin = s => ({
  version: VERSION,
  runId: globalThis.crypto?.randomUUID?.() || String(Date.now()),
  startedAt: new Date().toISOString(),
  coverage: 'complete',
  initial: snapshot(s),
  events: [],
  final: snapshot(s)
});

export function record(r, before, action, result) {
  const alternatives = actions(before).map(a => {
    const x = activate(before, a);
    return { action: a, after: snapshot(x.state), summary: x.summary };
  });
  const after = snapshot(result.state);
  return {
    ...r,
    events: [
      ...r.events,
      {
        index: r.events.length + 1,
        at: new Date().toISOString(),
        before: snapshot(before),
        action,
        after,
        summary: result.summary,
        alternatives
      }
    ],
    final: after,
    endedAt: after.screen === 'end' ? new Date().toISOString() : null
  };
}

export function restore(raw, s) {
  try {
    if (raw?.version === VERSION && JSON.stringify(raw.final) === JSON.stringify(snapshot(s))) {
      let state = raw.initial;
      for (const e of raw.events) {
        if (JSON.stringify(snapshot(state)) !== JSON.stringify(e.before)) throw Error();
        state = activate(state, e.action).state;
        if (JSON.stringify(snapshot(state)) !== JSON.stringify(e.after)) throw Error();
      }
      if (JSON.stringify(snapshot(state)) !== JSON.stringify(raw.final)) throw Error();
      return raw;
    }
  } catch {}
  return { ...begin(s), coverage: 'partial' };
}

export function exported(r) {
  return {
    ...r,
    game: 'طريق السَّراة: ملحمة الشَّنْفَرَى — رن الصعاليك الكامل',
    cardDefinitions: cards,
    alternateDefinitions: alternates,
    rewardDefinitions: rewards,
    metrics: {
      turns: r.events.filter(e => e.summary.kind === 'turn').length,
      clearedLines: r.events.filter(e => e.summary.cleared?.length).length,
      enemyDamage: r.events.reduce((n, e) => n + (e.summary.enemyDamage || 0), 0),
      selfDamage: r.events.reduce((n, e) => n + (e.summary.selfDamage || 0), 0)
    }
  };
}

export function textReport(r) {
  const x = exported(r);
  return 'تقرير رن ملحمة الشنفرى — طريق السَّراة\n' + JSON.stringify(x, null, 2);
}
