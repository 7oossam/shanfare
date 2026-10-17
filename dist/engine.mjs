export const VERSION = 'shanfara-roguelike-v8';

export const ARCHETYPES = {
  momentum: { id: 'momentum', name: 'الزَّخَم والقَوْس', tag: 'زَخَم', color: '#f0b842', class: 'card-gold', icon: 'fire' },
  bleed: { id: 'bleed', name: 'النَّزْف والسُّمُوم', tag: 'نَزْف', color: '#e64a38', class: 'card-crimson', icon: 'bleed' },
  rock: { id: 'rock', name: 'الصَّخْر والجَلَد', tag: 'صَخْر', color: '#4aaed9', class: 'card-cyan', icon: 'stone' },
  beast: { id: 'beast', name: 'الضَّوَارِي والرَّهْط', tag: 'رَهْط', color: '#ba7ae8', class: 'card-amethyst', icon: 'wolf' },
  general: { id: 'general', name: 'خِصَال الصَّعَالِيك', tag: 'صَعَالِيك', color: '#b2d5b2', class: 'card-emerald', icon: 'spark' }
};

export const cards = {
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

export const alternates = {
  run: { name: 'وَثْبَةُ العَدَّاء', build: 'momentum', icon: 'run', short: 'زخم ٣ · تُطرح', text: '«أعدى من الشنفرى»؛ تثب ثلاث خطى سريعة وتطرح البطاقة.', effects: [{ op: 'momentum', n: 3 }, { op: 'move', n: 3 }, { op: 'vanish', n: 1 }] },
  run_swift: { name: 'وَثْبَةُ النَّجَاة', build: 'momentum', icon: 'run', short: 'زخم ٣ · تُطرح', text: 'انطلاقة حاسمة تسابق الريح لكسر الحصار وتطرح بعدها.', effects: [{ op: 'momentum', n: 3 }, { op: 'move', n: 3 }, { op: 'vanish', n: 1 }] },
  arrow: { name: 'مَنْأَى الكَرِيم', build: 'momentum', icon: 'foot', short: 'انسحب ٢ · تُطرح', text: '«وفي الأرض منأى للكريم»؛ انسحاب سريع بخطوتين وتطرح الرماية.', effects: [{ op: 'momentum', n: 2 }, { op: 'move', n: 2 }, { op: 'vanish', n: 1 }] },
  arrow_scout: { name: 'سَهْمٌ خَاطِف', build: 'momentum', icon: 'bow', short: 'أصب ٣ خاطف · تُطرح', text: 'رمية سريعة مفاجئة تصيب بـ ٣ أضرار وتفرغ الخانة فوراً.', effects: [{ op: 'hit', n: 3 }, { op: 'vanish', n: 1 }] },
  knife: { name: 'خَطْفَةٌ دَامِيَة', build: 'bleed', icon: 'knife', short: 'أصب ٢ · نزف ٢ · تُطرح', text: 'طعنة مباغتة تجرح العدو بـ ٢ ضرر وتطبق ٢ نزف ثم تطرح.', effects: [{ op: 'hit', n: 2 }, { op: 'bleed', n: 2 }, { op: 'vanish', n: 1 }] },
  knife_outlaw: { name: 'تَسَلُّقُ الوَعْر', build: 'bleed', icon: 'run', short: 'زخم ٢ · جرح ١', text: 'وطء شوك السَّراة؛ تكسب خطوتي زخم وتخسر صحة بدل النزال.', effects: [{ op: 'hurt', n: 1 }, { op: 'momentum', n: 2 }, { op: 'move', n: 2 }] },
  cover: { name: 'سَاتِرٌ عَاجِل', build: 'rock', icon: 'cover', short: 'ساتر ١ لاحقاً · تُطرح', text: 'تغرس متراساً صخرياً يدوم في الخانة للتفعيلات القادمة.', effects: [{ op: 'ward', n: 1 }, { op: 'vanish', n: 1 }] },
  cover_granite: { name: 'حَذَرُ السَّارِي', build: 'rock', icon: 'cover', short: 'زخم ١ · صدّ ١', text: 'تخطو كذئب وجل؛ زخم خطوة وصد ضرر واحد.', effects: [{ op: 'momentum', n: 1 }, { op: 'move', n: 1 }, { op: 'block', n: 1 }] },
  trick: { name: 'انْسِلالُ الغَبَش', build: 'general', icon: 'sneak', short: 'زخم ١ · صدّ ٢ · تُطرح', text: 'تنسل في غبش الفجر بين الصخور وتتوارى عن الأنظار.', effects: [{ op: 'momentum', n: 1 }, { op: 'move', n: 1 }, { op: 'block', n: 2 }, { op: 'vanish', n: 1 }] },
  wolf: { name: 'انْقِضَاضُ السِّيد', build: 'beast', icon: 'wolf', short: '٤ ضرر · ٦ مع نزيف/سم · تُطرح', text: 'وثبة الذئب الكاسر؛ ٤ أضرار، أو ٦ أضرار إن كان العدو ينزف أو مسموماً.', effects: [{ op: 'wolf_pounce', n: 4 }, { op: 'vanish', n: 1 }] },

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

export const DRAFT_POOL = [
  'sniper_wind', 'gale_surge', 'push_bow',
  'flint_blade', 'desert_venom', 'rend_flesh',
  'eat_dirt', 'granite_spire', 'rock_avalanche',
  'leopard_ambush', 'hyena_patience', 'pack_frenzy'
];

export const RELICS = {
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

export const ENCOUNTERS = [
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

export const rewards = {
  keep: { label: 'ثباتٌ على التدبير الحالي' },
  ambush: { label: 'كَمِينُ الشِّعْب' },
  erase: { label: 'عَفَاءُ الأَثَر' },
  shelter: { label: 'مَلاذُ الجَلْمَد' }
};

export const trailCells = [0, 4, 8];
export const type = uid => uid?.split('.')[0];
export const cardType = (uid, s) => s?.upgrades?.[uid] || type(uid);

export function def(uid, s, face = s?.faces?.[uid] ?? 0) {
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

export function lineIndices(cell, axis) {
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

export function draw(s) {
  while (s.hand.length < 4) {
    if (!s.draw.length) {
      if (!s.discard.length) break;
      s.draw = shuffle(s, s.discard.splice(0));
    }
    s.hand.push(s.draw.shift());
  }
}

export function goal(s) {
  return ENCOUNTERS[s.encounter - 1]?.goal ?? 10;
}

export function collapseRow(s) {
  return s.encounter === 2 ? [2, 1, 0][(s.phaseTurn - 1) % 3] : null;
}

export function getEnemyIntent(enemy, index, phaseTurn, isSolo) {
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

export function incoming(s) {
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

export function setupEncounter(s, encIdx) {
  if (s.learning && !s.advancedUnlocked && encIdx >= 2) {
    const unlocked = ['knife.0', 'knife.1', 'trick.0', 'wolf.0'];
    s.deck.push(...unlocked);
    s.discard.push(...unlocked);
    s.advancedUnlocked = true;
  }
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

export function fresh(seed = 20261016, guided = true) {
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
    deck: guided ? ['run.0', 'run.1', 'arrow.0', 'arrow.1', 'cover.0', 'cover.1', 'arrow.2', 'arrow.3', 'cover.2', 'cover.3'] : [...STARTER_DECK],
    learning: guided,
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

export function stage(s, a) {
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

export function rollDraftChoices(s) {
  const pool = [...DRAFT_POOL];
  shuffle(s, pool);
  return pool.slice(0, 3);
}

export function valid(s, a) {
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
  return s.screen === 'play' && s.hand.includes(a.card) && Number.isInteger(a.cell) && a.cell >= 0 && a.cell < 9 && !s.grid[a.cell] && ['row', 'col'].includes(a.axis) && (a.face === undefined || a.face === 0 || a.face === 1) && (a.target == null || attackTargets(s).some(e => e.id === a.target));
}

// Actor positions are a visual layer over the nine action slots.
export const enemyCell = index => [0, 2, 1][index] ?? 1;

export function attackTargets(s) {
  const living = (s.enemies || []).filter(e => e.hp > 0);
  const shields = living.filter(e => e.id.startsWith('shield'));
  return shields.length ? shields : living;
}

export function targetForAction(s, a = {}) {
  const pool = attackTargets(s);
  if (a.target && pool.some(e => e.id === a.target)) return a.target;
  return pool[0]?.id ?? null;
}

export function actions(s) {
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
  if (s.pendingTarget) targetPool.sort((a, b) => Number(b.id === s.pendingTarget) - Number(a.id === s.pendingTarget));

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

export function activate(state, a) {
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
  s.pendingTarget = a.target ?? null;
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

  delete s.pendingTarget;
  assertState(s);
  return { state: s, valid: true, summary: s.last };
}

export function start(s) {
  return s.screen === 'title' ? { ...structuredClone(s), screen: 'play' } : s;
}

export function assertState(s) {
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

export function snapshot(s) {
  const { last, ...rest } = s;
  return structuredClone(rest);
}
