import * as E from '../../../dist/engine.mjs';
const mk=(id,name,hp,pattern)=>({id,name,hp,maxHp:hp,attack:pattern[0],pattern,shield:0});
export const CANDIDATES={
 v6:[
  {name:'اختبار الإيقاع',enemies:[mk('tracker','صائد الأثر',14,[2,4,1])]},
  {name:'كمين الممر',enemies:[mk('archer','رامي المرقب',7,[1,5]),mk('guard','حارس الدرب',16,[2,3])]},
  {name:'اختبار الاستعداد',enemies:[mk('armor','درّاع الحيّ',26,[1,2,9])]},
  {name:'اختبار الاستنزاف',enemies:[mk('elder','شيخ الغزاة',34,[2,3,5])]},
  {name:'الكمين الأخير',enemies:[mk('leader','قائد الكمين',14,[2,3,0,6]),mk('thrower','رامي الحجارة',4,[2]),mk('rear','حارس الظهر',4,[1])]},
 ],
 v5:[
  {name:'اختبار الإيقاع',enemies:[mk('tracker','صائد الأثر',14,[2,4,1])]},
  {name:'كمين الممر',enemies:[mk('archer','رامي المرقب',7,[1,5]),mk('guard','حارس الدرب',16,[2,3])]},
  {name:'اختبار الاستعداد',enemies:[mk('armor','درّاع الحيّ',28,[1,2,10])]},
  {name:'اختبار الاستنزاف',enemies:[mk('elder','شيخ الغزاة',36,[3,3,5])]},
  {name:'الكمين الأخير',enemies:[mk('leader','قائد الكمين',16,[2,3,0,6]),mk('thrower','رامي الحجارة',5,[2]),mk('rear','حارس الظهر',5,[1])]},
 ],
 v4:[
  {name:'اختبار الإيقاع',enemies:[mk('tracker','صائد الأثر',14,[2,4,1])]},
  {name:'كمين الممر',enemies:[mk('archer','رامي المرقب',7,[1,5]),mk('guard','حارس الدرب',16,[2,3])]},
  {name:'اختبار الاستعداد',enemies:[mk('armor','درّاع الحيّ',28,[1,2,9])]},
  {name:'اختبار الاستنزاف',enemies:[mk('elder','شيخ الغزاة',36,[3,3,5])]},
  {name:'الكمين الأخير',enemies:[mk('leader','قائد الكمين',16,[2,3,0,6]),mk('thrower','رامي الحجارة',5,[2]),mk('rear','حارس الظهر',5,[1])]},
 ],
 v3:[
  {name:'اختبار الإيقاع',enemies:[mk('tracker','صائد الأثر',14,[2,4,1])]},
  {name:'كمين الممر',enemies:[mk('archer','رامي المرقب',7,[1,5]),mk('guard','حارس الدرب',16,[2,3])]},
  {name:'اختبار الاستعداد',enemies:[mk('armor','درّاع الحيّ',28,[1,2,9])]},
  {name:'اختبار الاستنزاف',enemies:[mk('elder','شيخ الغزاة',36,[3,3,4])]},
  {name:'الكمين الأخير',enemies:[mk('leader','قائد الكمين',18,[2,3,0,6]),mk('a','تابع',5,[2]),mk('b','تابع',5,[2])]},
 ],
 v3b:[
  {name:'x',enemies:[mk('tracker','صائد الأثر',14,[2,4,1])]},{name:'x',enemies:[mk('tracker','صائد الأثر',14,[2,4,1])]},{name:'x',enemies:[mk('tracker','صائد الأثر',14,[2,4,1])]},{name:'x',enemies:[mk('tracker','صائد الأثر',14,[2,4,1])]},
  {name:'الكمين الأخير (2 أتباع 5 / [1,2])',enemies:[mk('leader','قائد الكمين',18,[2,3,0,6]),mk('a','تابع',5,[1,2]),mk('b','تابع',5,[2,1])]},
 ],
 v3c:[
  {name:'x',enemies:[mk('tracker','صائد الأثر',14,[2,4,1])]},{name:'x',enemies:[mk('tracker','صائد الأثر',14,[2,4,1])]},{name:'x',enemies:[mk('tracker','صائد الأثر',14,[2,4,1])]},{name:'x',enemies:[mk('tracker','صائد الأثر',14,[2,4,1])]},
  {name:'الكمين الأخير (قائد 16 / أتباع 5 [2])',enemies:[mk('leader','قائد الكمين',16,[2,3,0,6]),mk('a','تابع',5,[2]),mk('b','تابع',5,[1])]},
 ],
 v2:[
  {name:'اختبار الإيقاع',enemies:[mk('tracker','صائد الأثر',14,[2,4,1])]},
  {name:'كمين الممر',enemies:[mk('archer','رامي المرقب',7,[1,5]),mk('guard','حارس الدرب',16,[2,3])]},
  {name:'اختبار الاستعداد',enemies:[mk('armor','درّاع الحيّ',28,[1,2,10])]},
  {name:'اختبار الاستنزاف',enemies:[mk('elder','شيخ الغزاة',34,[3,2,5,2,6])]},
  {name:'الكمين الأخير',enemies:[mk('leader','قائد الكمين',16,[2,3,0,5]),mk('a','تابع',4,[1]),mk('b','تابع',4,[1])]},
 ],
 v1:[
  {name:'اختبار الإيقاع',enemies:[mk('tracker','صائد الأثر',14,[2,4,1])]},
  {name:'كمين الممر',enemies:[mk('archer','رامي المرقب',7,[0,5]),mk('guard','حارس الدرب',14,[2,2,3])]},
  {name:'اختبار الاستعداد',enemies:[mk('armor','درّاع الحيّ',24,[1,1,8])]},
  {name:'اختبار الاستنزاف',enemies:[mk('elder','شيخ الغزاة',30,[3,2,4,2,5])]},
  {name:'الكمين الأخير',enemies:[mk('leader','قائد الكمين',18,[2,4,0,6]),mk('a','تابع',6,[2]),mk('b','تابع',6,[2])]},
 ]};
