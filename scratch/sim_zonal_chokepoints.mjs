// Simulation of Proposal 2: 5-Node Sarawat Chokepoints (Node-Based Tactical Roguelike)
class ZonalChokepointsSim {
  constructor(seed = 999) {
    this.seed = seed;
    // Nodes: 0: Sanctuary, 1: High Perch, 2: Chokepoint, 3: Sand Flats, 4: Salaman Outpost
    this.heroes = {
      shanfara: { node: 1, hp: 18, name: 'الشنفرى' }, // High Perch
      amr: { node: 2, hp: 22, name: 'عمرو بن براق', stance: 'none' }, // Chokepoint
      taabbata: { node: 3, hp: 16, name: 'تأبط شراً', stealth: true } // Sand Flats
    };
    this.hazards = {}; // node -> { type, val, duration, trigger }
    this.enemies = [
      { id: 'guard1', node: 4, hp: 12, name: 'فارس سلامان الأول' },
      { id: 'guard2', node: 4, hp: 10, name: 'فارس سلامان الثاني' }
    ];
    this.turn = 1;
    this.log = [];
  }

  playTurn() {
    this.log.push(`\n=== الدور ${this.turn} (نظام المناطق الخمس) ===`);
    this.log.push(`مواقع العُصبة: الشنفرى في [المَرْقَبَة ٢] | عمرو بن براق في [المَضِيق ٣] | تأبط شراً في [البَطْحَاء ٤]`);
    this.log.push(`مواقع العدو: ${this.enemies.filter(e => e.hp > 0).map(e => `${e.name} في [عقدة ${e.node}] (صحة: ${e.hp})`).join(' ، ')}`);

    // Turn 1 Strategy:
    if (this.turn === 1) {
      // 1. Amr assumes Rock Stance in Chokepoint (node 2)
      this.heroes.amr.stance = 'rock_wall';
      this.log.push(`[لعب بطاقة] لعب عمرو بن براق «صَخْرَةُ عَمْرٍو» في [المضيق]: ترس منيع يمنع أي عدو من العبور ويمتص 5 ضرر.`);

      // 2. Shanfara rigs Suspended Boulder over Chokepoint (node 2) from High Perch (node 1)
      this.hazards[2] = {
        type: 'suspended_boulder',
        val: 14,
        trigger: (enemiesAtNode) => enemiesAtNode.length >= 2,
        name: 'صخرة المرقبة المعلقة'
      };
      this.log.push(`[لعب بطاقة وتدية] علّق الشنفرى «صَخْرَةُ المَرْقَبَة المُعَلَّقَة» فوق [المضيق]! شرطها: تسقط إذا احتشد عدوان معاً.`);

      // 3. Ta'abbata throws smoke in Sand Flats (node 3) forcing enemies to rush forward
      this.hazards[3] = { type: 'smoke', duration: 2, name: 'دخان الغلس' };
      this.log.push(`[لعب بطاقة] ألقى تأبط شراً «دُخَانُ الغَلَس» في [البطحاء] يعمي الرؤية ويجبر الأعداء على التقدم.`);
    } else if (this.turn === 2) {
      // Turn 2 Strategy: Shanfara snipes from High Perch with +2 elevation bonus
      const liveEnemies = this.enemies.filter(e => e.hp > 0);
      if (liveEnemies.length > 0) {
        const target = liveEnemies[0];
        const dmg = 4 + 2; // base 4 + 2 elevation bonus
        target.hp -= dmg;
        this.log.push(`[رماية الشنفرى] أطلق الشنفرى سهم القوس من [المرقبة] مستغلاً أفضلية الارتفاع (+2 ضرر): أصاب ${target.name} بـ ${dmg} ضرر!`);
      }
    }

    // ENEMY PHASE:
    this.log.push(`-- مرحلة تحرك الأعداء --`);
    for (const enemy of this.enemies) {
      if (enemy.hp <= 0) continue;
      // Enemy AI: moves from 4 (Outpost) -> 3 (Sand Flats) -> 2 (Chokepoint) towards 0 (Sanctuary)
      if (enemy.node === 4) {
        enemy.node = 3;
        this.log.push(`  تقدم ${enemy.name} من [طوق سلامان ٤] إلى [البطحاء ٣].`);
      } else if (enemy.node === 3) {
        // Sand flats has smoke; enemy rushes into chokepoint 2
        enemy.node = 2;
        this.log.push(`  اندفع ${enemy.name} عبر الدخان إلى [مضيق النقع ٢] ليصطدم بترس عمرو بن براق!`);
      }
    }

    // CHECK HAZARD TRIGGERS:
    // Check if boulder triggers at node 2
    const enemiesAtChokepoint = this.enemies.filter(e => e.hp > 0 && e.node === 2);
    if (this.hazards[2] && this.hazards[2].trigger(enemiesAtChokepoint)) {
      const hazard = this.hazards[2];
      this.log.push(`  ★ [انفجار الأثر الباقي!] تحقق شرط «${hazard.name}»: احتشد عدوان في المضيق!`);
      this.log.push(`  هوت الصخرة العملاقة من المرقبة بركام صاعق مسددة ${hazard.val} ضرر لكل عدو في المضيق!`);
      for (const e of enemiesAtChokepoint) {
        e.hp -= hazard.val;
        this.log.push(`    -> سُحق ${e.name}! (الصحّة: ${Math.max(0, e.hp)})`);
      }
      delete this.hazards[2]; // consumed
    }

    // Check combat at chokepoint if enemies survived
    for (const e of this.enemies.filter(e => e.hp > 0 && e.node === 2)) {
      const rawDmg = 5;
      const actualDmg = this.heroes.amr.stance === 'rock_wall' ? Math.max(0, rawDmg - 5) : rawDmg;
      this.heroes.amr.hp -= actualDmg;
      this.log.push(`  [اشتباك المضيق] هاجم ${e.name} عمرو بن براق بـ ${rawDmg} ضرر؛ امتص الترس 5 ضرر وتلقى عمرو ${actualDmg} ضرر.`);
    }

    this.turn++;
    const allDefeated = this.enemies.every(e => e.hp <= 0);
    return allDefeated;
  }

  runSimulation() {
    for (let t = 0; t < 4; t++) {
      const won = this.playTurn();
      if (won) {
        this.log.push(`\n>>> نصر حاسم في شِعاب السَّراة! طُهر المضيق وسُحق فرسان العدو في ${this.turn - 1} أدوار بنجاح! <<<`);
        return { success: true, log: this.log };
      }
    }
    return { success: false, log: this.log };
  }
}

const sim2 = new ZonalChokepointsSim(444);
const res2 = sim2.runSimulation();
console.log(res2.log.join('\n'));
