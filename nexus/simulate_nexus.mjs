import { fresh, start, actions, activate, def, cards, alternates, rewards, cardType } from './engine.mjs';

// --- AGENT HEURISTICS ---

function evalState(s, archetype = 'balanced') {
  if (s.screen === 'end') {
    if (s.outcome === 'full') return 100000;
    if (s.outcome === 'supplies') return 50000;
    if (s.outcome === 'caught') return -80000;
    if (s.outcome === 'dead') return -100000;
  }

  let hpScore = s.hp * 100;
  let progressScore = (s.encounter === 1 ? s.progress : 12 + s.progress) * 80;
  let friendScore = s.friend * 120;
  let enemyScore = (s.encounter === 1 ? (12 - s.enemy) : (12 + (6 - s.enemy))) * 40;
  let turnPenalty = s.turn * 30;

  if (archetype === 'speedrun') {
    progressScore *= 2.5;
    friendScore *= 0.2;
    enemyScore *= 0.3;
  } else if (archetype === 'combat') {
    enemyScore *= 2.5;
    hpScore *= 1.2;
  } else if (archetype === 'loyal') {
    friendScore *= 3.0;
    progressScore *= 0.9;
  } else if (archetype === 'cautious') {
    hpScore *= 2.5;
    turnPenalty *= 0.5;
  }

  return hpScore + progressScore + friendScore + enemyScore - turnPenalty;
}

function chooseReward(s, archetype) {
  let acts = actions(s);
  // Prefer ambush or shelter or erase over keep depending on archetype
  if (archetype === 'combat') {
    let ambushAct = acts.find(a => a.choice === 'ambush');
    if (ambushAct) return ambushAct;
  }
  let shelterAct = acts.find(a => a.choice === 'shelter');
  if (shelterAct) return shelterAct;
  let eraseAct = acts.find(a => a.choice === 'erase');
  if (eraseAct) return eraseAct;
  return acts[0];
}

function selectAction(s, archetype = 'balanced', rng = Math.random) {
  let legal = actions(s);
  if (!legal.length) return null;

  if (s.screen === 'interlude') {
    return legal[0];
  }
  if (s.screen === 'reward') {
    return chooseReward(s, archetype);
  }

  // 1-ply search with heuristic
  let bestScore = -Infinity;
  let bestAct = legal[0];

  // Novice introduces 20% random selection among top actions
  let scoredActs = [];

  for (let act of legal) {
    let res = activate(s, act);
    if (!res.valid) continue;
    let score = evalState(res.state, archetype);
    scoredActs.push({ act, score, res });
    if (score > bestScore) {
      bestScore = score;
      bestAct = act;
    }
  }

  if (archetype === 'novice') {
    scoredActs.sort((a, b) => b.score - a.score);
    // 25% chance to pick from top 3-8 sub-optimal choices
    if (rng() < 0.25 && scoredActs.length > 1) {
      let pool = scoredActs.slice(0, Math.min(8, scoredActs.length));
      return pool[Math.floor(rng() * pool.length)].act;
    }
    return scoredActs[0]?.act || bestAct;
  }

  if (archetype === 'random') {
    return legal[Math.floor(rng() * legal.length)];
  }

  return bestAct;
}

// --- SINGLE RUN SIMULATOR ---