const f={dmg:r=>(r.state.screen!=='play'&&r.state.outcome!=='defeat'?1000:0)+2*r.summary.hits-1.5*r.summary.enemyDamage+0.2*r.summary.clearedCells.length-(r.state.outcome==='defeat'?500:0),
 safe:r=>(r.state.screen!=='play'&&r.state.outcome!=='defeat'?1000:0)+r.summary.hits-4*r.summary.enemyDamage-(r.state.outcome==='defeat'?500:0)};
function search(s,fn,depth,K){const cand=[];for(const a of E.actions(s)){const r=E.activate(s,a);if(r.valid)cand.push({r,v:fn(r)});}
 cand.sort((x,y)=>y.v-x.v);let best=null,bv=-1e18;for(const c of cand.slice(0,K)){let v=c.v;if(depth>1&&c.r.state.screen==='play'){const sub=search(c.r.state,fn,depth-1,K);if(sub)v+=sub[0];}if(v>bv){bv=v;best=c.r;}}return best?[bv,best]:null;}
export function run(name,N=30,depth=2,only=0){
 E.ENCOUNTERS.length=0;E.ENCOUNTERS.push(...structuredClone(CANDIDATES[name]));
 for(let k=1;k<=E.ENCOUNTERS.length;k++){if(only&&k!==only)continue;for(const [pn,fn] of Object.entries(f)){
  let wins=0,turns=0,hpLeft=0,plays={},n=0;
  for(let seed=1;seed<=N;seed++){const s0=E.start(E.fresh(seed));E.setupEncounter(s0,k);s0.screen='play';let s=s0,t=0;
   while(s.screen==='play'&&t<60){const [,best]=search(s,fn,depth,5);const c=best.summary.action.card.split('.')[0];plays[c]=(plays[c]||0)+1;s=best.state;t++;}
   n++;if(s.outcome!=='defeat'&&s.screen!=='play'){wins++;hpLeft+=s.hp;}turns+=t;}
  const share=Object.entries(plays).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([c,v])=>`${c}:${(v/turns*100).toFixed(0)}%`).join(' ');
  console.log(`E${k} ${E.ENCOUNTERS[k-1].name.padEnd(16)} ${pn.padEnd(4)} win ${wins}/${n} turns ${(turns/n).toFixed(1)} hpLeft ${(wins?hpLeft/wins:0).toFixed(1)} | ${share}`);}}}
if(process.argv[2])run(process.argv[2],Number(process.argv[3]||30),Number(process.argv[4]||2),Number(process.argv[5]||0));
