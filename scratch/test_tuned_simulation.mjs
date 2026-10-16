import { fresh, start, actions, activate, def, cards, ENCOUNTERS, RELICS } from '../dist/engine.mjs';

function getEnemyIntent(enemy, index, phaseTurn, isSolo) {
  if (enemy.hp <= 0) return { intent: 'dead', damage: 0, desc: 'صريع' };

  if (isSolo) {
    const dmg = enemy.isBoss ? (enemy.hp <= 20 ? 7 : 5) : Math.min(enemy.attack, 4);
    return { intent: 'attack', damage: dmg, desc: `يضرب ${dmg}` };
  }

  if (enemy.isBoss) {
    if (enemy.hp <= 20) {
      return { intent: 'lunge', damage: 7, desc: 'اندفاع هائج ٧' };
    }
    const isAttacking = phaseTurn % 2 === 1;
    return isAttacking
      ? { intent: 'attack', damage: enemy.attack, desc: `يضرب ${enemy.attack}` }
      : { intent: 'defend', damage: 0, desc: 'تحصين بالدرع' };
  }

  const isAttacking = (index % 2 === 1) ? (phaseTurn % 2 === 0) : (phaseTurn % 2 === 1);
  return isAttacking
    ? { intent: 'attack', damage: enemy.attack, desc: `يضرب ${enemy.attack}` }
    : { intent: 'scheme', damage: 0, desc: index === 1 ? 'مباغتة وتتبع' : 'تأهب ودفاع' };
}

function tunedIncoming(s) {
  if (!s.enemies || !s.enemies.length) return s.enemy > 0 ? 3 : 0;
  const living = s.enemies.filter(e => e.hp > 0);
  const isSolo = living.length === 1;

  let totalThreat = 0;
  for (let i = 0; i < s.enemies.length; i++) {
    const e = s.enemies[i];
    const { damage } = getEnemyIntent(e, i, s.phaseTurn, isSolo);
    totalThreat += damage;
  }
  return totalThreat;
}

const RUNS_PER_ARCHETYPE = 100;
const archetypes = ['momentum', 'bleed', 'rock', 'beast'];
const results = {};

for (const arch of archetypes) {
  let wins = 0;
  let deaths = 0;
  let timeouts = 0;
  let totalTurns = 0;
  let minHpRecorded = Infinity;
  let clutchWins = 0;
  let combosTriggered = 0;

  for (let seed = 1; seed <= RUNS_PER_ARCHETYPE; seed++) {
    let s = start(fresh(seed * 100 + arch.charCodeAt(0)));

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
        const choice = arch === 'momentum' ? 'taabbata_bracer' : arch === 'bleed' ? 'sandals' : 'wolf_skin';
        s = activate(s, { kind: 'relic', choice }).state;
        continue;
      }

      if (s.screen === 'reward') {
        const match = s.draftChoices.find(k => cards[k]?.build === arch);
        if (match) {
          s = activate(s, { kind: 'draft', choice: match }).state;
        } else {
          s = activate(s, { kind: 'purge' }).state;
        }
        continue;
      }

      const legal = actions(s);
      if (!legal.length) break;

      let bestAct = legal[0];
      let bestScore = -Infinity;

      for (const a of legal) {
        // Evaluate with tuned threat
        const sim = activate(s, a);
        if (!sim.valid) continue;

        let score = 0;
        const res = sim.summary;

        // Reward smart blocking against anticipated tuned threat
        const currentThreat = tunedIncoming(s);
        const effectiveBlock = Math.min(res.block, currentThreat);
        score += effectiveBlock * 4;
        score += res.hits * 3;
        score += res.moves * 3;

        const c = def(a.card, s, a.face);
        if (c.build === arch) score += 4;

        if (arch === 'momentum') {
          score += (sim.state.momentum * 3);
          if (res.cleared?.length) score += 5;
        } else if (arch === 'bleed') {
          score += (sim.state.bleed * 4);
          score += (sim.state.poison * 3);
        } else if (arch === 'rock') {
          const wards = sim.state.wards.filter(Boolean).length;
          score += (wards * 3);
        } else if (arch === 'beast') {
          if (sim.state.bleed > 0) score += 5;
        }

        if (score > bestScore) {
          bestScore = score;
          bestAct = a;
        }
      }

      // Apply action
      const outcome = activate(s, bestAct);
      s = outcome.state;
      if (outcome.summary.cleared?.length) combosTriggered++;
    }

    totalTurns += s.turn;
    if (s.outcome === 'victory' || s.outcome === 'full') {
      wins++;
      if (runHpMin <= 8) clutchWins++;
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

console.log('--- نتائج المحاكاة بعد ضبط نيات الأعداء (Tuned Enemy Intent Model) ---');
console.table(results);
