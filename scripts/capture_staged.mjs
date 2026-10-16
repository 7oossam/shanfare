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

  // Select first card
  await page.locator('.card-main-body').first().click();
  // Place on cell 1
  await page.locator('[data-cell="1"]').click();
  // Stage Row
  await page.locator('[data-axis="row"]').click();
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'scratch/staged_preview_mobile.png' });
  console.log('Saved staged preview screenshot to scratch/staged_preview_mobile.png');

  // Also test clicking Help button to test Help dialog
  await page.locator('[data-action="help"]').click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'scratch/help_modal_mobile.png' });
  console.log('Saved help modal screenshot to scratch/help_modal_mobile.png');

  await browser.close();
  server.close();
});
