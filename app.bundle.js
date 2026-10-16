(function() {
  'use strict';
  // --- icons.mjs ---
const paths = {
  sound: 'M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14',
  mute: 'M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6',
  swap: 'M3 7h17M16 3l4 4-4 4M21 17H4M8 13l-4 4 4 4',
  heart: 'M12 21S2 15 2 8c0-6 8-7 10-2 2-5 10-4 10 2 0 7-10 13-10 13z',
  bag: 'M8 3h8l-2 5 5 5c5 9-19 9-14 0l5-5zM9 8h6M9 15h6',
  cave: 'M2 21l3-12 7-6 7 6 3 12H2zM8 21v-8l4-3 4 3v8',
  moon: 'M20 15A9 9 0 0 1 9 4 9 9 0 1 0 20 15z',
  foot: 'M4 16h8l4 4h4v-3l-4-3-3-6H8l1 4-5 1v3z',
  chain: 'M9 8l2-3c5-5 12 2 7 7l-3 2M15 16l-2 3C8 24 1 17 6 12l3-2M8 16l8-8',
  sneak: 'M3 16c4-9 6 6 10-3s5 0 8-7M5 21h4M14 21h4',
  bow: 'M4 3c21 2 21 16 0 18L15 12 4 3zM3 12h18M18 9l3 3-3 3',
  run: 'M5 19l5-6 4 2 5-8M10 13l-1-5 5-3 3 3 4 1M9 8l-4 2M14 15l-1 6',
  arrow: 'M4 20L20 4M12 4h8v8M4 14v6h6',
  knife: 'M5 19l5-5M8 16l-3-3M10 14l8-10 2 2-6 10z',
  cover: 'M12 3l8 3v6c0 5-8 9-8 9s-8-4-8-9V6zM8 11l3 3 5-6',
  feint: 'M3 8c8-12 8 18 18 6M3 14c8-12 8 10 18-6',
  friend: 'M9 6a3 3 0 1 0 6 0a3 3 0 1 0-6 0M6 21v-7c0-5 12-5 12 0v7M9 15v6M15 15v6',
  grid: 'M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18',
  // High polish thematic icons
  wolf: 'M4 7l4 4-2 6 6-2 4 4 4-4 6 2-2-6 4-4-5-3-5 5-5-5zM9 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm6 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  bleed: 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z',
  poison: 'M12 2v6m0 4v2m-6 2a6 6 0 1 0 12 0c0-3.3-2.7-6-6-6s-6 2.7-6 6zm3-1h.01m5.99 0h.01M9 18s1 1.5 3 1.5 3-1.5 3-1.5',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  fire: 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z',
  stone: 'M3 20h18L17 5l-5 6-3-4-6 13z',
  sandals: 'M4 17a4 4 0 0 0 8 0V4a3 3 0 0 0-6 0v7a2 2 0 0 0 2 2m4 4a4 4 0 0 0 8 0V7a3 3 0 0 0-6 0v5a2 2 0 0 0 2 2',
  waterskin: 'M9 3h6v3H9zm-2 5h10c2 3 3 8 0 12-2 3-8 3-10 0-3-4-2-9 0-12z',
  bracer: 'M6 4h12l-2 16H8zm2 5h8m-7 5h6m-5 4h4',
  covenant: 'M12 4a8 8 0 1 0 8 8 8 8 0 0 0-8-8zm0 4a4 4 0 1 1-4 4 4 4 0 0 1 4-4z',
  swords: 'M14.5 17.5L3 6V3h3l11.5 11.5m-5 0l2 2m-4-4l2 2M6 21l3-3m-6 0l3 3M18 3h3v3l-7 7-2-2 6-6z',
  spark: 'M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z'
};

const icon = id => `<svg class="icon icon-${id}" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[id] || paths.grid}"/></svg>`;


// --- engine.mjs ---
const VERSION = 'shanfara-roguelike-v8';

const ARCHETYPES = {
  momentum: { id: 'momentum', name: 'الزَّخَم والقَوْس', tag: 'زَخَم', color: '#f0b842', class: 'card-gold', icon: 'fire' },
  bleed: { id: 'bleed', name: 'النَّزْف والسُّمُوم', tag: 'نَزْف', color: '#e64a38', class: 'card-crimson', icon: 'bleed' },
  rock: { id: 'rock', name: 'الصَّخْر والجَلَد', tag: 'صَخْر', color: '#4aaed9', class: 'card-cyan', icon: 'stone' },
  beast: { id: 'beast', name: 'الضَّوَارِي والرَّهْط', tag: 'رَهْط', color: '#ba7ae8', class: 'card-amethyst', icon: 'wolf' },
  general: { id: 'general', name: 'خِصَال الصَّعَالِيك', tag: 'صَعَالِيك', color: '#b2d5b2', class: 'card-emerald', icon: 'spark' }
};

const cards = {
  // Starter Deck (10 Cards)
  run: { name: 'عَدْوُ الشَّنْفَرَى', build: 'momentum', icon: 'run', short: 'زخم ٢', text: '«أعدى من الشنفرى»؛ رصيد زخم خطوتين؛ الفائض يتحول لصد بنهاية الدور.', effects: [{ op: 'momentum', n: 2 }, { op: 'move', n: 2 }] },
  run_swift: { name: 'خَبَبُ العَدَّاء', build: 'momentum', icon: 'run', short: 'زخم ٢', text: 'خَبَبٌ كعدو الذئب نحو الزاد والمأمن؛ يولد خطوتين من الزخم الحركي.', effects: [{ op: 'momentum', n: 2 }, { op: 'move', n: 2 }] },
  arrow: { name: 'هَتَافُ العَيْطَل', build: 'momentum', icon: 'bow', short: 'أصب ٢ (+نصف الزخم)', text: 'رماية القوس الهتوف؛ تصيب بـ ٢ ضرر زائد نصف الزخم المخزن كضرر إضافي.', effects: [{ op: 'sniper', n: 2 }] },
  arrow_scout: { name: 'سَهْمُ السَّرَاة', build: 'momentum', icon: 'bow', short: 'أصب ٢ (+نصف الزخم)', text: 'سهم يقطع دجى الليل؛ يصيب بـ ٢ ضرر ويتعاظم بزيادة سرعة الشنفرى.', effects: [{ op: 'sniper', n: 2 }] },
  knife: { name: 'حَدُّ الإصْلِيت', build: 'bleed', icon: 'knife', short: 'أصب ٣ · جرح ١', text: '«وأبيض إصليت»؛ تجرد النصل بـ ٣ أضرار وتجرح يدك كبرياءً وعزة.', effects: [{ op: 'hurt', n: 1 }, { op: 'hit', n: 3 }] },
  knife_outlaw: { name: 'نَصْلُ الصَّعْلُوك', build: 'bleed', icon: 'knife', short: 'أصب ٣ · جرح ١', text: 'ضربة قاطعة من حديد السَّراة الصقيل تكلف نقطة صحة وتوقع ٣ أضرار.', effects: [{ op: 'hurt', n: 1 }, { op: 'hit', n: 3 }] },
  cover: { name: 'عِيَاذُ الصَّفَا', build: 'rock', icon: 'cover', short: 'صدّ ٣', text: 'تلوذ بحيد صخرٍ أصم؛ تصد ٣ أضرار من هجمات العدو هذا الدور.', effects: [{ op: 'block', n: 3 }] },
  cover_granite: { name: 'مَلاذُ الجَلْمَد', build: 'rock', icon: 'cover', short: 'صدّ ٣', text: 'تربض خلف حيد صخري منيع يمنح ثلاثة دروع حماية في كل تفعيل.', effects: [{ op: 'block', n: 3 }] },
  trick: { name: 'رَوَاغُ الزُّهْلُول', build: 'general', icon: 'feint', short: 'صدّ ١ · بعدي +٢', text: 'تزوغ كالنمر الأرقط؛ تصد ضرراً، وتزيد أول هجوم بعدها في الخط بضررين.', effects: [{ op: 'block', n: 1 }, { op: 'prime', n: 2 }] },
  wolf: { name: 'عُوَاءُ العَمَلَّس', build: 'beast', icon: 'wolf', short: 'أصب ٢ · وسم', text: '«سِيدٌ عَمَلَّس»؛ عواء الذئب يكشف العدو المعزول بضررين وعلامة مطاردة.', effects: [{ op: 'hit', n: 2 }, { op: 'mark', n: 1 }] },

  // Reward Draft Pool (12 Cards across 4 Builds)
  // 1. Momentum & Bow
  sniper_wind: { name: 'وَتَرُ الهِقْل', build: 'momentum', icon: 'bow', short: 'أصب ٣ (+نصف الزخم)', text: 'وتر مشدود كجناح النعامة؛ ٣ ضرر + نصف رصيد الزخم كضرر ساحق.', effects: [{ op: 'sniper', n: 3 }] },
  gale_surge: { name: 'رِيَاحُ السَّرَاة', build: 'momentum', icon: 'run', short: 'زخم +٣ · تحويل مضاعف', text: 'عاصفة جبلية تمنح +٣ زخم، وتجعل كل فائض زخم يتحول لضعفي الدرع.', effects: [{ op: 'momentum', n: 3 }, { op: 'surge_block', n: 2 }] },
  push_bow: { name: 'مَقْبِضُ الصَّدّ', build: 'momentum', icon: 'bow', short: 'أصب ٢ · دفع العدو', text: 'ضربة بقوس العيطل تدفع العدو خانتين وتتيح مسافة رماية آمنة.', effects: [{ op: 'hit', n: 2 }, { op: 'push', n: 2 }] },

  // 2. Bleed & Poison
  flint_blade: { name: 'شَفْرَةُ الصَّوَّان', build: 'bleed', icon: 'knife', short: 'أصب ٢ · نزف ٢', text: 'نصل مسنون يقطع العروق؛ يوقع ضررين ويترك نزفاً يدمي العدو عند كل حركة.', effects: [{ op: 'hit', n: 2 }, { op: 'bleed', n: 2 }] },
  desert_venom: { name: 'نَقِيعُ الذُّعَاف', build: 'bleed', icon: 'poison', short: 'سمّ ٢ يتجاوز الدرع', text: 'سم الأرقم المنقع؛ يطبق نقطتي سم تتجاوز دروع الحراس وتفتك بهم دورياً.', effects: [{ op: 'poison', n: 2 }] },
  rend_flesh: { name: 'بَتْرُ الشِّرْيَان', build: 'bleed', icon: 'knife', short: 'أصب ٣ · مضاعفة النزف', text: 'تمزيق جراح العدو؛ ٣ ضرر، وإن كان الخصم ينزف يتضاعف نزفه فوراً.', effects: [{ op: 'hit', n: 3 }, { op: 'double_bleed', n: 1 }] },

  // 3. Rock & Resilience
  eat_dirt: { name: 'اسْتِفَافُ التُّرْب', build: 'rock', icon: 'cover', short: 'صدّ ٢ + ضرر الجَلَد', text: '«وأستفّ ترب الأرض»؛ تحويل آلام الجراح إلى عزيمة: صدّ ٢ + ضرر يعادل صحتك المفقودة ÷ ٣.', effects: [{ op: 'block', n: 2 }, { op: 'grit_damage', n: 1 }] },
  granite_spire: { name: 'جُلْمُودٌ صَلْد', build: 'rock', icon: 'cover', short: 'صدّ ٤ منيع', text: 'متراس من صخور السَّراة؛ ٤ دروع صلبة في كل تفعيل لحماية العصبة.', effects: [{ op: 'block', n: 4 }] },
  rock_avalanche: { name: 'تَدَاعِي الشِّعْب', build: 'rock', icon: 'cover', short: 'انهيار ٢ للجميع', text: 'دحرجة الصخور من القمم؛ ضرران يطالان جميع الأعداء في ساحة المعركة.', effects: [{ op: 'aoe_hit', n: 2 }] },

  // 4. Beast Trinity & Outlaws
  leopard_ambush: { name: 'مِخْلَبُ الأَرْقَط', build: 'beast', icon: 'feint', short: 'أصب ٤ قبل فراغ', text: '«أرقط زهلول»؛ كمين النمر من الصخر؛ ٤ ضرر إذا كانت الخانة التالية فارغة وإلا ١.', effects: [{ op: 'ambush', n: 4 }] },
  hyena_patience: { name: 'صَبْرُ العَرْفَاء', build: 'beast', icon: 'wolf', short: 'صدّ ٢ · زخم ٢', text: '«عرفاء جيأل»؛ تعفف وصبر الضبعة؛ يمنح درعين ونقطتي زخم في كل تفعيل.', effects: [{ op: 'block', n: 2 }, { op: 'momentum', n: 2 }] },
  pack_frenzy: { name: 'مِيثَاقُ الرَّهْط', build: 'beast', icon: 'friend', short: 'تكالب الضواري', text: '«هم الرهط»؛ ضربة جماعية من الذئب والنمر تصيب بـ ٢ ضرر وتتكرر لكل عدو نازف أو مسموم.', effects: [{ op: 'frenzy', n: 2 }] },

  // Compatibility cards
  friend: { name: 'وَفَاءُ الرَّهْط', build: 'general', icon: 'friend', short: 'فك قيد / درع ٢', text: '«لا الجاني بما جرّ يُخذل»؛ فك قيد الرفيق أو صد ضربة بضررين.', effects: [{ op: 'friend', n: 1 }] },
  shift: { name: 'حِيلَةُ التَّحَوُّل', build: 'general', icon: 'swap', short: 'تبديل خانتين', text: '«إلا أنما أتحوّل»؛ تبديل بطاقتي الخانتين الأخريين ثم تطرح.', effects: [{ op: 'vanish', n: 1 }] },
  shelter: { name: 'مَلاذُ الجَلْمَد', build: 'rock', icon: 'cover', short: 'صدّ ٣', text: 'حيد صخري منيع يصد ٣ أضرار.', effects: [{ op: 'block', n: 3 }] },
  sneak: { name: 'دَبِيبُ السِّيد', build: 'beast', icon: 'sneak', short: 'زخم ١ · صدّ ٢', text: 'دبيب كذئب خميص البطن؛ زخم ١ وصدّ ٢.', effects: [{ op: 'momentum', n: 1 }, { op: 'move', n: 1 }, { op: 'block', n: 2 }] },
  ambush: { name: 'كَمِينُ الشِّعْب', build: 'beast', icon: 'bow', short: 'أصب ٤ قبل فراغ', text: 'مباغتة؛ إن كانت الخانة التالية فارغة ٤ ضرر وإلا ١.', effects: [{ op: 'ambush', n: 4 }] },
  erase: { name: 'عَفَاءُ الأَثَر', build: 'momentum', icon: 'foot', short: 'زخم ١ · تطرح', text: 'تتقدم وتطمس أثرك عن القوم.', effects: [{ op: 'momentum', n: 1 }, { op: 'move', n: 1 }, { op: 'vanish', n: 1 }] }
};

const alternates = {
  run: { name: 'وَثْبَةُ العَدَّاء', build: 'momentum', icon: 'run', short: 'زخم ٣ · تُطرح', text: '«أعدى من الشنفرى»؛ تثب ثلاث خطى سريعة وتطرح البطاقة.', effects: [{ op: 'momentum', n: 3 }, { op: 'move', n: 3 }, { op: 'vanish', n: 1 }] },
  run_swift: { name: 'وَثْبَةُ النَّجَاة', build: 'momentum', icon: 'run', short: 'زخم ٣ · تُطرح', text: 'انطلاقة حاسمة تسابق الريح لكسر الحصار وتطرح بعدها.', effects: [{ op: 'momentum', n: 3 }, { op: 'move', n: 3 }, { op: 'vanish', n: 1 }] },
  arrow: { name: 'مَنْأَى الكَرِيم', build: 'momentum', icon: 'foot', short: 'انسحب ٢ · تُطرح', text: '«وفي الأرض منأى للكريم»؛ انسحاب سريع بخطوتين وتطرح الرماية.', effects: [{ op: 'momentum', n: 2 }, { op: 'move', n: 2 }, { op: 'vanish', n: 1 }] },
  arrow_scout: { name: 'سَهْمٌ خَاطِف', build: 'momentum', icon: 'bow', short: 'أصب ٣ خاطف · تُطرح', text: 'رمية سريعة مفاجئة تصيب بـ ٣ أضرار وتفرغ الخانة فوراً.', effects: [{ op: 'hit', n: 3 }, { op: 'vanish', n: 1 }] },
  knife: { name: 'خَطْفَةٌ دَامِيَة', build: 'bleed', icon: 'knife', short: 'أصب ٢ · نزف ٢ · تُطرح', text: 'طعنة مباغتة تجرح العدو بـ ٢ ضرر وتطبق ٢ نزف ثم تطرح.', effects: [{ op: 'hit', n: 2 }, { op: 'bleed', n: 2 }, { op: 'vanish', n: 1 }] },
  knife_outlaw: { name: 'تَسَلُّقُ الوَعْر', build: 'bleed', icon: 'run', short: 'زخم ٢ · جرح ١', text: 'وطء شوك السَّراة؛ تكسب خطوتي زخم وتخسر صحة بدل النزال.', effects: [{ op: 'hurt', n: 1 }, { op: 'momentum', n: 2 }, { op: 'move', n: 2 }] },
  cover: { name: 'سَاتِرٌ عَاجِل', build: 'rock', icon: 'cover', short: 'ساتر ١ لاحقاً · تُطرح', text: 'تغرس متراساً صخرياً يدوم في الخانة للتفعيلات القادمة.', effects: [{ op: 'ward', n: 1 }, { op: 'vanish', n: 1 }] },
  cover_granite: { name: 'حَذَرُ السَّارِي', build: 'rock', icon: 'cover', short: 'زخم ١ · صدّ ١', text: 'تخطو كذئب وجل؛ زخم خطوة وصد ضرر واحد.', effects: [{ op: 'momentum', n: 1 }, { op: 'move', n: 1 }, { op: 'block', n: 1 }] },
  trick: { name: 'انْسِلالُ الغَبَش', build: 'general', icon: 'sneak', short: 'زخم ١ · صدّ ٢ · تُطرح', text: 'تنسل في غبش الفجر بين الصخور وتتوارى عن الأنظار.', effects: [{ op: 'momentum', n: 1 }, { op: 'move', n: 1 }, { op: 'block', n: 2 }, { op: 'vanish', n: 1 }] },
  wolf: { name: 'انْقِضَاضُ السِّيد', build: 'beast', icon: 'wolf', short: 'أصب ٤ للنازف · تُطرح', text: 'وثبة الذئب الكاسر؛ ٤ أضرار، أو ٦ أضرار إن كان العدو ينزف أو مسموماً.', effects: [{ op: 'wolf_pounce', n: 4 }, { op: 'vanish', n: 1 }] },

  // Reward Alternates
  sniper_wind: { name: 'إِطْلاقُ الإِعْصَار', build: 'momentum', icon: 'bow', short: '٥ + كامل الزخم ضرر · تُطرح', text: 'تفريغ كامل الزخم المتراكم كضرر صاعق واحد يقضي على الأعداء.', effects: [{ op: 'cyclone_shot', n: 5 }, { op: 'vanish', n: 1 }] },
  gale_surge: { name: 'عَاصِفَةُ الرِّمَال', build: 'momentum', icon: 'run', short: 'زخم ٤ · تعمية -٣ · تُطرح', text: 'إثارة الرمال في وجوه الحراس؛ ٤ زخم وتقليل هجوم الأعداء بـ ٣.', effects: [{ op: 'momentum', n: 4 }, { op: 'blind', n: 3 }, { op: 'vanish', n: 1 }] },
  push_bow: { name: 'قَوْسٌ مُتَوَثِّب', build: 'momentum', icon: 'bow', short: 'دفع ١ · زخم ٢ · تُطرح', text: 'دفع العدو خطوة واكتساب خطوتي زخم سريع.', effects: [{ op: 'push', n: 1 }, { op: 'momentum', n: 2 }, { op: 'vanish', n: 1 }] },
  flint_blade: { name: 'طَعْنَةٌ غَائِرَة', build: 'bleed', icon: 'knife', short: 'أصب ١ · نزف ٤ · تُطرح', text: 'طعنة غائرة تفجر ٤ نزف فوري في جسد الحارس.', effects: [{ op: 'hit', n: 1 }, { op: 'bleed', n: 4 }, { op: 'vanish', n: 1 }] },
  desert_venom: { name: 'سُمٌّ قَتَّال', build: 'bleed', icon: 'poison', short: 'سمّ ٣ يتجاوز الدرع · تُطرح', text: 'جرعة ذعاف قاتلة تتجاوز الدروع وتفتك فوراً بـ ٣ سم.', effects: [{ op: 'poison', n: 3 }, { op: 'vanish', n: 1 }] },
  rend_flesh: { name: 'انْفِجَارُ الدَّم', build: 'bleed', icon: 'knife', short: 'تفجير النزف ×٢ · تُطرح', text: 'استهلاك كل النزف على العدو كضرر فوري مضاعف (النزف × ٢).', effects: [{ op: 'explode_bleed', n: 2 }, { op: 'vanish', n: 1 }] },
  eat_dirt: { name: 'انْفِجَارُ الجَلَد', build: 'rock', icon: 'cover', short: 'صدّ ٦ · رد ٦ عند الخطر · تُطرح', text: 'درع هائل ٦ نقاط، وإن كانت صحتك تحت النصف تصيب العدو بـ ٦ ضرر.', effects: [{ op: 'block', n: 6 }, { op: 'crisis_counter', n: 6 }, { op: 'vanish', n: 1 }] },
  granite_spire: { name: 'غَرْسُ الجَلْمَد', build: 'rock', icon: 'cover', short: 'ساتران صخريان · تُطرح', text: 'زرع ساترين صخريين يدومان لحماية المعبر وتطرح البطاقة.', effects: [{ op: 'ward', n: 2 }, { op: 'vanish', n: 1 }] },
  rock_avalanche: { name: 'سَحْقُ الصُّخُور', build: 'rock', icon: 'cover', short: 'تفجير السواتر ٥ ضرر · تُطرح', text: 'تحويل كل السواتر الصخرية لشظايا تفجر ٥ أضرار جماعية بالخصوم.', effects: [{ op: 'detonate_wards', n: 5 }, { op: 'vanish', n: 1 }] },
  leopard_ambush: { name: 'وَثْبَةُ النَّمِر', build: 'beast', icon: 'feint', short: 'أصب ٥ خارق · تُطرح', text: 'وثبة خاطفة متجاهلة سواتر العدو بـ ٥ ضرر صريح.', effects: [{ op: 'hit', n: 5 }, { op: 'vanish', n: 1 }] },
  hyena_patience: { name: 'نَبْشُ الغَنَائِم', build: 'beast', icon: 'friend', short: 'استرداد بطاقة · تُطرح', text: 'استعادة بطاقة من مقبرتك إلى يدك فوراً.', effects: [{ op: 'scavenge', n: 1 }, { op: 'vanish', n: 1 }] },
  pack_frenzy: { name: 'زَئِيرُ الأَهْلِين', build: 'beast', icon: 'wolf', short: 'هجوم العصبة ٦ ضرر · تُطرح', text: 'هجوم منسق كاسح من الذئب والنمر والشنفرى بـ ٦ ضرر لا يرد.', effects: [{ op: 'hit', n: 6 }, { op: 'vanish', n: 1 }] },

  // Legacy Alternates
  friend: { name: 'عَزْمُ السُّرَى', build: 'general', icon: 'foot', short: 'زخم ٢ · تُطرح', text: 'شق مسلك النجاة العاجل وتطرح البطاقة.', effects: [{ op: 'momentum', n: 2 }, { op: 'move', n: 2 }, { op: 'vanish', n: 1 }] },
  shift: { name: 'صِدْقُ الزِّمَاع', build: 'general', icon: 'feint', short: 'الهجوم التالي +٣ · تُطرح', text: 'عزم قاطع يزيد الهجوم التالي بـ ٣ أضرار.', effects: [{ op: 'prime', n: 3 }, { op: 'vanish', n: 1 }] },
  shelter: { name: 'أَثَرُ السَّاتِر', build: 'rock', icon: 'cover', short: 'ساتر ١ لاحقاً · تُطرح', text: 'تخلف وراءك أثر صخرة يصد ضرراً.', effects: [{ op: 'ward', n: 1 }, { op: 'vanish', n: 1 }] },
  sneak: { name: 'انْقِضَاضُ السِّيد', build: 'beast', icon: 'knife', short: 'أصب ٢ · زخم ١ · تُطرح', text: 'وثبة الذئب الكاسر.', effects: [{ op: 'hit', n: 2 }, { op: 'momentum', n: 1 }, { op: 'move', n: 1 }, { op: 'vanish', n: 1 }] },
  ambush: { name: 'دَعْسُ النَّمْشَاء', build: 'momentum', icon: 'run', short: 'زخم ٣ · جرح ١ · تُطرح', text: 'اقتحام ثلاث خطوات عاجلة نحو المأمن.', effects: [{ op: 'hurt', n: 1 }, { op: 'momentum', n: 3 }, { op: 'move', n: 3 }, { op: 'vanish', n: 1 }] },
  erase: { name: 'لُبُوثُ الظِّلال', build: 'general', icon: 'sneak', short: 'صدّ ٢ · التالي +١', text: 'تلبث في سواد الليل متوارياً.', effects: [{ op: 'block', n: 2 }, { op: 'prime', n: 1 }] }
};

const DRAFT_POOL = [
  'sniper_wind', 'gale_surge', 'push_bow',
  'flint_blade', 'desert_venom', 'rend_flesh',
  'eat_dirt', 'granite_spire', 'rock_avalanche',
  'leopard_ambush', 'hyena_patience', 'pack_frenzy'
];

const RELICS = {
  sandals: {
    id: 'sandals',
    name: 'نَعْلا العَدَّاء',
    icon: 'sandals',
    title: 'نَعْلا العَدَّاء (The Runner\'s Sandals)',
    desc: 'كل نقطة زخم فائضة بنهاية الدور تمنح +٢ صد بدلاً من +١. وإذا بلغ الفائض ٤+ يُدفع العدو خانة للخلف!'
  },
  wolf_skin: {
    id: 'wolf_skin',
    name: 'قِرْبَةُ الذِّئْبِ العَمَلَّس',
    icon: 'waterskin',
    title: 'قِرْبَةُ الذِّئْبِ (Waterskin of the Wolf)',
    desc: 'عند تفريغ أي خط مكتمل (٣ بطاقات) على الشبكة، يُطبق ٣ نزف على الأعداء وينقض الذئب بـ ٣ ضرر مجاني!'
  },
  crag_salaman: {
    id: 'crag_salaman',
    name: 'صَخْرَةُ سَلامَان الشَّاهِقَة',
    icon: 'stone',
    title: 'صَخْرَةُ سَلامَان (Crag of Salaman)',
    desc: 'السواتر الصخرية لا تضيع؛ عند استهلاك أو طمس ساتر، ينفجر بـ ٥ ضرر شظايا ويكسبك ٣ صد فوري!'
  },
  taabbata_bracer: {
    id: 'taabbata_bracer',
    name: 'مِعْصَمُ تَأَبَّطَ شَرّاً',
    icon: 'bracer',
    title: 'مِعْصَمُ تَأَبَّط (Ta\'abbata\'s Bracer)',
    desc: 'الخانات الفارغة في خط التفعيل تمنح +٢ ضرر لأول ضربة بالخط، و+١ زخم إضافي.'
  }
};

const ENCOUNTERS = [
  {
    index: 1,
    name: 'مَضِيقُ الصَّفَا',
    tagline: 'طَلِيعَةُ سَلامَان فِي مَضِيقِ الصَّفَا',
    desc: 'حارس المضيق ومتعقب الأثر يحرسان عنق الزجاجة وصندوق الزاد.',
    goal: 10,
    enemies: [
      { id: 'guard', name: 'حَارِسُ المَضِيق', hp: 18, maxHp: 18, attack: 4, shield: 2 },
      { id: 'scout', name: 'مُتَعَقِّبُ الأَثَر', hp: 12, maxHp: 12, attack: 3, shield: 0 }
    ],
    bg: 'canyon',
    verse: '«فَإِنِّي إِذَا مَا الخَيْلُ جَالَتْ عَفَاؤُهَا • لَأَسْبِقُ خَيْلَ القَوْمِ وَالرَّجْلُ أَعْجَلُ»'
  },
  {
    index: 2,
    name: 'قَلْتُ المَاءِ والمَوْرِد',
    tagline: 'كَمِينُ المَوْرِدِ وَعِفَّةُ الصَّعْلُوك',
    desc: 'نبع ماء في الخانة الوسطى يشفي الجراح ويزيل الإجهاد؛ كسر الطوق حول المورد.',
    goal: 10,
    springCell: 4,
    enemies: [
      { id: 'cavalry', name: 'فَارِسُ الطَّلِيعَة', hp: 24, maxHp: 24, attack: 6, shield: 2 },
      { id: 'hound', name: 'كَلْبُ الصَّيْدِ السَّلُوقِيّ', hp: 14, maxHp: 14, attack: 4, shield: 0 }
    ],
    bg: 'oasis',
    verse: '«وَإِنْ مُدَّتِ الأَيْدِي إِلَى الزَّادِ لَمْ أَكُنْ • بِأَعْجَلِهِمْ إِذْ أَجْشَعُ القَوْمِ أَعْجَلُ»'
  },
  {
    index: 3,
    name: 'شِعَابُ الغَبَشِ والكمين',
    tagline: 'ضَبَابُ الفَجْرِ وَنِبَالُ القَتَاد',
    desc: 'ضباب كثيف يغطي أعالي الوادي ورماة سلامان يطلقون سهاماً مسمومة.',
    goal: 12,
    fogRow: 0,
    enemies: [
      { id: 'sniper1', name: 'رُمَاةُ الكَمِين', hp: 18, maxHp: 18, attack: 5, poison: 1, shield: 0 },
      { id: 'trapper', name: 'صَائِدُ الجَوَائِز', hp: 26, maxHp: 26, attack: 4, shield: 2 }
    ],
    bg: 'mist',
    verse: '«وَأَرْقَطُ زُهْلُولٌ وَعَرْفَاءُ جَيْأَلُ • إِذَا خَفِيَتْ لِلْعَارِضِ النَّبْلُ صَلْصَلَا»'
  },
  {
    index: 4,
    name: 'مُعَسْكَرُ بَنِي سَلامَان',
    tagline: 'نِزَالُ المِئَةِ الأَخِير — الزَّعِيمُ عَوْفُ بْنُ صَخْر',
    desc: 'النزال النهائي لإتمام نذر الشنفرى؛ زعيم بني سلامان مع حاملي التراس.',
    goal: 14,
    boss: true,
    enemies: [
      { id: 'warlord', name: 'عَوْفُ بْنُ صَخْر (زَعِيمُ سَلامَان)', hp: 44, maxHp: 44, attack: 7, shield: 3, isBoss: true },
      { id: 'shield_r', name: 'حَامِلُ التِّرَاسِ الأَيْمَن', hp: 16, maxHp: 16, attack: 3, shield: 4 },
      { id: 'shield_l', name: 'حَامِلُ التِّرَاسِ الأَيْسَر', hp: 16, maxHp: 16, attack: 3, shield: 4 }
    ],
    bg: 'camp',
    verse: '«أَقِيمُوا بَنِي أُمِّي صُدُورَ مَطِيِّكُمْ • فَإِنِّي إِلى قَوْمٍ سِوَاكُمْ لَأَمْيَلُ»'
  }
];

const rewards = {
  keep: { label: 'ثباتٌ على التدبير الحالي' },
  ambush: { label: 'كَمِينُ الشِّعْب' },
  erase: { label: 'عَفَاءُ الأَثَر' },
  shelter: { label: 'مَلاذُ الجَلْمَد' }
};

const trailCells = [0, 4, 8];
const type = uid => uid?.split('.')[0];
const cardType = (uid, s) => s?.upgrades?.[uid] || type(uid);

function def(uid, s, face = s?.faces?.[uid] ?? 0) {
  const k = cardType(uid, s);
  const pool = face === 1 ? alternates : cards;
  const c = pool[k] || cards[k] || cards.run;
  if (face === 1) return c;
  if (k === 'friend' && s?.encounter >= 2 && s?.friend < 3) {
    return { ...c, name: 'وَحْشَةُ المُنْفَرِد', short: 'تقدّم ١', text: '«وَلِي دُونَكُمْ أَهْلُونَ»؛ بقي رفيقك في قيود الوادي، تتقدّم خطوة مستغنياً.', effects: [{ op: 'move', n: 1 }] };
  }
  if (k === 'friend' && s?.friend === 3) {
    return { ...c, name: 'دِرْعُ الرَّفِيق', short: 'صدّ ٢', text: '«وفاء الصاحب»؛ رفيقك طليق معك ويصد عنك ضربة الحارس بضررين.', effects: [{ op: 'block', n: 2 }] };
  }
  return c;
}

function lineIndices(cell, axis) {
  return axis === 'row'
    ? [0, 1, 2].map(c => Math.floor(cell / 3) * 3 + c)
    : [0, 1, 2].map(r => r * 3 + (cell % 3));
}

function random(s) {
  s.rng = (Math.imul(s.rng, 1664525) + 1013904223) >>> 0;
  return s.rng / 4294967296;
}

function shuffle(s, a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random(s) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function draw(s) {
  while (s.hand.length < 4) {
    if (!s.draw.length) {
      if (!s.discard.length) break;
      s.draw = shuffle(s, s.discard.splice(0));
    }
    s.hand.push(s.draw.shift());
  }
}

function goal(s) {
  return ENCOUNTERS[s.encounter - 1]?.goal ?? 10;
}

function collapseRow(s) {
  return s.encounter === 2 ? [2, 1, 0][(s.phaseTurn - 1) % 3] : null;
}

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

function incoming(s) {
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

function setupEncounter(s, encIdx) {
  s.encounter = encIdx;
  const enc = ENCOUNTERS[encIdx - 1];
  s.progress = 0;
  s.momentum = 0;
  s.bleed = 0;
  s.poison = 0;
  s.phaseTurn = 1;
  s.enemies = enc.enemies.map(e => ({ ...e }));
  s.enemy = s.enemies.reduce((acc, e) => acc + e.hp, 0);
  s.wards = Array(9).fill(false);

  // Return grid cards to discard
  for (const uid of s.grid) {
    if (uid) s.discard.push(uid);
  }
  s.grid = Array(9).fill(null);
  s.faces = {};
  s.rewardClaimed = false;
  s.draftChoices = [];
  draw(s);
}

const STARTER_DECK = [
  'run.0', 'run.1',
  'arrow.0', 'arrow.1',
  'knife.0', 'knife.1',
  'cover.0', 'cover.1',
  'trick.0', 'wolf.0'
];

function fresh(seed = 20261016) {
  const s = {
    v: 8,
    version: VERSION,
    seed: seed >>> 0,
    rng: seed >>> 0,
    screen: 'title',
    encounter: 1,
    turn: 1,
    phaseTurn: 1,
    hp: 24,
    maxHp: 24,
    momentum: 0,
    progress: 0,
    enemy: 30,
    enemies: [],
    bleed: 0,
    poison: 0,
    relics: ['sandals'],
    grid: Array(9).fill(null),
    wards: Array(9).fill(false),
    faces: {},
    upgrades: {},
    deck: [...STARTER_DECK],
    hand: [],
    draw: [],
    discard: [],
    loot: false,
    friend: 0,
    firstResult: null,
    rewardClaimed: false,
    draftChoices: [],
    relicChosen: false,
    cardSeq: 10,
    outcome: null,
    last: null
  };

  const enc = ENCOUNTERS[0];
  s.enemies = enc.enemies.map(e => ({ ...e }));
  s.enemy = s.enemies.reduce((a, b) => a + b.hp, 0);

  const available = [...s.deck];
  s.grid[0] = available[0]; // run.0
  s.grid[4] = available[1]; // run.1
  const remaining = available.slice(2);
  s.hand = remaining.slice(0, 4);
  s.draw = shuffle(s, remaining.slice(4));

  return s;
}

function stage(s, a) {
  const grid = s.grid.slice();
  const wards = s.wards.slice();
  const faces = { ...s.faces };
  const swaps = [];
  const erasedWards = [];

  if (s.screen !== 'play' || !s.hand.includes(a.card) || a.cell < 0 || a.cell > 8 || s.grid[a.cell]) {
    return { grid, wards, faces, swaps, erasedWards };
  }

  if (wards[a.cell]) {
    erasedWards.push(a.cell);
    wards[a.cell] = false;
  }
  grid[a.cell] = a.card;
  faces[a.card] = a.face ?? 0;

  if (faces[a.card] === 0 && cardType(a.card, s) === 'shift') {
    const [x, y] = lineIndices(a.cell, a.axis).filter(i => i !== a.cell);
    [grid[x], grid[y]] = [grid[y], grid[x]];
    swaps.push({ from: x, to: y });
    for (const i of [x, y]) {
      if (grid[i] && wards[i]) {
        wards[i] = false;
        erasedWards.push(i);
      }
    }
  }

  return { grid, wards, faces, swaps, erasedWards };
}

function rollDraftChoices(s) {
  const pool = [...DRAFT_POOL];
  shuffle(s, pool);
  return pool.slice(0, 3);
}

function valid(s, a) {
  if (s.screen === 'interlude') return a.kind === 'continue';
  if (s.screen === 'reward') {
    if (a.kind === 'draft' && DRAFT_POOL.includes(a.choice)) return true;
    if (a.kind === 'purge') return true;
    if (a.kind === 'skip') return true;
    if (a.kind === 'reward') return true;
    return false;
  }
  if (s.screen === 'relic') {
    return a.kind === 'relic' && Object.hasOwn(RELICS, a.choice);
  }
  return s.screen === 'play' && s.hand.includes(a.card) && Number.isInteger(a.cell) && a.cell >= 0 && a.cell < 9 && !s.grid[a.cell] && ['row', 'col'].includes(a.axis) && (a.face === undefined || a.face === 0 || a.face === 1);
}

function actions(s) {
  if (s.screen === 'interlude') return [{ kind: 'continue' }];
  if (s.screen === 'reward') {
    const list = (s.draftChoices.length ? s.draftChoices : ['sniper_wind', 'flint_blade', 'granite_spire']).map(choice => ({ kind: 'draft', choice }));
    list.push({ kind: 'purge' });
    list.push({ kind: 'skip' });
    return list;
  }
  if (s.screen === 'relic') {
    return Object.keys(RELICS).map(choice => ({ kind: 'relic', choice }));
  }
  if (s.screen !== 'play') return [];

  return s.hand.flatMap(card =>
    s.grid.flatMap((uid, cell) =>
      uid ? [] : ['row', 'col'].flatMap(axis =>
        [0, 1].map(face => ({ card, cell, axis, face }))
      )
    )
  );
}

function applyDamageToEnemies(s, dmg) {
  let remaining = dmg;
  if (!s.enemies || !s.enemies.length) {
    s.enemy = Math.max(0, s.enemy - dmg);
    return;
  }

  // Boss encounter targeting: check if shieldbearers are guarding warlord
  const activeShields = s.enemies.filter(e => e.id.startsWith('shield') && e.hp > 0);
  const targetPool = activeShields.length > 0 ? activeShields : s.enemies.filter(e => e.hp > 0);

  for (const e of targetPool) {
    if (e.hp > 0 && remaining > 0) {
      const take = Math.min(e.hp, remaining);
      e.hp -= take;
      remaining -= take;
    }
  }

  // If still remaining damage, overflow to other enemies
  if (remaining > 0) {
    for (const e of s.enemies) {
      if (e.hp > 0 && remaining > 0) {
        const take = Math.min(e.hp, remaining);
        e.hp -= take;
        remaining -= take;
      }
    }
  }

  s.enemy = s.enemies.reduce((acc, e) => acc + e.hp, 0);
}

function activate(state, a) {
  if (!valid(state, a)) return { state: structuredClone(state), valid: false };
  const s = structuredClone(state);

  // Transition screen: Interlude
  if (s.screen === 'interlude') {
    if (a.kind === 'continue') {
      if (s.encounter === 2 && !s.relicChosen) {
        s.screen = 'relic';
      } else if (s.encounter < 4) {
        setupEncounter(s, s.encounter + 1);
        s.screen = 'play';
      } else {
        s.screen = 'end';
        s.outcome = 'full';
      }
      const summary = { action: structuredClone(a), kind: 'transition', log: ['عبرتَ شِعاب السَّراة نحو التحدي القادم.'] };
      s.last = summary;
      assertState(s);
      return { state: s, valid: true, summary };
    }
  }

  // Transition screen: Reward / Draft
  if (s.screen === 'reward') {
    if (a.kind === 'draft' && a.choice) {
      s.cardSeq = (s.cardSeq || 10) + 1;
      const uid = `${a.choice}.${s.cardSeq}`;
      s.deck.push(uid);
      s.discard.push(uid);
      s.rewardClaimed = true;
      s.screen = 'interlude';
      const summary = { action: structuredClone(a), kind: 'reward', choice: a.choice, log: [`ظفرتَ ببطاقة «${cards[a.choice]?.name || a.choice}».`] };
      s.last = summary;
      assertState(s);
      return { state: s, valid: true, summary };
    }
    if (a.kind === 'purge') {
      if (s.deck.length > 8) {
        const removed = s.deck.pop();
        s.hand = s.hand.filter(u => u !== removed);
        s.draw = s.draw.filter(u => u !== removed);
        s.discard = s.discard.filter(u => u !== removed);
        s.grid = s.grid.map(u => u === removed ? null : u);
      }
      s.rewardClaimed = true;
      s.screen = 'interlude';
      const summary = { action: structuredClone(a), kind: 'reward', choice: 'purge', log: ['«الزهد والاستغناء»؛ خفّفتَ رزمتك من الأحمال الزائدة.'] };
      s.last = summary;
      assertState(s);
      return { state: s, valid: true, summary };
    }
    if (a.kind === 'skip' || a.kind === 'reward') {
      s.rewardClaimed = true;
      s.screen = 'interlude';
      const summary = { action: structuredClone(a), kind: 'reward', choice: 'skip', log: ['مضيتَ ثابتاً على تدبيرك دون تبديل.'] };
      s.last = summary;
      assertState(s);
      return { state: s, valid: true, summary };
    }
  }

  // Transition screen: Relic Pick
  if (s.screen === 'relic') {
    if (a.kind === 'relic' && RELICS[a.choice]) {
      if (!s.relics.includes(a.choice)) s.relics.push(a.choice);
      s.relicChosen = true;
      setupEncounter(s, s.encounter + 1);
      s.screen = 'play';
      const summary = { action: structuredClone(a), kind: 'relic', choice: a.choice, log: [`اكتسبتَ أثر «${RELICS[a.choice].name}».`] };
      s.last = summary;
      assertState(s);
      return { state: s, valid: true, summary };
    }
  }

  // Screen: Play action
  const log = [];
  const effects = [];
  const beforeFriend = s.friend;
  const staged = stage(state, a);
  const erasedWard = staged.erasedWards.length > 0;

  s.hand.splice(s.hand.indexOf(a.card), 1);
  s.grid = staged.grid;
  s.wards = staged.wards;
  s.faces = staged.faces;

  if (staged.swaps.length) {
    log.push('«إلا أنما أتحوّل».. تبدّلت الخانتان بحيلة التحوّل قبل حلول الأفعال.');
  }

  const cells = lineIndices(a.cell, a.axis);
  const line = cells.filter(i => s.grid[i]).map(i => ({
    cell: i,
    uid: s.grid[i],
    face: s.faces[s.grid[i]] ?? 0,
    name: def(s.grid[i], s).name
  }));

  let block = 0;
  let prime = 0;
  let hits = 0;
  let moves = 0;
  let selfDamage = 0;
  const disappear = [];
  const wardSeeds = [];

  // Ta'abbata Bracer relic: empty cells in line grant +2 boost and +1 momentum
  if (s.relics.includes('taabbata_bracer')) {
    const emptyCount = cells.filter(i => !s.grid[i]).length;
    if (emptyCount > 0) {
      prime += emptyCount * 2;
      s.momentum += emptyCount;
      log.push(`«مِعْصَمُ تَأَبَّطَ» يمنح +${emptyCount * 2} ضرر و+${emptyCount} زخم من فراغ الخانات.`);
    }
  }

  // Crag of Salaman relic: erased wards explode for 5 damage + 3 block
  if (s.relics.includes('crag_salaman') && staged.erasedWards.length > 0) {
    const explDmg = staged.erasedWards.length * 5;
    applyDamageToEnemies(s, explDmg);
    hits += explDmg;
    block += staged.erasedWards.length * 3;
    log.push(`«صَخْرَةُ سَلامَان» تفجر شظايا الساتر بـ ${explDmg} ضرر و+${staged.erasedWards.length * 3} صد!`);
  }

  function doMove(amount) {
    const old = s.progress;
    s.progress = Math.min(goal(s), s.progress + amount);
    moves += s.progress - old;
    if (s.encounter === 1 && !s.loot && s.progress >= 4) {
      s.loot = true;
      log.push('«وإن مُدّت الأيدي إلى الزاد».. ظفرتَ بزاد الرحلة؛ بقي أن تبلغ به المأمن.');
    }
    return s.progress - old;
  }

  // Resolve line cell by cell
  for (let pos = 0; pos < cells.length; pos++) {
    const cell = cells[pos];
    const uid = s.grid[cell];

    if (!uid) {
      if (trailCells.includes(cell)) {
        const moved = doMove(1);
        s.momentum += 1;
        effects.push({ cell, uid: null, op: 'trail', amount: moved });
      }
      if (s.wards[cell]) {
        block += 1;
        effects.push({ cell, uid: null, op: 'ward', amount: 1 });
      }
      if (s.encounter === 2 && cell === 4) {
        const heal = Math.min(4, s.maxHp - s.hp);
        s.hp += heal;
        log.push(`«عَيْنُ المَوْرِد»؛ ارتويتَ وشُفيتَ بـ ${heal} صحة.`);
      }
      continue;
    }

    const c = def(uid, s);
    for (const fx of c.effects) {
      let amount = fx.n;
      let boost = 0;

      if (fx.op === 'move') {
        amount = doMove(amount);
      } else if (fx.op === 'momentum') {
        s.momentum += amount;
      } else if (fx.op === 'hit' || fx.op === 'ambush') {
        if (fx.op === 'ambush') {
          amount = pos < 2 && !s.grid[cells[pos + 1]] ? 4 : 1;
        }
        boost = prime;
        const totalHit = amount + prime;
        prime = 0;
        applyDamageToEnemies(s, totalHit);
        hits += totalHit;
      } else if (fx.op === 'sniper') {
        const bonus = Math.floor(s.momentum / 2);
        boost = prime;
        const totalHit = amount + prime + bonus;
        prime = 0;
        applyDamageToEnemies(s, totalHit);
        hits += totalHit;
      } else if (fx.op === 'cyclone_shot') {
        const bonus = s.momentum;
        boost = prime;
        const totalHit = amount + prime + bonus;
        prime = 0;
        s.momentum = 0;
        applyDamageToEnemies(s, totalHit);
        hits += totalHit;
      } else if (fx.op === 'hurt') {
        s.hp = Math.max(0, s.hp - amount);
        selfDamage += amount;
      } else if (fx.op === 'block') {
        block += amount;
      } else if (fx.op === 'prime') {
        prime += amount;
      } else if (fx.op === 'friend') {
        if (s.friend < 3) s.friend = Math.min(3, s.friend + amount);
        else { block += 2; amount = 2; }
      } else if (fx.op === 'ward') {
        wardSeeds.push(cell);
      } else if (fx.op === 'vanish') {
        disappear.push(cell);
      } else if (fx.op === 'bleed') {
        s.bleed += amount;
      } else if (fx.op === 'poison') {
        s.poison += amount;
      } else if (fx.op === 'double_bleed') {
        s.bleed *= 2;
        log.push(`ضاعفتَ نزف الأعداء إلى ${s.bleed}!`);
      } else if (fx.op === 'explode_bleed') {
        const dmg = s.bleed * 2 + prime;
        prime = 0;
        applyDamageToEnemies(s, dmg);
        s.bleed = 0;
        hits += dmg;
        log.push(`فجّرتَ النزف بـ ${dmg} ضرر فوري!`);
      } else if (fx.op === 'wolf_pounce') {
        const bonus = (s.bleed > 0 || s.poison > 0) ? 2 : 0;
        boost = prime + bonus;
        const totalHit = amount + boost;
        prime = 0;
        applyDamageToEnemies(s, totalHit);
        hits += totalHit;
      } else if (fx.op === 'aoe_hit') {
        const totalHit = amount + prime;
        prime = 0;
        for (const e of s.enemies) {
          if (e.hp > 0) e.hp = Math.max(0, e.hp - totalHit);
        }
        s.enemy = s.enemies.reduce((acc, e) => acc + e.hp, 0);
        hits += totalHit;
      } else if (fx.op === 'detonate_wards') {
        const wardCount = s.wards.filter(Boolean).length;
        if (wardCount > 0) {
          const dmg = wardCount * amount;
          applyDamageToEnemies(s, dmg);
          s.wards = Array(9).fill(false);
          hits += dmg;
        }
      }

      effects.push({ cell, uid, op: fx.op, amount, ...(boost ? { boost } : {}) });
    }
  }

  // Full Line Clearing & Vanish
  const isFullLine = line.length === 3;
  const cleared = isFullLine ? line.map(x => x.uid) : [];
  const vanished = [];
  for (const i of cells) {
    if (s.grid[i] && (cleared.length || disappear.includes(i))) {
      if (!cleared.length) vanished.push(s.grid[i]);
      if (wardSeeds.includes(i)) s.wards[i] = true;
      s.discard.push(s.grid[i]);
      delete s.faces[s.grid[i]];
      s.grid[i] = null;
    }
  }

  // Waterskin of the Wolf Relic: Full line clear applies 3 Bleed + 3 Wolf Strike
  if (isFullLine && s.relics.includes('wolf_skin')) {
    s.bleed += 3;
    applyDamageToEnemies(s, 3);
    hits += 3;
    log.push('«قِرْبَةُ الذِّئْبِ»؛ تفريغ الخط يجذب الذئب ليطبق ٣ نزف و٣ ضرر نهش!');
  }

  // Unspent Momentum converted to Block
  const blockPerPoint = s.relics.includes('sandals') ? 2 : 1;
  const momentumBlock = s.momentum * blockPerPoint;
  block += momentumBlock;
  if (s.momentum > 0) {
    log.push(`«الزخم الفائض» (${s.momentum}) تحول إلى +${momentumBlock} صد.`);
  }

  // Sandals push trigger
  if (s.relics.includes('sandals') && s.momentum >= 4) {
    log.push('«نَعْلا العَدَّاء»؛ عاصفة الزخم تدفع طليعة الأعداء للخلف وتشتت هجومهم!');
  }
  s.momentum = 0;

  if (wardSeeds.length) log.push('أقمتَ ساترَ صخرٍ وراءك يصدّ عنك في الكرّة القادمة.');
  if (erasedWard) log.push('غطّت خُطوتك موضعَ الصخرة؛ زال ستر الخانة.');

  // Enemy counterattack calculation
  const threat = incoming(s);
  const anticipated = Math.max(0, threat - block);
  let enemyDamage = 0;
  const collapsed = [];
  const collapsedCells = [];
  const completed = s.progress >= goal(s) || (s.enemy <= 0);

  if (s.hp <= 0) {
    s.outcome = 'dead';
    s.screen = 'end';
  } else if (completed) {
    if (s.encounter < 4) {
      s.screen = 'reward';
      s.rewardClaimed = false;
      s.draftChoices = rollDraftChoices(s);
      s.firstResult = {
        turn: s.turn,
        hp: s.hp,
        enemy: s.enemy,
        friend: s.friend,
        loot: s.loot,
        route: s.enemy === 0 ? 'clear' : 'escape'
      };
      log.push(`أحكمتَ نصر المواجهة ${s.encounter}؛ اختر أسلوبك للمسير.`);
    } else {
      s.outcome = 'full';
      s.screen = 'end';
      log.push('«أَقِيمُوا بَنِي أُمِّي صُدُورَ مَطِيِّكُمْ».. أسقطتَ زعيمَ سلامان وأوفيتَ نذرَ المئةِ قتيل!');
    }
  } else {
    enemyDamage = Math.min(s.hp, anticipated);
    s.hp -= enemyDamage;

    // Poison ticks on enemies
    if (s.poison > 0) {
      applyDamageToEnemies(s, s.poison);
      log.push(`السمّ يفتك بالأعداء بـ ${s.poison} ضرر مباشر.`);
      s.poison = Math.max(0, s.poison - 1);
    }

    if (s.encounter === 2) {
      const row = collapseRow(s);
      if (row !== null) {
        for (let i = row * 3; i < row * 3 + 3; i++) {
          collapsedCells.push(i);
          if (s.grid[i]) {
            collapsed.push(s.grid[i]);
            s.discard.push(s.grid[i]);
            delete s.faces[s.grid[i]];
            s.grid[i] = null;
          }
          s.wards[i] = false;
        }
        log.push('تداعى جدار الشِّعب؛ هوت صخوره وطُرحت بطاقات الصف وزالت سواتره.');
      }
    }

    if (s.hp <= 0) {
      s.outcome = 'dead';
      s.screen = 'end';
    } else if (s.turn >= 36) {
      s.outcome = 'caught';
      s.screen = 'end';
      log.push('«والليلُ مقمرٌ.. فانصدع الصبحُ»؛ أدركك الفجر وانكشفت المسالك قبل بلوغ المخبأ.');
    } else {
      s.turn++;
      s.phaseTurn++;
      draw(s);
    }
  }

  s.last = {
    action: structuredClone(a),
    kind: 'turn',
    line,
    effects,
    cleared,
    vanished,
    block,
    hits,
    moves,
    selfDamage,
    enemyDamage,
    anticipated,
    friendSaved: beforeFriend < 3 && s.friend === 3,
    traceLeft: wardSeeds.length ? line.find(x => wardSeeds.includes(x.cell))?.uid : null,
    erasedWard,
    erasedWards: staged.erasedWards,
    collapsed,
    collapsedCells,
    swaps: staged.swaps,
    unusedPrime: prime,
    log
  };

  assertState(s);
  return { state: s, valid: true, summary: s.last };
}

function start(s) {
  return s.screen === 'title' ? { ...structuredClone(s), screen: 'play' } : s;
}

function assertState(s) {
  const zones = [...s.hand, ...s.draw, ...s.discard, ...s.grid.filter(Boolean)];
  if (zones.length < 8 || zones.length > 30 || new Set(zones).size !== zones.length) {
    throw Error('Card zone corruption');
  }
  if (s.wards.length !== 9 || s.grid.length !== 9 || s.hand.length > 5 || s.hp < 0 || s.hp > 30) {
    throw Error('Invalid resources');
  }
  if (!['title', 'play', 'reward', 'relic', 'interlude', 'end'].includes(s.screen)) {
    throw Error('Invalid screen');
  }
  return true;
}

function snapshot(s) {
  const { last, ...rest } = s;
  return structuredClone(rest);
}


// --- combos.mjs ---


const ATTACK_OPS = ['hit', 'ambush', 'sniper', 'cyclone_shot', 'wolf_pounce', 'aoe_hit', 'explode_bleed'];

// Presentation evidence derived from resolved effects; this does not change the rules.
function comboModel(s, a, result = activate(s, a)) {
  if (!result.valid || result.summary.kind !== 'turn') {
    return { steps: [], links: [], expired: [], ambushes: [], swaps: [] };
  }

  const { grid, faces } = stage(s, a);
  const shown = { ...s, faces };
  const cells = lineIndices(a.cell, a.axis);
  const effects = result.summary.effects || [];
  const links = [];
  const ambushes = [];
  let pending = [];

  for (const fx of effects) {
    if (fx.op === 'prime') {
      pending.push({ uid: fx.uid, name: def(fx.uid, shown).name, cell: fx.cell, amount: fx.amount });
    }
    if (ATTACK_OPS.includes(fx.op)) {
      const pos = cells.indexOf(fx.cell);
      const next = pos < 2 ? cells[pos + 1] : null;
      const open = next !== null && !grid[next];
      const base = fx.op === 'ambush' ? (open ? 4 : 1) : cardType(fx.uid, s) === 'knife' ? 3 : 2;

      if (fx.op === 'ambush') {
        ambushes.push({ uid: fx.uid, cell: fx.cell, next, open, base, damage: fx.amount });
      }

      if (pending.length) {
        links.push({
          sources: pending,
          target: fx.uid,
          targetName: def(fx.uid, shown).name,
          cell: fx.cell,
          base,
          boost: fx.boost || 0,
          power: base + (fx.boost || 0),
          damage: fx.amount
        });
        pending = [];
      }
    }
  }

  return {
    totals: result.summary,
    steps: cells.map(cell => ({
      cell,
      uid: grid[cell],
      name: grid[cell]
        ? def(grid[cell], shown).name
        : effects.some(e => e.cell === cell && e.op === 'ward')
        ? 'ساتر'
        : effects.some(e => e.cell === cell && e.op === 'trail')
        ? 'درب'
        : 'فراغ',
      effects: effects.filter(e => e.cell === cell)
    })),
    links,
    expired: pending,
    ambushes,
    swaps: result.summary.swaps || []
  };
}

function comboHints(s, card, face = 0) {
  const hints = {};
  for (const a of actions(s)) {
    if (a.card !== card || a.face !== face) continue;
    const x = activate(s, a);
    const m = comboModel(s, a, x);
    if (m.links.length) {
      const boost = m.links.reduce((n, l) => n + l.boost, 0);
      (hints[a.cell] ??= []).push({ axis: a.axis, boost, targets: m.links.map(l => l.target) });
    }
  }
  return hints;
}


// --- report.mjs ---


const begin = s => ({
  version: VERSION,
  runId: globalThis.crypto?.randomUUID?.() || String(Date.now()),
  startedAt: new Date().toISOString(),
  coverage: 'complete',
  initial: snapshot(s),
  events: [],
  final: snapshot(s)
});

function record(r, before, action, result) {
  const alternatives = actions(before).map(a => {
    const x = activate(before, a);
    return { action: a, after: snapshot(x.state), summary: x.summary };
  });
  const after = snapshot(result.state);
  return {
    ...r,
    events: [
      ...r.events,
      {
        index: r.events.length + 1,
        at: new Date().toISOString(),
        before: snapshot(before),
        action,
        after,
        summary: result.summary,
        alternatives
      }
    ],
    final: after,
    endedAt: after.screen === 'end' ? new Date().toISOString() : null
  };
}

function restore(raw, s) {
  try {
    if (raw?.version === VERSION && JSON.stringify(raw.final) === JSON.stringify(snapshot(s))) {
      let state = raw.initial;
      for (const e of raw.events) {
        if (JSON.stringify(snapshot(state)) !== JSON.stringify(e.before)) throw Error();
        state = activate(state, e.action).state;
        if (JSON.stringify(snapshot(state)) !== JSON.stringify(e.after)) throw Error();
      }
      if (JSON.stringify(snapshot(state)) !== JSON.stringify(raw.final)) throw Error();
      return raw;
    }
  } catch {}
  return { ...begin(s), coverage: 'partial' };
}

function exported(r) {
  return {
    ...r,
    game: 'طريق السَّراة: ملحمة الشَّنْفَرَى — رن الصعاليك الكامل',
    cardDefinitions: cards,
    alternateDefinitions: alternates,
    rewardDefinitions: rewards,
    metrics: {
      turns: r.events.filter(e => e.summary.kind === 'turn').length,
      clearedLines: r.events.filter(e => e.summary.cleared?.length).length,
      enemyDamage: r.events.reduce((n, e) => n + (e.summary.enemyDamage || 0), 0),
      selfDamage: r.events.reduce((n, e) => n + (e.summary.selfDamage || 0), 0)
    }
  };
}

function textReport(r) {
  const x = exported(r);
  return 'تقرير رن ملحمة الشنفرى — طريق السَّراة\n' + JSON.stringify(x, null, 2);
}


// --- audio.mjs ---
// Procedural Web Audio Engine for Al-Shanfara: Nexus Matrix
// 100% offline, zero external sound assets, procedural synthesis.

let ctx = null;
let muted = false;

try {
  muted = localStorage.getItem('shanfara-audio-muted') === 'true';
} catch {}

function getContext() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) ctx = new AudioCtx();
  }
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

function isMuted() {
  return muted;
}

function toggleMute() {
  muted = !muted;
  try {
    localStorage.setItem('shanfara-audio-muted', muted ? 'true' : 'false');
  } catch {}
  return muted;
}

// Generate brief white noise buffer for tactile sand/grit/rumble synthesis
function createNoiseBuffer(c, duration = 0.5) {
  const bufferSize = Math.floor(c.sampleRate * duration);
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function playSfx(type) {
  if (muted) return;
  const c = getContext();
  if (!c) return;

  const now = c.currentTime;

  try {
    switch (type) {
      case 'select': {
        // Crisp stone bead click (card/cell selection)
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.035);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(now);
        osc.stop(now + 0.035);
        break;
      }

      case 'move':
      case 'step': {
        // Soft desert footstep: filtered noise burst on gravel/sand
        const noise = c.createBufferSource();
        noise.buffer = createNoiseBuffer(c, 0.12);
        const filter = c.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(550, now);
        filter.Q.setValueAtTime(1.8, now);
        const gain = c.createGain();
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(c.destination);
        noise.start(now);
        noise.stop(now + 0.1);
        break;
      }

      case 'bow':
      case 'hit': {
        // Arrow string release twang + impact thrum
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(620, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.18);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(now);
        osc.stop(now + 0.18);
        break;
      }

      case 'knife':
      case 'blade': {
        // Steel edge glint (high resonant metallic ping)
        const osc1 = c.createOscillator();
        const osc2 = c.createOscillator();
        const gain = c.createGain();
        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(1180, now);
        osc2.frequency.setValueAtTime(2360, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(c.destination);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.22);
        osc2.stop(now + 0.22);
        break;
      }

      case 'guard':
      case 'block': {
        // Deep shield block / rock deflect thud
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.16);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(now);
        osc.stop(now + 0.16);
        break;
      }

      case 'friend':
      case 'chain': {
        // Iron chain link breaking: high ringing chime with harmonic spread
        const freqs = [880, 1320, 1760];
        freqs.forEach((f, idx) => {
          const osc = c.createOscillator();
          const gain = c.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + idx * 0.02);
          gain.gain.setValueAtTime(0.12, now + idx * 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.02 + 0.35);
          osc.connect(gain);
          gain.connect(c.destination);
          osc.start(now + idx * 0.02);
          osc.stop(now + idx * 0.02 + 0.35);
        });
        break;
      }

      case 'collapse': {
        // Canyon cliff rockfall: low brown rumble with filter sweep
        const noise = c.createBufferSource();
        noise.buffer = createNoiseBuffer(c, 0.6);
        const filter = c.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(180, now);
        filter.frequency.linearRampToValueAtTime(50, now + 0.5);
        const gain = c.createGain();
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(c.destination);
        noise.start(now);
        noise.stop(now + 0.55);
        break;
      }

      case 'victory': {
        // Arabian desert modal arpeggio (Bayati / Rast cadence: D - F - G - A - D')
        const notes = [293.66, 349.23, 392.00, 440.00, 587.33];
        notes.forEach((freq, idx) => {
          const osc = c.createOscillator();
          const gain = c.createGain();
          osc.type = 'triangle';
          const t = now + idx * 0.12;
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.18, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
          osc.connect(gain);
          gain.connect(c.destination);
          osc.start(t);
          osc.stop(t + 0.45);
        });
        break;
      }

      case 'defeat': {
        // Mournful low descending interval
        const notes = [220.00, 196.00, 164.81, 146.83];
        notes.forEach((freq, idx) => {
          const osc = c.createOscillator();
          const gain = c.createGain();
          osc.type = 'sine';
          const t = now + idx * 0.18;
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.2, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
          osc.connect(gain);
          gain.connect(c.destination);
          osc.start(t);
          osc.stop(t + 0.5);
        });
        break;
      }
    }
  } catch {}
}


