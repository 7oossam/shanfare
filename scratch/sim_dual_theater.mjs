// Simulation of Proposal 1: Refined Dual-Theater with Optional Movement Pool & Lingering Nexus Cards
import fs from 'fs';

class DualTheaterSim {
  constructor(seed = 42) {
    this.seed = seed;
    this.pos = 0; // Shanfara at position 0 of [0, 1, 2, 3, 4]
    this.hp = 20;
    this.block = 0;
    this.grid = Array(9).fill(null); // 3x3 Nexus
    this.deck = [
      { id: 'run', name: 'عَدْوُ الأَجْدَل', type: 'move', val: 2 },
      { id: 'sword', name: 'أَبْيَضُ إِصْلِيت', type: 'melee', val: 5, range: 1 },
      { id: 'bow', name: 'صَفْرَاءُ عَيْطَل', type: 'ranged', val: 4, minRange: 2, maxRange: 4 },
      { id: 'cover', name: 'عِيَاذُ الصَّفَا', type: 'cover', val: 8, duration: 3 },
      { id: 'taabbata', name: 'طَعْنَةُ الخَفَاء', type: 'synergy', val: 6 },
      { id: 'wolf', name: 'عَضَّةُ السِّيد', type: 'root', val: 3 },
      { id: 'run', name: 'عَدْوُ الأَجْدَل', type: 'move', val: 2 },
      { id: 'bow', name: 'صَفْرَاءُ عَيْطَل', type: 'ranged', val: 4, minRange: 2, maxRange: 4 }
    ];
    this.hand = [];
    this.discard = [];
    this.boulders = {}; // pos -> hp
    this.enemy = { pos: 2, hp: 16, bleed: 0, rooted: false, intent: 'smash' };
    this.lootCollected = false;
    this.turn = 1;
    this.log = [];
  }

  pseudoRandom() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  draw(n = 4) {
    while (this.hand.length < n) {
      if (this.deck.length === 0) {
        if (this.discard.length === 0) break;
        this.deck = this.discard.slice();
        this.discard = [];
      }
      const idx = Math.floor(this.pseudoRandom() * this.deck.length);
      this.hand.push(this.deck.splice(idx, 1)[0]);
    }
  }

