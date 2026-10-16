import { CARDS, APPROACHES, fresh, play, exert, endTurn, reason, distance, intent, targets, movementTargets, leap, drink, forecast } from './engine.mjs';

function getLegalActions(s) {
  let actions = [];
  if (s.phase !== 'battle') return actions;

  // 1. Play cards
  for (let i = 0; i < s.hand.length; i++) {
    let cardId = s.hand[i];
    let card = CARDS[cardId];
    if (targets(card)) {
      for (let enemy of s.enemies) {
        if (enemy.hp > 0 && !reason(s, cardId, enemy)) {
          actions.push({ type: 'play', index: i, cardId, targetId: enemy.id });
        }
      }
    } else {
      if (!reason(s, cardId, null)) {
        actions.push({ type: 'play', index: i, cardId, targetId: null });
      }
    }
  }

  // 2. Exert
  if (!s.exerted) {
    actions.push({ type: 'exert' });
  }

  // 3. Drink
  if (!s.waterUsed && s.water > 0 && s.energy >= 1 && (s.strain > 0 || s.hp < s.maxHp)) {
    actions.push({ type: 'drink' });
  }

  // 4. Leap
  let targetsMove = movementTargets(s);
  if (!s.leaped && targetsMove.length > 0 && s.hand.length > 0) {
    for (let i = 0; i < s.hand.length; i++) {
      let cardId = s.hand[i];
      if (s.ruleset === 'lure' && CARDS[cardId].unplayable) continue;
      for (let dest of targetsMove) {
        actions.push({ type: 'leap', index: i, cardId, dest });
      }
    }
  }

  return actions;
}

let s = fresh(1, 'trail');
let actions = getLegalActions(s);
console.log(`Initial legal actions count: ${actions.length}`);
console.log(actions.map(a => a.type === 'play' ? `play ${a.cardId} on ${a.targetId}` : a.type));