// --- view.mjs ---





const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = n => new Intl.NumberFormat('ar-SA', { useGrouping: false }).format(n);
const ratio = (a, b) => `<bdi dir="ltr" class="num">${num(a)} / ${num(b)}</bdi>`;
const button = (label, action, cls = '', disabled = false, aria = '') =>
  `<button data-action="${action}" class="${cls}" ${disabled ? 'disabled' : ''} ${aria ? `aria-label="${esc(aria)}"` : ''}>${label}</button>`;

function preview(s, p, axis = p.axis) {
  if (!p.card || p.cell === null || !axis || p.face === null) return null;
  const result = activate(s, { card: p.card, cell: p.cell, axis, face: p.face ?? 0 });
  return result.valid ? result : null;
}

function bestAxis(s, card, cell, face = 0) {
  if (!card || cell === null) return 'row';
  const rowRes = activate(s, { card, cell, axis: 'row', face: face ?? 0 });
  const colRes = activate(s, { card, cell, axis: 'col', face: face ?? 0 });
  if (!rowRes.valid) return 'col';
  if (!colRes.valid) return 'row';

  const rClr = (rowRes.summary.cleared || []).length === 3;
  const cClr = (colRes.summary.cleared || []).length === 3;
  if (rClr && !cClr) return 'row';
  if (cClr && !rClr) return 'col';

  if (rowRes.state.hp > colRes.state.hp) return 'row';
  if (colRes.state.hp > rowRes.state.hp) return 'col';

  const sc = r => (r.summary.hits || 0) * 3 + (r.summary.moves || 0) * 2 + (r.summary.block || 0) * 1.5;
  return sc(colRes) > sc(rowRes) ? 'col' : 'row';
}

