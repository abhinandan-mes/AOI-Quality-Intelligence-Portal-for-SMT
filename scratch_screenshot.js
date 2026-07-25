import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  // Set viewport to 1080p
  await page.setViewport({ width: 1920, height: 1080 });
  
  await page.goto('http://localhost:3030/spi-dashboard', { waitUntil: 'networkidle2' });
  
  // Save screenshot
  await page.screenshot({ path: '/Users/abhinandan/.gemini/antigravity/brain/a958d58f-9113-41dc-844b-b15f1f9578b0/spi_dashboard_test.png' });
  
  await browser.close();
})();
