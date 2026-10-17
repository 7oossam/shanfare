import { fresh, start, assertState } from '../dist/engine.mjs';
export function stateWith({ grid = [], hand = [], faces = {}, momentum = 0, encounter = 1 } = {}) {
  const s = start(fresh(51));
  s.encounter = encounter;
  for (const uid of [...grid.filter(Boolean), ...hand]) if (!s.deck.includes(uid)) s.deck.push(uid);
  s.grid = [...grid, ...Array(4 - grid.length).fill(null)]; s.hand = hand;
  s.draw = s.deck.filter(uid => !s.grid.includes(uid) && !hand.includes(uid)); s.discard = []; s.exhausted = [];
  s.faces = Object.fromEntries(s.grid.filter(Boolean).map(uid => [uid, faces[uid] ?? 0])); s.momentum = momentum;
  assertState(s); return s;
}