const stsStat = (ico, val, extra = '', cls = '') =>
  `<span class="sts-stat ${cls}">${icon(ico)}<b>${val}</b>${extra ? `<small>${extra}</small>` : ''}</span>`;

function cardEffects(uid, s, face) {
  const c = def(uid, s, face);
  const bits = [];
  for (const f of c.effects) {
    if (f.op === 'move') bits.push(stsStat('foot', num(f.n), '', 'stat-move'));
    if (f.op === 'momentum') bits.push(stsStat('fire', num(f.n), '', 'stat-momentum'));
    if (f.op === 'hit') bits.push(stsStat('knife', num(f.n), '', 'stat-attack'));
    if (f.op === 'sniper') {
      const bonus = s ? Math.floor(s.momentum / 2) : 0;
      if (bonus > 0) {
        bits.push(stsStat('bow', num(f.n + bonus), `+${num(bonus)}🔥`, 'stat-attack bow-boosted'));
      } else {
        bits.push(stsStat('bow', num(f.n), '+🔥', 'stat-attack'));
      }
    }
    if (f.op === 'cyclone_shot') {
      const bonus = s ? s.momentum : 0;
      if (bonus > 0) {
        bits.push(stsStat('bow', num(f.n + bonus), `+${num(bonus)}🔥🔥`, 'stat-attack bow-boosted'));
      } else {
        bits.push(stsStat('bow', num(f.n), '+🔥🔥', 'stat-attack'));
      }
    }
    if (f.op === 'hurt') bits.push(stsStat('heart', num(f.n), '', 'stat-danger'));
    if (f.op === 'block') bits.push(stsStat('shield', num(f.n), '', 'stat-guard'));
    if (f.op === 'prime') bits.push(stsStat('spark', '+' + num(f.n), '', 'stat-setup'));
    if (f.op === 'bleed') bits.push(stsStat('bleed', num(f.n), '', 'stat-bleed'));
    if (f.op === 'poison') bits.push(stsStat('poison', num(f.n), '', 'stat-poison'));
    if (f.op === 'double_bleed') bits.push(stsStat('bleed', '×٢', '', 'stat-bleed'));
    if (f.op === 'explode_bleed') bits.push(stsStat('bleed', '💥×٢', '', 'stat-attack'));
    if (f.op === 'wolf_pounce') {
      const bonus = (s && (s.bleed > 0 || s.poison > 0)) ? 2 : 0;
      if (bonus > 0) {
        bits.push(stsStat('wolf', num(f.n + bonus), '🩸نشط', 'stat-beast wolf-empowered'));
      } else {
        bits.push(stsStat('wolf', num(f.n), '+🩸', 'stat-beast'));
      }
    }
    if (f.op === 'ward') bits.push(stsStat('cover', 'ساتر', '', 'stat-guard'));
    if (f.op === 'vanish') bits.push('<span class="vanish-badge">تُطرح</span>');
  }
  return bits.join('');
}

