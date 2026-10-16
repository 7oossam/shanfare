import { CARDS, APPROACHES, BOONS, fresh, play, exert, endTurn, reason, distance, intent, targets, cardEffect, movementTargets, leap, drink, terrain, forecast, isolated } from './engine.mjs';

// --- EVALUATOR FUNCTIONS FOR DIFFERENT AGENT ARCHETYPES ---

function evalTactical(s) {
  if (s.phase === 'victory') return 100000;
  if (s.phase === 'defeat' || s.hp <= 0) return -100000;

  let fc = forecast(s);
  let incomingLoss = fc.reduce((sum, f) => sum + f.hpLoss, 0);
  let enemyHpTotal = s.enemies.reduce((sum, e) => sum + e.hp, 0);
  let deadEnemies = s.enemies.filter(e => e.hp <= 0).length;

  let netHp = s.hp - incomingLoss;
  let wearyCount = s.discard.filter(c => c === 'weary').length + s.hand.filter(c => c === 'weary').length;

  return (deadEnemies * 2000)
       - (enemyHpTotal * 25)
       + (netHp * 15)
       - (s.strain * 4)
       - (wearyCount * 30)
       + (terrain(s.pos) === 'rock' ? 8 : 0);
}

function evalAggressive(s) {
  if (s.phase === 'victory') return 100000;
  if (s.phase === 'defeat' || s.hp <= 0) return -100000;

  let fc = forecast(s);
  let incomingLoss = fc.reduce((sum, f) => sum + f.hpLoss, 0);
  let enemyHpTotal = s.enemies.reduce((sum, e) => sum + e.hp, 0);
  let deadEnemies = s.enemies.filter(e => e.hp <= 0).length;

  // Heavily favors damage dealt, ignores incoming damage unless lethal
  let netHp = s.hp - incomingLoss;
  return (deadEnemies * 3000)
       - (enemyHpTotal * 50)
       + (netHp > 0 ? 5 : -50000);
}

function evalDefensive(s) {
  if (s.phase === 'victory') return 100000;
  if (s.phase === 'defeat' || s.hp <= 0) return -100000;

  let fc = forecast(s);
  let incomingLoss = fc.reduce((sum, f) => sum + f.hpLoss, 0);
  let enemyHpTotal = s.enemies.reduce((sum, e) => sum + e.hp, 0);
  let deadEnemies = s.enemies.filter(e => e.hp <= 0).length;

  let netHp = s.hp - incomingLoss;
  let wearyCount = s.discard.filter(c => c === 'weary').length + s.hand.filter(c => c === 'weary').length;

  // Heavily favors remaining HP, block, rock position, zero damage taken
  return (deadEnemies * 1500)
       - (enemyHpTotal * 15)
       + (netHp * 40)
       - (incomingLoss * 30)
       - (s.strain * 10)
       - (wearyCount * 40)
       + (terrain(s.pos) === 'rock' ? 20 : 0);
}

// --- TURN SEARCH / AGENT DECISION ---

