import puppeteer from 'puppeteer';
(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  console.log('Navigating...');
  await page.goto('http://localhost:3000', {waitUntil: 'networkidle2'});
  console.log('Done.');
  await browser.close();
})();