function comboView(s, m) {
  const hits = m.totals.hits || 0;
  const block = m.totals.block || 0;
  const moves = m.totals.moves || 0;
  const isFull = (m.totals.cleared && m.totals.cleared.length === 3);

  return `
    <section class="combo-panel" aria-label="حصاد خط التدبير">
      <div class="combo-title">
        <span class="combo-flow">المسار: ${m.steps.map((x, i) => `<b>${num(i + 1)}</b> ${esc(x.name)}`).join(' ➔ ')}</span>
        <div class="combo-totals">
          ${hits ? `<span class="stat-badge hit">💥 ${num(hits)} ضرر</span>` : ''}
          ${block ? `<span class="stat-badge block">🛡️ ${num(block)} درع</span>` : ''}
          ${moves ? `<span class="stat-badge move">👟 ${num(moves)} خطوة</span>` : ''}
        </div>
      </div>
      ${m.links.length ? `
        <div class="combo-synergy-pill">
          ⚡ تآزر: ${m.links.map(l => `${esc(l.sources.map(x => (x.name || def(x.uid, s).name)).join('+'))} تمنح ${esc(l.targetName)} +${num(l.boost)} ضرر!`).join(' • ')}
        </div>
      ` : ''}
      ${isFull ? `
        <div class="combo-clear-pill">✨ اكتمال الخط: تفريغ الخانات الثلاث وتوجيه ضربات قاضية!</div>
      ` : ''}
    </section>
  `;
}

