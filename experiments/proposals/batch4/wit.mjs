import * as E from './engine-with-pack.mjs';
const rec=['strike','shelter','advance','strike','shelter','advance','cross','scout','haven','anvil','scorch','disrupt','slam'];
function fx(grid,hand,hp,atk,extra=[]){E.setRecipe([...rec,...extra]);const s=E.start(E.fresh(7));const all=[...s.deck];const take=t=>{const i=all.findIndex(u=>u.startsWith(t+'.'));return all.splice(i,1)[0];};
 s.grid=Array(9).fill(null);s.faces={};for(const [i,t] of Object.entries(grid)){s.grid[i]=take(t);s.faces[s.grid[i]]=0;}
 s.hand=hand.map(take);s.draw=all;s.discard=[];s.gridTurf=Array(9).fill(null);s.gridLevel=Array(9).fill(0);
 s.enemies=[{id:'e',name:'e',hp,maxHp:hp,attack:atk,pattern:[atk],shield:0}];return s;}
const place=(s,cell,axis,card)=>E.activate(s,{card,cell,axis,target:'e'});
const sc=r=>`hits ${r.summary.hits} block ${r.summary.block} lost ${r.summary.enemyDamage} cleared ${r.summary.clearedCells.length} lineDone ${r.summary.lines.length}`;
// W-A
let s=fx({0:'strike',1:'shelter'},['finisher','strike'],5,4,['finisher']);
console.log('W-A enemy hp5: finisher@c2 row:',sc(place(s,2,'row',s.hand[0])),'->',place(s,2,'row',s.hand[0]).state.enemies[0].hp,'hp left');
console.log('W-A strike@c2 row:',sc(place(s,2,'row',s.hand[1])),'->',place(s,2,'row',s.hand[1]).state.enemies[0].hp,'hp left');
// W-B: 3 turn horizon from empty-ish grid, forced first move, then greedy by damage-first search
function best3(s0,first){let s=place(s0,first.cell,first.axis,first.card).state,tot=0,log=[];
 const r0=place(s0,first.cell,first.axis,first.card);tot+=r0.summary.hits;
 for(let i=0;i<2&&s.screen==='play';i++){let bestR=null,bv=-1;for(const a of E.actions(s)){const r=E.activate(s,a);if(r.summary.hits>bv||(r.summary.hits===bv&&r.summary.enemyDamage<bestR.summary.enemyDamage)){bv=r.summary.hits;bestR=r;}}tot+=bestR.summary.hits;s=bestR.state;}
 return tot;}
s=fx({0:'strike'},['finisher','strike','shelter'],20,2,['finisher']);
console.log('\nW-B grid c0=strike, 3-turn damage horizon, enemy hp20');
console.log(' first = finisher @ c1 row:',best3(s,{card:s.hand[0],cell:1,axis:'row'}),' | first = strike @ c1 row:',best3(s,{card:s.hand[1],cell:1,axis:'row'}),' | first = strike @ c3 column:',best3(s,{card:s.hand[1],cell:3,axis:'column'}));
s=fx({},['finisher','strike','shelter'],20,2,['finisher']);
console.log('W-B2 empty grid: finisher@c4:',best3(s,{card:s.hand[0],cell:4,axis:'row'}),' strike@c4:',best3(s,{card:s.hand[1],cell:4,axis:'row'}));
// rampart witness: enemy 6 hits, grid shelter+shelter
s=fx({0:'shelter',1:'strike'},['rampart','shelter'],10,6,['rampart']);
console.log('\nW-R enemy attack 6: rampart@c2 row:',sc(place(s,2,'row',s.hand[0])),'| shelter@c2 row:',sc(place(s,2,'row',s.hand[1])));
// 3-turn health horizon
function lost3(s0,first){let r=place(s0,first.cell,first.axis,first.card),tot=r.summary.enemyDamage,s=r.state;
 for(let i=0;i<2&&s.screen==='play';i++){let bestR=null;for(const a of E.actions(s)){const x=E.activate(s,a);if(!bestR||x.summary.enemyDamage<bestR.summary.enemyDamage||(x.summary.enemyDamage===bestR.summary.enemyDamage&&x.summary.hits>bestR.summary.hits))bestR=x;}tot+=bestR.summary.enemyDamage;s=bestR.state;}
 return tot;}
s=fx({0:'shelter',1:'strike'},['rampart','shelter','advance'],40,6,['rampart']);
console.log('\nW-R2 enemy attack 6 each turn, 3-turn HP lost: rampart@c2:',lost3(s,{card:s.hand[0],cell:2,axis:'row'}),' shelter@c2:',lost3(s,{card:s.hand[1],cell:2,axis:'row'}));
s=fx({},['rampart','shelter','advance'],40,6,['rampart']);
console.log('W-R3 empty grid: rampart@c4:',lost3(s,{card:s.hand[0],cell:4,axis:'row'}),' shelter@c4:',lost3(s,{card:s.hand[1],cell:4,axis:'row'}));
s=fx({0:'strike',1:'shelter'},['assault2','strike','advance'],5,4,['assault2']);
console.log('\nW-S enemy hp5 attack4: assault@c2 row:',sc(place(s,2,'row',s.hand[0])),'| strike@c2 row:',sc(place(s,2,'row',s.hand[1])));
s=fx({0:'strike'},['assault2','advance','shelter'],30,4,['assault2']);
const t3=(s0,f)=>{let r=place(s0,f.cell,f.axis,f.card),h=r.summary.hits,l=r.summary.enemyDamage,s=r.state;for(let i=0;i<2&&s.screen==='play';i++){let b=null;for(const a of E.actions(s)){const x=E.activate(s,a);if(!b||x.summary.hits-x.summary.enemyDamage>b.summary.hits-b.summary.enemyDamage)b=x;}h+=b.summary.hits;l+=b.summary.enemyDamage;s=b.state;}return `hits ${h} lost ${l}`;};
console.log('W-S2 grid c0=strike, 3-turn: assault@c1 row:',t3(s,{card:s.hand[0],cell:1,axis:'row'}),'| advance@c1 row:',t3(s,{card:s.hand[1],cell:1,axis:'row'}));
