import { CARDS, fresh, play, exert, endTurn, reason, distance, targets, movementTargets, leap, drink, forecast, isolated } from './engine.mjs';
import { runSuite } from './simulate.mjs';

// Let's inspect detailed card usage from the simulation
console.log('=== DETAILED CARD USAGE & RESOURCE ECONOMY ===');

// Let's run a targeted 300-game batch for each approach with tactical player and collect full card stats
let approaches = ['ridge', 'trail', 'valley'];
let allCardStats = {};
for (let c of Object.keys(CARDS)) {
  allCardStats[c] = { drawn: 0, played: 0, dmgDealt: 0, blockGained: 0, weakApplied: 0 };
}

let resourceStats = {
  exerts: 0,
  waterCharges: 0,
  leaps: 0,
  wearyGenerated: 0,
  turnsTotal: 0,
  totalGames: 0
};

// Also test Lure approach
console.log('\n--- TESTING LURE ENCOUNTER ---');
function runLure(openingPlan = 'hold') {
  // Opening: either 'hold' (aim archer, guard, shot) or 'bait' (leap discard aim, knife tracker, guard)
  let s = fresh(424242, 'lure');
  // First turn scripted according to README design
  if (openingPlan === 'hold') {
    // Hand: ['aim','knife','guard','shot','advance']
    // aim at archer (pos 4, player pos 0, dist 4 >= 2, steady ok)
    let aimIdx = s.hand.indexOf('aim');
    play(s, aimIdx, 'archer'); // 13 dmg -> archer dies! (13/13 HP)
    // guard
    let guardIdx = s.hand.indexOf('guard');
    play(s, guardIdx, null); // 8 block at rock (pos 0)
    // shot at tracker
    let shotIdx = s.hand.indexOf('shot');
    play(s, shotIdx, 'guard'); // 6 dmg -> tracker 29 HP
    endTurn(s);
  } else {
    // bait: leap discard aim to pos 2? or pos 1?
    let aimIdx = s.hand.indexOf('aim');
    leap(s, aimIdx, 2); // player moves to 2, costs 1 energy, aim exhausted
    // knife tracker (tracker at pos 3, distance 1)
    let knifeIdx = s.hand.indexOf('knife');
    play(s, knifeIdx, 'guard'); // 9 dmg -> tracker 26 HP
    // guard
    let guardIdx = s.hand.indexOf('guard');
    play(s, guardIdx, null); // 5 block
    endTurn(s);
  }
  return s;
}

let holdEnd = runLure('hold');
console.log('Lure Hold Opening Result:', {
  hp: holdEnd.hp,
  turn: holdEnd.turn,
  phase: holdEnd.phase,
  damageTaken: holdEnd.damageTaken,
  enemies: holdEnd.enemies.map(e => ({ id: e.id, hp: e.hp, pos: e.pos })),
  hand: holdEnd.hand
});

let baitEnd = runLure('bait');
console.log('Lure Bait Opening Result:', {
  hp: baitEnd.hp,
  turn: baitEnd.turn,
  phase: baitEnd.phase,
  damageTaken: baitEnd.damageTaken,
  enemies: baitEnd.enemies.map(e => ({ id: e.id, hp: e.hp, pos: e.pos, exposed: e.exposed })),
  hand: baitEnd.hand
});