// -------------------------------------------------------------
// Top Navigation & Journey Bar (Unified HUD)
// -------------------------------------------------------------
function renderTopBar(s) {
  const enc = ENCOUNTERS[s.encounter - 1] || ENCOUNTERS[0];
  const threat = incoming(s);

  return `
    <header class="top-bar">
      <!-- 1. Encounter Badge -->
      <div class="encounter-badge">
        <span class="enc-dot"></span>
        <strong>المعبر ${num(enc.index)}: ${enc.name}</strong>
      </div>

      <!-- 2. Dawn & Threat Center HUD -->
      <div class="top-center-hud">
        <span class="dawn-tag dawn-dial ${s.turn >= 30 ? 'danger' : ''}">${icon('moon')} <b>${num(36 - s.turn)} دوراً</b></span>
        ${threat > 0 ? `<span class="threat-tag">${icon('swords')} <b>${num(threat)}</b></span>` : ''}
      </div>

      <!-- 3. Top Quick Actions & Relics -->
      <div class="top-actions">
        ${s.relics.map(rKey => {
          const r = RELICS[rKey];
          return `<span class="relic-chip" title="${esc(r?.title || '')}">${icon(r?.icon || 'spark')}</span>`;
        }).join('')}
        ${button('؟', 'help', 'icon-btn help-btn', false, 'دليل اللعب السريع')}
        ${button(isMuted() ? icon('mute') : icon('sound'), 'toggle-audio', 'icon-btn', false, 'الصوت')}
        ${button('⋯', 'menu', 'icon-btn menu-btn', false, 'القائمة')}
      </div>
    </header>
  `;
}