  // Turn simulation
  playTurn() {
    this.draw(4);
    this.block = 0;
    this.log.push(`\n=== الدور ${this.turn} ===`);
    this.log.push(`موقع الشنفرى: [${this.pos}] | صحة الشنفرى: ${this.hp} | درع: ${this.block}`);
    this.log.push(`موقع الحارس: [${this.enemy.pos}] | صحة الحارس: ${this.enemy.hp} | نية الحارس: ضرب المواضع المجاورة`);
    this.log.push(`اليد: ${this.hand.map(c => c.name).join(' ، ')}`);

    // Tactical AI Play logic testing the "Movement Pool vs Melee Range" problem
    // 1. Pick a card to place on grid
    let placedCard = null;
    let targetCell = -1;

    // In Turn 1, player wants to get in range or setup
    // Check distance to enemy
    const distToEnemy = Math.abs(this.enemy.pos - this.pos);

    // Decision: Place a card that helps
    if (distToEnemy > 1 && this.hand.some(c => c.id === 'run')) {
      placedCard = this.hand.find(c => c.id === 'run');
      targetCell = 0; // Row 0, Col 0
    } else if (distToEnemy <= 1 && this.hand.some(c => c.id === 'sword')) {
      placedCard = this.hand.find(c => c.id === 'sword');
      // Place in col 0 to intersect with previous run card!
      targetCell = this.grid[0] ? 3 : 0; // Row 1, Col 0
    } else {
      placedCard = this.hand[0];
      targetCell = this.grid.findIndex(c => c === null);
    }

    if (placedCard && targetCell >= 0) {
      this.grid[targetCell] = placedCard;
      this.hand.splice(this.hand.indexOf(placedCard), 1);
      this.log.push(`وضع اللاعب بطاقة «${placedCard.name}» في الخانة ${targetCell}`);
    }

    // Activate line: choose row or col containing the card
    const targetRow = Math.floor(targetCell / 3);
    const targetCol = targetCell % 3;

    // Check if activating column 0 activates BOTH run and sword!
    let activatedAxis = 'row';
    let lineIndices = [targetRow * 3, targetRow * 3 + 1, targetRow * 3 + 2];
    
    // If col has multiple cards, prefer col
    const colCards = [this.grid[targetCol], this.grid[targetCol + 3], this.grid[targetCol + 6]].filter(Boolean);
    const rowCards = [this.grid[targetRow * 3], this.grid[targetRow * 3 + 1], this.grid[targetRow * 3 + 2]].filter(Boolean);

    if (colCards.length >= rowCards.length) {
      activatedAxis = 'col';
      lineIndices = [targetCol, targetCol + 3, targetCol + 6];
    }

    this.log.push(`تفعيل خط: ${activatedAxis === 'row' ? 'الصف ' + targetRow : 'العمود ' + targetCol}`);

    // Resolve Line cards
    let movementPool = 0;
    let attacks = [];
    let covers = [];

    for (const idx of lineIndices) {
      const c = this.grid[idx];
      if (!c) continue;
      this.log.push(`  -> تفعيل أثر «${c.name}» المستقر في الخانة ${idx}`);
      if (c.type === 'move') movementPool += c.val;
      if (c.type === 'melee' || c.type === 'ranged' || c.type === 'synergy') attacks.push(c);
      if (c.type === 'cover') covers.push(c);
    }

    // TESTING THE USER'S EXACT SCENARIO:
    // If we have attacks that need range 1, and movementPool > 0:
    // With OPTIONAL MOVEMENT POOL:
    this.log.push(`  [فحص ميكانيكي] رصيد الزَّخَم المتاح: ${movementPool} خطوة.`);
    
    let chosenSteps = 0;
    const currentDist = Math.abs(this.enemy.pos - this.pos);
    
    // Bidirectional movement choice:
    if (attacks.some(a => a.range === 1 || a.type === 'synergy')) {
      if (currentDist === 1) {
        chosenSteps = 0; // Hold ground in melee
        this.log.push(`  [ثبات تكتيكي] العدو ملاصق على مسافة 1! اختار الشنفرى الثبات (0 خطوات) لضرب السيف.`);
      } else if (currentDist > 1) {
        // Move towards the enemy (even if backwards!)
        const dir = this.enemy.pos > this.pos ? 1 : -1;
        const needed = currentDist - 1;
        const steps = Math.min(movementPool, needed);
        chosenSteps = steps * dir;
        this.log.push(`  [مناورة اقتراب] ناور الشنفرى ${Math.abs(steps)} خطوات ${dir > 0 ? 'للأمام' : 'للخلف'} ليدخل مدى السيف!`);
      }
    } else {
      // Advance towards goal if no melee
      const dir = 1;
      const steps = Math.min(movementPool, 4 - this.pos);
      chosenSteps = steps * dir;
      this.log.push(`  [عَدْو] تقدم الشنفرى ${steps} خطوات نحو مأمن الوادي.`);
    }

    this.pos += chosenSteps;
    const unspentMove = movementPool - Math.abs(chosenSteps);
    if (unspentMove > 0) {
      const convertedBlock = unspentMove * 2;
      this.block += convertedBlock;
      this.log.push(`  [تحويل الفائض] تحولت ${unspentMove} خطوات غير مستخدمة إلى +${convertedBlock} صَدّ وحَذَر!`);
    }

    // Execute attacks
    for (const a of attacks) {
      const dist = Math.abs(this.enemy.pos - this.pos);
      if (a.range === 1 && dist <= 1) {
        this.enemy.hp -= a.val;
        this.enemy.bleed = 2;
        this.log.push(`  [نجاح الهجوم التلاحمي] أصاب سيف «${a.name}» الحارس بـ ${a.val} ضرر! (بقي للحارس ${Math.max(0, this.enemy.hp)} صحة)`);
      } else if (a.type === 'synergy' && dist <= 1) {
        this.enemy.hp -= a.val;
        this.log.push(`  [تآزر تأبط شراً] انقضّ تأبط شراً من الظلال مسدداً ${a.val} ضرر خارق! (بقي للحارس ${Math.max(0, this.enemy.hp)} صحة)`);
      } else if (a.type === 'ranged' && dist >= (a.minRange || 2) && dist <= (a.maxRange || 4)) {
        this.enemy.hp -= a.val;
        this.log.push(`  [رمي القوس] أصابت نبلة «${a.name}» الحارس من مسافة ${dist} بـ ${a.val} ضرر!`);
      } else {
        this.log.push(`  [فشل المدى] تعذر إطلاق «${a.name}»؛ المسافة الحالية ${dist} لا تطابق المدى.`);
      }
    }

    // Loot check
    if (this.pos >= 3 && !this.lootCollected) {
      this.lootCollected = true;
      this.log.push(`  ★ ظفر الشنفرى بكيس الزاد من الموضع [3]!`);
    }

    // Enemy Turn
    if (this.enemy.hp > 0) {
      const distToPlayer = Math.abs(this.enemy.pos - this.pos);
      if (distToPlayer <= 1) {
        const rawDmg = 5;
        const actualDmg = Math.max(0, rawDmg - this.block);
        this.hp -= actualDmg;
        this.log.push(`  [ضربة العدو] هجم الحارس بـ ${rawDmg} ضرر. امتص الدرع ${this.block} ضرر، وتلقى الشنفرى ${actualDmg} ضرر (صحة الشنفرى: ${this.hp}).`);
      } else {
        this.log.push(`  [فشل ضربة العدو] هجم الحارس في الفراغ؛ الشنفرى ليس في نطاقه!`);
      }
    } else {
      this.log.push(`  ⚔ هلك الحارس في المضيق! دروب العبور سالكة.`);
    }

    this.turn++;
    return this.enemy.hp <= 0 && this.lootCollected;
  }

  runFullEncounter() {
    for (let t = 0; t < 5; t++) {
      const victory = this.playTurn();
      if (victory) {
        this.log.push(`\n>>> نصر مظفر! ظفر الشنفرى بالزاد وأسقط الحارس وعبر المضيق في ${this.turn - 1} أدوار بنجاح! <<<`);
        return { success: true, turns: this.turn - 1, log: this.log };
      }
      if (this.hp <= 0) {
        this.log.push(`\n>>> سقط البطل في المضيق <<<`);
        return { success: false, turns: this.turn - 1, log: this.log };
      }
    }
    return { success: false, turns: this.turn - 1, log: this.log };
  }
}

const sim = new DualTheaterSim(12345);
const result = sim.runFullEncounter();
console.log(result.log.join('\n'));
