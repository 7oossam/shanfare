import { CARDS, APPROACHES, fresh, play, exert, endTurn, reason, distance, targets, movementTargets, leap, drink, forecast, terrain } from './engine.mjs';

// Let's test what adjustments affect the win rate and decision tension
// We'll test novice player (representing new / casual players) and tactical player

function simulateVariant(options = {}, numGames = 100) {
  let winsTactical = 0;
  let winsNovice = 0;
  let totalHpTactical = 0;
  let totalHpNovice = 0;

  for (let i = 0; i < numGames; i++) {
    let seed = 7000 + i * 17;

    // 1. Tactical run
    let s = fresh(seed, 'trail');
    // Apply options:
    if (options.playerHp) { s.hp = options.playerHp; s.maxHp = options.playerHp; }
    if (options.trackerHp) { s.enemies[0].hp = options.trackerHp; s.enemies[0].maxHp = options.trackerHp; }
    if (options.archerHp) { s.enemies[1].hp = options.archerHp; s.enemies[1].maxHp = options.archerHp; }
    if (options.trackerDmgBonus) {
      // Modify enemy intents in runtime if needed
    }

    // Run tactical
    while (s.phase === 'battle' && s.turn <= 15) {
      // Tactical turn
      let played = false;
      // Simple tactical priority:
      // Exert if low energy
      if (!s.exerted && s.energy <= 1) exert(s);
      
      // Play cards greedily with high tactical value
      let madeMove = true;
      while (madeMove && s.phase === 'battle') {
        madeMove = false;
        // Try to attack
        for (let idx = 0; idx < s.hand.length; idx++) {
          let cid = s.hand[idx];
          let c = CARDS[cid];
          if (c.cost <= s.energy) {
            // If targets
            if (targets(c)) {
              for (let target of ['guard', 'archer']) {
                let e = s.enemies.find(x => x.id === target);
                if (e && e.hp > 0 && !reason(s, cid, e)) {
                  let res = play(s, idx, target);
                  if (!res.error) { madeMove = true; break; }
                }
              }
            } else {
              if (!reason(s, cid, null)) {
                let res = play(s, idx, null);
                if (!res.error) { madeMove = true; break; }
              }
            }
          }
          if (madeMove) break;
        }
      }
      endTurn(s);
    }
    if (s.phase === 'victory') { winsTactical++; totalHpTactical += s.hp; }

    // 2. Novice / Suboptimal run (makes 30% random choices)
    let sNov = fresh(seed, 'trail');
    if (options.playerHp) { sNov.hp = options.playerHp; sNov.maxHp = options.playerHp; }
    if (options.trackerHp) { sNov.enemies[0].hp = options.trackerHp; sNov.enemies[0].maxHp = options.trackerHp; }
    if (options.archerHp) { sNov.enemies[1].hp = options.archerHp; sNov.enemies[1].maxHp = options.archerHp; }

    let rngVal = seed;
    let rng = () => { rngVal = (rngVal * 1664525 + 1013904223) >>> 0; return rngVal / 4294967296; };

    while (sNov.phase === 'battle' && sNov.turn <= 15) {
      let madeMove = true;
      while (madeMove && sNov.phase === 'battle') {
        madeMove = false;
        let legalCards = [];
        for (let idx = 0; idx < sNov.hand.length; idx++) {
          let cid = sNov.hand[idx];
          let c = CARDS[cid];
          if (c.cost <= sNov.energy) {
            if (targets(c)) {
              for (let e of sNov.enemies) {
                if (e.hp > 0 && !reason(sNov, cid, e)) legalCards.push({ idx, cid, target: e.id });
              }
            } else {
              if (!reason(sNov, cid, null)) legalCards.push({ idx, cid, target: null });
            }
          }
        }
        if (legalCards.length > 0) {
          // Novice picks a card
          let pick = legalCards[Math.floor(rng() * legalCards.length)];
          play(sNov, pick.idx, pick.target);
          madeMove = true;
        }
      }
      endTurn(sNov);
    }
    if (sNov.phase === 'victory') { winsNovice++; totalHpNovice += sNov.hp; }
  }

  return {
    tacticalWinRate: (winsTactical / numGames * 100).toFixed(1) + '%',
    tacticalAvgHp: (totalHpTactical / Math.max(1, winsTactical)).toFixed(1),
    noviceWinRate: (winsNovice / numGames * 100).toFixed(1) + '%',
    noviceAvgHp: (totalHpNovice / Math.max(1, winsNovice)).toFixed(1)
  };
}

console.log('--- TESTING TUNING VARIANTS (100 games each) ---');

let baseline = simulateVariant({});
console.log('Baseline (48 HP, 35/29 Enemies):', baseline);

let hp30 = simulateVariant({ playerHp: 30 });
console.log('Player HP 30 (35/29 Enemies):', hp30);

let hp24 = simulateVariant({ playerHp: 24 });
console.log('Player HP 24 (35/29 Enemies):', hp24);

let hp18 = simulateVariant({ playerHp: 18 });
console.log('Player HP 18 (35/29 Enemies):', hp18);

let beefierEnemies = simulateVariant({ trackerHp: 48, archerHp: 38 });
console.log('Enemies +35% HP (48/38) with 48 Player HP:', beefierEnemies);

let tunedEncounter = simulateVariant({ playerHp: 32, trackerHp: 42, archerHp: 32 });
console.log('Tuned Balance (32 Player HP, 42 Tracker, 32 Archer):', tunedEncounter);