// -------------------------------------------------------------
// Left Side (55%): The Live Cinematic Arena (Pure Scenic Landscape)
// -------------------------------------------------------------
function renderCinematicArena(s, projected, p = {}) {
  return `
    <section class="cinematic-arena">
      <!-- 1. The Living Gorge Field: Enemies Standing Openly in the Terrain -->
      <div class="enemy-squad squad-size-${s.enemies.length}" aria-label="أعداء بني سلامان ونواياهم">
        ${s.enemies.map((e, idx) => {
          const living = s.enemies.filter(x => x.hp > 0);
          const isSolo = living.length === 1;
          const intent = getEnemyIntent(e, idx, s.phaseTurn, isSolo);
          const intentIcon = intent.intent === 'defend' ? 'shield' : intent.intent === 'scheme' ? 'spark' : intent.intent === 'lunge' ? 'swords' : 'knife';
          const isDead = e.hp <= 0;

          // Projected Impact
          const projEnemy = projected?.state?.enemies?.[idx];
          const projHp = projEnemy !== undefined ? projEnemy.hp : e.hp;
          const dmgTaken = Math.max(0, e.hp - projHp);
          const willDie = !isDead && projHp <= 0;

          return `
            <div class="enemy-actor ${isDead ? 'defeated' : ''} ${e.isBoss ? 'boss-actor' : ''} ${dmgTaken > 0 ? 'taking-preview-hit' : ''}">
              <!-- STS Floating Intent Icon -->
              <div class="enemy-intent-crest enemy-intent-badge intent-${intent.intent}" title="${intent.desc}">
                ${!isDead ? (intent.damage > 0 
                  ? `${icon(intentIcon)}<b>${num(intent.damage)}</b>` 
                  : `${icon(intentIcon)}<b>${intent.intent === 'defend' ? 'درع' : 'مكر'}</b>`
                ) : '<span class="dead">صريع</span>'}
              </div>

              <!-- Enemy Plate: Name + HP Bar + Ghost Damage Forecast -->
              <div class="enemy-crest-body">
                <div class="enemy-head">
                  <span class="enemy-name">${e.name}</span>
                  ${dmgTaken > 0 ? `<b class="preview-dmg-tag">-${num(dmgTaken)} 💥</b>` : ''}
                </div>
                <div class="enemy-hp-track">
                  <i class="hp-fill" style="width:${(projHp / e.maxHp) * 100}%"></i>
                  ${dmgTaken > 0 ? `<i class="hp-ghost" style="width:${(e.hp / e.maxHp) * 100}%"></i>` : ''}
                  <span class="hp-num">${willDie ? '<b class="kill-tag">صريع!</b>' : ratio(projHp, e.maxHp)}</span>
                </div>
                ${(s.bleed > 0 || s.poison > 0) && !isDead ? `
                  <div class="status-chips">
                    ${s.bleed > 0 ? `<span class="chip bleed">${icon('bleed')} <b>${num(s.bleed)}</b></span>` : ''}
                    ${s.poison > 0 ? `<span class="chip poison">${icon('poison')} <b>${num(s.poison)}</b></span>` : ''}
                  </div>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- 2. Ambient Outlaw Line: Sleek footer strip for Shanfara with Real-Time Defense Forecast -->
      <div class="hero-vanguard-bar">
        <div class="hero-plate">
          <span class="hero-ico">${icon('bow')}</span>
          <div class="hero-hp-wrap">
            <span class="hero-name">الشَّنْفَرَى</span>
            <div class="hero-hp-bar">
              <i style="width:${((projected ? projected.state.hp : s.hp) / s.maxHp) * 100}%"></i>
              <span>${ratio(projected ? projected.state.hp : s.hp, s.maxHp)}</span>
            </div>
          </div>
          ${projected?.summary?.block ? `<span class="proj-block-tag">${icon('shield')} <b>+${num(projected.summary.block)}</b></span>` : ''}
          ${s.momentum > 0 ? `
            <span class="momentum-tag" title="زخم حركي: يتحول إلى دروع نهاية الدور أو يضاعف رميات القوس">
              ${icon('fire')} <b>${num(s.momentum)}</b> <small class="mom-convert">➔ +${num(s.momentum * (s.relics.includes('sandals') ? 2 : 1))}🛡️</small>
            </span>
          ` : ''}
        </div>

        <div class="center-turn-banner">
          ${p.axis ? `
            <span class="staged-action-banner">
              نفّذ ${p.axis === 'row' ? 'الصف ↔' : 'العمود ↕'} 
              <small>(${projected?.summary?.hits ? `💥 ${num(projected.summary.hits)}` : ''} ${projected?.summary?.block ? `🛡️ ${num(projected.summary.block)}` : ''} ${projected?.summary?.moves ? `👟 ${num(projected.summary.moves)}` : ''})</small>
            </span>
          ` : p.cell !== null ? `
            <span class="guide-step">الخطوة ٣: حدّد الصف (↔) أو العمود (↕) للتنفيذ</span>
          ` : p.card ? `
            <span class="guide-step">الخطوة ٢: المس خانة فارغة (＋) في الصخرة</span>
          ` : `
            <span class="guide-step">الخطوة ١: اختر بطاقة من يدك للبدء</span>
          `}
        </div>

        <div class="haven-mini-tag">
          <small>المأمن</small>
          <b>${num(goal(s) - (projected ? projected.state.progress : s.progress))}</b>
          ${projected?.summary?.moves ? `<small class="haven-gain">+${num(projected.summary.moves)}</small>` : ''}
        </div>
      </div>
    </section>
  `;
}

// -------------------------------------------------------------
// Right Side (45%): 3x3 Basalt Nexus Altar (شبكة التدبير)
// -------------------------------------------------------------
function renderNexusAltar(s, p, projected, model) {
  const prepared = p.axis ? stage(s, { card: p.card, cell: p.cell, axis: p.axis, face: p.face ?? 0 }) : null;
  const staged = prepared?.grid || s.grid.slice();
  if (!prepared && p.cell !== null && p.card) staged[p.cell] = p.card;

  const shown = { ...s, faces: { ...s.faces, ...prepared?.faces, ...(p.card ? { [p.card]: p.face ?? 0 } : {}) } };
  const indices = p.cell !== null && p.axis ? lineIndices(p.cell, p.axis) : [];

  return `
    <section class="nexus-altar">
      <div class="altar-slab">
        <div class="slab-header">
          <div class="crest-wings"></div>
          <h3>شَبَكَةُ التَّدْبِير <small>٣×٣</small></h3>
          <span class="slab-instruction">
            ${!p.card ? 'اختر فعلاً من يدك' : p.cell === null ? 'المس خانة فارغة في الصخرة' : 'حدّد الصف أو العمود للتنفيذ'}
          </span>
        </div>

        <!-- 3x3 Grid Matrix with Molten Gold Channels & Golden Lightning Arcs -->
        <div class="matrix-grid ${p.axis ? `axis-${p.axis}` : ''}">
          ${staged.map((uid, i) => {
            const c = uid ? def(uid, shown) : null;
            const b = c?.build || 'general';
            const isStaged = p.cell === i;
            const inLine = indices.includes(i);
            const isTrail = !uid && trailCells.includes(i);
            const isWard = !uid && s.wards[i];
            const arch = ARCHETYPES[b] || ARCHETYPES.general;

            return `
              <div
                data-cell="${i}"
                role="button"
                tabindex="${!uid && !p.card ? '-1' : '0'}"
                class="matrix-cell ${uid ? `placed-card ${arch.class}` : 'empty-cell'} ${isStaged ? 'staged-cell' : ''} ${inLine ? 'active-line' : ''} ${isTrail ? 'trail-cell' : ''} ${isWard ? 'ward-cell' : ''}"
                aria-label="خانة ${num(i + 1)}${c ? `: ${esc(c.name)}` : '، فارغة'}"
                aria-pressed="${isStaged}"
              >
                ${inLine ? `<span class="order-badge">${num(indices.indexOf(i) + 1)}</span>` : ''}
                ${c ? `
                  <div class="card-miniature">
                    <span class="card-icon">${icon(c.icon)}</span>
                    <strong class="card-title">${c.name}</strong>
                    <div class="card-effects-mini">${cardEffects(uid, shown)}</div>
                  </div>
                ` : isTrail ? `
                  <div class="terrain-marker">${icon('foot')}<span>درب +١</span></div>
                ` : isWard ? `
                  <div class="terrain-marker ward">${icon('cover')}<span>ساتر</span></div>
                ` : `
                  <span class="plus-sign">＋</span>
                `}

                ${isStaged ? `
                  <div class="spatial-axis-controls">
                    <button type="button" data-axis="row" aria-pressed="${p.axis === 'row'}" class="axis-btn ${p.axis === 'row' ? 'selected' : ''}" title="تفعيل الصف">↔ صف</button>
                    <button type="button" data-axis="col" aria-pressed="${p.axis === 'col'}" class="axis-btn ${p.axis === 'col' ? 'selected' : ''}" title="تفعيل العمود">↕ عمود</button>
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>

        <!-- Combo Feedback and Action Preview -->
        <div class="altar-preview">
          ${model ? comboView(s, model) : `
            <div class="idle-prompt">
              ${p.card ? `<strong>${esc(def(p.card, s, p.face ?? 0).name)}</strong> · ${esc(def(p.card, s, p.face ?? 0).text)}` : 'اختر بطاقة، ثم خانة فارغة، وراجع النتيجة قبل التنفيذ.'}
            </div>
          `}
        </div>
      </div>
    </section>
  `;
}

// -------------------------------------------------------------
// Bottom Dock: Hand Fan, Momentum Gauge, End Turn Pommel
// -------------------------------------------------------------
function renderBottomDock(s, p, projected) {
  return `
    <footer class="bottom-dock">
      <!-- Hand Cards Fan: Single Active Face with Quick Flip -->
      <div class="hand-fan-tray" aria-label="أوراق التدبير في يدك">
        ${s.hand.map(uid => {
          const curFace = (p.card === uid && p.face !== undefined) ? p.face : (s.faces?.[uid] ?? 0);
          const c = def(uid, s, curFace);
          const altFace = curFace === 0 ? 1 : 0;
          const altC = def(uid, s, altFace);
          const isSel = p.card === uid;
          const arch = ARCHETYPES[c.build] || ARCHETYPES.general;

          return `
            <div class="fan-card ${arch.class} ${isSel ? 'selected' : ''}" data-card-frame="${uid}">
              <div class="card-header-bar">
                <span class="card-archetype-badge">${arch.tag || arch.name}</span>
                <button type="button" class="flip-face-btn" data-action="flip-card" data-card="${uid}" title="تبديل إلى: ${altC.name}">
                  ${curFace === 0 ? '🔄 طارئ' : '🔄 أصيل'}
                </button>
              </div>
              <button type="button" data-card="${uid}" data-face="${curFace}" aria-pressed="${isSel}" class="card-main-body ${isSel ? 'active' : ''}">
                <div class="face-title">
                  <span class="face-ico">${icon(c.icon)}</span>
                  <strong class="card-title-text">${c.name}</strong>
                  ${curFace === 1 ? '<span class="alt-pill">طارئ</span>' : ''}
                </div>
                <div class="face-effects">${cardEffects(uid, s, curFace)}</div>
              </button>
            </div>
          `;
        }).join('')}
      </div>

      <!-- End Turn / Commit Blade Button with Dynamic Live Metrics -->
      <div class="dock-actions">
        ${button(
          p.axis && projected ? `
            <div class="blade-content">
              ${projected ? `<div class="health-forecast ${projected.state.hp < s.hp ? 'at-risk' : ''}" role="status">${projected.state.hp <= 0 ? 'خطر: هذه الحركة تنهي رحلتك' : projected.state.hp < s.hp ? `ستفقد ${num(s.hp - projected.state.hp)} صحة` : projected.state.hp > s.hp ? `ستستعيد ${num(projected.state.hp - s.hp)} صحة` : 'صحتك آمنة هذا الدور'}</div>` : ''}
              <span class="blade-main-text">نفّذ ${p.axis === 'row' ? 'الصف ↔' : 'العمود ↕'}</span>
              <span class="blade-stats-preview">
                ${projected.summary.hits ? `<b>💥 ${num(projected.summary.hits)}</b>` : ''}
                ${projected.summary.block ? `<b>🛡️ ${num(projected.summary.block)}</b>` : ''}
                ${projected.summary.moves ? `<b>👟 ${num(projected.summary.moves)}</b>` : ''}
              </span>
            </div>
            <i class="blade-gem"></i>
          ` : `<span>${p.cell !== null ? 'حدّد الصف أو العمود' : p.card ? 'المس خانة بالصخرة' : 'اختر فعلاً'}</span><i class="blade-gem"></i>`,
          'activate',
          `end-turn-blade ${p.axis && projected ? 'blade-ready-pulse' : ''}`,
          !projected
        )}
        ${button('إلغاء', 'cancel', 'cancel-btn', !p.card)}
      </div>
    </footer>
  `;
}

// -------------------------------------------------------------
// Main Game View Assembler
// -------------------------------------------------------------
function gameView(s, p, feedback = '') {
  const projected = preview(s, p);
  const model = projected
    ? comboModel(s, { card: p.card, cell: p.cell, axis: p.axis, face: p.face ?? 0 }, projected)
    : null;

  return `
    <div class="shanfara-widescreen-app">
      ${renderTopBar(s)}
      <main class="widescreen-battlefield">
        ${renderCinematicArena(s, projected, p)}
        ${renderNexusAltar(s, p, projected, model)}
      </main>
      ${renderBottomDock(s, p, projected)}
      ${feedback ? `<div class="tactical-toast" role="status">${esc(feedback)}</div>` : ''}
    </div>
  `;
}

// -------------------------------------------------------------
// Roguelike Drafting Screen: 1 of 3 Cards + Ascetic Purge
// -------------------------------------------------------------
function rewardView(s) {
  const choices = s.draftChoices.length ? s.draftChoices : ['sniper_wind', 'flint_blade', 'granite_spire'];

  return `
    <main class="hero reward-screen widescreen-modal">
      <div class="modal-card">
        <p class="gold-subtitle">«وَإِنْ مُدَّتِ الأَيْدِي إِلَى الزَّادِ»</p>
        <h1>غَنِيمَةُ المعْبَر — اختر أسلوبك للمسير</h1>
        <p class="lead-text">انتصرتَ في المواجهة؛ ضمّ بطاقة جديدة من مكائد الصعاليك إلى رزمتك، أو استغنِ وتخفف.</p>

        <div class="draft-grid">
          ${choices.map(k => {
            const c0 = cards[k];
            const c1 = alternates[k];
            const arch = ARCHETYPES[c0?.build] || ARCHETYPES.general;
            return `
              <div class="draft-card ${arch.class}">
                <div class="card-badge">${arch.name}</div>
                <div class="card-hero-icon">${icon(c0?.icon || 'spark')}</div>
                <h3>${c0?.name}</h3>
                <div class="draft-face-desc">
                  <p><b>الوجه الدائم:</b> ${c0?.text}</p>
                  <p><b>الوجه الطارئ:</b> ${c1?.text}</p>
                </div>
                ${button(`اختر «${c0?.name}»`, `draft-${k}`, 'primary draft-pick-btn')}
              </div>
            `;
          }).join('')}
        </div>

        <!-- The Ascetic Purge (الزهد والاستغناء) -->
        <div class="purge-section">
          <div class="purge-box">
            <strong>الزُّهْدُ والاسْتِغْنَاء (Deck Thinning)</strong>
            <p>«وأستفّ ترب الأرض كيلا يُرى له...»؛ ارفض أخذ أي بطاقة، وتخلّص من بطاقة زائدة لتسريع دوران رزمتك القوية.</p>
            ${button('تطهير بطاقة زائدة (الزهد)', 'purge', 'purge-btn')}
          </div>
          ${button('متابعة التدبير دون تغيير', 'skip', 'skip-btn')}
        </div>
      </div>
    </main>
  `;
}

// -------------------------------------------------------------
// Relic Selection Screen: Pick 1 of 4 Rule-Breaking Relics
// -------------------------------------------------------------
function relicView(s) {
  return `
    <main class="hero relic-screen widescreen-modal">
      <div class="modal-card">
        <p class="gold-subtitle">«آثَارُ شِعَابِ السَّرَاةِ الكُبْرَى»</p>
        <h1>اختر أثراً صعلوكياً يكسر قواعد اللعبة</h1>
        <p class="lead-text">بلغتَ مورد الماء الصافي؛ اختر ميثاقاً من مواثيق الصعاليك يغيّر قوانين حسابك ومعاركك.</p>

        <div class="relics-grid">
          ${Object.values(RELICS).map(r => `
            <div class="relic-card ${s.relics.includes(r.id) ? 'already-owned' : ''}">
              <div class="relic-icon-wrapper">${icon(r.icon)}</div>
              <h3>${r.title}</h3>
              <p>${r.desc}</p>
              ${button(s.relics.includes(r.id) ? 'تمتلك هذا الأثر' : 'اختر هذا الأثر', `relic-${r.id}`, 'primary', s.relics.includes(r.id))}
            </div>
          `).join('')}
        </div>
      </div>
    </main>
  `;
}

// -------------------------------------------------------------
// Interlude Screen (Between Encounters)
// -------------------------------------------------------------
function interludeView(s) {
  const enc = ENCOUNTERS[s.encounter - 1] || ENCOUNTERS[0];
  const nextEnc = ENCOUNTERS[s.encounter] || null;

  return `
    <main class="hero interlude-screen widescreen-modal">
      <div class="modal-card">
        <p class="gold-subtitle">انْقِضَاءُ المَرْحَلَةِ ${num(s.encounter)}</p>
        <h1>نصرٌ مؤزر في ${enc.name}</h1>
        <p class="verse-quote">${enc.verse}</p>

        <div class="run-stats-chips">
          <span>${icon('heart')} ${num(s.hp)} صحة</span>
          <span>${icon('fire')} رصيد الرزمة: ${num(s.deck.length)} بطاقة</span>
          <span>${icon('moon')} بقي للفجر ${num(36 - s.turn)} دوراً</span>
        </div>

        ${nextEnc ? `
          <div class="next-preview-box">
            <h3>المحطة القادمة: ${nextEnc.name}</h3>
            <p>${nextEnc.desc}</p>
          </div>
        ` : ''}

        <div class="interlude-actions">
          ${button('اقتحم المعبر التالي', 'continue', 'primary continue-btn')}
          ${button('سجلّ الرحلة والمواجهات', 'report', 'secondary')}
        </div>
      </div>
    </main>
  `;
}

// -------------------------------------------------------------
// End Run Screens (Epic Victory & Dignified Fall)
// -------------------------------------------------------------
function endView(s) {
  const isVictory = s.outcome === 'victory' || s.outcome === 'full';
  return `
    <main class="hero end-screen widescreen-modal">
      <div class="modal-card">
        <p class="gold-subtitle">${isVictory ? '«تَمَّ النَّذْرُ وَوَفَى الصَّاحِب»' : '«ثَوَى البَاسِلُ مُقْبِلاً»'}</p>
        <h1>${isVictory ? 'إتمام ملحمة الشَّنْفَرَى والظَّفَر' : s.outcome === 'caught' ? 'انْصِدَاعُ الفَجْرِ وَالحِصَار' : 'سُقُوطٌ شَرِيفٌ فِي السَّرَاة'}</h1>
        
        <p class="lead-text">
          ${isVictory
            ? '«أَقِيمُوا بَنِي أُمِّي صُدُورَ مَطِيِّكُمْ • فَإِنِّي إِلى قَوْمٍ سِوَاكُمْ لَأَمْيَلُ • هُمُ الرَّهْطُ لا مُسْتَوْدَعُ السِّرِّ ذَائِعٌ لَدَيْهِمْ، وَلا الجَانِي بِمَا جَرَّ يُخْذَلُ».. أتممتَ نذر المئة قتيل وكسرتَ طوق بني سلامان!'
            : '«لا تَدْفِنُونِي! إِنَّ دَفْنِيَ مُحَرَّمٌ عَلَيْكُمْ، وَلَكِنْ أَبْشِرِي أُمَّ عَامِرِ! • إِذَا احْتَمَلُوا رَأْسِي وَفِي الرَّأْسِ أَكْثَرِي • وَغُودِرَ عِنْدَ المُلْتَقَى ثَمَّ سَائِرِي».. سقطتَ مقبلاً غير مدبر.'}
        </p>

        <div class="run-stats-chips">
          <span>${icon('heart')} ${num(s.hp)} صحة باقية</span>
          <span>${icon('moon')} ${num(s.turn)} أدوار مستغرقة</span>
          <span>${icon('sandals')} ${num(s.relics.length)} آثار مكتسبة</span>
        </div>

        <div class="end-actions">
          ${button('ابدأ رناً جديداً بتوزيع مختلف', 'new-seed', 'primary')}
          ${button('أعد نفس الرن', 'restart', 'secondary')}
          ${button('سجلّ التقرير الكامل', 'report', 'secondary')}
        </div>
      </div>
    </main>
  `;
}

// -------------------------------------------------------------
// Title Screen
// -------------------------------------------------------------
function titleView() {
  return `
    <main class="hero title-screen widescreen-modal">
      <div class="modal-card title-card">
        <p class="gold-subtitle">رن الصعاليك الكامل · المسرح المزدوج</p>
        <h1>طَرِيقُ السَّرَاة <small>· مَلْحَمَةُ الشَّنْفَرَى</small></h1>
        <div class="hero-art-widescreen">
          <div class="hero-silhouette"></div>
        </div>
        <p class="epic-prologue">
          «أَقِيمُوا بَنِي أُمِّي صُدُورَ مَطِيِّكُمْ».. انطلق في ٤ مواجهات شاقة عبر شِعاب السَّراة؛
          ابنِ رزمتك من ٤ مسارات تكتيكية (الزَّخَم والقَوْس، النَّزْف والسُّمُوم، الصَّخْر والجَلَد، ومِيثَاق الضَّوَارِي)،
          واكتسب التحف التي تكسر القواعد لإتمام نذر المئة قتيل قبل انصداع الفجر.
        </p>
        <div class="title-actions">
          ${button('ابدأ ملحمة السَّراة', 'start', 'primary start-btn')}
          ${button('قوانين البناءات والشبكة', 'rules', 'secondary')}
        </div>
      </div>
    </main>
  `;
}


const btn = button;


// --- app.mjs ---






const root = document.querySelector('#app');
const menu = document.querySelector('#menu');
const KEY = 'shanfara-roguelike-v8';
const LAST = 'shanfara-roguelike-last-v8';

let s = fresh();
let report = null;
let activeReport = null;
let selection = { card: null, cell: null, axis: null, face: null };
let feedback = '';
let feedbackTimer = null;
let displayedFeedback = '';

try {
  const save = JSON.parse(localStorage.getItem(KEY));
  if (save?.state?.version === VERSION) {
    assertState(save.state);
    s = save.state;
    report = restore(save.report, s);
  }
} catch {}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify({ state: s, report }));
    if (s.screen === 'end') localStorage.setItem(LAST, JSON.stringify(report));
  } catch {
    feedback = 'تعذر الحفظ على الجهاز؛ يمكنك نسخ تقرير الرن.';
  }
}

