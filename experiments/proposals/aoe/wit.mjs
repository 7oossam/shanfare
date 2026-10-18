import * as E from './engine-with-aoe.mjs';
const BASE=[...E.DECK_RECIPE];
const mk=(id,hp,pattern)=>({id,name:id,hp,maxHp:hp,attack:pattern[0],pattern,shield:0});
function fx(grid,hand,enemies,extra){E.setRecipe([...BASE,...extra]);const s=E.start(E.fresh(7));const all=[...s.deck];const take=t=>{const i=all.findIndex(u=>u.startsWith(t+'.'));return all.splice(i,1)[0];};
 s.grid=Array(9).fill(null);s.faces={};for(const [i,t] of Object.entries(grid)){s.grid[i]=take(t);s.faces[s.grid[i]]=0;}
 s.hand=hand.map(take);s.draw=all;s.discard=[];s.gridTurf=Array(9).fill(null);s.gridLevel=Array(9).fill(0);s.enemies=enemies;return s;}
const place=(s,cell,axis,card,target)=>E.activate(s,{card,cell,axis,target:target??s.enemies.find(e=>e.hp>0).id});
const sc=r=>`hits ${r.summary.hits} block ${r.summary.block} lost ${r.summary.enemyDamage} | enemies hp ${r.state.enemies.map(e=>e.hp).join('/')}`;
let s=fx({},['sweep','strike','shelter'],[mk('a',2,[1,5]),mk('b',2,[2,3])],['sweep']);
console.log('W-A two enemies hp2/hp2 (attacks 1 and 2):');console.log(' sweep@c4:',sc(place(s,4,'row',s.hand[0])));console.log(' strike@c4 -> a:',sc(place(s,4,'row',s.hand[1],'a')));
s=fx({},['sweep','strike','shelter'],[mk('a',3,[2,4]),mk('b',3,[2,3]),mk('c',3,[2,2])],['sweep']);
console.log('\nW-A2 three enemies hp3 each:');console.log(' sweep@c4:',sc(place(s,4,'row',s.hand[0])));console.log(' strike@c4 -> a:',sc(place(s,4,'row',s.hand[1],'a')));
function best3(s0,first){const r0=place(s0,first.cell,first.axis,first.card,first.target);let tot=r0.summary.hits,lost=r0.summary.enemyDamage,s=r0.state;
 for(let i=0;i<2&&s.screen==='play';i++){let b=null;for(const a of E.actions(s)){const x=E.activate(s,a);if(!b||x.summary.hits-x.summary.enemyDamage>b.summary.hits-b.summary.enemyDamage)b=x;}tot+=b.summary.hits;lost+=b.summary.enemyDamage;s=b.state;}return `hits ${tot} lost ${lost}`;}
s=fx({},['sweep','strike','shelter'],[mk('a',24,[2,3])],['sweep']);
console.log('\nW-B single enemy hp24 (3-turn horizon): sweep first:',best3(s,{card:s.hand[0],cell:4,axis:'row'}),'| strike first:',best3(s,{card:s.hand[1],cell:4,axis:'row'}));
s=fx({0:'strike'},['sweep','strike','shelter'],[mk('a',24,[2,3])],['sweep']);
console.log('W-B2 same with strike at c0: sweep@c1:',best3(s,{card:s.hand[0],cell:1,axis:'row'}),'| strike@c1:',best3(s,{card:s.hand[1],cell:1,axis:'row'}));
// boss encounter shape: leader 14 + two followers 4/4
s=fx({},['sweep','strike','advance'],[mk('l',14,[2,3,0,6]),mk('t',4,[2]),mk('r',4,[1])],['sweep']);
console.log('\nW-C boss shape L14/T4/R4: sweep@c4:',sc(place(s,4,'row',s.hand[0])),'| strike -> leader:',sc(place(s,4,'row',s.hand[1],'l')));
console.log('  3-turn horizon: sweep first',best3(s,{card:s.hand[0],cell:4,axis:'row'}),'| strike->leader first',best3(s,{card:s.hand[1],cell:4,axis:'row',target:'l'}));
