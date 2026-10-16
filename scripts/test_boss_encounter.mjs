import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];
  let filePath = path.join(process.cwd(), urlPath === '/' ? 'dist/index.html' : urlPath.startsWith('/dist') ? urlPath : 'dist' + urlPath);
  if (!fs.existsSync(filePath)) filePath = path.join(process.cwd(), 'dist/index.html');
  const ext = path.extname(filePath);
  res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(0, '127.0.0.1', async () => {
  const port = server.address().port;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  await page.goto(`http://127.0.0.1:${port}`);

  const startBtn = page.locator('[data-action="start"]');
  if (await startBtn.isVisible({ timeout: 2000 }).catch(() => false)) await startBtn.click();
  await page.waitForSelector('.widescreen-battlefield');

  // Jump to Encounter 4 (Boss Awf ibn Sakhr with 3 enemies) via localStorage manipulation
  await page.evaluate(() => {
    const raw = localStorage.getItem('shanfara-roguelike-v8');
    if (raw) {
      const data = JSON.parse(raw);
      data.state.encounter = 4;
      data.state.enemies = [
        { id: 'shield_left', name: 'حَامِلُ التَّرَايِسِ الأَيْسَر', hp: 11, maxHp: 11, attack: 3 },
        { id: 'boss_warlord', name: 'عَوْفُ بْنُ صَخْرٍ (زَعِيمُ سَلامَان)', hp: 44, maxHp: 44, attack: 7, isBoss: true },
        { id: 'shield_right', name: 'حَامِلُ التَّرَايِسِ الأَيْمَن', hp: 11, maxHp: 11, attack: 3 }
      ];
      data.state.enemy = 66;
      data.state.momentum = 3;
      localStorage.setItem('shanfara-roguelike-v8', JSON.stringify(data));
      location.reload();
    }
  });

  await page.waitForSelector('.widescreen-battlefield');
  await page.waitForTimeout(600);

  // Check bounding boxes of enemy squad and hero bar
  const enemySquadBox = await page.locator('.enemy-squad').boundingBox();
  const heroBarBox = await page.locator('.hero-vanguard-bar').boundingBox();

  console.log(`Enemy Squad: y=${enemySquadBox.y}, h=${enemySquadBox.height}, bottom=${enemySquadBox.y + enemySquadBox.height}`);
  console.log(`Hero Vanguard Bar: y=${heroBarBox.y}, h=${heroBarBox.height}`);

  const overlap = (enemySquadBox.y + enemySquadBox.height) > heroBarBox.y;
  console.log(`Overlap detected: ${overlap ? 'YES (BUG!)' : 'NO (CLEAN GAP!)'}`);

  await page.screenshot({ path: 'scratch/boss_encounter_mobile_audit.png' });
  console.log('Saved boss encounter audit screenshot to scratch/boss_encounter_mobile_audit.png');

  await browser.close();
  server.close();
});
