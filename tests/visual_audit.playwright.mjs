import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';
import assert from 'assert/strict';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '..', 'dist');
const scratchDir = path.resolve(__dirname, '..', 'scratch');

if (!fs.existsSync(scratchDir)) {
  fs.mkdirSync(scratchDir, { recursive: true });
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

function createServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let reqPath = decodeURI(req.url.split('?')[0]);
      if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
      const filePath = path.join(distDir, reqPath);
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        res.statusCode = 404;
        res.end('Not found');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      fs.createReadStream(filePath).pipe(res);
    });

    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve({ server, port });
    });
  });
}

async function runVisualAudits() {
  console.log('--- Starting Playwright Headless Visual Audits ---');
  const { server, port } = await createServer();
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Local test server running at ${baseUrl}`);

  const browser = await chromium.launch({ headless: true });

  try {
    // -------------------------------------------------------------
    // Test 1: Desktop Audit (1920x1080)
    // -------------------------------------------------------------
    console.log('\n[Audit 1] Desktop Widescreen (1920x1080)...');
    const desktopPage = await browser.newPage({
      viewport: { width: 1920, height: 1080 }
    });
    await desktopPage.goto(baseUrl, { waitUntil: 'networkidle' });

    // If title screen is present, click Start button
    const startBtn = desktopPage.locator('[data-action="start"]');
    if (await startBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('Title screen detected, clicking "ابدأ ملحمة السَّراة"...');
      await startBtn.click();
    }

    // Assert Battlefield and Dual-Theater exist
    await desktopPage.waitForSelector('.widescreen-battlefield', { timeout: 10000 });
    await desktopPage.waitForSelector('.cinematic-arena', { timeout: 5000 });
    await desktopPage.waitForSelector('.nexus-altar', { timeout: 5000 });

    // Assert Enemies and Telegraphed Intent Badges
    const enemies = await desktopPage.$$('.enemy-actor:not(.defeated)');
    console.log(`Desktop active enemies found: ${enemies.length}`);
    assert(enemies.length >= 2, 'Encounter 1 must spawn at least 2 enemies');

    const intentBadges = await desktopPage.$$('.enemy-intent-badge');
    assert(intentBadges.length >= 2, 'Each alive enemy must display an intent badge');
    for (const badge of intentBadges) {
      const text = await badge.innerText();
      console.log(`Enemy Intent Detected: ${text.trim()}`);
      assert(text.trim().length > 0, 'Intent badge text must not be empty');
    }

    // Assert 3x3 Matrix Grid
    const matrixCells = await desktopPage.$$('.matrix-cell');
    assert.equal(matrixCells.length, 9, 'Nexus matrix must have exactly 9 cells');

    // Check Zero-Scroll on Desktop
    const desktopScrollHeight = await desktopPage.evaluate(() => document.documentElement.scrollHeight);
    console.log(`Desktop scrollHeight: ${desktopScrollHeight}px (viewport: 1080px)`);
    assert(desktopScrollHeight <= 1080, `Desktop page must have zero scroll (got ${desktopScrollHeight}px)`);

    const desktopScreenshotPath = path.join(scratchDir, 'desktop_audit.png');
    await desktopPage.screenshot({ path: desktopScreenshotPath, fullPage: false });
    console.log(`✓ Desktop audit passed. Screenshot saved to: ${desktopScreenshotPath}`);
    await desktopPage.close();

    // -------------------------------------------------------------
    // Test 2: Mobile Portrait Audit (390x844 - iPhone 12/13/14)
    // -------------------------------------------------------------
    console.log('\n[Audit 2] Mobile Portrait (390x844) Zero-Scroll & Enemy Visibility...');
    const mobilePage = await browser.newPage({
      viewport: { width: 390, height: 844 },
      isMobile: true
    });
    await mobilePage.goto(baseUrl, { waitUntil: 'networkidle' });

    const mobileStartBtn = mobilePage.locator('[data-action="start"]');
    if (await mobileStartBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('Mobile Title screen detected, clicking "ابدأ ملحمة السَّراة"...');
      await mobileStartBtn.click();
    }

    await mobilePage.waitForSelector('.widescreen-battlefield', { timeout: 10000 });

    // Check bounding boxes of critical components to verify they are all inside viewport [0, 844]
    const enemySquadBox = await mobilePage.locator('.enemy-squad').boundingBox();
    assert(enemySquadBox, '.enemy-squad must be visible');
    console.log(`Mobile Enemy Squad Box: y=${enemySquadBox.y.toFixed(1)}, h=${enemySquadBox.height.toFixed(1)}`);
    assert(enemySquadBox.y >= 0 && (enemySquadBox.y + enemySquadBox.height) < 400,
      'Enemy squad must be prominently displayed in the upper tier without scrolling');

    const matrixBox = await mobilePage.locator('.matrix-grid').boundingBox();
    assert(matrixBox, '.matrix-grid must be visible');
    console.log(`Mobile 3x3 Matrix Box: y=${matrixBox.y.toFixed(1)}, h=${matrixBox.height.toFixed(1)}`);
    assert(matrixBox.y > enemySquadBox.y && (matrixBox.y + matrixBox.height) < 760,
      '3x3 Matrix must be visible in center viewport');

    const bottomDockBox = await mobilePage.locator('.bottom-dock').boundingBox();
    assert(bottomDockBox, '.bottom-dock must be visible');
    console.log(`Mobile Bottom Dock Box: y=${bottomDockBox.y.toFixed(1)}, h=${bottomDockBox.height.toFixed(1)}`);
    assert((bottomDockBox.y + bottomDockBox.height) <= 844,
      `Bottom dock must fit cleanly within 844px viewport (got ${bottomDockBox.y + bottomDockBox.height}px)`);

    // Verify hand tray cards are physically visible
    const handTrayBox = await mobilePage.locator('.hand-fan-tray').boundingBox();
    assert(handTrayBox && handTrayBox.height >= 50, 'Hand tray must be rendered and visible');
    console.log(`Mobile Hand Tray: y=${handTrayBox.y.toFixed(1)}, h=${handTrayBox.height.toFixed(1)}`);
    assert(handTrayBox.y + handTrayBox.height < 844, 'Hand cards must be above viewport bottom edge');

    // Verify commit blade button is physically visible
    const bladeBtnBox = await mobilePage.locator('.end-turn-blade').boundingBox();
    console.log('Mobile Blade Button Box:', bladeBtnBox);
    assert(bladeBtnBox && bladeBtnBox.height >= 20, 'Commit blade button must be rendered and visible');
    console.log(`Mobile Blade Button: y=${bladeBtnBox.y.toFixed(1)}, h=${bladeBtnBox.height.toFixed(1)}`);
    assert(bladeBtnBox.y + bladeBtnBox.height <= 844, 'Commit blade button must be inside viewport');

    // Strict Zero-Scroll Check
    const mobileScrollHeight = await mobilePage.evaluate(() => document.documentElement.scrollHeight);
    console.log(`Mobile scrollHeight: ${mobileScrollHeight}px (viewport: 844px)`);
    assert(mobileScrollHeight <= 845, `Mobile portrait page must have ZERO scroll (got ${mobileScrollHeight}px)`);

    const mobileScreenshotPath = path.join(scratchDir, 'mobile_portrait_audit.png');
    await mobilePage.screenshot({ path: mobileScreenshotPath, fullPage: false });
    console.log(`✓ Mobile portrait audit passed. Screenshot saved to: ${mobileScreenshotPath}`);

    // -------------------------------------------------------------
    // Test 3: Interactive Turn Execution (Card -> Cell -> Axis -> Commit)
    // -------------------------------------------------------------
    console.log('\n[Audit 3] Interactive Turn Simulation on Mobile...');
    
    // 1. Click first card in hand
    const firstCard = mobilePage.locator('.card-main-body').first();
    await firstCard.click();
    console.log('1. Selected first card in hand');

    // 2. Click an empty cell in the 3x3 grid (cell 1 - top middle)
    const emptyCell = mobilePage.locator('[data-cell="1"]');
    await emptyCell.click();
    console.log('2. Placed card in empty cell 1');

    // 3. Choose Row axis
    const rowAxisBtn = mobilePage.locator('[data-axis="row"]');
    await rowAxisBtn.waitFor({ state: 'visible', timeout: 3000 });
    await rowAxisBtn.click();
    console.log('3. Staged Row axis execution');

    // Verify golden lightning / active line connection
    await mobilePage.waitForSelector('.matrix-cell.active-line');
    const activeLines = await mobilePage.$$('.matrix-cell.active-line');
    console.log(`Active line cells with golden energy: ${activeLines.length}`);
    assert(activeLines.length >= 3, 'Active row must highlight all 3 cells with golden aura');

    // 4. Click Commit Blade Button
    const commitBtn = mobilePage.locator('.end-turn-blade:not(:disabled)');
    await commitBtn.waitFor({ state: 'visible', timeout: 3000 });
    await commitBtn.click();
    console.log('4. Clicked End Turn / Commit Blade button');

    // Wait for turn resolution
    await mobilePage.waitForTimeout(500);

    // Assert that turn advanced
    const dawnText = await mobilePage.locator('.dawn-dial b').innerText();
    console.log(`Dawn counter after commit: ${dawnText.trim()}`);
    assert(dawnText.includes('٣٤') || dawnText.includes('34'), 'Turn should have advanced to turn 2 (34 turns remaining to dawn)');

    const afterTurnScreenshotPath = path.join(scratchDir, 'after_turn_audit.png');
    await mobilePage.screenshot({ path: afterTurnScreenshotPath, fullPage: false });
    console.log(`✓ Interactive turn audit passed. Screenshot saved to: ${afterTurnScreenshotPath}`);

    await mobilePage.close();

    console.log('\n=========================================');
    console.log('🎉 ALL PLAYWRIGHT VISUAL AUDITS PASSED! 🎉');
    console.log('=========================================');
  } finally {
    await browser.close();
    server.close();
  }
}

runVisualAudits().catch((err) => {
  console.error('Playwright Visual Audit Failed:', err);
  process.exit(1);
});