function render() {
  if (feedback !== displayedFeedback) {
    clearTimeout(feedbackTimer);
    displayedFeedback = feedback;
    if (feedback) {
      feedbackTimer = setTimeout(() => {
        feedback = '';
        displayedFeedback = '';
        root.querySelector('.tactical-toast')?.remove();
      }, 3500);
    }
  }
  document.body.dataset.screen = s.screen;
  if (s.screen === 'title') {
    root.innerHTML = titleView();
  } else if (s.screen === 'end') {
    root.innerHTML = endView(s);
  } else if (s.screen === 'reward') {
    root.innerHTML = rewardView(s);
  } else if (s.screen === 'relic') {
    root.innerHTML = relicView(s);
  } else if (s.screen === 'interlude') {
    root.innerHTML = interludeView(s);
  } else {
    root.innerHTML = gameView(s, selection, feedback);
  }
}

const focus = q => {
  if (typeof window !== 'undefined' && window.innerWidth >= 900) {
    root.querySelector(q)?.focus({ preventScroll: true });
  }
};

function reset(seed = s.seed) {
  if (menu.open) menu.close();
  s = start(fresh(seed));
  report = begin(s);
  selection = { card: null, cell: null, axis: null, face: null };
  feedback = '';
  persist();
  render();
  focus('[data-card]');
}

function show(title, body) {
  menu.innerHTML = `<div class="dialog-head"><h2>${title}</h2>${btn('×', 'close')}</div>${body}`;
  if (!menu.open) menu.showModal();
  menu.querySelector('button')?.focus();
}