export function runNexusGame(seed, archetype = 'balanced') {
  let s = start(fresh(seed));

  let runStats = {
    seed,
    archetype,
    outcome: null,
    enc1Outcome: null,
    enc1Turns: 0,
    enc2Turns: 0,
    totalTurns: 0,
    finalHp: 0,
    friendRescued: 0,
    enc1EnemyHp: 0,
    enc2EnemyHp: 0,
    faceUsage: {}, // card -> { face0: count, face1: count }
    lineChoice: { row: 0, col: 0 },
    lineClears: 0,
    totalSwaps: 0,
    totalWardsPlaced: 0
  };

  for (let k of Object.keys(cards)) {
    runStats.faceUsage[k] = { face0: 0, face1: 0 };
  }

  let localSeed = seed;
  let rng = () => {
    localSeed = (localSeed * 1664525 + 1013904223) >>> 0;
    return localSeed / 4294967296;
  };

  let maxIterations = 60; // safety ceiling
  let iter = 0;
  let enc1EndTurn = 0;

  while (s.screen !== 'end' && iter < maxIterations) {
    iter++;
    let act = selectAction(s, archetype, rng);
    if (!act) break;

    // Track face selection
    if (act.card && act.face !== undefined) {
      let k = cardType(act.card, s);
      if (!runStats.faceUsage[k]) runStats.faceUsage[k] = { face0: 0, face1: 0 };
      if (act.face === 0) runStats.faceUsage[k].face0++;
      else runStats.faceUsage[k].face1++;

      if (act.axis === 'row') runStats.lineChoice.row++;
      else if (act.axis === 'col') runStats.lineChoice.col++;
    }

    let beforeEnc = s.encounter;
    let res = activate(s, act);
    s = res.state;

    if (res.summary) {
      if (res.summary.cleared && res.summary.cleared.length) runStats.lineClears++;
      if (res.summary.swaps && res.summary.swaps.length) runStats.totalSwaps++;
      if (res.summary.traceLeft) runStats.totalWardsPlaced++;
    }

    if (beforeEnc === 1 && s.encounter === 2 && enc1EndTurn === 0) {
      enc1EndTurn = s.turn;
    }
  }

  runStats.outcome = s.outcome;
  runStats.totalTurns = s.turn;
  runStats.finalHp = s.hp;
  runStats.friendRescued = s.friend;

  if (s.firstResult) {
    runStats.enc1Outcome = s.firstResult.route;
    runStats.enc1Turns = s.firstResult.turn;
    runStats.enc1EnemyHp = s.firstResult.enemy;
    runStats.enc2Turns = Math.max(0, s.turn - s.firstResult.turn);
  } else {
    runStats.enc1Turns = s.turn;
    runStats.enc2Turns = 0;
  }

  return runStats;
}

// --- MONTE CARLO BATCH SUITE ---

