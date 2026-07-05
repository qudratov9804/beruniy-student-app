const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto('http://127.0.0.1:8081', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({
    path: 'C:/Users/admin/AppData/Local/Temp/claude/D--beruniy-app/7d64c6b2-1142-4780-abb1-02382938b608/scratchpad/home_gradient.png',
    fullPage: false,
  });
  await browser.close();
  console.log('done');
})();
