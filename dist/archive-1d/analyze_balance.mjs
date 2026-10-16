import { CARDS, APPROACHES, BOONS, fresh, play, exert, endTurn, reason, distance, targets, movementTargets, leap, drink, forecast, terrain, isolated } from './engine.mjs';

// Evaluator for tactical simulation
function evaluateState(s) {
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

function searchTurn(state, beamWidth = 20, maxDepth = 250) {
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
        let score = evaluateState(s);
        if (score > bestScore) {
          bestScore = score;
          bestTerminal = candidate;
        }
        continue;
      }

      let endState = structuredClone(s);
      endTurn(endState);
      let endScore = evaluateState(endState);
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
                  actions: [...candidate.actions, { type: 'play', cardId, targetId: enemy.id, index: i, events: res.events }]
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
                actions: [...candidate.actions, { type: 'play', cardId, targetId: null, index: i, events: res.events }]
              });
            }
          }
        }
      }

      // 2. Exert
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
    beam = sorted.slice(0, beamWidth).map(x => x.item);
  }

  return bestTerminal;
}

// Global stats
let cardAnalytics = {};
for (let c of Object.keys(CARDS)) {
  cardAnalytics[c] = {
    drawn: 0,
    played: 0,
    dmgTotal: 0,
    blockTotal: 0,
    weakTotal: 0,
    winsWhenDrawn: 0,
    winsWhenPlayed: 0
  };
}

let generalStats = {
  totalGames: 0,
  wins: 0,
  losses: 0,
  turns: 0,
  hpLeft: 0,
  damageTaken: 0,
  exertsUsed: 0,
  waterUsed: 0,
  leapsUsed: 0,
  wearyAdded: 0,
  strainPeakTotal: 0,
  wolfTriggers: 0,
  trackerKilledFirst: 0,
  archerKilledFirst: 0
};

// Test 500 games across approaches
console.log('Running 500-game deep analysis...');
let approaches = ['ridge', 'trail', 'valley'];
let boons = [null, 'wolf', 'bow', 'wind'];
let boonStats = {
  none: { games: 0, wins: 0, avgHp: 0, avgTurns: 0 },
  wolf: { games: 0, wins: 0, avgHp: 0, avgTurns: 0 },
  bow: { games: 0, wins: 0, avgHp: 0, avgTurns: 0 },
  wind: { games: 0, wins: 0, avgHp: 0, avgTurns: 0 }
};

for (let app of approaches) {
  for (let boon of boons) {
    let bKey = boon || 'none';
    for (let i = 0; i < 40; i++) {
      let seed = 5000 + i * 101 + approaches.indexOf(app) * 1000;
      let s = fresh(seed, app, boon);
      generalStats.totalGames++;
      boonStats[bKey].games++;

      let drawnThisGame = new Set();
      let playedThisGame = new Set();
      let peakStrain = s.strain;
      let firstDead = null;

      while (s.phase === 'battle' && s.turn <= 15) {
        for (let cardId of s.hand) {
          cardAnalytics[cardId].drawn++;
          drawnThisGame.add(cardId);
        }

        let res = searchTurn(s);
        if (!res) {
          endTurn(s);
        } else {
          for (let act of res.actions) {
            if (act.type === 'play') {
              let c = CARDS[act.cardId];
              cardAnalytics[act.cardId].played++;
              playedThisGame.add(act.cardId);

              // Track effects from events
              if (act.events) {
                for (let ev of act.events) {
                  if (ev.kind === 'hit') cardAnalytics[act.cardId].dmgTotal += ev.amount;
                  if (ev.kind === 'wolf') {
                    cardAnalytics[act.cardId].dmgTotal += ev.amount;
                    generalStats.wolfTriggers++;
                  }
                  if (ev.kind === 'weak') cardAnalytics[act.cardId].weakTotal += c.weak || 0;
                }
              }
              if (c.block) cardAnalytics[act.cardId].blockTotal += c.block;
            } else if (act.type === 'exert') {
              generalStats.exertsUsed++;
            } else if (act.type === 'drink') {
              generalStats.waterUsed++;
            } else if (act.type === 'leap') {
              generalStats.leapsUsed++;
            }
          }
          s = res.state;
        }

        peakStrain = Math.max(peakStrain, s.strain);
        if (!firstDead) {
          let dead = s.enemies.find(e => e.hp <= 0);
          if (dead) firstDead = dead.id;
        }
      }

      let isWin = s.phase === 'victory';
      if (isWin) {
        generalStats.wins++;
        boonStats[bKey].wins++;
        for (let c of drawnThisGame) cardAnalytics[c].winsWhenDrawn++;
        for (let c of playedThisGame) cardAnalytics[c].winsWhenPlayed++;
      } else {
        generalStats.losses++;
      }

      generalStats.turns += s.turn;
      generalStats.hpLeft += s.hp;
      generalStats.damageTaken += s.damageTaken;
      generalStats.wearyAdded += s.discard.filter(c => c === 'weary').length;
      generalStats.strainPeakTotal += peakStrain;

      boonStats[bKey].avgHp += s.hp;
      boonStats[bKey].avgTurns += s.turn;

      if (firstDead === 'guard') generalStats.trackerKilledFirst++;
      if (firstDead === 'archer') generalStats.archerKilledFirst++;
    }
  }
}

