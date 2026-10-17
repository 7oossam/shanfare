const { chromium } = require('playwright');
const assert = require('node:assert/strict');

(async () => {
  const { fresh, start, setupEncounter } = await import('../dist/engine.mjs');
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
  const base = process.env.GAME_URL || 'http://127.0.0.1:8765/';
  const errors = [];
  try {
    for (const [width, height] of [[320, 568], [360, 640], [390, 780], [430, 932], [844, 390], [1440, 900]]) {
      const page = await browser.newPage({ viewport: { width, height } });
      page.on('pageerror', e => errors.push(e.message));
      await page.goto(base);
      await page.locator('[data-action="start"]').click();
      assert.equal(await page.locator('.combat-grid [data-cell]').count(), 9);
      assert.equal(await page.locator('.combat-grid .fighter-art').count(), 0);
      assert.equal(await page.locator('.enemy-strip [data-target]').count(), 2);
      assert.equal(await page.locator('.cinematic-arena').count(), 0);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      assert.equal(overflow, false, `Horizontal overflow at ${width} × ${height}`);
      await page.locator('[data-target="scout"]').click();
      await page.locator('.card-tabs [data-card="arrow.0"]').click();
      await page.locator('[data-cell="5"]').click();
      await page.locator('[data-axis="col"]').click();
      const geometry = await page.evaluate(() => {
        const stage = document.querySelector('.battle-stage').getBoundingClientRect();
        const grid = document.querySelector('.combat-grid').getBoundingClientRect();
        const hand = document.querySelector('.battle-hand').getBoundingClientRect();
        return { fitsStage: grid.top >= stage.top && grid.bottom <= stage.bottom, aboveHand: grid.bottom <= hand.top, square: Math.abs(grid.width - grid.height) < 1 };
      });
      assert.deepEqual(geometry, { fitsStage: true, aboveHand: true, square: true }, `Board layout at ${width} × ${height}`);
      assert.equal(await page.locator('.axis-choice[aria-pressed="true"]').count(), 1);
      assert.equal(await page.locator('.in-path').count(), 3);
      assert.equal(await page.locator('.expanded-card .card-face-panel').count(), 2);
      await page.locator('.expanded-card [data-face="1"]').click();
      assert.equal(await page.locator('.expanded-card [data-face="1"]').getAttribute('aria-pressed'), 'true');
      assert.equal(await page.locator('[data-cell="5"]').getAttribute('aria-pressed'), 'true');
      await page.locator('.expanded-card [data-face="0"]').click();
      await page.locator('[data-axis="col"]').click();
      const forecast = await page.locator('[data-target="scout"] .fighter-health b').textContent();
      await page.locator('[data-action="activate"]').click();
      assert.equal(await page.locator('[data-target="scout"] .fighter-health b').textContent(), forecast);
      const save = await page.evaluate(() => JSON.parse(localStorage.getItem('shanfara-roguelike-v8')));
      assert.equal(save.report.events.at(-1).action.target, 'scout');
      assert.equal(save.state.turn, 2);
      await page.reload();
      assert.equal(await page.locator('[data-target="scout"] .fighter-health b').textContent(), forecast);
      await page.locator('[data-action="help"]').first().click();
      assert.equal(await page.locator('dialog[open]').count(), 1);
      await page.locator('[data-action="close"]').click();
      console.log(`PASS ${width} × ${height}: paper layout, both faces, targeting, preview, execution, reload, guide`);
      await page.close();
    }

    const bossState = start(fresh(11));
    setupEncounter(bossState, 4);
    const page = await browser.newPage({ viewport: { width: 390, height: 780 } });
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(state => localStorage.setItem('shanfara-roguelike-v8', JSON.stringify({ state, report: null })), bossState);
    await page.goto(base);
    assert.equal(await page.locator('[data-target]').count(), 3);
    assert.equal(await page.locator('[data-target="warlord"]').isDisabled(), true);
    await page.locator('[data-target="shield_l"]').click();
    assert.equal(await page.locator('[data-target="shield_l"]').getAttribute('aria-pressed'), 'true');
    await page.locator('.card-tabs [data-card]').first().click();
    await page.locator('[data-cell="7"]').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('[data-cell="7"]').getAttribute('aria-pressed'), 'true');
    await page.clock.install();
    await page.locator('[data-action="activate"]').click();
    assert.equal(await page.locator('.tactical-toast').count(), 1);
    await page.clock.fastForward(3600);
    assert.equal(await page.locator('.tactical-toast').count(), 0);
    console.log('PASS boss protection, keyboard placement, toast expiry');
    assert.deepEqual(errors, []);
    await page.close();
  } finally {
    await browser.close();
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
