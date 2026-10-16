import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  console.log('Navigating to live GitHub Pages...');
  await page.goto('https://7oossam.github.io/shanfare/?ts=' + Date.now(), { waitUntil: 'networkidle' });

  const startBtn = page.locator('[data-action="start"]');
  if (await startBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
    console.log('Clicking start button...');
    await startBtn.click();
  }

  await page.waitForSelector('.widescreen-battlefield', { timeout: 10000 });
  await page.waitForTimeout(1000);

  const screenshotPath = 'scratch/live_github_pages_mobile.png';
  await page.screenshot({ path: screenshotPath });
  console.log('Saved live screenshot to:', screenshotPath);
  await browser.close();
})();
