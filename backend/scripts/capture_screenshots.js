const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const http = require('http');

async function capture() {
  const screenshotsDir = path.join(__dirname, '../../screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // Load real server
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
  const app = require('express')();
  const serverModule = require('../server');

  // Wait 2 seconds for server and DB
  await new Promise((r) => setTimeout(r, 2000));

  console.log('[Capture] Launching Chrome to capture live application...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1366,850'],
    defaultViewport: { width: 1366, height: 850 },
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:5000', { waitUntil: 'networkidle0' });

  // 1. Dashboard screenshot
  const shot1 = path.join(screenshotsDir, '01_dashboard_overview.png');
  await page.screenshot({ path: shot1, fullPage: false });
  console.log(`[Capture] Saved Screenshot 1: ${shot1}`);

  // 2. Open Add Movie Modal
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find((b) => b.textContent.includes('Add Movie'));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  const shot2 = path.join(screenshotsDir, '02_add_movie_modal.png');
  await page.screenshot({ path: shot2, fullPage: false });
  console.log(`[Capture] Saved Screenshot 2: ${shot2}`);

  // Close Add Movie Modal
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const cancelBtn = buttons.find((b) => b.textContent.includes('Cancel'));
    if (cancelBtn) cancelBtn.click();
  });
  await new Promise((r) => setTimeout(r, 500));

  // 3. Open Watch Next Modal
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find((b) => b.textContent.includes('What should I watch next?'));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  const shot3 = path.join(screenshotsDir, '03_watch_next_modal.png');
  await page.screenshot({ path: shot3, fullPage: false });
  console.log(`[Capture] Saved Screenshot 3: ${shot3}`);

  await browser.close();
  console.log('[Capture] Live Atlas screenshots captured successfully!');
  process.exit(0);
}

capture().catch((err) => {
  console.error('[Capture Error]:', err);
  process.exit(1);
});