function rules() {
  show(
    'دليل ملحمة السَّراة وقوانين البناءات',
    `
    <ol class="steps">
      <li><strong>المسرح المزدوج:</strong> الساحة على اليسار تعرض المعركة ومواقع الأعداء وتقدمك نحو المأمن؛ وصخرة التدبير على اليمين (٣×٣) تنظم فيها أفعالك وتآزر بطاقاتك.</li>
      <li><strong>مسارات البناء الأربعة:</strong>
        <ul>
          <li><b style="color:#f0b842">الزَّخَم والقَوْس:</b> مراكمة السرعة الحركية وتحويل فائض الزخم لصد (+٢ لكل خطوة) ومضاعفة ضرر رميات القوس.</li>
          <li><b style="color:#e64a38">النَّزْف والسُّمُوم:</b> إدماء الأعداء، وتطبيق السم الذي يتجاوز الدروع، وتفجير النزف بضربات قاضية.</li>
          <li><b style="color:#4aaed9">الصَّخْر والجَلَد:</b> غرس السواتر المتينة، واستفاف الترب لتحويل الجراح لدروع ورد هجومي.</li>
          <li><b style="color:#ba7ae8">مِيثَاق الضَّوَارِي:</b> انقضاض الذئب، وكمائن النمر، واسترداد غنائم الضبعة.</li>
        </ul>
      </li>
      <li><strong>الآثار كاسرة القواعد:</strong> تمنحك مزايا خارقة تغيّر قوانين المعركة (مثل تفجير السواتر، وتطبيق النزف الجماعي عند تفريغ الخط).</li>
      <li><strong>المراحل الأربع:</strong> مَضِيق الصَّفَا ➔ قَلْت المَاءِ (المورد والشفاء) ➔ شِعَاب الغَبَش (الضباب والسموم) ➔ مُعَسْكَر سَلامَان (نزال الزعيم عوف بن صخر).</li>
    </ol>
    `
  );
}

function commit(chosen = selection) {
  const action = { ...chosen };
  const result = activate(s, action);
  if (!result.valid) return;

  report = record(report || begin(s), s, action, result);
  s = result.state;
  selection = { card: null, cell: null, axis: null, face: null };

  if (result.summary.kind === 'reward') {
    feedback = result.summary.choice === 'purge' ? '✨ تطهرت رزمتك من بطاقة زائدة.' : '✨ ظفرتَ ببطاقة جديدة للمسير!';
  } else if (result.summary.kind === 'relic') {
    feedback = '🏆 اكتسبتَ أثراً صعلوكياً جديداً!';
  } else if (result.summary.kind === 'transition') {
    feedback = '⚔️ اقتحمتَ المعبر التالي.';
  } else {
    const hits = result.summary.hits || 0;
    const block = result.summary.block || 0;
    const moves = result.summary.moves || 0;
    const dmg = result.summary.enemyDamage || 0;
    const cleared = result.summary.cleared?.length === 3;
    feedback = `${hits ? `💥 ضربت ${num(hits)} ضرر` : 'لم تضرب'} • ${block ? `🛡️ صدَدت ${num(block)}` : 'بلا درع'} • ${moves ? `👟 تقدّمت ${num(moves)}` : 'ثابت'}${dmg ? ` • 💔 خسرت ${num(dmg)} صحة` : ' • 🛡️ لم تصبك جراح'}${cleared ? ' • ⚡ فرّغت الخط!' : ''}`;
  }

  persist();
  render();

  // Play appropriate audio SFX
  if (result.summary.hits) playSfx('hit');
  else if (result.summary.selfDamage) playSfx('knife');
  else if (result.summary.block) playSfx('block');
  else if (result.summary.moves) playSfx('move');
  else playSfx('select');

  if (s.outcome === 'victory' || s.outcome === 'full') playSfx('victory');
  else if (s.outcome === 'dead' || s.outcome === 'caught') playSfx('defeat');
}

function action(a) {
  if (a === 'close') {
    menu.close();
  } else if (a === 'toggle-audio') {
    toggleMute();
    render();
    playSfx('select');
  } else if (a === 'start') {
    s = start(s);
    report = begin(s);
    if (menu.open) menu.close();
    persist();
    render();
    playSfx('select');
  } else if (a === 'restart') {
    reset();
    playSfx('select');
  } else if (a === 'new-seed') {
    reset(Date.now() >>> 0);
    playSfx('select');
  } else if (a === 'cancel') {
    selection = { card: null, cell: null, axis: null, face: null };
    render();
    playSfx('select');
  } else if (a === 'activate') {
    commit();
  } else if (a === 'continue') {
    commit({ kind: 'continue' });
  } else if (a === 'purge') {
    commit({ kind: 'purge' });
  } else if (a === 'skip') {
    commit({ kind: 'skip' });
  } else if (a.startsWith('draft-')) {
    const cardId = a.replace('draft-', '');
    commit({ kind: 'draft', choice: cardId });
  } else if (a.startsWith('relic-')) {
    const relicId = a.replace('relic-', '');
    commit({ kind: 'relic', choice: relicId });
  } else if (a === 'rules') {
    rules();
  } else if (a === 'help') {
    show(
      'كيف تُلعب ملحمة الشَّنْفَرَى؟ (في ٤ خطوات بسيطة)',
      `
      <div class="quick-guide-dialog">
        <div class="guide-card">
          <div class="guide-num">١</div>
          <div class="guide-body">
            <strong>اختر بطاقة من يدك بالأسفل:</strong>
            <p>لكل بطاقة وجهان: (أصيل 🔄 طارئ). بدّل بينهما بزر 🔄 لاختيار الأثر الأنسب لخطتك.</p>
          </div>
        </div>
        <div class="guide-card">
          <div class="guide-num">٢</div>
          <div class="guide-body">
            <strong>ضعها في خانة فارغة (＋) في الصخرة (٣×٣):</strong>
            <p>البطاقة ستثبت في الصخرة. يمكنك لمس أي بطاقة في الصخرة لقراءة تفاصيلها وقوتها.</p>
          </div>
        </div>
        <div class="guide-card">
          <div class="guide-num">٣</div>
          <div class="guide-body">
            <strong>اختر تفعيل الصف (↔) أو العمود (↕):</strong>
            <p>تفعيل الخط يجمع قوى كل البطاقات الموجودة في ذلك الخط وينفّذها بتسلسل وتآزر هجومي ودفاعي!</p>
          </div>
        </div>
        <div class="guide-card">
          <div class="guide-num">٤</div>
          <div class="guide-body">
            <strong>اضغط زر (نفّذ) بالسيف بالأسفل:</strong>
            <p>قبل الضغط، راقب التوقعات بالأعلى: الضرر الذي سينال العدو، والدروع التي ستصد هجومه القادم!</p>
          </div>
        </div>
        <div class="guide-footer-tip" style="margin-top:6px;">
          💡 <b>سر الصعاليك:</b> عندما يكتمل الخط بـ ٣ بطاقات ينفّذ ضربات قاضية ثم يُفرَّغ لتضع فيه بطاقات جديدة!
        </div>

        <div class="mechanics-breakdown-box" style="margin-top:10px;background:rgba(8,16,20,0.85);border:1px solid #ffd488;border-radius:8px;padding:10px;">
          <h3 style="color:#efbf75;margin:0 0 8px;font-size:0.95rem;">⚡ كيف تستغل الزَّخَم والنَّهْش في معاركك؟</h3>
          <ul style="margin:0;padding-right:18px;font-size:0.8rem;line-height:1.5;color:#e8ded1;">
            <li style="margin-bottom:6px;">
              <b style="color:#f0b842;">🔥 الزَّخَم (Momentum):</b> طاقة سرعة تتراكم.
              <br>• <b>حماية تلقائية:</b> أي زخم يتبقى بنهاية الدور <b>يتحول تلقائياً إلى دروع (+١ درع لكل زخم)</b> تحميك من الأعداء!
              <br>• <b>تقوية القوس:</b> رمية القوس 🏹 تضيف نصف رصيدك من الزخم كضرر إضافي مباشر!
            </li>
            <li style="margin-bottom:6px;">
              <b style="color:#ba7ae8;">🐺 النَّهْش وانقضاض الذئب (Beast Pounce):</b>
              <br>• الذئب يضرب ضرراً أساسياً.
              <br>• <b>التآزر القاتل:</b> إذا ضربت العدو أولاً بـ <b>النَّزْف 🩸</b> أو <b>السُّم 🧪</b>، يشم الذئب الدم ويكسب <b>+٢ ضرر إضافي فوراً!</b>
            </li>
            <li style="margin-bottom:6px;">
              <b style="color:#e64a38;">🩸 النَّزْف (Bleed):</b>
              <br>• يُمكّن الذئب من النهش المضاعف، وتفجيره ببطاقة النصل يضاعف ضرره مرتين 💥!
            </li>
            <li>
              <b style="color:#4aaed9;">🛡️ الصَّخْر والسَّواتر (Rock):</b>
              <br>• تغرس سواتر في خانات الصخرة؛ تفعيلها يمنحك دروعاً صلبة ويصد هجمات العدو.
            </li>
          </ul>
        </div>
      </div>
      `
    );
  } else if (a === 'menu') {
    show(
      'ملحمة الشَّنْفَرَى',
      `
      <div style="display:grid;gap:8px;">
        ${btn('أكمل اللعب', 'close', 'primary')}
        ${btn(isMuted() ? 'تشغيل المؤثرات الصوتية' : 'كتم الصوت', 'toggle-audio')}
        ${btn('دليل القواعد والبناءات', 'rules')}
        ${btn('إعادة نفس الرن', 'restart')}
        ${btn('رن جديد بتوزيع عشوائي', 'new-seed')}
      </div>
      `
    );
  }
}

document.addEventListener('click', e => {
  const b = e.target.closest('button') || e.target.closest('[data-cell]');
  if (!b || b.disabled) return;

  if (b.dataset.action === 'flip-card') {
    const card = b.dataset.card;
    if (!s.faces) s.faces = {};
    const cur = s.faces[card] !== undefined ? s.faces[card] : 0;
    const nextFace = cur === 1 ? 0 : 1;
    s.faces[card] = nextFace;
    if (selection.card === card) {
      selection.face = nextFace;
      if (selection.cell !== null) {
        selection.axis = bestAxis(s, card, selection.cell, nextFace);
      }
    }
    render();
    playSfx('select');
    return;
  }

  if (b.dataset.action) {
    action(b.dataset.action);
    return;
  }

  if (s.screen !== 'play') return;

  // Face toggle or card selection in hand
  if (b.dataset.face !== undefined && b.dataset.card) {
    const face = Number(b.dataset.face);
    const card = b.dataset.card;
    if (selection.cell !== null) {
      const axis = bestAxis(s, card, selection.cell, face);
      selection = { card, face, cell: selection.cell, axis };
    } else {
      selection = { card, face, cell: null, axis: null };
    }
    render();
    playSfx('select');
    return;
  }

  // Card select without specific face
  if (b.dataset.card) {
    const card = b.dataset.card;
    const face = selection.face ?? 0;
    if (selection.cell !== null) {
      const axis = bestAxis(s, card, selection.cell, face);
      selection = { card, face, cell: selection.cell, axis };
    } else {
      selection = { card, face, cell: null, axis: null };
    }
    render();
    playSfx('select');
    return;
  }

  // Grid cell select: inspecting placed cards or placing selected card
  if (b.dataset.cell !== undefined) {
    const i = Number(b.dataset.cell);
    if (s.grid[i]) {
      const c = def(s.grid[i], s);
      show(
        `«${c.name}»`,
        `
        <div class="card-inspect-dialog" style="text-align:right;direction:rtl;">
          <p style="font-size:0.9rem;line-height:1.4;margin:4px 0 8px;">${esc(c.text)}</p>
          <div style="margin:8px 0;display:flex;gap:6px;flex-wrap:wrap;">${cardEffects(s.grid[i], s)}</div>
          <p style="color:#efbf75;font-size:0.8rem;border-top:1px dashed #33444d;padding-top:6px;margin:8px 0 0;">
            💡 هذه البطاقة مستقرة في الصخرة بالخانة ${num(i + 1)}. عند تفعيل صفها أو عمودها، ستنفّذ أثرها مع باقي بطاقات الخط!
          </p>
        </div>
        `
      );
      return;
    }
    if (!selection.card) return;
    const face = selection.face ?? 0;
    const axis = bestAxis(s, selection.card, i, face);
    selection = { card: selection.card, face, cell: i, axis };
    render();
    playSfx('select');
    return;
  }

  // Axis button (row / col toggle)
  if (b.dataset.axis) {
    selection.axis = b.dataset.axis;
    render();
    playSfx('select');
  }
});

document.addEventListener('keydown', e => {
  if (menu.open || s.screen !== 'play') return;
  if (e.target.matches('input, textarea, select, [contenteditable="true"]')) return;
  const cell = e.target.closest('[data-cell]');
  if (cell && e.target === cell && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    cell.click();
    return;
  }
  // Native buttons must retain their own Enter/Space activation.
  if (e.target.closest('button') && (e.key === 'Enter' || e.key === ' ')) return;
  if (e.key === 'Escape') action('cancel');
  if (e.key >= '1' && e.key <= String(s.hand.length) && !e.ctrlKey && !e.metaKey) {
    const cardIdx = Number(e.key) - 1;
    const uid = s.hand[cardIdx];
    if (uid) {
      const face = e.shiftKey ? 1 : (selection.card === uid && selection.face === 0 ? 1 : 0);
      const cell = selection.cell;
      const axis = cell !== null ? bestAxis(s, uid, cell, face) : null;
      selection = { card: uid, face, cell, axis };
      render();
      playSfx('select');
    }
  }
  if ((e.key === 'Enter' || e.key === ' ') && selection.card && selection.cell !== null && selection.axis) {
    e.preventDefault();
    commit();
  }
});

render();
focus(s.screen === 'title' ? '[data-action="start"]' : '[data-card]');


})();