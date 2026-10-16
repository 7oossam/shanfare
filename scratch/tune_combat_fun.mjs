// Combat Tuning for Maximum Fun, Engagement, and Viable Builds
import { fresh, start, actions, activate, def, cards, ENCOUNTERS, RELICS } from '../dist/engine.mjs';

// Let's test enemy intent cycle and attack values:
// An enemy only attacks on turns where its intent is 'attack'.
// For example:
// Guard: attacks on turns 1, 3, 5... (4 dmg), defends on turns 2, 4... (gains 3 shield)
// Scout: attacks on turns 2, 4... (3 dmg), schemes on turns 1, 3... (marks target)

function calculateTunedThreat(s) {
  let threat = 0;
  for (let i = 0; i < s.enemies.length; i++) {
    const e = s.enemies[i];
    if (e.hp <= 0) continue;

    // Intent alternation:
    // Primary enemy (index 0) attacks on odd phase turns, secondary (index 1) attacks on even phase turns
    // Or if only 1 enemy remains, attacks every turn for moderate damage
    if (s.enemies.filter(x => x.hp > 0).length === 1) {
      threat += Math.min(e.attack, 4);
    } else {
      const isAttackingThisTurn = (i === 0 && s.phaseTurn % 2 === 1) || (i === 1 && s.phaseTurn % 2 === 0) || e.isBoss;
      if (isAttackingThisTurn) {
        threat += e.attack;
      }
    }
  }
  return threat;
}

console.log('Testing tuned enemy intent model...');
