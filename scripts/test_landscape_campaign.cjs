const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
  const {fresh,start,actions,activate}=await import('../dist/engine.mjs');
  const score=s=>s.screen==='reward'||s.outcome==='victory'?100000:s.screen==='end'?-100000:s.hp*9-s.enemies.reduce((n,e)=>n+e.hp,0)*5+s.enemies.filter(e=>!e.hp).length*10+Math.min(s.momentum,10)*2-s.exhausted.length*7;
  let state=start(fresh());const trace=[];
  for(let i=0;i<180&&state.screen!=='end';i++){
    let action;
    if(state.pendingManeuver)action={kind:'maneuver',skip:true};
    else if(state.screen==='reward')action={kind:'draft',choice:['volley','leech','reserve','knife','strong_cover','wolf'].find(x=>state.draftChoices.includes(x))};
    else {
      let beam=[{s:state,first:null,v:score(state)}];
      for(let depth=0;depth<3;depth++){
        const next=[];
        for(const node of beam){
          if(node.s.screen!=='play'){next.push(node);continue;}
          const legal=node.s.pendingManeuver?[{kind:'maneuver',skip:true}]:actions(node.s);
          for(const a of legal){const r=activate(node.s,a);next.push({s:r.state,first:node.first??a,v:score(r.state)});}
        }
        next.sort((a,b)=>b.v-a.v);const seen=new Set();beam=[];
        for(const node of next){const k=JSON.stringify([node.s.hp,node.s.momentum,node.s.grid,node.s.hand,node.s.draw,node.s.enemies,node.s.phaseTurn,node.s.pendingManeuver]);if(seen.has(k))continue;seen.add(k);beam.push(node);if(beam.length===10)break;}
      }
      action=beam[0]?.first;
    }
    assert.ok(action);const r=activate(state,action);assert.ok(r.valid);state=r.state;trace.push({action,state});
  }
  assert.equal(state.outcome,'victory','Planner must reach an actual final victory');
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
  const page=await browser.newPage({viewport:{width:844,height:390},hasTouch:true,reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const folder='/tmp/landscape-review';fs.mkdirSync(folder,{recursive:true});
  try{
    await page.goto(process.env.GAME_URL||'http://127.0.0.1:8765/');await page.locator('[data-action="start"]').tap();
    for(let i=0;i<trace.length;i++){
      const {action:a,state:expected}=trace[i];
      if(a.kind==='maneuver')await page.locator('[data-action="skip-maneuver"]').tap();
      else if(a.kind==='draft')await page.locator(`[data-action="draft-${a.choice}"]`).tap();
      else {await page.locator(`[data-target="${a.target}"]`).tap();await page.locator(`.card-face[data-card="${a.card}"][data-face="${a.face}"]`).tap();await page.locator(`[data-cell="${a.cell}"]`).tap();}
      await page.waitForFunction(()=>!document.querySelector('.duel-grid.is-resolving'));
      const actual=await page.evaluate(()=>JSON.parse(localStorage.getItem('shanfara-duel-v9')).state);
      assert.deepEqual(actual,expected,`Live state diverged at action ${i+1}`);
      if(expected.screen==='reward'){await page.screenshot({path:`${folder}/reward-${expected.encounter}.png`});console.log(`PASS live encounter ${expected.encounter}: ${expected.hp} health, ${expected.turn} rounds`);}
      if(a.kind==='maneuver')await page.locator('[data-action="skip-maneuver"]').tap();
      else if(a.kind==='draft')await page.screenshot({path:`${folder}/encounter-${expected.encounter}.png`});
    }
    await page.screenshot({path:`${folder}/victory.png`});assert.match(await page.locator('.end-screen h1').textContent(),/انتصار/);
    await page.reload();assert.match(await page.locator('.end-screen h1').textContent(),/انتصار/);
    await page.locator('[data-action="restart"]').tap();assert.equal(await page.locator('.duel-card').count(),3);
    const save=await page.evaluate(()=>JSON.parse(localStorage.getItem('shanfara-duel-v9')).state);assert.equal(save.encounter,1);assert.equal(save.grid.filter(Boolean).length,0);assert.equal(save.hp,24);
    assert.deepEqual(errors,[]);fs.writeFileSync(`${folder}/campaign-report.json`,JSON.stringify({actions:trace.map(x=>x.action),final:state},null,2));
    console.log(`PASS full browser campaign: ${trace.length} placements/rewards, all four encounters, final victory, reload and restart`);
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