// Now test LURE encounter in depth
console.log('\n--- LURE ENCOUNTER EXPERIMENTS ---');
function simulateLureContinuation(openingChoice) {
  let s = fresh(424242, 'lure');
  if (openingChoice === 'hold') {
    // Hold: aim at archer, guard, shot at tracker
    play(s, s.hand.indexOf('aim'), 'archer');
    play(s, s.hand.indexOf('guard'), null);
    play(s, s.hand.indexOf('shot'), 'guard');
    endTurn(s);
  } else {
    // Bait: leap discard aim to 2, knife tracker, guard
    leap(s, s.hand.indexOf('aim'), 2);
    play(s, s.hand.indexOf('knife'), 'guard');
    play(s, s.hand.indexOf('guard'), null);
    endTurn(s);
  }

  // Now run AI forward search to completion
  while (s.phase === 'battle' && s.turn <= 15) {
    let res = searchTurn(s);
    if (!res) endTurn(s);
    else s = res.state;
  }
  return s;
}

let lureHoldFinal = simulateLureContinuation('hold');
let lureBaitFinal = simulateLureContinuation('bait');

console.log(`Lure Hold -> Result: ${lureHoldFinal.phase}, Turns: ${lureHoldFinal.turn}, HP Left: ${lureHoldFinal.hp}/18, Dmg Taken: ${lureHoldFinal.damageTaken}`);
console.log(`Lure Bait -> Result: ${lureBaitFinal.phase}, Turns: ${lureBaitFinal.turn}, HP Left: ${lureBaitFinal.hp}/18, Dmg Taken: ${lureBaitFinal.damageTaken}`);

// Output JSON report
let report = {
  general: {
    totalGames: generalStats.totalGames,
    winRate: ((generalStats.wins / generalStats.totalGames) * 100).toFixed(1) + '%',
    avgTurns: (generalStats.turns / generalStats.totalGames).toFixed(2),
    avgHpLeft: (generalStats.hpLeft / generalStats.totalGames).toFixed(1) + '/48',
    avgDamageTaken: (generalStats.damageTaken / generalStats.totalGames).toFixed(1),
    avgExertsPerGame: (generalStats.exertsUsed / generalStats.totalGames).toFixed(2),
    avgWaterPerGame: (generalStats.waterUsed / generalStats.totalGames).toFixed(2),
    avgLeapsPerGame: (generalStats.leapsUsed / generalStats.totalGames).toFixed(2),
    wearyGeneratedPerGame: (generalStats.wearyAdded / generalStats.totalGames).toFixed(2),
    avgPeakStrain: (generalStats.strainPeakTotal / generalStats.totalGames).toFixed(2),
    wolfTriggersPerGame: (generalStats.wolfTriggers / generalStats.totalGames).toFixed(2),
    firstKillRatio: {
      tracker: ((generalStats.trackerKilledFirst / generalStats.totalGames) * 100).toFixed(1) + '%',
      archer: ((generalStats.archerKilledFirst / generalStats.totalGames) * 100).toFixed(1) + '%'
    }
  },
  boonComparison: {},
  cards: {},
  lureResults: {
    hold: { phase: lureHoldFinal.phase, turns: lureHoldFinal.turn, hpLeft: lureHoldFinal.hp, dmgTaken: lureHoldFinal.damageTaken },
    bait: { phase: lureBaitFinal.phase, turns: lureBaitFinal.turn, hpLeft: lureBaitFinal.hp, dmgTaken: lureBaitFinal.damageTaken }
  }
};

for (let [b, data] of Object.entries(boonStats)) {
  report.boonComparison[b] = {
    winRate: ((data.wins / data.games) * 100).toFixed(1) + '%',
    avgHp: (data.avgHp / data.games).toFixed(1),
    avgTurns: (data.avgTurns / data.games).toFixed(2)
  };
}

for (let [id, c] of Object.entries(CARDS)) {
  let stat = cardAnalytics[id];
  let playRate = stat.drawn > 0 ? ((stat.played / stat.drawn) * 100).toFixed(1) + '%' : '0%';
  let avgDmg = stat.played > 0 ? (stat.dmgTotal / stat.played).toFixed(2) : '0';
  let avgBlock = stat.played > 0 ? (stat.blockTotal / stat.played).toFixed(2) : '0';
  let winRateWhenPlayed = stat.played > 0 ? ((stat.winsWhenPlayed / stat.played) * 100).toFixed(1) + '%' : 'N/A';

  report.cards[id] = {
    name: c.name,
    cost: c.cost,
    type: c.type,
    drawn: stat.drawn,
    played: stat.played,
    playRate,
    avgDmg,
    avgBlock,
    weakTotal: stat.weakTotal,
    winRateWhenPlayed
  };
}

console.log('\n=== FINAL REPORT DATA ===');
console.log(JSON.stringify(report, null, 2));