function searchTurn(state, evaluator, beamWidth = 20, maxDepth = 250) {
  let beam = [{ state, actions: [] }];
  let bestTerminal = null;
  let bestScore = -Infinity;
  let iterations = 0;

  while (beam.length > 0 && iterations < maxDepth) {
    iterations++;
    let nextBeam = [];

    for (let candidate of beam) {
      let s = candidate.state;
      if (s.phase !== 'battle') {
        let score = evaluator(s);
        if (score > bestScore) {
          bestScore = score;
          bestTerminal = candidate;
        }
        continue;
      }

      // Check ending turn here
      let endState = structuredClone(s);
      endTurn(endState);
      let endScore = evaluator(endState);
      if (endScore > bestScore) {
        bestScore = endScore;
        bestTerminal = { state: endState, actions: [...candidate.actions, { type: 'endTurn' }] };
      }

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

      // 2. Exert (if energy < 3 and hasn't exerted)
      if (!s.exerted && s.energy < 3) {
        let nextS = structuredClone(s);
        if (exert(nextS)) {
          nextBeam.push({
            state: nextS,
            actions: [...candidate.actions, { type: 'exert' }]
          });
        }
      }

      // 3. Drink
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

    // Prune nextBeam
    let seen = new Map();
    for (let item of nextBeam) {
      let st = item.state;
      let sig = `${st.pos}_${st.energy}_${st.block}_${st.strain}_${st.hp}_` +
                st.enemies.map(e => `${e.hp}@${e.pos}`).join('_') + '_' +
                st.hand.slice().sort().join(',');
      let score = evaluator(st);
      if (!seen.has(sig) || seen.get(sig).score < score) {
        seen.set(sig, { item, score });
      }
    }

    let sorted = Array.from(seen.values()).sort((a, b) => b.score - a.score);
    beam = sorted.slice(0, beamWidth).map(x => x.item);
  }

  return bestTerminal;
}

// Novice Player: Greedy single-step heuristic with 20% random exploration
function playNoviceTurn(state, rng) {
  let s = structuredClone(state);
  let actions = [];

  while (s.phase === 'battle') {
    // Collect all valid actions
    let legal = [];

    // Play cards
    for (let i = 0; i < s.hand.length; i++) {
      let cardId = s.hand[i];
      let c = CARDS[cardId];
      if (targets(c)) {
        for (let enemy of s.enemies) {
          if (enemy.hp > 0 && !reason(s, cardId, enemy)) {
            legal.push({ type: 'play', index: i, cardId, targetId: enemy.id });
          }
        }
      } else {
        if (!reason(s, cardId, null)) {
          legal.push({ type: 'play', index: i, cardId, targetId: null });
        }
      }
    }

    // Exert
    if (!s.exerted && s.energy <= 1) {
      legal.push({ type: 'exert' });
    }

    // Drink
    if (!s.waterUsed && s.water > 0 && s.energy >= 1 && (s.hp <= s.maxHp - 3 || s.strain >= 3)) {
      legal.push({ type: 'drink' });
    }

    // Leap (cautious, only if adjacent enemy or stuck)
    let moveDests = movementTargets(s);
    if (!s.leaped && moveDests.length > 0 && s.hand.length > 0) {
      let adjacentEnemy = s.enemies.some(e => e.hp > 0 && distance(s, e) <= 1);
      if (adjacentEnemy || rng() < 0.2) {
        for (let i = 0; i < s.hand.length; i++) {
          let cardId = s.hand[i];
          if (s.ruleset === 'lure' && CARDS[cardId].unplayable) continue;
          for (let dest of moveDests) {
            legal.push({ type: 'leap', index: i, cardId, dest });
          }
        }
      }
    }

    // Option to end turn
    legal.push({ type: 'endTurn' });

    // Pick an action: 20% random valid, 80% best immediate heuristic
    let chosen = null;
    if (rng() < 0.2 && legal.length > 1) {
      let nonEnd = legal.filter(a => a.type !== 'endTurn');
      chosen = nonEnd[Math.floor(rng() * nonEnd.length)];
    } else {
      let bestActScore = -Infinity;
      for (let act of legal) {
        let testS = structuredClone(s);
        let score = 0;
        if (act.type === 'play') {
          play(testS, act.index, act.targetId);
          score = evalTactical(testS);
        } else if (act.type === 'exert') {
          exert(testS);
          score = evalTactical(testS);
        } else if (act.type === 'drink') {
          drink(testS);
          score = evalTactical(testS);
        } else if (act.type === 'leap') {
          leap(testS, act.index, act.dest);
          score = evalTactical(testS);
        } else if (act.type === 'endTurn') {
          endTurn(testS);
          score = evalTactical(testS);
        }
        if (score > bestActScore) {
          bestActScore = score;
          chosen = act;
        }
      }
    }

    if (!chosen || chosen.type === 'endTurn') {
      endTurn(s);
      actions.push({ type: 'endTurn' });
      break;
    }

    // Execute chosen
    if (chosen.type === 'play') {
      play(s, chosen.index, chosen.targetId);
      actions.push(chosen);
    } else if (chosen.type === 'exert') {
      exert(s);
      actions.push(chosen);
    } else if (chosen.type === 'drink') {
      drink(s);
      actions.push(chosen);
    } else if (chosen.type === 'leap') {
      leap(s, chosen.index, chosen.dest);
      actions.push(chosen);
    }
  }

  return { state: s, actions };
}

// --- SINGLE GAME SIMULATION ---

function runGame(seed, approach, boon, playerType = 'tactical') {
  let s = fresh(seed, approach, boon);

  let gameStats = {
    seed,
    approach,
    boon,
    playerType,
    result: 'defeat',
    turns: 0,
    hpLeft: 0,
    damageTaken: 0,
    strainAccumulated: 0,
    wearyGenerated: 0,
    waterUsed: 0,
    exertsUsed: 0,
    leapsUsed: 0,
    turnsOnRock: 0,
    firstEnemyKilled: null,
    firstKillTurn: null,
    cardsDrawn: {},
    cardsPlayed: {},
    cardDamage: {},
    cardBlock: {},
    cardWeak: {}
  };

  for (let cardId of Object.keys(CARDS)) {
    gameStats.cardsDrawn[cardId] = 0;
    gameStats.cardsPlayed[cardId] = 0;
    gameStats.cardDamage[cardId] = 0;
    gameStats.cardBlock[cardId] = 0;
    gameStats.cardWeak[cardId] = 0;
  }

  let evaluator = evalTactical;
  if (playerType === 'aggressive') evaluator = evalAggressive;
  if (playerType === 'defensive') evaluator = evalDefensive;

  let localSeed = seed;
  let localRng = () => {
    localSeed = (localSeed * 1664525 + 1013904223) >>> 0;
    return localSeed / 4294967296;
  };

  let maxTurns = 20;
  while (s.phase === 'battle' && s.turn <= maxTurns) {
    // Record cards drawn in hand
    for (let c of s.hand) {
      gameStats.cardsDrawn[c] = (gameStats.cardsDrawn[c] || 0) + 1;
    }

    if (terrain(s.pos) === 'rock') gameStats.turnsOnRock++;

    let turnResult;
    if (playerType === 'novice') {
      turnResult = playNoviceTurn(s, localRng);
    } else {
      turnResult = searchTurn(s, evaluator);
    }

    if (!turnResult) {
      endTurn(s);
    } else {
      for (let act of turnResult.actions) {
        if (act.type === 'play') {
          gameStats.cardsPlayed[act.cardId] = (gameStats.cardsPlayed[act.cardId] || 0) + 1;
        } else if (act.type === 'exert') {
          gameStats.exertsUsed++;
        } else if (act.type === 'drink') {
          gameStats.waterUsed++;
        } else if (act.type === 'leap') {
          gameStats.leapsUsed++;
        }
      }
      s = turnResult.state;
    }

    // Check first enemy killed
    if (!gameStats.firstEnemyKilled) {
      let dead = s.enemies.filter(e => e.hp <= 0);
      if (dead.length > 0) {
        gameStats.firstEnemyKilled = dead[0].id;
        gameStats.firstKillTurn = s.turn;
      }
    }
  }

  gameStats.result = s.phase === 'victory' ? 'victory' : 'defeat';
  gameStats.turns = s.turn;
  gameStats.hpLeft = s.hp;
  gameStats.damageTaken = s.damageTaken;
  gameStats.strainAccumulated = s.strain;
  gameStats.wearyGenerated = s.discard.filter(c => c === 'weary').length + s.hand.filter(c => c === 'weary').length;

  return gameStats;
}

// --- SUITE RUNNER ---

export function runSuite(numGames = 100) {
  console.log(`Starting Simulation Suite: ${numGames} games per configuration...\n`);

  let approaches = ['ridge', 'trail', 'valley'];
  let playerTypes = ['tactical', 'aggressive', 'defensive', 'novice'];

  let results = {};

  for (let app of approaches) {
    results[app] = {};
    for (let pt of playerTypes) {
      let wins = 0;
      let totalTurns = 0;
      let totalHpLeft = 0;
      let totalDamageTaken = 0;
      let totalExerts = 0;
      let totalWater = 0;
      let totalLeaps = 0;
      let totalWeary = 0;
      let trackerFirstKills = 0;
      let archerFirstKills = 0;

      let cardStats = {};
      for (let c of Object.keys(CARDS)) {
        cardStats[c] = { drawn: 0, played: 0, winsWhenPlayed: 0 };
      }

      for (let i = 0; i < numGames; i++) {
        let seed = 1000 + i * 37;
        let g = runGame(seed, app, null, pt);
        if (g.result === 'victory') wins++;
        totalTurns += g.turns;
        totalHpLeft += g.hpLeft;
        totalDamageTaken += g.damageTaken;
        totalExerts += g.exertsUsed;
        totalWater += g.waterUsed;
        totalLeaps += g.leapsUsed;
        totalWeary += g.wearyGenerated;

        if (g.firstEnemyKilled === 'guard') trackerFirstKills++;
        if (g.firstEnemyKilled === 'archer') archerFirstKills++;

        for (let [cardId, count] of Object.entries(g.cardsPlayed)) {
          if (count > 0) {
            cardStats[cardId].played += count;
            if (g.result === 'victory') cardStats[cardId].winsWhenPlayed++;
          }
        }
        for (let [cardId, count] of Object.entries(g.cardsDrawn)) {
          cardStats[cardId].drawn += count;
        }
      }

      let winRate = (wins / numGames) * 100;
      let avgTurns = (totalTurns / numGames).toFixed(2);
      let avgHpLeft = (totalHpLeft / numGames).toFixed(1);
      let avgDamageTaken = (totalDamageTaken / numGames).toFixed(1);

      results[app][pt] = {
        winRate,
        avgTurns,
        avgHpLeft,
        avgDamageTaken,
        avgExerts: (totalExerts / numGames).toFixed(2),
        avgWater: (totalWater / numGames).toFixed(2),
        avgLeaps: (totalLeaps / numGames).toFixed(2),
        avgWeary: (totalWeary / numGames).toFixed(2),
        trackerFirstRate: ((trackerFirstKills / numGames) * 100).toFixed(1),
        archerFirstRate: ((archerFirstKills / numGames) * 100).toFixed(1),
        cardStats
      };

      console.log(`Approach: ${app.padEnd(7)} | Archetype: ${pt.padEnd(10)} | WinRate: ${winRate.toFixed(1)}% | Avg Turns: ${avgTurns} | Final HP: ${avgHpLeft}/48 | Dmg Taken: ${avgDamageTaken} | Tracker 1st: ${results[app][pt].trackerFirstRate}%`);
    }
    console.log('---------------------------------------------------------------------------------------------------');
  }

  return results;
}

// Run test with 100 games each if run directly
if (process.argv[1] && process.argv[1].endsWith('simulate.mjs')) {
  runSuite(100);
}
