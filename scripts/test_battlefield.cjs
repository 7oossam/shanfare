const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
  const { fresh, start, setupEncounter, ENCOUNTERS } = await import('../dist/engine.mjs');
  const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
  const base=process.env.GAME_URL||'http://127.0.0.1:8765/';
  const folder='/tmp/landscape-review';fs.mkdirSync(folder,{recursive:true});
  const errors=[];
  const metrics=page=>page.evaluate(()=>{
    const box=q=>document.querySelector(q).getBoundingClientRect();
    const root=box('.duel-app'), hand=box('.hand-panel'), arena=box('.battle-arena'),panel=box('.command-panel'),grid=box('.duel-grid');
    return { noPageOverflow:document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight, handFullWidth:Math.abs(hand.width-root.width)<8, handBelowBoth:hand.top>=arena.bottom-1&&hand.top>=panel.bottom-1, arenaTwoThirds:arena.width/(arena.width+panel.width)>.66&&arena.width/(arena.width+panel.width)<.7, gridFits:grid.top>=panel.top&&grid.bottom<=panel.bottom, facesFit:[...document.querySelectorAll('.card-face')].every(e=>e.scrollWidth<=e.clientWidth+1&&e.scrollHeight<=e.clientHeight+1), cardsVisible:[...document.querySelectorAll('.duel-card')].every(e=>{const b=e.getBoundingClientRect();return b.top>=0&&b.bottom<=innerHeight+1&&b.left>=0&&b.right<=innerWidth+1;}) };
  });
  try {
    for(const [w,h] of [[667,320],[667,375],[740,360],[844,390],[915,412],[932,430],[1024,768],[1280,720],[1440,900]]){
      const page=await browser.newPage({viewport:{width:w,height:h},hasTouch:true});
      page.on('pageerror',e=>errors.push(e.message));
      page.on('response',r=>{if(r.url().includes('/assets/landscape/')&&r.status()>=400)errors.push(r.status()+': '+r.url());});
      await page.goto(base);await page.locator('[data-action="start"]').click();await page.evaluate(async()=>{await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});
      assert.equal(await page.locator('.duel-grid [data-cell]').count(),4);
      assert.equal(await page.locator('.duel-card').count(),5);
      assert.equal(await page.locator('.card-face').count(),10);
      assert.equal(await page.locator('.icon-foot,.icon-run,[data-action="activate"]').count(),0);
      assert.deepEqual(await metrics(page),{noPageOverflow:true,handFullWidth:true,handBelowBoth:true,arenaTwoThirds:true,gridFits:true,facesFit:true,cardsVisible:true},`${w}×${h}`);
      await page.screenshot({path:`${folder}/initial-${w}x${h}.png`});
      await page.locator('[data-target="scout"]').tap();
      await page.locator('.card-face[data-card="focus.0"][data-face="0"]').tap();
      await page.locator('[data-cell="0"]').tap();
      let save=await page.evaluate(()=>JSON.parse(localStorage.getItem('shanfara-duel-v9')));
      assert.equal(save.state.grid[0],'focus.0');assert.equal(save.state.turn,2);assert.equal(save.state.hp,21);
      await page.reload();assert.equal(await page.locator('[data-cell="0"] strong').innerText(),'عزم');
      await page.locator('[data-target="scout"]').tap();
      await page.locator('.card-face[data-card="arrow.0"][data-face="0"]').tap();
      await page.keyboard.press('Tab');
      await page.locator('[data-cell="1"]').focus();
      await page.locator('.board-feedback strong').filter({hasText:'يكتمل الصف'}).waitFor();
      assert.equal(await page.locator('.grid-cell.in-line').count(),2);
      const forecast=await page.locator('[data-enemy-hp="scout"]').textContent();
      assert.match(forecast,/٤/);
      await page.screenshot({path:`${folder}/preview-${w}x${h}.png`});
      await page.locator('[data-cell="1"]').tap();
      await page.locator('.duel-grid:not(.is-resolving)').waitFor();
      assert.equal(await page.locator('.grid-cell.has-card').count(),0);
      assert.equal(await page.locator('[data-enemy-hp="scout"]').textContent(),forecast);
      save=await page.evaluate(()=>JSON.parse(localStorage.getItem('shanfara-duel-v9')));assert.equal(save.state.last.hits,8);assert.equal(save.state.turn,3);assert.equal(save.state.momentum,0);
      await page.screenshot({path:`${folder}/resolved-${w}x${h}.png`});
      await page.locator('.card-details').first().tap();assert.equal(await page.locator('dialog[open]').count(),1);await page.locator('[data-action="close"]').tap();
      await page.locator('[data-action="help"]').tap();assert.equal(await page.locator('dialog[open]').count(),1);await page.locator('[data-action="close"]').tap();
      console.log(`PASS ${w}×${h}: proportions, readable faces, touch, staged-save, automatic row, forecast, screenshots`);
      await page.close();
    }
    // Advanced cards and a final battle with three independent clickable targets.
    const boss=start(fresh(6));setupEncounter(boss,4);
    for(const uid of ['wolf.0','knife.0','trick.0'])boss.deck.push(uid);
    boss.hand=['wolf.0','knife.0','trick.0','focus.0','arrow.0'];boss.draw=boss.deck.filter(x=>!boss.hand.includes(x));
    const page=await browser.newPage({viewport:{width:844,height:390},hasTouch:true});page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(s=>localStorage.setItem('shanfara-duel-v9',JSON.stringify({state:s,report:null})),boss);await page.goto(base);
    assert.equal(await page.locator('[data-target]').count(),3);assert.equal(await page.locator('[data-target="warlord"]').isDisabled(),true);
    assert.deepEqual(await metrics(page),{noPageOverflow:true,handFullWidth:true,handBelowBoth:true,arenaTwoThirds:true,gridFits:true,facesFit:true,cardsVisible:true},'advanced cards');
    await page.screenshot({path:`folder/boss-844x390.png`.replace('folder',folder)});
    await page.locator('[data-target="shield_l"]').tap();await page.locator('.card-face[data-card="focus.0"][data-face="0"]').tap();await page.locator('[data-cell="0"]').tap();
    await page.locator('.card-face[data-card="arrow.0"][data-face="0"]').tap();await page.locator('[data-cell="2"]').tap();await page.locator('.duel-grid:not(.is-resolving)').waitFor();
    const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('shanfara-duel-v9')));assert.equal(saved.state.last.hits,8);assert.equal(saved.state.exhausted.length,0);assert.equal(saved.state.enemies[2].hp,4);
    await page.locator('[data-target="shield_l"]').tap();
    await page.locator('.card-face[data-card="wolf.0"][data-face="1"]').tap();
    await page.locator('[data-cell="0"]').tap();
    await page.locator('.duel-grid:not(.is-resolving)').waitFor();
    assert.equal(await page.locator('.grid-cell.has-card').count(),0);
    const emergency=await page.evaluate(()=>JSON.parse(localStorage.getItem('shanfara-duel-v9')).state);
    assert.equal(emergency.last.hits,4);assert.equal(emergency.turn,saved.state.turn+1);assert.equal(emergency.exhausted.length,0);
    assert.equal(await page.locator('[data-target="shield_l"] .extra-enemy').isVisible(),false);
    console.log('PASS column, immediate emergency removal, three targets, boss protection and defeated figure removal');
    await page.close();
    // Portrait hint must clear after an actual viewport rotation without losing state.
    const portrait=await browser.newPage({viewport:{width:390,height:844}});await portrait.goto(base);await portrait.locator('.rotate-hint').waitFor({state:'visible'});await portrait.setViewportSize({width:844,height:390});assert.equal(await portrait.locator('.rotate-hint').isVisible(),false);await portrait.locator('[data-action="start"]').click();assert.equal(await portrait.locator('.duel-app').count(),1);await portrait.close();
    assert.deepEqual(errors,[]);console.log('PASS rotation and zero page/asset errors');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