export function runNexusSuite(numGames = 250) {
  console.log(`=== RUNNING NEXUS V7 MONTE CARLO SIMULATION (${numGames} games per archetype) ===\n`);

  let archetypes = ['balanced', 'speedrun', 'combat', 'loyal', 'novice'];
  let results = {};

  for (let arch of archetypes) {
    let stats = {
      totalGames: numGames,
      winsFull: 0,
      winsSupplies: 0,
      deaths: 0,
      timeouts: 0,
      enc1ClearCount: 0,
      enc1EscapeCount: 0,
      turnCounts: [],
      enc1TurnsTotal: 0,
      enc2TurnsTotal: 0,
      finalHpTotal: 0,
      friendRescuedTotal: 0,
      faces: {}
    };

    for (let k of Object.keys(cards)) {
      stats.faces[k] = { face0: 0, face1: 0 };
    }

    for (let i = 0; i < numGames; i++) {
      let seed = 20261016 + i * 137;
      let g = runNexusGame(seed, arch);

      stats.turnCounts.push(g.totalTurns);
      stats.finalHpTotal += g.finalHp;
      stats.friendRescuedTotal += g.friendRescued;
      stats.enc1TurnsTotal += g.enc1Turns;
      stats.enc2TurnsTotal += g.enc2Turns;

      if (g.outcome === 'full') stats.winsFull++;
      else if (g.outcome === 'supplies') stats.winsSupplies++;
      else if (g.outcome === 'dead') stats.deaths++;
      else if (g.outcome === 'caught') stats.timeouts++;

      if (g.enc1Outcome === 'clear') stats.enc1ClearCount++;
      else if (g.enc1Outcome === 'escape') stats.enc1EscapeCount++;

      for (let [c, counts] of Object.entries(g.faceUsage)) {
        if (!stats.faces[c]) stats.faces[c] = { face0: 0, face1: 0 };
        stats.faces[c].face0 += counts.face0;
        stats.faces[c].face1 += counts.face1;
      }
    }

    let totalWins = stats.winsFull + stats.winsSupplies;
    let winRate = ((totalWins / numGames) * 100).toFixed(1);
    let fullWinRate = ((stats.winsFull / numGames) * 100).toFixed(1);
    let suppliesWinRate = ((stats.winsSupplies / numGames) * 100).toFixed(1);
    let deathRate = ((stats.deaths / numGames) * 100).toFixed(1);
    let timeoutRate = ((stats.timeouts / numGames) * 100).toFixed(1);
    let avgTotalTurns = (stats.turnCounts.reduce((a, b) => a + b, 0) / numGames).toFixed(2);
    let avgEnc1Turns = (stats.enc1TurnsTotal / numGames).toFixed(2);
    let avgEnc2Turns = (stats.enc2TurnsTotal / numGames).toFixed(2);
    let avgFinalHp = (stats.finalHpTotal / numGames).toFixed(1);
    let avgFriend = (stats.friendRescuedTotal / numGames).toFixed(2);

    // Distribution
    stats.turnCounts.sort((a, b) => a - b);
    let minTurns = stats.turnCounts[0];
    let maxTurns = stats.turnCounts[stats.turnCounts.length - 1];
    let medianTurns = stats.turnCounts[Math.floor(numGames / 2)];
    let p10 = stats.turnCounts[Math.floor(numGames * 0.1)];
    let p90 = stats.turnCounts[Math.floor(numGames * 0.9)];

    results[arch] = {
      winRate: winRate + '%',
      fullWinRate: fullWinRate + '%',
      suppliesWinRate: suppliesWinRate + '%',
      deathRate: deathRate + '%',
      timeoutRate: timeoutRate + '%',
      enc1ClearRate: ((stats.enc1ClearCount / numGames) * 100).toFixed(1) + '%',
      enc1EscapeRate: ((stats.enc1EscapeCount / numGames) * 100).toFixed(1) + '%',
      avgTotalTurns,
      avgEnc1Turns,
      avgEnc2Turns,
      turnsDistribution: { min: minTurns, p10, median: medianTurns, p90, max: maxTurns },
      avgFinalHp,
      avgFriend: avgFriend + '/3',
      faces: stats.faces
    };

    console.log(`Archetype: ${arch.padEnd(9)} | WinRate: ${winRate}% (Full: ${fullWinRate}%, Supplies: ${suppliesWinRate}%) | Dead: ${deathRate}% | Caught: ${timeoutRate}% | Turns: ${avgTotalTurns} (Enc1: ${avgEnc1Turns}, Enc2: ${avgEnc2Turns}) | Median: ${medianTurns} | HP: ${avgFinalHp}/18 | Friend: ${avgFriend}/3`);
  }

  return results;
}

if (process.argv[1] && process.argv[1].endsWith('simulate_nexus.mjs')) {
  let res = runNexusSuite(250);
  console.log('\n=== DETAILED CARD FACE BREAKDOWN (Balanced Archetype) ===');
  let balFaces = res.balanced.faces;
  for (let [c, f] of Object.entries(balFaces)) {
    let tot = f.face0 + f.face1;
    let r0 = tot > 0 ? ((f.face0 / tot) * 100).toFixed(1) + '%' : '0%';
    let r1 = tot > 0 ? ((f.face1 / tot) * 100).toFixed(1) + '%' : '0%';
    console.log(`${c.padEnd(8)} | Total: ${tot.toString().padEnd(4)} | Face 0 (دائم): ${f.face0.toString().padEnd(4)} (${r0.padEnd(6)}) | Face 1 (طارئ/تضحية): ${f.face1.toString().padEnd(4)} (${r1.padEnd(6)})`);
  }
}
