import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const imgBase64 = fs.readFileSync('dist/assets/gorge_theater.jpg').toString('base64');
  
  await page.setContent(`<!DOCTYPE html><html><body><img id="src" src="data:image/jpeg;base64,${imgBase64}"><canvas id="c"></canvas></body></html>`);
  
  const cuts = await page.evaluate(async () => {
    const img = document.getElementById('src');
    await new Promise(r => { if (img.complete) r(); else img.onload = r; });
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    
    const c = document.getElementById('c');
    const ctx = c.getContext('2d');
    
    // 1. Gorge Battlefield (~63% of width)
    const gw = Math.round(iw * 0.635);
    c.width = gw;
    c.height = ih;
    ctx.drawImage(img, 0, 0, gw, ih, 0, 0, gw, ih);
    const gorgeData = c.toDataURL('image/jpeg', 0.92);
    
    // 2. Stone Altar Slab (~36.5% of width)
    const sw = iw - gw;
    c.width = sw;
    c.height = ih;
    ctx.clearRect(0, 0, sw, ih);
    ctx.drawImage(img, gw, 0, sw, ih, 0, 0, sw, ih);
    const slabData = c.toDataURL('image/jpeg', 0.92);
    
    return { iw, ih, gw, sw, gorgeData, slabData };
  });
  
  console.log('Image dimensions:', cuts.iw, cuts.ih, 'Gorge:', cuts.gw, 'Slab:', cuts.sw);
  fs.writeFileSync('dist/assets/gorge_battlefield.jpg', Buffer.from(cuts.gorgeData.split(',')[1], 'base64'));
  fs.writeFileSync('dist/assets/nexus_tablet.jpg', Buffer.from(cuts.slabData.split(',')[1], 'base64'));
  console.log('Saved dist/assets/gorge_battlefield.jpg and dist/assets/nexus_tablet.jpg');
  await browser.close();
})();
