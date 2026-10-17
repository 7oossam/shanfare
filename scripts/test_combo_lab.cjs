const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const E=await import('../dist/engine.mjs');
 const proxy=process.env.HTTPS_PROXY||process.env.HTTP_PROXY;
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox'],...(process.env.GAME_URL&&proxy?{proxy:{server:proxy}}:{})});
 const folder='/tmp/combo-lab-review';fs.mkdirSync(folder,{recursive:true});const errors=[];
 const saved=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('shanfara-duel-v9')).state);
 const idle=p=>p.waitForFunction(()=>!document.querySelector('.is-resolving'));
 const load=async(width,height,state)=>{
  const p=await browser.newPage({viewport:{width,height},hasTouch:true,reducedMotion:'reduce'});
  p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(state=>{localStorage.setItem('shanfara-duel-v9',JSON.stringify({state,report:null}));localStorage.setItem('shanfara-audio-muted','true');},state);
  await p.goto(process.env.GAME_URL||'http://127.0.0.1:8765/');await p.evaluate(()=>document.fonts.ready);return p;
 };
 try{
  for(const [width,height]of [[667,320],[844,390],[1000,240],[1280,720]]){
   const state=E.start(E.fresh(7)),p=await load(width,height,state);
   assert.equal(await p.locator('[data-hand-card]').count(),3);
   assert.equal(await p.locator('[data-face]').count(),0);
   assert.equal(await p.locator('[data-action="confirm-play"]').isDisabled(),true);
   await p.locator(`.card-face[data-card="${state.hand[2]}"]`).first().tap();
   await p.locator('[data-cell="4"]').tap();
   assert.equal(await p.locator('[data-action="confirm-play"]').isDisabled(),true);
   await p.locator('[data-axis="row"]').tap();
   assert.deepEqual(await saved(p),state,'Preview is not a commit');
   const fit=await p.evaluate(()=>{
    const visible=sel=>[...document.querySelectorAll(sel)].every(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&r.top>=0&&r.left>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1;});
    return {scroll:document.documentElement.scrollWidth<=innerWidth,grid:visible('.grid-cell'),hand:visible('.duel-card,.card-rule'),controls:visible('[data-axis],[data-action="confirm-play"]')};
   });assert.deepEqual(fit,{scroll:true,grid:true,hand:true,controls:true},`${width}x${height}`);
   await p.screenshot({path:`${folder}/preview-${width}.png`});
   const expected=E.activate(state,{card:state.hand[2],cell:4,axis:'row',face:0,target:state.enemies[0].id});
   await p.locator('[data-action="confirm-play"]').tap();await idle(p);
   assert.deepEqual(await saved(p),expected.state);
   await p.screenshot({path:`${folder}/resolved-${width}.png`});
   // Prevent our initial-state fixture from overriding the committed save on reload.
   await p.evaluate(()=>sessionStorage.setItem('reloading','true'));
   const committed=await saved(p);await p.addInitScript(state=>localStorage.setItem('shanfara-duel-v9',JSON.stringify({state,report:null})),committed);
   await p.reload();assert.deepEqual(await saved(p),committed);
   await p.locator('[data-info]').first().tap();await p.locator('dialog[open]').waitFor();
   assert.ok(!(await p.locator('dialog').textContent()).includes('طارئ'));
   await p.close();console.log(`PASS ${width}x${height}: direction, preview/confirm, layout, save and details`);
  }
  const p=await load(844,390,E.start(E.fresh(29)));let turns=0,transitions=0,clears=0,row=false,column=false;
  for(let i=0;i<65;i++){
   const state=await saved(p);if(state.screen==='end')break;
   if(state.screen==='reward'){await p.screenshot({path:`${folder}/transition-${state.encounter}.png`});await p.locator('[data-action="continue"]').tap();transitions++;continue;}
   const ranked=E.actions(state).map(a=>{const r=E.activate(state,a);return {a,r,score:r.summary.hits*10+r.summary.prevented*2-r.summary.enemyDamage*3+(r.state.screen==='reward'||r.state.outcome==='victory'?1000:0)};}).sort((x,y)=>y.score-x.score);
   const {a,r}=turns===0 ? (ranked.find(x=>x.a.axis==='column'&&x.score===ranked[0].score)??ranked[0]) : ranked[0];
   await p.locator(`.card-face[data-card="${a.card}"]`).first().tap();await p.locator(`[data-axis="${a.axis}"]`).tap();await p.locator(`[data-cell="${a.cell}"]`).tap();
   assert.deepEqual(await saved(p),state);
   if(r.summary.clearedCells.length){clears++;await p.screenshot({path:`${folder}/complete-line.png`});}
   await p.locator('[data-action="confirm-play"]').tap();await idle(p);assert.deepEqual(await saved(p),r.state);
   turns++;row||=a.axis==='row';column||=a.axis==='column';
  }
  const end=await saved(p);assert.equal(end.outcome,'victory');assert.equal(transitions,2);assert.ok(clears>0);assert.ok(row&&column);
  await p.screenshot({path:`${folder}/victory.png`});await p.locator('[data-action="restart"]').tap();assert.equal((await saved(p)).turn,1);
  await p.close();assert.deepEqual(errors,[]);console.log(`PASS full campaign: ${turns} turns, ${transitions} transitions, ${clears} completed lines, both axes, victory and restart`);
  const old=E.start(E.fresh());old.ruleset=31;old.hand=['arrow.0','cover.0','focus.0'];
  const migration=await load(844,390,old);assert.equal(await migration.locator('.migration-notice').count(),1);
  await migration.locator('[data-action="start"]').tap();const current=await saved(migration);assert.equal(current.ruleset,32);assert.ok(current.deck.every(uid=>E.cards[E.cardType(uid)]));
  const backup=await migration.evaluate(()=>JSON.parse(localStorage.getItem('shanfara-duel-v9-before-v32')));assert.equal(backup.state.ruleset,31);
  await migration.close();console.log('PASS incompatible old save backup and explicit fresh prototype start');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
