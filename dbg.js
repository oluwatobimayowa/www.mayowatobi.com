const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('response', response => {
    if (!response.ok()) {
      console.log(`[FAILED] ${response.status()} ${response.url()}`);
    }
  });
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  await page.goto('http://127.0.0.1:8082/work.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();
