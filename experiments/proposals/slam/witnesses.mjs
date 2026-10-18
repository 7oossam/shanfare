import * as E from './engine-with-slam.mjs';
function fx(grid,hand,hp,atk,pool=[]){const s=E.start(E.fresh());const all=[...s.deck,'slam.0'];const take=t=>all.splice(all.findIndex(u=>u.startsWith(t+'.')),1)[0];
 s.deck=[...s.deck,'slam.0'];s.grid=Array(9).fill(null);s.faces={};for(const [i,t] of Object.entries(grid)){s.grid[i]=take(t);s.faces[s.grid[i]]=0;}
 s.hand=hand.map(take);s.draw=all;s.discard=[];s.gridTurf=Array(9).fill(null);s.gridLevel=Array(9).fill(0);
 s.enemies=[{id:'e',name:'e',hp,maxHp:hp,attack:atk,pattern:[atk],shield:0}];return s;}
function show(title,s){console.log('\n'+title);const rows=[];
 for(const a of E.actions(s)){const r=E.activate(s,a);if(!r.valid)continue;
  rows.push({card:a.card.split('.')[0],cell:a.cell,axis:a.axis,hits:r.summary.hits,block:r.summary.block,lost:r.summary.enemyDamage,killed:r.state.enemies[0].hp===0?'قتل':'',cleared:r.summary.clearedCells.length,nextGrid:r.state.grid.map(u=>u?u.split('.')[0][0]:'.').join('')});}
 rows.sort((x,y)=>(y.killed?1:0)-(x.killed?1:0)||x.lost-y.lost||y.hits-x.hits||x.cleared-y.cleared);
 console.table(rows.slice(0,6));}
show('W1: row0=[c2 shelter,c1 shelter,c0 empty]; hand slam/strike/advance; enemy hp12 attack4',fx({2:'shelter',1:'shelter'},['slam','strike','advance'],12,4));
show('W2: same hand, grid only c2 shelter (block 2 only), enemy hp12 attack4',fx({2:'shelter'},['slam','strike','advance'],12,4));
show('W3: kill check: grid c2 shelter; enemy hp 2 attack 4',fx({2:'shelter'},['slam','strike','advance'],2,4));
const w4=fx({0:'shelter'},['slam'],12,4);
console.log('\nW4: slam only; shelter at c0. Same card, different cell/axis:');
for(const [cell,axis] of [[1,'row'],[3,'column'],[3,'row'],[6,'column']]){const r=E.activate(w4,{card:w4.hand[0],cell,axis,target:'e'});console.log(` cell ${cell} ${axis}: order ${r.summary.cells} hits ${r.summary.hits} block ${r.summary.block} lost ${r.summary.enemyDamage}`);}
show('W5: block-1 source (haven) at c2; enemy hp12 attack4; hand slam/strike',fx({2:'haven'},['slam','strike'],12,4));
