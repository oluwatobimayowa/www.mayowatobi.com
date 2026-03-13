const puppeteer = require('puppeteer');
const http = require('http');
const handler = require('serve-handler');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const BASE_URL = `http://localhost:${PORT}`;
const WORK_DIR = __dirname;

const server = http.createServer((request, response) => {
  return handler(request, response, { public: WORK_DIR });
});

async function runTests() {
  server.listen(PORT, async () => {
    console.log(`Server running at ${BASE_URL}`);
    
    // Find all HTML files
    const htmlFiles = fs.readdirSync(WORK_DIR).filter(file => file.endsWith('.html') && !file.includes('framer_assets'));
    
    console.log(`Found ${htmlFiles.length} HTML pages to test.\n`);
    
    const browser = await puppeteer.launch({ headless: 'new' });
    const report = {
      brokenAssets: {},
      consoleErrors: {},
      deadLinks: {},
      responsiveIssues: {}
    };

    for (const file of htmlFiles) {
      const pageUrl = `${BASE_URL}/${file}`;
      console.log(`\nTesting: ${file}...`);
      
      const page = await browser.newPage();
      await page.setViewport({ width: 375, height: 812 }); // Test mobile responsiveness
      
      const pageAssets404 = [];
      const pageConsoleErrors = [];
      
      // Monitor network for 404s
      page.on('response', response => {
        const url = response.url();
        const status = response.status();
        if (status >= 400 && status < 600 && !url.includes('hotjar') && !url.includes('google-analytics') && !url.includes('events.framer.com')) {
          pageAssets404.push(`[${status}] ${url}`);
        }
      });
      
      // Monitor console errors
      page.on('console', msg => {
        if (msg.type() === 'error') {
            const text = msg.text();
            if (!text.includes('Failed to load resource: the server responded with a status of 404')) {
                pageConsoleErrors.push(text);
            }
        }
      });

      try {
        await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 15000 });
      } catch (e) {
        console.log(`  Timeout/Error loading ${file}: ${e.message}`);
      }

      // Scroll to bottom to trigger lazy loading
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let totalHeight = 0;
          const distance = 100;
          const timer = setInterval(() => {
            const scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;
            if (totalHeight >= scrollHeight - window.innerHeight) {
              clearInterval(timer);
              resolve();
            }
          }, 50);
        });
      });
      
      // Wait a bit
      await new Promise(r => setTimeout(r, 1000));
      
      // Check horizontal overflow (responsiveness issue)
      const hasHorizontalScrollbar = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      
      if (hasHorizontalScrollbar) {
          report.responsiveIssues[file] = true;
          console.log(`  [!] Mobile responsiveness issue detected (horizontal scrolling).`);
      }

      // Check Links
      const hrefs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href]')).map(a => a.getAttribute('href'));
      });
      
      const internalHrefs = hrefs.filter(h => h && !h.startsWith('http') && !h.startsWith('mailto') && !h.startsWith('#'));
      const uniqueInternalHrefs = [...new Set(internalHrefs)];
      
      const deadLinks = [];
      for (const href of uniqueInternalHrefs) {
        // Strip query/hash
        const cleanlyPath = href.split('?')[0].split('#')[0];
        if (cleanlyPath === '') continue; // Was just a hash
        
        const localPath = path.join(WORK_DIR, cleanlyPath);
        if (!fs.existsSync(localPath)) {
            deadLinks.push(href);
        }
      }

      if (pageAssets404.length > 0) report.brokenAssets[file] = pageAssets404;
      if (pageConsoleErrors.length > 0) report.consoleErrors[file] = pageConsoleErrors;
      if (deadLinks.length > 0) report.deadLinks[file] = deadLinks;
      
      console.log(`  - ${pageAssets404.length} broken assets`);
      console.log(`  - ${pageConsoleErrors.length} console errors`);
      console.log(`  - ${deadLinks.length} dead internal links`);
      
      await page.close();
    }

    await browser.close();
    server.close();
    
    // Print report
    console.log('\n\n====== TEST REPORT ======');
    console.log('\n1. BROKEN ASSETS (404s)');
    if (Object.keys(report.brokenAssets).length === 0) console.log('  None!');
    for (const [file, items] of Object.entries(report.brokenAssets)) {
        console.log(`\n  ${file}:`);
        items.forEach(i => console.log(`    - ${i}`));
    }
    
    console.log('\n2. DEAD INTERNAL LINKS');
    if (Object.keys(report.deadLinks).length === 0) console.log('  None!');
    for (const [file, items] of Object.entries(report.deadLinks)) {
        console.log(`\n  ${file}:`);
        items.forEach(i => console.log(`    - ${i}`));
    }
    
    console.log('\n3. RESPONSIVE ISSUES (Mobile Horizontal Scroll)');
    if (Object.keys(report.responsiveIssues).length === 0) console.log('  None!');
    for (const file of Object.keys(report.responsiveIssues)) {
        console.log(`    - ${file}`);
    }
    
    console.log('\n4. CONSOLE ERRORS');
    if (Object.keys(report.consoleErrors).length === 0) console.log('  None!');
    for (const [file, items] of Object.entries(report.consoleErrors)) {
        console.log(`\n  ${file}:`);
        items.forEach(i => console.log(`    - ${i}`));
    }
    console.log('\n=========================\n');
  });
}

runTests();
