import { CARDS, fresh, play, exert, endTurn, reason, targets, movementTargets, leap, drink, forecast } from './engine.mjs';

function evaluateState(s) {
  if (s.phase === 'victory') return 100000;
  if (s.phase === 'defeat' || s.hp <= 0) return -100000;

  let fc = forecast(s);
  let incomingLoss = fc.reduce((sum, f) => sum + f.hpLoss, 0);
  let enemyHpTotal = s.enemies.reduce((sum, e) => sum + e.hp, 0);
  let deadEnemies = s.enemies.filter(e => e.hp <= 0).length;

  // Score components:
  // 1. Victory / defeat heavily weighted
  // 2. Dead enemies are worth massive points (removes threat)
  // 3. Enemy HP reduction: 10 points per damage dealt
  // 4. Net player HP: player HP minus incoming damage
  // 5. Strain penalty: strain >= 4 is especially bad
  // 6. Rock position: safe bonus (+3)
  let netHp = s.hp - incomingLoss;
  let score = (deadEnemies * 1000)
            - (enemyHpTotal * 20)
            + (netHp * 15)
            - (s.strain * 5)
            - (s.discard.filter(c => c === 'weary').length * 25);

  return score;
}

function solveTurn(state) {
  // We explore state transitions within the current turn until endTurn is called.
  // Beam search:
  let beam = [{ state, actions: [] }];
  let bestTerminal = null;
  let bestScore = -Infinity;

  let iterations = 0;
  while (beam.length > 0 && iterations < 300) {
    iterations++;
    let nextBeam = [];

    for (let candidate of beam) {
      let s = candidate.state;
      if (s.phase !== 'battle') {
        let score = evaluateState(s);
        if (score > bestScore) {
          bestScore = score;
          bestTerminal = candidate;
        }
        continue;
      }

      // Option to end turn here:
      let endState = structuredClone(s);
      endTurn(endState);
      let endScore = evaluateState(endState);
      if (endScore > bestScore) {
        bestScore = endScore;
        bestTerminal = { state: endState, actions: [...candidate.actions, { type: 'endTurn' }] };
      }

      // Legal actions:
      // 1. Play cards
      for (let i = 0; i < s.hand.length; i++) {
        let cardId = s.hand[i];
        let c = CARDS[cardId];
        if (targets(c)) {
          for (let enemy of s.enemies) {
            if (enemy.hp > 0 && !reason(s, cardId, enemy)) {
              let nextS = structuredClone(s);
              let res = play(nextS, i, enemy.id);
              if (!res.error) {
                nextBeam.push({
                  state: nextS,
                  actions: [...candidate.actions, { type: 'play', cardId, targetId: enemy.id, index: i }]
                });
              }
            }
          }
        } else {
          if (!reason(s, cardId, null)) {
            let nextS = structuredClone(s);
            let res = play(nextS, i, null);
            if (!res.error) {
              nextBeam.push({
                state: nextS,
                actions: [...candidate.actions, { type: 'play', cardId, targetId: null, index: i }]
              });
            }
          }
        }
      }

      // 2. Exert (only if we have playable cards or useful energy actions)
      if (!s.exerted && s.energy < 3) {
        let nextS = structuredClone(s);
        if (exert(nextS)) {
          nextBeam.push({
            state: nextS,
            actions: [...candidate.actions, { type: 'exert' }]
          });
        }
      }

      // 3. Drink (if hurt or strained)
      if (!s.waterUsed && s.water > 0 && s.energy >= 1 && (s.strain > 0 || s.hp < s.maxHp)) {
        let nextS = structuredClone(s);
        let res = drink(nextS);
        if (!res.error) {
          nextBeam.push({
            state: nextS,
            actions: [...candidate.actions, { type: 'drink' }]
          });
        }
      }

      // 4. Leap
      let moveDests = movementTargets(s);
      if (!s.leaped && moveDests.length > 0 && s.hand.length > 0) {
        for (let i = 0; i < s.hand.length; i++) {
          let cardId = s.hand[i];
          if (s.ruleset === 'lure' && CARDS[cardId].unplayable) continue;
          // Prefer discarding weary or low priority card
          for (let dest of moveDests) {
            let nextS = structuredClone(s);
            let res = leap(nextS, i, dest);
            if (!res.error) {
              nextBeam.push({
                state: nextS,
                actions: [...candidate.actions, { type: 'leap', cardId, dest }]
              });
            }
          }
        }
      }
    }

    // Deduplicate / prune nextBeam
    // Signature: pos, energy, hp, block, strain, enemies hp & pos, hand sorted
    let seen = new Map();
    for (let item of nextBeam) {
      let st = item.state;
      let sig = `${st.pos}_${st.energy}_${st.block}_${st.strain}_${st.hp}_` +
                st.enemies.map(e => `${e.hp}@${e.pos}`).join('_') + '_' +
                st.hand.slice().sort().join(',');
      let score = evaluateState(st);
      if (!seen.has(sig) || seen.get(sig).score < score) {
        seen.set(sig, { item, score });
      }
    }

    let sorted = Array.from(seen.values()).sort((a, b) => b.score - a.score);
    // Keep top 25
    beam = sorted.slice(0, 25).map(x => x.item);
  }

  return bestTerminal;
}

let game = fresh(42, 'trail');
console.log('Starting test game with Trail approach:');
let turnCount = 0;
while (game.phase === 'battle' && turnCount < 10) {
  turnCount++;
  console.log(`\n--- Turn ${turnCount} (HP: ${game.hp}, Pos: ${game.pos}) ---`);
  let res = solveTurn(game);
  if (!res) {
    console.log('No moves found! Ending turn directly.');
    endTurn(game);
  } else {
    console.log('Actions taken:');
    for (let act of res.actions) {
      console.log(' -', act);
    }
    game = res.state;
  }
}

console.log(`\nGame Ended: Phase=${game.phase}, Turns=${game.turn}, Final HP=${game.hp}/${game.maxHp}`);
