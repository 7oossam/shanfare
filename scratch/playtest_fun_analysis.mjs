// Playtest & Fun Evaluation Simulation across the 4 Builds
import { fresh, start, actions, activate, def, cards, ENCOUNTERS, RELICS } from '../dist/engine.mjs';

console.log('=== بدء جلسة اختبار المتعة والاشتباك التكتيكي (Playtest Fun Audit) ===\n');

const RUNS_PER_ARCHETYPE = 100;
const archetypes = ['momentum', 'bleed', 'rock', 'beast'];

const results = {};

for (const arch of archetypes) {
  let wins = 0;
  let deaths = 0;
  let timeouts = 0;
  let totalTurns = 0;
  let minHpRecorded = Infinity;
  let clutchWins = 0; // Wins achieved with <= 6 HP
  let combosTriggered = 0;
  let relicsClaimed = [];

  for (let seed = 1; seed <= RUNS_PER_ARCHETYPE; seed++) {
    let s = start(fresh(seed * 100 + arch.charCodeAt(0)));

    // Choose preferred starter relic based on build
    if (arch === 'momentum') s.relics = ['sandals'];
    if (arch === 'bleed' || arch === 'beast') s.relics = ['wolf_skin'];
    if (arch === 'rock') s.relics = ['crag_salaman'];

    let runHpMin = s.hp;
    let runSteps = 0;

    while (s.screen !== 'end' && runSteps < 60) {
      runSteps++;
      if (s.hp < runHpMin) runHpMin = s.hp;

      if (s.screen === 'interlude') {
        s = activate(s, { kind: 'continue' }).state;
        continue;
      }

      if (s.screen === 'relic') {
        // Pick a complementary relic
        const choice = arch === 'momentum' ? 'taabbata_bracer' : arch === 'bleed' ? 'sandals' : 'wolf_skin';
        s = activate(s, { kind: 'relic', choice }).state;
        relicsClaimed.push(choice);
        continue;
      }

      if (s.screen === 'reward') {
        // Human player preference: look for archetype card
        const match = s.draftChoices.find(k => cards[k]?.build === arch);
        if (match) {
          s = activate(s, { kind: 'draft', choice: match }).state;
        } else {
          // If no good card, purge weak card! (Slay the Spire strategy)
          s = activate(s, { kind: 'purge' }).state;
        }
        continue;
      }

      // Play screen: Evaluate legal moves with archetype heuristics
      const legal = actions(s);
      if (!legal.length) break;

      let bestAct = legal[0];
      let bestScore = -Infinity;

      for (const a of legal) {
        const sim = activate(s, a);
        if (!sim.valid) continue;

        let score = 0;
        const res = sim.summary;

        // General survival score
        score += res.block * 2;
        score += res.hits * 3;
        score += res.moves * 4;

        // Archetype specific preferences (Simulating Human Player intentionality)
        const c = def(a.card, s, a.face);
        if (c.build === arch) score += 5; // Preference for player's build!

        if (arch === 'momentum') {
          score += (sim.state.momentum * 3);
          if (res.cleared?.length) score += 6;
        } else if (arch === 'bleed') {
          score += (sim.state.bleed * 4);
          score += (sim.state.poison * 3);
        } else if (arch === 'rock') {
          const wards = sim.state.wards.filter(Boolean).length;
          score += (wards * 3);
          if (sim.state.hp < 12 && res.block >= 5) score += 8; // Clutch rock defense
        } else if (arch === 'beast') {
          if (sim.state.bleed > 0) score += 6; // Set up prey for wolf
        }

        if (score > bestScore) {
          bestScore = score;
          bestAct = a;
        }
      }

      const outcome = activate(s, bestAct);
      s = outcome.state;
      if (outcome.summary.cleared?.length) combosTriggered++;
    }

    totalTurns += s.turn;
    if (s.outcome === 'victory' || s.outcome === 'full') {
      wins++;
      if (runHpMin <= 6) clutchWins++;
    } else if (s.outcome === 'dead') {
      deaths++;
    } else {
      timeouts++;
    }

    if (runHpMin < minHpRecorded) minHpRecorded = runHpMin;
  }

  results[arch] = {
    runs: RUNS_PER_ARCHETYPE,
    wins,
    winRate: `${((wins / RUNS_PER_ARCHETYPE) * 100).toFixed(1)}%`,
    deaths,
    timeouts,
    avgTurns: (totalTurns / RUNS_PER_ARCHETYPE).toFixed(1),
    clutchWins,
    clutchRate: `${((clutchWins / Math.max(1, wins)) * 100).toFixed(1)}%`,
    minHpRecorded,
    combosPerRun: (combosTriggered / RUNS_PER_ARCHETYPE).toFixed(1)
  };
}

console.log('--- تقرير بيانات اختبار المتعة والتوازن عبر ٤٠٠ رن كامل ---');
console.table(results);
